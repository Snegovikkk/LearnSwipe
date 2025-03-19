'use client';

import { useState } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

export default function ResetPasswordPage() {
  const { resetPassword, loading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Пожалуйста, введите email');
      return;
    }
    
    try {
      const result = await resetPassword(email);
      if (result) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Ошибка сброса пароля:", err);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800">
            Сброс пароля
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Введите ваш email для получения инструкций по сбросу пароля
          </p>
        </div>
        
        {success ? (
          <div className="bg-green-50 p-4 rounded-md text-center">
            <h3 className="text-lg font-medium text-green-800">Запрос отправлен!</h3>
            <p className="mt-2 text-sm text-green-700">
              Мы отправили инструкции по сбросу пароля на указанный email. Пожалуйста, проверьте свою почту.
            </p>
            <div className="mt-4">
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
                Вернуться к входу
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>

            {(error || authError) && (
              <div className="text-red-500 text-sm">
                {error || authError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Отправка...' : 'Отправить инструкции'}
              </button>
            </div>
            
            <div className="text-center">
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Вернуться к входу
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 