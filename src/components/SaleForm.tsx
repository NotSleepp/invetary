'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { Sale, Product } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

interface SaleFormProps {
  onSubmit: (data: Partial<Sale>) => void
}

export const SaleForm: React.FC<SaleFormProps> = ({ onSubmit }) => {
  const [products, setProducts] = useState<Product[]>([])
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Partial<Sale>>()
  const { showToast } = useToast()

  const selectedProductId = watch('product_id')
  const quantitySold = watch('quantity_sold')

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProductId && quantitySold) {
      const product = products.find(p => p.id === selectedProductId)
      if (product) {
        const totalRevenue = product.sale_price * Number(quantitySold)
        setValue('sale_price', product.sale_price)
        setValue('total_revenue', totalRevenue)
      }
    }
  }, [selectedProductId, quantitySold, products, setValue])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      showToast('Error fetching products', 'error')
    } else {
      setProducts(data || [])
    }
  }

  const onSubmitForm = async (data: Partial<Sale>) => {
    try {
      await onSubmit(data)
      showToast('Sale recorded successfully', 'success')
    } catch (error) {
      showToast('Error recording sale', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Select
        label="Product"
        options={products.map(product => ({ value: product.id, label: product.name }))}
        {...register('product_id', { required: 'Product is required' })}
        error={errors.product_id?.message}
      />
      <Input
        label="Quantity Sold"
        type="number"
        {...register('quantity_sold', { required: 'Quantity is required', min: 1 })}
        error={errors.quantity_sold?.message}
      />
      <Input
        label="Sale Price"
        type="number"
        step="0.01"
        {...register('sale_price', { required: 'Sale price is required', min: 0 })}
        error={errors.sale_price?.message}
      />
      <Input
        label="Total Revenue"
        type="number"
        step="0.01"
        {...register('total_revenue', { required: 'Total revenue is required', min: 0 })}
        error={errors.total_revenue?.message}
      />
      <Button type="submit">Record Sale</Button>
    </form>
  )
}