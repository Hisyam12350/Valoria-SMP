"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/page-wrapper";

type Rank = {
  name: string;
  slug: string;
  price: string;
  originalPriceNum: number;
  discount: number;
  color?: string;
  gradient?: string;
  features?: string[];
  bonus?: {
    claimblock?: string;
    claim?: string;
    sethome?: string;
    money?: string;
  };
};

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function calculateDiscountedPrice(originalPrice: number, discount: number): number {
  return Math.floor(originalPrice * (1 - discount / 100));
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [rank, setRank] = useState<Rank | null>(null);
  const [pageError, setPageError] = useState("");

  const [username, setUsername] = useState("");
  const [uuid, setUuid] = useState("");
  const [isCheckingPlayer, setIsCheckingPlayer] = useState(false);
  const [isPlayerFound, setIsPlayerFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchRank(); }, [slug]);

  const fetchRank = async () => {
    try {
      const res = await fetch("/api/store/get-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!data.success) { setPageError("Rank tidak ditemukan"); return; }
      setRank(data.rank);
    } catch { setPageError("Gagal mengambil data rank"); }
  };

  const checkPlayer = async (value: string) => {
    if (!value.trim()) { setUuid(""); setIsPlayerFound(false); return; }
    try {
      setIsCheckingPlayer(true);
      const res = await fetch("/api/minecraft/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = await res.json();
      if (data.found) {
        setUuid(data.user.uuid);
        setIsPlayerFound(true);
      } else {
        setUuid("");
        setIsPlayerFound(false);
      }
    } catch { setIsPlayerFound(false); }
    finally { setIsCheckingPlayer(false); }
  };

  const handlePayment = async () => {
    if (!rank || !isPlayerFound) return;
    try {
      setIsLoading(true);
      const finalPrice = calculateDiscountedPrice(rank.originalPriceNum, rank.discount ?? 0);
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, username, productName: `Rank ${rank.name}`, slug: rank.slug, price: finalPrice }),
      });
      const data = await res.json();
      if (!data.success || !data.token) {
        toast({ title: "Gagal", description: data.error ?? "Gagal membuat transaksi", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      window.snap.pay(data.token, {
        onSuccess: () => router.push("/payment/success"),
        onPending: (result) => {
          toast({ title: "Menunggu Pembayaran", description: `Order #${result.order_id} sedang diproses.` });
          setIsLoading(false);
        },
        onError: () => {
          toast({ title: "Pembayaran Gagal", description: "Terjadi kesalahan.", variant: "destructive" });
          setIsLoading(false);
        },
        onClose: () => setIsLoading(false),
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  if (pageError) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">{pageError}</h1>
            <button onClick={() => router.push("/store")} className="rpg-btn-outline">← Kembali ke Store</button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!rank) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-amber-700 text-sm">Memuat data rank...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const finalPrice = calculateDiscountedPrice(rank.originalPriceNum, rank.discount ?? 0);

  return (
    <PageWrapper>
      <div className="rpg-page">

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rpg-title-wrap">
          <div className="rpg-title-box">
            <span className="rpg-title-icon">⚔</span>
            <h1 className="rpg-title">RANK CHECKOUT</h1>
            <span className="rpg-title-icon">⚔</span>
          </div>
          <p className="rpg-subtitle">Pilih metode pembayaran & dapatkan rankmu</p>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="rpg-grid">

          {/* LEFT — Rank Info */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
            <div className="rpg-card">
              <div className="rpg-card-header">
                <div className="rpg-rank-icon">👑</div>
                <div>
                  <div className="rpg-rank-name">{rank.name}</div>
                  <div className="rpg-rank-sub">Permanent Rank</div>
                </div>
                {(rank.discount ?? 0) > 0 && (
                  <div className="rpg-discount-badge">-{rank.discount}% OFF</div>
                )}
              </div>

              {rank.features && rank.features.length > 0 && (
                <div className="rpg-section">
                  <div className="rpg-section-label">Commands & Abilities</div>
                  <div className="rpg-tags">
                    {rank.features.map((f) => (
                      <span key={f} className="rpg-tag">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {rank.bonus && (
                <div className="rpg-section">
                  <div className="rpg-section-label">Bonus Stats</div>
                  <div className="rpg-stats-grid">
                    {rank.bonus.claimblock && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">🎁</span>
                        <span className="rpg-stat-label">Claimblock</span>
                        <span className="rpg-stat-val">{rank.bonus.claimblock}</span>
                      </div>
                    )}
                    {rank.bonus.claim && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">📌</span>
                        <span className="rpg-stat-label">Claim</span>
                        <span className="rpg-stat-val">{rank.bonus.claim}</span>
                      </div>
                    )}
                    {rank.bonus.sethome && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">🏠</span>
                        <span className="rpg-stat-label">Sethome</span>
                        <span className="rpg-stat-val">{rank.bonus.sethome}</span>
                      </div>
                    )}
                    {rank.bonus.money && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">💰</span>
                        <span className="rpg-stat-label">Starter Money</span>
                        <span className="rpg-stat-val">{rank.bonus.money}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="rpg-price-row">
                <span className="rpg-price-label">Total Pembayaran</span>
                <div className="rpg-price-wrap">
                  {(rank.discount ?? 0) > 0 && (
                    <span className="rpg-price-original">{formatRupiah(rank.originalPriceNum)}</span>
                  )}
                  <span className="rpg-price-final">{formatRupiah(finalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="rpg-lore">
              <span className="rpg-lore-label">📜 Lore</span>
              <p className="rpg-lore-text">
                "Dengan rank <strong style={{ color: '#FFD700' }}>{rank.name}</strong>, kamu akan menjadi salah satu
                petualang terkuat di server. Kekuatan dan privilege menantimu di dunia VALORIA SMP."
              </p>
            </div>
          </motion.div>

          {/* RIGHT — Payment Form */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
            <div className="rpg-card">
              <div className="rpg-card-header">
                <div>
                  <div className="rpg-form-title">Identitas Petualang</div>
                  <div className="rpg-rank-sub">Masukkan username Minecraft kamu</div>
                </div>
              </div>

              <div className="rpg-form-body">
                {/* Username Input */}
                <div className="rpg-field">
                  <label className="rpg-label">Username Minecraft</label>
                  <input
                    type="text"
                    placeholder="Contoh: Steve123"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); checkPlayer(e.target.value); }}
                    className="rpg-input"
                  />
                  <span className="rpg-hint">Harus sudah pernah join server VALORIA SMP</span>
                </div>

                {/* Player status */}
                <AnimatePresence mode="wait">
                  {isCheckingPlayer && (
                    <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rpg-status rpg-status--loading">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mencari petualang di database...</span>
                    </motion.div>
                  )}
                  {!isCheckingPlayer && username && isPlayerFound && (
                    <motion.div key="found" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rpg-status rpg-status--success">
                      <CheckCircle2 size={15} />
                      <div>
                        <div className="rpg-status-title">Petualang ditemukan</div>
                        <div className="rpg-status-username">{username}</div>
                      </div>
                    </motion.div>
                  )}
                  {!isCheckingPlayer && username && !isPlayerFound && (
                    <motion.div key="notfound" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rpg-status rpg-status--error">
                      <AlertCircle size={15} />
                      <div>
                        <div className="rpg-status-title">Petualang tidak ditemukan</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Pastikan username benar & sudah pernah join server</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="rpg-divider"><span>Order Summary</span></div>

                {/* Summary */}
                <div className="rpg-summary">
                  <div className="rpg-summary-row">
                    <span>Item</span>
                    <span style={{ color: '#FFD700', fontWeight: 600 }}>Rank {rank.name}</span>
                  </div>
                  <div className="rpg-summary-row">
                    <span>Player</span>
                    <span style={{ color: '#d4a96a' }}>{isPlayerFound ? username : '—'}</span>
                  </div>
                  <div className="rpg-summary-row">
                    <span>Tipe</span>
                    <span style={{ color: '#4ade80' }}>Permanent</span>
                  </div>
                  <div className="rpg-summary-row rpg-summary-total">
                    <span>TOTAL</span>
                    <span className="rpg-price-final">{formatRupiah(finalPrice)}</span>
                  </div>
                </div>

                {/* Pay button */}
                <button
                  onClick={handlePayment}
                  disabled={!isPlayerFound || isLoading}
                  className={`rpg-pay-btn ${(!isPlayerFound || isLoading) ? 'rpg-pay-btn--disabled' : ''}`}
                >
                  {isLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                    : <>⚔ Bayar Sekarang</>
                  }
                </button>

                <p className="rpg-secure-note">🔒 Pembayaran aman via Midtrans · Rank otomatis aktif setelah bayar</p>
              </div>
            </div>

            <button onClick={() => router.push("/store")} className="rpg-back-btn">
              ← Kembali ke Store
            </button>
          </motion.div>
        </div>
      </div>

      <style>{`
        .rpg-page { min-height: 100vh; padding: 80px 16px 48px; font-family: 'Geist', 'Inter', sans-serif; }
        .rpg-title-wrap { text-align: center; margin-bottom: 36px; }
        .rpg-title-box {
          display: inline-flex; align-items: center; gap: 14px;
          background: rgba(0,0,0,0.55); border: 2px solid rgba(139,90,43,0.55);
          padding: 12px 32px; margin-bottom: 8px;
        }
        .rpg-title {
          font-family: var(--font-minecraft), monospace;
          font-size: clamp(14px, 3vw, 22px); color: #FFD700;
          text-shadow: 2px 2px 0 #8B4513; letter-spacing: 0.15em; margin: 0;
        }
        .rpg-title-icon { font-size: 20px; }
        .rpg-subtitle { color: #806040; font-size: 13px; }
        .rpg-grid {
          max-width: 980px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;
        }
        @media (max-width: 720px) { .rpg-grid { grid-template-columns: 1fr; } }
        .rpg-card {
          background: linear-gradient(135deg, rgba(18,10,4,0.96) 0%, rgba(36,20,6,0.96) 100%);
          border: 2px solid rgba(139,90,43,0.6);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5), inset 0 0 24px rgba(0,0,0,0.3);
          overflow: hidden; margin-bottom: 16px;
        }
        .rpg-card-header {
          display: flex; align-items: center; gap: 14px;
          background: linear-gradient(90deg, rgba(139,90,43,0.25), rgba(200,150,60,0.15), rgba(139,90,43,0.25));
          border-bottom: 1px solid rgba(139,90,43,0.45); padding: 16px 20px;
        }
        .rpg-rank-icon {
          width: 48px; height: 48px; flex-shrink: 0;
          background: rgba(139,90,43,0.25); border: 2px solid rgba(139,90,43,0.5);
          display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .rpg-rank-name {
          font-family: var(--font-minecraft), monospace;
          font-size: clamp(14px, 2.5vw, 20px); color: #FFD700;
          text-shadow: 1px 1px 0 #8B4513; letter-spacing: 0.15em;
        }
        .rpg-rank-sub { color: #806040; font-size: 12px; margin-top: 3px; }
        .rpg-discount-badge {
          margin-left: auto; background: #dc2626; color: white;
          padding: 4px 10px; font-size: 11px; font-weight: bold;
          border: 1px solid #991b1b; flex-shrink: 0;
        }
        .rpg-section { padding: 14px 20px; border-bottom: 1px solid rgba(139,90,43,0.25); }
        .rpg-section-label { color: #a09070; font-size: 11px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase; }
        .rpg-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .rpg-tag {
          background: rgba(139,90,43,0.18); border: 1px solid rgba(139,90,43,0.4);
          color: #c49a5a; padding: 3px 9px; font-size: 12px;
        }
        .rpg-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .rpg-stat-item {
          background: rgba(0,0,0,0.3); border: 1px solid rgba(139,90,43,0.25);
          padding: 10px 12px; display: flex; flex-direction: column; gap: 3px;
        }
        .rpg-stat-icon { font-size: 14px; }
        .rpg-stat-label { color: #806040; font-size: 11px; }
        .rpg-stat-val { color: #4ade80; font-weight: 700; font-size: 14px; }
        .rpg-price-row {
          padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
        }
        .rpg-price-label { color: #a09070; font-size: 13px; }
        .rpg-price-wrap { text-align: right; }
        .rpg-price-original { color: #604030; font-size: 12px; text-decoration: line-through; display: block; }
        .rpg-price-final {
          font-family: var(--font-minecraft), monospace; color: #FFD700;
          font-size: clamp(13px, 2vw, 17px); text-shadow: 1px 1px 0 #8B4513;
        }
        .rpg-lore {
          background: rgba(0,0,0,0.45); border: 1px solid rgba(139,90,43,0.25); padding: 14px 16px;
        }
        .rpg-lore-label { display: block; color: #806040; font-size: 11px; letter-spacing: 0.1em; margin-bottom: 8px; }
        .rpg-lore-text { color: #7a6050; font-size: 13px; line-height: 1.7; margin: 0; font-style: italic; }
        .rpg-form-title { color: #d4a96a; font-size: 16px; font-weight: 600; }
        .rpg-form-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .rpg-field { display: flex; flex-direction: column; gap: 6px; }
        .rpg-label { color: #a09070; font-size: 12px; letter-spacing: 0.08em; }
        .rpg-input {
          background: rgba(0,0,0,0.55); border: 1px solid rgba(139,90,43,0.45);
          color: #d4a96a; padding: 10px 14px; font-size: 13px;
          outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s;
        }
        .rpg-input:focus { border-color: rgba(255,215,0,0.5); }
        .rpg-hint { color: #605040; font-size: 11px; }
        .rpg-status {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; font-size: 13px;
        }
        .rpg-status--loading { background: rgba(0,0,0,0.3); border: 1px solid rgba(139,90,43,0.3); color: #a09070; }
        .rpg-status--success { background: rgba(0,40,0,0.4); border: 1px solid rgba(74,222,128,0.35); color: #4ade80; }
        .rpg-status--error { background: rgba(40,0,0,0.4); border: 1px solid rgba(239,68,68,0.35); color: #f87171; }
        .rpg-status-title { font-weight: 600; font-size: 13px; }
        .rpg-status-username { color: white; font-size: 15px; font-weight: 700; margin-top: 2px; }
        .rpg-divider { border-top: 1px solid rgba(139,90,43,0.3); text-align: center; position: relative; margin: 4px 0; }
        .rpg-divider span {
          position: relative; top: -10px; background: rgba(18,10,4,1);
          padding: 0 12px; color: #806040; font-size: 11px; letter-spacing: 0.1em;
        }
        .rpg-summary { display: flex; flex-direction: column; gap: 8px; }
        .rpg-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px; color: #806040;
        }
        .rpg-summary-total {
          border-top: 1px solid rgba(139,90,43,0.3); padding-top: 10px;
          margin-top: 4px; color: #a09070; font-size: 14px;
        }
        .rpg-pay-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(180deg, #9B7A1A 0%, #7A5C0F 50%, #5A3E08 100%);
          border: 2px solid #c4921e; color: #FFD700; font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: top 0.1s; box-shadow: 0 4px 0 #4a3508; position: relative; top: 0;
        }
        .rpg-pay-btn:hover:not(.rpg-pay-btn--disabled) { top: 2px; box-shadow: 0 2px 0 #4a3508; }
        .rpg-pay-btn--disabled {
          background: rgba(60,40,20,0.4); border-color: rgba(139,90,43,0.2);
          color: #605040; cursor: not-allowed; box-shadow: none;
        }
        .rpg-secure-note { color: #605040; font-size: 11px; text-align: center; margin: 0; }
        .rpg-back-btn {
          width: 100%; padding: 10px; background: transparent;
          border: 1px solid rgba(139,90,43,0.3); color: #806040; font-size: 12px;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .rpg-back-btn:hover { border-color: rgba(139,90,43,0.6); color: #a09070; }
      `}</style>
    </PageWrapper>
  );
}