'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe, Product, Material } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { RecipeList } from '@/components/RecipeList'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useRecipeStore } from '@/stores/recipeStore'
import { useProductStore } from '@/stores/productStore'
import { useMaterialStore } from '@/stores/materialStore'

interface GroupedRecipe {
  productId: string;
  productName: string;
  recipes: Recipe[];
}

export default function RecipesPage() {
  const { showToast } = useToast()
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<GroupedRecipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null)

  const { 
    recipes, 
    isLoading: loadingRecipes, 
    error: errorRecipes, 
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    totalCount,
    currentPage
  } = useRecipeStore()

  const { 
    products, 
    isLoading: loadingProducts, 
    error: errorProducts, 
    fetchProducts 
  } = useProductStore()

  const { 
    materials, 
    isLoading: loadingMaterials, 
    error: errorMaterials, 
    fetchMaterials 
  } = useMaterialStore()

  useEffect(() => {
    fetchRecipes()
    fetchProducts()
    fetchMaterials()
  }, [fetchRecipes, fetchProducts, fetchMaterials])

  const handleSubmit = useCallback(async (data: Partial<Recipe>) => {
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, data)
      } else {
        await addRecipe(data)
      }
      setEditingRecipe(null)
      showToast('Receta guardada con éxito', 'success')
    } catch (error) {
      showToast('Error al guardar la receta', 'error')
    }
  }, [editingRecipe, updateRecipe, addRecipe, showToast])

  const handleEdit = useCallback((recipe: Recipe) => {
    setEditingRecipe(recipe)
    setSelectedProduct(null)
    setIsModalOpen(false)
  }, [])

  const handleDelete = useCallback((recipeId: string) => {
    setDeletingRecipeId(recipeId)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (deletingRecipeId) {
      try {
        await deleteRecipe(deletingRecipeId)
        showToast('Receta eliminada con éxito', 'success')
        setSelectedProduct(null)
        setIsModalOpen(false)
      } catch (error) {
        showToast('Error al eliminar la receta', 'error')
      }
      setDeletingRecipeId(null)
    }
  }, [deletingRecipeId, deleteRecipe, showToast])

  const handleCardClick = useCallback((groupedRecipe: GroupedRecipe) => {
    setSelectedProduct(groupedRecipe)
    setIsModalOpen(true)
  }, [])

  const groupedRecipes = useMemo(() => {
    return recipes.reduce((acc, recipe) => {
      if (recipe.product) {
        const existingGroup = acc.find(g => g.productId === recipe.product_id);
        if (existingGroup) {
          existingGroup.recipes.push(recipe);
        } else {
          acc.push({
            productId: recipe.product_id,
            productName: recipe.product.name,
            recipes: [recipe]
          });
        }
      }
      return acc;
    }, [] as GroupedRecipe[]);
  }, [recipes]);

  const loadMore = useCallback(() => {
    fetchRecipes(currentPage + 1)
  }, [fetchRecipes, currentPage])

  if (loadingRecipes || loadingProducts || loadingMaterials) return <Spinner />
  if (errorRecipes || errorProducts || errorMaterials) {
    return (
      <div>
        <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo." />
        <Button onClick={() => fetchRecipes()}>Reintentar</Button>
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
              products={products || []}
              materials={materials || []}
              onSubmit={handleSubmit}
            />
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Lista de Recetas</h2>
            <RecipeList
              recipes={recipes}
              products={products || []}
              materials={materials || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {recipes.length < totalCount && (
              <Button onClick={loadMore} className="mt-4">
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
                <h4 className="font-medium">{recipe.product?.name}</h4>
                <p><strong>Material:</strong> {recipe.material?.name}</p>
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