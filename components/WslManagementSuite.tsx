
import React, { useState, useEffect } from 'react';
import { 
  Monitor, Layout, Server, HardDrive, ShieldAlert, 
  Terminal, RefreshCw, Power, Wifi, FileCode, 
  Binary, Command, Activity, Cpu, Database, 
  Zap, Layers, ExternalLink, Bug, AlertCircle,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { WslInstance, SystemError } from '../types';

const WslManagementSuite: React.FC = () => {
  const [instances, setInstances] = useState<WslInstance[]>([
    { id: '1', distro: 'Ubuntu-22.04', status: 'Running', ip: '172.24.112.5', version: 2, uptime: '4h 12m' },
    { id: '2', distro: 'Debian', status: 'Stopped', ip: 'N/A', version: 2, uptime: '0s' },
    { id: '3', distro: 'Kali-Linux', status: 'Suspended', ip: '172.24.115.12', version: 2, uptime: '12m' }
  ]);

  const [errors, setErrors] = useState<SystemError[]>([
    { id: 'err-1', code: '0x80041002', subsystem: 'BRIDGE', message: 'Wsl/v2/Bridge session dropped. Concurrency exceeded.', severity: 'HIGH', resolved: false, timestamp: new Date().toISOString() },
    { id: 'err-2', code: 'E_FAIL', subsystem: 'WIN_FS', message: 'Permission denied on /mnt/c/Users/Jessy/AppData.', severity: 'MED', resolved: true, timestamp: new Date(Date.now() - 3600000).toISOString() }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeDistro, setActiveDistro] = useState<WslInstance | null>(instances[0]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const analyzeErrors = async () => {
    setIsAnalyzing(true);
    try {
      // Always initialize GoogleGenAI inside the call handler to use the latest API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze these WSL/Windows subsystem errors for a Gemini CLI environment:
        ${JSON.stringify(errors)}
        
        Provide a forensic diagnostic report and specific CLI commands to fix the bridge issues.`,
        config: { thinkingConfig: { thinkingBudget: 15000 } }
      });
      setAiReport(response.text || 'Analysis failed to return result.');
    } catch (e) {
      console.error(e);
      setAiReport('Error interrogating Gemini intelligence.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col gap-6 p-8 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 shrink-0 relative z-30">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
            <Monitor className="text-emerald-500" size={40} />
            WSL_HYBRID_SUITE <span className="text-[10px] not-italic px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-400/30 mono uppercase tracking-widest">WINDOWS_INTEGRATION_V4</span>
          </h1>
          <p className="text-slate-500 mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <Binary size={12} /> BRIDGE_STATUS: OPTIMIZED | SUB-SYSTEM: WSL2_KVM
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSync} className="flex items-center gap-2 px-6 py-3 bg-slate-900/60 border border-slate-800 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 uppercase tracking-widest italic transition-all">
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            SYNC_MOUNTS
          </button>
          <button onClick={analyzeErrors} disabled={isAnalyzing} className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest italic transition-all">
            {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Bug size={14} />}
            DIAGNOSE_BRIDGE
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-30 overflow-hidden">
        
        {/* Distro List */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 backdrop-blur-sm flex flex-col flex-1 overflow-hidden shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-6">
              <Server size={16} className="text-emerald-400" /> Detected Distros
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-style space-y-3">
              {instances.map(inst => (
                <button 
                  key={inst.id}
                  onClick={() => setActiveDistro(inst)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex flex-col gap-2 relative overflow-hidden group ${activeDistro?.id === inst.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-black/20 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[12px] font-black text-slate-100 mono uppercase">{inst.distro}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border mono ${
                      inst.status === 'Running' ? 'text-emerald-500 border-emerald-500/30' : 
                      inst.status === 'Stopped' ? 'text-slate-600 border-slate-800' : 
                      'text-orange-500 border-orange-500/30'
                    }`}>{inst.status}</span>
                  </div>
                  <div className="flex gap-4 relative z-10">
                    <span className="text-[9px] text-slate-500 mono font-bold italic uppercase tracking-tighter">IP: {inst.ip}</span>
                    <span className="text-[9px] text-slate-500 mono font-bold italic uppercase tracking-tighter">WSL{inst.version}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800/60">
               <h3 className="text-[10px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2 mono">
                 <HardDrive size={14} className="text-blue-400" /> Windows Mount Points
               </h3>
               <div className="space-y-2">
                 <MountPoint label="/mnt/c" target="C:\" status="MOUNTED" />
                 <MountPoint label="/mnt/d" target="D:\" status="IDLE" />
               </div>
            </div>
          </div>
        </div>

        {/* Console / Diagnostics View */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          
          <div className="flex-1 bg-black/60 border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative backdrop-blur-xl min-h-0">
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
              <h2 className="text-xs font-black text-slate-400 mono flex items-center gap-3 italic uppercase tracking-widest">
                <Terminal size={16} className="text-emerald-500" /> Subsystem_Forensics
              </h2>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto scrollbar-style flex flex-col gap-6">
              {/* Error Feed */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono italic mb-2">Bridge Error Stack</h3>
                {errors.map(err => (
                  <div key={err.id} className={`p-4 rounded-2xl border flex gap-4 transition-all ${err.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/30' : 'bg-orange-500/5 border-orange-500/30'}`}>
                    <div className={`p-2 rounded-xl h-fit ${err.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      <AlertCircle size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-black mono text-slate-200 uppercase">{err.code} // {err.subsystem}</span>
                        <span className="text-[9px] text-slate-500 mono">{new Date(err.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mono font-bold leading-relaxed">{err.message}</p>
                      <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-[8px] font-black text-white rounded-md uppercase italic transition-all">IGNORE</button>
                        <button className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-[8px] font-black text-emerald-400 hover:text-white border border-emerald-500/30 rounded-md uppercase italic transition-all">TRY_AUTO_REPAIR</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Diagnostic Output */}
              {aiReport && (
                <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[0_15px_40px_-15px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={20} className="text-emerald-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mono">Gemini Bridge Recovery Intelligence</h4>
                  </div>
                  <div className="prose prose-invert prose-xs max-w-none mono text-emerald-100 font-bold leading-relaxed whitespace-pre-wrap">
                    {aiReport}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-[9px] mono text-slate-600 font-black uppercase tracking-widest text-center shrink-0">
               CLI_BRIDGE_ACTIVE // PROTOCOL: WSLv2_OVER_WIN32
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
             <MetricBox label="BRIDGE LATENCY" value="1.2ms" icon={<Zap size={14} className="text-yellow-400" />} />
             <MetricBox label="CROSS-IO THRUPUT" value="1.8 GB/s" icon={<Activity size={14} className="text-blue-400" />} />
             <MetricBox label="FS CACHE HIT" value="99.2%" icon={<Layers size={14} className="text-emerald-400" />} />
          </div>
        </div>

      </div>
    </div>
  );
};

const MountPoint: React.FC<{ label: string; target: string; status: string }> = ({ label, target, status }) => (
  <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all group">
    <div className="flex items-center gap-3">
       <ExternalLink size={12} className="text-slate-600 group-hover:text-emerald-500" />
       <div>
         <p className="text-[10px] font-black text-slate-300 mono uppercase">{label}</p>
         <p className="text-[8px] text-slate-500 mono font-bold uppercase tracking-tighter">{target}</p>
       </div>
    </div>
    <span className={`text-[8px] font-black mono px-1.5 py-0.5 rounded ${status === 'MOUNTED' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-600 bg-slate-800'}`}>{status}</span>
  </div>
);

const MetricBox: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] hover:bg-slate-900/80 transition-all group shadow-xl backdrop-blur-md">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-slate-800/80 rounded-xl group-hover:scale-110 transition-all border border-slate-700/50">{icon}</div>
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono italic">{label}</span>
    </div>
    <div className="text-xl font-black text-white mono uppercase italic group-hover:text-emerald-400 transition-colors">{value}</div>
  </div>
);

export default WslManagementSuite;
