import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import {
  checkRateLimit,
  recordLoginAttempt,
  createSession,
  getClientIP,
  SESSION_COOKIE,
  SESSION_DURATION_HOURS,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

const CF_TURNSTILE_SECRET = process.env.CF_TURNSTILE_SECRET_KEY;

async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  if (!CF_TURNSTILE_SECRET) return true;
  try {
    const form = new URLSearchParams();
    form.append("secret", CF_TURNSTILE_SECRET);
    form.append("response", token);
    form.append("remoteip", ip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      },
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Request tidak valid." },
        { status: 400 },
      );
    }

    const { username, password, captchaToken } = body;

    if (
      !username ||
      typeof username !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 },
      );
    }

    if (username.length > 50 || password.length > 256) {
      return NextResponse.json(
        { error: "Input tidak valid." },
        { status: 400 },
      );
    }

    const rateCheck = await checkRateLimit(ip);
    if (rateCheck.blocked) {
      return NextResponse.json({ error: rateCheck.reason }, { status: 429 });
    }

    if (!captchaToken || typeof captchaToken !== "string") {
      return NextResponse.json(
        { error: "Verifikasi CAPTCHA diperlukan." },
        { status: 400 },
      );
    }

    const captchaOk = await verifyCaptcha(captchaToken, ip);
    if (!captchaOk) {
      await recordLoginAttempt(ip, username, false);
      return NextResponse.json(
        { error: "Verifikasi CAPTCHA gagal. Coba lagi." },
        { status: 400 },
      );
    }

    const { data: admin } = await supabaseAdmin
      .from("admin_users")
      .select("id, username, email, role, password_hash, is_active")
      .eq("username", username.trim())
      .maybeSingle();

    const dummyHash =
      "$2b$12$dummyhashforpreventtimingattacksonusernameenumeration00";

    const hashToCompare = admin?.password_hash ?? dummyHash;

    console.log("=== LOGIN DEBUG ===");
    console.log("Username input:", username);
    console.log("Password input:", password);
    console.log("Admin ditemukan:", admin);
    console.log("Hash DB:", admin?.password_hash);
    console.log("Hash compare:", hashToCompare);

    const passwordOk = await bcrypt.compare(password, hashToCompare);

    console.log("Password cocok:", passwordOk);
    console.log("==================");

    if (!admin || !admin.is_active || !passwordOk) {
      await recordLoginAttempt(ip, username, false);
      const remaining = Math.max(0, (rateCheck.remainingAttempts ?? 5) - 1);
      return NextResponse.json(
        {
          error: "Username atau password salah.",
          remainingAttempts: remaining,
        },
        { status: 401 },
      );
    }

    await recordLoginAttempt(ip, username, true);
    const token = await createSession(
      admin.id,
      ip,
      req.headers.get("user-agent") || "",
    );

    // Set cookie via header langsung — lebih kompatibel di semua browser/HP
    const maxAge = SESSION_DURATION_HOURS * 60 * 60;
    const isProduction = process.env.NODE_ENV === "production";
    const cookieValue = [
      `${SESSION_COOKIE}=${token}`,
      `Max-Age=${maxAge}`,
      `Path=/`,
      `HttpOnly`,
      `SameSite=Lax`,
      isProduction ? `Secure` : "",
    ]
      .filter(Boolean)
      .join("; ");

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });

    response.headers.set("Set-Cookie", cookieValue);

    return response;
  } catch (err) {
    console.error("[Admin Login Error]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 },
    );
  }
}
