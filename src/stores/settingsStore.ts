// stores/settingsStore.ts
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type ExtendedUser = User & { username?: string };

interface SettingsState {
  formData: {
    username: string;
    email: string;
  };
  isLoading: boolean;
  error: string | null;
  setFormData: (data: Partial<SettingsState['formData']>) => void;
  updateProfile: (user: ExtendedUser | null) => Promise<void>;
  initializeFormData: (user: ExtendedUser | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  formData: {
    username: '',
    email: '',
  },
  isLoading: false,
  error: null,

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),

  updateProfile: async (user) => {
    set({ isLoading: true, error: null })
    try {
      const { error, data } = await supabase.auth.updateUser({ 
        email: user?.email, 
        data: { username: user?.username } 
      })
      if (error) throw error
      set((state) => ({
        formData: {
          username: data.user.user_metadata.username || state.formData.username,
          email: data.user.email || state.formData.email,
        },
        isLoading: false
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  initializeFormData: (user) => {
    if (user) {
      set({
        formData: {
          username: user.username || '',
          email: user.email || '',
        }
      })
    }
  },
}))