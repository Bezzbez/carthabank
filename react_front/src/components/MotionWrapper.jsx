import React from 'react';
import { motion } from 'framer-motion';

/**
 * MotionWrapper Component
 * =====================
 * Provides smooth page and element animations using Framer Motion
 */

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export const CardAnimation = ({ children, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, staggerDelay = 0.1 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const NumberCounter = ({ value, duration = 1.2, decimals = 2 }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const from = 0;
    const to = parseFloat(value) || 0;
    const isNegative = to < 0;
    const absoluteTo = Math.abs(to);

    let startTime = Date.now();

    const updateNumber = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: cubic-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = from + (absoluteTo - from) * easeProgress;

      ref.current.textContent = (isNegative ? '-' : '') + current.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    updateNumber();
  }, [value, duration, decimals]);

  return <span ref={ref}>0</span>;
};

export const FloatingLabel = ({ children, delay = 0 }) => {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export const PulseButton = ({ children, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const ModalOverlay = ({ children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Shimmer loading animation
export const ShimmerLoader = ({ count = 3 }) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 60,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      ))}
    </motion.div>
  );
};
