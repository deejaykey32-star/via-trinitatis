export type PhaseId = 1 | 2 | 3 | 4 | 5;

export type TabId = 'dashboard' | 'map' | 'tracker' | 'credencial' | 'planner';

export interface PhaseInfo {
  id: PhaseId;
  name: string;
  shortName: string;
  dayStart: number;
  dayEnd: number;
  description: string;
  routeSummary: string;
  accentColor: string;
}

export interface ElevationPoint {
  km: number;
  ele: number;
  label?: string;
}

export type StageStatus = 'completed' | 'current' | 'planned';

export interface StageDay {
  dayNumber: number; // 1..365
  dateLabel: string; // e.g. "23.06"
  fullDateLabel: string; // e.g. "23 czerwca"
  phaseId: PhaseId;
  fromName: string;
  toName: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  plannedKm: number;
  completedMainKm: number;
  completedExploreKm: number;
  elevationGainM: number;
  elevationLossM: number;
  stepsCount: number;
  status: StageStatus;
  symbolism?: string;
  milestone?: boolean;
  elevationProfile: ElevationPoint[];
}

export interface JournalEntry {
  dayNumber: number;
  updatedAt: string;
  stampTitle?: string;
  stampLocation?: string;
  stampImage?: string; // base64 dataURL
  trailPhotos: string[]; // base64 dataURLs
  spiritualNote: string;
  shelterName: string;
  shelterRating: number; // 1..5
  footCondition: number; // 1..5
  recoveryNote: string;
  expenseAmount: number;
  expenseCurrency: 'PLN' | 'EUR' | 'USD';
}

export interface GearPair {
  id: string;
  name: string;
  brand: string;
  loggedKm: number;
  maxRecommendedKm: number;
  active: boolean;
  startedDay: number;
}

export interface CustomTrack {
  dayNumber: number;
  fileName: string;
  format: 'gpx' | 'geojson';
  coords: Array<[number, number]>;
  elevationProfile: ElevationPoint[];
  totalKm: number;
  gainM: number;
  lossM: number;
}

export interface WalkTrackPoint {
  lat: number;
  lng: number;
  ele: number;
  ts: number;
  mode: 'main' | 'explore';
}

export interface WalkSessionState {
  status: 'idle' | 'walking' | 'paused';
  mode: 'main' | 'explore';
  dayNumber: number;
  startedAtMs: number | null;
  lastResumedAtMs: number | null;
  accumulatedWalkingMs: number;
  mainKm: number;
  exploreKm: number;
  steps: number;
  currentElevationM: number;
  trackPoints: WalkTrackPoint[];
}

export interface ExpeditionSettings {
  theme: 'light' | 'dark';
  currentDayNumber: number;
  stepLengthMeters: number;
  bodyWeightKg: number;
  dailyTargetKm: number;
}

export interface ExpeditionBackup {
  version: number;
  exportedAt: string;
  settings: ExpeditionSettings;
  stages: StageDay[];
  journalEntries: Record<number, JournalEntry>;
  gearPairs: GearPair[];
  customTracks: Record<number, CustomTrack>;
}
