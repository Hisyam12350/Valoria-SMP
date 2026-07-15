import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { code, price, username, apply } = await req.json();

    console.log("[CHECK DISCOUNT] Received request:", {
      code,
      price,
      username,
      apply,
    });

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Kode diskon wajib diisi" },
        { status: 400 },
      );
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json(
        { success: false, error: "Harga produk tidak valid" },
        { status: 400 },
      );
    }

    // Cari kode diskon
    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .select("*")
      .eq("kode", code.trim().toUpperCase())
      .single();

    console.log("[CHECK DISCOUNT] Discount code data:", data, "error:", error);

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Kode diskon tidak valid" },
        { status: 404 },
      );
    }

    if (!data.is_active) {
      return NextResponse.json(
        { success: false, error: "Kode diskon tidak aktif" },
        { status: 400 },
      );
    }

    // Cek kadaluarsa
    if (data.expired_at && new Date(data.expired_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Kode diskon sudah kadaluarsa" },
        { status: 400 },
      );
    }

    // Cek max uses (handle jika used_count null/undefined)
    const currentUsedCount = data.used_count || 0;
    if (data.max_uses > 0 && currentUsedCount >= data.max_uses) {
      return NextResponse.json(
        { success: false, error: "Kode diskon sudah habis digunakan" },
        { status: 400 },
      );
    }

    // Cek penggunaan per user jika username diberikan
    if (username) {
      const { data: usageData } = await supabaseAdmin
        .from("discount_usages")
        .select("*")
        .eq("discount_id", data.id)
        .eq("username", username)
        .maybeSingle();

      if (usageData) {
        return NextResponse.json(
          { success: false, error: "Anda sudah menggunakan kode diskon ini" },
          { status: 400 },
        );
      }
    }

    // Hitung diskon
    let discountAmount = 0;
    if (data.discount_type === "percent") {
      discountAmount = Math.floor((Number(price) * data.discount_value) / 100);
    } else if (data.discount_type === "fixed") {
      discountAmount = data.discount_value;
    }

    // Jangan biarkan diskon melebihi harga
    discountAmount = Math.min(discountAmount, Number(price));

    // Jika apply true dan username ada, catat penggunaan dan increment used_count
    if (apply && username) {
      // Mulai transaksi
      const { error: updateError } = await supabaseAdmin
        .from("discount_codes")
        .update({ used_count: currentUsedCount + 1 })
        .eq("id", data.id);

      if (updateError) throw updateError;

      // Catat penggunaan
      const { error: usageError } = await supabaseAdmin
        .from("discount_usages")
        .insert({
          discount_id: data.id,
          username: username,
        });

      if (usageError) {
        // Rollback jika gagal
        await supabaseAdmin
          .from("discount_codes")
          .update({ used_count: currentUsedCount })
          .eq("id", data.id);
        throw usageError;
      }
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
      { success: false, error: error.message || "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
