-- Проверка создания таблиц
-- Выполните этот скрипт в SQL Editor, чтобы убедиться, что все таблицы созданы

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('tests', 'test_results', 'notifications', 'notification_settings') 
    THEN '✅ Создана' 
    ELSE '❌ Отсутствует' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tests', 'test_results', 'notifications', 'notification_settings')
ORDER BY table_name;

-- Проверка политик безопасности
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Просмотр'
    WHEN cmd = 'INSERT' THEN 'Создание'
    WHEN cmd = 'UPDATE' THEN 'Обновление'
    WHEN cmd = 'DELETE' THEN 'Удаление'
    ELSE cmd
  END as операция
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('tests', 'test_results', 'notifications', 'notification_settings')
ORDER BY tablename, policyname;

