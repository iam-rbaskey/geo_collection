// ─── Avatar Rarity ────────────────────────────────────────────────────────────
export type AvatarRarity = 'basic' | 'rare' | 'epic' | 'legendary';

export const RARITY_POINTS: Record<AvatarRarity, number> = {
  basic:     10,
  rare:      25,
  epic:      50,
  legendary: 100,
};

export const RARITY_COLOR: Record<AvatarRarity, string> = {
  basic:     '#94a3b8',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_GLOW: Record<AvatarRarity, string> = {
  basic:     '#94a3b8',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_LABEL: Record<AvatarRarity, string> = {
  basic:     'Basic',
  rare:      'Rare',
  epic:      'Epic',
  legendary: 'Legendary',
};

// ─── Avatar Definitions ────────────────────────────────────────────────────────
export interface AvatarDef {
  avatar_id: string;
  avatar_type: 'starter' | 'collectible';
  label: string;
  emoji: string;       // used for mini icon on map marker
  rarity: AvatarRarity;
  /** Fractional energy multiplier bonus (0 = none) */
  energy_bonus: number;
  /** Extra points bonus on zone unlock */
  zone_bonus: number;
}

/** Starter avatars (player character selection) */
export const STARTER_AVATARS: AvatarDef[] = [
  {
    avatar_id: 'male_basic',
    avatar_type: 'starter',
    label: 'Male Avatar',
    emoji: '🧑',
    rarity: 'basic',
    energy_bonus: 0,
    zone_bonus: 0,
  },
  {
    avatar_id: 'female_basic',
    avatar_type: 'starter',
    label: 'Female Avatar',
    emoji: '👩',
    rarity: 'basic',
    energy_bonus: 0,
    zone_bonus: 0,
  },
];

/** Collectible avatars that spawn on the map */
export const COLLECTIBLE_AVATAR_POOL: AvatarDef[] = [
  // basic
  { avatar_id: 'ninja',       avatar_type: 'collectible', label: 'Ninja',       emoji: '🥷', rarity: 'basic',     energy_bonus: 0,    zone_bonus: 0  },
  { avatar_id: 'astronaut',   avatar_type: 'collectible', label: 'Astronaut',   emoji: '👨‍🚀', rarity: 'basic',    energy_bonus: 0,    zone_bonus: 0  },
  { avatar_id: 'detective',   avatar_type: 'collectible', label: 'Detective',   emoji: '🕵️', rarity: 'basic',     energy_bonus: 0,    zone_bonus: 0  },
  { avatar_id: 'zombie',      avatar_type: 'collectible', label: 'Zombie',      emoji: '🧟', rarity: 'basic',     energy_bonus: 0,    zone_bonus: 0  },
  // rare
  { avatar_id: 'wizard',      avatar_type: 'collectible', label: 'Wizard',      emoji: '🧙', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  { avatar_id: 'cyborg',      avatar_type: 'collectible', label: 'Cyborg',      emoji: '🤖', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  { avatar_id: 'samurai',     avatar_type: 'collectible', label: 'Samurai',     emoji: '⚔️', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  // epic
  { avatar_id: 'dragon',      avatar_type: 'collectible', label: 'Dragon',      emoji: '🐉', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  { avatar_id: 'phoenix',     avatar_type: 'collectible', label: 'Phoenix',     emoji: '🦅', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  // legendary
  { avatar_id: 'god_mode',    avatar_type: 'collectible', label: 'God Mode',    emoji: '✨', rarity: 'legendary', energy_bonus: 0.50, zone_bonus: 50 },
  { avatar_id: 'shadow_king', avatar_type: 'collectible', label: 'Shadow King', emoji: '👑', rarity: 'legendary', energy_bonus: 0.50, zone_bonus: 50 },
];

/** Pick a random collectible avatar, weighted by rarity */
export function pickRandomCollectibleAvatar(): AvatarDef {
  // Weights: basic 55%, rare 28%, epic 12%, legendary 5%
  const roll = Math.random();
  let pool: AvatarDef[];
  if (roll < 0.55)       pool = COLLECTIBLE_AVATAR_POOL.filter(a => a.rarity === 'basic');
  else if (roll < 0.83)  pool = COLLECTIBLE_AVATAR_POOL.filter(a => a.rarity === 'rare');
  else if (roll < 0.95)  pool = COLLECTIBLE_AVATAR_POOL.filter(a => a.rarity === 'epic');
  else                   pool = COLLECTIBLE_AVATAR_POOL.filter(a => a.rarity === 'legendary');
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getAvatarById(id: string): AvatarDef | undefined {
  return [...STARTER_AVATARS, ...COLLECTIBLE_AVATAR_POOL].find(a => a.avatar_id === id);
}

// ─── Leveling formula ─────────────────────────────────────────────────────────
/** XP required to reach the next level from the given level */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}
