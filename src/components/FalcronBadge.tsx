/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FalcronBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showInteractiveEffects?: boolean;
  className?: string;
}

export const FalcronBadge: React.FC<FalcronBadgeProps> = ({
  size = 'hero',
  showInteractiveEffects = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [scanSettled, setScanSettled] = useState(false);

  // Dimension scaling
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    hero: 'w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80',
  };

  useEffect(() => {
    if (shouldReduceMotion) {
      setScanSettled(true);
      return;
    }
    // After 0.6s scale + 1.2s radar sweep, settle into continuous pulse
    const timer = setTimeout(() => {
      setScanSettled(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
        {/* Soft shadow & ambient warm backlight on beige */}
        <div 
          className="absolute inset-[-12px] sm:inset-[-18px] rounded-full blur-2xl opacity-40 pointer-events-none transition-all duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(227, 27, 35, 0.25) 0%, rgba(30, 58, 138, 0.2) 50%, transparent 70%)',
          }}
        />

        {/* Outer Circular Aperture Ring with Red Accent */}
        <div
          className={`absolute inset-[-6px] sm:inset-[-8px] rounded-full transition-all duration-500 pointer-events-none ${
            size === 'hero' ? 'border-2' : 'border'
          }`}
          style={{
            borderColor: 'rgba(227, 27, 35, 0.4)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), inset 0 0 12px rgba(227, 27, 35, 0.15)',
          }}
        />

        {/* 360° Radar Sweep Ring (Hero only) */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-[-8px] sm:inset-[-12px] rounded-full pointer-events-none"
            initial={{ rotate: 0, opacity: 0 }}
            animate={
              scanSettled
                ? {
                    opacity: [0.4, 0.9, 0.4],
                    scale: [1, 1.025, 1],
                    transition: {
                      repeat: Infinity,
                      duration: 2.5,
                      ease: 'easeInOut',
                    },
                  }
                : {
                    rotate: 360,
                    opacity: [0, 1, 1, 0.9],
                    transition: {
                      duration: 1.2,
                      ease: 'easeOut',
                      delay: 0.6,
                    },
                  }
            }
            style={{
              border: '2px solid transparent',
              borderTopColor: '#E31B23',
              borderRightColor: '#E31B23',
              boxShadow: '0 0 16px rgba(227, 27, 35, 0.4)',
            }}
          />
        )}

        {/* Base Logo Container with Page-Load Scale & Contrast Medallion Frame */}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#0B1120] shadow-2xl transition-all duration-500 border-2 border-[#1E2A45]"
          initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Render Official Badge Artwork */}
          <div className="relative w-full h-full">
            <img
              src="/assets/aistudio/falcron_2a9d1d37.png"
              alt="FALCRON AI IoT Security Shield Logo"
              className="w-full h-full object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* SVG Overlay for Falcon Eye Blink & Radar Scan Line */}
            {showInteractiveEffects && (
              <svg
                viewBox="0 0 400 400"
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                aria-hidden="true"
              >
                {/* Radar beam overlay sweeping during load */}
                {!shouldReduceMotion && !scanSettled && (
                  <motion.line
                    x1="200"
                    y1="200"
                    x2="200"
                    y2="10"
                    stroke="#E31B23"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                    style={{ transformOrigin: '200px 200px' }}
                  />
                )}

                {/* Falcon Eye Animated Element for precise 1-second blink */}
                {!shouldReduceMotion && (
                  <motion.g
                    initial={{ scaleY: 1 }}
                    animate={{
                      scaleY: [1, 1, 0.1, 1, 1],
                    }}
                    transition={{
                      times: [0, 0.15, 0.2, 0.25, 1],
                      duration: 5,
                      repeat: Infinity,
                      delay: 1.0,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: '256px 148px' }}
                  >
                    <circle
                      cx="256"
                      cy="148"
                      r="4.5"
                      fill="#FF2222"
                      className="filter drop-shadow-[0_0_8px_#E31B23]"
                    />
                    <circle cx="258" cy="146" r="1.5" fill="#FFFFFF" />
                  </motion.g>
                )}
              </svg>
            )}
          </div>
        </motion.div>

        {/* Concentric tick marks for high-precision styling */}
        {size === 'hero' && (
          <div className="absolute inset-[-20px] sm:inset-[-26px] rounded-full border border-dashed border-[#D6CEC1] pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E31B23]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#1E3A8A]" />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#E31B23]" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#1E3A8A]" />
          </div>
        )}
      </div>
    </div>
  );
};
