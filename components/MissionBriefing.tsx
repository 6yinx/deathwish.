
import React, { useState, useMemo } from 'react';
import { Shield, Radio, Map } from 'lucide-react';
import { Typewriter } from './Typewriter';

interface MissionBriefingProps {
  onProceed: () => void;
  playTypingSound: () => void;
}

// --- PROCEDURAL BRIEFING DATA ---

const INTROS = [
    "OPERATIVE, PRIORITY ALERT.",
    "ATTENTION DISPATCH. WE HAVE A CODE RED.",
    "LISTENING POST 4 HAS GONE DARK.",
    "URGENT COMMUNIQUE FROM HQ.",
    "EYES ONLY. SECURE CHANNEL OPEN.",
    "IMMEDIATE ACTION REQUIRED, OPERATIVE.",
    "SATELLITE UPLINK ESTABLISHED. STAND BY.",
    "OPERATIVE 7, INCOMING TRANSMISSION.",
    "JUNJUN CORP ASSETS ARE UNDER SIEGE.",
    "CRITICAL SYSTEM FAILURE DETECTED."
];

const LOCATIONS = [
    "DEADFALL WOODS", "SECTOR 9", "THE INDUSTRIAL ZONE", "OAKHAVEN SUBURBS", 
    "BLACKWATER RIVER", "JUNJUN RESEARCH FACILITY", "THE OLD HIGHWAY", 
    "MERCY HOSPITAL PERIMETER", "UNDERGROUND TUNNEL NETWORK", "ABANDONED RAIL YARD"
];

const SITUATIONS = [
    "HAS ESCALATED BEYOND LOCAL CONTAINMENT PROTOCOLS.",
    "IS SWARMING WITH CLASS-4 BIOLOGICAL ENTITIES.",
    "HAS REPORTED A BREACH IN THE PERIMETER WALL.",
    "IS EXPERIENCING A MASS CASUALTY EVENT.",
    "IS EMITTING UNIDENTIFIED RADIATION SIGNALS.",
    "HAS GONE COMPLETELY SILENT AFTER A DISTRESS CALL.",
    "IS BEING OVERRUN BY A MIGRATING HORDE.",
    "HAS DETECTED UNAUTHORIZED MILITARY MOVEMENT.",
    "IS SUFFERING FROM A TOXIC GAS LEAK.",
    "IS SHOWING SIGNS OF A NEW MUTATION STRAIN."
];

const OBJECTIVES = [
    "ACT AS THE TACTICAL DISPATCHER FOR OUR REMAINING FIELD UNITS.",
    "GUIDE SURVIVORS TO EXTRACTION POINTS IMMEDIATELY.",
    "SECURE THE AREA AND RETRIEVE CRITICAL DATA.",
    "NEUTRALIZE ALL THREATS TO MAINTAIN CORPORATE SECRECY.",
    "ESTABLISH A PERIMETER AND HOLD UNTIL REINFORCEMENTS ARRIVE.",
    "TRIAGE INCOMING SIGNALS AND MAKE HARD CHOICES.",
    "PREVENT THE INFECTION FROM BREACHING THE QUARANTINE ZONE.",
    "LOCATE AND PROTECT THE VIP ASSET AT ALL COSTS.",
    "OVERRIDE SECURITY LOCKDOWNS AND OPEN ESCAPE ROUTES.",
    "MONITOR SENSOR FEEDS AND DIRECT FIRE SUPPORT."
];

const CLOSINGS = [
    "TRUST YOUR INSTINCTS.",
    "LIVES DEPEND ON IT.",
    "FAILURE IS NOT AN OPTION.",
    "DO NOT HESITATE.",
    "THE CLOCK IS TICKING.",
    "GOD SPEED, OPERATIVE.",
    "MAKE US PROUD.",
    "REMEMBER YOUR TRAINING.",
    "END TRANSMISSION.",
    "SECURE THE FUTURE."
];

export const MissionBriefing: React.FC<MissionBriefingProps> = ({ onProceed, playTypingSound }) => {
  const [isBriefingComplete, setIsBriefingComplete] = useState(false);

  // Generate a unique briefing every time the component mounts
  const briefingText = useMemo(() => {
      const intro = INTROS[Math.floor(Math.random() * INTROS.length)];
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const sit = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
      const obj = OBJECTIVES[Math.floor(Math.random() * OBJECTIVES.length)];
      const close = CLOSINGS[Math.floor(Math.random() * CLOSINGS.length)];

      return `
${intro}

THE SITUATION IN ${loc} ${sit}

YOUR OBJECTIVE IS TO ${obj}

UNIDENTIFIED SIGNALS (!) WILL APPEAR ON YOUR MAP. THESE REPRESENT SURVIVORS, THREATS, OR CRITICAL INTEL. YOU MUST DIRECT YOUR TEAM TO INTERCEPT AND RESOLVE THESE SITUATIONS.

WARNING: COMMUNICATIONS ARE UNSTABLE. YOU WILL OFTEN HAVE TO MAKE DECISIONS WITH INCOMPLETE INTEL.

${close}
      `.trim();
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-12 bg-black/95 z-50 absolute inset-0">
        <div className="w-full max-w-4xl border-2 border-zinc-700 bg-zinc-900 p-8 md:p-12 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-zinc-700 pb-4">
                <Shield className="text-red-600 w-12 h-12 animate-pulse" />
                <div>
                    <h1 className="font-['Black_Ops_One'] text-3xl text-zinc-100">MISSION BRIEFING</h1>
                    <p className="font-mono text-red-500 text-sm tracking-widest">TOP SECRET // EYES ONLY</p>
                </div>
                <div className="ml-auto flex gap-4 text-zinc-600">
                    <Radio className="animate-pulse" />
                    <Map />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-[400px] font-['VT323'] text-2xl md:text-3xl text-green-400 leading-relaxed whitespace-pre-wrap">
                {/* Speed set to 0 for instant text appearance as requested */}
                <Typewriter 
                    text={briefingText} 
                    speed={0} 
                    playSound={playTypingSound}
                    onComplete={() => setIsBriefingComplete(true)}
                />
                <span className="animate-pulse text-green-400">_</span>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end">
                <button 
                    onClick={onProceed}
                    className="px-8 py-4 bg-red-900/20 border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-black transition-all font-['Black_Ops_One'] text-2xl tracking-widest animate-pulse"
                >
                    ACKNOWLEDGE & DEPLOY
                </button>
            </div>

            {/* Deco elements */}
            <div className="absolute top-0 right-0 p-2 font-mono text-[10px] text-zinc-800">
                SECURE_CHANNEL_ESTABLISHED // {Math.floor(Math.random() * 999999)}
            </div>
        </div>
    </div>
  );
};
