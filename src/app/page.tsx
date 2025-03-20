import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const features = [
    {
      title: 'Создавайте тесты с помощью ИИ',
      description: 'Просто загрузите текст или документ, и искусственный интеллект сгенерирует качественные вопросы и ответы.',
      icon: '🧠'
    },
    {
      title: 'Доступно на всех устройствах',
      description: 'Создавайте и проходите тесты на смартфонах, планшетах и компьютерах в любое удобное время.',
      icon: '📱'
    },
    {
      title: 'Делитесь тестами',
      description: 'Делитесь созданными тестами с друзьями, коллегами или учениками одним нажатием кнопки.',
      icon: '🔗'
    },
    {
      title: 'Следите за прогрессом',
      description: 'Анализируйте результаты тестов и отслеживайте свой прогресс с помощью удобной статистики.',
      icon: '📊'
    }
  ];

  return (
    <div>
      {/* Hero секция */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Создавайте тесты с помощью ИИ в один клик
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Lume — платформа для создания, прохождения и обмена тестами, использующая искусственный интеллект для генерации вопросов
          </p>
          
          {/* Добавляем заметную кнопку создания теста */}
          <Link 
            href="/auth/signup"
            className="inline-block px-8 py-4 mb-8 text-xl bg-primary-100 text-black font-medium rounded-lg hover:bg-primary-200 transition-colors shadow-md hover:shadow-lg"
          >
            Начать создавать тесты
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/create" 
              className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Создать тест
            </Link>
            <Link 
              href="/tests" 
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Смотреть доступные тесты
            </Link>
          </div>
        </div>
      </section>

      {/* Секция с возможностями */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности Lume</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-neutral-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Секция "Как это работает" */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Загрузите текст</h3>
              <p className="text-neutral-600">Скопируйте текст или загрузите документ, по которому хотите создать тест</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">ИИ создаст вопросы</h3>
              <p className="text-neutral-600">Наш искусственный интеллект проанализирует текст и создаст вопросы по ключевым темам</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Сохраните и поделитесь</h3>
              <p className="text-neutral-600">Сохраните тест в своем профиле и поделитесь с кем угодно через ссылку</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/auth/signup" 
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Зарегистрироваться и начать бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* Отзывы или преимущества */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10">Почему выбирают Lume</h2>
          
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center max-w-xs">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Быстро</h3>
              <p className="text-neutral-600">Создание теста занимает меньше минуты благодаря технологиям ИИ</p>
            </div>
            
            <div className="flex flex-col items-center max-w-xs">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Точно</h3>
              <p className="text-neutral-600">Вопросы создаются на основе ключевых моментов текста для лучшего запоминания</p>
            </div>
            
            <div className="flex flex-col items-center max-w-xs">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Безопасно</h3>
              <p className="text-neutral-600">Ваши данные защищены, а регистрация бесплатна</p>
            </div>
          </div>
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы начать создавать тесты?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Зарегистрируйтесь бесплатно и создайте свой первый тест уже сегодня
          </p>
          <Link 
            href="/auth/signup" 
            className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-neutral-100 transition-colors inline-block"
          >
            Начать сейчас
          </Link>
        </div>
      </section>
    </div>
  );
} 