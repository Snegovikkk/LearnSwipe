'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';

export default function TestHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getUserResults, getTestById, loading } = useTests();
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      const results = await getUserResults(user.id);
      // Оставляем только 10 последних
      const limited = results.slice(0, 10);
      // Для каждого результата подтягиваем название теста
      const withTitles = await Promise.all(
        limited.map(async (item: any) => {
          const test = await getTestById(item.test_id);
          return {
            ...item,
            title: test?.title || 'Без названия',
            maxScore: 10, // Можно доработать, если есть инфа о максимальном балле
          };
        })
      );
      setHistory(withTitles);
      setLoadingHistory(false);
    };
    if (user) fetchHistory();
  }, [user]);

  // Фильтрация по поиску
  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Статистика
  const completedCount = history.length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          history.reduce((acc, item) => acc + (item.score || 0), 0) /
            completedCount * 10
        )
      : 0;

  return (
    <div className="pt-8 pb-24">
      <div className="app-container">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-3 text-neutral-600"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">История тестов</h1>
        </div>
        {/* Поиск */}
        <div className="mb-6">
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Поиск по названию теста"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
        </div>
        {/* Список тестов */}
        {loadingHistory ? (
          <div className="card text-center py-8 text-neutral-500">Загрузка...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-neutral-600">История тестов пуста</p>
            {searchTerm && (
              <p className="text-sm text-neutral-500 mt-2">
                Попробуйте изменить поисковый запрос
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="card p-4 flex flex-col cursor-pointer"
                onClick={() => router.push(`/tests/${item.test_id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <span className="text-xs text-neutral-500">{new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-full max-w-xs bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.score >= 7
                          ? 'bg-green-500'
                          : item.score >= 4
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(item.score / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium">
                    {item.score}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Статистика */}
        <div className="mt-8 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <h2 className="text-lg font-semibold mb-3">Ваша статистика</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Пройдено тестов</div>
              <div className="text-2xl font-bold text-primary-500">
                {completedCount}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Средний балл</div>
              <div className="text-2xl font-bold text-primary-500">
                {avgScore}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 