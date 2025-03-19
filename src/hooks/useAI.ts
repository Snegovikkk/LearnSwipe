import { useState } from 'react';
import { TestQuestion } from '@/lib/deepseek';

// Типы для результатов генерации теста
interface GenerateTestResult {
  title: string;
  questions: TestQuestion[];
  createdAt: string;
}

// Типы для результатов анализа текста
interface AnalyzeTextResult {
  topics: string[];
  analysisDate: string;
}

// Хук для работы с AI API
export default function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Функция для генерации теста
  const generateTest = async (
    text: string, 
    title: string, 
    numberOfQuestions: number = 5
  ): Promise<GenerateTestResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, title, numberOfQuestions }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при генерации теста');
      }
      
      const data = await response.json();
      return data.data as GenerateTestResult;
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при генерации теста');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для анализа текста
  const analyzeText = async (text: string): Promise<AnalyzeTextResult | null> => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };
  
  return {
    generateTest,
    analyzeText,
    isLoading,
    error,
  };
} 