import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') || 'email';
  const next = requestUrl.searchParams.get('next') || '/auth/confirmation';

  if (token_hash) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error) {
      // Успешное подтверждение - перенаправляем на страницу подтверждения
      return NextResponse.redirect(new URL(`${next}?verified=true`, requestUrl.origin));
    }
  }

  // Если есть ошибка или нет токена - перенаправляем на страницу подтверждения с ошибкой
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  return NextResponse.redirect(
    new URL(
      `/auth/confirmation?error=${error || 'unknown'}&error_description=${encodeURIComponent(errorDescription || 'Не удалось подтвердить email')}`,
      requestUrl.origin
    )
  );
}

