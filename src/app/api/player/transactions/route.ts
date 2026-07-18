import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username player diperlukan" },
        { status: 400 }
      );
    }

    // Ambil data transaksi dari Supabase berdasarkan username
    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("username", username)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[PLAYER_TRANSACTIONS_API] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Gagal mengambil riwayat transaksi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
    });
  } catch (error: any) {
    console.error("[PLAYER_TRANSACTIONS_API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
