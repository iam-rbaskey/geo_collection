"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createPortal } from 'react-dom';
import { useLocationStore } from '../store/useLocationStore';
import { useGameStore } from '../store/useGameStore';
import { UserMarker } from './UserMarker';
import { CollectibleNode } from './Collectible';
import { calculateDistance, COLLECTION_RADIUS_METERS } from '../lib/map';
import { fetchRoadRoutes } from '../lib/routing';
import { generateDemoZones, generateDemoTerritories, ZONE_COLORS } from '../lib/zones';
import type { RouteSet } from '../lib/routing';

const EMPTY_COLLECTION: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

// ─── Easing functions ──────────────────────────────────────────────────────────
const easeOutQuad  = (t: number) => 1 - (1 - t) * (1 - t);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ─── Turf-free circle polygon ──────────────────────────────────────────────────
function makeCircleGeoJSON(
  lng: number, lat: number, radiusMeters: number, steps = 64
): GeoJSON.FeatureCollection {
  const coords: [number, number][] = [];
  const earthRadius = 6371000;
  const angularRadius = radiusMeters / earthRadius;
  const latRad = (lat * Math.PI) / 180;

  for (let i = 0; i <= steps; i++) {
    const bearing = (i * 360) / steps;
    const bearingRad = (bearing * Math.PI) / 180;
    const destLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(angularRadius) +
      Math.cos(latRad) * Math.sin(angularRadius) * Math.cos(bearingRad)
    );
    const destLngRad =
      (lng * Math.PI) / 180 +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularRadius) * Math.cos(latRad),
        Math.cos(angularRadius) - Math.sin(latRad) * Math.sin(destLatRad)
      );
    coords.push([(destLngRad * 180) / Math.PI, (destLatRad * 180) / Math.PI]);
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [coords] },
      },
    ],
  };
}

// ─── Get total length of a LineString in coord-units ─────────────────────────
function lineLength(coords: [number, number][]): number {
  let len = 0;
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

// ─── Get point along a LineString at fractional progress [0-1] ────────────────
function pointAlongLine(
  coords: [number, number][],
  progress: number
): [number, number] {
  const total = lineLength(coords);
  const target = total * Math.max(0, Math.min(1, progress));
  let traveled = 0;
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (traveled + segLen >= target) {
      const t = (target - traveled) / segLen;
      return [
        coords[i - 1][0] + dx * t,
        coords[i - 1][1] + dy * t,
      ];
    }
    traveled += segLen;
  }
  return coords[coords.length - 1];
}

// ─── Slice a LineString up to fractional progress [0-1] ───────────────────────
function sliceLineToProgress(
  coords: [number, number][],
  progress: number
): [number, number][] {
  if (progress <= 0) return [coords[0], coords[0]];
  if (progress >= 1) return coords;

  const total = lineLength(coords);
  const target = total * progress;
  let traveled = 0;
  const result: [number, number][] = [coords[0]];

  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (traveled + segLen >= target) {
      const t = (target - traveled) / segLen;
      result.push([
        coords[i - 1][0] + dx * t,
        coords[i - 1][1] + dy * t,
      ]);
      return result;
    }
    traveled += segLen;
    result.push(coords[i]);
  }
  return result;
}

// ─── Build a GeoJSON FeatureCollection from sliced coords ────────────────────
function makeLineGeoJSON(coords: [number, number][]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: coords },
      },
    ],
  };
}

function makePointGeoJSON(lng: number, lat: number): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [lng, lat] },
      },
    ],
  };
}

// ─── Timing constants (all in ms) ─────────────────────────────────────────────
const T_PULSE           = 500;   // step 1: user avatar pulse
const T_SCAN_WAVE       = 1200;  // step 2: scanning wave
const T_ROUTE_DRAW      = 1800;  // step 3: progressive route generation (staggered)
const T_EVALUATION      = 1200;  // step 4: glow pulsing
const T_SELECTION       = 900;   // step 5: best route highlight
const T_FADE_ALT        = 800;   // step 6: alternatives fade
const PROCESSING_DELAY  = 1500;  // simulate processing delay

const ROUTE_STAGGER_MS  = 250;   // per-route start stagger

// Colors (from spec)
const COLOR_CANDIDATE   = '#90EE90';
const COLOR_PRIMARY     = '#22c55e';
const COLOR_ALT_FINAL   = '#ef4444';

// ─── Layer/source IDs ─────────────────────────────────────────────────────────
const SRC_WAVE          = 'route-scan-wave';
const SRC_ROUTE         = (i: number) => `route-candidate-${i}`;
const SRC_DOT           = (i: number) => `route-dot-${i}`;

const LYR_WAVE_FILL     = 'lyr-wave-fill';
const LYR_WAVE_RING     = 'lyr-wave-ring';
const LYR_ROUTE_GLOW    = (i: number) => `lyr-route-glow-${i}`;
const LYR_ROUTE_LINE    = (i: number) => `lyr-route-line-${i}`;
const LYR_DOT           = (i: number) => `lyr-route-dot-${i}`;

const NUM_CANDIDATES    = 3;

// ─── MapView component ────────────────────────────────────────────────────────
export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { userLocation } = useLocationStore();
  const {
    collectibles, currentTarget, routeSets,
    collectItem, setCurrentTarget, setRouteSetForId,
    zones, setZones, territories, setTerritories,
  } = useGameStore();

  const [userMarkerEl, setUserMarkerEl] = useState<HTMLElement | null>(null);
  const [collectibleEls, setCollectibleEls] = useState<Record<string, HTMLElement>>({});

  const userMapMarker = useRef<maplibregl.Marker | null>(null);
  const colMapMarkers = useRef<Record<string, maplibregl.Marker>>({});

  const [burstingIds, setBurstingIds] = useState<Set<string>>(new Set());
  const [fetchingCount, setFetchingCount] = useState(0);

  // Animation state
  const animationRef       = useRef<number | null>(null);
  const animationPhaseRef  = useRef<'idle' | 'animating'>('idle');
  const userMarkerElRef    = useRef<HTMLElement | null>(null);
  const routeAnimCleanup   = useRef<(() => void) | null>(null);

  // ─── Initialize Map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [77.2090, 28.6139],
      zoom: 14,
      attributionControl: false,
    });

    map.current.on('style.load', () => {
      const m = map.current!;

      // ── Zone layers ────────────────────────────────────────────────────────
      m.addSource('zones', { type: 'geojson', data: EMPTY_COLLECTION });
      m.addLayer({
        id: 'zones-fill', type: 'fill', source: 'zones',
        paint: {
          'fill-color': ['match', ['get', 'unlock_status'],
            'locked', ZONE_COLORS.locked.fill, 'unlocked', ZONE_COLORS.unlocked.fill,
            'active', ZONE_COLORS.active.fill, 'restricted', ZONE_COLORS.restricted.fill, '#334155'],
          'fill-opacity': ['match', ['get', 'unlock_status'],
            'locked', ZONE_COLORS.locked.opacity, 'unlocked', ZONE_COLORS.unlocked.opacity,
            'active', ZONE_COLORS.active.opacity, 'restricted', ZONE_COLORS.restricted.opacity, 0.3],
        },
      });
      m.addLayer({
        id: 'zones-border', type: 'line', source: 'zones',
        paint: {
          'line-color': ['match', ['get', 'unlock_status'],
            'locked', ZONE_COLORS.locked.border, 'unlocked', ZONE_COLORS.unlocked.border,
            'active', ZONE_COLORS.active.border, 'restricted', ZONE_COLORS.restricted.border, '#475569'],
          'line-width': 1.5, 'line-opacity': 0.8,
        },
      });

      // ── Territory layers ───────────────────────────────────────────────────
      m.addSource('territories', { type: 'geojson', data: EMPTY_COLLECTION });
      m.addLayer({
        id: 'territories-fill', type: 'fill', source: 'territories',
        paint: {
          'fill-color': ['match', ['get', 'owner'],
            'player', '#00ffd5', 'neutral', '#94a3b8', 'enemy', '#ef4444', '#334155'],
          'fill-opacity': 0.15,
        },
      });
      m.addLayer({
        id: 'territories-border', type: 'line', source: 'territories',
        paint: {
          'line-color': ['match', ['get', 'owner'],
            'player', '#00ffd5', 'neutral', '#94a3b8', 'enemy', '#ef4444', '#475569'],
          'line-width': 2, 'line-dasharray': [4, 2], 'line-opacity': 0.7,
        },
      });

      // ── Scanning wave source/layer ─────────────────────────────────────────
      m.addSource(SRC_WAVE, { type: 'geojson', data: EMPTY_COLLECTION });
      m.addLayer({
        id: LYR_WAVE_FILL, type: 'fill', source: SRC_WAVE,
        paint: { 'fill-color': COLOR_CANDIDATE, 'fill-opacity': 0 },
      });
      m.addLayer({
        id: LYR_WAVE_RING, type: 'line', source: SRC_WAVE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': COLOR_CANDIDATE, 'line-width': 8, 'line-opacity': 0 },
      });

      // ── Per-candidate route + dot sources/layers ──────────────────────────
      for (let i = 0; i < NUM_CANDIDATES; i++) {
        m.addSource(SRC_ROUTE(i), { type: 'geojson', data: EMPTY_COLLECTION });
        m.addLayer({
          id: LYR_ROUTE_GLOW(i), type: 'line', source: SRC_ROUTE(i),
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': COLOR_CANDIDATE,
            'line-width': 10, 'line-opacity': 0, 'line-blur': 6,
          },
        });
        m.addLayer({
          id: LYR_ROUTE_LINE(i), type: 'line', source: SRC_ROUTE(i),
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': COLOR_CANDIDATE,
            'line-width': 4, 'line-opacity': 0,
          },
        });

        // Moving dot for route head
        m.addSource(SRC_DOT(i), { type: 'geojson', data: EMPTY_COLLECTION });
        m.addLayer({
          id: LYR_DOT(i), type: 'circle', source: SRC_DOT(i),
          paint: {
            'circle-radius': 6,
            'circle-color': COLOR_PRIMARY,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.5,
            'circle-opacity': 0,
            'circle-stroke-opacity': 0,
          },
        });
      }

      setMapLoaded(true);
    });

    map.current.on('load', () => { map.current?.resize(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Seed zones + territories ────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;
    const center = { lng: 77.2090, lat: 28.6139 };
    setZones(generateDemoZones(center.lng, center.lat));
    setTerritories(generateDemoTerritories(center.lng, center.lat));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  // ─── Push zones to MapLibre ──────────────────────────────────────────────
  useEffect(() => {
    if (!map.current?.getSource('zones') || !zones.length) return;
    (map.current.getSource('zones') as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: zones.map(z => ({
        ...z.polygon,
        properties: {
          zone_id: z.zone_id, zone_name: z.zone_name,
          unlock_status: z.unlock_status, difficulty_level: z.difficulty_level,
        },
      })),
    });
  }, [zones, mapLoaded]);

  // ─── Push territories to MapLibre ────────────────────────────────────────
  useEffect(() => {
    if (!map.current?.getSource('territories') || !territories.length) return;
    (map.current.getSource('territories') as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: territories.map(t => ({
        ...t.polygon,
        properties: { territory_id: t.territory_id, owner: t.owner },
      })),
    });
  }, [territories, mapLoaded]);

  // ─── Auto-fetch routes for ALL collectibles when they change ─────────────
  const fetchRouteForCollectible = useCallback(async (
    id: string, lat: number, lng: number,
    userLat: number, userLng: number
  ) => {
    setFetchingCount(n => n + 1);
    await new Promise(resolve => setTimeout(resolve, 800));
    const routes = await fetchRoadRoutes(userLng, userLat, lng, lat);
    setRouteSetForId(id, routes);
    setFetchingCount(n => n - 1);
  }, [setRouteSetForId]);

  useEffect(() => {
    if (!userLocation || !collectibles.length) return;
    const existingIds = new Set(Object.keys(routeSets));
    collectibles.forEach(col => {
      if (!existingIds.has(col.id)) {
        fetchRouteForCollectible(col.id, col.lat, col.lng, userLocation.lat, userLocation.lng);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectibles, userLocation]);

  // ─── Helper: cancel any running animation ────────────────────────────────
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (routeAnimCleanup.current) {
      routeAnimCleanup.current();
      routeAnimCleanup.current = null;
    }
    animationPhaseRef.current = 'idle';
  }, []);

  // ─── Helper: reset all route layers to invisible ─────────────────────────
  const resetRouteLayers = useCallback(() => {
    if (!map.current) return;
    const m = map.current;

    // Wave
    if (m.getSource(SRC_WAVE)) {
      (m.getSource(SRC_WAVE) as maplibregl.GeoJSONSource).setData(EMPTY_COLLECTION);
    }
    if (m.getLayer(LYR_WAVE_FILL)) {
      m.setPaintProperty(LYR_WAVE_FILL, 'fill-opacity', 0);
      m.setPaintProperty(LYR_WAVE_RING, 'line-opacity', 0);
    }

    // Per-candidate
    for (let i = 0; i < NUM_CANDIDATES; i++) {
      if (m.getSource(SRC_ROUTE(i))) {
        (m.getSource(SRC_ROUTE(i)) as maplibregl.GeoJSONSource).setData(EMPTY_COLLECTION);
      }
      if (m.getSource(SRC_DOT(i))) {
        (m.getSource(SRC_DOT(i)) as maplibregl.GeoJSONSource).setData(EMPTY_COLLECTION);
      }
      if (m.getLayer(LYR_ROUTE_GLOW(i))) {
        m.setPaintProperty(LYR_ROUTE_GLOW(i), 'line-opacity', 0);
        m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-opacity', 0);
        m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-color', COLOR_CANDIDATE);
        m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-width', 4);
      }
      if (m.getLayer(LYR_DOT(i))) {
        m.setPaintProperty(LYR_DOT(i), 'circle-opacity', 0);
        m.setPaintProperty(LYR_DOT(i), 'circle-stroke-opacity', 0);
      }
    }
  }, []);

  // ─── Helper: pulse the user avatar element ────────────────────────────────
  const pulseUserAvatar = useCallback((onDone: () => void) => {
    const el = userMarkerElRef.current;
    if (!el) { onDone(); return; }

    // Create or get inner wrapper
    const inner = el.querySelector<HTMLElement>('[data-avatar-pulse]');
    if (!inner) { onDone(); return; }

    // Inject keyframes if not already present
    if (!document.getElementById('route-pulse-keyframes')) {
      const style = document.createElement('style');
      style.id = 'route-pulse-keyframes';
      style.textContent = `
        @keyframes avatarRoutePulse {
          0%   { transform: scale(1);    filter: drop-shadow(0 0 0px #22c55e); }
          25%  { transform: scale(1.18); filter: drop-shadow(0 0 12px #22c55e); }
          50%  { transform: scale(1);    filter: drop-shadow(0 0 0px #22c55e); }
          75%  { transform: scale(1.18); filter: drop-shadow(0 0 12px #22c55e); }
          100% { transform: scale(1);    filter: drop-shadow(0 0 0px #22c55e); }
        }
      `;
      document.head.appendChild(style);
    }

    inner.style.animation = `avatarRoutePulse ${T_PULSE}ms ease-out 1`;
    const cleanup = () => {
      inner.style.animation = '';
      onDone();
    };
    const timer = setTimeout(cleanup, T_PULSE);
    routeAnimCleanup.current = () => {
      clearTimeout(timer);
      inner.style.animation = '';
    };
  }, []);

  // ─── Main ultra-realistic route animation sequence ────────────────────────
  const runRouteAnimation = useCallback((routeSet: RouteSet) => {
    if (!map.current) return;
    const m = map.current;

    animationPhaseRef.current = 'animating';

    // Collect all routes: [primary, ...alternatives], max 3
    const allRoutes: GeoJSON.Feature<GeoJSON.LineString>[] = [
      routeSet.primary,
      ...routeSet.alternatives.slice(0, 2),
    ];
    // Pad to NUM_CANDIDATES with copies of primary so layers always have data
    while (allRoutes.length < NUM_CANDIDATES) {
      allRoutes.push(routeSet.primary);
    }
    const allCoords = allRoutes.map(
      r => r.geometry.coordinates as [number, number][]
    );
    const realRouteCount = Math.min(
      1 + routeSet.alternatives.length,
      NUM_CANDIDATES
    );

    let frameId: number | null = null;
    let phaseTimer: ReturnType<typeof setTimeout> | null = null;

    const cancel = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      if (phaseTimer !== null) clearTimeout(phaseTimer);
      frameId = null;
      phaseTimer = null;
    };
    routeAnimCleanup.current = cancel;

    // ── STEP 1: User avatar pulse ──────────────────────────────────────────
    pulseUserAvatar(() => {

      // ── STEP 2: Scanning wave ────────────────────────────────────────────
      const waveOrigin = allCoords[0][0]; // start of primary = user pos
      const waveMaxRadius = 300; // meters

      const waveStart = performance.now();
      const animateWave = (now: number) => {
        const t = Math.min((now - waveStart) / T_SCAN_WAVE, 1);
        const eased = easeOutCubic(t);

        // Growing ring with fading opacity
        const radius = eased * waveMaxRadius;
        if (m.getSource(SRC_WAVE)) {
          (m.getSource(SRC_WAVE) as maplibregl.GeoJSONSource).setData(
            makeCircleGeoJSON(waveOrigin[0], waveOrigin[1], radius)
          );
        }
        const ringOpacity = 0.8 * (1 - eased);
        const fillOpacity = 0.12 * (1 - eased);
        if (m.getLayer(LYR_WAVE_RING)) {
          m.setPaintProperty(LYR_WAVE_RING, 'line-opacity', ringOpacity);
          m.setPaintProperty(LYR_WAVE_RING, 'line-width', 8 * (1 - eased * 0.5));
        }
        if (m.getLayer(LYR_WAVE_FILL)) {
          m.setPaintProperty(LYR_WAVE_FILL, 'fill-opacity', fillOpacity);
        }

        if (t < 1) {
          frameId = requestAnimationFrame(animateWave);
        } else {
          // wave done — fade out
          if (m.getLayer(LYR_WAVE_RING)) {
            m.setPaintProperty(LYR_WAVE_RING, 'line-opacity', 0);
            m.setPaintProperty(LYR_WAVE_FILL, 'fill-opacity', 0);
          }

          // ── STEP 3: Progressive route drawing ────────────────────────────
          phaseTimer = setTimeout(() => {
            const routeDrawStarts = allCoords.map((_, i) =>
              i * ROUTE_STAGGER_MS
            );
            const drawEnd = performance.now();
            const totalDrawDuration = T_ROUTE_DRAW + (realRouteCount - 1) * ROUTE_STAGGER_MS;

            const animateDraw = (now: number) => {
              const elapsed = now - drawEnd;

              for (let i = 0; i < NUM_CANDIDATES; i++) {
                if (i >= realRouteCount) continue; // skip padding routes

                const localElapsed = elapsed - routeDrawStarts[i];
                if (localElapsed < 0) continue;

                const rawT = Math.min(localElapsed / T_ROUTE_DRAW, 1);
                const t = easeInOutCubic(rawT);

                const sliced = sliceLineToProgress(allCoords[i], t);
                if (m.getSource(SRC_ROUTE(i))) {
                  (m.getSource(SRC_ROUTE(i)) as maplibregl.GeoJSONSource).setData(
                    makeLineGeoJSON(sliced)
                  );
                }

                // Show candidate route line
                if (m.getLayer(LYR_ROUTE_LINE(i))) {
                  m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-opacity', 0.45 * Math.min(1, localElapsed / 150));
                  m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-color', COLOR_CANDIDATE);
                  m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-width', 4);
                }

                // Moving dot at route head
                if (t < 1 && t > 0.02) {
                  const headPt = sliced[sliced.length - 1];
                  if (m.getSource(SRC_DOT(i))) {
                    (m.getSource(SRC_DOT(i)) as maplibregl.GeoJSONSource).setData(
                      makePointGeoJSON(headPt[0], headPt[1])
                    );
                  }
                  if (m.getLayer(LYR_DOT(i))) {
                    m.setPaintProperty(LYR_DOT(i), 'circle-opacity', 0.9);
                    m.setPaintProperty(LYR_DOT(i), 'circle-stroke-opacity', 0.9);
                  }
                } else if (t >= 1) {
                  // Route fully drawn — hide dot
                  if (m.getLayer(LYR_DOT(i))) {
                    m.setPaintProperty(LYR_DOT(i), 'circle-opacity', 0);
                    m.setPaintProperty(LYR_DOT(i), 'circle-stroke-opacity', 0);
                  }
                }
              }

              if (elapsed < totalDrawDuration) {
                frameId = requestAnimationFrame(animateDraw);
              } else {
                // All routes fully drawn — restore full data
                for (let i = 0; i < NUM_CANDIDATES; i++) {
                  if (i >= realRouteCount) continue;
                  if (m.getSource(SRC_ROUTE(i))) {
                    (m.getSource(SRC_ROUTE(i)) as maplibregl.GeoJSONSource).setData(
                      makeLineGeoJSON(allCoords[i])
                    );
                  }
                  if (m.getLayer(LYR_DOT(i))) {
                    m.setPaintProperty(LYR_DOT(i), 'circle-opacity', 0);
                    m.setPaintProperty(LYR_DOT(i), 'circle-stroke-opacity', 0);
                  }
                }

                // ── STEP 4: Evaluation glow pulse ────────────────────────
                const evalStart = performance.now();
                const PULSE_PERIOD = T_EVALUATION / 2;

                const animateEval = (now: number) => {
                  const elapsed2 = now - evalStart;
                  const cycle = (elapsed2 % PULSE_PERIOD) / PULSE_PERIOD;
                  const glowIntensity = 0.5 + 0.5 * Math.sin(cycle * Math.PI * 2);

                  for (let i = 0; i < realRouteCount; i++) {
                    if (m.getLayer(LYR_ROUTE_GLOW(i))) {
                      m.setPaintProperty(
                        LYR_ROUTE_GLOW(i), 'line-opacity',
                        0.1 + 0.15 * glowIntensity
                      );
                    }
                    if (m.getLayer(LYR_ROUTE_LINE(i))) {
                      m.setPaintProperty(
                        LYR_ROUTE_LINE(i), 'line-opacity',
                        0.45 + 0.15 * glowIntensity
                      );
                    }
                  }

                  if (elapsed2 < T_EVALUATION) {
                    frameId = requestAnimationFrame(animateEval);
                  } else {
                    // ── STEP 5: Best route selection ──────────────────────
                    const selectStart = performance.now();

                    const animateSelect = (now2: number) => {
                      const t5 = Math.min((now2 - selectStart) / T_SELECTION, 1);
                      const eased5 = easeOutCubic(t5);

                      // Primary route → vivid green
                      if (m.getLayer(LYR_ROUTE_LINE(0))) {
                        m.setPaintProperty(LYR_ROUTE_LINE(0), 'line-opacity', 0.6 + 0.4 * eased5);
                        m.setPaintProperty(LYR_ROUTE_LINE(0), 'line-width', 4 + 2 * eased5);
                        m.setPaintProperty(LYR_ROUTE_LINE(0), 'line-color', COLOR_PRIMARY);
                      }
                      if (m.getLayer(LYR_ROUTE_GLOW(0))) {
                        m.setPaintProperty(LYR_ROUTE_GLOW(0), 'line-width', 10 + 4 * eased5);
                        m.setPaintProperty(LYR_ROUTE_GLOW(0), 'line-color', COLOR_PRIMARY);
                        m.setPaintProperty(LYR_ROUTE_GLOW(0), 'line-opacity', 0.25 * eased5);
                      }

                      if (t5 < 1) {
                        frameId = requestAnimationFrame(animateSelect);
                      } else {
                        // Snap primary to final values
                        if (m.getLayer(LYR_ROUTE_LINE(0))) {
                          m.setPaintProperty(LYR_ROUTE_LINE(0), 'line-opacity', 1);
                          m.setPaintProperty(LYR_ROUTE_LINE(0), 'line-width', 6);
                          m.setPaintProperty(LYR_ROUTE_LINE(0), 'line-color', COLOR_PRIMARY);
                        }
                        if (m.getLayer(LYR_ROUTE_GLOW(0))) {
                          m.setPaintProperty(LYR_ROUTE_GLOW(0), 'line-opacity', 0.25);
                          m.setPaintProperty(LYR_ROUTE_GLOW(0), 'line-width', 14);
                        }

                        // ── STEP 6: Fade alternatives to red ─────────────
                        const fadeStart = performance.now();

                        const animateFade = (now3: number) => {
                          const t6 = Math.min((now3 - fadeStart) / T_FADE_ALT, 1);
                          const eased6 = easeOutQuad(t6);

                          for (let i = 1; i < realRouteCount; i++) {
                            if (m.getLayer(LYR_ROUTE_LINE(i))) {
                              m.setPaintProperty(
                                LYR_ROUTE_LINE(i), 'line-opacity',
                                0.6 * (1 - eased6) + 0.35 * eased6
                              );
                              m.setPaintProperty(
                                LYR_ROUTE_LINE(i), 'line-color',
                                COLOR_ALT_FINAL
                              );
                              m.setPaintProperty(
                                LYR_ROUTE_LINE(i), 'line-width',
                                4 - 0 * eased6
                              );
                            }
                            if (m.getLayer(LYR_ROUTE_GLOW(i))) {
                              m.setPaintProperty(LYR_ROUTE_GLOW(i), 'line-opacity', 0);
                            }
                          }

                          if (t6 < 1) {
                            frameId = requestAnimationFrame(animateFade);
                          } else {
                            // Final committed state
                            for (let i = 1; i < realRouteCount; i++) {
                              if (m.getLayer(LYR_ROUTE_LINE(i))) {
                                m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-opacity', 0.35);
                                m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-color', COLOR_ALT_FINAL);
                                m.setPaintProperty(LYR_ROUTE_LINE(i), 'line-width', 4);
                                m.setPaintProperty(LYR_ROUTE_GLOW(i), 'line-opacity', 0);
                              }
                            }
                            animationPhaseRef.current = 'idle';
                            routeAnimCleanup.current = null;
                          }
                        };
                        frameId = requestAnimationFrame(animateFade);
                      }
                    };
                    frameId = requestAnimationFrame(animateSelect);
                  }
                };
                frameId = requestAnimationFrame(animateEval);
              }
            };
            frameId = requestAnimationFrame(animateDraw);
          }, PROCESSING_DELAY);
        }
      };
      frameId = requestAnimationFrame(animateWave);
    });
  }, [pulseUserAvatar]);

  // ─── Camera: smooth fit to route bounds ─────────────────────────────────
  const fitToBounds = useCallback((routeSet: RouteSet) => {
    if (!map.current) return;
    const coords = [
      ...routeSet.primary.geometry.coordinates,
      ...routeSet.alternatives.flatMap(a => a.geometry.coordinates),
    ] as [number, number][];
    if (coords.length < 2) return;

    const bounds = coords.reduce(
      (b, c) => b.extend(c as [number, number]),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );

    map.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 160, left: 60, right: 60 },
      duration: 900,
      essential: true,
    });
  }, []);

  // ─── React to currentTarget / routeSet changes ───────────────────────────
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    cancelAnimation();
    resetRouteLayers();

    const selected = currentTarget ? routeSets[currentTarget.id] : null;

    if (!selected) return;

    // Camera motion first (smooth zoom/pan)
    fitToBounds(selected);

    // Run the full animation sequence
    runRouteAnimation(selected);

    return () => {
      cancelAnimation();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTarget, routeSets, mapLoaded]);

  // ─── User marker + collection radius check ────────────────────────────────
  useEffect(() => {
    if (!map.current || !userLocation) return;
    if (!userMapMarker.current) {
      const el = document.createElement('div');
      userMarkerElRef.current = el;
      setUserMarkerEl(el);
      userMapMarker.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      map.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 16 });
    } else {
      userMapMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    if (currentTarget) {
      const dist = calculateDistance(
        userLocation.lat, userLocation.lng, currentTarget.lat, currentTarget.lng
      );
      if (dist <= COLLECTION_RADIUS_METERS) {
        setBurstingIds(prev => new Set(prev).add(currentTarget.id));
        setCurrentTarget(null);
      }
    }
  }, [userLocation, currentTarget, setCurrentTarget]);

  // ─── Sync collectible map markers ─────────────────────────────────────────
  useEffect(() => {
    if (!map.current) return;
    const currentIds = new Set(collectibles.map(c => c.id));

    Object.keys(colMapMarkers.current).forEach(id => {
      if (!currentIds.has(id) && !burstingIds.has(id)) {
        colMapMarkers.current[id].remove();
        delete colMapMarkers.current[id];
        setCollectibleEls(prev => { const n = { ...prev }; delete n[id]; return n; });
      }
    });

    collectibles.forEach(col => {
      if (!colMapMarkers.current[col.id] && !burstingIds.has(col.id)) {
        const el = document.createElement('div');
        colMapMarkers.current[col.id] = new maplibregl.Marker({ element: el })
          .setLngLat([col.lng, col.lat])
          .addTo(map.current!);
        setCollectibleEls(prev => ({ ...prev, [col.id]: el }));
      }
    });
  }, [collectibles, burstingIds]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleBurstComplete = (id: string) => {
    collectItem(id);
    colMapMarkers.current[id]?.remove();
    delete colMapMarkers.current[id];
    setBurstingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setCollectibleEls(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleTargetSelect = (col: { id: string; lat: number; lng: number }) => {
    setCurrentTarget(col as typeof collectibles[number]);
  };

  const routeCount = Object.keys(routeSets).length;
  const totalCollectibles = collectibles.length;
  void routeCount; void totalCollectibles;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={mapContainer}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: mapLoaded ? 1 : 0,
        transition: 'opacity 1.2s ease-in-out',
      }}
    >
      {fetchingCount > 0 && (
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 20,
          background: 'rgba(14,20,27,0.75)',
          border: '1px solid rgba(144,238,144,0.3)',
          backdropFilter: 'blur(8px)', borderRadius: 10,
          padding: '5px 12px', display: 'flex', alignItems: 'center',
          gap: 7, color: '#90EE90', fontSize: 11, fontWeight: 500,
          pointerEvents: 'none',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#90EE90', display: 'inline-block',
            animation: 'pulse 1s infinite',
          }} />
          Caching routes…
        </div>
      )}

      {userMarkerEl && createPortal(<UserMarker />, userMarkerEl)}

      {collectibles.map(col => {
        const el = collectibleEls[col.id];
        if (!el) return null;
        return createPortal(
          <CollectibleNode
            key={col.id}
            id={col.id}
            points={col.points}
            onClick={() => handleTargetSelect(col)}
            isBursting={burstingIds.has(col.id)}
            onBurstComplete={() => handleBurstComplete(col.id)}
          />,
          el
        );
      })}
    </div>
  );
};
