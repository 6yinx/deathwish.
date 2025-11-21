import React, { useEffect, useRef } from 'react';

export const ForegroundEmbers: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      life: number;
      maxLife: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createParticle = () => {
      const x = Math.random() * canvas.width;
      const y = canvas.height + 20;
      // Larger ember chunks for foreground compared to background
      const size = Math.random() * 6 + 3; 
      const speedY = Math.random() * 5 + 2; // Faster rising
      const speedX = (Math.random() - 0.5) * 8; // Chaotic wind
      const life = Math.random() * 80 + 40;
      const maxLife = life;
      const rotation = Math.random() * 360;
      const rotationSpeed = (Math.random() - 0.5) * 15;
      
      // Bright sparks colors
      const colors = ['#ffcc00', '#ff8800', '#ff4400', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particles.push({ x, y, size, speedY, speedX, life, maxLife, color, rotation, rotationSpeed });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn rate
      if (particles.length < 35) {
        if (Math.random() > 0.1) createParticle();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        p.life--;

        if (p.life <= 0 || p.y < -50) {
          particles.splice(i, 1);
          i--;
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        
        ctx.fillStyle = p.color;
        // Embers fade in and out
        ctx.globalAlpha = (p.life / p.maxLife) * Math.min(1, Math.sin(Date.now() * 0.01 + i) + 0.5); 
        
        // Draw diamond/square shape for retro feel
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        
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
    <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-40 mix-blend-screen" 
    />
  );
};