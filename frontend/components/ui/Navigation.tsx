'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FolderOpen, FileText, Wallet, Menu, X, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCurrentVersion } from '@/lib/version';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/categories', label: 'Categorías', icon: FolderOpen },
  { href: '/provisions', label: 'Provisiones', icon: FileText },
  { href: '/expenses', label: 'Gastos', icon: Wallet },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickeable */}
          <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">
                💰 Budget Manager
              </h1>
              <p className="text-xs text-gray-500 font-mono">
                {getCurrentVersion()}
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:space-x-8 sm:items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}

            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Cerrando...' : 'Salir'}
            </button>
          </div>

          {/* Mobile Menu Button + Logout */}
          <div className="sm:hidden flex items-center space-x-2">
            {/* Logout Button - Mobile */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú</span>
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Dropdown */}
        {isOpen && (
          <div className="sm:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <span className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              {/* Logout Button - Mobile Dropdown */}
              <button
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className={cn(
                  'w-full text-left block px-3 py-2 rounded-md text-base font-medium',
                  'text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50'
                )}
              >
                <span className="flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoggingOut ? 'Cerrando...' : 'Salir'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
