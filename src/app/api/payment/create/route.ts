// src/app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { supabaseAdmin } from "@/lib/supabase";

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

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

    // ── Base Midtrans parameter ──────────────────────────────────────────────
    const base: any = {
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      customer_details: { first_name: username },
      item_details: [
        { id: slug ?? orderId, price: grossAmount, quantity: 1, name: productName },
      ],
      custom_field1: uuid,
      custom_field2: username,
      custom_field3: slug ?? "",
    };

    let parameter: any = { ...base };

    // ── Payment method mapping ───────────────────────────────────────────────
    if (paymentMethod === "gopay") {
      parameter.payment_type = "gopay";
      parameter.gopay = {
        enable_callback: true,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "qris") {
      parameter.payment_type = "qris";
      parameter.qris = { acquirer: "gopay" };
    } else if (paymentMethod === "shopeepay") {
      parameter.payment_type = "shopeepay";
      parameter.shopeepay = {
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "ovo") {
      parameter.payment_type = "e-money";
      parameter.e_money = {
        payment_provider: "ovo",
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "dana") {
      parameter.payment_type = "e-money";
      parameter.e_money = {
        payment_provider: "dana",
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "bca") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "bca" };
    } else if (paymentMethod === "bni") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "bni" };
    } else if (paymentMethod === "bri") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "bri" };
    } else if (paymentMethod === "mandiri") {
      parameter.payment_type = "echannel";
      parameter.echannel = { bill_info1: "Payment", bill_info2: "online" };
    } else if (paymentMethod === "permata") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "permata" };
    } else if (paymentMethod === "cimb") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "cimb" };
    } else if (paymentMethod === "indomaret") {
      parameter.payment_type = "cstore";
      parameter.cstore = { store: "indomaret" };
    } else if (paymentMethod === "alfamart") {
      parameter.payment_type = "cstore";
      parameter.cstore = { store: "alfamart" };
    } else if (paymentMethod === "akulaku") {
      parameter.payment_type = "akulaku";
    } else if (paymentMethod === "kredivo") {
      parameter.payment_type = "kredivo";
    } else {
      return NextResponse.json(
        { success: false, error: "Metode pembayaran tidak valid" },
        { status: 400 }
      );
    }

    // ── Charge ke Midtrans ───────────────────────────────────────────────────
    const transaction = await coreApi.charge(parameter);

    // ── Simpan transaksi ke Supabase ─────────────────────────────────────────
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
        midtrans_data: transaction,
      });

    if (dbError) {
      console.error("[PAYMENT_CREATE] Supabase insert error:", dbError.message);
    }

    return NextResponse.json({
      success: true,
      data: transaction,
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