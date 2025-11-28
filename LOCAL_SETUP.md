# Настройка для локальной разработки

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ngkmcwyekrigjnfsjsjr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5na21jd3lla3JpZ2puZnNqc2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzc3OTUsImV4cCI6MjA3OTg1Mzc5NX0.mu99vd2fyhn_RUvN6hqE7D8jaqYXHRWeaelcs3Pet3w
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# DeepSeek API (опционально)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Notifications API (опционально)
NOTIFICATIONS_API_KEY=your_notifications_api_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Lume
NEXT_PUBLIC_API_URL=/api
```

**Важно:** Файл `.env.local` уже в `.gitignore`, поэтому он не будет закоммичен в git.

