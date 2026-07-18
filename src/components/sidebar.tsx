'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Server, Store, Trophy, Vote, Users, Share2,
  Shield, BookOpen, Settings, Menu, X, ChevronRight, LogOut, User
} from 'lucide-react';
import { SERVER_LOGO, NAV_ITEMS } from '@/lib/constants';
import { usePlayer } from '@/context/PlayerContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  'server-info': Server,
  store: Store,
  profile: User,
  achievements: Trophy,
  vote: Vote,
  staff: Users,
  social: Share2,
  team: Shield,
  tutorial: BookOpen,
};

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { player, openLoginModal, logout } = usePlayer();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Hamburger button — always visible */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl glass hover:bg-white/15 transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-64 z-50 flex flex-col"
            style={{
              background: 'linear-gradient(160deg, rgba(10,15,25,0.98) 0%, rgba(20,28,45,0.98) 100%)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '8px 0 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                <img src={SERVER_LOGO} alt="VALORIA SMP" className="w-9 h-9 rounded-lg" />
                <span className="font-minecraft text-sm leading-tight">
                  <span className="text-amber-400">VALORIA</span>{' '}
                  <span className="text-white">SMP</span>
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Player Profile Section */}
            <div className="px-5 py-4 border-b border-white/8 bg-black/20">
              {player ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://mc-heads.net/avatar/${player.username}/40`}
                      alt={player.username}
                      className="w-10 h-10 rounded-lg bg-black/30 border border-white/10 shadow-inner flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-amber-400 truncate">
                        {player.username.startsWith('.') ? (
                          <>
                            <span className="font-minecraft mr-[-0.25em]">.</span>
                            <span className="font-minecraft">{player.username.substring(1).trim()}</span>
                          </>
                        ) : (
                          <span className="font-minecraft">{player.username}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">
                        Rank: <span className="text-emerald-400 font-bold">{player.rank}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar Akun
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all select-none"
                  style={{
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  }}
                >
                  <User className="w-4 h-4" />
                  Masuk Akun Player
                </button>
              )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {NAV_ITEMS.map((item, i) => {
                const Icon = iconMap[item.id];
                const active = isActive(item.href);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={item.href} onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/8'
                        }`}>
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {active && <ChevronRight className="w-3 h-3 opacity-60" />}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer — Admin */}
            <div className="px-3 pb-5 border-t border-white/8 pt-3">
              <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </div>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}