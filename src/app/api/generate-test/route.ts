import { NextRequest, NextResponse } from 'next/server';
import { generateTest } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из запроса
    const requestData = await request.json();
    const { text, title, userId, complexity, selectedTopic, questionsCount } = requestData;

    // Проверяем наличие обязательных параметров
    if (!text || !title) {
      return NextResponse.json({
        success: false,
        error: 'Отсутствуют обязательные параметры (текст и заголовок)'
      }, { status: 400 });
    }

    // Ограничиваем длину текста
    if (text.length > 10000) {
      return NextResponse.json({
        success: false,
        error: 'Текст слишком длинный (максимум 10000 символов)'
      }, { status: 400 });
    }

    // Определяем количество вопросов (между 5 и 15)
    const numberOfQuestions = typeof questionsCount === 'number' && questionsCount >= 5 && questionsCount <= 15 
      ? questionsCount 
      : 5;

    console.log(`Генерация теста: "${title}", сложность: ${complexity || 'стандартная'}, вопросов: ${numberOfQuestions}`);

    // Генерируем вопросы
    const questions = await generateTest(text, title, selectedTopic, numberOfQuestions);

    // Генерируем уникальный идентификатор для теста
    const testId = `test_${Date.now()}`;

    // Возвращаем результат с вопросами и идентификатором теста
    return NextResponse.json({
      success: true,
      testId: testId,
      title: title,
      questions: questions
    });
  } catch (error) {
    console.error('Ошибка при обработке запроса на генерацию теста:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Произошла неизвестная ошибка'
    }, { status: 500 });
  }
} 