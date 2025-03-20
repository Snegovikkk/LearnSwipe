import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { checkDeepSeekStatus } from '@/lib/deepseek';
import { auth } from '@/auth';

// Список email-адресов администраторов
const ADMIN_EMAILS = ['admin@test.com', 'admin@lume.com', 'dima@test.ru']; // Добавьте свою почту

export async function GET() {
  try {
    // Проверка авторизации и прав администратора
    const session = await getServerSession(auth);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Не авторизован' }, 
        { status: 401 }
      );
    }
    
    // Проверка прав администратора
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Нет прав для доступа к данной информации' }, 
        { status: 403 }
      );
    }
    
    // Проверка статуса DeepSeek API
    const status = await checkDeepSeekStatus();
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Ошибка при проверке статуса DeepSeek API:', error);
    
    return NextResponse.json(
      { 
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        lastChecked: new Date()
      }, 
      { status: 500 }
    );
  }
} 