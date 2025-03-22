'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useNotifications from '@/hooks/useNotifications';
import { FaHome, FaClipboardList, FaPlus, FaTachometerAlt, FaUser, FaSignOutAlt, FaUserCog, FaBars, FaTimes, FaBookOpen, FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Функция для проверки прав администратора
const isAdmin = (email: string | null | undefined) => {
  const adminEmails = ['admin@test.com', 'admin@lume.com', 'dima@test.ru']; // Добавьте сюда свою почту
  return email && adminEmails.includes(email);
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading: authLoading } = useAuth();
  const { getUnreadNotifications, loading: notificationsLoading } = useNotifications();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Устанавливаем флаг инициализации после первой отрисовки
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Закрываем меню при навигации
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setActiveMenuItem(null);
  }, [pathname]);

  // Обработчик клика вне меню для его закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Закрытие мобильного меню при клике вне его
      if (isMenuOpen && event.target instanceof Element && mobileMenuRef.current) {
        if (!mobileMenuRef.current.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
      
      // Закрытие меню пользователя при клике вне его
      if (isUserMenuOpen && event.target instanceof Element && userMenuRef.current) {
        if (!userMenuRef.current.contains(event.target)) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isUserMenuOpen]);

  // Обработчик нажатия на пункт меню с анимацией
  const handleMenuItemClick = (itemName: string) => {
    setActiveMenuItem(itemName);
    // Сбрасываем активное состояние после завершения анимации
    setTimeout(() => setActiveMenuItem(null), 300);
  };

  // Проверяем, является ли текущий пользователь администратором
  const userIsAdmin = isAdmin(user?.email);

  // Загружаем количество непрочитанных уведомлений
  useEffect(() => {
    if (!user) return;
    
    const loadUnreadNotifications = async () => {
      try {
        const { unreadCount } = await getUnreadNotifications(user.id);
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
      }
    };
    
    loadUnreadNotifications();
    
    // Устанавливаем интервал для периодической проверки уведомлений
    const intervalId = setInterval(loadUnreadNotifications, 30000); // 30 секунд
    
    return () => clearInterval(intervalId);
  }, [user, getUnreadNotifications]);

  // Анимация для мобильного меню
  const menuVariants = {
    closed: { x: '100%' },
    open: { x: 0 }
  };
  
  // Анимация для меню пользователя
  const userMenuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  // Анимация для пунктов меню
  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1
      }
    })
  };

  // Получаем инициалы пользователя
  const getUserInitials = () => {
    if (user && 'name' in user && typeof user.name === 'string' && user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  // Основные пункты навигации для мобильного меню
  const mobileMenuItems = [
    { name: 'Главная', href: '/', icon: FaHome },
    { name: 'Тесты', href: '/tests', icon: FaBookOpen },
    { name: 'Создать тест', href: '/tests/create', icon: FaPlus },
    { name: 'Профиль', href: '/profile', icon: FaUser },
    { name: 'Мои результаты', href: '/profile/results', icon: FaTachometerAlt },
    { name: 'Уведомления', href: '/profile/notifications', icon: FaBell, badge: unreadNotifications },
    ...(userIsAdmin ? [{ name: 'Админ панель', href: '/admin', icon: FaUserCog }] : []),
  ];

  // Если компонент еще не инициализирован или данные загружаются, отображаем заглушку
  if (!isInitialized || authLoading || notificationsLoading) {
    return <div className="h-16 bg-white shadow-sm"></div>;
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
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
                <FaHome className="mr-1" />
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
                <FaClipboardList className="mr-1" />
                Тесты
              </Link>
              <Link 
                href="/tests/create"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/tests/create'
                  ? 'border-primary-500 text-neutral-900' 
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                }`}
              >
                <FaPlus className="mr-1" />
                Создать тест
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative" ref={userMenuRef}>
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Открыть меню пользователя</span>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium shadow-md">
                      {getUserInitials()}
                    </div>
                  </button>
                </div>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black/5 z-10 overflow-hidden"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={userMenuVariants}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100 bg-neutral-50">
                        <p className="font-medium">{user && 'name' in user && typeof user.name === 'string' ? user.name : 'Пользователь'}</p>
                        <p className="text-xs truncate mt-1 text-neutral-500">{user?.email || ''}</p>
                      </div>
                      <div className="py-1">
                        <Link 
                          href="/profile" 
                          className={`block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center ${
                            pathname === '/profile' ? 'bg-neutral-50 font-medium' : ''
                          }`}
                        >
                          <FaUser className="mr-2 text-neutral-500" />
                          Профиль
                        </Link>
                        <Link 
                          href="/profile/results" 
                          className={`block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center ${
                            pathname === '/profile/results' ? 'bg-neutral-50 font-medium' : ''
                          }`}
                        >
                          <FaTachometerAlt className="mr-2 text-neutral-500" />
                          Мои результаты
                        </Link>
                        <Link 
                          href="/profile/notifications" 
                          className={`block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center ${
                            pathname === '/profile/notifications' ? 'bg-neutral-50 font-medium' : ''
                          }`}
                        >
                          <FaBell className="mr-2 text-neutral-500" />
                          Уведомления
                          {unreadNotifications > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {unreadNotifications}
                            </span>
                          )}
                        </Link>
                        {userIsAdmin && (
                          <Link 
                            href="/admin" 
                            className={`block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center ${
                              pathname === '/admin' ? 'bg-neutral-50 font-medium' : ''
                            }`}
                          >
                            <FaUserCog className="mr-2 text-neutral-500" />
                            Админ панель
                          </Link>
                        )}
                      </div>
                      <div className="py-1 border-t border-neutral-100">
                        <button 
                          onClick={() => signOut()}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Выйти
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Открыть главное меню</span>
              {isMenuOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            id="mobile-menu" 
            ref={mobileMenuRef}
            className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl overflow-y-auto z-50"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ type: "tween", duration: 0.3 }}
            style={{ maxWidth: '80%' }}
          >
            <div className="p-4 flex items-center justify-between border-b border-neutral-100">
              <div className="text-xl font-semibold text-neutral-900">Lume</div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors duration-200"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            
            <div className="pt-2 pb-3 space-y-1 px-2">
              {mobileMenuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <Link 
                    href={item.href}
                    className={`flex items-center px-3 py-3 rounded-lg text-base font-medium menu-item-link ${
                      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                    }`}
                    onClick={() => handleMenuItemClick(item.name)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                    {item.badge && (
                      <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">{item.badge}</span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="pt-4 pb-3 border-t border-neutral-200 px-2">
              {user ? (
                <div className="space-y-1">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    variants={menuItemVariants}
                  >
                    <div className="px-3 py-3 flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                        {getUserInitials()}
                      </div>
                      <div>
                        <div className="text-base font-medium">{user && 'name' in user && typeof user.name === 'string' ? user.name : 'Пользователь'}</div>
                        <div className="text-xs text-neutral-500 truncate max-w-[180px]">{user?.email || ''}</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    custom={7}
                    initial="hidden"
                    animate="visible"
                    variants={menuItemVariants}
                  >
                    <button 
                      onClick={() => signOut()}
                      className="flex items-center bg-red-50 px-3 py-3 rounded-lg text-base font-medium text-red-700 hover:bg-red-100 menu-item-link w-full"
                    >
                      <FaSignOutAlt className="h-5 w-5 mr-3" />
                      Выйти
                    </button>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={menuItemVariants}
                  >
                    <Link 
                      href="/auth/login"
                      className="flex items-center px-3 py-3 rounded-lg text-base font-medium menu-item-link  text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                      onClick={() => handleMenuItemClick('login')}
                    >
                      <FaUser className="h-5 w-5 mr-3" />
                      Войти
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={menuItemVariants}
                  >
                    <Link 
                      href="/auth/signup"
                      className="flex items-center bg-primary-50 px-3 py-3 rounded-lg text-base font-medium text-primary-700 hover:bg-primary-100 menu-item-link "
                      onClick={() => handleMenuItemClick('signup')}
                    >
                      <FaPlus className="h-5 w-5 mr-3" />
                      Регистрация
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 