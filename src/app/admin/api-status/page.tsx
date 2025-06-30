'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/auth';
import { useSession } from 'next-auth/react';
import { DeepSeekStatus } from '@/lib/deepseek';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

// Функция для проверки прав администратора
const isAdmin = (email: string | null | undefined) => {
  const adminEmails = ['lumeswipe@internet.ru', 'lumeswipe@bk.ru', 'sedimatyt@bk.ru']; // Добавьте сюда свою почту
  return email && adminEmails.includes(email);
};

const ApiStatusPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<DeepSeekStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Проверяем, является ли пользователь администратором
  useEffect(() => {
    if (status === 'authenticated') {
      if (!isAdmin(session?.user?.email)) {
        router.push('/');
      } else {
        checkApiStatus();
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, session, router]);

  // Функция для проверки статуса API
  const checkApiStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/check-deepseek-status');
      
      if (!response.ok) {
        throw new Error('Не удалось получить статус API');
      }
      
      const data = await response.json();
      setApiStatus(data);
      setLastChecked(new Date());
    } catch (err) {
      console.error('Ошибка при проверке статуса API:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Если загрузка, показываем индикатор загрузки
  if (loading && !apiStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Загрузка...
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-600">Проверка статуса API...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Статус DeepSeek API</h1>
          <Link href="/admin" className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded text-sm text-neutral-700 transition-colors">
            Назад к панели администратора
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Состояние API</h2>
            <button 
              onClick={checkApiStatus} 
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm transition-colors"
              disabled={loading}
            >
              {loading ? 'Проверка...' : 'Обновить статус'}
            </button>
          </div>
          
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Ошибка при проверке API:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {apiStatus && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {apiStatus.isAvailable ? 'API доступно' : 'API недоступно'}
                </span>
              </div>
              
              {apiStatus.balance !== undefined && (
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="font-medium mb-1">Баланс API:</p>
                  <p className="text-2xl font-bold">${apiStatus.balance.toFixed(2)}</p>
                </div>
              )}
              
              {apiStatus.error && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-medium mb-1">Сообщение об ошибке:</p>
                  <p className="text-sm text-amber-800">{apiStatus.error}</p>
                </div>
              )}
              
              {lastChecked && (
                <div className="text-sm text-neutral-500">
                  Последняя проверка: {lastChecked.toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold mb-4">Управление DeepSeek API</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium mb-2">Действия при недоступности API:</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-neutral-700">
                <li>Проверьте баланс в личном кабинете DeepSeek</li>
                <li>Убедитесь, что API ключ действителен</li>
                <li>Приложение автоматически использует локальную генерацию тестов при недоступности API</li>
              </ul>
            </div>
            
            <p className="text-sm text-neutral-600">
              При отказе DeepSeek API приложение автоматически переключается на локальную генерацию тестов. 
              Хотя локальные тесты менее персонализированы, приложение продолжит функционировать.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ApiStatusPage; 