'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { ProductionLog, Product, Recipe, Material } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

interface ProductionFormProps {
  onSubmit: (data: Partial<ProductionLog>) => void
}

export const ProductionForm: React.FC<ProductionFormProps> = ({ onSubmit }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Partial<ProductionLog>>()
  const { showToast } = useToast()

  const selectedProductId = watch('product_id')
  const quantityProduced = watch('quantity_produced')

  useEffect(() => {
    fetchProducts()
    fetchRecipes()
    fetchMaterials()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      showToast('Error fetching products', 'error')
    } else {
      setProducts(data || [])
    }
  }

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from('recipes').select('*')
    if (error) {
      showToast('Error fetching recipes', 'error')
    } else {
      setRecipes(data || [])
    }
  }

  const fetchMaterials = async () => {
    const { data, error } = await supabase.from('materials').select('*')
    if (error) {
      showToast('Error fetching materials', 'error')
    } else {
      setMaterials(data || [])
    }
  }

  const onSubmitForm = async (data: Partial<ProductionLog>) => {
    try {
      const productRecipes = recipes.filter(recipe => recipe.product_id === data.product_id)
      const totalCost = productRecipes.reduce((acc, recipe) => {
        const material = materials.find(m => m.id === recipe.material_id)
        return acc + (material?.cost_per_unit || 0) * recipe.quantity_per_product * (data.quantity_produced || 0)
      }, 0)

      await onSubmit({ ...data, total_cost: totalCost })
      showToast('Production log saved successfully', 'success')
    } catch (error) {
      showToast('Error saving production log', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Select
        label="Producto"
        options={products.map(product => ({ value: product.id, label: product.name }))}
        {...register('product_id', { required: 'Product is required' })}
        error={errors.product_id?.message}
      />
      <Input
        label="Cantidad"
        type="number"
        {...register('quantity_produced', { required: 'Quantity is required', min: 1 })}
        error={errors.quantity_produced?.message}
      />
      {selectedProductId && quantityProduced && (
        <div className="mt-4">
          <h3 className="font-bold">Materiales Necesarios:</h3>
          <ul>
            {recipes
              .filter(recipe => recipe.product_id === selectedProductId)
              .map(recipe => {
                const material = materials.find(m => m.id === recipe.material_id)
                const quantityNeeded = recipe.quantity_per_product * Number(quantityProduced)
                return (
                  <li key={recipe.id}>
                    {material?.name}: {quantityNeeded} {material?.stock_quantity && quantityNeeded > material.stock_quantity && ' (Insufficient stock)'}
                  </li>
                )
              })}
          </ul>
        </div>
      )}
      <Button type="submit">Guardar</Button>
    </form>
  )
}