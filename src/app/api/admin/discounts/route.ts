import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getAdminFromRequest,
  logActivity,
  getClientIP,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET DISCOUNTS ERROR]", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar diskon." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const {
      kode,
      discount_type,
      discount_value,
      max_uses,
      expired_at,
      is_active,
    } = body;

    if (!kode || !discount_type || !discount_value) {
      return NextResponse.json(
        { error: "Kode, tipe diskon, dan nilai diskon wajib diisi." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .insert({
        kode: kode.trim().toUpperCase(),
        discount_type,
        discount_value,
        max_uses: max_uses || 0,
        used_count: 0,
        expired_at: expired_at || null,
        is_active: is_active !== undefined ? is_active : true,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      admin.id,
      admin.username,
      "create_discount",
      { kode: data.kode },
      getClientIP(req),
    );

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[CREATE DISCOUNT ERROR]", err);
    return NextResponse.json(
      { error: "Gagal membuat diskon baru." },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID diskon wajib diisi." },
        { status: 400 },
      );
    }

    if (updates.kode) {
      updates.kode = updates.kode.trim().toUpperCase();
    }

    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      admin.id,
      admin.username,
      "update_discount",
      { id },
      getClientIP(req),
    );

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[UPDATE DISCOUNT ERROR]", err);
    return NextResponse.json(
      { error: "Gagal memperbarui diskon." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID diskon wajib diisi." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("discount_codes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await logActivity(
      admin.id,
      admin.username,
      "delete_discount",
      { id },
      getClientIP(req),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE DISCOUNT ERROR]", err);
    return NextResponse.json(
      { error: "Gagal menghapus diskon." },
      { status: 500 },
    );
  }
}
