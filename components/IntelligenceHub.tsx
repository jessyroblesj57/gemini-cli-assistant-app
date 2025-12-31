
import React, { useState, useRef, useEffect } from 'react';
import { 
  BrainCircuit, Send, Sparkles, Volume2, 
  Trash2, RefreshCw, Zap, ShieldCheck, 
  Cpu, Radio, Ghost, ChevronUp, Binary
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, AppSettings } from '../types';

interface Props {
  settings: AppSettings;
}

const IntelligenceHub: React.FC<Props> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'OMEGA_CORE: Secure uplink established. Awaiting forensic directive.', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'FAST' | 'PRO' | 'THINKING'>('PRO');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let modelName = mode === 'FAST' ? 'gemini-2.5-flash-lite-latest' : 'gemini-3-pro-preview';
      let config: any = { systemInstruction: `You are AGENT_OMEGA_CORE. ${settings.intelligence.sessionPersonality}` };
      if (mode === 'THINKING') config.thinkingConfig = { thinkingBudget: settings.intelligence.defaultThinkingBudget };
      const response = await ai.models.generateContent({ model: modelName, contents: input, config });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response.text || 'ERR: Protocol Timeout', timestamp: new Date().toISOString(), isThinking: mode === 'THINKING' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: `FAULT: ${e.message}`, timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full flex flex-col gap-2 p-2 lg:p-3 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex justify-between items-center shrink-0 px-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600/10 rounded-lg border border-blue-500/20">
            <BrainCircuit className="text-blue-400" size={18} />
          </div>
          <div>
            <h1 className="text-sm lg:text-lg font-black text-white italic uppercase tracking-tight leading-none">Intelligence_Core</h1>
            <div className="flex items-center gap-1.5 mt-1">
               <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
               <p className="text-[7px] text-slate-500 mono uppercase font-black">KERNEL: GEMINI_3_PRO</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-900/40 p-1 rounded-lg border border-slate-800">
           <ModeTab active={mode === 'FAST'} onClick={() => setMode('FAST')} label="FLASH" color="text-emerald-400" />
           <ModeTab active={mode === 'PRO'} onClick={() => setMode('PRO')} label="PRO" color="text-blue-400" />
           <ModeTab active={mode === 'THINKING'} onClick={() => setMode('THINKING')} label="THINK" color="text-purple-400" />
           <button onClick={() => setMessages([messages[0]])} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
        </div>
      </header>

      <div className="flex-1 min-h-0 bg-slate-900/10 border border-slate-800/40 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm relative">
        <div ref={scrollRef} className="flex-1 p-4 lg:p-6 overflow-y-auto scrollbar-style space-y-6 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 px-5 rounded-2xl border shadow-xl relative group transition-all ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-black/40 border-slate-800 text-slate-300'
                }`}>
                  {msg.isThinking && (
                    <div className="flex items-center gap-2 text-[7px] text-purple-400 uppercase mono mb-2 border-b border-purple-500/10 pb-1 italic font-black">
                       <Radio size={10} className="animate-pulse" /> Strategic_Reasoning_Active
                    </div>
                  )}
                  <p className="text-[11px] leading-relaxed mono font-bold italic whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[7px] text-slate-600 mono mt-2 font-black uppercase tracking-widest">
                  {msg.role === 'user' ? 'OFFICER' : 'OMEGA'} // {new Date(msg.timestamp).toLocaleTimeString([], {hour12:false})}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-black/60 border border-blue-500/20 p-4 px-6 rounded-2xl flex flex-col gap-3 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="animate-spin text-blue-500" size={12} />
                    <span className="text-[9px] mono uppercase font-black text-slate-400 italic">Interrogating_Uplink...</span>
                  </div>
                  <div className="flex gap-1 h-1 w-full opacity-30">
                    {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className="flex-1 bg-blue-500 animate-pulse" style={{animationDelay: `${i*100}ms`}} />
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-3 lg:p-5 border-t border-slate-800/40 bg-slate-900/20 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 max-w-4xl mx-auto bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 shadow-2xl"
          >
             <input 
               value={input} 
               onChange={(e) => setInput(e.target.value)} 
               placeholder="Enter forensic hook..." 
               className="flex-1 bg-transparent border-none outline-none px-3 text-[11px] text-white mono font-bold placeholder:text-slate-700 min-w-0" 
             />
             <button 
               type="submit"
               disabled={isLoading || !input.trim()} 
               className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-90 disabled:opacity-30 disabled:grayscale"
             >
               <Send size={16} />
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ModeTab: React.FC<{ active: boolean, onClick: () => void, label: string, color: string }> = ({ active, onClick, label, color }) => (
  <button onClick={onClick} className={`px-3 py-1 rounded-md transition-all font-black text-[8px] mono border ${active ? `bg-slate-800 border-slate-700 ${color} shadow-lg shadow-black/40` : 'bg-transparent border-transparent text-slate-600 hover:text-slate-400'}`}>
    {label}
  </button>
);

export default IntelligenceHub;