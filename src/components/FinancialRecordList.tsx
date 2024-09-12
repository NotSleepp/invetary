'use client'

import React from 'react'
import { FinancialRecord } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface FinancialRecordListProps {
  records: FinancialRecord[]
  onEdit: (record: FinancialRecord) => void
  onDelete: (recordId: string) => void
}

export const FinancialRecordList: React.FC<FinancialRecordListProps> = ({ records, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this financial record?')) {
      try {
        await onDelete(recordId)
        showToast('Financial record deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting financial record', 'error')
      }
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Tipo</th>
          <th className="py-2 px-4 border-b">Cantidad</th>
          <th className="py-2 px-4 border-b">Descripción</th>
          <th className="py-2 px-4 border-b">Fecha</th>
          <th className="py-2 px-4 border-b"></th>
        </tr>
      </thead>
      <tbody>
        {records.map(record => (
          <tr key={record.id}>
            <td className="py-2 px-4 border-b">{record.type}</td>
            <td className="py-2 px-4 border-b">${record.amount.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">{record.description}</td>
            <td className="py-2 px-4 border-b">{new Date(record.created_at).toLocaleDateString()}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => onEdit(record)} variant="secondary" className="mr-2">Editar</Button>
              <Button onClick={() => handleDelete(record.id)} variant="danger">Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}