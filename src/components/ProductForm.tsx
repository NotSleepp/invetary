'use client'

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from './ui/Button';
import { Product, Category } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { Input } from './ui/Input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/Select';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: Partial<Product>) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSubmit }) => {
  const methods = useForm<Partial<Product>>({
    defaultValues: product || {},
  });
  const { register, handleSubmit, formState: { errors } } = methods;
  const { showToast } = useToast();

  const onSubmitForm = async (data: Partial<Product>) => {
    try {
      await onSubmit(data);
      showToast('Producto guardado exitosamente', 'success');
    } catch (error) {
      showToast('Error al guardar el producto', 'error');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Input
              id="name"
              label="Nombre"
              {...register("name", { required: "El nombre es requerido" })}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Ingrese el nombre del producto"
            />
            {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Input
              id="stock_quantity"
              type="number"
              label="Cantidad"
              {...register("stock_quantity", { required: "La cantidad es requerida", min: 0 })}
              className={`w-full px-3 py-2 border rounded-md ${errors.stock_quantity ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Ingrese la cantidad"
            />
            {errors.stock_quantity && <p className="text-red-500 text-xs italic">{errors.stock_quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Select
              id="category_id"
              label="Categoría"
              options={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
              {...register("category_id", { required: "La categoría es requerida" })}
              className={`w-full px-3 py-2 border rounded-md ${errors.category_id ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.category_id && <p className="text-red-500 text-xs italic">{errors.category_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              label="Precio de costo"
              {...register("cost_price", { required: "El precio de costo es requerido", min: 0 })}
              className={`w-full px-3 py-2 border rounded-md ${errors.cost_price ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Ingrese el precio de costo"
            />
            {errors.cost_price && <p className="text-red-500 text-xs italic">{errors.cost_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Input
              id="sale_price"
              type="number"
              step="0.01"
              label="Precio de venta"
              {...register("sale_price", { required: "El precio de venta es requerido", min: 0 })}
              className={`w-full px-3 py-2 border rounded-md ${errors.sale_price ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Ingrese el precio de venta"
            />
            {errors.sale_price && <p className="text-red-500 text-xs italic">{errors.sale_price.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <label htmlFor="description" className="text-sm font-bold">Descripción</label>
            <textarea
              id="description"
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Guardar Producto
        </Button>
      </form>
    </FormProvider>
  );
};