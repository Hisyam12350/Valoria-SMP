import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest, logActivity, getClientIP } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// Daftar content_key yang diizinkan — mencegah arbitrary key injection
const ALLOWED_KEYS = new Set([
  'server_ip', 'bedrock_port', 'discord_link', 'whatsapp_group',
  'vote_link', 'server_logo', 'background_image', 'server_features',
  'staff_members', 'server_rules', 'teams', 'gallery_photos',
  'social_links', 'tiktok_link', 'youtube_link', 'tutorials',
  'achievements', 'whatsapp_number', 'ranks', 'store_skills',
]);

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (key) {
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: 'Key tidak diizinkan.' }, { status: 400 });
    }
    const { data } = await supabaseAdmin
      .from('site_content')
      .select('*')
      .eq('content_key', key)
      .maybeSingle();
    return NextResponse.json({ data });
  }

  const { data } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .order('content_key');

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Request tidak valid.' }, { status: 400 });
    }

    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Key wajib diisi.' }, { status: 400 });
    }

    // Whitelist key yang diperbolehkan
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: 'Key tidak diizinkan.' }, { status: 400 });
    }

    // Batasi ukuran value (max 100KB)
    const valueStr = JSON.stringify(value);
    if (valueStr.length > 100_000) {
      return NextResponse.json({ error: 'Data terlalu besar.' }, { status: 413 });
    }

    const { data, error } = await supabaseAdmin
      .from('site_content')
      .upsert(
        {
          content_key: key,
          content_value: value,
          updated_by: admin.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'content_key' }
      )
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      admin.id,
      admin.username,
      'update_content',
      { key },
      getClientIP(req)
    );

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[Content Update Error]', err);
    return NextResponse.json({ error: 'Gagal memperbarui konten.' }, { status: 500 });
  }
}
