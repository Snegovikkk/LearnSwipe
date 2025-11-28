'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, error: authError, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Отслеживаем изменения authError и устанавливаем локальную ошибку
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    const data = await signIn(email, password);
    if (data && data.user) {
      router.push('/profile');
      router.refresh();
    } else {
      // Если signIn вернул null, значит была ошибка
      // authError уже установлен в useAuth и будет отображен через useEffect
      // Но на случай, если authError еще не обновился, показываем общее сообщение
      if (!authError) {
        setError('Неверный email или пароль. Проверьте данные и попробуйте снова.');
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800">
            Войдите в свой аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Или{' '}
            <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
              зарегистрируйтесь, если у вас нет аккаунта
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                Запомнить меня
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/reset-password" className="font-medium text-primary-600 hover:text-primary-500">
                Забыли пароль?
              </Link>
            </div>
          </div>

          {(error || authError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error || authError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-6 border border-transparent text-md font-medium rounded-md text-neutral-900 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''} shadow-md transition-all duration-200 hover:shadow-lg`}
            >
              {loading ? 'Загрузка...' : 'Войти в аккаунт'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
