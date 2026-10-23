/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { LiveMonitor } from './components/LiveMonitor';
import { BlockchainPanel } from './components/BlockchainPanel';
import { Features } from './components/Features';
import { Footer } from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [selectedHashForVerification, setSelectedHashForVerification] = useState<string>(
    '0x8f2d65c401b876e93ca910fa3e56bc7492193b2a1a89c72e2d9b4f61c37b018e'
  );

  // Scroll listener to update active section in navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'how-it-works', 'live-monitor', 'blockchain', 'security'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#18181B] font-sans antialiased selection:bg-[#E31B23] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onNavigateToMonitor={() => scrollTo('live-monitor')}
        activeSection={activeSection}
      />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          onExploreData={() => scrollTo('live-monitor')}
          onExploreHowItWorks={() => scrollTo('how-it-works')}
        />

        {/* How It Works (5-step timeline) */}
        <HowItWorks />

        {/* Live Monitor (Device Cards + Threat Feed) */}
        <LiveMonitor
          onSelectHashForVerification={(hash) => {
            setSelectedHashForVerification(hash);
          }}
        />

        {/* Blockchain Verification Panel */}
        <BlockchainPanel selectedHash={selectedHashForVerification} />

        {/* Security Capabilities Grid (6 cards) */}
        <Features />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
