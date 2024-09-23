'use client'

import React, { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { Recipe, Product, Material, RecipeFormData, Category } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { PlusIcon, MinusIcon, ChevronUpIcon, ChevronDownIcon, CakeIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ProductForm } from '@/components/ProductForm'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface RecipeFormProps {
  recipe?: Recipe
  products: Product[]
  materials: Material[]
  categories: Category[]
  onSubmit: (data: RecipeFormData) => void
  onCreateProduct: (productData: Partial<Product>) => Promise<void>
  isCreatingProduct: boolean 
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  products,
  materials,
  categories,
  onSubmit,
  onCreateProduct,
  isCreatingProduct 
}) => {
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<RecipeFormData>({
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
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "materials"
  });
  const { showToast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const watchMaterials = watch('materials')

  const onSubmitForm = async (data: RecipeFormData) => {
    try {
      await onSubmit(data)
      reset()
      showToast('Receta guardada con éxito', 'success')
    } catch (error) {
      showToast('Error al guardar la receta', 'error')
    }
  }

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      await onCreateProduct(productData)
      setIsModalOpen(false)
      showToast('Producto creado con éxito', 'success')
    } catch (error) {
      showToast('Error al crear el producto', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#101826] to-[#1e2837] text-white">
          <CardTitle className="text-2xl font-bold flex items-center">
            <CakeIcon className="mr-2 h-6 w-6" />
            Detalles de la Receta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-2/3">
              <Label htmlFor="product_id" className="text-sm font-medium text-gray-700 mb-1">Producto</Label>
              <Controller
                name="product_id"
                control={control}
                rules={{ required: 'El producto es requerido' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    id="product_id"
                    options={products.map(product => ({ value: product.id, label: product.name }))}
                    label="Seleccionar producto"
                    className="w-full"
                  />
                )}
              />
              {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>}
            </div>
            <Button 
              type="button" 
              onClick={() => setIsModalOpen(true)} 
              variant="outline"
              disabled={isCreatingProduct}
              className="w-full md:w-auto transition duration-150 ease-in-out hover:bg-blue-50"
            >
              {isCreatingProduct ? 'Creando...' : 'Crear Producto'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1e2837] to-[#101826] text-white">
          <CardTitle className="text-2xl font-bold">Ingredientes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Controller
                        name={`materials.${index}.material_id` as const}
                        control={control}
                        rules={{ required: 'El Ingrediente es requerido' }}
                        render={({ field }) => (
                          <Select
                            id={`materials.${index}.material_id`}
                            options={materials.map(material => ({ value: material.id, label: material.name }))}
                            {...field}
                            error={errors.materials?.[index]?.material_id?.message}
                            label="Ingrediente"
                            className="w-full"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        name={`materials.${index}.quantity_per_product` as const}
                        control={control}
                        rules={{ required: 'La cantidad es requerida', min: 0 }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="Cantidad"
                            id={`materials.${index}.quantity_per_product`}
                            type="number"
                            step="0.01"
                            placeholder="Cantidad"
                            className="w-full"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                      disabled={index === 0}
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                      disabled={index === fields.length - 1}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button
            type="button"
            onClick={() => append({ material_id: '', quantity_per_product: 0 })}
            variant="outline"
            className="mt-6 w-full transition duration-150 ease-in-out hover:bg-green-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Ingrediente
          </Button>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md"
      >
        {recipe ? 'Actualizar' : 'Crear'} Receta
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Producto">
        <ProductForm
          categories={categories}
          onSubmit={handleCreateProduct}
        />
      </Modal>
    </form>
  )
}