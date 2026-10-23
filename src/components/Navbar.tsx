/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { FalcronBadge } from './FalcronBadge';

interface NavbarProps {
  onNavigateToMonitor: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToMonitor, activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Overview', href: '#overview' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Live Monitor', href: '#live-monitor' },
    { name: 'Blockchain Proof', href: '#blockchain' },
    { name: 'Capabilities', href: '#security' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F5F2EB]/95 backdrop-blur-md border-b border-[#E5DFD5] shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Brand Zone: Mini Logo + Bold Wordmark */}
        <a
          href="#overview"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23] rounded-lg p-1"
        >
          <FalcronBadge size="sm" showInteractiveEffects={false} className="shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-extrabold text-xl tracking-wider text-[#18181B] group-hover:text-[#E31B23] transition-colors">
                FALCR<span className="text-[#E31B23]">O</span>N
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#78716C] leading-none">
              IoT Security Core
            </span>
          </div>
        </a>

        {/* Center Zone: Single-line Nav Links (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.name}
                href={link.href}
                className={`whitespace-nowrap transition-colors relative py-1 ${
                  isActive
                    ? 'text-[#18181B] font-semibold'
                    : 'hover:text-[#18181B]'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31B23] rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Zone: Status & Primary CTA */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs text-[#57534E] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#18181B] font-mono text-[11px] font-semibold">3 Nodes Guarded</span>
          </div>

          <button
            onClick={onNavigateToMonitor}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#E31B23] hover:bg-[#c9151c] active:scale-[0.98] transition-all rounded-full shadow-md shadow-[#E31B23]/25 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E31B23] focus-visible:ring-offset-[#F5F2EB]"
          >
            <Activity className="w-4 h-4" />
            <span>View Live Monitor</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white border border-[#E5DFD5] text-[#18181B] hover:text-[#E31B23] transition-colors focus-visible:ring-2 focus-visible:ring-[#E31B23]"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F5F2EB] border-b border-[#E5DFD5] px-4 pt-4 pb-6 space-y-3 mt-2 shadow-xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-[#57534E] hover:text-[#18181B] hover:bg-white rounded-md transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5DFD5] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs px-3 text-[#57534E]">
              <span>Sentinel Network</span>
              <span className="text-emerald-600 font-mono flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToMonitor();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#E31B23] hover:bg-[#c9151c] rounded-full shadow-md"
            >
              <Activity className="w-4 h-4" />
              <span>View Live Monitor</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
