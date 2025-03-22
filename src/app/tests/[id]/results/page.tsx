'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSpinner, FaTrophy, FaExternalLinkAlt, FaChartLine } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Test, TestResult } from '@/lib/supabase';

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = typeof params.id === 'string' ? params.id : '';
  
  const { user } = useAuth();
  const { getTestById, getUserResultsByTestId, loading: testsLoading } = useTests();
  
  const [test, setTest] = useState<Test | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Загружаем данные теста и результаты при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !testId) return;
      
      setLoading(true);
      try {
        // Получаем информацию о тесте
        const testData = await getTestById(testId);
        setTest(testData);
        
        // Получаем результаты пользователя по данному тесту
        const testResults = await getUserResultsByTestId(user.id, testId);
        setResults(testResults);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, testId, getTestById, getUserResultsByTestId]);
  
  if (!user) {
    return null; // Будет обработано ProtectedRoute
  }
  
  // Форматирование даты
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
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading || testsLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-primary-500 text-2xl mr-2" />
              <span className="text-neutral-600">Загрузка результатов...</span>
            </div>
          ) : !test ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-xl text-neutral-600 mb-4">Тест не найден</p>
              <Link
                href="/profile/results"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Вернуться к результатам
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <Link 
                  href="/profile/results" 
                  className="text-primary-600 hover:text-primary-700 inline-flex items-center mr-3"
                >
                  <FaArrowLeft className="mr-1" /> Назад
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Результаты: {test.title}
                </h1>
              </div>
              
              {results.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-xl text-neutral-600 mb-4">У вас еще нет результатов по этому тесту</p>
                  <Link
                    href={`/tests/${testId}/start`}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <FaExternalLinkAlt className="mr-2" /> Пройти тест
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-5 border-b border-neutral-200 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-neutral-900">
                        Сводная статистика
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500">
                        Ваши результаты по тесту "{test.title}"
                      </p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                        <div className="bg-neutral-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-neutral-500 truncate">
                              Всего попыток
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-neutral-900">
                              {results.length}
                            </dd>
                          </div>
                        </div>
                        <div className="bg-neutral-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-neutral-500 truncate">
                              Средний балл
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-neutral-900">
                              {Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)}%
                            </dd>
                          </div>
                        </div>
                        <div className="bg-neutral-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-neutral-500 truncate">
                              Лучший результат
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-green-600">
                              {Math.max(...results.map(r => r.score))}%
                            </dd>
                          </div>
                        </div>
                        <div className="bg-neutral-50 overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-neutral-500 truncate">
                              Последний результат
                            </dt>
                            <dd className={`mt-1 text-3xl font-semibold ${getScoreClass(results[0].score)}`}>
                              {results[0].score}%
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-5 border-b border-neutral-200 sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-neutral-900">
                          История попыток
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          Все ваши попытки прохождения теста
                        </p>
                      </div>
                      <Link 
                        href={`/tests/${testId}/start`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                      >
                        <FaExternalLinkAlt className="mr-2" /> Пройти снова
                      </Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              №
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Дата
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Результат
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Оценка
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {[...results]
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((result, index) => (
                              <tr key={result.id} className={index === 0 ? 'bg-neutral-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                  {index + 1}
                                  {index === 0 && (
                                    <span className="ml-2 text-primary-500">
                                      <FaChartLine title="Последняя попытка" />
                                    </span>
                                  )}
                                  {result.score === Math.max(...results.map(r => r.score)) && (
                                    <span className="ml-2 text-yellow-500">
                                      <FaTrophy title="Лучший результат" />
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                  {formatDate(result.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                  {result.score}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    result.score >= 80 
                                      ? 'bg-green-100 text-green-800' 
                                      : result.score >= 60
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}>
                                    {result.score >= 80 
                                      ? 'Отлично' 
                                      : result.score >= 60
                                        ? 'Хорошо'
                                        : 'Нужно повторить'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link 
                                    href={`/tests/${testId}/attempt/${result.id}`} 
                                    className="text-primary-600 hover:text-primary-900"
                                  >
                                    Подробнее
                                  </Link>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 