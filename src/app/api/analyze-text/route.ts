import { NextResponse } from 'next/server';
import { analyzeText } from '@/lib/deepseek';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // Проверка наличия текста
    if (!text) {
      return NextResponse.json(
        { error: 'Отсутствует текст для анализа' },
        { status: 400 }
      );
    }

    // Ограничение длины текста
    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Текст слишком длинный (максимум 10000 символов)' },
        { status: 400 }
      );
    }

    // Анализ текста с помощью DeepSeek
    const topics = await analyzeText(text);

    // Возвращаем результат
    return NextResponse.json({ 
      success: true, 
      data: {
        topics,
        analysisDate: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Ошибка анализа текста:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка при анализе текста', 
        message: error.message || 'Неизвестная ошибка' 
      },
      { status: 500 }
    );
  }
} 