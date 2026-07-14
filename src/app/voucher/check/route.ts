import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
);

export async function POST(req: Request) {
  try {
    const { code, price } = await req.json();

    if (!code || !price) {
      return NextResponse.json({ error: "Kode dan harga wajib diisi" }, { status: 400 });
    }

    const { data: voucher, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("kode", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !voucher) {
      return NextResponse.json({ valid: false, message: "Kode voucher tidak ditemukan" });
    }

    // Cek expired
    if (voucher.expired_at && new Date(voucher.expired_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "Voucher sudah kadaluarsa" });
    }

    // Cek max uses
    if (voucher.max_uses !== null && voucher.used_count >= voucher.max_uses) {
      return NextResponse.json({ valid: false, message: "Voucher sudah habis digunakan" });
    }

    // Hitung diskon
    const originalPrice = Number(price);
    let discountAmount = 0;

    if (voucher.discount_type === "percent") {
      discountAmount = Math.floor(originalPrice * (voucher.discount_value / 100));
    } else if (voucher.discount_type === "fixed") {
      discountAmount = Math.min(voucher.discount_value, originalPrice);
    }

    const finalPrice = Math.max(originalPrice - discountAmount, 0);

    return NextResponse.json({
      valid: true,
      message: `Voucher berhasil! Diskon ${voucher.discount_type === "percent" ? `${voucher.discount_value}%` : `Rp ${voucher.discount_value.toLocaleString("id-ID")}`}`,
      discountType: voucher.discount_type,
      discountValue: voucher.discount_value,
      discountAmount,
      finalPrice,
      voucherId: voucher.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}