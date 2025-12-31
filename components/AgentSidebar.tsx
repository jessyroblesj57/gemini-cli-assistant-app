
import React, { useState, useEffect } from 'react';
import { 
  Shield, Cpu, Terminal, Activity, Zap, Network, 
  ChevronRight, RefreshCw, Trash2, Microscope,
  Layout, MonitorCheck, FolderTree, Rocket, Link, 
  ShieldAlert, Key, Lock, Settings, BrainCircuit,
  Camera, FileCode, ToggleLeft, ToggleRight, Coins,
  Radio, Signal
} from 'lucide-react';
import { MCPResource, CLICommand, GeminiSession, ProcessInfo } from '../types';

interface Props {
  activeTab: 'watchtower' | 'intel' | 'wsl' | 'explorer' | 'deploy' | 'bridge' | 'media' | 'intelligence' | 'settings' | 'python';
  onTabChange: (tab: 'watchtower' | 'intel' | 'wsl' | 'explorer' | 'deploy' | 'bridge' | 'media' | 'intelligence' | 'settings' | 'python') => void;
  isCollapsed?: boolean;
}

const AgentSidebar: React.FC<Props> = ({ activeTab, onTabChange, isCollapsed }) => {
  const [latency, setLatency] = useState(42);
  const [session, setSession] = useState<GeminiSession>({
    id: 'SESS_8821_OMEGA',
    lastSync: new Date().toISOString(),
    tokenCount: 14205,
    mode: 'autonomous'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(20 + Math.random() * 60));
      setSession(prev => ({ ...prev, tokenCount: prev.tokenCount + Math.floor(Math.random() * 5) }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="w-full h-full bg-slate-950 flex flex-col overflow-hidden border-r border-slate-800/40">
      <div className={`p-4 border-b border-slate-800/40 bg-slate-900/20 transition-all ${isCollapsed ? 'items-center justify-center' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600/10 rounded-lg text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/10 shrink-0">
            <Shield size={isCollapsed ? 18 : 20} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xs font-black text-white mono uppercase tracking-[0.1em] leading-none whitespace-nowrap">AGENT_OMEGA</h1>
              <p className="text-[8px] text-slate-500 font-black mono mt-1.5 uppercase flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                HANDSHAKE_READY
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-style p-1.5 space-y-4 overflow-x-hidden">
        <section>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-2 px-2 pt-2">
              <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Primary_Nodes</h3>
            </div>
          )}
          <div className="space-y-0.5">
            <NavButton active={activeTab === 'watchtower'} onClick={() => onTabChange('watchtower')} icon={<Cpu size={14} />} label="Watchtower" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'python'} onClick={() => onTabChange('python')} icon={<FileCode size={14} />} label="Python Lab" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'intelligence'} onClick={() => onTabChange('intelligence')} icon={<BrainCircuit size={14} />} label="AI Core" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'intel'} onClick={() => onTabChange('intel')} icon={<Microscope size={14} />} label="Forensics" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'media'} onClick={() => onTabChange('media')} icon={<Camera size={14} />} label="Media Lab" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'bridge'} onClick={() => onTabChange('bridge')} icon={<Link size={14} />} label="CLI Bridge" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'wsl'} onClick={() => onTabChange('wsl')} icon={<MonitorCheck size={14} />} label="WSL Suite" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'explorer'} onClick={() => onTabChange('explorer')} icon={<FolderTree size={14} />} label="Navigator" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'deploy'} onClick={() => onTabChange('deploy')} icon={<Rocket size={14} />} label="Deploy" collapsed={isCollapsed} />
            <NavButton active={activeTab === 'settings'} onClick={() => onTabChange('settings')} icon={<Settings size={14} />} label="System Config" collapsed={isCollapsed} />
          </div>
        </section>

        {!isCollapsed && (
          <section className="bg-slate-900/20 border border-slate-800/40 rounded-xl p-3 mx-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[8px] font-black text-slate-600 uppercase mono">Telemetry</h3>
              <Activity size={10} className="text-blue-500" />
            </div>
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-slate-500 mono">UPLINK_LATENCY</span>
                  <span className="text-[8px] font-black text-blue-400 mono">{latency}ms</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-slate-500 mono">TOKEN_BURN</span>
                  <span className="text-[8px] font-black text-emerald-400 mono">{session.tokenCount}</span>
               </div>
            </div>
          </section>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-3 bg-slate-900/40 border-t border-slate-800/40 space-y-2 shrink-0">
          <div className="flex items-center justify-between mb-1 px-1">
             <span className="text-[7px] font-black text-slate-600 uppercase mono italic">Signal_Strength</span>
             <Signal size={10} className={latency < 40 ? "text-emerald-500" : "text-yellow-500"} />
          </div>
          <div className="flex gap-0.5 h-1.5">
             {Array.from({length: 8}).map((_, i) => (
               <div key={i} className={`flex-1 rounded-sm ${i < (8 - Math.floor(latency / 15)) ? 'bg-blue-500/60' : 'bg-slate-800'}`} />
             ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, collapsed?: boolean }> = ({ active, onClick, icon, label, collapsed }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-2 px-3 rounded-lg transition-all border group ${active ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'} ${collapsed ? 'justify-center px-2' : ''}`}>
    <div className={`${active ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>{icon}</div>
    {!collapsed && (
      <p className="text-[10px] font-black truncate mono uppercase leading-none">{label}</p>
    )}
  </button>
);

export default AgentSidebar;