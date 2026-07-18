'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Loader2, Sparkles, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

interface PlayerData {
  username: string;
  uuid: string;
  rank: string;
  points: number;
  money: number;
}

interface PlayerContextType {
  player: PlayerData | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  logout: () => void;
  refreshPlayerStats: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load player from localStorage on mount
  useEffect(() => {
    const savedPlayer = localStorage.getItem('valoria_player');
    if (savedPlayer) {
      try {
        setPlayer(JSON.parse(savedPlayer));
      } catch (e) {
        console.error('Failed to parse saved player', e);
        localStorage.removeItem('valoria_player');
      }
    }
    setLoading(false);
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const logout = useCallback(() => {
    localStorage.removeItem('valoria_player');
    setPlayer(null);
  }, []);

  const refreshPlayerStats = useCallback(async () => {
    if (!player) return;
    try {
      const res = await fetch('/api/check-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: player.username }),
      });
      const data = await res.json();
      if (data.found && data.player) {
        const updatedPlayer = {
          username: data.player.username,
          uuid: data.user.uuid,
          rank: data.player.rank || "Member",
          points: data.player.points ?? 0,
          money: data.player.money ?? 0,
        };
        setPlayer(updatedPlayer);
        localStorage.setItem('valoria_player', JSON.stringify(updatedPlayer));
      }
    } catch (err) {
      console.error('Failed to refresh player stats', err);
    }
  }, [player]);

  return (
    <PlayerContext.Provider
      value={{
        player,
        loading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        logout,
        refreshPlayerStats,
      }}
    >
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={(data) => {
          setPlayer(data);
          localStorage.setItem('valoria_player', JSON.stringify(data));
          closeLoginModal();
        }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

// ── Login Modal Component ────────────────────────────────────────────────────
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (player: PlayerData) => void;
}

function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [edition, setEdition] = useState<'java' | 'bedrock'>('java');
  const [usernameInput, setUsernameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUsernameInput('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const name = usernameInput.trim();
    if (!name) {
      setErrorMsg('Username tidak boleh kosong');
      return;
    }

    // Format username berdasarkan edisi game
    let finalUsername = name;
    if (edition === 'bedrock') {
      // Bedrock login wajib diawali dengan titik (.)
      if (!name.startsWith('.')) {
        finalUsername = `.${name}`;
      }
    } else {
      // Java login dilarang diawali dengan titik (.) jika tidak sengaja terinput
      if (name.startsWith('.')) {
        setErrorMsg('Username Java tidak boleh diawali dengan titik (.)');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/check-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: finalUsername }),
      });

      const data = await response.json();

      if (!response.ok || !data.found) {
        throw new Error(data.error || 'Player tidak terdaftar di server');
      }

      setSuccessMsg(`Berhasil login sebagai ${data.user.username}!`);
      
      // Delay sedikit agar user bisa melihat status sukses
      setTimeout(() => {
        onLoginSuccess({
          username: data.user.username,
          uuid: data.user.uuid,
          rank: data.player.rank || "Member",
          points: data.player.points ?? 0,
          money: data.player.money ?? 0,
        });
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi gagal, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl glass-dark border border-white/10 p-6 text-white shadow-2xl z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-lg font-bold font-minecraft text-amber-400">LOGIN PLAYER</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edition Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-black/40 border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setEdition('java');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  edition === 'java'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Java Edition
              </button>
              <button
                type="button"
                onClick={() => {
                  setEdition('bedrock');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  edition === 'bedrock'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Bedrock Edition
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Username Minecraft {edition === 'bedrock' ? '(Bedrock)' : '(Java)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  {edition === 'bedrock' && (
                    <span className="absolute inset-y-0 left-8 flex items-center text-emerald-400 font-bold select-none">
                      .
                    </span>
                  )}
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Hapus titik di depan input user jika mereka mengetik manual untuk Bedrock agar tidak dobel
                      if (edition === 'bedrock' && val.startsWith('.')) {
                        val = val.substring(1);
                      }
                      setUsernameInput(val);
                    }}
                    placeholder={
                      edition === 'bedrock'
                        ? "Username tanpa tanda titik"
                        : "Masukkan username Java"
                    }
                    className={`w-full bg-black/30 border rounded-xl py-3 text-sm text-white outline-none transition-all ${
                      edition === 'bedrock' ? 'pl-11 pr-4' : 'pl-10 pr-4'
                    } ${
                      errorMsg
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                        : 'border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                    }`}
                  />
                </div>
                {edition === 'bedrock' && (
                  <p className="text-[11px] text-gray-400 mt-2">
                    * Edisi Bedrock secara otomatis akan ditambahkan awalan titik <span className="text-emerald-400 font-bold">.</span> saat verifikasi (misal: <span className="text-emerald-400">.{usernameInput || 'Username'}</span>).
                  </p>
                )}
              </div>

              {/* Status Alert */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || !!successMsg}
                className="w-full relative flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm tracking-wide text-white overflow-hidden shadow-lg select-none disabled:opacity-50"
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk ke Akun'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
