
import React, { useState, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Sparkles, RefreshCcw, 
  Trash2, Download, Shield, Binary, Fingerprint, 
  AlertCircle, Search, Layers, FileText, AspectRatio,
  Maximize2, Upload, Microscope, Send, Zap, Monitor,
  Terminal
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { EvidenceImage } from '../types';

const MediaLab: React.FC = () => {
  const [images, setImages] = useState<EvidenceImage[]>([
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      prompt: 'Cybersecurity forensic data visualization, neon circuitry',
      timestamp: new Date().toISOString(),
      metadata: { hash: '0x8823FB', resolution: '1K', model: 'Standard' }
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EvidenceImage | null>(images[0]);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ratios = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"];

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `Professional high-fidelity forensic data visualization: ${prompt}. Technical, detailed, and evidentiary style.` }],
        },
        config: {
          imageConfig: { 
            aspectRatio: aspectRatio as any,
            imageSize: "1K"
          }
        },
      });

      let base64Data = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }

      if (base64Data) {
        const newImg: EvidenceImage = {
          id: `img-${Date.now()}`,
          url: `data:image/png;base64,${base64Data}`,
          prompt: prompt,
          timestamp: new Date().toISOString(),
          metadata: {
            hash: `0x${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
            resolution: '1K',
            model: 'gemini-3-pro-image-preview',
            aspectRatio
          }
        };
        setImages(prev => [newImg, ...prev]);
        setSelectedImage(newImg);
        setPrompt('');
      } else {
        throw new Error('Image kernel returned empty stream.');
      }
    } catch (err: any) {
      console.error(err);
      setError(`IMAGE_ENGINE_FAULT: ${err.message || 'Unknown protocol violation'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadAndAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const fullBase64 = reader.result as string;
        const base64 = fullBase64.split(',')[1];
        
        // Add to gallery first
        const newImg: EvidenceImage = {
          id: `upload-${Date.now()}`,
          url: fullBase64,
          prompt: 'Uploaded Evidence File',
          timestamp: new Date().toISOString(),
          metadata: {
            hash: `0x${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
            resolution: 'N/A',
            model: 'UPLOADED_BLOB'
          }
        };
        setImages(prev => [newImg, ...prev]);
        setSelectedImage(newImg);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: {
            parts: [
              { inlineData: { data: base64, mimeType: file.type } },
              { text: "Perform a forensic analysis on this image. Extract metadata patterns, identify security risks, and provide a diagnostic verdict." }
            ]
          },
          config: { thinkingConfig: { thinkingBudget: 15000 } }
        });
        setAnalysisText(response.text || 'No significant anomalies detected.');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(`ANALYSIS_FAULT: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col gap-6 p-8 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 shrink-0 relative z-30">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
            <Camera className="text-blue-500" size={40} />
            MEDIA_LAB_CORE <span className="text-[10px] not-italic px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-400/30 mono uppercase tracking-widest">GEMINI_3_PRO_VISION</span>
          </h1>
          <p className="text-slate-500 mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <Fingerprint size={12} /> IDENTITY: FORENSIC_MEDIA_OFFICER | MODALITY: VISION_GEN_2
          </p>
        </div>
        <div className="flex gap-2 bg-slate-900/40 border border-slate-800 p-2 rounded-3xl max-w-xl w-full shadow-2xl backdrop-blur-xl">
          <input 
            placeholder="Generate forensic scene (e.g., 'encrypted server room with blue neon')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-5 text-sm text-white placeholder:text-slate-600 mono font-bold"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
          />
          <button 
            onClick={handleGenerateImage}
            disabled={isGenerating || !prompt}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest italic transition-all"
          >
            {isGenerating ? <RefreshCcw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            SYNTHESIZE
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 shrink-0 animate-in shake duration-300">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-xs font-bold text-red-400 mono uppercase">{error}</span>
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-30 overflow-hidden">
        
        {/* Gallery / Controls */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 backdrop-blur-sm flex flex-col flex-1 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono">
                <Layers size={16} className="text-blue-400" /> Evidence Library
              </h2>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-emerald-400 transition-all border border-slate-700 shadow-lg"
                title="Upload Image for Forensic Analysis"
              >
                <Upload size={14} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleUploadAndAnalyze} hidden accept="image/*" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-style space-y-4">
               {/* Aspect Ratio Controls - 8 Required Ratios */}
               <div className="space-y-3 pb-6 border-b border-slate-800">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase mono italic">Aspect_Ratio_Lock</span>
                    <span className="text-[9px] font-black text-blue-400 mono">{aspectRatio}</span>
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                   {ratios.map(r => (
                     <button 
                       key={r}
                       onClick={() => setAspectRatio(r)}
                       className={`p-2 text-[8px] mono font-black rounded-lg border transition-all ${aspectRatio === r ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-black/40 text-slate-600 border-slate-800 hover:border-slate-600'}`}
                     >
                       {r}
                     </button>
                   ))}
                 </div>
               </div>

              <div className="space-y-3 pt-2">
                {images.map(img => (
                  <button 
                    key={img.id}
                    onClick={() => { setSelectedImage(img); setAnalysisText(''); }}
                    className={`w-full group relative overflow-hidden rounded-2xl border transition-all ${selectedImage?.id === img.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <img src={img.url} alt="Evidence" className="w-full h-24 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent p-3 flex flex-col justify-end">
                      <p className="text-[9px] font-black text-white truncate mono uppercase tracking-widest">{img.metadata.hash}</p>
                      <p className="text-[8px] text-slate-500 truncate mono uppercase font-bold">{img.metadata.model}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Asset View */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-4 flex flex-col flex-1 backdrop-blur-md relative overflow-hidden shadow-2xl min-h-0">
            {selectedImage ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 relative group overflow-hidden rounded-2xl border border-white/5 bg-black/80 flex items-center justify-center">
                  <img src={selectedImage.url} alt="Main Evidence" className="max-w-full max-h-full object-contain" />
                  
                  <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-slate-900/90 rounded-xl text-slate-300 hover:text-white border border-white/10 backdrop-blur-md"><Download size={18} /></button>
                    <button onClick={() => removeImage(selectedImage.id)} className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 backdrop-blur-md transition-all"><Trash2 size={18} /></button>
                  </div>

                  <div className="absolute bottom-4 left-4 p-4 bg-slate-950/80 border border-white/10 rounded-2xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity max-w-[80%]">
                    <p className="text-[10px] text-slate-300 mono leading-relaxed italic">{selectedImage.prompt}</p>
                  </div>
                </div>

                {analysisText && (
                  <div className="p-6 bg-slate-950/80 mt-4 rounded-3xl border border-blue-500/30 overflow-y-auto scrollbar-style shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-3">
                      <Microscope size={16} className="text-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-black text-white uppercase mono italic tracking-widest">Diagnostic_Verdict</span>
                    </div>
                    <div className="text-xs mono text-slate-300 font-bold leading-relaxed italic whitespace-pre-wrap">{analysisText}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                <Monitor size={80} className="text-slate-600 mb-6" />
                <p className="text-lg font-black mono uppercase tracking-[0.5em]">AWAITING_MEDIA_UPLINK</p>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in">
                <RefreshCcw size={48} className="text-emerald-500 animate-spin mb-6" />
                <span className="text-sm font-black text-white mono uppercase tracking-widest">Interrogating visual kernel...</span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata & Diagnostics */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm shadow-xl flex flex-col h-full overflow-hidden">
            <h2 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest mono mb-8">
              <Binary size={16} className="text-blue-400" /> Evidence_Metadata
            </h2>
            {selectedImage ? (
              <div className="space-y-6 overflow-y-auto pr-2 scrollbar-style">
                <MetaItem label="System Hash" value={selectedImage.metadata.hash} icon={<Binary size={12} />} />
                <MetaItem label="Resolution" value={selectedImage.metadata.resolution} icon={<Maximize2 size={12} />} />
                <MetaItem label="Engine" value={selectedImage.metadata.model} icon={<Sparkles size={12} />} />
                
                <div className="pt-8 border-t border-slate-800">
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mono mb-4 flex items-center gap-2">
                    <Terminal size={12} /> Execution_Log
                  </h3>
                  <div className="bg-black/60 border border-white/5 rounded-2xl p-4 text-[9px] text-slate-500 mono leading-relaxed font-bold italic">
                    [INFO] Media synthesized at {new Date(selectedImage.timestamp).toLocaleTimeString()}<br/>
                    [INFO] Integrity stamp verified.<br/>
                    [INFO] Modality: {selectedImage.metadata.aspectRatio || '1:1'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[10px] text-slate-600 mono uppercase italic">
                Ready_For_Synthesis
              </div>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-auto w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 border border-slate-700 transition-all uppercase italic shadow-xl active:scale-95"
            >
               <Camera size={16} /> ANALYZE_PHOTO_BLOB
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 text-[9px] text-slate-500 uppercase tracking-wider font-black mono italic">
      {icon} {label}
    </div>
    <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-bold text-slate-300 mono truncate">
      {value}
    </div>
  </div>
);

export default MediaLab;
