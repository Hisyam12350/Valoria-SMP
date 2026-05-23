"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function InstructionContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");
  const vaNumber = searchParams.get("vaNumber");
  const paymentCode = searchParams.get("paymentCode");

  const methodLabels: Record<string, string> = {
    bca: "BCA Virtual Account",
    bni: "BNI Virtual Account",
    bri: "BRI Virtual Account",
    mandiri: "Mandiri Bill Payment",
    permata: "Permata Virtual Account",
    cimb: "CIMB Virtual Account",
    danamon: "Danamon Virtual Account",
    indomaret: "Indomaret",
    alfamart: "Alfamart",
  };

  const isCstore = method === "indomaret" || method === "alfamart";

  return (
    <div className="max-w-xl mx-auto p-5 space-y-5">
      <h1 className="text-2xl font-bold">Instruksi Pembayaran</h1>

      <div className="border rounded-lg p-5 space-y-4">
        {/* Order ID */}
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-semibold">{orderId}</p>
        </div>

        {/* Metode */}
        <div>
          <p className="text-sm text-gray-500">Metode Pembayaran</p>
          <p className="font-semibold">
            {methodLabels[method || ""] || method}
          </p>
        </div>

        {/* Nomor VA / Kode Pembayaran */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">
            {isCstore ? "Kode Pembayaran" : "Nomor Virtual Account"}
          </p>
          <p className="text-2xl font-bold tracking-widest text-gray-800">
            {isCstore ? paymentCode : vaNumber}
          </p>
          <button
            onClick={() =>
              navigator.clipboard.writeText(
                isCstore ? paymentCode || "" : vaNumber || "",
              )
            }
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Salin
          </button>
        </div>

        {/* Instruksi */}
        <div>
          <p className="text-sm font-semibold mb-2">Cara Pembayaran:</p>
          {method === "bca" && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Login ke BCA Mobile / KlikBCA</li>
              <li>Pilih Transfer → BCA Virtual Account</li>
              <li>Masukkan nomor VA di atas</li>
              <li>Konfirmasi pembayaran</li>
            </ol>
          )}
          {method === "bni" && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Login ke BNI Mobile Banking</li>
              <li>Pilih Transfer → Virtual Account Billing</li>
              <li>Masukkan nomor VA di atas</li>
              <li>Konfirmasi pembayaran</li>
            </ol>
          )}
          {method === "bri" && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Login ke BRImo</li>
              <li>Pilih BRIVA</li>
              <li>Masukkan nomor VA di atas</li>
              <li>Konfirmasi pembayaran</li>
            </ol>
          )}
          {method === "mandiri" && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Login ke Livin by Mandiri</li>
              <li>Pilih Bayar → Multipayment</li>
              <li>Cari Midtrans sebagai penyedia</li>
              <li>Masukkan nomor VA di atas</li>
              <li>Konfirmasi pembayaran</li>
            </ol>
          )}
          {method === "permata" && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Login ke PermataMobile X</li>
              <li>Pilih Pembayaran → Virtual Account</li>
              <li>Masukkan nomor VA di atas</li>
              <li>Konfirmasi pembayaran</li>
            </ol>
          )}
          {(method === "cimb" || method === "danamon") && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Login ke mobile banking {method?.toUpperCase()}</li>
              <li>Pilih Transfer → Virtual Account</li>
              <li>Masukkan nomor VA di atas</li>
              <li>Konfirmasi pembayaran</li>
            </ol>
          )}
          {isCstore && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Pergi ke gerai {methodLabels[method || ""]}</li>
              <li>Tunjukkan kode pembayaran di atas ke kasir</li>
              <li>Lakukan pembayaran sesuai nominal</li>
              <li>Simpan struk sebagai bukti</li>
            </ol>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 text-center">
        Setelah pembayaran berhasil, rank akan otomatis masuk ke akun kamu.
      </p>
    </div>
  );
}

export default function InstructionPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <InstructionContent />
    </Suspense>
  );
}
