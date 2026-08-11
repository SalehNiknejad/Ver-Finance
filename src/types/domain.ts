export type TransactionType = 'income' | 'side_income' | 'expense'
export type GoldTransactionType = 'buy' | 'sell'

export interface Transaction {
  [key: string]: unknown
  id: string
  user_id: string
  type: TransactionType
  title: string
  amount: number
  occurred_at: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InstallmentPlan {
  [key: string]: unknown
  id: string
  user_id: string
  title: string
  total_amount: number
  installment_amount: number
  total_installments: number
  paid_installments: number
  start_date: string
  due_day: number
  created_at: string
  updated_at: string
}

export interface GoldTransaction {
  [key: string]: unknown
  id: string
  user_id: string
  type: GoldTransactionType
  grams: number
  price_per_gram: number
  occurred_at: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface UserSettings {
  [key: string]: unknown
  user_id: string
  gold_price_per_gram: number
  theme: 'dark' | 'light' | 'system'
  created_at: string
  updated_at: string
}

export type NewTransaction = Pick<Transaction, 'type' | 'title' | 'amount' | 'occurred_at' | 'notes'>
export type NewInstallmentPlan = Pick<InstallmentPlan, 'title' | 'total_amount' | 'installment_amount' | 'total_installments' | 'paid_installments' | 'start_date' | 'due_day'>
export type NewGoldTransaction = Pick<GoldTransaction, 'type' | 'grams' | 'price_per_gram' | 'occurred_at' | 'notes'>

export interface FinanceSnapshot {
  transactions: Transaction[]
  installmentPlans: InstallmentPlan[]
  goldTransactions: GoldTransaction[]
  settings: UserSettings
}

export type SyncTable = 'transactions' | 'installment_plans' | 'gold_transactions' | 'user_settings'
export type SyncAction = 'upsert' | 'delete'

export interface QueueItem {
  id?: number
  table: SyncTable
  action: SyncAction
  payload: Record<string, unknown>
  createdAt: string
}
