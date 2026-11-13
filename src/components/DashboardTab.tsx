import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Compass,
  Footprints,
  MapPin,
  Mountain,
  Play,
  Sun,
  TrendingDown,
  TrendingUp,
  Wind,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { PHASES } from '../data/expeditionRoute';
import { StageDay, TabId } from '../types/expedition';
import { fetchStageWeather, WeatherData } from '../utils/geoAndApi';

interface DashboardTabProps {
  stages: StageDay[];
  currentDayNumber: number;
  onChangeCurrentDay: (day: number) => void;
  onNavigateTab: (tab: TabId) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  stages,
  currentDayNumber,
  onChangeCurrentDay,
  onNavigateTab,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [plannedRestDays, setPlannedRestDays] = useState<number>(6);

  const currentStage = useMemo(
    () => stages.find((s) => s.dayNumber === currentDayNumber) ?? stages[0],
    [stages, currentDayNumber]
  );

  const currentPhase = useMemo(
    () => PHASES.find((p) => p.id === currentStage.phaseId) ?? PHASES[0],
    [currentStage.phaseId]
  );

  useEffect(() => {
    let active = true;
    const midLat = (currentStage.fromCoords[0] + currentStage.toCoords[0]) / 2;
    const midLng = (currentStage.fromCoords[1] + currentStage.toCoords[1]) / 2;
    fetchStageWeather(midLat, midLng).then((w) => {
      if (active) setWeather(w);
    });
    return () => {
      active = false;
    };
  }, [currentStage]);

  const metrics = useMemo(() => {
    let totalPlannedMainKm = 0;
    let totalCompletedMainKm = 0;
    let totalCompletedExploreKm = 0;
    let totalSteps = 0;
    let plannedUpToTodayKm = 0;

    let phasePlannedKm = 0;
    let phaseCompletedKm = 0;

    for (const s of stages) {
      totalPlannedMainKm += s.plannedKm;
      totalCompletedMainKm += s.completedMainKm;
      totalCompletedExploreKm += s.completedExploreKm;
      totalSteps += s.stepsCount;

      if (s.dayNumber <= currentDayNumber) {
        plannedUpToTodayKm += s.plannedKm;
      }
      if (s.phaseId === currentStage.phaseId) {
        phasePlannedKm += s.plannedKm;
        phaseCompletedKm += s.completedMainKm;
      }
    }

    const remainingMainKm = Math.max(0, totalPlannedMainKm - totalCompletedMainKm);
    const remainingDaysTotal = Math.max(1, 365 - currentDayNumber + 1);
    const effectiveWalkDays = Math.max(1, remainingDaysTotal - plannedRestDays);

    const requiredDailyKm = remainingMainKm / remainingDaysTotal;
    const requiredWithRestDailyKm = remainingMainKm / effectiveWalkDays;
    const balanceKm = totalCompletedMainKm - (plannedUpToTodayKm - currentStage.plannedKm + currentStage.completedMainKm);
    const progressPct = Math.min(100, (totalCompletedMainKm / Math.max(1, totalPlannedMainKm)) * 100);
    const phaseProgressPct = Math.min(100, (phaseCompletedKm / Math.max(1, phasePlannedKm)) * 100);

    return {
      totalPlannedMainKm,
      totalCompletedMainKm,
      totalCompletedExploreKm,
      totalAllWalkKm: totalCompletedMainKm + totalCompletedExploreKm,
      totalSteps,
      remainingMainKm,
      remainingDaysTotal,
      effectiveWalkDays,
      requiredDailyKm,
      requiredWithRestDailyKm,
      balanceKm,
      progressPct,
      phasePlannedKm,
      phaseCompletedKm,
      phaseProgressPct,
    };
  }, [stages, currentDayNumber, currentStage, plannedRestDays]);

  // Triada Kochłowicka status: Visit 1 (Day 1), Visit 2 (Day 14), Visit 3 (Day 365)
  const triada = useMemo(() => {
    const d1 = stages[0];
    const d14 = stages[13];
    const d365 = stages[364];
    return [
      {
        id: 1,
        title: 'Wizyta I · Start',
        date: '14 czerwca',
        dayLabel: 'Dzień 1',
        done: d1?.status === 'completed' || currentDayNumber >= 1,
        active: currentDayNumber === 1,
      },
      {
        id: 2,
        title: 'Wizyta II · Pętla Polska',
        date: '27 czerwca',
        dayLabel: 'Dzień 14',
        done: d14?.status === 'completed' || currentDayNumber > 14,
        active: currentDayNumber === 14,
      },
      {
        id: 3,
        title: 'Wizyta III · Wielki Finał',
        date: '13 czerwca',
        dayLabel: 'Dzień 365',
        done: d365?.status === 'completed',
        active: currentDayNumber === 365,
      },
    ];
  }, [stages, currentDayNumber]);

  const todayTotalKm = currentStage.completedMainKm + currentStage.completedExploreKm;
  const todayPct = Math.min(100, Math.round((currentStage.completedMainKm / Math.max(0.1, currentStage.plannedKm)) * 100));

  return (
    <div className="space-y-6 pb-8">
      {/* HERO EXPEDITION COUNTER */}
      <section className="rounded-3xl bg-blue-950 text-white p-5 sm:p-7 shadow-lg border border-blue-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-amber-300 font-medium">
              <span>{currentPhase.name}</span>
              <span aria-hidden="true">·</span>
              <span>{currentStage.fullDateLabel}</span>
              <span aria-hidden="true">·</span>
              <span>100% pieszo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
              Dzień {currentDayNumber} <span className="text-blue-300 font-semibold">/ 365</span>
            </h1>
            <p className="text-sm text-blue-100/85 max-w-2xl">
              Pozostało <strong className="text-amber-300 font-mono-tabular">{365 - currentDayNumber} dni</strong> do wielkiego finału w Kochłowicach (13 czerwca). Zero transportu kołowego.
            </p>
          </div>

          {/* Day switcher controls (thumb friendly) */}
          <div className="flex items-center gap-2 self-start lg:self-center bg-blue-900/60 p-1.5 rounded-2xl border border-blue-800/80">
            <button
              type="button"
              onClick={() => onChangeCurrentDay(Math.max(1, currentDayNumber - 1))}
              disabled={currentDayNumber <= 1}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white transition-colors cursor-pointer"
              aria-label="Poprzedni dzień"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 text-center">
              <div className="text-[11px] text-blue-200 font-medium">Podgląd dnia</div>
              <div className="text-sm font-bold font-mono-tabular text-amber-300">
                {currentStage.dateLabel} · #{currentDayNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeCurrentDay(Math.min(365, currentDayNumber + 1))}
              disabled={currentDayNumber >= 365}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white transition-colors cursor-pointer"
              aria-label="Następny dzień"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Progress Bars */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-blue-800/70">
          <div>
            <div className="flex items-baseline justify-between text-xs sm:text-sm mb-2">
              <span className="text-blue-200 font-medium">Cała wyprawa (Szlak Główny)</span>
              <span className="font-mono-tabular font-bold text-white">
                {metrics.totalCompletedMainKm.toFixed(1)} / {Math.round(metrics.totalPlannedMainKm).toLocaleString('pl-PL')} km ({metrics.progressPct.toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-blue-900 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-300"
                style={{ width: `${Math.max(2, metrics.progressPct)}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-blue-200/90 font-mono-tabular">
              <span>Razem z eksploracją: {metrics.totalAllWalkKm.toFixed(1)} km</span>
              <span aria-hidden="true">·</span>
              <span>{metrics.totalSteps.toLocaleString('pl-PL')} kroków</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-xs sm:text-sm mb-2">
              <span className="text-blue-200 font-medium">{currentPhase.name}</span>
              <span className="font-mono-tabular font-bold text-amber-300">
                {metrics.phaseCompletedKm.toFixed(1)} / {metrics.phasePlannedKm.toFixed(0)} km ({metrics.phaseProgressPct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-blue-900 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-300"
                style={{ width: `${Math.max(2, metrics.phaseProgressPct)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-blue-200/90">
              {currentPhase.routeSummary}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID: TODAY'S STAGE + PACE BALANCER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TODAY'S WALK STAGE CARD */}
        <section className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-900 dark:text-amber-400">
                  Dzisiejszy etap pieszy · {currentStage.fullDateLabel}
                </p>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                  <span>{currentStage.fromName}</span>
                  <ArrowRight className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{currentStage.toName}</span>
                </h2>
              </div>
              <span className="font-mono-tabular text-sm font-bold text-blue-900 dark:text-amber-300 shrink-0">
                {todayPct}%
              </span>
            </div>

            {currentStage.symbolism && (
              <div className="mt-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 text-sm text-amber-950 dark:text-amber-200 font-medium">
                Symbolika dnia: {currentStage.symbolism}
              </div>
            )}

            {/* 4 crisp metrics */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3.5 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Plan / Przebyto</div>
                <div className="mt-1 text-lg font-bold font-mono-tabular text-slate-900 dark:text-white">
                  {currentStage.completedMainKm.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ {currentStage.plannedKm} km</span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3.5 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Podejścia / Zejścia</div>
                <div className="mt-1 text-base sm:text-lg font-bold font-mono-tabular text-slate-900 dark:text-white flex items-center gap-1">
                  <Mountain className="w-4 h-4 text-blue-800 dark:text-amber-400 shrink-0" />
                  <span>+{currentStage.elevationGainM} / -{currentStage.elevationLossM} m</span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3.5 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Kroki dzisiaj</div>
                <div className="mt-1 text-lg font-bold font-mono-tabular text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{(currentStage.stepsCount || Math.round(todayTotalKm * 1350)).toLocaleString('pl-PL')}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3.5 border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Eksploracja piesza</div>
                <div className="mt-1 text-lg font-bold font-mono-tabular text-slate-900 dark:text-white">
                  +{currentStage.completedExploreKm.toFixed(1)} km
                </div>
              </div>
            </div>

            {/* Weather strip */}
            <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
              {weather ? (
                <>
                  <div className="flex items-center gap-3">
                    {weather.precipProbPct > 45 ? (
                      <CloudRain className="w-6 h-6 text-blue-700 dark:text-sky-400 shrink-0" />
                    ) : (
                      <Sun className="w-6 h-6 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {weather.temperatureC}°C · {weather.descriptionPl}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-mono-tabular">
                        Min {weather.tempMinC}°C / Max {weather.tempMaxC}°C · Opady {weather.precipProbPct}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono-tabular text-slate-600 dark:text-slate-300">
                    <Wind className="w-4 h-4 text-slate-400" />
                    <span>{weather.windKmh} km/h</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500">Ładowanie prognozy pogody dla odcinka...</div>
              )}
            </div>
          </div>

          {/* Primary Thumb CTAs */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('tracker')}
              className="min-h-[48px] px-4 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 shrink-0" />
              <span>Rejestrator marszu</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('map')}
              className="min-h-[48px] px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 shrink-0 text-blue-800 dark:text-amber-400" />
              <span>Mapa i profil terenu</span>
            </button>
          </div>
        </section>

        {/* ULTRA-PILGRIM PACE BALANCER */}
        <section className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-blue-900 dark:text-amber-400">
                  Ultra-Pilgrim Pace Balancer
                </p>
                <h2 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
                  Kalkulator tempa do 13.06
                </h2>
              </div>
              <Compass className="w-6 h-6 text-amber-500 shrink-0" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-blue-950/5 dark:bg-blue-950/60 border border-blue-900/15 dark:border-blue-800/60 p-4">
                <div className="text-xs text-slate-600 dark:text-slate-300">Wymagana dawka</div>
                <div className="mt-1 text-2xl font-extrabold font-mono-tabular text-blue-900 dark:text-amber-300">
                  {metrics.requiredDailyKm.toFixed(1)} <span className="text-sm font-semibold">km/d</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  bez dni odpoczynku
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 p-4">
                <div className="text-xs text-slate-600 dark:text-slate-300">Bilans względem planu</div>
                <div
                  className={`mt-1 text-2xl font-extrabold font-mono-tabular flex items-center gap-1 ${
                    metrics.balanceKm >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {metrics.balanceKm >= 0 ? (
                    <TrendingUp className="w-5 h-5 shrink-0" />
                  ) : (
                    <TrendingDown className="w-5 h-5 shrink-0" />
                  )}
                  <span>
                    {metrics.balanceKm >= 0 ? '+' : ''}
                    {metrics.balanceKm.toFixed(1)} km
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {metrics.balanceKm >= 0 ? 'Zapas trasy na plusie' : 'Niedobór do nadrobienia'}
                </div>
              </div>
            </div>

            {/* Simulation slider for rest days */}
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label htmlFor="rest-days-slider" className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-800 dark:text-amber-400" />
                  <span>Planowane dni regeneracji:</span>
                </label>
                <span className="font-mono-tabular font-bold text-blue-900 dark:text-amber-300">
                  {plannedRestDays} dni
                </span>
              </div>
              <input
                id="rest-days-slider"
                type="range"
                min={0}
                max={45}
                value={plannedRestDays}
                onChange={(e) => setPlannedRestDays(Number(e.target.value))}
                className="mt-3 w-full accent-blue-900 dark:accent-amber-400 h-2 cursor-pointer"
              />
              <div className="mt-3 flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Tempo w dni marszowe ({metrics.effectiveWalkDays} dni):</span>
                <span className="font-mono-tabular font-bold text-base text-slate-900 dark:text-white">
                  {metrics.requiredWithRestDailyKm.toFixed(1)} km/dzień
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono-tabular">
            <span>Pozostały dystans główny:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {metrics.remainingMainKm.toFixed(1)} km
            </span>
          </div>
        </section>
      </div>

      {/* TRIADA KOCHŁOWICKA */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Triada Kochłowicka — 3 wizyty w Kościele Trójcy Świętej
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Punkt startowy i finałowy w Rudzie Śląskiej – Kochłowicach odwiedzany trzykrotnie wyłącznie pieszo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {triada.map((visit) => (
            <button
              key={visit.id}
              type="button"
              onClick={() => onChangeCurrentDay(visit.id === 1 ? 1 : visit.id === 2 ? 14 : 365)}
              className={`text-left rounded-2xl p-4 border transition-colors cursor-pointer min-h-[48px] ${
                visit.done
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
                  : visit.active
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-800 dark:border-amber-400'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono-tabular font-semibold text-slate-500 dark:text-slate-400">
                  {visit.dayLabel} · {visit.date}
                </span>
                {visit.done ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
              </div>
              <div className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                {visit.title}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {visit.done ? 'Ukończono pieszo' : 'Oczekuje na dojście'}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
