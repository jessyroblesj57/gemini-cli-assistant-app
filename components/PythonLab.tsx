
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, Terminal as TerminalIcon, Play, Save, Trash2, 
  RefreshCw, Cpu, Activity, ShieldCheck, 
  Binary, Sparkles, Package, ChevronUp
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppSettings, PythonRuntime } from '../types';

interface Props {
  settings: AppSettings;
}

const PythonLab: React.FC<Props> = ({ settings }) => {
  const [runtime, setRuntime] = useState<PythonRuntime>({
    version: '3.11.4', venv_path: 'forensics', is_venv_active: true,
    packages: { 'psutil': '5.9.5', 'cryptography': '41.0.1', 'requests': '2.31.0' }
  });

  const [activeCode, setActiveCode] = useState<string>(`import psutil\nimport os\n\ndef scan_zombies():\n    print("[INFO] Interrogating...")\n    # Forensic scan logic\n\nif __name__ == "__main__":\n    scan_zombies()`);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalOutput]);

  const runScript = () => {
    setIsRunning(true);
    setTerminalOutput(prev => [...prev, `> python forensic_probe.py`]);
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, `[SUCCESS] 142 processes scanned. No zombies.`, `[INFO] Completed in 14ms.`]);
      setIsRunning(false);
    }, 1000);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    setTerminalOutput(prev => [...prev, `guest@omega:~$ ${terminalInput}`]);
    if (terminalInput === 'clear') setTerminalOutput([]);
    setTerminalInput('');
  };

  const highlightCode = (code: string) => {
    return code
      .replace(/\b(import|from|def|if|while|for|return|print|class|try|except|as|with|in)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/'(.*?)'/g, '<span class="text-yellow-400">\'$1\'</span>');
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2 p-2 lg:p-3 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex justify-between items-center shrink-0 px-2">
        <div className="flex items-center gap-2">
          <FileCode className="text-yellow-500" size={20} />
          <h1 className="text-sm lg:text-lg font-black text-white italic uppercase tracking-tight leading-none truncate max-w-[200px]">Python_Forensics</h1>
          <span className="text-[7px] bg-yellow-500/10 text-yellow-400 px-1 py-0.5 rounded border border-yellow-400/20 uppercase mono">v3.11</span>
        </div>
        <div className="flex gap-2 bg-slate-900/40 border border-slate-800 p-1 rounded-xl max-w-md w-full shadow-lg">
          <input placeholder="AI prompt..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="flex-1 bg-transparent outline-none px-2 text-[10px] text-white mono" onKeyDown={(e) => e.key === 'Enter' && runScript()} />
          <button onClick={runScript} disabled={isGenerating} className="p-1.5 px-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-[9px] font-black uppercase italic transition-all shrink-0">GENERATE</button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 overflow-hidden">
        <div className="lg:col-span-8 flex flex-col min-h-0 overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-3 flex flex-col flex-1 overflow-hidden relative backdrop-blur-md">
            <div className="flex justify-between items-center mb-2 shrink-0">
               <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mono">forensic_probe.py</h2>
               <div className="flex gap-1.5">
                  <button onClick={runScript} disabled={isRunning} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-black text-[9px] transition-all uppercase">
                    {isRunning ? <RefreshCw size={10} className="animate-spin" /> : <Play size={10} />} RUN
                  </button>
                  <button className="p-1 text-slate-400 hover:text-white"><Save size={14} /></button>
               </div>
            </div>
            <div className="relative flex-1 bg-black/40 border border-slate-800 rounded-xl overflow-hidden min-h-0">
              <pre aria-hidden="true" className="absolute inset-0 p-3 mono text-[10px] leading-tight pointer-events-none whitespace-pre-wrap overflow-y-auto font-bold italic" dangerouslySetInnerHTML={{ __html: highlightCode(activeCode) }} />
              <textarea ref={editorRef} value={activeCode} onChange={(e) => setActiveCode(e.target.value)} className="relative z-10 w-full h-full bg-transparent border-none p-3 mono text-[10px] text-transparent caret-white focus:outline-none resize-none font-bold italic leading-tight scrollbar-style" spellCheck={false} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-2 min-h-0 overflow-hidden">
          <div className="bg-black/60 border border-slate-800/50 rounded-2xl flex flex-col overflow-hidden flex-1">
             <div className="p-2 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
                <h2 className="text-[9px] font-black text-slate-400 mono flex items-center gap-2 italic uppercase">
                  <TerminalIcon size={12} className="text-yellow-500" /> IO_OUTPUT
                </h2>
                <button onClick={() => setTerminalOutput([])} className="text-slate-600 hover:text-red-400"><Trash2 size={10} /></button>
             </div>
             <div ref={terminalRef} className="flex-1 p-3 mono text-[9px] space-y-1.5 overflow-y-auto scrollbar-style min-h-0">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="animate-in slide-in-from-left-1 duration-150">
                    <span className={`leading-tight font-bold italic ${line.includes('[SUCCESS]') ? 'text-emerald-400' : line.includes('guest') ? 'text-slate-200' : 'text-slate-500'}`}>
                      {line}
                    </span>
                  </div>
                ))}
             </div>
             <form onSubmit={handleCommand} className="p-2 border-t border-slate-800 bg-slate-900/40 flex items-center gap-2 shrink-0">
                <span className="text-[9px] mono text-yellow-500 font-black shrink-0">$</span>
                <input value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} placeholder="CLI hook..." className="flex-1 bg-transparent border-none outline-none text-[9px] mono text-white font-bold placeholder:text-slate-700 min-w-0" />
                <button type="submit" className="text-slate-600 hover:text-white"><ChevronUp size={12} /></button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const RuntimeItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center text-[8px] mono font-black">
    <div className="flex items-center gap-1.5 text-slate-500 uppercase">{icon} {label}</div>
    <span className="text-slate-300">{value}</span>
  </div>
);

export default PythonLab;
