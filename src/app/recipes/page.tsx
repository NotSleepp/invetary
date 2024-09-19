'use client'
import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe, Product, Material } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { RecipeList } from '@/components/RecipeList'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'

interface GroupedRecipe {
  productId: string;
  productName: string;
  recipes: Recipe[];
}

// Función para obtener recetas
const fetchRecipes = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      product_id,
      material_id,
      quantity_per_product,
      production_cost,
      materials (id, name)
    `)
  if (error) throw new Error('Error al obtener recetas')
  return data
}

// Función para obtener productos
const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('id, name')
  if (error) throw new Error('Error al obtener productos')
  return data
}

// Función para obtener materiales
const fetchMaterials = async () => {
  const { data, error } = await supabase.from('materials').select('id, name')
  if (error) throw new Error('Error al obtener materiales')
  return data
}

export default function RecipesPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<GroupedRecipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Queries para obtener recetas, productos y materiales
  const { data: recipes, isLoading: loadingRecipes, error: errorRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    staleTime: 1000 * 60 * 5,
  })

  const { data: products, isLoading: loadingProducts, error: errorProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  })

  const { data: materials, isLoading: loadingMaterials, error: errorMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: fetchMaterials,
    staleTime: 1000 * 60 * 5,
  })

  // Mutación para guardar o actualizar una receta
  const saveRecipeMutation = useMutation({
    mutationFn: async (data: Partial<Recipe>) => {
      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update(data)
          .eq('id', editingRecipe.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('recipes').insert(data)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recipes']
      });
      setEditingRecipe(null)
      showToast('Receta guardada con éxito', 'success')
    },
    onError: () => {
      showToast('Error al guardar la receta', 'error')
    },
  })

  // Mutación para eliminar una receta
  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recipes']
      });
      showToast('Receta eliminada con éxito', 'success')
      setSelectedProduct(null)
      setIsModalOpen(false)
    },
    onError: () => {
      showToast('Error al eliminar la receta', 'error')
    },
  })

  const handleSubmit = (data: Partial<Recipe>) => {
    saveRecipeMutation.mutate(data)
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setSelectedProduct(null)
    setIsModalOpen(false)
  }

  const handleDelete = (recipeId: string) => {
    deleteRecipeMutation.mutate(recipeId)
  }

  const handleCardClick = (groupedRecipe: GroupedRecipe) => {
    setSelectedProduct(groupedRecipe)
    setIsModalOpen(true)
  }

  // Agrupación de recetas por productos
  const groupRecipesByProduct = () => {
    const grouped = recipes?.reduce((acc, recipe) => {
      const product = products?.find(p => p.id === recipe.product_id)
      if (product) {
        const existingGroup = acc.find(g => g.productId === product.id)
        if (existingGroup) {
          existingGroup.recipes.push(recipe)
        } else {
          acc.push({
            productId: product.id,
            productName: product.name,
            recipes: [recipe]
          })
        }
      }
      return acc
    }, [] as GroupedRecipe[])
    return grouped || []
  }

  // Cargando o manejando errores
  if (loadingRecipes || loadingProducts || loadingMaterials) return <Spinner />
  if (errorRecipes || errorProducts || errorMaterials) {
    showToast('Error al cargar los datos', 'error')
    return null
  }

  const groupedRecipes = groupRecipesByProduct()

  return (
    <AuthGuard>
      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Recetas</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">{editingRecipe ? 'Editar Receta' : 'Añadir Nueva Receta'}</h2>
            <RecipeForm
              recipe={editingRecipe || undefined}
              products={products || []}
              materials={materials || []}
              onSubmit={handleSubmit}
            />
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Lista de Recetas</h2>
            <RecipeList
              recipes={recipes || []}
              products={products || []}
              materials={materials || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Tarjetas de Productos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedRecipes.map((groupedRecipe) => (
              <RecipeCard
                key={groupedRecipe.productId}
                productName={groupedRecipe.productName}
                recipeCount={groupedRecipe.recipes.length}
                onClick={() => handleCardClick(groupedRecipe)}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.productName}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <h3 className="font-semibold mt-4 mb-2">Recetas:</h3>
            {selectedProduct?.recipes.map((recipe) => (
              <div key={recipe.id} className="mb-4 pb-4 border-b last:border-b-0">
                <h4 className="font-medium">{recipe.name}</h4>
                <p><strong>Material:</strong> {recipe.materials?.name}</p>
                <p><strong>Cantidad por producto:</strong> {recipe.quantity_per_product}</p>
                <div className="flex justify-end space-x-2 mt-2">
                  <Button variant="outline" onClick={() => handleEdit(recipe)}>Editar</Button>
                  <Button variant="destructive" onClick={() => handleDelete(recipe.id)}>Eliminar</Button>
                </div>
              </div>
            ))}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}
