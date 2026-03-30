# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (hot-reload for all 3 processes)
npm run build    # Build all processes for production
npm run dist     # Build + create distributable installer (electron-builder)
npm run pack     # Build + package without installer (faster testing)
```

There are no tests or lint scripts configured.

## Architecture

Ignite is a **Windows-only** Electron app (3-process model) for automating pre-launch tasks before starting a game.

### Process structure

| Process | Entry | Bundler context |
|---|---|---|
| Main | `src/main/index.ts` | Node.js — can use all Node APIs |
| Preload | `src/preload/index.ts` | Sandboxed bridge only |
| Renderer | `src/renderer/src/main.tsx` | Browser — no Node APIs |

The preload exposes a single `window.ignite` object: `{ invoke, on, removeAllListeners }`. All renderer↔main communication goes through this bridge.

### Shared types

`src/shared/types.ts` defines every cross-process type: `Profile`, `Action` (union of `LaunchAppAction | SetResolutionAction | RunScriptAction | WaitAction`), `AppSettings`, `Resolution`, `ActiveSession`, `StoreSchema`. Import with `@shared/types` from both main and renderer.

### IPC layer

- **Main side**: `src/main/ipc/` — one file per domain (`profiles`, `settings`, `dialog`, `resolution`, `launcher`). All registered in `src/main/ipc/index.ts`.
- **Renderer side**: `src/renderer/src/lib/ipc.ts` — typed wrappers around `window.ignite.invoke()`. Every IPC call goes through this object; do not call `window.ignite` directly.
- **Push events** (main → renderer, no reply): `session:phase-changed`, `session:action-progress`, `session:game-exited`, `session:error`, `session:cleanup-done`.

### Persistence

`electron-store` wraps a JSON file on disk. The store is **dynamically imported** in `src/main/store.ts` (avoids ESM/CJS issues at build time). Schema is `StoreSchema` from shared types. Never use electron-store in the renderer.

### Launcher engine

`src/main/launcher/` — `Launcher` class (EventEmitter) runs as a long-lived singleton in `src/main/ipc/launcher.ts`. Sequence:

1. **Pre-launch**: runs `profile.actions` in order (wait, run_script, launch_app, set_resolution)
2. **Running**: spawns `profile.executablePath` detached; gets PID
3. **Monitor**: `monitorProcess()` in `monitor.ts` — if `profile.processName` is set, polls by name every 1.5s; otherwise blocks on `WaitForExit(pid)`. Resolves when the monitored process exits.
4. **Cleanup**: kills `closeOnGameExit` apps, reverts resolution if `revertOnGameExit` was set, runs `onCloseCommand` scripts.

The launcher runs async (not awaited from IPC handler) and pushes session events to the renderer via `WebContents.send`.

### Display / PowerShell

`src/main/powershell/display.ts` implements all Win32 display operations. Key design decisions:
- All PowerShell scripts are run with `-EncodedCommand` (UTF-16LE base64 via `Buffer.from(script, 'utf16le').toString('base64')`) to avoid shell-escaping issues.
- A C# `Add-Type` block defines `WinDisplay` static class with `[StructLayout(CharSet=CharSet.Auto)]` on the DEVMODE struct **and** `[DllImport(CharSet=CharSet.Auto)]` on both P/Invoke declarations. Both **must** use the same `CharSet` — mismatching them causes `EnumDisplaySettingsA` to be called with a Unicode-sized struct, placing `dmPelsWidth` at the wrong offset and reading zero.

### Path aliases

| Alias | Resolves to | Where it works |
|---|---|---|
| `@shared/*` | `src/shared/*` | Main, renderer (Vite + TS) |
| `@renderer/*` | `src/renderer/src/*` | **TypeScript only** — not a Vite alias; importing it at runtime causes a bundle error |

Do not add `@renderer` as a Vite alias. Use relative imports within the renderer.

### JSX transform

`tsconfig.web.json` sets `"jsx": "react-jsx"` to override the base `@electron-toolkit/tsconfig` which uses `"preserve"` (classic transform). `electron-vite.config.ts` uses `react({ jsxRuntime: 'automatic' })`. These two settings must stay in sync — changing one without the other causes `React is not defined` errors.

### Renderer state

Zustand store at `src/renderer/src/store/index.ts` holds `profiles`, `settings`, and `session` (the live `ActiveSession | null`). Components call `useStore()` to read and update state. Initial data is loaded via IPC on app start.
