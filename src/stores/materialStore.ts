import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Material } from '@/types'

interface MaterialState {
  materials: Material[]
  isLoading: boolean
  error: string | null
  fetchMaterials: () => Promise<void>
  addMaterial: (material: Partial<Material>) => Promise<void>
  updateMaterial: (id: string, material: Partial<Material>) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
  materials: [],
  isLoading: false,
  error: null,

  fetchMaterials: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name', { ascending: true })
        .range(0, 49)
      if (error) throw error
      set({ materials: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error fetching materials', isLoading: false })
    }
  },

  addMaterial: async (material) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert(material)
        .select()
      if (error) throw error
      set(state => ({ materials: [...state.materials, data[0]] }))
    } catch (error) {
      set({ error: 'Error adding material' })
    }
  },

  updateMaterial: async (id, material) => {
    try {
      // Remove the 'id' field from the material object
      const { id: _, ...updateData } = material;
  
      const { data, error } = await supabase
        .from('materials')
        .update(updateData)
        .eq('id', id)
        .select()
      if (error) throw error
      set(state => ({
        materials: state.materials.map(m => m.id === id ? data[0] : m)
      }))
    } catch (error) {
      set({ error: 'Error updating material' })
    }
  },

  deleteMaterial: async (id) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)
      if (error) throw error
      set(state => ({
        materials: state.materials.filter(m => m.id !== id)
      }))
    } catch (error) {
      set({ error: 'Error deleting material' })
    }
  },
}))