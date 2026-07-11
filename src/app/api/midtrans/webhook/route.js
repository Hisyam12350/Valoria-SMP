import { Rcon } from "rcon-client";
import crypto from "crypto";

export async function POST(req) {
  const body = await req.json();

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

  const username = body.custom_field2;
  const slug = body.custom_field3;

  if (
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept")
  ) {
    try {
      const rcon = new Rcon({
        host: process.env.RCON_HOST,
        port: parseInt(process.env.RCON_PORT),
        password: process.env.RCON_PASSWORD,
        timeout: 5000,
      });

      await rcon.connect();

      if (slug.startsWith("points-")) {
        const pointsSlug = slug.replace("points-", "");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/store/get-points`,
        );
        const data = await res.json();
        const item = data.points?.find((p) => p.slug === pointsSlug);
        const pointsAmount = item?.points ?? "0";
        const amount = pointsAmount.replace(/[^0-9]/g, "");
        await rcon.send(`points give ${username} ${amount}`);
        console.log(`✅ Points ${amount} diberikan ke ${username}`);
      } else if (slug.startsWith("money-")) {
        const moneySlug = slug.replace("money-", "");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/store/get-money`,
        );
        const data = await res.json();
        const item = data.money?.find((m) => m.slug === moneySlug);
        const moneyAmount = item?.money ?? "$0";
        const amount = moneyAmount.replace(/[^0-9]/g, "");
        await rcon.send(`eco give ${username} ${amount}`);
        console.log(`✅ Money ${amount} diberikan ke ${username}`);
      } else if (slug.startsWith("skill-")) {
        console.log(
          `⚠️ Skill purchase for ${username} - manual processing needed`,
        );
      } else {
        await rcon.send(`lp user ${username} parent set ${slug}`);
        console.log(`✅ Rank ${slug} diberikan ke ${username}`);
      }

      await rcon.end();
      return Response.json({ status: "ok" });
    } catch (err) {
      console.error("❌ RCON Error:", err);
      return Response.json({ status: "rcon_error" }, { status: 500 });
    }
  }

  return Response.json({ status: "ignored" });
}
