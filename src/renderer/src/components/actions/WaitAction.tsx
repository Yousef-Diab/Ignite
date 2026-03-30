import type { WaitAction } from '@shared/types'

interface Props {
  action: WaitAction
  onChange: (action: WaitAction) => void
}

export function WaitActionEditor({ action, onChange }: Props) {
  const seconds = (action.duration / 1000).toFixed(1)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Duration
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={500}
            max={30000}
            step={500}
            value={action.duration}
            onChange={(e) => onChange({ ...action, duration: Number(e.target.value) })}
            className="flex-1 accent-violet-500"
          />
          <span className="text-sm font-mono text-slate-200 w-16 text-right">
            {seconds}s
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Wait {seconds} seconds before running the next action.
      </p>
    </div>
  )
}
