import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Recipe, Product, Material } from '@/types'

interface RecipeState {
  recipes: Recipe[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  fetchRecipes: (page?: number) => Promise<void>
  addRecipe: (recipe: Partial<Recipe>) => Promise<void>
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>
  deleteRecipe: (id: string) => Promise<void>
}

const ITEMS_PER_PAGE = 20

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 0,

  fetchRecipes: async (page = 0) => {
    set({ isLoading: true, error: null })
    try {
      const from = page * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      const { data, error, count } = await supabase
        .from('recipes')
        .select(`
          id,
          product_id,
          material_id,
          quantity_per_product,
          production_cost,
          materials (id, name),
          products (id, name)
        `, { count: 'exact' })
        .range(from, to)
        .order('id', { ascending: false })
      if (error) throw error
      set(state => ({
        recipes: page === 0 ? data : [...state.recipes, ...data],
        totalCount: count || 0,
        currentPage: page,
        isLoading: false
      }))
    } catch (error) {
      set({ error: 'Error al obtener recetas', isLoading: false })
    }
  },

  addRecipe: async (recipe) => {
    try {
      const { data, error } = await supabase.from('recipes').insert(recipe).select()
      if (error) throw error
      set(state => ({ recipes: [data[0], ...state.recipes] }))
    } catch (error) {
      set({ error: 'Error al añadir receta' })
    }
  },

  updateRecipe: async (id, recipe) => {
    try {
      const { data, error } = await supabase.from('recipes').update(recipe).eq('id', id).select()
      if (error) throw error
      set(state => ({
        recipes: state.recipes.map(r => r.id === id ? data[0] : r)
      }))
    } catch (error) {
      set({ error: 'Error al actualizar receta' })
    }
  },

  deleteRecipe: async (id) => {
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id)
      if (error) throw error
      set(state => ({
        recipes: state.recipes.filter(r => r.id !== id)
      }))
    } catch (error) {
      set({ error: 'Error al eliminar receta' })
    }
  },
}))