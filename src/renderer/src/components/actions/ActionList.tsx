import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { Plus, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { SortableActionCard } from './ActionCard'
import { LaunchAppActionEditor } from './LaunchAppAction'
import { SetResolutionActionEditor } from './SetResolutionAction'
import { RunScriptActionEditor } from './RunScriptAction'
import { WaitActionEditor } from './WaitAction'
import { cn } from '../../lib/cn'
import type { Action, ActionType } from '@shared/types'

interface ActionListProps {
  actions: Action[]
  onChange: (actions: Action[]) => void
  defaultShell: 'powershell' | 'cmd'
}

const ACTION_TYPES: { type: ActionType; label: string; description: string }[] = [
  { type: 'launch_app', label: 'Launch App', description: 'Open an application' },
  { type: 'set_resolution', label: 'Set Resolution', description: 'Change display resolution' },
  { type: 'run_script', label: 'Run Script', description: 'Execute a shell command' },
  { type: 'wait', label: 'Wait', description: 'Pause for a duration' }
]

function createDefaultAction(type: ActionType, defaultShell: 'powershell' | 'cmd'): Action {
  const id = nanoid()
  switch (type) {
    case 'launch_app':
      return { id, type: 'launch_app', timing: 'before', executablePath: '', closeOnGameExit: false }
    case 'set_resolution':
      return { id, type: 'set_resolution', timing: 'before', width: 1920, height: 1080, refreshRate: 60, revertOnGameExit: true, revertDelay: 0 }
    case 'run_script':
      return { id, type: 'run_script', timing: 'before', command: '', shell: defaultShell }
    case 'wait':
      return { id, type: 'wait', timing: 'before', duration: 2000 }
  }
}

export function ActionList({ actions, onChange, defaultShell }: ActionListProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = actions.findIndex((a) => a.id === active.id)
    const to = actions.findIndex((a) => a.id === over.id)
    onChange(arrayMove(actions, from, to))
  }

  function addAction(type: ActionType): void {
    onChange([...actions, createDefaultAction(type, defaultShell)])
    setMenuOpen(false)
  }

  function updateAction(index: number, updated: Action): void {
    const next = [...actions]
    next[index] = updated
    onChange(next)
  }

  function deleteAction(index: number): void {
    onChange(actions.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {actions.map((action, index) => (
            <SortableActionCard
              key={action.id}
              action={action}
              index={index}
              onDelete={() => deleteAction(index)}
              onTimingChange={(timing) => updateAction(index, { ...action, timing })}
            >
              {action.type === 'launch_app' && (
                <LaunchAppActionEditor action={action} onChange={(a) => updateAction(index, a)} />
              )}
              {action.type === 'set_resolution' && (
                <SetResolutionActionEditor action={action} onChange={(a) => updateAction(index, a)} />
              )}
              {action.type === 'run_script' && (
                <RunScriptActionEditor action={action} onChange={(a) => updateAction(index, a)} />
              )}
              {action.type === 'wait' && (
                <WaitActionEditor action={action} onChange={(a) => updateAction(index, a)} />
              )}
            </SortableActionCard>
          ))}
        </SortableContext>
      </DndContext>

      {actions.length === 0 && (
        <div className="rounded-lg border border-dashed border-[#2e2e42] py-8 text-center text-sm text-slate-600">
          No actions yet. Add an action below.
        </div>
      )}

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-[#2e2e42] text-sm text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors"
        >
          <Plus className="size-4" />
          Add Action
          <ChevronDown className={cn('size-4 ml-auto transition-transform', menuOpen && 'rotate-180')} />
        </button>

        {menuOpen && (
          <div className="absolute bottom-full mb-1 left-0 right-0 rounded-lg border border-[#2e2e42] bg-[#1a1a24] shadow-xl overflow-hidden z-10">
            {ACTION_TYPES.map(({ type, label, description }) => (
              <button
                key={type}
                onClick={() => addAction(type)}
                className="flex flex-col w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-[#2e2e42] last:border-0"
              >
                <span className="text-sm font-medium text-slate-200">{label}</span>
                <span className="text-xs text-slate-500">{description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
