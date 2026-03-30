import { useEffect, useState } from 'react'
import { Toggle } from '../components/ui/Toggle'
import { Select } from '../components/ui/Select'
import { useStore } from '../store'
import { ipc } from '../lib/ipc'
import type { AppSettings } from '@shared/types'

const defaultSettings: AppSettings = {
  launchOnWindowsStartup: false,
  minimizeToTrayOnClose: true,
  minimizeToTrayOnLaunch: false,
  showNotifications: true,
  defaultShell: 'powershell'
}

export function SettingsPage() {
  const { settings, setSettings } = useStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    ipc.settings.get().then((s) => {
      setSettings(s)
      setLoaded(true)
    })
  }, [setSettings])

  async function update(patch: Partial<AppSettings>): Promise<void> {
    const next = { ...(settings ?? defaultSettings), ...patch }
    setSettings(next)
    await ipc.settings.save(next)
  }

  const s = settings ?? defaultSettings

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2e2e42] flex-shrink-0">
        <h1 className="text-lg font-bold text-slate-100">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 max-w-2xl">
        <section className="flex flex-col gap-4 p-4 rounded-xl border border-[#2e2e42] bg-[#1a1a24]">
          <h2 className="text-sm font-semibold text-slate-300">Startup</h2>
          <Toggle
            checked={s.launchOnWindowsStartup}
            onChange={(v) => update({ launchOnWindowsStartup: v })}
            label="Launch Ignite when Windows starts"
            description="Ignite will start minimized to the system tray"
          />
        </section>

        <section className="flex flex-col gap-4 p-4 rounded-xl border border-[#2e2e42] bg-[#1a1a24]">
          <h2 className="text-sm font-semibold text-slate-300">Behavior</h2>
          <Toggle
            checked={s.minimizeToTrayOnClose}
            onChange={(v) => update({ minimizeToTrayOnClose: v })}
            label="Minimize to tray on close"
            description="Clicking X will hide the window instead of quitting"
          />
          <Toggle
            checked={s.minimizeToTrayOnLaunch}
            onChange={(v) => update({ minimizeToTrayOnLaunch: v })}
            label="Hide window when launching a profile"
            description="Automatically hides the Ignite window after launching a game"
          />
        </section>

        <section className="flex flex-col gap-4 p-4 rounded-xl border border-[#2e2e42] bg-[#1a1a24]">
          <h2 className="text-sm font-semibold text-slate-300">Notifications</h2>
          <Toggle
            checked={s.showNotifications}
            onChange={(v) => update({ showNotifications: v })}
            label="Show desktop notifications"
            description="Notify when a game launches or when cleanup is done"
          />
        </section>

        <section className="flex flex-col gap-4 p-4 rounded-xl border border-[#2e2e42] bg-[#1a1a24]">
          <h2 className="text-sm font-semibold text-slate-300">Defaults</h2>
          <Select
            label="Default Shell for Scripts"
            value={s.defaultShell}
            options={[
              { value: 'powershell', label: 'PowerShell' },
              { value: 'cmd', label: 'Command Prompt' }
            ]}
            onChange={(v) => update({ defaultShell: v as 'powershell' | 'cmd' })}
          />
        </section>
      </div>
    </div>
  )
}
