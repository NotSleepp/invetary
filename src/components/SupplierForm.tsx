'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Supplier } from '@/types'
import { useToast } from '@/contexts/ToastContext'

interface SupplierFormProps {
  supplier?: Supplier
  onSubmit: (data: Partial<Supplier>) => void
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<Supplier>>({
    defaultValues: supplier || {},
  })
  const { showToast } = useToast()

  const onSubmitForm = async (data: Partial<Supplier>) => {
    try {
      await onSubmit(data)
      showToast('Supplier saved successfully', 'success')
    } catch (error) {
      showToast('Error saving supplier', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Input
        label="Name"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />
      <Input
        label="Contact Information"
        {...register('contact_info')}
      />
      <Button type="submit">Save Supplier</Button>
    </form>
  )
}