'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import { motion } from 'framer-motion';

// Компонент скелетона для карточек тестов
const TestCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200">
    <div className="p-6">
      <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-neutral-200 rounded w-full mb-1 animate-pulse"></div>
      <div className="h-4 bg-neutral-200 rounded w-2/3 mb-1 animate-pulse"></div>
      <div className="h-4 bg-neutral-200 rounded w-5/6 mb-4 animate-pulse"></div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="h-3 bg-neutral-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-3 bg-neutral-200 rounded w-1/5 animate-pulse"></div>
      </div>
      
      <div className="pt-4 border-t border-neutral-100">
        <div className="flex">
          <div className="h-8 bg-neutral-200 rounded flex-1 mr-2 animate-pulse"></div>
          <div className="h-8 bg-neutral-200 rounded flex-1 ml-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function UserTestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { getUserTests, getUserResults, deleteTest, loading } = useTests();
  
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const initialTab = searchParams.get('tab') === 'taken' ? 'taken' : 'created';
  const [activeTab, setActiveTab] = useState<'created' | 'taken'>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Загрузка тестов и результатов пользователя
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        // Загружаем созданные тесты
        const userTests = await getUserTests(user.id);
        setTests(userTests || []);
        
        // Загружаем результаты пройденных тестов
        const userResults = await getUserResults(user.id);
        setResults(userResults || []);
        
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message || 'Не удалось загрузить данные');
      } finally {
        setInitialLoadComplete(true);
      }
    }
    
    loadData();
  }, [user, getUserTests, getUserResults]);

  // Обновление URL при изменении активной вкладки
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', activeTab);
    router.replace(`/profile/tests?${newParams.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Удаление теста
  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тест?')) return;
    
    setDeletingId(testId);
    try {
      await deleteTest(testId);
      setTests(prevTests => prevTests.filter(test => test.id !== testId));
    } catch (err: any) {
      console.error('Ошибка при удалении теста:', err);
      setError(err.message || 'Не удалось удалить тест');
    } finally {
      setDeletingId(null);
    }
  };

  // Получение пройденных тестов
  const getTakenTests = () => {
    const takenTestIds = results.map(result => result.test_id);
    return tests.filter(test => takenTestIds.includes(test.id));
  };

  // Получение результата конкретного теста
  const getTestResult = (testId: string) => {
    return results.find(result => result.test_id === testId);
  };

  // Генерация скелетонов для загрузки
  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, index) => (
      <TestCardSkeleton key={`skeleton-${index}`} />
    ));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Мои тесты</h1>
          <Link 
            href="/create"
            className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Создать новый тест
          </Link>
        </div>
        
        {/* Табы для переключения между созданными и пройденными тестами */}
        <div className="border-b border-neutral-200 mb-6">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'created'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Созданные ({initialLoadComplete ? tests.filter(test => test.user_id === user?.id).length : '...'})
            </button>
            <button
              onClick={() => setActiveTab('taken')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'taken'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Пройденные ({initialLoadComplete ? results.length : '...'})
            </button>
          </nav>
        </div>
        
        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Индикатор загрузки */}
        {loading && !initialLoadComplete ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSkeletons(6)}
          </div>
        ) : (
          // Список тестов
          activeTab === 'created' ? (
            tests.filter(test => test.user_id === user?.id).length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
                <p className="text-neutral-600 mb-4">У вас пока нет созданных тестов.</p>
                <Link 
                  href="/create"
                  className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700"
                >
                  Создать первый тест
                </Link>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {tests
                  .filter(test => test.user_id === user?.id)
                  .map(test => (
                    <motion.div 
                      key={test.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6">
                        <h2 className="text-lg font-semibold mb-2 line-clamp-2">{test.title}</h2>
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-3">{test.description || 'Нет описания'}</p>
                        
                        <div className="flex justify-between items-center text-sm text-neutral-500">
                          <span>{new Date(test.created_at).toLocaleDateString()}</span>
                          <span>{test.questions?.length || (test.content?.questions?.length) || 0} вопр.</span>
                        </div>
                        
                        <div className="flex mt-4 pt-4 border-t border-neutral-100">
                          <button
                            onClick={() => router.push(`/tests/${test.id}`)}
                            className="flex-1 mr-2 text-center py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                          >
                            Просмотр
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            disabled={deletingId === test.id}
                            className={`flex-1 ml-2 text-center py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 ${
                              deletingId === test.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {deletingId === test.id ? 'Удаление...' : 'Удалить'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            )
          ) : (
            results.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
                <p className="text-neutral-600 mb-4">Вы пока не прошли ни одного теста.</p>
                <Link 
                  href="/tests"
                  className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700"
                >
                  Перейти к списку тестов
                </Link>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {results.map(result => {
                  const test = tests.find(t => t.id === result.test_id);
                  return test ? (
                    <motion.div 
                      key={result.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6">
                        <h2 className="text-lg font-semibold mb-2 line-clamp-2">{test.title}</h2>
                        
                        <div className="mb-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Результат: {result.score}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-neutral-500">
                          <span>Пройден: {new Date(result.created_at).toLocaleDateString()}</span>
                          <span>{Object.keys(result.answers || {}).length} ответов</span>
                        </div>
                        
                        <div className="flex mt-4 pt-4 border-t border-neutral-100">
                          <button
                            onClick={() => router.push(`/tests/${test.id}`)}
                            className="flex-1 mr-2 text-center py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                          >
                            Подробнее
                          </button>
                          <button
                            onClick={() => router.push(`/tests/${test.id}/start`)}
                            className="flex-1 ml-2 text-center py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                          >
                            Пройти снова
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null;
                })}
              </motion.div>
            )
          )
        )}
      </div>
    </ProtectedRoute>
  );
} 