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
  { id: "credit_card", label: "Kartu Kredit/Debit", icon: "💳" },
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
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);

  // Harga setelah diskon rank otomatis
  const rankDiscountedPrice = rank
    ? Math.floor(
        rank.originalPriceNum -
          (rank.originalPriceNum * (rank.discount ?? 0)) / 100,
      )
    : 0;

  // Harga final setelah kode diskon tambahan
  const finalPrice = Math.max(0, rankDiscountedPrice - discountAmount);

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

      // Kartu kredit pakai Snap langsung
      if (selectedMethod === "credit_card") {
        const res = await fetch("/api/payment/create-snap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uuid,
            username,
            productName: rank.name,
            slug: rank.slug,
            price: finalPrice,
          }),
        });
        const snapData = await res.json();
        if (!snapData.success) {
          alert("Gagal membuat pembayaran");
          return;
        }
        window.snap.pay(snapData.token, {
          onSuccess: () => {
            window.location.href = "/payment/success";
          },
          onPending: () => {
            alert("Menunggu pembayaran");
          },
          onError: () => {
            alert("Pembayaran gagal");
          },
          onClose: () => {
            console.log("Popup ditutup");
          },
        });
        return;
      }

      // Metode lain pakai Core API
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          username,
          productName: rank.name,
          slug: rank.slug,
          price: finalPrice,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Gagal membuat pembayaran");
        return;
      }

      const tx = data.data;

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
      } else if (selectedMethod === "akulaku" || selectedMethod === "kredivo") {
        const redirect = tx.actions?.find(
          (a: any) => a.name === "redirect-url",
        )?.url;
        if (redirect) window.location.href = redirect;
      } else {
        // Transfer bank
        const vaNumber =
          tx.va_numbers?.[0]?.va_number || tx.permata_va_number || "";
        window.location.href = `/payment/instruction?orderId=${data.orderId}&method=${selectedMethod}&vaNumber=${vaNumber}`;
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

  const checkDiscount = async () => {
    if (!discountCode.trim() || !rank) return;
    try {
      setIsCheckingDiscount(true);
      setDiscountError("");
      const res = await fetch("/api/store/check-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode,
          price: rank.originalPriceNum, // ← tambahkan ini
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscountAmount(data.discountAmount);
      } else {
        setDiscountAmount(0);
        setDiscountError(data.error || "Kode diskon tidak valid");
      }
    } catch (err) {
      console.error(err);
      setDiscountError("Gagal mengecek kode diskon");
    } finally {
      setIsCheckingDiscount(false);
    }
  };

  const handleFreeRank = async () => {
    try {
      setLoadingPayment(true);
      const res = await fetch("/api/payment/free-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, slug: rank?.slug }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/payment/success";
      } else {
        alert("Gagal memberikan rank");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-5 space-y-5">
      <h1 className="text-2xl font-bold">Payment {rank?.name}</h1>

      <div className="border rounded-lg p-5 space-y-3">
        <p>Rank: {rank?.name}</p>
        <p className="line-through text-gray-400">
          Harga: Rp {rank?.originalPriceNum?.toLocaleString("id-ID")}
        </p>
        {(rank?.discount ?? 0) > 0 && (
          <p className="text-green-500">
            Diskon {rank?.discount}%: -Rp{" "}
            {(
              (rank?.originalPriceNum ?? 0) - rankDiscountedPrice
            ).toLocaleString("id-ID")}
          </p>
        )}
        {discountAmount > 0 && (
          <p className="text-green-500">
            Kode Diskon: -Rp {discountAmount.toLocaleString("id-ID")}
          </p>
        )}
        <p className="font-bold text-lg">
          Total: Rp {finalPrice.toLocaleString("id-ID")}
        </p>
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

      {/* Kode Diskon */}
      <div className="space-y-2">
        <Label>Kode Diskon (opsional)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Masukkan kode diskon"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
          />
          <Button
            type="button"
            onClick={checkDiscount}
            disabled={isCheckingDiscount}
            className="shrink-0"
          >
            {isCheckingDiscount ? "..." : "Pakai"}
          </Button>
        </div>
        {discountAmount > 0 && (
          <p className="text-sm text-green-500">
            ✅ Kode diskon berhasil dipakai!
          </p>
        )}
        {discountError && (
          <p className="text-sm text-red-500">{discountError}</p>
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
        onClick={finalPrice === 0 ? handleFreeRank : handlePayment}
        disabled={
          !isUserFound ||
          (!selectedMethod && finalPrice !== 0) ||
          loadingPayment
        }
        className="w-full"
      >
        {loadingPayment
          ? "Memproses..."
          : finalPrice === 0
            ? "Klaim Gratis"
            : "Bayar Sekarang"}
      </Button>
    </div>
  );
}
