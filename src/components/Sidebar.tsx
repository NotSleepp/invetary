'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FaChartLine, FaBox, FaCubes, FaClipboardList, FaShoppingCart, FaMoneyBillWave, FaTags, FaTruck, FaChartBar, FaUser, FaSignOutAlt } from 'react-icons/fa'

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const menuItems = [
    { href: '/', icon: FaChartLine, label: 'Dashboard' },
    { href: '/products', icon: FaBox, label: 'Productos' },
    { href: '/materials', icon: FaCubes, label: 'Materiales' },
    { href: '/recipes', icon: FaClipboardList, label: 'Recetas' },
    { href: '/production', icon: FaClipboardList, label: 'Producción' },
    { href: '/sales', icon: FaShoppingCart, label: 'Ventas' },
    { href: '/financial-records', icon: FaMoneyBillWave, label: 'Finanzas' },
    { href: '/categories', icon: FaTags, label: 'Categorías' },
    { href: '/suppliers', icon: FaTruck, label: 'Proveedores' },
    { href: '/reports', icon: FaChartBar, label: 'Informes' },
  ]

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl font-bold">Sleepn't</h1>
      </div>
      <nav className="flex-grow">
        <ul className="flex flex-col py-4">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Link href="/profile" className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 mb-4">
          <FaUser className="w-5 h-5 mr-3" />
          Perfil
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center w-full text-gray-300 hover:text-white transition-colors duration-200"
        >
          <FaSignOutAlt className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}