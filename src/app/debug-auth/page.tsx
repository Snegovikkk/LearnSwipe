'use client';

import { useState } from 'react';
import supabase from '@/lib/supabase';

export default function DebugAuthPage() {
  const [status, setStatus] = useState<string>('');
  const [details, setDetails] = useState<any>(null);

  const checkConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setStatus('Проверка конфигурации...');
    setDetails({
      supabaseUrl: url ? '✅ Установлен' : '❌ Не установлен',
      supabaseKey: key ? '✅ Установлен' : '❌ Не установлен',
      urlValue: url || 'не задан',
      keyValue: key ? `${key.substring(0, 20)}...` : 'не задан'
    });
  };

  const testConnection = async () => {
    setStatus('Проверка подключения к Supabase...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setStatus('❌ Ошибка подключения');
        setDetails({ error: error.message, code: error.status });
      } else {
        setStatus('✅ Подключение успешно');
        setDetails({ 
          session: data.session ? 'Есть активная сессия' : 'Нет активной сессии',
          user: data.session?.user?.email || 'Не авторизован'
        });
      }
    } catch (err: any) {
      setStatus('❌ Ошибка');
      setDetails({ error: err.message });
    }
  };

  const testSignIn = async () => {
    setStatus('Тестирование входа...');
    const testEmail = prompt('Введите email для теста:');
    const testPassword = prompt('Введите пароль для теста:');
    
    if (!testEmail || !testPassword) {
      setStatus('❌ Email и пароль обязательны');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (error) {
        setStatus('❌ Ошибка входа');
        setDetails({ 
          error: error.message,
          code: error.status,
          name: error.name
        });
      } else {
        setStatus('✅ Вход успешен');
        setDetails({ 
          user: data.user?.email,
          session: 'Активна'
        });
      }
    } catch (err: any) {
      setStatus('❌ Ошибка');
      setDetails({ error: err.message });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Диагностика аутентификации</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={checkConfig}
            className="btn w-full"
          >
            Проверить конфигурацию
          </button>
          
          <button
            onClick={testConnection}
            className="btn w-full"
          >
            Проверить подключение к Supabase
          </button>
          
          <button
            onClick={testSignIn}
            className="btn w-full"
          >
            Тестировать вход
          </button>
        </div>

        {status && (
          <div className="bg-neutral-50 border rounded-lg p-4 mb-4">
            <h2 className="font-semibold mb-2">Статус:</h2>
            <p>{status}</p>
          </div>
        )}

        {details && (
          <div className="bg-neutral-50 border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Детали:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

