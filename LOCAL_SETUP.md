# Настройка для локальной разработки

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ngkmcwyekrigjnfsjsjr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_QCXPjWCA6GnYpJvZkJ3GNw_0iZ9zxaq
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Ht8ddCLKJ1zjGUoxeDlh4g_VSxxJZJM

# DeepSeek API (опционально)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Notifications API (опционально)
NOTIFICATIONS_API_KEY=your_notifications_api_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Lume
NEXT_PUBLIC_API_URL=/api
```

**Важно:** Файл `.env.local` уже в `.gitignore`, поэтому он не будет закоммичен в git.

