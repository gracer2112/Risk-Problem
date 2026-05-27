/*
 * src/components/AppTopNav.tsx
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppTopNav() {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            Sistema de Riscos e GMUD
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <Link
              href="/risks-problems"
              className={`px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                isActive('/risks-problems')
                  ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Riscos e Problemas
            </Link>
            <Link
              href="/gmud"
              className={`px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                isActive('/gmud')
                  ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              GMUD
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
