import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { useFinanceStore } from '@/store/finance-store'

export function NetWorthChart() {
  const transactions = useFinanceStore((state) => state.transactions)
  const data = useMemo(() => {
    let cumulative = 0
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(); date.setMonth(date.getMonth() - (5 - index))
      const change = transactions.filter((item) => { const itemDate = new Date(item.occurred_at); return itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth() }).reduce((sum, item) => sum + (item.type === 'expense' ? -item.amount : item.amount), 0)
      cumulative += change
      return { month: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short' }).format(date), value: cumulative / 1_000_000 }
    })
  }, [transactions])
  return <Card className="h-80"><div className="mb-5"><h2 className="font-bold">روند دارایی خالص نقدی</h2><p className="text-xs text-slate-500">میلیون تومان در شش ماه اخیر</p></div><ResponsiveContainer width="100%" height="80%"><AreaChart data={data}><defs><linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} /><stop offset="100%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.15)" /><XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value: number) => formatNumber(value)} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => `${formatNumber(Number(value))} میلیون`} contentStyle={{ borderRadius: 12, background: '#181b20', border: '1px solid rgba(255,255,255,.1)', direction: 'rtl' }} /><Area type="monotone" dataKey="value" name="دارایی" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGradient)" /></AreaChart></ResponsiveContainer></Card>
}
