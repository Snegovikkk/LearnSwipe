'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaTimes, FaClock, FaChevronDown, FaChevronUp, FaSpinner, FaLightbulb, FaFileAlt, FaSearch, FaRedoAlt, FaChartLine } from 'react-icons/fa';
import { TestQuestion } from '@/lib/openai';
import useTests from '@/hooks/useTests';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';

// Добавляем стили для печати
const printStyles = `
  @media print {
    body {
      font-family: Arial, sans-serif;
      background: white;
      color: black;
      margin: 0;
      padding: 0;
    }
    
    .app-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    
    .no-print {
      display: none !important;
    }
    
    .card {
      box-shadow: none !important;
      border: 1px solid #ddd;
      break-inside: avoid;
    }
    
    .print-full-width {
      width: 100% !important;
      max-width: 100% !important;
    }
    
    h1 {
      font-size: 24px !important;
      margin-bottom: 20px !important;
    }
    
    h2 {
      font-size: 20px !important;
    }
    
    p {
      font-size: 14px !important;
    }
    
    .print-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    
    .print-footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  }
`;

// Типы для ответов пользователя
interface UserAnswer {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
}

// Состояния страницы теста
enum TestPageState {
  LOADING = 'loading',
  ERROR = 'error',
  NO_QUESTIONS = 'no_questions',
  READY = 'ready',
  RESULT = 'result',
  TEST = 'test'
}

export default function TestStartPage() {
  const router = useRouter();
  const params = useParams();
  const { getTestById, saveTestResult } = useTests();
  const { user } = useAuth();
  
  // Основное состояние
  const [pageState, setPageState] = useState<TestPageState>(TestPageState.LOADING);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // UI состояния
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [remainingTime, setRemainingTime] = useState(900); // 15 минут в секундах
  const [isTutorialDismissed, setIsTutorialDismissed] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  
  // Добавляем константу для ключа localStorage
  const TEST_RESULTS_STORAGE_KEY = 'lastTestResults';
  
  // Загрузка теста и извлечение вопросов
  useEffect(() => {
    let mounted = true;
    
    async function fetchTest() {
      if (!params.id) return;
      
      try {
        const testData = await getTestById(params.id as string);
        
        // Если компонент размонтирован, не обновляем состояние
        if (!mounted) return;
        
        if (!testData) {
          setError('Тест не найден');
          setPageState(TestPageState.ERROR);
          return;
        }
        
        setTest(testData);
        
        // Извлекаем вопросы из content
        try {
          let parsedQuestions: TestQuestion[] = [];
          
          // Проверка наличия content
          if (!testData.content) {
            setError('Тест не содержит вопросов (content отсутствует)');
            setPageState(TestPageState.ERROR);
            return;
          }
          
          // Обработка content в зависимости от типа
          if (typeof testData.content === 'string') {
            try {
              // Пытаемся распарсить JSON из строки content
              const parsed = JSON.parse(testData.content);
              
              // Проверяем правильность формата данных
              if (Array.isArray(parsed)) {
                // Если content содержит прямой массив вопросов
                parsedQuestions = parsed;
              } else if (parsed.questions && Array.isArray(parsed.questions)) {
                // Если content имеет поле questions с массивом
                parsedQuestions = parsed.questions;
              } else {
                console.error('Неизвестный формат content:', parsed);
                setError('Неизвестный формат данных теста');
                setPageState(TestPageState.ERROR);
                return;
              }
            } catch (e) {
              console.error('Ошибка при парсинге JSON из строки content:', e);
              setError('Ошибка при обработке данных теста: ' + (e as Error).message);
              setPageState(TestPageState.ERROR);
              return;
            }
          } else if (typeof testData.content === 'object') {
            // Если content уже является объектом (например, из Postgres JSONB)
            if (Array.isArray(testData.content)) {
              parsedQuestions = testData.content;
            } else if (testData.content.questions && Array.isArray(testData.content.questions)) {
              parsedQuestions = testData.content.questions;
            } else {
              console.error('Неизвестный формат content (объект):', testData.content);
              setError('Неизвестный формат данных теста (объект)');
              setPageState(TestPageState.ERROR);
              return;
            }
          } else {
            console.error('Неподдерживаемый тип content:', typeof testData.content);
            setError('Неподдерживаемый формат данных теста');
            setPageState(TestPageState.ERROR);
            return;
          }
          
          // Валидация вопросов перед установкой в состояние
          if (parsedQuestions.length === 0) {
            console.error('Пустой массив вопросов');
            setError('Тест не содержит вопросов');
            setPageState(TestPageState.NO_QUESTIONS);
            return;
          }
          
          // Проверяем структуру каждого вопроса
          const validatedQuestions = parsedQuestions.map((q, index) => ({
            id: q.id || `q${index + 1}`,
            question: q.question || `Вопрос ${index + 1}`,
            options: Array.isArray(q.options) 
              ? q.options.map((opt, optIndex) => ({
                  id: opt.id || String.fromCharCode(97 + optIndex), // a, b, c, d
                  text: opt.text || `Вариант ${optIndex + 1}`,
                  isCorrect: !!opt.isCorrect
                }))
              : [],
            explanation: q.explanation || ''
          }));
          
          // Устанавливаем вопросы в состояние и меняем статус страницы
          console.log('Успешно загружено и валидировано вопросов:', validatedQuestions.length);
          setQuestions(validatedQuestions);
          // Сразу переходим к прохождению теста
          setPageState(TestPageState.TEST);
          setIsTutorialDismissed(true);
        } catch (e) {
          console.error('Общая ошибка при обработке вопросов:', e);
          setError('Не удалось обработать вопросы теста. Подробности: ' + (e as Error).message);
          setPageState(TestPageState.ERROR);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Ошибка при загрузке теста:', err);
        setError('Не удалось загрузить тест. Пожалуйста, попробуйте позже.');
        setPageState(TestPageState.ERROR);
      }
    }
    
    fetchTest();
    
    // Очистка при размонтировании компонента
    return () => {
      mounted = false;
    };
  }, [params.id, getTestById]);
  
  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Эффект для запуска таймера
  useEffect(() => {
    // Запускаем таймер только если тест готов к прохождению и не в режиме отображения результатов
    if (pageState !== TestPageState.TEST) return;
    
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
  }, [pageState]);
  
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
    const userAnswer = userAnswers.find(answer => answer.questionId === questionId);
    // Если уже выбран этот вариант — отменяем выбор
    if (userAnswer && userAnswer.answerId === optionId) {
      setUserAnswers(prev => prev.filter(answer => answer.questionId !== questionId));
      return;
    }
    // Если выбран другой вариант — меняем ответ
    if (userAnswer) {
      setUserAnswers(prev => prev.map(answer =>
        answer.questionId === questionId
          ? { questionId, answerId: optionId, isCorrect }
          : answer
      ));
      return;
    }
    // Если ещё не было ответа — добавляем
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
      const answersObj = Object.fromEntries(
        userAnswers.map(answer => [answer.questionId, answer.answerId || ''])
      );
      
      await saveTestResult({
        userId: user.id,
        testId: test.id,
        score: results.score,
        answers: answersObj
      });
      setResultSaved(true);
    } catch (err) {
      console.error('Ошибка при сохранении результатов:', err);
    } finally {
      setSavingResult(false);
    }
  };
  
  // Функция для очистки результатов
  const handleClearResults = () => {
    try {
      // Получаем текущие результаты из localStorage
      const savedResultsJson = localStorage.getItem(TEST_RESULTS_STORAGE_KEY);
      if (savedResultsJson) {
        const savedResults = JSON.parse(savedResultsJson);
        
        // Обновляем флаг userClosed и сохраняем обратно
        if (savedResults.testId === params.id) {
          savedResults.userClosed = true;
          localStorage.setItem(TEST_RESULTS_STORAGE_KEY, JSON.stringify(savedResults));
        }
      }
      
      // Возвращаемся к режиму прохождения теста
      setPageState(TestPageState.TEST);
      setCurrentIndex(0);
      // Очищаем ответы пользователя (пустой массив)
      setUserAnswers([]);
      setTestResults(null);
    } catch (error) {
      console.error('Ошибка при очистке результатов:', error);
      toast.error('Произошла ошибка при очистке результатов');
    }
  };
  
  // Завершение теста
  const handleFinishTest = () => {
    console.log('Завершение теста - установка состояния на RESULT');
    
    // Сохраняем результаты в localStorage с флагом userClosed = false
    try {
      const results = calculateResults();
      const testResultsData = {
        testId: params.id,
        results: {
          ...results,
          questions
        },
        answers: userAnswers,
        timestamp: new Date().toISOString(),
        userClosed: false
      };
      
      localStorage.setItem(TEST_RESULTS_STORAGE_KEY, JSON.stringify(testResultsData));
      console.log('Результаты сохранены в localStorage:', testResultsData);
    } catch (error) {
      console.error('Ошибка при сохранении результатов в localStorage:', error);
    }
    
    // Если пользователь авторизован, сохраняем результаты в БД
    if (user) {
      saveResults();
    }
    
    // Важно: устанавливаем состояние страницы в RESULT в конце
    // чтобы все операции были выполнены к этому моменту
    setPageState(TestPageState.RESULT);
  };
  
  // Проверка сохраненных результатов при первой загрузке
  useEffect(() => {
    try {
      const savedResultsJson = localStorage.getItem(TEST_RESULTS_STORAGE_KEY);
      if (savedResultsJson) {
        const savedResults = JSON.parse(savedResultsJson);
        
        // Проверяем, что сохраненные результаты относятся к текущему тесту
        if (savedResults.testId === params.id) {
          // Проверяем, что результаты не старше 1 часа
          const savedTime = new Date(savedResults.timestamp).getTime();
          const currentTime = new Date().getTime();
          const oneHourInMs = 60 * 60 * 1000;
          
          if (currentTime - savedTime < oneHourInMs) {
            console.log('Восстановление сохраненных результатов для теста:', params.id);
            
            // Восстанавливаем ответы пользователя
            if (savedResults.answers && savedResults.answers.length > 0) {
              setUserAnswers(savedResults.answers);
              
              // Проверяем, закрывал ли пользователь результаты
              // Если флаг userClosed отсутствует или равен false, показываем результаты
              if (savedResults.userClosed !== true) {
                // Устанавливаем состояние на отображение результатов
                setPageState(TestPageState.RESULT);
                return; // Важно - прерываем дальнейшее выполнение эффекта
              }
            }
          } else {
            // Результаты устарели, удаляем их
            console.log('Удаление устаревших результатов');
            localStorage.removeItem(TEST_RESULTS_STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке сохраненных результатов:', error);
    }
    
    // Если нет сохраненных результатов, загружаем тест напрямую через useEffect из начала компонента
    // Используем состояние LOADING, это запустит первый useEffect, который загрузит тест
    setPageState(TestPageState.LOADING);
  }, [params.id]);
  
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
  
  // Внутри компонента TestStartPage:
  const handleClearAndRestart = () => {
    localStorage.removeItem('lastTestResults');
    window.location.href = `/tests/${params.id}/start`;
  };
  const handleClearAndCreate = () => {
    localStorage.removeItem('lastTestResults');
    window.location.href = '/tests/create';
  };
  
  // Компонент загрузки
  if (pageState === TestPageState.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-neutral-700 mb-2">Загрузка теста...</h2>
          <p className="text-neutral-500 mb-1">Подождите, идет подготовка вопросов</p>
          <p className="text-xs text-neutral-400">Это может занять несколько секунд</p>
        </div>
      </div>
    );
  }
  
  // Компонент ошибки
  if (pageState === TestPageState.ERROR) {
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
              <FaTimes className="mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-4">Не удалось загрузить тест</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
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
  
  // Компонент отсутствия вопросов
  if (pageState === TestPageState.NO_QUESTIONS) {
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
            <h1 className="text-2xl font-bold">Пустой тест</h1>
          </div>
          <div className="card text-center p-8">
            <p className="text-yellow-500 mb-4 text-4xl">⚠️</p>
            <h2 className="text-xl font-bold mb-4">Тест не содержит вопросов</h2>
            <p className="text-neutral-600 mb-6">К сожалению, этот тест пуст или содержит неверный формат данных.</p>
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
  
  // Компонент с результатами теста
  if (pageState === TestPageState.RESULT) {
    console.log('Отображение компонента с результатами теста');
    
    // Используем локальную функцию расчета, не зависящую от глобального состояния
    const getTestResults = () => {
      try {
        const totalQuestions = questions.length || userAnswers.length;
        const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
        const score = Math.round((correctAnswers / totalQuestions) * 10);
        
        return {
          totalQuestions,
          correctAnswers,
          score,
          percentage: Math.round((correctAnswers / totalQuestions) * 100)
        };
      } catch (e) {
        console.error('Ошибка при расчете результатов:', e);
        return {
          totalQuestions: 0,
          correctAnswers: 0,
          score: 0,
          percentage: 0
        };
      }
    };
    
    const results = getTestResults();
    
    return (
      <div className="min-h-screen py-8 pb-24 bg-white">
        <div className="app-container h-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Результаты теста</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700 flex items-start">
            <div className="text-blue-500 mr-3 mt-1 flex-shrink-0">ℹ️</div>
            <div>
              <p className="font-medium mb-1">Вы завершили тест!</p>
              <p>Ваш результат сохранен и будет доступен при перезагрузке страницы в течение 1 часа.</p>
            </div>
          </div>
          
          <div className="card text-center mb-6 p-6 max-w-md mx-auto flex flex-col items-center">
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
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 w-full max-w-2xl mx-auto">
            <Link href={`/tests/${params.id}/answers`} className="flex-1 w-full">
              <button
                type="button"
                className="w-full min-w-[180px] h-14 flex items-center justify-center gap-2 font-medium bg-primary-600 text-white rounded-xl px-6 py-3 hover:bg-primary-700 transition-all duration-200 shadow text-base"
              >
                <span className="inline-block"><FaFileAlt className="w-5 h-5" /></span>
                <span>Мои ответы</span>
              </button>
            </Link>
            <button
              type="button"
              onClick={handleClearAndCreate}
              className="w-full min-w-[180px] h-14 flex items-center justify-center gap-2 font-medium border border-primary-600 text-primary-600 rounded-xl px-6 py-3 hover:bg-primary-50 transition-all duration-200 shadow text-base"
            >
              <FaChartLine className="w-5 h-5" />
              Создать новый тест
            </button>
            <button
              type="button"
              onClick={handleClearAndRestart}
              className="w-full min-w-[180px] h-14 flex items-center justify-center gap-2 font-medium border border-yellow-400 text-yellow-700 rounded-xl px-6 py-3 hover:bg-yellow-50 transition-all duration-200 shadow text-base"
            >
              <FaRedoAlt className="w-5 h-5" />
              Пройти тест заново
            </button>
            <Link href="/" className="flex-1 w-full">
              <button
                type="button"
                className="w-full min-w-[180px] h-14 flex items-center justify-center gap-2 font-medium border border-neutral-300 text-neutral-700 rounded-xl px-6 py-3 hover:bg-neutral-100 transition-all duration-200 shadow text-base"
              >
                <FaArrowLeft className="w-5 h-5" />
                Выйти в главное меню
              </button>
            </Link>
          </div>
          {/* Модальное окно с разбором */}
          <Dialog open={showAnswers} onClose={() => setShowAnswers(false)} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
              <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto p-6 z-10">
                <Dialog.Title className="text-lg font-bold mb-4">Мои ответы и разбор</Dialog.Title>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {questions.map((q, idx) => {
                    const userAnswer = userAnswers.find(a => a.questionId === q.id);
                    const correctOption = q.options.find(o => o.isCorrect);
                    const userOption = q.options.find(o => o.id === userAnswer?.answerId);
                    return (
                      <div key={q.id} className="border rounded-lg p-4 bg-neutral-50">
                        <div className="mb-2 text-sm text-neutral-500 font-medium">Вопрос {idx + 1}</div>
                        <div className="font-semibold mb-2">{q.question}</div>
                        <div className="mb-2">
                          <span className="font-medium">Ваш ответ: </span>
                          <span className={userOption?.id === correctOption?.id ? 'text-green-600' : 'text-red-600'}>
                            {userOption ? userOption.text : '—'}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Правильный ответ: </span>
                          <span className="text-green-700">{correctOption ? correctOption.text : '—'}</span>
                        </div>
                        {q.explanation && (
                          <div className="bg-blue-50 border border-blue-100 rounded p-3 mt-2 text-sm">
                            <span className="font-medium text-blue-700">Объяснение: </span>{q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowAnswers(false)}
                  className="mt-6 w-full bg-primary-600 text-white rounded-md py-2 font-medium hover:bg-primary-700 transition"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </Dialog>
        </div>
      </div>
    );
  }
  
  // Основная часть теста (когда все готово)
  return (
    <div 
      className="min-h-screen w-full overflow-hidden bg-white"
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
            className="bg-primary-500 h-full rounded-full transition-all duration-300 ease-out"
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
        {questions[currentIndex] && (
          <div
            className="h-full w-full flex flex-col justify-center px-4 overflow-auto"
            ref={containerRef}
          >
            {/* Навигация по вопросам */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {questions.map((q, idx) => {
                const answered = hasAnswered(q.id);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-semibold transition-all
                      ${isCurrent ? 'border-primary-600 bg-primary-50 scale-110 text-primary-700 shadow-md' : ''}
                      ${answered ? 'border-green-500 bg-green-50 text-green-700' : ''}
                      ${!answered && !isCurrent ? 'border-neutral-400 bg-white text-neutral-700' : ''}
                      hover:scale-110 hover:shadow-lg`}
                    style={{ borderWidth: 2 }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="max-w-3xl mx-auto w-full card mb-6">
              <div className="mb-2 text-sm text-neutral-500 font-medium">
                Вопрос {currentIndex + 1} из {questions.length}
              </div>
              <h3 className="text-xl font-medium mb-6">{questions[currentIndex].question}</h3>
              
              <div className="space-y-3 mb-5">
                {Array.isArray(questions[currentIndex].options) && questions[currentIndex].options.length > 0 ? (
                  questions[currentIndex].options.map((option) => {
                      const userAnswerId = getUserAnswer(questions[currentIndex].id);
                      const hasUserAnswered = hasAnswered(questions[currentIndex].id);
                      const isSelected = userAnswerId === option.id;
                      return (
                        <button
                          key={option.id}
                          className={`w-full p-4 rounded-lg text-left transition-all border bg-white
                            ${isSelected ? 'bg-primary-50 border-2 border-primary-600 font-semibold text-primary-700 shadow' : 'border-neutral-200 hover:bg-neutral-50'}
                          `}
                          onClick={() => handleSelectOption(questions[currentIndex].id, option.id, option.isCorrect)}
                        >
                          <div className="flex items-center">
                            <span className={`flex-shrink-0 rounded-full w-6 h-6 flex items-center justify-center border text-sm font-medium mr-3
                              ${isSelected ? 'border-primary-600 bg-primary-100 text-primary-700' : 'border-neutral-300 bg-white text-neutral-700'}`}
                            >
                              {option.id.toUpperCase()}
                            </span>
                            <span>{option.text}</span>
                          </div>
                        </button>
                      );
                    })
                ) : (
                  <p className="text-red-500">Ошибка: Варианты ответа отсутствуют для этого вопроса</p>
                )}
              </div>
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
                  className={`px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 font-medium ${userAnswers.length < questions.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={userAnswers.length < questions.length}
                >
                  Завершить тест
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 