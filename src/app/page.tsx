import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
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
              <Link
                href="/tests"
                className="btn-secondary px-6 py-3 text-base transition-all"
              >
                Найти тесты
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Три преимущества - максимально компактно */}
      <section className="py-12 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4">
              <div className="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Загрузите текст</h3>
                <p className="text-sm text-neutral-600">Из учебника, статьи или заметок</p>
              </div>
            </div>
            
            <div className="flex items-center p-4">
              <div className="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">ИИ создаст тест</h3>
                <p className="text-sm text-neutral-600">Автоматически, в один клик</p>
              </div>
            </div>
            
            <div className="flex items-center p-4">
              <div className="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mr-4">
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

      {/* Демонстрация с макетом теста */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-6">
                <span className="inline-block bg-primary-100 text-primary-600 px-3 py-1 text-xs font-medium rounded-full">Пример</span>
                <h2 className="text-xl font-semibold mt-2">История Древнего Рима</h2>
              </div>
              
              <div className="p-4 border border-neutral-200 rounded-lg mb-4">
                <p className="font-medium mb-2">Кто был первым императором Рима?</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-5 h-5 flex items-center justify-center border border-primary-300 rounded-full mr-2">
                      <span className="text-sm">A</span>
                    </div>
                    <p className="text-sm">Юлий Цезарь</p>
                  </div>
                  <div className="flex items-center bg-primary-50 rounded-md p-1">
                    <div className="w-5 h-5 flex items-center justify-center bg-primary-500 text-white rounded-full mr-2">
                      <span className="text-sm">Б</span>
                    </div>
                    <p className="text-sm font-medium">Октавиан Август</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 flex items-center justify-center border border-primary-300 rounded-full mr-2">
                      <span className="text-sm">В</span>
                    </div>
                    <p className="text-sm">Марк Антоний</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/create" className="text-primary-600 text-sm font-medium hover:underline">
                  Создать свой тест →
                </Link>
              </div>
            </div>
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