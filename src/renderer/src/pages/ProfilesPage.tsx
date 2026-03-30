import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ProfileCard } from '../components/profile/ProfileCard'
import { useStore } from '../store'
import { ipc } from '../lib/ipc'

export function ProfilesPage() {
  const navigate = useNavigate()
  const { profiles, setProfiles, removeProfile, session } = useStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    ipc.profiles.list().then(setProfiles)
  }, [setProfiles])

  async function handleLaunch(profileId: string): Promise<void> {
    const result = await ipc.launcher.start(profileId)
    if (!result.ok) {
      console.error('Launch failed:', result.error)
    }
  }

  async function handleDelete(profileId: string): Promise<void> {
    await ipc.profiles.delete(profileId)
    removeProfile(profileId)
    setDeleteId(null)
  }

  const profileToDelete = profiles.find((p) => p.id === deleteId)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e42] flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Profiles</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => navigate('/editor/new')} size="sm">
          <Plus className="size-4" />
          New Profile
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="size-16 rounded-2xl bg-violet-600/10 flex items-center justify-center">
              <Plus className="size-8 text-violet-500/50" />
            </div>
            <div>
              <p className="text-slate-300 font-medium">No profiles yet</p>
              <p className="text-slate-600 text-sm mt-1">
                Create a profile to automate your game launch setup
              </p>
            </div>
            <Button onClick={() => navigate('/editor/new')}>
              <Plus className="size-4" />
              Create first profile
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={session?.profileId === profile.id && session?.phase !== 'idle'}
                isRunning={session?.profileId === profile.id && session?.phase === 'running'}
                onLaunch={() => handleLaunch(profile.id)}
                onAbort={() => ipc.launcher.abort()}
                onDelete={() => setDeleteId(profile.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Profile">
        <p className="text-sm text-slate-400 mb-5">
          Are you sure you want to delete{' '}
          <span className="text-slate-200 font-medium">{profileToDelete?.name}</span>?
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
