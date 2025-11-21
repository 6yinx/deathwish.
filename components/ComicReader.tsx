
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

interface ComicReaderProps {
  onFinished: () => void;
}

// Helper component for drawing cel-shaded characters/props
const Actor: React.FC<{
    type: 'player' | 'zombie' | 'wreckage' | 'tree' | 'item';
    pose?: 'idle' | 'run' | 'dead' | 'lying' | 'attack';
    scale?: number;
    x?: number;
    y?: number;
    color?: string;
}> = ({ type, pose = 'idle', scale = 1, x = 50, y = 50, color }) => {
    const style = {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
    };

    if (type === 'player') {
        return (
            <div className="absolute flex flex-col items-center" style={style}>
                 {/* Head */}
                 <div className="w-12 h-12 bg-[#8d5524] rounded-sm border-4 border-black relative z-20 animate-[bounce_3s_infinite]">
                    <div className="absolute top-4 left-2 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute top-4 right-2 w-2 h-2 bg-black rounded-full"></div>
                    {pose === 'lying' && <div className="absolute top-8 left-3 w-6 h-1 bg-black"></div>}
                 </div>
                 {/* Body */}
                 <div className={`w-16 h-20 bg-blue-800 border-4 border-black -mt-2 relative z-10 ${pose === 'lying' ? 'rotate-90 translate-y-8' : ''}`}>
                    <div className="w-full h-full bg-black/10 skew-x-12"></div>
                 </div>
                 {/* Arms */}
                 {pose === 'run' ? (
                     <>
                        <div className="absolute top-12 -left-6 w-4 h-16 bg-[#8d5524] border-4 border-black rotate-45"></div>
                        <div className="absolute top-12 -right-6 w-4 h-16 bg-[#8d5524] border-4 border-black -rotate-45"></div>
                     </>
                 ) : (
                    <>
                        <div className="absolute top-14 -left-4 w-4 h-16 bg-[#8d5524] border-4 border-black rotate-12"></div>
                        <div className="absolute top-14 -right-4 w-4 h-16 bg-[#8d5524] border-4 border-black -rotate-12"></div>
                    </>
                 )}
            </div>
        );
    }

    if (type === 'zombie') {
        return (
            <div className="absolute flex flex-col items-center animate-[pulse_2s_infinite]" style={style}>
                 <div className="w-12 h-12 bg-[#4a5d43] rounded-full border-4 border-black relative z-20">
                    <div className="absolute top-4 left-2 w-3 h-3 bg-red-900 rounded-full animate-pulse"></div>
                    <div className="absolute top-4 right-2 w-2 h-3 bg-black rounded-full"></div>
                    <div className="absolute bottom-2 left-3 w-6 h-4 bg-black rounded-[50%]"></div>
                 </div>
                 <div className="w-16 h-20 bg-gray-700 border-4 border-black -mt-2 relative z-10 skew-x-6">
                    <div className="absolute top-4 left-2 w-4 h-8 bg-red-900/50"></div>
                 </div>
                 {pose === 'attack' && (
                     <div className="absolute top-10 -left-8 w-20 h-6 bg-[#4a5d43] border-4 border-black -rotate-12"></div>
                 )}
            </div>
        );
    }

    if (type === 'wreckage') {
        return (
            <div className="absolute" style={style}>
                <div className="w-64 h-32 bg-zinc-800 border-4 border-black rotate-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-orange-500/20 animate-pulse"></div>
                    <div className="absolute -top-10 left-10 w-4 h-32 bg-black rotate-45"></div>
                    <div className="absolute top-10 left-20 w-4 h-32 bg-black -rotate-45"></div>
                </div>
                {/* Smoke */}
                <div className="absolute -top-20 left-0 w-20 h-20 bg-gray-500/50 rounded-full blur-xl animate-[bounce_4s_infinite]"></div>
            </div>
        );
    }

    if (type === 'tree') {
        return (
            <div className="absolute flex flex-col items-center" style={style}>
                <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[100px] border-b-[#0f1c0f] -mb-10 relative z-20"></div>
                <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[120px] border-b-[#0a150a] -mb-10 relative z-10"></div>
                <div className="w-8 h-20 bg-[#1a1510] border-x-4 border-black relative z-0"></div>
            </div>
        );
    }

    return null;
};

interface PanelData {
    bg: string;
    actors?: Array<React.ComponentProps<typeof Actor>>;
    caption?: string;
    speech?: { text: string; x: number; y: number; speaker: 'player' | 'unknown' };
    sfx?: { text: string; x: number; y: number; color?: string; size?: string };
    filter?: string;
}

const Panel: React.FC<{ data: PanelData }> = ({ data }) => {
    return (
        <div 
            className="relative w-full h-full overflow-hidden border-4 border-black bg-cover bg-center shadow-[4px_4px_0px_rgba(0,0,0,1)] group hover:scale-[1.01] transition-transform duration-300 ease-out"
            style={{ backgroundColor: data.bg }}
        >
            {/* Gritty Overlay */}
            <div className={`absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-60 ${data.filter || 'bg-orange-900/20'}`}></div>
            
            {/* Actors */}
            {data.actors?.map((actor, idx) => (
                <Actor key={idx} {...actor} />
            ))}

            {/* Speech Bubbles */}
            {data.speech && (
                <div 
                    className="absolute bg-white border-4 border-black p-3 rounded-2xl z-30 max-w-[60%] shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                    style={{ left: `${data.speech.x}%`, top: `${data.speech.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="text-black font-['Black_Ops_One'] text-xs mb-1 text-gray-500 uppercase">{data.speech.speaker}</div>
                    <div className="text-black font-['vt323'] text-lg leading-none uppercase">{data.speech.text}</div>
                    {/* Tail */}
                    <div className="absolute bottom-[-10px] left-1/2 w-4 h-4 bg-white border-r-4 border-b-4 border-black rotate-45 -translate-x-1/2"></div>
                </div>
            )}

            {/* Sound Effects */}
            {data.sfx && (
                <div 
                    className="absolute z-40 font-['Black_Ops_One'] tracking-widest animate-[pulse_0.2s_infinite]"
                    style={{ 
                        left: `${data.sfx.x}%`, 
                        top: `${data.sfx.y}%`, 
                        color: data.sfx.color || '#ff0000',
                        fontSize: data.sfx.size || '3rem',
                        textShadow: '3px 3px 0 #000',
                        transform: 'translate(-50%, -50%) rotate(-10deg)'
                    }}
                >
                    {data.sfx.text}
                </div>
            )}

            {/* Caption Box */}
            {data.caption && (
                <div className="absolute top-0 left-0 bg-yellow-100 border-r-4 border-b-4 border-black p-2 max-w-[80%] z-30">
                    <p className="text-black font-['Share_Tech_Mono'] text-xs uppercase tracking-widest font-bold italic">
                        {data.caption}
                    </p>
                </div>
            )}
        </div>
    );
};

const STORY_PAGES: PanelData[][] = [
    // PAGE 1: THE CRASH
    [
        { bg: '#000', sfx: { text: 'KRA-KOOM!', x: 50, y: 50, size: '4rem' }, caption: 'BLACKWOOD FOREST - 22:00 HOURS' },
        { bg: '#220a0a', actors: [{ type: 'wreckage', scale: 1.5, x: 50, y: 50 }], filter: 'blur-sm' },
        { bg: '#000', speech: { text: "My head...", x: 50, y: 50, speaker: 'player' } },
        { bg: '#1a0505', actors: [{ type: 'player', pose: 'lying', scale: 0.8, x: 50, y: 60 }], caption: 'Alive. Somehow.' },
        { bg: '#331111', sfx: { text: 'CRACKLE', x: 80, y: 20, color: '#ffa500' }, actors: [{ type: 'wreckage', scale: 1.2, x: 30, y: 60 }] },
        { bg: '#1a0505', actors: [{ type: 'player', scale: 1, x: 50, y: 80 }], speech: { text: "Need to move. Fire's spreading.", x: 70, y: 30, speaker: 'player' } }
    ],
    // PAGE 2: WAKING UP
    [
        { bg: '#0f1c0f', actors: [{ type: 'tree', x: 20, y: 50 }, { type: 'tree', x: 80, y: 50 }], caption: 'The air smells of jet fuel and pine.' },
        { bg: '#0a0a0a', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "Anyone else make it?", x: 30, y: 30, speaker: 'player' } },
        { bg: '#111', actors: [{ type: 'wreckage', x: 50, y: 50 }], filter: 'sepia' },
        { bg: '#0f1c0f', actors: [{ type: 'player', x: 30, y: 60 }], speech: { text: "Pilot's gone. Just blood.", x: 60, y: 40, speaker: 'player' } },
        { bg: '#000', sfx: { text: 'SNAP', x: 50, y: 50, color: '#fff', size: '2rem' } },
        { bg: '#0f1c0f', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "Hello?!", x: 50, y: 20, speaker: 'player' } }
    ],
    // PAGE 3: THE WRECKAGE
    [
        { bg: '#221100', actors: [{ type: 'wreckage', scale: 2, x: 50, y: 80 }], caption: 'Supplies. Need supplies.' },
        { bg: '#331a00', actors: [{ type: 'item', x: 50, y: 50 }], speech: { text: "Backpack. Still intact.", x: 50, y: 30, speaker: 'player' } },
        { bg: '#1a1a1a', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "Flashlight works. Thank god.", x: 80, y: 30, speaker: 'player' } },
        { bg: '#000', sfx: { text: 'GRRRRR...', x: 50, y: 50, color: '#888', size: '2rem' } },
        { bg: '#1a1a1a', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "Is that a dog?", x: 50, y: 20, speaker: 'player' } },
        { bg: '#0f1c0f', actors: [{ type: 'tree', x: 20, y: 50 }, { type: 'tree', x: 70, y: 50 }], filter: 'brightness-50' }
    ],
    // PAGE 4: THE FOREST
    [
        { bg: '#051005', actors: [{ type: 'tree', scale: 1.5, x: 50, y: 50 }], caption: 'The forest is dense. Hard to navigate.' },
        { bg: '#0a150a', actors: [{ type: 'player', pose: 'run', x: 50, y: 60 }] },
        { bg: '#000', sfx: { text: 'SHUFFLE', x: 80, y: 80, color: '#aaa', size: '2rem' } },
        { bg: '#051005', speech: { text: "Just keep moving north. Towards the highway.", x: 50, y: 50, speaker: 'player' } },
        { bg: '#111', actors: [{ type: 'tree', x: 10, y: 40 }, { type: 'tree', x: 90, y: 60 }], filter: 'grayscale' },
        { bg: '#0a150a', actors: [{ type: 'player', x: 50, y: 50 }], caption: 'Something is following me.' }
    ],
    // PAGE 5: SCAVENGING
    [
        { bg: '#1a1a1a', caption: 'Found a trail marker.' },
        { bg: '#222', actors: [{ type: 'player', x: 30, y: 60 }], speech: { text: "Sector 4. I'm miles out.", x: 60, y: 30, speaker: 'player' } },
        { bg: '#000', sfx: { text: 'SNAP!', x: 50, y: 50, color: '#f00' } },
        { bg: '#1a1a1a', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "Who's there?!", x: 50, y: 20, speaker: 'player' } },
        { bg: '#051005', actors: [{ type: 'zombie', scale: 0.5, x: 50, y: 50 }], filter: 'blur-sm' },
        { bg: '#000', caption: 'A silhouette steps from the shadows.' }
    ],
    // PAGE 6: FIRST ENCOUNTER
    [
        { bg: '#1a0505', actors: [{ type: 'zombie', scale: 1.2, x: 50, y: 60 }], sfx: { text: 'URRGGHH', x: 50, y: 20, color: '#0f0' } },
        { bg: '#1a1a1a', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "Stay back!", x: 50, y: 20, speaker: 'player' } },
        { bg: '#220a0a', actors: [{ type: 'zombie', pose: 'attack', x: 50, y: 50 }], caption: 'It lunges.' },
        { bg: '#000', sfx: { text: 'THUD', x: 50, y: 50, size: '5rem' } },
        { bg: '#1a0505', actors: [{ type: 'player', pose: 'run', x: 30, y: 50 }, { type: 'zombie', x: 70, y: 50 }] },
        { bg: '#1a0505', speech: { text: "It's not stopping!", x: 50, y: 50, speaker: 'player' } }
    ],
    // PAGE 7: THE FIGHT
    [
        { bg: '#051005', actors: [{ type: 'player', pose: 'run', x: 50, y: 50 }], caption: 'Running is the only option.' },
        { bg: '#0a150a', sfx: { text: 'HUUH... HUUH...', x: 50, y: 50, color: '#fff', size: '1.5rem' } },
        { bg: '#000', actors: [{ type: 'tree', x: 20, y: 50 }], speech: { text: "Can't see... too dark...", x: 50, y: 50, speaker: 'player' } },
        { bg: '#221100', caption: 'A cliff edge.' },
        { bg: '#1a1a1a', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "Dead end. Damn it!", x: 50, y: 20, speaker: 'player' } },
        { bg: '#0a0a0a', actors: [{ type: 'zombie', x: 20, y: 60 }, { type: 'zombie', x: 50, y: 70 }, { type: 'zombie', x: 80, y: 60 }], caption: 'There are more of them.' }
    ],
    // PAGE 8: ESCAPE
    [
        { bg: '#050510', actors: [{ type: 'player', x: 50, y: 50 }], speech: { text: "The river. I have to jump.", x: 50, y: 30, speaker: 'player' } },
        { bg: '#000', sfx: { text: 'GRAAAGH!', x: 50, y: 80, color: '#f00' } },
        { bg: '#1a1a1a', actors: [{ type: 'player', pose: 'run', x: 50, y: 50 }] },
        { bg: '#001020', sfx: { text: 'SPLASH', x: 50, y: 50, color: '#0ff', size: '4rem' } },
        { bg: '#000510', caption: 'The cold water takes me.' },
        { bg: '#000', speech: { text: "TO BE CONTINUED...", x: 50, y: 50, speaker: 'unknown' } }
    ]
];

export const ComicReader: React.FC<ComicReaderProps> = ({ onFinished }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < STORY_PAGES.length - 1) {
        setCurrentPage(prev => prev + 1);
    } else {
        onFinished();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-zinc-900 relative z-50">
        
        {/* Navigation Header */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-4 font-['Black_Ops_One'] text-zinc-400">
            <div className="flex items-center gap-4">
                <span className="text-red-600 text-xl">CHAPTER 1: DEADFALL WOODS</span>
            </div>
            <div className="text-xl">
                PAGE {currentPage + 1} / {STORY_PAGES.length}
            </div>
            <button onClick={onFinished} className="hover:text-white transition-colors"><X /></button>
        </div>

        {/* Comic Page Container */}
        <div className="w-full max-w-5xl aspect-[3/4] md:aspect-[4/3] bg-white border-8 border-white shadow-2xl relative overflow-hidden flex flex-col">
            {/* Grid of 6 panels */}
            <div className="grid grid-cols-2 grid-rows-3 w-full h-full gap-2 bg-black p-2">
                {STORY_PAGES[currentPage].map((panel, idx) => (
                    <div key={idx} className="w-full h-full relative">
                        <Panel data={panel} />
                        {/* Panel Number */}
                        <div className="absolute bottom-1 left-1 text-[8px] font-mono text-white/50">{idx + 1}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full max-w-5xl mt-6 flex justify-between items-center">
            <button 
                onClick={handlePrev}
                disabled={currentPage === 0}
                className={`
                    flex items-center gap-2 px-6 py-3 font-['Black_Ops_One'] text-xl border-2
                    ${currentPage === 0 
                        ? 'border-zinc-800 text-zinc-700 cursor-not-allowed' 
                        : 'border-red-600 text-red-500 hover:bg-red-900/20'}
                `}
            >
                <ArrowLeft /> PREV PAGE
            </button>

            <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 font-['Black_Ops_One'] text-xl border-2 border-red-600 bg-red-600 text-black hover:bg-red-500 transition-colors"
            >
                {currentPage === STORY_PAGES.length - 1 ? 'FINISH CHAPTER' : 'NEXT PAGE'} <ArrowRight />
            </button>
        </div>

        <style>{`
            /* Helper for comic aesthetic */
            .comic-shadow {
                filter: drop-shadow(4px 4px 0px rgba(0,0,0,1));
            }
        `}</style>
    </div>
  );
};
