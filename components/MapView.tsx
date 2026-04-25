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

  // ─── Initialize Map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-74.006, 40.7128],
      zoom: 14,
      attributionControl: false,
    });

    map.current.on('style.load', () => {
      const m = map.current!;

      // ── Zone layers ───────────────────────────────────────────────────────
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

      // ── Territory layers ──────────────────────────────────────────────────
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

      // ── Alternative routes (all collectibles merged) ──────────────────────
      m.addSource('routes-alt', { type: 'geojson', data: EMPTY_COLLECTION });
      m.addLayer({
        id: 'routes-alt', type: 'line', source: 'routes-alt',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ff6b6b', 'line-width': 3, 'line-opacity': 0.35 },
      });

      // ── Primary routes (all collectibles merged) ──────────────────────────
      m.addSource('routes-primary', { type: 'geojson', data: EMPTY_COLLECTION });
      m.addLayer({
        id: 'routes-primary-glow', type: 'line', source: 'routes-primary',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#90EE90', 'line-width': 14, 'line-opacity': 0.12, 'line-blur': 8 },
      });
      m.addLayer({
        id: 'routes-primary', type: 'line', source: 'routes-primary',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#90EE90', 'line-width': 5, 'line-opacity': 1.0 },
      });

      setMapLoaded(true);
    });

    map.current.on('load', () => { map.current?.resize(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Seed zones + territories ────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;
    const center = { lng: -74.006, lat: 40.7128 };
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

  // ─── Push only the SELECTED collectible's route to MapLibre ─────────────
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const primarySrc = map.current.getSource('routes-primary') as maplibregl.GeoJSONSource | undefined;
    const altSrc = map.current.getSource('routes-alt') as maplibregl.GeoJSONSource | undefined;

    const selected = currentTarget ? routeSets[currentTarget.id] : null;

    if (selected) {
      primarySrc?.setData({ type: 'FeatureCollection', features: [selected.primary] });
      altSrc?.setData({ type: 'FeatureCollection', features: selected.alternatives });
    } else {
      primarySrc?.setData(EMPTY_COLLECTION);
      altSrc?.setData(EMPTY_COLLECTION);
    }
  }, [currentTarget, routeSets, mapLoaded]);

  // ─── User marker + collection radius check ────────────────────────────────
  useEffect(() => {
    if (!map.current || !userLocation) return;
    if (!userMapMarker.current) {
      const el = document.createElement('div');
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
  void routeCount; void totalCollectibles; // pre-fetched but not shown in UI

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
      {/* Subtle pre-fetch indicator — only shown while routes are being cached */}
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
