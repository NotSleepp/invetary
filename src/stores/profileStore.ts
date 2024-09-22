// stores/profileStore.ts
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface ProfileState {
  username: string
  email: string
  isLoading: boolean
  error: string | null
  setUsername: (username: string) => void
  setEmail: (email: string) => void
  updateProfile: (username: string, email: string) => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  username: '',
  email: '',
  isLoading: false,
  error: null,

  setUsername: (username) => set({ username }),
  setEmail: (email) => set({ email }),

  updateProfile: async (username, email) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.updateUser({ email, data: { username } })
      if (error) throw error
      set({ username, email, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      set({ 
        username: user?.user_metadata?.username || '', 
        email: user?.email || '', 
        isLoading: false 
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  }
}))