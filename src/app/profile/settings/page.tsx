'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheck, FaBell, FaEye, FaLock } from 'react-icons/fa';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoplay: true,
    language: 'Русский',
    privacy: 'public'
  });

  const toggleSetting = (setting: 'notifications' | 'darkMode' | 'autoplay') => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const changeSetting = (setting: 'language' | 'privacy', value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="pt-8 pb-24">
      <div className="app-container">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-3 text-neutral-600"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Настройки</h1>
        </div>

        {/* Общие настройки */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Общие</h2>

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

          {/* Переключатель для темной темы */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-200">
            <div className="flex items-center">
              <FaEye className="text-neutral-500 mr-3" />
              <div>
                <div>Темная тема</div>
                <div className="text-xs text-neutral-500">Включить темную тему интерфейса</div>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('darkMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.darkMode ? 'bg-primary-500' : 'bg-neutral-300'}
              `}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}
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

        {/* Выбор языка */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4">Предпочтения</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Язык приложения
            </label>
            <select 
              value={settings.language}
              onChange={(e) => changeSetting('language', e.target.value)}
              className="form-input w-full"
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
              onChange={(e) => changeSetting('privacy', e.target.value)}
              className="form-input w-full"
            >
              <option value="public">Публичный</option>
              <option value="private">Приватный</option>
              <option value="friends">Только для друзей</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Определяет, кто может видеть ваши созданные тесты и статистику
            </p>
          </div>
        </div>

        {/* Кнопки для управления аккаунтом */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4">Управление аккаунтом</h2>
          
          <button className="w-full py-2 mb-2 text-center border border-neutral-300 rounded-md hover:bg-neutral-50">
            Изменить пароль
          </button>
          
          <button className="w-full py-2 text-center text-red-500 border border-red-300 rounded-md hover:bg-red-50">
            Удалить аккаунт
          </button>
        </div>

        {/* Кнопка сохранения */}
        <div className="mt-8">
          <button 
            className="btn w-full"
            onClick={() => {
              // Здесь был бы API-запрос для сохранения настроек
              router.push('/profile');
            }}
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
} 