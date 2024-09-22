'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types' // Ajusta la ruta según donde esté definido User

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Error loading session:', sessionError)
        setLoading(false)
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
          setRole('user')
        } else if (!profile || profile.length === 0) {
          // Usuario no encontrado, vamos a crearlo
          const username = session.user.email?.split('@')[0] || 'user' + Math.random().toString(36).substr(2, 9)
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              auth_id: session.user.id,
              username: username,
              email: session.user.email,
              password_hash: 'NO_PASSWORD'
            })
            .select()

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            setRole('user')
          } else {
            setRole('user') // Asigna un rol por defecto para el nuevo usuario
          }
        } else {
          const userRole = profile[0]?.user_roles[0]?.roles?.[0]?.name || 'user'
          setRole(userRole)
        }
      }
      setLoading(false)
    }

    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select(`
            user_roles (
              roles (
                name
              )
            )
          `)
          .eq('auth_id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          setRole('user')
        } else {
          const userRole = profile.user_roles[0]?.roles?.[0]?.name || 'user'
          setRole(userRole)
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateUserContext = (user: SupabaseUser) => {
    setUser(user)
    // Actualiza el rol si es necesario
  }

  return (
    <AuthContext.Provider value={{ user, role, signIn, signOut, loading, updateUserContext }}>
      {children}
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