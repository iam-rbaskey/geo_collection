export type PowerRarity = 'common' | 'rare' | 'epic';

export interface PowerDef {
  power_id: string;
  label: string;
  image_path: string;
  rarity: PowerRarity;
  effect: string;
}

export const COLLECTIBLE_POWER_POOL: PowerDef[] = [
  { power_id: 'bow-and-arrow', label: 'Bow & Arrow', image_path: '/powers/bow-and-arrow.png', rarity: 'common', effect: 'collection_range_increase' },
  { power_id: 'rifle', label: 'Rifle', image_path: '/powers/rifle.png', rarity: 'common', effect: 'collection_range_increase' },
  { power_id: 'weapon', label: 'Weapon', image_path: '/powers/weapon.png', rarity: 'common', effect: 'collection_range_increase' },
  
  { power_id: 'captain-america', label: 'Shield', image_path: '/powers/captain-america.png', rarity: 'rare', effect: 'energy_reduction' },
  { power_id: 'gas-mask', label: 'Gas Mask', image_path: '/powers/gas-mask.png', rarity: 'rare', effect: 'energy_reduction' },
  { power_id: 'movie', label: 'Radar', image_path: '/powers/movie.png', rarity: 'rare', effect: 'nearby_collectible_detection' },
  { power_id: 'role-playing-game', label: 'RPG', image_path: '/powers/role-playing-game.png', rarity: 'rare', effect: 'speed_boost' },
  
  { power_id: 'dragon', label: 'Dragon', image_path: '/powers/dragon.png', rarity: 'epic', effect: 'zone_unlock_boost' },
  { power_id: 'flash', label: 'Thunder', image_path: '/powers/flash.png', rarity: 'epic', effect: 'speed_boost' },
  { power_id: 'hades', label: 'Hades', image_path: '/powers/hades.png', rarity: 'epic', effect: 'zone_unlock_boost' },
  { power_id: 'nuclear-bomb', label: 'Nuclear Bomb', image_path: '/powers/nuclear-bomb.png', rarity: 'epic', effect: 'nearby_collectible_detection' },
  { power_id: 'thor-hammer', label: 'Thor Hammer', image_path: '/powers/thor-hammer.png', rarity: 'epic', effect: 'zone_unlock_boost' },
];

export function pickRandomCollectiblePower(): PowerDef {
  const roll = Math.random();
  let pool: PowerDef[];
  if (roll < 0.60)       pool = COLLECTIBLE_POWER_POOL.filter(p => p.rarity === 'common');
  else if (roll < 0.90)  pool = COLLECTIBLE_POWER_POOL.filter(p => p.rarity === 'rare');
  else                   pool = COLLECTIBLE_POWER_POOL.filter(p => p.rarity === 'epic');
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getPowerById(id: string): PowerDef | undefined {
  return COLLECTIBLE_POWER_POOL.find(p => p.power_id === id);
}
