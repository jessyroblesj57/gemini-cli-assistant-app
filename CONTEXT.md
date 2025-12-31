
# Gemini Watchtower Forensic Suite: Core Context

## System Overview
The **Gemini Watchtower** is a high-performance forensic dashboard designed for **Autonomous CLI Agents**. It operates at the intersection of binary interception, local file interrogation, and AI-driven reasoning.

### Agent Identities
- **AGENT_OMEGA**: Primary system supervisor. 
- **JULES_MCP**: Deep reasoning core for complex architectural mapping and file-level interrogation.
- **Forensic_Officer**: Human-in-the-loop audit specialist.

### Operational Protocols
1. **RWX Independence**: The Gemini CLI must have Read, Write, and Execute rights on all local system nodes but must never depend on the Dashboard's availability to function.
2. **Binary Forensics**: Real-time monitoring of `/exec` binary streams to identify `auth_success` markers and session tokens.
3. **Subsystem Isolation**: WSL2, native Windows EXEs, and mobile APKs are managed via the `FileInterrogator` mind map.

## Data Flow
- **CLI -> Dashboard**: Hex-encoded binary logs and process statuses.
- **Dashboard -> AI**: Contextual prompts for forensic verdicts.
- **AI -> Dashboard**: Analysis reports, risk scores, and remediation commands.

## Evolutionary State
Currently at **v3.5.0**, implementing **ANA_GRAVITY_TRUST** for validated hit markers and **Jules-MCP Integration** for optimized memory allocation.
