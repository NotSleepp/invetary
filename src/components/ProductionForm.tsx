'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { ProductionLog, Product, Recipe, Material } from '@/types'
import { useToast } from '@/contexts/ToastContext'

interface ProductionFormProps {
  productionLog?: ProductionLog;
  onSubmit: (data: Partial<ProductionLog>) => Promise<void>;
  products: (Product & { recipes: Recipe[] })[];
  materials: Material[];
}

export const ProductionForm: React.FC<ProductionFormProps> = ({ productionLog, onSubmit, products, materials }) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Partial<ProductionLog>>({
    defaultValues: productionLog || {}
  })
  const { showToast } = useToast()

  const selectedProductId = watch('product_id')
  const quantityProduced = watch('quantity_produced')

  const onSubmitForm = async (data: Partial<ProductionLog>) => {
    try {
      const selectedProduct = products.find(p => p.id === data.product_id)
      if (!selectedProduct) {
        throw new Error('Producto seleccionado no encontrado')
      }

      const totalCost = selectedProduct.recipes.reduce((acc, recipe) => {
        const material = materials.find(m => m.id === recipe.material_id)
        return acc + (material?.cost_per_unit || 0) * recipe.quantity_per_product * (Number(data.quantity_produced) || 0)
      }, 0)

      await onSubmit({ ...data, total_cost: totalCost })
      showToast('Registro de producción guardado con éxito', 'success')
    } catch (error) {
      console.error('Error al guardar el registro de producción:', error)
      showToast('Error al guardar el registro de producción', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Select
        label="Producto"
        options={products.map(product => ({ value: product.id, label: product.name }))}
        {...register('product_id', { required: 'El producto es requerido' })}
        error={errors.product_id?.message}
      />
      <Input
        label="Cantidad Producida"
        type="number"
        {...register('quantity_produced', { 
          required: 'La cantidad es requerida', 
          min: { value: 1, message: 'La cantidad debe ser mayor que 0' }
        })}
        error={errors.quantity_produced?.message}
      />
      {selectedProductId && quantityProduced && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Materiales Necesarios:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {products
              .find(p => p.id === selectedProductId)
              ?.recipes.map(recipe => {
                const material = materials.find(m => m.id === recipe.material_id)
                const quantityNeeded = recipe.quantity_per_product * Number(quantityProduced)
                return (
                  <li key={recipe.id} className={material?.stock_quantity && quantityNeeded > material.stock_quantity ? 'text-red-500' : ''}>
                    {material?.name}: {quantityNeeded.toFixed(2)} 
                    {material?.stock_quantity && quantityNeeded > material.stock_quantity && ' (Stock insuficiente)'}
                  </li>
                )
              })}
          </ul>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : (productionLog ? 'Actualizar Registro' : 'Crear Registro')}
      </Button>
    </form>
  )
}