'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaArrowLeft, FaPlay, FaInfoCircle, FaShare, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import useTests from '@/hooks/useTests';
import useAuth from '@/hooks/useAuth';

export default function TestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getTestById } = useTests();
  const { user } = useAuth();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchTest() {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const testData = await getTestById(params.id as string);
        if (!testData) {
          setError('Тест не найден');
        } else {
          setTest(testData);
          setError(null);
        }
      } catch (err) {
        console.error('Ошибка при загрузке теста:', err);
        setError('Не удалось загрузить тест. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTest();
  }, [params.id, getTestById]);
  
  const handleStartTest = () => {
    router.push(`/tests/${params.id}/start`);
  };
  
  const handleShareTest = () => {
    if (navigator.share) {
      navigator.share({
        title: `Тест: ${test.title}`,
        text: `Проверь свои знания! Пройди тест "${test.title}" на LearnSwipe.`,
        url: window.location.href,
      }).catch((error) => {
        console.log('Ошибка при попытке поделиться', error);
      });
    } else {
      // Копирование ссылки в буфер обмена, если Web Share API не поддерживается
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };
  
  if (loading) {
    return (
      <div className="py-8">
        <div className="app-container">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="mr-3 text-neutral-600"
              aria-label="Назад"
            >
              <FaArrowLeft />
            </button>
            <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded-md"></div>
          </div>
          <div className="card">
            <div className="h-6 w-3/4 bg-neutral-200 animate-pulse rounded-md mb-4"></div>
            <div className="h-4 w-1/2 bg-neutral-200 animate-pulse rounded-md mb-6"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 bg-neutral-200 animate-pulse rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8">
        <div className="app-container">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="mr-3 text-neutral-600"
              aria-label="Назад"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">Ошибка</h1>
          </div>
          <div className="card text-center">
            <FaExclamationTriangle className="text-3xl text-amber-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">Не удалось загрузить тест</p>
            <p className="text-neutral-600 text-sm mb-6">{error}</p>
            <button 
              onClick={() => router.back()}
              className="btn"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!test) {
    return null;
  }
  
  // Извлекаем вопросы из content, если они есть
  let questions = [];
  try {
    if (test.content && typeof test.content === 'string') {
      // Пытаемся распарсить JSON, если в content хранятся вопросы
      const parsed = JSON.parse(test.content);
      if (Array.isArray(parsed)) {
        questions = parsed;
      }
    }
  } catch (e) {
    console.log('Ошибка при парсинге вопросов', e);
  }
  
  const questionsCount = questions.length || 10;
  const formattedDate = new Date(test.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return (
    <div className="py-8 pb-24">
      <div className="app-container">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="mr-3 text-neutral-600"
            aria-label="Назад"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Информация о тесте</h1>
        </div>
        
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-2">{test.title}</h2>
          <p className="text-neutral-600 mb-4">
            {typeof test.content === 'string' && !questions.length 
              ? test.content.substring(0, 200) + (test.content.length > 200 ? '...' : '')
              : 'Нажмите кнопку "Начать тест", чтобы проверить свои знания!'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-neutral-500">Количество вопросов</p>
              <p className="font-medium">{questionsCount}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ограничение времени</p>
              <p className="font-medium">15 минут</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Уровень сложности</p>
              <p className="font-medium">Средний</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Создан</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-neutral-600 text-sm">
            <FaInfoCircle className="text-neutral-400" />
            <p>Создатель: {test.user_id ? 'Пользователь' : 'Система'}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleStartTest}
            className="btn flex-1"
          >
            <FaPlay className="mr-2" />
            Начать тест
          </button>
          
          <button
            onClick={handleShareTest}
            className="btn btn-outline"
            aria-label="Поделиться тестом"
          >
            <FaShare />
          </button>
        </div>
      </div>
    </div>
  );
} 