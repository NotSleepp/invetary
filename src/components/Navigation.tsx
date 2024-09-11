'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { NotificationIcon } from './Notification'

export const Navigation: React.FC = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
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
        <ul className="flex space-x-4">
        <li><Link href="/products" className="hover:text-gray-200 transition duration-200 ease-in-out">Products</Link></li>
          <li><Link href="/materials" className="hover:text-gray-200 transition duration-200 ease-in-out">Materials</Link></li>
          <li><Link href="/recipes" className="hover:text-gray-200 transition duration-200 ease-in-out">Recipes</Link></li>
          <li><Link href="/production" className="hover:text-gray-200 transition duration-200 ease-in-out">Production</Link></li>
          <li><Link href="/sales" className="hover:text-gray-200 transition duration-200 ease-in-out">Sales</Link></li>
          <li><Link href="/financial-records" className="hover:text-gray-200 transition duration-200 ease-in-out">Finances</Link></li>
          <li><Link href="/categories" className="hover:text-gray-200 transition duration-200 ease-in-out">Categories</Link></li>
          <li><Link href="/suppliers" className="hover:text-gray-200 transition duration-200 ease-in-out">Suppliers</Link></li>
          <li><Link href="/reports" className="hover:text-gray-200 transition duration-200 ease-in-out">Reports</Link></li>
        </ul>
        <div className="flex items-center space-x-4">
          <NotificationIcon />
          <Link href="/profile" className="hover:text-gray-200 transition duration-200 ease-in-out">Profile</Link>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}