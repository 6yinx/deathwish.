import React, { useEffect, useState } from 'react';
import { Volume2, Zap, Eye, ShieldAlert, ArrowLeft, Settings } from 'lucide-react';

interface OptionsMenuProps {
  onBack: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ onBack, audioEnabled, setAudioEnabled }) => {
  const [gamma, setGamma] = useState(60);
  const [gore, setGore] = useState('MAXIMUM');
  const [difficulty, setDifficulty] = useState('SURVIVAL');
  const [vibration, setVibration] = useState(true);
  const [selectedRow, setSelectedRow] = useState(0);

  // Configuration mapping for easy expansion
  const options = [
    { id: 'audio', label: 'MASTER AUDIO', type: 'toggle', value: audioEnabled, display: audioEnabled ? 'ENABLED' : 'MUTED' },
    { id: 'gamma', label: 'SCREEN GAMMA', type: 'slider', value: gamma },
    { id: 'gore', label: 'GORE LEVEL', type: 'cycle', value: gore, choices: ['MAXIMUM', 'REDUCED', 'OFF'] },
    { id: 'difficulty', label: 'DIFFICULTY', type: 'cycle', value: difficulty, choices: ['NORMAL', 'HARD', 'SURVIVAL', 'NIGHTMARE'] },
    { id: 'vibration', label: 'CONTROLLER RUMBLE', type: 'toggle', value: vibration, display: vibration ? 'ON' : 'OFF' },
    { id: 'back', label: 'SAVE & EXIT', type: 'action' }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentOpt = options[selectedRow];

      if (e.key === 'ArrowUp') {
        setSelectedRow(prev => prev > 0 ? prev - 1 : options.length - 1);
      } else if (e.key === 'ArrowDown') {
        setSelectedRow(prev => prev < options.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (currentOpt.id === 'back') onBack();
        if (currentOpt.id === 'audio') setAudioEnabled(!audioEnabled);
        if (currentOpt.id === 'vibration') setVibration(!vibration);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const direction = e.key === 'ArrowRight' ? 1 : -1;
        
        if (currentOpt.id === 'gamma') {
            setGamma(prev => Math.min(100, Math.max(0, prev + (direction * 5))));
        }
        if (currentOpt.id === 'gore') {
            const choices = currentOpt.choices || [];
            const idx = choices.indexOf(gore);
            const newIdx = (idx + direction + choices.length) % choices.length;
            setGore(choices[newIdx]);
        }
        if (currentOpt.id === 'difficulty') {
            const choices = currentOpt.choices || [];
            const idx = choices.indexOf(difficulty);
            const newIdx = (idx + direction + choices.length) % choices.length;
            setDifficulty(choices[newIdx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, audioEnabled, gore, difficulty, vibration, onBack, setAudioEnabled]);


  return (
    <div className="w-full max-w-3xl p-1">
        {/* Terminal Frame */}
        <div className="bg-black border-2 border-zinc-600 relative shadow-[0_0_50px_rgba(0,0,0,0.9)]">
            {/* Header Bar */}
            <div className="bg-zinc-900 border-b border-zinc-600 p-2 flex justify-between items-center">
                <span className="text-green-500 font-mono font-bold tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4" /> SYSTEM_CONFIG.EXE
                </span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 border border-green-700 bg-green-900/50"></div>
                    <div className="w-3 h-3 border border-green-700 bg-black"></div>
                    <div className="w-3 h-3 border border-green-700 bg-black"></div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-12 bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="space-y-6">
                    {options.map((opt, index) => {
                        const isSelected = selectedRow === index;
                        return (
                            <div 
                                key={opt.id}
                                className={`
                                    flex justify-between items-center p-3 border-b border-dashed transition-colors duration-75
                                    ${isSelected ? 'border-green-500 bg-green-900/10' : 'border-zinc-800 text-zinc-500'}
                                `}
                                onMouseEnter={() => setSelectedRow(index)}
                                onClick={() => {
                                    if (opt.id === 'back') onBack();
                                    // Click logic would duplicate key logic here for mouse users
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono text-lg ${isSelected ? 'text-green-400' : 'opacity-50'}`}>
                                        {isSelected ? '>>' : '  '}
                                    </span>
                                    <span className={`text-2xl font-['VT323'] tracking-widest ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                        {opt.label}
                                    </span>
                                </div>

                                {/* Value Renderer */}
                                <div className={`font-mono text-lg ${isSelected ? 'text-green-400' : 'text-zinc-600'}`}>
                                    {opt.type === 'action' && <ArrowLeft className="inline" />}
                                    
                                    {opt.type === 'toggle' && (
                                        <span>[{opt.display}]</span>
                                    )}
                                    
                                    {opt.type === 'cycle' && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs opacity-50">◄</span>
                                            <span>{opt.type === 'cycle' && opt.id === 'gore' ? gore : difficulty}</span>
                                            <span className="text-xs opacity-50">►</span>
                                        </div>
                                    )}

                                    {opt.type === 'slider' && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-3 bg-zinc-900 border border-zinc-700 relative">
                                                <div 
                                                    className="h-full bg-green-600" 
                                                    style={{ width: `${gamma}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs w-8">{gamma}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Legend */}
                <div className="mt-12 pt-4 border-t border-zinc-800 grid grid-cols-2 text-xs font-mono text-zinc-500">
                    <div>
                        [UP/DOWN] SELECT PARAMETER
                        <br/>
                        [LEFT/RIGHT] ADJUST VALUE
                    </div>
                    <div className="text-right text-green-900">
                        JUNJUN CORP TERMINAL V4.02
                        <br/>
                        UNAUTHORIZED ACCESS IS PROHIBITED
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};