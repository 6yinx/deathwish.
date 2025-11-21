import React, { useState, useEffect, useCallback } from 'react';
import { FolderOpen, FileWarning, MapPin, Clock, ChevronRight, Crosshair, Archive, Users } from 'lucide-react';

interface ChapterSelectProps {
  onStartChapter: (chapterId: number) => void;
  onBack: () => void;
  playHoverSound: () => void;
  playSelectSound: () => void;
}

const chapters = [
  // SEASON 1: THE OUTBREAK
  {
    id: 1,
    season: 1,
    title: "DEADFALL WOODS",
    location: "Blackwood Forest Sector 4",
    time: "22:00 HOURS",
    description: "Impact imminent. You regain consciousness amidst the twisted wreckage of your transport helicopter in the heart of the Blackwood Forest. With night falling and shadows moving between the trees, you must scavenge what remains and find a path back to civilization before the forest consumes you."
  },
  {
    id: 2,
    season: 1,
    title: "ROUTE 666",
    location: "Old State Highway",
    time: "01:15 HOURS",
    description: "You emerge from the treeline onto the Old State Highway. It's a graveyard of rusted vehicles and forgotten evacuations. The asphalt is cracked, and the silence is deafening. You need to navigate this gauntlet of steel coffins to reach the outskirts of Raccoon City."
  },
  {
    id: 3,
    season: 1,
    title: "LAST STOP FUEL",
    location: "Gas Station Delta",
    time: "03:30 HOURS",
    description: "A solitary gas station flickers in the distance. It offers the promise of supplies and perhaps a working radio. But the lights attract more than just moths. The previous owners didn't leave willingly, and something is scratching at the storeroom door."
  },
  {
    id: 4,
    season: 1,
    title: "SUBURBIA ROT",
    location: "Oakhaven Residential District",
    time: "05:45 HOURS",
    description: "The residential district of Oakhaven was once peaceful. Now, manicured lawns are mass graves and white picket fences are barricades. You must move house to house, avoiding the wandering hordes of former neighbors to find the key to the city gates."
  },
  {
    id: 5,
    season: 1,
    title: "MERCY GENERAL",
    location: "City Hospital",
    time: "08:00 HOURS",
    description: "Your injuries are mounting. Mercy General Hospital stands as a beacon of hope, but it's the epicenter of the outbreak. Within its sterile white halls lies the medicine you need, guarded by patients who refuse to die. Proceed with extreme caution."
  },
  {
    id: 6,
    season: 1,
    title: "METRO CITY PLAZA",
    location: "Downtown Financial District",
    time: "11:20 HOURS",
    description: "The heart of the city. Skyscrapers loom like tombstones. The streets are choked with the undead. Your objective is the JunJun Corporation tower, but the military quarantine walls have turned the downtown area into a pressure cooker of carnage."
  },
  {
    id: 7,
    season: 1,
    title: "THE JUNJUN SPIRE",
    location: "JunJun Corp HQ - Floor 99",
    time: "13:00 HOURS",
    description: "The final ascent. You've breached the lobby of the JunJun Corporation HQ. The CEO's office holds the data. But as the security systems fail, you realize the cure was destroyed days ago. There is no saving the city, only yourself."
  },
  
  // SEASON 2: AFTERMATH
  {
    id: 8,
    season: 2,
    title: "RUBBLE & ASH",
    location: "JunJun Tower Ruins",
    time: "DAY 02 - 06:00",
    description: "The tower has fallen. The data is lost. You pull yourself from the wreckage of the lobby. The illusion of a cure is gone; now only survival remains. You must descend into the sewers to escape the collapsing district before you are buried alive."
  },
  {
    id: 9,
    season: 2,
    title: "STATIC SIGNAL",
    location: "Radio Station KWLF",
    time: "DAY 03 - 14:30",
    description: "You've surfaced in the industrial zone. A repeating broadcast plays on loop: 'Sanctuary for the living.' It's coming from the old radio tower. You need to boost the signal to pinpoint the source, but the noise is attracting a fresh wave of the infected."
  },
  {
    id: 10,
    season: 2,
    title: "IRON ENCLAVE",
    location: "Central Train Depot",
    time: "DAY 05 - 09:00",
    description: "You tracked the signal to the train depot. A group of survivors has fortified an armored locomotive. They have firepower, but they lack trust. Prove your worth by clearing the tracks of the undead horde blocking their departure."
  },
  {
    id: 11,
    season: 2,
    title: "SUPPLY RUN",
    location: "MegaMart Supercenter",
    time: "DAY 06 - 20:00",
    description: "The Enclave accepted you, but the train needs supplies. You team up with a mercenary named 'Rex' to raid the local MegaMart. It's dark, it's enclosed, and it's full of shoppers who never checked out. Watch your fire; resources are scarce."
  },
  {
    id: 12,
    season: 2,
    title: "BAD BLOOD",
    location: "The Scrapyard",
    time: "DAY 08 - 12:00",
    description: "Not all humans are allies. A rival raider gang has stolen the Enclave's fuel reserve. You must infiltrate their scrapyard fortress. Stealth is optional, but violence is mandatory. Retrieve the fuel or the train goes nowhere."
  },
  {
    id: 13,
    season: 2,
    title: "THE FLOOD",
    location: "River Bridge",
    time: "DAY 09 - 17:45",
    description: "The dam upriver has burst. Water is rising, funneling thousands of zombies onto the only bridge out of town. You and the survivors must hold the line in a desperate last stand while the engineer repairs the train's engine."
  },
  {
    id: 14,
    season: 2,
    title: "EXODUS",
    location: "City Limits / Extraction Point",
    time: "DAY 10 - 05:00",
    description: "The train is moving, but the track ends at the cliffside. A military evac chopper is inbound, but it can only take a few. As the infected swarm the wreckage, you must decide who gets on board and who gets left behind."
  }
];

export const ChapterSelect: React.FC<ChapterSelectProps> = ({ 
  onStartChapter, 
  onBack, 
  playHoverSound, 
  playSelectSound 
}) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredChapters = chapters.filter(c => c.season === selectedSeason);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => {
        playHoverSound();
        return prev > 0 ? prev - 1 : filteredChapters.length - 1;
      });
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => {
        playHoverSound();
        return prev < filteredChapters.length - 1 ? prev + 1 : 0;
      });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Switch Season
      playHoverSound();
      setSelectedSeason(prev => prev === 1 ? 2 : 1);
      setSelectedIndex(0);
    } else if (e.key === 'Enter' || e.key === ' ') {
      playSelectSound();
      onStartChapter(filteredChapters[selectedIndex].id);
    } else if (e.key === 'Escape') {
      playSelectSound();
      onBack();
    }
  }, [onStartChapter, onBack, playHoverSound, playSelectSound, selectedIndex, filteredChapters, selectedSeason]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selectedChapter = filteredChapters[selectedIndex];

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-12 relative">
      
      {/* Container */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 h-[80vh]">
        
        {/* Left Side: Chapter List */}
        <div className="flex-1 flex flex-col border-r-2 border-zinc-800 pr-8 relative bg-black/80 backdrop-blur-sm">
          
          {/* Header */}
          <div className="mb-6 flex items-center gap-3 text-zinc-500 border-b border-zinc-800 pb-4 pt-4 px-4">
            <FolderOpen className="w-6 h-6" />
            <h2 className="text-xl font-['Black_Ops_One'] tracking-wider">MISSION SELECT</h2>
          </div>

          {/* Season Tabs */}
          <div className="flex gap-2 px-4 mb-4">
            <button 
              className={`flex-1 py-2 px-2 border-t-4 font-mono text-sm font-bold transition-colors flex items-center justify-center gap-2 ${selectedSeason === 1 ? 'border-red-600 bg-red-900/20 text-red-100' : 'border-zinc-800 bg-zinc-900 text-zinc-600'}`}
              onClick={() => {
                if(selectedSeason !== 1) {
                    playSelectSound();
                    setSelectedSeason(1);
                    setSelectedIndex(0);
                }
              }}
            >
                <Archive size={14} /> S1: OUTBREAK
            </button>
            <button 
              className={`flex-1 py-2 px-2 border-t-4 font-mono text-sm font-bold transition-colors flex items-center justify-center gap-2 ${selectedSeason === 2 ? 'border-red-600 bg-red-900/20 text-red-100' : 'border-zinc-800 bg-zinc-900 text-zinc-600'}`}
              onClick={() => {
                if(selectedSeason !== 2) {
                    playSelectSound();
                    setSelectedSeason(2);
                    setSelectedIndex(0);
                }
              }}
            >
                <Users size={14} /> S2: AFTERMATH
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-2 px-4 pb-4">
            {filteredChapters.map((chapter, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div 
                  key={chapter.id}
                  className={`
                    group relative p-4 cursor-pointer transition-all duration-200
                    border-2 
                    ${isSelected 
                      ? 'bg-red-900/20 border-red-600 translate-x-2' 
                      : 'bg-black/50 border-zinc-800 hover:border-zinc-600 text-zinc-500'}
                  `}
                  onClick={() => {
                    setSelectedIndex(index);
                    playSelectSound();
                    onStartChapter(chapter.id);
                  }}
                  onMouseEnter={() => {
                    if (selectedIndex !== index) {
                      setSelectedIndex(index);
                      playHoverSound();
                    }
                  }}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col">
                      <span className={`font-['Black_Ops_One'] text-2xl ${isSelected ? 'text-zinc-100' : 'text-zinc-600'}`}>
                        CHAPTER {chapter.id.toString().padStart(2, '0')}
                      </span>
                      <span className={`font-mono text-xs tracking-widest ${isSelected ? 'text-red-400' : 'text-zinc-700'}`}>
                        {chapter.title}
                      </span>
                    </div>
                    {isSelected && <ChevronRight className="text-red-500 animate-pulse" />}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-4 text-xs font-mono text-zinc-600 bg-zinc-900/50 flex justify-between">
            <span>ARROWS: NAVIGATE</span>
            <span>LEFT/RIGHT: SWITCH SEASON</span>
          </div>
        </div>

        {/* Right Side: Details Panel */}
        <div className="flex-1 flex flex-col justify-center relative p-4">
           {/* CRT Scanline box for image placeholder */}
           <div className="w-full h-48 bg-zinc-900 border-2 border-zinc-700 mb-6 relative overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,1)]">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoNHYxSDB6IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] opacity-50 z-10"></div>
              <FileWarning className="w-16 h-16 text-zinc-700 opacity-50" />
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-red-500 animate-pulse">
                {selectedSeason === 1 ? 'NO SIGNAL' : 'ENCRYPTED FEED'}
              </div>
              <div className="absolute top-2 left-2 text-[10px] font-mono text-zinc-500">
                CAM_FEED_{selectedChapter.id.toString().padStart(3, '0')}
              </div>
           </div>

           {/* Info Block */}
           <div className="space-y-6 bg-black/60 p-6 border border-zinc-800">
             <div>
               <h1 className="text-4xl md:text-6xl font-['VT323'] text-red-600 mb-2 leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                 {selectedChapter.title}
               </h1>
               <div className="flex items-center gap-4 text-sm font-mono text-zinc-400 border-b border-zinc-800 pb-4">
                 <span className="flex items-center gap-2"><MapPin size={14} /> {selectedChapter.location}</span>
                 <span className="flex items-center gap-2"><Clock size={14} /> {selectedChapter.time}</span>
               </div>
             </div>

             <div className="min-h-[150px]">
               <p className="font-['VT323'] text-xl md:text-2xl text-zinc-300 leading-relaxed typing-effect">
                 {selectedChapter.description}
               </p>
             </div>

             <button 
               className="w-full py-4 bg-red-900/20 border border-red-800 text-red-500 hover:bg-red-800 hover:text-white hover:border-red-500 transition-all duration-200 font-['Black_Ops_One'] tracking-widest text-xl flex items-center justify-center gap-3 group"
               onClick={() => {
                  playSelectSound();
                  onStartChapter(selectedChapter.id);
               }}
             >
               <Crosshair className="w-5 h-5 group-hover:animate-spin" />
               DEPLOY TO SECTOR
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};