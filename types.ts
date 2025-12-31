
// Fix: Import d3 to provide access to SimulationNodeDatum and SimulationLinkDatum types
import * as d3 from 'd3';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isThinking?: boolean;
}

export interface ServiceAccount {
  email: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PythonRuntime {
  version: string;
  venv_path: string;
  packages: Record<string, string>;
  is_venv_active: boolean;
}

export interface AppSettings {
  general: {
    agentId: string;
    syncInterval: number;
    storageRoot: string;
  };
  security: {
    globalRwx: boolean;
    julesMode: 'STANDARD' | 'DEEP_INTERROGATE';
    oAuthClientId: string;
    activeServiceAccount: string;
    binaryIntercept: boolean;
  };
  intelligence: {
    defaultThinkingBudget: number;
    ttsVoice: string;
    groundingMode: 'STRICT' | 'BALANCED';
    sessionPersonality: string;
  };
  interface: {
    matrixRainOpacity: number;
    tacticalHudEnabled: boolean;
    neuralCortexEnabled: boolean;
    highPerformanceMode: boolean;
  };
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  uptime: string;
  status: 'RUNNING' | 'ZOMBIE' | 'STUCK';
}

export interface ScraperStats {
  checked: number;
  hits: number;
  active: number;
  total: number;
  cpu: number;
  ram: number;
  idleTime: number;
  isAlive: boolean;
  processes: ProcessInfo[];
  zombiesKilled: number;
  throughput: number;
}

export type LogType = 'INFO' | 'HIT' | 'REBOOT' | 'CHECKED' | 'GCL' | 'CLEANUP' | 'SECURITY' | 'DIAG' | 'FORENSIC' | 'CLI' | 'INTEL' | 'WSL' | 'WIN' | 'FS' | 'BUILD' | 'ERROR' | 'AUTH' | 'BRIDGE' | 'MAPS' | 'PYTHON';

export interface LogEntry {
  timestamp: string;
  type: LogType;
  message: string;
  severity: 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export interface BuildScript {
  id: string;
  name: string;
  command: string;
  description: string;
  category: 'SETUP' | 'COMPILE' | 'CLEANUP';
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';
}

export interface BuildPlaybook {
  id: string;
  name: string;
  scriptIds: string[];
  description: string;
}

export interface McpServerDef {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  status: 'ONLINE' | 'OFFLINE' | 'DEPLOYING';
}

export interface HitMarker {
  id: string;
  userId: string;
  token?: string;
  timestamp: string;
  hexOffset: string;
  binarySignature: string;
  validityScore: number;
  metadata: {
    latency: number;
    workerNode: string;
    protocol: string;
    originIp?: string;
  };
}

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  threatLevel: number;
  thoughtSignature?: string;
}

export interface MCPResource {
  id: string;
  name: string;
  type: 'fs' | 'db' | 'network' | 'memory';
  status: 'online' | 'offline' | 'busy';
  latency: number;
  authStatus?: 'unauthenticated' | 'ready' | 'invalid';
}

export interface CLICommand {
  cmd: string;
  label: string;
  icon: string;
  description: string;
}

export interface GeminiProject {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'archived' | 'building';
}

export interface GeminiSession {
  id: string;
  lastSync: string;
  tokenCount: number;
  mode: 'autonomous' | 'manual';
  julesToken?: string;
  julesToken_Secondary?: string;
}

export interface ReceiptChunk {
  type: 'TEXT' | 'IMAGE' | 'BARCODE';
  data: Uint8Array;
}

export interface EvidenceImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  metadata: {
    hash: string;
    resolution: string;
    model: string;
    aspectRatio?: string;
  };
}

// WSL & Windows Integration Types
export interface WslInstance {
  id: string;
  distro: string;
  status: 'Running' | 'Stopped' | 'Suspended';
  ip: string;
  version: 1 | 2;
  uptime: string;
}

export interface SystemError {
  id: string;
  code: string;
  subsystem: 'WSL' | 'BRIDGE' | 'WIN_FS' | 'GEMINI_CLI';
  message: string;
  severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
  timestamp: string;
}

// File Explorer Mind Map Types
export type NodeType = 'ROOT' | 'PROJECT' | 'PROGRAM' | 'APK' | 'EXE' | 'AGENT' | 'API_SPEC' | 'EXT';

// Fix: Use imported d3 namespace for SimulationNodeDatum
export interface FileNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: NodeType;
  description?: string;
  metadata?: any;
  collapsed?: boolean;
  children?: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// Fix: Use imported d3 namespace for SimulationLinkDatum
export interface FileLink extends d3.SimulationLinkDatum<FileNode> {
  source: string | FileNode;
  target: string | FileNode;
}

export interface ExternalResource {
  id: string;
  name: string;
  url: string;
  category: 'LABS' | 'DOCS' | 'CODELAB' | 'CLI';
}

export interface FullMasterManifest {
  cli_handshake: {
    agent_id: string;
    host_mode: string;
    timestamp: string;
    auth_status: string;
    integrity_stamp?: string;
    security_signature?: string;
  };
  host_info: {
    computer_name: string;
    os_version: string;
    architecture: string;
    privilege_level: 'USER' | 'ADMIN' | 'SYSTEM';
    home_directories: {
      windows: string;
      wsl: string;
    };
    network: {
      ipv4: string;
      ipv6: string;
      dns_routing_table: string[];
      gateway: string;
    };
  };
  subsystem_wsl: {
    distros: string[];
    mount_points: string[];
    kernel_version: string;
    networking_mode: string;
  };
  packet_management: {
    windows: {
      manager: string;
      active_packages: string[];
    };
    wsl: {
      manager: string;
      active_packages: string[];
    };
  };
  tool_list: string[];
  registry_table_view: {
    hklm_security: string;
    hkcu_environment: string;
    hklm_subsystem: string;
  };
  projects: {
    storage_root: string;
    active_nodes: any[];
  };
  environment_vars: Record<string, string>;
  current_config: {
    handshake: string;
    dependency_mode: string;
    binary_intercept: string;
    uac_status: string;
  };
}
