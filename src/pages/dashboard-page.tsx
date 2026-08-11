import { CircleDollarSign, CreditCard, Landmark, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/status'
import { CashflowChart } from '@/features/dashboard/cashflow-chart'
import { MetricCard } from '@/features/dashboard/metric-card'
import { NetWorthChart } from '@/features/dashboard/net-worth-chart'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'
import { formatCount, formatDate, formatToman, getNextDueDate } from '@/lib/utils'
import { useFinanceStore } from '@/store/finance-store'

export function DashboardPage() {
  const metrics = useDashboardMetrics()
  const loading = useFinanceStore((state) => state.loading)
  const plans = useFinanceStore((state) => state.installmentPlans)
  if (loading) return <LoadingState />
  const activePlans = plans.filter((plan) => plan.paid_installments < plan.total_installments).sort((a, b) => getNextDueDate(a).getTime() - getNextDueDate(b).getTime())
  const nextPlan = activePlans[0]
  return <>
    <PageHeader title="نمای کلی مالی" description="سلام؛ وضعیت امروز دارایی‌هایتان اینجاست." />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard title="موجودی نقدی" value={metrics.cashBalance} icon={Landmark} />
      <MetricCard title="ارزش طلا" value={metrics.goldValue} icon={CircleDollarSign} tone="gold" note={`${formatCount(metrics.goldGrams)} گرم`} />
      <MetricCard title="درآمد این ماه" value={metrics.monthlyIncome} icon={TrendingUp} tone="positive" />
      <MetricCard title="هزینه این ماه" value={metrics.monthlyExpenses} icon={TrendingDown} tone="negative" />
      <MetricCard title="مانده اقساط" value={metrics.remainingInstallmentAmount} icon={CreditCard} tone="negative" note={`${formatCount(metrics.remainingInstallments)} قسط`} />
      <MetricCard title="دارایی خالص" value={metrics.netWorth} icon={PiggyBank} tone={metrics.netWorth >= 0 ? 'positive' : 'negative'} />
    </section>
    {nextPlan && <Card className="mt-4 flex flex-wrap items-center justify-between gap-4 border-gold-400/30 bg-gold-400/[0.06]"><div><p className="text-xs text-gold-600 dark:text-gold-300">نزدیک‌ترین سررسید</p><h2 className="mt-1 font-bold">{nextPlan.title}</h2></div><div className="text-left"><p className="font-bold">{formatToman(nextPlan.installment_amount)}</p><p className="text-xs text-slate-500">{formatDate(getNextDueDate(nextPlan))}</p></div></Card>}
    <section className="mt-4 grid gap-4 xl:grid-cols-2"><CashflowChart /><NetWorthChart /></section>
  </>
}
