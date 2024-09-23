'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types' // Ajusta la ruta según donde esté definido User
import Spinner from '@/components/ui/Spinner' // Asegúrate de tener un componente Spinner

interface AuthContextType {
  user: SupabaseUser | null
  role: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
  updateUserContext: (user: SupabaseUser) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  signIn: async () => {},
  signOut: async () => {},
  loading: true,
  updateUserContext: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Error loading session:', sessionError)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select(`
              username,
              user_roles (
                roles (
                  name
                )
              )
            `)
            .eq('auth_id', session.user.id)

          if (error) {
            console.error('Error fetching user profile:', error)
            setRole('user') // Rol por defecto
          } else {
            const userRole = profile?.[0]?.user_roles?.[0]?.roles?.[0]?.name || 'user'
            setRole(userRole)
          }
        } else {
          setRole(null)
        }
      } catch (error) {
        console.error('Error en la autenticación:', error)
      } finally {
        setLoading(false) // Asegura que el estado de loading siempre cambie
      }
    }

    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true) // Mostrar spinner durante el login
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true) // Mostrar spinner durante el logout
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, role, signIn, signOut, loading, updateUserContext: () => {} }}>
      {loading ? <Spinner /> : children} {/* Mostrar Spinner mientras carga la autenticación */}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
