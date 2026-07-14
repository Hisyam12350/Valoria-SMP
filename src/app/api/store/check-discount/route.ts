import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { code, price } = await req.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Kode diskon wajib diisi" },
        { status: 400 }
      );
    }

    // Cari kode diskon
    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .select("*")
      .eq("kode", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Kode diskon tidak valid" },
        { status: 404 }
      );
    }

    // Cek kadaluarsa
    if (data.expired_at && new Date(data.expired_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Kode diskon sudah kadaluarsa" },
        { status: 400 }
      );
    }

    // Cek max uses
    if (data.max_uses > 0 && data.used_count >= data.max_uses) {
      return NextResponse.json(
        { success: false, error: "Kode diskon sudah habis digunakan" },
        { status: 400 }
      );
    }

    // Hitung diskon
    let discountAmount = 0;
    if (data.discount_type === "percent") {
      discountAmount = Math.floor((price * data.discount_value) / 100);
    } else if (data.discount_type === "fixed") {
      discountAmount = data.discount_value;
    }

    return NextResponse.json({
      success: true,
      discountAmount,
      discountType: data.discount_type,
      discountValue: data.discount_value,
    });

  } catch (error: any) {
    console.error("CHECK DISCOUNT ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}