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
    // После загрузки проверяем аутентификацию и перенаправляем если не авторизован
    if (!loading && !user) {
      router.push(fallbackUrl);
    }
  }, [user, loading, fallbackUrl, router]);

  // Если загрузка, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Загрузка...
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь аутентифицирован, показываем дочерние компоненты
  // Оборачиваем в div без блокировки событий
  return user ? <div className="protected-route-content">{children}</div> : null;
} 