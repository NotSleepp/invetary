// MaterialForm.tsx
'use client'

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormField from './FormField';
import { Button } from './ui/Button';
import { Material, Category, Supplier } from '@/types';
import { useToast } from '@/contexts/ToastContext';

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
  const { showToast } = useToast();

  const onSubmitForm = async (data: Partial<Material>) => {
    try {
      await onSubmit(data); // user_id is managed in the backend
      showToast('Material saved successfully', 'success');
    } catch (error) {
      showToast('Error saving material', 'error');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitForm)}>
        <FormField name="name" label="Name" error={methods.formState.errors.name?.message} />
        <FormField name="description" label="Description" />
        <FormField name="stock_quantity" label="Stock Quantity" type="number" error={methods.formState.errors.stock_quantity?.message} />
        <FormField
          name="category_id"
          label="Category"
          options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
          error={methods.formState.errors.category_id?.message}
        />
        <FormField
          name="supplier_id"
          label="Supplier"
          options={suppliers.map(supplier => ({ value: supplier.id, label: supplier.name }))}
          error={methods.formState.errors.supplier_id?.message}
        />
        <FormField name="cost_per_unit" label="Cost per Unit" type="number" step="0.01" error={methods.formState.errors.cost_per_unit?.message} />
        <FormField name="reorder_level" label="Reorder Level" type="number" />
        <FormField name="reorder_quantity" label="Reorder Quantity" type="number" />
        <Button type="submit">Save Material</Button>
      </form>
    </FormProvider>
  );
};
