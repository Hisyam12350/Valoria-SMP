// src/app/api/payment/status/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID diperlukan" },
        { status: 400 }
      );
    }

    const { data: transaction, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error || !transaction) {
      console.error("[PAYMENT_STATUS_API] Error fetching transaction:", error);
      return NextResponse.json(
        { success: false, error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Return safe/non-sensitive transaction details
    return NextResponse.json({
      success: true,
      transaction: {
        order_id: transaction.order_id,
        product_name: transaction.product_name,
        price: transaction.price,
        payment_method: transaction.payment_method,
        status: transaction.status,
        username: transaction.username,
        created_at: transaction.created_at,
      },
    });
  } catch (error: any) {
    console.error("[PAYMENT_STATUS_API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
