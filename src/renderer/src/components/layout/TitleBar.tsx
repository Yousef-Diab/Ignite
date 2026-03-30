import { Minus, Square, X, Flame } from 'lucide-react'
import { ipc } from '../../lib/ipc'

export function TitleBar() {
  return (
    <div
      className="flex items-center justify-between h-10 px-4 bg-[#0f0f13] border-b border-[#2e2e42] select-none flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <Flame className="size-4 text-violet-500" />
        <span className="text-sm font-bold text-slate-200 tracking-wider">IGNITE</span>
      </div>

      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => ipc.window.minimize()}
          className="flex items-center justify-center size-7 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Minus className="size-3.5" />
        </button>
        <button
          onClick={() => ipc.window.maximize()}
          className="flex items-center justify-center size-7 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Square className="size-3" />
        </button>
        <button
          onClick={() => ipc.window.close()}
          className="flex items-center justify-center size-7 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
