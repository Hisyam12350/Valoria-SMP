'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingScreen } from './loading-screen';

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen isLoading={isPageLoading} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: isPageLoading ? 0.5 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
