'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, loading } = useAuth();
  
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  // Проверяем, есть ли токен в URL или параметр verified (для автоматического подтверждения по ссылке из письма)
  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (verified === 'true') {
      setVerified(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } else if (error) {
      setError(errorDescription || 'Не удалось подтвердить email. Ссылка могла истечь.');
    }
  }, [searchParams, router]);

  const handleVerification = async (token: string) => {
    try {
      const result = await verifyEmail(token);
      if (result) {
        setVerified(true);
        // Автоматически перенаправляем на главную страницу через 3 секунды
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (err) {
      setError('Не удалось подтвердить почту. Пожалуйста, повторите попытку или свяжитесь с поддержкой.');
      console.error('Ошибка подтверждения:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800">
            Подтверждение регистрации
          </h2>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="mt-5">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="mt-3 text-neutral-600">
              Подтверждаем вашу почту...
            </p>
          </div>
        ) : verified ? (
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-green-800">Почта подтверждена!</h3>
            <p className="mt-2 text-sm text-green-700">
              Спасибо за подтверждение вашей почты. Вы будете перенаправлены на главную страницу.
            </p>
            <div className="mt-4">
              <Link href="/" className="text-primary-600 hover:text-primary-500">
                Перейти на главную
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-6 text-neutral-600">
              {error || "Мы отправили вам электронное письмо с ссылкой для подтверждения регистрации. Пожалуйста, проверьте вашу почту и перейдите по ссылке для активации аккаунта."}
            </p>
            
            <p className="mt-8 text-sm text-neutral-600">
              Не получили письмо?{' '}
              <button 
                className="font-medium text-primary-600 hover:text-primary-500" 
                onClick={() => {/* Здесь будет функция повторной отправки письма */}}
              >
                Отправить повторно
              </button>
            </p>
            
            <div className="mt-6">
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
                Вернуться к входу
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 