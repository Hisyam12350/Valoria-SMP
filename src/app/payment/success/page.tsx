"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, ArrowRight, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageWrapper } from "@/components/page-wrapper";

interface Transaction {
  order_id: string;
  product_name: string;
  price: number;
  payment_method: string;
  status: string;
  username: string;
  created_at?: string;
}

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id") || searchParams.get("tripay_merchant_ref") || searchParams.get("merchant_ref");
  const transactionStatus = searchParams.get("transaction_status") || searchParams.get("status");

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const fetchTransactionStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?order_id=${orderId}`);
        const data = await res.json();
        if (data.success) {
          setTransaction(data.transaction);
        } else {
          setError(data.error || "Gagal mengambil data transaksi");
        }
      } catch (err: any) {
        console.error("Error fetching transaction status:", err);
        setError("Gagal menghubungi server");
      } finally {
        setIsLoading(false);
      }
    };

    // Poll status initially and check
    fetchTransactionStatus();
  }, [orderId]);

  // Prioritize DB transaction status over query parameters
  const currentStatus = transaction ? transaction.status : transactionStatus;
  const isPending = currentStatus === "pending";

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="glass border-0 text-center">
            <CardContent className="pt-10 pb-8 space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isPending
                    ? "bg-amber-500/20 border-2 border-amber-500/50"
                    : "bg-emerald-500/20 border-2 border-emerald-500/50"
                }`}>
                  {isPending ? (
                    <Crown className="w-12 h-12 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <h1 className="text-2xl font-bold font-minecraft text-white">
                  {isPending ? "Menunggu Pembayaran" : "Pembayaran Berhasil!"}
                </h1>
                <p className="text-gray-400 text-sm">
                  {isPending
                    ? "Pembayaran kamu sedang diproses. Item akan diberikan setelah konfirmasi."
                    : "Terima kasih! Item kamu sedang diproses dan akan aktif dalam beberapa menit."}
                </p>
              </motion.div>

              {/* Detail Transaksi (Receipt) */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-white/5 rounded-xl border border-white/10">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  <p className="text-xs text-gray-400 font-medium">Memuat rincian pembelian...</p>
                </div>
              ) : error || !transaction ? (
                orderId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3"
                  >
                    <p className="text-xs text-rose-400 mb-1">Gagal memuat rincian untuk Order ID</p>
                    <p className="text-xs font-mono text-gray-400 font-medium break-all">{orderId}</p>
                  </motion.div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-left space-y-3 divide-y divide-white/5"
                >
                  <div className="pb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-emerald-400/80 uppercase font-sans">
                      Rincian Pembelian
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                      isPending
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {isPending ? "Pending" : "Sukses"}
                    </span>
                  </div>
                  
                  <div className="pt-3 space-y-2.5 text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-gray-400 text-xs">Item</span>
                      <span className="text-white font-medium text-right">{transaction.product_name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Penerima (IGN)</span>
                      <span className="text-white font-medium font-mono">{transaction.username}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Metode</span>
                      <span className="text-white font-medium uppercase font-mono">{transaction.payment_method}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Order ID</span>
                      <span className="text-white font-mono text-xs">{transaction.order_id}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between items-center font-minecraft">
                    <span className="text-gray-400 text-xs font-sans">Total Bayar</span>
                    <span className="text-base font-bold text-amber-400">
                      {formatRupiah(transaction.price)}
                    </span>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-lg p-4 text-sm space-y-2 ${
                  isPending
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-emerald-500/10 border border-emerald-500/30"
                }`}
              >
                {isPending ? (
                  <>
                    <p className="text-amber-300 font-medium text-left">⏳ Pembayaran Pending</p>
                    <p className="text-gray-400 text-left">
                      Selesaikan pembayaranmu via bank transfer atau metode lain yang dipilih.
                      Item akan otomatis aktif setelah konfirmasi.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-emerald-300 font-medium text-left">🎮 Item Aktif Otomatis</p>
                    <p className="text-gray-400 text-left">
                      Item kamu akan diberikan secara otomatis dalam 1-5 menit.
                      Login ke server dan cek!
                    </p>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                <Button
                  onClick={() => router.push("/store")}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90 h-11"
                >
                  <ShoppingCartIcon />
                  Beli Item Lain
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full h-9 border-white/10 text-gray-300 hover:text-white"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

function ShoppingCartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-2"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-400 text-sm">Loading...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}