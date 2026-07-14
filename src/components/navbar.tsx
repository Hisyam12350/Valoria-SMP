'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Server, Store, Trophy, Vote, Users, Share2,
  Menu, X, Shield, BookOpen, Settings
} from 'lucide-react';
import { SERVER_LOGO, NAV_ITEMS } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  'server-info': Server,
  store: Store,
  achievements: Trophy,
  vote: Vote,
  staff: Users,
  social: Share2,
  team: Shield,
  tutorial: BookOpen,
};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Jangan tampilkan navbar di halaman admin
  if (pathname.startsWith('/admin')) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" passHref>
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={SERVER_LOGO} 
                alt="VALORIA SMP Logo" 
                className="h-9 w-9 rounded-lg"
              />
              <span className="text-lg font-bold hidden sm:block font-minecraft">
                <span className="text-amber-400">VALORIA</span>{' '}
                <span className="text-white">SMP</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.id];
              const active = isActive(item.href);
              return (
                <Link key={item.id} href={item.href} passHref>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                      active 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Admin Login Button - Desktop */}
          <Link href="/admin/login" passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 border border-transparent hover:border-amber-400/20 ml-1"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Admin</span>
            </motion.div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = iconMap[item.id];
                  const active = isActive(item.href);
                  return (
                    <Link key={item.id} href={item.href} passHref>
                      <motion.div
                        onClick={() => setMobileMenuOpen(false)}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                          active 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span className="font-medium text-sm">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}