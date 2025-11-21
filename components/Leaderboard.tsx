
import React, { useMemo, useState } from 'react';
import { Trophy, Globe, User, ArrowLeft, Crosshair, BookOpen, Activity, DollarSign } from 'lucide-react';
import { UserData } from '../types';

interface LeaderboardProps {
  onBack: () => void;
  currentUser: UserData | null;
  allUsers: UserData[];
}

type RankMode = 'story' | 'missions' | 'winstreak' | 'money';

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, currentUser, allUsers }) => {
  const [rankMode, setRankMode] = useState<RankMode>('story');
  
  const rankings = useMemo(() => {
      // Sort based on selected mode
      const sorted = [...allUsers].sort((a, b) => {
          if (rankMode === 'story') {
              return b.unlockedStories.length - a.unlockedStories.length;
          } else if (rankMode === 'missions') {
              return (b.missionsCompleted || 0) - (a.missionsCompleted || 0);
          } else if (rankMode === 'winstreak') {
              return (b.bestWinstreak || 0) - (a.bestWinstreak || 0);
          } else {
              return (b.money || 0) - (a.money || 0);
          }
      });
      
      return sorted.map((u, i) => ({
          rank: i + 1,
          name: u.username,
          score: rankMode === 'story' ? u.unlockedStories.length : rankMode === 'missions' ? (u.missionsCompleted || 0) : rankMode === 'winstreak' ? (u.bestWinstreak || 0) : (u.money || 0),
          isMe: currentUser ? u.username === currentUser.username : false
      }));
  }, [allUsers, currentUser, rankMode]);

  const getModeLabel = () => {
      switch(rankMode) {
          case 'story': return 'INTEL SCORE';
          case 'missions': return 'MISSIONS';
          case 'winstreak': return 'BEST STREAK';
          case 'money': return 'WEALTH';
      }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-12 bg-black/90 z-50 absolute inset-0 backdrop-blur-sm">
        <div className="w-full max-w-4xl border-2 border-yellow-600 bg-zinc-900 flex flex-col relative shadow-[0_0_50px_rgba(255,200,0,0.2)] h-[80vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-yellow-600 bg-black flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <Trophy className="text-yellow-500 w-8 h-8" />
                    <div>
                        <h1 className="font-['Black_Ops_One'] text-3xl text-yellow-500">GLOBAL RANKINGS</h1>
                        <p className="font-mono text-zinc-500 text-xs tracking-widest">TOP OPERATIVES // LIVE DATA</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                    <button 
                        onClick={() => setRankMode('story')}
                        className={`flex items-center gap-2 px-4 py-2 font-mono text-sm border-2 transition-colors ${rankMode === 'story' ? 'border-yellow-500 bg-yellow-900/20 text-yellow-100' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}
                    >
                        <BookOpen size={14} /> STORY
                    </button>
                    <button 
                        onClick={() => setRankMode('missions')}
                        className={`flex items-center gap-2 px-4 py-2 font-mono text-sm border-2 transition-colors ${rankMode === 'missions' ? 'border-yellow-500 bg-yellow-900/20 text-yellow-100' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}
                    >
                        <Crosshair size={14} /> MISSIONS
                    </button>
                    <button 
                        onClick={() => setRankMode('winstreak')}
                        className={`flex items-center gap-2 px-4 py-2 font-mono text-sm border-2 transition-colors ${rankMode === 'winstreak' ? 'border-yellow-500 bg-yellow-900/20 text-yellow-100' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}
                    >
                        <Activity size={14} /> STREAK
                    </button>
                    <button 
                        onClick={() => setRankMode('money')}
                        className={`flex items-center gap-2 px-4 py-2 font-mono text-sm border-2 transition-colors ${rankMode === 'money' ? 'border-yellow-500 bg-yellow-900/20 text-yellow-100' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}
                    >
                        <DollarSign size={14} /> WEALTH
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-zinc-900/50">
                <div className="grid grid-cols-12 text-zinc-500 font-mono text-sm mb-4 px-4">
                    <div className="col-span-2">RANK</div>
                    <div className="col-span-7">OPERATIVE ID</div>
                    <div className="col-span-3 text-right">{getModeLabel()}</div>
                </div>
                
                {rankings.length === 0 ? (
                    <div className="text-center text-zinc-500 font-mono py-12">NO DATA AVAILABLE</div>
                ) : (
                    rankings.map((player) => (
                        <div 
                            key={player.rank}
                            className={`
                                grid grid-cols-12 items-center p-4 font-['VT323'] text-2xl border-l-4
                                ${player.isMe 
                                    ? 'bg-yellow-900/20 border-yellow-500 text-yellow-100' 
                                    : 'bg-black border-zinc-800 text-zinc-400'}
                            `}
                        >
                            <div className="col-span-2 font-['Black_Ops_One'] text-xl">#{player.rank}</div>
                            <div className="col-span-7 flex items-center gap-2">
                                {player.isMe && <User size={16} className="text-yellow-500" />}
                                {player.name}
                            </div>
                            <div className="col-span-3 text-right text-yellow-600">
                                {rankMode === 'money' ? `$${player.score}` : player.score}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-black flex justify-between items-center">
                <div className="text-xs font-mono text-zinc-600">
                    TOTAL AGENTS: {allUsers.length}
                </div>
                <button 
                    onClick={onBack}
                    className="px-6 py-2 border border-zinc-600 text-zinc-400 hover:text-white hover:border-white font-mono flex items-center gap-2 transition-all"
                >
                    <ArrowLeft size={16} /> RETURN
                </button>
            </div>
        </div>
    </div>
  );
};
