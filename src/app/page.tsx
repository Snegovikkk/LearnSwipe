import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero секция с градиентным фоном */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Градиентный фон с абстрактными формами */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white z-0"></div>
        <div className="absolute right-0 top-0 w-2/3 h-2/3 bg-gradient-to-b from-primary-100 to-transparent rounded-bl-full opacity-60 z-0"></div>
        <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary-100 to-transparent rounded-tr-full opacity-40 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-1">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-neutral-900 leading-tight">
              Создавайте тесты с помощью ИИ
            </h1>
            <p className="text-xl mb-10 text-neutral-700 leading-relaxed">
              Lume превращает любой текст в интерактивный тест для более эффективного обучения и проверки знаний
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/create"
                className="btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                Создать тест
              </Link>
              <Link
                href="/tests"
                className="btn-secondary px-8 py-4 text-lg hover:bg-neutral-100 transition-all"
              >
                Изучить тесты
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Как это работает - упрощенная секция с иконками */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Три простых шага</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Загрузите текст</h3>
              <p className="text-neutral-600">
                Просто вставьте любой текст, по которому хотите создать тест
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">ИИ создаст вопросы</h3>
              <p className="text-neutral-600">
                Искусственный интеллект проанализирует текст и создаст подходящие вопросы
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Тестируйте и делитесь</h3>
              <p className="text-neutral-600">
                Проходите тесты сами или делитесь ими с друзьями и учениками
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества - карточки с тенями */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">Возможности Lume</h2>
          <p className="text-center text-neutral-600 max-w-2xl mx-auto mb-16">
            Создавайте и проходите тесты на любую тему с помощью передовых технологий искусственного интеллекта
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary-500 mb-4 text-3xl">🧠</div>
              <h3 className="text-xl font-semibold mb-3">Генерация тестов с ИИ</h3>
              <p className="text-neutral-600">
                Искусственный интеллект анализирует текст и создает релевантные вопросы с вариантами ответов
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary-500 mb-4 text-3xl">📊</div>
              <h3 className="text-xl font-semibold mb-3">Аналитика прогресса</h3>
              <p className="text-neutral-600">
                Отслеживайте свой прогресс, выявляйте сильные и слабые стороны с помощью подробной статистики
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary-500 mb-4 text-3xl">🔗</div>
              <h3 className="text-xl font-semibold mb-3">Удобный шеринг</h3>
              <p className="text-neutral-600">
                Делитесь тестами с помощью простой ссылки и отслеживайте, как пользователи справляются с ними
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary-500 mb-4 text-3xl">📱</div>
              <h3 className="text-xl font-semibold mb-3">Адаптивный дизайн</h3>
              <p className="text-neutral-600">
                Доступ к платформе с любого устройства — компьютера, планшета или смартфона
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary-500 mb-4 text-3xl">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Быстрое создание</h3>
              <p className="text-neutral-600">
                Создание теста занимает меньше минуты благодаря мощным алгоритмам обработки текста
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary-500 mb-4 text-3xl">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Безопасно и надежно</h3>
              <p className="text-neutral-600">
                Ваши данные защищены, а мы гарантируем стабильную работу сервиса в любое время
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA секция - более простая и элегантная */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Начните создавать тесты уже сегодня</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Зарегистрируйтесь бесплатно и откройте для себя новый способ обучения и тестирования
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-primary-600 font-medium rounded-lg hover:bg-neutral-100 transition-all shadow-lg hover:shadow-xl"
          >
            Создать аккаунт бесплатно
          </Link>
        </div>
      </section>
    </div>
  );
} 