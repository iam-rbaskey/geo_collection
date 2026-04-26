"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapView } from '@/components/MapView';
import { ControlPanel } from '@/components/ControlPanel';
import { Navbar } from '@/components/Navbar';
import { AvatarSelectModal } from '@/components/AvatarSelectModal';
import { EnergyBar } from '@/components/EnergyBar';
import { useLocationStore } from '@/store/useLocationStore';
import { useGameStore } from '@/store/useGameStore';
import { useAvatarStore } from '@/store/useAvatarStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { fetchRoadRoutes } from '@/lib/routing';
import { calculateDistance } from '@/lib/map';

export default function Home() {
  const { userLocation } = useLocationStore();
  const { currentTarget, setRouteSet } = useGameStore();
  const { hasPickedStarterAvatar } = useAvatarStore();
  const { energy, consumeEnergy } = useEnergyStore();

  const [modalFinished, setModalFinished] = useState(hasPickedStarterAvatar);
  
  // Track previous location to consume energy on move
  const prevLocation = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (hasPickedStarterAvatar) {
      setModalFinished(true);
    }
  }, [hasPickedStarterAvatar]);

  // Energy drain on location update
  useEffect(() => {
    if (userLocation && prevLocation.current) {
      const dist = calculateDistance(
        prevLocation.current.lat, prevLocation.current.lng,
        userLocation.lat, userLocation.lng
      );
      if (dist > 1) { // Only consume if moved more than 1 meter
        consumeEnergy(dist);
      }
    }
    if (userLocation) {
      prevLocation.current = { lat: userLocation.lat, lng: userLocation.lng };
    }
  }, [userLocation, consumeEnergy]);

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
    if (energy <= 0) {
      alert("Not enough energy to navigate!");
      return;
    }
    if (userLocation && currentTarget) {
      const routes = await fetchRoadRoutes(
          userLocation.lng, userLocation.lat,
          currentTarget.lng, currentTarget.lat
      );
      setRouteSet(routes);
    }
  }, [userLocation, currentTarget, setRouteSet, energy]);

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
      {!modalFinished && (
        <AvatarSelectModal onComplete={() => setModalFinished(true)} />
      )}

      {modalFinished && (
        <>
          <MapView />

          {/* HUD Elements */}
          <Navbar />
          <EnergyBar />

          {/* Control Panel - Bottom Right */}
          <div className="fixed bottom-0 right-0 z-10 pointer-events-none p-3 sm:p-4">
            <div className="pointer-events-auto">
              <ControlPanel 
                onCenterMap={handleCenterMap}
                onNavigateTarget={handleNavigateTarget}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
