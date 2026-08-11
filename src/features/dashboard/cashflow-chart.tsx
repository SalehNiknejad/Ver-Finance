import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { useFinanceStore } from '@/store/finance-store'

export function CashflowChart() {
  const transactions = useFinanceStore((state) => state.transactions)
  const data = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(); date.setMonth(date.getMonth() - (5 - index))
    const monthItems = transactions.filter((item) => { const itemDate = new Date(item.occurred_at); return itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth() })
    return {
      month: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short' }).format(date),
      income: monthItems.filter((item) => item.type !== 'expense').reduce((sum, item) => sum + item.amount, 0) / 1_000_000,
      expense: monthItems.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0) / 1_000_000
    }
  }), [transactions])
  return <Card className="h-80"><div className="mb-5"><h2 className="font-bold">جریان نقدی</h2><p className="text-xs text-slate-500">میلیون تومان در شش ماه اخیر</p></div><ResponsiveContainer width="100%" height="80%"><BarChart data={data} barGap={4}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.15)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value: number) => formatNumber(value)} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => `${formatNumber(Number(value))} میلیون`} contentStyle={{ borderRadius: 12, background: '#181b20', border: '1px solid rgba(255,255,255,.1)', direction: 'rtl' }} /><Bar dataKey="income" name="درآمد" fill="#34d399" radius={[6, 6, 0, 0]} /><Bar dataKey="expense" name="هزینه" fill="#f87171" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></Card>
}
