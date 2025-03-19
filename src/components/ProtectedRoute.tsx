'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

type ProtectedRouteProps = {
  children: React.ReactNode;
  fallbackUrl?: string;
};

export default function ProtectedRoute({ 
  children, 
  fallbackUrl = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Проверяем только после загрузки данных о пользователе
    if (!loading && !user) {
      // Перенаправляем неавторизованных пользователей
      router.push(fallbackUrl);
    }
  }, [user, loading, router, fallbackUrl]);

  // Отображаем индикатор загрузки
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Если пользователь аутентифицирован, отображаем содержимое
  return user ? <>{children}</> : null;
} 