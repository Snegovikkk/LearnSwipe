import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  
  let dbStatus = 'not_checked';
  
  // Проверяем подключение к базе данных, если настроена
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('tests').select('id').limit(1);
      
      if (error) {
        dbStatus = 'error';
      } else {
        dbStatus = 'connected';
      }
    } catch (error) {
      dbStatus = 'error';
    }
  }
  
  // Информация о состоянии приложения
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      configured: isSupabaseConfigured,
      status: dbStatus
    },
    version: '1.0.0',
    uptime: process.uptime()
  };
  
  return NextResponse.json(healthInfo);
} 