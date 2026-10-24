/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FalcronBadge } from './FalcronBadge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#ECE7DC] border-t border-[#E5DFD5] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#DFD8CC]">
        {/* Brand Lockup */}
        <div className="flex items-center gap-4">
          <FalcronBadge size="md" showInteractiveEffects={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-xl tracking-wider text-[#18181B]">
                FALCR<span className="text-[#E31B23]">O</span>N
              </span>
              <span className="text-[10px] uppercase font-mono bg-white text-[#57534E] px-2 py-0.5 rounded border border-[#E5DFD5]">
                IoT Security Core
              </span>
            </div>
            <p className="text-xs text-[#57534E] mt-1 font-space">
              Sharp Eyes on Every Device.
            </p>
          </div>
        </div>

        {/* Navigation Links (Without Tech Stack) */}
        <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#57534E]">
          <a href="#overview" className="hover:text-[#18181B] transition-colors">
            Overview
          </a>
          <a href="#how-it-works" className="hover:text-[#18181B] transition-colors">
            How It Works
          </a>
          <a href="#live-monitor" className="hover:text-[#18181B] transition-colors">
            Live Monitor
          </a>
          <a href="#security" className="hover:text-[#18181B] transition-colors">
            Capabilities
          </a>
        </nav>
      </div>

      {/* Bottom Sub-footer */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#57534E]">
        <div>
          © {new Date().getFullYear()} FALCRON IoT Security. All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            SHA-256 Ledger Synchronized
          </span>
          <span className="text-[#D6CEC1]">|</span>
          <span className="font-mono text-[11px] font-medium text-[#78716C]">
            MQTT TLS 1.3 / L2 Arbitrum
          </span>
        </div>
      </div>
    </footer>
  );
};
