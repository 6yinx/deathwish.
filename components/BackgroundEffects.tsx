import React, { useEffect, useRef } from 'react';

export const BackgroundEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseXRef = useRef(window.innerWidth / 2);

  // Track mouse for wind interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Particle Types
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      life: number;
      maxLife: number;
      color: string;
      type: 'fire' | 'ash' | 'paper';
      rotation?: number;
    }

    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createFireParticle = () => {
      const x = Math.random() * canvas.width;
      const y = canvas.height + Math.random() * 20;
      const size = Math.random() * 8 + 4; 
      const speedY = Math.random() * 3 + 1.5;
      const speedX = (Math.random() - 0.5) * 2;
      const life = Math.random() * 50 + 30;
      const colors = ['#ff4500', '#ff8c00', '#ff0000', '#aa0000'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particles.push({ x, y, size, speedY, speedX, life, maxLife: life, color, type: 'fire' });
    };

    const createDebrisParticle = () => {
      // Spawn from top or sides
      const spawnTop = Math.random() > 0.5;
      const x = Math.random() * canvas.width;
      const y = spawnTop ? -10 : Math.random() * canvas.height;
      
      const isPaper = Math.random() > 0.9;
      const size = isPaper ? Math.random() * 4 + 2 : Math.random() * 2 + 1;
      const speedY = Math.random() * 0.5 + 0.2; // Fall slowly
      const speedX = (Math.random() - 0.5) * 1;
      const life = Math.random() * 200 + 100;
      const color = isPaper ? '#a1a1aa' : '#52525b'; // Zinc-400 vs Zinc-600
      
      particles.push({ 
        x, y, size, speedY, speedX, life, maxLife: life, color, 
        type: isPaper ? 'paper' : 'ash',
        rotation: Math.random() * 360
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate Wind Force based on mouse position relative to center
      // Left side = wind blows right, Right side = wind blows left (vacuum effect)
      // OR: Mouse movement drags air? Let's do "Mouse attracts wind" or simple parallax.
      // Let's do: Mouse on left -> Wind blows right. Mouse on right -> Wind blows left.
      const centerX = window.innerWidth / 2;
      const windForce = (mouseXRef.current - centerX) / centerX * 2; // Range -2 to 2

      // Spawning
      if (particles.filter(p => p.type === 'fire').length < 200) {
        for (let i = 0; i < 4; i++) createFireParticle();
      }
      if (particles.filter(p => p.type !== 'fire').length < 100) {
        if (Math.random() > 0.5) createDebrisParticle();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Apply movement
        if (p.type === 'fire') {
            p.y -= p.speedY;
            p.x += p.speedX + Math.sin(p.y * 0.02) * 0.5 + (windForce * 0.5); // Wind affects fire top more? constant for now
            p.size *= 0.96;
        } else {
            // Ash/Paper logic
            p.y += p.speedY; // Gravity
            p.x += p.speedX + windForce; // Stronger wind influence on light debris
            if (p.rotation !== undefined) p.rotation += (windForce * 2) + 1;
            
            // Wrap around screen for debris
            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
        }

        p.life--;

        // Kill logic
        if (p.life <= 0 || (p.type === 'fire' && p.size < 0.5) || (p.type !== 'fire' && p.y > canvas.height)) {
          particles.splice(i, 1);
          i--;
          continue;
        }

        // Render
        ctx.save();
        
        if (p.type === 'paper') {
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation || 0) * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = (p.life / p.maxLife) * 0.6;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 1.5); // Rectangular paper
        } else if (p.type === 'ash') {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = (p.life / p.maxLife) * 0.4;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        } else {
            // Fire
            ctx.fillStyle = p.color;
            ctx.globalAlpha = (p.life / p.maxLife) * 0.8;
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size));
        }
        
        ctx.restore();
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-black">
      
      {/* SVG Filter for Heat Haze */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="heatHaze">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="1" result="noise" seed="0">
              <animate attributeName="baseFrequency" dur="10s" values="0.01 0.02;0.01 0.05;0.01 0.02" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>
        </defs>
      </svg>

      {/* Sky / Ambiance Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-zinc-900 to-black opacity-90"></div>

      {/* Background City Layer (Far) */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] opacity-40 grayscale invert-0 sepia-[.5] hue-rotate-[-50deg] brightness-[0.4]"
           style={{
             backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 300\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,300 L0,200 L50,200 L50,150 L100,150 L100,220 L150,220 L150,100 L200,100 L200,250 L250,250 L250,180 L300,180 L300,300 Z M300,300 L300,180 L350,180 L350,240 L400,240 L400,120 L450,120 L450,200 L500,200 L500,280 L600,280 L600,140 L650,140 L650,300 Z M650,300 L700,300 L700,160 L750,160 L750,220 L800,220 L800,100 L850,100 L850,250 L900,250 L900,200 L950,200 L950,300 Z\' fill=\'%23222\'/%3E%3C/svg%3E")',
             backgroundRepeat: 'repeat-x',
             backgroundSize: '100% 100%'
           }}>
      </div>

      {/* Foreground City Layer (Near) with Heat Haze */}
      <div className="absolute bottom-0 left-0 w-full h-[25vh] opacity-80 grayscale invert-0 sepia-[.5] hue-rotate-[-50deg] brightness-[0.2]"
           style={{
             backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 200\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,200 L0,100 L40,100 L40,50 L80,50 L80,150 L120,150 L120,80 L160,80 L160,200 Z M200,200 L200,120 L250,120 L250,180 L300,180 L300,60 L350,60 L350,200 Z M400,200 L400,90 L450,90 L450,140 L500,140 L500,200 Z M600,200 L600,130 L650,130 L650,40 L700,40 L700,200 Z\' fill=\'%23000\'/%3E%3C/svg%3E")',
             backgroundRepeat: 'repeat-x',
             backgroundSize: '50% 100%',
             filter: 'url(#heatHaze)'
           }}>
      </div>

      {/* Rising Smoke / Fog */}
      <div className="absolute inset-0 z-10">
          <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-zinc-900/90 to-transparent"></div>
          {/* Animated Fog patches */}
          <div className="absolute bottom-0 w-[200%] h-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4wMSIgbnV1bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjZikiIG9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==')] opacity-20 animate-[scanline_20s_linear_infinite] mix-blend-overlay" style={{ animationDirection: 'reverse' }}></div>
      </div>

      {/* Fire & Debris Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-20 mix-blend-hard-light" />
      
      {/* Vignette & Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-10 z-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-30 pointer-events-none"></div>
      
      <style>{`
        @keyframes heat-shimmer {
            0% { transform: scaleY(1) skewX(0deg); }
            50% { transform: scaleY(1.02) skewX(0.5deg); }
            100% { transform: scaleY(1) skewX(0deg); }
        }
      `}</style>
    </div>
  );
};