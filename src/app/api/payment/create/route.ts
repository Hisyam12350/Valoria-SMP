import { NextResponse } from "next/server";
import snap from "@/lib/midtrans";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uuid, username, productName, slug, price } = body;

    if (!uuid || !username || !productName || !price) {
      return NextResponse.json(
        { error: "Data tidak lengkap: uuid, username, productName, dan price wajib diisi" },
        { status: 400 },
      );
    }

    const orderId = `MC-${Date.now()}`;
    const grossAmount = Number(price);

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: username,
      },
      item_details: [
        {
          id: slug ?? orderId,
          price: grossAmount,
          quantity: 1,
          name: productName,
        },
      ],
      // Simpan data player untuk webhook RCON
      custom_field1: uuid,
      custom_field2: username,
      custom_field3: slug ?? "",
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    });
  } catch (error: any) {
    console.error("[MIDTRANS] Create transaction error:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
