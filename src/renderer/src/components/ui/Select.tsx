import { cn } from '../../lib/cn'
import { ChevronDown } from 'lucide-react'

interface SelectOption<T extends string = string> {
  value: T
  label: string
}

interface SelectProps<T extends string = string> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  label?: string
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function Select<T extends string = string>({
  value,
  options,
  onChange,
  label,
  disabled,
  placeholder,
  className
}: SelectProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as T)}
          className={cn(
            'w-full appearance-none rounded-lg border border-[#2e2e42] bg-[#0f0f13] px-3 py-2 pr-8 text-sm text-slate-200 transition-colors focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 cursor-pointer',
            className
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      </div>
    </div>
  )
}
