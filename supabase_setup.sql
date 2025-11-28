-- ============================================
-- Настройка базы данных для Lume
-- Выполните этот скрипт в SQL Editor Supabase
-- ============================================

-- 1. Таблица тестов
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Политики безопасности для таблицы tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Tests are viewable by everyone" ON tests;
DROP POLICY IF EXISTS "Users can create their own tests" ON tests;
DROP POLICY IF EXISTS "Users can update their own tests" ON tests;
DROP POLICY IF EXISTS "Users can delete their own tests" ON tests;

-- Все могут просматривать тесты
CREATE POLICY "Tests are viewable by everyone" 
  ON tests FOR SELECT 
  USING (true);

-- Пользователи могут создавать свои тесты
CREATE POLICY "Users can create their own tests" 
  ON tests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои тесты
CREATE POLICY "Users can update their own tests" 
  ON tests FOR UPDATE 
  USING (auth.uid() = user_id);

-- Пользователи могут удалять свои тесты
CREATE POLICY "Users can delete their own tests" 
  ON tests FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. Таблица результатов тестов
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Политики безопасности для таблицы test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Users can view their own results" ON test_results;
DROP POLICY IF EXISTS "Users can create test results" ON test_results;

-- Пользователи могут просматривать свои результаты и владельцы тестов могут видеть результаты по своим тестам
CREATE POLICY "Users can view their own results" 
  ON test_results FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM tests 
      WHERE tests.id = test_results.test_id 
      AND tests.user_id = auth.uid()
    )
  );

-- Пользователи могут создавать результаты тестов
CREATE POLICY "Users can create test results" 
  ON test_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Таблица уведомлений (опционально, если хотите использовать реальные уведомления)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('test_result', 'new_test', 'system', 'reminder')),
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Политики безопасности для таблицы notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Пользователи могут просматривать только свои уведомления
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- Пользователи могут создавать уведомления для себя
CREATE POLICY "Users can create their own notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои уведомления
CREATE POLICY "Users can update their own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- 4. Таблица настроек уведомлений
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  browser_notifications BOOLEAN DEFAULT TRUE,
  test_result_notifications BOOLEAN DEFAULT TRUE,
  new_test_notifications BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  reminder_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Политики безопасности для таблицы notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Users can view their own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can create their own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON notification_settings;

-- Пользователи могут просматривать только свои настройки
CREATE POLICY "Users can view their own notification settings" 
  ON notification_settings FOR SELECT 
  USING (auth.uid() = user_id);

-- Пользователи могут создавать свои настройки
CREATE POLICY "Users can create their own notification settings" 
  ON notification_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои настройки
CREATE POLICY "Users can update their own notification settings" 
  ON notification_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_created_at ON tests(created_at);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

