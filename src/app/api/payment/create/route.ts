// src/app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

// ── Helper: tentukan kategori dari slug ──────────────────────────────────────
function getCategoryFromSlug(slug: string): string {
  if (slug.startsWith("points")) return "points";
  if (slug.startsWith("money")) return "money";
  if (slug.startsWith("skill")) return "skills";
  return "rank";
}

// ── Verifikasi Cloudflare Turnstile ──────────────────────────────────────────
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.CF_TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    }
  );
  const data = await res.json();
  return data.success === true;
}

const TRIPAY_METHODS_MAP: Record<string, string> = {
  gopay: "QRIS", // Tripay processes GoPay via QRIS
  qris: "QRIS",
  shopeepay: "SHOPEEPAY",
  ovo: "OVO",
  dana: "DANA",
  bca: "BCAVA",
  bni: "BNIVA",
  bri: "BRIVA",
  mandiri: "MANDIRIVA",
  permata: "PERMATAVA",
  cimb: "CIMBVA",
  indomaret: "INDOMARET",
  alfamart: "ALFAMART",
  akulaku: "AKULAKU",
  kredivo: "KREDIVO",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      uuid,
      username,
      productName,
      slug,
      price,
      paymentMethod,
      turnstileToken,
    } = body;

    // ── Validasi input ───────────────────────────────────────────────────────
    if (!uuid || !username || !productName || !price || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // ── Verifikasi Turnstile ─────────────────────────────────────────────────
    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: "Verifikasi keamanan diperlukan" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      "127.0.0.1";

    const isTurnstileValid = await verifyTurnstile(turnstileToken, ip);
    if (!isTurnstileValid) {
      return NextResponse.json(
        { success: false, error: "Verifikasi keamanan gagal, silakan refresh halaman" },
        { status: 403 }
      );
    }

    const grossAmount = Number(price);
    if (isNaN(grossAmount) || grossAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Harga tidak valid" },
        { status: 400 }
      );
    }

    const orderId = `MC-${Date.now()}`;
    const category = getCategoryFromSlug(slug ?? "");

    // ── Map Payment Method ke Tripay Code ────────────────────────────────────
    const tripayMethod = TRIPAY_METHODS_MAP[paymentMethod.toLowerCase()];
    if (!tripayMethod) {
      return NextResponse.json(
        { success: false, error: "Metode pembayaran tidak didukung oleh gateway Tripay" },
        { status: 400 }
      );
    }

    // ── Get Tripay Config & Generate Signature ──────────────────────────────
    const merchantCode = process.env.TRIPAY_MERCHANT_CODE || "T0000";
    const privateKey = process.env.TRIPAY_PRIVATE_KEY || "placeholder_private_key";
    const tripayApiKey = process.env.TRIPAY_API_KEY || "placeholder_api_key";
    const isProduction = process.env.NEXT_PUBLIC_TRIPAY_IS_PRODUCTION === "true" || process.env.TRIPAY_IS_PRODUCTION === "true";

    const tripayBaseUrl = isProduction
      ? "https://tripay.co.id/api"
      : "https://tripay.co.id/api-sandbox";

    // Signature closed payment: merchant_code + merchant_ref + amount
    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(merchantCode + orderId + grossAmount)
      .digest("hex");

    // ── Send Request ke Tripay API ───────────────────────────────────────────
    const tripayPayload = {
      method: tripayMethod,
      merchant_ref: orderId,
      amount: grossAmount,
      customer_name: username,
      customer_email: `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@valoria.smp`,
      customer_phone: "081234567890",
      order_items: [
        {
          sku: slug || orderId,
          name: productName,
          price: grossAmount,
          quantity: 1,
        }
      ],
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/notification`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      expired_time: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 jam
      signature,
    };

    console.log("[TRIPAY] Request Payload:", JSON.stringify(tripayPayload));

    const tripayResponse = await fetch(`${tripayBaseUrl}/transaction/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tripayApiKey}`,
      },
      body: JSON.stringify(tripayPayload),
    });

    const tripayResult = await tripayResponse.json();

    if (!tripayResponse.ok || !tripayResult || !tripayResult.success || !tripayResult.data) {
      console.error("[TRIPAY] API error:", tripayResult);
      return NextResponse.json(
        { success: false, error: tripayResult?.message || "Gagal membuat transaksi dengan Tripay" },
        { status: 502 }
      );
    }

    const tripayData = tripayResult.data;

    // ── Simpan transaksi ke Supabase ─────────────────────────────────────────
    // Kolom `midtrans_data` dipertahankan untuk menyimpan respon Tripay agar tidak merusak skema database Supabase
    const { error: dbError } = await supabaseAdmin
      .from("transactions")
      .insert({
        order_id: orderId,
        uuid,
        username,
        product_name: productName,
        slug: slug ?? "",
        category,
        price: grossAmount,
        payment_method: paymentMethod,
        status: "pending",
        midtrans_data: tripayData,
      });

    if (dbError) {
      console.error("[PAYMENT_CREATE] Supabase insert error:", dbError.message);
    }

    return NextResponse.json({
      success: true,
      data: tripayData, // kirim respon Tripay ke client
      orderId,
      paymentMethod,
      category,
    });
  } catch (error: any) {
    console.error("[PAYMENT_CREATE] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
