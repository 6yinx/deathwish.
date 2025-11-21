
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Radio, Terminal, DollarSign, CheckCircle } from 'lucide-react';
import { Typewriter } from './Typewriter';

interface MissionDebriefProps {
  onReturnToMenu: () => void;
  playTypingSound: () => void;
}

const SUCCESS_MSGS = [
    "MISSION ACCOMPLISHED.",
    "AREA SECURED.",
    "THREAT NEUTRALIZED.",
    "DATA EXTRACTION COMPLETE.",
    "OPERATIONAL SUCCESS."
];

const EVALUATIONS = [
    "EXEMPLARY PERFORMANCE DETECTED.",
    "ACCEPTABLE CASUALTY RATES OBSERVED.",
    "LOCAL ASSETS PRESERVED.",
    "TACTICAL DECISION MAKING RATED: A+",
    "CORPORATE INTERESTS SECURED."
];

const NEXT_STEPS = [
    "AWAITING FURTHER INSTRUCTIONS.",
    "FUNDS TRANSFERRED TO OPERATIVE ACCOUNT.",
    "RETURN TO STANDBY MODE.",
    "PREPARE FOR NEXT DEPLOYMENT.",
    "DATA UPLOADED TO CENTRAL ARCHIVE."
];

export const MissionDebrief: React.FC<MissionDebriefProps> = ({ onReturnToMenu, playTypingSound }) => {
  const [isComplete, setIsComplete] = useState(false);

  const debriefText = useMemo(() => {
      const success = SUCCESS_MSGS[Math.floor(Math.random() * SUCCESS_MSGS.length)];
      const evalText = EVALUATIONS[Math.floor(Math.random() * EVALUATIONS.length)];
      const next = NEXT_STEPS[Math.floor(Math.random() * NEXT_STEPS.length)];
      const id = Math.floor(Math.random() * 9999);

      return `
REPORT ID: #${id}
STATUS: ${success}

OPERATIONAL REVIEW:
${evalText}

PAYMENT PROCESSING...
TRANSACTION VERIFIED.
$1000 CREDITED.

${next}

JUNJUN CORP THANKS YOU FOR YOUR LOYALTY.
      `.trim();
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-12 bg-black/95 z-50 absolute inset-0">
        <div className="w-full max-w-4xl border-2 border-green-600 bg-zinc-900 p-8 md:p-12 flex flex-col shadow-[0_0_50px_rgba(0,255,0,0.2)] relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-green-600 pb-4">
                <ShieldCheck className="text-green-500 w-12 h-12" />
                <div>
                    <h1 className="font-['Black_Ops_One'] text-3xl text-zinc-100">MISSION DEBRIEF</h1>
                    <p className="font-mono text-green-500 text-sm tracking-widest">CLEARANCE: GRANTED</p>
                </div>
                <div className="ml-auto flex gap-4 text-zinc-600">
                    <CheckCircle className="text-green-500" />
                    <Terminal />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-[300px] font-['VT323'] text-2xl md:text-3xl text-green-400 leading-relaxed whitespace-pre-wrap">
                <Typewriter 
                    text={debriefText} 
                    speed={0} 
                    playSound={playTypingSound}
                    onComplete={() => setIsComplete(true)}
                />
                <span className="animate-pulse text-green-400">_</span>
            </div>

            {/* Reward Box */}
            <div className="my-8 border border-green-800 bg-black p-4 flex items-center justify-between">
                <span className="font-mono text-zinc-500">REWARD:</span>
                <span className="font-['Black_Ops_One'] text-2xl text-yellow-500 flex items-center gap-2">
                    <DollarSign /> 1000
                </span>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
                <button 
                    onClick={onReturnToMenu}
                    className="px-8 py-4 bg-green-900/20 border-2 border-green-600 text-green-500 hover:bg-green-600 hover:text-black transition-all font-['Black_Ops_One'] text-2xl tracking-widest"
                >
                    RETURN TO BASE
                </button>
            </div>
        </div>
    </div>
  );
};
