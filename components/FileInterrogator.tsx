
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  FolderTree, Binary, Zap, BrainCircuit,
  Terminal, Settings2, Target, Activity, 
  MousePointer2, FileCode, Cpu, Shield, 
  Search, Database, FileText, Layout,
  RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { FileNode, FileLink, NodeType } from '../types';

const FileInterrogator: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);

  // Real data reflecting the project structure provided in the context
  const initialNodes: FileNode[] = [
    { id: 'root', name: 'WATCHTOWER_ROOT', type: 'ROOT' },
    { id: 'core', name: 'CORE_LOGIC', type: 'ROOT' },
    { id: 'components', name: 'UI_COMPONENTS', type: 'ROOT' },
    { id: 'visuals', name: 'VISUAL_EFFECTS', type: 'ROOT' },
    { id: 'docs', name: 'DOCUMENTATION', type: 'ROOT' },

    // Core Files
    { id: 'index_tsx', name: 'index.tsx', type: 'PROGRAM', description: 'Application entry point.' },
    { id: 'app_tsx', name: 'App.tsx', type: 'PROGRAM', description: 'Main orchestration layer and state manager.' },
    { id: 'types_ts', name: 'types.ts', type: 'PROGRAM', description: 'Global TypeScript definitions.' },
    { id: 'bridge_json', name: 'gemini_cli_bridge.json', type: 'EXT', description: 'Forensic integration bridge config.' },
    { id: 'metadata_json', name: 'metadata.json', type: 'EXT', description: 'Project manifest.' },

    // UI Components
    { id: 'dashboard', name: 'WatchtowerDashboard.tsx', type: 'AGENT', description: 'Performance and event stream visualization.' },
    { id: 'intel', name: 'IntelLab.tsx', type: 'AGENT', description: 'Search and Maps grounding engine.' },
    { id: 'wsl', name: 'WslManagementSuite.tsx', type: 'AGENT', description: 'WSL subsystem interrogation tool.' },
    { id: 'deploy', name: 'DeploymentLab.tsx', type: 'AGENT', description: 'Build scripts and MCP registry.' },
    { id: 'bridge_portal', name: 'CliBridgePortal.tsx', type: 'AGENT', description: 'Master manifest portal.' },
    { id: 'hub', name: 'IntelligenceHub.tsx', type: 'AGENT', description: 'AI Core reasoning interface.' },
    { id: 'python', name: 'PythonLab.tsx', type: 'AGENT', description: 'In-browser Python script executor.' },
    
    // Visual Effects
    { id: 'matrix', name: 'MatrixRain.tsx', type: 'EXT', description: 'Background visual atmosphere.' },
    { id: 'hud', name: 'TacticalHUD.tsx', type: 'EXT', description: 'Overlay HUD layer.' },
    { id: 'scan', name: 'ForensicScan.tsx', type: 'EXT', description: 'Scanning wave effect.' },
    { id: 'cortex', name: 'NeuralCortex.tsx', type: 'EXT', description: 'Dynamic force-directed background.' },

    // Docs
    { id: 'context_md', name: 'CONTEXT.md', type: 'API_SPEC', description: 'System context and agent identities.' },
    { id: 'build_md', name: 'BUILD_PROTOCOL.md', type: 'API_SPEC', description: 'Compilation directives.' }
  ];

  const initialLinks: FileLink[] = [
    { source: 'root', target: 'core' },
    { source: 'root', target: 'components' },
    { source: 'root', target: 'visuals' },
    { source: 'root', target: 'docs' },
    
    // Core Links
    { source: 'core', target: 'index_tsx' },
    { source: 'core', target: 'app_tsx' },
    { source: 'core', target: 'types_ts' },
    { source: 'root', target: 'bridge_json' },
    { source: 'root', target: 'metadata_json' },

    // UI Dependencies
    { source: 'app_tsx', target: 'dashboard' },
    { source: 'app_tsx', target: 'intel' },
    { source: 'app_tsx', target: 'wsl' },
    { source: 'app_tsx', target: 'deploy' },
    { source: 'app_tsx', target: 'bridge_portal' },
    { source: 'app_tsx', target: 'hub' },
    { source: 'app_tsx', target: 'python' },

    // Visual Dependencies
    { source: 'visuals', target: 'matrix' },
    { source: 'visuals', target: 'hud' },
    { source: 'visuals', target: 'scan' },
    { source: 'visuals', target: 'cortex' },

    // Doc Links
    { source: 'docs', target: 'context_md' },
    { source: 'docs', target: 'build_md' },
    
    // Special Relationships
    { source: 'dashboard', target: 'hud' },
    { source: 'dashboard', target: 'cortex' },
    { source: 'intel', target: 'types_ts' }
  ];

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll("*").remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Defs for glow and patterns
    const defs = svg.append('defs');
    
    const filter = defs.append('filter').attr('id', 'neon-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // Background Grid Pattern
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(59, 130, 246, 0.05)')
      .attr('stroke-width', 1);

    svg.insert('rect', ':first-child')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#grid)');

    const simulation = d3.forceSimulation<FileNode>(initialNodes)
      .force('link', d3.forceLink<FileNode, FileLink>(initialLinks).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const link = g.append('g')
      .selectAll('line')
      .data(initialLinks)
      .join('line')
      .attr('stroke', 'rgba(59, 130, 246, 0.15)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', d => (d.source as any).type === 'ROOT' ? 'none' : '2,2');

    const node = g.append('g')
      .selectAll<SVGGElement, FileNode>('g')
      .data(initialNodes)
      .join('g')
      .on('click', (event, d) => {
        setSelectedNode(d);
        const transform = d3.zoomTransform(svg.node()!);
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity.translate(width / 2 - d.x! * transform.k, height / 2 - d.y! * transform.k).scale(transform.k)
        );
      })
      .call(d3.drag<SVGGElement, FileNode>()
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }) as any);

    node.append('path')
      .attr('d', d => {
        if (d.type === 'ROOT') return d3.symbol().type(d3.symbolDiamond).size(400)();
        if (d.type === 'AGENT') return d3.symbol().type(d3.symbolStar).size(200)();
        if (d.type === 'PROGRAM') return d3.symbol().type(d3.symbolSquare).size(180)();
        return d3.symbol().type(d3.symbolCircle).size(150)();
      })
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', d => getNodeColor(d.type))
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 2)
      .style('filter', 'url(#neon-glow)')
      .attr('class', 'cursor-pointer transition-all hover:scale-125');

    node.append('text')
      .text(d => d.name)
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', 'rgba(255, 255, 255, 0.4)')
      .style('font-family', 'JetBrains Mono')
      .style('font-size', '8px')
      .style('font-weight', 'bold')
      .attr('class', 'pointer-events-none uppercase tracking-tighter');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as FileNode).x!)
        .attr('y1', d => (d.source as FileNode).y!)
        .attr('x2', d => (d.target as FileNode).x!)
        .attr('y2', d => (d.target as FileNode).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, []);

  const getNodeColor = (type: NodeType) => {
    switch(type) {
      case 'ROOT': return '#3b82f6'; // blue
      case 'AGENT': return '#06b6d4'; // cyan
      case 'PROGRAM': return '#10b981'; // emerald
      case 'EXT': return '#f59e0b'; // amber
      case 'API_SPEC': return '#8b5cf6'; // violet
      default: return '#64748b'; // slate
    }
  };

  const runInterrogation = async () => {
    if (!selectedNode) return;
    setIsInterrogating(true);
    setAgentResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Interrogate this project node from the Gemini Watchtower Dashboard source code: ${selectedNode.name} (${selectedNode.type}). Description: ${selectedNode.description}. Provide a forensic code review and its importance to the overall system architecture.`,
        config: { thinkingConfig: { thinkingBudget: 15000 } }
      });
      setAgentResponse(response.text || 'Uplink timeout.');
    } catch (e) { setAgentResponse('Bridge connection fault.'); }
    finally { setIsInterrogating(false); }
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col gap-2 p-2 lg:p-3 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex justify-between items-center shrink-0 px-3 py-1">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600/10 rounded-lg border border-blue-500/20">
            <FolderTree className="text-blue-400" size={18} />
          </div>
          <div>
            <h1 className="text-sm lg:text-lg font-black text-white italic uppercase tracking-tight leading-none">Project_Mindmap</h1>
            <p className="text-[7px] text-slate-500 mono uppercase mt-1">NODE_TOPOLOGY: ACTIVE_FILE_SYSTEM</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-4 bg-slate-900/40 p-1 px-3 rounded-lg border border-slate-800">
             <LegendItem color="#3b82f6" label="ROOT" />
             <LegendItem color="#10b981" label="CORE" />
             <LegendItem color="#06b6d4" label="COMPONENT" />
             <LegendItem color="#f59e0b" label="CONFIG" />
           </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 overflow-hidden">
        
        {/* Force Directed Graph Area */}
        <div ref={containerRef} className="lg:col-span-8 bg-black/40 border border-slate-800/40 rounded-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-4 left-4 z-40">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase mono bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 backdrop-blur-xl">
              <MousePointer2 size={10} className="text-blue-500" /> Interactive_Nav_Active
            </div>
          </div>
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        </div>

        {/* Side Forensic Panel */}
        <div className="lg:col-span-4 flex flex-col gap-2 h-full overflow-hidden">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-md">
            {selectedNode ? (
              <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-400 mono uppercase mb-2 block w-fit italic tracking-widest">{selectedNode.type}</span>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none break-all">{selectedNode.name}</h2>
                  </div>
                  <button onClick={runInterrogation} disabled={isInterrogating} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-30 transition-all">
                    {/* Fix: Added RefreshCw import */}
                    {isInterrogating ? <RefreshCw className="animate-spin" size={18}/> : <Zap size={18} />}
                  </button>
                </div>

                <div className="bg-black/40 rounded-2xl border border-white/5 p-4 mb-6 space-y-3 shrink-0">
                  <div className="flex justify-between text-[9px] mono font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">Descriptor:</span>
                    <span className="text-slate-300 text-right italic">{selectedNode.description || 'Global project asset.'}</span>
                  </div>
                  <div className="flex justify-between text-[9px] mono font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">Protocol_ID:</span>
                    <span className="text-slate-300">{selectedNode.id.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex-1 min-h-0 bg-slate-950/80 rounded-2xl border border-blue-500/10 p-5 flex flex-col overflow-hidden relative group">
                   <div className="absolute top-0 right-0 p-5 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                     <BrainCircuit size={100} className="text-blue-500" />
                   </div>
                   <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mono mb-4 flex items-center gap-2 shrink-0 italic border-b border-blue-500/10 pb-2">
                    <Terminal size={14} /> Neural_Code_Diagnostic
                   </h3>
                   <div className="flex-1 overflow-y-auto scrollbar-style pr-2">
                     {isInterrogating ? (
                       <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
                         {/* Fix: Added RefreshCw import */}
                         <RefreshCw className="animate-spin text-blue-500" size={32} />
                         <span className="text-[10px] font-black mono uppercase tracking-widest animate-pulse">Running Interrogation...</span>
                       </div>
                     ) : agentResponse ? (
                       <div className="mono text-[11px] text-slate-400 font-bold leading-relaxed whitespace-pre-wrap italic">
                         {agentResponse}
                       </div>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4 py-8">
                         <Target size={48} className="text-slate-700" />
                         <p className="text-[10px] font-black mono uppercase tracking-[0.2em] max-w-[150px]">Select any file node to interrogate the logic kernel.</p>
                       </div>
                     )}
                   </div>
                </div>

                <div className="mt-6 flex gap-3 shrink-0">
                   <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase italic border border-slate-700 transition-all shadow-xl">
                      <FileCode size={14} className="inline mr-2" /> SOURCE_VIEW
                   </button>
                   <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase italic transition-all shadow-xl shadow-blue-900/10">
                      <Zap size={14} className="inline mr-2" /> RECONFIG
                   </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                <BrainCircuit size={100} className="text-slate-800 mb-8 animate-pulse" />
                <h3 className="text-lg font-black text-white mono uppercase tracking-[0.4em] mb-4">AWAITING_HANDSHAKE</h3>
                <p className="text-[10px] text-slate-600 mono font-bold uppercase max-w-[200px] tracking-widest leading-relaxed">System map ready. Select a terminal node to begin architectural interrogation.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[8px] font-black text-slate-500 mono uppercase tracking-tighter">{label}</span>
  </div>
);

export default FileInterrogator;
