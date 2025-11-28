import { createClient } from '@supabase/supabase-js';

// Эти значения будут заменены на реальные после регистрации в Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Проверяем, что переменные окружения настроены
if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Supabase не настроен! Проверьте переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Создаем клиент Supabase для взаимодействия с API
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;

// Типы для таблиц в базе данных
export type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
};

export type Test = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content: any; // Содержит вопросы и ответы в формате JSON
  image_url?: string;
  created_at: string;
};

export type TestResult = {
  id: string;
  user_id: string;
  test_id: string;
  score: number;
  answers: any; // Ответы пользователя в формате JSON
  created_at: string;
};

export type Question = {
  id: string;
  test_id: string;
  text: string;
  created_at: string;
};

export type Answer = {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  created_at: string;
};

export type NotificationType = 'test_result' | 'new_test' | 'system' | 'reminder';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  data?: any; // Дополнительные данные в формате JSON
  created_at: string;
};

export type NotificationSettings = {
  id: string;
  user_id: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  test_result_notifications: boolean;
  new_test_notifications: boolean;
  system_notifications: boolean;
  reminder_notifications: boolean;
  created_at: string;
  updated_at: string;
}; 