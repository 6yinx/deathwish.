
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CRTOverlay } from './components/CRTOverlay';
import { BackgroundEffects } from './components/BackgroundEffects';
import { ForegroundEmbers } from './components/ForegroundEmbers';
import { TitleScreen } from './components/TitleScreen';
import { MainMenu } from './components/MainMenu';
import { CreditsScreen } from './components/CreditsScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { DispatchGame } from './components/DispatchGame';
import { StoryReader } from './components/StoryReader';
import { MissionBriefing } from './components/MissionBriefing';
import { MissionDebrief } from './components/MissionDebrief';
import { LoginScreen } from './components/LoginScreen';
import { Leaderboard } from './components/Leaderboard';
import { AccountSettings } from './components/AccountSettings';
import { GameState, UserData } from './types';
import { ShieldAlert, Zap } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const USERS_KEY = 'deathwish_users_v1';
const SESSION_KEY = 'deathwish_session_v1';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [audioEnabled] = useState<boolean>(true);
  const [activeChapterId] = useState<number>(1);
  
  // Global User State
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  
  // Current Player State
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  const [hasSave, setHasSave] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playHoverSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }, []);

  const playSelectSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }, []);

  const playTypingSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
  }, []);

  const playPurchaseSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }, []);

  // Initial Data Load
  useEffect(() => {
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) {
          try {
            // Parse and ensure legacy data structure support
            const parsed: any[] = JSON.parse(storedUsers);
            if (Array.isArray(parsed)) {
              const migrated = parsed.map(u => ({
                  ...u,
                  missionsCompleted: u.missionsCompleted || 0,
                  currentWinstreak: u.currentWinstreak || 0,
                  bestWinstreak: u.bestWinstreak || 0
              }));
              setAllUsers(migrated);
            }
          } catch (error) {
            console.error("Failed to load user data, resetting:", error);
            localStorage.removeItem(USERS_KEY);
          }
      }
  }, []);

  // Check for Save on Menu Load
  useEffect(() => {
      if (gameState === GameState.MAIN_MENU) {
          const sessionSave = localStorage.getItem(SESSION_KEY);
          setHasSave(!!sessionSave);
      }
  }, [gameState]);

  // Persist User Data
  useEffect(() => {
      if (!currentUser) return;
      
      setAllUsers(prevUsers => {
          const index = prevUsers.findIndex(u => u.username === currentUser.username);
          let newUsers;
          
          if (index !== -1) {
              newUsers = [...prevUsers];
              newUsers[index] = currentUser;
          } else {
              newUsers = [...prevUsers, currentUser];
          }
          
          localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
          return newUsers;
      });
  }, [currentUser]); 

  useEffect(() => {
    if (gameState === GameState.INTRO) {
      const timer = setTimeout(() => {
        setGameState(GameState.TITLE_SCREEN);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (!audioEnabled) return;
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player('background-audio', {
        height: '0', width: '0', videoId: 'QN2agCy8OCc',
        playerVars: { 'playsinline': 1, 'autoplay': 1, 'loop': 1, 'playlist': 'QN2agCy8OCc', 'controls': 0, 'disablekb': 1 },
        events: { 'onReady': (event: any) => { event.target.setVolume(20); event.target.playVideo(); } }
      });
    };
  }, [audioEnabled]);

  const handleTitleStart = () => {
      playSelectSound();
      if (!currentUser) {
          setGameState(GameState.LOGIN);
      } else {
          setGameState(GameState.MAIN_MENU);
      }
  };

  const handleLoginAttempt = (name: string, pass: string, mode: 'login' | 'register') => {
      if (mode === 'register') {
          const existingUser = allUsers.find(u => u.username === name);
          if (existingUser) {
              return { success: false, message: "USERNAME TAKEN" };
          }
          const newUser: UserData = {
              username: name,
              password: pass,
              money: 0,
              unlockedStories: [0],
              missionsCompleted: 0,
              currentWinstreak: 0,
              bestWinstreak: 0,
              lastActive: new Date().toISOString()
          };
          setCurrentUser(newUser);
          setGameState(GameState.MAIN_MENU);
          return { success: true };
      } else {
          const existingUser = allUsers.find(u => u.username === name);
          if (!existingUser) {
              return { success: false, message: "USER NOT FOUND" };
          }
          if (existingUser.password !== pass) {
              return { success: false, message: "INVALID PASSWORD" };
          }
          setCurrentUser({ 
              ...existingUser, 
              missionsCompleted: existingUser.missionsCompleted || 0,
              currentWinstreak: existingUser.currentWinstreak || 0,
              bestWinstreak: existingUser.bestWinstreak || 0,
              lastActive: new Date().toISOString() 
          });
          setGameState(GameState.MAIN_MENU);
          return { success: true };
      }
  };

  const handleUpdateUser = (updatedUser: UserData, oldUsername?: string) => {
      if (oldUsername && oldUsername !== updatedUser.username) {
          // Synchronize global list first to avoid duplication issues
           setAllUsers(prev => {
               const newUsers = prev.map(u => u.username === oldUsername ? updatedUser : u);
               localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
               return newUsers;
           });
      }
      setCurrentUser(updatedUser);
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    setAllUsers(prev => {
        const updated = prev.filter(u => u.username !== currentUser.username);
        localStorage.setItem(USERS_KEY, JSON.stringify(updated));
        return updated;
    });
    setCurrentUser(null);
    playPurchaseSound(); 
    setGameState(GameState.TITLE_SCREEN);
  };

  const handleNewGameClick = () => {
    playSelectSound();
    setIsResuming(false);
    setGameState(GameState.MISSION_BRIEFING);
  };

  const handleContinueClick = () => {
      playSelectSound();
      setIsResuming(true);
      setGameState(GameState.DISPATCH_GAME);
  };

  const handleBriefingProceed = () => {
    playSelectSound();
    setGameState(GameState.LOADING);
    setTimeout(() => {
        setGameState(GameState.DISPATCH_GAME);
    }, 3000);
  }

  const handleStorylineClick = () => {
    playSelectSound();
    setGameState(GameState.STORYLINE);
  };

  const handleLeaderboardClick = () => {
    playSelectSound();
    setGameState(GameState.LEADERBOARD);
  }

  const handleSettingsClick = () => {
    playSelectSound();
    setGameState(GameState.ACCOUNT_SETTINGS);
  };

  const handleGameExit = (success: boolean | null) => {
    if (success === true) {
        setGameState(GameState.MISSION_DEBRIEF);
    } else if (success === false) {
        // Mission Failed -> Streak reset
        setCurrentUser(prev => {
            if (!prev) return null;
            return {
                ...prev,
                currentWinstreak: 0,
                bestWinstreak: prev.bestWinstreak // Explicitly preserve the existing best streak
            };
        });
        setGameState(GameState.MAIN_MENU);
    } else {
        // Save & Quit (null) -> Save preserved, streak untouched
        setGameState(GameState.MAIN_MENU);
    }
  };

  const handleDebriefComplete = () => {
      // Mission Success -> Increment streak using functional update
      setCurrentUser(prev => {
          if (!prev) return null;
          const newCurrentStreak = (prev.currentWinstreak || 0) + 1;
          const newBestStreak = Math.max(newCurrentStreak, prev.bestWinstreak || 0);
          
          return {
              ...prev,
              money: prev.money + 1000,
              missionsCompleted: (prev.missionsCompleted || 0) + 1,
              currentWinstreak: newCurrentStreak,
              bestWinstreak: newBestStreak
          };
      });
      setGameState(GameState.MAIN_MENU);
  };

  const handleUnlockStory = (index: number, cost: number) => {
    // Since we need a return value, we check currentUser first
    // But we apply the update functionally to be safe
    if (currentUser && currentUser.money >= cost) {
        setCurrentUser(prev => {
            if(!prev) return null;
            return {
                ...prev,
                money: prev.money - cost,
                unlockedStories: [...prev.unlockedStories, index]
            };
        });
        playPurchaseSound();
        return true;
    } else {
        return false;
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.INTRO:
        return (
          <div className="flex flex-col items-center justify-center h-full text-green-500 font-mono text-sm md:text-lg p-8 z-20 relative">
            <div className="space-y-2 w-full max-w-lg">
              <p className="typing-effect border-r-2 border-green-500 pr-2 animate-pulse">INITIALIZING BIOS...</p>
              <p className="opacity-0 animate-[fadeIn_0.5s_ease-in_0.8s_forwards]">CHECKING PERIPHERALS... OK</p>
              <p className="opacity-0 animate-[fadeIn_0.5s_ease-in_1.4s_forwards]">INITIALIZING AUDIO_DAEMON... OK</p>
              <p className="opacity-0 animate-[fadeIn_0.5s_ease-in_2.0s_forwards]">LOADING JUNJUN KERNEL V4.2.0...</p>
              <p className="opacity-0 animate-[fadeIn_0.5s_ease-in_2.6s_forwards]">MOUNTING DEATHWISH MODULE...</p>
              <p className="opacity-0 animate-[fadeIn_0.5s_ease-in_3.2s_forwards] text-red-500 font-bold">WARNING: UNAUTHORIZED BIOMETRICS DETECTED</p>
            </div>
          </div>
        );
      case GameState.TITLE_SCREEN:
        return <TitleScreen onStart={handleTitleStart} />;
      case GameState.LOGIN:
        return <LoginScreen onAttempt={handleLoginAttempt} playSelectSound={playSelectSound} existingUsers={allUsers.map(u => u.username)} />;
      case GameState.MAIN_MENU:
        return (
          <MainMenu 
            onStart={handleNewGameClick}
            onContinue={handleContinueClick}
            hasSave={hasSave}
            onStoryline={handleStorylineClick}
            onLeaderboard={handleLeaderboardClick}
            onCredits={() => {
              playSelectSound();
              setGameState(GameState.CREDITS);
            }}
            onBack={() => {
              playSelectSound();
              setGameState(GameState.TITLE_SCREEN);
            }}
            onDeleteAccount={handleDeleteAccount}
            onSettings={handleSettingsClick}
            playHoverSound={playHoverSound}
            playSelectSound={playSelectSound}
            money={currentUser?.money || 0}
            username={currentUser?.username || ''}
          />
        );
      case GameState.MISSION_BRIEFING:
        return <MissionBriefing onProceed={handleBriefingProceed} playTypingSound={playTypingSound} />;
      case GameState.DISPATCH_GAME:
        return <DispatchGame chapterId={activeChapterId} onExit={handleGameExit} resume={isResuming} saveKey={SESSION_KEY} />;
      case GameState.MISSION_DEBRIEF:
        return <MissionDebrief onReturnToMenu={handleDebriefComplete} playTypingSound={playTypingSound} />;
      case GameState.STORYLINE:
        return (
            <StoryReader 
                onBack={() => {
                    playSelectSound();
                    setGameState(GameState.MAIN_MENU);
                }} 
                money={currentUser?.money || 0}
                unlockedStories={currentUser?.unlockedStories || []}
                onUnlock={handleUnlockStory}
            />
        );
      case GameState.LEADERBOARD:
        return (
            <Leaderboard 
                onBack={() => {
                    playSelectSound();
                    setGameState(GameState.MAIN_MENU);
                }}
                currentUser={currentUser}
                allUsers={allUsers}
            />
        );
      case GameState.ACCOUNT_SETTINGS:
        return (
             currentUser && <AccountSettings 
                onBack={() => {
                    playSelectSound();
                    setGameState(GameState.MAIN_MENU);
                }}
                currentUser={currentUser}
                allUsers={allUsers}
                onUpdateUser={handleUpdateUser}
                playSelectSound={playSelectSound}
                playPurchaseSound={playPurchaseSound}
             />
        );
      case GameState.CREDITS:
        return (
          <CreditsScreen 
            onBack={() => {
              playSelectSound();
              setGameState(GameState.MAIN_MENU);
            }} 
          />
        );
      case GameState.LOADING:
        return <LoadingScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-vt323 select-none">
      <BackgroundEffects />
      {audioEnabled && <div id="background-audio" className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none" />}
      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start text-xs md:text-sm text-zinc-400 font-mono pointer-events-none mix-blend-screen z-50">
           <div className="flex flex-col gap-1">
             <span className="flex items-center gap-2"><Zap size={12} /> MEM: 64MB OK</span>
             <span>VRAM: 2MB</span>
           </div>
           <div className="flex flex-col gap-1 text-right">
             <span className="flex items-center gap-2 justify-end">SECURE_BOOT <ShieldAlert size={12} /></span>
             <span>{new Date().toLocaleDateString()}</span>
           </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-transparent">
          {renderContent()}
        </div>
        <div className="absolute bottom-4 right-4 text-zinc-500 text-[10px] font-mono mix-blend-screen z-50">
          BUILD: 0.9.5-SECURE // DO NOT DISTRIBUTE
        </div>
      </div>
      {gameState !== GameState.DISPATCH_GAME && <ForegroundEmbers />}
      <CRTOverlay />
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

export default App;
