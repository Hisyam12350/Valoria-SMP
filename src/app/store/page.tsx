"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Package, Zap, ShoppingCart, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/page-wrapper";
import { useSiteContent } from "@/lib/use-site-content";
import {
  RANKS,
  AVAILABLE_SKILLS,
  SKILL_PRICE_PER_LEVEL,
  POINTS_PRICE_PER_AMOUNT,
  POINTS_PER_PURCHASE,
  MONEY_PRICE_PER_AMOUNT,
  MONEY_PER_PURCHASE,
} from "@/lib/constants";

type PurchaseItemType = "points" | "money" | "skills";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PointsItem {
  rank: string;
  slug: string;
  color: string;
  harga: number;
  points: string;
  gradient: string;
}

interface MoneyItem {
  rank: string;
  slug: string;
  color: string;
  harga: number;
  money: string;
  gradient: string;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatMoney(num: number): string {
  if (num >= 1_000_000_000_000)
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
}

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function calculateDiscountedPrice(
  originalPrice: number,
  discount: number,
): number {
  return Math.floor(originalPrice * (1 - discount / 100));
}

// ─── Midtrans pay helper ──────────────────────────────────────────────────────

async function triggerSnapPayment({
  uuid,
  username,
  productName,
  slug,
  price,
  onDone,
}: {
  uuid: string;
  username: string;
  productName: string;
  slug: string;
  price: number;
  onDone: () => void;
}) {
  const res = await fetch("/api/payment/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uuid, username, productName, slug, price }),
  });

  const data = await res.json();

  if (!data.success || !data.token) {
    throw new Error(data.error ?? "Gagal membuat transaksi");
  }

  window.snap.pay(data.token, {
    onSuccess: () => {
      window.location.href = "/payment/success";
    },
    onPending: (result) => {
      toast({
        title: "Menunggu Pembayaran",
        description: `Order #${result.order_id} sedang diproses. Selesaikan pembayaranmu.`,
      });
      onDone();
    },
    onError: () => {
      toast({
        title: "Pembayaran Gagal",
        description: "Terjadi kesalahan saat memproses pembayaran.",
        variant: "destructive",
      });
      onDone();
    },
    onClose: () => {
      onDone();
    },
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StorePage() {
  const router = useRouter();

  const { value: rawRanks } = useSiteContent<unknown>("ranks", RANKS);
  const { value: rawSkills } = useSiteContent<unknown>(
    "store_skills",
    AVAILABLE_SKILLS,
  );
  const { value: discordLink } = useSiteContent<string>(
    "discord_link",
    "https://discord.gg/TrVjrSSbr",
  );

  const ranks =
    Array.isArray(rawRanks) && rawRanks.length > 0
      ? (rawRanks as typeof RANKS)
      : RANKS;

  const skills =
    Array.isArray(rawSkills) && rawSkills.length > 0
      ? (rawSkills as string[])
      : AVAILABLE_SKILLS;

  // ── Dynamic data from API ──
  const [pointsStore, setPointsStore] = useState<PointsItem[]>([]);
  const [moneyStore, setMoneyStore] = useState<MoneyItem[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isLoadingMoney, setIsLoadingMoney] = useState(true);

  useEffect(() => {
    // Fetch points store
    fetch("/api/store/get-points")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.points)) {
          setPointsStore(data.points);
        }
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Gagal memuat data points",
          variant: "destructive",
        });
      })
      .finally(() => setIsLoadingPoints(false));

    // Fetch money store
    fetch("/api/store/get-money")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.money)) {
          setMoneyStore(data.money);
        }
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Gagal memuat data money",
          variant: "destructive",
        });
      })
      .finally(() => setIsLoadingMoney(false));
  }, []);

  // Dialog state
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<PurchaseItemType>("points");

  // Selected item for points/money
  const [selectedPointsItem, setSelectedPointsItem] =
    useState<PointsItem | null>(null);
  const [selectedMoneyItem, setSelectedMoneyItem] = useState<MoneyItem | null>(
    null,
  );

  // Player form state
  const [playerName, setPlayerName] = useState("");
  const [playerUuid, setPlayerUuid] = useState("");
  const [isCheckingPlayer, setIsCheckingPlayer] = useState(false);
  const [isPlayerFound, setIsPlayerFound] = useState(false);

  // Skills state
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<number>(1);
  const [moneyPrice, setMoneyPrice] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);

  // ── Rank → langsung push ke /payment/[slug] ──
  const openRankPurchaseDialog = (rank: (typeof RANKS)[0]) => {
    if (!rank?.slug) {
      toast({
        title: "Error",
        description: "Slug produk tidak ditemukan",
        variant: "destructive",
      });
      return;
    }
    router.push(`/payment/${rank.slug}`);
  };

  // ── Buka dialog untuk Points / Money / Skills ──
  const openDialog = (type: PurchaseItemType) => {
    setPurchaseType(type);
    setPlayerName("");
    setPlayerUuid("");
    setIsPlayerFound(false);
    setPurchaseDialogOpen(true);
  };

  // ── Buka dialog khusus Points item ──
  const openPointsDialog = (item: PointsItem) => {
    router.push(`/payment/points-${item.slug}`);
  };

  // ── Buka dialog khusus Money item ──
  const openMoneyDialog = (item: MoneyItem) => {
    router.push(`/payment/money-${item.slug}`);
  };

  // ── Check player ──
  const checkPlayer = async (uuid: string) => {
    if (!uuid.trim()) {
      setPlayerName("");
      setIsPlayerFound(false);
      return;
    }
    try {
      setIsCheckingPlayer(true);
      const res = await fetch("/api/minecraft/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uuid }),
      });
      const data = await res.json();
      if (data.found) {
        setPlayerName(data.user.username);
        setIsPlayerFound(true);
      } else {
        setPlayerName("");
        setIsPlayerFound(false);
      }
    } catch {
      setIsPlayerFound(false);
    } finally {
      setIsCheckingPlayer(false);
    }
  };

  // ── Compute price & slug for dialog items ──
  const getDialogPurchaseParams = (): {
    productName: string;
    slug: string;
    price: number;
  } | null => {
    if (purchaseType === "points" && selectedPointsItem) {
      return {
        productName: `${selectedPointsItem.points} Points (${selectedPointsItem.rank})`,
        slug: `points-${selectedPointsItem.slug}`,
        price: selectedPointsItem.harga,
      };
    }
    if (purchaseType === "money" && selectedMoneyItem) {
      return {
        productName: `${selectedMoneyItem.money} In-Game Money (${selectedMoneyItem.rank})`,
        slug: `money-${selectedMoneyItem.slug}`,
        price: selectedMoneyItem.harga,
      };
    }
    if (purchaseType === "skills" && selectedSkill) {
      return {
        productName: `Skill ${selectedSkill} x${skillLevel} Level`,
        slug: `skill-${selectedSkill.toLowerCase().replace(/\s+/g, "-")}`,
        price: skillLevel * SKILL_PRICE_PER_LEVEL,
      };
    }
    return null;
  };

  const handleDialogPayment = async () => {
    if (!isPlayerFound || !playerUuid) {
      toast({
        title: "Error",
        description: "Masukkan username pemain yang valid",
        variant: "destructive",
      });
      return;
    }

    const params = getDialogPurchaseParams();
    if (!params) {
      toast({
        title: "Error",
        description: "Data pembelian tidak valid",
        variant: "destructive",
      });
      return;
    }

    if (purchaseType === "skills" && !selectedSkill) {
      toast({
        title: "Error",
        description: "Pilih skill terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await triggerSnapPayment({
        uuid: playerUuid,
        username: playerName,
        productName: params.productName,
        slug: params.slug,
        price: params.price,
        onDone: () => {
          setIsLoading(false);
          setPurchaseDialogOpen(false);
        },
      });
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const dialogParams = getDialogPurchaseParams();
  const canPay = isPlayerFound && !!playerUuid && !!dialogParams;

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center mb-3 font-minecraft text-pink-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Server Store
          </motion.h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            Tingkatkan pengalaman bermain dengan item eksklusif
          </p>

          <Tabs defaultValue="ranks" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 mb-6 glass h-10">
              <TabsTrigger
                value="ranks"
                className="data-[state=active]:bg-emerald-500/20 text-xs"
              >
                <Crown className="w-3 h-3 mr-1" /> Ranks
              </TabsTrigger>
              <TabsTrigger
                value="points"
                className="data-[state=active]:bg-emerald-500/20 text-xs"
              >
                <Star className="w-3 h-3 mr-1" /> Points
              </TabsTrigger>
              <TabsTrigger
                value="money"
                className="data-[state=active]:bg-emerald-500/20 text-xs"
              >
                <Package className="w-3 h-3 mr-1" /> Money
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-emerald-500/20 text-xs"
              >
                <Zap className="w-3 h-3 mr-1" /> Skills
              </TabsTrigger>
            </TabsList>

            {/* ── Ranks Tab ── */}
            <TabsContent value="ranks">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {ranks.map((rank, index) => {
                  const originalPrice = rank.originalPriceNum;
                  const discountedPrice = calculateDiscountedPrice(
                    originalPrice,
                    rank.discount ?? 0,
                  );
                  const rankExt = rank as typeof rank & { ultimate?: boolean };

                  return (
                    <motion.div
                      key={rank.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {(rank.discount ?? 0) > 0 && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-red-500 text-white text-xs font-bold animate-pulse">
                            -{rank.discount}%
                          </Badge>
                        </div>
                      )}
                      {rank.popular && (
                        <div className="absolute -top-2 right-2 z-10">
                          <Badge className="bg-pink-500 text-white text-[10px]">
                            BEST VALUE
                          </Badge>
                        </div>
                      )}
                      {rank.top && (
                        <div className="absolute -top-2 right-2 z-10">
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px]">
                            TOP RANK
                          </Badge>
                        </div>
                      )}
                      {rankExt.ultimate && (
                        <div className="absolute -top-2 right-2 z-10">
                          <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] animate-pulse">
                            ULTIMATE
                          </Badge>
                        </div>
                      )}
                      <Card
                        className={`glass border-0 h-full hover:scale-[1.02] transition-all duration-300 ${
                          rankExt.ultimate
                            ? "glow-cyan"
                            : rank.top
                              ? "glow-gold"
                              : rank.popular
                                ? "glow-purple"
                                : ""
                        }`}
                      >
                        <CardHeader className="text-center pb-1 pt-4">
                          <div
                            className={`text-lg font-bold mb-1 font-minecraft ${rank.color ?? "text-white"}`}
                          >
                            {rank.name}
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            {rank.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatRupiah(originalPrice)}
                              </span>
                            )}
                            <span className="text-lg font-bold text-white">
                              {formatRupiah(discountedPrice)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">FITUR:</p>
                            <div className="flex flex-wrap gap-0.5">
                              {rank.features?.map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="secondary"
                                  className="text-[10px] bg-white/10 px-1.5 py-0"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <p className="text-gray-400">
                              🎁{" "}
                              <span className="text-emerald-400">
                                {rank.bonus?.claimblock}
                              </span>{" "}
                              claimblock
                            </p>
                            <p className="text-gray-400">
                              📌{" "}
                              <span className="text-emerald-400">
                                {rank.bonus?.claim}
                              </span>{" "}
                              claim
                            </p>
                            <p className="text-gray-400">
                              🏠{" "}
                              <span className="text-emerald-400">
                                {rank.bonus?.sethome}
                              </span>{" "}
                              sethome
                            </p>
                            <p className="text-gray-400">
                              💰{" "}
                              <span className="text-emerald-400">
                                {rank.bonus?.money}
                              </span>
                            </p>
                          </div>
                          <Button
                            onClick={() => openRankPurchaseDialog(rank)}
                            className={`w-full bg-gradient-to-r ${rank.gradient ?? "from-green-500 to-emerald-500"} hover:opacity-90 text-white text-sm h-8`}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Beli Sekarang
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ── Points Tab ── */}
            <TabsContent value="points">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isLoadingPoints ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                      {pointsStore.map((item, index) => (
                        <motion.div
                          key={item.slug}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="h-full"
                        >
                          <Card className="glass border-0 h-full flex flex-col hover:scale-[1.02] transition-all duration-300">
                            <CardHeader className="text-center pb-1 pt-4">
                              <div className="text-2xl mb-1">⭐</div>
                              <div
                                className={`text-sm font-bold font-minecraft ${item.color}`}
                              >
                                {item.rank}
                              </div>
                              <div className="text-base font-bold text-white">
                                {item.points} Points
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 flex flex-col flex-1">
                              <div className="space-y-1 text-xs">
                                <p className="text-gray-400">
                                  ⭐{" "}
                                  <span className="text-emerald-400">
                                    {item.points}
                                  </span>{" "}
                                  server points
                                </p>
                                <p className="text-gray-400">
                                  ⚡{" "}
                                  <span className="text-emerald-400">
                                    Instant
                                  </span>{" "}
                                  dikirim
                                </p>
                              </div>
                              <div className="text-center">
                                <span className="text-lg font-bold text-white">
                                  {formatRupiah(item.harga)}
                                </span>
                              </div>
                              <Button
                                onClick={() => openPointsDialog(item)}
                                className={`w-full mt-auto bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white text-sm h-8`}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Beli Sekarang
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom features */}
                    <div className="flex justify-center">
                      <div className="flex flex-wrap justify-center gap-6 px-8 py-3 rounded-full bg-white/5 border border-white/10">
                        {[
                          { icon: "🔒", label: "100% Aman" },
                          { icon: "⚡", label: "Instant Delivery" },
                          { icon: "🏷️", label: "Best Price" },
                          { icon: "🎧", label: "24/7 Support" },
                        ].map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-gray-400"
                          >
                            <span>{f.icon}</span>
                            <span>{f.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </TabsContent>

            {/* ── Money Tab ── */}
            <TabsContent value="money">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isLoadingMoney ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                      {moneyStore.map((item, index) => (
                        <motion.div
                          key={item.slug}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="h-full"
                        >
                          <Card className="glass border-0 h-full flex flex-col hover:scale-[1.02] transition-all duration-300">
                            <CardHeader className="text-center pb-1 pt-4">
                              <div className="text-2xl mb-1">💰</div>
                              <div
                                className={`text-sm font-bold font-minecraft ${item.color}`}
                              >
                                {item.rank}
                              </div>
                              <div className="text-base font-bold text-white">
                                {item.money}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 flex flex-col flex-1">
                              <div className="space-y-1 text-xs">
                                <p className="text-gray-400">
                                  💰{" "}
                                  <span className="text-emerald-400">
                                    {item.money}
                                  </span>{" "}
                                  in-game money
                                </p>
                                <p className="text-gray-400">
                                  ⚡{" "}
                                  <span className="text-emerald-400">
                                    Instant
                                  </span>{" "}
                                  dikirim
                                </p>
                              </div>
                              <div className="text-center">
                                <span className="text-lg font-bold text-white">
                                  {formatRupiah(item.harga)}
                                </span>
                              </div>
                              <Button
                                onClick={() => openMoneyDialog(item)}
                                className={`w-full mt-auto bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white text-sm h-8`}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Beli Sekarang
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom features */}
                    <div className="flex justify-center">
                      <div className="flex flex-wrap justify-center gap-6 px-8 py-3 rounded-full bg-white/5 border border-white/10">
                        {[
                          { icon: "🔒", label: "100% Aman" },
                          { icon: "⚡", label: "Instant Delivery" },
                          { icon: "🏷️", label: "Best Price" },
                          { icon: "🎧", label: "24/7 Support" },
                        ].map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-gray-400"
                          >
                            <span>{f.icon}</span>
                            <span>{f.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </TabsContent>

            {/* ── Skills Tab ── */}
            <TabsContent value="skills">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <Card className="glass border-0">
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">Beli Skill Level</CardTitle>
                    <p className="text-emerald-400 font-semibold">
                      Rp {SKILL_PRICE_PER_LEVEL.toLocaleString("id-ID")} / Level
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">
                        Pilih Skill
                      </Label>
                      <Select
                        value={selectedSkill}
                        onValueChange={setSelectedSkill}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Pilih skill yang ingin di-upgrade" />
                        </SelectTrigger>
                        <SelectContent>
                          {skills.map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">
                        Jumlah Level
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={skillLevel}
                        onChange={(e) =>
                          setSkillLevel(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="bg-white/5 border-white/10"
                        placeholder="Masukkan jumlah level"
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Skill:</span>
                        <span className="text-white font-medium">
                          {selectedSkill || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Level:</span>
                        <span className="text-amber-400 font-medium">
                          {skillLevel} Level
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Harga:</span>
                          <span className="text-emerald-400 font-bold text-lg">
                            Rp{" "}
                            {(
                              skillLevel * SKILL_PRICE_PER_LEVEL
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(
                          `/payment/skill-${selectedSkill.toLowerCase().replace(/\s+/g, "-")}?level=${skillLevel}`,
                        )
                      }
                      disabled={!selectedSkill}
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:opacity-90"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Beli Sekarang
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Purchase Dialog (Points / Money / Skills) ── */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="glass border-0 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-minecraft text-amber-400">
              {purchaseType === "skills"
                ? "Beli Skill Level"
                : purchaseType === "points"
                  ? "Beli Points"
                  : "Beli In-Game Money"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Masukkan username pemain untuk melanjutkan pembayaran
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Username Input */}
            <div className="space-y-1.5">
              <Label htmlFor="playerUuid" className="text-sm">
                Username Player
              </Label>
              <Input
                id="playerUuid"
                placeholder="Masukkan username Minecraft"
                value={playerUuid}
                onChange={(e) => {
                  setPlayerUuid(e.target.value);
                  checkPlayer(e.target.value);
                }}
                className="bg-white/5 border-white/10 h-9"
              />
              {isCheckingPlayer && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Mengecek akun...
                </p>
              )}
              {!isCheckingPlayer && playerUuid && isPlayerFound && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 p-2">
                  <p className="text-xs text-emerald-400">✓ Akun ditemukan</p>
                  <p className="text-sm font-semibold text-white">
                    {playerName}
                  </p>
                </div>
              )}
              {!isCheckingPlayer && playerUuid && !isPlayerFound && (
                <p className="text-xs text-red-400">Username tidak ditemukan</p>
              )}
            </div>

            {/* Order Summary */}
            {dialogParams && (
              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <p className="text-xs text-gray-400">Detail Pembelian:</p>
                <p className="text-sm text-white font-medium">
                  {dialogParams.productName}
                </p>
                <p className="text-emerald-400 font-bold">
                  Rp {dialogParams.price.toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
              className="flex-1 h-9"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleDialogPayment}
              disabled={!canPay || isLoading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-9"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Bayar Sekarang
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
