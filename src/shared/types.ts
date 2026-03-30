export type ActionType = 'launch_app' | 'set_resolution' | 'run_script' | 'wait'

export interface LaunchAppAction {
  id: string
  type: 'launch_app'
  timing: 'before' | 'after'
  label?: string
  executablePath: string
  args?: string
  closeOnGameExit: boolean
}

export interface SetResolutionAction {
  id: string
  type: 'set_resolution'
  timing: 'before' | 'after'
  label?: string
  width: number
  height: number
  refreshRate: number
  revertOnGameExit: boolean
  revertDelay: number
}

export interface RunScriptAction {
  id: string
  type: 'run_script'
  timing: 'before' | 'after'
  label?: string
  command: string
  onCloseCommand?: string
  workingDirectory?: string
  shell: 'powershell' | 'cmd'
}

export interface WaitAction {
  id: string
  type: 'wait'
  timing: 'before' | 'after'
  label?: string
  duration: number
}

export type Action = LaunchAppAction | SetResolutionAction | RunScriptAction | WaitAction

export interface Profile {
  id: string
  name: string
  coverImagePath?: string
  executablePath: string
  executableArgs?: string
  processName?: string
  actions: Action[]
  createdAt: number
  updatedAt: number
}

export interface AppSettings {
  launchOnWindowsStartup: boolean
  minimizeToTrayOnClose: boolean
  minimizeToTrayOnLaunch: boolean
  showNotifications: boolean
  defaultShell: 'powershell' | 'cmd'
}

export interface Resolution {
  width: number
  height: number
  refreshRate: number
}

export interface ActiveSession {
  profileId: string
  targetPid: number | null
  phase: 'pre-launch' | 'running' | 'cleanup' | 'idle'
  currentActionIndex: number
  totalActions: number
  currentActionLabel: string
  launchedAppPids: number[]
  originalResolution: Resolution | null
}

export interface StoreSchema {
  profiles: Profile[]
  settings: AppSettings
}
