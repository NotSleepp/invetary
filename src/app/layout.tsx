'use client'

import { useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { Sidebar } from '@/components/Sidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { FaBars } from 'react-icons/fa'
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 30, // 30 minutos
      },
    },
  }))

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024) // 1024px es el breakpoint 'lg' en Tailwind por defecto
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <html lang="es" className="h-full bg-gray-50">
      <body className="h-full font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar isOpen={isMobile ? sidebarOpen : true} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                      {isMobile && (
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-600"
                          onClick={toggleSidebar}
                        >
                          <span className="sr-only">Abrir sidebar</span>
                          <FaBars className="h-6 w-6" />
                        </button>
                      )}
                      {isMobile && <div className="w-6" />}
                    </div>
                  </header>
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                      {children}
                    </div>
                  </main>
                  <footer className="bg-white text-gray-600 py-4 px-4 sm:px-6 lg:px-8 border-t">
                    <div className="text-center text-sm">
                      © {new Date().getFullYear()} Sleepn't - Todos los derechos reservados
                    </div>
                  </footer>
                </div>
              </div>
            </ToastProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}