
import { Character, Weapon, Skill } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const CHARACTERS: Character[] = [
  { id: 'male', name: 'Rohan', color: '#4d9be6', speed: 4, unlocked: true, desc: 'Balanced explorer.' },
  { id: 'female', name: 'Maya', color: '#e64d9b', speed: 5, unlocked: false, desc: 'Agile spirit seeker.' },
  { id: 'elder', name: 'Dada Ji', color: '#e69b4d', speed: 3, unlocked: false, desc: 'Wise master of traps.' },
  { id: 'teen', name: 'Aryan', color: '#9be64d', speed: 6, unlocked: false, desc: 'Energetic ghost hunter.' },
];

export const WEAPONS: Weapon[] = [
  { id: 'net', name: 'Ghost Net', damage: 20, speed: 7, unlocked: true, cost: 0 },
  { id: 'electric', name: 'Electric Trap', damage: 35, speed: 8, unlocked: false, cost: 500 },
  { id: 'holy', name: 'Holy Water', damage: 50, speed: 6, unlocked: false, cost: 1200 },
  { id: 'gun', name: 'Spirit Gun', damage: 70, speed: 12, unlocked: false, cost: 2500 },
  { id: 'bomb', name: 'Ghost Bomb', damage: 150, speed: 4, unlocked: false, cost: 5000 },
  { id: 'blade', name: 'Exorcist Blade', damage: 300, speed: 10, unlocked: false, cost: 10000 },
];

export const SKILLS: Skill[] = [
  { id: 'trap', name: 'Basic Trap', unlocked: true, cost: 0, description: 'Default catching tool.' },
  { id: 'radar', name: 'Ghost Radar', unlocked: false, cost: 300, description: 'See ghosts off-screen.' },
  { id: 'speed', name: 'Speed Boost', unlocked: false, cost: 800, description: 'Increase move speed by 20%.' },
  { id: 'shield', name: 'Damage Shield', unlocked: false, cost: 1500, description: 'Block one hit every 10s.' },
  { id: 'super', name: 'Super Trap', unlocked: false, cost: 3000, description: 'Catches ghosts instantly.' },
];

export const LEVELS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Level ${i + 1}: ${i < 5 ? 'Haunted House' : i < 10 ? 'Graveyard' : i < 15 ? 'Dark Forest' : 'Mansion'}`,
  ghostCount: 10 + i * 2,
  difficulty: 1 + i * 0.2,
}));
