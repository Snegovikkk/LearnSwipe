'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner, FaChartBar, FaTrophy, FaExternalLinkAlt, FaSearch } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Test, TestResult } from '@/lib/supabase';

// Тип для группировки результатов по тестам
interface TestWithResults {
  test: Test;
  results: TestResult[];
  bestScore: number;
  lastScore: number;
  averageScore: number;
  attemptCount: number;
}

export default function ResultsPage() {
  const { user } = useAuth();
  const { getUserTests, getUserResults, loading: testsLoading } = useTests();
  
  const [testResults, setTestResults] = useState<TestWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchUserResults = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Получаем все тесты, которые создал пользователь или проходил
        const userTests = await getUserTests(user.id);
        
        // Получаем все результаты тестов пользователя
        const results = await getUserResults(user.id);
        
        // Группируем результаты по тестам
        const testMap = new Map<string, TestWithResults>();
        
        for (const result of results) {
          const testId = result.test_id;
          const test = userTests.find(t => t.id === testId);
          
          if (test) {
            if (!testMap.has(testId)) {
              testMap.set(testId, {
                test,
                results: [],
                bestScore: 0,
                lastScore: 0,
                averageScore: 0,
                attemptCount: 0
              });
            }
            
            const testData = testMap.get(testId)!;
            testData.results.push(result);
          }
        }
        
        // Вычисляем статистику для каждого теста
        const testsWithResults: TestWithResults[] = [];
        
        // Преобразуем значения Map в массив и итерируем по нему
        Array.from(testMap.values()).forEach(testData => {
          // Сортируем результаты по дате (от новых к старым)
          testData.results.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          // Вычисляем статистику
          testData.bestScore = Math.max(...testData.results.map(r => r.score));
          testData.lastScore = testData.results[0]?.score || 0;
          testData.averageScore = Math.round(
            testData.results.reduce((sum, r) => sum + r.score, 0) / testData.results.length
          );
          testData.attemptCount = testData.results.length;
          
          testsWithResults.push(testData);
        });
        
        // Сортируем тесты по дате последней попытки
        testsWithResults.sort((a, b) => 
          new Date(b.results[0]?.created_at).getTime() - 
          new Date(a.results[0]?.created_at).getTime()
        );
        
        setTestResults(testsWithResults);
      } catch (error) {
        console.error('Ошибка при получении результатов:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserResults();
  }, [user, getUserTests, getUserResults]);
  
  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Функция для получения CSS класса в зависимости от балла
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Фильтрация результатов по поисковому запросу
  const filteredResults = searchQuery.trim() === '' 
    ? testResults 
    : testResults.filter(item => 
        item.test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.test.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Мои результаты</h1>
          
          {loading || testsLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-primary-500 text-2xl mr-2" />
              <span className="text-neutral-600">Загрузка результатов...</span>
            </div>
          ) : testResults.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="mx-auto w-16 h-16 mb-4">
                <FaChartBar className="w-full h-full text-neutral-300" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">У вас пока нет пройденных тестов</h3>
              <p className="text-neutral-600 mb-6">
                Пройдите тесты, чтобы увидеть здесь свои результаты
              </p>
              <Link
                href="/tests"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Перейти к тестам
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 flex">
                <div className="relative rounded-md shadow-sm flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-12 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Поиск по названию теста..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-white shadow-sm overflow-hidden rounded-lg">
                <div className="bg-neutral-50 px-4 py-5 border-b border-neutral-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">
                    Сводка результатов
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Всего пройдено тестов: {testResults.length}, общее количество попыток: {testResults.reduce((sum, item) => sum + item.attemptCount, 0)}
                  </p>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {filteredResults.map((item) => (
                    <li key={item.test.id} className="px-4 py-5 sm:px-6 hover:bg-neutral-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between mb-2">
                        <div className="flex items-start mb-2 sm:mb-0">
                          <div className="flex-shrink-0 h-12 w-12 bg-neutral-100 rounded-md flex items-center justify-center mr-4">
                            {item.test.image_url ? (
                              <Image 
                                src={item.test.image_url} 
                                alt={item.test.title} 
                                width={48} 
                                height={48}
                                className="rounded-md object-cover" 
                              />
                            ) : (
                              <FaChartBar className="h-6 w-6 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-neutral-900">
                              {item.test.title}
                            </h4>
                            <p className="text-sm text-neutral-500">
                              {item.test.description?.substring(0, 100)}
                              {item.test.description && item.test.description.length > 100 ? "..." : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col md:flex-row gap-2 sm:gap-1 md:gap-2 text-sm text-neutral-700">
                          <Link
                            href={`/tests/${item.test.id}/results`}
                            className="inline-flex items-center px-3 py-1.5 border border-neutral-300 bg-white rounded-md hover:bg-neutral-50"
                          >
                            <FaChartBar className="mr-1.5" /> Детальная статистика
                          </Link>
                          <Link
                            href={`/tests/${item.test.id}/start`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200"
                          >
                            <FaExternalLinkAlt className="mr-1.5" /> Пройти снова
                          </Link>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mt-4">
                        <div className="bg-neutral-50 rounded-md px-4 py-2 border border-neutral-200">
                          <dt className="text-xs font-medium text-neutral-500 truncate">
                            Попытки
                          </dt>
                          <dd className="mt-1 text-lg font-semibold text-neutral-900">
                            {item.attemptCount}
                          </dd>
                        </div>
                        <div className="bg-neutral-50 rounded-md px-4 py-2 border border-neutral-200">
                          <dt className="text-xs font-medium text-neutral-500 truncate">
                            Лучший результат
                          </dt>
                          <dd className="mt-1 text-lg font-semibold text-green-600 flex items-center">
                            {item.bestScore}% <FaTrophy className="text-yellow-500 ml-1.5 text-sm" />
                          </dd>
                        </div>
                        <div className="bg-neutral-50 rounded-md px-4 py-2 border border-neutral-200">
                          <dt className="text-xs font-medium text-neutral-500 truncate">
                            Последний результат
                          </dt>
                          <dd className={`mt-1 text-lg font-semibold ${getScoreClass(item.lastScore)}`}>
                            {item.lastScore}%
                          </dd>
                        </div>
                        <div className="bg-neutral-50 rounded-md px-4 py-2 border border-neutral-200">
                          <dt className="text-xs font-medium text-neutral-500 truncate">
                            Пройден последний раз
                          </dt>
                          <dd className="mt-1 text-sm font-medium text-neutral-900">
                            {formatDate(item.results[0].created_at)}
                          </dd>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.results.slice(0, 3).map((result) => (
                          <Link
                            key={result.id}
                            href={`/tests/${item.test.id}/attempt/${result.id}`}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs border ${
                              result.score >= 80 
                                ? 'bg-green-50 text-green-800 border-green-200' 
                                : result.score >= 60
                                  ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                  : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            {formatDate(result.created_at)}: {result.score}%
                          </Link>
                        ))}
                        {item.results.length > 3 && (
                          <Link
                            href={`/tests/${item.test.id}/results`}
                            className="inline-flex items-center px-2 py-1 bg-neutral-100 border border-neutral-200 rounded text-xs text-neutral-700 hover:bg-neutral-200"
                          >
                            Ещё {item.results.length - 3} попыток...
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 