"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Tag,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/page-wrapper";
import { Turnstile } from "@marsidev/react-turnstile";

type ProductType = "rank" | "money" | "points" | "skill";

type Product = {
  name: string;
  slug: string;
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
  moneyAmount?: string;
  pointsAmount?: string;
  skillName?: string;
  skillLevel?: number;
};

type PaymentMethod = {
  id: string;
  label: string;
  icon: string;
  category: "ewallet" | "bank" | "store" | "paylater";
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "gopay",
    label: "GoPay",
    icon: "/icons/payment/gopay.jpg",
    category: "ewallet",
  },
  {
    id: "qris",
    label: "QRIS",
    icon: "/icons/payment/qris.jpg",
    category: "ewallet",
  },
  {
    id: "shopeepay",
    label: "ShopeePay",
    icon: "/icons/payment/shopeepay.jpg",
    category: "ewallet",
  },
  {
    id: "dana",
    label: "DANA",
    icon: "/icons/payment/dana.jpg",
    category: "ewallet",
  },
  {
    id: "ovo",
    label: "OVO",
    icon: "/icons/payment/ovo.jpg",
    category: "ewallet",
  },
  { id: "bca", label: "BCA", icon: "/icons/payment/bca.jpg", category: "bank" },
  { id: "bni", label: "BNI", icon: "/icons/payment/bni.jpg", category: "bank" },
  { id: "bri", label: "BRI", icon: "/icons/payment/bri.jpg", category: "bank" },
  {
    id: "mandiri",
    label: "Mandiri",
    icon: "/icons/payment/mandiri.jpg",
    category: "bank",
  },
  {
    id: "permata",
    label: "Permata",
    icon: "/icons/payment/permata.jpg",
    category: "bank",
  },
  {
    id: "cimb",
    label: "CIMB",
    icon: "/icons/payment/cimb.jpg",
    category: "bank",
  },
  {
    id: "indomaret",
    label: "Indomaret",
    icon: "/icons/payment/indomaret.jpg",
    category: "store",
  },
  {
    id: "alfamart",
    label: "Alfamart",
    icon: "/icons/payment/alfamart.jpg",
    category: "store",
  },
  {
    id: "akulaku",
    label: "Akulaku",
    icon: "/icons/payment/akulaku.jpg",
    category: "paylater",
  },
  {
    id: "kredivo",
    label: "Kredivo",
    icon: "/icons/payment/kredivo.jpg",
    category: "paylater",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  ewallet: "E-Wallet",
  bank: "Transfer Bank",
  store: "Minimarket",
  paylater: "Paylater",
};

const SKILL_PRICE_PER_LEVEL = 5000;

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function calculateDiscountedPrice(
  originalPrice: number,
  discount: number,
): number {
  return Math.floor(originalPrice * (1 - discount / 100));
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [productType, setProductType] = useState<ProductType>("rank");
  const [pageError, setPageError] = useState("");

  const [username, setUsername] = useState("");
  const [uuid, setUuid] = useState("");
  const [isCheckingPlayer, setIsCheckingPlayer] = useState(false);
  const [isPlayerFound, setIsPlayerFound] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherFinalPrice, setVoucherFinalPrice] = useState<number | null>(
    null,
  );

  const leftRef = useRef<HTMLDivElement>(null);

  const [turnstileToken, setTurnstileToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      if (slug.startsWith("money-")) {
        setProductType("money");
        const moneySlug = slug.replace("money-", "");
        const res = await fetch("/api/store/get-money");
        const data = await res.json();
        if (!data.success) {
          setPageError("Paket money tidak ditemukan");
          return;
        }
        const item = data.money.find((m: any) => m.slug === moneySlug);
        if (!item) {
          setPageError("Paket money tidak ditemukan");
          return;
        }
        setProduct({
          name: `${item.money} In-Game Money`,
          slug: slug,
          originalPriceNum: item.harga,
          discount: 0,
          color: item.color,
          gradient: item.gradient,
          moneyAmount: item.money,
        });
      } else if (slug.startsWith("points-")) {
        setProductType("points");
        const pointsSlug = slug.replace("points-", "");
        const res = await fetch("/api/store/get-points");
        const data = await res.json();
        if (!data.success) {
          setPageError("Paket points tidak ditemukan");
          return;
        }
        const item = data.points.find((p: any) => p.slug === pointsSlug);
        if (!item) {
          setPageError("Paket points tidak ditemukan");
          return;
        }
        setProduct({
          name: `${item.points} Points`,
          slug: slug,
          originalPriceNum: item.harga,
          discount: 0,
          color: item.color,
          gradient: item.gradient,
          pointsAmount: item.points,
        });
      } else if (slug.startsWith("skill-")) {
        setProductType("skill");
        const skillName = slug.replace("skill-", "").replace(/-/g, " ");
        const searchParams = new URLSearchParams(window.location.search);
        const level = parseInt(searchParams.get("level") || "1");
        setProduct({
          name: `Skill ${skillName} x${level} Level`,
          slug: slug,
          originalPriceNum: level * SKILL_PRICE_PER_LEVEL,
          discount: 0,
          gradient: "from-purple-500 to-violet-600",
          skillName: skillName,
          skillLevel: level,
        });
      } else {
        setProductType("rank");
        const res = await fetch("/api/store/get-rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        if (!data.success) {
          setPageError("Rank tidak ditemukan");
          return;
        }
        setProduct(data.rank);
      }
    } catch {
      setPageError("Gagal mengambil data produk");
    }
  };

  const getGradientStyle = (gradient?: string) => {
    if (!gradient)
      return {
        card: "rgba(15,20,35,0.92)",
        border: "rgba(255,255,255,0.12)",
        header: "rgba(255,255,255,0.06)",
      };
    const colorMap: Record<
      string,
      { card: string; border: string; header: string }
    > = {
      gray: {
        card: "rgba(20,20,25,0.95)",
        border: "rgba(150,150,170,0.4)",
        header: "rgba(100,100,120,0.2)",
      },
      blue: {
        card: "rgba(10,20,45,0.95)",
        border: "rgba(59,130,246,0.5)",
        header: "rgba(59,130,246,0.15)",
      },
      indigo: {
        card: "rgba(15,15,50,0.95)",
        border: "rgba(99,102,241,0.5)",
        header: "rgba(99,102,241,0.15)",
      },
      violet: {
        card: "rgba(20,10,45,0.95)",
        border: "rgba(139,92,246,0.5)",
        header: "rgba(139,92,246,0.15)",
      },
      purple: {
        card: "rgba(25,10,45,0.95)",
        border: "rgba(168,85,247,0.5)",
        header: "rgba(168,85,247,0.15)",
      },
      fuchsia: {
        card: "rgba(35,10,40,0.95)",
        border: "rgba(217,70,239,0.5)",
        header: "rgba(217,70,239,0.15)",
      },
      pink: {
        card: "rgba(40,10,30,0.95)",
        border: "rgba(236,72,153,0.5)",
        header: "rgba(236,72,153,0.15)",
      },
      rose: {
        card: "rgba(40,10,20,0.95)",
        border: "rgba(244,63,94,0.5)",
        header: "rgba(244,63,94,0.15)",
      },
      red: {
        card: "rgba(40,10,10,0.95)",
        border: "rgba(239,68,68,0.5)",
        header: "rgba(239,68,68,0.15)",
      },
      orange: {
        card: "rgba(40,20,10,0.95)",
        border: "rgba(249,115,22,0.5)",
        header: "rgba(249,115,22,0.15)",
      },
      amber: {
        card: "rgba(40,25,5,0.95)",
        border: "rgba(245,158,11,0.5)",
        header: "rgba(245,158,11,0.15)",
      },
      yellow: {
        card: "rgba(35,30,5,0.95)",
        border: "rgba(234,179,8,0.5)",
        header: "rgba(234,179,8,0.15)",
      },
      lime: {
        card: "rgba(15,35,5,0.95)",
        border: "rgba(132,204,22,0.5)",
        header: "rgba(132,204,22,0.15)",
      },
      green: {
        card: "rgba(10,35,15,0.95)",
        border: "rgba(34,197,94,0.5)",
        header: "rgba(34,197,94,0.15)",
      },
      emerald: {
        card: "rgba(5,35,25,0.95)",
        border: "rgba(16,185,129,0.5)",
        header: "rgba(16,185,129,0.15)",
      },
      teal: {
        card: "rgba(5,30,30,0.95)",
        border: "rgba(20,184,166,0.5)",
        header: "rgba(20,184,166,0.15)",
      },
      cyan: {
        card: "rgba(5,25,35,0.95)",
        border: "rgba(6,182,212,0.5)",
        header: "rgba(6,182,212,0.15)",
      },
    };
    for (const [key, val] of Object.entries(colorMap)) {
      if (gradient.includes(key)) return val;
    }
    return {
      card: "rgba(15,20,35,0.92)",
      border: "rgba(255,255,255,0.12)",
      header: "rgba(255,255,255,0.06)",
    };
  };

  const checkPlayer = async (value: string) => {
    if (!value.trim()) {
      setUuid("");
      setIsPlayerFound(false);
      return;
    }
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
    } catch {
      setIsPlayerFound(false);
    } finally {
      setIsCheckingPlayer(false);
    }
  };

  const checkVoucher = async () => {
    if (!voucherCode.trim() || !product) return;
    try {
      setIsCheckingVoucher(true);
      setVoucherApplied(false);
      setVoucherMessage("");
      const basePrice = calculateDiscountedPrice(
        product.originalPriceNum,
        product.discount ?? 0,
      );
      const res = await fetch("/api/voucher/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode, price: basePrice }),
      });
      const data = await res.json();
      if (data.valid) {
        setVoucherApplied(true);
        setVoucherMessage(data.message);
        setDiscountAmount(data.discountAmount);
        setVoucherFinalPrice(data.finalPrice);
        toast({ title: "Voucher berhasil!", description: data.message });
      } else {
        setVoucherApplied(false);
        setVoucherMessage(data.message ?? "Voucher tidak valid");
        setDiscountAmount(0);
        setVoucherFinalPrice(null);
      }
    } catch {
      setVoucherMessage("Gagal mengecek voucher");
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setVoucherCode("");
    setVoucherApplied(false);
    setVoucherMessage("");
    setDiscountAmount(0);
    setVoucherFinalPrice(null);
  };

  const getProductIcon = () => {
    if (productType === "money") return "💰";
    if (productType === "points") return "⭐";
    if (productType === "skill") return "⚡";
    return "👑";
  };

  const getProductTitle = () => {
    if (productType === "money") return "MONEY CHECKOUT";
    if (productType === "points") return "POINTS CHECKOUT";
    if (productType === "skill") return "SKILL CHECKOUT";
    return "RANK CHECKOUT";
  };

  const handlePayment = async () => {
    if (!product || !isPlayerFound || !selectedMethod) return;
    try {
      setIsLoading(true);
      const basePrice = calculateDiscountedPrice(
        product.originalPriceNum,
        product.discount ?? 0,
      );
      const finalPrice = voucherFinalPrice ?? basePrice;

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          username,
          productName: product.name,
          slug: product.slug,
          price: finalPrice,
          paymentMethod: selectedMethod,
          voucherCode: voucherApplied ? voucherCode : undefined,
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast({
          title: "Gagal",
          description: data.error ?? "Gagal membuat transaksi",
          variant: "destructive",
        });
        return;
      }

      const tx = data.data;

      if (["gopay", "shopeepay", "ovo", "dana"].includes(selectedMethod)) {
        const deeplink = tx.actions?.find(
          (a: any) => a.name === "deeplink-redirect",
        )?.url;
        const qr = tx.actions?.find(
          (a: any) => a.name === "generate-qr-code",
        )?.url;
        if (deeplink) window.location.href = deeplink;
        else if (qr) window.location.href = qr;
        else
          toast({
            title: "Info",
            description:
              "Cek app e-wallet kamu untuk menyelesaikan pembayaran.",
          });
      } else if (selectedMethod === "qris") {
        const qr = tx.actions?.find(
          (a: any) => a.name === "generate-qr-code",
        )?.url;
        if (qr)
          router.push(
            `/payment/instruction?orderId=${data.orderId}&method=qris&qrUrl=${encodeURIComponent(qr)}`,
          );
      } else if (["indomaret", "alfamart"].includes(selectedMethod)) {
        router.push(
          `/payment/instruction?orderId=${data.orderId}&method=${selectedMethod}&paymentCode=${tx.payment_code}`,
        );
      } else if (["akulaku", "kredivo"].includes(selectedMethod)) {
        const redirect = tx.actions?.find(
          (a: any) => a.name === "redirect-url",
        )?.url;
        if (redirect) window.location.href = redirect;
      } else {
        const vaNumber = tx.va_numbers?.[0]?.va_number || tx.bill_key || "";
        router.push(
          `/payment/instruction?orderId=${data.orderId}&method=${selectedMethod}&vaNumber=${vaNumber}&amount=${finalPrice}`,
        );
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const grouped = PAYMENT_METHODS.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {} as Record<string, PaymentMethod[]>,
  );

  const visibleCategories = showAll
    ? Object.keys(grouped)
    : ["ewallet", "bank"];

  if (pageError) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">{pageError}</h1>
            <button
              onClick={() => router.back()}
              className="rpg-back-btn"
              style={{ width: "auto", padding: "10px 24px" }}
            >
              ← Kembali ke Store
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-amber-700 text-sm">Memuat data produk...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const basePrice = calculateDiscountedPrice(
    product.originalPriceNum,
    product.discount ?? 0,
  );
  const finalPrice = voucherFinalPrice ?? basePrice;
  const canPay = isPlayerFound && !!selectedMethod && !isLoading && isVerified;

  return (
    <PageWrapper>
      <div className="rpg-page">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rpg-title-wrap"
        >
          <div className="rpg-title-box">
            <span>⚔</span>
            <h1 className="rpg-title">{getProductTitle()}</h1>
            <span>⚔</span>
          </div>
          <p className="rpg-subtitle">
            Pilih metode pembayaran & dapatkan itemmu
          </p>
        </motion.div>

        <div className="rpg-grid">
          {/* LEFT — Product Info */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rpg-left-col"
          >
            <div
              className="rpg-card"
              style={{
                background: getGradientStyle(product.gradient).card,
                border: `2px solid ${getGradientStyle(product.gradient).border}`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 40px ${getGradientStyle(product.gradient).border}`,
              }}
            >
              <div
                className="rpg-card-header"
                style={{
                  background: getGradientStyle(product.gradient).header,
                  borderBottom: `1px solid ${getGradientStyle(product.gradient).border}`,
                }}
              >
                <div
                  className="rpg-rank-icon"
                  style={{
                    border: `1px solid ${getGradientStyle(product.gradient).border}`,
                    background: getGradientStyle(product.gradient).header,
                  }}
                >
                  {getProductIcon()}
                </div>
                <div>
                  <div className="rpg-rank-name">{product.name}</div>
                  <div className="rpg-rank-sub">
                    {productType === "rank" && "Permanent Rank"}
                    {productType === "money" && "In-Game Currency"}
                    {productType === "points" && "Server Points"}
                    {productType === "skill" &&
                      `${product.skillLevel} Level Upgrade`}
                  </div>
                </div>
                {(product.discount ?? 0) > 0 && (
                  <div className="rpg-discount-badge">
                    -{product.discount}% OFF
                  </div>
                )}
              </div>

              {/* Detail spesifik per tipe */}
              {productType === "rank" &&
                product.features &&
                product.features.length > 0 && (
                  <div className="rpg-section">
                    <div className="rpg-section-label">
                      Commands & Abilities
                    </div>
                    <div className="rpg-tags">
                      {product.features.map((f) => (
                        <span key={f} className="rpg-tag">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {productType === "rank" && product.bonus && (
                <div className="rpg-section">
                  <div className="rpg-section-label">Bonus Stats</div>
                  <div className="rpg-stats-grid">
                    {product.bonus.claimblock && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">🎁</span>
                        <span className="rpg-stat-label">Claimblock</span>
                        <span className="rpg-stat-val">
                          {product.bonus.claimblock}
                        </span>
                      </div>
                    )}
                    {product.bonus.claim && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">📌</span>
                        <span className="rpg-stat-label">Claim</span>
                        <span className="rpg-stat-val">
                          {product.bonus.claim}
                        </span>
                      </div>
                    )}
                    {product.bonus.sethome && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">🏠</span>
                        <span className="rpg-stat-label">Sethome</span>
                        <span className="rpg-stat-val">
                          {product.bonus.sethome}
                        </span>
                      </div>
                    )}
                    {product.bonus.money && (
                      <div className="rpg-stat-item">
                        <span className="rpg-stat-icon">💰</span>
                        <span className="rpg-stat-label">Starter Money</span>
                        <span className="rpg-stat-val">
                          {product.bonus.money}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {productType === "money" && (
                <div className="rpg-section">
                  <div className="rpg-section-label">Detail Paket</div>
                  <div className="rpg-stats-grid">
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">💰</span>
                      <span className="rpg-stat-label">Jumlah Money</span>
                      <span className="rpg-stat-val">
                        {product.moneyAmount}
                      </span>
                    </div>
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">⚡</span>
                      <span className="rpg-stat-label">Pengiriman</span>
                      <span className="rpg-stat-val">Instant</span>
                    </div>
                  </div>
                </div>
              )}

              {productType === "points" && (
                <div className="rpg-section">
                  <div className="rpg-section-label">Detail Paket</div>
                  <div className="rpg-stats-grid">
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">⭐</span>
                      <span className="rpg-stat-label">Jumlah Points</span>
                      <span className="rpg-stat-val">
                        {product.pointsAmount}
                      </span>
                    </div>
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">⚡</span>
                      <span className="rpg-stat-label">Pengiriman</span>
                      <span className="rpg-stat-val">Instant</span>
                    </div>
                  </div>
                </div>
              )}

              {productType === "skill" && (
                <div className="rpg-section">
                  <div className="rpg-section-label">Detail Upgrade</div>
                  <div className="rpg-stats-grid">
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">⚡</span>
                      <span className="rpg-stat-label">Skill</span>
                      <span className="rpg-stat-val">{product.skillName}</span>
                    </div>
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">📈</span>
                      <span className="rpg-stat-label">Level</span>
                      <span className="rpg-stat-val">
                        +{product.skillLevel}
                      </span>
                    </div>
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">💰</span>
                      <span className="rpg-stat-label">Per Level</span>
                      <span className="rpg-stat-val">Rp 5.000</span>
                    </div>
                    <div className="rpg-stat-item">
                      <span className="rpg-stat-icon">⚡</span>
                      <span className="rpg-stat-label">Pengiriman</span>
                      <span className="rpg-stat-val">Instant</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rpg-price-row">
                <span className="rpg-price-label">Total Pembayaran</span>
                <div className="rpg-price-wrap">
                  {(product.discount ?? 0) > 0 && (
                    <span className="rpg-price-original">
                      {formatRupiah(product.originalPriceNum)}
                    </span>
                  )}
                  {voucherApplied ? (
                    <>
                      <span
                        className="rpg-price-original"
                        style={{ color: "#604030" }}
                      >
                        {formatRupiah(basePrice)}
                      </span>
                      <span className="rpg-price-final">
                        {formatRupiah(finalPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="rpg-price-final">
                      {formatRupiah(basePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rpg-lore">
              <span className="rpg-lore-label">📜 Info</span>
              <p className="rpg-lore-text">
                {productType === "rank" &&
                  `"Dengan rank ${product.name}, kamu akan menjadi salah satu petualang terkuat di server. Kekuatan dan privilege menantimu di dunia VALORIA SMP."`}
                {productType === "money" &&
                  `"Dengan ${product.moneyAmount} in-game money, kamu bisa memulai petualangan ekonomi di dunia VALORIA SMP dengan modal yang cukup."`}
                {productType === "points" &&
                  `"Dengan ${product.pointsAmount} server points, kamu bisa menukarnya dengan berbagai reward eksklusif di VALORIA SMP."`}
                {productType === "skill" &&
                  `"Tingkatkan skill ${product.skillName} sebanyak ${product.skillLevel} level dan jadilah petualang yang lebih kuat di VALORIA SMP."`}
              </p>
            </div>
          </motion.div>

          {/* RIGHT — Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <div
              className="rpg-card"
              style={{
                background: getGradientStyle(product.gradient).card,
                border: `2px solid ${getGradientStyle(product.gradient).border}`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 40px ${getGradientStyle(product.gradient).border}`,
              }}
            >
              <div
                className="rpg-card-header"
                style={{
                  background: getGradientStyle(product.gradient).header,
                  borderBottom: `1px solid ${getGradientStyle(product.gradient).border}`,
                }}
              >
                <div>
                  <div className="rpg-form-title">Identitas Petualang</div>
                  <div className="rpg-rank-sub">
                    Masukkan username Minecraft kamu
                  </div>
                </div>
              </div>

              <div className="rpg-form-body">
                {/* Username */}
                <div className="rpg-field">
                  <label className="rpg-label">Username Minecraft</label>
                  <input
                    type="text"
                    placeholder="Contoh: Steve123"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      checkPlayer(e.target.value);
                    }}
                    className="rpg-input"
                  />
                  <span className="rpg-hint">
                    Harus sudah pernah join server VALORIA SMP
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {isCheckingPlayer && (
                    <motion.div
                      key="checking"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rpg-status rpg-status--loading"
                    >
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mencari petualang di database...</span>
                    </motion.div>
                  )}
                  {!isCheckingPlayer && username && isPlayerFound && (
                    <motion.div
                      key="found"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rpg-status rpg-status--success"
                    >
                      <CheckCircle2 size={15} />
                      <div>
                        <div className="rpg-status-title">
                          Petualang ditemukan
                        </div>
                        <div className="rpg-status-username">{username}</div>
                      </div>
                    </motion.div>
                  )}
                  {!isCheckingPlayer && username && !isPlayerFound && (
                    <motion.div
                      key="notfound"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rpg-status rpg-status--error"
                    >
                      <AlertCircle size={15} />
                      <div>
                        <div className="rpg-status-title">
                          Petualang tidak ditemukan
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.7 }}>
                          Pastikan username benar & sudah pernah join server
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Voucher */}
                <div className="rpg-divider">
                  <span>Voucher</span>
                </div>
                <div className="rpg-field">
                  <label className="rpg-label">
                    <Tag
                      size={11}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                    Kode Voucher (opsional)
                  </label>
                  {voucherApplied ? (
                    <div className="rpg-voucher-applied">
                      <CheckCircle2
                        size={14}
                        style={{ color: "#4ade80", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "#4ade80",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {voucherCode.toUpperCase()}
                        </div>
                        <div
                          style={{
                            color: "#4ade80",
                            fontSize: "11px",
                            opacity: 0.8,
                          }}
                        >
                          {voucherMessage}
                        </div>
                      </div>
                      <button
                        onClick={removeVoucher}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#806040",
                          padding: 4,
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="rpg-voucher-input-wrap">
                      <input
                        type="text"
                        placeholder="Masukkan kode voucher"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          setVoucherMessage("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && checkVoucher()}
                        className="rpg-input rpg-voucher-input"
                      />
                      <button
                        onClick={checkVoucher}
                        disabled={!voucherCode.trim() || isCheckingVoucher}
                        className="rpg-voucher-btn"
                      >
                        {isCheckingVoucher ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          "Pakai"
                        )}
                      </button>
                    </div>
                  )}
                  {voucherMessage && !voucherApplied && (
                    <span style={{ color: "#f87171", fontSize: "11px" }}>
                      {voucherMessage}
                    </span>
                  )}
                </div>

                {/* Metode */}
                <div className="rpg-divider">
                  <span>Metode Pembayaran</span>
                </div>
                <div className="rpg-methods">
                  {visibleCategories.map((cat) => (
                    <div key={cat}>
                      <div className="rpg-method-category">
                        {CATEGORY_LABELS[cat]}
                      </div>
                      <div className="rpg-method-grid">
                        {grouped[cat]?.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`rpg-method-btn ${selectedMethod === method.id ? "rpg-method-btn--active" : ""}`}
                          >
                            <img
                              src={method.icon}
                              alt={method.label}
                              className="rpg-method-icon"
                            />
                            <span className="rpg-method-label">
                              {method.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="rpg-show-more"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp size={13} /> Tampilkan lebih sedikit
                      </>
                    ) : (
                      <>
                        <ChevronDown size={13} /> Lihat semua metode
                        (Minimarket, Paylater)
                      </>
                    )}
                  </button>
                </div>

                {/* Summary */}
                <div className="rpg-divider">
                  <span>Order Summary</span>
                </div>
                <div className="rpg-summary">
                  <div className="rpg-summary-row">
                    <span>Item</span>
                    <span style={{ color: "#FFD700", fontWeight: 600 }}>
                      {product.name}
                    </span>
                  </div>
                  <div className="rpg-summary-row">
                    <span>Player</span>
                    <span style={{ color: "#d4a96a" }}>
                      {isPlayerFound ? username : "—"}
                    </span>
                  </div>
                  <div className="rpg-summary-row">
                    <span>Metode</span>
                    <span style={{ color: "#d4a96a" }}>
                      {selectedMethod
                        ? PAYMENT_METHODS.find((m) => m.id === selectedMethod)
                            ?.label
                        : "—"}
                    </span>
                  </div>
                  {voucherApplied && (
                    <div className="rpg-summary-row">
                      <span>Diskon Voucher</span>
                      <span style={{ color: "#4ade80" }}>
                        - {formatRupiah(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="rpg-summary-row rpg-summary-total">
                    <span>TOTAL</span>
                    <span className="rpg-price-final">
                      {formatRupiah(finalPrice)}
                    </span>
                  </div>
                </div>

                {/* Cloudflare Turnstile */}
                <div className="rpg-divider">
                  <span>Verifikasi</span>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setIsVerified(true);
                    }}
                    onExpire={() => {
                      setTurnstileToken("");
                      setIsVerified(false);
                    }}
                  />
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!canPay}
                  className={`rpg-pay-btn ${!canPay ? "rpg-pay-btn--disabled" : ""}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Memproses...
                    </>
                  ) : (
                    <>⚔ Bayar {formatRupiah(finalPrice)}</>
                  )}
                </button>

                <p className="rpg-secure-note">
                  🔒 Pembayaran aman via Midtrans · Item otomatis dikirim
                  setelah bayar
                </p>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="rpg-back-btn"
            >
              ← Kembali ke Store
            </button>
          </motion.div>
        </div>
      </div>

      <style>{`
        .rpg-page { min-height: 100vh; padding: 80px 16px 48px; font-family: 'Geist', 'Inter', sans-serif; }
        .rpg-title-wrap { text-align: center; margin-bottom: 36px; }
        .rpg-title-box { display: inline-flex; align-items: center; gap: 14px; background: rgba(15,20,35,0.9); border: 2px solid rgba(255,255,255,0.15); padding: 12px 32px; margin-bottom: 8px; font-size: 20px; }
        .rpg-title { font-family: var(--font-minecraft), monospace; font-size: clamp(14px, 3vw, 22px); color: #FFD700; text-shadow: 2px 2px 0 #8B4513; letter-spacing: 0.15em; margin: 0; }
        .rpg-subtitle { color: #64748b; font-size: 13px; }
        .rpg-grid { max-width: 980px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 720px) { .rpg-grid { grid-template-columns: 1fr; } }
        .rpg-left-col { }
        .rpg-card { background: linear-gradient(135deg, rgba(50,32,12,0.92) 0%, rgba(70,45,18,0.92) 100%); border: 2px solid rgba(180,120,50,0.6); box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 0 24px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 16px; }
        .rpg-card-header { display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, rgba(180,120,50,0.3), rgba(220,160,70,0.2), rgba(180,120,50,0.3)); border-bottom: 1px solid rgba(180,120,50,0.5); padding: 16px 20px; }
        .rpg-rank-icon { width: 48px; height: 48px; flex-shrink: 0; background: rgba(180,120,50,0.3); border: 2px solid rgba(180,120,50,0.6); display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .rpg-rank-name { font-family: var(--font-minecraft), monospace; font-size: clamp(14px, 2.5vw, 20px); color: #FFD700; text-shadow: 1px 1px 0 #8B4513; letter-spacing: 0.15em; }
        .rpg-rank-sub { color: #c49a5a; font-size: 12px; margin-top: 3px; }
        .rpg-discount-badge { margin-left: auto; background: #dc2626; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold; border: 1px solid #991b1b; flex-shrink: 0; }
        .rpg-section { padding: 14px 20px; border-bottom: 1px solid rgba(180,120,50,0.2); }
        .rpg-section-label { color: #c49a5a; font-size: 11px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase; }
        .rpg-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .rpg-tag { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; padding: 3px 9px; font-size: 12px; }
        .rpg-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .rpg-stat-item { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 12px; display: flex; flex-direction: column; gap: 3px; }
        .rpg-stat-icon { font-size: 14px; }
        .rpg-stat-label { color: #475569; font-size: 11px; }
        .rpg-stat-val { color: #4ade80; font-weight: 700; font-size: 14px; }
        .rpg-price-row { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .rpg-price-label { color: #a09070; font-size: 13px; }
        .rpg-price-wrap { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .rpg-price-original { color: #604030; font-size: 12px; text-decoration: line-through; }
        .rpg-price-final { font-family: var(--font-minecraft), monospace; color: #FFD700; font-size: clamp(13px, 2vw, 17px); text-shadow: 1px 1px 0 #8B4513; }
        .rpg-lore { background: rgba(50,32,12,0.7); border: 1px solid rgba(180,120,50,0.3); padding: 14px 16px; }
        .rpg-lore-label { display: block; color: #c49a5a; font-size: 11px; letter-spacing: 0.1em; margin-bottom: 8px; }
        .rpg-lore-text { color: #a08060; font-size: 13px; line-height: 1.7; margin: 0; font-style: italic; }
        .rpg-form-title { color: #FFD700; font-size: 16px; font-weight: 600; }
        .rpg-form-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .rpg-field { display: flex; flex-direction: column; gap: 6px; }
        .rpg-label { color: #c49a5a; font-size: 12px; letter-spacing: 0.08em; display: flex; align-items: center; }
        .rpg-input { background: rgba(30,18,6,0.7); border: 1px solid rgba(180,120,50,0.45); color: #FFD700; padding: 10px 14px; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit; }
        .rpg-input:focus { border-color: rgba(255,215,0,0.6); }
        .rpg-hint { color: #475569; font-size: 11px; }
        .rpg-voucher-input-wrap { display: flex; gap: 6px; }
        .rpg-voucher-input { flex: 1; letter-spacing: 0.1em; }
        .rpg-voucher-btn { background: rgba(139,90,43,0.3); border: 1px solid rgba(139,90,43,0.6); color: #d4a96a; padding: 10px 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: inherit; flex-shrink: 0; }
        .rpg-voucher-btn:hover:not(:disabled) { background: rgba(139,90,43,0.5); color: #FFD700; }
        .rpg-voucher-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rpg-voucher-applied { display: flex; align-items: center; gap: 10px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 10px 12px; }
        .rpg-status { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; font-size: 13px; }
        .rpg-status--loading { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; }
        .rpg-status--success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #4ade80; }
        .rpg-status--error { background: rgba(40,0,0,0.4); border: 1px solid rgba(239,68,68,0.35); color: #f87171; }
        .rpg-status-title { font-weight: 600; font-size: 13px; }
        .rpg-status-username { color: white; font-size: 15px; font-weight: 700; margin-top: 2px; }
        .rpg-divider { border-top: 1px solid rgba(180,120,50,0.4); text-align: center; position: relative; margin: 4px 0; }
        .rpg-divider span { position: relative; top: -10px; background: rgba(50,32,12,1); padding: 0 12px; color: #c49a5a; font-size: 11px; letter-spacing: 0.1em; }
        .rpg-methods { display: flex; flex-direction: column; gap: 12px; }
        .rpg-method-category { color: #64748b; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; }
        .rpg-method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .rpg-method-btn { background: #ffffff; border: 2px solid #e2e8f0; padding: 12px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all 0.15s; border-radius: 8px; }
        .rpg-method-btn:hover { border-color: #94a3b8; background: #f8fafc; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .rpg-method-btn--active { border-color: #3b82f6 !important; background: #eff6ff !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
        .rpg-method-icon { width: 48px; height: 48px; object-fit: contain; filter: none; border-radius: 4px; }
        .rpg-method-label { color: #475569; font-size: 10px; text-align: center; line-height: 1.2; font-weight: 500; }
        .rpg-method-btn--active .rpg-method-label { color: #1d4ed8; font-weight: 700; }
        .rpg-show-more { background: transparent; border: 1px dashed rgba(255,255,255,0.15); color: #64748b; font-size: 11px; padding: 7px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s; font-family: inherit; }
        .rpg-show-more:hover { border-color: rgba(255,255,255,0.3); color: #94a3b8; }
        .rpg-summary { display: flex; flex-direction: column; gap: 8px; }
        .rpg-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #806040; }
        .rpg-summary-total { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin-top: 4px; color: #a09070; font-size: 14px; }
        .rpg-pay-btn { width: 100%; padding: 14px; background: linear-gradient(180deg, #9B7A1A 0%, #7A5C0F 50%, #5A3E08 100%); border: 2px solid #c4921e; color: #FFD700; font-size: 14px; font-weight: 700; letter-spacing: 0.1em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: top 0.1s; box-shadow: 0 4px 0 #4a3508; position: relative; top: 0; }
        .rpg-pay-btn:hover:not(.rpg-pay-btn--disabled) { top: 2px; box-shadow: 0 2px 0 #4a3508; }
        .rpg-pay-btn--disabled { background: rgba(60,40,20,0.4); border-color: rgba(139,90,43,0.2); color: #605040; cursor: not-allowed; box-shadow: none; }
        .rpg-secure-note { color: #475569; font-size: 11px; text-align: center; margin: 0; }
        .rpg-back-btn { width: 100%; padding: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #64748b; font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .rpg-back-btn:hover { border-color: rgba(255,255,255,0.3); color: #94a3b8; }
      `}</style>
    </PageWrapper>
  );
}
