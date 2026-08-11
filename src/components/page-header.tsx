import type { ReactNode } from 'react'

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="mb-6 flex items-end justify-between gap-4">
    <div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p></div>
    {action}
  </header>
}
