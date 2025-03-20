'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaUpload, FaCheck, FaSpinner } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import useAI from '@/hooks/useAI';
import useTests from '@/hooks/useTests';
import { TestQuestion } from '@/lib/deepseek';

export default function CreateTestPage() {
  const { user } = useAuth();
  const { createTest } = useTests();
  const { analyzeText, generateTest, isLoading: aiLoading, error: aiError } = useAI();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<TestQuestion[]>([]);
  const [step, setStep] = useState<'input' | 'review' | 'success'>('input');
  const [useFile, setUseFile] = useState(false);
  const [quickCreating, setQuickCreating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Проверка, если пользователь не аутентифицирован, перенаправляем на страницу входа
  useEffect(() => {
    if (!user) {
      return;
    }
  }, [user, router]);

  // Обработка изменения файла
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUseFile(true);
      
      // Считываем содержимое файла
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
        
        // Анализируем текст если он достаточно длинный
        if (text.length > 100) {
          handleAnalyzeText(text);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  // Анализ текста для получения предложенных тем
  const handleAnalyzeText = async (text: string = content) => {
    if (text.length < 100) {
      setError('Текст слишком короткий для анализа. Минимум 100 символов.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSelectedTopic(null); // Сбрасываем выбранную тему при новом анализе
    
    try {
      // Получаем результат в виде объекта с массивом тем
      const analysisResult = await analyzeText(text);
      // Извлекаем topics из результата, или используем пустой массив в случае null
      const topicsArray: string[] = analysisResult?.topics || [];
      // Устанавливаем темы в состояние
      setSuggestedTopics(topicsArray);
    } catch (err: any) {
      console.error('Ошибка анализа текста:', err);
      setError(err.message || 'Не удалось проанализировать текст');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик выбора темы
  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic === selectedTopic ? null : topic);
    
    // Если тема выбрана, можно использовать её в названии теста, если оно пустое
    if (topic !== selectedTopic && !title) {
      setTitle(`Тест по теме: ${topic}`);
    }
  };

  // Генерация теста на основе текста
  const handleGenerateTest = async () => {
    if (!title) {
      setError('Пожалуйста, введите название теста');
      return;
    }
    
    if (content.length < 100) {
      setError('Текст слишком короткий для генерации теста. Минимум 100 символов.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Получаем результат теста с вопросами
      // Если есть выбранная тема, передаем её для более точной генерации
      const testResult = await generateTest(content, title, selectedTopic);
      
      // Проверка наличия данных
      if (!testResult) {
        throw new Error('Не удалось получить результат генерации теста');
      }
      
      // Извлекаем вопросы из результата или используем пустой массив
      const questionsArray = testResult.questions || [];
      
      // Валидация вопросов
      if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
        throw new Error('Сгенерирован пустой список вопросов, попробуйте еще раз');
      }
      
      console.log('Сгенерировано вопросов:', questionsArray.length);
      
      // Убедимся, что каждый вопрос имеет ID и нужные поля
      const validatedQuestions = questionsArray.map((q, index) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        options: Array.isArray(q.options) 
          ? q.options.map((opt, optIndex) => ({
              id: opt.id || String.fromCharCode(97 + optIndex), // a, b, c, d
              text: opt.text,
              isCorrect: !!opt.isCorrect
            }))
          : [],
        explanation: q.explanation || ''
      }));
      
      // Устанавливаем вопросы в состояние
      setGeneratedQuestions(validatedQuestions);
      setStep('review');
    } catch (err: any) {
      console.error('Ошибка генерации теста:', err);
      setError(err.message || 'Не удалось сгенерировать тест');
    } finally {
      setLoading(false);
    }
  };

  // Сохранение созданного теста
  const handleSaveTest = async () => {
    if (!user || !user.id) {
      setError('Необходимо войти в систему для сохранения теста');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Создаем тест в базе данных
      const result = await createTest({
        userId: user.id,
        title,
        questions: generatedQuestions,
        description: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      });
      
      if (result) {
        setStep('success');
        // Перенаправляем на страницу с тестами через 2 секунды
        setTimeout(() => {
          router.push('/profile/tests');
        }, 2000);
      } else {
        throw new Error('Ошибка при сохранении теста');
      }
    } catch (err: any) {
      console.error('Ошибка сохранения теста:', err);
      setError(err.message || 'Не удалось сохранить тест');
    } finally {
      setLoading(false);
    }
  };

  // Быстрое создание теста и переход к его прохождению
  const handleQuickCreateAndStart = async () => {
    if (!selectedTopic) {
      setError('Необходимо выбрать тему для быстрого создания теста');
      return;
    }
    
    if (content.length < 100) {
      setError('Текст слишком короткий для генерации теста. Минимум 100 символов.');
      return;
    }
    
    if (!user || !user.id) {
      setError('Необходимо войти в систему для создания теста');
      return;
    }
    
    setQuickCreating(true);
    setError('');
    
    try {
      // Генерируем название теста на основе выбранной темы
      const testTitle = `Тест по теме: ${selectedTopic}`;
      
      // Получаем результат теста с вопросами
      const testResult = await generateTest(content, testTitle, selectedTopic);
      
      if (!testResult) {
        throw new Error('Не удалось получить результат генерации теста');
      }
      
      // Извлекаем вопросы из результата или используем пустой массив
      const questionsArray = testResult.questions || [];
      
      if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
        throw new Error('Сгенерирован пустой список вопросов, попробуйте еще раз');
      }
      
      console.log('Быстро сгенерировано вопросов:', questionsArray.length);
      
      // Валидация вопросов
      const validatedQuestions = questionsArray.map((q, index) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        options: Array.isArray(q.options) 
          ? q.options.map((opt, optIndex) => ({
              id: opt.id || String.fromCharCode(97 + optIndex), // a, b, c, d
              text: opt.text,
              isCorrect: !!opt.isCorrect
            }))
          : [],
        explanation: q.explanation || ''
      }));
      
      // Создаем тест в базе данных
      const savedTest = await createTest({
        userId: user.id,
        title: testTitle,
        questions: validatedQuestions,
        description: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      });
      
      if (!savedTest) {
        throw new Error('Не удалось сохранить тест');
      }
      
      // Перенаправляем на страницу прохождения теста
      router.push(`/tests/${savedTest.id}/start`);
    } catch (err: any) {
      console.error('Ошибка быстрого создания теста:', err);
      setError(err.message || 'Не удалось создать и запустить тест');
      setQuickCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Создание теста</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {aiError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
            Ошибка ИИ: {aiError}. Будут использованы локальные шаблоны.
          </div>
        )}
        
        {step === 'input' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                Название теста*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Введите название теста"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Текст для генерации вопросов*
              </label>
              
              <div className="flex mb-2">
                <button
                  type="button"
                  onClick={() => setUseFile(false)}
                  className={`px-4 py-2 mr-2 rounded-md ${
                    !useFile 
                      ? 'bg-primary-100 text-primary-800 border border-primary-300'
                      : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                  }`}
                >
                  Ввести текст
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseFile(true);
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className={`px-4 py-2 rounded-md ${
                    useFile 
                      ? 'bg-primary-100 text-primary-800 border border-primary-300'
                      : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                  }`}
                >
                  Загрузить файл
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,.doc,.docx,.pdf,.md"
                  className="hidden"
                />
              </div>
              
              {useFile ? (
                <div className="border border-neutral-300 rounded-md p-4 bg-neutral-50">
                  {file ? (
                    <div className="flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
                    </div>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center py-6 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaUpload className="text-neutral-400 text-3xl mb-2" />
                      <p className="text-neutral-500">Нажмите, чтобы выбрать файл</p>
                      <p className="text-neutral-400 text-sm">Поддерживаемые форматы: .txt, .doc, .docx, .pdf, .md</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (e.target.value.length > 100) {
                      setSuggestedTopics([]);
                    }
                  }}
                  rows={10}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Введите или вставьте текст, на основе которого будут сгенерированы вопросы"
                ></textarea>
              )}
              
              <div className="flex justify-between mt-2">
                <span className="text-sm text-neutral-500">
                  {content.length} символов {content.length < 100 && '(минимум 100)'}
                </span>
                <button
                  type="button"
                  onClick={() => handleAnalyzeText()}
                  disabled={loading || content.length < 100}
                  className={`text-sm text-primary-600 hover:text-primary-500 ${
                    loading || content.length < 100 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Проанализировать текст
                </button>
              </div>
            </div>
            
            {suggestedTopics.length > 0 && (
              <div className="mb-6">
                <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-md text-blue-700 text-sm">
                  <p className="mb-2 font-medium">Новая функция: быстрое создание теста!</p>
                  <p>1. Выберите интересующую вас тему из списка ниже, кликнув на неё</p>
                  <p>2. Нажмите кнопку "Быстро создать и пройти тест", чтобы сразу перейти к тестированию</p>
                </div>
                
                <h3 className="text-sm font-medium text-neutral-700 mb-2">
                  Рекомендуемые темы для теста:
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedTopics.map((topic, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTopicSelect(topic)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTopic === topic 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                      } cursor-pointer`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                
                {selectedTopic && (
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          Выбрана тема: <span className="text-primary-600">{selectedTopic}</span>
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Тест будет создан на основе введенного текста с фокусом на выбранную тему
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickCreateAndStart}
                        disabled={loading || quickCreating || content.length < 100}
                        className={`inline-flex items-center px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors ${
                          loading || quickCreating || content.length < 100 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {quickCreating ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Создание теста...
                          </>
                        ) : (
                          <>
                            Быстро создать и пройти тест
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateTest}
                disabled={loading || content.length < 100 || !title}
                className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  loading || content.length < 100 || !title ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Генерация...
                  </span>
                ) : (
                  'Создать тест'
                )}
              </button>
            </div>
          </div>
        )}
        
        {step === 'review' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Предпросмотр теста "{title}"
            </h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Вопросы ({generatedQuestions.length})</h3>
              
              <div className="space-y-4">
                {generatedQuestions.map((question, qIndex) => (
                  <div key={question.id || qIndex} className="border border-neutral-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      {qIndex + 1}. {question.question}
                    </h4>
                    
                    <div className="space-y-2 ml-6">
                      {question.options.map((option, oIndex) => (
                        <div 
                          key={oIndex}
                          className={`flex items-start ${
                            option.isCorrect 
                              ? 'text-green-700'
                              : ''
                          }`}
                        >
                          <span className="mr-2 font-medium">{String.fromCharCode(65 + oIndex)}.</span>
                          <span>{option.text}</span>
                          {option.isCorrect && (
                            <FaCheck className="ml-2 text-green-500 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-2 text-sm text-neutral-600 border-t border-neutral-100 pt-2">
                        <span className="font-medium">Объяснение: </span>
                        {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
              >
                Назад
              </button>
              
              <button
                type="button"
                onClick={handleSaveTest}
                disabled={loading}
                className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Сохранение...
                  </span>
                ) : (
                  'Сохранить тест'
                )}
              </button>
            </div>
          </div>
        )}
        
        {step === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">
              Тест успешно создан!
            </h2>
            <p className="text-green-700 mb-4">
              Ваш тест "{title}" был успешно сохранен. Вы будете перенаправлены на страницу с вашими тестами.
            </p>
            <FaSpinner className="animate-spin text-green-500 mx-auto text-2xl" />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 