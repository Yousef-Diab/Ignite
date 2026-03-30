import { spawn } from 'node:child_process'

export function monitorProcess(
  pid: number,
  processName: string | undefined,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = processName
      ? // Monitor by name — wait for process to appear, then wait for it to exit
        `
$name = '${processName.replace('.exe', '')}'
while ($true) {
  $p = Get-Process -Name $name -ErrorAction SilentlyContinue
  if ($p) { break }
  Start-Sleep -Milliseconds 1500
}
while ($true) {
  $p = Get-Process -Name $name -ErrorAction SilentlyContinue
  if (-not $p) { exit 0 }
  Start-Sleep -Milliseconds 1500
}
`
      : // Monitor by PID — blocking WaitForExit (most efficient)
        `
try {
  $p = [System.Diagnostics.Process]::GetProcessById(${pid})
  $p.WaitForExit()
} catch { }
exit 0
`

    const ps = spawn(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true }
    )

    ps.on('close', () => resolve())
    ps.on('error', reject)

    signal.addEventListener(
      'abort',
      () => {
        try { ps.kill() } catch { /* already dead */ }
        resolve()
      },
      { once: true }
    )
  })
}
