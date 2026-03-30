import { Outlet } from 'react-router-dom'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { useStore } from '../../store'
import { useEffect } from 'react'

export function Layout() {
  const { updateSession } = useStore()

  useEffect(() => {
    const off1 = window.ignite.on('session:phase-changed', (data: unknown) => {
      const { phase, profileId } = data as { phase: string; profileId: string }
      updateSession({ phase: phase as 'pre-launch' | 'running' | 'cleanup' | 'idle', profileId })
    })
    const off2 = window.ignite.on('session:action-progress', (data: unknown) => {
      const d = data as { index: number; total: number; actionLabel: string }
      updateSession({ currentActionIndex: d.index, totalActions: d.total, currentActionLabel: d.actionLabel })
    })
    const off3 = window.ignite.on('session:cleanup-done', () => {
      updateSession(null)
    })
    const off4 = window.ignite.on('session:error', (data: unknown) => {
      const { message } = data as { message: string }
      console.error('[Ignite session error]', message)
    })

    return () => { off1(); off2(); off3(); off4() }
  }, [updateSession])

  const session = useStore((s) => s.session)

  return (
    <div className="flex flex-col h-screen bg-[#0f0f13] text-slate-200 overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
          {session && session.phase !== 'idle' && (
            <div className="flex-shrink-0 px-4 py-2 bg-[#1a1a24] border-t border-[#2e2e42] flex items-center gap-3">
              <span className="size-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-xs text-slate-400">
                {session.phase === 'pre-launch' && `Running action ${session.currentActionIndex + 1}/${session.totalActions}: ${session.currentActionLabel}`}
                {session.phase === 'running' && 'Game is running...'}
                {session.phase === 'cleanup' && 'Cleaning up...'}
              </span>
              <button
                onClick={() => window.ignite.invoke('launcher:abort')}
                className="ml-auto text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Abort
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
