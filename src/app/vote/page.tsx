'use client';


import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, ExternalLink, Gift, Coins, Crown, Star, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/page-wrapper';
import { VOTE_LINK } from '@/lib/constants';
import { useSiteContent } from '@/lib/use-site-content';

interface Voter {
  rank: number;
  name: string;
  votes: number;
  skinHead: string;
}

function getRankStyle(rank: number) {
  if (rank === 1) return { circle: 'bg-amber-500 text-black', badge: 'bg-amber-500 text-black' };
  if (rank === 2) return { circle: 'bg-gray-400 text-black', badge: 'bg-gray-400 text-black' };
  if (rank === 3) return { circle: 'bg-orange-600 text-white', badge: 'bg-orange-600 text-white' };
  return { circle: 'bg-gray-700 text-gray-300', badge: '' };
}

export default function VotePage() {
  const { value: voteLink } = useSiteContent<string>('vote_link', VOTE_LINK);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVoters = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/top-voters');
      const data = await res.json();
      setVoters(data.voters ?? []);
      setLastUpdated(new Date());
    } catch {
      // silently fail, keep existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-20">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.h2
            className="text-3xl font-bold text-center mb-3 font-minecraft text-blue-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🗳️ Vote for VALORIA SMP
          </motion.h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            Dukung server kami dengan vote dan dapatkan hadiah!
          </p>

          {/* Vote Button */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-0 max-w-sm mx-auto p-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Vote className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-minecraft text-emerald-400">Vote Sekarang!</h3>
              <p className="text-gray-400 mb-4 text-sm">Setiap vote memberikan reward eksklusif</p>
              <Button
                asChild
                size="default"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
              >
                <a href={voteLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Vote di Minecraft-MP
                </a>
              </Button>
            </Card>
          </motion.div>

          {/* Top Voters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between max-w-lg mx-auto mb-4 px-1">
              <h3 className="text-xl font-bold font-minecraft text-amber-400">🏅 Top Voters</h3>
              <div className="flex items-center gap-2">
                {lastUpdated && (
                  <span className="text-[10px] text-gray-500">
                    Update: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button
                  onClick={() => fetchVoters(true)}
                  disabled={refreshing}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <Card className="glass border-0 overflow-hidden max-w-lg mx-auto">
              <CardContent className="p-0">

                {/* Loading state */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <p className="text-gray-400 text-xs">Memuat top voters...</p>
                  </div>
                )}

                {/* Empty state */}
                {!loading && voters.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <p className="text-2xl">🗳️</p>
                    <p className="text-gray-400 text-sm font-medium">Belum ada voter bulan ini</p>
                    <p className="text-gray-500 text-xs">Jadilah yang pertama vote!</p>
                  </div>
                )}

                {/* Voter list */}
                {!loading && voters.length > 0 && (
                  <div className="divide-y divide-white/10">
                    {voters.map((voter, index) => {
                      const style = getRankStyle(voter.rank);
                      return (
                        <motion.div
                          key={voter.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.04 }}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                        >
                          {/* Rank circle */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${style.circle}`}>
                            {voter.rank}
                          </div>

                          {/* Skin head */}
                          <img
                            src={voter.skinHead}
                            alt={voter.name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/steve/64';
                            }}
                          />

                          {/* Name + votes */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{voter.name}</p>
                            <p className="text-xs text-gray-400">{voter.votes} votes</p>
                          </div>

                          {/* Badge top 3 */}
                          {voter.rank <= 3 && (
                            <Badge className={`text-xs flex-shrink-0 ${style.badge}`}>
                              <Star className="w-3 h-3 mr-1" />
                              Top {voter.rank}
                            </Badge>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Auto-update note */}
            <p className="text-center text-[10px] text-gray-600 mt-2">
              Data diperbarui otomatis setiap 3 menit dari MinecraftMP
            </p>
          </motion.div>

          {/* Vote Rewards */}
          <motion.div
            className="mt-8 grid sm:grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass border-0 text-center p-4">
              <Gift className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm mb-0.5">Vote Reward</h4>
              <p className="text-xs text-gray-400">Dapatkan hadiah setiap vote</p>
            </Card>
            <Card className="glass border-0 text-center p-4">
              <Coins className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm mb-0.5">Bonus Coins</h4>
              <p className="text-xs text-gray-400">Extra coins untuk voter aktif</p>
            </Card>
            <Card className="glass border-0 text-center p-4">
              <Crown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm mb-0.5">Exclusive Rank</h4>
              <p className="text-xs text-gray-400">Top voter mendapat rank khusus</p>
            </Card>
          </motion.div>

        </div>
      </div>
    </PageWrapper>
  );
}
