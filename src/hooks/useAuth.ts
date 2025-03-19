import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Хук для работы с аутентификацией
export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверка текущей сессии при загрузке
  useEffect(() => {
    async function getUser() {
      setLoading(true);
      try {
        // Получаем текущую сессию
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error: any) {
        console.error("Ошибка при получении сессии:", error);
        setError(error.message || "Не удалось получить сессию пользователя");
      } finally {
        setLoading(false);
      }
    }

    // Инициализация и подписка на изменения аутентификации
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Регистрация пользователя
  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);
      setError(error.message || "Ошибка при регистрации");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Вход пользователя
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      setError(error.message || "Ошибка при входе");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Выход пользователя
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error: any) {
      console.error("Ошибка при выходе:", error);
      setError(error.message || "Ошибка при выходе");
    } finally {
      setLoading(false);
    }
  };

  // Сброс пароля
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Ошибка при сбросе пароля:", error);
      setError(error.message || "Ошибка при сбросе пароля");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Подтверждение электронной почты
  const verifyEmail = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      // Проверьте токен с помощью Supabase
      // Обратите внимание: в реальной реализации это может быть вызов к эндпоинту API
      // или специальная функция Supabase для верификации токена
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Ошибка при подтверждении почты:", error);
      setError(error.message || "Ошибка при подтверждении почты");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Обновление пароля
  const updatePassword = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Ошибка при обновлении пароля:", error);
      setError(error.message || "Ошибка при обновлении пароля");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Обновление профиля пользователя
  const updateProfile = async (userData: { name?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Ошибка при обновлении профиля:", error);
      setError(error.message || "Ошибка при обновлении профиля");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyEmail,
    updatePassword,
    updateProfile,
  };
} 