'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

// Функция для проверки прав администратора
const isAdmin = (email: string | null | undefined) => {
  const adminEmails = ['admin@test.com', 'admin@lume.com', 'dima@test.ru']; // Добавьте сюда свою почту
  return email && adminEmails.includes(email);
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  // Закрываем меню при навигации
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setActiveMenuItem(null);
  }, [pathname]);

  // Обработчик клика вне меню для его закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && event.target instanceof Element) {
        const menu = document.getElementById('mobile-menu');
        if (menu && !menu.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Обработчик нажатия на пункт меню с анимацией
  const handleMenuItemClick = (itemName: string) => {
    setActiveMenuItem(itemName);
    // Сбрасываем активное состояние после завершения анимации
    setTimeout(() => setActiveMenuItem(null), 300);
  };

  // Проверяем, является ли текущий пользователь администратором
  const userIsAdmin = isAdmin(user?.email);

  // Добавляем стили для анимаций
  useEffect(() => {
    // Добавляем стили только на стороне клиента
    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        @keyframes menuItemClick {
          0% { transform: scale(1); }
          50% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        .menu-item-active {
          animation: menuItemClick 0.3s ease;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
        .menu-item-link {
          transition: all 0.2s ease;
        }
        .menu-item-link:active {
          transform: translateX(3px);
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-primary-600">
                Lume
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
                    {userIsAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Панель администратора
                      </Link>
                    )}
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
      <div 
        id="mobile-menu" 
        className={`${isMenuOpen ? 'block fixed inset-0 z-50 bg-black bg-opacity-25' : 'hidden'} sm:hidden`} 
        onClick={(e) => {
          // Закрывать меню только при клике на затемненный фон
          if ((e.target as HTMLElement).id === 'mobile-menu') {
            setIsMenuOpen(false);
          }
        }}
      >
        <div className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl overflow-y-auto ${isMenuOpen ? 'slide-in-right' : ''}`} 
          style={{ maxWidth: '80%' }}>
          
          <div className="p-4 flex items-center justify-between border-b border-neutral-100">
            <div className="text-xl font-semibold text-neutral-900">Lume</div>
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="pt-2 pb-3 space-y-1 px-2">
            <Link
              href="/"
              className={`flex items-center px-3 py-3 rounded-lg text-base font-medium menu-item-link ${
                activeMenuItem === 'home' ? 'menu-item-active' : ''
              } ${
                pathname === '/'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
              onClick={() => handleMenuItemClick('home')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Главная
            </Link>
            <Link
              href="/tests"
              className={`flex items-center px-3 py-3 rounded-lg text-base font-medium menu-item-link ${
                activeMenuItem === 'tests' ? 'menu-item-active' : ''
              } ${
                pathname === '/tests' || pathname.startsWith('/tests/')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
              onClick={() => handleMenuItemClick('tests')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Тесты
            </Link>
            <Link
              href="/create"
              className={`flex items-center px-3 py-3 rounded-lg text-base font-medium menu-item-link ${
                activeMenuItem === 'create' ? 'menu-item-active' : ''
              } ${
                pathname === '/create'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
              onClick={() => handleMenuItemClick('create')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Создать тест
            </Link>
          </div>
          
          {user ? (
            <div className="pt-4 pb-3 border-t border-neutral-200">
              <div className="flex items-center px-4 py-3">
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
              <div className="mt-3 space-y-1 px-2">
                <Link
                  href="/profile"
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 menu-item-link ${
                    activeMenuItem === 'profile' ? 'menu-item-active' : ''
                  }`}
                  onClick={() => handleMenuItemClick('profile')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Мой профиль
                </Link>
                <Link
                  href="/dashboard"
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 menu-item-link ${
                    activeMenuItem === 'dashboard' ? 'menu-item-active' : ''
                  }`}
                  onClick={() => handleMenuItemClick('dashboard')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                  Аналитика
                </Link>
                <Link
                  href="/profile/tests"
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 menu-item-link ${
                    activeMenuItem === 'mytests' ? 'menu-item-active' : ''
                  }`}
                  onClick={() => handleMenuItemClick('mytests')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  Мои тесты
                </Link>
                {userIsAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center px-3 py-3 rounded-lg text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 menu-item-link ${
                      activeMenuItem === 'admin' ? 'menu-item-active' : ''
                    }`}
                    onClick={() => handleMenuItemClick('admin')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Панель администратора
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleMenuItemClick('signout');
                    setTimeout(() => signOut(), 300);
                  }}
                  className={`flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 menu-item-link ${
                    activeMenuItem === 'signout' ? 'menu-item-active' : ''
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm6 5a1 1 0 00-1 1v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L10 12.586V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-neutral-200 px-2">
              <div className="space-y-1">
                <Link
                  href="/auth/login"
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 menu-item-link ${
                    activeMenuItem === 'login' ? 'menu-item-active' : ''
                  }`}
                  onClick={() => handleMenuItemClick('login')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 01-1 1h12a1 1 0 001-1V9.5a1 1 0 10-2 0V15H4V5h8.5a1 1 0 100-2H4a1 1 0 00-1 1zm13.5 9.5a1 1 0 100-2H13v-2.5a1 1 0 10-2 0V10h-2.5a1 1 0 000 2H11v2.5a1 1 0 102 0V12h2.5z" clipRule="evenodd" />
                  </svg>
                  Войти
                </Link>
                <Link
                  href="/auth/signup"
                  className={`flex items-center bg-primary-50 px-3 py-3 rounded-lg text-base font-medium text-primary-700 hover:bg-primary-100 menu-item-link ${
                    activeMenuItem === 'signup' ? 'menu-item-active' : ''
                  }`}
                  onClick={() => handleMenuItemClick('signup')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Регистрация
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 