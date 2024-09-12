'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { CategoryForm } from '@/components/CategoryForm'
import { CategoryList } from '@/components/CategoryList'
import { Category } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) {
      showToast('Error fetching categories', 'error')
    } else {
      setCategories(data || [])
    }
  }

  const handleSubmit = async (data: Partial<Category>) => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id)
        if (error) throw error
        setEditingCategory(null)
        showToast('Category updated successfully', 'success')
      } else {
        const { error } = await supabase.from('categories').insert(data)
        if (error) throw error
        showToast('Category added successfully', 'success')
      }
      fetchCategories()
    } catch (error) {
      showToast('Error saving category', 'error')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
      if (error) throw error
      showToast('Category deleted successfully', 'success')
      fetchCategories()
    } catch (error) {
      showToast('Error deleting category', 'error')
    }
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Categorias</h1>
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleSubmit}
        />
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}