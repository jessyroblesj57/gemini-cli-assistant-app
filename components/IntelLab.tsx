
import React, { useState } from 'react';
import { 
  Target, Binary, Fingerprint, RefreshCcw, Sparkles, 
  Search, AlertCircle, Layers, FileText, CheckCircle, 
  Terminal, ShieldAlert, Cpu, BarChart3, Database, Workflow,
  Globe, ExternalLink, MapPin
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { HitMarker, AIAnalysisResult } from '../types';

const IntelLab: React.FC = () => {
  const [markers, setMarkers] = useState<HitMarker[]>([
    {
      id: 'hit-9921',
      userId: '661042',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      timestamp: new Date().toISOString(),
      hexOffset: '0x000F42A1',
      binarySignature: '73 75 63 63 65 73 73 5F 61 75 74 68',
      validityScore: 0.98,
      metadata: { latency: 42, workerNode: 'NODE-04', protocol: 'EXEC_SEG_V3', originIp: '142.251.32.14' }
    },
    {
      id: 'hit-9922',
      userId: '661058',
      token: 'N/A',
      timestamp: new Date(Date.now() - 5000).toISOString(),
      hexOffset: '0x000F43B2',
      binarySignature: '66 61 69 6C 5F 73 69 67 5F 30 31',
      validityScore: 0.12,
      metadata: { latency: 85, workerNode: 'NODE-02', protocol: 'EXEC_SEG_V3', originIp: '192.168.1.1' }
    }
  ]);

  const [selectedMarker, setSelectedMarker] = useState<HitMarker | null>(markers[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AIAnalysisResult | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const runGroundedAnalysis = async (marker: HitMarker, mode: 'SEARCH' | 'MAPS') => {
    setIsAnalyzing(true);
    setGroundingChunks([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let latLng = undefined;
      if (mode === 'MAPS') {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) { /* silent fail */ }
      }

      const modelName = mode === 'SEARCH' ? 'gemini-3-flash-preview' : 'gemini-2.5-flash';
      const tools: any[] = mode === 'SEARCH' ? [{ googleSearch: {} }] : [{ googleMaps: {} }];
      
      const prompt = mode === 'SEARCH' 
        ? `Investigate forensic marker 0x${marker.hexOffset} with signature ${marker.binarySignature}. Research known CVEs or authentication vulnerabilities associated with this hex pattern across the web.`
        : `Triangulate physical origin of IP ${marker.metadata.originIp}. Use Google Maps to identify potential data center locations or high-risk geographic regions for this hit marker.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { 
          tools,
          toolConfig: mode === 'MAPS' ? { retrievalConfig: { latLng } } : undefined,
          systemInstruction: 'You are a senior forensic analyst. Use grounding tools to provide precise, evidentiary reports on system hit markers.',
        }
      });

      const candidate = response.candidates?.[0];
      setAnalysisReport({
        summary: response.text || 'No significant results returned.',
        recommendations: mode === 'SEARCH' ? ['Patch local auth kernel', 'Rotate session tokens'] : ['Geographic exclusion recommended', 'Cluster isolation'],
        status: marker.validityScore > 0.8 ? 'HEALTHY' : 'WARNING',
        threatLevel: Math.floor((1 - marker.validityScore) * 100)
      });

      if (candidate?.groundingMetadata?.groundingChunks) {
        setGroundingChunks(candidate.groundingMetadata.groundingChunks);
      }
    } catch (e: any) {
      console.error(e);
      alert(`GROUNDING_FAULT: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredMarkers = markers.filter(m => 
    m.userId.includes(searchQuery) || m.id.includes(searchQuery)
  );

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col gap-6 p-8 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 shrink-0 relative z-30">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
            <div className="relative flex items-center justify-center w-10 h-10">
              <Target size={32} className="text-blue-500 absolute animate-pulse" />
              <Search size={16} className="text-white relative z-10" />
            </div>
            INTEL_GROUNDING <span className="text-[10px] not-italic px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-400/30 mono uppercase tracking-widest">GEMINI_GROUNDED_V5</span>
          </h1>
          <p className="text-slate-500 mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <Fingerprint size={12} /> IDENTITY: FORENSIC_INTEL_OFFICER | TOOLS: SEARCH_&_MAPS
          </p>
        </div>
        <div className="flex gap-2 bg-slate-900/40 border border-slate-800 p-2 rounded-3xl max-w-xl w-full shadow-2xl backdrop-blur-xl">
          <input 
            placeholder="Interrogate UserID or HitMarker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-5 text-sm text-white placeholder:text-slate-600 mono font-bold"
          />
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 uppercase tracking-widest italic transition-all">
            <Search size={14} /> FILTER
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-30 overflow-hidden">
        
        {/* Markers Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 backdrop-blur-sm flex flex-col flex-1 overflow-hidden shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest mono mb-6">
              <Database size={16} className="text-blue-400" /> Forensic Hit Stack
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-style space-y-3">
              {filteredMarkers.map(m => (
                <button 
                  key={m.id}
                  onClick={() => { setSelectedMarker(m); setAnalysisReport(null); setGroundingChunks([]); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center group ${selectedMarker?.id === m.id ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-900/10' : 'bg-black/20 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-black text-slate-200 mono uppercase italic">USER_{m.userId}</span>
                    <span className="text-[9px] text-slate-500 mono font-bold">{m.hexOffset}</span>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${m.validityScore > 0.8 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Investigative Workspace */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 flex flex-col flex-1 backdrop-blur-md relative overflow-hidden shadow-2xl min-h-0">
            {selectedMarker ? (
              <div className="flex flex-col h-full overflow-y-auto pr-4 scrollbar-style">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Marker_{selectedMarker.id}</h2>
                    <p className="text-[10px] text-slate-500 mono font-black uppercase tracking-widest mt-2 bg-slate-950 px-2 py-0.5 rounded border border-white/5 w-fit">IP: {selectedMarker.metadata.originIp}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => runGroundedAnalysis(selectedMarker, 'SEARCH')}
                      disabled={isAnalyzing}
                      className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest italic transition-all ring-4 ring-blue-500/10"
                    >
                      <Globe size={14} /> WEB_SEARCH
                    </button>
                    <button 
                      onClick={() => runGroundedAnalysis(selectedMarker, 'MAPS')}
                      disabled={isAnalyzing}
                      className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest italic transition-all ring-4 ring-emerald-500/10"
                    >
                      <MapPin size={14} /> MAP_LOCATE
                    </button>
                  </div>
                </div>

                {analysisReport && (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className={`p-8 rounded-[2.5rem] border-2 mb-8 ${analysisReport.status === 'CRITICAL' ? 'bg-red-500/5 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.05)]' : 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]'}`}>
                      <div className="flex items-center gap-4 mb-6">
                        <CheckCircle size={24} className={analysisReport.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'} />
                        <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest italic">Evidentiary Verdict</h4>
                      </div>
                      <div className="text-sm text-slate-300 leading-relaxed font-bold italic mb-8 bg-black/40 p-6 rounded-3xl border border-white/5 whitespace-pre-wrap">{analysisReport.summary}</div>
                      
                      {/* Grounding Source Listing - MANDATORY */}
                      {groundingChunks.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                           <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Database size={14} /> Source Grounding Links
                           </h5>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {groundingChunks.map((chunk, idx) => (
                               <React.Fragment key={idx}>
                                 {chunk.web && (
                                   <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-white/5 hover:border-blue-500/40 transition-all group">
                                     <div className="flex flex-col gap-1 overflow-hidden">
                                       <span className="text-[10px] text-white mono font-bold truncate italic">{chunk.web.title || "Web Resource"}</span>
                                       <span className="text-[8px] text-slate-600 mono truncate">{chunk.web.uri}</span>
                                     </div>
                                     <ExternalLink size={12} className="text-slate-600 group-hover:text-blue-400 shrink-0" />
                                   </a>
                                 )}
                                 {chunk.maps && (
                                   <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/40 transition-all group">
                                     <div className="flex flex-col gap-1 overflow-hidden">
                                       <span className="text-[10px] text-emerald-100 mono font-bold truncate italic">{chunk.maps.title || "Map Location"}</span>
                                       <span className="text-[8px] text-emerald-900 mono truncate italic">LAT_LNG_TRIANGULATED</span>
                                     </div>
                                     <MapPin size={12} className="text-emerald-700 group-hover:text-emerald-400 shrink-0" />
                                   </a>
                                 )}
                               </React.Fragment>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                <Target size={80} className="text-slate-600 mb-6" />
                <p className="text-xl font-black mono uppercase tracking-[0.5em]">AWAITING_MARKER_LINK</p>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in">
                <RefreshCcw size={48} className="text-blue-500 animate-spin mb-6" />
                <span className="text-sm font-black text-white mono uppercase tracking-widest">Grounding with Google Search & Maps...</span>
              </div>
            )}
          </div>
        </div>

        {/* Marker Context Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm shadow-xl flex flex-col h-full overflow-hidden">
            <h2 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest mono mb-8">
              <Layers size={16} className="text-blue-400" /> Marker Context
            </h2>
            {selectedMarker ? (
              <div className="space-y-6 overflow-y-auto pr-2 scrollbar-style">
                <MetaItem label="Worker Node" value={selectedMarker.metadata.workerNode} icon={<Cpu size={12} />} />
                <MetaItem label="Latency Score" value={`${selectedMarker.metadata.latency}ms`} icon={<RefreshCcw size={12} />} />
                <MetaItem label="Protocol Segment" value={selectedMarker.metadata.protocol} icon={<Fingerprint size={12} />} />
                
                <div className="pt-8 border-t border-slate-800">
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mono mb-4">Binary Signature</h3>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400 mono leading-relaxed font-bold italic break-all">
                    {selectedMarker.binarySignature}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[10px] text-slate-600 mono uppercase italic">
                No_Context_Linked
              </div>
            )}
            <button className="mt-auto w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 border border-slate-700 transition-all uppercase italic active:scale-95 shadow-xl">
               <ShieldAlert size={16} /> FLAG_PROTOCOL_DRIFT
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

export default IntelLab;
