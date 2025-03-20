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
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const { getUserTests, loading: testsLoading } = useTests();
  
  const [testStats, setTestStats] = useState({
    created: 0,
    taken: 0
  });

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (user) {
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
                <h1 className="text-3xl font-bold">{user?.user_metadata?.name || 'Пользователь'}</h1>
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
            href="/profile/settings"
            className="bg-white shadow-sm hover:shadow transition-shadow p-6 rounded-xl border border-neutral-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center mb-3">
                <FaCog className="w-5 h-5" />
              </div>
              <h3 className="font-medium mb-1">Настройки</h3>
              <p className="text-neutral-500 text-sm">Личные данные и безопасность</p>
            </div>
          </Link>
        </div>
        
        {/* Дополнительные действия */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-neutral-200 mb-10">
          <h2 className="text-xl font-semibold mb-6">Дополнительные возможности</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            <Link 
              href="/tests"
              className="flex items-center p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                <FaFileAlt className="w-4 h-4" />
              </div>
              <span>Просмотреть все тесты</span>
            </Link>
            
            <Link 
              href="/profile/history"
              className="flex items-center p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                <FaHistory className="w-4 h-4" />
              </div>
              <span>История прохождений</span>
            </Link>
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