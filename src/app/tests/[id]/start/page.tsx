'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaTimes, FaClock, FaChevronDown, FaChevronUp, FaSpinner, FaLightbulb } from 'react-icons/fa';
import { TestQuestion } from '@/lib/openai';
import useTests from '@/hooks/useTests';
import useAuth from '@/hooks/useAuth';

// Типы для ответов пользователя
interface UserAnswer {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
}

export default function TestStartPage() {
  const router = useRouter();
  const params = useParams();
  const { getTestById, saveTestResult } = useTests();
  const { user } = useAuth();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [remainingTime, setRemainingTime] = useState(900); // 15 минут в секундах
  const [isTutorialDismissed, setIsTutorialDismissed] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Загрузка теста и извлечение вопросов
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
          
          // Извлекаем вопросы из content
          try {
            if (testData.content && typeof testData.content === 'string') {
              const parsed = JSON.parse(testData.content);
              if (Array.isArray(parsed)) {
                setQuestions(parsed);
              }
            }
          } catch (e) {
            console.error('Ошибка при парсинге вопросов:', e);
            setError('Не удалось обработать вопросы теста.');
          }
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
  
  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Эффект для запуска таймера
  useEffect(() => {
    // Запускаем таймер только если тест загружен и вопросы есть
    if (loading || questions.length === 0 || showResult) return;
    
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loading, questions, showResult]);
  
  // Проверка состояния туториала
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTestTutorial');
    if (hasSeenTutorial) {
      setIsTutorialDismissed(true);
    }
  }, []);
  
  const handleDismissTutorial = () => {
    setIsTutorialDismissed(true);
    localStorage.setItem('hasSeenTestTutorial', 'true');
  };
  
  // Проверка, дал ли пользователь ответ на текущий вопрос
  const hasAnswered = (questionId: string) => {
    return userAnswers.some(answer => answer.questionId === questionId);
  };
  
  // Получение ответа пользователя на текущий вопрос
  const getUserAnswer = (questionId: string) => {
    return userAnswers.find(answer => answer.questionId === questionId)?.answerId || null;
  };
  
  // Обработчик выбора варианта ответа
  const handleSelectOption = (questionId: string, optionId: string, isCorrect: boolean) => {
    // Если уже есть ответ, игнорируем
    if (hasAnswered(questionId)) return;
    
    // Добавляем ответ
    setUserAnswers(prev => [...prev, {
      questionId,
      answerId: optionId,
      isCorrect
    }]);
    
    // Вибрация при ответе
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch (error) {
      console.log('Haptic feedback not supported');
    }
    
    // Автоматический переход к следующему вопросу через 1.5 секунды
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    } else if (currentIndex === questions.length - 1) {
      // Если это последний вопрос, показываем результаты через 2 секунды
      setTimeout(() => {
        handleFinishTest();
      }, 2000);
    }
  };
  
  // Обработчики свайпов
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setStartY(event.touches[0].clientY);
    setIsScrolling(false);
  };
  
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isScrolling) return;
    
    const currentY = event.touches[0].clientY;
    const diff = startY - currentY;
    
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      
      // Если мы не в начале или конце контента, позволяем нормальный скролл
      if ((diff > 0 && !isAtBottom) || (diff < 0 && !isAtTop)) {
        setIsScrolling(true);
        return;
      }
    }
  };
  
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isScrolling) return;
    
    const endY = event.changedTouches[0].clientY;
    const diff = startY - endY;
    const threshold = 80;
    
    if (diff > threshold && currentIndex < questions.length - 1) {
      handleNextQuestion();
    } else if (diff < -threshold && currentIndex > 0) {
      handlePrevQuestion();
    }
  };
  
  // Обработчики навигации
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  // Сохранение результатов в базу данных
  const saveResults = async () => {
    if (resultSaved || !user || !test || savingResult) return;
    
    const results = calculateResults();
    
    setSavingResult(true);
    try {
      await saveTestResult({
        user_id: user.id,
        test_id: test.id,
        score: results.score,
        answers: JSON.stringify(userAnswers)
      });
      setResultSaved(true);
    } catch (err) {
      console.error('Ошибка при сохранении результатов:', err);
    } finally {
      setSavingResult(false);
    }
  };
  
  // Завершение теста
  const handleFinishTest = () => {
    setShowResult(true);
    if (user) {
      saveResults();
    }
  };
  
  // Расчет результатов
  const calculateResults = () => {
    const totalQuestions = questions.length;
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 10);
    
    return {
      totalQuestions,
      correctAnswers,
      score,
      percentage: Math.round((correctAnswers / totalQuestions) * 100)
    };
  };
  
  // Анимация для карточек
  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      y: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Загрузка теста...</p>
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
  
  if (questions.length === 0) {
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
            <p className="text-red-500 mb-4">Тест не содержит вопросов</p>
            <p className="text-neutral-600 text-sm mb-6">К сожалению, этот тест пуст или содержит неверный формат данных.</p>
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
  
  // Если отображаем результаты
  if (showResult) {
    const results = calculateResults();
    
    return (
      <div className="min-h-screen py-8 pb-24">
        <div className="app-container h-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Результаты теста</h1>
          
          <div className="card text-center mb-6">
            <div 
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold
                ${results.percentage >= 80 
                  ? 'bg-green-100 text-green-700' 
                  : results.percentage >= 60 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-red-100 text-red-700'
                }`}
            >
              {results.percentage}%
            </div>
            
            <h2 className="text-xl font-bold mb-2">
              {results.percentage >= 80 
                ? 'Отлично!' 
                : results.percentage >= 60 
                ? 'Хороший результат' 
                : 'Есть над чем поработать'}
            </h2>
            
            <p className="text-neutral-600 mb-4">
              Вы ответили правильно на {results.correctAnswers} из {results.totalQuestions} вопросов
            </p>
            
            <div className="border-t border-neutral-200 pt-4 mt-4">
              <p className="font-medium">Оценка: {results.score}/10</p>
              {user ? (
                <p className="text-sm text-neutral-500 mt-2">
                  {resultSaved 
                    ? 'Результаты сохранены в вашем профиле' 
                    : savingResult 
                    ? 'Сохранение результатов...' 
                    : 'Результаты будут сохранены в вашем профиле'}
                </p>
              ) : (
                <p className="text-sm text-primary-600 mt-2">
                  Войдите в систему, чтобы сохранять результаты тестов
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="btn btn-outline w-full"
            >
              Вернуться к информации о тесте
            </button>
            
            <button
              onClick={() => router.push('/tests')}
              className="btn w-full"
            >
              Найти больше тестов
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Если у нас есть вопросы и не показываем результаты, показываем тест
  return (
    <div 
      className="h-screen w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Шапка с информацией */}
      <div className="fixed top-0 left-0 w-full z-10 bg-white shadow-sm px-4 py-2">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <button 
            onClick={() => router.back()} 
            className="text-neutral-600 p-2"
            aria-label="Назад"
          >
            <FaArrowLeft />
          </button>
          
          <div className="flex items-center">
            <FaClock className="text-neutral-500 mr-2" />
            <span className={`font-medium ${remainingTime < 60 ? 'text-red-500' : ''}`}>
              {formatTime(remainingTime)}
            </span>
          </div>
          
          <div className="text-sm font-medium">
            {currentIndex + 1}/{questions.length}
          </div>
        </div>
      </div>
      
      {/* Индикатор прогресса */}
      <div className="fixed top-14 left-0 w-full px-4 z-10">
        <div className="bg-neutral-100 h-1 rounded-full overflow-hidden max-w-3xl mx-auto">
          <div 
            className="bg-primary-500 h-full rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Туториал */}
      {!isTutorialDismissed && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-4/5 z-20 bg-white p-4 rounded-lg shadow-lg text-center">
          <button 
            className="absolute top-2 right-2 text-neutral-400"
            onClick={handleDismissTutorial}
          >
            <FaTimes />
          </button>
          <p className="text-sm mb-2">Свайпайте вверх и вниз для навигации между вопросами</p>
          <div className="flex justify-center space-x-4 text-sm text-neutral-500">
            <div className="flex items-center">
              <FaChevronUp className="mr-1" /> <span>Предыдущий</span>
            </div>
            <div className="flex items-center">
              <FaChevronDown className="mr-1" /> <span>Следующий</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Карусель вопросов */}
      <div className="h-full pt-20">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={questions[currentIndex].id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ 
              duration: 0.3, 
              ease: [0.23, 0.04, 0.27, 1] 
            }}
            className="h-full w-full flex flex-col justify-center px-4 overflow-auto"
            ref={containerRef}
          >
            <div className="max-w-3xl mx-auto w-full card mb-6">
              <h3 className="text-xl font-medium mb-6">{questions[currentIndex].question}</h3>
              
              <div className="space-y-3 mb-5">
                {questions[currentIndex].options.map((option) => {
                  const userAnswerId = getUserAnswer(questions[currentIndex].id);
                  const hasUserAnswered = hasAnswered(questions[currentIndex].id);
                  
                  return (
                    <button
                      key={option.id}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        !hasUserAnswered 
                          ? 'border border-neutral-200 bg-white hover:border-neutral-300' 
                          : option.isCorrect 
                            ? 'bg-green-50 border border-green-300' 
                            : userAnswerId === option.id 
                              ? 'bg-red-50 border border-red-300' 
                              : 'border border-neutral-200 bg-white opacity-70'
                      }`}
                      onClick={() => handleSelectOption(questions[currentIndex].id, option.id, option.isCorrect)}
                      disabled={hasUserAnswered}
                    >
                      <div className="flex items-center">
                        <span className="flex-shrink-0 rounded-full w-6 h-6 flex items-center justify-center border border-neutral-300 text-sm font-medium mr-3">
                          {option.id.toUpperCase()}
                        </span>
                        
                        <span>{option.text}</span>
                        
                        {hasUserAnswered && (
                          <span className="ml-auto">
                            {option.isCorrect ? (
                              <FaCheck className="text-green-500" />
                            ) : userAnswerId === option.id ? (
                              <FaTimes className="text-red-500" />
                            ) : null}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {hasAnswered(questions[currentIndex].id) && questions[currentIndex].explanation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                >
                  <div className="flex">
                    <FaLightbulb className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-1">Объяснение:</h4>
                      <p className="text-sm text-neutral-700">{questions[currentIndex].explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Кнопки навигации */}
            <div className="flex justify-between max-w-3xl mx-auto w-full mb-6">
              <button
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded-md ${
                  currentIndex === 0 
                    ? 'text-neutral-300 cursor-not-allowed' 
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
              >
                <FaChevronUp className="mr-1 inline-block" /> Назад
              </button>
              
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-md text-primary-600 hover:bg-primary-50"
                >
                  Вперёд <FaChevronDown className="ml-1 inline-block" />
                </button>
              ) : (
                <button
                  onClick={handleFinishTest}
                  className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
                >
                  Завершить тест
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 