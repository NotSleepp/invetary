'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
  const { signIn, user, isLoading, error } = useAuthStore()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
    }
  }, [error, showToast])

  const onSubmit = async (data: LoginForm) => {
    await signIn(data.email, data.password)
  }

  if (user) {
    return <p>Ya has iniciado sesión.</p>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Ingrese a su cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">Por favor escriba sus datos para iniciar sesión</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} aria-label="Formulario de inicio de sesión">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                label="Correo electrónico"
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', { 
                  required: 'El correo electrónico es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Dirección de correo electrónico inválida"
                  }
                })}
                placeholder="Correo electrónico"
                error={errors.email?.message}
              />
            </div>
            <div className="mt-4">
              <Input
                label="Contraseña"
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { 
                  required: 'La contraseña es obligatoria',
                  minLength: {
                    value: 8,
                    message: 'La contraseña debe tener al menos 8 caracteres'
                  }
                })}
                placeholder="Contraseña"
                error={errors.password?.message}
              />
            </div>
          </div>
          <div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Iniciar sesión'}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}