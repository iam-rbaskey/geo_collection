import { snapToNearestRoad } from './routing';

// Constants
export const DEFAULT_RADIUS_METERS = 1000;
export const COLLECTION_RADIUS_METERS = 20;

const EARTH_RADIUS_KM = 6371;

/** Haversine formula – distance in metres */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
};

/** Points awarded based on walking distance tiers */
export const pointsForDistance = (meters: number): number => {
  if (meters < 150)  return 10;
  if (meters < 300)  return 20;
  if (meters < 500)  return 35;
  if (meters < 750)  return 50;
  return 75;
};

/** Raw random coordinate within radius */
export const generateRandomLocationWithinRadius = (
  centerLat: number, centerLng: number, radiusMeters: number
) => {
  const radiusInDegrees = radiusMeters / 111300;
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  return {
    lat: centerLat + y,
    lng: centerLng + x / Math.cos(centerLat * Math.PI / 180),
  };
};

/**
 * Generate road-snapped collectibles.
 * Each item:
 *  1. Randomly placed within radius
 *  2. Snapped to nearest OSRM road node
 *  3. Assigned points based on actual distance from the user
 */
export const generateCollectibles = async (
  centerLat: number,
  centerLng: number,
  count: number,
  radiusMeters = DEFAULT_RADIUS_METERS
) => {
  const raws = Array.from({ length: count }, (_, i) => ({
    raw: generateRandomLocationWithinRadius(centerLat, centerLng, radiusMeters),
    i,
  }));

  const results = await Promise.all(
    raws.map(async ({ raw, i }) => {
      const coord = await snapToNearestRoad(raw.lng, raw.lat);
      const dist = calculateDistance(centerLat, centerLng, coord.lat, coord.lng);
      return {
        id: `col-${Date.now()}-${i}`,
        lat: coord.lat,
        lng: coord.lng,
        collected: false,
        distanceMeters: Math.round(dist),
        points: pointsForDistance(dist),
      };
    })
  );

  return results;
};
