import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input, Select, Textarea } from '@/components/ui/input'
import { todayIso } from '@/lib/utils'
import type { NewTransaction, Transaction } from '@/types/domain'

const schema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل دو حرف باشد'),
  type: z.enum(['income', 'side_income', 'expense']),
  amount: z.number().positive('مبلغ باید بیشتر از صفر باشد'),
  occurred_at: z.string().min(1, 'تاریخ را وارد کنید'),
  notes: z.string()
})
type Values = z.infer<typeof schema>

export function TransactionForm({ initial, onSubmit, onCancel }: { initial?: Transaction; onSubmit: (value: NewTransaction) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: '', type: 'expense', amount: 0, occurred_at: todayIso(), notes: '' } })
  useEffect(() => { if (initial) reset({ title: initial.title, type: initial.type, amount: initial.amount, occurred_at: initial.occurred_at.slice(0, 10), notes: initial.notes ?? '' }) }, [initial, reset])
  const submit = async (values: Values): Promise<void> => onSubmit({ ...values, occurred_at: new Date(`${values.occurred_at}T12:00:00`).toISOString(), notes: values.notes.trim() || null })
  return <form className="space-y-4" onSubmit={(event) => void handleSubmit(submit)(event)}>
    <FormField label="عنوان" htmlFor="transaction-title" error={errors.title?.message}><Input id="transaction-title" autoFocus {...register('title')} /></FormField>
    <FormField label="نوع تراکنش" htmlFor="transaction-type" error={errors.type?.message}><Select id="transaction-type" {...register('type')}><option value="income">درآمد ثابت</option><option value="side_income">درآمد جانبی</option><option value="expense">هزینه</option></Select></FormField>
    <FormField label="مبلغ (تومان)" htmlFor="transaction-amount" error={errors.amount?.message}><Input id="transaction-amount" type="number" min="1" inputMode="numeric" dir="ltr" {...register('amount', { valueAsNumber: true })} /></FormField>
    <FormField label="تاریخ" htmlFor="transaction-date" error={errors.occurred_at?.message}><Input id="transaction-date" type="date" dir="ltr" {...register('occurred_at')} /></FormField>
    <FormField label="یادداشت" htmlFor="transaction-notes"><Textarea id="transaction-notes" {...register('notes')} /></FormField>
    <div className="flex gap-2 pt-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'در حال ذخیره...' : initial ? 'ذخیره تغییرات' : 'ثبت تراکنش'}</Button><Button variant="ghost" onClick={onCancel}>انصراف</Button></div>
  </form>
}
