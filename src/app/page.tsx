'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="bg-white">
      {/* Минималистичная hero-секция */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Утонченный градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 to-white z-0"></div>
        <div className="absolute right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-100 to-transparent opacity-40 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-1">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900 leading-tight">
              Создавайте тесты с помощью ИИ
            </h1>
            <p className="text-lg mb-8 text-neutral-700">
              Превращайте текст в тесты за секунды
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/create"
                className="btn-primary px-6 py-3 text-base shadow-sm hover:shadow-md transition-all"
              >
                Создать тест
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Три преимущества - максимально компактно */}
      <section className="py-12 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Загрузите текст</h3>
                <p className="text-sm text-neutral-600">Из учебника, статьи или заметок</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-4 text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">ИИ создаст тест</h3>
                <p className="text-sm text-neutral-600">Автоматически, в один клик</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-4 text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Практикуйтесь</h3>
                <p className="text-sm text-neutral-600">Учитесь и делитесь тестами</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Интерактивная секция "О Lume" */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => setIsAboutOpen(!isAboutOpen)} 
              className="mx-auto flex items-center justify-center px-8 py-4 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-all text-lg font-medium text-neutral-900 mb-6"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 mr-2 text-primary-500 transition-transform duration-300 ${isAboutOpen ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              О Lume
            </button>
            
            {isAboutOpen && (
              <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn">
                <h2 className="text-2xl font-semibold mb-6 text-center">Почему Lume?</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium mb-3 flex items-center text-primary-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Уникальная технология
                    </h3>
                    <p className="text-neutral-700 text-justify">
                      Lume использует передовые алгоритмы ИИ для анализа текста и создания релевантных тестов. Наша технология интеллектуально выделяет ключевые концепции и факты, генерируя вопросы, которые действительно проверяют и закрепляют знания.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium mb-3 flex items-center text-primary-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                      </svg>
                      Гибкость и персонализация
                    </h3>
                    <p className="text-neutral-700 text-justify">
                      Настраивайте сложность, типы вопросов и формат тестов под свои потребности. Lume адаптируется под ваш стиль обучения, независимо от того, изучаете ли вы языки, науки или готовитесь к экзаменам.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium mb-3 flex items-center text-primary-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                      </svg>
                      Экономия времени
                    </h3>
                    <p className="text-neutral-700 text-justify">
                      То, что раньше занимало часы, теперь можно сделать за минуты. Lume автоматизирует самый трудоемкий процесс в создании учебных материалов, позволяя вам сосредоточиться на обучении и достижении результатов.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-lg font-medium text-primary-700 mb-6">
                    Lume — это не просто инструмент для создания тестов, это революция в том, как мы учимся
                  </p>
                  <Link
                    href="/create"
                    className="inline-block btn-primary px-8 py-3 text-base shadow-sm hover:shadow-md transition-all"
                  >
                    Попробовать сейчас
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Минималистичный призыв к действию */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-6">Начните использовать Lume</h2>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="inline-block px-6 py-3 bg-white text-primary-600 font-medium rounded-lg transition-all"
            >
              Регистрация
            </Link>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg transition-all"
            >
              Войти
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Стиль для анимации появления блока
const style = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
`;

// Добавляем стиль в head документа
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
} 