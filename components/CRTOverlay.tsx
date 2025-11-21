import React from 'react';

export const CRTOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden h-full w-full">
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10"></div>
      
      {/* Moving Scanline Bar */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-32 w-full animate-scanline opacity-30 pointer-events-none z-20"></div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-30"></div>
      
      {/* Slight RGB Shift/Chromatic Aberration Wrapper (Optional simulated via CSS box-shadow or text-shadow on children, but global blur helps) */}
      <div className="absolute inset-0 backdrop-blur-[0.5px] pointer-events-none z-0"></div>
    </div>
  );
};