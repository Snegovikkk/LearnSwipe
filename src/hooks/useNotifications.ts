import { useState, useCallback, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Notification, NotificationSettings, NotificationType } from '@/lib/supabase';

export default function useNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Получение всех уведомлений пользователя
  const getUserNotifications = useCallback(async (userId: string): Promise<Notification[]> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false });
      
      // if (error) throw error;
      // return data || [];
      
      // Возвращаем тестовые данные
      return getMockNotifications(userId);
    } catch (error: any) {
      console.error("Ошибка при получении уведомлений:", error);
      setError(error.message || "Не удалось получить уведомления");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение непрочитанных уведомлений пользователя
  const getUnreadNotifications = useCallback(async (userId: string): Promise<{ notifications: Notification[], unreadCount: number }> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .eq('read', false);
      
      // if (error) throw error;
      
      // const unread = data || [];
      // setUnreadCount(unread.length);
      // return { notifications: unread, unreadCount: unread.length };
      
      // Возвращаем тестовые данные
      const mockNotifications = getMockNotifications(userId).filter(n => !n.read);
      setUnreadCount(mockNotifications.length);
      return { notifications: mockNotifications, unreadCount: mockNotifications.length };
    } catch (error: any) {
      console.error("Ошибка при получении непрочитанных уведомлений:", error);
      setError(error.message || "Не удалось получить непрочитанные уведомления");
      return { notifications: [], unreadCount: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // const { error } = await supabase
      //   .from('notifications')
      //   .update({ read: true })
      //   .eq('id', notificationId);
      
      // if (error) throw error;
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error: any) {
      console.error("Ошибка при отметке уведомления как прочитанного:", error);
      setError(error.message || "Не удалось отметить уведомление как прочитанное");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Отметить все уведомления как прочитанные
  const markAllAsRead = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // const { error } = await supabase
      //   .from('notifications')
      //   .update({ read: true })
      //   .eq('user_id', userId)
      //   .eq('read', false);
      
      // if (error) throw error;
      
      setUnreadCount(0);
      return true;
    } catch (error: any) {
      console.error("Ошибка при отметке всех уведомлений как прочитанных:", error);
      setError(error.message || "Не удалось отметить все уведомления как прочитанные");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление уведомления
  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .select('read')
      //   .eq('id', notificationId)
      //   .single();
      
      // if (error) throw error;
      
      // const wasUnread = data && !data.read;
      
      // const { error: deleteError } = await supabase
      //   .from('notifications')
      //   .delete()
      //   .eq('id', notificationId);
      
      // if (deleteError) throw deleteError;
      
      // если удаляемое уведомление было непрочитанным, уменьшаем счетчик
      // if (wasUnread) {
      //   setUnreadCount(prev => Math.max(0, prev - 1));
      // }
      
      return true;
    } catch (error: any) {
      console.error("Ошибка при удалении уведомления:", error);
      setError(error.message || "Не удалось удалить уведомление");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание нового уведомления (для разработчиков)
  const createNotification = useCallback(async (
    userId: string, 
    title: string, 
    message: string, 
    type: NotificationType,
    link?: string,
    data?: any
  ): Promise<Notification | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // Получаем настройки уведомлений пользователя
      // const { data: settingsData, error: settingsError } = await supabase
      //   .from('notification_settings')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single();
      
      // if (settingsError && settingsError.code !== 'PGRST116') {
      //   // PGRST116 - ошибка "не найдено", что ожидаемо если настройки еще не созданы
      //   throw settingsError;
      // }
      
      // Проверяем настройки для этого типа уведомлений
      // let shouldSend = true;
      
      // if (settingsData) {
      //   const typeField = `${type}_notifications` as keyof NotificationSettings;
      //   shouldSend = settingsData[typeField] as boolean;
      // }
      
      // Если пользователь отключил уведомления этого типа, не отправляем
      // if (!shouldSend) {
      //   console.log(`Уведомление типа ${type} отключено пользователем ${userId}`);
      //   return null;
      // }
      
      // Создаем уведомление
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .insert([{
      //     user_id: userId,
      //     title,
      //     message,
      //     type,
      //     read: false,
      //     link,
      //     data: data ? JSON.stringify(data) : null
      //   }])
      //   .select()
      //   .single();

      // if (error) throw error;
      
      // Увеличиваем счетчик непрочитанных уведомлений
      setUnreadCount(prev => prev + 1);
      
      // Отправка push-уведомления или email может быть реализована здесь
      // с использованием внешних сервисов
      
      return { id: 'mock-id-' + Date.now(), user_id: userId, title, message, type, read: false, link, data, created_at: new Date().toISOString() };
    } catch (error: any) {
      console.error("Ошибка при создании уведомления:", error);
      setError(error.message || "Не удалось создать уведомление");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение настроек уведомлений пользователя
  const getNotificationSettings = useCallback(async (userId: string): Promise<NotificationSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // const { data, error } = await supabase
      //   .from('notification_settings')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single();
      
      // Если настройки не найдены, создаем настройки по умолчанию
      // if (error && error.code === 'PGRST116') {
      //   const defaultSettings = {
      //     user_id: userId,
      //     email_notifications: true,
      //     browser_notifications: true,
      //     test_result_notifications: true,
      //     new_test_notifications: true,
      //     system_notifications: true,
      //     reminder_notifications: true
      //   };
      //   
      //   const { data: newSettings, error: createError } = await supabase
      //     .from('notification_settings')
      //     .insert([defaultSettings])
      //     .select()
      //     .single();
      //     
      //   if (createError) throw createError;
      //   return newSettings;
      // } else if (error) {
      //   throw error;
      // }
      
      // Возвращаем настройки по умолчанию
      return {
        id: `mock-${userId}`,
        user_id: userId,
        email_notifications: true,
        browser_notifications: true,
        test_result_notifications: true,
        new_test_notifications: true,
        system_notifications: true,
        reminder_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("Ошибка при получении настроек уведомлений:", error);
      setError(error.message || "Не удалось получить настройки уведомлений");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление настроек уведомлений пользователя
  const updateNotificationSettings = useCallback(async (
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Когда база данных будет готова, заменить на реальный запрос
      // const { id, user_id, created_at, updated_at, ...updateData } = settings as any;
      
      // const { data, error } = await supabase
      //   .from('notification_settings')
      //   .update(updateData)
      //   .eq('user_id', userId)
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return data;
      
      // Создаем объект с гарантированно заполненными обязательными полями
      const currentDate = new Date().toISOString();
      return {
        id: settings.id || `mock-${userId}`,
        user_id: userId,
        email_notifications: settings.email_notifications ?? true,
        browser_notifications: settings.browser_notifications ?? true,
        test_result_notifications: settings.test_result_notifications ?? true,
        new_test_notifications: settings.new_test_notifications ?? true,
        system_notifications: settings.system_notifications ?? true,
        reminder_notifications: settings.reminder_notifications ?? true,
        created_at: settings.created_at || currentDate,
        updated_at: currentDate
      };
    } catch (error: any) {
      console.error("Ошибка при обновлении настроек уведомлений:", error);
      setError(error.message || "Не удалось обновить настройки уведомлений");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для подписки на уведомления в реальном времени
  const subscribeToNotifications = useCallback((userId: string, callback: (notification: Notification) => void) => {
    // TODO: Когда база данных будет готова, заменить на реальную подписку
    // const subscription = supabase
    //   .channel(`public:notifications:user_id=eq.${userId}`)
    //   .on('postgres_changes', { 
    //     event: 'INSERT', 
    //     schema: 'public', 
    //     table: 'notifications',
    //     filter: `user_id=eq.${userId}` 
    //   }, (payload) => {
    //     const newNotification = payload.new as Notification;
    //     if (!newNotification.read) {
    //       setUnreadCount(prev => prev + 1);
    //     }
    //     callback(newNotification);
    //   })
    //   .subscribe();
    
    // return () => {
    //   subscription.unsubscribe();
    // };
    
    // Для имитации подписки возвращаем функцию отписки
    return () => {};
  }, []);

  // Вспомогательные функции

  // Проверяет, должно ли уведомление быть отправлено
  const shouldSendNotification = async (userId: string, type: NotificationType) => {
    try {
      const settings = await getNotificationSettings(userId);
      if (!settings) return true;
      
      switch (type) {
        case 'test_result':
          return settings.test_result_notifications;
        case 'new_test':
          return settings.new_test_notifications;
        case 'system':
          return settings.system_notifications;
        case 'reminder':
          return settings.reminder_notifications;
        default:
          return true;
      }
    } catch (error) {
      console.error('Ошибка при проверке настроек уведомлений:', error);
      return true; // По умолчанию разрешаем отправку
    }
  };

  // Функция для создания тестовых уведомлений
  const getMockNotifications = (userId: string): Notification[] => {
    return [
      {
        id: '1',
        user_id: userId,
        title: 'Результаты теста',
        message: 'Вы успешно прошли тест "Основы программирования" с результатом 85%',
        type: 'test_result',
        read: false,
        created_at: '2023-11-01T10:30:00Z',
        link: '/profile/results',
      },
      {
        id: '2',
        user_id: userId,
        title: 'Новый тест доступен',
        message: 'Новый тест "JavaScript для начинающих" теперь доступен в вашей панели',
        type: 'new_test',
        read: true,
        created_at: '2023-10-25T15:45:00Z',
        link: '/tests',
      },
      {
        id: '3',
        user_id: userId,
        title: 'Напоминание',
        message: 'У вас есть незавершенный тест. Не забудьте вернуться и закончить его!',
        type: 'reminder',
        read: false,
        created_at: '2023-10-20T09:15:00Z',
        link: '/tests/1',
      },
      {
        id: '4',
        user_id: userId,
        title: 'Системное уведомление',
        message: 'Мы обновили нашу платформу! Проверьте новые функции в своем профиле.',
        type: 'system',
        read: true,
        created_at: '2023-10-15T18:20:00Z',
        link: '/profile',
      },
      {
        id: '5',
        user_id: userId,
        title: 'Результаты теста',
        message: 'Вы прошли тест "HTML и CSS" с результатом 92%',
        type: 'test_result',
        read: false,
        created_at: '2023-10-10T14:30:00Z',
        link: '/profile/results',
        data: JSON.stringify({
          testId: '123',
          score: 92,
          maxScore: 100,
          passedAt: '2023-10-10T14:30:00Z'
        }),
      }
    ];
  };

  return {
    loading,
    error,
    unreadCount,
    getUserNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getNotificationSettings,
    updateNotificationSettings,
    subscribeToNotifications
  };
} 