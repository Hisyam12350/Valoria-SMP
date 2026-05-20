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

  useEffect(() => {
    getRank();
  }, []);

  const getRank = async () => {
    try {
      const res = await fetch("/api/store/get-rank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
        }),
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
      if (!rank) return;

      setLoadingPayment(true);

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid,
          username,
          productName: rank.name,
          slug: rank.slug,
          price: rank.originalPriceNum,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Gagal membuat pembayaran");
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: function () {
          window.location.href = "/payment/success";
        },

        onPending: function () {
          alert("Menunggu pembayaran");
        },

        onError: function () {
          alert("Pembayaran gagal");
        },

        onClose: function () {
          console.log("Popup ditutup");
        },
      });
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoadingPayment(false);
    }
  };

  if (error && !rank) {
    return (
      <div className="p-10 text-center">
        <h1>{error}</h1>
      </div>
    );
  }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid: value,
        }),
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

  return (
    <div className="max-w-xl mx-auto p-5 space-y-5">
      <h1 className="text-2xl font-bold">Payment {rank?.name}</h1>

      <div className="border rounded-lg p-5 space-y-3">
        <p>Rank: {rank?.name}</p>
        <p>Harga: Rp {rank?.originalPriceNum?.toLocaleString("id-ID")}</p>
      </div>

      <div className="space-y-2">
        <Label>UUID Player</Label>

        <Input
          placeholder="Masukkan UUID"
          value={uuid}
          onChange={(e) => {
            const value = e.target.value;

            setUuid(value);
            checkUser(value);
          }}
        />

        <Button
          onClick={handlePayment}
          disabled={!isUserFound || loadingPayment}
          className="w-full"
        >
          {loadingPayment ? "Memproses..." : "Bayar Sekarang"}
        </Button>

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
    </div>
  );
}
