'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Category } from '@/types'
import { useToast } from '@/contexts/ToastContext'

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: Partial<Category>) => void
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Partial<Category>>({
    defaultValues: category || {},
  })
  const { showToast } = useToast()

  const onSubmitForm = async (data: Partial<Category>) => {
    try {
      await onSubmit(data)
      reset()
      showToast('Category saved successfully', 'success')
    } catch (error) {
      showToast('Error saving category', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 mb-6">
      <Input
        label="Nombre"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />
      <Input
        label="Descripción"
        {...register('description')}
      />
      <Button type="submit">{category ? 'Update' : 'Create'} Category</Button>
    </form>
  )
}