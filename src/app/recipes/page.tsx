'use client'
import React, { useState, useMemo, useCallback } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe as ImportedRecipe, Product as ImportedProduct, Material as ImportedMaterial } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { RecipeList } from '@/components/RecipeList'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Extiende los tipos importados si es necesario
interface Recipe extends ImportedRecipe {
  products: { id: string; name: string }[];
  materials: { id: string; name: string }[];
}

interface Product extends Omit<ImportedProduct, 'sale_price' | 'created_at'> {
  sale_price?: number;
  created_at?: string;
}

interface Material extends Omit<ImportedMaterial, 'supplier_id' | 'created_at'> {
  supplier_id?: string;
  created_at?: string;
}

interface GroupedRecipe {
  productId: string;
  productName: string;
  recipes: Recipe[];
}

const ITEMS_PER_PAGE = 20

// Función para obtener recetas paginadas
const fetchRecipes = async ({ pageParam = 0 }): Promise<{ data: Recipe[], nextPage: number | undefined, count: number }> => {
  const from = pageParam * ITEMS_PER_PAGE
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
  if (error) throw new Error('Error al obtener recetas')
  return { 
    data, 
    nextPage: to < (count || 0) ? pageParam + 1 : undefined, 
    count: count || 0  // Aseguramos que count sea un número
  }
}

// Actualiza las funciones de obtención
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('id, name, user_id, stock_quantity, category_id, cost_price')
  if (error) throw new Error('Error al obtener productos')
  return data as Product[]
}

const fetchMaterials = async (): Promise<Material[]> => {
  const { data, error } = await supabase.from('materials').select('id, name, user_id, stock_quantity, cost_per_unit, category_id')
  if (error) throw new Error('Error al obtener materiales')
  return data as Material[]
}

export default function RecipesPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<GroupedRecipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null)

  // Query infinita para obtener recetas
  const {
    data: recipesData,
    fetchNextPage,
    hasNextPage,
    isLoading: loadingRecipes,
    error: errorRecipes,
    refetch: refetchRecipes
  } = useInfiniteQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
  })

  // Queries para obtener productos y materiales
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
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setEditingRecipe(null)
      showToast('Receta guardada con éxito', 'success')
    },
    onError: (error: Error) => {
      showToast(`Error al guardar la receta: ${error.message}`, 'error')
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
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      showToast('Receta eliminada con éxito', 'success')
      setSelectedProduct(null)
      setIsModalOpen(false)
      setDeletingRecipeId(null)
    },
    onError: (error: Error) => {
      showToast(`Error al eliminar la receta: ${error.message}`, 'error')
    },
  })

  const handleSubmit = useCallback((data: Partial<Recipe>) => {
    saveRecipeMutation.mutate(data)
  }, [saveRecipeMutation])

  const handleEdit = useCallback((recipe: ImportedRecipe) => {
    setEditingRecipe(recipe as Recipe)
    setSelectedProduct(null)
    setIsModalOpen(false)
  }, [])

  const handleDelete = useCallback((recipeId: string) => {
    setDeletingRecipeId(recipeId)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingRecipeId) {
      deleteRecipeMutation.mutate(deletingRecipeId)
    }
  }, [deletingRecipeId, deleteRecipeMutation])

  const handleCardClick = useCallback((groupedRecipe: GroupedRecipe) => {
    setSelectedProduct(groupedRecipe)
    setIsModalOpen(true)
  }, [])

  // Agrupación de recetas por productos
  const groupedRecipes = useMemo(() => {
    if (!recipesData) return []
    const allRecipes = recipesData.pages.flatMap(page => page.data)
    return allRecipes.reduce((acc, recipe) => {
      const product = recipe.products && recipe.products[0]
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
  }, [recipesData])

  // Cargando o manejando errores
  if (loadingRecipes || loadingProducts || loadingMaterials) return <Spinner />
  if (errorRecipes || errorProducts || errorMaterials) {
    return (
      <div>
        <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo." />
        <Button onClick={() => refetchRecipes()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Recetas</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">{editingRecipe ? 'Editar Receta' : 'Añadir Nueva Receta'}</h2>
            <RecipeForm
              recipe={editingRecipe || undefined}
              products={products as ImportedProduct[] || []}
              materials={materials as ImportedMaterial[] || []}
              onSubmit={handleSubmit}
            />
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Lista de Recetas</h2>
            <RecipeList
              recipes={recipesData?.pages.flatMap(page => page.data) || []}
              products={products as ImportedProduct[] || []}
              materials={materials as ImportedMaterial[] || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {hasNextPage && (
              <Button onClick={() => fetchNextPage()} className="mt-4">
                Cargar más recetas
              </Button>
            )}
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
                <h4 className="font-medium">{recipe.products[0]?.name}</h4>
                <p><strong>Material:</strong> {recipe.materials[0]?.name}</p>
                <p><strong>Cantidad por producto:</strong> {recipe.quantity_per_product}</p>
                <div className="flex justify-end space-x-2 mt-2">
                  <Button variant="secondary" onClick={() => handleEdit(recipe)}>Editar</Button>
                  <Button variant="danger" onClick={() => handleDelete(recipe.id)}>Eliminar</Button>
                </div>
              </div>
            ))}
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingRecipeId}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingRecipeId(null)}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar esta receta? Esta acción no se puede deshacer."
      />
    </AuthGuard>
  )
}
