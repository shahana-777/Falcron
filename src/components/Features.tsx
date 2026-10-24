/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  ShieldAlert,
  BellRing,
  Link2,
  HardDriveDownload,
  LayoutDashboard,
  Fingerprint,
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      icon: Activity,
      title: 'Live Sensor Monitoring',
      description:
        'Continuous high-frequency telemetry ingestion across DS18B20 temperature probes, IR tripwires, and ESP8266 clusters with sub-15ms resolution.',
      accent: 'hover:border-[#E31B23]/60 hover:shadow-md',
      iconColor: 'text-[#E31B23]',
      iconBg: 'bg-red-50 border-red-200',
    },
    {
      icon: ShieldAlert,
      title: 'Malicious Payload Detection',
      description:
        'Python machine learning pipeline with AST grammar validation catches shellcode injections, buffer overflow exploits, and anomalous impedance drifts.',
      accent: 'hover:border-[#E31B23]/60 hover:shadow-md',
      iconColor: 'text-[#E31B23]',
      iconBg: 'bg-red-50 border-red-200',
    },
    {
      icon: BellRing,
      title: 'Real-Time Alerts',
      description:
        'Instant push notification over WebSockets with granular severity grading (low, medium, high, critical) and immediate perimeter quarantine actions.',
      accent: 'hover:border-[#1E3A8A]/60 hover:shadow-md',
      iconColor: 'text-[#1E3A8A]',
      iconBg: 'bg-blue-50 border-blue-200',
    },
    {
      icon: HardDriveDownload,
      title: 'Device Status Tracking',
      description:
        'Holistic health monitoring tracking Wi-Fi RSSI signal quality, uptime clock, free heap bytes, and firmware OTA version consistency.',
      accent: 'hover:border-[#E31B23]/60 hover:shadow-md',
      iconColor: 'text-[#E31B23]',
      iconBg: 'bg-red-50 border-red-200',
    },
    {
      icon: LayoutDashboard,
      title: 'Simple Unified Dashboard',
      description:
        'Clean high-contrast operational console pairing live Recharts sparklines with instant incident drilldowns and tamper verification tools.',
      accent: 'hover:border-[#1E3A8A]/60 hover:shadow-md',
      iconColor: 'text-[#1E3A8A]',
      iconBg: 'bg-blue-50 border-blue-200',
    },
  ];

  return (
    <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs text-[#57534E] mb-3 shadow-xs">
          <Fingerprint className="w-3.5 h-3.5 text-[#E31B23]" />
          <span className="font-medium">Core Defense Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-space text-[#18181B] tracking-tight mb-4">
          Enterprise IoT Protection Architecture
        </h2>
        <p className="text-base sm:text-lg text-[#57534E] max-w-2xl text-balance">
          Designed from the silicon up to protect vulnerable microcontroller nodes against zero-day payload exploits and physical wire tampering.
        </p>
      </div>

      {/* 6-Card Grid on White/Beige */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureList.map((feature, idx) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className={`p-6 rounded-xl bg-white border border-[#E5DFD5] transition-all duration-300 transform hover:scale-[1.02] shadow-xs ${feature.accent} group cursor-default text-left flex flex-col justify-between`}
            >
              <div>
                <div className={`w-11 h-11 rounded-lg border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform ${feature.iconBg}`}>
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>

                <h3 className="text-lg font-bold text-[#18181B] font-space mb-2 group-hover:text-[#E31B23] transition-colors">
                  {feature.title}
                </h3>

                <p className="text-sm text-[#57534E] leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5DFD5] flex items-center justify-between text-[11px] font-mono text-[#78716C]">
                <span>CAPABILITY 0{idx + 1}</span>
                <span className="text-emerald-700 font-bold">ACTIVE</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
