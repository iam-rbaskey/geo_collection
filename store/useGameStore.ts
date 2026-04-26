import { create } from 'zustand';
import type { Zone, Territory } from '../lib/zones';
import type { RouteSet } from '../lib/routing';
import type { AvatarRarity } from '../lib/avatars';
import { xpForLevel } from '../lib/avatars';

export interface Collectible {
  id: string;
  lat: number;
  lng: number;
  collected: boolean;
  points: number;           // point value shown on marker
  distanceMeters: number;   // walking distance from user at spawn time
  // Avatar collectible fields
  avatarId: string;         // which avatar this collectible represents
  rarity: AvatarRarity;
}

interface GameState {
  score: number;
  level: number;
  levelXP: number;           // XP within current level
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
  addXP: (xp: number) => void;

  // Legacy shims
  setRouteSet: (data: RouteSet | null) => void;
  setRouteData: (data: unknown) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  level: 1,
  levelXP: 0,
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

      // Leveling
      let { level, levelXP } = state;
      levelXP += earned;
      while (levelXP >= xpForLevel(level)) {
        levelXP -= xpForLevel(level);
        level += 1;
      }

      return {
        collectibles: state.collectibles.filter((c) => c.id !== id),
        score: state.score + earned,
        level,
        levelXP,
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

  addXP: (xp) =>
    set((state) => {
      let { level, levelXP } = state;
      levelXP += xp;
      while (levelXP >= xpForLevel(level)) {
        levelXP -= xpForLevel(level);
        level += 1;
      }
      return { level, levelXP };
    }),

  // Legacy shims
  setRouteSet: () => {},
  setRouteData: () => {},
}));
