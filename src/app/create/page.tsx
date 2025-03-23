'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useAI from '@/hooks/useAI';
import { FaSpinner, FaRobot, FaLightbulb, FaTimes, FaCheck, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import TextareaAutosize from 'react-textarea-autosize';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { generateTest, loading: aiLoading } = useAI();
  
  // Состояния для основной информации о тесте
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [complexity, setComplexity] = useState<'easy' | 'hard'>('easy');
  
  // Состояния для отображения процесса и результата
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [createdTestId, setCreatedTestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Проверка валидности формы
  const [formValid, setFormValid] = useState(false);
  
  // Рефы для анимации и прокрутки
  const progressBarRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Проверка валидности формы
  useEffect(() => {
    setFormValid(!!title.trim() && text.trim().length > 100);
  }, [title, text]);

  // Запуск генерации теста
  const handleGenerateTest = async () => {
    if (!user) {
      setError('Вы должны войти в систему, чтобы создать тест');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setError(null);
      
      // Имитация прогресса для UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 5;
        });
      }, 1000);
      
      const testData = {
        userId: user.id,
        title,
        topic: title, // Используем заголовок как тему
        complexity,
        questionsCount,
        text
      };
      
      const result = await generateTest(testData);
      
      clearInterval(progressInterval);
      
      if (result && result.success && result.testId) {
        setCreatedTestId(result.testId);
        setGenerationProgress(100);
        setGenerationComplete(true);
      } else {
        throw new Error(result?.error || 'Не удалось создать тест');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при создании теста');
      setGenerationProgress(0);
      setIsGenerating(false);
    }
  };

  // Перейти к созданному тесту
  const handleViewTest = () => {
    if (createdTestId) {
      router.push(`/tests/${createdTestId}/start`);
    }
  };

  // Прокрутка к началу страницы
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8" ref={topRef}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Назад"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-bold text-neutral-800">Создание теста</h1>
          </div>

          {!isGenerating && !generationComplete ? (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Информационный блок */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                    <FaLightbulb className="mr-2" />
                    Как это работает
                  </h3>
                  <p className="text-sm text-blue-700">
                    Добавьте текст и название, а наш ИИ автоматически создаст тест с вопросами на основе его содержания.
                    Чем информативнее текст, тем качественнее будут вопросы.
                  </p>
                </div>

                {/* Название теста */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                    Название теста *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ease-in-out duration-150"
                    placeholder="Например: Тест по истории России"
                  />
                </div>

                {/* Текст */}
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-neutral-700 mb-1">
                    Текст для анализа *
                  </label>
                  <TextareaAutosize
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    minRows={8}
                    className="block w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ease-in-out duration-150"
                    placeholder="Вставьте текст, на основе которого будет создан тест (минимум 100 символов)"
                  />
                  <div className="mt-2 flex justify-between text-xs">
                    <span className={`${text.length < 100 ? 'text-red-500' : 'text-neutral-500'}`}>
                      {text.length} символов (минимум 100)
                    </span>
                    {text.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setText('')}
                        className="text-neutral-500 hover:text-neutral-700"
                      >
                        Очистить
                      </button>
                    )}
                  </div>
                </div>

                {/* Дополнительные настройки */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Количество вопросов */}
                  <div>
                    <span className="block text-sm font-medium text-neutral-700 mb-2">
                      Количество вопросов
                    </span>
                    <div className="flex items-center">
                      <span className="mr-4 text-neutral-600 text-sm">5</span>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="1"
                        value={questionsCount}
                        onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-200 rounded-full accent-primary-600"
                      />
                      <span className="ml-4 text-neutral-600 text-sm">15</span>
                    </div>
                    <p className="mt-1 text-center text-sm font-medium text-primary-600">{questionsCount} вопросов</p>
                  </div>

                  {/* Сложность */}
                  <div>
                    <span className="block text-sm font-medium text-neutral-700 mb-2">
                      Сложность
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setComplexity('easy')}
                        className={`px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 transition border ${
                          complexity === 'easy'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-sm font-medium">Простой</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setComplexity('hard')}
                        className={`px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 transition border ${
                          complexity === 'hard'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-sm font-medium">Сложный</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition flex items-center"
                >
                  <FaTimes className="mr-2" size={14} />
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleGenerateTest}
                  disabled={!formValid || aiLoading}
                  className={`px-6 py-2 rounded-lg text-white flex items-center transition font-medium ${
                    !formValid || aiLoading
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {aiLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaRobot className="mr-2" />
                  )}
                  Создать тест
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6">
                <div className="text-center">
                  {!generationComplete ? (
                    <>
                      <div className="mb-5">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                          <FaRobot className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-800 mb-2">
                          Генерация теста...
                        </h2>
                        <p className="text-neutral-600 mb-6">
                          ИИ анализирует текст и создаёт вопросы. Это может занять до минуты.
                        </p>
                      </div>
                      
                      <div className="w-full bg-neutral-200 rounded-full h-2 mb-2 overflow-hidden" ref={progressBarRef}>
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(generationProgress)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-neutral-600 mb-8">
                        {Math.round(generationProgress)}% выполнено
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-5">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                          <FaCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-800 mb-2">
                          Тест успешно создан!
                        </h2>
                        <p className="text-neutral-600 mb-4">
                          ИИ завершил создание вопросов для вашего теста.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6 max-w-md mx-auto">
                        <h3 className="font-medium text-green-800 mb-3">
                          Информация о тесте:
                        </h3>
                        <dl className="text-sm space-y-3">
                          <div className="flex justify-between">
                            <dt className="text-neutral-600">Название:</dt>
                            <dd className="font-medium text-neutral-800">{title}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-600">Количество вопросов:</dt>
                            <dd className="font-medium text-neutral-800">{questionsCount}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-neutral-600">Сложность:</dt>
                            <dd className="font-medium">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                complexity === 'easy' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {complexity === 'easy' 
                                  ? 'Простой'
                                  : 'Сложный'
                                }
                              </span>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
                {!generationComplete ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsGenerating(false);
                      setGenerationProgress(0);
                    }}
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
                  >
                    Отменить
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGenerating(false);
                        setGenerationComplete(false);
                        setGenerationProgress(0);
                        setTitle('');
                        setText('');
                        setComplexity('easy');
                        setQuestionsCount(10);
                        scrollToTop();
                      }}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
                    >
                      Создать ещё
                    </button>
                    <button
                      type="button"
                      onClick={handleViewTest}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center"
                    >
                      Перейти к прохождению
                      <FaChevronRight className="ml-2" size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="flex items-center">
                <FaTimes className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 