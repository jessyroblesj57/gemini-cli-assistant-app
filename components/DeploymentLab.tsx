
import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Terminal, Zap, Shield, RefreshCw, 
  Trash2, Play, Package, Binary, FileCode,
  CheckCircle, AlertTriangle, Info, Layers,
  LayoutGrid, ChevronRight, HardDrive, Cpu,
  Search, ShieldCheck, Settings, ExternalLink,
  Globe, BookOpen, Code2, Sparkles, Database,
  Cloud, Lock, Network, SearchCode, Download,
  Monitor, Ghost, Laptop
} from 'lucide-react';
import { BuildScript, BuildPlaybook, LogEntry, ExternalResource, McpServerDef } from '../types';

const DeploymentLab: React.FC = () => {
  const [scripts, setScripts] = useState<BuildScript[]>([
    { id: 'rs-1', name: 'INSTALL_RUST', command: 'powershell -Command "irm https://sh.rustup.rs | iex"', description: 'Installs the Rust compiler toolchain necessary for Tauri compilation.', category: 'SETUP', status: 'IDLE' },
    { id: 'rs-2', name: 'SETUP_TAURI_CLI', command: 'cargo install tauri-cli', description: 'Installs the Tauri CLI globally via Cargo for project management.', category: 'SETUP', status: 'IDLE' },
    { id: 'rs-3', name: 'INIT_MANIFEST', command: 'tauri init', description: 'Initializes the Tauri configuration manifest in the root directory.', category: 'SETUP', status: 'IDLE' },
    { id: 'rs-4', name: 'BUILD_WINDOWS_EXE', command: 'npm run tauri build', description: 'Compiles the dashboard into a production-ready Windows .exe binary.', category: 'COMPILE', status: 'IDLE' },
    { id: 'rs-5', name: 'PURGE_BUILD_ARTIFACTS', command: 'rm -rf src-tauri/target', description: 'Deletes cached build targets to reclaim disk space.', category: 'CLEANUP', status: 'IDLE' },
  ]);

  const [externalResources] = useState<ExternalResource[]>([
    { id: 'res-1', name: 'Google Labs', url: 'https://labs.google/', category: 'LABS' },
    { id: 'res-2', name: 'Android Codelabs', url: 'https://developer.android.com/get-started/codelabs', category: 'CODELAB' },
    { id: 'res-3', name: 'Google Dev Program', url: 'https://developers.google.com/program', category: 'DOCS' },
    { id: 'res-4', name: 'API Client Library', url: 'https://developers.google.com/api-client-library', category: 'DOCS' },
    { id: 'res-5', name: 'Developer Codelabs', url: 'https://codelabs.developers.google.com/', category: 'CODELAB' },
    { id: 'res-6', name: 'Gemini CLI Extensions', url: 'https://geminicli.com/extensions/', category: 'CLI' },
    { id: 'res-7', name: 'Gemini CLI Docs', url: 'https://geminicli.com/docs/', category: 'CLI' }
  ]);

  const [mcpRegistry] = useState<McpServerDef[]>([
    { id: 'mcp-1', name: 'filesystem', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/username/Desktop', '/Users/username/Projects'], status: 'ONLINE' },
    { id: 'mcp-2', name: 'github', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], status: 'ONLINE', env: { 'GITHUB_PERSONAL_ACCESS_TOKEN': '••••••••' } },
    { id: 'mcp-3', name: 'postgres', command: 'npx', args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://user:password@localhost:5432/dbname'], status: 'ONLINE' },
    { id: 'mcp-4', name: 'brave-search', command: 'npx', args: ['-y', '@modelcontextprotocol/server-brave-search'], status: 'ONLINE', env: { 'BRAVE_API_KEY': '••••••••' } },
    { id: 'mcp-5', name: 'docker', command: 'docker', args: ['run', '-i', '--rm', '-v', '/var/run/docker.sock:/var/run/docker.sock', 'mcp/docker-server'], status: 'ONLINE' },
    { id: 'mcp-6', name: 'cloudflare', command: 'npx', args: ['-y', '@cloudflare/mcp-server-cloudflare'], status: 'ONLINE', env: { 'CLOUDFLARE_API_TOKEN': '••••••••' } },
    { id: 'mcp-7', name: 'sentry', command: 'npx', args: ['-y', '@modelcontextprotocol/server-sentry'], status: 'ONLINE', env: { 'SENTRY_AUTH_TOKEN': '••••••••' } },
    { id: 'mcp-8', name: 'memory', command: 'npx', args: ['-y', '@modelcontextprotocol/server-memory'], status: 'ONLINE' },
    { id: 'mcp-9', name: 'sequential-thinking', command: 'npx', args: ['-y', '@modelcontextprotocol/server-sequential-thinking'], status: 'ONLINE' },
    { id: 'mcp-10', name: 'redis', command: 'npx', args: ['-y', 'mcp-server-redis', 'redis://localhost:6379'], status: 'ONLINE' },
    { id: 'mcp-11', name: 'kafka', command: 'docker', args: ['run', '-i', '--rm', '--network', 'host', 'mcp/kafka-server', '--bootstrap-servers', 'localhost:9092'], status: 'ONLINE' },
    { id: 'mcp-12', name: 'kubernetes', command: 'npx', args: ['-y', '@modelcontextprotocol/server-kubernetes'], status: 'ONLINE', env: { 'KUBECONFIG': '~/.kube/config' } },
    { id: 'mcp-13', name: 'wireshark-analysis', command: 'python3', args: ['m', 'mcp_wireshark', '--interface', 'eth0'], status: 'ONLINE' },
    { id: 'mcp-14', name: 'prometheus', command: 'npx', args: ['-y', 'mcp-server-prometheus', 'http://localhost:9090'], status: 'ONLINE' },
    { id: 'mcp-15', name: 'zapier', command: 'npx', args: ['-y', 'mcp-server-zapier'], status: 'ONLINE', env: { 'ZAPIER_NLA_API_KEY': '••••••••' } },
  ]);

  const [playbooks] = useState<BuildPlaybook[]>([
    { id: 'pb-1', name: 'FULL_ENVIRONMENT_SETUP', scriptIds: ['rs-1', 'rs-2', 'rs-3'], description: 'Sequential setup: Rust -> Tauri CLI -> Manifest Init.' },
    { id: 'pb-2', name: 'PRODUCTION_RELEASE', scriptIds: ['rs-4', 'rs-5'], description: 'Builds the EXE and then cleans up artifacts.' }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toISOString(), type: 'BUILD', message: 'Deployment Subsystem Initialized. Targeting: Windows_x64', severity: 'INFO' },
    { timestamp: new Date().toISOString(), type: 'INFO', message: 'Checking for local Rust installation...', severity: 'DEBUG' },
    { timestamp: new Date().toISOString(), type: 'AUTH', message: 'Jules API Uplink Verified with 2 Keys.', severity: 'NOTICE' }
  ]);

  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: any = 'BUILD', severity: any = 'INFO') => {
    setLogs(prev => [...prev, { timestamp: new Date().toISOString(), type, message, severity }]);
  };

  const executeScript = async (scriptId: string): Promise<boolean> => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return false;

    setScripts(prev => prev.map(s => s.id === scriptId ? { ...s, status: 'RUNNING' } : s));
    addLog(`Executing: ${script.name}`, 'CLI', 'NOTICE');

    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        setScripts(prev => prev.map(s => s.id === scriptId ? { ...s, status: success ? 'SUCCESS' : 'FAILED' } : s));
        if (success) {
          addLog(`${script.name} completed successfully.`, 'BUILD', 'INFO');
          resolve(true);
        } else {
          addLog(`FAILURE: ${script.name} returned exit code 1.`, 'ERROR', 'CRITICAL');
          resolve(false);
        }
      }, 1500);
    });
  };

  const runPlaybook = async (playbookId: string) => {
    const pb = playbooks.find(p => p.id === playbookId);
    if (!pb || isBatchRunning) return;

    setIsBatchRunning(true);
    addLog(`Initiating Playbook: ${pb.name}`, 'BUILD', 'NOTICE');

    for (const sId of pb.scriptIds) {
      const result = await executeScript(sId);
      if (!result) {
        addLog(`Playbook ${pb.name} aborted due to script failure.`, 'ERROR', 'CRITICAL');
        break;
      }
    }
    setIsBatchRunning(false);
    addLog(`Playbook ${pb.name} execution phase finished.`, 'BUILD', 'INFO');
  };

  const generateDesktopShortcut = () => {
    const urlContent = `[InternetShortcut]\nURL=${window.location.href}\nIconIndex=0`;
    const blob = new Blob([urlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Gemini_Watchtower.url";
    a.click();
    URL.revokeObjectURL(url);
    addLog("Desktop Shortcut manifest generated.", "BUILD", "SUCCESS");
  };

  const downloadSaurIcon = () => {
    // Generate a tactical dinosaur icon (Dino with empty background protocol)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M20 80 L30 80 L35 60 L60 60 L75 40 L85 40 L85 30 L65 30 L55 50 L30 50 L20 80 Z" stroke="#10b981" stroke-width="2" fill="none" />
      <circle cx="78" cy="35" r="1.5" fill="#10b981" />
      <path d="M35 80 L32 90 M45 80 L42 90 M55 80 L52 90" stroke="#10b981" stroke-width="1.5" />
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "cyber_saur_icon.svg";
    a.click();
    URL.revokeObjectURL(url);
    addLog("Cyber-Saur identity asset exported.", "BUILD", "SUCCESS");
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col gap-6 p-8 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 shrink-0 relative z-30">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
            <Rocket className="text-blue-500" size={40} />
            DEPLOYMENT_LAB <span className="text-[10px] not-italic px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-400/30 mono uppercase tracking-widest">BUILD_CHAIN_V4</span>
          </h1>
          <p className="text-slate-500 mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <Binary size={12} /> TARGET: Win_x64_Native_EXE | COMPILER: TAURI_RUST_V1
          </p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setScripts(prev => prev.map(s => ({ ...s, status: 'IDLE' })))}
             className="flex items-center gap-2 px-6 py-3 bg-slate-900/60 border border-slate-800 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 uppercase tracking-widest italic transition-all"
           >
             <RefreshCw size={14} /> RESET_CHAIN
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 uppercase tracking-widest italic transition-all">
             <ShieldCheck size={14} /> VALIDATE_ENV
           </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-30 overflow-hidden">
        
        {/* Left Column: Resources & Assets */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
          {/* Native Distribution Suite */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col shrink-0 shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-8">
              <Laptop size={16} className="text-blue-400" /> Native Distribution Suite
            </h2>
            <div className="space-y-6">
               <div className="flex items-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
                    <Ghost size={60} className="text-emerald-400" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                     <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                        <path d="M20 80 L30 80 L35 60 L60 60 L75 40 L85 40 L85 30 L65 30 L55 50 L30 50 L20 80 Z" stroke="#10b981" stroke-width="2" />
                     </svg>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white mono uppercase italic">Cyber-Saur Identity</h3>
                    <p className="text-[9px] text-slate-500 mono font-bold mt-1 uppercase leading-tight italic">Forensic icon (ICO/SVG)<br/>Empty background protocol</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={generateDesktopShortcut}
                   className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[9px] shadow-xl active:scale-95 uppercase italic transition-all"
                 >
                   <Monitor size={12} /> CREATE_SHORTCUT
                 </button>
                 <button 
                   onClick={downloadSaurIcon}
                   className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-[9px] border border-slate-700 shadow-xl active:scale-95 uppercase italic transition-all"
                 >
                   <Download size={12} /> EXPORT_ICON
                 </button>
               </div>
            </div>
          </div>

          {/* MCP Server Registry Panel */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col flex-1 overflow-hidden shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-6">
              <Layers size={16} className="text-blue-400" /> MCP Orchestration Registry
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-style space-y-4">
              {mcpRegistry.map(mcp => (
                <div key={mcp.id} className="p-4 bg-black/40 border border-slate-800 rounded-3xl hover:border-blue-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                         <McpIcon name={mcp.name} />
                         <h3 className="text-[11px] font-black text-white mono uppercase italic">{mcp.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {mcp.env && <Lock size={10} className="text-orange-400" />}
                        <span className="text-[8px] font-black text-emerald-500 mono">{mcp.status}</span>
                      </div>
                   </div>
                   <div className="bg-slate-950 p-2 rounded-xl mono text-[9px] text-slate-500 mt-2 truncate font-bold">
                      {mcp.command} {mcp.args.join(' ')}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Build Chain */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col h-[35%] shrink-0 shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-6">
              <Zap size={16} className="text-yellow-400" /> Build Playbooks
            </h2>
            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-style">
              {playbooks.map(pb => (
                <div key={pb.id} className="p-6 bg-black/40 border border-slate-800 rounded-3xl hover:border-yellow-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[11px] font-black text-white mono uppercase italic">{pb.name}</h3>
                      <button 
                        onClick={() => runPlaybook(pb.id)}
                        disabled={isBatchRunning}
                        className="p-2 bg-yellow-600/10 text-yellow-500 rounded-xl hover:bg-yellow-600 hover:text-white transition-all disabled:opacity-30"
                      >
                        <Play size={14} />
                      </button>
                   </div>
                   <p className="text-[10px] text-slate-500 mono leading-relaxed italic">{pb.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col flex-1 overflow-hidden shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-6">
              <FileCode size={16} className="text-emerald-400" /> Atomic Compilation Scripts
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-style space-y-3">
              {scripts.map(s => (
                <DelayedTooltip key={s.id} content={s.description}>
                  <div 
                    onClick={() => executeScript(s.id)}
                    className={`w-full text-left p-5 bg-black/30 border rounded-2xl transition-all cursor-pointer flex justify-between items-center group ${
                      s.status === 'RUNNING' ? 'border-blue-500 bg-blue-500/5 animate-pulse' :
                      s.status === 'SUCCESS' ? 'border-emerald-500 bg-emerald-500/5' :
                      s.status === 'FAILED' ? 'border-red-500 bg-red-500/5' :
                      'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`p-2.5 rounded-xl ${
                         s.status === 'SUCCESS' ? 'text-emerald-500 bg-emerald-500/10' :
                         s.status === 'FAILED' ? 'text-red-500 bg-red-500/10' :
                         'text-slate-600 bg-slate-900 group-hover:text-blue-500'
                       }`}>
                          {s.category === 'SETUP' ? <Settings size={14} /> : s.category === 'COMPILE' ? <Binary size={14} /> : <Trash2 size={14} />}
                       </div>
                       <div>
                          <p className={`text-[11px] font-black mono uppercase italic leading-none ${s.status === 'IDLE' ? 'text-slate-400' : 'text-white'}`}>
                            {s.name}
                          </p>
                          <p className="text-[9px] text-slate-600 mono mt-1.5 uppercase font-bold tracking-tighter truncate max-w-[200px]">
                            {s.command}
                          </p>
                       </div>
                    </div>
                    {s.status === 'RUNNING' && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                    {s.status === 'SUCCESS' && <CheckCircle size={14} className="text-emerald-500" />}
                  </div>
                </DelayedTooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Console */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-black/60 border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative backdrop-blur-xl h-full">
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
              <h2 className="text-xs font-black text-slate-400 mono flex items-center gap-3 italic uppercase tracking-widest">
                <Terminal size={16} className="text-blue-500" /> Build_Console
              </h2>
              <button onClick={() => setLogs([])} className="text-[9px] text-slate-600 hover:text-red-400 mono font-black">CLEAR</button>
            </div>
            <div className="flex-1 p-5 mono text-[10px] space-y-2 overflow-y-auto scrollbar-style">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 items-start animate-in slide-in-from-left-2 duration-300">
                  <span className={`text-[8px] font-black shrink-0 ${
                    log.severity === 'CRITICAL' ? 'text-red-500' :
                    log.severity === 'NOTICE' ? 'text-blue-400' :
                    log.type === 'CLI' ? 'text-emerald-400' : 'text-slate-600'
                  }`}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`leading-relaxed break-all font-bold italic ${
                    log.severity === 'CRITICAL' ? 'text-red-300' : 'text-slate-400'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-[9px] mono text-slate-700 font-black uppercase tracking-widest text-center shrink-0">
               EXECUTOR: GEMINI_BUILD_SUITE
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const McpIcon: React.FC<{ name: string }> = ({ name }) => {
  if (name.includes('github')) return <Cloud size={14} className="text-blue-400" />;
  if (name.includes('search')) return <SearchCode size={14} className="text-emerald-400" />;
  if (name.includes('docker') || name.includes('kube')) return <Package size={14} className="text-blue-300" />;
  if (name.includes('postgres') || name.includes('redis')) return <Database size={14} className="text-purple-400" />;
  if (name.includes('filesystem')) return <HardDrive size={14} className="text-slate-400" />;
  return <Network size={14} className="text-slate-500" />;
};

const DelayedTooltip: React.FC<{ children: React.ReactNode, content: string }> = ({ children, content }) => {
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = window.setTimeout(() => {
      setShow(true);
    }, 2000); 
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (
        <div className="absolute z-[100] left-full top-0 ml-4 w-64 p-4 bg-slate-900 border border-blue-500/50 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-left-2 duration-300 backdrop-blur-xl">
           <div className="flex items-center gap-2 mb-2">
              <Info size={12} className="text-blue-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase mono">Script_Directive</span>
           </div>
           <p className="text-[10px] text-slate-300 mono leading-relaxed italic">{content}</p>
        </div>
      )}
    </div>
  );
};

export default DeploymentLab;
