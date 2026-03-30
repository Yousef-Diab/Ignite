import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FolderOpen, Save, Info } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ActionList } from '../components/actions/ActionList'
import { useStore } from '../store'
import { ipc } from '../lib/ipc'
import type { Profile, Action } from '@shared/types'

export function EditorPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const isNew = profileId === 'new'
  const navigate = useNavigate()
  const { upsertProfile, profiles, settings } = useStore()

  const [profile, setProfile] = useState<Profile>(() => ({
    id: nanoid(),
    name: '',
    executablePath: '',
    executableArgs: '',
    processName: '',
    actions: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }))
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; exe?: string }>({})

  useEffect(() => {
    if (!isNew) {
      const existing = profiles.find((p) => p.id === profileId)
      if (existing) {
        setProfile(existing)
      } else {
        ipc.profiles.list().then((all) => {
          const found = all.find((p) => p.id === profileId)
          if (found) setProfile(found)
        })
      }
    }
  }, [isNew, profileId, profiles])

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!profile.name.trim()) errs.name = 'Profile name is required'
    if (!profile.executablePath.trim()) errs.exe = 'Executable path is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave(): Promise<void> {
    if (!validate()) return
    setSaving(true)
    try {
      const now = Date.now()
      const toSave: Profile = {
        ...profile,
        name: profile.name.trim(),
        updatedAt: now,
        createdAt: isNew ? now : profile.createdAt
      }
      await ipc.profiles.save(toSave)
      upsertProfile(toSave)
      navigate('/')
    } finally {
      setSaving(false)
    }
  }

  const defaultShell = settings?.defaultShell ?? 'powershell'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2e2e42] flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-100 flex-1">
          {isNew ? 'New Profile' : `Edit: ${profile.name || 'Untitled'}`}
        </h1>
        <Button onClick={handleSave} loading={saving}>
          <Save className="size-4" />
          Save Profile
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <section className="flex flex-col gap-4 p-4 rounded-xl border border-[#2e2e42] bg-[#1a1a24]">
            <h2 className="text-sm font-semibold text-slate-300">Profile Info</h2>
            <Input
              label="Profile Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. Valorant"
              error={errors.name}
            />
            <Input
              label="Game / App Executable"
              value={profile.executablePath}
              onChange={(e) => setProfile({ ...profile, executablePath: e.target.value })}
              placeholder="C:\Riot Games\VALORANT\live\VALORANT.exe"
              error={errors.exe}
              suffix={
                <button
                  onClick={async () => {
                    const path = await ipc.dialog.pickExe()
                    if (path) setProfile({ ...profile, executablePath: path })
                  }}
                  className="hover:text-slate-200 transition-colors"
                >
                  <FolderOpen className="size-4" />
                </button>
              }
            />
            <Input
              label="Launch Arguments (optional)"
              value={profile.executableArgs ?? ''}
              onChange={(e) => setProfile({ ...profile, executableArgs: e.target.value })}
              placeholder="--launch-arg value"
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Process Name Override
                </label>
                <span className="group relative">
                  <Info className="size-3.5 text-slate-600 cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 text-xs text-slate-300 bg-[#242433] border border-[#2e2e42] rounded-lg px-2.5 py-2 shadow-xl z-50">
                    For games that use a launcher (e.g. Riot Client), set this to the actual game process name (e.g. VALORANT-Win64-Shipping.exe) so Ignite monitors the right process.
                  </span>
                </span>
              </div>
              <input
                value={profile.processName ?? ''}
                onChange={(e) => setProfile({ ...profile, processName: e.target.value })}
                placeholder="VALORANT-Win64-Shipping.exe"
                className="w-full rounded-lg border border-[#2e2e42] bg-[#0f0f13] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3 p-4 rounded-xl border border-[#2e2e42] bg-[#1a1a24]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">Pre-launch Actions</h2>
              <span className="text-xs text-slate-600">{profile.actions.length} action{profile.actions.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-xs text-slate-500">
              Actions run in order before the game launches. Drag to reorder.
            </p>
            <ActionList
              actions={profile.actions}
              onChange={(actions: Action[]) => setProfile({ ...profile, actions })}
              defaultShell={defaultShell}
            />
          </section>
        </div>

        <div className="w-64 border-l border-[#2e2e42] p-4 overflow-y-auto flex-shrink-0">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Preview</h2>
          <div className="rounded-xl border border-[#2e2e42] bg-[#1a1a24] overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-violet-900/60 to-purple-900/40 flex items-center justify-center">
              <span className="text-3xl opacity-30">🎮</span>
            </div>
            <div className="p-3">
              <p className="font-semibold text-slate-100 text-sm truncate">
                {profile.name || 'Untitled Profile'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {profile.executablePath
                  ? profile.executablePath.split('\\').pop()
                  : 'No executable selected'}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                {profile.actions.length} action{profile.actions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {profile.actions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Action Summary
              </h3>
              <div className="flex flex-col gap-1.5">
                {profile.actions.map((action, i) => (
                  <div key={action.id} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-slate-600 font-mono">{i + 1}.</span>
                    <span className="truncate">
                      {action.label ||
                        (action.type === 'launch_app' && action.executablePath
                          ? action.executablePath.split('\\').pop()
                          : action.type === 'set_resolution'
                            ? `${action.width}×${action.height}`
                            : action.type === 'wait'
                              ? `Wait ${action.duration / 1000}s`
                              : 'Script')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
