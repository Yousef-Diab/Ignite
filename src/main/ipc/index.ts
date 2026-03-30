import { ipcMain, app, BrowserWindow, WebContents } from 'electron'
import { registerProfileHandlers } from './profiles'
import { registerSettingsHandlers } from './settings'
import { registerDialogHandlers } from './dialog'
import { registerResolutionHandlers } from './resolution'
import { registerLauncherHandlers } from './launcher'

export function registerAllHandlers(getWebContents: () => WebContents | null): void {
  registerProfileHandlers()
  registerSettingsHandlers()
  registerDialogHandlers()
  registerResolutionHandlers()
  registerLauncherHandlers(getWebContents)

  // Window controls
  ipcMain.handle('app:window-minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.handle('app:window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) win.unmaximize()
    else win?.maximize()
  })
  ipcMain.handle('app:window-close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
  ipcMain.handle('app:show-window', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.show()
  })
  ipcMain.handle('app:get-version', () => app.getVersion())
}
