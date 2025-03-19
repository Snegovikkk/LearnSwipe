'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import { TestResult } from '@/lib/supabase';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaQuestion } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';

// Компоненты для графиков
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TestDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const { user } = useAuth();
  const { getTestById, getUserResultsByTestId, loading: testsLoading } = useTests();
  
  const [test, setTest] = useState<any | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Детальная статистика по вопросам
  const [questionStats, setQuestionStats] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadTestData() {
      if (!user || !testId) return;
      
      try {
        setLoading(true);
        // Загружаем данные о тесте
        const testData = await getTestById(testId);
        setTest(testData);
        
        // Загружаем результаты тестирования пользователя
        const userResults = await getUserResultsByTestId(user.id, testId);
        setResults(userResults);
        
        // Анализируем ответы и создаем статистику по вопросам
        if (testData && testData.questions && userResults.length > 0) {
          const stats = testData.questions.map((question: any, index: number) => {
            // Счетчик правильных ответов на этот вопрос
            const correctAnswers = userResults.filter(result => {
              const userAnswer = result.answers[question.id];
              const correctOptionId = question.options.find((opt: any) => opt.isCorrect)?.id;
              return userAnswer === correctOptionId;
            }).length;
            
            return {
              questionNumber: index + 1,
              questionText: question.question,
              totalAttempts: userResults.length,
              correctAnswers,
              successRate: (correctAnswers / userResults.length) * 100
            };
          });
          
          setQuestionStats(stats);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Не удалось загрузить детали теста');
      } finally {
        setLoading(false);
      }
    }
    
    loadTestData();
  }, [user, testId, getTestById, getUserResultsByTestId]);
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };
  
  // Данные для графика успешности по вопросам
  const chartData = {
    labels: questionStats.map(q => `Вопрос ${q.questionNumber}`),
    datasets: [
      {
        label: 'Успешность (%)',
        data: questionStats.map(q => q.successRate),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Успешность ответов по вопросам',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            return `Успешность: ${Math.round(tooltipItem.raw)}%`;
          },
          afterLabel: (tooltipItem: any) => {
            const stats = questionStats[tooltipItem.dataIndex];
            return [
              `Правильно: ${stats.correctAnswers} из ${stats.totalAttempts}`,
              `Вопрос: ${stats.questionText.substring(0, 50)}${stats.questionText.length > 50 ? '...' : ''}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Процент правильных ответов'
        }
      }
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
          <FaArrowLeft className="mr-2" /> Вернуться к аналитике
        </Link>
        
        <h1 className="text-2xl font-bold mb-4">
          {loading ? 'Загрузка...' : test ? test.title : 'Тест не найден'}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : !test ? (
          <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">Тест не найден</h3>
            <p className="mb-4">Данный тест больше не существует или у вас нет к нему доступа</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Вернуться к аналитике
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">Нет результатов</h3>
            <p className="mb-4">Вы еще не проходили этот тест</p>
            <Link 
              href={`/tests/${testId}/start`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-block"
            >
              Пройти тест
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Общая статистика</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-500">Количество попыток:</p>
                    <p className="text-xl font-semibold">{results.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Лучший результат:</p>
                    <p className="text-xl font-semibold">
                      {Math.max(...results.map(r => r.score))}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Последняя попытка:</p>
                    <p className="text-base">
                      {formatDate(results[0].created_at)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">История результатов</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Дата
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Оценка
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {results.map((result) => (
                        <tr key={result.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-sm text-neutral-500">
                              {formatDate(result.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${result.score >= 8 
                                ? 'bg-green-100 text-green-800' 
                                : result.score >= 6 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {result.score}/10
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {questionStats.length > 0 && (
              <>
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                  <h3 className="text-lg font-medium mb-4">Статистика по вопросам</h3>
                  <div className="h-[400px]">
                    <Bar 
                      data={chartData} 
                      options={chartOptions}
                    />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                  <h3 className="text-lg font-medium mb-4">Детальный анализ</h3>
                  <div className="space-y-6">
                    {questionStats.map((q, index) => (
                      <div key={index} className="p-4 rounded-lg bg-neutral-50">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                            q.successRate >= 70 
                              ? 'bg-green-100 text-green-800' 
                              : q.successRate >= 40 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {q.successRate >= 70 
                              ? <FaCheckCircle /> 
                              : q.successRate >= 40 
                              ? <FaQuestion /> 
                              : <FaTimesCircle />}
                          </div>
                          <div>
                            <p className="font-medium">Вопрос {q.questionNumber}</p>
                            <p className="text-sm text-neutral-600 mt-1">{q.questionText}</p>
                            <div className="mt-2 flex items-center">
                              <div className="w-full bg-neutral-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    q.successRate >= 70 
                                      ? 'bg-green-600' 
                                      : q.successRate >= 40 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                  }`} 
                                  style={{ width: `${q.successRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm ml-2 w-16 text-right">
                                {Math.round(q.successRate)}%
                              </span>
                            </div>
                            <p className="text-sm text-neutral-500 mt-1">
                              Правильных ответов: {q.correctAnswers} из {q.totalAttempts}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default TestDetailPage; 