import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const coreApi = new midtransClient.CoreApi({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uuid, username, productName, slug, price, paymentMethod } = body;

    if (!uuid || !username || !productName || !price || !paymentMethod) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const orderId = `MC-${Date.now()}`;

    const parameter: any = {
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
    };

    // Sesuaikan parameter berdasarkan metode pembayaran
    if (paymentMethod === "gopay") {
      parameter.payment_type = "gopay";
      parameter.gopay = {
        enable_callback: true,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "qris") {
      parameter.payment_type = "qris";
      parameter.qris = { acquirer: "gopay" };
    } else if (paymentMethod === "ovo") {
      parameter.payment_type = "e-money";
      parameter.e_money = {
        payment_provider: "ovo",
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "dana") {
      parameter.payment_type = "e-money";
      parameter.e_money = {
        payment_provider: "dana",
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "shopeepay") {
      parameter.payment_type = "shopeepay";
      parameter.shopeepay = {
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      };
    } else if (paymentMethod === "bca") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "bca" };
    } else if (paymentMethod === "bni") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "bni" };
    } else if (paymentMethod === "bri") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "bri" };
    } else if (paymentMethod === "mandiri") {
      parameter.payment_type = "echannel";
      parameter.echannel = { bill_info1: "Payment", bill_info2: "online" };
    } else if (paymentMethod === "permata") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "permata" };
    } else if (paymentMethod === "cimb") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "cimb" };
    } else if (paymentMethod === "danamon") {
      parameter.payment_type = "bank_transfer";
      parameter.bank_transfer = { bank: "danamon" };
    } else if (paymentMethod === "indomaret") {
      parameter.payment_type = "cstore";
      parameter.cstore = { store: "indomaret" };
    } else if (paymentMethod === "alfamart") {
      parameter.payment_type = "cstore";
      parameter.cstore = { store: "alfamart" };
    } else if (paymentMethod === "akulaku") {
      parameter.payment_type = "akulaku";
    } else if (paymentMethod === "kredivo") {
      parameter.payment_type = "kredivo";
    } else if (paymentMethod === "credit_card") {
      parameter.payment_type = "credit_card";
      parameter.credit_card = {
        secure: true,
      };
    }

    const transaction = await coreApi.charge(parameter);

    return NextResponse.json({
      success: true,
      data: transaction,
      orderId,
      paymentMethod,
    });
  } catch (error: any) {
    console.error("MIDTRANS ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
