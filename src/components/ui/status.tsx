import { Inbox, LoaderCircle } from 'lucide-react'

export function LoadingState({ label = 'در حال بارگذاری...' }: { label?: string }) {
  return <div className="grid min-h-48 place-items-center text-slate-500"><div className="flex items-center gap-2"><LoaderCircle className="size-5 animate-spin text-gold-400" />{label}</div></div>
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed p-8 text-center">
    <div><Inbox className="mx-auto mb-3 size-9 text-slate-400" /><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>
  </div>
}
