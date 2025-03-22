import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { Notification, NotificationType } from '@/lib/supabase';

// Функция для проверки API-ключа
const checkApiKey = (authHeader: string | null) => {
  const apiKey = process.env.NOTIFICATIONS_API_KEY;
  if (!apiKey) {
    return false;
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === apiKey;
};

// Функция для проверки настроек пользователя
const shouldSendNotification = async (userId: string, type: NotificationType): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // Если настройки не найдены, возвращаем true по умолчанию
      if (error.code === 'PGRST116') {
        return true;
      }
      throw error;
    }
    
    // Проверяем настройки для конкретного типа уведомлений
    const typeField = `${type}_notifications`;
    return data[typeField] === true;
  } catch (error) {
    console.error("Ошибка при проверке настроек уведомлений:", error);
    // По умолчанию разрешаем отправку уведомлений в случае ошибки
    return true;
  }
};

export async function POST(request: NextRequest) {
  // Проверяем API-ключ
  const authHeader = request.headers.get('authorization');
  if (!checkApiKey(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // Проверяем наличие обязательных полей
    const { userId, title, message, type } = body;
    
    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля: userId, title, message, type' }, 
        { status: 400 }
      );
    }
    
    // Проверяем, правильный ли тип уведомления
    const validTypes: NotificationType[] = ['test_result', 'new_test', 'system', 'reminder'];
    if (!validTypes.includes(type as NotificationType)) {
      return NextResponse.json(
        { error: 'Недопустимый тип уведомления. Допустимые типы: test_result, new_test, system, reminder' }, 
        { status: 400 }
      );
    }
    
    // Проверяем настройки пользователя для этого типа уведомлений
    const canSend = await shouldSendNotification(userId, type as NotificationType);
    if (!canSend) {
      return NextResponse.json(
        { message: 'Пользователь отключил уведомления данного типа' }, 
        { status: 200 }
      );
    }
    
    // Создаем уведомление
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        message,
        type,
        read: false,
        link: body.link || null,
        data: body.data ? JSON.stringify(body.data) : null
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // TODO: Если необходимо, здесь можно добавить интеграцию с внешними
    // сервисами для отправки push-уведомлений или email
    
    return NextResponse.json({
      success: true,
      notification: data
    });
    
  } catch (error: any) {
    console.error('Ошибка при отправке уведомления:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка сервера' }, 
      { status: 500 }
    );
  }
} 