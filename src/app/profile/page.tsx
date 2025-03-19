'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaUser, FaEdit, FaCheckCircle, FaCog, FaHistory, FaSignOutAlt } from 'react-icons/fa';

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
  const { user, loading: authLoading, error: authError, updateProfile, resetPassword } = useAuth();
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>
        
        {/* Статистика тестов */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Статистика тестов</h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link 
              href="/profile/tests?tab=created"
              className="bg-primary-50 rounded-lg p-4 border border-primary-100 hover:bg-primary-100 transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-primary-600">{testsLoading ? '...' : testStats.created}</div>
              <div className="text-sm text-neutral-600">Создано тестов</div>
            </Link>
            
            <Link 
              href="/profile/tests?tab=taken"
              className="bg-green-50 rounded-lg p-4 border border-green-100 hover:bg-green-100 transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-green-600">{testsLoading ? '...' : testStats.taken}</div>
              <div className="text-sm text-neutral-600">Пройдено тестов</div>
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              href="/create" 
              className="inline-block mt-2 text-primary-600 hover:text-primary-700"
            >
              Создать новый тест
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Личная информация</h2>
          
          {message && (
            <div 
              className={`p-4 mb-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-md shadow-sm text-neutral-500 focus:outline-none"
                />
                <p className="mt-1 text-sm text-neutral-500">
                  Email нельзя изменить
                </p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSaving || authLoading}
                className={`px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  (isSaving || authLoading) ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Безопасность</h2>
          
          <div className="border-t border-neutral-200 pt-4">
            <h3 className="text-lg font-medium mb-2">Смена пароля</h3>
            <p className="text-neutral-600 mb-4">
              Мы отправим вам инструкции по смене пароля на ваш email
            </p>
            <button 
              onClick={handleResetPassword}
              disabled={isResetting}
              className={`px-4 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isResetting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isResetting ? 'Отправка...' : 'Сменить пароль'}
            </button>
          </div>
        </div>
        
        <div className="text-center mt-8 text-sm text-neutral-500">
          <p>Дата регистрации: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Недоступно'}</p>
          <p className="mt-2">LearnSwipe v1.0</p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 