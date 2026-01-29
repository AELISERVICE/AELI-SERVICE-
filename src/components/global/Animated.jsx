import { motion, AnimatePresence } from 'framer-motion';

export function Animated({ children }) {
  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          // On s'assure que ce wrapper ne bloque pas les clics et ne prend pas de place
          className="z-[100] relative" 
        >
          {children}
        </motion.div>
    </AnimatePresence>
  );
}