
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerProfile } from './types';
import { LEVELS, CHARACTERS, WEAPONS, SKILLS, CANVAS_WIDTH } from './constants';
import { audioService } from './audioService';
import GameEngine from './GameEngine';

const INITIAL_PROFILE: PlayerProfile = {
  name: '',
  coins: 0,
  stars: 0,
  xp: 0,
  currentLevel: 1,
  unlockedLevels: 1,
  unlockedCharacters: ['male'],
  unlockedSkills: ['trap'],
  unlockedWeapons: ['net'],
  selectedCharacter: 'male',
  selectedWeapon: 'net',
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [profile, setProfile] = useState<PlayerProfile>(INITIAL_PROFILE);
  const [isPaused, setIsPaused] = useState(false);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('spirit_hunter_save');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Save persistence
  useEffect(() => {
    if (profile.name) {
      localStorage.setItem('spirit_hunter_save', JSON.stringify(profile));
    }
  }, [profile]);

  const handleStartGame = () => {
    audioService.init();
    audioService.startMusic();
    if (profile.name) {
      setGameState('MAIN_MENU');
    } else {
      setGameState('NAME_INPUT');
    }
  };

  const handleNameSubmit = (name: string) => {
    const newProfile = { ...profile, name };
    setProfile(newProfile);
    setGameState('MAIN_MENU');
    
    // Mock server hit
    fetch('https://jsonplaceholder.typicode.com/users', {
      method: 'POST',
      body: JSON.stringify({ name, score: 0 }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' }
    });
  };

  const winLevel = () => {
    audioService.playSFX('win');
    const nextLvl = profile.currentLevel + 1;
    const unlocked = Math.max(profile.unlockedLevels, nextLvl);
    setProfile(prev => ({
      ...prev,
      currentLevel: nextLvl,
      unlockedLevels: unlocked,
      coins: prev.coins + 100,
      stars: prev.stars + 1
    }));
    setGameState('WIN');
  };

  const gameOver = () => {
    audioService.playSFX('damage');
    setGameState('MAIN_MENU');
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[800px] aspect-[4/3] bg-black text-white pixel-border overflow-hidden relative">
        
        {/* Screen: Intro Cutscene */}
        {gameState === 'INTRO' && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#0a0a1a]">
            <div className="w-24 h-24 mb-4 bg-blue-200/50 rounded-full animate-bounce flex items-center justify-center">
               <span className="text-4xl">👻</span>
            </div>
            <h1 className="text-xl mb-4 text-blue-300">Spirit Guide:</h1>
            <p className="text-sm mb-8 leading-loose">
              "Namaste dost! Main hoon Spirit Guide.<br/>
              Spirit world mein welcome! Bhoot pakdo bhai!"
            </p>
            <button 
              onClick={handleStartGame}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 pixel-border"
            >
              CHALIYE SHURU KARTE HAIN!
            </button>
            <div className="absolute bottom-4 text-[10px] opacity-50">
               By Anmol & Anshul Raj
            </div>
          </div>
        )}

        {/* Screen: Name Input */}
        {gameState === 'NAME_INPUT' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-lg mb-8">APNA NAAM BATAO:</h2>
            <input 
              type="text" 
              placeholder="Hunter Name..."
              className="bg-gray-800 border-4 border-white p-4 mb-8 text-center uppercase focus:outline-none w-64"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit((e.target as HTMLInputElement).value);
              }}
              autoFocus
            />
            <p className="text-[10px] opacity-70">Press Enter to Confirm</p>
          </div>
        )}

        {/* Screen: Main Menu */}
        {gameState === 'MAIN_MENU' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4 bg-[url('https://picsum.photos/800/600?grayscale&blur=5')] bg-cover">
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <h1 className="text-2xl text-blue-400 mb-8 drop-shadow-lg">SPIRIT WORLD HUNTER</h1>
              <button onClick={() => setGameState('LEVEL_SELECT')} className="w-64 py-3 bg-blue-600 hover:bg-blue-500 pixel-border">HUNT GHOSTS</button>
              <button onClick={() => setGameState('CHAR_SELECT')} className="w-64 py-3 bg-purple-600 hover:bg-purple-500 pixel-border">CHARACTERS</button>
              <button onClick={() => setGameState('STATS')} className="w-64 py-3 bg-gray-700 hover:bg-gray-600 pixel-border">PLAYER DASHBOARD</button>
              <div className="mt-8 text-xs flex gap-4">
                <span>💰 {profile.coins}</span>
                <span>⭐ {profile.stars}</span>
                <span>🔥 Lvl {profile.currentLevel}</span>
              </div>
            </div>
          </div>
        )}

        {/* Screen: Stats Dashboard */}
        {gameState === 'STATS' && (
          <div className="w-full h-full p-8 flex flex-col bg-[#111]">
            <h2 className="text-lg text-center mb-8 border-b-4 border-white pb-4">PLAYER STATS</h2>
            <div className="grid grid-cols-2 gap-4 text-xs mb-8">
               <div className="p-4 bg-gray-800 pixel-border">TOTAL PLAYERS: 1247</div>
               <div className="p-4 bg-gray-800 pixel-border">YOUR RANK: #45</div>
               <div className="p-4 bg-gray-800 pixel-border">GHOSTS CAUGHT: {profile.xp / 2}</div>
               <div className="p-4 bg-gray-800 pixel-border">NAME: {profile.name}</div>
            </div>
            <button onClick={() => setGameState('MAIN_MENU')} className="mt-auto py-2 bg-red-800 pixel-border text-xs">BACK</button>
          </div>
        )}

        {/* Screen: Level Select */}
        {gameState === 'LEVEL_SELECT' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#050510]">
             <h2 className="text-lg mb-8">SELECT LEVEL</h2>
             <div className="grid grid-cols-4 gap-4">
                {LEVELS.map(lvl => (
                  <button 
                    key={lvl.id}
                    disabled={lvl.id > profile.unlockedLevels}
                    onClick={() => {
                        setProfile(p => ({ ...p, currentLevel: lvl.id }));
                        setGameState('PLAYING');
                    }}
                    className={`aspect-square flex items-center justify-center text-xs pixel-border transition-all
                      ${lvl.id <= profile.unlockedLevels ? 'bg-blue-800 hover:bg-blue-600 cursor-pointer' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
                  >
                    {lvl.id}
                  </button>
                ))}
             </div>
             <button onClick={() => setGameState('MAIN_MENU')} className="mt-8 py-2 w-full bg-red-800 pixel-border text-xs">BACK</button>
          </div>
        )}

        {/* Screen: Character Select */}
        {gameState === 'CHAR_SELECT' && (
          <div className="w-full h-full p-8 flex flex-col bg-[#050510]">
             <h2 className="text-lg mb-8 text-center">CHOOSE HUNTER</h2>
             <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
                {CHARACTERS.map(c => {
                   const isUnlocked = profile.unlockedCharacters.includes(c.id);
                   const isSelected = profile.selectedCharacter === c.id;
                   return (
                     <div key={c.id} className={`p-4 pixel-border flex flex-col items-center gap-2 ${isSelected ? 'border-yellow-400 bg-yellow-900/20' : 'bg-gray-900'}`}>
                        <div className="w-12 h-12" style={{ backgroundColor: c.color }}></div>
                        <div className="text-[10px] font-bold">{c.name}</div>
                        <div className="text-[8px] opacity-70 text-center">{c.desc}</div>
                        {isUnlocked ? (
                          <button 
                            onClick={() => setProfile(p => ({ ...p, selectedCharacter: c.id }))}
                            className={`mt-auto text-[8px] py-2 px-4 pixel-border ${isSelected ? 'bg-green-600' : 'bg-blue-600'}`}
                          >
                            {isSelected ? 'SELECTED' : 'SELECT'}
                          </button>
                        ) : (
                          <button className="mt-auto text-[8px] py-2 px-4 bg-gray-700 pixel-border">LOCKED</button>
                        )}
                     </div>
                   );
                })}
             </div>
             <button onClick={() => setGameState('MAIN_MENU')} className="mt-4 py-2 bg-red-800 pixel-border text-xs">BACK</button>
          </div>
        )}

        {/* Screen: Gameplay */}
        {gameState === 'PLAYING' && (
          <GameEngine 
            profile={profile} 
            isPaused={isPaused}
            onUpdateProfile={setProfile}
            onWinLevel={winLevel}
            onGameOver={gameOver}
          />
        )}

        {/* Screen: Level Win */}
        {gameState === 'WIN' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/90">
             <h1 className="text-2xl text-yellow-400 mb-4 animate-pulse">LEVEL COMPLETE!</h1>
             <p className="text-xs mb-8">Excellent work, Hunter {profile.name}!</p>
             <div className="flex gap-8 mb-12">
                <div className="flex flex-col items-center">
                   <span className="text-2xl">💰</span>
                   <span className="text-xs">+100</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-2xl">⭐</span>
                   <span className="text-xs">+1</span>
                </div>
             </div>
             {profile.currentLevel >= 21 ? (
                <button onClick={() => setGameState('CREDITS')} className="py-4 px-8 bg-green-600 pixel-border">FINISH GAME</button>
             ) : (
                <button onClick={() => setGameState('LEVEL_SELECT')} className="py-4 px-8 bg-blue-600 pixel-border">NEXT MISSION</button>
             )}
          </div>
        )}

        {/* Screen: Credits */}
        {gameState === 'CREDITS' && (
           <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-black">
              <h1 className="text-xl text-yellow-500 mb-8">GAME COMPLETED</h1>
              <p className="text-sm mb-4">You have cleared the Spirit World!</p>
              <p className="text-xs mb-12">Total Coins: {profile.coins} | XP: {profile.xp}</p>
              <h2 className="text-lg text-blue-400 mb-2">CREDITS</h2>
              <p className="text-[10px] mb-8">Created by:<br/>Anmol & Anshul Raj</p>
              <button 
                onClick={() => { setProfile(INITIAL_PROFILE); setGameState('INTRO'); }}
                className="py-4 px-8 bg-red-600 pixel-border"
              >PLAY AGAIN</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
