import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (category: Partial<Category>) => Promise<void>
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
        .range(0, 49)
      if (error) throw error
      set({ categories: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error fetching categories', isLoading: false })
    }
  },

  addCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
      if (error) {
        if (error.code === '23505') {
          throw new Error('A category with this name already exists')
        }
        throw error
      }
      set(state => ({ categories: [...state.categories, data[0]] }))
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message })
      } else {
        set({ error: 'An unexpected error occurred while adding the category' })
      }
    }
  },

  updateCategory: async (id, category) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
      if (error) {
        if (error.code === '23505') {
          throw new Error('A category with this name already exists')
        }
        throw error
      }
      set(state => ({
        categories: state.categories.map(c => c.id === id ? data[0] : c)
      }))
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message })
      } else {
        set({ error: 'An unexpected error occurred while updating the category' })
      }
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      if (error) throw error
      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }))
    } catch (error) {
      set({ error: 'Error deleting category' })
    }
  },
}))