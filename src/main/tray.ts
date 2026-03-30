import { app, Tray, Menu, nativeImage, BrowserWindow, WebContents } from 'electron'
import { join } from 'path'
import { getStore } from './store'
import type { Launcher } from './launcher'
import type { Profile } from '@shared/types'

let tray: Tray | null = null
let _mainWindow: BrowserWindow | null = null
let _launcher: Launcher | null = null
let _getWebContents: (() => WebContents | null) | null = null

export function createTray(
  mainWindow: BrowserWindow,
  launcher: Launcher,
  getWebContents: () => WebContents | null
): void {
  _mainWindow = mainWindow
  _launcher = launcher
  _getWebContents = getWebContents

  let icon = nativeImage.createEmpty()
  try {
    icon = nativeImage.createFromPath(join(__dirname, '../../resources/tray-icon.ico'))
  } catch {
    // fallback to empty icon if resource missing
  }

  tray = new Tray(icon)
  tray.setToolTip('Ignite')
  buildMenu()

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  launcher.on('phase-changed', () => buildMenu())
}

export function rebuildTrayMenu(): void {
  buildMenu()
}

function buildMenu(): void {
  if (!tray || !_mainWindow || !_launcher || !_getWebContents) return

  const profiles: Profile[] = getStore().get('profiles')
  const session = _launcher.getStatus()
  const isRunning = session !== null
  const runningProfile = isRunning
    ? profiles.find((p) => p.id === session!.profileId) ?? null
    : null

  // Tooltip reflects active session
  tray.setToolTip(runningProfile ? `Ignite  ·  ${runningProfile.name}` : 'Ignite')

  // Profile list — mark the running one, disable all when a session is active
  const profileItems: Electron.MenuItemConstructorOptions[] = profiles.length > 0
    ? profiles.map((p) => {
        const isCurrent = runningProfile?.id === p.id
        return {
          label: isCurrent ? `● ${p.name}` : p.name,
          enabled: !isRunning,
          click: () => {
            const wc = _getWebContents!()
            if (!wc || !_launcher) return
            _launcher.start(p, wc).catch((err: unknown) => {
              wc.send('session:error', { message: String(err) })
            })
          }
        }
      })
    : [{ label: 'No profiles configured', enabled: false }]

  // Phase-aware status line
  let statusLabel: string
  if (session) {
    const name = runningProfile?.name ?? 'Unknown'
    switch (session.phase) {
      case 'pre-launch':
        statusLabel = session.totalActions > 0
          ? `Preparing  ·  ${session.currentActionLabel}  (${session.currentActionIndex + 1}/${session.totalActions})`
          : `Preparing  ·  ${name}`
        break
      case 'running':
        statusLabel = `Running  ·  ${name}`
        break
      case 'cleanup':
        statusLabel = `Wrapping up  ·  ${name}`
        break
      default:
        statusLabel = `Active  ·  ${name}`
    }
  } else {
    statusLabel = 'No active session'
  }

  const menu = Menu.buildFromTemplate([
    { label: 'Ignite', enabled: false },
    { type: 'separator' },
    ...profileItems,
    { type: 'separator' },
    { label: statusLabel, enabled: false },
    ...(isRunning
      ? [{ label: 'Abort', click: () => _launcher?.abort() } as Electron.MenuItemConstructorOptions]
      : []
    ),
    { type: 'separator' },
    {
      label: 'Open Ignite',
      click: () => {
        _mainWindow!.show()
        _mainWindow!.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        ;(app as typeof app & { isQuitting: boolean }).isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(menu)
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
