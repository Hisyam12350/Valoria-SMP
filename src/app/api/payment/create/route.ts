import { NextResponse } from "next/server";
import snap from "@/lib/midtrans";
import { Rcon } from 'rcon-client';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { uuid, username, productName, slug, price } = body;

    if (!uuid || !username || !productName || !price) {
      return NextResponse.json(
        {
          error: "Data tidak lengkap",
        },
        {
          status: 400,
        },
      );
    }

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
    console.error("MIDTRANS ERROR:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
  
}

