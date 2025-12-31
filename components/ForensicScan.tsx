
import React, { useEffect, useRef } from 'react';

const ForensicScan: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let scanY = 0;
    const particles: { x: number; y: number; life: number; size: number; speed: number }[] = [];

    const draw = () => {
      // Semi-transparent clearing for trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // --- 1. Scanning Wave ---
      const waveHeight = 60;
      const gradient = ctx.createLinearGradient(0, scanY - waveHeight, 0, scanY);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - waveHeight, width, waveHeight);
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      scanY = (scanY + 3) % height;

      // --- 2. Digital Nodes (Particles) ---
      if (Math.random() > 0.8) {
        particles.push({
          x: Math.random() * width,
          y: scanY,
          life: 1.0,
          size: 1 + Math.random() * 3,
          speed: (Math.random() - 0.5) * 0.5
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Glow effect
        const pGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        pGradient.addColorStop(0, `rgba(16, 185, 129, ${p.life})`);
        pGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        
        ctx.fillStyle = pGradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(167, 243, 208, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speed;
        p.life -= 0.008;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // --- 3. Random Glitch Blocks ---
      if (Math.random() > 0.95) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 100, 2);
      }

      requestAnimationFrame(draw);
    };

    const animFrame = requestAnimationFrame(draw);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

export default ForensicScan;
