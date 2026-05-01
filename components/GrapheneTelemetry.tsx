import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Activity, RotateCcw, Target, Layers, MapPin } from 'lucide-react';

interface Waypoint {
  x: number;
  y: number;
  z: number;
  beta: number; // Deflection angle
}

const GrapheneTelemetry: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [metrics, setMetrics] = useState({
    hops: 0,
    distance: 0,
    deflection: 0,
    complexity: 0,
  });

  const p5Instance = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let localWaypoints: Waypoint[] = [];
      let camX = 0, camY = 0, camZ = 800;
      let rotX = 0, rotY = 0;
      let isDragging = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      const HOP_DIST = 40; // Visual scale for 1.42 Å

      // Initial dummy data to represent the graph
      for (let i = 0; i < 267; i++) {
        let prev = i > 0 ? localWaypoints[i - 1] : { x: 0, y: 0, z: 0, beta: 0 };
        let beta = [0, 60, 120, 180, 240, 300][Math.floor(Math.random() * 6)];
        let rad = p.radians(beta);

        // Simple random walk in 3D for demonstration
        let nextX = prev.x + HOP_DIST * p.cos(rad) * p.cos(p.radians(i * 5));
        let nextY = prev.y + HOP_DIST * p.sin(rad);
        let nextZ = prev.z + HOP_DIST * p.sin(rad) * p.sin(p.radians(i * 5));

        localWaypoints.push({ x: nextX, y: nextY, z: nextZ, beta });
      }

      setWaypoints(localWaypoints);

      const updateMetrics = (wps: Waypoint[]) => {
         const hops = wps.length;
         const d = 1.42;
         const dist = hops * d;
         const totalBeta = wps.reduce((acc, w) => acc + w.beta, 0);
         setMetrics({
           hops,
           distance: parseFloat(dist.toFixed(2)),
           deflection: totalBeta,
           complexity: parseFloat(((dist + totalBeta) / (dist || 1)).toFixed(3))
         });
      };
      updateMetrics(localWaypoints);


      p.setup = () => {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || window.innerHeight;
        p.createCanvas(width, height, p.WEBGL);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        // Apply some smooth styling
        p.setAttributes('antialias', true);
      };

      p.draw = () => {
        p.background(0, 0, 5); // Deep slate/black

        p.push();

        // Simple Camera control
        p.translate(0, 0, -camZ + 800);
        p.rotateX(rotX);
        p.rotateY(rotY);

        // Draw Axes for orientation
        p.stroke(0, 100, 100, 20);
        p.line(-1000, 0, 0, 1000, 0, 0);
        p.line(0, -1000, 0, 0, 1000, 0);
        p.line(0, 0, -1000, 0, 0, 1000);

        // Draw Waypoints
        for (let i = 0; i < localWaypoints.length; i++) {
          const w = localWaypoints[i];

          // Nodes
          p.push();
          p.translate(w.x, w.y, w.z);
          p.noStroke();
          p.fill(210, 80, 100, 80); // Blueish cyan
          p.sphere(4, 6, 6);
          p.pop();

          // Lines connecting them
          if (i > 0) {
            const prev = localWaypoints[i - 1];
            p.stroke(210, 80, 100, 40);
            p.strokeWeight(1);
            p.line(prev.x, prev.y, prev.z, w.x, w.y, w.z);
          }
        }

        // Draw the "Current Head" with a glow
        if (localWaypoints.length > 0) {
           const head = localWaypoints[localWaypoints.length - 1];
           p.push();
           p.translate(head.x, head.y, head.z);
           p.noStroke();
           p.fill(150, 100, 100, 90); // Emerald green for head
           p.sphere(8, 8, 8);

           // Pulse ring
           p.stroke(150, 100, 100, 50 * (1 + p.sin(p.frameCount * 0.1)));
           p.noFill();
           p.circle(0, 0, 20 + 10 * p.sin(p.frameCount * 0.1));
           p.pop();
        }

        p.pop();

        // Slow auto-rotation if not dragging
        if (!isDragging) {
           rotY += 0.002;
           rotX = p.lerp(rotX, p.sin(p.frameCount * 0.005) * 0.2, 0.01);
        }
      };

      p.mousePressed = () => {
         if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            isDragging = true;
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
         }
      };

      p.mouseDragged = () => {
         if (isDragging) {
            const dx = p.mouseX - lastMouseX;
            const dy = p.mouseY - lastMouseY;
            rotY += dx * 0.01;
            rotX += dy * 0.01;
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
         }
      };

      p.mouseReleased = () => {
         isDragging = false;
      };

      p.mouseWheel = (event: WheelEvent) => {
         if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
             camZ += event.deltaY * 1.5;
             camZ = p.constrain(camZ, 100, 3000);
         }
      };

      p.windowResized = () => {
        if (containerRef.current) {
           p.resizeCanvas(containerRef.current.clientWidth, containerRef.current.clientHeight);
        }
      };
    };

    p5Instance.current = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.current?.remove();
    };
  }, []);

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full flex flex-col p-2 lg:p-3 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex justify-between items-center shrink-0 px-3 py-1 mb-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-600/10 rounded-lg border border-emerald-500/20">
            <Layers className="text-emerald-400" size={18} />
          </div>
          <div>
            <h1 className="text-sm lg:text-lg font-black text-white italic uppercase tracking-tight leading-none">Graphene_Telemetry</h1>
            <p className="text-[7px] text-slate-500 mono uppercase font-black mt-1">MULTIPOINT LATTICE TRACKING</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-emerald-500 hover:text-emerald-400 transition-all text-[9px] mono font-black uppercase">
                <RotateCcw size={12} /> Reset Lattice
            </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 relative z-10">

        {/* Left Stats HUD */}
        <div className="lg:col-span-3 flex flex-col gap-2 min-h-0 pointer-events-none">
           <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-2xl pointer-events-auto">
              <h2 className="text-[10px] font-black text-slate-400 mono uppercase flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                 <Activity size={12} className="text-emerald-500" /> Route Metrics
              </h2>

              <div className="space-y-4">
                 <MetricRow label="Waypoints" value="42" highlight />
                 <MetricRow label="Hop Dist (d)" value="1.42 Å" />
                 <MetricRow label="Total Hops (N)" value={metrics.hops.toString()} />
                 <MetricRow label="Total Distance (Σd)" value={`${metrics.distance} Å`} />
                 <MetricRow label="Total Deflection (Σβ)" value={`${metrics.deflection.toFixed(1)}°`} />
                 <MetricRow label="Complexity (Σd+Σβ)/Σd" value={metrics.complexity.toString()} />
              </div>
           </div>

           <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex-1 flex flex-col min-h-0 pointer-events-auto">
              <h2 className="text-[10px] font-black text-slate-400 mono uppercase flex items-center gap-2 mb-4 border-b border-slate-800 pb-2 shrink-0">
                 <Target size={12} className="text-blue-500" /> Telemetry Log
              </h2>
              <div className="flex-1 overflow-y-auto scrollbar-style pr-2 space-y-1">
                 {waypoints.map((w, i) => (
                    <div key={i} className="flex justify-between items-center text-[9px] mono font-bold py-1 border-b border-white/5 last:border-0 hover:bg-white/5 px-1 rounded transition-colors">
                       <span className="text-slate-500">Hop {i+1}</span>
                       <span className="text-blue-400">β: {w.beta.toFixed(1)}°</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div className="lg:col-span-9 bg-black/40 border border-slate-800/50 rounded-2xl relative overflow-hidden backdrop-blur-sm cursor-move group">
           <div ref={containerRef} className="absolute inset-0" />

           {/* Crosshair Overlay */}
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity">
               <div className="w-8 h-8 border border-emerald-500/50 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
               </div>
           </div>

           {/* Controls overlay */}
           <div className="absolute top-4 right-4 pointer-events-none">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 backdrop-blur-xl">
                 <h3 className="text-[8px] font-black text-slate-500 uppercase mono mb-2 flex items-center gap-2">
                    <MapPin size={10} className="text-blue-500" /> Controls
                 </h3>
                 <p className="text-[8px] text-slate-400 mono italic">Drag to rotate • Scroll to zoom</p>
                 <p className="text-[8px] text-slate-400 mono italic mt-1 text-emerald-500/80">Click to add waypoints (disabled)</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const MetricRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
   <div className="flex justify-between items-center">
      <span className="text-[9px] font-black text-slate-500 mono uppercase tracking-tight">{label}</span>
      <span className={`text-[10px] font-black mono ${highlight ? 'text-emerald-400' : 'text-slate-200'}`}>{value}</span>
   </div>
);

export default GrapheneTelemetry;