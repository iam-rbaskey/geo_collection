import { create } from 'zustand';

/**
 * Energy System
 * - Max 100 units
 * - Each meter of movement costs 0.02 energy
 * - Idle for 3600 seconds (1h) → full restore in 1 second
 * - Energy shown as floating bar (top-right HUD)
 */

const MAX_ENERGY          = 100;
const ENERGY_PER_METER    = 0.02;
const IDLE_REQUIRED_MS    = 3_600_000; // 1 hour
const RECHARGE_DURATION_MS = 1_000;

interface EnergyState {
  energy: number;
  lastMovedAt: number;       // timestamp of last position change
  isRecharging: boolean;

  consumeEnergy: (meters: number) => void;
  setLastMoved: (ts: number) => void;
  tick: () => void;          // call periodically (e.g. every 500ms)
  forceRecharge: () => void; // dev helper / debug
}

export const useEnergyStore = create<EnergyState>((set, get) => ({
  energy: MAX_ENERGY,
  lastMovedAt: Date.now(),
  isRecharging: false,

  consumeEnergy: (meters) => {
    const cost = meters * ENERGY_PER_METER;
    set((state) => ({
      energy: Math.max(0, state.energy - cost),
      lastMovedAt: Date.now(),
      isRecharging: false,
    }));
  },

  setLastMoved: (ts) => set({ lastMovedAt: ts, isRecharging: false }),

  tick: () => {
    const { energy, lastMovedAt, isRecharging } = get();
    if (energy >= MAX_ENERGY) return;

    const idleMs = Date.now() - lastMovedAt;
    if (idleMs < IDLE_REQUIRED_MS) return;

    // Idle threshold reached → begin gradual recharge over RECHARGE_DURATION_MS
    // We call tick every 500ms, so each tick restores a proportional chunk
    const tickInterval = 500;
    const chargePer500ms = (MAX_ENERGY / RECHARGE_DURATION_MS) * tickInterval;
    const newEnergy = Math.min(MAX_ENERGY, energy + chargePer500ms);

    set({ energy: newEnergy, isRecharging: true });
    if (newEnergy >= MAX_ENERGY) {
      set({ isRecharging: false });
    }
  },

  forceRecharge: () => set({ energy: MAX_ENERGY, isRecharging: false }),
}));

export { MAX_ENERGY, ENERGY_PER_METER };
