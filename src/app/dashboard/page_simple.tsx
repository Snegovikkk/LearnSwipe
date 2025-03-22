'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);
  
  // Показываем загрузку, пока проверяем авторизацию
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Загрузка...
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-600">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  // Скрываем содержимое для неавторизованных пользователей
  if (!user) {
    return null;
  }

  // Отображаем простую версию дашборда
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Моя статистика (упрощенная версия)</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
        <p className="text-lg mb-4">
          Добро пожаловать в упрощенную версию дашборда для тестирования.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/dashboard/test"
            className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700"
          >
            Перейти к тестовой странице
          </Link>
        </div>
      </div>
    </div>
  );
} 