'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaUser, FaEdit, FaCheckCircle, FaCog, FaHistory, FaSignOutAlt, FaFileAlt, FaChartLine } from 'react-icons/fa';

// Пример данных пользователя
const mockUser = {
  name: 'Антон Иванов',
  email: 'anton@example.com',
  avatar: null, // null означает, что будет использоваться аватар по умолчанию
  role: 'Студент',
  completedTests: 12,
  createdTests: 3,
  memberSince: 'Январь 2023'
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, updateProfile, resetPassword, signOut } = useAuth();
  const { getUserTests, loading: testsLoading } = useTests();
  
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [testStats, setTestStats] = useState({
    created: 0,
    taken: 0
  });

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      
      // Загружаем статистику тестов пользователя
      async function loadTestStats() {
        try {
          const userTests = await getUserTests(user.id);
          if (userTests) {
            setTestStats({
              created: userTests.length,
              taken: 0 // Здесь можно добавить логику для подсчета пройденных тестов
            });
          }
        } catch (err) {
          console.error('Ошибка при загрузке статистики тестов:', err);
        }
      }
      
      loadTestStats();
    }
  }, [user, getUserTests]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const success = await updateProfile({ name });
      
      if (success) {
        setMessage({
          text: 'Профиль успешно обновлен',
          type: 'success'
        });
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
    if (!user?.email) return;
    
    setIsResetting(true);
    setMessage(null);
    
    try {
      const success = await resetPassword(user.email);
      
      if (success) {
        setMessage({
          text: 'Инструкции по сбросу пароля отправлены на вашу почту',
          type: 'success'
        });
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

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Профиль пользователя - Шапка */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                <FaUser className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{name || user?.user_metadata?.name || 'Пользователь'}</h1>
                <p className="text-neutral-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary px-4 py-2 flex items-center text-neutral-700"
            >
              <FaSignOutAlt className="mr-2" /> Выйти
            </button>
          </div>
        </div>
        
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
        
        {/* Быстрый доступ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link 
            href="/create"
            className="bg-white shadow-sm hover:shadow transition-shadow p-6 rounded-xl border border-neutral-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                <FaFileAlt className="w-5 h-5" />
              </div>
              <h3 className="font-medium mb-1">Создать тест</h3>
              <p className="text-neutral-500 text-sm">Создайте новый тест</p>
            </div>
          </Link>
          
          <Link 
            href="/profile/tests?tab=created"
            className="bg-white shadow-sm hover:shadow transition-shadow p-6 rounded-xl border border-neutral-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                <FaEdit className="w-5 h-5" />
              </div>
              <h3 className="font-medium mb-1">Мои тесты</h3>
              <p className="text-neutral-500 text-sm">Создано: {testsLoading ? '...' : testStats.created}</p>
            </div>
          </Link>
          
          <Link 
            href="/profile/tests?tab=taken"
            className="bg-white shadow-sm hover:shadow transition-shadow p-6 rounded-xl border border-neutral-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                <FaCheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-medium mb-1">Пройденные</h3>
              <p className="text-neutral-500 text-sm">Пройдено: {testsLoading ? '...' : testStats.taken}</p>
            </div>
          </Link>
          
          <Link 
            href="/profile/history"
            className="bg-white shadow-sm hover:shadow transition-shadow p-6 rounded-xl border border-neutral-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <FaChartLine className="w-5 h-5" />
              </div>
              <h3 className="font-medium mb-1">Статистика</h3>
              <p className="text-neutral-500 text-sm">Ваши результаты</p>
            </div>
          </Link>
        </div>
        
        {/* Настройки профиля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Личная информация */}
          <div className="bg-white shadow-sm rounded-xl p-6 border border-neutral-200">
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
          <div className="bg-white shadow-sm rounded-xl p-6 border border-neutral-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaCog className="mr-2 text-primary-500" /> Безопасность
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
              
              <div className="pt-3 border-t border-neutral-200">
                <h3 className="text-lg font-medium mb-2">Дополнительно</h3>
                <Link 
                  href="/profile/settings"
                  className="flex items-center text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  <FaCog className="mr-2" /> Настройки аккаунта 
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-10 text-sm text-neutral-500">
          <p>Дата регистрации: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Недоступно'}</p>
          <p className="mt-1">Lume v1.0</p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 