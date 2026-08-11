import { useMemo } from 'react'
import { isSameMonth } from '@/lib/utils'
import { useFinanceStore } from '@/store/finance-store'

export interface DashboardMetrics {
  cashBalance: number
  goldGrams: number
  goldValue: number
  averageGoldBuyPrice: number
  goldProfit: number
  monthlyIncome: number
  monthlyExpenses: number
  remainingInstallments: number
  remainingInstallmentAmount: number
  netWorth: number
}

export function useDashboardMetrics(): DashboardMetrics {
  const transactions = useFinanceStore((state) => state.transactions)
  const goldTransactions = useFinanceStore((state) => state.goldTransactions)
  const plans = useFinanceStore((state) => state.installmentPlans)
  const goldPrice = useFinanceStore((state) => state.settings.gold_price_per_gram)

  return useMemo(() => {
    const incomes = transactions.filter((item) => item.type !== 'expense').reduce((sum, item) => sum + item.amount, 0)
    const expenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
    const buys = goldTransactions.filter((item) => item.type === 'buy')
    const soldGrams = goldTransactions.filter((item) => item.type === 'sell').reduce((sum, item) => sum + item.grams, 0)
    const boughtGrams = buys.reduce((sum, item) => sum + item.grams, 0)
    const goldGrams = boughtGrams - soldGrams
    const buyCost = buys.reduce((sum, item) => sum + item.grams * item.price_per_gram, 0)
    const averageGoldBuyPrice = boughtGrams > 0 ? buyCost / boughtGrams : 0
    const goldValue = goldGrams * goldPrice
    const remainingInstallments = plans.reduce((sum, plan) => sum + Math.max(0, plan.total_installments - plan.paid_installments), 0)
    const remainingInstallmentAmount = plans.reduce((sum, plan) => sum + Math.max(0, plan.total_amount - plan.installment_amount * plan.paid_installments), 0)
    const cashBalance = incomes - expenses - buyCost + goldTransactions.filter((item) => item.type === 'sell').reduce((sum, item) => sum + item.grams * item.price_per_gram, 0)
    return {
      cashBalance,
      goldGrams,
      goldValue,
      averageGoldBuyPrice,
      goldProfit: (goldPrice - averageGoldBuyPrice) * goldGrams,
      monthlyIncome: transactions.filter((item) => item.type !== 'expense' && isSameMonth(item.occurred_at)).reduce((sum, item) => sum + item.amount, 0),
      monthlyExpenses: transactions.filter((item) => item.type === 'expense' && isSameMonth(item.occurred_at)).reduce((sum, item) => sum + item.amount, 0),
      remainingInstallments,
      remainingInstallmentAmount,
      netWorth: cashBalance + goldValue - remainingInstallmentAmount
    }
  }, [goldPrice, goldTransactions, plans, transactions])
}
