export function runWait(duration: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, duration)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Aborted'))
    }, { once: true })
  })
}
