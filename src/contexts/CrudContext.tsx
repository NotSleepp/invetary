'use client'

import { createContext, useContext } from 'react'
import { useSupabase } from './SupabaseContext'

type CrudContextType = {
  create: (table: string, data: any) => Promise<any>
  read: (table: string, query?: any) => Promise<any>
  update: (table: string, id: string, data: any) => Promise<any>
  delete: (table: string, id: string) => Promise<any>
}

const CrudContext = createContext<CrudContextType | null>(null)

export const useCrud = () => {
  const context = useContext(CrudContext)
  if (!context) {
    throw new Error('useCrud must be used within a CrudProvider')
  }
  return context
}

export function CrudProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()

  const create = async (table: string, data: any) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data: result, error } = await supabase.from(table).insert(data).select()
    if (error) throw error
    return result
  }

  const read = async (table: string, query?: any) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    let queryBuilder = supabase.from(table).select('*')
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value)
      })
    }
    const { data, error } = await queryBuilder
    if (error) throw error
    return data
  }

  const update = async (table: string, id: string, data: any) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
    if (error) throw error
    return result
  }

  const deleteRecord = async (table: string, id: string) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select()
    if (error) throw error
    return data
  }

  const value = {
    create,
    read,
    update,
    delete: deleteRecord,
  }

  return <CrudContext.Provider value={value}>{children}</CrudContext.Provider>
}