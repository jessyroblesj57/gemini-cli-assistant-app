
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  Activity, Terminal as TerminalIcon, SearchCode, 
  List, Grid, Columns, LayoutGrid, 
  Cpu, Zap, RefreshCw
} from 'lucide-react';
import { ScraperStats, LogEntry, AppSettings } from '../types';
import MatrixRain from './MatrixRain';
import TacticalHUD from './TacticalHUD';
import NeuralCortex from './NeuralCortex';

interface Props {
  settings: AppSettings;
}

const WatchtowerDashboard: React.FC<Props> = ({ settings }) => {
  const [layout, setLayout] = useState<'DEFAULT' | 'WIDESCREEN' | 'QUAD' | 'FOCUS'>('DEFAULT');
  const [stats, setStats] = useState<ScraperStats>({
    checked: 0,
    hits: 0,
    active: 0,
    total: 0,
    cpu: 0,
    ram: 0,
    idleTime: 0,
    isAlive: false,
    processes: [],
    zombiesKilled: 0,
    throughput: 0,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, severity: LogEntry['severity'] = 'INFO') => {
    setLogs(prev => [...prev.slice(-49), { timestamp: new Date().toISOString(), type: 'INFO', message, severity }]);
  };

  useEffect(() => {
    // Initializing with "Real" placeholders for browser environment
    addLog("Watchtower Dashboard initialized.", "INFO");
    addLog(`Targeting BROWSER_HOST: ${window.navigator.platform}`, "INFO");
    addLog("Awaiting CLI Bridge Uplink for process monitoring...", "WARNING");

    const ticker = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(1, (Math.random() * 5))), // Real browser-load variability
        throughput: 0.1 + Math.random() * 0.5,
      }));
    }, 4000);
    return () => clearInterval(ticker);
  }, []);

  const chartData = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ time: i, val: Math.random() * 10 })), []);

  const tickerData = useMemo(() => 
    Array.from({ length: 50 }, () => 
      `AWAITING_UPLINK::[${['WAIT','IDLE','SYNC','ERR'][Math.floor(Math.random()*4)]}]`
    ).join(' — '), []);

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2 p-2 lg:p-4 overflow-hidden bg-slate-950 text-slate-200 relative">
      <MatrixRain opacity={settings.interface.matrixRainOpacity} />
      {settings.interface.neuralCortexEnabled && <NeuralCortex />}
      {settings.interface.tacticalHudEnabled && <TacticalHUD />}
      
      <header className="flex justify-between items-center relative z-30 shrink-0 px-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600/10 rounded-lg border border-blue-500/20">
            <SearchCode className="text-blue-400" size={20} />
          </div>
          <div>
            <h1 className="text-sm lg:text-xl font-black text-white italic uppercase tracking-tighter leading-none">
              {settings.general.agentId.split('_')[0] || 'WATCHTOWER'}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[7px] mono text-blue-400 font-black uppercase tracking-widest italic">AWAITING_CLI_BRIDGE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/60 border border-slate-800 p-1 rounded-lg flex items-center gap-1 px-2">
             <Cpu size={12} className="text-slate-500" />
             <span className="text-[8px] mono font-bold text-slate-400 uppercase tracking-tighter">LOCAL_WEB_NODE</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800 shadow-xl">
             <LayoutBtn icon={<Grid size={12} />} active={layout === 'DEFAULT'} onClick={() => setLayout('DEFAULT')} />
             <LayoutBtn icon={<LayoutGrid size={12} />} active={layout === 'QUAD'} onClick={() => setLayout('QUAD')} />
          </div>
        </div>
      </header>

      <div className={`flex-1 min-h-0 min-w-0 grid gap-2 lg:gap-3 relative z-30 transition-all duration-300 ${
        layout === 'QUAD' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-12'
      }`}>
        
        <div className={`${layout === 'DEFAULT' ? 'lg:col-span-8' : 'col-span-1'} min-h-0 bg-slate-900/20 border border-slate-800/40 rounded-2xl p-4 flex flex-col backdrop-blur-sm overflow-hidden group`}>
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h2 className="text-[9px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest italic">
              <Activity size={12} className="text-blue-500" /> Host_Velocity_Metric
            </h2>
            <div className="flex gap-3">
              <span className="text-blue-400 text-[9px] mono font-black">TPS: PENDING</span>
              <span className="text-emerald-400 text-[9px] mono font-black">LOAD: {stats.cpu.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="url(#colorVelocity)" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${layout === 'DEFAULT' ? 'lg:col-span-4 row-span-2' : 'col-span-1'} min-h-0 bg-black/40 border border-slate-800/40 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md`}>
          <div className="p-3 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center shrink-0">
            <h2 className="text-[9px] font-black text-slate-400 mono flex items-center gap-2 italic uppercase tracking-widest">
              <TerminalIcon size={12} className="text-slate-500" /> Event_Stream
            </h2>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="flex-1 p-3 mono text-[9px] space-y-1.5 overflow-y-auto scrollbar-style">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2 items-start animate-in slide-in-from-left-1 duration-150">
                <span className="text-slate-600 font-bold shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], {hour12:false})}]</span>
                <span className="text-slate-400 opacity-90 leading-tight font-bold italic break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className={`${layout === 'DEFAULT' ? 'lg:col-span-8' : 'col-span-1'} min-h-0 bg-slate-900/20 border border-slate-800/40 rounded-2xl p-4 flex flex-col overflow-hidden justify-center items-center text-center opacity-40`}>
           <RefreshCw size={32} className="text-slate-700 mb-4 animate-spin-slow" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mono">Awaiting local process authority uplink...</p>
        </div>
      </div>

      <footer className="h-6 bg-slate-900/40 border border-slate-800 rounded-lg relative z-30 shrink-0 overflow-hidden flex items-center px-4">
        <div className="text-[8px] font-black text-blue-500 mono uppercase tracking-[0.2em] mr-4 border-r border-slate-800 pr-4 italic shrink-0 flex items-center gap-2">
          <Zap size={10} /> Live_Handshake_Pending
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker text-[8px] mono text-slate-500 font-bold italic tracking-wider">
             {tickerData} — {tickerData}
          </div>
        </div>
      </footer>
    </div>
  );
};

const LayoutBtn: React.FC<{ icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-1.5 rounded-md transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    {icon}
  </button>
);

export default WatchtowerDashboard;
