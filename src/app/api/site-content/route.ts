import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// Public endpoint - bisa diakses tanpa login
// Hanya baca (GET), tidak bisa tulis
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Key diperlukan.' }, { status: 400 });
  }

  try {
    const { data } = await supabaseAdmin
      .from('site_content')
      .select('content_value')
      .eq('content_key', key)
      .maybeSingle();

    return NextResponse.json(
      { value: data?.content_value ?? null },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch {
    return NextResponse.json({ value: null });
  }
}
