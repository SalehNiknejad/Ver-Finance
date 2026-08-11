import { supabase } from './supabase'
import type { FinanceSnapshot, GoldTransaction, InstallmentPlan, QueueItem, Transaction, UserSettings } from '@/types/domain'

function errorMessage(error: { message: string } | null): string {
  return error?.message ?? 'خطای ناشناخته در ارتباط با سرور'
}

export async function fetchFinanceSnapshot(userId: string): Promise<FinanceSnapshot> {
  const [transactions, plans, gold, settings] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', userId).order('occurred_at', { ascending: false }),
    supabase.from('installment_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('gold_transactions').select('*').eq('user_id', userId).order('occurred_at', { ascending: false }),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle()
  ])
  const failure = transactions.error ?? plans.error ?? gold.error ?? settings.error
  if (failure) throw new Error(errorMessage(failure))
  const now = new Date().toISOString()
  return {
    transactions: transactions.data ?? [],
    installmentPlans: plans.data ?? [],
    goldTransactions: gold.data ?? [],
    settings: settings.data ?? { user_id: userId, gold_price_per_gram: 0, theme: 'dark', created_at: now, updated_at: now }
  }
}

export async function upsertTransaction(row: Transaction): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').upsert(row).select().single()
  if (error) throw new Error(errorMessage(error))
  return data
}
export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(errorMessage(error))
}
export async function upsertInstallment(row: InstallmentPlan): Promise<InstallmentPlan> {
  const { data, error } = await supabase.from('installment_plans').upsert(row).select().single()
  if (error) throw new Error(errorMessage(error))
  return data
}
export async function deleteInstallment(id: string): Promise<void> {
  const { error } = await supabase.from('installment_plans').delete().eq('id', id)
  if (error) throw new Error(errorMessage(error))
}
export async function upsertGoldTransaction(row: GoldTransaction): Promise<GoldTransaction> {
  const { data, error } = await supabase.from('gold_transactions').upsert(row).select().single()
  if (error) throw new Error(errorMessage(error))
  return data
}
export async function deleteGoldTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('gold_transactions').delete().eq('id', id)
  if (error) throw new Error(errorMessage(error))
}
export async function upsertSettings(row: UserSettings): Promise<UserSettings> {
  const { data, error } = await supabase.from('user_settings').upsert(row).select().single()
  if (error) throw new Error(errorMessage(error))
  return data
}

export async function replayMutation(item: QueueItem): Promise<void> {
  const id = typeof item.payload.id === 'string' ? item.payload.id : ''
  if (item.action === 'delete') {
    if (!id) throw new Error('شناسه عملیات آفلاین نامعتبر است')
    if (item.table === 'transactions') await deleteTransaction(id)
    if (item.table === 'installment_plans') await deleteInstallment(id)
    if (item.table === 'gold_transactions') await deleteGoldTransaction(id)
    return
  }
  if (item.table === 'transactions') await upsertTransaction(item.payload as unknown as Transaction)
  if (item.table === 'installment_plans') await upsertInstallment(item.payload as unknown as InstallmentPlan)
  if (item.table === 'gold_transactions') await upsertGoldTransaction(item.payload as unknown as GoldTransaction)
  if (item.table === 'user_settings') await upsertSettings(item.payload as unknown as UserSettings)
}
