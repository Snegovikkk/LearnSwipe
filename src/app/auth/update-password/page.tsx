'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Проверяем валидность токена при загрузке
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setTokenValid(false);
      setError('Отсутствует токен для восстановления пароля.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      // Здесь должен быть код для обновления пароля через Supabase
      // const { error } = await supabase.auth.updateUser({ password });
      // if (error) throw error;
      
      // Имитация успешного обновления пароля
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Перенаправляем на страницу входа через 3 секунды
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      console.error('Ошибка обновления пароля:', err);
      setError(err.message || 'Не удалось обновить пароль');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800">
              Ошибка восстановления пароля
            </h2>
          </div>
          
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">
              Недействительная или истекшая ссылка для восстановления пароля.
            </p>
            <div className="mt-4">
              <Link href="/auth/reset-password" className="text-primary-600 hover:text-primary-500">
                Запросить новую ссылку
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800">
            Создание нового пароля
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Введите новый пароль для вашей учетной записи
          </p>
        </div>
        
        {success ? (
          <div className="bg-green-50 p-4 rounded-md text-center">
            <h3 className="text-lg font-medium text-green-800">Пароль изменен!</h3>
            <p className="mt-2 text-sm text-green-700">
              Ваш пароль был успешно обновлен. Вы будете перенаправлены на страницу входа.
            </p>
            <div className="mt-4">
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
                Перейти на страницу входа
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="sr-only">Новый пароль</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Новый пароль"
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="sr-only">Подтвердите пароль</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Подтвердите пароль"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Обновление...' : 'Обновить пароль'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 