'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaArrowLeft, FaBell, FaEnvelope, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import useNotifications from '@/hooks/useNotifications';
import ProtectedRoute from '@/components/ProtectedRoute';
import { NotificationSettings } from '@/lib/supabase';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getNotificationSettings, updateNotificationSettings, loading: notificationLoading } = useNotifications();
  
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | null>(null);
  
  // Загружаем настройки при монтировании компонента
  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await getNotificationSettings(user.id);
        setSettings(data);
      } catch (error) {
        console.error('Ошибка загрузки настроек уведомлений:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user, getNotificationSettings]);
  
  // Проверяем разрешения браузера на уведомления
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);
  
  // Запрос разрешения на браузерные уведомления
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
    }
  };
  
  // Обработчик изменения настроек
  const handleChange = (field: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [field]: value
    });
  };
  
  // Обработчик сохранения настроек
  const handleSave = async () => {
    if (!user || !settings) return;
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const updatedSettings = await updateNotificationSettings(user.id, settings);
      if (updatedSettings) {
        setSaveMessage({
          type: 'success',
          text: 'Настройки успешно сохранены'
        });
        
        // Сбрасываем сообщение через 3 секунды
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      } else {
        throw new Error('Не удалось обновить настройки');
      }
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Ошибка при сохранении настроек'
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link 
              href="/profile/notifications"
              className="text-primary-600 hover:text-primary-700 inline-flex items-center mr-3"
            >
              <FaArrowLeft className="mr-1" /> Назад
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900">
              Настройки уведомлений
            </h1>
          </div>
          
          {loading || notificationLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-primary-500 text-2xl mr-2" />
              <span className="text-neutral-600">Загрузка настроек...</span>
            </div>
          ) : !settings ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-xl text-neutral-600 mb-4">Не удалось загрузить настройки уведомлений</p>
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-5 border-b border-neutral-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">
                    Способы получения уведомлений
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Выберите, как вы хотите получать уведомления
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="email_notifications"
                          name="email_notifications"
                          type="checkbox"
                          checked={settings.email_notifications}
                          onChange={(e) => handleChange('email_notifications', e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="email_notifications" className="font-medium text-neutral-700 flex items-center">
                          <FaEnvelope className="mr-2 text-neutral-500" /> 
                          Электронная почта
                        </label>
                        <p className="text-neutral-500">
                          Получать уведомления на почту {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="browser_notifications"
                          name="browser_notifications"
                          type="checkbox"
                          checked={settings.browser_notifications}
                          onChange={(e) => handleChange('browser_notifications', e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="browser_notifications" className="font-medium text-neutral-700 flex items-center">
                          <FaBell className="mr-2 text-neutral-500" /> 
                          Уведомления в браузере
                        </label>
                        <p className="text-neutral-500">
                          Получать push-уведомления в браузере
                        </p>
                        {browserPermission === 'denied' && (
                          <p className="text-red-600 text-xs mt-1 flex items-center">
                            <FaExclamationTriangle className="mr-1" />
                            Вы заблокировали уведомления для этого сайта. Измените настройки в браузере.
                          </p>
                        )}
                        {browserPermission === 'default' && (
                          <button
                            onClick={requestNotificationPermission}
                            className="text-primary-600 hover:text-primary-800 text-xs mt-1"
                          >
                            Разрешить уведомления
                          </button>
                        )}
                        {browserPermission === 'granted' && (
                          <p className="text-green-600 text-xs mt-1 flex items-center">
                            <FaCheck className="mr-1" />
                            Уведомления разрешены
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="bg-neutral-50 px-4 py-5 border-b border-neutral-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">
                    Типы уведомлений
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Выберите, о чем вы хотите получать уведомления
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="test_result_notifications"
                          name="test_result_notifications"
                          type="checkbox"
                          checked={settings.test_result_notifications}
                          onChange={(e) => handleChange('test_result_notifications', e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="test_result_notifications" className="font-medium text-neutral-700">
                          Результаты тестов
                        </label>
                        <p className="text-neutral-500">
                          Уведомления о результатах пройденных тестов
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="new_test_notifications"
                          name="new_test_notifications"
                          type="checkbox"
                          checked={settings.new_test_notifications}
                          onChange={(e) => handleChange('new_test_notifications', e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="new_test_notifications" className="font-medium text-neutral-700">
                          Новые тесты
                        </label>
                        <p className="text-neutral-500">
                          Уведомления о новых доступных тестах
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="system_notifications"
                          name="system_notifications"
                          type="checkbox"
                          checked={settings.system_notifications}
                          onChange={(e) => handleChange('system_notifications', e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="system_notifications" className="font-medium text-neutral-700">
                          Системные уведомления
                        </label>
                        <p className="text-neutral-500">
                          Важные системные уведомления о работе сервиса
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="reminder_notifications"
                          name="reminder_notifications"
                          type="checkbox"
                          checked={settings.reminder_notifications}
                          onChange={(e) => handleChange('reminder_notifications', e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="reminder_notifications" className="font-medium text-neutral-700">
                          Напоминания
                        </label>
                        <p className="text-neutral-500">
                          Уведомления-напоминания о запланированных тестах
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div>
                  {saveMessage && (
                    <div className={`${
                      saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                    } flex items-center`}>
                      {saveMessage.type === 'success' ? (
                        <FaCheck className="mr-1" />
                      ) : (
                        <FaExclamationTriangle className="mr-1" />
                      )}
                      {saveMessage.text}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    saving ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                  } transition-colors`}
                >
                  {saving && <FaSpinner className="animate-spin mr-2" />}
                  {saving ? 'Сохранение...' : 'Сохранить настройки'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 