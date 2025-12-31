
import React, { useState } from 'react';
import { 
  Settings, Shield, Lock, Cpu, Layout, 
  RefreshCcw, Save, Trash2, Key, Database,
  UserCheck, Terminal, Fingerprint, Activity,
  Zap, Globe, Radio, Volume2, ShieldAlert,
  HardDrive, Monitor, Sparkles, AlertCircle,
  ExternalLink, LogOut, Check, Ghost
} from 'lucide-react';
import { AppSettings, ServiceAccount } from '../types';

interface Props {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  restoreDefaults: () => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, setSettings, restoreDefaults }) => {
  const [activeSection, setActiveSection] = useState<'GENERAL' | 'SECURITY' | 'INTELLIGENCE' | 'INTERFACE'>('GENERAL');
  const [isSaving, setIsSaving] = useState(false);

  const serviceAccounts: ServiceAccount[] = [
    { email: 'service-paid@utility-subset-480317-a3.iam.gserviceaccount.com', name: 'service paid', status: 'ACTIVE' },
    { email: 'servicehd@utility-subset-480317-a3.iam.gserviceaccount.com', name: 'serviceHD', status: 'INACTIVE' }
  ];

  const updateSetting = (section: keyof AppSettings, key: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col gap-6 p-8 overflow-hidden bg-slate-950 text-slate-200 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 shrink-0 relative z-30">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
            <Settings className="text-blue-500" size={40} />
            SYSTEM_PROTOCOL_CFG <span className="text-[10px] not-italic px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-400/30 mono uppercase tracking-widest">WATCHTOWER_CORE_V3</span>
          </h1>
          <p className="text-slate-500 mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <Fingerprint size={12} /> CONFIGURE_HOST_BEHAVIOR | STATE: PERSISTENT
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={restoreDefaults}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 text-slate-400 rounded-2xl font-black text-xs hover:text-white hover:border-red-500/50 transition-all uppercase italic"
          >
            <RefreshCcw size={14} /> RESTORE_DEFAULTS
          </button>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 uppercase tracking-widest italic transition-all ${isSaving ? 'opacity-50' : ''}`}
          >
            {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'SYNCING...' : 'COMMIT_CHANGES'}
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-30 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 backdrop-blur-sm flex flex-col flex-1 overflow-hidden shadow-2xl">
            <div className="space-y-2">
              <SectionBtn active={activeSection === 'GENERAL'} onClick={() => setActiveSection('GENERAL'} icon={<Monitor size={18} />} label="General" sub="Host Identity" />
              <SectionBtn active={activeSection === 'SECURITY'} onClick={() => setActiveSection('SECURITY'} icon={<ShieldAlert size={18} />} label="Authorization" sub="Service Accounts" />
              <SectionBtn active={activeSection === 'INTELLIGENCE'} onClick={() => setActiveSection('INTELLIGENCE'} icon={<Sparkles size={18} />} label="Intelligence" sub="Model Param" />
              <SectionBtn active={activeSection === 'INTERFACE'} onClick={() => setActiveSection('INTERFACE'} icon={<Layout size={18} />} label="Interface" sub="HUD / UX" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 flex flex-col h-full overflow-hidden">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] flex flex-col flex-1 backdrop-blur-md relative overflow-hidden shadow-2xl min-h-0">
            <div className="flex-1 p-10 overflow-y-auto scrollbar-style">
              
              {activeSection === 'GENERAL' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <SettingGroup title="Host Identity" desc="Configure how this dashboard identifies itself to the Gemini CLI bridge.">
                    <InputField 
                      label="Agent ID" 
                      value={settings.general.agentId} 
                      onChange={(v) => updateSetting('general', 'agentId', v)} 
                    />
                    <InputField 
                      label="Sync Interval (ms)" 
                      type="number"
                      value={settings.general.syncInterval} 
                      onChange={(v) => updateSetting('general', 'syncInterval', parseInt(v))} 
                    />
                  </SettingGroup>

                  <SettingGroup title="File System" desc="Path for forensic data storage and binary intercepts.">
                    <InputField 
                      label="Forensic Root" 
                      value={settings.general.storageRoot} 
                      onChange={(v) => updateSetting('general', 'storageRoot', v)} 
                    />
                  </SettingGroup>
                </div>
              )}

              {activeSection === 'SECURITY' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <SettingGroup title="API Authorization" desc="Manage service accounts and OAuth credentials for system-level access.">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase mono tracking-widest">Active Service Account</label>
                      <div className="grid gap-3">
                        {serviceAccounts.map(sa => (
                          <div 
                            key={sa.email} 
                            onClick={() => updateSetting('security', 'activeServiceAccount', sa.email)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                              settings.security.activeServiceAccount === sa.email 
                              ? 'bg-blue-600/10 border-blue-500/50 shadow-lg' 
                              : 'bg-black/40 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                               <div className={`p-2.5 rounded-xl ${settings.security.activeServiceAccount === sa.email ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                 <UserCheck size={18} />
                               </div>
                               <div>
                                  <p className="text-[11px] font-black text-white mono uppercase italic">{sa.name}</p>
                                  <p className="text-[9px] text-slate-500 mono mt-1 font-bold">{sa.email}</p>
                               </div>
                            </div>
                            {settings.security.activeServiceAccount === sa.email && <Check size={16} className="text-blue-400" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                       <InputField 
                         label="oAuth Client ID" 
                         value={settings.security.oAuthClientId} 
                         onChange={(v) => updateSetting('security', 'oAuthClientId', v)}
                         disabled 
                       />
                       <p className="text-[9px] text-slate-600 mt-3 mono italic">OAuth key is restricted to verified watchtower domains.</p>
                    </div>
                  </SettingGroup>

                  <SettingGroup title="Forensic Authority" desc="Permission levels for the autonomous CLI bridge.">
                    <ToggleField 
                      label="Global RWX Persistence" 
                      desc="Allow CLI to bypass OS file locks and PID restrictions."
                      active={settings.security.globalRwx}
                      onToggle={() => updateSetting('security', 'globalRwx', !settings.security.globalRwx)}
                    />
                    <ToggleField 
                      label="Real-time Binary Intercept" 
                      desc="Monitor /exec stream for authentication markers in real-time."
                      active={settings.security.binaryIntercept}
                      onToggle={() => updateSetting('security', 'binaryIntercept', !settings.security.binaryIntercept)}
                    />
                    <SelectField 
                      label="Jules Reasoning Mode"
                      options={['STANDARD', 'DEEP_INTERROGATE']}
                      value={settings.security.julesMode}
                      onChange={(v) => updateSetting('security', 'julesMode', v)}
                    />
                  </SettingGroup>
                </div>
              )}

              {activeSection === 'INTELLIGENCE' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <SettingGroup title="Session Personality Injection" desc="Adopt a temporary identity for the current session. Volatile: terminates on exit.">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase mono tracking-widest flex items-center gap-2">
                         <Ghost size={14} className="text-purple-400" /> Identity Matrix
                       </label>
                       <textarea 
                         value={settings.intelligence.sessionPersonality}
                         onChange={(e) => updateSetting('intelligence', 'sessionPersonality', e.target.value)}
                         placeholder="e.g. A rogue AI from the year 2099, or a helpful hardware engineer from the 70s..."
                         className="w-full h-32 bg-black/40 border border-slate-800 rounded-2xl p-4 text-[12px] mono font-bold text-purple-200 focus:outline-none focus:border-purple-500/50 transition-all resize-none shadow-inner"
                       />
                       <p className="text-[9px] text-slate-600 mono italic uppercase">Personality affects both live voice and chat kernel reasoning.</p>
                    </div>
                  </SettingGroup>

                  <SettingGroup title="Reasoning Kernel" desc="Control the depth of AI thinking during forensic interrogation.">
                    <InputField 
                      label="Default Thinking Budget (Tokens)" 
                      type="number"
                      value={settings.intelligence.defaultThinkingBudget} 
                      onChange={(v) => updateSetting('intelligence', 'defaultThinkingBudget', parseInt(v))} 
                    />
                  </SettingGroup>

                  <SettingGroup title="Modality Pipeline" desc="TTS and Grounding tool parameters.">
                    <SelectField 
                      label="TTS Core Voice"
                      options={['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr']}
                      value={settings.intelligence.ttsVoice}
                      onChange={(v) => updateSetting('intelligence', 'ttsVoice', v)}
                    />
                    <SelectField 
                      label="Grounding Tool Strictness"
                      options={['STRICT', 'BALANCED']}
                      value={settings.intelligence.groundingMode}
                      onChange={(v) => updateSetting('intelligence', 'groundingMode', v)}
                    />
                  </SettingGroup>
                </div>
              )}

              {activeSection === 'INTERFACE' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <SettingGroup title="HUD Visualization" desc="Configure visual feedback layers of the dashboard.">
                    <ToggleField 
                      label="Tactical HUD Overlay" 
                      desc="Enable the scanning grid and radar telemetry."
                      active={settings.interface.tacticalHudEnabled}
                      onToggle={() => updateSetting('interface', 'tacticalHudEnabled', !settings.interface.tacticalHudEnabled)}
                    />
                    <ToggleField 
                      label="Neural Cortex Map" 
                      desc="Force-directed system relationship graph."
                      active={settings.interface.neuralCortexEnabled}
                      onToggle={() => updateSetting('interface', 'neuralCortexEnabled', !settings.interface.neuralCortexEnabled)}
                    />
                  </SettingGroup>

                  <SettingGroup title="Rendering" desc="Performance tuning for low-end host machines.">
                    <InputField 
                      label="Matrix Rain Opacity" 
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={settings.interface.matrixRainOpacity} 
                      onChange={(v) => updateSetting('interface', 'matrixRainOpacity', parseFloat(v))} 
                    />
                    <ToggleField 
                      label="High Performance Mode" 
                      desc="Disable heavy animations to save CPU cycles."
                      active={settings.interface.highPerformanceMode}
                      onToggle={() => updateSetting('interface', 'highPerformanceMode', !settings.interface.highPerformanceMode)}
                    />
                  </SettingGroup>
                </div>
              )}

            </div>

            <div className="p-8 border-t border-slate-800 bg-black/20 shrink-0 text-center">
               <p className="text-[10px] text-slate-600 mono font-black uppercase tracking-widest italic">
                 Watchtower Protocol Config v3.5.2 // Last Committed: {new Date().toLocaleTimeString()}
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const SettingGroup: React.FC<{ title: string; desc: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <div className="space-y-6">
    <div className="border-b border-slate-800 pb-4">
      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{title}</h3>
      <p className="text-[11px] text-slate-500 mono mt-1 font-bold">{desc}</p>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SectionBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; sub: string }> = ({ active, onClick, icon, label, sub }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all border group ${
      active 
      ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-xl' 
      : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
    }`}
  >
    <div className={`${active ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`}>{icon}</div>
    <div className="text-left">
      <p className="text-[11px] font-black uppercase mono leading-none mb-1">{label}</p>
      <p className="text-[9px] opacity-60 mono uppercase tracking-tight italic leading-none">{sub}</p>
    </div>
  </button>
);

const InputField: React.FC<{ label: string; value: any; onChange: (v: string) => void; type?: string; disabled?: boolean; step?: string; min?: string; max?: string }> = ({ label, value, onChange, type = 'text', disabled = false, step, min, max }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase mono tracking-widest">{label}</label>
    <input 
      type={type}
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full bg-black/40 border border-slate-800 rounded-2xl p-4 text-[12px] mono font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  </div>
);

const ToggleField: React.FC<{ label: string; desc: string; active: boolean; onToggle: () => void }> = ({ label, desc, active, onToggle }) => (
  <div className="flex items-center justify-between p-5 bg-black/20 border border-white/5 rounded-3xl group">
    <div className="flex-1">
      <p className="text-[11px] font-black text-white mono uppercase italic">{label}</p>
      <p className="text-[9px] text-slate-500 mono font-bold mt-0.5">{desc}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-14 h-7 rounded-full p-1 transition-all duration-500 shadow-inner ${active ? 'bg-emerald-600' : 'bg-slate-800'}`}
    >
      <div className={`h-full w-5 bg-white rounded-full transition-transform duration-300 transform ${active ? 'translate-x-7' : 'translate-x-0'} shadow-md`} />
    </button>
  </div>
);

const SelectField: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> = ({ label, options, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase mono tracking-widest">{label}</label>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 text-[9px] font-black mono rounded-xl border transition-all ${
            value === opt 
            ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
            : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-700'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default SettingsPanel;
