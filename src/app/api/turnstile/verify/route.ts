import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.CF_TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });

  const data = await res.json();

  return NextResponse.json({ success: data.success });
}