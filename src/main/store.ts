import type { StoreSchema, AppSettings } from '@shared/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _store: any

export async function initStore(): Promise<void> {
  const { default: Store } = await import('electron-store')
  const defaults: StoreSchema = {
    profiles: [],
    settings: {
      launchOnWindowsStartup: false,
      minimizeToTrayOnClose: true,
      minimizeToTrayOnLaunch: false,
      showNotifications: true,
      defaultShell: 'powershell'
    }
  }
  _store = new Store<StoreSchema>({ defaults })
}

export function getStore() {
  if (!_store) throw new Error('Store not initialized')
  return _store as {
    get<K extends keyof StoreSchema>(key: K): StoreSchema[K]
    set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void
  }
}

export function getSettings(): AppSettings {
  return getStore().get('settings')
}
