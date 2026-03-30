import { FolderOpen } from 'lucide-react'
import { Input } from '../ui/Input'
import { Toggle } from '../ui/Toggle'
import { ipc } from '../../lib/ipc'
import type { LaunchAppAction } from '@shared/types'

interface Props {
  action: LaunchAppAction
  onChange: (action: LaunchAppAction) => void
}

export function LaunchAppActionEditor({ action, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Executable Path"
        value={action.executablePath}
        onChange={(e) => onChange({ ...action, executablePath: e.target.value })}
        placeholder="C:\Program Files\App\app.exe"
        suffix={
          <button
            onClick={async () => {
              const path = await ipc.dialog.pickExe()
              if (path) onChange({ ...action, executablePath: path })
            }}
            className="hover:text-slate-200 transition-colors"
          >
            <FolderOpen className="size-4" />
          </button>
        }
      />
      <Input
        label="Arguments (optional)"
        value={action.args ?? ''}
        onChange={(e) => onChange({ ...action, args: e.target.value })}
        placeholder="--launch-arg value"
      />
      <Input
        label="Action Label (optional)"
        value={action.label ?? ''}
        onChange={(e) => onChange({ ...action, label: e.target.value })}
        placeholder="e.g. Open Streamlabs"
      />
      {action.timing === 'before' && (
        <Toggle
          checked={action.closeOnGameExit}
          onChange={(v) => onChange({ ...action, closeOnGameExit: v })}
          label="Close when game exits"
          description="Automatically terminate this app when the game closes"
        />
      )}
    </div>
  )
}
