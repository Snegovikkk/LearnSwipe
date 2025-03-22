import { NextResponse } from 'next/server';
import { generateTest } from '@/lib/deepseek';

export async function POST(request: Request) {
  try {
    const { text, title, selectedTopic, numberOfQuestions } = await request.json();

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

    // Проверка валидности количества вопросов
    const questionsCount = numberOfQuestions ? Math.min(Math.max(5, numberOfQuestions), 15) : 5;

    // Генерация теста с помощью DeepSeek
    // Модифицируем title, если есть selectedTopic
    const finalTitle = selectedTopic ? `${title} (${selectedTopic})` : title;
    
    // Генерируем вопросы
    const questions = await generateTest(text, finalTitle, selectedTopic, questionsCount);

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