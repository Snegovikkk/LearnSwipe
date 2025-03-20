'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import { TestResult } from '@/lib/supabase';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaChartLine, FaTrophy } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

// Компонент для отображения линейного графика
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { getUserResults, getTestById, loading: testsLoading } = useTests();
  
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testDetails, setTestDetails] = useState<Record<string, any>>({});
  
  // Агрегированные данные для статистики
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    recentTests: [] as TestResult[],
    scoreOverTime: [] as any[],
    scoreCategories: {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    },
    skillMap: {} as Record<string, {score: number, count: number, tests: string[]}>
  });

  // Загрузка результатов тестов пользователя
  useEffect(() => {
    async function loadUserResults() {
      if (!user) return;
      
      try {
        setLoading(true);
        const userResults = await getUserResults(user.id);
        setResults(userResults);
        
        // Загрузка деталей о каждом тесте
        const testDetailsMap: Record<string, any> = {};
        for (const result of userResults) {
          if (!testDetailsMap[result.test_id]) {
            const test = await getTestById(result.test_id);
            if (test) {
              testDetailsMap[result.test_id] = test;
            }
          }
        }
        setTestDetails(testDetailsMap);
        
        // Расчет статистики
        if (userResults.length > 0) {
          const scores = userResults.map(r => r.score);
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          
          // Готовим данные для графика оценок по времени
          const sortedResults = [...userResults].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          // Распределение оценок по категориям
          const scoreCategories = {
            excellent: scores.filter(score => score >= 8).length,
            good: scores.filter(score => score >= 6 && score < 8).length,
            fair: scores.filter(score => score >= 4 && score < 6).length,
            poor: scores.filter(score => score < 4).length
          };
          
          // Создаем карту навыков на основе тем тестов
          const skillMap: Record<string, {score: number, count: number, tests: string[]}> = {};
          
          userResults.forEach(result => {
            const test = testDetailsMap[result.test_id];
            if (test) {
              // Используем заголовок теста в качестве темы/навыка
              let topic = test.title;
              
              // Иногда заголовок может быть слишком длинным, берем первые слова
              if (topic.length > 25) {
                const words = topic.split(' ');
                topic = words.slice(0, 3).join(' ') + '...';
              }
              
              if (!skillMap[topic]) {
                skillMap[topic] = { score: 0, count: 0, tests: [] };
              }
              
              skillMap[topic].score += result.score;
              skillMap[topic].count += 1;
              if (!skillMap[topic].tests.includes(test.id)) {
                skillMap[topic].tests.push(test.id);
              }
            }
          });
          
          // Вычисляем средний балл для каждого навыка
          Object.keys(skillMap).forEach(topic => {
            skillMap[topic].score = Math.round((skillMap[topic].score / skillMap[topic].count) * 10) / 10;
          });
          
          setStats({
            totalTests: userResults.length,
            averageScore: Math.round(avgScore * 10) / 10,
            bestScore: Math.max(...scores),
            worstScore: Math.min(...scores),
            recentTests: userResults.slice(0, 5),
            scoreOverTime: sortedResults.map(r => ({
              date: new Date(r.created_at),
              score: r.score
            })),
            scoreCategories: scoreCategories,
            skillMap: skillMap
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке результатов:', error);
        setError('Не удалось загрузить результаты тестов');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserResults();
  }, [user, getUserResults, getTestById]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Данные для графика
  const chartData = {
    labels: stats.scoreOverTime.map(item => 
      new Intl.DateTimeFormat('ru-RU', { 
        day: 'numeric', 
        month: 'short'
      }).format(item.date)
    ),
    datasets: [
      {
        label: 'Оценка',
        data: stats.scoreOverTime.map(item => item.score),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
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
        text: 'Динамика оценок',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            const date = stats.scoreOverTime[index]?.date;
            if (date) {
              return new Intl.DateTimeFormat('ru-RU', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              }).format(date);
            }
            return '';
          },
          label: (tooltipItem: any) => {
            return `Оценка: ${tooltipItem.raw}/10`;
          }
        }
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
    },
  };

  // Данные для круговой диаграммы
  const pieData = {
    labels: ['Отлично (8-10)', 'Хорошо (6-7.9)', 'Удовл (4-5.9)', 'Плохо (<4)'],
    datasets: [
      {
        data: [
          stats.scoreCategories.excellent,
          stats.scoreCategories.good,
          stats.scoreCategories.fair,
          stats.scoreCategories.poor
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',  // зеленый
          'rgba(234, 179, 8, 0.7)',   // желтый
          'rgba(249, 115, 22, 0.7)',  // оранжевый
          'rgba(239, 68, 68, 0.7)',   // красный
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Распределение результатов',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const value = tooltipItem.raw;
            const total = tooltipItem.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Компонент защищен, только для авторизованных пользователей
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Аналитика результатов</h1>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">У вас пока нет результатов тестов</h3>
            <p className="mb-4">Пройдите несколько тестов, чтобы увидеть вашу статистику</p>
            <button 
              onClick={() => router.push('/tests')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Найти тесты
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-4">
                  <FaCheckCircle size={24} />
                </div>
                <div>
                  <p className="text-neutral-600">Всего тестов</p>
                  <h3 className="text-2xl font-bold">{stats.totalTests}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-full mr-4">
                  <FaChartLine size={24} />
                </div>
                <div>
                  <p className="text-neutral-600">Средняя оценка</p>
                  <h3 className="text-2xl font-bold">{stats.averageScore}/10</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full mr-4">
                  <FaTrophy size={24} />
                </div>
                <div>
                  <p className="text-neutral-600">Лучший результат</p>
                  <h3 className="text-2xl font-bold">{stats.bestScore}/10</h3>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Компонент сравнения результатов */}
        {results.length > 1 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
            <h2 className="text-xl font-bold mb-4">Сравнение с предыдущими результатами</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-neutral-700">Прогресс по последним 5 тестам</h3>
                <div className="flex flex-col space-y-2">
                  {stats.recentTests.slice(0, 5).map((result, index) => {
                    const prevScore = index < stats.recentTests.length - 1 ? stats.recentTests[index + 1].score : null;
                    const difference = prevScore !== null ? result.score - prevScore : 0;
                    return (
                      <div key={result.id} className="flex items-center">
                        <div className="w-32 text-sm text-neutral-600">
                          {formatDate(result.created_at)}:
                        </div>
                        <div className="flex-grow h-3 bg-neutral-200 rounded-full mx-2">
                          <div 
                            className="h-3 rounded-full bg-primary-500" 
                            style={{ width: `${result.score * 10}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-medium w-16">{result.score}/10</div>
                        {difference !== 0 && (
                          <div className={`text-sm font-medium ml-2 ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {difference > 0 ? `+${difference.toFixed(1)}` : difference.toFixed(1)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-neutral-700 mb-4">Анализ прогресса</h3>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  {stats.scoreOverTime.length > 1 ? (
                    <>
                      <p className="text-sm text-neutral-600 mb-2">
                        {stats.scoreOverTime[0].score > stats.scoreOverTime[stats.scoreOverTime.length - 1].score 
                          ? 'Ваши результаты улучшаются! Продолжайте в том же духе.' 
                          : stats.scoreOverTime[0].score < stats.scoreOverTime[stats.scoreOverTime.length - 1].score
                            ? 'Заметно снижение результатов. Попробуйте уделить больше внимания обучению.' 
                            : 'Ваши результаты стабильны. Попробуйте новые темы для развития.'}
                      </p>
                      <h4 className="font-medium text-neutral-700 mb-2">Рекомендации:</h4>
                      <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                        {stats.worstScore < 6 && (
                          <li>Повторите темы, где ваш результат ниже 6 баллов</li>
                        )}
                        {stats.averageScore < 8 && (
                          <li>Регулярно проходите тесты для улучшения знаний</li>
                        )}
                        {stats.scoreOverTime[0].score < stats.averageScore && (
                          <li>Ваш последний результат ниже среднего - попробуйте пройти тест еще раз</li>
                        )}
                        <li>Попробуйте создать собственные тесты по сложным темам</li>
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-600">
                      Пройдите больше тестов, чтобы получить рекомендации на основе вашего прогресса.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* График динамики результатов */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h2 className="text-xl font-bold mb-4">Динамика результатов</h2>
              <div className="h-[300px]">
                <Line 
                  data={chartData} 
                  options={chartOptions} 
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h2 className="text-xl font-bold mb-4">Распределение оценок</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Pie 
                  data={pieData} 
                  options={pieOptions}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Последние результаты */}
        {results.length > 0 && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
              <h2 className="text-xl font-bold mb-4">Карта навыков</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(stats.skillMap).map(([topic, data], index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      data.score >= 8 
                        ? 'border-green-200 bg-green-50' 
                        : data.score >= 6 
                        ? 'border-yellow-200 bg-yellow-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <h3 className="font-medium text-neutral-800 mb-1">{topic}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            data.score >= 8 
                              ? 'bg-green-500' 
                              : data.score >= 6 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`} 
                          style={{ width: `${data.score * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{data.score}/10</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Пройдено тестов: {data.count}
                    </div>
                    {data.score < 7 && (
                      <div className="mt-2 text-xs text-primary-600">
                        <Link href={`/tests?topic=${encodeURIComponent(topic)}`}>
                          Найти больше тестов по этой теме →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h2 className="text-xl font-bold mb-4">Последние результаты</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Тест
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Оценка
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {stats.recentTests.map((result) => (
                      <tr key={result.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">
                            {testDetails[result.test_id]?.title || 'Неизвестный тест'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-500">
                            {formatDate(result.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/dashboard/test/${result.test_id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Детально
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard; 