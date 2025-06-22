'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { checkDeepSeekStatus, DeepSeekStatus } from '@/lib/deepseek';
import { User } from '@supabase/supabase-js';

const StatusCard = ({ title, status, details }: { title: string; status: 'success' | 'error' | 'loading'; details: string }) => {
  const statusClasses = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    loading: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  };
  const statusText = {
    success: 'Работает',
    error: 'Ошибка',
    loading: 'Проверка...',
  };

  return (
    <div className={`border rounded-lg p-6 shadow-md ${statusClasses[status]}`}>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-lg font-semibold mb-4">
        Статус: <span className="font-bold">{statusText[status]}</span>
      </p>
      <div className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
        <pre><code>{details}</code></pre>
      </div>
    </div>
  );
};

export default function StatusPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [supabaseDetails, setSupabaseDetails] = useState('Выполняется проверка подключения...');
  const [deepseekStatusResult, setDeepseekStatusResult] = useState<DeepSeekStatus | null>(null);
  const [deepseekLoading, setDeepseekLoading] = useState(true);

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        setSupabaseStatus('success');
        const details = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          user: user ? { id: user.id, email: user.email } : 'No authenticated user',
        };
        setSupabaseDetails(JSON.stringify(details, null, 2));
      } catch (error: any) {
        setSupabaseStatus('error');
        setSupabaseDetails(`Ошибка подключения к Supabase:\n${error.message}`);
      }
    };

    const checkDeepseek = async () => {
      try {
        setDeepseekLoading(true);
        const status = await checkDeepSeekStatus();
        setDeepseekStatusResult(status);
      } catch (error: any) {
        setDeepseekStatusResult({
            isAvailable: false,
            error: error.message,
            lastChecked: new Date()
        });
      } finally {
        setDeepseekLoading(false);
      }
    };

    checkSupabase();
    checkDeepseek();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">Статус системы</h1>
        
        <StatusCard 
          title="База данных (Supabase)"
          status={supabaseStatus}
          details={supabaseDetails}
        />

        <StatusCard 
          title="Нейросеть (DeepSeek)"
          status={deepseekLoading ? 'loading' : (deepseekStatusResult?.isAvailable ? 'success' : 'error')}
          details={
            deepseekLoading 
            ? 'Выполняется проверка подключения...' 
            : JSON.stringify(deepseekStatusResult, null, 2)
          }
        />
        <div className="text-center">
            <a href="/" className="text-lg text-cyan-400 hover:text-cyan-200 transition-colors">Вернуться на главную</a>
        </div>
      </div>
    </div>
  );
} 