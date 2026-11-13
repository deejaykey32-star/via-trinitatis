import { buildInitialGear, buildInitialJournalEntries, buildInitialStages } from '../data/expeditionRoute';
import {
  CustomTrack,
  ExpeditionBackup,
  ExpeditionSettings,
  GearPair,
  JournalEntry,
  StageDay,
} from '../types/expedition';

const DB_NAME = 'via-trinitatis-365-db';
const DB_VERSION = 1;
const STORE_KV = 'kv_store';
const LS_SETTINGS_KEY = 'vt365_settings_v1';

export const DEFAULT_SETTINGS: ExpeditionSettings = {
  theme: 'light',
  currentDayNumber: 10, // Default Day 10: 23.06 - Dzień Ojca w Ojcowie!
  stepLengthMeters: 0.74,
  bodyWeightKg: 75,
  dailyTargetKm: 26.5,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE_KV, 'readonly');
      const store = tx.objectStore(STORE_KV);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_KV, 'readwrite');
      const store = tx.objectStore(STORE_KV);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback gracefully if private browsing blocks IndexedDB
  }
}

export function loadSettingsSync(): ExpeditionSettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettingsSync(settings: ExpeditionSettings): void {
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const LS_ROUTE_REV_KEY = 'vt365_route_rev';
const CURRENT_ROUTE_REV = '3';

export async function loadExpeditionData(): Promise<{
  settings: ExpeditionSettings;
  stages: StageDay[];
  journalEntries: Record<number, JournalEntry>;
  gearPairs: GearPair[];
  customTracks: Record<number, CustomTrack>;
}> {
  const settings = loadSettingsSync();
  const [storedStages, journalEntries, gearPairs, customTracks] = await Promise.all([
    idbGet<StageDay[]>('stages'),
    idbGet<Record<number, JournalEntry>>('journalEntries'),
    idbGet<GearPair[]>('gearPairs'),
    idbGet<Record<number, CustomTrack>>('customTracks'),
  ]);

  const freshStages = buildInitialStages(settings.currentDayNumber);
  let resolvedStages = freshStages;
  let resolvedJournal = journalEntries ?? buildInitialJournalEntries();

  const savedRev = localStorage.getItem(LS_ROUTE_REV_KEY);
  if (storedStages && storedStages.length === 365) {
    if (savedRev === CURRENT_ROUTE_REV) {
      resolvedStages = storedStages;
    } else {
      // Refresh route waypoints to 100% pure-walk overland while preserving recorded progress
      resolvedStages = storedStages.map((s) => {
        const fresh = freshStages[s.dayNumber - 1];
        return {
          ...fresh,
          completedMainKm: s.completedMainKm,
          completedExploreKm: s.completedExploreKm,
          stepsCount: s.stepsCount,
          status: s.status,
        };
      });
      await idbSet('stages', resolvedStages);
      if (journalEntries && journalEntries[3] && !journalEntries[5] && journalEntries[3].stampTitle === 'Sanktuarium Jasna Góra') {
        const nextJournal = { ...journalEntries };
        nextJournal[5] = { ...nextJournal[3], dayNumber: 5, updatedAt: '2026-06-18T21:00:00.000Z' };
        delete nextJournal[3];
        resolvedJournal = nextJournal;
        await idbSet('journalEntries', resolvedJournal);
      }
    }
  }
  localStorage.setItem(LS_ROUTE_REV_KEY, CURRENT_ROUTE_REV);

  return {
    settings,
    stages: resolvedStages,
    journalEntries: resolvedJournal,
    gearPairs: gearPairs && gearPairs.length > 0 ? gearPairs : buildInitialGear(),
    customTracks: customTracks ?? {},
  };
}

export async function persistStages(stages: StageDay[]): Promise<void> {
  await idbSet('stages', stages);
}

export async function persistJournalEntries(entries: Record<number, JournalEntry>): Promise<void> {
  await idbSet('journalEntries', entries);
}

export async function persistGearPairs(gear: GearPair[]): Promise<void> {
  await idbSet('gearPairs', gear);
}

export async function persistCustomTracks(tracks: Record<number, CustomTrack>): Promise<void> {
  await idbSet('customTracks', tracks);
}

export function exportBackupToJson(backup: ExpeditionBackup): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `via-trinitatis-365-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateBackupJson(raw: unknown): ExpeditionBackup {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Nieprawidłowy plik kopii zapasowej.');
  }
  const obj = raw as Partial<ExpeditionBackup>;
  if (!Array.isArray(obj.stages) || obj.stages.length !== 365) {
    throw new Error('Kopia zapasowa musi zawierać pełną listę 365 etapów.');
  }
  return {
    version: obj.version ?? 1,
    exportedAt: obj.exportedAt ?? new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS, ...(obj.settings ?? {}) },
    stages: obj.stages,
    journalEntries: obj.journalEntries ?? {},
    gearPairs: Array.isArray(obj.gearPairs) ? obj.gearPairs : buildInitialGear(),
    customTracks: obj.customTracks ?? {},
  };
}

export function compressImageFile(file: File, maxWidth = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Nie udało się odczytać zdjęcia.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
    reader.readAsDataURL(file);
  });
}
