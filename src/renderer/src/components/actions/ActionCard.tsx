import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Action } from '@shared/types'

const ACTION_COLORS: Record<Action['type'], string> = {
  launch_app: 'text-emerald-400 bg-emerald-400/10',
  set_resolution: 'text-blue-400 bg-blue-400/10',
  run_script: 'text-amber-400 bg-amber-400/10',
  wait: 'text-slate-400 bg-slate-400/10'
}

const ACTION_LABELS: Record<Action['type'], string> = {
  launch_app: 'Launch App',
  set_resolution: 'Set Resolution',
  run_script: 'Run Script',
  wait: 'Wait'
}

interface ActionCardProps {
  action: Action
  index: number
  onDelete: () => void
  onTimingChange: (timing: 'before' | 'after') => void
  children: React.ReactNode
}

export function SortableActionCard({ action, index, onDelete, onTimingChange, children }: ActionCardProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-[#0f0f13] border-[#2e2e42] overflow-hidden transition-opacity',
        isDragging && 'opacity-40'
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#2e2e42]">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical className="size-4" />
        </button>

        <span className="text-xs text-slate-600 font-mono w-5">{index + 1}</span>

        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            ACTION_COLORS[action.type]
          )}
        >
          {ACTION_LABELS[action.type]}
        </span>

        {action.label && (
          <span className="text-xs text-slate-400 truncate flex-1">{action.label}</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-[#2e2e42] text-xs">
            <button
              onClick={() => onTimingChange('before')}
              className={cn(
                'px-2 py-0.5 transition-colors',
                action.timing === 'before'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              before
            </button>
            <button
              onClick={() => onTimingChange('after')}
              className={cn(
                'px-2 py-0.5 transition-colors border-l border-[#2e2e42]',
                action.timing === 'after'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              after
            </button>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
          <button
            onClick={onDelete}
            className="text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {!collapsed && <div className="p-3">{children}</div>}
    </div>
  )
}
