import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

async function timingSafeCompare(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  const aKey = await crypto.subtle.importKey('raw', aBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bKey = await crypto.subtle.importKey('raw', bBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const testData = encoder.encode('compare');
  const [aSig, bSig] = await Promise.all([
    crypto.subtle.sign('HMAC', aKey, testData),
    crypto.subtle.sign('HMAC', bKey, testData),
  ]);
  const aArr = new Uint8Array(aSig);
  const bArr = new Uint8Array(bSig);
  let diff = 0;
  for (let i = 0; i < aArr.length; i++) diff |= aArr[i] ^ bArr[i];
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const setupKey = req.headers.get('x-setup-key');
  const validKey = process.env.ADMIN_SETUP_KEY;

  if (!validKey || validKey.length < 8) {
    return NextResponse.json({ error: 'ADMIN_SETUP_KEY tidak dikonfigurasi.' }, { status: 503 });
  }

  const keyMatch = await timingSafeCompare(setupKey ?? '', validKey);
  if (!keyMatch) {
    return NextResponse.json({ error: 'Setup key salah.' }, { status: 403 });
  }

  const { count } = await supabaseAdmin
    .from('admin_users')
    .select('*', { count: 'exact', head: true });

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Setup sudah dilakukan sebelumnya.' }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Request tidak valid.' }, { status: 400 });

  const { username, email, password } = body;

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: 'Password minimal 12 karakter.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return NextResponse.json({ error: 'Username hanya huruf, angka, underscore (3-30 karakter).' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: 'superadmin',
    })
    .select('id, username, email, role')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Gagal membuat superadmin.' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Superadmin berhasil dibuat!',
    admin: { id: data.id, username: data.username, role: data.role },
  });
}
