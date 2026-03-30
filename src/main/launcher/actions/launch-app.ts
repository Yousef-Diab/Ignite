import { spawn } from 'node:child_process'

export function launchApp(
  executablePath: string,
  args?: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const argList = args ? args.split(' ').filter(Boolean) : []
    const child = spawn(executablePath, argList, {
      detached: true,
      stdio: 'ignore',
      windowsHide: false
    })

    child.on('error', reject)

    child.on('spawn', () => {
      child.unref()
      resolve(child.pid!)
    })
  })
}

export function killProcess(pid: number): Promise<void> {
  return new Promise((resolve) => {
    const killer = spawn('taskkill', ['/PID', String(pid), '/F', '/T'], {
      windowsHide: true,
      stdio: 'ignore'
    })
    killer.on('close', () => resolve())
    killer.on('error', () => resolve()) // ignore errors if process already gone
  })
}
