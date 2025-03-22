'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaBell, FaCheckDouble, FaTrashAlt, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '@/hooks/useAuth';
import useNotifications from '@/hooks/useNotifications';
import { Notification, NotificationType } from '@/lib/supabase';

// Функция для форматирования даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // разница в секундах
  
  if (diff < 60) {
    return 'только что';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} ${getMinutesText(minutes)} назад`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${getHoursText(hours)} назад`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} ${getDaysText(days)} назад`;
  } else {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
};

// Вспомогательные функции для правильного склонения слов
function getMinutesText(minutes: number) {
  const lastDigit = minutes % 10;
  const lastTwoDigits = minutes % 100;
  
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'минуту';
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return 'минуты';
  } else {
    return 'минут';
  }
}

function getHoursText(hours: number) {
  const lastDigit = hours % 10;
  const lastTwoDigits = hours % 100;
  
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'час';
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return 'часа';
  } else {
    return 'часов';
  }
}

function getDaysText(days: number) {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'день';
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return 'дня';
  } else {
    return 'дней';
  }
}

// Функция для получения иконки типа уведомления
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'test_result':
      return <span role="img" aria-label="Результат теста" className="mr-2 text-green-500">🎯</span>;
    case 'new_test':
      return <span role="img" aria-label="Новый тест" className="mr-2 text-blue-500">📝</span>;
    case 'system':
      return <span role="img" aria-label="Системное" className="mr-2 text-purple-500">🔔</span>;
    case 'reminder':
      return <span role="img" aria-label="Напоминание" className="mr-2 text-orange-500">⏰</span>;
    default:
      return <span role="img" aria-label="Уведомление" className="mr-2">📢</span>;
  }
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { 
    unreadCount,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
    subscribeToNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Загружаем непрочитанные уведомления при открытии меню
  useEffect(() => {
    if (isOpen && user) {
      setLoadingNotifications(true);
      getUnreadNotifications(user.id)
        .then(data => {
          setNotifications(data);
          setLoadingNotifications(false);
        })
        .catch(() => {
          setLoadingNotifications(false);
        });
    }
  }, [isOpen, user, getUnreadNotifications]);
  
  // Подписываемся на обновления уведомлений
  useEffect(() => {
    if (!user) return;
    
    // Устанавливаем начальное количество непрочитанных уведомлений
    getUnreadNotifications(user.id);
    
    // Подписываемся на новые уведомления
    const unsubscribe = subscribeToNotifications(user.id, (notification) => {
      // Добавляем новое уведомление в список, если меню открыто
      if (isOpen) {
        setNotifications(prev => [notification, ...prev]);
      }
      
      // Показываем браузерное уведомление, если поддерживается и разрешено
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });
    
    return unsubscribe;
  }, [user, getUnreadNotifications, subscribeToNotifications, isOpen]);
  
  // Обработчик клика вне меню для его закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Обработчик чтения уведомления
  const handleReadNotification = async (notification: Notification, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (notification.read) return;
    
    const success = await markAsRead(notification.id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
    
    // Если есть ссылка, перейти по ней
    if (notification.link) {
      window.location.href = notification.link;
      setIsOpen(false);
    }
  };
  
  // Обработчик удаления уведомления
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const success = await deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };
  
  // Обработчик отметки всех уведомлений как прочитанных
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const success = await markAllAsRead(user.id);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };
  
  // Запрос разрешения на браузерные уведомления
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };
  
  // Анимация для меню уведомлений
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };
  
  // Если пользователь не авторизован, не показываем колокольчик
  if (!user) {
    return null;
  }
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
        aria-label="Уведомления"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center p-1 min-w-[1.25rem] h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="origin-top-right absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg py-1 bg-white ring-1 ring-black/5 z-20"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-neutral-900">Уведомления</h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FaCheckDouble className="mr-1" />
                  Прочитать все
                </button>
              )}
            </div>
            
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-6">
                <FaSpinner className="animate-spin text-primary-500 h-6 w-6 mr-2" />
                <span className="text-neutral-600">Загрузка уведомлений...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-neutral-600">У вас нет новых уведомлений</p>
                <button
                  onClick={requestNotificationPermission}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-800"
                >
                  Разрешить уведомления браузера
                </button>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 cursor-pointer ${notification.read ? 'bg-neutral-50' : ''}`}
                    onClick={(e) => handleReadNotification(notification, e)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-2">
                        <p className="text-sm font-medium text-neutral-900 flex items-center">
                          {getNotificationIcon(notification.type as NotificationType)}
                          {notification.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                        aria-label="Удалить уведомление"
                      >
                        <FaTrashAlt className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-700 mt-1">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Link 
                        href={notification.link}
                        className="text-xs text-primary-600 hover:text-primary-800 mt-1 inline-block"
                      >
                        Подробнее
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t border-neutral-100 py-2 px-4 text-center">
              <Link 
                href="/profile/notifications"
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Все уведомления
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 