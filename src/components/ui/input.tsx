import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-11 w-full rounded-xl border bg-white px-3 text-sm placeholder:text-slate-400 dark:bg-white/5', className)} {...props} />
}
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('h-11 w-full rounded-xl border bg-white px-3 text-sm dark:bg-[#181b20]', className)} {...props}>{children}</select>
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-24 w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:bg-white/5', className)} {...props} />
}
