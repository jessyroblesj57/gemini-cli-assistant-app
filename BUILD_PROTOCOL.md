
# Build & Compilation Protocol: Target Windows/Linux/Unix

To transform this React-based suite into a native binary with RWX permissions, follow these compiler recommendations:

## Recommended Compilers

### 1. Tauri (Recommended for Performance)
- **Target**: Windows (.exe), Linux (.AppImage), macOS (.dmg)
- **Benefit**: Rust-based backend, smallest binary size, native permission hooks.
- **Command**: `npx tauri build`

### 2. Electron-Builder (Highest Compatibility)
- **Target**: Universal
- **Benefit**: Best for deep system integration and complex Node.js native modules.
- **Command**: `npx electron-builder --win --linux`

### 3. Vercel PKG (CLI Tooling)
- **Target**: Single binary executable for Node.js scripts.
- **Command**: `pkg . --targets node18-win-x64,node18-linux-x64`

## Windows Integration Steps
1. Install **Node.js 18+**.
2. Run `npm install`.
3. Configure `gemini_cli_bridge.json` in your user home directory.
4. Execute `npm run build:win` (configured for Tauri/Electron).

## Unix/Linux Deployment
1. Ensure `libwebkit2gtk` is installed for UI rendering.
2. Use `chmod +x [binary_name]` to grant execution rights.
3. Integrate with `systemd` for autonomous watchtower monitoring.
