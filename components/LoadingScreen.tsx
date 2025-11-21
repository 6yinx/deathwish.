import React, { useEffect, useState } from 'react';
import { Biohazard } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [text, setText] = useState("INITIALIZING...");

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.random() * 5;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress > 30) setText("LOADING MAP DATA...");
        if (progress > 60) setText("SPAWNING ENTITIES...");
        if (progress > 90) setText("UNLEASHING HORROR...");
    }, [progress]);

    return (
        <div className="w-full max-w-lg flex flex-col items-center gap-6">
            <Biohazard size={64} className="text-red-600 animate-spin-slow duration-[3000ms]" />
            <div className="w-full h-6 border-2 border-zinc-700 p-1">
                <div 
                    className="h-full bg-red-700 transition-all duration-200" 
                    style={{ width: `${Math.min(100, progress)}%` }}
                ></div>
            </div>
            <div className="flex justify-between w-full text-xs font-mono text-zinc-400">
                <span>{text}</span>
                <span>{Math.floor(progress)}%</span>
            </div>
        </div>
    );
};