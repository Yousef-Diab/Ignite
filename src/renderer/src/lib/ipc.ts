import type { Profile, AppSettings, Resolution, ActiveSession } from '@shared/types'

declare global {
  interface Window {
    ignite: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
      on: (channel: string, listener: (...args: unknown[]) => void) => () => void
      removeAllListeners: (channel: string) => void
    }
  }
}

export const ipc = {
  profiles: {
    list: () => window.ignite.invoke('profiles:list') as Promise<Profile[]>,
    save: (p: Profile) => window.ignite.invoke('profiles:save', p) as Promise<void>,
    delete: (id: string) => window.ignite.invoke('profiles:delete', id) as Promise<void>
  },
  launcher: {
    start: (id: string) =>
      window.ignite.invoke('launcher:start', id) as Promise<{ ok: boolean; error?: string }>,
    abort: () => window.ignite.invoke('launcher:abort') as Promise<void>,
    status: () => window.ignite.invoke('launcher:status') as Promise<ActiveSession | null>
  },
  resolution: {
    getCurrent: () => window.ignite.invoke('resolution:get-current') as Promise<Resolution>,
    listModes: () => window.ignite.invoke('resolution:list-modes') as Promise<Resolution[]>
  },
  settings: {
    get: () => window.ignite.invoke('settings:get') as Promise<AppSettings>,
    save: (s: AppSettings) => window.ignite.invoke('settings:save', s) as Promise<void>
  },
  dialog: {
    pickExe: () => window.ignite.invoke('dialog:pick-exe') as Promise<string | null>,
    pickImage: () => window.ignite.invoke('dialog:pick-image') as Promise<string | null>
  },
  window: {
    minimize: () => window.ignite.invoke('app:window-minimize'),
    maximize: () => window.ignite.invoke('app:window-maximize'),
    close: () => window.ignite.invoke('app:window-close')
  },
  events: {
    on: window.ignite?.on ?? (() => () => {})
  }
}
