'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { Recipe, Product, Material } from '@/types'
import { useToast } from '@/contexts/ToastContext'

interface RecipeFormProps {
  recipe?: Recipe
  products: Product[]
  materials: Material[]
  onSubmit: (data: Partial<Recipe>) => void
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, products, materials, onSubmit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Partial<Recipe>>({
    defaultValues: recipe || {},
  })
  const { showToast } = useToast()

  const onSubmitForm = async (data: Partial<Recipe>) => {
    try {
      await onSubmit(data)
      reset()
      showToast('Recipe saved successfully', 'success')
    } catch (error) {
      showToast('Error saving recipe', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 mb-6">
      <Select
        label="Product"
        options={products.map(product => ({ value: product.id, label: product.name }))}
        {...register('product_id', { required: 'Product is required' })}
        error={errors.product_id?.message}
      />
      <Select
        label="Material"
        options={materials.map(material => ({ value: material.id, label: material.name }))}
        {...register('material_id', { required: 'Material is required' })}
        error={errors.material_id?.message}
      />
      <Input
        label="Quantity per Product"
        type="number"
        step="0.01"
        {...register('quantity_per_product', { required: 'Quantity is required', min: 0 })}
        error={errors.quantity_per_product?.message}
      />
      <Input
        label="Production Cost"
        type="number"
        step="0.01"
        {...register('production_cost', { min: 0 })}
        error={errors.production_cost?.message}
      />
      <Button type="submit">{recipe ? 'Update' : 'Create'} Recipe</Button>
    </form>
  )
}