import React, { useMemo, useState } from 'react';
import {
  Award,
  Camera,
  Download,
  ImagePlus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { PHASES } from '../data/expeditionRoute';
import { JournalEntry, PhaseId, StageDay } from '../types/expedition';
import { compressImageFile } from '../utils/storage';

interface CredencialTabProps {
  stages: StageDay[];
  currentDayNumber: number;
  journalEntries: Record<number, JournalEntry>;
  onSaveJournalEntry: (entry: JournalEntry) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<void>;
  onResetExpedition: (mode: 'day1' | 'demo') => Promise<void>;
}

export const CredencialTab: React.FC<CredencialTabProps> = ({
  stages,
  currentDayNumber,
  journalEntries,
  onSaveJournalEntry,
  onExportBackup,
  onImportBackup,
  onResetExpedition,
}) => {
  const [subView, setSubView] = useState<'grid' | 'stamps'>('grid');
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | 'all'>('all');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Modal form state
  const [formState, setFormState] = useState<JournalEntry | null>(null);

  const openDayEditor = (dayNum: number) => {
    const existing = journalEntries[dayNum];
    const stage = stages.find((s) => s.dayNumber === dayNum);
    setFormState(
      existing ?? {
        dayNumber: dayNum,
        updatedAt: new Date().toISOString(),
        stampTitle: stage?.symbolism ? stage.toName : '',
        stampLocation: stage?.toName ?? '',
        stampImage: undefined,
        trailPhotos: [],
        spiritualNote: '',
        shelterName: '',
        shelterRating: 4,
        footCondition: 4,
        recoveryNote: '',
        expenseAmount: 0,
        expenseCurrency: 'PLN',
      }
    );
    setEditingDay(dayNum);
  };

  const handleStampPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formState) return;
    const dataUrl = await compressImageFile(file, 700, 0.8);
    setFormState({ ...formState, stampImage: dataUrl });
    e.target.value = '';
  };

  const handleTrailPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !formState) return;
    const compressed = await Promise.all(files.slice(0, 4).map((f) => compressImageFile(f, 960, 0.78)));
    setFormState({
      ...formState,
      trailPhotos: [...formState.trailPhotos, ...compressed].slice(0, 6),
    });
    e.target.value = '';
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;
    onSaveJournalEntry({ ...formState, updatedAt: new Date().toISOString() });
    setEditingDay(null);
    setFormState(null);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onImportBackup(file);
      setBackupMessage('Pomyślnie wczytano kopię zapasową JSON!');
    } catch (err) {
      setBackupMessage(err instanceof Error ? err.message : 'Błąd importu pliku JSON.');
    }
    e.target.value = '';
  };

  const stampsList = useMemo(() => {
    return Object.values(journalEntries)
      .filter((entry) => entry.stampTitle || entry.stampImage)
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }, [journalEntries]);

  const filteredStages = useMemo(() => {
    if (phaseFilter === 'all') return stages;
    return stages.filter((s) => s.phaseId === phaseFilter);
  }, [stages, phaseFilter]);

  const completedDaysCount = useMemo(
    () => stages.filter((s) => s.status === 'completed').length,
    [stages]
  );

  return (
    <div className="space-y-5 pb-8">
      {/* HEADER + OFFLINE JSON BACKUP CONTROLS */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Cyfrowy Credencial i Dziennik Pielgrzyma
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-mono-tabular">
              Ukończone dni: {completedDaysCount} / 365 · Zdobyte pieczątki (Sellos): {stampsList.length} · Wpisy dziennika: {Object.keys(journalEntries).length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportBackup}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Eksportuj JSON (Backup)</span>
            </button>

            <label className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Importuj JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetuj dane</span>
            </button>
          </div>
        </div>

        {backupMessage && (
          <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
            {backupMessage}
          </div>
        )}

        {/* Subview Tabs & Phase Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setSubView('grid')}
              className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                subView === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Siatka 365 dni
            </button>
            <button
              type="button"
              onClick={() => setSubView('stamps')}
              className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                subView === 'stamps'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Album Pieczątek ({stampsList.length})
            </button>
          </div>

          {subView === 'grid' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPhaseFilter('all')}
                className={`min-h-[38px] px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                  phaseFilter === 'all'
                    ? 'bg-blue-900 text-white dark:bg-amber-400 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Wszystkie (365)
              </button>
              {PHASES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPhaseFilter(p.id)}
                  className={`min-h-[38px] px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                    phaseFilter === p.id
                      ? 'bg-blue-900 text-white dark:bg-amber-400 dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Faza {p.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GRID OF 365 DAYS */}
      {subView === 'grid' ? (
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-15 gap-2">
            {filteredStages.map((s) => {
              const hasEntry = Boolean(journalEntries[s.dayNumber]);
              const hasStamp = Boolean(journalEntries[s.dayNumber]?.stampTitle || journalEntries[s.dayNumber]?.stampImage);
              const isCurrent = s.dayNumber === currentDayNumber;
              return (
                <button
                  key={s.dayNumber}
                  type="button"
                  onClick={() => openDayEditor(s.dayNumber)}
                  title={`Dzień ${s.dayNumber} (${s.dateLabel}): ${s.fromName} → ${s.toName}`}
                  className={`min-h-[54px] rounded-xl p-1.5 flex flex-col items-center justify-center border text-center transition-transform active:scale-95 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 border-amber-500 font-extrabold ring-2 ring-blue-900 dark:ring-amber-300'
                      : s.status === 'completed'
                      ? 'bg-blue-900 text-white border-blue-800'
                      : hasEntry
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold font-mono-tabular">{s.dayNumber}</span>
                  <span className="text-[10px] opacity-80 font-mono-tabular">{s.dateLabel}</span>
                  {hasStamp && (
                    <Award className="w-3 h-3 text-amber-300 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        /* STAMPS (SELLOS) GALLERY */
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stampsList.map((entry) => {
            const stage = stages.find((s) => s.dayNumber === entry.dayNumber);
            return (
              <div
                key={entry.dayNumber}
                onClick={() => openDayEditor(entry.dayNumber)}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-800 dark:hover:border-amber-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                  <span>Dzień {entry.dayNumber} · {stage?.fullDateLabel}</span>
                  <span>{entry.expenseAmount > 0 ? `${entry.expenseAmount} ${entry.expenseCurrency}` : ''}</span>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  {entry.stampImage ? (
                    <img
                      src={entry.stampImage}
                      alt={entry.stampTitle || 'Pieczątka pielgrzymkowa'}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-900/50 dark:border-amber-400/60 flex flex-col items-center justify-center p-2 text-center shrink-0 bg-blue-50/40 dark:bg-blue-950/30">
                      <Award className="w-6 h-6 text-blue-900 dark:text-amber-400" />
                      <span className="text-[9px] font-bold text-blue-900 dark:text-amber-300 mt-0.5 leading-tight">
                        SELLO #{entry.dayNumber}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {entry.stampTitle || 'Pieczątka z etapu'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {entry.stampLocation || stage?.toName}
                    </p>
                    <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                      {entry.spiritualNote || 'Kliknij, aby dodać notatkę z dnia.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {stampsList.length === 0 && (
            <div className="col-span-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
              Brak pieczątek. Kliknij dowolny dzień w siatce 365 dni, aby dodać pierwszą pieczątkę (Sello) i wpis z drogi.
            </div>
          )}
        </section>
      )}

      {/* JOURNAL & SELLO EDITOR MODAL */}
      {editingDay !== null && formState && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Credencial · Dzień {editingDay} ({stages[editingDay - 1]?.fullDateLabel})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stages[editingDay - 1]?.fromName} → {stages[editingDay - 1]?.toName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              {/* Stamp / Sello */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Pieczątka pielgrzymkowa (Sello)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nazwa pieczątki (np. Parafia / Albergue)"
                    value={formState.stampTitle ?? ''}
                    onChange={(e) => setFormState({ ...formState, stampTitle: e.target.value })}
                    className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Miejscowość"
                    value={formState.stampLocation ?? ''}
                    onChange={(e) => setFormState({ ...formState, stampLocation: e.target.value })}
                    className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center gap-2 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>Zrób zdjęcie pieczątki / Wybierz</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleStampPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formState.stampImage && (
                    <div className="relative">
                      <img
                        src={formState.stampImage}
                        alt="Podgląd pieczątki"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, stampImage: undefined })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                        aria-label="Usuń pieczątkę"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Spiritual / Text note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notatka duchowa i z drogi
                </label>
                <textarea
                  rows={3}
                  placeholder="Refleksja z etapu, spotkani ludzie, modlitwa, warunki na trasie..."
                  value={formState.spiritualNote}
                  onChange={(e) => setFormState({ ...formState, spiritualNote: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm"
                />
              </div>

              {/* Shelter & Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nocleg / Schronisko / Parafia
                  </label>
                  <input
                    type="text"
                    placeholder="Nazwa miejsca noclegu"
                    value={formState.shelterName}
                    onChange={(e) => setFormState({ ...formState, shelterName: e.target.value })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Ocena noclegu:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormState({ ...formState, shelterRating: n })}
                          className="p-1.5 cursor-pointer"
                          aria-label={`Ocena noclegu ${n}`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              n <= formState.shelterRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kondycja stóp i regeneracja (1–5)
                  </label>
                  <div className="flex items-center gap-1.5 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormState({ ...formState, footCondition: n })}
                        className={`min-h-[40px] flex-1 rounded-xl text-xs font-bold border cursor-pointer ${
                          formState.footCondition === n
                            ? 'bg-blue-900 text-white border-blue-900 dark:bg-amber-400 dark:text-slate-950 dark:border-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Pęcherze, maści, rozciąganie..."
                    value={formState.recoveryNote}
                    onChange={(e) => setFormState({ ...formState, recoveryNote: e.target.value })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              {/* Expenses & Trail Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Wydatki dnia
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={formState.expenseAmount}
                      onChange={(e) => setFormState({ ...formState, expenseAmount: Number(e.target.value) })}
                      className="flex-1 min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono-tabular"
                    />
                    <select
                      value={formState.expenseCurrency}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          expenseCurrency: e.target.value as 'PLN' | 'EUR' | 'USD',
                        })
                      }
                      className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold"
                    >
                      <option value="PLN">PLN</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Zdjęcia ze szlaku (max 6)
                  </label>
                  <label className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    <span>Dodaj zdjęcia ze szlaku</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleTrailPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {formState.trailPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formState.trailPhotos.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={src}
                        alt={`Zdjęcie ze szlaku ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormState({
                            ...formState,
                            trailPhotos: formState.trailPhotos.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                        aria-label="Usuń zdjęcie"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="min-h-[48px] px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] px-6 rounded-xl bg-blue-900 hover:bg-blue-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Zapisz wpis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET EXPEDITION CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Resetowanie danych wyprawy
              </h2>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Wybierz tryb resetu lokalnej bazy wyprawy (przed resetem możesz zapisać kopię zapasową JSON).
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={async () => {
                  await onResetExpedition('day1');
                  setShowResetConfirm(false);
                  setBackupMessage('Wyprawa zresetowana do Dnia 1 (14.06 · 0 km). Powodzenia na starcie!');
                }}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold cursor-pointer transition-colors"
              >
                Wyzeruj wszystko do Dnia 1 (14.06 · 0 km)
              </button>

              <button
                type="button"
                onClick={async () => {
                  await onResetExpedition('demo');
                  setShowResetConfirm(false);
                  setBackupMessage('Przywrócono domyślne dane demonstracyjne (Dzień 10 · 23.06 Ojców).');
                }}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold cursor-pointer transition-colors"
              >
                Przywróć dane startowe (Dzień 10 · 23.06)
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold cursor-pointer transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
