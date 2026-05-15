"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  User,
  Loader2,
} from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: object) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

const CF_SITE_KEY = "1x00000000000000000000AA";// dev test key

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReady, setCaptchaReady] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>("");

  // Render CAPTCHA widget when ready
  useEffect(() => {
    const timer = setInterval(() => {
      if (
        captchaRef.current &&
        typeof window !== "undefined" &&
        window.turnstile
      ) {
        clearInterval(timer);

        try {
          if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
          }

          widgetIdRef.current = window.turnstile.render(captchaRef.current, {
            sitekey: CF_SITE_KEY,
            theme: "dark",
            callback: (token: string) => setCaptchaToken(token),
            "expired-callback": () => setCaptchaToken(""),
            "error-callback": () => setCaptchaToken(""),
          });

          setCaptchaReady(true);
        } catch (err) {
          console.error("Turnstile render error:", err);
        }
      }
    }, 300);

    return () => clearInterval(timer);
  }, []);

  const resetCaptcha = useCallback(() => {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
      setCaptchaToken("");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    if (!captchaToken) {
      setError("Selesaikan verifikasi CAPTCHA terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        setError(data.error || "Login gagal.");
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        resetCaptcha();
        return;
      }

      // Success - redirect to dashboard
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #060d1f 100%)",
      }}
    >
      {/* Animated background grid */}
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{
            background: "rgba(10, 14, 26, 0.9)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 0 80px rgba(16,185,129,0.08), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top bar */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, #10b981, #059669, #34d399, #10b981)",
              backgroundSize: "200%",
            }}
          />

          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h1
                className="text-2xl font-bold text-white font-minecraft text-center"
                style={{ fontSize: "1.1rem" }}
              >
                <span className="text-amber-400">VALORIA</span>{" "}
                <span className="text-white">ADMIN</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Panel Administrasi</p>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{error}</p>
                      {remainingAttempts !== null && remainingAttempts > 0 && (
                        <p className="text-xs mt-1 text-red-300/70">
                          Sisa percobaan: {remainingAttempts}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(16,185,129,0.5)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(16,185,129,0.5)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Cloudflare Turnstile CAPTCHA */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                  Verifikasi Keamanan
                </label>
                <div className="flex justify-center">
                  <div ref={captchaRef} />
                </div>
                {!captchaReady && (
                  <div className="flex items-center justify-center gap-2 py-3 text-gray-500 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Memuat CAPTCHA...
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-2 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 20px rgba(16,185,129,0.3)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-600 mt-6">
              Halaman ini dilindungi oleh Cloudflare Turnstile
            </p>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-4">
          <a
            href="/"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Kembali ke Website
          </a>
        </div>
      </motion.div>
      <Script
        id="cf-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Turnstile loaded");
          setCaptchaReady(true);
        }}
        onError={() => {
          console.error("Turnstile gagal dimuat");
        }}
      />
    </div>
  );
}
