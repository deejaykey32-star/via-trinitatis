import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Compass,
  Flame,
  Footprints,
  MapPin,
  Mountain,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Route,
  Square,
  Timer,
} from 'lucide-react';
import { GearPair, StageDay, WalkSessionState } from '../types/expedition';
import { haversineKm } from '../utils/gpxParser';

interface TrackerTabProps {
  currentStage: StageDay;
  session: WalkSessionState;
  setSession: React.Dispatch<React.SetStateAction<WalkSessionState>>;
  gearPairs: GearPair[];
  stepLengthMeters: number;
  bodyWeightKg: number;
  onFinishStageSession: (mainKm: number, exploreKm: number, steps: number) => void;
  onToggleGearActive: (id: string) => void;
  onAddGearPair: (name: string, brand: string, maxKm: number) => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const TrackerTab: React.FC<TrackerTabProps> = ({
  currentStage,
  session,
  setSession,
  gearPairs,
  stepLengthMeters,
  bodyWeightKg,
  onFinishStageSession,
  onToggleGearActive,
  onAddGearPair,
}) => {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [gpsStatus, setGpsStatus] = useState<string>('Gotowy do marszu');
  const [pedometerActive, setPedometerActive] = useState(false);
  const [finishBanner, setFinishBanner] = useState<string | null>(null);
  const [showAddGear, setShowAddGear] = useState(false);
  const [newGearName, setNewGearName] = useState('');
  const [newGearBrand, setNewGearBrand] = useState('');
  const [newGearMaxKm, setNewGearMaxKm] = useState(800);

  const lastMotionPeakRef = useRef<number>(0);

  // Live 1s clock while walking/paused
  useEffect(() => {
    if (session.status === 'idle') return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [session.status]);

  // Real GPS watchPosition while walking
  useEffect(() => {
    if (session.status !== 'walking') return;
    if (!('geolocation' in navigator)) {
      setGpsStatus('Brak odbiornika GPS – użyj krokomierza lub symulacji');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, altitude, accuracy } = pos.coords;
        if (accuracy && accuracy > 80) return;

        setGpsStatus(`GPS aktywny (±${Math.round(accuracy ?? 10)} m)`);
        setSession((prev) => {
          const lastPt = prev.trackPoints[prev.trackPoints.length - 1];
          let deltaKm = 0;
          if (lastPt) {
            deltaKm = haversineKm(lastPt.lat, lastPt.lng, latitude, longitude);
            // Ignore GPS jitter (< 5m) or impossible jumps (> 1km in 1 tick)
            if (deltaKm < 0.005 || deltaKm > 1.0) {
              return {
                ...prev,
                currentElevationM: altitude ? Math.round(altitude) : prev.currentElevationM,
              };
            }
          }

          const addedSteps = Math.round((deltaKm * 1000) / Math.max(0.4, stepLengthMeters));
          return {
            ...prev,
            mainKm: prev.mode === 'main' ? prev.mainKm + deltaKm : prev.mainKm,
            exploreKm: prev.mode === 'explore' ? prev.exploreKm + deltaKm : prev.exploreKm,
            steps: prev.steps + addedSteps,
            currentElevationM: altitude ? Math.round(altitude) : prev.currentElevationM,
            trackPoints: [
              ...prev.trackPoints,
              {
                lat: latitude,
                lng: longitude,
                ele: altitude ? Math.round(altitude) : prev.currentElevationM,
                ts: Date.now(),
                mode: prev.mode,
              },
            ],
          };
        });
      },
      () => {
        setGpsStatus('Oczekiwanie na sygnał GPS');
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [session.status, stepLengthMeters, setSession]);

  // Optional DeviceMotion step detector (Web Pedometer fallback)
  useEffect(() => {
    if (session.status !== 'walking' || typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setPedometerActive(false);
      return;
    }

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
      const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const now = Date.now();
      if (mag > 12.6 && now - lastMotionPeakRef.current > 360) {
        lastMotionPeakRef.current = now;
        setPedometerActive(true);
        const stepKm = stepLengthMeters / 1000;
        setSession((prev) => ({
          ...prev,
          steps: prev.steps + 1,
          // Add step distance only when GPS didn't update recently (> 8s)
          mainKm:
            prev.mode === 'main' && (!prev.trackPoints.length || now - prev.trackPoints[prev.trackPoints.length - 1].ts > 8000)
              ? prev.mainKm + stepKm
              : prev.mainKm,
          exploreKm:
            prev.mode === 'explore' && (!prev.trackPoints.length || now - prev.trackPoints[prev.trackPoints.length - 1].ts > 8000)
              ? prev.exploreKm + stepKm
              : prev.exploreKm,
        }));
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [session.status, stepLengthMeters, setSession]);

  const netElapsedMs = useMemo(() => {
    if (session.status === 'walking' && session.lastResumedAtMs) {
      return session.accumulatedWalkingMs + Math.max(0, nowMs - session.lastResumedAtMs);
    }
    return session.accumulatedWalkingMs;
  }, [session, nowMs]);

  const grossElapsedMs = useMemo(() => {
    if (!session.startedAtMs) return 0;
    return Math.max(0, nowMs - session.startedAtMs);
  }, [session.startedAtMs, nowMs]);

  const sessionTotalKm = session.mainKm + session.exploreKm;
  const speedKmh = netElapsedMs > 5000 ? sessionTotalKm / (netElapsedMs / 3600000) : 0;
  const paceMinPerKm = sessionTotalKm > 0.05 && netElapsedMs > 5000 ? (netElapsedMs / 60000) / sessionTotalKm : 0;
  const paceFormatted = useMemo(() => {
    if (paceMinPerKm <= 0 || paceMinPerKm > 40) return '--:--';
    const mins = Math.floor(paceMinPerKm);
    const secs = Math.round((paceMinPerKm - mins) * 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [paceMinPerKm]);

  const caloriesKcal = Math.round(sessionTotalKm * bodyWeightKg * 0.78);
  const activeGear = gearPairs.find((g) => g.active) ?? gearPairs[0];

  const handleStart = () => {
    setFinishBanner(null);
    const now = Date.now();
    setNowMs(now);
    setSession((prev) => ({
      ...prev,
      status: 'walking',
      dayNumber: currentStage.dayNumber,
      startedAtMs: prev.startedAtMs ?? now,
      lastResumedAtMs: now,
      currentElevationM: currentStage.elevationProfile[0]?.ele ?? 280,
    }));
  };

  const handlePause = () => {
    const now = Date.now();
    setSession((prev) => ({
      ...prev,
      status: 'paused',
      accumulatedWalkingMs:
        prev.accumulatedWalkingMs + (prev.lastResumedAtMs ? Math.max(0, now - prev.lastResumedAtMs) : 0),
      lastResumedAtMs: null,
    }));
  };

  const handleFinish = () => {
    if (sessionTotalKm > 0 || session.steps > 0) {
      onFinishStageSession(
        Number(session.mainKm.toFixed(2)),
        Number(session.exploreKm.toFixed(2)),
        session.steps
      );
      setFinishBanner(
        `Zapisano marsz do Dnia ${currentStage.dayNumber}: +${session.mainKm.toFixed(2)} km Szlak Główny oraz +${session.exploreKm.toFixed(2)} km Eksploracja (${session.steps.toLocaleString('pl-PL')} kroków).`
      );
    }
    setSession({
      status: 'idle',
      mode: 'main',
      dayNumber: currentStage.dayNumber,
      startedAtMs: null,
      lastResumedAtMs: null,
      accumulatedWalkingMs: 0,
      mainKm: 0,
      exploreKm: 0,
      steps: 0,
      currentElevationM: currentStage.elevationProfile[0]?.ele ?? 280,
      trackPoints: [],
    });
    setGpsStatus('Zakończono i zapisano sesję');
  };

  const handleResetSession = () => {
    setFinishBanner(null);
    setSession({
      status: 'idle',
      mode: 'main',
      dayNumber: currentStage.dayNumber,
      startedAtMs: null,
      lastResumedAtMs: null,
      accumulatedWalkingMs: 0,
      mainKm: 0,
      exploreKm: 0,
      steps: 0,
      currentElevationM: currentStage.elevationProfile[0]?.ele ?? 280,
      trackPoints: [],
    });
    setGpsStatus('Sesja wyzerowana – gotowy do marszu');
  };

  const handleSimulateStepChunk = (kmAdd: number) => {
    const addedSteps = Math.round((kmAdd * 1000) / stepLengthMeters);
    setSession((prev) => ({
      ...prev,
      status: prev.status === 'idle' ? 'walking' : prev.status,
      startedAtMs: prev.startedAtMs ?? Date.now() - 600000,
      lastResumedAtMs: prev.lastResumedAtMs ?? Date.now(),
      accumulatedWalkingMs: prev.accumulatedWalkingMs + (prev.startedAtMs ? 0 : 600000),
      mainKm: prev.mode === 'main' ? prev.mainKm + kmAdd : prev.mainKm,
      exploreKm: prev.mode === 'explore' ? prev.exploreKm + kmAdd : prev.exploreKm,
      steps: prev.steps + addedSteps,
    }));
  };

  const handleCreateGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearName.trim()) return;
    onAddGearPair(newGearName.trim(), newGearBrand.trim() || 'Inna marka', Math.max(200, newGearMaxKm));
    setNewGearName('');
    setNewGearBrand('');
    setNewGearMaxKm(800);
    setShowAddGear(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {finishBanner && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 p-4 flex items-center gap-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{finishBanner}</span>
        </div>
      )}

      {/* MODE SWITCHER: SZLAK GŁÓWNY VS EKSPLORACJA PIESZA */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Rejestrator Marszu · Dzień {currentStage.dayNumber}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentStage.fromName} → {currentStage.toName} · {gpsStatus}
              {pedometerActive ? ' · Krokomierz aktywny' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setSession((p) => ({ ...p, mode: 'main' }))}
            className={`min-h-[48px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              session.mode === 'main'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Route className="w-4 h-4 shrink-0" />
            <span className="truncate">Szlak Główny (Do celu)</span>
          </button>

          <button
            type="button"
            onClick={() => setSession((p) => ({ ...p, mode: 'explore' }))}
            className={`min-h-[48px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              session.mode === 'explore'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span className="truncate">Eksploracja Piesza</span>
          </button>
        </div>
      </section>

      {/* PRIMARY LIVE TELEMETRY & ONE-HANDED CONTROLS */}
      <section className="rounded-3xl bg-blue-950 text-white p-5 sm:p-7 shadow-lg border border-blue-900">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-blue-900/60 p-4 border border-blue-800/70">
            <div className="text-xs text-blue-200 flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-amber-300" />
              <span>Szlak Główny</span>
            </div>
            <div className="mt-1 text-3xl font-extrabold font-mono-tabular text-white">
              {session.mainKm.toFixed(2)} <span className="text-sm font-medium text-blue-200">km</span>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-900/60 p-4 border border-blue-800/70">
            <div className="text-xs text-blue-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Eksploracja</span>
            </div>
            <div className="mt-1 text-3xl font-extrabold font-mono-tabular text-amber-300">
              {session.exploreKm.toFixed(2)} <span className="text-sm font-medium text-amber-200">km</span>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-900/60 p-4 border border-blue-800/70">
            <div className="text-xs text-blue-200 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-sky-300" />
              <span>Czas netto / brutto</span>
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono-tabular text-white">
              {formatDuration(netElapsedMs)}
            </div>
            <div className="text-xs font-mono-tabular text-blue-300">
              Brutto: {formatDuration(grossElapsedMs)}
            </div>
          </div>

          <div className="rounded-2xl bg-blue-900/60 p-4 border border-blue-800/70">
            <div className="text-xs text-blue-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tempo · Prędkość</span>
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-bold font-mono-tabular text-white">
              {paceFormatted} <span className="text-xs font-normal text-blue-200">min/km</span>
            </div>
            <div className="text-xs font-mono-tabular text-blue-300">
              {speedKmh.toFixed(1)} km/h
            </div>
          </div>
        </div>

        {/* Secondary Live Hiker Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-blue-900/40 p-3 border border-blue-800/50">
            <div className="text-[11px] text-blue-200 flex items-center justify-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-amber-300" />
              <span>Kroki</span>
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-bold font-mono-tabular">
              {session.steps.toLocaleString('pl-PL')}
            </div>
          </div>

          <div className="rounded-2xl bg-blue-900/40 p-3 border border-blue-800/50">
            <div className="text-[11px] text-blue-200 flex items-center justify-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-sky-300" />
              <span>Wysokość</span>
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-bold font-mono-tabular">
              {session.currentElevationM} m
            </div>
          </div>

          <div className="rounded-2xl bg-blue-900/40 p-3 border border-blue-800/50">
            <div className="text-[11px] text-blue-200 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-300" />
              <span>Kalorie</span>
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-bold font-mono-tabular">
              {caloriesKcal} kcal
            </div>
          </div>
        </div>

        {/* Big Sunlight-Friendly Action Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {session.status !== 'walking' ? (
            <button
              type="button"
              onClick={handleStart}
              className="sm:col-span-2 min-h-[56px] rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{session.status === 'paused' ? 'Wznów marsz' : 'Start marszu'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="sm:col-span-2 min-h-[56px] rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-colors"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pauza</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleFinish}
            disabled={session.status === 'idle' && sessionTotalKm === 0}
            className="min-h-[56px] rounded-2xl bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-white/20 cursor-pointer transition-colors"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Zakończ etap dzienny</span>
          </button>
        </div>

        {/* Quick manual step/GPS add for indoor testing or GPS shadow canyons */}
        <div className="mt-4 pt-4 border-t border-blue-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-blue-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Korekta / Test marszu w cieniu GPS:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSimulateStepChunk(0.5)}
              className="min-h-[38px] px-3 py-1 rounded-xl bg-blue-900 hover:bg-blue-800 text-amber-300 font-mono-tabular font-bold cursor-pointer"
            >
              +0.5 km
            </button>
            <button
              type="button"
              onClick={() => handleSimulateStepChunk(2.0)}
              className="min-h-[38px] px-3 py-1 rounded-xl bg-blue-900 hover:bg-blue-800 text-amber-300 font-mono-tabular font-bold cursor-pointer"
            >
              +2.0 km
            </button>
            <button
              type="button"
              onClick={handleResetSession}
              disabled={session.status === 'idle' && sessionTotalKm === 0 && session.steps === 0}
              className="min-h-[38px] px-3 py-1 rounded-xl bg-rose-900/70 hover:bg-rose-800 disabled:opacity-40 text-rose-100 font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetuj sesję</span>
            </button>
          </div>
        </div>
      </section>

      {/* GEAR TRACKER (ZUŻYCIE OBUWIA) */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Gear Tracker — Zużycie obuwia pielgrzymkowego
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Wszystkie kilometry (Szlak Główny + Eksploracja) automatycznie zużywają aktywną parę butów.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddGear((v) => !v)}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj nową parę</span>
          </button>
        </div>

        {showAddGear && (
          <form onSubmit={handleCreateGear} className="mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="Model (np. Hoka Speedgoat 5)"
              value={newGearName}
              onChange={(e) => setNewGearName(e.target.value)}
              className="sm:col-span-2 min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm"
            />
            <input
              type="text"
              placeholder="Marka"
              value={newGearBrand}
              onChange={(e) => setNewGearBrand(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-blue-900 text-white font-bold text-sm cursor-pointer"
            >
              Zapisz parę
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearPairs.map((gear) => {
            const liveKm = gear.active ? gear.loggedKm + sessionTotalKm : gear.loggedKm;
            const wearPct = Math.min(100, Math.round((liveKm / Math.max(1, gear.maxRecommendedKm)) * 100));
            const needsReplacement = wearPct >= 85;
            return (
              <div
                key={gear.id}
                className={`rounded-2xl p-4 border transition-colors ${
                  gear.active
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-800 dark:border-amber-400'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {gear.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {gear.brand} · Od dnia #{gear.startedDay}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleGearActive(gear.id)}
                    className={`min-h-[38px] px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      gear.active
                        ? 'bg-blue-900 text-white dark:bg-amber-400 dark:text-slate-950'
                        : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {gear.active ? 'Na nogach' : 'Załóż'}
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-mono-tabular mb-1.5">
                    <span className={needsReplacement ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                      {liveKm.toFixed(1)} / {gear.maxRecommendedKm} km ({wearPct}%)
                    </span>
                    {needsReplacement && (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Czas na wymianę!</span>
                    )}
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        needsReplacement ? 'bg-rose-500' : gear.active ? 'bg-amber-500' : 'bg-blue-800'
                      }`}
                      style={{ width: `${wearPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeGear && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Aktywna para: <strong className="text-slate-800 dark:text-slate-200">{activeGear.name}</strong>
          </div>
        )}
      </section>
    </div>
  );
};
