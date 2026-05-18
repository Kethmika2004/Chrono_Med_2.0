import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  role: 'patient' | 'doctor' | 'hospital' | 'superadmin'
  full_name: string
  is_verified: boolean
  // other profile fields
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      const user = session?.user ?? null
      set({ user })

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        set({ profile })
      }
    } catch (error) {
      console.error('Error initializing auth', error)
    } finally {
      set({ isLoading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null
      set({ user })
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        set({ profile })
      } else {
        set({ profile: null })
      }
    })
  },
}))
