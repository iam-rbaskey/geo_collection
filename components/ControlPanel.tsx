"use client";
import React, { useState } from 'react';
import { useLocationStore } from '../store/useLocationStore';
import { useGameStore } from '../store/useGameStore';
import { LocateFixed, Navigation, Map as MapIcon, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { generateCollectibles } from '../lib/map';

interface ControlPanelProps {
  onCenterMap: () => void;
  onNavigateTarget: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onCenterMap, onNavigateTarget }) => {
  const { userLocation, requestPermission, permissionGranted, isLocating, setMockLocation } = useLocationStore();
  const { setCollectibles, setRouteSet, currentTarget } = useGameStore();
  const [isSpawning, setIsSpawning] = useState(false);

  const handleSpawn = async () => {
    if (!userLocation || isSpawning) return;
    setIsSpawning(true);
    const items = await generateCollectibles(userLocation.lat, userLocation.lng, 8, 1000);
    setCollectibles(items);
    setRouteSet(null);
    setIsSpawning(false);
  };

  return (
    <div className="flex flex-col gap-3 pointer-events-auto">
      <div className="flex flex-col bg-secondary/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg p-2 gap-2">
        {!permissionGranted && (
          <button 
            onClick={requestPermission}
            className="flex items-center gap-2 p-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            disabled={isLocating}
          >
            <Navigation className="w-5 h-5" />
            <span>{isLocating ? 'Locating...' : 'Enable Location'}</span>
          </button>
        )}
        
        {permissionGranted && (
          <>
            <button 
              onClick={onCenterMap}
              className="flex items-center justify-center p-3 rounded-xl hover:bg-white/5 text-foreground transition-colors"
              title="Center Map"
            >
              <LocateFixed className="w-5 h-5" />
            </button>
            <button
              onClick={handleSpawn}
              disabled={isSpawning}
              className="flex items-center justify-center p-3 rounded-xl hover:bg-white/5 text-foreground transition-colors disabled:opacity-50"
              title={isSpawning ? 'Snapping to roads…' : 'Spawn Collectibles'}
            >
              <RefreshCw className={`w-5 h-5 ${isSpawning ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onNavigateTarget}
              className={clsx(
                "flex items-center justify-center p-3 rounded-xl transition-colors",
                currentTarget 
                  ? "bg-primary text-primary-foreground hover:opacity-90" 
                  : "hover:bg-white/5 text-muted-foreground"
              )}
              title="Start Navigation"
              disabled={!currentTarget}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {!permissionGranted && (
        <button 
          onClick={setMockLocation}
          className="text-xs text-muted-foreground underline text-center"
        >
          Use Mock Location
        </button>
      )}
    </div>
  );
};
