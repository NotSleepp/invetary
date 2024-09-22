'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeCard } from '@/components/RecipeCard'
import { Recipe, Product, Material, RecipeFormData } from '@/types'
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
import { useCategoryStore } from '@/stores/categoryStore' // Asumiendo que existe este store

interface GroupedRecipe {
  productId: string;
  productName: string;
  recipes: Recipe[];
  totalProductionCost: number;
}

export default function RecipesPage() {
  const { showToast } = useToast()
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<GroupedRecipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)

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
    fetchProducts,
    addProduct // Añadimos esta función
  } = useProductStore()

  const { 
    materials, 
    isLoading: loadingMaterials, 
    error: errorMaterials, 
    fetchMaterials 
  } = useMaterialStore()

  const { 
    categories, 
    isLoading: loadingCategories, 
    error: errorCategories, 
    fetchCategories 
  } = useCategoryStore()

  useEffect(() => {
    fetchRecipes()
    fetchProducts()
    fetchMaterials()
    fetchCategories() // Añadir esta línea
  }, [fetchRecipes, fetchProducts, fetchMaterials, fetchCategories])

  const calculateProductionCost = useCallback((formMaterials: RecipeFormData['materials']) => {
    return formMaterials.reduce((total, formMaterial) => {
      const material = materials.find(m => m.id === formMaterial.material_id)
      const materialCost = material ? material.cost_per_unit : 0
      return total + (materialCost * formMaterial.quantity_per_product)
    }, 0)
  }, [materials])

  const handleSubmit = useCallback(async (data: RecipeFormData) => {
    try {
      const productionCost = calculateProductionCost(data.materials)

      if (editingRecipe) {
        // Update existing recipe
        await updateRecipe(editingRecipe.id, {
          product_id: data.product_id,
          material_id: data.materials[0].material_id,
          quantity_per_product: data.materials[0].quantity_per_product,
          production_cost: productionCost
        })
        // If there are additional materials, create them as new recipes
        for (let i = 1; i < data.materials.length; i++) {
          await addRecipe({
            product_id: data.product_id,
            material_id: data.materials[i].material_id,
            quantity_per_product: data.materials[i].quantity_per_product,
            production_cost: productionCost
          })
        }
      } else {
        // Create new recipes for each material
        for (const material of data.materials) {
          await addRecipe({
            product_id: data.product_id,
            material_id: material.material_id,
            quantity_per_product: material.quantity_per_product,
            production_cost: productionCost
          })
        }
      }
      setEditingRecipe(null)
      showToast('Receta guardada con éxito', 'success')
      fetchRecipes()
    } catch (error) {
      showToast('Error al guardar la receta', 'error')
    }
  }, [editingRecipe, updateRecipe, addRecipe, showToast, fetchRecipes, calculateProductionCost])

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
        fetchRecipes()
      } catch (error) {
        showToast('Error al eliminar la receta', 'error')
      }
      setDeletingRecipeId(null)
    }
  }, [deletingRecipeId, deleteRecipe, showToast, fetchRecipes])

  const handleCardClick = useCallback((groupedRecipe: GroupedRecipe) => {
    setSelectedProduct(groupedRecipe)
    setIsModalOpen(true)
  }, [])

  const calculateRecipeProductionCost = useCallback((recipe: Recipe) => {
    const material = materials.find(m => m.id === recipe.material_id);
    if (!material) return 0;
    return material.cost_per_unit * recipe.quantity_per_product;
  }, [materials]);

  const groupedRecipes = useMemo(() => {
    return recipes.reduce((acc, recipe) => {
      const product = products.find(p => p.id === recipe.product_id);
      const existingGroup = acc.find(g => g.productId === recipe.product_id);
      if (existingGroup) {
        existingGroup.recipes.push(recipe);
        existingGroup.totalProductionCost += calculateRecipeProductionCost(recipe);
      } else {
        acc.push({
          productId: recipe.product_id,
          productName: product ? product.name : '',
          recipes: [recipe],
          totalProductionCost: calculateRecipeProductionCost(recipe)
        });
      }
      return acc;
    }, [] as GroupedRecipe[]);
  }, [recipes, products, materials, calculateRecipeProductionCost]);

  const loadMore = useCallback(() => {
    fetchRecipes(currentPage + 1)
  }, [fetchRecipes, currentPage])

  const handleCreateProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      const newProduct = await addProduct(productData)
      showToast('Producto creado con éxito', 'success')
      fetchProducts() // Actualizamos la lista de productos
      return newProduct
    } catch (error) {
      showToast('Error al crear el producto', 'error')
      throw error // Propagamos el error para manejarlo en el componente RecipeForm si es necesario
    }
  }, [addProduct, showToast, fetchProducts])

  if (loadingRecipes || loadingProducts || loadingMaterials || loadingCategories) return <Spinner />
  if (errorRecipes || errorProducts || errorMaterials || errorCategories) {
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
              categories={categories || []}
              onSubmit={handleSubmit}
              onCreateProduct={handleCreateProduct}
              isCreatingProduct={isCreatingProduct}
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
                totalProductionCost={groupedRecipe.totalProductionCost}
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
            {selectedProduct?.recipes.map((recipe) => {
              const material = materials.find(m => m.id === recipe.material_id);
              return (
                <div key={recipe.id} className="mb-4 pb-4 border-b last:border-b-0">
                  <h4 className="font-medium">{recipe.product?.name}</h4>
                  <p><strong>Material:</strong> {material ? material.name : ''}</p>
                  <p><strong>Cantidad por producto:</strong> {recipe.quantity_per_product}</p>
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button variant="secondary" onClick={() => handleEdit(recipe)}>Editar</Button>
                    <Button variant="danger" onClick={() => handleDelete(recipe.id)}>Eliminar</Button>
                  </div>
                </div>
              );
            })}
            <p className="font-bold mt-4">Costo de producción total: ${selectedProduct?.totalProductionCost.toFixed(2)}</p>
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