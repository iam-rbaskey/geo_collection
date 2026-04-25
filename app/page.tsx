"use client";
import React, { useCallback } from 'react';
import { MapView } from '@/components/MapView';
import { ControlPanel } from '@/components/ControlPanel';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { useLocationStore } from '@/store/useLocationStore';
import { useGameStore } from '@/store/useGameStore';
import { fetchRoadRoutes } from '@/lib/routing';

export default function Home() {
  const { userLocation } = useLocationStore();
  const { currentTarget, setRouteSet } = useGameStore();

  const handleCenterMap = useCallback(() => {
    // MapView tracks location automatically, trigger zoom if implemented
  }, []);

  const handleNavigateTarget = useCallback(async () => {
    if (userLocation && currentTarget) {
      const routes = await fetchRoadRoutes(
          userLocation.lng, userLocation.lat,
          currentTarget.lng, currentTarget.lat
      );
      setRouteSet(routes);
    }
  }, [userLocation, currentTarget, setRouteSet]);

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0b0f14' }}>
      <MapView />

      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6 pb-8">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/50 flex items-center justify-center pointer-events-auto">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#00ffd5]"></span>
            </div>
            <span className="text-sm font-medium text-primary shadow-sm bg-background/50 px-2 py-1 rounded backdrop-blur border border-white/5 pointer-events-auto">
               {userLocation ? 'Tracking Active' : 'Waiting for GPS...'}
            </span>
          </div>
          <ScoreDisplay />
        </div>

        <div className="flex justify-end lg:w-80 w-full ml-auto">
          <ControlPanel 
            onCenterMap={handleCenterMap}
            onNavigateTarget={handleNavigateTarget}
          />
        </div>
      </div>
    </main>
  );
}
