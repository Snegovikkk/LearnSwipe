import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Это заглушка для API уведомлений на Vercel.',
    notification: {
      id: 'mock-id',
      user_id: 'mock-user',
      title: 'Тестовое уведомление',
      message: 'Это тестовое уведомление сгенерированное заглушкой.',
      type: 'system',
      read: false,
      created_at: new Date().toISOString()
    }
  });
} 