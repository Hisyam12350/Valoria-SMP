import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest, logActivity, getClientIP } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const currentAdmin = await getAdminFromRequest(req);

  if (!currentAdmin) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }
  if (currentAdmin.role !== 'superadmin') {
    return NextResponse.json(
      { error: 'Hanya superadmin yang bisa membuat akun admin baru.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Request tidak valid.' }, { status: 400 });
    }

    const { username, email, password, role } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { error: 'Username hanya boleh huruf, angka, underscore (3-30 karakter).' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    if (password.length < 8 || password.length > 256) {
      return NextResponse.json(
        { error: 'Password harus 8-256 karakter.' },
        { status: 400 }
      );
    }

    // Cek duplikasi
    const { data: existing } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .or(
        `username.eq.${username.toLowerCase()},email.eq.${email.toLowerCase()}`
      )
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Username atau email sudah digunakan.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const safeRole = role === 'superadmin' ? 'superadmin' : 'admin';

    const { data: newAdmin, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: safeRole,
        created_by: currentAdmin.id,
      })
      .select('id, username, email, role, created_at')
      .single();

    if (error) throw error;

    await logActivity(
      currentAdmin.id,
      currentAdmin.username,
      'create_admin',
      { newUsername: username, role: safeRole },
      ip
    );

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch (err) {
    console.error('[Create Admin Error]', err);
    return NextResponse.json({ error: 'Gagal membuat admin.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const currentAdmin = await getAdminFromRequest(req);
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }
  if (currentAdmin.role !== 'superadmin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const { data: admins } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, email, role, is_active, created_at, last_login')
    .order('created_at', { ascending: false });

  return NextResponse.json({ admins: admins ?? [] });
}

export async function DELETE(req: NextRequest) {
  const ip = getClientIP(req);
  const currentAdmin = await getAdminFromRequest(req);

  if (!currentAdmin) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }
  if (currentAdmin.role !== 'superadmin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const adminId = searchParams.get('id');

  if (!adminId) {
    return NextResponse.json({ error: 'ID admin diperlukan.' }, { status: 400 });
  }
  if (adminId === currentAdmin.id) {
    return NextResponse.json(
      { error: 'Tidak bisa menonaktifkan akun sendiri.' },
      { status: 400 }
    );
  }

  // Validasi UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(adminId)) {
    return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
  }

  await supabaseAdmin
    .from('admin_users')
    .update({ is_active: false })
    .eq('id', adminId);

  // Hapus semua sesi aktif admin yang dinonaktifkan
  await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .eq('admin_id', adminId);

  await logActivity(
    currentAdmin.id,
    currentAdmin.username,
    'deactivate_admin',
    { adminId },
    ip
  );

  return NextResponse.json({ success: true });
}
