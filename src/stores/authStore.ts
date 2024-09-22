import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ user: data.user as User, isLoading: false });
    } catch (error) {
      set({ error: 'Correo electrónico o contraseña inválidos', isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signOut();
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cerrar sesión', isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user: user as User | null, isLoading: false });
    } catch (error) {
      set({ error: 'Error al verificar la autenticación', isLoading: false });
    }
  },
}));