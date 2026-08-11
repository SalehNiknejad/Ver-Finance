import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useFinanceStore } from '@/store/finance-store'
import { isSupabaseConfigured, supabase } from '@/services/supabase'
import type { SyncTable } from '@/types/domain'

const tables: SyncTable[] = ['transactions', 'installment_plans', 'gold_transactions', 'user_settings']

export function useFinanceSync(): void {
  const user = useAuthStore((state) => state.user)
  const initialize = useFinanceStore((state) => state.initialize)
  const setOnline = useFinanceStore((state) => state.setOnline)
  const syncQueue = useFinanceStore((state) => state.syncQueue)
  const mergeRealtime = useFinanceStore((state) => state.mergeRealtime)

  useEffect(() => {
    if (user) void initialize(user.id)
  }, [initialize, user])

  useEffect(() => {
    const online = (): void => { setOnline(true); void syncQueue() }
    const offline = (): void => setOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
  }, [setOnline, syncQueue])

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    const channel = supabase.channel(`finance-${user.id}`)
    for (const table of tables) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          mergeRealtime(table, payload.eventType, payload.new, payload.old)
        }
      })
    }
    void channel.subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [mergeRealtime, user])
}
