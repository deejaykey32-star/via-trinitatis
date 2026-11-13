import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarRange,
  Compass,
  Footprints,
  Map as MapIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { CredencialTab } from './components/CredencialTab';
import { DashboardTab } from './components/DashboardTab';
import { MapTab } from './components/MapTab';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PlannerTab } from './components/PlannerTab';
import { PWAInstallButton } from './components/PWAInstallButton';
import { TrackerTab } from './components/TrackerTab';
import { buildInitialGear, buildInitialJournalEntries, buildInitialStages } from './data/expeditionRoute';
import {
  CustomTrack,
  ExpeditionSettings,
  GearPair,
  JournalEntry,
  StageDay,
  TabId,
  WalkSessionState,
} from './types/expedition';
import {
  DEFAULT_SETTINGS,
  exportBackupToJson,
  loadExpeditionData,
  loadSettingsSync,
  persistCustomTracks,
  persistGearPairs,
  persistJournalEntries,
  persistStages,
  saveSettingsSync,
  validateBackupJson,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [settings, setSettings] = useState<ExpeditionSettings>(() => loadSettingsSync());
  const [stages, setStages] = useState<StageDay[]>(() => buildInitialStages(loadSettingsSync().currentDayNumber));
  const [journalEntries, setJournalEntries] = useState<Record<number, JournalEntry>>(() => buildInitialJournalEntries());
  const [gearPairs, setGearPairs] = useState<GearPair[]>(() => buildInitialGear());
  const [customTracks, setCustomTracks] = useState<Record<number, CustomTrack>>({});
  const [hydrated, setHydrated] = useState(false);

  const [walkSession, setWalkSession] = useState<WalkSessionState>({
    status: 'idle',
    mode: 'main',
    dayNumber: settings.currentDayNumber,
    startedAtMs: null,
    lastResumedAtMs: null,
    accumulatedWalkingMs: 0,
    mainKm: 0,
    exploreKm: 0,
    steps: 0,
    currentElevationM: 280,
    trackPoints: [],
  });

  // Hydrate IndexedDB state on mount
  useEffect(() => {
    let active = true;
    loadExpeditionData().then((data) => {
      if (!active) return;
      setSettings(data.settings);
      setStages(data.stages);
      setJournalEntries(data.journalEntries);
      setGearPairs(data.gearPairs);
      setCustomTracks(data.customTracks);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync Tailwind .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveSettingsSync(settings);
  }, [settings]);

  const currentStage = useMemo(
    () => stages.find((s) => s.dayNumber === settings.currentDayNumber) ?? stages[0],
    [stages, settings.currentDayNumber]
  );

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleChangeCurrentDay = (dayNumber: number) => {
    const clamped = Math.max(1, Math.min(365, dayNumber));
    setSettings((prev) => ({ ...prev, currentDayNumber: clamped }));
    setStages((prev) => {
      const next = prev.map((s) => {
        if (s.dayNumber < clamped && s.status === 'current') {
          return { ...s, status: 'completed' as const };
        }
        if (s.dayNumber === clamped && s.status === 'planned') {
          return { ...s, status: 'current' as const };
        }
        return s;
      });
      persistStages(next);
      return next;
    });
  };

  const handleUpdateStage = (updated: StageDay) => {
    setStages((prev) => {
      const next = prev.map((s) => (s.dayNumber === updated.dayNumber ? updated : s));
      persistStages(next);
      return next;
    });
  };

  const handleFinishStageSession = (mainKm: number, exploreKm: number, steps: number) => {
    const dayNum = settings.currentDayNumber;
    const totalAddedKm = mainKm + exploreKm;

    setStages((prev) => {
      const next = prev.map((s) => {
        if (s.dayNumber !== dayNum) return s;
        const newMain = Number((s.completedMainKm + mainKm).toFixed(2));
        const newExplore = Number((s.completedExploreKm + exploreKm).toFixed(2));
        const isDone = newMain >= s.plannedKm * 0.9;
        return {
          ...s,
          completedMainKm: newMain,
          completedExploreKm: newExplore,
          stepsCount: s.stepsCount + steps,
          status: isDone ? ('completed' as const) : s.status,
        };
      });
      persistStages(next);
      return next;
    });

    if (totalAddedKm > 0) {
      setGearPairs((prev) => {
        const next = prev.map((g) =>
          g.active ? { ...g, loggedKm: Number((g.loggedKm + totalAddedKm).toFixed(2)) } : g
        );
        persistGearPairs(next);
        return next;
      });
    }
  };

  const handleToggleGearActive = (id: string) => {
    setGearPairs((prev) => {
      const next = prev.map((g) => ({ ...g, active: g.id === id }));
      persistGearPairs(next);
      return next;
    });
  };

  const handleAddGearPair = (name: string, brand: string, maxKm: number) => {
    const newPair: GearPair = {
      id: `gear-${Date.now()}`,
      name,
      brand,
      loggedKm: 0,
      maxRecommendedKm: maxKm,
      active: true,
      startedDay: settings.currentDayNumber,
    };
    setGearPairs((prev) => {
      const next = prev.map((g) => ({ ...g, active: false })).concat(newPair);
      persistGearPairs(next);
      return next;
    });
  };

  const handleSaveJournalEntry = (entry: JournalEntry) => {
    setJournalEntries((prev) => {
      const next = { ...prev, [entry.dayNumber]: entry };
      persistJournalEntries(next);
      return next;
    });
  };

  const handleSaveCustomTrack = (track: CustomTrack) => {
    setCustomTracks((prev) => {
      const next = { ...prev, [track.dayNumber]: track };
      persistCustomTracks(next);
      return next;
    });
  };

  const handleRemoveCustomTrack = (dayNumber: number) => {
    setCustomTracks((prev) => {
      const next = { ...prev };
      delete next[dayNumber];
      persistCustomTracks(next);
      return next;
    });
  };

  const handleExportBackup = () => {
    exportBackupToJson({
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      stages,
      journalEntries,
      gearPairs,
      customTracks,
    });
  };

  const handleImportBackup = async (file: File) => {
    const text = await file.text();
    const parsed = validateBackupJson(JSON.parse(text));
    setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
    setStages(parsed.stages);
    setJournalEntries(parsed.journalEntries);
    setGearPairs(parsed.gearPairs);
    setCustomTracks(parsed.customTracks);
    await Promise.all([
      persistStages(parsed.stages),
      persistJournalEntries(parsed.journalEntries),
      persistGearPairs(parsed.gearPairs),
      persistCustomTracks(parsed.customTracks),
    ]);
  };

  const handleResetExpedition = async (mode: 'day1' | 'demo') => {
    const targetDay = mode === 'day1' ? 1 : DEFAULT_SETTINGS.currentDayNumber;
    const nextSettings: ExpeditionSettings = {
      ...settings,
      currentDayNumber: targetDay,
    };
    const freshStages = buildInitialStages(targetDay).map((s) =>
      mode === 'day1'
        ? {
            ...s,
            completedMainKm: 0,
            completedExploreKm: 0,
            stepsCount: 0,
            status: s.dayNumber === 1 ? ('current' as const) : ('planned' as const),
          }
        : s
    );
    const freshJournal = mode === 'day1' ? {} : buildInitialJournalEntries();
    const freshGear = buildInitialGear().map((g) =>
      mode === 'day1' ? { ...g, loggedKm: 0 } : g
    );
    const freshTracks: Record<number, CustomTrack> = {};

    setSettings(nextSettings);
    setStages(freshStages);
    setJournalEntries(freshJournal);
    setGearPairs(freshGear);
    setCustomTracks(freshTracks);
    setWalkSession({
      status: 'idle',
      mode: 'main',
      dayNumber: targetDay,
      startedAtMs: null,
      lastResumedAtMs: null,
      accumulatedWalkingMs: 0,
      mainKm: 0,
      exploreKm: 0,
      steps: 0,
      currentElevationM: freshStages[targetDay - 1]?.elevationProfile[0]?.ele ?? 268,
      trackPoints: [],
    });

    await Promise.all([
      persistStages(freshStages),
      persistJournalEntries(freshJournal),
      persistGearPairs(freshGear),
      persistCustomTracks(freshTracks),
    ]);
  };

  const navItems: Array<{
    id: TabId;
    label: string;
    desktopLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'dashboard', label: 'Dzień', desktopLabel: `Dzień ${settings.currentDayNumber}/365`, icon: Compass },
    { id: 'map', label: 'Mapa', desktopLabel: 'Mapa Szlaku', icon: MapIcon },
    { id: 'tracker', label: 'Marsz', desktopLabel: 'Rejestrator', icon: Footprints },
    { id: 'credencial', label: 'Credencial', desktopLabel: 'Credencial', icon: BookOpen },
    { id: 'planner', label: 'Planer', desktopLabel: 'Planer 365', icon: CalendarRange },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <OfflineIndicator />

      {/* COMPACT TOP BAR (48px) */}
      <header className="sticky top-0 z-30 h-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-base sm:text-lg font-extrabold tracking-tight text-blue-950 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#1e3a8a" />
              <path
                d="M16 24 L8 13 C7 10 11 7 16 7 C21 7 25 10 24 13 Z"
                fill="none"
                stroke="#eab308"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M16 24 L16 7 M16 24 L12 8.5 M16 24 L20 8.5" stroke="#eab308" strokeWidth="1.5" />
            </svg>
            <span>Via Trinitatis 365</span>
          </button>

          {/* Zone 2: Desktop single-line nav links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Nawigacja główna">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-semibold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-amber-500 text-blue-950 dark:text-amber-300'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.desktopLabel}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Theme Switch & PWA Install */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={handleToggleTheme}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 transition-colors cursor-pointer"
              aria-label={settings.theme === 'dark' ? 'Przełącz na motyw jasny' : 'Przełącz na motyw ciemny'}
              title={settings.theme === 'dark' ? 'Motyw jasny (w pełne słońce)' : 'Motyw ciemny (nocny)'}
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-20 md:pb-8">
        {!hydrated ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Ładowanie bazy szlaku Via Trinitatis 365...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                stages={stages}
                currentDayNumber={settings.currentDayNumber}
                onChangeCurrentDay={handleChangeCurrentDay}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'map' && (
              <MapTab
                stages={stages}
                currentDayNumber={settings.currentDayNumber}
                customTracks={customTracks}
                onSaveCustomTrack={handleSaveCustomTrack}
                onRemoveCustomTrack={handleRemoveCustomTrack}
              />
            )}

            {activeTab === 'tracker' && (
              <TrackerTab
                currentStage={currentStage}
                session={walkSession}
                setSession={setWalkSession}
                gearPairs={gearPairs}
                stepLengthMeters={settings.stepLengthMeters}
                bodyWeightKg={settings.bodyWeightKg}
                onFinishStageSession={handleFinishStageSession}
                onToggleGearActive={handleToggleGearActive}
                onAddGearPair={handleAddGearPair}
              />
            )}

            {activeTab === 'credencial' && (
              <CredencialTab
                stages={stages}
                currentDayNumber={settings.currentDayNumber}
                journalEntries={journalEntries}
                onSaveJournalEntry={handleSaveJournalEntry}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onResetExpedition={handleResetExpedition}
              />
            )}

            {activeTab === 'planner' && (
              <PlannerTab
                stages={stages}
                currentDayNumber={settings.currentDayNumber}
                onUpdateStage={handleUpdateStage}
                onSelectCurrentDay={(day) => {
                  handleChangeCurrentDay(day);
                  setActiveTab('dashboard');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* MOBILE FIXED BOTTOM TAB BAR (60px, 5 tabs) */}
      <nav
        aria-label="Nawigacja dolna"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
      >
        <div className="grid grid-cols-5 h-[60px] items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  active
                    ? 'text-blue-900 dark:text-amber-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] tracking-tight leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
