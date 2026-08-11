import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'sm' | 'md' | 'icon' }

export function Button({ className, variant = 'primary', size = 'md', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:pointer-events-none disabled:opacity-50',
    variant === 'primary' && 'bg-gold-400 text-[#15120a] hover:bg-gold-300',
    variant === 'secondary' && 'border bg-white text-slate-800 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10',
    variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
    variant === 'danger' && 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400',
    size === 'sm' && 'h-9 px-3 text-sm', size === 'md' && 'h-11 px-4', size === 'icon' && 'size-10', className
  )} {...props} />
}
