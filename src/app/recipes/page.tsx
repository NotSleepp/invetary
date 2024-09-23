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
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useRecipeStore } from '@/stores/recipeStore'
import { useProductStore } from '@/stores/productStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Input } from '@/components/ui/Input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, SearchIcon } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)

  const { 
    recipes, 
    isLoading: loadingRecipes, 
    error: errorRecipes, 
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe
  } = useRecipeStore()

  const { 
    products, 
    isLoading: loadingProducts, 
    error: errorProducts, 
    fetchProducts,
    addProduct
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
    fetchCategories()
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
        await updateRecipe(editingRecipe.id, {
          product_id: data.product_id,
          material_id: data.materials[0].material_id,
          quantity_per_product: data.materials[0].quantity_per_product,
          production_cost: productionCost
        })
        for (let i = 1; i < data.materials.length; i++) {
          await addRecipe({
            product_id: data.product_id,
            material_id: data.materials[i].material_id,
            quantity_per_product: data.materials[i].quantity_per_product,
            production_cost: productionCost
          })
        }
      } else {
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
      setIsFormVisible(false)
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
    setIsFormVisible(true)
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

  const filteredGroupedRecipes = useMemo(() => {
    return groupedRecipes.filter(group => 
      group.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groupedRecipes, searchTerm]);

  const handleCreateProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      setIsCreatingProduct(true)
      const newProduct = await addProduct(productData)
      showToast('Producto creado con éxito', 'success')
      fetchProducts()
      return newProduct
    } catch (error) {
      showToast('Error al crear el producto', 'error')
      throw error
    } finally {
      setIsCreatingProduct(false)
    }
  }, [addProduct, showToast, fetchProducts])

  if (loadingRecipes || loadingProducts || loadingMaterials || loadingCategories) return <Spinner />
  if (errorRecipes || errorProducts || errorMaterials || errorCategories) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo." />
        <Button onClick={() => fetchRecipes()} className="mt-4">Reintentar</Button>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar recetas..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button 
            onClick={() => setIsFormVisible(!isFormVisible)} 
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            {isFormVisible ? 'Ocultar Formulario' : 'Añadir Nueva Receta'}
          </Button>
        </div>

        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 mb-8">
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
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroupedRecipes.map((groupedRecipe) => (
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">{selectedProduct?.productName}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <ScrollArea className="h-[60vh] pr-4">
              <h3 className="font-semibold mt-4 mb-2 text-lg text-gray-700">Receta:</h3>
              {selectedProduct?.recipes.map((recipe) => {
                const material = materials.find(m => m.id === recipe.material_id);
                return (
                  <div key={recipe.id} className="mb-4 pb-4 border-b last:border-b-0">
                    <h4 className="font-medium text-gray-800">{recipe.product?.name}</h4>
                    <p className="text-gray-600"><strong>Ingrediente:</strong> {material ? material.name : 'N/A'}</p>
                    <p className="text-gray-600"><strong>Cantidad:</strong> {recipe.quantity_per_product}</p>
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button variant="outline" onClick={() => handleEdit(recipe)} className="flex items-center">
                        Editar
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(recipe.id)} className="flex items-center">
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
            <p className="font-bold mt-4 text-gray-800">Costo de producción total: ${selectedProduct?.totalProductionCost.toFixed(2)}</p>
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