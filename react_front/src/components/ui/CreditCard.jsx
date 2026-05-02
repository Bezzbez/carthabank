import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Eye, EyeOff, Wifi } from "lucide-react";

const PERSPECTIVE = 1000;
const CARD_ANIMATION_DURATION = 0.6;
const INITIAL_DELAY = 0.2;

export default function CreditCard({
  cardNumber = "4532 1234 5678 9010",
  cardHolder = "ENICARTHAGE CLIENT",
  expiryDate = "12/28",
  cvv = "123",
  variant = "gradient",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getMaskedNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    const lastFour = cleaned.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full my-8" style={{ minHeight: '260px' }}>
      <div className="relative" style={{ width: '384px', height: '224px' }}>
        <motion.div
          className="relative w-full h-full"
          style={{ perspective: PERSPECTIVE }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: CARD_ANIMATION_DURATION }}
        >
          <motion.div
            className="relative w-full h-full cursor-pointer"
            style={{ 
              transformStyle: "preserve-3d",
              rotateX,
              rotateY: isFlipped ? 180 : rotateY,
            }}
            animate={{ 
              rotateY: isFlipped ? 180 : 0, // Animate to 180 or back to 0
              scale: isClicked ? 0.95 : 1,
            }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setIsClicked(true);
              setTimeout(() => setIsClicked(false), 200);
              setIsFlipped(!isFlipped);
            }}
          >
            {/* Front of card */}
            <motion.div
              className="p-6 shadow-2xl overflow-hidden"
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '384px',
                height: '224px',
                borderRadius: '14px',
                background: variant === 'gradient' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)' : 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #111827 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transformOrigin: 'center center',
                zIndex: isFlipped ? 0 : 1
              }}
            >
              {/* Card shimmer effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top right, transparent, rgba(255,255,255,0.2), transparent)' }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
                />
              </div>

              {/* Card content */}
              <div className="relative h-full flex flex-col justify-between text-white z-10" style={{ width: '100%', height: '100%' }}>
                {/* Top section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: INITIAL_DELAY }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <div style={{ width: 44, height: 32, borderRadius: 6, background: '#c98a1a', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }} />
                    <Wifi style={{ width: 24, height: 24, transform: 'rotate(90deg)', opacity: 0.8 }} />
                  </motion.div>

                  <motion.button
                    style={{ padding: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', border: 'none', color: 'white' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
                    onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>

                {/* Card number */}
                <motion.div
                  style={{ fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isVisible ? cardNumber : getMaskedNumber(cardNumber)}
                </motion.div>

                {/* Bottom section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: 4 }}>CARD HOLDER</div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{cardHolder}</div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: 4 }}>EXPIRES</div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{isVisible ? expiryDate : "••/••"}</div>
                  </motion.div>

                  <motion.div
                    style={{ fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', opacity: 1, letterSpacing: '-1px' }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    CharthaBank
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Back of card */}
            <motion.div
              className="shadow-2xl overflow-hidden"
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '384px',
                height: '224px',
                borderRadius: '14px',
                background: variant === 'gradient' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)' : 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #111827 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                transformOrigin: 'center center',
                zIndex: isFlipped ? 1 : 0
              }}
            >
              {/* Magnetic strip */}
              <div className="absolute top-8 left-0 right-0 h-12 bg-black/80" />
              
              {/* Signature panel */}
              <div className="absolute top-24 left-6 right-6 bg-white/90 h-10 rounded flex items-center justify-end px-3">
                <motion.div 
                  className="text-black font-mono font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {isVisible ? cvv : "•••"}
                </motion.div>
              </div>

            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
