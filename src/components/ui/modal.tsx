import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Button } from './button'

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent): void => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose, open])
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border bg-slate-50 p-5 shadow-2xl dark:bg-[#111418] sm:max-w-lg sm:rounded-3xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
        <Button variant="ghost" size="icon" aria-label="بستن" onClick={onClose}><X className="size-5" /></Button>
      </div>
      {children}
    </section>
  </div>
}
