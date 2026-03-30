import { cn } from '../../lib/cn'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border border-[#2e2e42] bg-[#0f0f13] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 transition-colors focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50',
              suffix && 'pr-10',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-2 flex items-center text-slate-400">{suffix}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
