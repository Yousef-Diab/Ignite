import { NavLink } from 'react-router-dom'
import { LayoutGrid, Settings } from 'lucide-react'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Profiles' },
  { to: '/settings', icon: Settings, label: 'Settings' }
]

export function Sidebar() {
  return (
    <aside className="w-16 flex flex-col items-center py-3 gap-1 border-r border-[#2e2e42] bg-[#0f0f13] flex-shrink-0">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'group relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg transition-colors',
              isActive
                ? 'bg-violet-600/20 text-violet-400'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            )
          }
          title={label}
        >
          <Icon className="size-5" />
          <span className="text-[9px] font-medium">{label}</span>
        </NavLink>
      ))}
    </aside>
  )
}
