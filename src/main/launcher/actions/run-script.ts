import { spawn } from 'node:child_process'

export function runScript(
  command: string,
  shell: 'powershell' | 'cmd',
  workingDirectory?: string,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const [exe, args] =
      shell === 'powershell'
        ? ['powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-Command', command]]
        : ['cmd.exe', ['/c', command]]

    const child = spawn(exe, args, {
      windowsHide: true,
      cwd: workingDirectory
    })

    child.on('close', (code) => {
      if (code === 0 || code === null) resolve()
      else reject(new Error(`Script exited with code ${code}`))
    })

    child.on('error', reject)

    signal?.addEventListener('abort', () => {
      child.kill('SIGKILL')
      reject(new Error('Aborted'))
    }, { once: true })
  })
}
