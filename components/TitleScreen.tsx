import React, { useEffect, useState } from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [showPressStart, setShowPressStart] = useState(true);

  // Blink effect for Press Start
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPressStart((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Listen for any key
  useEffect(() => {
    const handleKeyDown = () => {
      onStart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div 
      className="flex flex-col items-center justify-center text-center space-y-12 w-full cursor-pointer"
      onClick={onStart}
    >
      {/* Main Title Block */}
      <div className="relative group">
        {/* Glitch Layers */}
        <h1 
          className="text-7xl md:text-9xl font-['Black_Ops_One'] text-red-600 tracking-widest relative z-10 drop-shadow-[0_0_15px_rgba(220,20,60,0.6)]"
          style={{ textShadow: '4px 4px 0px #1a0505' }}
        >
          DEATHWISH
        </h1>
        <h1 
          className="absolute top-0 left-0 text-7xl md:text-9xl font-['Black_Ops_One'] text-cyan-400 tracking-widest opacity-30 animate-glitch z-0"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-2px, -2px)' }}
        >
          DEATHWISH
        </h1>
        <h1 
          className="absolute top-0 left-0 text-7xl md:text-9xl font-['Black_Ops_One'] text-green-500 tracking-widest opacity-30 animate-glitch z-0"
          style={{ clipPath: 'polygon(0 80%, 100% 20%, 100% 100%, 0 100%)', transform: 'translate(2px, 2px)', animationDelay: '0.5s' }}
        >
          DEATHWISH
        </h1>
      </div>

      {/* Subtitle / Corporation */}
      <div className="flex flex-col items-center space-y-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-zinc-500 to-transparent"></div>
        <h2 className="text-xl md:text-2xl font-['Share_Tech_Mono'] text-zinc-400 tracking-[0.5em] uppercase">
          [ JunJun Corporation ]
        </h2>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-zinc-500 to-transparent"></div>
        <span className="text-[10px] text-zinc-600 tracking-widest font-mono">EST. 1998 - RACCOON CITY BRANCH</span>
      </div>

      {/* Press Start Prompt */}
      <div className={`mt-16 text-2xl md:text-3xl font-['VT323'] text-green-400 tracking-widest transition-opacity duration-75 ${showPressStart ? 'opacity-100' : 'opacity-0'}`}>
        PRESS ANY KEY TO START
      </div>
    </div>
  );
};