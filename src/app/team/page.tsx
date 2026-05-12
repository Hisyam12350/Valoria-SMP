'use client';


import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, MessageCircle, Shield, Star, PhoneCall, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/page-wrapper';
import { TEAMS } from '@/lib/constants';
import { useSiteContent } from '@/lib/use-site-content';
import { useState } from 'react';

export default function TeamPage() {
  const { value: rawTeams } = useSiteContent<unknown>('teams', TEAMS);

  // Merge dengan default visual fields - mencegah crash kalau field tidak ada
  const teams = (() => {
    const raw = Array.isArray(rawTeams) ? rawTeams : TEAMS;
    return (raw as typeof TEAMS).map((t: Record<string, unknown>) => ({
      id: String(t.id ?? Math.random()),
      name: String(t.name ?? 'Team'),
      tag: String(t.tag ?? ''),
      logo: String(t.logo ?? ''),
      activeMemberCount: Number(t.activeMemberCount ?? 0),
      ownerName: String(t.ownerName ?? 'Owner'),
      ownerWhatsapp: String(t.ownerWhatsapp ?? ''),
      description: String(t.description ?? ''),
      badge: String(t.badge ?? 'OPEN'),
      badgeColor: t.badge === 'PENUH' ? 'bg-red-500' : 'bg-green-500',
      gradient: String(t.gradient ?? 'from-emerald-400 to-teal-500'),
      accentColor: String(t.accentColor ?? 'text-emerald-400'),
      glowColor: String(t.glowColor ?? 'rgba(16,185,129,0.35)'),
    }));
  })();
  const handleContactOwner = (whatsapp: string, ownerName: string, teamName: string) => {
    const message = `Halo kak ${ownerName}, saya ingin Bergabung di team *${teamName}* apakah bisa?`;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-24">
        <div className="max-w-5xl mx-auto">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
              <Shield className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs text-gray-300 tracking-widest uppercase font-medium">Tim VALORIA</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-minecraft text-white mb-4 leading-tight">
              <span className="text-pink-400">Team</span>{' '}
              <span className="text-white">Directory</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Semua tim yang terdaftar dan aktif di server VALORIA SMP
            </p>
          </motion.div>

          {/* Teams Grid */}
          <div className="grid gap-6 md:gap-8">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <TeamCard team={team} onContact={handleContactOwner} />
              </motion.div>
            ))}
          </div>

          {teams.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-400">Belum ada tim yang terdaftar</p>
            </motion.div>
          )}

          {/* Join Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <div className="glass rounded-2xl border border-white/10 px-8 py-10">
                {/* Decorative top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 absolute top-0 left-0 rounded-t-2xl" />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <PhoneCall className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold font-minecraft text-white mb-2">
                  Mau Bikin <span className="text-green-400">Team Baru?</span>
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Hubungi admin kami langsung via WhatsApp untuk mendaftarkan team kamu di server VALORIA SMP!
                </p>

                <Button
                  onClick={() => {
                    const message = 'Min saya mau masukin team di website!!';
                    const url = `https://wa.me/6285785944924?text=${encodeURIComponent(message)}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold px-8 py-3 h-12 shadow-lg shadow-green-500/30 text-base rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Hubungi Admin
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </PageWrapper>
  );
}

type Team = typeof import('@/lib/constants').TEAMS[0];

function TeamCard({
  team,
  onContact,
}: {
  team: Team;
  onContact: (wa: string, owner: string, team: string) => void;
}) {
  const isFull = team.badge === 'PENUH';
  const [showNotif, setShowNotif] = useState(false);

  const handleContactClick = () => {
    if (isFull) {
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 3000);
      return;
    }
    onContact(team.ownerWhatsapp, team.ownerName, team.name);
  };

  return (
    <div
      className="relative rounded-2xl overflow-visible"
      style={{
        boxShadow: `0 0 40px ${team.glowColor}, 0 0 80px ${team.glowColor.replace('0.35', '0.10')}`,
      }}
    >
      {/* Notifikasi toast PENUH */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/90 border border-red-400/50 shadow-lg shadow-red-500/30 text-white text-sm font-medium whitespace-nowrap"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Team ini sudah penuh, tolong pilih team lain
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-2xl overflow-hidden border border-white/10">

        {/* Top gradient bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${team.gradient}`} />

        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">

            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden"
                style={{
                  boxShadow: `0 0 20px ${team.glowColor}`,
                  border: `2px solid ${team.glowColor.replace('0.35', '0.5')}`,
                }}
              >
                <img
                  src={team.logo}
                  alt={`${team.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${team.badgeColor} shadow-lg`}>
                {team.badge}
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className={`text-xl md:text-2xl font-bold font-minecraft ${team.accentColor}`}>
                  {team.name}
                </h2>
                <span className="text-xs text-gray-500 font-mono">{team.tag}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xl">
                {team.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${team.gradient} flex items-center justify-center`}>
                    <Users className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">Member Aktif</p>
                    <p className={`text-lg font-bold leading-none ${team.accentColor}`}>{team.activeMemberCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">Owner</p>
                    <p className="text-base font-bold text-amber-400 leading-none">{team.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isFull ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-400 to-emerald-500'}`}>
                    <Star className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">Status</p>
                    <p className={`text-base font-bold leading-none ${isFull ? 'text-red-400' : 'text-green-400'}`}>
                      {isFull ? 'Penuh' : 'Open'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="relative inline-block">
                <Button
                  onClick={handleContactClick}
                  disabled={isFull}
                  className={
                    isFull
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60 font-semibold px-5 py-2 h-10'
                      : `bg-gradient-to-r ${team.gradient} hover:opacity-90 text-white font-semibold px-5 py-2 h-10 shadow-lg`
                  }
                  style={isFull ? {} : { boxShadow: `0 4px 20px ${team.glowColor}` }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {isFull ? 'Team Penuh' : 'Hubungi Owner Team'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="px-8 pb-4">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}
