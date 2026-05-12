'use client';

import { motion } from 'framer-motion';
import { SERVER_LOGO } from '@/lib/constants';

export function Footer() {
  return (
    <motion.footer 
      className="glass py-4 mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img 
            src={SERVER_LOGO} 
            alt="VALORIA SMP Logo" 
            className="w-6 h-6 rounded-lg"
          />
          <span className="font-bold text-sm font-minecraft">
            <span className="text-amber-400">VALORIA</span>{' '}
            <span className="text-white">SMP</span>
          </span>
        </div>
        <p className="text-gray-400 text-xs">
          © 2026 VALORIA SMP. All rights reserved.
        </p>
        <p className="text-gray-500 text-[10px] mt-1">
          Minecraft is a trademark of Mojang Studios
        </p>
      </div>
    </motion.footer>
  );
}
