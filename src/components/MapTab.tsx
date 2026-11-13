import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ChevronDown,
  ChevronUp,
  Church,
  Crosshair,
  Droplets,
  Home,
  Loader2,
  Navigation,
  Pill,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';
import { PHASES } from '../data/expeditionRoute';
import { CustomTrack, ElevationPoint, StageDay } from '../types/expedition';
import { fetchOverpassPois, PilgrimPoi, PoiCategory } from '../utils/geoAndApi';
import { parseGpxOrGeoJson } from '../utils/gpxParser';

interface MapTabProps {
  stages: StageDay[];
  currentDayNumber: number;
  customTracks: Record<number, CustomTrack>;
  onSaveCustomTrack: (track: CustomTrack) => void;
  onRemoveCustomTrack: (dayNumber: number) => void;
}

const POI_META: Record<PoiCategory, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  water: { label: 'Woda pitna', color: '#0284c7', icon: Droplets },
  shelter: { label: 'Noclegi', color: '#1e3a8a', icon: Home },
  church: { label: 'Kościoły', color: '#ca8a04', icon: Church },
  pharmacy: { label: 'Apteki', color: '#dc2626', icon: Pill },
  shop: { label: 'Sklepy', color: '#16a34a', icon: ShoppingBag },
};

const KEY_SANCTUARIES: Array<{ name: string; sub: string; coords: [number, number] }> = [
  { name: 'Kochłowice (Trójca Święta)', sub: 'Start · Pętla Polska · Wielki Finał', coords: [50.2547, 18.8936] },
  { name: 'Częstochowa – Jasna Góra', sub: 'Faza I · 18.06 (Dzień 5)', coords: [50.8125, 19.0972] },
  { name: 'Pustynia Błędowska', sub: 'Faza I · 21.06 Przesilenie', coords: [50.3439, 19.5150] },
  { name: 'Ojców (Dolina Prądnika)', sub: 'Faza I · 23.06 Dzień Ojca', coords: [50.2108, 19.8286] },
  { name: 'Kraków – Łagiewniki', sub: 'Faza I · 25.06 (Dzień 12)', coords: [50.0203, 19.9369] },
  { name: 'Piekary Śląskie', sub: 'Faza II · Dzień 15', coords: [50.3806, 18.9478] },
  { name: 'Santiago de Compostela', sub: 'Koniec Fazy II · Dzień 135', coords: [42.8806, -8.5444] },
  { name: 'Watykan – Plac św. Piotra', sub: 'Koniec Fazy III · Dzień 225', coords: [41.9022, 12.4539] },
  { name: 'Jerozolima', sub: 'Koniec Fazy IV · Dzień 290', coords: [31.7785, 35.2296] },
];

export const MapTab: React.FC<MapTabProps> = ({
  stages,
  currentDayNumber,
  customTracks,
  onSaveCustomTrack,
  onRemoveCustomTrack,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const customTrackLayerRef = useRef<L.LayerGroup | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const gpsMarkerRef = useRef<L.CircleMarker | null>(null);

  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<[number, number] | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [simProgressPct, setSimProgressPct] = useState<number>(42);

  const [activePoiCategories, setActivePoiCategories] = useState<PoiCategory[]>(['water', 'shelter']);
  const [pois, setPois] = useState<PilgrimPoi[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);
  const [poiStatusMsg, setPoiStatusMsg] = useState<string | null>(null);

  const [elevationExpanded, setElevationExpanded] = useState(true);
  const [selectedEleIdx, setSelectedEleIdx] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentStage = useMemo(
    () => stages.find((s) => s.dayNumber === currentDayNumber) ?? stages[0],
    [stages, currentDayNumber]
  );

  const activeCustomTrack = customTracks[currentDayNumber];
  const activeProfile: ElevationPoint[] = useMemo(
    () => (activeCustomTrack ? activeCustomTrack.elevationProfile : currentStage.elevationProfile),
    [activeCustomTrack, currentStage]
  );

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: currentStage.toCoords,
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    customTrackLayerRef.current = L.layerGroup().addTo(map);
    poiLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw all 5 phases + sanctuaries + current stage highlight
  useEffect(() => {
    const layer = routeLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    for (const phase of PHASES) {
      const phaseStages = stages.filter((s) => s.phaseId === phase.id);
      const pts: Array<[number, number]> = [];
      phaseStages.forEach((s, idx) => {
        if (idx === 0) pts.push(s.fromCoords);
        pts.push(s.toCoords);
      });

      if (pts.length >= 2) {
        L.polyline(pts, {
          color: phase.accentColor,
          weight: 4,
          opacity: 0.78,
        }).addTo(layer);
      }
    }

    // Highlight current day stage
    L.polyline([currentStage.fromCoords, currentStage.toCoords], {
      color: '#eab308',
      weight: 7,
      opacity: 0.95,
    }).addTo(layer);

    // Key Sanctuary markers
    for (const s of KEY_SANCTUARIES) {
      L.circleMarker(s.coords, {
        radius: 7,
        fillColor: '#1e3a8a',
        color: '#eab308',
        weight: 2.5,
        fillOpacity: 1,
      })
        .bindPopup(`<div style="font-family:sans-serif"><strong>${s.name}</strong><br/><span style="font-size:12px;color:#475569">${s.sub}</span></div>`)
        .addTo(layer);
    }
  }, [stages, currentStage]);

  // Draw uploaded GPX/GeoJSON custom track
  useEffect(() => {
    const layer = customTrackLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;

    layer.clearLayers();
    if (activeCustomTrack && activeCustomTrack.coords.length >= 2) {
      const poly = L.polyline(activeCustomTrack.coords, {
        color: '#dc2626',
        weight: 5,
        opacity: 0.92,
      }).addTo(layer);
      map.fitBounds(poly.getBounds(), { padding: [36, 36] });
    }
  }, [activeCustomTrack]);

  // Real GPS Geolocation watcher
  useEffect(() => {
    if (!gpsEnabled) return;
    if (!('geolocation' in navigator)) {
      setGpsError('Przeglądarka nie obsługuje modułu GPS.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(null);
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setGpsCoords(coords);
      },
      (err) => {
        setGpsError(`GPS niedostępny (${err.message}). Możesz użyć pozycji na etapie.`);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [gpsEnabled]);

  // Simulated or real GPS marker on map
  const effectiveGpsCoords: [number, number] = useMemo(() => {
    if (gpsEnabled && gpsCoords) return gpsCoords;
    const t = simProgressPct / 100;
    return [
      currentStage.fromCoords[0] + (currentStage.toCoords[0] - currentStage.fromCoords[0]) * t,
      currentStage.fromCoords[1] + (currentStage.toCoords[1] - currentStage.fromCoords[1]) * t,
    ];
  }, [gpsEnabled, gpsCoords, simProgressPct, currentStage]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (gpsMarkerRef.current) {
      gpsMarkerRef.current.setLatLng(effectiveGpsCoords);
    } else {
      gpsMarkerRef.current = L.circleMarker(effectiveGpsCoords, {
        radius: 9,
        fillColor: '#2563eb',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      })
        .bindPopup('Twoja aktualna pozycja na szlaku')
        .addTo(map);
    }
  }, [effectiveGpsCoords]);

  // Render Overpass POIs on map
  useEffect(() => {
    const layer = poiLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    for (const poi of pois) {
      if (!activePoiCategories.includes(poi.category)) continue;
      const meta = POI_META[poi.category];
      L.circleMarker([poi.lat, poi.lng], {
        radius: 6,
        fillColor: meta.color,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95,
      })
        .bindPopup(
          `<div style="font-family:sans-serif"><strong>${poi.name}</strong><br/><span style="font-size:11px;color:#475569">${meta.label}${poi.detail ? ` · ${poi.detail}` : ''}</span></div>`
        )
        .addTo(layer);
    }
  }, [pois, activePoiCategories]);

  const handleLoadPois = async () => {
    const map = mapRef.current;
    const center = map ? map.getCenter() : L.latLng(effectiveGpsCoords[0], effectiveGpsCoords[1]);
    setLoadingPois(true);
    setPoiStatusMsg(null);
    const res = await fetchOverpassPois(center.lat, center.lng, activePoiCategories, 3500);
    setLoadingPois(false);
    if (res.error) {
      setPoiStatusMsg(`Overpass API: ${res.error}`);
    } else {
      setPois(res.pois);
      setPoiStatusMsg(`Znaleziono ${res.pois.length} punktów POI w promieniu 3.5 km.`);
    }
  };

  const toggleCategory = (cat: PoiCategory) => {
    setActivePoiCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleUploadTrack = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const text = await file.text();
      const parsed = parseGpxOrGeoJson(text, file.name, currentDayNumber);
      onSaveCustomTrack(parsed);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Nie udało się wczytać śladu.');
    }
    e.target.value = '';
  };

  const focusTodayStage = () => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds([currentStage.fromCoords, currentStage.toCoords], { padding: [50, 50] });
  };

  const focusFullEurope = () => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([44.5, 12.0], 4);
  };

  // SVG Elevation Chart geometry
  const eleStats = useMemo(() => {
    const minEle = Math.min(...activeProfile.map((p) => p.ele));
    const maxEle = Math.max(...activeProfile.map((p) => p.ele));
    const rangeEle = Math.max(20, maxEle - minEle);
    const maxKm = Math.max(0.1, activeProfile[activeProfile.length - 1]?.km ?? currentStage.plannedKm);
    return { minEle, maxEle, rangeEle, maxKm };
  }, [activeProfile, currentStage.plannedKm]);

  const svgWidth = 600;
  const svgHeight = 110;
  const padX = 12;
  const padY = 14;

  const polylinePoints = useMemo(() => {
    return activeProfile
      .map((pt) => {
        const x = padX + (pt.km / eleStats.maxKm) * (svgWidth - padX * 2);
        const y = svgHeight - padY - ((pt.ele - eleStats.minEle) / eleStats.rangeEle) * (svgHeight - padY * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [activeProfile, eleStats]);

  const areaPoints = useMemo(() => {
    if (!polylinePoints) return '';
    return `${padX},${svgHeight - padY} ${polylinePoints} ${svgWidth - padX},${svgHeight - padY}`;
  }, [polylinePoints]);

  const userMarkerPos = useMemo(() => {
    const t = simProgressPct / 100;
    const x = padX + t * (svgWidth - padX * 2);
    const idx = Math.min(activeProfile.length - 1, Math.round(t * (activeProfile.length - 1)));
    const pt = activeProfile[idx] ?? { km: 0, ele: eleStats.minEle };
    const y = svgHeight - padY - ((pt.ele - eleStats.minEle) / eleStats.rangeEle) * (svgHeight - padY * 2);
    return { x, y, pt };
  }, [simProgressPct, activeProfile, eleStats]);

  return (
    <div className="space-y-4 pb-6">
      {/* Top Map Controls Bar */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-blue-900 dark:text-amber-400">
              Dzień {currentDayNumber} · {currentStage.fromName} → {currentStage.toName}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono-tabular">
              {activeCustomTrack
                ? `Wgrany ślad: ${activeCustomTrack.fileName} (${activeCustomTrack.totalKm} km, +${activeCustomTrack.gainM}m)`
                : `Plan etapu: ${currentStage.plannedKm} km · +${currentStage.elevationGainM}m / -${currentStage.elevationLossM}m`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={focusTodayStage}
              className="min-h-[42px] px-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Dzisiejszy etap</span>
            </button>

            <button
              type="button"
              onClick={focusFullEurope}
              className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cała trasa 365
            </button>

            <button
              type="button"
              onClick={() => {
                setGpsEnabled((v) => !v);
                if (!gpsEnabled && mapRef.current) {
                  mapRef.current.setView(effectiveGpsCoords, 13);
                }
              }}
              className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                gpsEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{gpsEnabled ? 'GPS Aktywny' : 'Włącz GPS'}</span>
            </button>

            <label className="min-h-[42px] px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Wgraj GPX/GeoJSON</span>
              <input
                type="file"
                accept=".gpx,.geojson,.json"
                onChange={handleUploadTrack}
                className="hidden"
              />
            </label>

            {activeCustomTrack && (
              <button
                type="button"
                onClick={() => onRemoveCustomTrack(currentDayNumber)}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Usuń wgrany ślad"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Usuń ślad</span>
              </button>
            )}
          </div>
        </div>

        {/* Overpass POI Quick Filters */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {(Object.keys(POI_META) as PoiCategory[]).map((cat) => {
            const meta = POI_META[cat];
            const Icon = meta.icon;
            const active = activePoiCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-900 text-white border-blue-900 dark:bg-amber-400 dark:text-slate-950 dark:border-amber-400'
                    : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{meta.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleLoadPois}
            disabled={loadingPois || activePoiCategories.length === 0}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ml-auto"
          >
            {loadingPois ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{loadingPois ? 'Pobieram POI...' : 'Szukaj POI (Overpass)'}</span>
          </button>
        </div>

        {(gpsError || poiStatusMsg || uploadError) && (
          <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-3">
            {gpsError && <span className="text-amber-700 dark:text-amber-400">{gpsError}</span>}
            {poiStatusMsg && <span>{poiStatusMsg}</span>}
            {uploadError && <span className="text-rose-600 dark:text-rose-400">{uploadError}</span>}
          </div>
        )}
      </section>

      {/* INTERACTIVE LEAFLET MAP */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-200 dark:bg-slate-800">
        <div ref={mapContainerRef} className="w-full h-[360px] sm:h-[440px] lg:h-[500px]" />
      </section>

      {/* COLLAPSIBLE INTERACTIVE ELEVATION PROFILE DRAWER */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setElevationExpanded((v) => !v)}
          className="w-full min-h-[52px] px-5 py-3 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Profil wysokościowy etapu · {activeCustomTrack ? activeCustomTrack.fileName : `Dzień ${currentDayNumber}`}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
              Min {eleStats.minEle} m n.p.m. · Max {eleStats.maxEle} m n.p.m. · Pozycja na trasie: {userMarkerPos.pt.km} km ({userMarkerPos.pt.ele} m n.p.m.)
            </div>
          </div>
          {elevationExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
          ) : (
            <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
          )}
        </button>

        {elevationExpanded && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-36 sm:h-44 overflow-visible"
                role="img"
                aria-label="Profil wysokościowy etapu"
              >
                <defs>
                  <linearGradient id="eleFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid baselines */}
                <line x1={padX} y1={svgHeight - padY} x2={svgWidth - padX} y2={svgHeight - padY} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
                <line x1={padX} y1={padY} x2={svgWidth - padX} y2={padY} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="3 3" strokeWidth="1" />

                {/* Area & Profile line */}
                {areaPoints && <polygon points={areaPoints} fill="url(#eleFill)" />}
                {polylinePoints && (
                  <polyline
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={polylinePoints}
                  />
                )}

                {/* Interactive sample hit points */}
                {activeProfile.map((pt, i) => {
                  const x = padX + (pt.km / eleStats.maxKm) * (svgWidth - padX * 2);
                  const y = svgHeight - padY - ((pt.ele - eleStats.minEle) / eleStats.rangeEle) * (svgHeight - padY * 2);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={selectedEleIdx === i ? 6 : 4}
                      fill={selectedEleIdx === i ? '#1e3a8a' : 'transparent'}
                      className="cursor-pointer hover:fill-blue-700"
                      onClick={() => {
                        setSelectedEleIdx(i);
                        setSimProgressPct(Math.round((pt.km / eleStats.maxKm) * 100));
                      }}
                    />
                  );
                })}

                {/* User Position Marker on Elevation */}
                <line
                  x1={userMarkerPos.x}
                  y1={padY}
                  x2={userMarkerPos.x}
                  y2={svgHeight - padY}
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <circle
                  cx={userMarkerPos.x}
                  cy={userMarkerPos.y}
                  r="6"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* Slider to inspect elevation & simulate position along stage */}
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <label htmlFor="ele-pos-slider" className="text-xs font-medium text-slate-600 dark:text-slate-400 shrink-0">
                Pozycja na etapie ({simProgressPct}%):
              </label>
              <input
                id="ele-pos-slider"
                type="range"
                min={0}
                max={100}
                value={simProgressPct}
                onChange={(e) => {
                  setSimProgressPct(Number(e.target.value));
                  setSelectedEleIdx(null);
                }}
                className="w-full accent-blue-900 dark:accent-amber-400 h-2 cursor-pointer"
              />
              <span className="text-xs font-mono-tabular font-bold text-slate-900 dark:text-white shrink-0">
                {userMarkerPos.pt.km} km · {userMarkerPos.pt.ele} m n.p.m.
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
