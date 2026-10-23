/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Send, AlertTriangle, ShieldCheck, Terminal, Bug } from 'lucide-react';
import { Device, injectCustomPayload } from '../services/api';

interface PayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  onPayloadInjected: (alertId: string) => void;
}

export const PayloadModal: React.FC<PayloadModalProps> = ({
  isOpen,
  onClose,
  devices,
  onPayloadInjected,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || 'dev-temp-01');
  const [payloadText, setPayloadText] = useState<string>('{"temp": 98.4, "cmd": "OVERWRITE_EEPROM_0x7F"}');
  const [isMalicious, setIsMalicious] = useState<boolean>(true);
  const [customReason, setCustomReason] = useState<string>('Unauthorized EEPROM overwrite instruction detected');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const attackPresets = [
    {
      label: 'MQTT Buffer Overflow',
      deviceType: 'esp_node',
      payload: '\\x90\\x90\\x90\\x90\\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68\\x68\\x2f\\x62\\x69\\x6e\\x89\\xe3\\x50\\x53\\x89\\xe1\\xb0\\x0b\\xcd\\x80',
      reason: 'Shellcode NOP sled & execve exploit injected into MQTT header',
      malicious: true,
    },
    {
      label: 'IR Beam Impairment / Blind',
      deviceType: 'ir',
      payload: 'INTRUDER_OVERRIDE_PIN=13;VOLTAGE_PULSE=HIGH;SIG_MASK=0xFF',
      reason: 'Sustained artificial high impedance override attempt on optical sensor',
      malicious: true,
    },
    {
      label: 'Anomalous Thermal Spike (+75°C)',
      deviceType: 'temperature',
      payload: '{"temp": 98.4, "delta_rate": "+74.2C/s", "crc": "0xDEADBEEF"}',
      reason: 'Violates thermodynamic gradient limits (>10°C/s physics threshold)',
      malicious: true,
    },
    {
      label: 'Valid Calibration Telemetry',
      deviceType: 'temperature',
      payload: '{"temp": 23.45, "vcc": 3.31, "humidity": 45.2, "seq": 59124}',
      reason: 'Payload conforms to schema definition; CRC32 signature verified',
      malicious: false,
    },
  ];

  const handleApplyPreset = (preset: typeof attackPresets[0]) => {
    const matchedDev = devices.find(d => d.type === preset.deviceType) || devices[0];
    if (matchedDev) setSelectedDeviceId(matchedDev.id);
    setPayloadText(preset.payload);
    setCustomReason(preset.reason);
    setIsMalicious(preset.malicious);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const createdAlert = await injectCustomPayload(
        selectedDeviceId,
        payloadText,
        isMalicious,
        customReason
      );
      onPayloadInjected(createdAlert.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white border border-[#E5DFD5] rounded-2xl shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD5] bg-[#F5F2EB]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#E31B23]/10 border border-[#E31B23]/30 text-[#E31B23]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-bold text-[#18181B] font-space">
                Payload Injection Simulator
              </h3>
              <p className="text-xs text-[#57534E]">
                Transmit raw packet into FALCRON Python AI inspector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#57534E] hover:text-[#18181B] hover:bg-[#E5DFD5] rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#57534E] mb-2 font-semibold">
              Select Attack or Normal Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {attackPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                    payloadText === preset.payload
                      ? 'bg-[#F5F2EB] border-[#E31B23] text-[#18181B] font-semibold'
                      : 'bg-white border-[#E5DFD5] text-[#57534E] hover:text-[#18181B] hover:border-[#C4B9A9]'
                  }`}
                >
                  <span className="truncate">{preset.label}</span>
                  {preset.malicious ? (
                    <Bug className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Target Device */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#57534E] mb-1.5 font-semibold">
              Target IoT Sensor
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F5F2EB] border border-[#E5DFD5] rounded-lg text-[#18181B] focus:outline-none focus:border-[#E31B23]"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip}) — {d.type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Payload Buffer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#57534E] font-semibold">
                Raw Telemetry Payload Buffer
              </label>
              <span className="text-[11px] font-mono text-[#78716C]">
                {payloadText.length} bytes
              </span>
            </div>
            <textarea
              rows={3}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#F5F2EB] border border-[#E5DFD5] rounded-lg text-[#18181B] focus:outline-none focus:border-[#E31B23] leading-relaxed resize-none"
              placeholder="Enter JSON, raw bytes, hex, or CLI commands..."
            />
          </div>

          {/* Verdict Classification Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F2EB] border border-[#E5DFD5]">
            <div className="flex items-center gap-2">
              {isMalicious ? (
                <AlertTriangle className="w-4 h-4 text-[#E31B23]" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              )}
              <span className="text-xs font-medium text-[#18181B]">
                Simulate As: {isMalicious ? 'Malicious Attack Vector' : 'Benign Telemetry'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMalicious(!isMalicious)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                isMalicious
                  ? 'bg-[#E31B23]/15 text-[#E31B23] border border-[#E31B23]/40'
                  : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/40'
              }`}
            >
              {isMalicious ? 'Malicious [ALERT]' : 'Clean [PASS]'}
            </button>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !payloadText.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#E31B23] hover:bg-[#c9151c] disabled:opacity-50 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting...' : 'Dispatch to AI Inspector'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
