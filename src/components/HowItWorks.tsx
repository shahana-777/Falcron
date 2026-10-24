/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Radio, BrainCircuit, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      num: '01',
      title: 'Sensor Capture',
      subtitle: 'ESP8266 + Temperature & IR Nodes',
      desc: 'Edge microcontrollers capture high-frequency ambient telemetry (temperature drift, beam trip status, voltage jitter) directly at the hardware layer.',
      icon: Cpu,
      accent: 'border-[#E31B23] text-[#E31B23]',
      detail: 'Sensors: DS18B20 1-Wire thermal probe and passive infrared (PIR) tripwire coupled with ESP8266 GPIO. Local microsecond debounce and CRC-16 hardware checks prevent analog line noise.',
      tag: 'Hardware Ingest',
    },
    {
      num: '02',
      title: 'MQTT Streaming',
      subtitle: 'Encrypted Telemetry Pipeline',
      desc: 'Readings are serialized into lightweight MQTT frames and published over TLS 1.3 to the Mosquitto broker with strict topic-level access control.',
      icon: Radio,
      accent: 'border-[#1E3A8A] text-[#1E3A8A]',
      detail: 'Protocol: MQTT over TLS port 8883. Low packet overhead allows sub-15ms round-trips from remote battery/solar nodes without buffer exhaustion.',
      tag: 'Secure Transport',
    },
    {
      num: '03',
      title: 'Python AI Scan',
      subtitle: 'Real-Time Anomaly & Payload Engine',
      desc: 'A high-throughput FastAPI/Flask service receives every payload, running AST parsing, shellcode signature detection, and deep isolation forest models.',
      icon: BrainCircuit,
      accent: 'border-[#E31B23] text-[#E31B23]',
      detail: 'AI Engine: Dual-layer scrutiny. Layer 1 runs deterministic grammar validation and byte bounds. Layer 2 runs an inference model scoring rate-of-change, payload entropy, and MQTT header malformation.',
      tag: 'Inference Layer',
    },
    {
      num: '04',
      title: 'Instant Flagging & Defense',
      subtitle: 'Live Incident Dispatch & Quarantine',
      desc: 'Suspicious payloads are flagged in milliseconds on the FALCRON console, triggering automated node quarantine and edge hardware alarms.',
      icon: AlertTriangle,
      accent: 'border-[#E31B23] text-[#E31B23]',
      detail: 'Alerting: Push notifications over WebSockets stream to the Threat Feed with exact packet snippets, anomaly scores, and immediate node isolation triggers.',
      tag: 'Instant Triaging',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs text-[#57534E] mb-3 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]" />
          <span className="font-medium">Autonomous Defense Pipeline</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-space text-[#18181B] tracking-tight mb-4">
          How FALCRON Protects Every Sensor
        </h2>
        <p className="text-base sm:text-lg text-[#57534E] max-w-2xl text-balance">
          From edge silicon to AI inspection — an unbroken chain of security for IoT telemetry.
        </p>
      </div>

      {/* Horizontal Desktop Timeline / Vertical Mobile */}
      <div className="relative">
        {/* Continuous Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute top-[52px] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-[#E31B23] via-[#1E3A8A] to-[#E31B23] opacity-30 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col p-5 rounded-xl bg-white border transition-all duration-200 cursor-pointer text-left relative group ${
                  isSelected
                    ? 'border-[#E31B23] shadow-md -translate-y-1 ring-1 ring-[#E31B23]/30'
                    : 'border-[#E5DFD5] hover:border-[#C4B9A9] hover:shadow-xs hover:-translate-y-0.5'
                }`}
              >
                {/* Step indicator header */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-full border-2 bg-[#0B1120] flex items-center justify-center transition-all duration-300 ${step.accent} ${
                      isSelected ? 'scale-110 shadow-md shadow-[#E31B23]/25' : 'group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#57534E] bg-[#F5F2EB] px-2 py-0.5 rounded border border-[#E5DFD5]">
                    {step.num}
                  </span>
                </div>

                <div className="text-xs uppercase font-mono tracking-wider text-[#78716C] mb-1 font-semibold">
                  {step.tag}
                </div>

                <h3 className="text-base font-bold text-[#18181B] font-space group-hover:text-[#E31B23] transition-colors mb-1">
                  {step.title}
                </h3>

                <div className="text-xs font-medium text-[#57534E] mb-3">
                  {step.subtitle}
                </div>

                <p className="text-xs text-[#57534E] leading-relaxed mb-4 flex-grow">
                  {step.desc}
                </p>

                <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between text-[11px] text-[#78716C]">
                  <span className={isSelected ? 'text-[#E31B23] font-semibold' : ''}>
                    {isSelected ? 'Active Focus' : 'Inspect details'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-[#E31B23]' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Deep Dive Banner */}
      <div className="mt-8 p-6 rounded-xl bg-white border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#E31B23]">
              STEP {steps[activeStep].num} TECHNICAL SPECIFICATION:
            </span>
            <span className="text-sm font-semibold text-[#18181B]">
              {steps[activeStep].title}
            </span>
          </div>
          <p className="text-sm text-[#57534E] leading-relaxed">
            {steps[activeStep].detail}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
          <a
            href="#live-monitor"
            className="w-full md:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#E31B23] hover:bg-[#c9151c] rounded-full transition-all text-center shadow-xs"
          >
            Watch In Live Monitor
          </a>
        </div>
      </div>
    </section>
  );
};
