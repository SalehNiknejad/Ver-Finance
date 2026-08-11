import { CalendarClock, Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { EmptyState, LoadingState } from '@/components/ui/status'
import { InstallmentForm } from '@/features/installments/installment-form'
import { formatCount, formatDate, formatToman, getNextDueDate } from '@/lib/utils'
import { useFinanceStore } from '@/store/finance-store'
import type { InstallmentPlan, NewInstallmentPlan } from '@/types/domain'

export function InstallmentsPage() {
  const plans = useFinanceStore((state) => state.installmentPlans)
  const loading = useFinanceStore((state) => state.loading)
  const add = useFinanceStore((state) => state.addInstallment)
  const update = useFinanceStore((state) => state.updateInstallment)
  const remove = useFinanceStore((state) => state.removeInstallment)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<InstallmentPlan>()
  const close = (): void => { setOpen(false); setEditing(undefined) }
  const submit = async (value: NewInstallmentPlan): Promise<void> => { if (editing) await update({ ...editing, ...value }); else await add(value); close(); toast.success(editing ? 'برنامه ویرایش شد' : 'برنامه اقساط ساخته شد') }
  const markPaid = async (plan: InstallmentPlan): Promise<void> => { if (plan.paid_installments >= plan.total_installments) return; await update({ ...plan, paid_installments: plan.paid_installments + 1 }); toast.success('یک قسط پرداخت شد') }
  const deletePlan = async (plan: InstallmentPlan): Promise<void> => { if (!window.confirm(`برنامه «${plan.title}» حذف شود؟`)) return; await remove(plan.id) }
  if (loading) return <LoadingState />
  return <>
    <PageHeader title="اقساط" description="برنامه‌های پرداخت و سررسیدها را دنبال کنید." action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /><span className="hidden sm:inline">برنامه جدید</span></Button>} />
    {plans.length === 0 ? <EmptyState title="برنامه‌ای ندارید" description="اولین برنامه اقساط خود را بسازید." /> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => { const remaining = Math.max(0, plan.total_installments - plan.paid_installments); const completed = remaining === 0; const percent = Math.min(100, plan.paid_installments / plan.total_installments * 100); return <Card key={plan.id} className="flex flex-col"><div className="flex items-start justify-between"><div><span className="mb-2 inline-flex items-center gap-1 rounded-full bg-gold-400/10 px-2 py-1 text-[11px] text-gold-600 dark:text-gold-300"><CalendarClock className="size-3" />{completed ? 'تکمیل‌شده' : formatDate(getNextDueDate(plan))}</span><h2 className="text-lg font-bold">{plan.title}</h2></div><div className="flex"><Button variant="ghost" size="icon" aria-label="ویرایش" onClick={() => { setEditing(plan); setOpen(true) }}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label="حذف" onClick={() => void deletePlan(plan)}><Trash2 className="size-4 text-red-500" /></Button></div></div><div className="my-5"><div className="mb-2 flex justify-between text-xs text-slate-500"><span>{formatCount(plan.paid_installments)} از {formatCount(plan.total_installments)} پرداخت شده</span><span>{formatCount(Math.round(percent))}٪</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${percent}%` }} /></div></div><div className="mt-auto grid grid-cols-2 gap-3 border-t pt-4"><div><p className="text-xs text-slate-500">مبلغ هر قسط</p><p className="mt-1 text-sm font-bold">{formatToman(plan.installment_amount)}</p></div><div><p className="text-xs text-slate-500">مانده</p><p className="mt-1 text-sm font-bold">{formatToman(Math.max(0, plan.total_amount - plan.installment_amount * plan.paid_installments))}</p></div></div>{!completed && <Button className="mt-4 w-full" variant="secondary" onClick={() => void markPaid(plan)}><Check className="size-4" />ثبت پرداخت قسط</Button>}</Card> })}</section>}
    <Modal open={open} onClose={close} title={editing ? 'ویرایش برنامه اقساط' : 'برنامه اقساط جدید'}><InstallmentForm initial={editing} onCancel={close} onSubmit={submit} /></Modal>
  </>
}
