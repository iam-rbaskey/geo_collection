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
    
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase.from('collectibles').select('*');
      
      if (!error && data) {
        const { RARITY_POINTS } = await import('@/lib/avatars');
        const mapped = data.map(dbCol => ({
          id: dbCol.id,
          lat: dbCol.lat,
          lng: dbCol.lng,
          collected: false,
          points: RARITY_POINTS[dbCol.rarity as keyof typeof RARITY_POINTS] || 10,
          distanceMeters: 0,
          avatarId: dbCol.character, 
          rarity: dbCol.rarity as any
        }));
        setCollectibles(mapped);
      }
    } catch (err) {
      console.error(err);
    }
    
    setRouteSet(null);
    setIsSpawning(false);
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 pointer-events-auto">
      <div className="flex flex-col bg-secondary/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-lg p-1.5 sm:p-2 gap-1.5 sm:gap-2">
        {!permissionGranted && (
          <button 
            onClick={requestPermission}
            className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
            disabled={isLocating}
          >
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{isLocating ? 'Locating...' : 'Enable Location'}</span>
          </button>
        )}
        
        {permissionGranted && (
          <>
            <button 
              onClick={onCenterMap}
              className="flex items-center justify-center p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-white/5 text-foreground transition-colors"
              title="Center Map"
            >
              <LocateFixed className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleSpawn}
              disabled={isSpawning}
              className="flex items-center justify-center p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-white/5 text-foreground transition-colors disabled:opacity-50"
              title={isSpawning ? 'Snapping to roads…' : 'Spawn Collectibles'}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isSpawning ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onNavigateTarget}
              className={clsx(
                "flex items-center justify-center p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-colors",
                currentTarget 
                  ? "bg-primary text-primary-foreground hover:opacity-90" 
                  : "hover:bg-white/5 text-muted-foreground"
              )}
              title="Start Navigation"
              disabled={!currentTarget}
            >
              <MapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {!permissionGranted && (
        <button 
          onClick={setMockLocation}
          className="text-[10px] sm:text-xs text-muted-foreground underline text-center py-1"
        >
          Use Mock Location
        </button>
      )}
    </div>
  );
};
