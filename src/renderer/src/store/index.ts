import { create } from 'zustand'
import type { Profile, AppSettings, ActiveSession } from '@shared/types'

interface AppStore {
  profiles: Profile[]
  settings: AppSettings | null
  session: ActiveSession | null

  setProfiles: (profiles: Profile[]) => void
  upsertProfile: (profile: Profile) => void
  removeProfile: (id: string) => void
  setSettings: (settings: AppSettings) => void
  updateSession: (patch: Partial<ActiveSession> | null) => void
}

const defaultSession: ActiveSession = {
  profileId: '',
  targetPid: null,
  phase: 'idle',
  currentActionIndex: 0,
  totalActions: 0,
  currentActionLabel: '',
  launchedAppPids: [],
  originalResolution: null
}

export const useStore = create<AppStore>((set) => ({
  profiles: [],
  settings: null,
  session: null,

  setProfiles: (profiles) => set({ profiles }),

  upsertProfile: (profile) =>
    set((s) => ({
      profiles: s.profiles.find((p) => p.id === profile.id)
        ? s.profiles.map((p) => (p.id === profile.id ? profile : p))
        : [...s.profiles, profile]
    })),

  removeProfile: (id) =>
    set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) })),

  setSettings: (settings) => set({ settings }),

  updateSession: (patch) =>
    set((s) => ({
      session:
        patch === null
          ? null
          : { ...(s.session ?? defaultSession), ...patch }
    }))
}))
