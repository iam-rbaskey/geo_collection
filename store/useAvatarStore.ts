import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarRarity } from '../lib/avatars';

export interface CollectedAvatar {
  avatar_id:    string;
  unlock_time:  number;   // Date.now()
  rarity:       AvatarRarity;
  level_points: number;
}

interface AvatarState {
  /** The avatar the player is using (null → not chosen yet) */
  selectedAvatarId: string | null;
  /** Whether the first-launch avatar selection modal has been shown */
  hasPickedStarterAvatar: boolean;
  /** Collected avatar inventory */
  inventory: CollectedAvatar[];

  setSelectedAvatar: (id: string) => void;
  addToInventory: (avatar: CollectedAvatar) => void;
  resetInventory: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      selectedAvatarId: null,
      hasPickedStarterAvatar: false,
      inventory: [],

      setSelectedAvatar: (id) =>
        set({ selectedAvatarId: id, hasPickedStarterAvatar: true }),

      addToInventory: (avatar) =>
        set((state) => {
          // Avoid duplicate (same id shouldn't exist twice)
          if (state.inventory.some((a) => a.avatar_id === avatar.avatar_id && a.unlock_time === avatar.unlock_time)) {
            return state;
          }
          return { inventory: [...state.inventory, avatar] };
        }),

      resetInventory: () => set({ inventory: [] }),
    }),
    {
      name: 'geocollect-avatar-store',
      version: 1,
    }
  )
);
