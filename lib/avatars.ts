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
  image_path: string;       // replaced emoji with image_path
  rarity: AvatarRarity;
  energy_bonus: number;
  zone_bonus: number;
}

export const STARTER_AVATARS: AvatarDef[] = [
  {
    avatar_id: 'male_default',
    avatar_type: 'starter',
    label: 'Male Explorer',
    image_path: '/characters/man.png',
    rarity: 'basic',
    energy_bonus: 0,
    zone_bonus: 0,
  },
  {
    avatar_id: 'female_default',
    avatar_type: 'starter',
    label: 'Female Explorer',
    image_path: '/characters/woman.png',
    rarity: 'basic',
    energy_bonus: 0,
    zone_bonus: 0,
  },
];

export const COLLECTIBLE_AVATAR_POOL: AvatarDef[] = [
  // basic
  { avatar_id: 'knight',       avatar_type: 'collectible', label: 'Knight',       image_path: '/characters/knight.png', rarity: 'basic',     energy_bonus: 0,    zone_bonus: 0  },
  { avatar_id: 'pirate',       avatar_type: 'collectible', label: 'Pirate',       image_path: '/characters/pirate.png', rarity: 'basic',    energy_bonus: 0,    zone_bonus: 0  },
  { avatar_id: 'mask',         avatar_type: 'collectible', label: 'Mask',         image_path: '/characters/mask.png', rarity: 'basic',     energy_bonus: 0,    zone_bonus: 0  },
  { avatar_id: 'defenders',    avatar_type: 'collectible', label: 'Defenders',    image_path: '/characters/defenders.png', rarity: 'basic',     energy_bonus: 0,    zone_bonus: 0  },
  // rare
  { avatar_id: 'wizard',       avatar_type: 'collectible', label: 'Wizard',       image_path: '/characters/wizard.png', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  { avatar_id: 'spiderman',    avatar_type: 'collectible', label: 'Spiderman',    image_path: '/characters/spiderman.png', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  { avatar_id: 'deadpool',     avatar_type: 'collectible', label: 'Deadpool',     image_path: '/characters/deadpool.png', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  { avatar_id: 'superhero',    avatar_type: 'collectible', label: 'Superhero',    image_path: '/characters/superhero.png', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  { avatar_id: 'superheroe',   avatar_type: 'collectible', label: 'Heroine',      image_path: '/characters/superheroe.png', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  { avatar_id: 'batman',       avatar_type: 'collectible', label: 'Batman',       image_path: '/characters/batman.png', rarity: 'rare',      energy_bonus: 0.15, zone_bonus: 10 },
  // epic
  { avatar_id: 'blkpanther',   avatar_type: 'collectible', label: 'Panther',      image_path: '/characters/blkpanther.png', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  { avatar_id: 'capamerica',   avatar_type: 'collectible', label: 'Captain',      image_path: '/characters/capamerica.png', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  { avatar_id: 'ironman',      avatar_type: 'collectible', label: 'Ironman',      image_path: '/characters/ironman.png', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  { avatar_id: 'thor',         avatar_type: 'collectible', label: 'Thor',         image_path: '/characters/thor.png', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  { avatar_id: 'wolverine',    avatar_type: 'collectible', label: 'Wolverine',    image_path: '/characters/wolverine.png', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  { avatar_id: 'superman',     avatar_type: 'collectible', label: 'Superman',     image_path: '/characters/superman.png', rarity: 'epic',      energy_bonus: 0.30, zone_bonus: 25 },
  // legendary
  { avatar_id: 'gundam',       avatar_type: 'collectible', label: 'Gundam',       image_path: '/characters/gundam.png', rarity: 'legendary', energy_bonus: 0.50, zone_bonus: 50 },
  { avatar_id: 'grim-reaper',  avatar_type: 'collectible', label: 'Grim Reaper',  image_path: '/characters/grim-reaper.png', rarity: 'legendary', energy_bonus: 0.50, zone_bonus: 50 },
  { avatar_id: 'king',         avatar_type: 'collectible', label: 'King',         image_path: '/characters/king.png', rarity: 'legendary', energy_bonus: 0.50, zone_bonus: 50 },
  { avatar_id: 'god',          avatar_type: 'collectible', label: 'God',          image_path: '/characters/god.png', rarity: 'legendary', energy_bonus: 0.50, zone_bonus: 50 },
];

export function pickRandomCollectibleAvatar(): AvatarDef {
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

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}
