import type { ReactNode } from 'react'

export function FormField({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
  </div>
}
