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
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (username) {
    // Cari pemain spesifik
    const { data, error } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("[GET PLAYER ERROR]", error);
      return NextResponse.json(
        { error: "Gagal mencari pemain." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  }

  // Dapatkan semua pemain
  const { data, error } = await supabaseAdmin
    .from("players")
    .select("*")
    .order("username");

  if (error) {
    console.error("[GET PLAYERS ERROR]", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar pemain." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { username, rank, points, money } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username wajib diisi." },
        { status: 400 }
      );
    }

    // Cek apakah pemain sudah ada
    const { data: existingPlayer } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    let result;

    if (existingPlayer) {
      // Update pemain yang ada
      const updates: any = {};
      if (rank !== undefined) updates.rank = rank;
      if (points !== undefined) updates.points = points;
      if (money !== undefined) updates.money = money;

      const { data, error } = await supabaseAdmin
        .from("players")
        .update(updates)
        .eq("id", existingPlayer.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Buat pemain baru
      const { data, error } = await supabaseAdmin
        .from("players")
        .insert({
          username,
          rank: rank || "Member",
          points: points || 0,
          money: money || 0,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    await logActivity(
      admin.id,
      admin.username,
      "update_player",
      { username: result.username },
      getClientIP(req)
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[UPDATE PLAYER ERROR]", err);
    return NextResponse.json(
      { error: "Gagal memperbarui data pemain." },
      { status: 500 }
    );
  }
}
