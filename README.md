<div align="center">

# 🔥 Ignite

### Automate everything that happens before (and after) your game launches.

Ignite is a **Windows desktop app** that lets you build profiles for your games — each profile runs a fully configurable sequence of actions before the game opens, monitors the process while it's running, then automatically cleans up when it exits.

[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-blue?logo=windows&logoColor=white)](https://github.com/yousef-diab/ignite/releases)
[![Electron](https://img.shields.io/badge/Electron-35-47848F?logo=electron&logoColor=white)](https://electronjs.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Release](https://img.shields.io/github/v/release/yousef-diab/ignite?color=violet)](https://github.com/yousef-diab/ignite/releases)

[**Download**](https://github.com/yousef-diab/ignite/releases) · [**Report a Bug**](https://github.com/yousef-diab/ignite/issues)

</div>

---

## ✨ Features

- 🎮 **Profile-based** — one profile per game, each with its own action sequence and executable
- ⏱️ **Before & after actions** — each action can run before the game opens or after it closes
- 🛠️ **4 action types** — launch an app, set display resolution, run a script, or wait
- 🖥️ **Resolution management** — change resolution before launch, revert on exit with a configurable delay
- 🔍 **Smart process monitoring** — monitor by PID or by process name, with a startup grace period (perfect for games like Valorant that spawn child processes)
- 🗂️ **System tray** — quick-launch profiles, abort a running session, and see live status without opening the window
- 🖱️ **Drag-and-drop** — reorder actions freely in the profile editor
- ⚙️ **Persistent settings** — startup with Windows, minimize to tray, auto-hide on launch, shell preference

---

## 🚀 How It Works

### Profiles

Each profile holds:
- The game's **executable path** and optional launch arguments
- An optional **process name override** — use this when the launched exe is a launcher that spawns the real game process (e.g. set process name to `VALORANT-Win64-Shipping`)
- An ordered list of **pre/post-launch actions**

### Execution Flow

```
🔧  Pre-launch actions  (timing: before)
            ↓
🎮  Game launches
            ↓
👁️  Ignite monitors the process until it exits
            ↓
🔧  Post-exit actions  (timing: after)
            ↓
🧹  Cleanup: close tracked apps · revert resolution · run on-close scripts
```

> ⚠️ Cleanup only runs if the game actually opened. If Ignite is aborted or an action fails before launch, resolution and other state are left as-is.

---

## 🛠️ Action Types

| Action | Description |
|---|---|
| 🚀 **Launch App** | Launch an executable before the game. Optionally close it automatically when the game exits. |
| 🖥️ **Set Resolution** | Change the display resolution. When set to *before*, can revert to the original on game exit — with an optional delay. |
| 📜 **Run Script** | Run a PowerShell or Command Prompt command. *Before* actions can also define an on-close command. |
| ⏳ **Wait** | Pause the sequence for a configurable duration (0.5 s – 30 s). |

Each action has a **`before` / `after`** toggle that controls when it runs relative to the game.

---

## 🗂️ System Tray

Right-clicking the tray icon shows all your profiles as one-click launch items.

While a session is active:

- 🔒 Profile items are **disabled** to prevent double-launching
- ● The **running profile** is marked in the list
- 📊 The status line shows live phase info: `Preparing · Set 1920×1080 (1/3)` → `Running · Valorant` → `Wrapping up · Valorant`
- ⛔ An **Abort** item appears to cancel the session at any time
- 💬 The tray tooltip updates to `Ignite · [profile name]`

---

## 📸 Screenshots

> _Screenshots coming soon._

---

## 📥 Installation

1. Download **Ignite Setup.exe** from the [Releases](https://github.com/yousef-diab/ignite/releases) page
2. Run the installer — you can choose the install directory
3. Ignite creates Start Menu and Desktop shortcuts automatically

**Requirements:** Windows 10/11 x64

---

## 🧱 Building from Source

```bash
# Install dependencies
npm install

# Start in development mode (hot-reload)
npm run dev

# Build for production
npm run build

# Package without installer (for quick testing)
npm run pack

# Build + create NSIS installer
npm run dist
```

> **Requirements:** Node.js 18+, Windows — the app uses Windows-only APIs for display management and process monitoring.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Desktop shell | Electron 35 |
| 🎨 UI | React 19, TailwindCSS, Zustand |
| ⚡ Build | electron-vite, electron-builder |
| 💾 Persistence | electron-store |
| 🔧 Display & process | PowerShell + Win32 P/Invoke via C# `Add-Type` |

---

## 📄 License

MIT © [Yousef Diab](https://github.com/yousef-diab)
