// src/app/api/payment/notification/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import {
  givePoints,
  giveMoney,
  giveRank,
  giveSkillLevel,
  parseFormattedNumber,
} from "@/lib/rcon";

// ── Map status Tripay ke status internal ─────────────────────────────────────
function mapStatus(tripayStatus: string): string {
  const map: Record<string, string> = {
    PAID: "success",
    UNPAID: "pending",
    EXPIRED: "expired",
    REFUND: "failed",
    FAILED: "failed",
  };
  return map[tripayStatus.toUpperCase()] ?? "pending";
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

    console.log("[NOTIFICATION] Raw callback received from Tripay");

    // ── Get header x-callback-signature dan x-callback-event ─────────────────
    const signatureHeader = headers.get("x-callback-signature") || "";
    const callbackEvent = headers.get("x-callback-event") || "";

    if (callbackEvent !== "payment_status") {
      console.log(`[NOTIFICATION] Ignored non-payment event: ${callbackEvent}`);
      return NextResponse.json({ success: true, message: "Event ignored" });
    }

    const privateKey = process.env.TRIPAY_PRIVATE_KEY || "placeholder_private_key";

    // ── Verifikasi HMAC SHA256 Signature ─────────────────────────────────────
    const calculatedSignature = crypto
      .createHmac("sha256", privateKey)
      .update(rawBody)
      .digest("hex");

    if (calculatedSignature !== signatureHeader) {
      console.error("[NOTIFICATION] Invalid signature verification. Computed:", calculatedSignature, "Header:", signatureHeader);
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse body setelah verifikasi signature sukses
    const body = JSON.parse(rawBody);
    const {
      merchant_ref: order_id,
      status: tripay_status,
      reference: tripay_reference,
    } = body;

    const status = mapStatus(tripay_status);

    console.log(`[NOTIFICATION] Tripay Order ${order_id} (Ref: ${tripay_reference}) → status mapped: ${status} (Tripay: ${tripay_status})`);

    // ── Cari transaksi di Supabase ───────────────────────────────────────────
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !transaction) {
      console.error("[NOTIFICATION] Transaction not found in database for order_id:", order_id);
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Hindari proses duplikat jika status transaksi di database sudah success
    if (transaction.status === "success") {
      console.log(`[NOTIFICATION] Order ${order_id} sudah diproses sukses sebelumnya, skip.`);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // ── Update status di Supabase ────────────────────────────────────────────
    // Kolom `midtrans_data` digunakan untuk menyimpan logs Callback Tripay demi menjaga kestabilan skema database
    const { error: updateError } = await supabaseAdmin
      .from("transactions")
      .update({ status, midtrans_data: body })
      .eq("order_id", order_id);

    if (updateError) {
      console.error("[NOTIFICATION] Update error in transactions:", updateError.message);
      return NextResponse.json(
        { success: false, error: "Failed to update transaction status" },
        { status: 500 }
      );
    }

    // ── Jalankan aksi setelah pembayaran sukses ──────────────────────────────
    if (status === "success") {
      await handleSuccessfulPayment({
        orderId: order_id,
        uuid: transaction.uuid,
        username: transaction.username,
        slug: transaction.slug,
        category: transaction.category,
        productName: transaction.product_name,
        price: transaction.price,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[NOTIFICATION] Error in webhook route:", error);
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
  let rconSuccess = false;

  try {
    if (category === "points") {
      const rankSlug = slug.replace("points-", "");
      let amount = 0;

      // 1. Ambil dari site_content jika ada
      try {
        const { data: storeData } = await supabaseAdmin
          .from("site_content")
          .select("content_value")
          .eq("content_key", "points_store")
          .maybeSingle();

        if (storeData?.content_value) {
          const pointsStore = Array.isArray(storeData.content_value)
            ? storeData.content_value
            : JSON.parse(typeof storeData.content_value === "string" ? storeData.content_value : "[]");

          const item = pointsStore.find((p: any) => p.slug === rankSlug || p.slug === slug);
          if (item && item.points !== undefined) {
            amount = typeof item.points === "number" ? item.points : parseFormattedNumber(String(item.points));
          }
        }
      } catch (e) {
        console.warn("[PAYMENT_SUCCESS] Failed to read points_store:", e);
      }

      // 2. Fallback: parse angka dari slug (misal: "points-2500" -> 2500)
      if (amount <= 0) {
        const matches = slug.match(/\d+/g);
        if (matches && matches.length > 0) {
          amount = parseInt(matches.join(""), 10);
        }
      }

      if (amount <= 0) {
        throw new Error(`Jumlah points tidak valid untuk slug: ${slug}`);
      }

      rconResponse = await givePoints(username, amount);
      rconSuccess = true;

      console.log(`[RCON] ✅ Give ${amount} points to ${username}`);

      // Try update points in Supabase players table if column exists
      try {
        const { data: playerPoints } = await supabaseAdmin.from("players").select("points").eq("username", username).maybeSingle();
        if (playerPoints && playerPoints.points !== undefined) {
          const currentPoints = playerPoints.points ?? 0;
          await supabaseAdmin.from("players").update({ points: currentPoints + amount }).eq("username", username);
        }
      } catch {}

    } else if (category === "money") {
      const rankSlug = slug.replace("money-", "");
      let amount = 0;

      // 1. Ambil dari site_content jika ada
      try {
        const { data: storeData } = await supabaseAdmin
          .from("site_content")
          .select("content_value")
          .eq("content_key", "money")
          .maybeSingle();

        if (storeData?.content_value) {
          const moneyStore = Array.isArray(storeData.content_value)
            ? storeData.content_value
            : JSON.parse(typeof storeData.content_value === "string" ? storeData.content_value : "[]");

          const item = moneyStore.find((m: any) => m.slug === rankSlug || m.slug === slug);
          if (item && item.money !== undefined) {
            amount = typeof item.money === "number" ? item.money : parseFormattedNumber(String(item.money).replace("$", ""));
          }
        }
      } catch (e) {
        console.warn("[PAYMENT_SUCCESS] Failed to read money store:", e);
      }

      // 2. Fallback: parse angka dari slug (misal: "money-80000" -> 80000)
      if (amount <= 0) {
        const matches = slug.match(/\d+/g);
        if (matches && matches.length > 0) {
          amount = parseInt(matches.join(""), 10);
        }
      }

      if (amount <= 0) {
        throw new Error(`Jumlah money tidak valid untuk slug: ${slug}`);
      }

      rconResponse = await giveMoney(username, amount);
      rconSuccess = true;

      console.log(`[RCON] ✅ Give ${amount} money to ${username}`);

      // Try update money in Supabase players table if column exists
      try {
        const { data: playerMoney } = await supabaseAdmin.from("players").select("money").eq("username", username).maybeSingle();
        if (playerMoney && playerMoney.money !== undefined) {
          const currentMoney = playerMoney.money ?? 0;
          await supabaseAdmin.from("players").update({ money: currentMoney + amount }).eq("username", username);
        }
      } catch {}

    } else if (category === "rank") {
      // slug langsung nama rank, misal: "starter", "noble", dll
      rconResponse = await giveRank(username, slug);
      rconSuccess = true;

      console.log(`[RCON] ✅ Give rank ${slug} to ${username}`);

      // Update rank in Supabase players table
      await supabaseAdmin.from("players").update({ rank: slug }).eq("username", username);

    } else if (category === "skills") {
      // slug format: "skill-mining-5" → skill: mining, level: 5
      const parts = slug.replace("skill-", "").split("-");
      const skillName = parts[0]; // misal: "mining"
      const levelAmount = parseInt(parts[1] ?? "1", 10); // misal: 5

      rconResponse = await giveSkillLevel(username, skillName, levelAmount);
      rconSuccess = true;

      console.log(`[RCON] ✅ Give ${levelAmount} level ${skillName} to ${username}`);
    }

    // ── Catat di payment_logs ────────────────────────────────────────────────
    await supabaseAdmin.from("payment_logs").insert({
      order_id: orderId,
      uuid,
      username,
      category,
      product_name: productName,
      price,
      slug,
      rcon_response: rconResponse,
      rcon_success: rconSuccess,
      executed_at: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("[PAYMENT_SUCCESS] Handler error:", err.message);

    // Catat kegagalan ke payment_logs
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
