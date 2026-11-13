import { CustomTrack, ElevationPoint } from '../types/expedition';

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildMetricsFromPoints(
  rawPoints: Array<{ lat: number; lng: number; ele: number }>
): Omit<CustomTrack, 'dayNumber' | 'fileName' | 'format'> {
  if (rawPoints.length === 0) {
    throw new Error('Plik nie zawiera żadnych punktów trasy.');
  }

  const coords: Array<[number, number]> = [];
  const profile: ElevationPoint[] = [];
  let totalKm = 0;
  let gainM = 0;
  let lossM = 0;

  for (let i = 0; i < rawPoints.length; i++) {
    const pt = rawPoints[i];
    coords.push([pt.lat, pt.lng]);

    if (i > 0) {
      const prev = rawPoints[i - 1];
      totalKm += haversineKm(prev.lat, prev.lng, pt.lat, pt.lng);
      const diffEle = pt.ele - prev.ele;
      if (diffEle > 1.5) gainM += diffEle;
      else if (diffEle < -1.5) lossM += Math.abs(diffEle);
    }

    profile.push({
      km: Number(totalKm.toFixed(2)),
      ele: Math.round(pt.ele),
    });
  }

  // Downsample elevation profile to max 60 points for crisp SVG rendering
  const maxProfilePts = 60;
  let sampledProfile = profile;
  if (profile.length > maxProfilePts) {
    sampledProfile = [];
    const step = (profile.length - 1) / (maxProfilePts - 1);
    for (let i = 0; i < maxProfilePts; i++) {
      sampledProfile.push(profile[Math.round(i * step)]);
    }
  }

  return {
    coords,
    elevationProfile: sampledProfile,
    totalKm: Number(totalKm.toFixed(2)),
    gainM: Math.round(gainM),
    lossM: Math.round(lossM),
  };
}

export function parseGpxOrGeoJson(
  content: string,
  fileName: string,
  dayNumber: number
): CustomTrack {
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.geojson') || lower.endsWith('.json') || content.trim().startsWith('{')) {
    const json = JSON.parse(content);
    const rawPoints: Array<{ lat: number; lng: number; ele: number }> = [];

    const extractLineCoords = (coordList: unknown[]) => {
      for (const item of coordList) {
        if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
          rawPoints.push({
            lng: item[0],
            lat: item[1],
            ele: typeof item[2] === 'number' ? item[2] : 250,
          });
        }
      }
    };

    const visitGeometry = (geom: { type?: string; coordinates?: unknown } | null | undefined) => {
      if (!geom) return;
      if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
        extractLineCoords(geom.coordinates);
      } else if (geom.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
        for (const line of geom.coordinates) {
          if (Array.isArray(line)) extractLineCoords(line);
        }
      }
    };

    if (json.type === 'FeatureCollection' && Array.isArray(json.features)) {
      for (const f of json.features) {
        visitGeometry(f?.geometry);
      }
    } else if (json.type === 'Feature') {
      visitGeometry(json.geometry);
    } else {
      visitGeometry(json);
    }

    const metrics = buildMetricsFromPoints(rawPoints);
    return {
      dayNumber,
      fileName,
      format: 'geojson',
      ...metrics,
    };
  }

  // Parse GPX XML
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Nieprawidłowy format pliku GPX.');
  }

  const trkpts = Array.from(doc.querySelectorAll('trkpt'));
  const rtepts = trkpts.length > 0 ? trkpts : Array.from(doc.querySelectorAll('rtept'));

  const rawPoints: Array<{ lat: number; lng: number; ele: number }> = [];
  for (const pt of rtepts) {
    const lat = parseFloat(pt.getAttribute('lat') || '');
    const lng = parseFloat(pt.getAttribute('lon') || '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const eleText = pt.querySelector('ele')?.textContent;
    const ele = eleText ? parseFloat(eleText) : 250;
    rawPoints.push({ lat, lng, ele: Number.isFinite(ele) ? ele : 250 });
  }

  const metrics = buildMetricsFromPoints(rawPoints);
  return {
    dayNumber,
    fileName,
    format: 'gpx',
    ...metrics,
  };
}
