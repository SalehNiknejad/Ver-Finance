import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn, formatToman } from '@/lib/utils'

export function MetricCard({ title, value, icon: Icon, tone = 'default', note }: { title: string; value: number; icon: LucideIcon; tone?: 'default' | 'positive' | 'negative' | 'gold'; note?: string }) {
  return <Card className="relative overflow-hidden"><div className={cn('absolute -left-6 -top-6 size-24 rounded-full opacity-10 blur-2xl', tone === 'gold' ? 'bg-gold-400' : tone === 'negative' ? 'bg-red-500' : 'bg-emerald-500')} /><div className="mb-4 flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">{title}</span><span className={cn('grid size-9 place-items-center rounded-xl', tone === 'gold' ? 'bg-gold-400/15 text-gold-500' : tone === 'negative' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500')}><Icon className="size-4" /></span></div><p className={cn('number-ltr text-left text-xl font-extrabold sm:text-2xl', value < 0 && 'text-red-500')}>{formatToman(value)}</p>{note && <p className="mt-2 text-xs text-slate-500">{note}</p>}</Card>
}
