'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaCog, FaTrashAlt, FaCheckDouble, FaSearch, FaFilter, FaSort, FaChevronDown } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import useNotifications from '@/hooks/useNotifications';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Notification, NotificationType } from '@/lib/supabase';

// Функция для форматирования даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

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

// Функция для получения названия типа уведомления
const getNotificationTypeName = (type: NotificationType) => {
  switch (type) {
    case 'test_result':
      return 'Результат теста';
    case 'new_test':
      return 'Новый тест';
    case 'system':
      return 'Системное';
    case 'reminder':
      return 'Напоминание';
    default:
      return 'Уведомление';
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    loading: notificationLoading 
  } = useNotifications();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Загружаем уведомления при монтировании компонента
  useEffect(() => {
    if (!user) return;
    
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const data = await getUserNotifications(user.id);
        setNotifications(data);
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [user, getUserNotifications]);
  
  // Обработчик чтения уведомления
  const handleReadNotification = async (notification: Notification) => {
    if (notification.read) return;
    
    const success = await markAsRead(notification.id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
    
    setSelectedNotification(notification);
  };
  
  // Обработчик удаления уведомления
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    
    const success = await deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };
  
  // Обработчик отметки всех уведомлений как прочитанных
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    const success = await markAllAsRead(user.id);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };
  
  // Фильтрация и сортировка уведомлений
  const filteredNotifications = notifications
    .filter(notification => {
      // Применяем фильтр по типу
      if (filter !== 'all' && notification.type !== filter) {
        return false;
      }
      
      // Применяем поиск по заголовку и содержимому
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Сортировка
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        const typeA = a.type;
        const typeB = b.type;
        return sortOrder === 'desc'
          ? typeA.localeCompare(typeB)
          : typeB.localeCompare(typeA);
      }
    });
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">
              Уведомления
            </h1>
            <Link 
              href="/profile/notifications/settings"
              className="inline-flex items-center px-3 py-1.5 border border-neutral-300 bg-white rounded-md text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <FaCog className="mr-1.5" /> Настройки
            </Link>
          </div>
          
          {loading || notificationLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-primary-500 text-2xl mr-2" />
              <span className="text-neutral-600">Загрузка уведомлений...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-xl text-neutral-600 mb-4">У вас пока нет уведомлений</p>
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Вернуться в профиль
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-12 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Поиск уведомлений..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 bg-white rounded-md text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                      <FaFilter className="mr-1.5" /> Фильтр <FaChevronDown className="ml-1 h-3 w-3" />
                    </button>
                    
                    {showFilterMenu && (
                      <div className="absolute right-0 mt-1 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${filter === 'all' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setFilter('all'); setShowFilterMenu(false); }}
                          >
                            Все уведомления
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${filter === 'test_result' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setFilter('test_result'); setShowFilterMenu(false); }}
                          >
                            Результаты тестов
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${filter === 'new_test' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setFilter('new_test'); setShowFilterMenu(false); }}
                          >
                            Новые тесты
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${filter === 'system' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setFilter('system'); setShowFilterMenu(false); }}
                          >
                            Системные
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${filter === 'reminder' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setFilter('reminder'); setShowFilterMenu(false); }}
                          >
                            Напоминания
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      className="inline-flex items-center px-3 py-2 border border-neutral-300 bg-white rounded-md text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setShowSortMenu(!showSortMenu)}
                    >
                      <FaSort className="mr-1.5" /> Сортировка <FaChevronDown className="ml-1 h-3 w-3" />
                    </button>
                    
                    {showSortMenu && (
                      <div className="absolute right-0 mt-1 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'date' && sortOrder === 'desc' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setSortBy('date'); setSortOrder('desc'); setShowSortMenu(false); }}
                          >
                            Сначала новые
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'date' && sortOrder === 'asc' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setSortBy('date'); setSortOrder('asc'); setShowSortMenu(false); }}
                          >
                            Сначала старые
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'type' && sortOrder === 'asc' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setSortBy('type'); setSortOrder('asc'); setShowSortMenu(false); }}
                          >
                            По типу (А-Я)
                          </button>
                          <button
                            className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'type' && sortOrder === 'desc' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'}`}
                            onClick={() => { setSortBy('type'); setSortOrder('desc'); setShowSortMenu(false); }}
                          >
                            По типу (Я-А)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleMarkAllAsRead}
                    className="inline-flex items-center px-3 py-2 border border-neutral-300 bg-white rounded-md text-sm text-neutral-700 hover:bg-neutral-50"
                    disabled={!notifications.some(n => !n.read)}
                  >
                    <FaCheckDouble className="mr-1.5" /> Прочитать все
                  </button>
                </div>
              </div>
              
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 min-h-[60vh]">
                  <div className="md:col-span-1 border-r border-neutral-200 overflow-y-auto max-h-[70vh]">
                    <div className="divide-y divide-neutral-200">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-4 text-center text-neutral-600">
                          Уведомления не найдены
                        </div>
                      ) : (
                        filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 cursor-pointer hover:bg-neutral-50 transition-colors flex ${
                              selectedNotification?.id === notification.id ? 'bg-neutral-100' : notification.read ? 'bg-white' : 'bg-neutral-50'
                            }`}
                            onClick={() => handleReadNotification(notification)}
                          >
                            <div className="flex-1">
                              <div className="flex items-start">
                                {getNotificationIcon(notification.type as NotificationType)}
                                <div className="flex-1">
                                  <h3 className={`text-sm font-medium ${notification.read ? 'text-neutral-700' : 'text-neutral-900'}`}>
                                    {notification.title}
                                  </h3>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {formatDate(notification.created_at)}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {getNotificationTypeName(notification.type as NotificationType)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1 text-sm text-neutral-600 line-clamp-2">
                                {notification.message}
                              </div>
                              
                              {!notification.read && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                    Новое
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="text-neutral-400 hover:text-red-500 transition-colors ml-2 self-start"
                              aria-label="Удалить уведомление"
                            >
                              <FaTrashAlt className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 p-6">
                    {selectedNotification ? (
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-xl font-medium text-neutral-900 flex items-center">
                              {getNotificationIcon(selectedNotification.type as NotificationType)}
                              {selectedNotification.title}
                            </h2>
                            <p className="text-sm text-neutral-500 mt-1">
                              {formatDate(selectedNotification.created_at)} • {getNotificationTypeName(selectedNotification.type as NotificationType)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNotification(selectedNotification.id, e)}
                            className="text-neutral-400 hover:text-red-500 transition-colors"
                            aria-label="Удалить уведомление"
                          >
                            <FaTrashAlt className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="bg-neutral-50 rounded-lg p-4 mt-2">
                          <p className="text-neutral-800 whitespace-pre-line">
                            {selectedNotification.message}
                          </p>
                        </div>
                        
                        {selectedNotification.link && (
                          <div className="mt-4">
                            <Link 
                              href={selectedNotification.link}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                            >
                              Перейти по ссылке
                            </Link>
                          </div>
                        )}
                        
                        {selectedNotification.data && (
                          <div className="mt-4 border-t border-neutral-200 pt-4">
                            <h3 className="text-sm font-medium text-neutral-900 mb-2">
                              Дополнительная информация
                            </h3>
                            <pre className="bg-neutral-50 rounded-lg p-4 text-xs text-neutral-700 overflow-x-auto">
                              {JSON.stringify(JSON.parse(selectedNotification.data), null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
                        <div className="text-6xl mb-4">📬</div>
                        <p className="text-lg font-medium">Выберите уведомление, чтобы просмотреть детали</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 