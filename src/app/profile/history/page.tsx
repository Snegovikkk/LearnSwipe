'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheck, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';

// Пример данных истории тестов
const mockHistory = [
  {
    id: '1',
    title: 'Основы JavaScript',
    date: '12 марта 2023',
    score: 8,
    maxScore: 10,
    type: 'completed'
  },
  {
    id: '2',
    title: 'React компоненты',
    date: '10 марта 2023',
    score: 7,
    maxScore: 10,
    type: 'completed'
  },
  {
    id: '3',
    title: 'TypeScript основы',
    date: '5 марта 2023',
    score: 9,
    maxScore: 10,
    type: 'completed'
  },
  {
    id: '4',
    title: 'CSS Grid и Flexbox',
    date: '28 февраля 2023',
    score: 4,
    maxScore: 5,
    type: 'completed'
  },
  {
    id: '5',
    title: 'Git основы',
    date: '15 февраля 2023',
    score: 6,
    maxScore: 10,
    type: 'completed'
  },
  {
    id: '6',
    title: 'Алгоритмы сортировки',
    date: '15 марта 2023',
    score: null,
    maxScore: null,
    type: 'created'
  },
  {
    id: '7',
    title: 'HTML5 новые возможности',
    date: '8 марта 2023',
    score: null,
    maxScore: null,
    type: 'created'
  },
];

export default function TestHistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all'); // all, completed, created
  const [searchTerm, setSearchTerm] = useState('');
  
  // Фильтрация истории
  const filteredHistory = mockHistory.filter(item => {
    // Фильтр по типу
    if (filter !== 'all' && item.type !== filter) {
      return false;
    }
    
    // Фильтр по поисковому запросу
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
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
        
        {/* Поиск и фильтры */}
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
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Все
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === 'completed' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Пройденные
            </button>
            <button 
              onClick={() => setFilter('created')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === 'created' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Созданные
            </button>
          </div>
        </div>
        
        {/* Список тестов */}
        {filteredHistory.length === 0 ? (
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
                className="card p-4 flex flex-col"
                onClick={() => router.push(`/tests/${item.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <span className="text-xs text-neutral-500">{item.date}</span>
                </div>
                
                {item.type === 'completed' ? (
                  <div className="flex justify-between items-center">
                    <div className="w-full max-w-xs bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (item.score / item.maxScore) > 0.7 
                            ? 'bg-green-500' 
                            : (item.score / item.maxScore) > 0.4 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-medium">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-neutral-600">
                    <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded text-xs">
                      Автор
                    </span>
                  </div>
                )}
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
                {mockHistory.filter(item => item.type === 'completed').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Создано тестов</div>
              <div className="text-2xl font-bold text-primary-500">
                {mockHistory.filter(item => item.type === 'created').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Средний балл</div>
              <div className="text-2xl font-bold text-primary-500">
                {Math.round(
                  mockHistory
                    .filter(item => item.type === 'completed')
                    .reduce((acc, item) => acc + (item.score / item.maxScore * 100), 0) / 
                  mockHistory.filter(item => item.type === 'completed').length
                )}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 