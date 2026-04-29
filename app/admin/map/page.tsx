"use client";
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Save, MousePointer2 } from 'lucide-react';

import { generateDemoZones, generateDemoTerritories, ZONE_COLORS } from '@/lib/zones';

export default function MapEditorPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<maplibregl.Marker | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

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
      const center = { lng: 77.2090, lat: 28.6139 };
      const zones = generateDemoZones(center.lng, center.lat);
      const territories = generateDemoTerritories(center.lng, center.lat);

      m.addSource('zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: zones.map(z => ({ ...z.polygon, properties: { unlock_status: z.unlock_status } }))
        }
      });
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
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      if (activeMarker) {
        activeMarker.setLngLat([lng, lat]);
      } else {
        const marker = new maplibregl.Marker({ draggable: true, color: '#00ffd5' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
          
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          setCoords({ lng: lngLat.lng, lat: lngLat.lat });
        });
        
        setActiveMarker(marker);
      }
      setCoords({ lng, lat });
    });

    return () => {
      map.current?.remove();
    };
  }, [activeMarker]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Live Map Editor</h2>
          <p className="text-muted-foreground mt-1">Click anywhere to place a spawn marker or drag to adjust.</p>
        </div>
        <div className="flex gap-2">
          {coords && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-slate-300">
              <span>{coords.lat.toFixed(5)}</span>
              <span className="text-white/20">|</span>
              <span>{coords.lng.toFixed(5)}</span>
            </div>
          )}
          <button 
            disabled={!coords}
            onClick={async () => {
              if (!coords) return;
              const newItem = {
                id: `col_${Date.now()}`,
                character: 'batman', // default for map-click drop
                imagePath: '/characters/batman.png',
                lat: coords.lat,
                lng: coords.lng,
                rarity: 'basic',
                zone: 'none',
                addedAt: new Date().toISOString()
              };
              
              const supabase = (await import('@/utils/supabase/client')).createClient();
              const { error } = await supabase.from('collectibles').insert([newItem]);
              
              if (error) {
                alert("Error saving marker: " + error.message);
              } else {
                alert('Marker saved successfully to database!');
                if (activeMarker) {
                  activeMarker.remove();
                  setActiveMarker(null);
                  setCoords(null);
                }
              }
            }}
            className="flex items-center gap-2 px-6 py-2 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg font-bold transition-colors"
          >
            <Save size={16} /> Save Placement
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
        {!coords && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg animate-pulse">
            <MousePointer2 size={14} className="text-primary" />
            Click on map to drop pin
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
