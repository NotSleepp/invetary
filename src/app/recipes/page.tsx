'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeList } from '@/components/RecipeList'
import { Recipe, Product, Material } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchRecipes()
    fetchProducts()
    fetchMaterials()
  }, [])

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from('recipes').select('*')
    if (error) {
      showToast('Error fetching recipes', 'error')
    } else {
      setRecipes(data || [])
    }
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('id, name')
    if (error) {
      showToast('Error fetching products', 'error')
    } else {
      setProducts(data || [])
    }
  }

  const fetchMaterials = async () => {
    const { data, error } = await supabase.from('materials').select('id, name')
    if (error) {
      showToast('Error fetching materials', 'error')
    } else {
      setMaterials(data || [])
    }
  }

  const handleSubmit = async (data: Partial<Recipe>) => {
    try {
      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update(data)
          .eq('id', editingRecipe.id)
        if (error) throw error
        setEditingRecipe(null)
        showToast('Recipe updated successfully', 'success')
      } else {
        const { error } = await supabase.from('recipes').insert(data)
        if (error) throw error
        showToast('Recipe added successfully', 'success')
      }
      fetchRecipes()
    } catch (error) {
      showToast('Error saving recipe', 'error')
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
  }

  const handleDelete = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
      if (error) throw error
      showToast('Recipe deleted successfully', 'success')
      fetchRecipes()
    } catch (error) {
      showToast('Error deleting recipe', 'error')
    }
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Recipes</h1>
        <RecipeForm
          recipe={editingRecipe || undefined}
          products={products}
          materials={materials}
          onSubmit={handleSubmit}
        />
        <RecipeList
          recipes={recipes}
          products={products}
          materials={materials}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}