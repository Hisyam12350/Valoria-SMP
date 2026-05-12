import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SESSION_COOKIE } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    await supabaseAdmin
      .from('admin_sessions')
      .delete()
      .eq('session_token', token);
  }

  const response = NextResponse.json({ success: true });

  response.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
  );

  return response;
}
