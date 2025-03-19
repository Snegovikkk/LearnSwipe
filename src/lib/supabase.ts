import { createClient } from '@supabase/supabase-js';

// Эти значения будут заменены на реальные после регистрации в Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
  content: any; // Содержит вопросы и ответы в формате JSON
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