"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Copy, CheckCircle2, Clock, ArrowLeft, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/page-wrapper";

const METHOD_LABELS: Record<string, string> = {
  bca: "BCA Virtual Account",
  bni: "BNI Virtual Account",
  bri: "BRI Virtual Account",
  mandiri: "Mandiri Bill Payment",
  permata: "Permata Virtual Account",
  cimb: "CIMB Virtual Account",
  indomaret: "Indomaret",
  alfamart: "Alfamart",
  qris: "QRIS",
};

const BANK_INSTRUCTIONS: Record<string, string[]> = {
  bca: [
    "Buka aplikasi BCA Mobile atau ATM BCA",
    'Pilih "Transfer" → "Virtual Account"',
    "Masukkan nomor Virtual Account di bawah",
    "Konfirmasi nominal dan selesaikan pembayaran",
  ],
  bni: [
    "Buka aplikasi BNI Mobile Banking atau ATM BNI",
    'Pilih "Transfer" → "Virtual Account"',
    "Masukkan nomor Virtual Account di bawah",
    "Konfirmasi nominal dan selesaikan pembayaran",
  ],
  bri: [
    "Buka aplikasi BRImo atau ATM BRI",
    'Pilih "Pembayaran" → "BRIVA"',
    "Masukkan nomor Virtual Account di bawah",
    "Konfirmasi nominal dan selesaikan pembayaran",
  ],
  mandiri: [
    "Buka aplikasi Livin' by Mandiri atau ATM Mandiri",
    'Pilih "Pembayaran" → "Multi Payment"',
    'Masukkan kode perusahaan: "70012"',
    "Masukkan nomor tagihan di bawah",
    "Konfirmasi dan selesaikan pembayaran",
  ],
  permata: [
    "Buka aplikasi PermataMobile atau ATM Permata",
    'Pilih "Pembayaran" → "Virtual Account"',
    "Masukkan nomor Virtual Account di bawah",
    "Konfirmasi nominal dan selesaikan pembayaran",
  ],
  cimb: [
    "Buka aplikasi OCBC Mobile atau ATM CIMB",
    'Pilih "Transfer" → "Virtual Account"',
    "Masukkan nomor Virtual Account di bawah",
    "Konfirmasi nominal dan selesaikan pembayaran",
  ],
  indomaret: [
    "Kunjungi kasir Indomaret terdekat",
    'Beritahu kasir ingin bayar via "Midtrans"',
    "Berikan kode pembayaran di bawah kepada kasir",
    "Bayar sesuai nominal dan simpan struk",
  ],
  alfamart: [
    "Kunjungi kasir Alfamart terdekat",
    'Beritahu kasir ingin bayar via "Midtrans"',
    "Berikan kode pembayaran di bawah kepada kasir",
    "Bayar sesuai nominal dan simpan struk",
  ],
};

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function InstructionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") ?? "";
  const method = searchParams.get("method") ?? "";
  const vaNumber = searchParams.get("vaNumber") ?? "";
  const paymentCode = searchParams.get("paymentCode") ?? "";
  const qrUrl = searchParams.get("qrUrl") ?? "";
  const amount = Number(searchParams.get("amount") ?? 0);

  const [copied, setCopied] = useState(false);

  const codeToShow = vaNumber || paymentCode;
  const isQris = method === "qris";
  const isMinimarket = ["indomaret", "alfamart"].includes(method);
  const instructions = BANK_INSTRUCTIONS[method] ?? [];

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    toast({ title: "Disalin!", description: "Nomor berhasil disalin ke clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageWrapper>
      <div className="rpg-page">

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rpg-title-wrap">
          <div className="rpg-title-box">
            <span>📋</span>
            <h1 className="rpg-title">INSTRUKSI PEMBAYARAN</h1>
            <span>📋</span>
          </div>
          <p className="rpg-subtitle">Selesaikan pembayaran sebelum waktu habis</p>
        </motion.div>

        <div className="rpg-instruction-wrap">

          {/* Order Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rpg-card" style={{ marginBottom: 16 }}>
            <div className="rpg-card-header">
              <div className="rpg-rank-icon">🧾</div>
              <div>
                <div className="rpg-form-title">{METHOD_LABELS[method] ?? method}</div>
                <div className="rpg-rank-sub">Order ID: {orderId}</div>
              </div>
              {amount > 0 && (
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ color: '#806040', fontSize: '11px' }}>Total</div>
                  <div className="rpg-price-final">{formatRupiah(amount)}</div>
                </div>
              )}
            </div>

            {/* Timer warning */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px',
              background: 'rgba(234,179,8,0.08)',
              borderBottom: '1px solid rgba(139,90,43,0.25)',
            }}>
              <Clock size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span style={{ color: '#d4a96a', fontSize: '12px' }}>
                Selesaikan pembayaran dalam <strong style={{ color: '#f59e0b' }}>24 jam</strong>. Rank akan aktif otomatis setelah pembayaran dikonfirmasi.
              </span>
            </div>

            {/* QRIS */}
            {isQris && qrUrl && (
              <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ color: '#a09070', fontSize: '11px', letterSpacing: '0.1em', marginBottom: 16 }}>
                  SCAN QR CODE INI
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="QRIS QR Code"
                  style={{ width: 200, height: 200, margin: '0 auto', border: '4px solid rgba(139,90,43,0.4)', display: 'block' }}
                />
                <p style={{ color: '#806040', fontSize: '12px', marginTop: 12 }}>
                  Scan menggunakan aplikasi GoPay, OVO, DANA, ShopeePay, atau banking app
                </p>
              </div>
            )}

            {/* VA / Payment Code */}
            {!isQris && codeToShow && (
              <div style={{ padding: '20px' }}>
                <div style={{ color: '#a09070', fontSize: '11px', letterSpacing: '0.1em', marginBottom: 10 }}>
                  {isMinimarket ? 'KODE PEMBAYARAN' : 'NOMOR VIRTUAL ACCOUNT'}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(0,0,0,0.5)',
                  border: '2px solid rgba(255,215,0,0.3)',
                  padding: '14px 16px',
                }}>
                  <span style={{
                    flex: 1,
                    fontFamily: '"Courier New", monospace',
                    fontSize: 'clamp(16px, 3vw, 22px)',
                    color: '#FFD700',
                    letterSpacing: '0.1em',
                    fontWeight: 'bold',
                    wordBreak: 'break-all',
                  }}>
                    {codeToShow}
                  </span>
                  <button onClick={handleCopy} style={{
                    background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(139,90,43,0.2)',
                    border: copied ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(139,90,43,0.4)',
                    color: copied ? '#4ade80' : '#d4a96a',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '12px', flexShrink: 0,
                    transition: 'all 0.2s',
                  }}>
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Disalin' : 'Salin'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Step-by-step instructions */}
          {instructions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rpg-card" style={{ marginBottom: 16 }}>
              <div style={{
                padding: '14px 20px',
                background: 'linear-gradient(90deg, rgba(139,90,43,0.25), rgba(200,150,60,0.15), rgba(139,90,43,0.25))',
                borderBottom: '1px solid rgba(139,90,43,0.45)',
              }}>
                <div style={{ color: '#d4a96a', fontSize: '13px', fontWeight: 600 }}>Cara Pembayaran</div>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {instructions.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, flexShrink: 0,
                      background: 'rgba(139,90,43,0.3)',
                      border: '1px solid rgba(139,90,43,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: '#FFD700', fontWeight: 'bold',
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ color: '#c49a5a', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Info box */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(139,90,43,0.25)',
              padding: '14px 16px',
              marginBottom: 20,
            }}>
            <p style={{ color: '#806040', fontSize: '12px', margin: 0, lineHeight: 1.7 }}>
              ℹ️ Rank akan diberikan otomatis oleh sistem dalam 1–5 menit setelah pembayaran dikonfirmasi Midtrans.
              Jika lebih dari 15 menit belum aktif, hubungi admin di Discord.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => router.push("/store")} className="rpg-back-btn" style={{ flex: 1 }}>
              <ArrowLeft size={14} style={{ display: 'inline', marginRight: 6 }} />
              Kembali ke Store
            </button>
            <button onClick={() => router.push("/")} className="rpg-back-btn" style={{ flex: 1 }}>
              <Home size={14} style={{ display: 'inline', marginRight: 6 }} />
              Beranda
            </button>
          </motion.div>
        </div>
      </div>

      <style>{`
        .rpg-page { min-height: 100vh; padding: 80px 16px 48px; font-family: 'Geist', 'Inter', sans-serif; }
        .rpg-title-wrap { text-align: center; margin-bottom: 36px; }
        .rpg-title-box { display: inline-flex; align-items: center; gap: 14px; background: rgba(0,0,0,0.55); border: 2px solid rgba(139,90,43,0.55); padding: 12px 32px; margin-bottom: 8px; font-size: 20px; }
        .rpg-title { font-family: var(--font-minecraft), monospace; font-size: clamp(12px, 2.5vw, 18px); color: #FFD700; text-shadow: 2px 2px 0 #8B4513; letter-spacing: 0.15em; margin: 0; }
        .rpg-subtitle { color: #806040; font-size: 13px; }
        .rpg-instruction-wrap { max-width: 580px; margin: 0 auto; }
        .rpg-card { background: linear-gradient(135deg, rgba(18,10,4,0.96) 0%, rgba(36,20,6,0.96) 100%); border: 2px solid rgba(139,90,43,0.6); box-shadow: 0 4px 24px rgba(0,0,0,0.5); overflow: hidden; }
        .rpg-card-header { display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, rgba(139,90,43,0.25), rgba(200,150,60,0.15), rgba(139,90,43,0.25)); border-bottom: 1px solid rgba(139,90,43,0.45); padding: 16px 20px; }
        .rpg-rank-icon { width: 44px; height: 44px; flex-shrink: 0; background: rgba(139,90,43,0.25); border: 2px solid rgba(139,90,43,0.5); display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .rpg-rank-sub { color: #806040; font-size: 11px; margin-top: 3px; font-family: monospace; }
        .rpg-form-title { color: #d4a96a; font-size: 15px; font-weight: 600; }
        .rpg-price-final { font-family: var(--font-minecraft), monospace; color: #FFD700; font-size: clamp(12px, 2vw, 16px); text-shadow: 1px 1px 0 #8B4513; }
        .rpg-back-btn { padding: 10px; background: transparent; border: 1px solid rgba(139,90,43,0.3); color: #806040; font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit; text-align: center; }
        .rpg-back-btn:hover { border-color: rgba(139,90,43,0.6); color: #a09070; }
      `}</style>
    </PageWrapper>
  );
}

export default function InstructionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-400 text-sm">Loading...</div>
      </div>
    }>
      <InstructionContent />
    </Suspense>
  );
}