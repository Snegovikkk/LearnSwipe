'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useTests from '@/hooks/useTests';
import useAuth from '@/hooks/useAuth';
import { FaFilter, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function TestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getTests } = useTests();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    async function fetchTests() {
      setLoading(true);
      try {
        const testsData = await getTests();
        setTests(testsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке тестов:', err);
        setError('Не удалось загрузить тесты. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTests();
  }, [getTests]);
  
  const filteredTests = tests
    .filter(test => {
      // Фильтр по поисковому запросу
      if (searchTerm && !test.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Фильтр по категории
      if (filter !== 'all') {
        // Здесь нужно будет реализовать фильтрацию по категориям,
        // когда они будут добавлены к тестам
        return true;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Сортировка с более новыми тестами вначале
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  
  return (
    <div className="py-8 pb-24">
      <div className="app-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Все тесты</h1>
          
          {user && (
            <Link
              href="/create"
              className="btn-sm bg-primary-600 text-white hover:bg-primary-700 rounded-md px-3 py-1.5 text-sm"
            >
              Создать тест
            </Link>
          )}
        </div>
        
        {/* Поиск и фильтры */}
        <div className="mb-6">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Поиск тестов..."
              className="w-full py-2 pl-4 pr-10 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
          
          <div className="flex overflow-x-auto gap-2 py-1">
            <button 
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilter('all')}
            >
              Все тесты
            </button>
            <button 
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'popular' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilter('popular')}
            >
              Популярные
            </button>
            <button 
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'new' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onClick={() => setFilter('new')}
            >
              Новые
            </button>
          </div>
        </div>
        
        {/* Список тестов */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-2xl text-primary-600" />
          </div>
        ) : error ? (
          <div className="card text-center py-8">
            <FaExclamationTriangle className="text-3xl text-amber-500 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-sm mx-auto"
            >
              Попробовать снова
            </button>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-neutral-600 mb-4">
              {searchTerm 
                ? 'Нет тестов, соответствующих вашему запросу' 
                : 'Пока нет доступных тестов'}
            </p>
            {user && (
              <Link href="/create" className="btn-sm mx-auto">
                Создать первый тест
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <Link href={`/tests/${test.id}`} key={test.id}>
                <div className="card hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold mb-2">{test.title}</h3>
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {test.content ? test.content.substring(0, 150) + '...' : 'Нет описания'}
                  </p>
                  
                  <div className="flex flex-wrap justify-between text-xs text-neutral-500">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {test.user_id ? 'Пользователь' : 'Система'}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(test.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span>
                        10 вопросов
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 