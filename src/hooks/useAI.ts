import { useState } from 'react';
import { TestQuestion } from '@/lib/deepseek';
import useTests from '@/hooks/useTests';

// Интерфейс данных для генерации теста
interface TestData {
  userId: string;
  title: string;
  topic: string;
  complexity: 'easy' | 'hard';
  questionsCount: number;
  text: string;
  description?: string;
}

// Типы для результатов генерации теста
interface GenerateTestResult {
  success: boolean;
  testId?: string;
  title?: string;
  questions?: TestQuestion[];
  createdAt?: string;
  error?: string;
}

// Типы для результатов анализа текста
interface AnalyzeTextResult {
  topics: string[];
  analysisDate: string;
}

// Хук для работы с AI API
export default function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createTest } = useTests();
  
  // Функция для генерации теста
  const generateTest = async (testData: TestData): Promise<GenerateTestResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // Шаг 1: Запрос к API для генерации вопросов
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testData.text,
          title: testData.title,
          selectedTopic: testData.topic,
          questionsCount: testData.questionsCount,
          complexity: testData.complexity,
          userId: testData.userId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при генерации теста');
      }
      
      const data = await response.json();
      
      if (!data || !data.success || !data.questions) {
        throw new Error('Не удалось получить вопросы для теста');
      }
      
      console.log("API вернул вопросы:", data.questions);
      
      // Шаг 2: Сохранение теста в базе данных
      const testResult = await createTest({
        userId: testData.userId,
        title: testData.title,
        description: testData.description || `Тест сложности: ${testData.complexity}`,
        questions: data.questions
      });
      
      if (!testResult) {
        throw new Error('Не удалось сохранить тест в базе данных');
      }
      
      console.log("Тест успешно сохранен в базе данных:", testResult);
      
      // Возвращаем успешный результат
      return {
        success: true,
        testId: testResult.id,
        title: testResult.title,
        questions: data.questions,
        createdAt: testResult.created_at
      };
    } catch (err: any) {
      console.error('Ошибка при генерации и сохранении теста:', err);
      setError(err.message || 'Произошла ошибка при генерации теста');
      return {
        success: false,
        error: err.message || 'Произошла ошибка при генерации теста'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для анализа текста
  const analyzeText = async (text: string): Promise<AnalyzeTextResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при анализе текста');
      }
      
      const data = await response.json();
      return data.data as AnalyzeTextResult;
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при анализе текста');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    generateTest,
    analyzeText,
    loading,
    error,
  };
} 