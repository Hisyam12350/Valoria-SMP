"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

declare global {
  interface Window {
    snap: any;
  }
}

type Rank = {
  name: string;
  slug: string;
  price: string;
  originalPriceNum: number;
  discount: number;
  color?: string;
};

const PAYMENT_METHODS = [
  { id: "gopay", label: "GoPay", icon: "💚" },
  { id: "qris", label: "QRIS", icon: "🔳" },
  { id: "shopeepay", label: "ShopeePay", icon: "🧡" },
  { id: "ovo", label: "OVO", icon: "💜" },
  { id: "dana", label: "DANA", icon: "💙" },
  { id: "bca", label: "Transfer BCA", icon: "🏦" },
  { id: "bni", label: "Transfer BNI", icon: "🏦" },
  { id: "bri", label: "Transfer BRI", icon: "🏦" },
  { id: "mandiri", label: "Transfer Mandiri", icon: "🏦" },
  { id: "permata", label: "Transfer Permata", icon: "🏦" },
  { id: "cimb", label: "Transfer CIMB", icon: "🏦" },
  { id: "danamon", label: "Transfer Danamon", icon: "🏦" },
  { id: "indomaret", label: "Indomaret", icon: "🏪" },
  { id: "alfamart", label: "Alfamart", icon: "🏪" },
  { id: "akulaku", label: "Akulaku", icon: "💳" },
  { id: "kredivo", label: "Kredivo", icon: "💳" },
];

export default function PaymentPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [rank, setRank] = useState<Rank | null>(null);
  const [username, setUsername] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState("");
  const [uuid, setUuid] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isUserFound, setIsUserFound] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showAllPayments, setShowAllPayments] = useState(false);

  useEffect(() => {
    getRank();
  }, []);

  const getRank = async () => {
    try {
      const res = await fetch("/api/store/get-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!data.success) {
        setError("Rank tidak ditemukan");
        return;
      }
      setRank(data.rank);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data rank");
    }
  };

  const handlePayment = async () => {
    try {
      if (!rank || !selectedMethod) return;
      setLoadingPayment(true);

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          username,
          productName: rank.name,
          slug: rank.slug,
          price: rank.originalPriceNum,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Gagal membuat pembayaran");
        return;
      }

      const tx = data.data;

      // Redirect sesuai metode pembayaran
      if (selectedMethod === "gopay") {
        const deeplink = tx.actions?.find(
          (a: any) => a.name === "deeplink-redirect",
        )?.url;
        const qrUrl = tx.actions?.find(
          (a: any) => a.name === "generate-qr-code",
        )?.url;
        if (deeplink) window.location.href = deeplink;
        else if (qrUrl) window.location.href = qrUrl;
      } else if (selectedMethod === "qris") {
        const qrUrl = tx.actions?.find(
          (a: any) => a.name === "generate-qr-code",
        )?.url;
        if (qrUrl) window.location.href = qrUrl;
      } else if (selectedMethod === "ovo" || selectedMethod === "dana") {
        const redirect = tx.actions?.find(
          (a: any) => a.name === "deeplink-redirect",
        )?.url;
        if (redirect) window.location.href = redirect;
      } else if (selectedMethod === "shopeepay") {
        const redirect = tx.actions?.find(
          (a: any) => a.name === "deeplink-redirect",
        )?.url;
        if (redirect) window.location.href = redirect;
      } else if (
        selectedMethod === "indomaret" ||
        selectedMethod === "alfamart"
      ) {
        window.location.href = `/payment/instruction?orderId=${data.orderId}&method=${selectedMethod}&paymentCode=${tx.payment_code}`;
      } else if (selectedMethod === "akulaku") {
        const redirect = tx.actions?.find(
          (a: any) => a.name === "redirect-url",
        )?.url;
        if (redirect) window.location.href = redirect;
      } else if (selectedMethod === "kredivo") {
        const redirect = tx.actions?.find(
          (a: any) => a.name === "redirect-url",
        )?.url;
        if (redirect) window.location.href = redirect;
      } else {
        // Transfer bank — redirect ke halaman instruksi
        window.location.href = `/payment/instruction?orderId=${data.orderId}&method=${selectedMethod}&vaNumber=${tx.va_numbers?.[0]?.va_number || tx.bill_key || ""}`;
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoadingPayment(false);
    }
  };

  const checkUser = async (value: string) => {
    if (!value.trim()) {
      setUsername("");
      setIsUserFound(false);
      return;
    }
    try {
      setIsChecking(true);
      const res = await fetch("/api/minecraft/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }), // ← ubah uuid jadi username
      });
      const data = await res.json();
      if (data.found) {
        setUsername(data.user.username);
        setIsUserFound(true);
      } else {
        setUsername("");
        setIsUserFound(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  if (error && !rank) {
    return (
      <div className="p-10 text-center">
        <h1>{error}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-5 space-y-5">
      <h1 className="text-2xl font-bold">Payment {rank?.name}</h1>

      <div className="border rounded-lg p-5 space-y-3">
        <p>Rank: {rank?.name}</p>
        <p>Harga: Rp {rank?.originalPriceNum?.toLocaleString("id-ID")}</p>
      </div>

      {/* Input UUID */}
      <div className="space-y-2">
        <Label>Username Minecraft</Label>
        <Input
          placeholder="Masukkan Username Minecraft"
          value={uuid}
          onChange={(e) => {
            const value = e.target.value;
            setUuid(value);
            checkUser(value);
          }}
        />
        {isChecking && (
          <p className="text-sm text-gray-400">Mengecek akun...</p>
        )}
        {isUserFound && (
          <div className="rounded-md border p-3">
            <p className="text-sm text-green-500">Akun ditemukan</p>
            <p className="font-semibold">Username: {username}</p>
          </div>
        )}
        {!isChecking && uuid && !isUserFound && (
          <p className="text-sm text-red-500">UUID tidak ditemukan</p>
        )}
      </div>

      {/* Pilih Metode Pembayaran */}
      <div className="space-y-2">
        <Label>Metode Pembayaran</Label>

        <div className="grid grid-cols-3 gap-2">
          {(showAllPayments
            ? PAYMENT_METHODS
            : PAYMENT_METHODS.slice(0, 6)
          ).map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`border rounded-lg p-3 text-center text-sm transition-all ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="text-2xl">{method.icon}</div>
              <div>{method.label}</div>
            </button>
          ))}
        </div>

        {/* Button lihat semua */}
        {PAYMENT_METHODS.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllPayments(!showAllPayments)}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-2"
          >
            {showAllPayments
              ? "Tampilkan Lebih Sedikit"
              : "Lihat Semua Metode Pembayaran"}
          </button>
        )}
      </div>

      {/* Tombol Bayar */}
      <Button
        onClick={handlePayment}
        disabled={!isUserFound || !selectedMethod || loadingPayment}
        className="w-full"
      >
        {loadingPayment ? "Memproses..." : "Bayar Sekarang"}
      </Button>
    </div>
  );
}
