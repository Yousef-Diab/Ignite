import { EventEmitter } from 'node:events'
import { spawn } from 'node:child_process'
import type { WebContents } from 'electron'
import type { Profile, Action, ActiveSession } from '@shared/types'
import { runWait } from './actions/wait'
import { runScript } from './actions/run-script'
import { launchApp, killProcess } from './actions/launch-app'
import { getCurrentResolution, setResolution, revertResolution } from './actions/set-resolution'
import { monitorProcess } from './monitor'

export class Launcher extends EventEmitter {
  private session: ActiveSession | null = null
  private abortController: AbortController | null = null

  getStatus(): ActiveSession | null {
    return this.session
  }

  async start(profile: Profile, webContents: WebContents): Promise<void> {
    if (this.session) throw new Error('A session is already active')

    this.abortController = new AbortController()
    const signal = this.abortController.signal
    let gameLaunched = false

    this.session = {
      profileId: profile.id,
      targetPid: null,
      phase: 'pre-launch',
      currentActionIndex: 0,
      totalActions: profile.actions.length,
      currentActionLabel: '',
      launchedAppPids: [],
      originalResolution: null
    }

    try {
      // Phase 1: Pre-launch actions (timing === 'before' only)
      this.emitPhase('pre-launch', webContents, profile.id)

      const beforeActions = profile.actions.filter((a) => a.timing === 'before')
      this.session.totalActions = beforeActions.length

      for (let i = 0; i < beforeActions.length; i++) {
        if (signal.aborted) throw new Error('Aborted')
        const action = beforeActions[i]
        const label = this.getActionLabel(action)
        this.session.currentActionIndex = i
        this.session.currentActionLabel = label

        webContents.send('session:action-progress', {
          index: i,
          total: beforeActions.length,
          actionLabel: label
        })
        this.emit('phase-changed', 'pre-launch')

        await this.runAction(action, signal)
      }

      if (signal.aborted) throw new Error('Aborted')

      // Phase 2: Launch target
      this.emitPhase('running', webContents, profile.id)

      const argList = profile.executableArgs ? profile.executableArgs.split(' ').filter(Boolean) : []
      const targetProcess = spawn(profile.executablePath, argList, {
        detached: true,
        stdio: 'ignore'
      })

      await new Promise<void>((resolve, reject) => {
        targetProcess.on('spawn', resolve)
        targetProcess.on('error', reject)
      })

      gameLaunched = true
      const targetPid = targetProcess.pid!
      targetProcess.unref()
      this.session.targetPid = targetPid

      // Phase 3: Monitor target process
      await monitorProcess(targetPid, profile.processName, signal)

      webContents.send('session:game-exited', { profileId: profile.id })

    } catch (err) {
      const msg = String(err)
      if (!msg.includes('Aborted')) {
        webContents.send('session:error', { message: msg })
      }
    } finally {
      // Phase 4: Cleanup (always runs)
      const session = this.session
      if (session) {
        this.emitPhase('cleanup', webContents, profile.id)
        await this.runCleanup(profile, session, gameLaunched, webContents)
      }

      this.session = null
      this.abortController = null
      this.emitPhase('idle', webContents, profile.id)
      webContents.send('session:cleanup-done', { profileId: profile.id })
    }
  }

  abort(): void {
    this.abortController?.abort()
  }

  private async runAction(action: Action, signal: AbortSignal): Promise<void> {
    switch (action.type) {
      case 'wait':
        await runWait(action.duration, signal)
        break

      case 'run_script':
        await runScript(action.command, action.shell, action.workingDirectory, signal)
        break

      case 'launch_app': {
        const pid = await launchApp(action.executablePath, action.args)
        if (action.closeOnGameExit && this.session) {
          this.session.launchedAppPids.push(pid)
        }
        break
      }

      case 'set_resolution':
        if (action.timing === 'before' && action.revertOnGameExit && this.session && !this.session.originalResolution) {
          this.session.originalResolution = await getCurrentResolution()
        }
        await setResolution(action.width, action.height, action.refreshRate)
        break
    }
  }

  private async runCleanup(
    profile: Profile,
    session: ActiveSession,
    gameLaunched: boolean,
    webContents: WebContents
  ): Promise<void> {
    // Kill apps that should close on game exit (in reverse order)
    const pidsToKill = [...session.launchedAppPids].reverse()
    for (const pid of pidsToKill) {
      await killProcess(pid)
    }

    // The rest of cleanup only applies if the game actually launched
    if (!gameLaunched) return

    // Run after-game actions in order
    const afterActions = profile.actions.filter((a) => a.timing === 'after')
    for (const action of afterActions) {
      try {
        await this.runAction(action, new AbortController().signal)
      } catch (err) {
        webContents.send('session:error', { message: `After-game action failed: ${err}` })
      }
    }

    // Revert settings in reverse action order
    for (const action of [...profile.actions].reverse()) {
      if (action.type === 'set_resolution' && action.revertOnGameExit && session.originalResolution) {
        try {
          if (action.revertDelay > 0) {
            await new Promise<void>((resolve) => setTimeout(resolve, action.revertDelay))
          }
          await revertResolution(session.originalResolution)
        } catch (err) {
          webContents.send('session:error', { message: `Failed to revert resolution: ${err}` })
        }
        // Only revert once (originalResolution tracks first capture)
        break
      }
    }

    // Run on-close scripts
    for (const action of profile.actions) {
      if (action.type === 'run_script' && action.onCloseCommand) {
        try {
          await runScript(action.onCloseCommand, action.shell, action.workingDirectory)
        } catch (err) {
          webContents.send('session:error', { message: `On-close script failed: ${err}` })
        }
      }
    }
  }

  private emitPhase(
    phase: ActiveSession['phase'],
    webContents: WebContents,
    profileId: string
  ): void {
    if (this.session) this.session.phase = phase
    webContents.send('session:phase-changed', { phase, profileId })
    this.emit('phase-changed', phase)
  }

  private getActionLabel(action: Action): string {
    if (action.label) return action.label
    switch (action.type) {
      case 'launch_app': return `Launch ${action.executablePath.split('\\').pop()}`
      case 'set_resolution': return `Set ${action.width}×${action.height} @ ${action.refreshRate}Hz`
      case 'run_script': return `Run script`
      case 'wait': return `Wait ${action.duration}ms`
    }
  }
}
