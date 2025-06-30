'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaRegCreditCard, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function SubscriptionPage() {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();

  // Имитация состояния подписки, пока нет бэкенда
  const [isSubscribed, setIsSubscribed] = useState(user?.subscription?.active || false);
  const [nextBillingDate, setNextBillingDate] = useState('25 июля 2024 г.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscribe', { method: 'POST' });
      if (!response.ok) throw new Error('Не удалось оформить подписку');
      
      // Здесь будет логика для CloudPayments
      toast.success('Заглушка: успешная подписка!');
      setIsSubscribed(true);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/unsubscribe', { method: 'POST' });
      if (!response.ok) throw new Error('Не удалось отменить подписку');
      
      toast.success('Подписка успешно отменена');
      setIsSubscribed(false);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="flex items-center mb-8">
            <button onClick={() => router.back()} className="mr-4 text-neutral-600 hover:text-primary-600">
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold">Подписка Lume+</h1>
          </div>
          
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Расширьте возможности</h2>
                <p className="text-neutral-600 text-lg">Всего за <span className="font-bold text-primary-600">99 ₽</span> в месяц</p>
              </div>
              <div className="mt-6 md:mt-0">
                {!isSubscribed ? (
                  <button 
                    onClick={handleSubscribe} 
                    disabled={isLoading}
                    className="btn btn-primary w-full md:w-auto px-8 py-4 text-lg flex items-center justify-center"
                  >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaCreditCard className="mr-2" />}
                    Оформить подписку
                  </button>
                ) : (
                  <div className="text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-end gap-2 text-green-600 font-semibold text-lg">
                      <FaCheckCircle />
                      <span>Подписка активна</span>
                    </div>
                     <p className="text-sm text-neutral-500 mt-1">
                      Следующее списание: {nextBillingDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isSubscribed && (
               <div className="mt-8 border-t pt-6">
                 <button
                    onClick={handleUnsubscribe}
                    disabled={isLoading}
                    className="text-neutral-500 hover:text-red-600 transition-colors text-sm flex items-center w-full justify-center md:justify-start"
                  >
                   {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                   Отменить подписку
                 </button>
               </div>
            )}
          </div>
          
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4">Что дает подписка Lume+?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span><b>Безлимитная генерация тестов</b> — создавайте столько тестов, сколько нужно.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span><b>Расширенная аналитика</b> — отслеживайте свой прогресс с подробными отчетами.</span>
              </li>
               <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span><b>Приоритетная поддержка</b> — получайте ответы на свои вопросы в первую очередь.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 