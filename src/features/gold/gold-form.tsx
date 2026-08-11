import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input, Select, Textarea } from '@/components/ui/input'
import { todayIso } from '@/lib/utils'
import type { GoldTransaction, NewGoldTransaction } from '@/types/domain'

const schema = z.object({
  type: z.enum(['buy', 'sell']),
  grams: z.number().positive('وزن باید بیشتر از صفر باشد'),
  price_per_gram: z.number().positive('قیمت باید بیشتر از صفر باشد'),
  occurred_at: z.string().min(1, 'تاریخ را وارد کنید'),
  notes: z.string()
})
type Values = z.infer<typeof schema>

export function GoldForm({ initial, onSubmit, onCancel }: { initial?: GoldTransaction; onSubmit: (value: NewGoldTransaction) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { type: 'buy', grams: 0, price_per_gram: 0, occurred_at: todayIso(), notes: '' } })
  useEffect(() => { if (initial) reset({ type: initial.type, grams: initial.grams, price_per_gram: initial.price_per_gram, occurred_at: initial.occurred_at.slice(0, 10), notes: initial.notes ?? '' }) }, [initial, reset])
  const submit = async (values: Values): Promise<void> => onSubmit({ ...values, occurred_at: new Date(`${values.occurred_at}T12:00:00`).toISOString(), notes: values.notes.trim() || null })
  return <form className="space-y-4" onSubmit={(event) => void handleSubmit(submit)(event)}>
    <FormField label="نوع معامله" htmlFor="gold-type"><Select id="gold-type" {...register('type')}><option value="buy">خرید طلا</option><option value="sell">فروش طلا</option></Select></FormField>
    <div className="grid grid-cols-2 gap-3"><FormField label="وزن (گرم)" htmlFor="gold-grams" error={errors.grams?.message}><Input id="gold-grams" type="number" dir="ltr" min="0" step="0.001" {...register('grams', { valueAsNumber: true })} /></FormField><FormField label="قیمت هر گرم" htmlFor="gold-price" error={errors.price_per_gram?.message}><Input id="gold-price" type="number" dir="ltr" min="1" {...register('price_per_gram', { valueAsNumber: true })} /></FormField></div>
    <FormField label="تاریخ" htmlFor="gold-date" error={errors.occurred_at?.message}><Input id="gold-date" type="date" dir="ltr" {...register('occurred_at')} /></FormField>
    <FormField label="یادداشت" htmlFor="gold-notes"><Textarea id="gold-notes" {...register('notes')} /></FormField>
    <div className="flex gap-2 pt-2"><Button type="submit" disabled={isSubmitting}>{initial ? 'ذخیره تغییرات' : 'ثبت معامله'}</Button><Button variant="ghost" onClick={onCancel}>انصراف</Button></div>
  </form>
}
