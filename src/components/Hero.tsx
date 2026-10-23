/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ShieldCheck, Terminal, Cpu, Database } from 'lucide-react';
import { FalcronBadge } from './FalcronBadge';

interface HeroProps {
  onExploreData: () => void;
  onExploreHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreData, onExploreHowItWorks }) => {
  const shouldReduceMotion = useReducedMotion();

  // Tagline: "Sharp Eyes on Every Device."
  // Sharp and Eyes in red, others in near-black charcoal #18181B
  const taglineWords = [
    { text: 'Sharp', isAccent: true },
    { text: 'Eyes', isAccent: true },
    { text: 'on', isAccent: false },
    { text: 'Every', isAccent: false },
    { text: 'Device.', isAccent: false },
  ];

  const taglineStartDelay = shouldReduceMotion ? 0 : 1.8;

  return (
    <section
      id="overview"
      className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-circuit-grid"
    >
      {/* Ambient warm radial backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#E31B23]/10 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#1E3A8A]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Centered FALCRON Logo Badge (Pops vividly on beige) */}
        <div className="mb-6">
          <FalcronBadge size="hero" showInteractiveEffects={true} />
        </div>

        {/* Wordmark typography banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.8 }}
          className="flex items-center gap-2 mb-3"
        >
          <span className="font-orbitron font-black text-2xl sm:text-3xl tracking-[0.25em] text-[#E31B23]">
            FALCRON
          </span>
          <span className="text-xs uppercase font-mono tracking-widest text-[#57534E] px-2.5 py-0.5 rounded-full border border-[#E5DFD5] bg-white shadow-xs">
            Autonomous IoT Defense
          </span>
        </motion.div>

        {/* Animated Tagline with Word-by-Word Reveal */}
        <div className="relative inline-block mb-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-space tracking-tight text-[#18181B] flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
            {taglineWords.map((word, index) => {
              const wordDelay = taglineStartDelay + index * 0.08;

              return (
                <motion.span
                  key={index}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: wordDelay,
                    ease: 'easeOut',
                  }}
                  className={`inline-block ${
                    word.isAccent
                      ? 'text-[#E31B23] drop-shadow-sm'
                      : 'text-[#18181B]'
                  }`}
                >
                  {word.text}
                </motion.span>
              );
            })}
          </h1>

          {/* Thin Underline Drawing Left-to-Right */}
          <motion.div
            className="h-[2.5px] bg-gradient-to-r from-[#E31B23] via-[#E31B23] to-[#1E3A8A] mt-3 origin-left rounded-full shadow-xs"
            initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.5,
              delay: taglineStartDelay + taglineWords.length * 0.08 + 0.1,
              ease: 'easeOut',
            }}
          />
        </div>

        {/* One-line subtext */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-[#57534E] max-w-2xl font-normal leading-relaxed mb-10 text-balance"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: shouldReduceMotion ? 0 : taglineStartDelay + 0.6,
          }}
        >
          Real-time IoT monitoring, AI threat detection, and blockchain-verified
          security — in one system.
        </motion.p>

        {/* Two CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: shouldReduceMotion ? 0 : taglineStartDelay + 0.8,
          }}
        >
          <button
            onClick={onExploreData}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 text-base font-semibold text-white bg-[#E31B23] hover:bg-[#c9151c] active:scale-[0.98] rounded-full shadow-lg shadow-[#E31B23]/25 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E31B23] focus-visible:ring-offset-[#F5F2EB]"
          >
            <span>See Live Data</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          <button
            onClick={onExploreHowItWorks}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-[#18181B] bg-white hover:bg-[#FAF7F2] active:scale-[0.98] border border-[#1E3A8A] rounded-full cursor-pointer transition-all hover:border-[#3B82F6] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
          >
            <span>How It Works</span>
          </button>
        </motion.div>

        {/* Operational Proof strip */}
        <motion.div
          className="mt-14 pt-8 border-t border-[#E5DFD5] w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: shouldReduceMotion ? 0 : taglineStartDelay + 1.0,
          }}
        >
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#57534E] mb-1">
              <Cpu className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span className="font-medium">Edge Nodes</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#18181B] tabular-nums">
              ESP8266 + Sens
            </div>
            <div className="text-[11px] text-[#78716C]">Sub-15ms ingest cycle</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#57534E] mb-1">
              <Terminal className="w-3.5 h-3.5 text-[#E31B23]" />
              <span className="font-medium">AI Payload Scan</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#18181B] tabular-nums">
              100% Inspected
            </div>
            <div className="text-[11px] text-[#78716C]">FastAPI + ML engine</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#57534E] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">Detection Rate</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-600 tabular-nums">
              99.8% Recall
            </div>
            <div className="text-[11px] text-[#78716C]">Zero false overrides</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#57534E] mb-1">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-medium">Audit Ledger</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#18181B] tabular-nums">
              EVM Rollup
            </div>
            <div className="text-[11px] text-[#78716C]">Tamper-evident hashes</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
