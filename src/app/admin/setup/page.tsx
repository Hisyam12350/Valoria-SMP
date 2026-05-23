"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    setupKey: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    // Validasi di client
    if (!form.setupKey || !form.username || !form.email || !form.password) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    if (form.password.length < 12) {
      setError("Password minimal 12 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-setup-key": form.setupKey,
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 3000);
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #060d1f 100%)",
      }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{
            background: "rgba(10, 14, 26, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 0 80px rgba(16,185,129,0.08), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top bar */}
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #d97706, #fbbf24)",
            }}
          />

          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.3)",
                }}
              >
                <Shield className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Setup Admin Pertama
              </h1>
              <p className="text-gray-400 text-sm mt-1 text-center">
                Buat akun superadmin untuk VALORIA SMP
              </p>
            </div>

            {/* Success state */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-6"
                >
                  <CheckCircle className="w-16 h-16 text-emerald-400" />
                  <p className="text-emerald-400 font-semibold text-lg">
                    Superadmin Berhasil Dibuat!
                  </p>
                  <p className="text-gray-400 text-sm text-center">
                    Kamu akan diarahkan ke halaman login dalam 3 detik...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            {!success && (
              <div className="space-y-4">
                {/* Warning */}
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-xs text-amber-300"
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p>
                    Halaman ini hanya bisa dipakai <strong>sekali</strong>.
                    Setelah superadmin dibuat, halaman ini otomatis tidak bisa
                    diakses lagi.
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl text-red-400 text-sm"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Setup Key */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    Setup Key <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.setupKey}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, setupKey: e.target.value }))
                    }
                    placeholder="Isi dengan ADMIN_SETUP_KEY dari Vercel"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, username: e.target.value }))
                    }
                    placeholder="Contoh: superadmin"
                    autoCapitalize="none"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="emailkamu@gmail.com"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    Password{" "}
                    <span className="text-gray-500">(min. 12 karakter)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="Buat password yang kuat"
                      className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {form.password && (
                    <div className="flex gap-1 mt-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{
                            background:
                              form.password.length >= [8, 12, 16, 20][i]
                                ? ["#ef4444", "#f59e0b", "#10b981", "#10b981"][
                                    i
                                  ]
                                : "rgba(255,255,255,0.1)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Ulangi password"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${
                        form.confirmPassword &&
                        form.password !== form.confirmPassword
                          ? "rgba(239,68,68,0.5)"
                          : form.confirmPassword &&
                              form.password === form.confirmPassword
                            ? "rgba(16,185,129,0.5)"
                            : "rgba(255,255,255,0.1)"
                      }`,
                    }}
                  />
                  {form.confirmPassword &&
                    form.password !== form.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">
                        Password tidak sama
                      </p>
                    )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Membuat Superadmin...
                    </span>
                  ) : (
                    "Buat Superadmin"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/">
            <a className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              ← Kembali ke Website
            </a>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
