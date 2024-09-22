'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useProfileStore } from '@/stores/profileStore'

export default function ProfilePage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { 
    username, 
    email, 
    isLoading, 
    error, 
    setUsername, 
    setEmail, 
    updateProfile, 
    fetchProfile 
  } = useProfileStore()

  const [errors, setErrors] = useState({ username: '', email: '' })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const validateForm = () => {
    let isValid = true
    const newErrors = { username: '', email: '' }

    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
      isValid = false
    }

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo electrónico no es válido'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (email !== user?.email) {
      setShowConfirmDialog(true)
    } else {
      await handleUpdateProfile()
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(username, email)
      showToast('Perfil actualizado con éxito', 'success')
    } catch (error: any) {
      showToast(`Error al actualizar el perfil: ${error.message}`, 'error')
    } finally {
      setShowConfirmDialog(false)
    }
  }

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }, [setUsername])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [setEmail])

  if (error) {
    showToast(`Error: ${error}`, 'error')
  }

  return (
    <AuthGuard>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Perfil de Usuario</h1>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de Usuario"
              value={username}
              onChange={handleUsernameChange}
              error={errors.username}
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Actualizar Perfil'}
            </Button>
          </form>
        </Card>
      </div>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleUpdateProfile}
        onCancel={() => setShowConfirmDialog(false)}
        title="Confirmar cambio de correo electrónico"
        message="¿Está seguro de que desea cambiar su correo electrónico? Esto puede requerir una nueva verificación de su cuenta."
      />
    </AuthGuard>
  )
}