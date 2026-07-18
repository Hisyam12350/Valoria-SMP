'use client';

import { useEffect, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { PageWrapper } from '@/components/page-wrapper';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Calendar, CreditCard, RefreshCw, ShoppingBag,
  ArrowLeft, Shield, AlertCircle, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  order_id: string;
  uuid: string;
  username: string;
  product_name: string;
  slug: string;
  category: string;
  price: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const { player, loading: playerLoading, openLoginModal, refreshPlayerStats } = usePlayer();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorTx, setErrorTx] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // Fetch transactions on mount/player state load
  const fetchTransactions = async () => {
    if (!player) return;
    setLoadingTx(true);
    setErrorTx(null);
    refreshPlayerStats(); // Ambil statistik terbaru (poin/money) dari Supabase
    try {
      const res = await fetch(`/api/player/transactions?username=${encodeURIComponent(player.username)}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setVisibleCount(5); // Reset limit to 5 on fresh load
      } else {
        setErrorTx(data.error || 'Gagal mengambil riwayat transaksi');
      }
    } catch (err) {
      setErrorTx('Koneksi gagal, silakan coba lagi');
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (player?.username) {
      fetchTransactions();
    }
  }, [player?.username]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sukses
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-500/5">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending
          </span>
        );
      case 'failed':
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-500/5">
            <XCircle className="w-3.5 h-3.5" /> Gagal
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  const getRankColor = (rank: string | null | undefined) => {
    if (!rank) return 'text-gray-300';
    const r = rank.toLowerCase();
    if (r === 'sovereign') return 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]';
    if (r === 'ethereal') return 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]';
    if (r === 'crystall') return 'text-pink-400';
    if (r === 'astra') return 'text-purple-400';
    if (r === 'valiant') return 'text-blue-400';
    if (r === 'street') return 'text-gray-400';
    return 'text-gray-300';
  };

  if (playerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm font-medium text-gray-400 font-minecraft">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] max-w-lg mx-auto flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full text-center p-8 rounded-2xl glass-dark border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
            }}
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-bold font-minecraft text-white mb-2">LOGIN PLAYER DIPERLUKAN</h2>
            <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
              Silakan login menggunakan akun Minecraft (Java/Bedrock) Anda untuk melihat data profil dan riwayat transaksi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 text-white">
                <ArrowLeft className="w-4 h-4" /> Kembali Ke Home
              </Link>
              <button
                onClick={() => openLoginModal()}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-emerald-500/20 transition-all select-none hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                }}
              >
                Masuk Akun Player
              </button>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 mt-12">
        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          }}
        >
          {/* Decorative Minecraft grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 z-10">
            {/* 3D Skin Render Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 opacity-30 group-hover:opacity-60 blur transition duration-500" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-black/40 rounded-2xl border border-white/10 p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://mc-heads.net/body/${player.username}`}
                  alt={player.username}
                  className="h-28 object-contain scale-110 transition duration-500"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {player.username.startsWith('.') ? (
                    <>
                      <span className="font-minecraft mr-[-0.25em]">.</span>
                      <span className="font-minecraft">{player.username.substring(1).trim()}</span>
                    </>
                  ) : (
                    <span className="font-minecraft">{player.username}</span>
                  )}
                </h1>
                <span className="inline-flex self-center items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> {player.username.startsWith('.') ? 'Bedrock Edition' : 'Java Edition'}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-400">
                Pangkat Server: <span className={`font-minecraft text-sm ${getRankColor(player.rank)}`}>{player.rank}</span>
              </p>

            </div>
          </div>
        </motion.div>

        {/* Transactions History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 30, 50, 0.8) 100%)',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h2 className="text-lg font-minecraft text-amber-400 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" /> RIWAYAT TRANSAKSI
            </h2>
            <button
              onClick={fetchTransactions}
              disabled={loadingTx}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400 hover:text-white disabled:opacity-50 flex items-center gap-1 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTx ? 'animate-spin' : ''}`} /> Perbarui
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loadingTx ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-gray-400 flex flex-col items-center gap-2"
              >
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs font-semibold">Mengambil data transaksi...</span>
              </motion.div>
            ) : errorTx ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-red-400 flex flex-col items-center gap-2"
              >
                <AlertCircle className="w-6 h-6" />
                <span className="text-xs font-semibold">{errorTx}</span>
              </motion.div>
            ) : transactions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-gray-400 flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-gray-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Belum Ada Transaksi</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Anda belum pernah melakukan pembelian item di web store Valoria SMP.
                  </p>
                </div>
                <Link href="/store" className="mt-2 px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl transition-all shadow-md">
                  Kunjungi Web Store
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Desktop Table view / Mobile card list */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/10 uppercase tracking-wider font-semibold">
                        <th className="pb-3 pr-2">ID Order</th>
                        <th className="pb-3 pr-2">Produk</th>
                        <th className="pb-3 pr-2">Harga</th>
                        <th className="pb-3 pr-2">Metode</th>
                        <th className="pb-3 pr-2">Status</th>
                        <th className="pb-3">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white font-medium">
                      {transactions.slice(0, visibleCount).map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 pr-2 font-mono font-bold text-amber-400/90">{tx.order_id}</td>
                          <td className="py-4 pr-2">{tx.product_name}</td>
                          <td className="py-4 pr-2 font-bold text-emerald-400">
                            Rp {tx.price.toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 pr-2 capitalize">{tx.payment_method}</td>
                          <td className="py-4 pr-2">{getStatusBadge(tx.status)}</td>
                          <td className="py-4 text-gray-400">
                            {new Date(tx.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} WIB
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile list representation */}
                <div className="block md:hidden space-y-3">
                  {transactions.slice(0, visibleCount).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">{tx.order_id}</span>
                        {getStatusBadge(tx.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">{tx.product_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{tx.payment_method}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                        <span className="text-sm font-bold text-emerald-400">
                          Rp {tx.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tx.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Buttons */}
                {(visibleCount < transactions.length || visibleCount > 5) && (
                  <div className="flex justify-center gap-3 pt-4">
                    {visibleCount > 5 && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(5)}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                      >
                        Tampilkan Lebih Sedikit
                      </button>
                    )}
                    {visibleCount < transactions.length && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(prev => prev + 5)}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                      >
                        Tampilkan Lebih Banyak
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
