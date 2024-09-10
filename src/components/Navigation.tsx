'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export const Navigation: React.FC = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return null; // No renderiza nada si no está autenticado
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold tracking-wide">
          <Link href="/">Dashboard</Link>
        </div>
        <ul className="flex space-x-8">
          <li>
            <Link href="/products" className="hover:text-gray-200 transition duration-200 ease-in-out">Products</Link>
          </li>
          <li>
            <Link href="/materials" className="hover:text-gray-200 transition duration-200 ease-in-out">Materials</Link>
          </li>
          <li>
            <Link href="/production" className="hover:text-gray-200 transition duration-200 ease-in-out">Production</Link>
          </li>
          <li>
            <Link href="/sales" className="hover:text-gray-200 transition duration-200 ease-in-out">Sales</Link>
          </li>
          <li>
            <Link href="/reports" className="hover:text-gray-200 transition duration-200 ease-in-out">Reports</Link>
          </li>
          <li>
            <Link href="/suppliers" className="hover:text-gray-200 transition duration-200 ease-in-out">Suppliers</Link>
          </li>
          <li>
            <Link href="/settings" className="hover:text-gray-200 transition duration-200 ease-in-out">Settings</Link>
          </li>
        </ul>
        <div>
          {user && (
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Cerrar Sesion
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
