'use client';


import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Package, Zap, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { useSiteContent } from '@/lib/use-site-content';
import { 
  RANKS, 
  AVAILABLE_SKILLS, 
  SKILL_PRICE_PER_LEVEL, 
  WHATSAPP_NUMBER,
  WHATSAPP_GROUP,
  POINTS_PRICE_PER_AMOUNT,
  POINTS_PER_PURCHASE,
  MONEY_PRICE_PER_AMOUNT,
  MONEY_PER_PURCHASE
} from '@/lib/constants';

type PurchaseItemType = 'rank' | 'points' | 'money' | 'skills';

// Format number with k, m, b, t suffixes
function formatMoney(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 't';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

// Format price to Rupiah string
function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString('id-ID')}`;
}

// Calculate discounted price
function calculateDiscountedPrice(originalPrice: number, discount: number): number {
  return Math.floor(originalPrice * (1 - discount / 100));
}

export default function StorePage() {
  const { value: rawRanks } = useSiteContent<unknown>('ranks', RANKS);
  const { value: rawSkills } = useSiteContent<unknown>('store_skills', AVAILABLE_SKILLS);
  const { value: waNumber } = useSiteContent<string>('whatsapp_group', WHATSAPP_GROUP || '');
  const { value: discordLink } = useSiteContent<string>('discord_link', 'https://discord.gg/TrVjrSSbr');

  // Defensive parse ranks & skills
  const ranks = Array.isArray(rawRanks) && rawRanks.length > 0 ? rawRanks as typeof RANKS : RANKS;
  const skills = Array.isArray(rawSkills) && rawSkills.length > 0 ? rawSkills as string[] : AVAILABLE_SKILLS;
  const [selectedRank, setSelectedRank] = useState<typeof RANKS[0] | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [platform, setPlatform] = useState('java');
  const [purchaseType, setPurchaseType] = useState<PurchaseItemType>('rank');
  
  // Skills state
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState<number>(1);
  
  // Points state (price in Rupiah)
  const [pointsPrice, setPointsPrice] = useState<number>(0);
  
  // Money state (price in Rupiah)
  const [moneyPrice, setMoneyPrice] = useState<number>(0);

  const handlePurchase = () => {
    if (!playerName.trim()) {
      toast({
        title: 'Error',
        description: 'Silakan masukkan nama pemain',
        variant: 'destructive',
      });
      return;
    }

    let message = '';
    const playerNameFormatted = platform === 'bedrock' ? `.${playerName}` : playerName;

    if (purchaseType === 'rank' && selectedRank) {
      const originalPrice = selectedRank.originalPriceNum;
      const discountedPrice = calculateDiscountedPrice(originalPrice, selectedRank.discount);
      const discountInfo = selectedRank.discount > 0 
        ? `\n- Diskon: ${selectedRank.discount}% (dari ${formatRupiah(originalPrice)})` 
        : '';
      message = `Halo, saya ingin membeli rank *${selectedRank.name}*

📦 Detail Pembelian:
- Rank: ${selectedRank.name}
- Harga: ${formatRupiah(discountedPrice)}${discountInfo}
- Nama Player: ${playerNameFormatted}
- Platform: ${platform.toUpperCase()}

Mohon proses pembayaran saya. Terima kasih!`;
    } else if (purchaseType === 'skills' && selectedSkill) {
      const totalPrice = skillLevel * SKILL_PRICE_PER_LEVEL;
      const formattedPrice = `Rp ${totalPrice.toLocaleString('id-ID')}`;
      message = `Halo, saya ingin membeli *Skill Level*

📦 Detail Pembelian:
- Skill: ${selectedSkill}
- Level: ${skillLevel} Level
- Harga: ${formattedPrice}
- Nama Player: ${playerNameFormatted}
- Platform: ${platform.toUpperCase()}

Mohon proses pembayaran saya. Terima kasih!`;
    } else if (purchaseType === 'points') {
      const multiplier = Math.floor(pointsPrice / POINTS_PRICE_PER_AMOUNT);
      const totalPoints = multiplier * POINTS_PER_PURCHASE;
      message = `Halo, saya ingin membeli *Points*

📦 Detail Pembelian:
- Jumlah: ${totalPoints.toLocaleString('id-ID')} Points
- Harga: Rp ${pointsPrice.toLocaleString('id-ID')}
- Nama Player: ${playerNameFormatted}
- Platform: ${platform.toUpperCase()}

Mohon proses pembayaran saya. Terima kasih!`;
    } else if (purchaseType === 'money') {
      const totalMoney = Math.floor((moneyPrice / MONEY_PRICE_PER_AMOUNT) * MONEY_PER_PURCHASE);
      message = `Halo, saya ingin membeli *In-Game Money*

📦 Detail Pembelian:
- Jumlah: $${formatMoney(totalMoney)} (${totalMoney.toLocaleString('id-ID')})
- Harga: Rp ${moneyPrice.toLocaleString('id-ID')}
- Nama Player: ${playerNameFormatted}
- Platform: ${platform.toUpperCase()}

Mohon proses pembayaran saya. Terima kasih!`;
    }

    const adminNumber = '6285719379665'; // +62 857-1937-9665
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setPurchaseDialogOpen(false);
    setPlayerName('');
    setSelectedRank(null);
  };

  const openRankPurchaseDialog = (rank: typeof RANKS[0]) => {
    setSelectedRank(rank);
    setPurchaseType('rank');
    setPurchaseDialogOpen(true);
  };

  const openPointsPurchaseDialog = () => {
    setSelectedRank(null);
    setSelectedSkill('');
    setPurchaseType('points');
    setPurchaseDialogOpen(true);
  };

  const openMoneyPurchaseDialog = () => {
    setSelectedRank(null);
    setSelectedSkill('');
    setPurchaseType('money');
    setPurchaseDialogOpen(true);
  };

  const openSkillPurchaseDialog = () => {
    setSelectedRank(null);
    setPurchaseType('skills');
    setPurchaseDialogOpen(true);
  };

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
          <p className="text-gray-400 text-center mb-8 text-sm">Tingkatkan pengalaman bermain dengan item eksklusif</p>

          {/* Store Tabs */}
          <Tabs defaultValue="ranks" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 mb-6 glass h-10">
              <TabsTrigger value="ranks" className="data-[state=active]:bg-emerald-500/20 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Ranks
              </TabsTrigger>
              <TabsTrigger value="points" className="data-[state=active]:bg-emerald-500/20 text-xs">
                <Star className="w-3 h-3 mr-1" />
                Points
              </TabsTrigger>
              <TabsTrigger value="money" className="data-[state=active]:bg-emerald-500/20 text-xs">
                <Package className="w-3 h-3 mr-1" />
                Money
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-emerald-500/20 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Skills
              </TabsTrigger>
            </TabsList>

            {/* Ranks Tab */}
            <TabsContent value="ranks">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {ranks.map((rank, index) => {
                  const originalPrice = rank.originalPriceNum;
                  const discountedPrice = calculateDiscountedPrice(originalPrice, rank.discount);
                  
                  return (
                    <motion.div
                      key={rank.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Discount Badge */}
                      {rank.discount > 0 && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-red-500 text-white text-xs font-bold animate-pulse">
                            -{rank.discount}%
                          </Badge>
                        </div>
                      )}
                      {rank.popular && (
                        <div className="absolute -top-2 right-2 z-10">
                          <Badge className="bg-pink-500 text-white text-[10px]">BEST VALUE</Badge>
                        </div>
                      )}
                      {rank.top && (
                        <div className="absolute -top-2 right-2 z-10">
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px]">TOP RANK</Badge>
                        </div>
                      )}
                      {(rank as typeof RANKS[0] & { ultimate?: boolean }).ultimate && (
                        <div className="absolute -top-2 right-2 z-10">
                          <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] animate-pulse">ULTIMATE</Badge>
                        </div>
                      )}
                      <Card className={`glass border-0 h-full hover:scale-[1.02] transition-all duration-300 ${(rank as typeof RANKS[0] & { ultimate?: boolean }).ultimate ? 'glow-cyan' : rank.top ? 'glow-gold' : rank.popular ? 'glow-purple' : ''}`}>
                        <CardHeader className="text-center pb-1 pt-4">
                          <div className={`text-lg font-bold mb-1 font-minecraft ${rank.color}`}>{rank.name}</div>
                          {/* Price with discount */}
                          <div className="flex flex-col items-center gap-0.5">
                            {rank.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">{formatRupiah(originalPrice)}</span>
                            )}
                            <span className="text-lg font-bold text-white">{formatRupiah(discountedPrice)}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">FITUR:</p>
                            <div className="flex flex-wrap gap-0.5">
                              {rank.features.map((feature) => (
                                <Badge key={feature} variant="secondary" className="text-[10px] bg-white/10 px-1.5 py-0">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <p className="text-gray-400">🎁 <span className="text-emerald-400">{rank.bonus.claimblock}</span> claimblock</p>
                            <p className="text-gray-400">📌 <span className="text-emerald-400">{rank.bonus.claim}</span> claim</p>
                            <p className="text-gray-400">🏠 <span className="text-emerald-400">{rank.bonus.sethome}</span> sethome</p>
                            <p className="text-gray-400">💰 <span className="text-emerald-400">{rank.bonus.money}</span></p>
                          </div>
                          <Button 
                            onClick={() => openRankPurchaseDialog(rank)}
                            className={`w-full bg-gradient-to-r ${rank.gradient} hover:opacity-90 text-white text-sm h-8`}
                          >
                            Beli Sekarang
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Points Tab */}
            <TabsContent value="points">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <Card className="glass border-0">
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-3">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">Beli Points</CardTitle>
                    <p className="text-emerald-400 font-semibold">Rp {POINTS_PRICE_PER_AMOUNT.toLocaleString('id-ID')} / {POINTS_PER_PURCHASE.toLocaleString('id-ID')} Points</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Masukkan Harga (Rp)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={pointsPrice || ''}
                        onChange={(e) => setPointsPrice(parseInt(e.target.value) || 0)}
                        className="bg-white/5 border-white/10"
                        placeholder="Contoh: 10000"
                      />
                      <p className="text-xs text-gray-500">Rp {POINTS_PRICE_PER_AMOUNT.toLocaleString('id-ID')} = {POINTS_PER_PURCHASE.toLocaleString('id-ID')} Points</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Points:</span>
                        <span className="text-amber-400 font-bold text-lg">
                          {pointsPrice > 0 ? (Math.floor((pointsPrice / POINTS_PRICE_PER_AMOUNT) * POINTS_PER_PURCHASE)).toLocaleString('id-ID') : '0'} Points
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Harga:</span>
                          <span className="text-emerald-400 font-bold text-lg">
                            Rp {pointsPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={openPointsPurchaseDialog}
                      disabled={pointsPrice < POINTS_PRICE_PER_AMOUNT}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90"
                    >
                      Beli Sekarang
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Money Tab */}
            <TabsContent value="money">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <Card className="glass border-0">
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-3">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">Beli In-Game Money</CardTitle>
                    <p className="text-emerald-400 font-semibold">Rp {MONEY_PRICE_PER_AMOUNT.toLocaleString('id-ID')} / {formatMoney(MONEY_PER_PURCHASE)} Money</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Masukkan Harga (Rp)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={moneyPrice || ''}
                        onChange={(e) => setMoneyPrice(parseInt(e.target.value) || 0)}
                        className="bg-white/5 border-white/10"
                        placeholder="Contoh: 4000"
                      />
                      <p className="text-xs text-gray-500">Rp {MONEY_PRICE_PER_AMOUNT.toLocaleString('id-ID')} = {formatMoney(MONEY_PER_PURCHASE)} Money</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Money:</span>
                        <span className="text-amber-400 font-bold text-lg">
                          ${moneyPrice > 0 ? formatMoney(Math.floor((moneyPrice / MONEY_PRICE_PER_AMOUNT) * MONEY_PER_PURCHASE)) : '0'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        ({moneyPrice > 0 ? Math.floor((moneyPrice / MONEY_PRICE_PER_AMOUNT) * MONEY_PER_PURCHASE).toLocaleString('id-ID') : '0'})
                      </p>
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Harga:</span>
                          <span className="text-emerald-400 font-bold text-lg">
                            Rp {moneyPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={openMoneyPurchaseDialog}
                      disabled={moneyPrice < MONEY_PRICE_PER_AMOUNT}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                    >
                      Beli Sekarang
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Skills Tab */}
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
                    <p className="text-emerald-400 font-semibold">Rp {SKILL_PRICE_PER_LEVEL.toLocaleString('id-ID')} / Level</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Pilih Skill</Label>
                      <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Pilih skill yang ingin di-upgrade" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_SKILLS.map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Jumlah Level</Label>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-white/5 border-white/10"
                        placeholder="Masukkan jumlah level"
                      />
                    </div>
                    
                    <div className="p-4 rounded-lg bg-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Skill:</span>
                        <span className="text-white font-medium">{selectedSkill || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Level:</span>
                        <span className="text-amber-400 font-medium">{skillLevel} Level</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Harga:</span>
                          <span className="text-emerald-400 font-bold text-lg">
                            Rp {(skillLevel * SKILL_PRICE_PER_LEVEL).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={openSkillPurchaseDialog}
                      disabled={!selectedSkill}
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:opacity-90"
                    >
                      Beli Sekarang
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="glass border-0 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-minecraft text-amber-400">
              {purchaseType === 'rank' && selectedRank 
                ? `Beli Rank ${selectedRank.name}` 
                : purchaseType === 'skills' 
                  ? 'Beli Skill Level' 
                  : purchaseType === 'points'
                    ? 'Beli Points'
                    : purchaseType === 'money'
                      ? 'Beli In-Game Money'
                      : 'Beli Item'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Isi data untuk melanjutkan pembelian via WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="playerName" className="text-sm">Nama Player (Username)</Label>
              <Input
                id="playerName"
                placeholder="Masukkan username Minecraft"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-white/5 border-white/10 h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="platform" className="text-sm">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-white/5 border-white/10 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java">Java Edition</SelectItem>
                  <SelectItem value="bedrock">Bedrock Edition</SelectItem>
                </SelectContent>
              </Select>
              {platform === 'bedrock' && (
                <p className="text-xs text-amber-400">⚠️ Otomatis ada titik (.) di depan</p>
              )}
            </div>
            
            {/* Rank Detail */}
            {selectedRank && purchaseType === 'rank' && (
              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <p className="text-xs text-gray-400">Detail:</p>
                <p className="font-semibold text-white text-sm">Rank: <span className={selectedRank.color}>{selectedRank.name}</span></p>
                {selectedRank.discount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 line-through">{formatRupiah(selectedRank.originalPriceNum)}</span>
                    <Badge className="bg-red-500 text-white text-[10px]">-{selectedRank.discount}%</Badge>
                  </div>
                )}
                <p className="text-emerald-400 font-bold text-sm">{formatRupiah(calculateDiscountedPrice(selectedRank.originalPriceNum, selectedRank.discount))}</p>
              </div>
            )}
            
            {/* Points Detail */}
            {purchaseType === 'points' && (
              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <p className="text-xs text-gray-400">Detail:</p>
                <p className="font-semibold text-white text-sm">Points</p>
                <p className="text-amber-400 text-sm">{(Math.floor(pointsPrice / POINTS_PRICE_PER_AMOUNT) * POINTS_PER_PURCHASE).toLocaleString('id-ID')} Points</p>
                <p className="text-emerald-400 font-bold text-sm">Rp {pointsPrice.toLocaleString('id-ID')}</p>
              </div>
            )}
            
            {/* Money Detail */}
            {purchaseType === 'money' && (
              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <p className="text-xs text-gray-400">Detail:</p>
                <p className="font-semibold text-white text-sm">In-Game Money</p>
                <p className="text-amber-400 text-sm">${formatMoney(Math.floor((moneyPrice / MONEY_PRICE_PER_AMOUNT) * MONEY_PER_PURCHASE))} ({Math.floor((moneyPrice / MONEY_PRICE_PER_AMOUNT) * MONEY_PER_PURCHASE).toLocaleString('id-ID')})</p>
                <p className="text-emerald-400 font-bold text-sm">Rp {moneyPrice.toLocaleString('id-ID')}</p>
              </div>
            )}
            
            {/* Skills Detail */}
            {purchaseType === 'skills' && selectedSkill && (
              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <p className="text-xs text-gray-400">Detail:</p>
                <p className="font-semibold text-white text-sm">Skill: <span className="text-purple-400">{selectedSkill}</span></p>
                <p className="text-amber-400 text-sm">{skillLevel} Level</p>
                <p className="text-emerald-400 font-bold text-sm">Rp {(skillLevel * SKILL_PRICE_PER_LEVEL).toLocaleString('id-ID')}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)} className="flex-1 h-9">
              Batal
            </Button>
            <Button onClick={handlePurchase} className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-9">
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
