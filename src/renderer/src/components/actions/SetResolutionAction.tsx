import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { ipc } from '../../lib/ipc'
import type { SetResolutionAction, Resolution } from '@shared/types'

interface Props {
  action: SetResolutionAction
  onChange: (action: SetResolutionAction) => void
}

export function SetResolutionActionEditor({ action, onChange }: Props) {
  const [modes, setModes] = useState<Resolution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ipc.resolution.listModes().then((m) => {
      setModes(m)
      setLoading(false)
    }).catch((err) => {
      console.error('[resolution:list-modes]', err)
      setLoading(false)
    })
  }, [])

  const value =
    action.width && action.height && action.refreshRate
      ? `${action.width}x${action.height}@${action.refreshRate}`
      : ''

  const options = modes.map((m) => ({
    value: `${m.width}x${m.height}@${m.refreshRate}`,
    label: `${m.width}×${m.height} @ ${m.refreshRate}Hz`
  }))

  function handleSelect(val: string): void {
    const [wh, hz] = val.split('@')
    const [w, h] = wh.split('x').map(Number)
    onChange({ ...action, width: w, height: h, refreshRate: Number(hz) })
  }

  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Loading display modes...
        </div>
      ) : (
        <Select
          label="Resolution"
          value={value}
          options={options}
          onChange={handleSelect}
          placeholder="Select a resolution..."
        />
      )}
      {action.timing === 'before' && (
        <Toggle
          checked={action.revertOnGameExit}
          onChange={(v) => onChange({ ...action, revertOnGameExit: v })}
          label="Revert when game exits"
          description="Restore the previous resolution after the game closes"
        />
      )}
      {action.timing === 'before' && action.revertOnGameExit && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Revert delay
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={30000}
              step={500}
              value={action.revertDelay}
              onChange={(e) => onChange({ ...action, revertDelay: Number(e.target.value) })}
              className="flex-1 accent-violet-500"
            />
            <span className="text-sm font-mono text-slate-200 w-16 text-right">
              {action.revertDelay === 0 ? 'instant' : `${(action.revertDelay / 1000).toFixed(1)}s`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
