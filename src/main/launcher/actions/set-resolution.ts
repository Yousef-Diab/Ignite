import { getCurrentResolution, setResolution } from '../../powershell/display'
import type { Resolution } from '@shared/types'

export { getCurrentResolution, setResolution }

export async function revertResolution(original: Resolution): Promise<void> {
  await setResolution(original.width, original.height, original.refreshRate)
}
