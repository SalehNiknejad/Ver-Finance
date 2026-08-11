import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { EmptyState, LoadingState } from '@/components/ui/status'
import { TransactionForm } from '@/features/transactions/transaction-form'
import { cn, formatDate, formatToman } from '@/lib/utils'
import { useFinanceStore } from '@/store/finance-store'
import type { NewTransaction, Transaction, TransactionType } from '@/types/domain'

const labels: Record<TransactionType, string> = { income: 'درآمد ثابت', side_income: 'درآمد جانبی', expense: 'هزینه' }

export function TransactionsPage() {
  const transactions = useFinanceStore((state) => state.transactions)
  const loading = useFinanceStore((state) => state.loading)
  const add = useFinanceStore((state) => state.addTransaction)
  const update = useFinanceStore((state) => state.updateTransaction)
  const remove = useFinanceStore((state) => state.removeTransaction)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction>()
  const [type, setType] = useState<'all' | TransactionType>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const filtered = useMemo(() => transactions.filter((item) => (type === 'all' || item.type === type) && (!from || item.occurred_at.slice(0, 10) >= from) && (!to || item.occurred_at.slice(0, 10) <= to)), [from, to, transactions, type])
  const close = (): void => { setModalOpen(false); setEditing(undefined) }
  const submit = async (value: NewTransaction): Promise<void> => { if (editing) await update({ ...editing, ...value }); else await add(value); close(); toast.success(editing ? 'تراکنش ویرایش شد' : 'تراکنش ثبت شد') }
  const deleteItem = async (item: Transaction): Promise<void> => { if (!window.confirm(`تراکنش «${item.title}» حذف شود؟`)) return; await remove(item.id); toast.success('تراکنش حذف شد') }
  if (loading) return <LoadingState />
  return <>
    <PageHeader title="تراکنش‌ها" description="درآمدها و هزینه‌ها را یک‌جا مدیریت کنید." action={<Button onClick={() => setModalOpen(true)}><Plus className="size-4" /><span className="hidden sm:inline">تراکنش جدید</span></Button>} />
    <Card className="mb-4 grid gap-3 sm:grid-cols-3"><Select aria-label="فیلتر نوع تراکنش" value={type} onChange={(event) => setType(event.target.value as 'all' | TransactionType)}><option value="all">همه تراکنش‌ها</option><option value="income">درآمد ثابت</option><option value="side_income">درآمد جانبی</option><option value="expense">هزینه</option></Select><Input aria-label="از تاریخ" type="date" dir="ltr" value={from} onChange={(event) => setFrom(event.target.value)} /><Input aria-label="تا تاریخ" type="date" dir="ltr" value={to} onChange={(event) => setTo(event.target.value)} /></Card>
    {filtered.length === 0 ? <EmptyState title="تراکنشی پیدا نشد" description="فیلترها را تغییر دهید یا اولین تراکنش را اضافه کنید." /> : <div className="space-y-2">{filtered.map((item) => <Card key={item.id} className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4"><span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', item.type === 'expense' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500')}>{item.type === 'expense' ? <ArrowUpRight className="size-5" /> : <ArrowDownLeft className="size-5" />}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-semibold">{item.title}</h2><span className="hidden rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-500 sm:inline">{labels[item.type]}</span></div><p className="text-xs text-slate-500">{formatDate(item.occurred_at)}</p><p className={cn('number-ltr mt-1 text-right text-sm font-bold sm:hidden', item.type === 'expense' ? 'text-red-500' : 'text-emerald-500')}>{item.type === 'expense' ? '−' : '+'}{formatToman(item.amount)}</p></div><p className={cn('number-ltr hidden shrink-0 text-left font-bold sm:block', item.type === 'expense' ? 'text-red-500' : 'text-emerald-500')}>{item.type === 'expense' ? '−' : '+'}{formatToman(item.amount)}</p><div className="flex gap-0.5"><Button variant="ghost" size="icon" aria-label="ویرایش" onClick={() => { setEditing(item); setModalOpen(true) }}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label="حذف" onClick={() => void deleteItem(item)}><Trash2 className="size-4 text-red-500" /></Button></div></Card>)}</div>}
    <Modal open={modalOpen} onClose={close} title={editing ? 'ویرایش تراکنش' : 'تراکنش جدید'}><TransactionForm initial={editing} onCancel={close} onSubmit={submit} /></Modal>
  </>
}
