
import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';
import { Skull, LogOut, ChevronRight, BookOpen, PlayCircle, Trophy, User, Trash2, Settings } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onContinue?: () => void;
  hasSave?: boolean;
  onStoryline: () => void;
  onCredits: () => void;
  onBack: () => void;
  onLeaderboard: () => void;
  onDeleteAccount: () => void;
  onSettings: () => void;
  playHoverSound: () => void;
  playSelectSound: () => void;
  money: number;
  username: string;
}

export const MainMenu: React.FC<MainMenuProps> = ({ 
  onStart, 
  onContinue,
  hasSave,
  onStoryline,
  onCredits, 
  onBack, 
  onLeaderboard,
  onDeleteAccount,
  onSettings,
  playHoverSound, 
  playSelectSound,
  money,
  username
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const menuItems: MenuItem[] = [];

  if (hasSave && onContinue) {
      menuItems.push({
          id: 'continue',
          label: 'CONTINUE OPERATION',
          action: onContinue,
          description: 'RESUME PREVIOUS DISPATCH SESSION. DATA PERSISTED.'
      });
  }

  menuItems.push(
    { 
      id: 'start', 
      label: 'START RANDOM MISSION', 
      action: onStart, 
      description: 'INITIATE NEW DISPATCH SEQUENCE. REWARD: $1000.' 
    },
    { 
      id: 'story', 
      label: 'STORYLINE', 
      action: onStoryline, 
      description: 'ACCESS RECOVERED AUDIO LOGS AND MISSION CONTEXT.' 
    },
    {
      id: 'leaderboard',
      label: 'LEADERBOARD',
      action: onLeaderboard,
      description: 'VIEW GLOBAL RANKINGS AND OPERATIVE SCORES.'
    },
    {
      id: 'settings',
      label: 'ACCOUNT SETTINGS',
      action: onSettings,
      description: 'MANAGE OPERATIVE ALIAS AND SECURITY CREDENTIALS.'
    },
    { 
      id: 'credits', 
      label: 'CREDITS', 
      action: onCredits, 
      description: 'VIEW DEVELOPMENT STAFF AND CASUALTY REPORTS.' 
    },
    { 
      id: 'delete', 
      label: confirmDelete ? 'CONFIRM DELETION?' : 'DELETE ACCOUNT', 
      action: () => {
          if (confirmDelete) {
              onDeleteAccount();
          } else {
              setConfirmDelete(true);
              // Reset confirmation after 3 seconds if not clicked
              setTimeout(() => setConfirmDelete(false), 3000);
          }
      }, 
      description: confirmDelete ? 'WARNING: THIS ACTION IS PERMANENT. ALL DATA WILL BE ERASED.' : 'ERASE CURRENT OPERATIVE PROFILE AND DATA.' 
    },
    { 
      id: 'exit', 
      label: 'EXIT SYSTEM', 
      action: onBack, 
      description: 'TERMINATE SESSION AND RETURN TO TITLE SCREEN.' 
    }
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => {
        playHoverSound();
        return prev > 0 ? prev - 1 : menuItems.length - 1;
      });
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => {
        playHoverSound();
        return prev < menuItems.length - 1 ? prev + 1 : 0;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      menuItems[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onBack();
    }
  }, [menuItems, selectedIndex, onBack, playHoverSound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center relative px-4 md:px-24">
      
      <div className="flex flex-col w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 md:mb-12 border-b-4 border-red-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h2 className="text-5xl md:text-7xl font-['Black_Ops_One'] text-zinc-200 tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              MAIN MENU
            </h2>
            <p className="text-red-600 font-mono text-sm tracking-[0.2em] animate-pulse uppercase">
              // Authorized Personnel Only
            </p>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0 w-full md:w-auto">
            <span className="text-zinc-600 font-mono text-xs block">SYS_READY</span>
            <div className="mt-1 flex items-center md:justify-end gap-2 text-zinc-400 text-xs">
                <User size={12} /> {username || 'UNKNOWN'}
            </div>
            <div className="mt-1 text-green-500 font-mono text-xl flex items-center md:justify-end gap-1">
                ${money}
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="flex flex-col gap-3 md:gap-4 w-full md:w-2/3">
          {menuItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isDelete = item.id === 'delete';
            const isConfirming = isDelete && confirmDelete;
            
            return (
              <div 
                key={item.id}
                className={`
                  relative group cursor-pointer transition-all duration-75 ease-linear
                  flex items-center justify-between px-4 md:px-6 py-3 md:py-3 border-l-8
                  ${isSelected 
                    ? isConfirming ? 'bg-red-950 border-red-600 translate-x-2' : 'bg-red-900/20 border-red-600 translate-x-2' 
                    : 'bg-transparent border-zinc-800 hover:border-zinc-600 text-zinc-600'}
                `}
                onClick={() => item.action()}
                onMouseEnter={() => {
                  if (selectedIndex !== index) {
                    setSelectedIndex(index);
                    playHoverSound();
                  }
                }}
              >
                {/* Label */}
                <div className="flex items-center gap-4 relative z-10">
                  {isSelected && <ChevronRight className="text-red-500 w-4 h-4 md:w-6 md:h-6 animate-pulse" />}
                  <span className={`
                    text-2xl md:text-4xl font-['VT323'] tracking-widest uppercase transition-colors
                    ${isSelected 
                      ? isConfirming ? 'text-red-500 font-bold animate-pulse' : 'text-zinc-100 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]' 
                      : 'text-zinc-500'}
                  `}>
                    {item.label}
                  </span>
                </div>

                {/* Icon (Conditional) */}
                <div className={`transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                   {item.id === 'start' && <Skull className="text-red-600 w-5 h-5" />}
                   {item.id === 'continue' && <PlayCircle className="text-green-500 w-5 h-5" />}
                   {item.id === 'story' && <BookOpen className="text-yellow-600 w-5 h-5" />}
                   {item.id === 'leaderboard' && <Trophy className="text-yellow-500 w-5 h-5" />}
                   {item.id === 'settings' && <Settings className="text-zinc-400 w-5 h-5" />}
                   {item.id === 'delete' && <Trash2 className="text-red-600 w-5 h-5" />}
                   {item.id === 'exit' && <LogOut className="text-zinc-500 w-5 h-5" />}
                </div>

                {/* Scanline Texture */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoNHYxSDB6IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-50 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Description Box */}
      <div className="absolute bottom-12 w-full max-w-3xl px-4 hidden md:block">
        <div className="border-t-2 border-zinc-800 pt-2 flex items-start gap-2">
          <div className="w-3 h-3 bg-red-600 mt-1 animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
          <p className="font-mono text-zinc-400 text-sm md:text-base tracking-wider uppercase leading-relaxed">
            <span className="text-red-600 font-bold mr-2">INFO:</span>
            {menuItems[selectedIndex]?.description}
          </p>
        </div>
      </div>

    </div>
  );
};
