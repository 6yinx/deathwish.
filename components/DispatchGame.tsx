
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Radio, Crosshair, Wifi, XCircle, RotateCcw, Pause, Play, LogOut, Bot, Save } from 'lucide-react';

interface DispatchGameProps {
    chapterId: number;
    onExit: (success: boolean | null) => void; // null = Save & Exit
    resume?: boolean;
    saveKey: string;
}

type ChoiceOutcome = 'correct' | 'wrong' | 'gamble';

interface Incident {
    id: number;
    x: number;
    y: number;
    scenario: Scenario; 
    outcomes: ChoiceOutcome[];
    timeLeft: number;
}

interface Scenario {
    id: number;
    title: string;
    description: string;
    options: string[];
}

const LOCATIONS = [
    "Sector 4", "Old Mill", "Black River", "Watchtower", "Bunker 9", "Dense Thicket", "Crash Site", "Cave Entrance",
    "Ridge Line", "Supply Depot", "Radio Tower", "Abandoned Cabin", "Deer Trail", "Swamp Edge", "Highway 666"
];

const ADJECTIVES = [
    "Toxic", "Burning", "Frozen", "Dark", "Silent", "Overrun", "Flooded", "Radioactive", "Collapsed", "Guarded"
];

const THREATS = [
    { 
        name: "HORDE", 
        descs: ["Massive group of infected moving north.", "Swarm converging on survivor position."],
        opts: ["AIRSTRIKE", "LURE AWAY", "BARRICADE", "FLANK", "USE EXPLOSIVES"]
    },
    { 
        name: "SURVIVOR", 
        descs: ["Civilian requesting immediate extraction.", "Wounded soldier sending SOS."],
        opts: ["SEND MEDEVAC", "GUIDE TO BASE", "DROP SUPPLIES", "INTERROGATE", "ESCORT"]
    },
    { 
        name: "BANDITS", 
        descs: ["Hostile scavengers setting up ambush.", "Armed group looting supply drop."],
        opts: ["ENGAGE", "NEGOTIATE", "STEAL SUPPLIES", "SNEAK PAST", "INTIMIDATE"]
    },
    { 
        name: "ANOMALY", 
        descs: ["Strange blue light emitting radiation.", "Gravity distortion detected."],
        opts: ["SCAN", "DESTROY", "CONTAIN", "SAMPLE", "OBSERVE"]
    }
];

const generateScenario = (id: number): Scenario => {
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const threatType = THREATS[Math.floor(Math.random() * THREATS.length)];
    const description = threatType.descs[Math.floor(Math.random() * threatType.descs.length)];
    const shuffledOpts = [...threatType.opts].sort(() => 0.5 - Math.random());
    const options = shuffledOpts.slice(0, 3);

    return {
        id,
        title: `${adjective} ${threatType.name} AT ${location}`,
        description: description,
        options: options
    };
};

export const DispatchGame: React.FC<DispatchGameProps> = ({ chapterId, onExit, resume, saveKey }) => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
    const [resolvedCount, setResolvedCount] = useState(0);
    const [signalStrength, setSignalStrength] = useState(100);
    const [log, setLog] = useState<string[]>(["SYSTEM INITIALIZED...", "AI SCENARIO GENERATOR ONLINE..."]);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [isPaused, setIsPaused] = useState(false);
    
    const [aiHintIndex, setAiHintIndex] = useState<number | null>(null);

    const [showMinigame, setShowMinigame] = useState(false);
    const [minigameSuccesses, setMinigameSuccesses] = useState(0);
    const [minigameTimeLeft, setMinigameTimeLeft] = useState(10);
    const [minigamePosition, setMinigamePosition] = useState(50);
    const [minigameTarget, setMinigameTarget] = useState({ start: 40, end: 60 });
    
    const [typedDescription, setTypedDescription] = useState("");
    
    const mapRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number>(0);
    const minigameDirectionRef = useRef<number>(1); 

    const TARGET_COUNT = 25;
    const MAX_CONCURRENT = 5;
    const INCIDENT_DURATION = 20;
    const SPAWN_INTERVAL = 1000;

    useEffect(() => {
        if (resume) {
            const savedData = localStorage.getItem(saveKey);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setIncidents(parsed.incidents || []);
                    setResolvedCount(parsed.resolvedCount || 0);
                    setSignalStrength(parsed.signalStrength || 100);
                    setLog(parsed.log || []);
                    setLog(prev => ["...SESSION RESTORED...", ...prev]);
                } catch (e) {
                    console.error("Failed to load save", e);
                }
            }
        }
    }, [resume, saveKey]);

    useEffect(() => {
        if (gameStatus === 'playing' && !isPaused) {
            const data = {
                incidents,
                resolvedCount,
                signalStrength,
                log
            };
            localStorage.setItem(saveKey, JSON.stringify(data));
        }
    }, [incidents, resolvedCount, signalStrength, log, gameStatus, isPaused, saveKey]);

    const clearSave = () => {
        localStorage.removeItem(saveKey);
    };

    const handleFinalExit = (success: boolean) => {
        clearSave();
        onExit(success);
    };

    const handleSaveAndExit = () => {
        // Save is already updated by effect, pass null to indicate "save & quit"
        onExit(null);
    };

    const playSound = useCallback((type: 'alert' | 'success' | 'fail' | 'click' | 'ping' | 'ai' | 'type') => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        
        const ctx = audioCtxRef.current;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === 'alert') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.2);
        } else if (type === 'fail') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.4);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.05);
        } else if (type === 'ping') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        } else if (type === 'ai') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
        } else if (type === 'type') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.02, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(t + 0.5);
    }, []);

    const addLog = (msg: string) => {
        setLog(prev => [msg, ...prev].slice(0, 6));
    };

    useEffect(() => {
        if (activeIncident && !showMinigame) {
            const scenario = activeIncident.scenario;
            if (scenario) {
                setTypedDescription("");
                let i = 0;
                const text = scenario.description;
                const typingInterval = setInterval(() => {
                    setTypedDescription(text.substring(0, i + 1));
                    if (i % 2 === 0 && text.charAt(i) !== ' ') playSound('type');
                    i++;
                    if (i === text.length) clearInterval(typingInterval);
                }, 30); 
                return () => clearInterval(typingInterval);
            }
        }
    }, [activeIncident, showMinigame, playSound]);

    useEffect(() => {
        if (!showMinigame) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const speed = 1.5; 
        const loop = () => {
            setMinigamePosition(prev => {
                let next = prev + (speed * minigameDirectionRef.current);
                if (next >= 100 || next <= 0) {
                    minigameDirectionRef.current *= -1;
                    next = prev; 
                }
                return next;
            });
            animationFrameRef.current = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [showMinigame]); 

    useEffect(() => {
        if (!showMinigame) return;
        const timer = setInterval(() => setMinigameTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [showMinigame]);

    useEffect(() => {
        if (showMinigame && minigameTimeLeft <= 0) resolveIncident(false);
    }, [minigameTimeLeft, showMinigame]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsPaused(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (gameStatus !== 'playing') return;
        const interval = setInterval(() => {
            if (isPaused || activeIncident) return;
            if (resolvedCount >= TARGET_COUNT) return;
            if (incidents.length >= MAX_CONCURRENT) return;

            const x = 10 + Math.random() * 80;
            const y = 10 + Math.random() * 80;
            const newScenario = generateScenario(Date.now() + Math.random());
            const outcomes: ChoiceOutcome[] = ['correct', 'wrong', 'gamble'].sort(() => Math.random() - 0.5) as ChoiceOutcome[];

            const newIncident: Incident = {
                id: newScenario.id,
                x,
                y,
                scenario: newScenario,
                outcomes,
                timeLeft: INCIDENT_DURATION
            };

            setIncidents(prev => [...prev, newIncident]);
            addLog(`ALERT: ${newScenario.title.substring(0, 20)}...`);
            playSound('alert');

        }, SPAWN_INTERVAL); 
        return () => clearInterval(interval);
    }, [incidents.length, resolvedCount, activeIncident, gameStatus, playSound, isPaused]);

    useEffect(() => {
        if (gameStatus !== 'playing') return;
        const timer = setInterval(() => {
            if (isPaused || activeIncident) return;
            setIncidents(prev => {
                const updated = prev.map(inc => ({ ...inc, timeLeft: inc.timeLeft - 1 }));
                const expired = updated.filter(inc => inc.timeLeft <= 0);
                const valid = updated.filter(inc => inc.timeLeft > 0);
                if (expired.length > 0) {
                    setSignalStrength(curr => Math.max(0, curr - (expired.length * 10)));
                    playSound('fail');
                }
                return valid;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeIncident, gameStatus, playSound, isPaused]);

    useEffect(() => {
        if (gameStatus !== 'playing') return;
        if (resolvedCount >= TARGET_COUNT) {
            setGameStatus('won');
            playSound('success');
        }
        if (signalStrength <= 0) {
            setGameStatus('lost');
            playSound('fail');
        }
    }, [resolvedCount, signalStrength, gameStatus, playSound]);

    const handleIncidentClick = (inc: Incident) => {
        if (isPaused) return;
        playSound('click');
        const roll = Math.random();
        if (roll < 0.30) {
            const correctIdx = inc.outcomes.indexOf('correct');
            setAiHintIndex(correctIdx);
            playSound('ai');
        } else {
            setAiHintIndex(null);
        }
        setActiveIncident(inc);
    };

    const resolveIncident = (success: boolean) => {
        if (success) {
            setResolvedCount(prev => prev + 1);
            setSignalStrength(prev => Math.min(100, prev + 10));
            addLog(`SUCCESS: THREAT NEUTRALIZED.`);
            playSound('success');
        } else {
            setSignalStrength(prev => Math.max(0, prev - 10));
            addLog(`FAILURE: WRONG DECISION.`);
            playSound('fail');
        }
        if (activeIncident) setIncidents(prev => prev.filter(i => i.id !== activeIncident.id));
        setActiveIncident(null);
        setShowMinigame(false);
    };

    const handleChoice = (choiceIndex: number) => {
        if (!activeIncident) return;
        const outcome = activeIncident.outcomes[choiceIndex];
        if (outcome === 'correct') resolveIncident(true);
        else if (outcome === 'wrong') resolveIncident(false);
        else if (outcome === 'gamble') startMinigame();
    };

    const startMinigame = () => {
        setShowMinigame(true);
        setMinigameSuccesses(0);
        setMinigameTimeLeft(10);
        setMinigamePosition(50);
        randomizeMinigameTarget();
    };

    const randomizeMinigameTarget = () => {
        const size = 15; 
        const start = Math.random() * (100 - size);
        setMinigameTarget({ start, end: start + size });
    };

    const handleMinigameClick = () => {
        if (minigamePosition >= minigameTarget.start && minigamePosition <= minigameTarget.end) {
            playSound('ping');
            const newSuccesses = minigameSuccesses + 1;
            setMinigameSuccesses(newSuccesses);
            if (newSuccesses >= 3) handleMinigameComplete(true);
            else randomizeMinigameTarget();
        } else {
            playSound('fail');
        }
    };

    const handleMinigameComplete = (success: boolean) => {
        resolveIncident(success);
    };

    return (
        <div className="w-full h-full relative bg-black text-green-500 font-mono overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-64 h-32 md:h-full bg-zinc-900 border-b md:border-r border-zinc-700 p-2 md:p-4 flex flex-row md:flex-col z-20 shadow-xl order-2 md:order-1 gap-4 md:gap-0">
                <div className="hidden md:block mb-6 border-b border-zinc-700 pb-4">
                    <h1 className="text-xl font-['Black_Ops_One'] text-red-500">SATELLITE UPLINK</h1>
                    <div className="text-xs text-zinc-500">SECURE LINE</div>
                </div>

                <div className="flex-1 flex md:flex-col gap-4 justify-around md:justify-start">
                    <div className="flex-1 md:flex-none">
                        <div className="flex items-center gap-2 mb-1 text-xs md:text-sm text-zinc-400"><Radio size={16} /> <span className="hidden md:inline">OBJECTIVES</span></div>
                        <div className="text-2xl md:text-3xl text-white font-bold">{resolvedCount} / {TARGET_COUNT}</div>
                        <div className="w-full h-1 md:h-2 bg-zinc-800 mt-1">
                            <div className="h-full bg-green-500 transition-all" style={{ width: `${(resolvedCount / TARGET_COUNT) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none">
                        <div className="flex items-center gap-2 mb-1 text-xs md:text-sm text-zinc-400"><Wifi size={16} /> <span className="hidden md:inline">SIGNAL</span></div>
                        <div className={`text-2xl md:text-3xl font-bold ${signalStrength < 30 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>{signalStrength}%</div>
                    </div>
                </div>

                <div className="hidden md:flex h-64 bg-black border border-zinc-800 p-2 font-mono text-[10px] text-zinc-500 overflow-hidden flex-col justify-end mt-auto mb-4">
                    {log.map((l, i) => <div key={i} className="mb-1 border-b border-zinc-900 pb-1">{l}</div>)}
                </div>

                <button onClick={() => setIsPaused(true)} className="w-12 md:w-full py-2 border border-zinc-600 text-zinc-400 hover:text-white flex items-center justify-center gap-2 self-center"><Pause size={16} /> <span className="hidden md:inline">PAUSE</span></button>
            </div>

            <div className="flex-1 relative bg-[#0a150a] overflow-hidden order-1 md:order-2" ref={mapRef}>
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                
                {incidents.map(inc => (
                    <button key={inc.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group" style={{ left: `${inc.x}%`, top: `${inc.y}%` }} onClick={() => handleIncidentClick(inc)}>
                        <div className="relative flex items-center justify-center">
                            <AlertTriangle className="text-yellow-500 w-8 h-8 md:w-12 md:h-12 animate-bounce relative z-10" />
                            <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-40 animate-pulse scale-150"></div>
                            <div className="w-12 md:w-16 h-2 bg-red-900 absolute -bottom-4 border border-black"><div className="h-full bg-yellow-400" style={{ width: `${(inc.timeLeft / INCIDENT_DURATION) * 100}%` }}></div></div>
                        </div>
                    </button>
                ))}
                <div className="absolute w-[200vw] h-[200vw] bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-[spin_4s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none origin-center"></div>
            </div>

            {isPaused && gameStatus === 'playing' && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border-2 border-zinc-500 p-8 text-center space-y-6 shadow-2xl max-w-md w-full">
                         <h2 className="text-4xl font-['Black_Ops_One'] text-white">PAUSED</h2>
                         <div className="flex flex-col gap-4">
                             <button onClick={() => setIsPaused(false)} className="py-3 bg-green-900/30 border border-green-600 text-green-400 hover:bg-green-600 hover:text-black flex items-center justify-center gap-2 font-bold text-xl"><Play /> RESUME</button>
                             <button onClick={handleSaveAndExit} className="py-3 bg-yellow-900/30 border border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black flex items-center justify-center gap-2 font-bold text-xl"><Save /> SAVE & EXIT</button>
                             <button onClick={() => handleFinalExit(false)} className="py-3 bg-red-900/30 border border-red-600 text-red-400 hover:bg-red-600 hover:text-black flex items-center justify-center gap-2 font-bold text-xl"><LogOut /> ABORT MISSION</button>
                         </div>
                         <p className="text-xs text-zinc-500 font-mono">WARNING: ABORTING MISSION WILL DELETE CURRENT SESSION DATA.</p>
                    </div>
                </div>
            )}

            {activeIncident && activeIncident.scenario && !isPaused && !showMinigame && (
                <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 md:p-4">
                    <div className="w-full max-w-3xl bg-zinc-900 border-2 border-green-600 shadow-[0_0_50px_rgba(0,255,0,0.2)] relative flex flex-col max-h-full overflow-y-auto">
                        <div className="bg-green-900/20 p-4 border-b border-green-700 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-green-400"><Crosshair className="animate-pulse" /> <span className="font-['Black_Ops_One'] text-xl md:text-2xl">INCIDENT #{Math.floor(activeIncident.id % 1000)}</span></div>
                        </div>
                        <div className="p-4 md:p-8 bg-black flex flex-col items-center justify-center text-center">
                            <h2 className="text-2xl md:text-3xl text-white mb-6 font-['Black_Ops_One']">{activeIncident.scenario.title}</h2>
                            <p className="text-xl md:text-2xl text-green-300 font-['VT323'] leading-relaxed">{typedDescription}<span className="animate-pulse">_</span></p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6 bg-black border-t border-green-800">
                            {activeIncident.scenario.options.map((opt, idx) => (
                                <button key={idx} onClick={() => handleChoice(idx)} className={`h-20 md:h-32 border bg-zinc-900 relative flex flex-col items-center justify-center gap-2 p-2 md:p-4 text-center ${idx === aiHintIndex ? 'border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-cyan-100' : 'border-zinc-700 text-zinc-300 hover:bg-green-900/30 hover:border-green-500'}`}>
                                    {idx === aiHintIndex && <div className="absolute top-0 left-0 w-full bg-cyan-900/80 text-cyan-400 text-[10px] font-bold py-1 animate-pulse"><Bot size={10} className="inline mr-1" /> AI: 30% PROB</div>}
                                    <span className="font-['Black_Ops_One'] text-lg md:text-2xl leading-tight">{opt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showMinigame && !isPaused && (
                <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-zinc-900 border-4 border-yellow-500 p-4 md:p-8 items-center flex flex-col">
                        <h2 className="text-2xl md:text-4xl font-['Black_Ops_One'] text-yellow-500 mb-4 text-center">SIGNAL CALIBRATION</h2>
                        <p className="text-zinc-400 font-mono mb-8">{minigameTimeLeft}s REMAINING</p>
                        <div className="flex gap-2 mb-8">{[0, 1, 2].map(i => <div key={i} className={`w-6 h-6 rounded-full border-2 border-yellow-600 ${i < minigameSuccesses ? 'bg-green-500' : 'bg-black'}`}></div>)}</div>
                        <div className="w-full h-16 bg-black border-2 border-zinc-600 relative mb-8 cursor-pointer overflow-hidden" onClick={handleMinigameClick} onTouchStart={(e) => { e.preventDefault(); handleMinigameClick(); }}>
                            <div className="absolute top-0 h-full bg-green-900/50 border-x-2 border-green-500" style={{ left: `${minigameTarget.start}%`, width: `${minigameTarget.end - minigameTarget.start}%` }}></div>
                            <div className="absolute top-0 h-full w-2 bg-yellow-400 shadow-[0_0_15px_orange]" style={{ left: `${minigamePosition}%` }}></div>
                        </div>
                        <button onClick={handleMinigameClick} className="px-8 py-4 bg-yellow-600/20 border border-yellow-500 text-yellow-500 font-bold text-xl w-full md:w-auto">LOCK FREQUENCY</button>
                    </div>
                </div>
            )}

            {gameStatus !== 'playing' && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center p-4">
                    {gameStatus === 'lost' ? (
                        <div className="text-center space-y-6 animate-[pulse_4s_infinite]">
                            <XCircle className="w-24 h-24 md:w-32 md:h-32 text-red-600 mx-auto mb-8" />
                            <h1 className="text-5xl md:text-7xl font-['Black_Ops_One'] text-red-600">MISSION FAILED</h1>
                            <button onClick={() => handleFinalExit(false)} className="mt-12 px-8 py-4 border border-red-600 text-red-600 font-['Black_Ops_One'] text-xl md:text-2xl flex items-center gap-2 mx-auto"><RotateCcw /> RETURN TO BASE</button>
                        </div>
                    ) : (
                        <div className="text-center space-y-6">
                            <Wifi className="w-24 h-24 md:w-32 md:h-32 text-green-500 mx-auto mb-8" />
                            <h1 className="text-5xl md:text-7xl font-['Black_Ops_One'] text-green-500">SECTOR CLEARED</h1>
                            <button onClick={() => handleFinalExit(true)} className="mt-12 px-8 py-4 border border-green-600 text-green-600 font-['Black_Ops_One'] text-xl md:text-2xl mx-auto">CONTINUE</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
