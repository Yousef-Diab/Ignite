import { ipcMain } from 'electron'
import { nanoid } from 'nanoid'
import { getStore } from '../store'
import { rebuildTrayMenu } from '../tray'
import type { Profile } from '@shared/types'

export function registerProfileHandlers(): void {
  ipcMain.handle('profiles:list', () => {
    return getStore().get('profiles')
  })

  ipcMain.handle('profiles:get', (_, id: string) => {
    const profiles = getStore().get('profiles')
    return profiles.find((p: Profile) => p.id === id) ?? null
  })

  ipcMain.handle('profiles:save', (_, profile: Profile) => {
    const profiles = getStore().get('profiles')
    const now = Date.now()
    const existing = profiles.findIndex((p: Profile) => p.id === profile.id)
    if (existing >= 0) {
      profiles[existing] = { ...profile, updatedAt: now }
    } else {
      profiles.push({ ...profile, id: profile.id || nanoid(), createdAt: now, updatedAt: now })
    }
    getStore().set('profiles', profiles)
    rebuildTrayMenu()
  })

  ipcMain.handle('profiles:delete', (_, id: string) => {
    const profiles = getStore().get('profiles')
    getStore().set('profiles', profiles.filter((p: Profile) => p.id !== id))
    rebuildTrayMenu()
  })
}
