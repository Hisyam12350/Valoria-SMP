import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, validateSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const result = await validateSession(token);

  if (!result.valid) {
    // Hapus cookie yang tidak valid
    const response = NextResponse.json({ valid: false }, { status: 401 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.json({ valid: true, admin: result.admin });
}
