/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Thermometer,
  Radio,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  PlusCircle,
  Shield,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  Device,
  ThreatAlert,
  subscribeDevices,
  subscribeAlerts,
  toggleSimulation,
  isSimulationActive,
} from '../services/api';
import { PayloadModal } from './PayloadModal';

interface LiveMonitorProps {
  onSelectHashForVerification?: (hash: string) => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  onSelectHashForVerification,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [isSimActive, setIsSimActive] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'malicious' | 'clean'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newestAlertId, setNewestAlertId] = useState<string | null>(null);

  // Subscribe to live telemetry and alerts
  useEffect(() => {
    const unsubDevices = subscribeDevices((updatedDevices) => {
      setDevices(updatedDevices);
    });

    const unsubAlerts = subscribeAlerts((updatedAlerts) => {
      if (updatedAlerts.length > 0 && updatedAlerts[0].id !== newestAlertId) {
        setNewestAlertId(updatedAlerts[0].id);
      }
      setAlerts(updatedAlerts);
    });

    setIsSimActive(isSimulationActive());

    return () => {
      unsubDevices();
      unsubAlerts();
    };
  }, []);

  const handleToggleSimulation = () => {
    const nextState = !isSimActive;
    toggleSimulation(nextState);
    setIsSimActive(nextState);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterMode === 'malicious' && alert.verdict !== 'Malicious') return false;
    if (filterMode === 'clean' && alert.verdict !== 'Clean') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        alert.deviceName.toLowerCase().includes(q) ||
        alert.reason.toLowerCase().includes(q) ||
        alert.hash.toLowerCase().includes(q) ||
        alert.payloadSnippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'temperature':
        return Thermometer;
      case 'ir':
        return Radio;
      case 'esp_node':
      default:
        return Cpu;
    }
  };

  return (
    <section id="live-monitor" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header & Live Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#57534E] uppercase tracking-wider font-mono mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[#18181B]">Mission Control</span>
            <span className="text-[#D6CEC1]">|</span>
            <span className="text-[#1E3A8A] font-semibold">Python Anomaly Daemon</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-space text-[#18181B] tracking-tight">
            Live IoT Telemetry & Threat Feed
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] mt-2 max-w-xl">
            Real-time sensor streams from ESP8266 nodes and instant malicious payload classification.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pause / Resume Simulation */}
          <button
            onClick={handleToggleSimulation}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors shadow-xs cursor-pointer ${
              isSimActive
                ? 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
            }`}
            title={isSimActive ? 'Pause incoming live stream' : 'Resume incoming live stream'}
          >
            {isSimActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="font-semibold">{isSimActive ? 'Stream: Live' : 'Stream: Paused'}</span>
          </button>

          {/* Inject Test Attack Payload */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#E31B23] hover:bg-[#c9151c] active:scale-[0.98] transition-all shadow-md shadow-[#E31B23]/25 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Inject Test Attack Payload</span>
          </button>
        </div>
      </div>

      {/* Grid of Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {devices.map((device) => {
          const Icon = getDeviceIcon(device.type);
          const isAlert = device.status === 'alert';
          const strokeColor = isAlert ? '#E31B23' : device.type === 'ir' ? '#1E3A8A' : '#059669';

          return (
            <div
              key={device.id}
              className={`flex flex-col p-6 rounded-xl bg-white border transition-all duration-300 relative overflow-hidden group shadow-xs ${
                isAlert
                  ? 'border-[#E31B23] ring-1 ring-[#E31B23]/40 shadow-lg shadow-[#E31B23]/15'
                  : 'border-[#E5DFD5] hover:border-[#C4B9A9] hover:shadow-md'
              }`}
            >
              {/* Header: Name + Status Pill */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                      isAlert
                        ? 'bg-[#E31B23]/10 border-[#E31B23] text-[#E31B23]'
                        : 'bg-[#F5F2EB] border-[#E5DFD5] text-[#57534E] group-hover:text-[#18181B]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#18181B] font-space">
                      {device.name}
                    </h3>
                    <p className="text-xs text-[#57534E] font-mono truncate max-w-[160px]">
                      {device.location}
                    </p>
                  </div>
                </div>

                {/* Status Pill */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase transition-colors ${
                    isAlert
                      ? 'bg-[#E31B23]/15 text-[#E31B23] border border-[#E31B23]/30'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAlert ? 'bg-[#E31B23] animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{device.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Value & Reading */}
              <div className="flex items-baseline justify-between mt-2 mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-[#18181B] tabular-nums tracking-tight">
                    {device.type === 'ir'
                      ? device.value === 1
                        ? 'TRIP'
                        : 'CLEAR'
                      : device.value}
                  </span>
                  <span className="text-sm font-mono text-[#57534E] font-medium">
                    {device.type === 'ir' ? 'STATE' : device.unit}
                  </span>
                </div>

                <div className="text-right text-[11px] font-mono text-[#78716C]">
                  <span>IP: {device.ip}</span>
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="h-20 w-full mb-4 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={device.history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${device.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-1.5 bg-white border border-[#E5DFD5] shadow-xs rounded text-[10px] font-mono text-[#18181B]">
                              <span className="text-[#57534E]">{payload[0].payload.time}: </span>
                              <span className="font-bold text-[#E31B23]">
                                {payload[0].value} {device.unit}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={strokeColor}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-${device.id})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Hardware Spec Strip */}
              <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between text-[11px] font-mono text-[#78716C]">
                <span>Topic: {device.mqttTopic.split('/').pop()}</span>
                <span>{device.firmware}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Threat Feed Panel */}
      <div className="bg-white border border-[#E5DFD5] rounded-xl overflow-hidden shadow-sm">
        {/* Panel Header */}
        <div className="p-5 border-b border-[#E5DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E31B23]/10 border border-[#E31B23]/30 text-[#E31B23]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#18181B] font-space">
                  Real-Time Threat Feed
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#E5DFD5] text-[#57534E] font-medium">
                  {alerts.length} inspections
                </span>
              </div>
              <p className="text-xs text-[#57534E]">
                Autonomous Python pipeline filtering anomalous IoT payloads
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hash or device..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E5DFD5] rounded-lg text-[#18181B] placeholder-[#78716C] focus:outline-none focus:border-[#E31B23] w-44 sm:w-52"
              />
            </div>

            {/* Filter Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#F5F2EB] border border-[#E5DFD5] rounded-lg">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-[#18181B] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('malicious')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filterMode === 'malicious'
                    ? 'bg-[#E31B23] text-white font-bold shadow-xs'
                    : 'text-[#57534E] hover:text-[#E31B23]'
                }`}
              >
                Malicious
              </button>
              <button
                onClick={() => setFilterMode('clean')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filterMode === 'clean'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                Clean
              </button>
            </div>
          </div>
        </div>

        {/* Feed Table with aria-live for accessibility */}
        <div
          className="overflow-x-auto max-h-[460px] overflow-y-auto"
          aria-live="polite"
          aria-label="Real-time threat feed"
        >
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAF7F2] text-[#57534E] uppercase font-mono text-[11px] sticky top-0 z-10 border-b border-[#E5DFD5]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Device</th>
                <th className="py-3 px-4 font-semibold">Verdict</th>
                <th className="py-3 px-4 font-semibold">Reason / Heuristic</th>
                <th className="py-3 px-4 font-semibold">Payload Hex Snippet</th>
                <th className="py-3 px-4 font-semibold text-right">Blockchain Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5]">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#57534E]">
                    No security events match the current filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const isMalicious = alert.verdict === 'Malicious';
                  const isNew = alert.id === newestAlertId;

                  return (
                    <tr
                      key={alert.id}
                      className={`transition-colors duration-300 ${
                        isMalicious
                          ? isNew
                            ? 'bg-red-100/70 animate-pulse'
                            : 'bg-red-50/50 hover:bg-red-50/80'
                          : 'hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono tabular-nums text-[#57534E] whitespace-nowrap font-medium">
                        {alert.timestamp}
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4 font-semibold text-[#18181B] whitespace-nowrap">
                        {alert.deviceName}
                      </td>

                      {/* Verdict */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] tracking-wide uppercase ${
                            isMalicious
                              ? 'bg-[#E31B23] text-white shadow-xs'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isMalicious ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          <span>{alert.verdict}</span>
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 text-[#18181B] max-w-xs truncate" title={alert.reason}>
                        {alert.reason}
                      </td>

                      {/* Payload Hex Snippet */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#57534E] max-w-xs truncate" title={alert.payloadSnippet}>
                        <code className="bg-[#F5F2EB] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                          {alert.payloadSnippet}
                        </code>
                      </td>

                      {/* Blockchain Hash + Verification Link */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className="font-mono text-[11px] text-[#57534E]"
                          title={alert.hash}
                        >
                          {alert.hash.slice(0, 8)}...{alert.hash.slice(-6)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Panel Footer note */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#57534E]">
          <span>
            Streaming via <code className="text-[#18181B] font-semibold">FastAPI /ws/live</code> (fallback to client emulation active)
          </span>
          <span className="font-mono font-medium">
            Cryptographic SHA-256 verification enabled
          </span>
        </div>
      </div>

      {/* Payload Modal */}
      <PayloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        devices={devices}
        onPayloadInjected={(id) => {
          setNewestAlertId(id);
        }}
      />
    </section>
  );
};
