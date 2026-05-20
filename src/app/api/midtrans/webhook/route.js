import { Rcon } from "rcon-client";
import crypto from "crypto";

export async function POST(req) {
  const body = await req.json();

  // Verifikasi signature Midtrans
  const signatureKey = crypto
    .createHash("sha512")
    .update(
      body.order_id +
        body.status_code +
        body.gross_amount +
        process.env.MIDTRANS_SERVER_KEY,
    )
    .digest("hex");

  if (signatureKey !== body.signature_key) {
    return Response.json({ status: "invalid_signature" }, { status: 403 });
  }

  const transactionStatus = body.transaction_status;
  const fraudStatus = body.fraud_status;

  // Ambil data dari custom_field
  const username = body.custom_field2;
  const rank = body.custom_field3; // ini slug rank, contoh: "vip", "mvp"

  if (
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept")
  ) {
    try {
      const rcon = new Rcon({
        host: process.env.RCON_HOST,
        port: parseInt(process.env.RCON_PORT),
        password: process.env.RCON_PASSWORD,
      });

      await rcon.connect();
      await rcon.send(`lp user ${username} parent set ${rank}`);
      await rcon.end();

      console.log(`✅ Rank ${rank} berhasil diberikan ke ${username}`);
      return Response.json({ status: "ok" });
    } catch (err) {
      console.error("❌ RCON Error:", err);
      return Response.json({ status: "rcon_error" }, { status: 500 });
    }
  }

  return Response.json({ status: "ignored" });
}
