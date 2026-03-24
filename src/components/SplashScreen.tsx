import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-wellness-bg flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-wellness-ink text-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-wellness-ink/20">
          <Shield size={48} />
        </div>
        <h1 className="text-4xl font-serif text-wellness-ink tracking-tight mb-2">DermScan AI</h1>
        <p className="text-wellness-ink/40 font-medium tracking-[0.2em] uppercase text-xs">Skin Health Intelligence</p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12"
      >
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-wellness-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-wellness-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-wellness-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </motion.div>
    </motion.div>
  );
};
