
import React, { useState } from 'react';
import { Printer, Code, Plus, Download, Sparkles, RefreshCcw, List, ShieldCheck, Binary, Fingerprint, Braces, Settings2, Terminal, AlertCircle, AlignJustify } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ReceiptChunk } from '../types';

interface SynthesisResult {
  stream: ReceiptChunk[];
  errors: string[];
  warnings: string[];
}

interface CommandMetadata {
  name: string;
  bytes: Uint8Array;
  hex: string;
  type: 'TOGGLE' | 'ALIGN' | 'BLOCK' | 'DATA';
  pair?: string;
}

interface ProtocolState {
  bold: boolean;
  doubleHeight: boolean;
  doubleWidth: boolean;
  alignment: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY';
}

class TemplateManager {
  private static readonly ESC = 0x1B;
  private static readonly GS = 0x1D;
  private static readonly DOT_WIDTH = 384;
  private static readonly MAX_CHARS_NORMAL = 42; // Standard 80mm printer approx
  private static readonly MAX_CHARS_DOUBLE = 21;

  private static readonly BLOCK_TAGS = ['{{LOGO}}', '{{BARCODE}}', '{{ITEMS}}'];
  private static readonly DATA_TAGS = ['{{STORE_ID}}', '{{TOTAL}}'];
  
  private static readonly COMMAND_MAP: Record<string, CommandMetadata> = {
    '{{B_ON}}': { name: 'Bold On', bytes: new Uint8Array([0x1B, 0x45, 1]), hex: '1B 45 01', type: 'TOGGLE', pair: '{{B_OFF}}' },
    '{{B_OFF}}': { name: 'Bold Off', bytes: new Uint8Array([0x1B, 0x45, 0]), hex: '1B 45 00', type: 'TOGGLE', pair: '{{B_ON}}' },
    '{{DH_ON}}': { name: 'Double Height On', bytes: new Uint8Array([0x1D, 0x21, 0x01]), hex: '1D 21 01', type: 'TOGGLE', pair: '{{DH_OFF}}' },
    '{{DH_OFF}}': { name: 'Double Height Off', bytes: new Uint8Array([0x1D, 0x21, 0x00]), hex: '1D 21 00', type: 'TOGGLE', pair: '{{DH_ON}}' },
    '{{DW_ON}}': { name: 'Double Width On', bytes: new Uint8Array([0x1D, 0x21, 0x10]), hex: '1D 21 10', type: 'TOGGLE', pair: '{{DW_OFF}}' },
    '{{DW_OFF}}': { name: 'Double Width Off', bytes: new Uint8Array([0x1D, 0x21, 0x00]), hex: '1D 21 00', type: 'TOGGLE', pair: '{{DW_ON}}' },
    '{{CENTER}}': { name: 'Align Center', bytes: new Uint8Array([0x1B, 0x61, 1]), hex: '1B 61 01', type: 'ALIGN' },
    '{{LEFT}}': { name: 'Align Left', bytes: new Uint8Array([0x1B, 0x61, 0]), hex: '1B 61 00', type: 'ALIGN' },
    '{{RIGHT}}': { name: 'Align Right', bytes: new Uint8Array([0x1B, 0x61, 2]), hex: '1B 61 02', type: 'ALIGN' },
    '{{JUSTIFY}}': { name: 'Align Justify', bytes: new Uint8Array([0x1B, 0x61, 3]), hex: '1B 61 03', type: 'ALIGN' },
  };

  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  }

  static async synthesizeByteStream(
    template: string, 
    data: { storeId: string; items: { name: string; price: number }[]; total: string }
  ): Promise<SynthesisResult> {
    const stream: ReceiptChunk[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const state: ProtocolState = {
      bold: false,
      doubleHeight: false,
      doubleWidth: false,
      alignment: 'LEFT'
    };

    if (!data.storeId) errors.push("CRITICAL: AGENT_ID is null. Protocol handshake requires valid identity.");

    try {
      // 1. Initial tag audit
      const tagRegex = /{{[A-Z0-9_]+}}/g;
      const allTagsInDoc = Array.from(template.matchAll(tagRegex)).map(m => m[0]);
      const knownTags = [...this.BLOCK_TAGS, ...this.DATA_TAGS, ...Object.keys(this.COMMAND_MAP)];
      
      allTagsInDoc.forEach(tag => {
        if (!knownTags.includes(tag)) {
          errors.push(`MALFORMED_TAG: "${tag}" is not a recognized ESC/POS instruction.`);
        }
      });

      // 2. Initialize Hardware (ESC @)
      stream.push({ type: 'TEXT', data: new Uint8Array([this.ESC, 0x40]) });

      const lines = template.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Block Instructions
        const trimmed = line.trim();
        if (this.BLOCK_TAGS.includes(trimmed)) {
          if (trimmed === '{{LOGO}}') {
            try {
              stream.push({ type: 'IMAGE', data: await this.generateNativeRasterLogo() });
            } catch (e) { errors.push(`L${lineNum}: Binary rasterization fault for LOGO.`); }
          } else if (trimmed === '{{BARCODE}}') {
            const txnId = `ANT-${Math.random().toString(36).substring(7).toUpperCase()}`;
            try {
              stream.push({ type: 'BARCODE', data: this.generateNativeCode128(txnId) });
            } catch (e) { errors.push(`L${lineNum}: Barcode generation fault (Instruction GS k 73).`); }
          } else if (trimmed === '{{ITEMS}}') {
            if (!data.items || data.items.length === 0) {
              warnings.push(`L${lineNum}: Item set is empty. Skipping BLOCK_ITEMS.`);
            } else {
              data.items.forEach(item => {
                const namePart = item.name.substring(0, 24).padEnd(24, ' ');
                const pricePart = `$${item.price.toFixed(2)}`.padStart(8, ' ');
                stream.push({ type: 'TEXT', data: this.stringToBinary(`${namePart}${pricePart}\n`) });
              });
            }
          }
          continue;
        }

        // Inline Data & Formatting instructions
        let processedLine = line
          .replace('{{STORE_ID}}', data.storeId || 'UNDEFINED')
          .replace('{{TOTAL}}', data.total || '0.00');

        // Track Protocol State for this line
        this.updateProtocolState(processedLine, state, errors, lineNum);

        // Check for line length overflow
        const cleanText = processedLine.replace(/{{[A-Z0-9_]+}}/g, '');
        const maxLimit = state.doubleWidth ? this.MAX_CHARS_DOUBLE : this.MAX_CHARS_NORMAL;
        if (cleanText.length > maxLimit) {
          warnings.push(`L${lineNum}: Buffer overflow. Line contains ${cleanText.length} chars (Max ${maxLimit} for current width). Text may wrap.`);
        }

        const chunks = this.parseLineFormatting(processedLine);
        chunks.forEach(chunk => stream.push(chunk));
        stream.push({ type: 'TEXT', data: new Uint8Array([0x0A]) }); // LF
      }

      // 3. Final State Verification
      if (state.bold) warnings.push("STATE_LEAK: {{B_ON}} instruction active at EOF. Implicit reset applied.");
      if (state.doubleHeight) warnings.push("STATE_LEAK: {{DH_ON}} instruction active at EOF. Implicit reset applied.");
      if (state.doubleWidth) warnings.push("STATE_LEAK: {{DW_ON}} instruction active at EOF. Implicit reset applied.");

      // 4. Final Hardware Cut (GS V 66 0)
      stream.push({ type: 'TEXT', data: new Uint8Array([this.GS, 0x56, 66, 0]) });
    } catch (globalError) {
      errors.push(`PROTOCOL_ABORT: ${(globalError as Error).message}`);
    }

    return { stream, errors, warnings };
  }

  private static updateProtocolState(line: string, state: ProtocolState, errors: string[], lineNum: number) {
    const tags = line.match(/{{[A-Z0-9_]+}}/g) || [];
    tags.forEach(tag => {
      const cmd = this.COMMAND_MAP[tag];
      if (!cmd) return;

      if (tag === '{{B_ON}}') state.bold = true;
      if (tag === '{{B_OFF}}') state.bold = false;
      if (tag === '{{DH_ON}}') state.doubleHeight = true;
      if (tag === '{{DH_OFF}}') state.doubleHeight = false;
      if (tag === '{{DW_ON}}') state.doubleWidth = true;
      if (tag === '{{DW_OFF}}') state.doubleWidth = false;
      
      if (cmd.type === 'ALIGN') {
        state.alignment = tag.replace('{{', '').replace('}}', '') as any;
      }
    });
  }

  private static parseLineFormatting(line: string): ReceiptChunk[] {
    const chunks: ReceiptChunk[] = [];
    let remaining = line;
    const sortedTags = Object.keys(this.COMMAND_MAP).sort((a, b) => b.length - a.length);

    while (remaining.length > 0) {
      let nearestTagIndex = -1;
      let nearestTagKey: string | null = null;

      for (const tagKey of sortedTags) {
        const idx = remaining.indexOf(tagKey);
        if (idx !== -1 && (nearestTagIndex === -1 || idx < nearestTagIndex)) {
          nearestTagIndex = idx;
          nearestTagKey = tagKey;
        }
      }

      if (nearestTagKey && nearestTagIndex !== -1) {
        if (nearestTagIndex > 0) {
          chunks.push({ type: 'TEXT', data: this.stringToBinary(remaining.substring(0, nearestTagIndex)) });
        }
        chunks.push({ type: 'TEXT', data: this.COMMAND_MAP[nearestTagKey].bytes });
        remaining = remaining.substring(nearestTagIndex + nearestTagKey.length);
      } else {
        chunks.push({ type: 'TEXT', data: this.stringToBinary(remaining) });
        remaining = '';
      }
    }
    return chunks;
  }

  private static stringToBinary(str: string): Uint8Array {
    const Encoder = (window as any).TextEncoder || TextEncoder;
    return new Encoder().encode(str);
  }

  private static generateNativeCode128(content: string): Uint8Array {
    const raw = this.stringToBinary(content);
    const header = new Uint8Array([this.GS, 0x6B, 73, raw.length]);
    const cmd = new Uint8Array(header.length + raw.length);
    cmd.set(header);
    cmd.set(raw, header.length);
    return cmd;
  }

  private static async generateNativeRasterLogo(): Promise<Uint8Array> {
    const w = this.DOT_WIDTH;
    const h = 128;
    const bytesPerRow = w / 8;
    const header = new Uint8Array([this.GS, 0x76, 0x30, 0, bytesPerRow % 256, Math.floor(bytesPerRow / 256), h % 256, Math.floor(h / 256)]);
    const raster = new Uint8Array(bytesPerRow * h);
    for (let y = 0; y < h; y++) {
      for (let xByte = 0; xByte < bytesPerRow; xByte++) {
        let packedByte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = (xByte * 8) + bit;
          const dx = x - w/2;
          const dy = y - h/2;
          const shieldShape = Math.abs(dx) < 30 && dy > -40 && dy < 40;
          if (shieldShape || (Math.sqrt(dx*dx + dy*dy) < 10)) {
            packedByte |= (1 << (7 - bit));
          }
        }
        raster[y * bytesPerRow + xByte] = packedByte;
      }
    }
    const fullBuffer = new Uint8Array(header.length + raster.length);
    fullBuffer.set(header);
    fullBuffer.set(raster, header.length);
    return fullBuffer;
  }
}

const ReceiptTerminal: React.FC = () => {
  const [template, setTemplate] = useState(`{{LOGO}}
{{CENTER}}{{DH_ON}}{{B_ON}}FORENSIC_EVIDENCE{{B_OFF}}{{DH_OFF}}
{{CENTER}}AGENT_ID: {{B_ON}}{{STORE_ID}}{{B_OFF}}
--------------------------------
{{LEFT}}LOG_ENTRIES:
{{ITEMS}}
--------------------------------
{{JUSTIFY}}{{B_ON}}SYSTEM_SUMMARY_BLOCK_VERIFIED{{B_OFF}}
{{RIGHT}}TOTAL_BLOCKS: {{B_ON}}{{TOTAL}}{{B_OFF}}
{{CENTER}}
{{BARCODE}}
{{CENTER}}{{B_ON}}PROCESSED_BY_WATCHTOWER_V3{{B_OFF}}`);

  const [items, setItems] = useState([
    { name: '/exec Binary Stream', price: 142.00 },
    { name: 'Fingerprint Shielding', price: 900.50 },
    { name: 'Zombie Kill Cycle', price: 12.00 },
    { name: 'MCP Resource Balance', price: 45.99 },
    { name: 'Chromium Kernel Patch', price: 210.00 }
  ]);
  const [storeId, setStoreId] = useState('AGENT-3-PRO');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamMetrics, setStreamMetrics] = useState<{hex: string, size: number} | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const totalStr = items.reduce((acc, curr) => acc + curr.price, 0).toFixed(2);

  const handleExecuteStream = async () => {
    setValidationErrors([]);
    setValidationWarnings([]);
    const { stream, errors, warnings } = await TemplateManager.synthesizeByteStream(template, { storeId, items, total: totalStr });
    
    setValidationErrors(errors);
    setValidationWarnings(warnings);
    
    if (errors.length > 0) return;

    const size = stream.reduce((acc, c) => acc + c.data.length, 0);
    const first32 = Array.from(stream[0]?.data.slice(0, 32) || [])
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    setStreamMetrics({ hex: first32 || '00', size });
  };

  const handleAISynthesis = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional forensic audit log template for: "${aiPrompt}". Use ESC/POS tags like {{LOGO}}, {{BARCODE}}, {{CENTER}}, {{B_ON}}, {{DH_ON}}. Return JSON with 'template' and 'items' keys.`,
        config: { responseMimeType: "application/json" }
      });
      const res = JSON.parse(response.text || '{}');
      if (res.template) setTemplate(res.template);
      if (res.items) setItems(res.items);
      setAiPrompt('');
      setValidationErrors([]);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full flex flex-col gap-6 p-4 md:p-8 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 shrink-0 relative z-30">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
            <Binary className="text-emerald-500 shrink-0" size={32} />
            EVIDENCE_LOG <span className="hidden sm:inline text-[10px] not-italic px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-400/30 mono uppercase tracking-widest">NATIVE EXEC STREAM</span>
          </h1>
          <p className="text-slate-500 mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <Fingerprint size={12} /> IDENTITY: FORENSIC_CLI_AGENT | FORMAT: ESC/POS
          </p>
        </div>
        <div className="flex gap-2 bg-slate-900/40 border border-slate-800 p-2 rounded-2xl md:rounded-3xl max-w-xl w-full shadow-2xl backdrop-blur-xl">
          <input 
            placeholder="Audit target..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-3 md:px-5 text-sm text-white placeholder:text-slate-600 mono font-bold min-w-0"
          />
          <button 
            onClick={() => handleAISynthesis()}
            disabled={isGenerating || !aiPrompt}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl font-black text-xs shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest italic transition-all shrink-0"
          >
            {isGenerating ? <RefreshCcw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            COMPILE
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 min-w-0 grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10 relative z-30 overflow-hidden">
        
        <div className="flex flex-col h-full overflow-y-auto pr-2 md:pr-4 scrollbar-style touch-pan-y space-y-6 md:space-y-8 min-w-0">
          {(validationErrors.length > 0 || validationWarnings.length > 0) && (
            <div className="space-y-4 shrink-0">
              {validationErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 md:p-6 rounded-3xl">
                  <h4 className="text-red-400 font-black text-[10px] mono uppercase tracking-widest flex items-center gap-2 mb-3">
                    <AlertCircle size={14} /> Protocol Violation Detected
                  </h4>
                  <ul className="space-y-2">
                    {validationErrors.map((err, i) => (
                      <li key={i} className="text-[10px] text-red-300/80 mono font-bold italic leading-relaxed bg-red-950/20 p-2 rounded-lg border border-red-500/10">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {validationWarnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 md:p-6 rounded-3xl">
                  <h4 className="text-yellow-400 font-black text-[10px] mono uppercase tracking-widest flex items-center gap-2 mb-3">
                    <AlertCircle size={14} /> Buffer Advisory
                  </h4>
                  <ul className="space-y-2">
                    {validationWarnings.map((warn, i) => (
                      <li key={i} className="text-[10px] text-yellow-300/80 mono font-bold italic leading-relaxed bg-yellow-950/20 p-2 rounded-lg border border-yellow-500/10">
                        {warn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-900/30 border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 backdrop-blur-sm relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
               <Braces size={120} />
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono italic">
                <Code size={16} className="text-emerald-400" /> Log Synthesis Engine
              </h2>
            </div>
            <textarea 
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full h-80 bg-black/40 border border-slate-800 rounded-3xl p-6 mono text-emerald-300 focus:outline-none focus:border-emerald-400/30 resize-none text-sm leading-relaxed font-bold shadow-inner"
              spellCheck={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 shrink-0">
            <div className="bg-slate-900/30 border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 backdrop-blur-sm shadow-xl flex flex-col gap-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest mono italic">
                 <Settings2 size={16} /> Forensic Env
               </h3>
               <input value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full bg-black/60 border border-slate-800 rounded-2xl p-4 mono text-xs text-white outline-none focus:border-blue-500/30" />
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 backdrop-blur-sm flex flex-col shadow-xl h-64 overflow-hidden">
               <h3 className="text-[10px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest mono shrink-0 italic">
                 <List size={16} /> Intercepted Blocks
               </h3>
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-style">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-300 mono truncate uppercase font-bold pr-2">{item.name}</span>
                      <span className="text-[10px] text-emerald-400 font-black mono shrink-0">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
               </div>
               <button onClick={() => setItems([...items, {name: 'Binary Hash Entry', price: 0}])} className="mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-slate-700 transition-all uppercase italic shrink-0">
                 <Plus size={14} /> APPEND LOG
               </button>
            </div>
          </div>

          {streamMetrics && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6 md:p-8 shadow-2xl shrink-0 mb-8">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[11px] font-black text-emerald-400 flex items-center gap-2 mono uppercase tracking-wider">
                   <Terminal size={18} /> BINARY_EXEC_PACKET
                 </h3>
                 <span className="text-[10px] text-emerald-300 mono font-black">{streamMetrics.size} BYTES</span>
               </div>
               <div className="bg-black/80 p-6 rounded-3xl mono text-[10px] text-emerald-500/90 leading-relaxed break-all border border-white/5 font-bold italic">
                 {streamMetrics.hex} ... <span className="text-emerald-900 opacity-50">[EOF]</span>
               </div>
            </div>
          )}
        </div>

        {/* Viewport contained Preview */}
        <div className="flex flex-col items-center h-full overflow-hidden relative z-40 min-w-0">
           <div className="flex-1 w-full overflow-y-auto scrollbar-style flex flex-col items-center pb-24 px-4">
             <div className="w-full max-w-[380px] bg-white text-slate-900 p-8 md:p-12 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)] rounded-sm relative receipt-paper min-h-[1000px] flex flex-col items-center shrink-0 mb-12 transform origin-top transition-transform">
                <div className="absolute top-0 left-0 right-0 flex h-2 opacity-90">
                  {Array.from({length: 45}).map((_, i) => (
                    <div key={i} className="flex-1 bg-slate-950" style={{clipPath: 'polygon(50% 100%, 0 0, 100% 0)'}} />
                  ))}
                </div>
                
                <div className="w-full mono text-[12px] leading-tight space-y-10 mt-6 text-center">
                  <div className="space-y-6">
                    <div className="w-24 h-24 md:w-28 md:h-28 mx-auto border-[3px] border-slate-950 flex items-center justify-center bg-white rotate-2 shadow-sm">
                      <ShieldCheck size={56} className="text-slate-950" strokeWidth={1.5} />
                    </div>
                    <div className="font-black text-xl tracking-tighter uppercase leading-none break-words">FORENSIC_AUDIT_LOG</div>
                    <div className="text-[10px] opacity-70 tracking-widest font-black italic">AGENT_ID: {storeId}</div>
                  </div>

                  <div className="border-y-[3px] border-slate-950 border-dashed py-8 space-y-4 text-left">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between items-end gap-3 font-bold">
                        <span className="uppercase truncate flex-1">{item.name}</span>
                        <div className="flex-[0.5] border-b border-dotted border-slate-300 mb-1" />
                        <span className="font-black text-right tracking-tight shrink-0">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="py-4 border-b-2 border-slate-300">
                    <div className="text-[10px] text-justify font-black uppercase tracking-tighter leading-tight opacity-90 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      <AlignJustify size={10} className="inline mr-2 mb-0.5" />
                      SYSTEM_SUMMARY_BLOCK_VERIFIED_AND_ACKNOWLEDGED_BY_WATCHTOWER_PROTOCOL_V3.0_DASHBOARD_HEARTBEAT_ACTIVE_THROUGHOUT_THE_SWEEP_PERIOD.
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-lg pt-2 uppercase border-b-2 border-slate-300 pb-2">
                     <span>SYNC_BLOCK_TOTAL</span>
                     <span className="text-2xl">${totalStr}</span>
                  </div>

                  <div className="pt-8 text-center space-y-6">
                    <div className="flex gap-[2px] justify-center h-24 items-end bg-slate-100 p-3 rounded-lg border-2 border-slate-200">
                      {Array.from({length: 64}).map((_, i) => (
                        <div key={i} className="bg-slate-950" style={{ width: `${Math.random() * 2 + 1}px`, height: `${30 + Math.random() * 50}px` }} />
                      ))}
                    </div>
                    <div className="text-[10px] font-black tracking-[0.4em] md:tracking-[0.6em] opacity-80 uppercase bg-slate-100 py-2 rounded">BLOCK_ID: {Date.now().toString().slice(-10)}</div>
                  </div>

                  <div className="text-[9px] text-center italic opacity-60 pt-16 border-t border-slate-200 uppercase tracking-[0.4em] font-black leading-relaxed">
                    VALIDATED_BY_ANA_GRAVITY_TRUST<br/>
                    (C) 2025 GEMINI FORENSICS
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex h-2 rotate-180 opacity-90">
                  {Array.from({length: 45}).map((_, i) => (
                    <div key={i} className="flex-1 bg-slate-950" style={{clipPath: 'polygon(50% 100%, 0 0, 100% 0)'}} />
                  ))}
                </div>
             </div>
           </div>

           <div className="absolute bottom-6 flex gap-4 w-full max-w-[380px] px-4 shrink-0 z-50">
              <button 
                onClick={() => handleExecuteStream()} 
                className="flex-1 flex items-center justify-center gap-4 px-6 py-4 md:py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black text-sm shadow-2xl shadow-emerald-500/40 transition-all uppercase italic active:scale-95 group border-2 border-emerald-400/20 truncate"
              >
                <Printer size={22} className="group-hover:animate-bounce shrink-0" /> <span className="truncate">EXEC_STREAM</span>
              </button>
              <button className="p-4 md:p-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-[1.5rem] md:rounded-[2.5rem] transition-all border border-slate-700 shadow-xl active:scale-95 shrink-0">
                <Download size={24} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptTerminal;
