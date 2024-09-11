'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { supabase } from '@/lib/supabase'

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
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast('Error updating profile', 'error')
    }
  }

  return (
    <AuthGuard>
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full">Update Profile</Button>
        </form>
      </div>
    </AuthGuard>
  )
}