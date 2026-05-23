import { NextResponse } from "next/server";
import snap from "@/lib/midtrans";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uuid, username, productName, slug, price } = body;

    const orderId = `MC-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(price),
      },
      customer_details: {
        first_name: username,
      },
      item_details: [
        {
          id: slug,
          price: Number(price),
          quantity: 1,
          name: productName,
        },
      ],
      custom_field1: uuid,
      custom_field2: username,
      custom_field3: slug,
      enabled_payments: ["credit_card"],
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
    });
  } catch (error: any) {
    console.error("SNAP ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}