import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  Flag,
  Save,
  Search,
  X,
} from 'lucide-react';
import { PHASES } from '../data/expeditionRoute';
import { PhaseId, StageDay, StageStatus } from '../types/expedition';

interface PlannerTabProps {
  stages: StageDay[];
  currentDayNumber: number;
  onUpdateStage: (updated: StageDay) => void;
  onSelectCurrentDay: (dayNumber: number) => void;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({
  stages,
  currentDayNumber,
  onUpdateStage,
  onSelectCurrentDay,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<PhaseId>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMilestones, setOnlyMilestones] = useState(false);
  const [editingStage, setEditingStage] = useState<StageDay | null>(null);

  const phaseSummaries = useMemo(() => {
    return PHASES.map((phase) => {
      const list = stages.filter((s) => s.phaseId === phase.id);
      const totalPlannedKm = list.reduce((sum, s) => sum + s.plannedKm, 0);
      const totalDoneKm = list.reduce((sum, s) => sum + s.completedMainKm, 0);
      return {
        phase,
        daysCount: list.length,
        totalPlannedKm,
        totalDoneKm,
      };
    });
  }, [stages]);

  const filteredStages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stages.filter((s) => {
      if (!q && !onlyMilestones && s.phaseId !== selectedPhase) return false;
      if (onlyMilestones && !s.milestone && !s.symbolism) return false;
      if (q) {
        const hay = `${s.dayNumber} ${s.dateLabel} ${s.fromName} ${s.toName} ${s.symbolism ?? ''}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [stages, selectedPhase, searchQuery, onlyMilestones]);

  const totalExpeditionKm = useMemo(
    () => stages.reduce((sum, s) => sum + s.plannedKm, 0),
    [stages]
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;
    onUpdateStage(editingStage);
    setEditingStage(null);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* HEADER SUMMARY */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Planer 365 Dni Marszu
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 font-mono-tabular">
              5 Faz · Suma zaplanowanego szlaku: {Math.round(totalExpeditionKm).toLocaleString('pl-PL')} km · Edycja każdego etapu przelicza Pace Balancer
            </p>
          </div>
        </div>

        {/* 5 Phase Selector Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {phaseSummaries.map(({ phase, daysCount, totalPlannedKm, totalDoneKm }) => {
            const active = selectedPhase === phase.id && !searchQuery && !onlyMilestones;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => {
                  setSelectedPhase(phase.id);
                  setOnlyMilestones(false);
                  setSearchQuery('');
                }}
                className={`text-left rounded-2xl p-3.5 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className={`text-[11px] font-mono-tabular font-semibold ${active ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  Faza {phase.id} · Dni {phase.dayStart}–{phase.dayEnd} ({daysCount}d)
                </div>
                <div className="mt-1 text-sm font-bold truncate">{phase.shortName}</div>
                <div className={`mt-1 text-xs font-mono-tabular ${active ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                  {totalDoneKm.toFixed(0)} / {totalPlannedKm.toFixed(0)} km
                </div>
              </button>
            );
          })}
        </div>

        {/* Search & Milestones Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj miasta, sanktuarium lub numeru dnia (np. Ojców, Santiago, 21.06)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyMilestones((v) => !v)}
            className={`min-h-[44px] px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer shrink-0 ${
              onlyMilestones
                ? 'bg-amber-400 text-slate-950 border-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Tylko kamienie milowe</span>
          </button>
        </div>
      </section>

      {/* STAGE LIST */}
      <section className="space-y-2.5">
        {filteredStages.map((stage) => {
          const isCurrent = stage.dayNumber === currentDayNumber;
          return (
            <div
              key={stage.dayNumber}
              className={`rounded-2xl bg-white dark:bg-slate-900 border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                isCurrent
                  ? 'border-amber-500 ring-1 ring-amber-400'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-blue-900 dark:text-amber-400">
                    Dzień {stage.dayNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{stage.fullDateLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>Faza {stage.phaseId}</span>
                  {stage.status === 'completed' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ukończono
                      </span>
                    </>
                  )}
                </div>

                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                  <span>{stage.fromName}</span>
                  <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{stage.toName}</span>
                </div>

                {stage.symbolism && (
                  <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    {stage.symbolism}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right font-mono-tabular">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {stage.plannedKm.toFixed(1)} km
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    +{stage.elevationGainM}m / -{stage.elevationLossM}m
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectCurrentDay(stage.dayNumber)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {isCurrent ? 'Aktywny' : 'Podgląd'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStage({ ...stage })}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-blue-900 hover:bg-blue-800 text-white cursor-pointer"
                    aria-label={`Edytuj dzień ${stage.dayNumber}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredStages.length === 0 && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
            Brak etapów spełniających wybrane kryteria wyszukiwania.
          </div>
        )}
      </section>

      {/* EDIT STAGE MODAL */}
      {editingStage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Edycja etapu · Dzień {editingStage.dayNumber} ({editingStage.fullDateLabel})
              </h2>
              <button
                type="button"
                onClick={() => setEditingStage(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Punkt startowy (A)
                </label>
                <input
                  type="text"
                  required
                  value={editingStage.fromName}
                  onChange={(e) => setEditingStage({ ...editingStage, fromName: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Punkt docelowy (B)
                </label>
                <input
                  type="text"
                  required
                  value={editingStage.toName}
                  onChange={(e) => setEditingStage({ ...editingStage, toName: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dystans (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    required
                    value={editingStage.plannedKm}
                    onChange={(e) => setEditingStage({ ...editingStage, plannedKm: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Podejścia (m)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingStage.elevationGainM}
                    onChange={(e) => setEditingStage({ ...editingStage, elevationGainM: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Zejścia (m)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingStage.elevationLossM}
                    onChange={(e) => setEditingStage({ ...editingStage, elevationLossM: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Przebyto Szlak Główny (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={editingStage.completedMainKm}
                    onChange={(e) => setEditingStage({ ...editingStage, completedMainKm: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status etapu
                  </label>
                  <select
                    value={editingStage.status}
                    onChange={(e) => setEditingStage({ ...editingStage, status: e.target.value as StageStatus })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold"
                  >
                    <option value="planned">Planowany</option>
                    <option value="current">Dzisiejszy</option>
                    <option value="completed">Ukończony</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Symbolika / Kamień milowy
                </label>
                <input
                  type="text"
                  placeholder="Np. Sanktuarium, przekroczenie granicy..."
                  value={editingStage.symbolism ?? ''}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      symbolism: e.target.value || undefined,
                      milestone: Boolean(e.target.value),
                    })
                  }
                  className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStage(null)}
                  className="min-h-[48px] px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] px-6 rounded-xl bg-blue-900 hover:bg-blue-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Zapisz i przelicz</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
