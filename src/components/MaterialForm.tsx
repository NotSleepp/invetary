'use client'

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from './ui/Button';
import { Material, Category, Supplier } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { Input } from './ui/Input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/Select';

interface MaterialFormProps {
  material?: Material;
  categories: Category[];
  suppliers: Supplier[];
  onSubmit: (data: Partial<Material>) => void;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({ material, categories, suppliers, onSubmit }) => {
  const methods = useForm<Partial<Material>>({
    defaultValues: material || {},
  });
  const { register, handleSubmit, formState: { errors } } = methods;
  const { showToast } = useToast();

  const onSubmitForm = async (data: Partial<Material>) => {
    try {
      const { id, ...submitData } = data;
      await onSubmit(submitData);
      showToast('Material guardado exitosamente', 'success');
    } catch (error) {
      showToast('Error al guardar el material', 'error');
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
              placeholder="Ingrese el nombre del material"
            />
            {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Input
              id="stock_quantity"
              type="number"
              label="Cantidad en stock"
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
            <Select
              id="supplier_id"
              label="Proveedor"
              options={suppliers.map(s => ({ value: s.id.toString(), label: s.name }))}
              {...register("supplier_id", { required: "El proveedor es requerido" })}
              className={`w-full px-3 py-2 border rounded-md ${errors.supplier_id ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.supplier_id && <p className="text-red-500 text-xs italic">{errors.supplier_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Input
              id="cost_per_unit"
              type="number"
              label="Costo por unidad"
              step="0.01"
              {...register("cost_per_unit", { required: "El costo por unidad es requerido", min: 0 })}
              className={`w-full px-3 py-2 border rounded-md ${errors.cost_per_unit ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Ingrese el costo por unidad"
            />
            {errors.cost_per_unit && <p className="text-red-500 text-xs italic">{errors.cost_per_unit.message}</p>}
          </div>

          <div className="space-y-2">
            <Input
              id="reorder_level"
              label="Reordenamiento"
              {...register("reorder_level")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el nivel de reordenamiento"
            />
          </div>

          <div className="space-y-2">
            <Input
              id="reorder_quantity"
              type="number"
              label="Cantidad de reorden"
              {...register("reorder_quantity")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese la cantidad de reorden"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label htmlFor="description" className="text-sm font-bold">Descripción</label>
            <Textarea
              id="description"
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Ingrese la descripción del material"
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Guardar Ingrediente
        </Button>
      </form>
    </FormProvider>
  );
};