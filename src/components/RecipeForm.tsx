'use client'

import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { Recipe, Product, Material, RecipeFormData } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { PlusIcon, MinusIcon } from 'lucide-react'

interface RecipeFormProps {
  recipe?: Recipe
  products: Product[]
  materials: Material[]
  onSubmit: (data: RecipeFormData) => void
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, products, materials, onSubmit }) => {
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<RecipeFormData>({
    defaultValues: recipe
      ? {
        product_id: recipe.product_id,
        materials: [{
          material_id: recipe.material_id,
          quantity_per_product: recipe.quantity_per_product,
        }]
      }
      : {
        product_id: '',
        materials: [{ material_id: '', quantity_per_product: 0 }]
      },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials"
  });
  const { showToast } = useToast()

  const onSubmitForm = async (data: RecipeFormData) => {
    try {
      await onSubmit(data)
      reset()
      showToast('Recipe saved successfully', 'success')
    } catch (error) {
      showToast('Error saving recipe', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Select
          label="Producto"
          options={products.map(product => ({ value: product.id, label: product.name }))}
          {...register('product_id', { required: 'Product is required' })}
          error={errors.product_id?.message}
          className="mb-4"
        />

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
              <Select
                label="Material"
                options={materials.map(material => ({ value: material.id, label: material.name }))}
                {...register(`materials.${index}.material_id` as const, { required: 'Material is required' })}
                error={errors.materials?.[index]?.material_id?.message}
                className="flex-grow"
              />
              <Input
                label="Cantidad"
                type="number"
                step="0.01"
                {...register(`materials.${index}.quantity_per_product` as const, { required: 'Quantity is required', min: 0 })}
                error={errors.materials?.[index]?.quantity_per_product?.message}
                className="w-32"
              />
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  variant="secondary"
                  className="flex-shrink-0 h-10 w-10"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={() => append({ material_id: '', quantity_per_product: 0 })}
          variant="secondary"
          className="mt-4"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar Material
        </Button>
      </div>

      <Button type="submit" className="w-full">
        {recipe ? 'Actualizar' : 'Crear'} Receta
      </Button>
    </form>
  )
}