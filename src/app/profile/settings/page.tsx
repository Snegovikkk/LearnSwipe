'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheck, FaBell, FaEye, FaLock, FaUser, FaCog, FaMoon, FaSun, FaDesktop } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSettings, ThemeType } from '@/contexts/SettingsContext';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, updateProfile, resetPassword } = useAuth();
  const { settings, updateSettings, toggleSetting, isDarkMode } = useSettings();
  
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (user) {
      try {
        setName(user.user_metadata?.name || '');
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        setMessage({
          text: 'Не удалось загрузить данные пользователя. Попробуйте обновить страницу.',
          type: 'error'
        });
      }
    }
  }, [user]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({
        text: 'Пользователь не авторизован. Войдите в систему заново.',
        type: 'error'
      });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);

    try {
      const success = await updateProfile({ name });
      
      if (success) {
        setMessage({
          text: 'Профиль успешно обновлен',
          type: 'success'
        });
      } else {
        throw new Error('Не удалось обновить профиль');
      }
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error);
      setMessage({
        text: error.message || 'Не удалось обновить профиль',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      setMessage({
        text: 'Email пользователя не найден',
        type: 'error'
      });
      return;
    }
    
    setIsResetting(true);
    setMessage(null);
    
    try {
      const success = await resetPassword(user.email);
      
      if (success) {
        setMessage({
          text: 'Инструкции по сбросу пароля отправлены на вашу почту',
          type: 'success'
        });
      } else {
        throw new Error('Не удалось отправить инструкции по сбросу пароля');
      }
    } catch (error: any) {
      console.error('Ошибка при запросе сброса пароля:', error);
      setMessage({
        text: error.message || 'Не удалось отправить инструкции по сбросу пароля',
        type: 'error'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveSettings = () => {
    try {
      // Специально не передаем объект settings напрямую,
      // чтобы избежать сохранения временных состояний
      updateSettings({
        language: settings.language,
        privacy: settings.privacy,
        theme: settings.theme,
        notifications: settings.notifications,
        autoplay: settings.autoplay
      });
      
      setMessage({
        text: 'Настройки успешно сохранены',
        type: 'success'
      });
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      setMessage({
        text: 'Не удалось сохранить настройки',
        type: 'error'
      });
    }
  };

  // Функция для выбора темы
  const handleThemeChange = (theme: ThemeType) => {
    updateSettings({ theme });
  };

  // Получаем иконку и текст для текущей темы
  const getThemeInfo = (theme: ThemeType) => {
    switch (theme) {
      case 'light':
        return { icon: <FaSun className="w-5 h-5" />, text: 'Светлая' };
      case 'dark':
        return { icon: <FaMoon className="w-5 h-5" />, text: 'Темная' };
      case 'auto':
        return { icon: <FaDesktop className="w-5 h-5" />, text: 'Системная' };
    }
  };

  return (
    <ProtectedRoute>
      <div className="pt-8 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-6 flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-3 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Настройки профиля</h1>
          </div>
          
          {/* Отображаем сообщение об ошибке авторизации, если пользователь не авторизован и загрузка завершена */}
          {!authLoading && !user && (
            <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-800 border border-red-200">
              Вы не авторизованы. Пожалуйста, <button 
                onClick={() => router.push('/auth/login')}
                className="text-primary-600 font-medium hover:underline"
              >
                войдите в систему
              </button> для доступа к настройкам.
            </div>
          )}
          
          {/* Сообщения */}
          {message && (
            <div 
              className={`p-4 mb-6 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {authLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Загрузка...
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">Загрузка настроек...</p>
            </div>
          ) : (
            <>
              {/* Личная информация */}
              <div className="bg-white shadow-sm rounded-xl p-6 border border-neutral-200 mb-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FaUser className="mr-2 text-primary-500" /> Личная информация
                </h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-500"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Email нельзя изменить
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-600 mb-1">
                      Имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                      placeholder="Ваше имя"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSaving || authLoading}
                      className={`btn-primary px-6 py-3 rounded-lg w-full ${
                        (isSaving || authLoading) ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Безопасность */}
              <div className="bg-white shadow-sm rounded-xl p-6 border border-neutral-200 mb-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FaLock className="mr-2 text-primary-500" /> Безопасность
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Смена пароля</h3>
                    <p className="text-neutral-600 mb-4 text-sm">
                      Мы отправим инструкции по смене пароля на вашу электронную почту
                    </p>
                    <button 
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className={`btn-secondary px-6 py-3 rounded-lg w-full ${
                        isResetting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isResetting ? 'Отправка...' : 'Сменить пароль'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Общие настройки */}
              <div className="bg-white shadow-sm rounded-xl p-6 border border-neutral-200 mb-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FaCog className="mr-2 text-primary-500" /> Общие настройки
                </h2>

                {/* Выбор темы */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Тема приложения</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.theme === 'light' 
                          ? 'border-primary-500 bg-primary-50 text-primary-600' 
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <FaSun className="text-2xl mb-2" />
                      <span>Светлая</span>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.theme === 'dark' 
                          ? 'border-primary-500 bg-primary-50 text-primary-600' 
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <FaMoon className="text-2xl mb-2" />
                      <span>Темная</span>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        settings.theme === 'auto' 
                          ? 'border-primary-500 bg-primary-50 text-primary-600' 
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <FaDesktop className="text-2xl mb-2" />
                      <span>Системная</span>
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">
                    {settings.theme === 'auto' ? 'Тема будет автоматически меняться в соответствии с настройками вашей системы' : ''}
                    {settings.theme === 'light' ? 'Всегда использовать светлую тему' : ''}
                    {settings.theme === 'dark' ? 'Всегда использовать темную тему' : ''}
                  </p>
                </div>

                {/* Переключатель для уведомлений */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                  <div className="flex items-center">
                    <FaBell className="text-neutral-500 mr-3" />
                    <div>
                      <div>Уведомления</div>
                      <div className="text-xs text-neutral-500">Получать уведомления о новых тестах</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('notifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${settings.notifications ? 'bg-primary-500' : 'bg-neutral-300'}
                    `}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Переключатель для автопроигрывания */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <FaCheck className="text-neutral-500 mr-3" />
                    <div>
                      <div>Автопроигрывание</div>
                      <div className="text-xs text-neutral-500">Автоматически переходить к следующему вопросу</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('autoplay')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${settings.autoplay ? 'bg-primary-500' : 'bg-neutral-300'}
                    `}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${settings.autoplay ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>

              {/* Предпочтения */}
              <div className="bg-white shadow-sm rounded-xl p-6 border border-neutral-200 mb-6">
                <h2 className="text-xl font-semibold mb-6">Предпочтения</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Язык приложения
                  </label>
                  <select 
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value as any })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                  >
                    <option value="Русский">Русский</option>
                    <option value="English">English</option>
                  </select>
                </div>

                {/* Настройки приватности */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    <div className="flex items-center">
                      <FaLock className="text-neutral-500 mr-2" />
                      <span>Приватность профиля</span>
                    </div>
                  </label>
                  <select 
                    value={settings.privacy}
                    onChange={(e) => updateSettings({ privacy: e.target.value as any })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                  >
                    <option value="public">Публичный</option>
                    <option value="private">Приватный</option>
                    <option value="friends">Только для друзей</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    Определяет, кто может видеть ваши созданные тесты и статистику
                  </p>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={handleSaveSettings}
                    className="btn-primary px-6 py-3 rounded-lg w-full"
                  >
                    Сохранить настройки
                  </button>
                </div>
              </div>

              {/* Кнопка возврата */}
              <div className="mt-8">
                <button 
                  className="btn-secondary w-full py-3 rounded-lg"
                  onClick={() => router.push('/profile')}
                >
                  Вернуться в профиль
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 