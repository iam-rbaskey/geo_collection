"use client";
import React, { useCallback, useEffect } from 'react';
import { MapView } from '@/components/MapView';
import { ControlPanel } from '@/components/ControlPanel';
import { Navbar } from '@/components/Navbar';
import { useLocationStore } from '@/store/useLocationStore';
import { useGameStore } from '@/store/useGameStore';
import { fetchRoadRoutes } from '@/lib/routing';

export default function Home() {
  const { userLocation } = useLocationStore();
  const { currentTarget, setRouteSet } = useGameStore();

  // Optimize viewport for mobile devices
  useEffect(() => {
    // Set viewport meta tag for proper mobile scaling
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';
    
    // Handle safe area insets for notched devices
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
  }, []);

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
    <main className="relative w-screen h-screen overflow-hidden bg-background" style={{ 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <MapView />

      {/* Navbar */}
      <Navbar />

      {/* Control Panel - Bottom Right */}
      <div className="fixed bottom-0 right-0 z-10 pointer-events-none p-3 sm:p-4">
        <div className="pointer-events-auto">
          <ControlPanel 
            onCenterMap={handleCenterMap}
            onNavigateTarget={handleNavigateTarget}
          />
        </div>
      </div>
    </main>
  );
}
