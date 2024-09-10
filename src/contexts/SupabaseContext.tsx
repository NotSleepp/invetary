'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: SupabaseClient | null
}

const SupabaseContext = createContext<SupabaseContextType>({ supabase: null })

export const useSupabase = () => useContext(SupabaseContext)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseKey)
      setSupabase(supabaseClient)
    } else {
      console.error('Supabase URL or Key is missing')
    }
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}