
import React, { useState, useCallback, useRef, useEffect } from 'react';
import WatchtowerDashboard from './components/WatchtowerDashboard';
import IntelLab from './components/IntelLab';
import WslManagementSuite from './components/WslManagementSuite';
import FileInterrogator from './components/FileInterrogator';
import AgentSidebar from './components/AgentSidebar';
import DeploymentLab from './components/DeploymentLab';
import CliBridgePortal from './components/CliBridgePortal';
import MediaLab from './components/MediaLab';
import IntelligenceHub from './components/IntelligenceHub';
import SettingsPanel from './components/SettingsPanel';
import PythonLab from './components/PythonLab';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppSettings } from './types';

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    agentId: 'AGENT_OMEGA_V3',
    syncInterval: 5000,
    storageRoot: 'C:\\Users\\Alpha\\Projects\\Gemini_CLI'
  },
  security: {
    globalRwx: true,
    julesMode: 'DEEP_INTERROGATE',
    oAuthClientId: '1097275901730-c1qvpbnn9h7l9t80bf6u72jf7qlbq4ra.apps.googleusercontent.com',
    activeServiceAccount: 'service-paid@utility-subset-480317-a3.iam.gserviceaccount.com',
    binaryIntercept: true
  },
  intelligence: {
    defaultThinkingBudget: 32768,
    ttsVoice: 'Kore',
    groundingMode: 'BALANCED',
    sessionPersonality: ''
  },
  interface: {
    matrixRainOpacity: 0.1,
    tacticalHudEnabled: true,
    neuralCortexEnabled: true,
    highPerformanceMode: false
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'watchtower' | 'intel' | 'wsl' | 'explorer' | 'deploy' | 'bridge' | 'media' | 'intelligence' | 'settings' | 'python'>('watchtower');
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('watchtower_settings');
    const initial = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    return { ...initial, intelligence: { ...initial.intelligence, sessionPersonality: '' } };
  });

  const isResizing = useRef(false);

  useEffect(() => {
    const persistSettings = { 
      ...settings, 
      intelligence: { ...settings.intelligence, sessionPersonality: '' } 
    };
    localStorage.setItem('watchtower_settings', JSON.stringify(persistSettings));
  }, [settings]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.min(Math.max(e.clientX, 60), 400);
    setSidebarWidth(newWidth);
    if (newWidth < 100) setIsCollapsed(true);
    else setIsCollapsed(false);
  }, []);

  const toggleCollapse = () => {
    if (isCollapsed) {
      setSidebarWidth(260);
      setIsCollapsed(false);
    } else {
      setSidebarWidth(60);
      setIsCollapsed(true);
    }
  };

  const restoreDefaults = () => {
    if (confirm("Are you sure you want to restore default protocol settings?")) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden select-none">
      <div 
        style={{ width: isCollapsed ? 60 : sidebarWidth }} 
        className="relative flex flex-col transition-[width] duration-200 ease-in-out border-r border-slate-800/50 bg-slate-900/10 shrink-0"
      >
        <AgentSidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab as any)}
          isCollapsed={isCollapsed}
        />
        
        {!isCollapsed && (
          <div 
            onMouseDown={startResizing}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/30 transition-colors z-50"
          />
        )}

        <button 
          onClick={toggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all z-[60] shadow-xl"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
        <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-hidden">
          {activeTab === 'watchtower' && <WatchtowerDashboard settings={settings} />}
          {activeTab === 'intel' && <IntelLab />}
          {activeTab === 'wsl' && <WslManagementSuite />}
          {activeTab === 'explorer' && <FileInterrogator />}
          {activeTab === 'deploy' && <DeploymentLab />}
          {activeTab === 'bridge' && <CliBridgePortal />}
          {activeTab === 'media' && <MediaLab />}
          {activeTab === 'intelligence' && <IntelligenceHub settings={settings} />}
          {activeTab === 'python' && <PythonLab settings={settings} />}
          {activeTab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} restoreDefaults={restoreDefaults} />}
        </div>
      </main>
    </div>
  );
};

export default App;
