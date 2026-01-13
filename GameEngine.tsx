
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CHARACTERS, WEAPONS } from './constants';
import { Ghost, Projectile, Particle, PlayerProfile } from './types';
import { audioService } from './audioService';

interface GameEngineProps {
  profile: PlayerProfile;
  onUpdateProfile: (p: PlayerProfile) => void;
  onWinLevel: () => void;
  onGameOver: () => void;
  isPaused: boolean;
}

const GameEngine: React.FC<GameEngineProps> = ({ 
  profile, 
  onUpdateProfile, 
  onWinLevel, 
  onGameOver,
  isPaused 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs (to avoid closures in loop)
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    hp: 100,
    maxHp: 100,
    speed: CHARACTERS.find(c => c.id === profile.selectedCharacter)?.speed || 4,
    color: CHARACTERS.find(c => c.id === profile.selectedCharacter)?.color || '#fff',
    lastShot: 0,
    dir: { x: 0, y: 0 }
  });

  const ghostsRef = useRef<Ghost[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ghostCatchProgressRef = useRef(0);
  const targetGhostCount = 10 + profile.currentLevel * 2;
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const spawnGhost = useCallback(() => {
    const type = ['shadow', 'poltergeist', 'banshee', 'wraith'][Math.floor(Math.random() * 4)] as any;
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = Math.random() * CANVAS_WIDTH; y = -50; }
    if (side === 1) { x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + 50; }
    if (side === 2) { x = -50; y = Math.random() * CANVAS_HEIGHT; }
    if (side === 3) { x = CANVAS_WIDTH + 50; y = Math.random() * CANVAS_HEIGHT; }

    ghostsRef.current.push({
      id: Math.random().toString(),
      x, y, type,
      hp: 50 + profile.currentLevel * 10,
      maxHp: 50 + profile.currentLevel * 10,
      speed: 1 + Math.random() * (profile.currentLevel * 0.2),
      size: 20 + Math.random() * 10
    });
  }, [profile.currentLevel]);

  const update = useCallback((time: number) => {
    if (isPaused) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const player = playerRef.current;
    
    // Movement
    if (keysRef.current['w'] || keysRef.current['ArrowUp']) player.y -= player.speed;
    if (keysRef.current['s'] || keysRef.current['ArrowDown']) player.y += player.speed;
    if (keysRef.current['a'] || keysRef.current['ArrowLeft']) player.x -= player.speed;
    if (keysRef.current['d'] || keysRef.current['ArrowRight']) player.x += player.speed;

    // Boundary check
    player.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, player.x));
    player.y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, player.y));

    // Shooting (Space)
    const weapon = WEAPONS.find(w => w.id === profile.selectedWeapon) || WEAPONS[0];
    if (keysRef.current[' '] && time - player.lastShot > (500 / (weapon.speed/5))) {
      audioService.playSFX('fire');
      projectilesRef.current.push({
        x: player.x,
        y: player.y,
        vx: 0,
        vy: -10, // Default up for now
        damage: weapon.damage,
        type: weapon.id
      });
      player.lastShot = time;
    }

    // Spawn ghosts
    if (ghostsRef.current.length < 5 && Math.random() < 0.02) {
      spawnGhost();
    }

    // Update Projectiles
    projectilesRef.current.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > CANVAS_WIDTH || p.y < 0 || p.y > CANVAS_HEIGHT) {
        projectilesRef.current.splice(idx, 1);
      }
    });

    // Update Ghosts
    ghostsRef.current.forEach((g, gIdx) => {
      const dx = player.x - g.x;
      const dy = player.y - g.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      g.x += (dx / dist) * g.speed;
      g.y += (dy / dist) * g.speed;

      // Check collision with player
      if (dist < player.speed + g.size) {
        player.hp -= 0.5;
        if (player.hp <= 0) {
          onGameOver();
        }
      }

      // Check collision with projectiles
      projectilesRef.current.forEach((p, pIdx) => {
        const pdx = p.x - g.x;
        const pdy = p.y - g.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < g.size) {
          g.hp -= p.damage;
          projectilesRef.current.splice(pIdx, 1);
          
          // Particles
          for (let i = 0; i < 5; i++) {
            particlesRef.current.push({
              x: g.x, y: g.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 1,
              color: '#fff'
            });
          }

          if (g.hp <= 0) {
            ghostsRef.current.splice(gIdx, 1);
            ghostCatchProgressRef.current += 1;
            audioService.playSFX('whoosh');
            onUpdateProfile({
              ...profile,
              coins: profile.coins + 10,
              xp: profile.xp + 20
            });
            if (ghostCatchProgressRef.current >= targetGhostCount) {
              onWinLevel();
            }
          }
        }
      });
    });

    // Particles update
    particlesRef.current.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) particlesRef.current.splice(idx, 1);
    });

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [isPaused, spawnGhost, onUpdateProfile, onGameOver, onWinLevel, profile, targetGhostCount]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0c0c0c';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Grid (Simulating Tilemap)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
      ctx.fillRect(p.x, p.y, 4, 4);
    });

    // Draw Player (Pixel Art Style)
    const p = playerRef.current;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 15, p.y - 15, 30, 30);
    // Face
    ctx.fillStyle = '#000';
    ctx.fillRect(p.x - 10, p.y - 10, 5, 5);
    ctx.fillRect(p.x + 5, p.y - 10, 5, 5);
    ctx.fillRect(p.x - 5, p.y + 5, 10, 2);

    // Draw Ghosts
    ghostsRef.current.forEach(g => {
      ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(g.x - 5, g.y - 5, 3, 3);
      ctx.fillRect(g.x + 2, g.y - 5, 3, 3);
      // HP Bar
      ctx.fillStyle = '#555';
      ctx.fillRect(g.x - 15, g.y - 25, 30, 5);
      ctx.fillStyle = '#f00';
      ctx.fillRect(g.x - 15, g.y - 25, (g.hp / g.maxHp) * 30, 5);
    });

    // Draw Projectiles
    projectilesRef.current.forEach(pr => {
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // HUD in Canvas (Basic)
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText(`HEALTH: ${Math.ceil(p.hp)}`, 20, 30);
    ctx.fillText(`GHOSTS: ${ghostCatchProgressRef.current}/${targetGhostCount}`, 20, 60);
    ctx.fillText(`COINS: ${profile.coins}`, 20, 90);
    ctx.fillText(`XP: ${profile.xp}`, 20, 120);
    
    // Level progress bar
    ctx.fillStyle = '#333';
    ctx.fillRect(CANVAS_WIDTH/2 - 100, 20, 200, 20);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(CANVAS_WIDTH/2 - 100, 20, (ghostCatchProgressRef.current/targetGhostCount) * 200, 20);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="pixel-border max-w-full h-auto bg-black"
      />
      
      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 md:hidden">
         <button 
           className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white"
           onMouseDown={() => { keysRef.current['ArrowUp'] = true; }}
           onMouseUp={() => { keysRef.current['ArrowUp'] = false; }}
           onTouchStart={() => { keysRef.current['ArrowUp'] = true; }}
           onTouchEnd={() => { keysRef.current['ArrowUp'] = false; }}
         >↑</button>
         <div className="flex gap-2">
            <button 
              className="w-12 h-12 bg-white/20 rounded-full text-white"
              onMouseDown={() => { keysRef.current['ArrowLeft'] = true; }}
              onMouseUp={() => { keysRef.current['ArrowLeft'] = false; }}
              onTouchStart={() => { keysRef.current['ArrowLeft'] = true; }}
              onTouchEnd={() => { keysRef.current['ArrowLeft'] = false; }}
            >←</button>
            <button 
              className="w-12 h-12 bg-white/20 rounded-full text-white"
              onMouseDown={() => { keysRef.current['ArrowDown'] = true; }}
              onMouseUp={() => { keysRef.current['ArrowDown'] = false; }}
              onTouchStart={() => { keysRef.current['ArrowDown'] = true; }}
              onTouchEnd={() => { keysRef.current['ArrowDown'] = false; }}
            >↓</button>
            <button 
              className="w-12 h-12 bg-white/20 rounded-full text-white"
              onMouseDown={() => { keysRef.current['ArrowRight'] = true; }}
              onMouseUp={() => { keysRef.current['ArrowRight'] = false; }}
              onTouchStart={() => { keysRef.current['ArrowRight'] = true; }}
              onTouchEnd={() => { keysRef.current['ArrowRight'] = false; }}
            >→</button>
         </div>
      </div>

      <div className="absolute bottom-4 right-4 md:hidden">
          <button 
            className="w-20 h-20 bg-red-600/50 rounded-full text-white font-bold border-4 border-white"
            onMouseDown={() => { keysRef.current[' '] = true; }}
            onMouseUp={() => { keysRef.current[' '] = false; }}
            onTouchStart={() => { keysRef.current[' '] = true; }}
            onTouchEnd={() => { keysRef.current[' '] = false; }}
          >CATCH!</button>
      </div>

      <div className="absolute top-4 right-4">
        <button 
          onClick={onGameOver}
          className="bg-red-900 text-white px-4 py-2 text-xs pixel-border"
        >EXIT</button>
      </div>
    </div>
  );
};

export default GameEngine;
