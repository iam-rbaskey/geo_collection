export type ZoneStatus = 'locked' | 'unlocked' | 'active' | 'restricted';

export interface Zone {
  zone_id: string;
  zone_name: string;
  unlock_status: ZoneStatus;
  difficulty_level: number;
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
}

export interface Territory {
  territory_id: string;
  territory_name: string;
  owner: 'player' | 'neutral' | 'enemy';
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
}

export const ZONE_COLORS: Record<ZoneStatus, { fill: string; opacity: number; border: string }> = {
  locked:     { fill: '#334155', opacity: 0.50, border: '#475569' },
  unlocked:   { fill: '#00ffd5', opacity: 0.25, border: '#00ffd5' },
  active:     { fill: '#22c55e', opacity: 0.30, border: '#4ade80' },
  restricted: { fill: '#ef4444', opacity: 0.35, border: '#f87171' },
};

/** Build a rough rectangular GeoJSON polygon from four corner lng/lat pairs */
const makePolygon = (coords: [number, number][]): GeoJSON.Feature<GeoJSON.Polygon> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[...coords, coords[0]]],
  },
});

/** Generate demo zones around a center coordinate (NYC City Hall default) */
export const generateDemoZones = (centerLng: number, centerLat: number): Zone[] => {
  const d = 0.005; // ~500m in degrees
  return [
    {
      zone_id: 'zone-1',
      zone_name: 'Civic Hub',
      unlock_status: 'active',
      difficulty_level: 1,
      polygon: makePolygon([
        [centerLng - d,     centerLat - d * 0.5],
        [centerLng,         centerLat - d * 0.5],
        [centerLng,         centerLat + d * 0.5],
        [centerLng - d,     centerLat + d * 0.5],
      ]),
    },
    {
      zone_id: 'zone-2',
      zone_name: 'Financial Quarter',
      unlock_status: 'unlocked',
      difficulty_level: 2,
      polygon: makePolygon([
        [centerLng,         centerLat - d],
        [centerLng + d,     centerLat - d],
        [centerLng + d,     centerLat],
        [centerLng,         centerLat],
      ]),
    },
    {
      zone_id: 'zone-3',
      zone_name: 'Restricted Sector',
      unlock_status: 'restricted',
      difficulty_level: 4,
      polygon: makePolygon([
        [centerLng + d,     centerLat],
        [centerLng + d * 2, centerLat],
        [centerLng + d * 2, centerLat + d],
        [centerLng + d,     centerLat + d],
      ]),
    },
    {
      zone_id: 'zone-4',
      zone_name: 'North Sector',
      unlock_status: 'locked',
      difficulty_level: 3,
      polygon: makePolygon([
        [centerLng - d,     centerLat + d * 0.5],
        [centerLng + d,     centerLat + d * 0.5],
        [centerLng + d,     centerLat + d * 1.5],
        [centerLng - d,     centerLat + d * 1.5],
      ]),
    },
  ];
};

/** Generate demo territory polygons */
export const generateDemoTerritories = (centerLng: number, centerLat: number): Territory[] => {
  const d = 0.003;
  return [
    {
      territory_id: 'terr-1',
      territory_name: 'Player Base',
      owner: 'player',
      polygon: makePolygon([
        [centerLng - d * 0.5, centerLat - d * 0.5],
        [centerLng + d * 0.5, centerLat - d * 0.5],
        [centerLng + d * 0.5, centerLat + d * 0.5],
        [centerLng - d * 0.5, centerLat + d * 0.5],
      ]),
    },
    {
      territory_id: 'terr-2',
      territory_name: 'Neutral Ground',
      owner: 'neutral',
      polygon: makePolygon([
        [centerLng - d * 2,   centerLat - d * 2],
        [centerLng - d,       centerLat - d * 2],
        [centerLng - d,       centerLat - d],
        [centerLng - d * 2,   centerLat - d],
      ]),
    },
  ];
};
