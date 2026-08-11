import { create } from 'zustand'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/services/supabase'

export interface AppUser {
  id: string
  email: string
}

interface AuthState {
  user: AppUser | null
  loading: boolean
  initialized: boolean
  isDemo: boolean
  initialize: () => Promise<() => void>
  sendOtp: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const demoUser: AppUser = { id: 'demo-user', email: 'demo@vertwo.app' }
const mapSession = (session: Session | null): AppUser | null => session?.user.email ? { id: session.user.id, email: session.user.email } : null

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  isDemo: !isSupabaseConfigured,
  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ user: demoUser, loading: false, initialized: true })
      return () => undefined
    }
    const { data, error } = await supabase.auth.getSession()
    if (error) set({ user: null, loading: false, initialized: true })
    else set({ user: mapSession(data.session), loading: false, initialized: true })
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      set({ user: mapSession(session), loading: false, initialized: true })
    })
    return () => listener.subscription.unsubscribe()
  },
  sendOtp: async (email) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    set({ loading: false })
    if (error) throw new Error(error.message)
  },
  signOut: async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)
      set({ user: null })
    }
  }
}))
