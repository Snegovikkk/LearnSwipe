# Обновление переменных окружения на Vercel

## Важно! Обновите переменные окружения на Vercel

Файл `vercel.json` обновлен, но **вам нужно обновить переменные окружения через интерфейс Vercel**, так как переменные в `vercel.json` могут не применяться автоматически.

## Шаг 1: Обновите переменные на Vercel

1. Зайдите на [vercel.com](https://vercel.com) → ваш проект
2. Перейдите в **Settings** → **Environment Variables**
3. Найдите и обновите следующие переменные:

### NEXT_PUBLIC_SUPABASE_URL
**Значение:**
```
https://ngkmcwyekrigjnfsjsjr.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY
**Значение:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5na21jd3lla3JpZ2puZnNqc2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzc3OTUsImV4cCI6MjA3OTg1Mzc5NX0.mu99vd2fyhn_RUvN6hqE7D8jaqYXHRWeaelcs3Pet3w
```

4. **Сохраните изменения**

## Шаг 2: Пересоберите проект

1. После сохранения Vercel автоматически пересоберет проект
2. Или вручную: **Deployments** → последний деплой → **Redeploy**

## Шаг 3: Проверьте

1. Подождите 1-2 минуты после деплоя
2. Откройте `/debug-auth` на вашем сайте
3. Нажмите "Проверить подключение к Supabase"
4. Должно быть "✅ Подключение успешно"

## После этого попробуйте:

1. Зарегистрировать нового пользователя
2. Войти в аккаунт

Всё должно работать! ✅

