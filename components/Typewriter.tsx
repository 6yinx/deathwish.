
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  playSound?: () => void;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 20, onComplete, playSound, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    // Reset refs when text changes
    index.current = 0;
    hasCompletedRef.current = false;
    setDisplayedText('');

    if (intervalRef.current) clearInterval(intervalRef.current);

    // If speed is 0, show immediately (visited page logic)
    if (speed === 0) {
        setDisplayedText(text);
        if (onComplete) onComplete();
        return;
    }

    intervalRef.current = setInterval(() => {
      if (index.current < text.length) {
        const char = text.charAt(index.current);
        setDisplayedText((prev) => prev + char);
        
        // Play sound on non-space characters, but skip some to avoid audio clutter
        if (playSound && char !== ' ' && index.current % 2 === 0) {
             playSound(); 
        }
        
        index.current++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            if (onComplete) onComplete();
        }
      }
    }, speed);

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, onComplete, playSound]);

  return <span className={className}>{displayedText}</span>;
};
