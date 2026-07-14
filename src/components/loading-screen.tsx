'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SERVER_LOGO } from '@/lib/constants';

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a12]"
        >
          <div className="text-center">
            {/* Logo with pulse animation */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src={SERVER_LOGO} 
                alt="VALORIA SMP Logo" 
                className="w-24 h-24 mx-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
            
            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <h2 className="text-xl font-bold font-minecraft">
                <span className="text-amber-400">VALORIA</span>{' '}
                <span className="text-white">SMP</span>
              </h2>
            </motion.div>
            
            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 w-48 h-1 mx-auto bg-gray-800 rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="w-1/2 h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
            </motion.div>
            
            {/* Loading text */}
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mt-4 text-gray-400 text-sm"
            >
              Loading...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Page transition loading bar at top
export function PageTransitionLoader({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 z-[100] origin-left"
        />
      )}
    </AnimatePresence>
  );
}
