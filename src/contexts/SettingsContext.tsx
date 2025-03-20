'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Типы для настроек
export type ThemeType = 'light' | 'dark' | 'auto';
export type LanguageType = 'Русский' | 'English';
export type PrivacyType = 'public' | 'private' | 'friends';

export interface Settings {
  theme: ThemeType;
  notifications: boolean;
  autoplay: boolean;
  language: LanguageType;
  privacy: PrivacyType;
}

// Интерфейс контекста
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  toggleSetting: (key: 'notifications' | 'autoplay') => void;
  isDarkMode: boolean;
}

// Контекст настроек с дефолтными значениями
const SettingsContext = createContext<SettingsContextType>({
  settings: {
    theme: 'light',
    notifications: true,
    autoplay: true,
    language: 'Русский',
    privacy: 'public',
  },
  updateSettings: () => {},
  toggleSetting: () => {},
  isDarkMode: false,
});

// Константы
const SETTINGS_STORAGE_KEY = 'lume_settings';

// Хук для использования настроек
export function useSettings() {
  return useContext(SettingsContext);
}

// Провайдер настроек
export function SettingsProvider({ children }: { children: ReactNode }) {
  // Начальные настройки
  const defaultSettings: Settings = {
    theme: 'light',
    notifications: true,
    autoplay: true,
    language: 'Русский',
    privacy: 'public',
  };

  // Состояние настроек
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  
  // Флаг, определяющий, загружены ли настройки
  const [loaded, setLoaded] = useState(false);
  
  // Флаг темной темы
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Загрузка настроек при монтировании
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Сохранение настроек при их изменении
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Ошибка при сохранении настроек:', error);
      }
    }
  }, [settings, loaded]);

  // Определение темной темы на основе настроек
  useEffect(() => {
    if (!loaded) return;

    function updateTheme() {
      const { theme } = settings;
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Определяем, нужно ли использовать темную тему
      const shouldUseDarkMode = 
        theme === 'dark' || 
        (theme === 'auto' && prefersDarkMode);
      
      // Устанавливаем флаг темного режима
      setIsDarkMode(shouldUseDarkMode);
      
      // Добавляем или удаляем класс для темной темы
      if (shouldUseDarkMode) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }
    
    // Обновляем тему сразу и при изменении системной темы
    updateTheme();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateTheme();
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme, loaded]);

  // Обновление настроек
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(current => ({
      ...current,
      ...newSettings
    }));
  };

  // Переключение булевых настроек
  const toggleSetting = (key: 'notifications' | 'autoplay') => {
    setSettings(current => ({
      ...current,
      [key]: !current[key]
    }));
  };

  // Эффект для настройки уведомлений
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Запрашиваем разрешение на уведомления, если они включены
    if (settings.notifications && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [settings.notifications]);

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        toggleSetting, 
        isDarkMode 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsContext; 