import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { Navigation } from '@/components/Navigation'
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-gray-100 text-gray-800 antialiased">
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <header className="shadow-md">
                <Navigation />
              </header>
              <main className="flex-grow container mx-auto px-6 py-10">
                {children}
              </main>
              <footer className="bg-gray-800 text-white py-6 mt-10">
                <div className="container mx-auto text-center text-sm">
                  © {new Date().getFullYear()} Sleepn't derechos reservados
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
