import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedSide Component
 * Displays tailoring-related animations on the right side
 * Features:
 * - Sewing machine animation
 * - Needle and thread movement
 * - Fabric pattern fade-in
 * - Measuring tape motion
 */
function AnimatedSide() {
  // Animation variants for staggered effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  // Needle animation - up and down motion
  const needleVariants = {
    animate: {
      y: [0, 15, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Thread spool rotation
  const spoolVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  // Measuring tape slide
  const tapeVariants = {
    animate: {
      x: [0, 20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Fabric pattern fade
  const fabricVariants = {
    animate: {
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background circles */}
      <motion.div
        className="absolute top-10 right-10 w-40 h-40 bg-blue-200 rounded-full opacity-10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-60 h-60 bg-gold rounded-full opacity-5 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      {/* Main SVG Illustration */}
      <motion.svg
        className="w-80 h-80 relative z-10"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={itemVariants}
      >
        {/* Sewing Machine Base */}
        <rect
          x="80"
          y="200"
          width="240"
          height="120"
          rx="8"
          fill="#1B2A41"
          opacity="0.1"
          stroke="#1B2A41"
          strokeWidth="2"
        />

        {/* Machine Head */}
        <rect
          x="100"
          y="140"
          width="200"
          height="80"
          rx="8"
          fill="#1B2A41"
          opacity="0.15"
          stroke="#1B2A41"
          strokeWidth="2"
        />

        {/* Needle Housing */}
        <rect
          x="180"
          y="100"
          width="40"
          height="60"
          rx="4"
          fill="#CBA135"
          stroke="#1B2A41"
          strokeWidth="2"
        />

        {/* Needle - Animated */}
        <motion.line
          x1="200"
          y1="100"
          x2="200"
          y2="160"
          stroke="#1B2A41"
          strokeWidth="3"
          strokeLinecap="round"
          variants={needleVariants}
          animate="animate"
        />

        {/* Needle Point */}
        <motion.circle
          cx="200"
          cy="160"
          r="3"
          fill="#1B2A41"
          variants={needleVariants}
          animate="animate"
        />

        {/* Thread Spool - Animated */}
        <motion.g variants={spoolVariants} animate="animate">
          <circle cx="120" cy="120" r="25" fill="none" stroke="#CBA135" strokeWidth="2" />
          <circle cx="120" cy="120" r="20" fill="none" stroke="#CBA135" strokeWidth="1" opacity="0.5" />
          <circle cx="120" cy="120" r="15" fill="none" stroke="#CBA135" strokeWidth="1" opacity="0.3" />
          <circle cx="120" cy="120" r="8" fill="#CBA135" />
        </motion.g>

        {/* Thread Line from Spool to Needle */}
        <path
          d="M 145 120 Q 170 110 200 100"
          stroke="#CBA135"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Fabric under needle - Animated */}
        <motion.g variants={fabricVariants} animate="animate">
          <rect
            x="160"
            y="170"
            width="80"
            height="60"
            rx="4"
            fill="#F8F8F8"
            stroke="#1B2A41"
            strokeWidth="2"
          />
          <line x1="170" y1="180" x2="230" y2="180" stroke="#CBA135" strokeWidth="1" opacity="0.5" />
          <line x1="170" y1="190" x2="230" y2="190" stroke="#CBA135" strokeWidth="1" opacity="0.5" />
          <line x1="170" y1="200" x2="230" y2="200" stroke="#CBA135" strokeWidth="1" opacity="0.5" />
          <line x1="170" y1="210" x2="230" y2="210" stroke="#CBA135" strokeWidth="1" opacity="0.5" />
          <line x1="170" y1="220" x2="230" y2="220" stroke="#CBA135" strokeWidth="1" opacity="0.5" />
        </motion.g>

        {/* Measuring Tape - Animated */}
        <motion.g variants={tapeVariants} animate="animate">
          <rect
            x="280"
            y="280"
            width="100"
            height="20"
            rx="4"
            fill="#CBA135"
            opacity="0.2"
            stroke="#CBA135"
            strokeWidth="1"
          />
          <text x="290" y="295" fontSize="12" fill="#1B2A41" fontWeight="bold">
            MEASURE
          </text>
        </motion.g>

        {/* Decorative Stitches */}
        <motion.path
          d="M 50 250 Q 70 240 90 250 T 130 250 T 170 250 T 210 250 T 250 250 T 290 250 T 330 250 T 370 250"
          stroke="#CBA135"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </motion.svg>

      {/* Text Content */}
      <motion.div className="text-center mt-8 relative z-10" variants={itemVariants}>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Smart Stitch</h2>
        <p className="text-lg text-gray-600">Smart Tailoring. Smarter Management.</p>
      </motion.div>

      {/* Feature Pills */}
      <motion.div className="flex gap-4 mt-8 flex-wrap justify-center relative z-10" variants={itemVariants}>
        {['Fast', 'Secure', 'Professional'].map((feature, idx) => (
          <motion.div
            key={idx}
            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200"
            whileHover={{ scale: 1.05 }}
          >
            {feature}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default AnimatedSide;
