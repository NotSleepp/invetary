'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { FinancialRecord } from '@/types'
import { useToast } from '@/contexts/ToastContext'

interface FinancialRecordFormProps {
  record?: FinancialRecord
  onSubmit: (data: Partial<FinancialRecord>) => void
}

export const FinancialRecordForm: React.FC<FinancialRecordFormProps> = ({ record, onSubmit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Partial<FinancialRecord>>({
    defaultValues: record || {},
  })
  const { showToast } = useToast()

  const onSubmitForm = async (data: Partial<FinancialRecord>) => {
    try {
      await onSubmit(data)
      reset()
      showToast('Financial record saved successfully', 'success')
    } catch (error) {
      showToast('Error saving financial record', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 mb-6">
      <Select
        label="Type"
        options={[
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
        ]}
        {...register('type', { required: 'Type is required' })}
        error={errors.type?.message}
      />
      <Input
        label="Amount"
        type="number"
        step="0.01"
        {...register('amount', { required: 'Amount is required', min: 0 })}
        error={errors.amount?.message}
      />
      <Input
        label="Description"
        {...register('description')}
        error={errors.description?.message}
      />
      <Button type="submit">{record ? 'Update' : 'Create'} Financial Record</Button>
    </form>
  )
}