import { NextResponse } from 'next/server';
import { generateTest } from '@/lib/deepseek';

export async function POST(request: Request) {
  try {
    const { text, title, numberOfQuestions } = await request.json();

    // Проверка наличия обязательных параметров
    if (!text || !title) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры (text или title)' },
        { status: 400 }
      );
    }

    // Ограничение длины текста (если текст слишком длинный, это может привести к ошибкам API)
    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Текст слишком длинный (максимум 10000 символов)' },
        { status: 400 }
      );
    }

    // Генерация теста с помощью DeepSeek
    const questions = await generateTest(text, title, numberOfQuestions || 5);

    // Возвращаем результат
    return NextResponse.json({ 
      success: true, 
      data: {
        title,
        questions,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Ошибка генерации теста:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка при генерации теста', 
        message: error.message || 'Неизвестная ошибка' 
      },
      { status: 500 }
    );
  }
} 