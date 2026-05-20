import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json(
        { success: false, message: "UUID wajib diisi" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [rows]: any = await connection.execute(
      `
      SELECT uuid, username
      FROM luckperms_players
      WHERE uuid = ?
      LIMIT 1
      `,
      [uuid]
    );

    await connection.end();

    if (!rows.length) {
      return NextResponse.json({
        success: false,
        found: false,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      user: rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}