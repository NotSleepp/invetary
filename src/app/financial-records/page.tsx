'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { FinancialRecordForm } from '@/components/FinancialRecordForm'
import { FinancialRecordList } from '@/components/FinancialRecordList'
import { FinancialRecord } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'

export default function FinancialRecordsPage() {
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchFinancialRecords()
  }, [])

  const fetchFinancialRecords = async () => {
    const { data, error } = await supabase.from('financial_records').select('*')
    if (error) {
      showToast('Error fetching financial records', 'error')
    } else {
      setFinancialRecords(data || [])
    }
  }

  const handleSubmit = async (data: Partial<FinancialRecord>) => {
    try {
      if (editingRecord) {
        const { error } = await supabase
          .from('financial_records')
          .update(data)
          .eq('id', editingRecord.id)
        if (error) throw error
        setEditingRecord(null)
        showToast('Financial record updated successfully', 'success')
      } else {
        const { error } = await supabase.from('financial_records').insert(data)
        if (error) throw error
        showToast('Financial record added successfully', 'success')
      }
      fetchFinancialRecords()
    } catch (error) {
      showToast('Error saving financial record', 'error')
    }
  }

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record)
  }

  const handleDelete = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', recordId)
      if (error) throw error
      showToast('Financial record deleted successfully', 'success')
      fetchFinancialRecords()
    } catch (error) {
      showToast('Error deleting financial record', 'error')
    }
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Registros financieros</h1>
        <FinancialRecordForm
          record={editingRecord || undefined}
          onSubmit={handleSubmit}
        />
        <FinancialRecordList
          records={financialRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}