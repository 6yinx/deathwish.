import React, { useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface CreditsScreenProps {
  onBack: () => void;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({ onBack }) => {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const staff = [
    { role: 'EXECUTIVE PRODUCER', name: 'JJ. YANG', status: 'AT LARGE', statusColor: 'text-yellow-500' },
    { role: 'LEAD DIRECTOR', name: 'DR. EDGAR', status: 'DECEASED', statusColor: 'text-red-600' },
    { role: 'LEAD PROGRAMMER', name: 'SUBJECT 0', status: 'MIA', statusColor: 'text-zinc-500' },
    { role: 'ART DIRECTION', name: 'INTAC LAB', status: 'ACTIVE', statusColor: 'text-green-600' },
    { role: 'SOUND DESIGN', name: 'G.E.Mini', status: 'ACTIVE', statusColor: 'text-green-600' },
    { role: 'SPECIAL THANKS', name: 'JUNJUN CORPORATION', status: 'CLASSIFIED', statusColor: 'text-blue-500' },
  ];

  return (
    <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-black border-y-4 border-red-900 overflow-hidden relative cursor-pointer" onClick={onBack}>
        
        {/* Header */}
        <div className="bg-red-900/20 p-4 flex items-center justify-between border-b border-red-800 mb-8">
            <div className="flex items-center gap-3">
                <Shield className="text-red-600 w-8 h-8" />
                <div>
                    <h2 className="text-2xl font-['Black_Ops_One'] text-zinc-100 leading-none">PERSONNEL DATABASE</h2>
                    <span className="text-[10px] font-mono text-red-400 tracking-widest">CLEARANCE LEVEL: ULTRAVIOLET</span>
                </div>
            </div>
            <div className="text-right font-mono text-xs text-zinc-500">
                FILE_ID: #993-21A<br/>
                DATE: XX/XX/1998
            </div>
        </div>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-12 relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <AlertTriangle size={300} />
            </div>

            <div className="space-y-8 relative z-10">
                {staff.map((person, idx) => (
                    <div key={idx} className="border-b border-zinc-800 pb-2 group hover:bg-zinc-900/50 transition-colors px-2">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-zinc-500 font-mono text-xs tracking-[0.2em] uppercase">{person.role}</span>
                            <span className={`font-mono text-xs font-bold ${person.statusColor} border border-current px-1`}>
                                [{person.status}]
                            </span>
                        </div>
                        <div className="text-3xl font-['VT323'] text-zinc-200 tracking-wide">
                            {person.name}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 text-center space-y-2">
                <p className="text-xs font-mono text-zinc-600 max-w-md mx-auto">
                    COPYRIGHT © 1998 JUNJUN CORPORATION. ALL RIGHTS RESERVED. 
                    BIOLOGICAL EXPERIMENTS CONDUCTED UNDER INTERNATIONAL TREATY WAIVER #442.
                </p>
                <p className="text-red-900 font-['Black_Ops_One'] text-4xl opacity-20 pt-4">
                    DEATHWISH
                </p>
            </div>
        </div>

        {/* Footer Prompt */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black to-transparent p-4 text-center">
            <span className="text-green-500 font-mono text-sm animate-pulse border-b border-green-500 pb-0.5">
                PRESS [ESC] OR CLICK TO CLOSE FILE
            </span>
        </div>
    </div>
  );
};