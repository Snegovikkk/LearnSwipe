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
    skillMap: {} as Record<string, {score: number, count: number, tests: string[]}>,
    weakestSkills: [] as {topic: string, score: number}[],
    learningProgress: {
      completedTests: 0,
      targetTests: 25,
      averageScoreGoal: 8,
      completedTopics: 0,
      targetTopics: 10,
      progressPercentage: 0
    }
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
          
          // Определяем самые слабые навыки для рекомендаций
          const weakestSkills = Object.entries(skillMap)
            .map(([topic, data]) => ({ topic, score: data.score }))
            .sort((a, b) => a.score - b.score)
            .slice(0, 3);
          
          // Вычисляем прогресс обучения
          const completedTopics = Object.keys(skillMap).length;
          const targetTopics = 10; // Целевое количество тем для освоения
          const targetTests = 25; // Целевое количество тестов
          const completedTests = userResults.length;
          
          // Общий прогресс (из 100%)
          const testProgress = Math.min(completedTests / targetTests, 1) * 0.5; // 50% от общего прогресса
          const topicProgress = Math.min(completedTopics / targetTopics, 1) * 0.3; // 30% от общего прогресса
          const scoreProgress = Math.min(avgScore / 8, 1) * 0.2; // 20% от общего прогресса
          const progressPercentage = Math.round((testProgress + topicProgress + scoreProgress) * 100);
          
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
            skillMap: skillMap,
            weakestSkills: weakestSkills,
            learningProgress: {
              completedTests,
              targetTests,
              averageScoreGoal: 8,
              completedTopics,
              targetTopics,
              progressPercentage
            }
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
        
        {/* После сводной статистики и перед картой навыков */}
        {results.length > 0 && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Ваш прогресс в обучении</h2>
                <div className="flex items-center mt-2 md:mt-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: `conic-gradient(#4F46E5 ${stats.learningProgress.progressPercentage}%, #E5E7EB 0)`
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <span className="text-primary-700">{stats.learningProgress.progressPercentage}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-neutral-500">Общий прогресс</div>
                    <div className="font-medium">
                      {stats.learningProgress.progressPercentage < 25 ? 'Начинающий' : 
                       stats.learningProgress.progressPercentage < 50 ? 'Изучающий' : 
                       stats.learningProgress.progressPercentage < 75 ? 'Продвинутый' : 'Эксперт'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-800">Пройденные тесты</h3>
                      <p className="text-sm text-neutral-500">Цель: {stats.learningProgress.targetTests} тестов</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary-700">
                        <path fillRule="evenodd" d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06a.75.75 0 11-1.061 1.061L5.05 4.11a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.062-1.061l1.061-1.06a.75.75 0 011.06 0zM3 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 10zm11.75-.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm-9.543 4.81a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.061l-1.06-1.06a.75.75 0 010-1.06zm6.963 0a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.061l-1.06-1.06a.75.75 0 010-1.06zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end mt-4">
                    <div className="text-3xl font-bold mr-2">{stats.learningProgress.completedTests}</div>
                    <div className="text-sm text-neutral-500 mb-1">из {stats.learningProgress.targetTests}</div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(stats.learningProgress.completedTests / stats.learningProgress.targetTests * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-800">Изученные темы</h3>
                      <p className="text-sm text-neutral-500">Цель: {stats.learningProgress.targetTopics} тем</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-700">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end mt-4">
                    <div className="text-3xl font-bold mr-2">{stats.learningProgress.completedTopics}</div>
                    <div className="text-sm text-neutral-500 mb-1">из {stats.learningProgress.targetTopics}</div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(stats.learningProgress.completedTopics / stats.learningProgress.targetTopics * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-800">Средний балл</h3>
                      <p className="text-sm text-neutral-500">Цель: {stats.learningProgress.averageScoreGoal} из 10</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-700">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end mt-4">
                    <div className="text-3xl font-bold mr-2">{stats.averageScore}</div>
                    <div className="text-sm text-neutral-500 mb-1">из 10</div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(stats.averageScore / stats.learningProgress.averageScoreGoal * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <h3 className="font-medium text-neutral-700 mb-2">Следующие этапы развития</h3>
                <ul className="space-y-2">
                  {stats.learningProgress.completedTopics < stats.learningProgress.targetTopics && (
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-700">
                        Исследуйте еще {stats.learningProgress.targetTopics - stats.learningProgress.completedTopics} новых тем для расширения своих знаний
                      </span>
                    </li>
                  )}
                  {stats.learningProgress.completedTests < stats.learningProgress.targetTests && (
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-700">
                        Пройдите еще {stats.learningProgress.targetTests - stats.learningProgress.completedTests} тестов для достижения цели
                      </span>
                    </li>
                  )}
                  {stats.averageScore < stats.learningProgress.averageScoreGoal && (
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-700">
                        Повысьте средний балл с {stats.averageScore} до {stats.learningProgress.averageScoreGoal}, повторно пройдя тесты со слабыми результатами
                      </span>
                    </li>
                  )}
                  {stats.learningProgress.progressPercentage >= 100 && (
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-green-700 font-medium">
                        Поздравляем! Вы достигли всех целей обучения. Установите новые цели для дальнейшего развития!
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
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

            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
              <h2 className="text-xl font-bold mb-4">Рекомендации по обучению</h2>
              
              {stats.weakestSkills.length > 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-2">Области для улучшения</h3>
                    <p className="text-sm text-amber-700 mb-3">
                      На основе ваших результатов, мы рекомендуем сосредоточиться на следующих темах:
                    </p>
                    <div className="space-y-3">
                      {stats.weakestSkills.map((skill, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-700">{skill.topic}</p>
                            <div className="flex items-center mt-1">
                              <div className="w-24 bg-neutral-200 rounded-full h-1.5 mr-2">
                                <div 
                                  className="h-1.5 rounded-full bg-amber-500" 
                                  style={{ width: `${skill.score * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-neutral-500">{skill.score}/10</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h3 className="font-medium text-neutral-800 mb-2">Стратегия обучения</h3>
                      <ul className="space-y-2 text-sm text-neutral-600">
                        <li className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                          </div>
                          <span>Начните с повторения основных концепций в темах с низкими баллами</span>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                          </div>
                          <span>Проходите тесты регулярно для закрепления знаний</span>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                          </div>
                          <span>Используйте функцию создания новых тестов для углубления в сложные темы</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h3 className="font-medium text-neutral-800 mb-2">Следующие шаги</h3>
                      <div className="space-y-3 text-sm">
                        <Link href="/tests" className="flex items-center p-2 hover:bg-neutral-50 rounded-md transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>Поиск рекомендуемых тестов</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-auto text-neutral-400">
                            <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        <Link href="/create" className="flex items-center p-2 hover:bg-neutral-50 rounded-md transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                          </div>
                          <span>Создать новый тест по слабой теме</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-auto text-neutral-400">
                            <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-neutral-500">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">Недостаточно данных</h3>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    Пройдите больше тестов, чтобы получить персонализированные рекомендации по обучению на основе ваших результатов.
                  </p>
                  <Link href="/tests" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                    Перейти к тестам
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                      <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              )}
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