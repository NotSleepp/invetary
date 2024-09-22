'use client'

import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { Sidebar } from '@/components/Sidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
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

  return (
    <html lang="es" className="h-full bg-gray-100">
      <body className="h-full">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-full">
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