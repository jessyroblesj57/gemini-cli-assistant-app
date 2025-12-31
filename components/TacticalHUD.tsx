
import React, { useEffect, useRef } from 'react';

const TacticalHUD: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let angle = 0;
    const telemetry: string[] = [];
    for (let i = 0; i < 20; i++) {
      telemetry.push(Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0'));
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const themeColor = 'rgba(16, 185, 129, 0.4)'; // Emerald-500
      const gridColor = 'rgba(16, 185, 129, 0.05)';

      // --- 1. Grid Lines ---
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- 2. Corner Brackets ---
      const padding = 20;
      const size = 40;
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 2;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(padding, padding + size);
      ctx.lineTo(padding, padding);
      ctx.lineTo(padding + size, padding);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(width - padding - size, padding);
      ctx.lineTo(width - padding, padding);
      ctx.lineTo(width - padding, padding + size);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width - padding, height - padding - size);
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(width - padding - size, height - padding);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(padding + size, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(padding, height - padding - size);
      ctx.stroke();

      // --- 3. Radar Sweep (Bottom Left) ---
      const radarSize = 140;
      const radarX = padding + 100;
      const radarY = height - padding - 100;

      ctx.save();
      ctx.translate(radarX, radarY);
      
      // Radar Background
      ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Radar circles
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radarSize / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(-radarSize/2, 0);
      ctx.lineTo(radarSize/2, 0);
      ctx.moveTo(0, -radarSize/2);
      ctx.lineTo(0, radarSize/2);
      ctx.stroke();

      // Sweep gradient
      const gradient = ctx.createConicGradient(angle, 0, 0);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.6)');
      gradient.addColorStop(0.2, 'rgba(16, 185, 129, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radarSize / 2, angle - 0.5, angle);
      ctx.fill();

      angle += 0.04;
      ctx.restore();

      // --- 4. Telemetry (Right Side) ---
      ctx.fillStyle = themeColor;
      ctx.font = '700 10px "JetBrains Mono"';
      telemetry.forEach((hex, i) => {
        if (Math.random() > 0.98) {
          telemetry[i] = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0');
        }
        const text = `EXEC_SEG::0x${hex}`;
        ctx.fillText(text, width - padding - 120, padding + 100 + (i * 18));
      });

      // --- 5. Central Reticle & Status ---
      const centerX = width / 2;
      const centerY = height / 2;
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.2);
      ctx.setLineDash([10, 20]);
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

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
      className="absolute inset-0 pointer-events-none z-20"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default TacticalHUD;
