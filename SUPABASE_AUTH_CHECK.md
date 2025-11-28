# Проверка настроек аутентификации в Supabase

Если при регистрации появляется ошибка "Load failed", проверьте следующие настройки:

## 1. Проверьте настройки аутентификации

1. В Supabase перейдите в **Authentication** → **Settings**
2. Проверьте следующие настройки:

### Email Auth (Email аутентификация)
- ✅ Должна быть **включена** (Enabled)
- ✅ **Confirm email** может быть включен или выключен (для тестирования лучше выключить)

### Email Templates (Шаблоны email)
- Убедитесь, что шаблоны настроены (можно оставить по умолчанию)

## 2. Проверьте, что SQL скрипт выполнен

1. Перейдите в **SQL Editor**
2. Выполните запрос:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tests', 'test_results', 'notifications', 'notification_settings');
```

Должны вернуться все 4 таблицы. Если нет - выполните `supabase_setup.sql` заново.

## 3. Проверьте переменные окружения

Убедитесь, что на Vercel установлены:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4. Для тестирования (временно отключите подтверждение email)

1. В Supabase: **Authentication** → **Settings**
2. Найдите **Email Auth** → **Confirm email**
3. Отключите его (Disable)
4. Сохраните

Это позволит регистрироваться без подтверждения email (для тестирования).

## 5. Проверьте консоль браузера

Откройте DevTools (F12) → Console и посмотрите, какие ошибки там появляются при попытке регистрации.

## 6. Проверьте логи на Vercel

1. Зайдите на Vercel → ваш проект
2. Откройте последний деплой
3. Посмотрите логи (Logs)
4. Проверьте, нет ли ошибок при сборке или выполнении

