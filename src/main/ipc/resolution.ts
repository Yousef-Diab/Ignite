import { ipcMain } from 'electron'
import { getCurrentResolution, setResolution, listDisplayModes } from '../powershell/display'
import type { Resolution } from '@shared/types'

export function registerResolutionHandlers(): void {
  ipcMain.handle('resolution:get-current', async (): Promise<Resolution> => {
    return getCurrentResolution()
  })

  ipcMain.handle('resolution:list-modes', async (): Promise<Resolution[]> => {
    return listDisplayModes()
  })

  ipcMain.handle('resolution:set', async (_, res: Resolution): Promise<{ ok: boolean; error?: string }> => {
    try {
      await setResolution(res.width, res.height, res.refreshRate)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })
}
