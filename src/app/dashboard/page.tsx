'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useAuth from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaLongArrowAltRight, FaChartBar, FaClipboard, FaPlus, FaList, FaTrophy, FaClock } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';

interface TestSummary {
  id: string;
  title: string;
  description: string;
  created_at: string;
  questions_count: number;
  completion_count: number;
  average_score: number;
}

interface UserProgress {
  totalTestsTaken: number;
  averageScore: number;
  testsCompleted: {
    id: string;
    title: string;
    score: number;
    date: string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isDarkMode } = useSettings();
  const [userTests, setUserTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalTestsTaken: 0,
    averageScore: 0,
    testsCompleted: []
  });
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    if (user) {
      fetchUserTests();
      fetchUserProgress();
    }
  }, [user]);
  
  const fetchUserTests = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tests')
        .select(`
          id,
          title,
          description,
          created_at,
          questions:questions(count),
          completions:completions(count, score)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Преобразуем данные для отображения
      const formattedTests = data.map(test => {
        const questionsCount = Array.isArray(test.questions) ? test.questions.length : 0;
        const completions = Array.isArray(test.completions) ? test.completions : [];
        const completionCount = completions.length;
        const totalScore = completions.reduce((sum, item) => sum + (item.score || 0), 0);
        const averageScore = completionCount > 0 ? totalScore / completionCount : 0;
        
        return {
          id: test.id,
          title: test.title,
          description: test.description,
          created_at: test.created_at,
          questions_count: questionsCount,
          completion_count: completionCount,
          average_score: averageScore
        };
      });
      
      setUserTests(formattedTests);
    } catch (err: any) {
      console.error('Ошибка при загрузке тестов:', err);
      setError('Не удалось загрузить тесты. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('completions')
        .select(`
          id,
          score,
          created_at,
          test:tests(id, title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Рассчитываем статистику
      const completedTests = data.map(item => ({
        id: item.test.id,
        title: item.test.title,
        score: item.score,
        date: new Date(item.created_at).toLocaleDateString()
      }));
      
      const totalScore = data.reduce((sum, item) => sum + (item.score || 0), 0);
      const averageScore = data.length > 0 ? totalScore / data.length : 0;
      
      setUserProgress({
        totalTestsTaken: data.length,
        averageScore,
        testsCompleted: completedTests.slice(0, 5) // Берем только 5 последних тестов
      });
    } catch (err: any) {
      console.error('Ошибка при загрузке прогресса:', err);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <header className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Дашборд</h1>
            <p className="text-neutral-600 dark-theme:text-neutral-400">
              Управляйте своими тестами и отслеживайте прогресс
            </p>
          </header>

          {!loading && !user ? (
            <div className="bg-white dark-theme:bg-neutral-800 shadow-sm rounded-xl p-6 border border-neutral-200 dark-theme:border-neutral-700 mb-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-4">Для доступа к дашборду необходимо войти в аккаунт</h2>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="btn-primary px-6 py-3 rounded-lg"
                  >
                    Войти
                  </button>
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="btn-secondary px-6 py-3 rounded-lg"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark-theme:bg-neutral-800 shadow-sm rounded-xl p-6 border border-neutral-200 dark-theme:border-neutral-700">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark-theme:bg-primary-900 dark-theme:bg-opacity-20 flex items-center justify-center text-primary-600 dark-theme:text-primary-400 mr-4">
                      <FaList className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Ваши тесты</h3>
                      <p className="text-2xl font-bold">{userTests.length}</p>
                    </div>
                  </div>
                  <Link 
                    href="/create" 
                    className="text-primary-600 dark-theme:text-primary-400 flex items-center text-sm font-medium hover:underline"
                  >
                    Создать новый тест <FaLongArrowAltRight className="ml-1" />
                  </Link>
                </div>
                
                <div className="bg-white dark-theme:bg-neutral-800 shadow-sm rounded-xl p-6 border border-neutral-200 dark-theme:border-neutral-700">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark-theme:bg-primary-900 dark-theme:bg-opacity-20 flex items-center justify-center text-primary-600 dark-theme:text-primary-400 mr-4">
                      <FaClipboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Пройдено тестов</h3>
                      <p className="text-2xl font-bold">{userProgress.totalTestsTaken}</p>
                    </div>
                  </div>
                  <Link 
                    href="/tests" 
                    className="text-primary-600 dark-theme:text-primary-400 flex items-center text-sm font-medium hover:underline"
                  >
                    Все доступные тесты <FaLongArrowAltRight className="ml-1" />
                  </Link>
                </div>
                
                <div className="bg-white dark-theme:bg-neutral-800 shadow-sm rounded-xl p-6 border border-neutral-200 dark-theme:border-neutral-700">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark-theme:bg-primary-900 dark-theme:bg-opacity-20 flex items-center justify-center text-primary-600 dark-theme:text-primary-400 mr-4">
                      <FaTrophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Средний результат</h3>
                      <p className="text-2xl font-bold">{userProgress.averageScore.toFixed(0)}%</p>
                    </div>
                  </div>
                  <Link 
                    href="/profile" 
                    className="text-primary-600 dark-theme:text-primary-400 flex items-center text-sm font-medium hover:underline"
                  >
                    Просмотреть профиль <FaLongArrowAltRight className="ml-1" />
                  </Link>
                </div>
              </div>

              {/* Ваши тесты */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Ваши тесты</h2>
                  <Link
                    href="/create"
                    className="btn-primary px-4 py-2 rounded-lg flex items-center"
                  >
                    <FaPlus className="mr-2" /> Создать тест
                  </Link>
                </div>

                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Загрузка...
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600 dark-theme:text-neutral-400">Загрузка ваших тестов...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 dark-theme:bg-red-900 dark-theme:bg-opacity-20 text-red-800 dark-theme:text-red-300 p-4 rounded-lg">
                    {error}
                  </div>
                ) : userTests.length === 0 ? (
                  <div className="bg-white dark-theme:bg-neutral-800 shadow-sm rounded-xl p-8 border border-neutral-200 dark-theme:border-neutral-700 text-center">
                    <Image
                      src="/empty-state.svg"
                      alt="Нет тестов"
                      width={200}
                      height={200}
                      className="mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">У вас пока нет созданных тестов</h3>
                    <p className="text-neutral-600 dark-theme:text-neutral-400 mb-6 max-w-md mx-auto">
                      Создайте свой первый тест, чтобы начать обучение или поделиться знаниями с другими
                    </p>
                    <Link
                      href="/create"
                      className="btn-primary px-6 py-3 rounded-lg"
                    >
                      Создать первый тест
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userTests.map(test => (
                      <div 
                        key={test.id} 
                        className="bg-white dark-theme:bg-neutral-800 shadow-sm rounded-xl border border-neutral-200 dark-theme:border-neutral-700 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{test.title}</h3>
                          <p className="text-neutral-600 dark-theme:text-neutral-400 text-sm mb-4 line-clamp-2">
                            {test.description || 'Нет описания'}
                          </p>
                          <div className="flex items-center text-sm text-neutral-500 dark-theme:text-neutral-500 mb-4">
                            <FaClock className="mr-1" />
                            <span>{formatDate(test.created_at)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <FaClipboard className="mr-1 text-neutral-500 dark-theme:text-neutral-500" />
                              <span>{test.questions_count} вопр.</span>
                            </div>
                            <div className="flex items-center">
                              <FaChartBar className="mr-1 text-neutral-500 dark-theme:text-neutral-500" />
                              <span>{test.completion_count} проход.</span>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-neutral-200 dark-theme:border-neutral-700 p-4 bg-neutral-50 dark-theme:bg-neutral-900">
                          <div className="flex justify-between">
                            <Link
                              href={`/tests/${test.id}`}
                              className="text-primary-600 dark-theme:text-primary-400 text-sm font-medium hover:underline"
                            >
                              Пройти
                            </Link>
                            <Link
                              href={`/tests/${test.id}/edit`}
                              className="text-neutral-600 dark-theme:text-neutral-400 text-sm font-medium hover:underline"
                            >
                              Редактировать
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Недавно пройденные тесты */}
              {userProgress.testsCompleted.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold mb-6">Недавно пройденные тесты</h2>
                  <div className="bg-white dark-theme:bg-neutral-800 shadow-sm rounded-xl border border-neutral-200 dark-theme:border-neutral-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200 dark-theme:divide-neutral-700">
                        <thead className="bg-neutral-50 dark-theme:bg-neutral-900">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark-theme:text-neutral-400 uppercase tracking-wider">
                              Название теста
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark-theme:text-neutral-400 uppercase tracking-wider">
                              Дата
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark-theme:text-neutral-400 uppercase tracking-wider">
                              Результат
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark-theme:text-neutral-400 uppercase tracking-wider">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark-theme:bg-neutral-800 divide-y divide-neutral-200 dark-theme:divide-neutral-700">
                          {userProgress.testsCompleted.map((test, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium">{test.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark-theme:text-neutral-400">
                                {test.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  test.score >= 80 
                                    ? 'bg-green-100 dark-theme:bg-green-900 dark-theme:bg-opacity-20 text-green-800 dark-theme:text-green-300' 
                                    : test.score >= 60 
                                      ? 'bg-yellow-100 dark-theme:bg-yellow-900 dark-theme:bg-opacity-20 text-yellow-800 dark-theme:text-yellow-300' 
                                      : 'bg-red-100 dark-theme:bg-red-900 dark-theme:bg-opacity-20 text-red-800 dark-theme:text-red-300'
                                }`}>
                                  {test.score}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link 
                                  href={`/tests/${test.id}`}
                                  className="text-primary-600 dark-theme:text-primary-400 hover:underline"
                                >
                                  Пройти снова
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