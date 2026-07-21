import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username || !username.trim()) {
      return NextResponse.json(
        {
          found: false,
          error: "Username wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const trimmedUsername = username.trim();

    // 1. Cek di MariaDB / LuckPerms
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [rows]: any = await connection.execute(
      `
      SELECT uuid, username, primary_group
      FROM luckperms_players
      WHERE username = ?
      LIMIT 1
      `,
      [trimmedUsername]
    );

    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json({
        found: false,
        error: "Player tidak ditemukan di server Minecraft"
      });
    }

    const mcPlayer = rows[0];

    // Ambil semua node grup yang aktif untuk player ini dari luckperms_user_permissions
    const [permissionRows]: any = await connection.execute(
      `
      SELECT permission
      FROM luckperms_user_permissions
      WHERE uuid = ? AND permission LIKE 'group.%'
      `,
      [mcPlayer.uuid]
    );

    await connection.end();

    // Resolusi pangkat tertinggi dari user_permissions
    const RANK_HIERARCHY = ['sovereign', 'ethereal', 'crystall', 'crystal', 'astra', 'valiant', 'street', 'default'];
    let resolvedRank = (mcPlayer.primary_group || 'default').toLowerCase();

    const userGroups = permissionRows.map((p: any) => p.permission.substring(6).toLowerCase());
    for (const rank of RANK_HIERARCHY) {
      if (userGroups.includes(rank) || (mcPlayer.primary_group && mcPlayer.primary_group.toLowerCase() === rank)) {
        resolvedRank = rank === 'crystal' ? 'crystall' : rank;
        break;
      }
    }

    // Helper untuk membandingkan hirarki rank (makin kecil indeks = makin tinggi rank)
    const getRankIndex = (r: string) => {
      const normalized = (r || 'default').toLowerCase() === 'crystal' ? 'crystall' : (r || 'default').toLowerCase();
      const idx = RANK_HIERARCHY.indexOf(normalized);
      return idx === -1 ? 999 : idx;
    };

    // 2. Hubungkan & Singkronisasikan ke Supabase tabel 'players'
    let { data: supabasePlayer, error: sbError } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("username", mcPlayer.username)
      .maybeSingle();

    if (sbError) {
      console.error("Supabase fetch player error:", sbError);
    }

    // Tentukan rank terbaik (ambil yang lebih tinggi antara MariaDB dan Supabase)
    let finalRank = resolvedRank;
    if (supabasePlayer && supabasePlayer.rank) {
      if (getRankIndex(supabasePlayer.rank) < getRankIndex(resolvedRank)) {
        finalRank = supabasePlayer.rank.toLowerCase() === 'crystal' ? 'crystall' : supabasePlayer.rank.toLowerCase();
      }
    }

    // Jika belum ada di tabel players Supabase, buat baru otomatis
    if (!supabasePlayer) {
      const { data: newPlayer, error: insertError } = await supabaseAdmin
        .from("players")
        .insert({
          username: mcPlayer.username,
          rank: finalRank,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert player error:", insertError);
      } else {
        supabasePlayer = newPlayer;
      }
    } else if (supabasePlayer.rank !== finalRank) {
      // Update di Supabase dengan rank tertinggi yang valid
      const { data: updatedPlayer, error: updateError } = await supabaseAdmin
        .from("players")
        .update({ rank: finalRank })
        .eq("username", mcPlayer.username)
        .select()
        .single();

      if (updateError) {
        console.error("Supabase update player rank error:", updateError);
      } else {
        supabasePlayer = updatedPlayer;
      }
    }

    return NextResponse.json({
      found: true,
      user: {
        username: mcPlayer.username,
        uuid: mcPlayer.uuid,
      },
      player: supabasePlayer || {
        username: mcPlayer.username,
        rank: resolvedRank,
      }
    });
  } catch (error: any) {
    console.error("CHECK USER ERROR:", error);

    return NextResponse.json(
      {
        found: false,
        error: error.message ?? "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}