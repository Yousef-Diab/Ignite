import { app, BrowserWindow, WebContents } from 'electron'
import { join } from 'path'
import { initStore, getSettings } from './store'
import { registerAllHandlers } from './ipc'
import { launcher } from './ipc/launcher'
import { createTray } from './tray'

const appEx = app as typeof app & { isQuitting: boolean }
appEx.isQuitting = false

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0f0f13',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    if (!appEx.isQuitting && getSettings().minimizeToTrayOnClose) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function main(): Promise<void> {
  await initStore()

  await app.whenReady()

  createWindow()

  registerAllHandlers((): WebContents | null => mainWindow?.webContents ?? null)

  if (mainWindow) {
    createTray(mainWindow, launcher, () => mainWindow?.webContents ?? null)
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })

  app.on('before-quit', () => {
    appEx.isQuitting = true
  })
}

main().catch(console.error)
