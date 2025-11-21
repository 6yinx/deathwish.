
import React, { useState, useMemo } from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Lock, DollarSign, Search } from 'lucide-react';

interface StoryReaderProps {
    onBack: () => void;
    money: number;
    unlockedStories: number[];
    onUnlock: (index: number, cost: number) => boolean;
}

// Manually written core story pages
const CORE_STORY = [
    // --- SEASON 1: THE OUTBREAK ---
    { title: "S1 | PROLOGUE: THE DRIVE", text: "The hum of the '86 sedan's engine was the only company I had on Route 666..." },
    { title: "S1 | INTERFERENCE", text: "The static on the radio suddenly spiked, a high-pitched shriek that tore through the speakers..." },
    { title: "S1 | THE FIGURE", text: "It was standing in the middle of the road. A person? No, the angles were all wrong..." },
    { title: "S1 | IMPACT", text: "The car left the road, hitting the gravel shoulder before careening into the treeline..." },
    { title: "S1 | DARKNESS", text: "Silence. Absolute and heavy. Then, pain. A sharp, hot line of fire across my forehead..." },
    { title: "S1 | THE SMELL", text: "I managed to unbuckle the belt, dropping to the roof of the car with a grunt..." },
    { title: "S1 | THE CLUE", text: "My boot hit something soft. I froze. Fumbling for my lighter, I flicked it on..." },
    { title: "S1 | THE REALIZATION", text: "I backed away, lighter trembling. This was it. The samples. The 'anomalies' we were testing..." },
    { title: "S1 | SURVIVAL", text: "A low moan drifted through the trees, carried on the wind. Then another..." },
    { title: "S1 | MISSION START", text: "I grabbed the radio. 'Mayday, mayday. This is Operative 7. I am down in Sector 4'..." },

    // --- SEASON 2: THE AFTERMATH ---
    { title: "S2 | ASHES", text: "Three months. That's how long it had been since the crash. Since Raccoon City burned..." },
    { title: "S2 | THE CONVOY", text: "We had an armored bus, two trucks, and a fuel tanker we guarded with our lives..." },
    { title: "S2 | SCARCITY", text: "Food was running low. We were boiling leather belts for soup. The hunger was a constant..." },
    { title: "S2 | THE AMBUSH", text: "It happened at the bridge. They weren't zombies. They were worse. Raiders..." },
    { title: "S2 | SEPARATION", text: "The tanker exploded. A ball of orange fire that swallowed the rear truck..." },
    { title: "S2 | THE BUNKER", text: "I walked for days. Delirious. Thirsty. I found it by accident—a hatch hidden under a rusted tractor..." },
    { title: "S2 | THE DATA", text: "I hacked the terminal using my old credentials. The files were encrypted..." },
    { title: "S2 | A NEW PURPOSE", text: "I wasn't just surviving anymore. I had a mission. I packed a bag with supplies..." },
    { title: "S2 | THE REPLY", text: "For the first time in months, the radio crackled with a voice. 'Operative 7, this is Northern Command'..." },

    // --- SEASON 3: RESOLUTION ---
    { title: "S3 | THE ISLAND", text: "The helicopter ride was a blur. Northern Command wasn't military. It was a remnant of the government..." },
    { title: "S3 | THE LAB", text: "I was escorted to the lower levels. The facility was pristine, sterile white..." },
    { title: "S3 | BETRAYAL", text: "Dr. Edgar led me to the containment unit. 'The cure requires a host,' he explained coldly..." },
    { title: "S3 | THE BREAKOUT", text: "I didn't survive the woods and the wastelands to die on a table. I smashed the emergency glass..." },
    { title: "S3 | THE STORM", text: "I fought my way to the flight deck. The storm was raging now, waves crashing over the carrier..." },
    { title: "S3 | THE CHOICE", text: "We struggled near the edge. He was stronger, fueled by madness. But I had something he didn't..." },
    { title: "S3 | ASCENSION", text: "I piloted the chopper back to the mainland. I broadcast the formula on every frequency..." },
    { title: "S3 | EPILOGUE", text: "I put the radio down on the dashboard of the new truck I salvaged. The static was gone..." },

    // --- SEASON 4-10 SUMMARIES (Shortened for brevity in code, but logically present) ---
    { title: "S4 | THE INSURGENCY", text: "The cure didn't fix everything. It stopped the spread, but JunJun Corp's private army returned..." },
    { title: "S5 | MUTATION", text: "Nature abhors a vacuum. With JunJun gone, the virus mutated wildly. Animals began to change..." },
    { title: "S6 | GROUND ZERO", text: "Rumors of a clean zone in Antarctica. We organized an expedition..." },
    { title: "S7 | GOING DEEP", text: "To kill the root, we had to go under. The subway systems connected to deep earth bunkers..." },
    { title: "S8 | RE-INFECTION", text: "The airborne strain returned. People dropping dead in the streets again..." },
    { title: "S9 | GLOBAL REACH", text: "We had the cure, but no way to distribute it globally. The satellites were down..." },
    { title: "S10 | THE NEW WORLD", text: "The rain fell, carrying the cure. The infected stopped screaming. They just... stopped..." }
];

// Procedural Generation Data
const PS_SUBJECTS = ["Signal", "Outpost", "Convoy", "Drone", "Patrol", "Refugee", "Anomaly", "Squadron", "Unit 734", "Dr. K"];
const PS_ACTIONS = ["lost contact", "reported heavy casualties", "found supplies", "intercepted message", "destroyed target", "spotted horde", "evacuated sector", "breached containment"];
const PS_LOCATIONS = ["Sector 7", "North Ridge", "The Dead Zone", "Metro Tunnels", "Coastal Highway", "Old Factory", "Ash City", "Zone Zero", "Echo Base", "Vertex Lab"];
const PS_CONDITIONS = ["Visibility zero", "Radiation spiking", "Quiet... too quiet", "Storm approaching", "Fuel critical", "Morale failing", "Ammo depleted", "Infection spreading"];

// Simple pseudo-random generator seeded by page number
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const getProceduralPage = (index: number) => {
    const seed = index * 123.45;
    const subject = PS_SUBJECTS[Math.floor(seededRandom(seed) * PS_SUBJECTS.length)];
    const action = PS_ACTIONS[Math.floor(seededRandom(seed + 1) * PS_ACTIONS.length)];
    const location = PS_LOCATIONS[Math.floor(seededRandom(seed + 2) * PS_LOCATIONS.length)];
    const condition = PS_CONDITIONS[Math.floor(seededRandom(seed + 3) * PS_CONDITIONS.length)];
    
    // Generate a fake date
    const dateOffset = Math.floor(index / 5);
    const year = 2025 + Math.floor(dateOffset / 365);
    const day = (dateOffset % 365) + 1;

    return {
        title: `ARCHIVE LOG #${index} | DAY ${day}, YEAR ${year}`,
        text: `
LOG ENTRY ${index}-${Math.floor(seededRandom(seed + 4) * 9999)}
LOCATION: ${location}
STATUS: ${condition.toUpperCase()}

REPORT:
${subject} ${action} near ${location}. 
Casualties: ${Math.floor(seededRandom(seed + 5) * 20)}. 
Ammo count: ${Math.floor(seededRandom(seed + 6) * 500)} rounds.

We are holding position but supplies are running low.
Requesting immediate evac or resupply.

MESSAGE ENDS.
        `.trim()
    };
};

export const StoryReader: React.FC<StoryReaderProps> = ({ onBack, money, unlockedStories, onUnlock }) => {
    const [pageIndex, setPageIndex] = useState(0);
    const [jumpInput, setJumpInput] = useState("");
    const UNLOCK_COST = 2000;
    const TOTAL_PAGES = 12000;

    // Memoize the content generation to avoid flickering
    const currentPageContent = useMemo(() => {
        if (pageIndex < CORE_STORY.length) {
            return CORE_STORY[pageIndex];
        }
        return getProceduralPage(pageIndex);
    }, [pageIndex]);

    const handleNext = () => {
        if (pageIndex < TOTAL_PAGES - 1) setPageIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (pageIndex > 0) setPageIndex(prev => prev - 1);
    };

    const handleJump = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(jumpInput);
        if (!isNaN(page) && page > 0 && page <= TOTAL_PAGES) {
            setPageIndex(page - 1);
            setJumpInput("");
        }
    };

    const handlePurchase = () => {
        onUnlock(pageIndex, UNLOCK_COST);
    };

    const isUnlocked = unlockedStories.includes(pageIndex);

    return (
        <div className="w-full h-full flex items-center justify-center p-4 md:p-12 bg-black/90 z-50 absolute inset-0 backdrop-blur-sm">
            <div className="w-full max-w-4xl h-[80vh] border-4 border-zinc-800 bg-zinc-950 flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                
                {/* Header */}
                <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
                    <div className="flex items-center gap-3 text-yellow-600">
                        <BookOpen />
                        <span className="font-['Black_Ops_One'] text-xl tracking-widest">MISSION ARCHIVES</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-zinc-500">
                        <span className="text-green-500 flex items-center gap-1"><DollarSign size={14} /> {money}</span>
                        <span>PAGE {pageIndex + 1} / {TOTAL_PAGES}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto relative">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-['Black_Ops_One'] text-zinc-200 mb-8 border-l-4 border-red-800 pl-4 uppercase">
                            {isUnlocked ? currentPageContent.title : "DATA ENCRYPTED"}
                        </h2>
                        
                        {isUnlocked ? (
                            <div className="font-['VT323'] text-2xl md:text-3xl text-zinc-400 leading-relaxed tracking-wide whitespace-pre-wrap min-h-[200px]">
                                {currentPageContent.text}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-zinc-800 bg-black/50 gap-4">
                                <Lock size={48} className="text-red-600" />
                                <p className="font-mono text-red-500 text-xl tracking-widest">ACCESS RESTRICTED</p>
                                <button 
                                    onClick={handlePurchase}
                                    disabled={money < UNLOCK_COST}
                                    className={`
                                        mt-4 px-8 py-3 border-2 font-['Black_Ops_One'] text-xl flex items-center gap-2 transition-all
                                        ${money >= UNLOCK_COST 
                                            ? 'border-yellow-600 text-yellow-500 hover:bg-yellow-900/20 hover:text-white' 
                                            : 'border-zinc-700 text-zinc-600 cursor-not-allowed'}
                                    `}
                                >
                                    UNLOCK FILE - ${UNLOCK_COST}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="h-20 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between px-6">
                    <button onClick={handlePrev} disabled={pageIndex === 0} className={`flex items-center gap-2 px-4 py-2 font-mono text-lg ${pageIndex === 0 ? 'text-zinc-700' : 'text-zinc-400 hover:text-white'}`}><ArrowLeft /> PREV</button>
                    
                    {/* Jump to Page Form */}
                    <form onSubmit={handleJump} className="flex items-center gap-2">
                        <input 
                            type="number" 
                            min="1"
                            max={TOTAL_PAGES}
                            value={jumpInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                    setJumpInput('');
                                } else if (/^\d+$/.test(val) && parseInt(val) > 0) {
                                    setJumpInput(val);
                                }
                            }}
                            placeholder="PAGE #" 
                            className="bg-black border border-zinc-700 text-white px-2 py-1 w-24 font-mono focus:border-yellow-500 outline-none"
                        />
                        <button type="submit" className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400"><Search size={16} /></button>
                    </form>

                    <button onClick={onBack} className="hidden md:block px-6 py-2 border border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-500 font-mono uppercase text-sm">CLOSE</button>
                    
                    <button onClick={handleNext} disabled={pageIndex === TOTAL_PAGES - 1} className={`flex items-center gap-2 px-4 py-2 font-mono text-lg ${pageIndex === TOTAL_PAGES - 1 ? 'text-zinc-700' : 'text-zinc-400 hover:text-white'}`}>NEXT <ArrowRight /></button>
                </div>
            </div>
        </div>
    );
};
