'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, error: authError, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Отслеживаем изменения authError и устанавливаем локальную ошибку
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !name) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    const data = await signUp(email, password, name);
    
    if (data && data.user) {
      setSuccess(true);
      // После успешной регистрации перенаправляем на страницу подтверждения
      setTimeout(() => {
        router.push('/auth/confirmation');
      }, 2000);
    } else {
      // Если signUp вернул null, значит была ошибка
      // Подождем немного, чтобы authError обновился
      setTimeout(() => {
        if (authError) {
          setError(authError);
        } else {
          setError('Не удалось создать аккаунт. Проверьте данные и попробуйте снова.');
        }
      }, 100);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800">
            Создайте аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Или{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              войдите, если у вас уже есть аккаунт
            </Link>
          </p>
        </div>
        
        {success ? (
          <div className="bg-green-50 p-4 rounded-md text-center">
            <h3 className="text-lg font-medium text-green-800">Регистрация успешна!</h3>
            <p className="mt-2 text-sm text-green-700">
              Мы отправили вам письмо с подтверждением. Пожалуйста, проверьте вашу электронную почту.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Имя</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Имя"
                />
              </div>
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
                  className="appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Пароль</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Пароль"
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
                  className="appearance-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Подтвердите пароль"
                />
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
                {loading ? 'Загрузка...' : 'Создать аккаунт'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 