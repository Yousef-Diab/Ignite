import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import type { RunScriptAction } from '@shared/types'

interface Props {
  action: RunScriptAction
  onChange: (action: RunScriptAction) => void
}

const shellOptions = [
  { value: 'powershell', label: 'PowerShell' },
  { value: 'cmd', label: 'Command Prompt' }
]

export function RunScriptActionEditor({ action, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Shell"
        value={action.shell}
        options={shellOptions}
        onChange={(v) => onChange({ ...action, shell: v as 'powershell' | 'cmd' })}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Command
        </label>
        <textarea
          value={action.command}
          onChange={(e) => onChange({ ...action, command: e.target.value })}
          placeholder="Start-Process 'C:\app.exe' -ArgumentList '--flag'"
          rows={3}
          className="w-full rounded-lg border border-[#2e2e42] bg-[#0f0f13] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 font-mono resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
        />
      </div>
      {action.timing === 'before' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            On-close command (optional)
          </label>
          <textarea
            value={action.onCloseCommand ?? ''}
            onChange={(e) => onChange({ ...action, onCloseCommand: e.target.value || undefined })}
            placeholder="Run when game closes..."
            rows={2}
            className="w-full rounded-lg border border-[#2e2e42] bg-[#0f0f13] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 font-mono resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
          />
        </div>
      )}
      <Input
        label="Working Directory (optional)"
        value={action.workingDirectory ?? ''}
        onChange={(e) => onChange({ ...action, workingDirectory: e.target.value || undefined })}
        placeholder="C:\path\to\dir"
      />
    </div>
  )
}
