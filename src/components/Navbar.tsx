'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Закрываем меню при навигации
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-primary-600">
                LearnSwipe
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/' 
                  ? 'border-primary-500 text-neutral-900' 
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                }`}
              >
                Главная
              </Link>
              <Link 
                href="/tests"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/tests' || pathname.startsWith('/tests/') 
                  ? 'border-primary-500 text-neutral-900' 
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                }`}
              >
                Тесты
              </Link>
              <Link 
                href="/create"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/create'
                  ? 'border-primary-500 text-neutral-900' 
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                }`}
              >
                Создать тест
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Открыть меню пользователя</span>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                </div>
                
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="px-4 py-2 text-sm text-neutral-700 border-b border-neutral-100">
                      <p className="font-medium">{user.name || 'Пользователь'}</p>
                      <p className="text-xs truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Мой профиль
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Аналитика
                    </Link>
                    <Link
                      href="/profile/tests"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Мои тесты
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-primary-600 hover:text-primary-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Войти
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Открыть главное меню</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/'
                ? 'border-primary-500 text-primary-700 bg-primary-50'
                : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-800'
            }`}
          >
            Главная
          </Link>
          <Link
            href="/tests"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/tests' || pathname.startsWith('/tests/')
                ? 'border-primary-500 text-primary-700 bg-primary-50'
                : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-800'
            }`}
          >
            Тесты
          </Link>
          <Link
            href="/create"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/create'
                ? 'border-primary-500 text-primary-700 bg-primary-50'
                : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-800'
            }`}
          >
            Создать тест
          </Link>
        </div>
        
        {user ? (
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-neutral-800">
                  {user.name || 'Пользователь'}
                </div>
                <div className="text-sm font-medium text-neutral-500 truncate max-w-[200px]">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
              >
                Мой профиль
              </Link>
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
              >
                Аналитика
              </Link>
              <Link
                href="/profile/tests"
                className="block px-4 py-2 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
              >
                Мои тесты
              </Link>
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="space-y-1">
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
              >
                Войти
              </Link>
              <Link
                href="/auth/signup"
                className="block px-4 py-2 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
              >
                Регистрация
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 