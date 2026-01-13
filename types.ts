
export type GameState = 'INTRO' | 'NAME_INPUT' | 'MAIN_MENU' | 'CHAR_SELECT' | 'STATS' | 'PLAYING' | 'LEVEL_SELECT' | 'PAUSED' | 'WIN' | 'CREDITS';

export interface PlayerProfile {
  name: string;
  coins: number;
  stars: number;
  xp: number;
  currentLevel: number;
  unlockedLevels: number;
  unlockedCharacters: string[];
  unlockedSkills: string[];
  unlockedWeapons: string[];
  selectedCharacter: string;
  selectedWeapon: string;
}

export interface Ghost {
  id: string;
  x: number;
  y: number;
  type: 'shadow' | 'poltergeist' | 'banshee' | 'wraith';
  hp: number;
  maxHp: number;
  speed: number;
  size: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  type: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  speed: number;
  unlocked: boolean;
  desc: string;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  speed: number;
  unlocked: boolean;
  cost: number;
}

export interface Skill {
  id: string;
  name: string;
  unlocked: boolean;
  cost: number;
  description: string;
}
