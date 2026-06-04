// src/app/api/payment/notification/route.ts
import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { supabaseAdmin } from "@/lib/supabase";
import { givePoints, giveMoney, giveRank, parseFormattedNumber } from "@/lib/rcon";

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// ── Map status Midtrans ke status internal ───────────────────────────────────
function mapStatus(transactionStatus: string, fraudStatus?: string): string {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "success" : "failed";
  }

  const map: Record<string, string> = {
    settlement: "success",
    pending: "pending",
    deny: "failed",
    cancel: "failed",
    expire: "expired",
    failure: "failed",
  };

  return map[transactionStatus] ?? "pending";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[NOTIFICATION] Incoming:", body);

    // ── Verifikasi notifikasi via Midtrans SDK ───────────────────────────────
    let notification: any;
    try {
      notification = await coreApi.transaction.notification(body);
    } catch (err) {
      console.error("[NOTIFICATION] Invalid signature:", err);
      return NextResponse.json(
        { success: false, error: "Invalid notification signature" },
        { status: 401 }
      );
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      custom_field1: uuid,
      custom_field2: username,
      custom_field3: slug,
    } = notification;

    const status = mapStatus(transaction_status, fraud_status);

    console.log(`[NOTIFICATION] Order ${order_id} → ${status} (${transaction_status})`);

    // ── Cari transaksi di Supabase ───────────────────────────────────────────
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !transaction) {
      console.error("[NOTIFICATION] Transaction not found:", order_id);
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Hindari proses duplikat jika sudah success
    if (transaction.status === "success") {
      console.log(`[NOTIFICATION] Order ${order_id} sudah diproses sebelumnya, skip.`);
      return NextResponse.json({ success: true });
    }

    // ── Update status di Supabase ────────────────────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from("transactions")
      .update({ status, midtrans_data: notification })
      .eq("order_id", order_id);

    if (updateError) {
      console.error("[NOTIFICATION] Update error:", updateError.message);
      return NextResponse.json(
        { success: false, error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    // ── Jalankan aksi setelah pembayaran sukses ──────────────────────────────
    if (status === "success") {
      await handleSuccessfulPayment({
        orderId: order_id,
        uuid,
        username,
        slug,
        category: transaction.category,
        productName: transaction.product_name,
        price: transaction.price,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[NOTIFICATION] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

// ── Handler pembayaran sukses ────────────────────────────────────────────────
async function handleSuccessfulPayment({
  orderId,
  uuid,
  username,
  slug,
  category,
  productName,
  price,
}: {
  orderId: string;
  uuid: string;
  username: string;
  slug: string;
  category: string;
  productName: string;
  price: number;
}) {
  console.log(`[PAYMENT_SUCCESS] ${category} → ${username} | slug: ${slug}`);

  let rconResponse = "";
  let success = false;

  try {
    if (category === "points") {
      // Ambil data points dari Supabase berdasarkan slug
      // slug format: "points-starter", "points-basic", dll
      const rankSlug = slug.replace("points-", "");

      const { data: storeData } = await supabaseAdmin
        .from("site_content")
        .select("content_value")
        .eq("content_key", "points_store")
        .single();

      const pointsStore = Array.isArray(storeData?.content_value)
        ? storeData.content_value
        : JSON.parse(storeData?.content_value ?? "[]");

      const item = pointsStore.find((p: any) => p.slug === rankSlug);
      if (!item) throw new Error(`Points item tidak ditemukan untuk slug: ${rankSlug}`);

      const amount = parseFormattedNumber(item.points);
      rconResponse = await givePoints(username, amount);
      success = true;

      console.log(`[RCON] Give ${amount} points to ${username}: ${rconResponse}`);

    } else if (category === "money") {
      // Ambil data money dari Supabase berdasarkan slug
      // slug format: "money-starter", "money-basic", dll
      const rankSlug = slug.replace("money-", "");

      const { data: storeData } = await supabaseAdmin
        .from("site_content")
        .select("content_value")
        .eq("content_key", "money")
        .single();

      const moneyStore = Array.isArray(storeData?.content_value)
        ? storeData.content_value
        : JSON.parse(storeData?.content_value ?? "[]");

      const item = moneyStore.find((m: any) => m.slug === rankSlug);
      if (!item) throw new Error(`Money item tidak ditemukan untuk slug: ${rankSlug}`);

      // Parse "$100.000" → 100000
      const amount = parseFormattedNumber(item.money.replace("$", ""));
      rconResponse = await giveMoney(username, amount);
      success = true;

      console.log(`[RCON] Give ${amount} money to ${username}: ${rconResponse}`);

    } else if (category === "rank") {
      rconResponse = await giveRank(username, slug);
      success = true;

      console.log(`[RCON] Give rank ${slug} to ${username}: ${rconResponse}`);

    } else if (category === "skills") {
      // slug format: "skill-mining", "skill-farming", dll
      const skillName = slug.replace("skill-", "");
      rconResponse = await supabaseAdmin
        .from("site_content")
        .select("content_value")
        .then(() => ""); // placeholder — sesuaikan command skill Anda

      console.log(`[RCON] Give skill ${skillName} to ${username}`);
      success = true;
    }

    // ── Catat di payment_logs ──────────────────────────────────────────────
    await supabaseAdmin.from("payment_logs").insert({
      order_id: orderId,
      uuid,
      username,
      category,
      product_name: productName,
      price,
      slug,
      rcon_response: rconResponse,
      rcon_success: success,
      executed_at: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("[PAYMENT_SUCCESS] Handler error:", err.message);

    // Catat kegagalan RCON ke payment_logs
    await supabaseAdmin.from("payment_logs").insert({
      order_id: orderId,
      uuid,
      username,
      category,
      product_name: productName,
      price,
      slug,
      rcon_response: err.message,
      rcon_success: false,
      executed_at: new Date().toISOString(),
    });
  }
}