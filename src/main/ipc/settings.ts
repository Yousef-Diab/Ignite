import { ipcMain, app } from 'electron'
import { getStore } from '../store'
import type { AppSettings } from '@shared/types'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', () => {
    return getStore().get('settings')
  })

  ipcMain.handle('settings:save', (_, settings: AppSettings) => {
    getStore().set('settings', settings)
    app.setLoginItemSettings({
      openAtLogin: settings.launchOnWindowsStartup,
      name: 'Ignite'
    })
  })
}
