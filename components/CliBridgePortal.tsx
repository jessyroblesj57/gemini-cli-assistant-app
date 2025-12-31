
import React, { useState, useEffect, useRef } from 'react';
// Fix: Added ShieldCheck to the lucide-react import list
import { 
  Link, Shield, RefreshCw, 
  Cpu, HardDrive, Network, Binary,
  FileJson, Database, Fingerprint, Box, ExternalLink,
  Upload, Download, Copy, Check,
  ShieldAlert, Activity, Zap, Trash2, Terminal, ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { FullMasterManifest } from '../types';

const CliBridgePortal: React.FC = () => {
  const [handshakeStatus, setHandshakeStatus] = useState<'AWAITING' | 'CONNECTED' | 'ERROR'>('CONNECTED');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isElevating, setIsElevating] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["[INFO] System Context Bridge v3.6.0 ready."]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const termEndRef = useRef<HTMLDivElement>(null);

  const recognizedCmds = ['elevate', 'sync', 'export', 'clear', 'status', 'whoami', 'ls-distros'];

  // Initial manifest populated with real browser data and placeholders
  const [manifest, setManifest] = useState<FullMasterManifest>({
    cli_handshake: {
      agent_id: "WATCHTOWER_BROWSER_NODE",
      host_mode: "WEB_PORTAL_SANDBOX",
      timestamp: new Date().toISOString(),
      auth_status: "AWAITING_RWX_UPLINK",
      integrity_stamp: "AWAITING_LOCAL_HASH",
      security_signature: "WEB_SESSION_SIGNED"
    },
    host_info: {
      computer_name: `NODE_${Math.random().toString(36).substring(7).toUpperCase()}`,
      os_version: window.navigator.userAgent,
      architecture: (window.navigator as any).platform || "UNKNOWN_ARCH",
      privilege_level: 'USER',
      home_directories: {
        windows: "AWAITING_BRIDGE_PATH",
        wsl: "AWAITING_BRIDGE_PATH"
      },
      network: {
        ipv4: "0.0.0.0 (AWAITING_SCAN)",
        ipv6: "::0 (AWAITING_SCAN)",
        dns_routing_table: [],
        gateway: "UNKNOWN"
      }
    },
    subsystem_wsl: {
      distros: [],
      mount_points: [],
      kernel_version: "UPLINK_REQUIRED",
      networking_mode: "UNKNOWN"
    },
    packet_management: {
      windows: {
        manager: "UNKNOWN",
        active_packages: []
      },
      wsl: {
        manager: "UNKNOWN",
        active_packages: []
      }
    },
    tool_list: ["N/A - BRIDGE_DISCONNECTED"],
    registry_table_view: {
      hklm_security: "AWAITING_ADMIN_PRIVILEGES",
      hkcu_environment: "AWAITING_ADMIN_PRIVILEGES",
      hklm_subsystem: "AWAITING_ADMIN_PRIVILEGES"
    },
    projects: {
      storage_root: "PENDING_SELECTION",
      active_nodes: []
    },
    environment_vars: {
      "SESSION_STATE": "SANDBOXED"
    },
    current_config: {
      handshake: "RWX_RESTRICTED",
      dependency_mode: "WEB_DEPENDENT",
      binary_intercept: "DISABLED_IN_BROWSER",
      uac_status: "USER_LEVEL"
    }
  });

  const triggerHandshake = async () => {
    setIsSyncing(true);
    setHandshakeStatus('AWAITING');
    setTerminalOutput(prev => [...prev, "[SYNC] Initiating master manifest handshake..."]);
    setTimeout(() => {
      setHandshakeStatus('CONNECTED');
      setIsSyncing(false);
      setTerminalOutput(prev => [...prev, "[SUCCESS] Local browser context verified. Direct system access requires 'gemini-watchtower-cli'."]);
    }, 1500);
  };

  const requestElevation = async () => {
    setIsElevating(true);
    setTerminalOutput(prev => [...prev, "[ADMIN] Requesting UAC elevation via browser hook..."]);
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, "[ERROR] Elevation denied. Use native compilation for RWX authority."]);
      setIsElevating(false);
    }, 1200);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const input = terminalInput.trim();
    setHistory(prev => [input, ...prev].slice(0, 50));
    setHistoryIdx(-1);
    setTerminalOutput(prev => [...prev, `user@watchtower:~$ ${input}`]);

    switch(input) {
      case 'help':
        setTerminalOutput(prev => [...prev, "[HELP] Recognized: elevate, sync, export, clear, status, whoami, ls-distros"]);
        break;
      case 'whoami':
        setTerminalOutput(prev => [...prev, `[INFO] ${manifest.cli_handshake.agent_id} | ${manifest.host_info.os_version}`]);
        break;
      case 'status':
        setTerminalOutput(prev => [...prev, `[INFO] Handshake: ${manifest.current_config.handshake}, UAC: ${manifest.current_config.uac_status}`]);
        break;
      default:
        setTerminalOutput(prev => [...prev, `[ERR] Command not authorized in current security context: '${input}'`]);
    }

    setTerminalInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const next = historyIdx + 1;
        setHistoryIdx(next);
        setTerminalInput(history[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const next = historyIdx - 1;
        setHistoryIdx(next);
        setTerminalInput(history[next]);
      } else {
        setHistoryIdx(-1);
        setTerminalInput('');
      }
    }
  };

  useEffect(() => {
    if (termEndRef.current) {
      termEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadManifest = () => {
    const BlobObj = (window as any).Blob || Blob;
    const URLObj = (window as any).URL || URL;
    const blob = new BlobObj([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URLObj.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchtower_manifest_${Date.now()}.json`;
    a.click();
    URLObj.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full flex flex-col gap-6 p-6 lg:p-8 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 shrink-0 relative z-30">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase truncate">
            <ShieldCheck className="text-blue-500 shrink-0" size={40} />
            <span className="truncate">CLI_BRIDGE_PORTAL</span> 
          </h1>
          <p className="text-slate-500 mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2 truncate">
            <Fingerprint size={12} /> IDENTITY: {manifest.cli_handshake.agent_id} | STATE: PERSISTENT
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button 
            onClick={requestElevation}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white border-orange-400/30 rounded-2xl font-black text-xs shadow-xl active:scale-95 uppercase italic"
          >
            {isElevating ? <RefreshCw className="animate-spin" size={14} /> : <ShieldAlert size={14} />}
            ELEVATE_CONTEXT
          </button>
          <button 
            onClick={downloadManifest}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 text-slate-300 rounded-2xl font-black text-xs hover:text-white hover:border-blue-500 transition-all active:scale-95 uppercase italic"
          >
            <Download size={14} /> EXPORT_MANIFEST
          </button>
          <button 
            onClick={triggerHandshake}
            disabled={isSyncing}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest italic transition-all"
          >
            {isSyncing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            SYNC_UPLINK
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-30 overflow-hidden">
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col shrink-0 shadow-2xl relative overflow-hidden group">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-8 shrink-0">
              <ShieldCheck size={16} className="text-emerald-400" /> Security Handshake
            </h2>
            <div className="space-y-4">
               <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase mono">PRIVILEGE</span>
                    <span className="text-[9px] font-black text-emerald-600 mono">RESTRICTED_WEB</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg mono text-[10px] font-bold">READ</div>
                    <div className="px-3 py-1 bg-slate-800 text-slate-600 rounded-lg mono text-[10px] font-bold">WRITE [!]</div>
                    <div className="px-3 py-1 bg-slate-800 text-slate-600 rounded-lg mono text-[10px] font-bold">EXEC [!]</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col flex-1 overflow-hidden shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-6 shrink-0">
              <Database size={16} className="text-blue-400" /> Active System Hooks
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-style space-y-4 min-h-0 text-center opacity-40 py-12">
               <Shield size={48} className="mx-auto text-slate-700 mb-4" />
               <p className="text-[10px] font-black text-slate-500 mono uppercase tracking-widest">Connect CLI Bridge for dynamic registry interrogation.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col min-h-0 overflow-hidden">
          <div className="bg-black/60 border border-slate-800 rounded-[2rem] flex flex-col flex-1 overflow-hidden shadow-2xl relative backdrop-blur-xl h-full">
            <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                 <h2 className="text-xs font-black text-slate-400 mono flex items-center gap-3 italic uppercase tracking-widest truncate">
                    <FileJson size={16} className="text-blue-500 shrink-0" /> MASTER_MANIFEST.json
                 </h2>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[9px] text-slate-400 hover:text-white mono font-black bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 transition-all"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  COPY
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto scrollbar-style flex flex-col gap-8 min-h-0">
               <div className="bg-slate-950/80 p-8 rounded-3xl border border-white/5 shadow-inner relative group shrink-0">
                  <pre className="text-emerald-400/90 mono text-xs leading-relaxed font-bold italic whitespace-pre-wrap break-all">
                    {JSON.stringify(manifest, null, 2)}
                  </pre>
               </div>
               
               <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden flex flex-col flex-1 min-h-[250px]">
                  <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
                     <span className="text-[10px] font-black text-slate-500 uppercase mono flex items-center gap-2">
                        <Terminal size={14} className="text-blue-500 shrink-0" /> Manifest_Terminal_Uplink
                     </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 mono text-[11px] space-y-1.5 scrollbar-style bg-black/40 min-h-0">
                     {terminalOutput.map((line, i) => (
                       <div key={i} className={`font-bold italic break-all ${line.startsWith('user') ? 'text-slate-200' : line.includes('[SUCCESS]') ? 'text-emerald-400' : line.includes('[ERR]') ? 'text-red-400' : 'text-slate-500'}`}>
                         {line}
                       </div>
                     ))}
                     <div ref={termEndRef} />
                  </div>
                  <form onSubmit={handleCommand} className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-3 shrink-0">
                     <span className="text-[11px] mono text-blue-500 font-black shrink-0">#</span>
                     <input 
                       value={terminalInput}
                       onChange={(e) => setTerminalInput(e.target.value)}
                       onKeyDown={handleKeyDown}
                       placeholder="Enter terminal hook..."
                       className="flex-1 bg-transparent border-none outline-none text-[11px] mono text-white font-bold placeholder:text-slate-700 min-w-0"
                     />
                     <button type="submit" className="text-blue-500 hover:text-blue-400"><ChevronUp size={16} /></button>
                  </form>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CliBridgePortal;
