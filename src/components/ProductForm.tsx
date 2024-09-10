// ProductForm.tsx
'use client'

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormField from './FormField';
import { Button } from './ui/Button';
import { Product, Category } from '@/types';
import { useToast } from '@/contexts/ToastContext';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: Partial<Product>) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSubmit }) => {
  const methods = useForm<Partial<Product>>({
    defaultValues: product || {},
  });
  const { showToast } = useToast();

  const onSubmitForm = async (data: Partial<Product>) => {
    try {
      await onSubmit(data);
      showToast('Product saved successfully', 'success');
    } catch (error) {
      showToast('Error saving product', 'error');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitForm)} className='flex flex-col justify-center mb-10'>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <FormField name="name" label="Name" error={methods.formState.errors.name?.message} />
          <FormField name="description" label="Description" />
          <FormField name="stock_quantity" label="Stock Quantity" type="number" error={methods.formState.errors.stock_quantity?.message} />
          <FormField
            name="category_id"
            label="Category"
            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            error={methods.formState.errors.category_id?.message}
          />
          <FormField name="cost_price" label="Cost Price" type="number" step="0.01" error={methods.formState.errors.cost_price?.message} />
          <FormField name="sale_price" label="Sale Price" type="number" step="0.01" error={methods.formState.errors.sale_price?.message} />
          
        </div>
        <Button type="submit">Save Product</Button>
      </form>
    </FormProvider>
  );
};
