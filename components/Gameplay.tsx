
import React, { useEffect, useRef } from 'react';

interface GameplayProps {
  chapterId: number;
  onExit: (won: boolean) => void;
}

interface Entity {
  id: number;
  x: number; // -1 to 1 (screen space)
  y: number; // -1 to 1
  z: number; // Distance (starts high, moves to 0)
  type: 'walker' | 'runner' | 'tank';
  hp: number;
  maxHp: number;
  state: 'alive' | 'dying' | 'dead';
  animationFrame: number;
  dyingFrame: number;
  rotation: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Grenade {
  id: number;
  x: number;
  y: number;
  z: number;
  vz: number;
  vy: number;
  active: boolean;
}

// Chapter visual configurations mapping to the storyline
const CHAPTER_CONFIGS: Record<number, { name: string, type: string, sky: string, ground: string }> = {
  // Season 1
  1: { name: "DEADFALL WOODS", type: 'forest', sky: '#051005', ground: '#0a1505' },
  2: { name: "ROUTE 666", type: 'highway', sky: '#000000', ground: '#111111' },
  3: { name: "LAST STOP FUEL", type: 'gas_station', sky: '#050000', ground: '#100505' },
  4: { name: "SUBURBIA ROT", type: 'suburbs', sky: '#000015', ground: '#050510' },
  5: { name: "MERCY GENERAL", type: 'hospital', sky: '#051010', ground: '#101515' },
  6: { name: "METRO CITY PLAZA", type: 'city', sky: '#050505', ground: '#080808' },
  7: { name: "THE JUNJUN SPIRE", type: 'office', sky: '#000000', ground: '#1a1a1a' },
  // Season 2
  8: { name: "RUBBLE & ASH", type: 'ruins', sky: '#100505', ground: '#151010' },
  9: { name: "STATIC SIGNAL", type: 'industrial', sky: '#000510', ground: '#050a10' },
  10: { name: "IRON ENCLAVE", type: 'depot', sky: '#050500', ground: '#101005' },
  11: { name: "SUPPLY RUN", type: 'mart', sky: '#000000', ground: '#151515' },
  12: { name: "BAD BLOOD", type: 'scrapyard', sky: '#201005', ground: '#251505' },
  13: { name: "THE FLOOD", type: 'bridge', sky: '#001020', ground: '#051525' },
  14: { name: "EXODUS", type: 'cliff', sky: '#200000', ground: '#301010' },
};

export const Gameplay: React.FC<GameplayProps> = ({ chapterId, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const gameState = useRef({
    zombies: [] as Entity[],
    particles: [] as Particle[],
    grenades: [] as Grenade[],
    kills: 0,
    targetKills: 100,
    health: 100,
    ammo: 12,
    maxAmmo: 12,
    grenadeCount: 2,
    reloading: false,
    reloadTimer: 0,
    flashlight: false,
    gameOver: false,
    win: false,
    lastShotTime: 0,
    shake: 0,
    spawnTimer: 0,
    animationFrame: 0
  });

  // Audio Context
  const audioCtx = useRef<AudioContext | null>(null);
  
  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
  };

  const playSound = (type: 'shoot' | 'reload' | 'empty' | 'moan' | 'hit' | 'explode') => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const t = ctx.currentTime;

    if (type === 'shoot') {
      // Gunshot
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.1);
      
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      noise.connect(noiseGain);
      gain.connect(ctx.destination);
      noiseGain.connect(ctx.destination);
      osc.start();
      noise.start();
      osc.stop(t + 0.15);
    } else if (type === 'reload') {
      // Mechanical Click-Clack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      
      // Slide back
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(350, t + 0.1);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(t + 0.15);

      // Slide forward (delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(350, t + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(200, t + 0.5);
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.setValueAtTime(0.2, t + 0.4);
      gain2.gain.linearRampToValueAtTime(0, t + 0.55);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(t + 0.6);

    } else if (type === 'moan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(70 + Math.random()*20, t);
      osc.frequency.linearRampToValueAtTime(40, t + 0.6);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(t + 0.6);
    } else if (type === 'explode') {
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(t+0.5);
    }
  };

  useEffect(() => {
    initAudio();
    
    let animationId: number;
    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.current.gameOver || gameState.current.win) return;
      
      if (e.key.toLowerCase() === 'r') {
        if (gameState.current.ammo < gameState.current.maxAmmo && !gameState.current.reloading) {
          gameState.current.reloading = true;
          gameState.current.reloadTimer = 60; // ~1s
          playSound('reload');
        }
      }
      if (e.key.toLowerCase() === 'f') {
        gameState.current.flashlight = !gameState.current.flashlight;
      }
      if (e.key.toLowerCase() === 'g') {
        throwGrenade();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [chapterId]);

  const spawnZombie = () => {
    const types: ('walker' | 'runner' | 'tank')[] = ['walker', 'walker', 'runner', 'tank'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Health Values: Walker=75, Runner=50, Tank=200
    // Gun Dmg=25. Walker dies in 3 shots.
    const hp = type === 'tank' ? 200 : type === 'runner' ? 50 : 75;
    
    const x = (Math.random() * 1.6) - 0.8; 
    
    gameState.current.zombies.push({
      id: Math.random(),
      x,
      y: 0.2, 
      z: 20, 
      type,
      hp,
      maxHp: hp,
      state: 'alive',
      animationFrame: 0,
      dyingFrame: 0,
      rotation: 0
    });
  };

  const throwGrenade = () => {
    if (gameState.current.grenadeCount > 0) {
      gameState.current.grenadeCount--;
      gameState.current.grenades.push({
        id: Math.random(),
        x: 0, y: 0.5, z: 0, vz: 0.8, vy: -0.1, active: true
      });
    }
  };

  const createExplosion = (z: number) => {
    playSound('explode');
    gameState.current.shake = 25;
    gameState.current.zombies.forEach(zom => {
      if (Math.abs(zom.z - z) < 5 && zom.state === 'alive') {
        zom.hp -= 200; // Grenade kills most instantly
        if (zom.hp <= 0) {
            zom.state = 'dying';
            gameState.current.kills++;
        }
      }
    });
    // Visuals
    for(let i=0; i<30; i++) {
        gameState.current.particles.push({
            x: (Math.random() - 0.5) * 0.5,
            y: 0,
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() - 0.5) * 0.05,
            life: 40,
            color: '#ff5500',
            size: Math.random() * 80 / Math.max(1, z)
        });
    }
  };

  const update = () => {
    const state = gameState.current;
    if (state.gameOver || state.win) return;

    state.animationFrame++;

    if (state.kills >= state.targetKills && !state.win) {
      state.win = true;
      setTimeout(() => onExit(true), 4000);
    }
    if (state.health <= 0 && !state.gameOver) {
      state.gameOver = true;
      setTimeout(() => onExit(false), 4000);
    }

    // Spawning
    if (state.kills + state.zombies.length < state.targetKills) {
        state.spawnTimer++;
        const spawnRate = Math.max(30, 70 - (chapterId * 2)); 
        if (state.spawnTimer > spawnRate) {
            spawnZombie();
            state.spawnTimer = 0;
        }
    }

    if (state.reloading) {
      state.reloadTimer--;
      if (state.reloadTimer <= 0) {
        state.ammo = state.maxAmmo;
        state.reloading = false;
      }
    }

    if (state.shake > 0) state.shake *= 0.9;

    // Grenades
    state.grenades.forEach(g => {
        g.z += g.vz;
        g.y += g.vy;
        g.vy += 0.005;
        if (g.y > 0.5) {
            g.active = false;
            createExplosion(g.z);
        }
    });
    state.grenades = state.grenades.filter(g => g.active);

    // Zombies
    state.zombies.forEach(z => {
      if (z.state === 'alive') {
          // Movement
          const speed = z.type === 'runner' ? 0.04 : z.type === 'tank' ? 0.01 : 0.02;
          z.z -= speed;
          z.animationFrame++;

          // Attack
          if (z.z <= 1) {
            state.health -= z.type === 'tank' ? 0.5 : 0.1;
            state.shake = 3;
            if (state.animationFrame % 60 === 0) playSound('hit');
            z.z = 1; 
          }
      } else if (z.state === 'dying') {
          // Dying animation logic
          z.dyingFrame++;
          z.y += 0.01; // Sink
          z.rotation += 0.05; // Topple
      }
    });

    state.zombies = state.zombies.filter(z => {
      if (z.state === 'dying' && z.dyingFrame > 40) return false;
      return true;
    });

    // Particles
    state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });
    state.particles = state.particles.filter(p => p.life > 0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (gameState.current.reloading || gameState.current.ammo <= 0 || gameState.current.gameOver || gameState.current.win) {
        if (gameState.current.ammo <= 0 && !gameState.current.reloading) playSound('empty');
        return;
    }

    const state = gameState.current;
    state.ammo--;
    state.lastShotTime = Date.now();
    state.shake = 10;
    playSound('shoot');

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    const sorted = [...state.zombies].sort((a, b) => a.z - b.z);
    
    for (const z of sorted) {
      if (z.state !== 'alive') continue;
      
      const scale = 2 / Math.max(0.1, z.z);
      const w = 0.3 * scale;
      const h = 0.8 * scale;
      const sx = z.x / (z.z * 0.5);
      const sy = z.y / (z.z * 0.5) - (0.2 * scale);

      if (mouseX >= sx - w/2 && mouseX <= sx + w/2 && mouseY >= sy - h/2 && mouseY <= sy + h/2) {
        z.hp -= 25; // Gun Damage
        
        // Blood
        for(let i=0; i<5; i++) {
            state.particles.push({
                x: sx,
                y: sy,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02,
                life: 20,
                color: '#8a0303',
                size: Math.random() * 10
            });
        }
        
        if (z.hp <= 0) {
          z.state = 'dying';
          z.animationFrame = 0;
          state.kills++;
          playSound('moan');
        }
        break; 
      }
    }
  };

  const drawEnvironment = (ctx: CanvasRenderingContext2D, w: number, h: number, cfg: any) => {
    // Ground
    const grad = ctx.createLinearGradient(0, h/2, 0, h);
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.1, cfg.ground);
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h/2, w, h/2);

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h/2);
    skyGrad.addColorStop(0, cfg.sky);
    skyGrad.addColorStop(1, '#000');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h/2);

    // Scenery Props based on type
    ctx.fillStyle = '#000';
    
    if (cfg.type === 'forest') {
        for (let i = 0; i < w; i+=30) {
            const height = 100 + Math.random() * 200;
            // Tree trunk
            ctx.fillRect(i, h/2 - height, 15, height);
            // Branches
            if(Math.random() > 0.5) ctx.fillRect(i - 15, h/2 - height + 50, 30, 5);
        }
    } else if (cfg.type === 'highway') {
        // Road lines
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(w/2 - 20, h/2);
        ctx.lineTo(0, h);
        ctx.lineTo(w, h);
        ctx.lineTo(w/2 + 20, h/2);
        ctx.fill();
        // Dashed yellow
        ctx.strokeStyle = '#aa0';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 40]);
        ctx.beginPath();
        ctx.moveTo(w/2, h/2);
        ctx.lineTo(w/2, h);
        ctx.stroke();
        ctx.setLineDash([]);
    } else if (cfg.type === 'city' || cfg.type === 'office' || cfg.type === 'ruins' || cfg.type === 'hospital' || cfg.type === 'suburbs') {
        for (let i = 0; i < w; i+=60) {
            const height = 100 + Math.random() * 300;
            const buildingW = 50 + Math.random() * 40;
            ctx.fillStyle = cfg.type === 'ruins' ? '#1a1a1a' : '#050505';
            ctx.fillRect(i, h/2 - height, buildingW, height);
            // Windows
            if (cfg.type !== 'ruins') {
                ctx.fillStyle = '#111';
                for(let j=0; j<height; j+=20) {
                    if(Math.random()>0.5) ctx.fillRect(i+5, h/2 - height + j, 5, 10);
                }
            }
        }
    } else if (cfg.type === 'mart' || cfg.type === 'depot' || cfg.type === 'industrial') {
        // Interior/Industrial look - Pillars/Racks
        for (let i = 0; i < w; i+=100) {
            ctx.fillStyle = '#080808';
            ctx.fillRect(i, 0, 20, h/2); // Ceiling beams
            ctx.fillRect(i, h/2 - 100, 10, 100); // Floor supports
        }
    }
  };

  const drawGun = (ctx: CanvasRenderingContext2D, w: number, h: number, state: any) => {
      const gunBob = Math.sin(Date.now() / 200) * 5;
      const recoil = Math.max(0, 20 - (Date.now() - state.lastShotTime) / 5);
      
      const gx = w/2;
      const gy = h;
      
      ctx.save();
      ctx.translate(gx, gy + gunBob + recoil);
      
      // Hand/Grip
      ctx.fillStyle = '#111';
      ctx.fillRect(-20, -100, 40, 100);
      
      // Slide (Top)
      ctx.fillStyle = '#2a2a2a'; // Dark metal
      ctx.fillRect(-25, -140, 50, 100);
      
      // Slide detail (ejection port)
      ctx.fillStyle = '#000';
      ctx.fillRect(5, -130, 15, 25);

      // Sights
      ctx.fillStyle = '#444';
      ctx.fillRect(-5, -145, 10, 5); // Rear sight
      ctx.fillStyle = '#0f0'; // Tritium dot
      ctx.fillRect(-2, -144, 4, 2);

      // Muzzle Flash
      if (Date.now() - state.lastShotTime < 50) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(0, -160, 20 + Math.random()*30, 0, Math.PI*2);
          ctx.fill();
          ctx.fillStyle = '#fa0';
          ctx.beginPath();
          ctx.arc(0, -160, 15 + Math.random()*15, 0, Math.PI*2);
          ctx.fill();
      }

      ctx.restore();
  };

  const drawZombie = (ctx: CanvasRenderingContext2D, w: number, h: number, z: Entity) => {
    const scale = 10 / Math.max(0.5, z.z);
    const size = h * 0.2 * scale;
    
    const sx = (w / 2) + (z.x * w * 0.5) / (z.z * 0.2 + 1);
    const sy = (h / 2) + (size * 0.5);
    
    ctx.save();
    ctx.translate(sx, sy);
    
    if (z.state === 'dying') {
        ctx.rotate(z.rotation); 
        ctx.globalAlpha = 1 - (z.dyingFrame / 40);
        ctx.translate(0, z.dyingFrame * 2); // Fall down
    }

    // Clothing Colors
    let shirtColor = '#445566';
    let pantsColor = '#222';
    let skinColor = '#4a635d'; // Rotting green

    if (z.type === 'runner') {
        shirtColor = '#701111'; // Red shirt
        skinColor = '#5c4a4a'; // Pale
    }
    if (z.type === 'tank') {
        shirtColor = '#222'; // Tactical gear
        skinColor = '#334433'; // Dark green
    }

    // Legs
    const walk = Math.sin(z.animationFrame * 0.15) * (size/8);
    ctx.fillStyle = pantsColor;
    ctx.fillRect(-size/4, -size/2, size/5, size/2); // Left Leg
    ctx.fillRect(size/20, -size/2, size/5, size/2); // Right Leg

    // Torso
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-size/3, -size*0.9, size*0.66, size*0.5);
    
    // Arms (Outstretched)
    ctx.fillStyle = shirtColor;
    ctx.save();
    ctx.translate(-size/3, -size*0.8);
    ctx.rotate(0.2 + Math.sin(z.animationFrame*0.1)*0.1);
    ctx.fillRect(0, 0, size/6, size*0.4); // Left Arm
    ctx.restore();

    ctx.save();
    ctx.translate(size/3, -size*0.8);
    ctx.rotate(-0.2 - Math.sin(z.animationFrame*0.1)*0.1);
    ctx.fillRect(-size/6, 0, size/6, size*0.4); // Right Arm
    ctx.restore();

    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(-size/5, -size*1.15, size*0.4, size*0.35);
    
    // Eyes (Glowing Red)
    ctx.fillStyle = '#f00';
    ctx.fillRect(-size/10, -size*1.05, size/15, size/15);
    ctx.fillRect(size/30, -size*1.05, size/15, size/15);

    // Damage Flash
    if (z.hp < z.maxHp) {
        // Blood stains
        ctx.fillStyle = '#500';
        ctx.fillRect(-size/8, -size*0.8, size/4, size/10);
    }

    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    const w = canvas.width;
    const h = canvas.height;
    const state = gameState.current;
    const cfg = CHAPTER_CONFIGS[chapterId] || CHAPTER_CONFIGS[1];

    // Shake
    const shakeX = (Math.random() - 0.5) * state.shake;
    const shakeY = (Math.random() - 0.5) * state.shake;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 1. Environment
    drawEnvironment(ctx, w, h, cfg);

    // 2. Grenades
    state.grenades.forEach(g => {
        const scale = 500 / Math.max(0.1, g.z + 5);
        const sx = (w/2) + (g.x * w) / (g.z * 0.5 + 1);
        const sy = (h/2) + (g.y * h) / (g.z * 0.5 + 1);
        ctx.fillStyle = '#005500';
        ctx.beginPath();
        ctx.arc(sx, sy, 8 * (10/Math.max(1, g.z)), 0, Math.PI * 2);
        ctx.fill();
    });

    // 3. Zombies
    const sortedZombies = [...state.zombies].sort((a, b) => b.z - a.z);
    sortedZombies.forEach(z => drawZombie(ctx, w, h, z));

    // 4. Particles
    state.particles.forEach(p => {
        const sx = (w/2) + p.x * w;
        const sy = (h/2) + p.y * h;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // 5. Flashlight (Darkness Mask)
    if (!state.flashlight) {
        const gradient = ctx.createRadialGradient(w/2, h/2, h/5, w/2, h/2, h);
        gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    // 6. Gun Model
    drawGun(ctx, w, h, state);

    // 7. Global Effects (Grain / Shader)
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = '#403020'; // Sepia tint
    ctx.fillRect(0,0,w,h);
    
    // Noise
    const noiseSize = 4;
    for(let i=0; i<w; i+=100) {
       if(Math.random() > 0.5) {
           ctx.fillStyle = `rgba(0,0,0,0.1)`;
           ctx.fillRect(i, Math.random()*h, 100, 2);
       }
    }
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore(); 

    // --- HUD ---
    ctx.font = "20px 'VT323', monospace";
    
    ctx.textAlign = "left";
    ctx.fillStyle = state.health < 30 ? "#ff0000" : "#00ff00";
    ctx.fillText(`HP: ${Math.max(0, Math.floor(state.health))}%`, 20, 40);
    ctx.fillStyle = "#00ff00";
    ctx.fillText(`KILLS: ${state.kills} / ${state.targetKills}`, 20, 70);

    ctx.textAlign = "right";
    ctx.fillText(cfg.name, w - 20, 40);
    ctx.fillStyle = "#888";
    ctx.fillText("MISSION IN PROGRESS", w - 20, 65);

    ctx.textAlign = "left";
    ctx.font = "40px 'Black Ops One', cursive";
    ctx.fillStyle = state.reloading ? "#ffff00" : "#ffaa00";
    ctx.fillText(state.reloading ? "RELOADING..." : `AMMO: ${state.ammo}`, 20, h - 30);

    ctx.textAlign = "right";
    ctx.font = "16px 'VT323', monospace";
    ctx.fillStyle = "#aaa";
    ctx.fillText("[R] RELOAD", w - 20, h - 80);
    ctx.fillText(`[F] FLASHLIGHT: ${state.flashlight ? "ON" : "OFF"}`, w - 20, h - 60);
    ctx.fillText(`[G] GRENADES: ${state.grenadeCount}`, w - 20, h - 40);

    // Overlay Screens
    if (state.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = "center";
        const offsetX = Math.random() * 4 - 2;
        ctx.font = "80px 'Black Ops One', cursive";
        ctx.fillStyle = "#ff0000";
        ctx.fillText("MISSION FAILED", w/2 + offsetX, h/2);
        ctx.font = "30px 'VT323', monospace";
        ctx.fillStyle = "#888";
        ctx.fillText("SIGNAL LOST...", w/2, h/2 + 60);
    }
    
    if (state.win) {
        ctx.fillStyle = "rgba(0, 20, 0, 0.95)";
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.font = "80px 'Black Ops One', cursive";
        ctx.fillStyle = "#00ff00";
        ctx.fillText("MISSION COMPLETE", w/2, h/2);
        ctx.font = "30px 'VT323', monospace";
        ctx.fillStyle = "#afa";
        ctx.fillText("AREA SECURED", w/2, h/2 + 60);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full cursor-crosshair" onClick={handleClick}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
