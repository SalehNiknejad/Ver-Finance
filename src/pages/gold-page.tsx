import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Pencil, Plus, Scale, Trash2, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { EmptyState, LoadingState } from '@/components/ui/status'
import { GoldForm } from '@/features/gold/gold-form'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'
import { cn, formatDate, formatNumber, formatToman } from '@/lib/utils'
import { useFinanceStore } from '@/store/finance-store'
import type { GoldTransaction, NewGoldTransaction } from '@/types/domain'

export function GoldPage() {
  const items = useFinanceStore((state) => state.goldTransactions)
  const settings = useFinanceStore((state) => state.settings)
  const loading = useFinanceStore((state) => state.loading)
  const add = useFinanceStore((state) => state.addGoldTransaction)
  const update = useFinanceStore((state) => state.updateGoldTransaction)
  const remove = useFinanceStore((state) => state.removeGoldTransaction)
  const updateSettings = useFinanceStore((state) => state.updateSettings)
  const metrics = useDashboardMetrics()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GoldTransaction>()
  const [currentPrice, setCurrentPrice] = useState(String(settings.gold_price_per_gram))
  const close = (): void => { setOpen(false); setEditing(undefined) }
  const submit = async (value: NewGoldTransaction): Promise<void> => { if (editing) await update({ ...editing, ...value }); else await add(value); close(); toast.success(editing ? 'معامله ویرایش شد' : 'معامله طلا ثبت شد') }
  const savePrice = async (): Promise<void> => { const value = Number(currentPrice); if (!(value > 0)) { toast.error('قیمت معتبر وارد کنید'); return }; await updateSettings({ gold_price_per_gram: value }); toast.success('قیمت روز ذخیره شد') }
  const deleteItem = async (item: GoldTransaction): Promise<void> => { if (!window.confirm('این معامله حذف شود؟')) return; await remove(item.id) }
  if (loading) return <LoadingState />
  return <>
    <PageHeader title="سبد طلا" description="ارزش و بازده سرمایه‌گذاری طلای خود را ببینید." action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /><span className="hidden sm:inline">معامله جدید</span></Button>} />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Card><Scale className="mb-3 size-5 text-gold-500" /><p className="text-xs text-slate-500">موجودی طلا</p><p className="mt-1 text-xl font-bold">{formatNumber(metrics.goldGrams, 3)} گرم</p></Card><Card><CircleDollarSign className="mb-3 size-5 text-gold-500" /><p className="text-xs text-slate-500">ارزش روز</p><p className="mt-1 text-xl font-bold">{formatToman(metrics.goldValue)}</p></Card><Card><TrendingUp className="mb-3 size-5 text-gold-500" /><p className="text-xs text-slate-500">میانگین قیمت خرید</p><p className="mt-1 text-xl font-bold">{formatToman(metrics.averageGoldBuyPrice)}</p></Card><Card><TrendingUp className={cn('mb-3 size-5', metrics.goldProfit >= 0 ? 'text-emerald-500' : 'text-red-500')} /><p className="text-xs text-slate-500">سود / زیان</p><p className={cn('mt-1 text-xl font-bold', metrics.goldProfit >= 0 ? 'text-emerald-500' : 'text-red-500')}>{formatToman(metrics.goldProfit)}</p></Card></section>
    <Card className="my-4 flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1"><label htmlFor="current-gold-price" className="mb-1.5 block text-sm font-medium">قیمت روز هر گرم طلا (تومان)</label><Input id="current-gold-price" type="number" dir="ltr" min="1" value={currentPrice} onChange={(event) => setCurrentPrice(event.target.value)} /></div><Button variant="secondary" onClick={() => void savePrice()}>به‌روزرسانی قیمت</Button></Card>
    <h2 className="mb-3 mt-7 text-lg font-bold">تاریخچه معاملات</h2>
    {items.length === 0 ? <EmptyState title="معامله‌ای ثبت نشده" description="اولین خرید یا فروش طلای خود را اضافه کنید." /> : <div className="space-y-2">{items.map((item) => <Card key={item.id} className="flex items-center gap-3 p-3"><span className={cn('grid size-10 place-items-center rounded-xl', item.type === 'buy' ? 'bg-gold-400/15 text-gold-500' : 'bg-blue-500/10 text-blue-500')}>{item.type === 'buy' ? <ArrowDownLeft /> : <ArrowUpRight />}</span><div className="flex-1"><h3 className="font-semibold">{item.type === 'buy' ? 'خرید طلا' : 'فروش طلا'}</h3><p className="text-xs text-slate-500">{formatDate(item.occurred_at)} · {formatNumber(item.grams, 3)} گرم</p></div><div className="hidden text-left sm:block"><p className="font-bold">{formatToman(item.grams * item.price_per_gram)}</p><p className="text-xs text-slate-500">هر گرم {formatToman(item.price_per_gram)}</p></div><Button variant="ghost" size="icon" aria-label="ویرایش" onClick={() => { setEditing(item); setOpen(true) }}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label="حذف" onClick={() => void deleteItem(item)}><Trash2 className="size-4 text-red-500" /></Button></Card>)}</div>}
    <Modal open={open} onClose={close} title={editing ? 'ویرایش معامله طلا' : 'معامله جدید طلا'}><GoldForm initial={editing} onCancel={close} onSubmit={submit} /></Modal>
  </>
}
