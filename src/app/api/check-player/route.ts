import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

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
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    await connection.end();

    if (rows.length === 0) {
      return NextResponse.json({
        found: false,
      });
    }

    return NextResponse.json({
      found: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("CHECK USER ERROR:", error);

    return NextResponse.json(
      {
        found: false,
        error: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}