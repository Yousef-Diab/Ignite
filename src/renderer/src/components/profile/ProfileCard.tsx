import { Play, Square, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'
import type { Profile } from '@shared/types'

interface ProfileCardProps {
  profile: Profile
  isActive: boolean
  isRunning: boolean
  onLaunch: () => void
  onAbort: () => void
  onDelete: () => void
}

const GRADIENT_COLORS = [
  'from-violet-900/60 to-purple-900/40',
  'from-blue-900/60 to-cyan-900/40',
  'from-emerald-900/60 to-teal-900/40',
  'from-rose-900/60 to-pink-900/40',
  'from-amber-900/60 to-orange-900/40',
  'from-indigo-900/60 to-blue-900/40'
]

function getGradient(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) & 0xffff
  return GRADIENT_COLORS[hash % GRADIENT_COLORS.length]
}

export function ProfileCard({ profile, isActive, isRunning, onLaunch, onAbort, onDelete }: ProfileCardProps) {
  const navigate = useNavigate()
  const gradient = getGradient(profile.name)

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border bg-[#1a1a24] overflow-hidden transition-all duration-200',
        isActive
          ? 'border-violet-500/60 shadow-[0_0_20px_rgba(124,58,237,0.25)]'
          : 'border-[#2e2e42] hover:border-white/15'
      )}
    >
      <div className={cn('h-28 bg-gradient-to-br', gradient, 'relative flex items-end p-3')}>
        {profile.coverImagePath ? (
          <img
            src={`file://${profile.coverImagePath}`}
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
          />
        ) : null}
        <div className="relative z-10 flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => navigate(`/editor/${profile.id}`)}
            className="flex items-center justify-center size-7 rounded-lg bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center size-7 rounded-lg bg-black/40 text-white/70 hover:text-red-400 hover:bg-black/60 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
        {isActive && (
          <span className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-medium text-violet-300 bg-violet-900/60 px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
            {isRunning ? 'Running' : 'Launching'}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm leading-tight truncate">{profile.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {profile.executablePath.split('\\').pop()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">
            {profile.actions.length} action{profile.actions.length !== 1 ? 's' : ''}
          </span>
          <div className="ml-auto">
            {isActive ? (
              <Button variant="danger" size="sm" onClick={onAbort}>
                <Square className="size-3" />
                Abort
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={onLaunch} disabled={isRunning}>
                <Play className="size-3" />
                Launch
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
