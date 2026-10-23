/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FALCRON IoT Security - API & Real-time Integration Service
 * Configured for Python backend (FastAPI/Flask) via HTTP & WebSockets,
 * with comprehensive high-fidelity simulation fallbacks.
 */

export interface DeviceReading {
  time: string;
  value: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'temperature' | 'ir' | 'esp_node';
  location: string;
  value: number;
  unit: string;
  status: 'normal' | 'alert' | 'offline';
  history: DeviceReading[];
  lastSeen: string;
  ip: string;
  firmware: string;
  mqttTopic: string;
  rssi?: number;
  uptime?: string;
  voltage?: number;
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  verdict: 'Clean' | 'Malicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  payloadSnippet: string;
  hash: string;
  rawBytes?: string;
  anomalyScore?: number;
}

export interface VerificationResult {
  verified: boolean;
  incidentHash: string;
  blockNumber: number;
  chainTx: string;
  timestamp: string;
  contractAddress: string;
  merkleRoot: string;
  ledgerNetwork: string;
  tampered?: boolean;
}

// Configurable endpoints (override with environment variables if deployed)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';
export const BLOCKCHAIN_ADDRESS = '0x4F3A89e93cD2B7420c8C0A91D352B418E06A9b2c';

// Initial devices baseline
const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-temp-01',
    name: 'Thermal Sensor #1',
    type: 'temperature',
    location: 'Server Rack 04 (Cold Aisle)',
    value: 23.4,
    unit: '°C',
    status: 'normal',
    history: [
      { time: '10:00', value: 22.8 },
      { time: '10:05', value: 23.1 },
      { time: '10:10', value: 23.0 },
      { time: '10:15', value: 23.4 },
      { time: '10:20', value: 23.2 },
      { time: '10:25', value: 23.5 },
      { time: '10:30', value: 23.4 },
    ],
    lastSeen: 'Just now',
    ip: '192.168.10.42',
    firmware: 'DS18B20-v2.1',
    mqttTopic: 'sensors/datacenter/rack4/temp',
    voltage: 3.3,
  },
  {
    id: 'dev-ir-02',
    name: 'IR Perimeter Sentinel',
    type: 'ir',
    location: 'Perimeter Barrier B - Gateway',
    value: 0,
    unit: 'Beam',
    status: 'normal',
    history: [
      { time: '10:00', value: 0 },
      { time: '10:05', value: 0 },
      { time: '10:10', value: 1 },
      { time: '10:15', value: 0 },
      { time: '10:20', value: 0 },
      { time: '10:25', value: 0 },
      { time: '10:30', value: 0 },
    ],
    lastSeen: 'Just now',
    ip: '192.168.10.87',
    firmware: 'PIR-IR-TRIP-v1.4',
    mqttTopic: 'sensors/perimeter/barrier_b/ir',
    voltage: 5.0,
  },
  {
    id: 'dev-esp-03',
    name: 'ESP8266 Core Node',
    type: 'esp_node',
    location: 'Field Gateway Array #01',
    value: 99.2,
    unit: '% Link',
    status: 'normal',
    history: [
      { time: '10:00', value: 98.4 },
      { time: '10:05', value: 99.0 },
      { time: '10:10', value: 97.9 },
      { time: '10:15', value: 99.1 },
      { time: '10:20', value: 98.8 },
      { time: '10:25', value: 99.3 },
      { time: '10:30', value: 99.2 },
    ],
    lastSeen: 'Just now',
    ip: '192.168.10.15',
    firmware: 'ESP-FALCRON-OTA-3.8',
    mqttTopic: 'gateways/core01/telemetry',
    rssi: -58,
    uptime: '14d 06h 19m',
  },
];

// Initial baseline threat records
const INITIAL_ALERTS: ThreatAlert[] = [
  {
    id: 'alert-1094',
    timestamp: '10:29:44',
    deviceId: 'dev-esp-03',
    deviceName: 'ESP8266 Core Node',
    verdict: 'Malicious',
    severity: 'critical',
    reason: 'Malformed MQTT CONNECT frame with shellcode NOP sled',
    payloadSnippet: '\\x90\\x90\\x90\\x90\\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68...',
    hash: '0x8f2d65c401b876e93ca910fa3e56bc7492193b2a1a89c72e2d9b4f61c37b018e',
    anomalyScore: 0.98,
  },
  {
    id: 'alert-1093',
    timestamp: '10:28:12',
    deviceId: 'dev-temp-01',
    deviceName: 'Thermal Sensor #1',
    verdict: 'Clean',
    severity: 'low',
    reason: 'Nominal telemetry packet accepted. CRC32 valid',
    payloadSnippet: '{"temp": 23.41, "vcc": 3.30, "seq": 49102}',
    hash: '0x3a9f018e4726b219c088fe65d3a1290bbfa76c381e490518ab449210ecba9811',
    anomalyScore: 0.02,
  },
  {
    id: 'alert-1092',
    timestamp: '10:26:05',
    deviceId: 'dev-ir-02',
    deviceName: 'IR Perimeter Sentinel',
    verdict: 'Malicious',
    severity: 'high',
    reason: 'IR sensor blind attempt: sustained high impedance override',
    payloadSnippet: 'INTRUDER_OVERRIDE_PIN=13;SIG_MASK=0xFF',
    hash: '0x5c7b3992e8fa1194ac29b76301f22e894aa9d61823bb0391cf8e92004a88bc91',
    anomalyScore: 0.94,
  },
  {
    id: 'alert-1091',
    timestamp: '10:24:50',
    deviceId: 'dev-esp-03',
    deviceName: 'ESP8266 Core Node',
    verdict: 'Clean',
    severity: 'low',
    reason: 'Heartbeat ping ACK (18ms latency)',
    payloadSnippet: '{"cmd":"PING", "uptime": 1232779}',
    hash: '0x1e88ba920f3a4789c6291a88b30f488219ae035789bc44109fae2837bc901a88',
    anomalyScore: 0.01,
  },
  {
    id: 'alert-1090',
    timestamp: '10:21:18',
    deviceId: 'dev-temp-01',
    deviceName: 'Thermal Sensor #1',
    verdict: 'Clean',
    severity: 'low',
    reason: 'Periodic calibration reading matches baseline',
    payloadSnippet: '{"temp": 23.25, "cal_offset": 0.00}',
    hash: '0x7e29bb641198ae4039fc76a2109855b7190ca382efaa872019b88cf1a20993ef',
    anomalyScore: 0.04,
  },
];

// In-memory runtime state for live updates
let currentDevices = [...INITIAL_DEVICES];
let currentAlerts = [...INITIAL_ALERTS];
const deviceSubscribers: Set<(devices: Device[]) => void> = new Set();
const alertSubscribers: Set<(alerts: ThreatAlert[]) => void> = new Set();
let simulationInterval: ReturnType<typeof setInterval> | null = null;
let isSimulationRunning = true;

/**
 * Fetch current devices list
 */
export async function getDevices(): Promise<Device[]> {
  try {
    const res = await fetch(`${API_URL}/api/devices`, { credentials: 'omit' });
    if (res.ok) {
      const data = await res.json();
      currentDevices = data;
      return data;
    }
  } catch {
    // Backend offline / development mode: use high-fidelity simulation
  }
  return [...currentDevices];
}

/**
 * Fetch current alerts stream
 */
export async function getAlerts(): Promise<ThreatAlert[]> {
  try {
    const res = await fetch(`${API_URL}/api/alerts`, { credentials: 'omit' });
    if (res.ok) {
      const data = await res.json();
      currentAlerts = data;
      return data;
    }
  } catch {
    // Backend offline / fallback
  }
  return [...currentAlerts];
}

/**
 * Verify an incident hash against the blockchain registry
 */
export async function verifyOnChain(hash: string, forceMismatch = false): Promise<VerificationResult> {
  try {
    const res = await fetch(`${API_URL}/api/verify/${encodeURIComponent(hash)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback on-chain simulation
  }

  // Cryptographic deterministic check for simulation
  const isKnownAlert = currentAlerts.some(a => a.hash.toLowerCase() === hash.toLowerCase());
  const isVerified = isKnownAlert && !forceMismatch;

  return {
    verified: isVerified,
    incidentHash: hash,
    blockNumber: 19842103,
    chainTx: `0x9e73${hash.slice(2, 10)}b8104c8f${hash.slice(-8)}`,
    timestamp: new Date().toISOString(),
    contractAddress: BLOCKCHAIN_ADDRESS,
    merkleRoot: '0xd489a038bf9321c88e7b99a01f4c78e932144ba90ef9921cba77413009e88912',
    ledgerNetwork: 'Arbitrum One (L2 Security Rollup)',
    tampered: forceMismatch,
  };
}

/**
 * Inject a custom payload to test the Python AI detection pipeline
 */
export async function injectCustomPayload(
  deviceId: string,
  payloadText: string,
  isMalicious: boolean,
  customReason?: string
): Promise<ThreatAlert> {
  const device = currentDevices.find(d => d.id === deviceId) || currentDevices[0];
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  // Generate pseudo SHA256 hex string
  const hashChars = '0123456789abcdef';
  let generatedHash = '0x';
  for (let i = 0; i < 64; i++) {
    generatedHash += hashChars[Math.floor(Math.random() * hashChars.length)];
  }

  const newAlert: ThreatAlert = {
    id: `alert-${Date.now()}`,
    timestamp: timeStr,
    deviceId: device.id,
    deviceName: device.name,
    verdict: isMalicious ? 'Malicious' : 'Clean',
    severity: isMalicious ? 'critical' : 'low',
    reason: customReason || (isMalicious 
      ? 'Anomalous instruction payload: attempted heap overwrite via MQTT publish'
      : 'User verified packet: conforms to IEEE 802.15.4 spec'),
    payloadSnippet: payloadText,
    hash: generatedHash,
    anomalyScore: isMalicious ? 0.99 : 0.03,
  };

  // Update device status if malicious
  if (isMalicious) {
    currentDevices = currentDevices.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          status: 'alert',
          value: d.type === 'temperature' ? d.value + 8.5 : d.value,
        };
      }
      return d;
    });
  }

  // Prepend to alerts
  currentAlerts = [newAlert, ...currentAlerts.slice(0, 49)];

  notifyAlerts();
  notifyDevices();

  // If set to alert, restore to normal after 15 seconds
  if (isMalicious) {
    setTimeout(() => {
      currentDevices = currentDevices.map(d => (d.id === device.id ? { ...d, status: 'normal' } : d));
      notifyDevices();
    }, 15000);
  }

  return newAlert;
}

/**
 * Subscribe to device telemetry updates
 */
export function subscribeDevices(callback: (devices: Device[]) => void): () => void {
  deviceSubscribers.add(callback);
  callback([...currentDevices]);
  ensureSimulationRunning();
  return () => {
    deviceSubscribers.delete(callback);
  };
}

/**
 * Subscribe to threat alert feed updates
 */
export function subscribeAlerts(callback: (alerts: ThreatAlert[]) => void): () => void {
  alertSubscribers.add(callback);
  callback([...currentAlerts]);
  ensureSimulationRunning();
  return () => {
    alertSubscribers.delete(callback);
  };
}

function notifyDevices() {
  const snapshot = [...currentDevices];
  deviceSubscribers.forEach(cb => cb(snapshot));
}

function notifyAlerts() {
  const snapshot = [...currentAlerts];
  alertSubscribers.forEach(cb => cb(snapshot));
}

// ─────────────────────────────────────────────
// Real WebSocket connection to Python backend
// ─────────────────────────────────────────────
let ws: WebSocket | null = null;
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;

function connectWebSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[FALCRON] WebSocket connected to Python backend');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'new_alert' && data.alert) {
          // Real alert from Python server (Labeeba's attack!)
          const alert: ThreatAlert = {
            id: data.alert.id,
            timestamp: data.alert.timestamp,
            deviceId: data.alert.deviceId,
            deviceName: data.alert.deviceName,
            verdict: data.alert.verdict,
            severity: data.alert.severity,
            reason: data.alert.reason,
            payloadSnippet: data.alert.payloadSnippet,
            hash: data.alert.hash,
            anomalyScore: data.alert.anomalyScore,
          };
          currentAlerts = [alert, ...currentAlerts.slice(0, 49)];
          notifyAlerts();

          // If malicious, also update the device status to 'alert'
          if (data.blocked) {
            currentDevices = currentDevices.map(d =>
              d.id === alert.deviceId ? { ...d, status: 'alert' } : d
            );
            notifyDevices();

            // Reset after 12 seconds
            setTimeout(() => {
              currentDevices = currentDevices.map(d =>
                d.id === alert.deviceId ? { ...d, status: 'normal' } : d
              );
              notifyDevices();
            }, 12000);
          }
        }

        if (data.type === 'devices_update' && data.devices) {
          // Server pushed device state update
          currentDevices = currentDevices.map(cd => {
            const serverDev = data.devices.find((sd: Device) => sd.id === cd.id);
            return serverDev ? { ...cd, status: serverDev.status } : cd;
          });
          notifyDevices();
        }

        if (data.type === 'firebase_update' && data.devices) {
          // Real Firebase sensor data from Rameeza's hardware!
          currentDevices = currentDevices.map(cd => {
            const serverDev = data.devices.find((sd: Device) => sd.id === cd.id);
            if (serverDev) {
              return {
                ...cd,
                value: serverDev.value,
                status: serverDev.status,
                lastSeen: serverDev.lastSeen || cd.lastSeen,
                history: serverDev.history && serverDev.history.length > 0
                  ? serverDev.history
                  : cd.history,
              };
            }
            return cd;
          });
          notifyDevices();
          console.log('[FALCRON] Firebase live data received:', data.firebase);
        }

        if (data.type === 'init') {
          // Initial state from server on connect — includes Firebase device data
          if (data.devices && data.devices.length > 0) {
            currentDevices = currentDevices.map(cd => {
              const serverDev = data.devices.find((sd: Device) => sd.id === cd.id);
              if (serverDev) {
                return {
                  ...cd,
                  value: serverDev.value ?? cd.value,
                  status: serverDev.status ?? cd.status,
                  lastSeen: serverDev.lastSeen ?? cd.lastSeen,
                  history: serverDev.history && serverDev.history.length > 0
                    ? serverDev.history
                    : cd.history,
                  name: serverDev.name ?? cd.name,
                  location: serverDev.location ?? cd.location,
                };
              }
              return cd;
            });
            // Also add any new devices from server that don't exist locally
            const localIds = new Set(currentDevices.map(d => d.id));
            const newDevices = data.devices
              .filter((sd: Device) => !localIds.has(sd.id))
              .map((sd: Device) => ({
                ...sd,
                history: sd.history && sd.history.length > 0 ? sd.history : [{ time: '00:00', value: sd.value }],
              }));
            if (newDevices.length > 0) {
              currentDevices = [...newDevices, ...currentDevices];
            }
            notifyDevices();
          }
          if (data.alerts && data.alerts.length > 0) {
            const serverAlerts: ThreatAlert[] = data.alerts.map((a: ThreatAlert) => ({
              id: a.id,
              timestamp: a.timestamp,
              deviceId: a.deviceId,
              deviceName: a.deviceName,
              verdict: a.verdict,
              severity: a.severity,
              reason: a.reason,
              payloadSnippet: a.payloadSnippet,
              hash: a.hash,
              anomalyScore: a.anomalyScore,
            }));
            // Merge server alerts (they come first) with existing
            const existingIds = new Set(currentAlerts.map(a => a.id));
            const newFromServer = serverAlerts.filter(a => !existingIds.has(a.id));
            currentAlerts = [...newFromServer, ...currentAlerts].slice(0, 50);
            notifyAlerts();
          }
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      console.log('[FALCRON] WebSocket disconnected. Reconnecting in 3s...');
      ws = null;
      wsReconnectTimer = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      // Will trigger onclose, which handles reconnect
      ws?.close();
    };
  } catch {
    // Backend not available, retry later
    wsReconnectTimer = setTimeout(connectWebSocket, 5000);
  }
}

// Start WebSocket connection immediately
connectWebSocket();

/**
 * Toggles simulation engine state
 */
export function toggleSimulation(active: boolean) {
  isSimulationRunning = active;
  if (!active && simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  } else if (active) {
    ensureSimulationRunning();
  }
}

export function isSimulationActive(): boolean {
  return isSimulationRunning;
}

/**
 * Periodic realistic IoT sensor drift + occasional AI detections
 */
function ensureSimulationRunning() {
  if (simulationInterval || !isSimulationRunning) return;

  simulationInterval = setInterval(() => {
    if (!isSimulationRunning) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Update devices slightly
    currentDevices = currentDevices.map(device => {
      let nextValue = device.value;
      if (device.type === 'temperature') {
        const delta = (Math.random() - 0.48) * 0.3;
        nextValue = Number((Math.max(19, Math.min(32, device.value + delta))).toFixed(1));
      } else if (device.type === 'esp_node') {
        const delta = (Math.random() - 0.5) * 0.4;
        nextValue = Number((Math.max(95, Math.min(100, device.value + delta))).toFixed(1));
      } else if (device.type === 'ir') {
        // IR state is 0 normally, occasionally 1
        nextValue = Math.random() < 0.1 ? 1 : 0;
      }

      const updatedHistory = [...device.history.slice(1), { time: timeStr.slice(0, 5), value: nextValue }];

      return {
        ...device,
        value: nextValue,
        history: updatedHistory,
        lastSeen: 'Just now',
      };
    });

    notifyDevices();

    // 15% probability of generating a new routine telemetry or anomaly alert
    if (Math.random() < 0.15) {
      const isAttack = Math.random() < 0.3; // 30% of incoming events are malicious payloads
      const targetDevice = currentDevices[Math.floor(Math.random() * currentDevices.length)];

      const cleanReasons = [
        'Routine JSON payload passed AST syntax check & byte bounds',
        'Valid MQTT telemetry publish on authorized topic',
        'TLS 1.3 handshake re-negotiation successful',
        'Keep-alive telemetry frame authenticated with device token',
      ];

      const attackReasons = [
        'Buffer overflow signature detected in ESP8266 MQTT buffer',
        'Rapid frequency IR trip spoofing pattern (>40Hz anomaly)',
        'Out-of-band firmware OTA flash request rejected by FALCRON AI',
        'Temperature payload injected with hex escape characters',
        'Unregistered client ID attempting broker subscription brute-force',
      ];

      const hashChars = '0123456789abcdef';
      let genHash = '0x';
      for (let i = 0; i < 64; i++) {
        genHash += hashChars[Math.floor(Math.random() * hashChars.length)];
      }

      const newAlert: ThreatAlert = {
        id: `alert-${Date.now()}`,
        timestamp: timeStr,
        deviceId: targetDevice.id,
        deviceName: targetDevice.name,
        verdict: isAttack ? 'Malicious' : 'Clean',
        severity: isAttack ? (Math.random() > 0.5 ? 'critical' : 'high') : 'low',
        reason: isAttack 
          ? attackReasons[Math.floor(Math.random() * attackReasons.length)]
          : cleanReasons[Math.floor(Math.random() * cleanReasons.length)],
        payloadSnippet: isAttack
          ? `0x${Math.floor(Math.random() * 0xffffff).toString(16)}...[EXPLOIT_VECTOR]`
          : `{"dev":"${targetDevice.id}","val":${targetDevice.value},"ack":true}`,
        hash: genHash,
        anomalyScore: isAttack ? Number((0.85 + Math.random() * 0.14).toFixed(2)) : Number((Math.random() * 0.05).toFixed(2)),
      };

      if (isAttack) {
        currentDevices = currentDevices.map(d => (d.id === targetDevice.id ? { ...d, status: 'alert' } : d));
        notifyDevices();
        setTimeout(() => {
          currentDevices = currentDevices.map(d => (d.id === targetDevice.id ? { ...d, status: 'normal' } : d));
          notifyDevices();
        }, 8000);
      }

      currentAlerts = [newAlert, ...currentAlerts.slice(0, 39)];
      notifyAlerts();
    }
  }, 3500);
}
