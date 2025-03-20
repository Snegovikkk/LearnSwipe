import { useState } from 'react';
import supabase from '@/lib/supabase';
import { Test, TestResult } from '@/lib/supabase';
import { TestQuestion } from '@/lib/deepseek';

// Интерфейс для создания нового теста
interface CreateTestProps {
  userId: string;
  title: string;
  questions: TestQuestion[];
  description?: string;
}

// Интерфейс для сохранения результатов теста
interface SaveTestResultProps {
  userId: string;
  testId: string;
  score: number;
  answers: Record<string, string>; // questionId: answerId
}

// Хук для работы с тестами
export default function useTests() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение всех тестов из базы данных
  const getTests = async (): Promise<Test[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Ошибка при получении тестов:", error);
      setError(error.message || "Не удалось получить тесты");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Получение тестов пользователя
  const getUserTests = async (userId: string): Promise<Test[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Ошибка SQL:", error);
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Ошибка при получении тестов пользователя:", error);
      setError(error.message || "Не удалось получить тесты пользователя");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Получение конкретного теста по ID
  const getTestById = async (testId: string): Promise<Test | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Ошибка при получении теста:", error);
      setError(error.message || "Не удалось получить тест");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Создание нового теста
  const createTest = async ({ userId, title, questions, description }: CreateTestProps): Promise<Test | null> => {
    setLoading(true);
    setError(null);
    try {
      // Преобразуем questions в строку JSON для сохранения в поле content
      const questionsJson = JSON.stringify(questions);
      
      const { data, error } = await supabase
        .from('tests')
        .insert([{
          user_id: userId,
          title: title,
          description: description || '',
          content: questionsJson // Сохраняем как JSON строку
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Ошибка при создании теста:", error);
      setError(error.message || "Не удалось создать тест");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Удаление теста
  const deleteTest = async (testId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Сначала удаляем связанные результаты
      const { error: resultsError } = await supabase
        .from('test_results')
        .delete()
        .eq('test_id', testId);
      
      if (resultsError) throw resultsError;

      // Затем удаляем сам тест
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Ошибка при удалении теста:", error);
      setError(error.message || "Не удалось удалить тест");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Сохранение результата теста
  const saveTestResult = async ({ userId, testId, score, answers }: SaveTestResultProps): Promise<TestResult | null> => {
    setLoading(true);
    setError(null);
    try {
      // Проверяем формат ответов и преобразуем в строку, если уже не строка
      const answersJson = typeof answers === 'string' 
        ? answers 
        : JSON.stringify(answers);
        
      const { data, error } = await supabase
        .from('test_results')
        .insert([{
          user_id: userId,
          test_id: testId,
          score: score,
          answers: answersJson
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Ошибка при сохранении результата:", error);
      setError(error.message || "Не удалось сохранить результат теста");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Получение истории результатов пользователя
  const getUserResults = async (userId: string): Promise<TestResult[]> => {
    setLoading(true);
    setError(null);
    try {
      // Получаем результаты тестов пользователя
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Ошибка SQL:", error);
        throw error;
      }

      // Если в базе еще нет результатов, создаем демо-результат
      if (!data || data.length === 0) {
        console.log("Нет результатов тестов, возвращаем пустой массив");
        return [];
      }
      
      return data;
    } catch (error: any) {
      console.error("Ошибка при получении результатов пользователя:", error);
      setError(error.message || "Не удалось получить результаты пользователя");
      
      // В случае ошибки возвращаем пустой массив
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Получение результатов пользователя по конкретному тесту
  const getUserResultsByTestId = async (userId: string, testId: string): Promise<TestResult[]> => {
    setLoading(true);
    setError(null);
    try {
      // Получаем результаты пользователя по конкретному тесту
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .eq('test_id', testId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Ошибка SQL:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("Нет результатов по данному тесту, возвращаем пустой массив");
        return [];
      }
      
      return data;
    } catch (error: any) {
      console.error("Ошибка при получении результатов по тесту:", error);
      setError(error.message || "Не удалось получить результаты по тесту");
      
      // В случае ошибки возвращаем пустой массив
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getTests,
    getUserTests,
    getTestById,
    createTest,
    deleteTest,
    saveTestResult,
    getUserResults,
    getUserResultsByTestId
  };
} 