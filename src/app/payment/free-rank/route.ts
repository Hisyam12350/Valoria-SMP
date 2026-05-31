import { NextResponse } from "next/server";
import { Rcon } from "rcon-client";

export async function POST(req: Request) {
  try {
    const { username, slug } = await req.json();

    if (!username || !slug) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const rcon = new Rcon({
      host: process.env.RCON_HOST!,
      port: parseInt(process.env.RCON_PORT!),
      password: process.env.RCON_PASSWORD!,
    });

    await rcon.connect();
    await rcon.send(`lp user ${username} parent set ${slug}`);
    await rcon.end();

    console.log(`✅ Free rank ${slug} diberikan ke ${username}`);
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("FREE RANK ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}