import { NextRequest, NextResponse } from "next/server";
import { getMysqlConnection } from "@/lib/mysql";

interface PlayerRow {
  uuid: string;
  username: string;
  primary_group: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = body?.username;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username wajib diisi",
        },
        { status: 400 }
      );
    }

    const db = await getMysqlConnection();

    const [rows] = await db.execute(
      `
      SELECT uuid, username, primary_group
      FROM luckperms_players
      WHERE LOWER(username) = LOWER(?)
      LIMIT 1
      `,
      [username]
    );

    const players = rows as PlayerRow[];

    if (!players.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const player = players[0];

    return NextResponse.json({
      success: true,
      player: {
        uuid: player.uuid,
        username: player.username,
        primary_group: player.primary_group,
      },
    });
  } catch (error) {
    console.error("CHECK PLAYER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}