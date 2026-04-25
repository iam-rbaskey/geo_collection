import { create } from 'zustand';
import type { Zone, Territory } from '../lib/zones';
import type { RouteSet } from '../lib/routing';

export interface Collectible {
  id: string;
  lat: number;
  lng: number;
  collected: boolean;
  points: number;          // point value shown on marker
  distanceMeters: number;  // walking distance from user at spawn time
}

interface GameState {
  score: number;
  collectibles: Collectible[];
  currentTarget: Collectible | null;
  /** Per-collectible route sets: id → RouteSet */
  routeSets: Record<string, RouteSet>;
  zones: Zone[];
  territories: Territory[];

  setCollectibles: (items: Collectible[]) => void;
  collectItem: (id: string) => void;
  setCurrentTarget: (item: Collectible | null) => void;
  setRouteSetForId: (id: string, data: RouteSet) => void;
  clearRouteSets: () => void;
  setZones: (zones: Zone[]) => void;
  setTerritories: (territories: Territory[]) => void;

  // Legacy shims – keeps page.tsx / ControlPanel working without changes
  setRouteSet: (data: RouteSet | null) => void;
  setRouteData: (data: unknown) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  collectibles: [],
  currentTarget: null,
  routeSets: {},
  zones: [],
  territories: [],

  setCollectibles: (items) => set({ collectibles: items, routeSets: {} }),

  collectItem: (id) =>
    set((state) => {
      const item = state.collectibles.find((c) => c.id === id);
      const earned = item?.points ?? 10;
      const { [id]: _removed, ...remainingRoutes } = state.routeSets;
      return {
        collectibles: state.collectibles.filter((c) => c.id !== id),
        score: state.score + earned,
        currentTarget:
          state.currentTarget?.id === id ? null : state.currentTarget,
        routeSets: remainingRoutes,
      };
    }),

  setCurrentTarget: (item) => set({ currentTarget: item }),

  setRouteSetForId: (id, data) =>
    set((state) => ({
      routeSets: { ...state.routeSets, [id]: data },
    })),

  clearRouteSets: () => set({ routeSets: {} }),

  setZones: (zones) => set({ zones }),
  setTerritories: (territories) => set({ territories }),

  // Legacy shims
  setRouteSet: () => {},
  setRouteData: () => {},
}));
