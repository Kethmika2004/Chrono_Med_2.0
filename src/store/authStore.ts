import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  role: 'patient' | 'doctor' | 'hospital' | 'superadmin'
  full_name: string
  is_verified: boolean
  preferred_language?: string
  email?: string
  contact_number?: string
  nic_or_passport?: string
  phone_number?: string
  date_of_birth?: string
  gender?: string
  emergency_contact?: {
    name: string
    relationship: string
    phone: string
  }
  // Doctor fields
  slmc_number?: string
  specialty?: string
  hospital_affiliations?: string[]
  // Hospital fields
  license_number?: string
  address?: string
  hotline?: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  role: 'patient' | 'doctor' | 'hospital' | 'superadmin' | null
  isLoading: boolean
  loading: boolean // compatibility flag
  isInitialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  loading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, role: profile?.role ?? null }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null })
  },
  initialize: async () => {
    if (get().isInitialized) return
    set({ isInitialized: true })
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
        
        if (profile) {
          set({ profile, role: profile.role })
        }
      }
    } catch (error) {
      console.error('Error initializing auth', error)
    } finally {
      set({ isLoading: false, loading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      set({ user })
      
      if (user) {
        set({ isLoading: true, loading: true })
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            set({ profile, role: profile.role })
          } else {
            set({ profile: null, role: null })
          }
        } catch (err) {
          console.error('Error fetching profile on auth state change', err)
          set({ profile: null, role: null })
        } finally {
          set({ isLoading: false, loading: false })
        }
      } else {
        set({ profile: null, role: null, isLoading: false, loading: false })
      }
    })
  },
}))
