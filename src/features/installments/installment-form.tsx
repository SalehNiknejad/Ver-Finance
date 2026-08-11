import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { todayIso } from '@/lib/utils'
import type { InstallmentPlan, NewInstallmentPlan } from '@/types/domain'

const schema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل دو حرف باشد'),
  total_amount: z.number().positive('مبلغ کل باید بیشتر از صفر باشد'),
  installment_amount: z.number().positive('مبلغ هر قسط باید بیشتر از صفر باشد'),
  total_installments: z.number().int().min(1, 'تعداد اقساط باید حداقل یک باشد'),
  paid_installments: z.number().int().min(0, 'مقدار نامعتبر است'),
  start_date: z.string().min(1, 'تاریخ شروع را وارد کنید'),
  due_day: z.number().int().min(1).max(31, 'روز سررسید بین ۱ تا ۳۱ است')
}).refine((value) => value.paid_installments <= value.total_installments, { path: ['paid_installments'], message: 'تعداد پرداخت‌شده بیشتر از کل اقساط است' })
type Values = z.infer<typeof schema>

export function InstallmentForm({ initial, onSubmit, onCancel }: { initial?: InstallmentPlan; onSubmit: (value: NewInstallmentPlan) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: '', total_amount: 0, installment_amount: 0, total_installments: 1, paid_installments: 0, start_date: todayIso(), due_day: 1 } })
  useEffect(() => { if (initial) reset({ title: initial.title, total_amount: initial.total_amount, installment_amount: initial.installment_amount, total_installments: initial.total_installments, paid_installments: initial.paid_installments, start_date: initial.start_date, due_day: initial.due_day }) }, [initial, reset])
  return <form className="space-y-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
    <FormField label="عنوان برنامه" htmlFor="plan-title" error={errors.title?.message}><Input id="plan-title" autoFocus {...register('title')} /></FormField>
    <div className="grid grid-cols-2 gap-3"><FormField label="مبلغ کل (تومان)" htmlFor="plan-total" error={errors.total_amount?.message}><Input id="plan-total" type="number" dir="ltr" min="1" {...register('total_amount', { valueAsNumber: true })} /></FormField><FormField label="مبلغ هر قسط" htmlFor="plan-amount" error={errors.installment_amount?.message}><Input id="plan-amount" type="number" dir="ltr" min="1" {...register('installment_amount', { valueAsNumber: true })} /></FormField></div>
    <div className="grid grid-cols-2 gap-3"><FormField label="تعداد کل" htmlFor="plan-count" error={errors.total_installments?.message}><Input id="plan-count" type="number" dir="ltr" min="1" {...register('total_installments', { valueAsNumber: true })} /></FormField><FormField label="پرداخت‌شده" htmlFor="plan-paid" error={errors.paid_installments?.message}><Input id="plan-paid" type="number" dir="ltr" min="0" {...register('paid_installments', { valueAsNumber: true })} /></FormField></div>
    <div className="grid grid-cols-2 gap-3"><FormField label="تاریخ شروع" htmlFor="plan-start" error={errors.start_date?.message}><Input id="plan-start" type="date" dir="ltr" {...register('start_date')} /></FormField><FormField label="روز سررسید ماه" htmlFor="plan-due" error={errors.due_day?.message}><Input id="plan-due" type="number" dir="ltr" min="1" max="31" {...register('due_day', { valueAsNumber: true })} /></FormField></div>
    <div className="flex gap-2 pt-2"><Button type="submit" disabled={isSubmitting}>{initial ? 'ذخیره تغییرات' : 'ساخت برنامه'}</Button><Button variant="ghost" onClick={onCancel}>انصراف</Button></div>
  </form>
}
