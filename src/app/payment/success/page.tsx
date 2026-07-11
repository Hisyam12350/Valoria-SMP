"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageWrapper } from "@/components/page-wrapper";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id");
  const transactionStatus = searchParams.get("transaction_status");

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/store");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const isPending = transactionStatus === "pending";

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

              {orderId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-lg bg-white/5 p-3"
                >
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="text-sm font-mono text-white font-medium">{orderId}</p>
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
                    <p className="text-amber-300 font-medium">⏳ Pembayaran Pending</p>
                    <p className="text-gray-400">
                      Selesaikan pembayaranmu via bank transfer atau metode lain yang dipilih.
                      Item akan otomatis aktif setelah konfirmasi.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-emerald-300 font-medium">🎮 Item Aktif Otomatis</p>
                    <p className="text-gray-400">
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

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-gray-500"
              >
                Redirect ke store dalam{" "}
                <span className="text-emerald-400 font-medium">{countdown}</span> detik...
              </motion.p>
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