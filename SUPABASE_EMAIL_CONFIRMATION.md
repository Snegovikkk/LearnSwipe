# Настройка подтверждения email в Supabase

## Проблема
Ссылка подтверждения ведет на localhost:3000 или показывает ошибку "otp_expired".

## Решение

### Шаг 1: Настройте Site URL в Supabase

1. Зайдите в ваш проект Supabase
2. Перейдите в **Authentication** → **URL Configuration**
3. Найдите поле **Site URL**
4. Установите ваш продакшн URL:
   - Если у вас домен: `https://ваш-домен.ru` (например: `https://lumeswipe.ru`)
   - Если используете Vercel: `https://ваш-проект.vercel.app`
5. **Сохраните изменения**

### Шаг 2: Настройте Redirect URLs

В том же разделе **URL Configuration**:

1. Найдите **Redirect URLs**
2. Добавьте следующие URL (каждый с новой строки):
   ```
   https://ваш-домен.ru/auth/callback
   https://ваш-домен.ru/auth/confirmation
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/confirmation
   ```
3. **Сохраните изменения**

### Шаг 3: Проверьте настройки Email Auth

1. В Supabase: **Authentication** → **Settings**
2. Найдите **Email Auth**
3. Убедитесь, что:
   - ✅ **Enable Email Signup** включен
   - ✅ **Confirm email** включен (если хотите требовать подтверждение)
   - Или отключите **Confirm email** для тестирования без подтверждения

### Шаг 4: Проверьте работу

1. Зарегистрируйте нового пользователя
2. Проверьте email - должна прийти ссылка
3. Перейдите по ссылке
4. Должно произойти перенаправление на `/auth/confirmation?verified=true`

## Альтернатива: Отключить подтверждение email (для тестирования)

Если хотите временно отключить подтверждение email:

1. В Supabase: **Authentication** → **Settings**
2. Найдите **Email Auth** → **Confirm email**
3. Отключите его (Disable)
4. Сохраните

Теперь пользователи смогут входить сразу после регистрации без подтверждения email.

## Важно!

- **Site URL** должен быть вашим продакшн URL (не localhost)
- **Redirect URLs** должны включать и продакшн, и localhost для разработки
- После изменения настроек может потребоваться несколько минут для применения

