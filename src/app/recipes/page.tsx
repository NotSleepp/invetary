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

interface GroupedRecipe {
  productId: string;
  productName: string;
  recipes: Recipe[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [groupedRecipes, setGroupedRecipes] = useState<GroupedRecipe[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<GroupedRecipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchRecipes()
    fetchProducts()
    fetchMaterials()
  }, [])

  useEffect(() => {
    groupRecipesByProduct()
  }, [recipes, products])

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
    
    if (error) {
      showToast('Error al obtener recetas', 'error')
    } else {
      setRecipes(data || [])
    }
  }
  

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('id, name')
    if (error) {
      showToast('Error al obtener productos', 'error')
    } else {
      setProducts(data || [])
    }
  }

  const fetchMaterials = async () => {
    const { data, error } = await supabase.from('materials').select('id, name')
    if (error) {
      showToast('Error al obtener materiales', 'error')
    } else {
      setMaterials(data || [])
    }
  }

  const groupRecipesByProduct = () => {
    const grouped = recipes.reduce((acc, recipe) => {
      const product = products.find(p => p.id === recipe.product_id)
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
    setGroupedRecipes(grouped)
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
        showToast('Receta actualizada con éxito', 'success')
      } else {
        const { error } = await supabase.from('recipes').insert(data)
        if (error) throw error
        showToast('Receta añadida con éxito', 'success')
      }
      fetchRecipes()
    } catch (error) {
      showToast('Error al guardar la receta', 'error')
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setSelectedProduct(null)
    setIsModalOpen(false)
  }

  const handleDelete = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
      if (error) throw error
      showToast('Receta eliminada con éxito', 'success')
      fetchRecipes()
      setSelectedProduct(null)
      setIsModalOpen(false)
    } catch (error) {
      showToast('Error al eliminar la receta', 'error')
    }
  }

  const handleCardClick = (groupedRecipe: GroupedRecipe) => {
    setSelectedProduct(groupedRecipe)
    setIsModalOpen(true)
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
              products={products}
              materials={materials}
              onSubmit={handleSubmit}
            />
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Lista de Recetas</h2>
            <RecipeList
              recipes={recipes}
              products={products}
              materials={materials}
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
      {selectedProduct?.recipes.map((recipe, index) => (
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