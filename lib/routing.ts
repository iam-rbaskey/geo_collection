export interface RouteSet {
  primary: GeoJSON.Feature<GeoJSON.LineString>;
  alternatives: GeoJSON.Feature<GeoJSON.LineString>[];
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Global serial queue ───────────────────────────────────────────────────────
// All OSRM calls go through this queue so we never fire more than 1 request
// at a time, avoiding HTTP 429 rate-limit errors on the free demo server.
let _queuePromise: Promise<void> = Promise.resolve();

const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
  const next = _queuePromise.then(() => task());
  // Gate advances even if task throws, so queue never gets stuck
  _queuePromise = next.then(() => sleep(350), () => sleep(350)) as Promise<void>;
  return next;
};

// ─── OSRM fetch helpers (queued) ───────────────────────────────────────────────

const osrmFetch = (url: string, timeout = 15000): Promise<Response> =>
  enqueue(() => fetch(url, { signal: AbortSignal.timeout(timeout) }));

// ─── Route fetching ───────────────────────────────────────────────────────────

export const fetchRoadRoutes = async (
  startLng: number,
  startLat: number,
  endLng: number,
  endLat: number,
  profile: 'walking' | 'driving' | 'cycling' = 'walking'
): Promise<RouteSet> => {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/${profile}` +
      `/${startLng},${startLat};${endLng},${endLat}` +
      `?overview=full&geometries=geojson&alternatives=true`;

    const res = await osrmFetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);

    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No routes');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = [...data.routes].sort((a: any, b: any) => a.distance - b.distance);

    const toFeature = (r: { geometry: GeoJSON.LineString }): GeoJSON.Feature<GeoJSON.LineString> => ({
      type: 'Feature', properties: {}, geometry: r.geometry,
    });

    const [primary, ...rest] = sorted;
    return {
      primary: toFeature(primary),
      alternatives: rest.slice(0, 2).map(toFeature),
    };
  } catch (err) {
    console.warn('OSRM routing failed, using straight-line fallback:', err);
    return {
      primary: straightLine(startLng, startLat, endLng, endLat),
      alternatives: [],
    };
  }
};

// ─── Road snapping (queued) ───────────────────────────────────────────────────

export const snapToNearestRoad = async (
  lng: number,
  lat: number,
  profile: 'walking' | 'driving' | 'cycling' = 'walking'
): Promise<{ lng: number; lat: number }> => {
  try {
    const url = `https://router.project-osrm.org/nearest/v1/${profile}/${lng},${lat}?number=1`;
    const res = await osrmFetch(url, 10000);
    if (!res.ok) throw new Error(`OSRM nearest ${res.status}`);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.waypoints?.length) throw new Error('No waypoint');
    const [snapLng, snapLat] = data.waypoints[0].location;
    return { lng: snapLng, lat: snapLat };
  } catch {
    return { lng, lat }; // fall back to raw coordinate
  }
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const straightLine = (
  startLng: number, startLat: number,
  endLng: number, endLat: number
): GeoJSON.Feature<GeoJSON.LineString> => {
  const coords: [number, number][] = [];
  for (let i = 0; i <= 50; i++) {
    coords.push([
      startLng + ((endLng - startLng) / 50) * i,
      startLat + ((endLat - startLat) / 50) * i,
    ]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } };
};

/** Legacy single-route alias */
export const fetchRoadRoute = async (
  startLng: number, startLat: number,
  endLng: number, endLat: number
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const result = await fetchRoadRoutes(startLng, startLat, endLng, endLat);
  return result.primary;
};
