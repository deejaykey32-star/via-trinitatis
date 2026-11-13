export interface WeatherData {
  temperatureC: number;
  tempMaxC: number;
  tempMinC: number;
  windKmh: number;
  precipProbPct: number;
  weatherCode: number;
  descriptionPl: string;
  isFallback?: boolean;
}

export type PoiCategory = 'water' | 'shelter' | 'church' | 'pharmacy' | 'shop';

export interface PilgrimPoi {
  id: string;
  category: PoiCategory;
  name: string;
  lat: number;
  lng: number;
  detail?: string;
}

const weatherCache = new Map<string, { ts: number; data: WeatherData }>();
const poiCache = new Map<string, { ts: number; data: PilgrimPoi[] }>();

function decodeWeatherCodePl(code: number): string {
  if (code === 0) return 'Bezchmurnie';
  if (code <= 3) return 'Częściowe zachmurzenie';
  if (code === 45 || code === 48) return 'Mgła poranna';
  if (code >= 51 && code <= 57) return 'Mżawka na szlaku';
  if (code >= 61 && code <= 67) return 'Opady deszczu';
  if (code >= 71 && code <= 77) return 'Opady śniegu';
  if (code >= 80 && code <= 82) return 'Przelotne ulewy';
  if (code >= 95) return 'Burze – zachowaj ostrożność';
  return 'Pogoda umiarkowana';
}

export async function fetchStageWeather(lat: number, lng: number): Promise<WeatherData> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.ts < 15 * 60 * 1000) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('Weather API error');
    const json = await res.json();

    const code = Number(json.current?.weather_code ?? 1);
    const data: WeatherData = {
      temperatureC: Math.round(Number(json.current?.temperature_2m ?? 21)),
      tempMaxC: Math.round(Number(json.daily?.temperature_2m_max?.[0] ?? 24)),
      tempMinC: Math.round(Number(json.daily?.temperature_2m_min?.[0] ?? 13)),
      windKmh: Math.round(Number(json.current?.wind_speed_10m ?? 12)),
      precipProbPct: Math.round(Number(json.daily?.precipitation_probability_max?.[0] ?? 15)),
      weatherCode: code,
      descriptionPl: decodeWeatherCodePl(code),
      isFallback: false,
    };
    weatherCache.set(key, { ts: Date.now(), data });
    return data;
  } catch {
    return {
      temperatureC: 21,
      tempMaxC: 24,
      tempMinC: 12,
      windKmh: 11,
      precipProbPct: 10,
      weatherCode: 1,
      descriptionPl: 'Dane offline (szacunek sezonowy)',
      isFallback: true,
    };
  }
}

export async function fetchOverpassPois(
  lat: number,
  lng: number,
  categories: PoiCategory[],
  radiusM = 3500
): Promise<{ pois: PilgrimPoi[]; fromCache: boolean; error?: string }> {
  if (categories.length === 0) {
    return { pois: [], fromCache: true };
  }

  const sortedCats = [...categories].sort().join(',');
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}:${sortedCats}`;
  const cached = poiCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
    return { pois: cached.data, fromCache: true };
  }

  const parts: string[] = [];
  if (categories.includes('water')) {
    parts.push(`node["amenity"="drinking_water"](around:${radiusM},${lat},${lng});`);
    parts.push(`node["natural"="spring"](around:${radiusM},${lat},${lng});`);
  }
  if (categories.includes('shelter')) {
    parts.push(`node["tourism"~"hostel|alpine_hut|guest_house"](around:${radiusM},${lat},${lng});`);
    parts.push(`node["amenity"~"shelter|monastery"](around:${radiusM},${lat},${lng});`);
    parts.push(`way["tourism"~"hostel|alpine_hut|guest_house"](around:${radiusM},${lat},${lng});`);
  }
  if (categories.includes('church')) {
    parts.push(`node["amenity"="place_of_worship"](around:${radiusM},${lat},${lng});`);
    parts.push(`way["amenity"="place_of_worship"](around:${radiusM},${lat},${lng});`);
  }
  if (categories.includes('pharmacy')) {
    parts.push(`node["amenity"="pharmacy"](around:${radiusM},${lat},${lng});`);
  }
  if (categories.includes('shop')) {
    parts.push(`node["shop"~"supermarket|convenience|bakery"](around:${radiusM},${lat},${lng});`);
  }

  const query = `[out:json][timeout:12];(${parts.join('')});out center 60;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      throw new Error(`Overpass HTTP ${res.status}`);
    }

    const json = await res.json();
    const elements = Array.isArray(json.elements) ? json.elements : [];
    const pois: PilgrimPoi[] = [];

    for (const el of elements) {
      const pLat = el.lat ?? el.center?.lat;
      const pLng = el.lon ?? el.center?.lon;
      if (typeof pLat !== 'number' || typeof pLng !== 'number') continue;

      const tags = el.tags || {};
      let category: PoiCategory = 'church';
      if (tags.amenity === 'drinking_water' || tags.natural === 'spring') {
        category = 'water';
      } else if (tags.amenity === 'pharmacy') {
        category = 'pharmacy';
      } else if (tags.shop) {
        category = 'shop';
      } else if (
        tags.tourism === 'hostel' ||
        tags.tourism === 'alpine_hut' ||
        tags.tourism === 'guest_house' ||
        tags.amenity === 'shelter' ||
        tags.amenity === 'monastery'
      ) {
        category = 'shelter';
      } else if (tags.amenity === 'place_of_worship') {
        category = 'church';
      }

      const defaultNames: Record<PoiCategory, string> = {
        water: 'Źródło / Woda pitna',
        shelter: 'Nocleg / Schronisko',
        church: 'Kościół / Kaplica',
        pharmacy: 'Apteka',
        shop: 'Sklep spożywczy',
      };

      pois.push({
        id: `${el.type}-${el.id}`,
        category,
        name: tags.name || defaultNames[category],
        lat: pLat,
        lng: pLng,
        detail: tags.opening_hours || tags['addr:street'] || tags.denomination || undefined,
      });
    }

    poiCache.set(cacheKey, { ts: Date.now(), data: pois });
    return { pois, fromCache: false };
  } catch (err) {
    return {
      pois: [],
      fromCache: false,
      error: err instanceof Error ? err.message : 'Błąd połączenia z Overpass API',
    };
  }
}
