'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { supabase } from '@/lib/supabase'
import Spinner  from '@/components/ui/Spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { User } from '@supabase/supabase-js'

// Añade esta definición de tipo en la parte superior del archivo
type ExtendedUser = User & { username?: string };

export default function SettingsPage() {
  const [formData, setFormData] = useState({ username: '', email: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { user, updateUserContext } = useAuth() as { user: ExtendedUser | null, updateUserContext: (user: ExtendedUser) => void };
  const { showToast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username || '', email: user.email || '' })
    }
  }, [user])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.username.trim()) {
      showToast('El nombre de usuario no puede estar vacío', 'error')
      return false
    }
    if (!emailRegex.test(formData.email)) {
      showToast('Por favor, introduce un email válido', 'error')
      return false
    }
    return true
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setShowConfirmDialog(true)
  }, [formData, validateForm])

  const confirmUpdate = async () => {
    setIsLoading(true)
    setShowConfirmDialog(false)
    try {
      const { error, data } = await supabase.auth.updateUser({ 
        email: formData.email, 
        data: { username: formData.username } 
      })
      if (error) throw error
      if (user) {
        updateUserContext({ 
          ...user, 
          ...data.user, 
          username: formData.username || user.username || '',
          email: formData.email || user.email || '',
          role: data.user.role || user.role || ''
        })
      } else {
        showToast('Error: Usuario no encontrado', 'error')
      }
      showToast('Perfil actualizado con éxito', 'success')
    } catch (error) {
      showToast('Error al actualizar el perfil', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Configuración</h1>
        <form onSubmit={handleSubmit} className="max-w-md">
          <Input
            label="Nombre de usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Actualizar Perfil'}
          </Button>
        </form>
      </div>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar actualización</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres actualizar tu perfil?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmUpdate}>
              Sí, actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}