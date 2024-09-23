'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FaChartLine, FaBox, FaCubes, FaClipboardList, FaShoppingCart, FaMoneyBillWave, FaTags, FaTruck, FaChartBar, FaUser, FaSignOutAlt, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleLinkClick = () => {
    if (isMobile) {
      onClose()
    }
  }

  const menuItems = [
    { href: '/', icon: FaChartLine, label: 'Dashboard' },
    { href: '/products', icon: FaBox, label: 'Productos' },
    { href: '/materials', icon: FaCubes, label: 'Ingredientes' },
    { href: '/recipes', icon: FaClipboardList, label: 'Recetas' },
    { href: '/production', icon: FaClipboardList, label: 'Producción' },
    { href: '/sales', icon: FaShoppingCart, label: 'Ventas' },
    { href: '/financial-records', icon: FaMoneyBillWave, label: 'Finanzas' },
    { href: '/categories', icon: FaTags, label: 'Categorías' },
    { href: '/suppliers', icon: FaTruck, label: 'Proveedores' },
    { href: '/reports', icon: FaChartBar, label: 'Informes' },
  ]

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <motion.div 
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-900 text-white z-30 transition-transform duration-75 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? '' : 'relative'}`}
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          {isMobile && (
            <button onClick={onClose} className="text-gray-300 hover:text-white">
              <FaTimes size={24} />
            </button>
          )}
        </div>
        <nav className="flex-grow overflow-y-auto">
          <ul className="flex flex-col py-4">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`flex items-center px-6 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 ${pathname === item.href ? 'bg-gray-800 text-white' : ''}`}
                  onClick={handleLinkClick}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link 
            href="/profile" 
            className="flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-200 mb-4"
            onClick={handleLinkClick}
          >
            <FaUser className="w-5 h-5 mr-3" />
            Perfil
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full text-sm text-gray-300 hover:text-white transition-colors duration-200"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </motion.div>
    </>
  )
}