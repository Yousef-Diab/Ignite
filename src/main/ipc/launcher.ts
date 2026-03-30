import { ipcMain, WebContents } from 'electron'
import { Launcher } from '../launcher'
import { getStore } from '../store'
import type { Profile } from '@shared/types'

const launcher = new Launcher()

export function registerLauncherHandlers(getWebContents: () => WebContents | null): void {
  ipcMain.handle('launcher:start', async (_, profileId: string) => {
    const profiles = getStore().get('profiles')
    const profile: Profile | undefined = profiles.find((p: Profile) => p.id === profileId)
    if (!profile) return { ok: false, error: 'Profile not found' }

    const wc = getWebContents()
    if (!wc) return { ok: false, error: 'No renderer window' }

    // Don't await — let it run async, push events to renderer
    launcher.start(profile, wc).catch((err: unknown) => {
      wc.send('session:error', { message: String(err) })
    })

    return { ok: true }
  })

  ipcMain.handle('launcher:abort', () => {
    launcher.abort()
  })

  ipcMain.handle('launcher:status', () => {
    return launcher.getStatus()
  })
}

export { launcher }
