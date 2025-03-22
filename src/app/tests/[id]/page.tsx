'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useTests from '@/hooks/useTests';
import useAuth from '@/hooks/useAuth';
import TestCard from '@/components/test/TestCard';
import { FaArrowLeft, FaSpinner, FaClock, FaExclamationTriangle, FaUser, FaCalendarAlt, FaPlayCircle } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface TestDetailPageProps {
  params: {
    id: string;
  };
}

// Режимы просмотра
enum ViewMode {
  INFO = 'info',
  PREVIEW = 'preview'
}

export default function TestDetailPage({ params }: TestDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { getTestById } = useTests();
  const [test, setTest] = useState<any>(null);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.INFO);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    async function fetchTest() {
      setLoading(true);
      try {
        const testData = await getTestById(params.id);
        if (!testData) {
          setError('Тест не найден');
          setLoading(false);
          return;
        }
        
        setTest(testData);
        
        // Парсим контент теста, если он есть
        if (testData.content) {
          try {
            let questions = [];
            const content = typeof testData.content === 'string' 
              ? JSON.parse(testData.content) 
              : testData.content;
              
            if (Array.isArray(content.questions)) {
              questions = content.questions;
            } else if (Array.isArray(content)) {
              questions = content;
            }
            
            // Берем только первые 3 вопроса для предпросмотра
            setPreviewQuestions(questions.slice(0, 3));
          } catch (err) {
            console.error('Ошибка при парсинге контента теста:', err);
            setPreviewQuestions([]);
          }
        }
        
        setError(null);
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < previewQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Если дошли до конца предпросмотра, возвращаемся к информации
      setViewMode(ViewMode.INFO);
      setCurrentQuestionIndex(0);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getQuestionCount = () => {
    try {
      if (test?.content) {
        const content = typeof test.content === 'string' 
          ? JSON.parse(test.content) 
          : test.content;
          
        if (Array.isArray(content.questions)) {
          return content.questions.length;
        } else if (Array.isArray(content)) {
          return content.length;
        }
      }
      return 0;
    } catch (e) {
      console.error('Ошибка при подсчете вопросов:', e);
      return 0;
    }
  };

  const getEstimatedTime = () => {
    // Предполагаем, что на один вопрос уходит примерно 1 минута
    const questionCount = getQuestionCount();
    if (questionCount === 0) return '< 1 мин';
    
    const minutes = questionCount;
    if (minutes < 60) {
      return `${minutes} мин`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} ч ${remainingMinutes > 0 ? remainingMinutes + ' мин' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-neutral-700 mb-2">Загрузка теста...</h2>
          <p className="text-neutral-500">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 bg-white">
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
          <div className="card text-center p-8">
            <div className="text-red-500 text-5xl mb-4">
              <FaExclamationTriangle className="mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-4">Не удалось загрузить тест</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button 
              onClick={() => router.back()}
              className="btn"
            >
              Вернуться к тестам
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen py-8 bg-white">
        <div className="app-container">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="mr-3 text-neutral-600"
              aria-label="Назад"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">Тест не найден</h1>
          </div>
          <div className="card text-center p-8">
            <p className="text-neutral-600 mb-6">Запрошенный тест не существует или был удален.</p>
            <button 
              onClick={() => router.back()}
              className="btn"
            >
              Вернуться к тестам
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === ViewMode.PREVIEW && previewQuestions.length > 0) {
    return (
      <div className="min-h-screen py-6 bg-white">
        <div className="app-container">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => {
                setViewMode(ViewMode.INFO);
                setCurrentQuestionIndex(0);
              }}
              className="mr-3 text-neutral-600"
              aria-label="Назад"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-xl font-bold">Предпросмотр теста</h1>
          </div>
          
          <div className="text-center mb-4">
            <span className="text-sm font-medium text-neutral-500">
              Вопрос {currentQuestionIndex + 1} из {previewQuestions.length}
            </span>
          </div>
          
          <AnimatePresence mode="wait">
            <TestCard 
              key={currentQuestionIndex}
              id={previewQuestions[currentQuestionIndex].id || `preview-${currentQuestionIndex}`}
              question={previewQuestions[currentQuestionIndex].question}
              options={previewQuestions[currentQuestionIndex].options}
              explanation={previewQuestions[currentQuestionIndex].explanation || 'Пояснение не предоставлено'}
              onNextQuestion={handleNextQuestion}
              isLastQuestion={currentQuestionIndex === previewQuestions.length - 1}
            />
          </AnimatePresence>
          
          <div className="mt-6 text-center">
            <p className="text-neutral-500 text-sm mb-4">
              Это предпросмотр теста. В полной версии вы увидите все {getQuestionCount()} вопросов.
            </p>
            <button 
              onClick={handleStartTest}
              className="btn"
            >
              Начать полный тест
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 pb-24 bg-white">
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
          <h2 className="text-xl font-bold mb-4">{test.title}</h2>
          <p className="text-neutral-600 mb-6">
            {test.description || 'Пройдите этот тест, чтобы проверить свои знания.'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-neutral-600">
              <FaUser className="mr-2 text-neutral-400" />
              <span>Автор: {test.user_id ? 'Пользователь' : 'Система'}</span>
            </div>
            <div className="flex items-center text-neutral-600">
              <FaCalendarAlt className="mr-2 text-neutral-400" />
              <span>Создан: {formatDate(test.created_at)}</span>
            </div>
            <div className="flex items-center text-neutral-600">
              <span className="mr-2 text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span>Вопросов: {getQuestionCount()}</span>
            </div>
            <div className="flex items-center text-neutral-600">
              <FaClock className="mr-2 text-neutral-400" />
              <span>Время: {getEstimatedTime()}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleStartTest}
              className="btn bg-primary-600 text-white hover:bg-primary-700"
            >
              <FaPlayCircle className="mr-2" />
              Начать тест
            </button>
            
            {previewQuestions.length > 0 && (
              <button 
                onClick={() => setViewMode(ViewMode.PREVIEW)}
                className="btn btn-outline"
              >
                Предпросмотр вопросов
              </button>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">О чем этот тест</h3>
          <p className="text-neutral-600 whitespace-pre-line">
            {test.long_description || 
             `Этот тест содержит ${getQuestionCount()} вопросов и поможет вам проверить ваши знания. 
             
Прохождение займет примерно ${getEstimatedTime()}.

После завершения вы сможете увидеть свои результаты и узнать правильные ответы.`}
          </p>
        </div>
      </div>
    </div>
  );
} 