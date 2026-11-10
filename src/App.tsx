/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Compass,
  Backpack,
  Home,
  Search,
  Check,
  Download,
  ChevronRight,
  Clock,
  Mountain,
  FileText,
  Landmark,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';
import PilgrimageGoogleMap from './components/PilgrimageGoogleMap';
import {
  PILGRIMAGE_STAGES,
  ALL_DAILY_SEGMENTS,
  HERO_IMAGE,
  CAMINO_IMAGE,
  JERUSALEM_IMAGE,
  GEAR_IMAGE,
  formatUniversalDate,
  DailySegment,
} from './data/pilgrimageData';
import { TRAIL_ATTRACTIONS, TrailAttraction } from './data/attractionsData';
import {
  COMPREHENSIVE_EQUIPMENT_LIST,
  SEASONAL_STRATEGIES,
  EquipmentCategory,
  ComprehensiveGearItem,
} from './data/equipmentData';
import {
  ACCOMMODATION_DIRECTORY,
  AccommodationFacility,
} from './data/accommodationDirectoryData';

type CarryPlacement = 'backpack' | 'van_or_deposit' | 'worn' | 'none';

export default function App() {
  // 1. Active Stages Configuration (Universal 365-Day Calendar without Year)
  const [enabledStages, setEnabledStages] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [walkingPaceKmh, setWalkingPaceKmh] = useState<number>(4.5);
  const [accDirectoryStageFilter, setAccDirectoryStageFilter] = useState<number | 'all'>('all');

  // 2. Daily Schedule Filters & Selection
  const [selectedStageTab, setSelectedStageTab] = useState<number | 'all'>(1);
  const [daySearchQuery, setDaySearchQuery] = useState<string>('');
  const [accommodationFilter, setAccommodationFilter] = useState<string>('all');
  const [selectedDayGlobalNum, setSelectedDayGlobalNum] = useState<number>(1);
  const [dayPage, setDayPage] = useState<number>(1);
  const DAYS_PER_PAGE = 15;

  // 3. Attractions & Sanctuaries Filters
  const [attractionStageFilter, setAttractionStageFilter] = useState<number | 'all'>('all');
  const [attractionCategoryFilter, setAttractionCategoryFilter] = useState<string>('all');
  const [attractionStopFilter, setAttractionStopFilter] = useState<string>('all');

  // 4. Equipment & Backpack Weight Calculator State
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(75);
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<EquipmentCategory | 'all'>('all');
  const [gearPlacements, setGearPlacements] = useState<Record<string, CarryPlacement>>(() => {
    const initial: Record<string, CarryPlacement> = {};
    COMPREHENSIVE_EQUIPMENT_LIST.forEach((item) => {
      initial[item.id] = item.defaultCarryMode;
    });
    return initial;
  });

  // 5. Persisted Pilgrim Notes & Bookmarked Days
  const [plannedDays, setPlannedDays] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('via_trinitatis_planned_days');
      return saved ? JSON.parse(saved) : { 1: true, 4: true, 11: true, 15: true };
    } catch {
      return { 1: true, 4: true, 11: true, 15: true };
    }
  });

  const [pilgrimNotes, setPilgrimNotes] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('via_trinitatis_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Map view mode: 'poland' (Small Triangle: Stages 1-3) or 'continental' (Great Triangle: Stages 4-6 + 1-3)
  const [mapScope, setMapScope] = useState<'poland' | 'continental'>('continental');
  const [mapViewTab, setMapViewTab] = useState<'google' | 'schematic'>('google');
  const [googleMapDaySegment, setGoogleMapDaySegment] = useState<DailySegment | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('via_trinitatis_planned_days', JSON.stringify(plannedDays));
    } catch {
      // ignore storage errors
    }
  }, [plannedDays]);

  useEffect(() => {
    try {
      localStorage.setItem('via_trinitatis_notes', JSON.stringify(pilgrimNotes));
    } catch {
      // ignore storage errors
    }
  }, [pilgrimNotes]);

  const toggleStageEnabled = (stageId: number) => {
    setEnabledStages((prev) => {
      if (prev.includes(stageId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== stageId).sort((a, b) => a - b);
      }
      return [...prev, stageId].sort((a, b) => a - b);
    });
  };

  const applyPresetVariant = (stages: number[]) => {
    setEnabledStages(stages);
    setSelectedStageTab(stages[0] || 1);
    setDayPage(1);
    if (stages.some((s) => s >= 4)) {
      setMapScope('continental');
    } else {
      setMapScope('poland');
    }
  };

  // Summary KPIs for selected stages
  const routeSummary = useMemo(() => {
    const activeStages = PILGRIMAGE_STAGES.filter((s) => enabledStages.includes(s.id));
    const activeSegments = ALL_DAILY_SEGMENTS.filter((seg) => enabledStages.includes(seg.stageId));
    const totalKm = activeSegments.reduce((sum, s) => sum + s.distanceKm, 0);
    const totalDays = activeSegments.length;
    const maxDaily = activeSegments.reduce((max, s) => Math.max(max, s.distanceKm), 0);
    const avgDaily = totalDays > 0 ? totalKm / totalDays : 0;
    const lastOffset = activeStages.length > 0 ? Math.max(...activeStages.map((s) => s.endDayOffset)) : 15;
    const startDate = formatUniversalDate(0);
    const endDate = formatUniversalDate(lastOffset);
    const uniqueCountries = Array.from(new Set(activeStages.flatMap((s) => s.countries)));

    return {
      totalKm: totalKm.toFixed(1),
      totalDays,
      maxDaily: maxDaily.toFixed(1),
      avgDaily: avgDaily.toFixed(1),
      startDate,
      endDate,
      uniqueCountries,
    };
  }, [enabledStages]);

  // Filtered daily segments
  const filteredSegments = useMemo(() => {
    return ALL_DAILY_SEGMENTS.filter((seg) => {
      if (selectedStageTab !== 'all' && seg.stageId !== selectedStageTab) return false;
      if (accommodationFilter !== 'all' && seg.accommodationType !== accommodationFilter) return false;
      if (daySearchQuery.trim() !== '') {
        const q = daySearchQuery.toLowerCase();
        const matchTown =
          seg.fromTown.toLowerCase().includes(q) ||
          seg.toTown.toLowerCase().includes(q) ||
          seg.country.toLowerCase().includes(q) ||
          seg.region.toLowerCase().includes(q) ||
          seg.sanctuaryOrLandmark.toLowerCase().includes(q) ||
          seg.viaWaypoints.some((w) => w.toLowerCase().includes(q));
        if (!matchTown) return false;
      }
      return true;
    });
  }, [selectedStageTab, accommodationFilter, daySearchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSegments.length / DAYS_PER_PAGE));
  const paginatedSegments = useMemo(() => {
    const start = (dayPage - 1) * DAYS_PER_PAGE;
    return filteredSegments.slice(start, start + DAYS_PER_PAGE);
  }, [filteredSegments, dayPage]);

  const selectedDayDetail: DailySegment = useMemo(() => {
    return (
      ALL_DAILY_SEGMENTS.find((d) => d.globalDayNumber === selectedDayGlobalNum) ||
      ALL_DAILY_SEGMENTS[0]
    );
  }, [selectedDayGlobalNum]);

  // Filtered Attractions
  const filteredAttractions = useMemo(() => {
    return TRAIL_ATTRACTIONS.filter((att) => {
      if (attractionStageFilter !== 'all' && att.stageId !== attractionStageFilter) return false;
      if (attractionCategoryFilter !== 'all' && att.category !== attractionCategoryFilter) return false;
      if (attractionStopFilter !== 'all' && att.stopType !== attractionStopFilter) return false;
      return true;
    });
  }, [attractionStageFilter, attractionCategoryFilter, attractionStopFilter]);

  // Filtered Equipment & Weight Calculations
  const filteredEquipment = useMemo(() => {
    if (equipmentCategoryFilter === 'all') return COMPREHENSIVE_EQUIPMENT_LIST;
    return COMPREHENSIVE_EQUIPMENT_LIST.filter((item) => item.category === equipmentCategoryFilter);
  }, [equipmentCategoryFilter]);

  const weightStats = useMemo(() => {
    let backpackGrams = 0;
    let vanOrDepositGrams = 0;
    let wornGrams = 0;

    COMPREHENSIVE_EQUIPMENT_LIST.forEach((item) => {
      const mode = gearPlacements[item.id] || item.defaultCarryMode;
      if (mode === 'backpack') backpackGrams += item.weightGrams;
      if (mode === 'van_or_deposit') vanOrDepositGrams += item.weightGrams;
      if (mode === 'worn') wornGrams += item.weightGrams;
    });

    const backpackKg = backpackGrams / 1000;
    const recommendedMaxKg = bodyWeightKg * 0.1;
    const isWithinLimit = backpackKg <= recommendedMaxKg;

    return {
      backpackGrams,
      backpackKg: backpackKg.toFixed(2),
      vanOrDepositKg: (vanOrDepositGrams / 1000).toFixed(2),
      wornKg: (wornGrams / 1000).toFixed(2),
      recommendedMaxKg: recommendedMaxKg.toFixed(1),
      isWithinLimit,
    };
  }, [gearPlacements, bodyWeightKg]);

  const handleExportPlan = () => {
    const activeSegs = ALL_DAILY_SEGMENTS.filter((s) => enabledStages.includes(s.stageId));
    const lines: string[] = [
      `VIA TRINITATIS — ROCZNY PLAN PIESZEJ PIELGRZYMKI Z KOCHŁOWIC (KALENDARZ UNIWERSALNY · 365 DNI)`,
      `Miejsce startu i powrotu: Ruda Śląska – Kochłowice, Kościół Trójcy Świętej obok Sanktuarium MB z Lourdes`,
      `Data rozpoczęcia: 14 czerwca (Kalendarz uniwersalny bez przypisanego roku)`,
      `Data zakończenia wybranych etapów: ${routeSummary.endDate.fullDate}`,
      `Łączny dystans: ${routeSummary.totalKm} km | Liczba dni: ${routeSummary.totalDays} | Maksymalny odcinek: ${routeSummary.maxDaily} km/dzień`,
      `Geometria Szlaku: Mały Trójkąt Polski (Etapy 1–3: 15 dni, ≤ 30 km/dzień) + Wielki Trójkąt Kontynentalny (Etapy 4–6: 350 dni, pow. 30 km/dzień)`,
      `--------------------------------------------------------------------------------`,
      `HARMONOGRAM ODCINKÓW (365 DNI):`,
      ...activeSegs.map((s) => {
        const dt = formatUniversalDate(s.dayOffsetFromJune14);
        return `Dzień ${String(s.globalDayNumber).padStart(3, '0')} [Etap ${s.stageId}.${s.stageDayNumber}] (${dt.shortDate}): ${s.fromTown} -> ${s.toTown} | ${s.distanceKm.toFixed(1)} km | Nocleg: ${s.accommodationName}`;
      }),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plan_Pielgrzymki_Kochlowice_365_Dni.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const equipmentCategories: EquipmentCategory[] = [
    'Niezbędny: Plecak i Podstawowe Wyposażenie',
    'Niezbędny: Obuwie i Skarpety',
    'Niezbędny: Ubranie (System Warstwowy)',
    'Higiena',
    'Apteczka',
    'Nawigacja i Elektronika',
    'Dokumenty i Finanse',
    'Inne Użyteczne Przedmioty',
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col">
      {quotaExceeded && (
        <div
          role="alert"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            background: '#FEF3C7',
            color: '#78350F',
            borderBottom: '1px solid #F59E0B',
            padding: '10px 16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span>
            <strong>Google Maps:</strong> You&apos;ve reached the free usage limit for the demo Maps key. To keep
            using maps, switch to your own Google Cloud project API key — see{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#92400E', textDecoration: 'underline', fontWeight: 600 }}
            >
              Quota exceeded errors
            </a>{' '}
            for step-by-step instructions.
          </span>
          <button
            onClick={() => setQuotaExceeded(false)}
            aria-label="Dismiss"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#78350F',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>
      )}
      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-stone-200 px-6 lg:px-12 py-4 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-stone-900 font-serif-display whitespace-nowrap shrink-0"
        >
          Via Trinitatis
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a
            href="#etapy-i-mapa"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Etapy i Mapa
          </a>
          <a
            href="#harmonogram-dni"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Harmonogram Dni
          </a>
          <a
            href="#sanktuaria-i-zabytki"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Sanktuaria i Zabytki
          </a>
          <a
            href="#ekwipunek-i-bagaz"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Ekwipunek i Bagaż
          </a>
          <a
            href="#organizacja-i-noclegi"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Noclegi i Logistyka
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            onClick={handleExportPlan}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pobierz Plan (365 Dni)</span>
          </button>
        </div>
      </header>

      <main id="top" className="flex-1 max-w-[1380px] w-full mx-auto px-6 lg:px-12 py-10 space-y-20">
        {/* HERO SECTION & CONFIGURATOR */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Editorial Lead & Configurator */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-stone-200 rounded-xl p-7 lg:p-9">
              <div className="space-y-4">
                <div className="text-xs font-medium text-stone-500 flex flex-wrap items-center gap-2">
                  <span>Kalendarz Uniwersalny (bez roku)</span>
                  <span aria-hidden="true">·</span>
                  <span>Start stały: 14 czerwca</span>
                  <span aria-hidden="true">·</span>
                  <span>Geometria Dwu Trójkątów · 365 dni</span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-stone-900 leading-[1.15] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Roczna Piesza Pielgrzymka z Kochłowic na Jasną Górę, do Łagiewnik, Santiago, Watykanu i Jerozolimy
                </h1>

                <p className="text-stone-600 text-base leading-relaxed max-w-2xl">
                  Pielgrzymka wyrusza <strong>14 czerwca</strong> z{' '}
                  <strong>Kościoła Trójcy Świętej obok Sanktuarium Matki Bożej z Lourdes w Kochłowicach</strong> i
                  tworzy dwa bliźniacze trójkąty pątnicze wpisane w pełny rok <strong>365 dni</strong>: stały{' '}
                  <strong>Mały Trójkąt Polski (Etapy 1–3: Kochłowice – Jasna Góra – Łagiewniki – Kochłowice)</strong>{' '}
                  oraz <strong>Wielki Trójkąt Kontynentalny (Etapy 4–6: Kochłowice – Santiago – Watykan/Jerozolima – Kochłowice)</strong>.
                </p>
              </div>

              {/* Universal Calendar Info & Variant Selector (No Year Picker) */}
              <div className="mt-8 pt-6 border-t border-stone-200 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 bg-stone-50 border border-stone-200 rounded-lg p-3.5">
                    <div className="text-[11px] font-semibold text-emerald-900">
                      Kalendarz Uniwersalny · 365 Dni
                    </div>
                    <div className="text-xs font-bold text-stone-900 mt-0.5 font-mono tabular-nums">
                      14 czerwca → 14 czerwca
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Trójkąt I (E1–3): 15 dni · Trójkąt II (E4–6): 350 dni
                    </div>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Szybki wybór wariantu trasy:
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => applyPresetVariant([1, 2, 3])}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          enabledStages.length === 3 && enabledStages.every((s) => s <= 3)
                            ? 'bg-white text-stone-900 shadow-xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Trójkąt Polski 1–3 (15 dni)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetVariant([1, 2, 3, 4])}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          enabledStages.length === 4 && enabledStages.includes(4)
                            ? 'bg-white text-stone-900 shadow-xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        + Etap 4 (110 dni · Santiago)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetVariant([1, 2, 3, 4, 5, 6])}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          enabledStages.length === 6
                            ? 'bg-white text-stone-900 shadow-xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Oba Trójkąty 1–6 (365 dni)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Individual Stage Checkboxes */}
                <div>
                  <div className="text-xs font-medium text-stone-500 mb-2">
                    Aktywne etapy w Twoim planie (kliknij, aby włączyć lub wyłączyć etap):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PILGRIMAGE_STAGES.map((st) => {
                      const active = enabledStages.includes(st.id);
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => toggleStageEnabled(st.id)}
                          className={`px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                            active
                              ? 'bg-emerald-950/5 border-emerald-800 text-stone-900'
                              : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">
                              Etap {st.id} ({st.daysCount} dni)
                            </div>
                            <div className="text-[11px] text-stone-500 truncate">
                              {st.endLocation.split(' (')[0]}
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                              active ? 'bg-emerald-900 text-white' : 'border border-stone-300'
                            }`}
                          >
                            {active && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image with Measured Scrim */}
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-stone-200 bg-stone-900 min-h-[360px] flex flex-col justify-end">
              <img
                src={HERO_IMAGE}
                alt="Pielgrzymi na porannym szlaku z Kochłowic w czerwcu"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="relative z-10 p-7 text-white space-y-3">
                <div className="text-xs font-medium text-amber-300 tracking-wide">
                  Wspólny Wierzchołek Obu Trójkątów · Ruda Śląska – Kochłowice
                </div>
                <h2 className="text-2xl font-bold font-serif-display leading-snug">
                  Kościół Trójcy Świętej i Sanktuarium Matki Bożej z Lourdes
                </h2>
                <p className="text-xs text-stone-200 leading-relaxed">
                  Zbiórka pątników każdego roku 14 czerwca o godz. 6:15 przy wozie bagażowym na ul. Ks. Ludwika Tunkla w
                  Kochłowicach. Stąd wychodzą i tu powracają oba trójkąty pątnicze: Mały Trójkąt Polski (Etapy 1–3) oraz
                  Wielki Trójkąt Kontynentalny (Etapy 4–6).
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono tabular-nums text-stone-300">
                  <span>Start: {routeSummary.startDate.shortDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>Jasna Góra: {formatUniversalDate(3).shortDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>Pustynia Błędowska: 21.06</span>
                  <span aria-hidden="true">·</span>
                  <span>Ojców (Dzień Ojca): 23.06</span>
                  <span aria-hidden="true">·</span>
                  <span>Łagiewniki: {formatUniversalDate(11).shortDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Full-Width KPI Strip below Hero Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="text-xs text-stone-500">Łączny dystans wybranych etapów</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-stone-900">
                {routeSummary.totalKm} km
              </div>
              <div className="mt-1 text-xs text-stone-500">
                Średnio <span className="font-mono tabular-nums font-medium">{routeSummary.avgDaily} km</span> dziennie
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="text-xs text-stone-500">Czas trwania (Kalendarz Uniwersalny)</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-stone-900">
                {routeSummary.totalDays} {routeSummary.totalDays === 365 ? 'dni (Pełny Rok)' : 'dni marszu'}
              </div>
              <div className="mt-1 text-xs text-stone-500 font-mono tabular-nums">
                {routeSummary.startDate.fullDate} → {routeSummary.endDate.fullDate}
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="text-xs text-stone-500">Maksymalny odcinek dzienny</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-900">
                {routeSummary.maxDaily} km
              </div>
              <div className="mt-1 text-xs text-stone-500">
                Etapy 1–3: ≤ 30,0 km · Etapy 4–6: wydłużone do 37,4 km
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="text-xs text-stone-500">Kraje na wybranym szlaku</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-stone-900">
                {routeSummary.uniqueCountries.length}{' '}
                {routeSummary.uniqueCountries.length === 1 ? 'kraj' : 'krajów'}
              </div>
              <div className="mt-1 text-xs text-stone-500 truncate" title={routeSummary.uniqueCountries.join(', ')}>
                {routeSummary.uniqueCountries.join(' · ')}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: ETAPY PIELGRZYMKI I INTERAKTYWNA MAPA GOOGLE Z NAWIGACJĄ (DWA TRÓJKĄTY PĄTNICZE) */}
        <section id="etapy-i-mapa" className="space-y-8 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="text-xs font-medium text-emerald-900 mb-1">
                01. Geometria Szlaku Trójcy Świętej — Mapa Google z Nawigacją Pieszą (Etapy 1–6)
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
                Mały Trójkąt Polski (Etapy 1–3) i Wielki Trójkąt Kontynentalny (Etapy 4–6) na Mapie Google
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start">
              <div className="flex items-center gap-1 bg-stone-200/75 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMapViewTab('google')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    mapViewTab === 'google'
                      ? 'bg-emerald-900 text-white shadow-xs font-semibold'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Mapa Google z Nawigacją (Etapy 1–6)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapViewTab('schematic')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    mapViewTab === 'schematic'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Schemat Geometryczny Trójkątów
                </button>
              </div>

              {mapViewTab === 'schematic' && (
                <div className="flex items-center gap-1 bg-stone-200/75 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMapScope('poland')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      mapScope === 'poland'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Mały Trójkąt: Etapy 1–3
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapScope('continental')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      mapScope === 'continental'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Wielki Trójkąt: Etapy 4–6
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Google Map with Walking Navigation for All 6 Stages */}
          {mapViewTab === 'google' ? (
            <PilgrimageGoogleMap
              selectedDaySegment={googleMapDaySegment}
              onClearDaySegment={() => setGoogleMapDaySegment(null)}
              onSelectStageForSchedule={(stId) => {
                setSelectedStageTab(stId);
                setDayPage(1);
                const firstSeg = ALL_DAILY_SEGMENTS.find((s) => s.stageId === stId);
                if (firstSeg) setSelectedDayGlobalNum(firstSeg.globalDayNumber);
                document.getElementById('harmonogram-dni')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ) : (
            /* Interactive Schematic Cartographic Trail Map */
            <div className="bg-white border border-stone-200 rounded-xl p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="w-full lg:w-7/12 bg-[#F5F3EE] border border-stone-200 rounded-lg p-4">
                {mapScope === 'poland' ? (
                  <svg
                    viewBox="0 0 680 420"
                    className="w-full h-auto"
                    role="img"
                    aria-label="Mały Trójkąt Pątniczy Etapów 1–3: Kochłowice – Jasna Góra – Kraków-Łagiewniki – Kochłowice"
                  >
                    {/* Subtle Topographic Grid Lines */}
                    <g stroke="#E5E0D5" strokeWidth="1">
                      <line x1="0" y1="80" x2="680" y2="80" />
                      <line x1="0" y1="160" x2="680" y2="160" />
                      <line x1="0" y1="240" x2="680" y2="240" />
                      <line x1="0" y1="320" x2="680" y2="320" />
                      <line x1="140" y1="0" x2="140" y2="420" />
                      <line x1="300" y1="0" x2="300" y2="420" />
                      <line x1="460" y1="0" x2="460" y2="420" />
                    </g>

                    {/* Shaded Geometric Triangle Backdrop (Kochłowice - Jasna Góra - Kraków-Łagiewniki) */}
                    <polygon
                      points="155,285 265,65 555,325"
                      fill="#065F46"
                      fillOpacity="0.06"
                      stroke="#065F46"
                      strokeOpacity="0.3"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Center Triangle Emblem */}
                    <text
                      x="325"
                      y="235"
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-emerald-950/70 tracking-wider"
                    >
                      MAŁY TRÓJKĄT PĄTNICZY (ETAPY 1–3)
                    </text>
                    <text
                      x="325"
                      y="251"
                      textAnchor="middle"
                      className="text-[9.5px] font-mono fill-stone-500"
                    >
                      15 dni stałych · 362 km · odcinki ≤ 30 km
                    </text>

                    {/* Stage 1 (Side I of Triangle): Kochłowice -> Jasna Góra */}
                    <path
                      d="M 155 285 L 182 230 L 210 175 L 238 120 L 265 65"
                      fill="none"
                      stroke="#065F46"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Stage 2 (Side II of Triangle): Jasna Góra -> Jura -> Kraków-Łagiewniki */}
                    <path
                      d="M 265 65 L 315 110 L 360 150 L 405 190 L 445 226 L 485 262 L 520 294 L 555 325"
                      fill="none"
                      stroke="#B45309"
                      strokeWidth="4"
                      strokeDasharray="8 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Stage 3 (Side III of Triangle): Kraków-Łagiewniki -> Oświęcim -> Mikołów -> Kochłowice */}
                    <path
                      d="M 555 325 L 455 315 L 355 305 L 255 295 L 155 285"
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Key Nodes of the Polish Triangle */}
                    {[
                      { x: 155, y: 285, label: 'WIERZCHOŁEK I: KOCHŁOWICE', sub: 'Start 14.06 / Meta 29.06 (Kościół Trójcy Św.)', primary: true },
                      { x: 182, y: 230, label: 'Piekary Śl. / Świerklaniec', sub: 'Dzień 1 (25,4 km)', primary: false },
                      { x: 210, y: 175, label: 'Woźniki', sub: 'Dzień 2 (26,2 km)', primary: false },
                      { x: 238, y: 120, label: 'Poczesna', sub: 'Dzień 3 (24,8 km)', primary: false },
                      { x: 265, y: 65, label: 'WIERZCHOŁEK II: JASNA GÓRA', sub: 'Finał Etapu 1 · 17.06 (96 km)', primary: true },
                      { x: 315, y: 110, label: 'Złoty Potok', sub: 'Dzień 5 (26,8 km)', primary: false },
                      { x: 360, y: 150, label: 'Mirów / Kroczyce', sub: 'Dzień 6 (24,5 km)', primary: false },
                      { x: 405, y: 190, label: 'Ogrodzieniec / Pilica', sub: 'Dzień 7 (23,8 km)', primary: false },
                      { x: 445, y: 226, label: 'Pustynia Błędowska / Olkusz', sub: 'Dzień 8 · 21.06 (27,4 km)', primary: false },
                      { x: 485, y: 262, label: 'OJCÓW (Dzień Ojca · 23.06)', sub: 'Dzień 9–10 · Pobyt w OPN', primary: false },
                      { x: 520, y: 294, label: 'Opactwo w Tyńcu', sub: 'Dzień 10 (24,2 km)', primary: false },
                      { x: 555, y: 325, label: 'WIERZCHOŁEK III: KRAKÓW-ŁAGIEWNIKI', sub: 'Finał Etapu 2 · 25.06 (166 km)', primary: true },
                      { x: 455, y: 315, label: 'Spytkowice', sub: 'Dzień 12 (28,4 km)', primary: false },
                      { x: 355, y: 305, label: 'Oświęcim-Harmęże', sub: 'Dzień 13 (26,8 km)', primary: false },
                      { x: 255, y: 295, label: 'Bieruń / Mikołów', sub: 'Dzień 14 (25,9 km)', primary: false },
                    ].map((pt, idx) => (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={pt.primary ? 8 : 5}
                          fill={pt.primary ? '#065F46' : '#FFFFFF'}
                          stroke="#1C1917"
                          strokeWidth="2"
                        />
                        <text
                          x={pt.x + (pt.x > 460 ? -10 : 12)}
                          y={pt.y - 9}
                          textAnchor={pt.x > 460 ? 'end' : 'start'}
                          className={`${pt.primary ? 'font-bold text-[10.5px] fill-stone-900' : 'text-[9.5px] fill-stone-700'}`}
                        >
                          {pt.label}
                        </text>
                        <text
                          x={pt.x + (pt.x > 460 ? -10 : 12)}
                          y={pt.y + 4}
                          textAnchor={pt.x > 460 ? 'end' : 'start'}
                          className="text-[8.5px] fill-stone-500 font-mono"
                        >
                          {pt.sub}
                        </text>
                      </g>
                    ))}
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 680 420"
                    className="w-full h-auto"
                    role="img"
                    aria-label="Wielki Trójkąt Kontynentalny Etapów 4–6: Kochłowice – Santiago de Compostela – Watykan – Jerozolima – Kochłowice"
                  >
                    <g stroke="#E5E0D5" strokeWidth="1">
                      <line x1="0" y1="80" x2="680" y2="80" />
                      <line x1="0" y1="160" x2="680" y2="160" />
                      <line x1="0" y1="240" x2="680" y2="240" />
                      <line x1="0" y1="320" x2="680" y2="320" />
                      <line x1="170" y1="0" x2="170" y2="420" />
                      <line x1="340" y1="0" x2="340" y2="420" />
                      <line x1="510" y1="0" x2="510" y2="420" />
                    </g>

                    {/* Great Triangle Shaded Polygon (Homologous to the Polish Triangle of Stages 1-3!) */}
                    <polygon
                      points="285,62 75,325 595,345"
                      fill="#065F46"
                      fillOpacity="0.06"
                      stroke="#065F46"
                      strokeOpacity="0.32"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Embedded Miniature Polish Triangle (Stages 1-3) at the Kochłowice Apex */}
                    <polygon
                      points="285,62 302,30 328,65"
                      fill="#B45309"
                      fillOpacity="0.14"
                      stroke="#B45309"
                      strokeWidth="1.5"
                    />
                    <text
                      x="334"
                      y="46"
                      className="text-[8.5px] font-mono font-semibold fill-amber-900"
                    >
                      Mały Trójkąt E1–3 (15 dni)
                    </text>

                    {/* Center Triangle Emblem & Side Labels */}
                    <text
                      x="325"
                      y="232"
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-emerald-950/75 tracking-wider"
                    >
                      WIELKI TRÓJKĄT KONTYNENTALNY (ETAPY 4–6)
                    </text>
                    <text
                      x="325"
                      y="248"
                      textAnchor="middle"
                      className="text-[9.5px] font-mono fill-stone-500"
                    >
                      Bok I: Etap 4 (95 d.) · Bok II: Etap 5 (160 d.) · Bok III: Etap 6 (95 d.)
                    </text>
                    <text
                      x="325"
                      y="263"
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-emerald-900 font-semibold"
                    >
                      Razem z Trójkątem E1–3 (15 d.) = 365 Dni (Pełny Rok)
                    </text>

                    {/* Stage 4 (Side I of Great Triangle): Kochłowice -> Santiago de Compostela */}
                    <path
                      d="M 285 62 L 243 115 L 201 167 L 159 220 L 117 272 L 75 325"
                      fill="none"
                      stroke="#065F46"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Stage 5A (Side II of Great Triangle - West Half): Santiago -> Arles -> Siena -> Watykan */}
                    <path
                      d="M 75 325 L 155 328 L 235 331 L 315 334"
                      fill="none"
                      stroke="#B45309"
                      strokeWidth="4"
                      strokeDasharray="8 4"
                      strokeLinecap="round"
                    />

                    {/* Stage 5B (Side II of Great Triangle - East Half): Watykan -> Saloniki -> Antiochia -> Jerozolima */}
                    <path
                      d="M 315 334 L 408 338 L 502 341 L 595 345"
                      fill="none"
                      stroke="#991B1B"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Stage 6 (Side III of Great Triangle): Jerozolima -> Saloniki/Rila -> Budapeszt -> Kochłowice */}
                    <path
                      d="M 595 345 L 533 288 L 471 232 L 409 175 L 347 118 L 285 62"
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {[
                      {
                        x: 285,
                        y: 62,
                        label: 'WIERZCHOŁEK I: KOCHŁOWICE',
                        sub: 'Start E4 (30.06) / Meta E6 (14.06 · Dzień 365)',
                        major: true,
                        align: 'left',
                      },
                      {
                        x: 243,
                        y: 115,
                        label: 'Ołomuniec / Praga',
                        sub: 'Etap 4 (Bok I) · Czechy',
                        major: false,
                        align: 'left',
                      },
                      {
                        x: 201,
                        y: 167,
                        label: 'Ulm / Einsiedeln',
                        sub: 'Etap 4 (Bok I) · Niemcy / Szwajcaria',
                        major: false,
                        align: 'left',
                      },
                      {
                        x: 159,
                        y: 220,
                        label: 'Le Puy-en-Velay',
                        sub: 'Etap 4 (Bok I) · Via Podiensis',
                        major: false,
                        align: 'left',
                      },
                      {
                        x: 117,
                        y: 272,
                        label: 'St-Jean / Burgos',
                        sub: 'Etap 4 (Bok I) · Camino Francés',
                        major: false,
                        align: 'left',
                      },
                      {
                        x: 75,
                        y: 325,
                        label: 'WIERZCHOŁEK II: SANTIAGO DE COMPOSTELA',
                        sub: 'Meta Etapu 4 · Dzień 110 (02.10 · 3182 km)',
                        major: true,
                        align: 'bottom-left',
                      },
                      {
                        x: 195,
                        y: 330,
                        label: 'Arles / Siena',
                        sub: 'Etap 5A (Bok II) · Via Francigena',
                        major: false,
                        align: 'bottom',
                      },
                      {
                        x: 315,
                        y: 334,
                        label: 'WATYKAN (Rzym)',
                        sub: 'Środek Boku II · Dzień 180 (11.12)',
                        major: true,
                        align: 'bottom',
                      },
                      {
                        x: 455,
                        y: 340,
                        label: 'Lublana / Zagrzeb / Stambuł / Antiochia',
                        sub: 'Etap 5B (Bok II · Lądem) · Jakobova pot / Camino Croatia',
                        major: false,
                        align: 'bottom',
                      },
                      {
                        x: 595,
                        y: 345,
                        label: 'WIERZCHOŁEK III: JEROZOLIMA',
                        sub: 'Meta Etapu 5 · Dzień 270 (11.03 · 5305 km · Lądem)',
                        major: true,
                        align: 'right',
                      },
                      {
                        x: 533,
                        y: 288,
                        label: 'Antiochia / Kapadocja / Stambuł',
                        sub: 'Etap 6 (Bok III) · Korytarz Lądowy Anatolii',
                        major: false,
                        align: 'right',
                      },
                      {
                        x: 471,
                        y: 232,
                        label: 'Monastyr Rilski / Sofia',
                        sub: 'Etap 6 (Bok III) · Bułgaria (Via Diagonalis)',
                        major: false,
                        align: 'right',
                      },
                      {
                        x: 409,
                        y: 175,
                        label: 'Belgrad / Segedyn',
                        sub: 'Etap 6 (Bok III) · Wejście na Szlak z Muszlami',
                        major: false,
                        align: 'right',
                      },
                      {
                        x: 347,
                        y: 118,
                        label: 'Budapeszt / Ostrzyhom / Żylina',
                        sub: 'Etap 6 (Bok III) · Szent Jakab-út & Svätojakubská cesta',
                        major: false,
                        align: 'right',
                      },
                    ].map((node, i) => {
                      const isRight = node.align === 'right';
                      const isBottom = node.align === 'bottom';
                      const isBottomLeft = node.align === 'bottom-left';
                      const tx = isBottom ? node.x : isBottomLeft ? node.x - 10 : isRight ? node.x - 12 : node.x - 12;
                      const tyLabel = isBottom ? node.y + 18 : isBottomLeft ? node.y + 18 : node.y - 7;
                      const tySub = isBottom ? node.y + 30 : isBottomLeft ? node.y + 30 : node.y + 5;
                      const anchor = isBottom ? 'middle' : isBottomLeft ? 'start' : isRight ? 'end' : 'end';

                      return (
                        <g key={i}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.major ? 7.5 : 4.5}
                            fill={node.major ? '#065F46' : '#FFFFFF'}
                            stroke="#1C1917"
                            strokeWidth="2"
                          />
                          <text
                            x={node.x === 285 ? node.x - 12 : tx}
                            y={tyLabel}
                            textAnchor={node.x === 285 ? 'end' : anchor}
                            className={node.major ? 'font-bold text-[10px] fill-stone-900' : 'text-[9px] fill-stone-700'}
                          >
                            {node.label}
                          </text>
                          <text
                            x={node.x === 285 ? node.x - 12 : tx}
                            y={tySub}
                            textAnchor={node.x === 285 ? 'end' : anchor}
                            className="text-[8px] fill-stone-500 font-mono"
                          >
                            {node.sub}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>

              <div className="w-full lg:w-5/12 space-y-4">
                <h3 className="text-xl font-bold text-stone-900">
                  {mapScope === 'poland'
                    ? 'Mały Trójkąt Pątniczy (Etapy 1–3 · Szlaki z Muszlami św. Jakuba · 362 km)'
                    : 'Wielki Trójkąt Kontynentalny (Etapy 4–6 · 100% Drogą Lądową i Szlakami z Muszlami)'}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {mapScope === 'poland'
                    ? 'Pierwsze trzy etapy tworzą wzorcowy trójkąt lądowy prowadzący polskimi szlakami z muszlą św. Jakuba: Bok I biegnie Górnośląską i Jasnogórską Drogą św. Jakuba przez Piekary Śląskie i Sączów na Jasną Górę (Etap 1), Bok II wiedzie Jurajską Drogą św. Jakuba, przez Pustynię Błędowską (21.06) oraz głównym szlakiem Via Regia z Olkusza przez Ojców (Dzień Ojca 23.06) i Giebułtów do Łagiewnik (Etap 2), a Bok III wraca południową odnogą Via Regia przez Oświęcim i Bieruń Stary do Kochłowic (Etap 3).'
                    : 'Etapy 4, 5 i 6 tworzą Wielki Trójkąt Kontynentalny wytyczony w 100% drogą lądową (bez promów morskich!) i prowadzący szlakami z muszlą św. Jakuba tam, gdzie to możliwe: Bok I wiedzie lądem przez czeską Svatojakubską cestę, niemiecki Jakobsweg, szwajcarską Via Jacobi, francuską Via Podiensis (GR65) i Camino Francés do Santiago (Etap 4), Bok II biegnie przez Lourdes, Via Tolosana (GR653), Via Francigena do Watykanu, a dalej lądem wokół Adriatyku (Jakobova pot w Słowenii, Camino Croatia w Chorwacji), przez Bosfor i Antiochię do Jerozolimy (Etap 5), skąd Bok III wraca lądem przez Anatolię, Bałkany oraz Węgierską (Szent Jakab-út), Słowacką (Svätojakubská cesta) i Beskidzką Drogę św. Jakuba do Kochłowic (Etap 6).'}
                </p>
                <div className="pt-2 space-y-2 text-xs text-stone-600 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <span>Bok I Trójkąta (Etap 1 / Etap 4):</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-900">
                      Kochłowice → Jasna Góra (E1) / Santiago (E4)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bok II Trójkąta (Etap 2 / Etap 5):</span>
                    <span className="font-mono tabular-nums font-semibold text-amber-800">
                      Jasna Góra → Łagiewniki (E2) / Santiago → Watykan → Jerozolima (E5)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bok III Trójkąta (Etap 3 / Etap 6):</span>
                    <span className="font-mono tabular-nums font-semibold text-blue-800">
                      Łagiewniki → Kochłowic (E3) / Jerozolima → Kochłowic (E6)
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <span>Wspólny wierzchołek obu trójkątów:</span>
                    <span className="font-semibold text-stone-900">
                      Kościół Trójcy Świętej w Kochłowicach (365 dni)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 6 Stage Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILGRIMAGE_STAGES.map((stage) => {
              const startDt = formatUniversalDate(stage.startDayOffset);
              const endDt = formatUniversalDate(stage.endDayOffset);
              const isSelected = enabledStages.includes(stage.id);

              return (
                <article
                  key={stage.id}
                  className={`bg-white border rounded-xl p-6 flex flex-col justify-between transition-colors ${
                    isSelected ? 'border-stone-300' : 'border-stone-200 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-mono font-semibold text-emerald-900">{stage.code}</span>
                      <span className="font-mono tabular-nums">
                        {startDt.shortDate} – {endDt.shortDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 leading-snug">{stage.name}</h3>

                    <div className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5 font-mono tabular-nums">
                      <span>{stage.daysCount} dni</span>
                      <span aria-hidden="true">·</span>
                      <span>{stage.totalDistanceKm.toFixed(0)} km</span>
                      <span aria-hidden="true">·</span>
                      <span>śr. {stage.avgDailyKm.toFixed(1)} km/dz.</span>
                      <span aria-hidden="true">·</span>
                      <span>max {stage.maxDailyKm.toFixed(1)} km</span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">{stage.description}</p>

                    <div className="pt-2 space-y-1.5 text-xs text-stone-700 border-t border-stone-100">
                      <div>
                        <span className="font-semibold text-stone-900">Bagaż: </span>
                        <span>{stage.baggageSystem}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-900">Noclegi: </span>
                        <span>{stage.accommodationSystem}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStageTab(stage.id);
                        setDayPage(1);
                        const firstSeg = ALL_DAILY_SEGMENTS.find((s) => s.stageId === stage.id);
                        if (firstSeg) setSelectedDayGlobalNum(firstSeg.globalDayNumber);
                        document.getElementById('harmonogram-dni')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Zobacz dni etapu ({stage.daysCount})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStageEnabled(stage.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-stone-900 text-white hover:bg-stone-800'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected ? 'Włączony w planie' : 'Dodaj do planu'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: HARMONOGRAM DZIEŃ PO DNIU (365 DNI — KALENDARZ UNIWERSALNY) */}
        <section id="harmonogram-dni" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="text-xs font-medium text-emerald-900 mb-1">
                02. Rozpiska Piesza Dzień po Dniu (365 Dni · Kalendarz Uniwersalny bez Roku)
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
                Harmonogram Odcinków, Noclegów i Punktów Zaopatrzenia
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="pace-select" className="text-xs font-medium text-stone-600 whitespace-nowrap">
                Tempo marszu:
              </label>
              <select
                id="pace-select"
                value={walkingPaceKmh}
                onChange={(e) => setWalkingPaceKmh(parseFloat(e.target.value))}
                className="px-3 py-1.5 text-xs font-mono tabular-nums bg-white border border-stone-300 rounded-lg"
              >
                <option value={3.8}>3,8 km/h (Spokojne z postojami)</option>
                <option value={4.5}>4,5 km/h (Standardowe pątnicze)</option>
                <option value={5.2}>5,2 km/h (Żwawe trekkingowe)</option>
              </select>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setSelectedStageTab('all');
                  setDayPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedStageTab === 'all'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Wszystkie (365 dni)
              </button>
              {PILGRIMAGE_STAGES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedStageTab(st.id);
                    setDayPage(1);
                    const first = ALL_DAILY_SEGMENTS.find((d) => d.stageId === st.id);
                    if (first) setSelectedDayGlobalNum(first.globalDayNumber);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedStageTab === st.id
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Etap {st.id} ({st.daysCount} d.)
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={daySearchQuery}
                  onChange={(e) => {
                    setDaySearchQuery(e.target.value);
                    setDayPage(1);
                  }}
                  placeholder="Szukaj miasta, sanktuarium, kraju..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <select
                value={accommodationFilter}
                onChange={(e) => {
                  setAccommodationFilter(e.target.value);
                  setDayPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="all">Wszystkie typy noclegów</option>
                <option value="Dom Pielgrzyma">Dom Pielgrzyma</option>
                <option value="Parafia / Sala / Kwatery">Parafia / Sala / Kwatery</option>
                <option value="Klasztor / Opactwo">Klasztor / Opactwo</option>
                <option value="Albergue / Schronisko">Albergue / Schronisko</option>
                <option value="Hospicjum Chrześcijańskie">Hospicjum Chrześcijańskie</option>
              </select>
            </div>
          </div>

          {/* Master-Detail Split: High-Density Table + Day Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Table */}
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600">
                      <th className="py-3 px-3">Dzień</th>
                      <th className="py-3 px-3">Data (Uniwersalna)</th>
                      <th className="py-3 px-3">Odcinek (Start → Meta)</th>
                      <th className="py-3 px-3 text-right">Dystans</th>
                      <th className="py-3 px-3 text-right">Czas</th>
                      <th className="py-3 px-3 text-center">Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs">
                    {paginatedSegments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-stone-500">
                          Brak odcinków spełniających wybrane kryteria wyszukiwania.
                          <button
                            type="button"
                            onClick={() => {
                              setDaySearchQuery('');
                              setAccommodationFilter('all');
                              setSelectedStageTab('all');
                            }}
                            className="ml-2 text-emerald-900 underline font-semibold cursor-pointer"
                          >
                            Resetuj filtry
                          </button>
                        </td>
                      </tr>
                    ) : (
                      paginatedSegments.map((seg) => {
                        const dt = formatUniversalDate(seg.dayOffsetFromJune14);
                        const isSelected = seg.globalDayNumber === selectedDayGlobalNum;
                        const isPlanned = !!plannedDays[seg.globalDayNumber];
                        const walkHours = (seg.distanceKm / walkingPaceKmh).toFixed(1);

                        return (
                          <tr
                            key={seg.globalDayNumber}
                            onClick={() => setSelectedDayGlobalNum(seg.globalDayNumber)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-emerald-950/10 font-medium' : 'hover:bg-stone-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap text-stone-700">
                              Dz. {seg.globalDayNumber}
                              <span className="text-stone-400 ml-1">(E{seg.stageId}.{seg.stageDayNumber})</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap text-stone-600">
                              {dt.shortDate}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="text-stone-900 truncate max-w-[230px]">
                                {seg.fromTown.split(' (')[0]} → {seg.toTown.split(' (')[0]}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate max-w-[230px]">
                                {seg.country} · {seg.accommodationType}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-stone-900 whitespace-nowrap">
                              {seg.distanceKm.toFixed(1)} km
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-600 whitespace-nowrap">
                              {walkHours} h
                            </td>
                            <td
                              className="py-2.5 px-3 text-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlannedDays((prev) => ({
                                  ...prev,
                                  [seg.globalDayNumber]: !prev[seg.globalDayNumber],
                                }));
                              }}
                            >
                              <button
                                type="button"
                                aria-label={`Oznacz dzień ${seg.globalDayNumber} jako zaplanowany`}
                                className={`w-5 h-5 rounded inline-flex items-center justify-center cursor-pointer ${
                                  isPlanned
                                    ? 'bg-emerald-900 text-white'
                                    : 'border border-stone-300 text-transparent hover:border-stone-500'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <div className="font-mono tabular-nums">
                  Pokazano {paginatedSegments.length} z {filteredSegments.length} dni (strona {dayPage} z {totalPages})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={dayPage <= 1}
                    onClick={() => setDayPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-white border border-stone-300 rounded disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Poprzednie
                  </button>
                  <button
                    type="button"
                    disabled={dayPage >= totalPages}
                    onClick={() => setDayPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-white border border-stone-300 rounded disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Następne
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Detailed Inspector for Selected Day */}
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 space-y-5">
              {(() => {
                const dt = formatUniversalDate(selectedDayDetail.dayOffsetFromJune14);
                const walkHours = (selectedDayDetail.distanceKm / walkingPaceKmh).toFixed(1);

                return (
                  <>
                    <div className="border-b border-stone-200 pb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-500 font-mono tabular-nums">
                        <span>
                          DZIEŃ {selectedDayDetail.globalDayNumber} / 365 · ETAP {selectedDayDetail.stageId} (Dzień{' '}
                          {selectedDayDetail.stageDayNumber})
                        </span>
                        <span>
                          {dt.fullDate} ({dt.cycleNote})
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-stone-900 leading-snug">
                        {selectedDayDetail.fromTown} → {selectedDayDetail.toTown}
                      </h3>

                      {selectedDayDetail.dateNote && (
                        <div className="text-xs font-semibold text-amber-800">
                          {selectedDayDetail.dateNote}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono tabular-nums text-stone-700">
                        <span className="font-semibold text-emerald-900">
                          Dystans: {selectedDayDetail.distanceKm.toFixed(1)} km{' '}
                          {selectedDayDetail.stageId <= 3 ? '(≤ 30 km · Etap stały)' : '(Odcinek długodystansowy)'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Czas marszu: ~{walkHours} godz.</span>
                        <span aria-hidden="true">·</span>
                        <span>Przewyższenie: +{selectedDayDetail.elevationGainM} m</span>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGoogleMapDaySegment(selectedDayDetail);
                            setMapViewTab('google');
                            document.getElementById('etapy-i-mapa')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Nawiguj ten odcinek na Mapie Google</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <div>
                        <div className="font-semibold text-stone-900">Przebieg trasy i punkty pośrednie:</div>
                        <div className="text-stone-600 mt-0.5">
                          {selectedDayDetail.fromTown} → {selectedDayDetail.viaWaypoints.join(' → ')} →{' '}
                          {selectedDayDetail.toTown} ({selectedDayDetail.region}, {selectedDayDetail.country})
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-stone-900">Sanktuarium / Główny Zabytek na Odcinku:</div>
                        <div className="text-stone-700 mt-0.5">{selectedDayDetail.sanctuaryOrLandmark}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                        <div>
                          <div className="font-semibold text-stone-900">Baza Noclegowa:</div>
                          <div className="text-stone-600 mt-0.5">{selectedDayDetail.accommodationName}</div>
                          <div className="text-stone-500 font-mono tabular-nums mt-0.5">
                            Typ: {selectedDayDetail.accommodationType} · Koszt: {selectedDayDetail.estimatedCostPLN}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold text-stone-900">Transport Bagażu:</div>
                          <div className="text-stone-600 mt-0.5">{selectedDayDetail.baggageMode}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100">
                        <div className="font-semibold text-stone-900">Zaopatrzenie w wodę i posiłki:</div>
                        <div className="text-stone-600 mt-0.5">{selectedDayDetail.waterAndFoodPoints}</div>
                      </div>

                      <div className="pt-2 border-t border-stone-100">
                        <div className="font-semibold text-stone-900">Rytm dnia pątniczego:</div>
                        <div className="text-stone-600 mt-0.5">{selectedDayDetail.scheduleSummary}</div>
                      </div>
                    </div>

                    {/* Personal Pilgrim Note for this Day */}
                    <div className="pt-3 border-t border-stone-200 space-y-2">
                      <label
                        htmlFor="pilgrim-day-note"
                        className="block text-xs font-semibold text-stone-800"
                      >
                        Twoja notatka organizacyjna na Dzień {selectedDayDetail.globalDayNumber}:
                      </label>
                      <textarea
                        id="pilgrim-day-note"
                        rows={2}
                        value={pilgrimNotes[selectedDayDetail.globalDayNumber] || ''}
                        onChange={(e) =>
                          setPilgrimNotes((prev) => ({
                            ...prev,
                            [selectedDayDetail.globalDayNumber]: e.target.value,
                          }))
                        }
                        placeholder="Np. numer rezerwacji w Domu Pielgrzyma, intencja modlitewna, telefon do gospodarza..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800"
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </section>

        {/* SECTION 3: KLUCZOWE ATRAKCJE TURYSTYCZNE, ZABYTKI I MIEJSCA KULTU RELIGIJNEGO */}
        <section id="sanktuaria-i-zabytki" className="space-y-8 scroll-mt-20">
          <div className="border-b border-stone-200 pb-5 space-y-2">
            <div className="text-xs font-medium text-emerald-900">
              03. Przewodnik Pątniczo-Krajoznawczy (Postoje i Dni Wolne od Marszu)
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
                  Kluczowe Sanktuaria, Zabytki UNESCO i Atrakcje na Szlaku (Etapy 1–6)
                </h2>
                <p className="text-sm text-stone-600 mt-1 max-w-3xl">
                  Zestawienie najważniejszych miejsc kultu religijnego, zabytków architektury i krajobrazów wartych
                  odwiedzenia podczas 30–90 minutowych postojów na trasie, popołudniami po zakończeniu odcinka lub w
                  dni wolne od marszu — opracowane według wzorca pierwszych trzech etapów.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Strip for International Sanctuaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-5 bg-stone-900 min-h-[180px]">
                <img
                  src={CAMINO_IMAGE}
                  alt="Kamienny znak muszli św. Jakuba na szlaku do Santiago de Compostela"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs text-stone-500">Etap 4 · Dziedzictwo Europejskie</div>
                  <h3 className="text-base font-bold text-stone-900">
                    Od Kochłowic przez Ołomuniec, Einsiedeln i Le Puy do Santiago de Compostela
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Na trasie zachodniej pielgrzymi nawiedzają Kolumnę Trójcy Świętej w Ołomuńcu (UNESCO), Katedrę w
                    Ulm, Czarne Madonny w Einsiedeln i Le Puy-en-Velay, romańskie opactwo w Conques oraz Katedrę św.
                    Jakuba w Santiago.
                  </p>
                </div>
                <div className="pt-3 text-[11px] font-mono text-emerald-900">
                  Rekomendowane dni wolne: Ołomuniec · Einsiedeln · Le Puy · Burgos · Santiago
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-5 bg-stone-900 min-h-[180px]">
                <img
                  src={JERUSALEM_IMAGE}
                  alt="Droga pielgrzymkowa wśród gajów oliwnych prowadząca do murów Jerozolimy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs text-stone-500">Etapy 5 i 6 · Rzym, Ziemia Święta i Bałkany</div>
                  <h3 className="text-base font-bold text-stone-900">
                    Via Francigena do Watykanu, Szlak św. Pawła do Jerozolimy i Powrót przez Mária Út
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Kulminacją szlaku są Bazylika św. Piotra na Watykanie, Monte Cassino, Dom Matki Bożej w Efezie,
                    Nazaret, Betlejem i Bazylika Grobu Pańskiego w Jerozolimie, a w drodze powrotnej Monastyr Rilski i
                    Ostrzyhom.
                  </p>
                </div>
                <div className="pt-3 text-[11px] font-mono text-emerald-900">
                  Rekomendowane dni wolne: Siena · Watykan · Monte Cassino · Efez · Jerozolima · Rila
                </div>
              </div>
            </div>
          </div>

          {/* Attractions Filter Bar */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setAttractionStageFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  attractionStageFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Wszystkie Etapy ({TRAIL_ATTRACTIONS.length})
              </button>
              {[1, 2, 3, 4, 5, 6].map((stId) => (
                <button
                  key={stId}
                  type="button"
                  onClick={() => setAttractionStageFilter(stId)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    attractionStageFilter === stId
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Etap {stId}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={attractionCategoryFilter}
                onChange={(e) => setAttractionCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="all">Wszystkie kategorie obiektów</option>
                <option value="Sanktuarium i Kult">Sanktuarium i Kult Religijny</option>
                <option value="Zabytek Architektury / UNESCO">Zabytek Architektury / UNESCO</option>
                <option value="Przyroda i Krajobraz">Przyroda i Krajobraz</option>
              </select>

              <select
                value={attractionStopFilter}
                onChange={(e) => setAttractionStopFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="all">Wszystkie rodzaje wizyty</option>
                <option value="Postój na trasie (30–90 min)">Postój na trasie (30–90 min)</option>
                <option value="Popołudnie po etapie">Popołudnie po etapie</option>
                <option value="Dzień wolny / Skupienia">Dzień wolny / Skupienia</option>
              </select>
            </div>
          </div>

          {/* Attractions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAttractions.map((att: TrailAttraction) => (
              <article
                key={att.id}
                className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="font-mono font-semibold text-emerald-900">{att.stageCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{att.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-stone-700">{att.stopType}</span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 leading-snug">{att.name}</h3>

                  <div className="text-xs text-stone-500">
                    Lokalizacja: <strong className="text-stone-800">{att.location}</strong> ({att.country}) ·{' '}
                    {att.dayReference}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">{att.description}</p>

                  <div className="pt-2 space-y-1.5">
                    <div className="text-xs font-semibold text-stone-900">
                      Kluczowe miejsca warte zobaczenia podczas postoju / dnia wolnego:
                    </div>
                    <ul className="space-y-1 text-xs text-stone-600 list-disc pl-4">
                      {att.mustSeeHighlights.map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 text-xs text-stone-600">
                  <span className="font-semibold text-stone-900">Wskazówka dla pielgrzyma: </span>
                  <span>{att.pilgrimPracticalTip}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 4: KOMPLEKSOWA LISTA REKOMENDOWANEGO EKWIPUNKU I KALKULATOR WAGI */}
        <section id="ekwipunek-i-bagaz" className="space-y-8 scroll-mt-20">
          <div className="border-b border-stone-200 pb-5 space-y-2">
            <div className="text-xs font-medium text-emerald-900">
              04. Ekwipunek Wielomiesięczny (Czerwiec – Kolejne Miesiące) i Kalkulator Ergonomii
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Kompleksowa Lista Rekomendowanego Ekwipunku Pielgrzyma
            </h2>
            <p className="text-sm text-stone-600 max-w-3xl">
              Zestawienie opracowane dla wielomiesięcznej pieszej pielgrzymki z Kochłowic przez Santiago de Compostela i
              Watykan do Jerozolimy oraz z powrotem. Uwzględnia start 14 czerwca, letnie upały, jesienne wiatry w
              Pirenejach, zimę śródziemnomorską i wiosnę w Ziemi Świętej.
            </p>
          </div>

          {/* Top Split: Backpack Calculator & Gear Photography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Kalkulator Wagi Plecaka (Zasada 10% Masy Ciała)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Na długodystansowych szlakach pieszych waga plecaka (bez wody i bieżącego jedzenia) nie powinna
                    przekraczać 10% wagi ciała pątnika.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor="body-weight-input" className="text-xs font-semibold text-stone-700">
                    Twoja waga (kg):
                  </label>
                  <input
                    id="body-weight-input"
                    type="number"
                    min={40}
                    max={150}
                    value={bodyWeightKg}
                    onChange={(e) => setBodyWeightKg(Math.max(40, parseInt(e.target.value, 10) || 70))}
                    className="w-20 px-2.5 py-1.5 text-sm font-mono tabular-nums font-bold bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <div className="text-xs text-stone-500">Waga w plecaku na plecach</div>
                  <div
                    className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
                      weightStats.isWithinLimit ? 'text-emerald-900' : 'text-amber-700'
                    }`}
                  >
                    {weightStats.backpackKg} kg
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500 font-mono tabular-nums">
                    Rekomendowany limit: ≤ {weightStats.recommendedMaxKg} kg
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <div className="text-xs text-stone-500">Bagaż w busie (E1–3) / Depozyt (E4–6)</div>
                  <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-stone-900">
                    {weightStats.vanOrDepositKg} kg
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    Limit busa parafialnego: 15,0 kg
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <div className="text-xs text-stone-500">Na sobie podczas marszu</div>
                  <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-stone-900">
                    {weightStats.wornKg} kg
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    Obuwie główne i strój dzienny
                  </div>
                </div>
              </div>

              <div className="text-xs text-stone-600 flex items-center justify-between pt-2 border-t border-stone-100">
                <span>
                  Status obciążenia kręgosłupa i stawów:{' '}
                  <strong className={weightStats.isWithinLimit ? 'text-emerald-900' : 'text-amber-800'}>
                    {weightStats.isWithinLimit
                      ? 'Optymalna waga pątnicza (poniżej 10% masy ciała)'
                      : 'Przekroczony próg 10% — rozważ przeniesienie części rzeczy do depozytu / busa'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col">
              <div className="h-48 bg-stone-900">
                <img
                  src={GEAR_IMAGE}
                  alt="Zestaw ekwipunku pieszego pielgrzyma: plecak, buty trekkingowe, laska i paszport pielgrzyma"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-stone-500">Zasada Trzech Zestawów</div>
                  <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                    Minimalizm w Drodze Wielomiesięcznej
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Niezależnie czy idziesz 15 dni (stałe Etapy 1–3) czy pełny rok 365 dni (Etapy 1–6), zabierasz tylko
                    3 zestawy bielizny i skarpet merino: jeden masz na sobie, drugi schnie po praniu, trzeci stanowi
                    suchą rezerwę w worku wodoszczelnym.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-200/70 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setEquipmentCategoryFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                equipmentCategoryFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Wszystkie kategorie ({COMPREHENSIVE_EQUIPMENT_LIST.length})
            </button>
            {equipmentCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setEquipmentCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  equipmentCategoryFilter === cat
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Equipment Table with Interactive Placement Toggles */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600">
                    <th className="py-3 px-4">Element ekwipunku i specyfikacja techniczna</th>
                    <th className="py-3 px-4">Kategoria i Sezonowość</th>
                    <th className="py-3 px-4">Uzasadnienie pątnicze (Kochłowice → Jerozolima)</th>
                    <th className="py-3 px-4 text-right">Waga</th>
                    <th className="py-3 px-4 text-center">Sposób niesienia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {filteredEquipment.map((item: ComprehensiveGearItem) => {
                    const currentMode = gearPlacements[item.id] || item.defaultCarryMode;
                    return (
                      <tr key={item.id} className="hover:bg-stone-50/80">
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-stone-900">{item.name}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                            {item.specification}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-stone-800">{item.category}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">{item.seasonality}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-sm text-stone-600 leading-relaxed">
                          {item.pilgrimRationale}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-stone-900 whitespace-nowrap">
                          {item.weightGrams} g
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1 bg-stone-100 p-1 rounded-lg">
                            {(
                              [
                                { id: 'backpack', label: 'Plecak' },
                                { id: 'van_or_deposit', label: 'Bus/Depozyt' },
                                { id: 'worn', label: 'Na sobie' },
                                { id: 'none', label: 'Pomiń' },
                              ] as const
                            ).map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setGearPlacements((prev) => ({
                                    ...prev,
                                    [item.id]: opt.id,
                                  }))
                                }
                                className={`px-2 py-1 text-[11px] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                  currentMode === opt.id
                                    ? 'bg-emerald-900 text-white font-semibold'
                                    : 'text-stone-600 hover:text-stone-900'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seasonal Adaptation Matrix (June -> Next Year) */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">
              Strategia Sezonowa i Klimatyczna (Od 14 czerwca przez 4 pory roku)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {SEASONAL_STRATEGIES.map((st, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-2 text-xs">
                  <div className="font-mono font-semibold text-emerald-900">{st.months}</div>
                  <div className="font-bold text-stone-900">{st.phase}</div>
                  <div className="text-[11px] text-stone-500 font-mono tabular-nums">
                    Temp.: {st.temperatureRange}
                  </div>
                  <p className="text-stone-600 leading-relaxed">{st.stagesAndRegions}</p>
                  <div className="pt-2 border-t border-stone-200 text-stone-700">
                    <span className="font-semibold">Logistyka: </span>
                    {st.gearAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: NOCLEGI, LOGISTYKA BAGAŻU I ORGANIZACJA */}
        <section id="organizacja-i-noclegi" className="space-y-8 scroll-mt-20">
          <div className="border-b border-stone-200 pb-5 space-y-2">
            <div className="text-xs font-medium text-emerald-900">
              05. Informator Organizacyjny Pielgrzymki
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Zasady Noclegów, Przewóz Bagażu i Dokumenty Pątnicze
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <Backpack className="w-4 h-4" />
                <span>Logistyka Bagażu (Etapy 1–3 vs 4–6)</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Wóz Bagażowy z Kochłowic i System Pątniczy
              </h3>
              <ul className="space-y-2 text-xs text-stone-600 leading-relaxed list-disc pl-4">
                <li>
                  <strong>Etapy 1–3 (14–29 czerwca, Polska):</strong> Bagaż główny (do 15 kg: śpiwór, karimata, odzież
                  zapasowa) zdajemy codziennie o godz. 6:15 do busa parafialnego. Na trasę zabieramy wyłącznie lekki
                  plecak podręczny (woda, peleryna, leki stałe, dokumenty, posiłek).
                </li>
                <li>
                  <strong>Oznaczenie bagażu:</strong> Przy zapisach w parafii Trójcy Świętej w Kochłowicach każdy
                  uczestnik otrzymuje wodoodporny identyfikator i wstążkę odpowiedniego etapu.
                </li>
                <li>
                  <strong>Etapy 4–6 (Szlak międzynarodowy):</strong> Marsz z jednym plecakiem 36–42 l (do 8 kg). Na
                  trudniejszych odcinkach górskich (Pireneje, Alpy) możliwość skorzystania z transportu kurierskiego{' '}
                  <em>Paq Mochila</em> (Correos) oraz paczek depozytowych <em>Poste Restante</em> w Rzymie i Bari.
                </li>
              </ul>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <Home className="w-4 h-4" />
                <span>System Noclegowy na Szlaku</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Domy Pielgrzyma, Klasztory i Albergues
              </h3>
              <ul className="space-y-2 text-xs text-stone-600 leading-relaxed list-disc pl-4">
                <li>
                  <strong>Etap 1 (Śląsk → Jasna Góra):</strong> Noclegi zbiorowe w salkach parafialnych i szkołach
                  (Świerklaniec, Woźniki, Poczesna) oraz w Domu Pielgrzyma im. Jana Pawła II na Jasnej Górze.
                </li>
                <li>
                  <strong>Etap 2 i 3 (Jura → Pustynia Błędowska → Ojców → Łagiewniki → Kochłowice):</strong> Schroniska
                  jurajskie, Klasztor Franciszkanów w Pilicy, baza w Olkuszu po przejściu Pustyni Błędowskiej, PTTK
                  „Zosia” i kwatery w Ojcowie (pobyt w Dzień Ojca 23 czerwca), Opactwo w Tyńcu, Dom Duszpasterski w
                  Łagiewnikach i Franciszkanie w Harmężach.
                </li>
                <li>
                  <strong>Etapy 4–6 (Europa i Ziemia Święta):</strong> Sieć <em>Albergues de Peregrinos</em> w
                  Hiszpanii, <em>Gîtes d’étape</em> we Francji, <em>Ospitali</em> na Via Francigena we Włoszech oraz
                  domy zakonne i hospicja chrześcijańskie (Casa Nova) w Ziemi Świętej.
                </li>
              </ul>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <FileText className="w-4 h-4" />
                <span>Paszport Pielgrzyma i Bezpieczeństwo</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Credencial, Pieczęcie i Certyfikaty
              </h3>
              <ul className="space-y-2 text-xs text-stone-600 leading-relaxed list-disc pl-4">
                <li>
                  <strong>Pierwsza pieczęć w Kochłowicach:</strong> 14 czerwca w Kościele Trójcy Świętej obok
                  Sanktuarium MB z Lourdes wydawany jest oficjalny <em>Credencial del Peregrino</em>.
                </li>
                <li>
                  <strong>Dwie pieczęcie dziennie:</strong> Aby uzyskać certyfikaty pątnicze (<em>Compostela</em> w
                  Santiago, <em>Testimonium</em> w Watykanie i dyplom Kustodii w Jerozolimie), należy zbierać min. 2
                  pieczęcie dziennie (w parafiach, klasztorach lub punktach na szlaku).
                </li>
                <li>
                  <strong>Zabezpieczenie medyczne:</strong> Na Etapach 1–3 grupie towarzyszy wykwalifikowana służba
                  maltańska / medyczna oraz samochód techniczny zbierający osoby osłabione.
                </li>
              </ul>
            </div>
          </div>

          {/* DETAILED ACCOMMODATION DIRECTORY TABLE (ETAPY 1-6) */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  Szczegółowy Katalog i Plan Noclegów (Kochłowice → Santiago → Watykan → Jerozolima → Kochłowice)
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Konkretne ośrodki noclegowe (parafie, domy pielgrzyma, klasztory, albergues i hospicja Casa Nova)
                  rozplanowane w rocznym cyklu 365 dni (Etapy 1–3 do 30 km/dzień, Etapy 4–6 wydłużone powyżej 30 km/dzień)
                  wraz z adresami, telefonami kontaktowymi i orientacyjnymi cenami.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setAccDirectoryStageFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    accDirectoryStageFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Wszystkie ({ACCOMMODATION_DIRECTORY.length})
                </button>
                {[1, 2, 3, 4, 5, 6].map((stId) => (
                  <button
                    key={stId}
                    type="button"
                    onClick={() => setAccDirectoryStageFilter(stId)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      accDirectoryStageFilter === stId
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Etap {stId}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600">
                    <th className="py-3 px-3">Etap / Dzień i Dystans</th>
                    <th className="py-3 px-3">Miejscowość</th>
                    <th className="py-3 px-3">Główne Miejsce Noclegowe i Adres</th>
                    <th className="py-3 px-3">Kontakt i Rezerwacja</th>
                    <th className="py-3 px-3">Przybliżona Cena i Opcja Alternatywna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {ACCOMMODATION_DIRECTORY.filter(
                    (f) => accDirectoryStageFilter === 'all' || f.stageId === accDirectoryStageFilter
                  ).map((fac: AccommodationFacility) => (
                    <tr key={fac.id} className="hover:bg-stone-50/80 align-top">
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-emerald-900">{fac.dayOrSection}</div>
                        <div className="text-[11px] text-stone-500 font-mono tabular-nums mt-0.5">
                          Odcinek: {fac.segmentDistanceKm}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{fac.facilityType}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <div className="font-bold text-stone-900">{fac.town}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{fac.country}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-bold text-stone-900">{fac.facilityName}</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">{fac.address}</div>
                        <div className="text-[11px] text-stone-500 mt-1">{fac.bookingAndCheckInRules}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-[220px] font-mono text-[11px] text-stone-700 leading-relaxed">
                        {fac.contactInfo}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-semibold text-stone-900 font-mono tabular-nums">
                          {fac.approximatePrice}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1">
                          <span className="font-semibold text-stone-700">Alternatywa: </span>
                          {fac.alternativeOption}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="bg-white border-t border-stone-200 px-6 lg:px-12 py-8 mt-16">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-bold text-stone-900 font-serif-display">Via Trinitatis</span> · Planer Pieszej
            Pielgrzymki z Rudy Śląskiej – Kochłowic (Kościół Trójcy Świętej i Sanktuarium Matki Bożej z Lourdes)
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Start coroczny: 14 czerwca</span>
            <span aria-hidden="true">·</span>
            <span>Jasna Góra · Kraków-Łagiewniki · Santiago · Watykan · Jerozolima</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
