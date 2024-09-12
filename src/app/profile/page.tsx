'use client'
import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'

export default function ProfilePage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.auth.updateUser({ email, data: { username } })
      if (error) throw error
      showToast('Perfil actualizado con éxito', 'success')
    } catch (error) {
      showToast('Error al actualizar el perfil', 'error')
    }
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
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full">Actualizar Perfil</Button>
          </form>
        </Card>
      </div>
    </AuthGuard>
  )
}