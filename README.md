# Lume

Платформа для создания и прохождения тестов с использованием ИИ для генерации вопросов.

## Деплой

Приложение развернуто на Vercel и доступно по адресу [lume.vercel.app](https://lume.vercel.app).
Последняя версия: 1.0.1 (исправлены ошибки типизации)

## Технологии

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (аутентификация и база данных)
- DeepSeek API (или другой ИИ)

## Функции приложения

- Создание тестов с использованием ИИ
- Библиотека тестов для прохождения
- Система аутентификации пользователей
- Персональные статистики и история

## Настройка проекта

### Предварительные требования

- Node.js (версия 18 или выше)
- npm или yarn
- Аккаунт Supabase для БД и аутентификации
- Аккаунт DeepSeek для API ИИ

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/lume.git
cd lume
```

2. Установите зависимости:
```bash
npm install
# или
yarn install
```

3. Создайте файл `.env.local` на основе `.env.local.example` и заполните необходимые переменные:
```bash
cp .env.local.example .env.local
```

4. Заполните следующие переменные в `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=ваш_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_supabase_anon_key
DEEPSEEK_API_KEY=ваш_deepseek_api_key
NEXT_PUBLIC_APP_NAME=Lume
NEXT_PUBLIC_API_URL=/api
```

### Настройка Supabase

1. Создайте новый проект на [Supabase](https://supabase.com/)
2. Включите аутентификацию по email в настройках проекта
3. Создайте следующие таблицы в SQL-редакторе Supabase:

#### Таблица тестов
```sql
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  questions JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Разрешение для аутентифицированных пользователей
CREATE POLICY "Tests are viewable by everyone" 
  ON tests FOR SELECT 
  USING (true);

-- Разрешение на создание только своим пользователям
CREATE POLICY "Users can create their own tests" 
  ON tests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Разрешение на изменение только своих тестов
CREATE POLICY "Users can update their own tests" 
  ON tests FOR UPDATE 
  USING (auth.uid() = user_id);

-- Разрешение на удаление только своих тестов
CREATE POLICY "Users can delete their own tests" 
  ON tests FOR DELETE 
  USING (auth.uid() = user_id);

-- Включаем RLS (безопасность на уровне строк)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
```

#### Таблица результатов тестов
```sql
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Разрешение для просмотра только своих результатов и владельцам тестов
CREATE POLICY "Users can view their own results" 
  ON test_results FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (SELECT user_id FROM tests WHERE id = test_results.test_id) = auth.uid()
  );

-- Пользователи могут создавать результаты тестов
CREATE POLICY "Users can create test results" 
  ON test_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Включаем RLS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
```

### Запуск для разработки

```bash
npm run dev
# или
yarn dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

- `/src/app` - Маршруты и страницы Next.js
- `/src/components` - React компоненты
- `/src/hooks` - Кастомные хуки React
- `/src/lib` - Вспомогательные функции и утилиты
- `/src/styles` - Стили CSS
- `/public` - Статические файлы

## Интеграция с DeepSeek API

Для работы с ИИ для генерации тестов, необходимо иметь валидный API ключ DeepSeek. Убедитесь, что баланс на счету достаточен для использования API. Если API недоступен, приложение будет генерировать тесты на основе шаблонов.

## Лицензия

MIT
