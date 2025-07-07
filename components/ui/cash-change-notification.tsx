import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CashChangeNotificationProps {
  amount: number;
  show: boolean;
  onComplete: () => void;
}

export function CashChangeNotification({ amount, show, onComplete }: CashChangeNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && amount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{ opacity: 1, y: -30, x: 20 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute right-0 top-0 pointer-events-none z-50"
        >
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            +₹{amount.toLocaleString()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
