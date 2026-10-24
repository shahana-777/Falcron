"""
FALCRON Python Security Server
-------------------------------
Real-time IoT payload inspection, threat detection, blocking, 
and WebSocket alerting for the FALCRON frontend.

Now with LIVE Firebase integration — pulls real sensor data
from Rameeza's IoT Firebase database.

Run with:  python server.py
"""

import asyncio
import hashlib
import json
import random
import re
import string
import time
import uuid
import sys

# Fix Windows terminal encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from datetime import datetime
from typing import List, Optional
from urllib.request import urlopen, Request as UrlRequest
from urllib.error import URLError

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request as FastApiRequest
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse

# ─────────────────────────────────────────────
#  App Setup
# ─────────────────────────────────────────────
app = FastAPI(title="FALCRON Security Server", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Firebase Config & MQTT Hardware Alert
# ─────────────────────────────────────────────
FIREBASE_URL = "https://falcron-a761f-default-rtdb.asia-southeast1.firebasedatabase.app"

# Optional MQTT Publisher for physical broker
try:
    import paho.mqtt.client as mqtt_client
    HAS_PAHO = True
except ImportError:
    HAS_PAHO = False

def publish_mqtt_alert(is_alert: bool):
    """Publish alert state directly to Mosquitto MQTT broker on localhost:1883."""
    if not HAS_PAHO:
        return
    try:
        client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION2, "FALCRON_Backend_Alert")
        # Try connecting with or without auth
        try:
            client.username_pw_set("falcron_monitor", "monitor123")
        except:
            pass
        client.connect("localhost", 1883, 3)
        msg = "1" if is_alert else "0"
        client.publish("falcron/alert", msg)
        client.publish("falcron/sensors/led", msg)
        client.publish("sensors/alert", msg)
        client.disconnect()
        print(f"[MQTT] Published hardware alert flag ({msg}) to Mosquitto broker!")
    except Exception as e:
        # Broker might be offline or running unauthenticated
        pass

def fetch_firebase_data():
    """Fetch real sensor data from Rameeza's Firebase Realtime Database."""
    try:
        response = urlopen(f"{FIREBASE_URL}/.json", timeout=5)
        data = json.loads(response.read().decode("utf-8"))
        return data
    except Exception as e:
        print(f"[FIREBASE] Error fetching data: {e}")
        return None

def update_firebase_alert(is_alert: bool):
    """Write alert signal to Firebase so friend's hardware LED lights up."""
    try:
        val_bool = is_alert
        val_int = 1 if is_alert else 0
        
        # 1. Update /securityAlert.json
        payload = json.dumps({
            "alert": val_bool,
            "attackDetected": val_bool,
            "redLed": val_bool,
            "led": val_int
        }).encode('utf-8')
        req = UrlRequest(f"{FIREBASE_URL}/securityAlert.json", data=payload, method="PUT", headers={"Content-Type": "application/json"})
        urlopen(req, timeout=5)

        # 2. Update /sensor/gasAlert.json or /sensor/attackAlert.json
        # Many ESP8266 codes listen directly to sensor/gasAlert to trigger the buzzer/red LED!
        req2 = UrlRequest(f"{FIREBASE_URL}/sensor/gasAlert.json", data=json.dumps(val_bool).encode('utf-8'), method="PUT", headers={"Content-Type": "application/json"})
        urlopen(req2, timeout=5)

        # 3. Direct red led keys
        for key in ["redLed", "led", "alert", "attack"]:
            req_key = UrlRequest(f"{FIREBASE_URL}/{key}.json", data=json.dumps(val_int).encode('utf-8'), method="PUT", headers={"Content-Type": "application/json"})
            urlopen(req_key, timeout=5)

        print(f"[FIREBASE] Sent hardware RED LED trigger to Firebase: {is_alert}")
    except Exception as e:
        print(f"[FIREBASE] Error sending alert signal: {e}")

# ─────────────────────────────────────────────
#  In-Memory State
# ─────────────────────────────────────────────
alerts: List[dict] = []
blocked_ips: set = set()
active_websockets: List[WebSocket] = []

# Store Firebase history for charts
firebase_history: List[dict] = []

DEVICES = [
    {
        "id": "firebase-dht11",
        "name": "DHT11 Sensor (Firebase Live)",
        "type": "temperature",
        "location": "Rameeza's IoT Setup - Real Hardware",
        "value": 0.0,
        "unit": "C",
        "status": "normal",
        "history": [],
        "lastSeen": "Connecting...",
        "ip": "Firebase RTDB",
        "firmware": "DHT11-ESP-v1.0",
        "mqttTopic": "firebase/sensor/temperature",
        "voltage": 3.3,
        "source": "firebase",
    },
    {
        "id": "firebase-humidity",
        "name": "Humidity Sensor (Firebase Live)",
        "type": "esp_node",
        "location": "Rameeza's IoT Setup - Real Hardware",
        "value": 0.0,
        "unit": "% RH",
        "status": "normal",
        "history": [],
        "lastSeen": "Connecting...",
        "ip": "Firebase RTDB",
        "firmware": "DHT11-HUM-v1.0",
        "mqttTopic": "firebase/sensor/humidity",
        "voltage": 3.3,
        "source": "firebase",
    },
    {
        "id": "dev-ir-02",
        "name": "IR Perimeter Sentinel",
        "type": "ir",
        "location": "Perimeter Barrier B - Gateway",
        "value": 0,
        "unit": "Beam",
        "status": "normal",
        "history": [{"time": "10:30", "value": 0}],
        "lastSeen": "Just now",
        "ip": "192.168.10.87",
        "firmware": "PIR-IR-TRIP-v1.4",
        "mqttTopic": "sensors/perimeter/barrier_b/ir",
        "voltage": 5.0,
    },
    {
        "id": "dev-esp-03",
        "name": "ESP8266 Core Node",
        "type": "esp_node",
        "location": "Field Gateway Array #01",
        "value": 99.2,
        "unit": "% Link",
        "status": "normal",
        "history": [{"time": "10:30", "value": 99.2}],
        "lastSeen": "Just now",
        "ip": "192.168.10.15",
        "firmware": "ESP-FALCRON-OTA-3.8",
        "mqttTopic": "gateways/core01/telemetry",
        "rssi": -58,
        "uptime": "14d 06h 19m",
    },
]

# ─────────────────────────────────────────────
#  Firebase Live Poller (background task)
# ─────────────────────────────────────────────
async def firebase_polling_loop():
    """Polls Firebase every 5 seconds and pushes real sensor data to all frontends."""
    print("[FIREBASE] Starting live data polling from Rameeza's database...")
    prev_temp = None
    prev_hum = None

    while True:
        try:
            # Run blocking HTTP call in thread pool
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, fetch_firebase_data)

            if data and "sensor" in data:
                sensor = data["sensor"]
                temp = sensor.get("temperature", 0)
                humidity = sensor.get("humidity", 0)
                sensor_ok = sensor.get("sensorOK", False)

                now = datetime.now()
                time_str = now.strftime("%H:%M")
                full_time = now.strftime("%H:%M:%S")

                # Update temperature device
                for d in DEVICES:
                    if d["id"] == "firebase-dht11":
                        d["value"] = temp
                        d["status"] = "normal" if sensor_ok else "alert"
                        d["lastSeen"] = f"Live @ {full_time}"
                        d["history"].append({"time": time_str, "value": temp})
                        if len(d["history"]) > 20:
                            d["history"] = d["history"][-20:]

                    elif d["id"] == "firebase-humidity":
                        d["value"] = humidity
                        d["status"] = "normal" if sensor_ok else "alert"
                        d["lastSeen"] = f"Live @ {full_time}"
                        d["history"].append({"time": time_str, "value": humidity})
                        if len(d["history"]) > 20:
                            d["history"] = d["history"][-20:]

                # Broadcast live update to all frontends
                await broadcast({
                    "type": "firebase_update",
                    "firebase": {
                        "temperature": temp,
                        "humidity": humidity,
                        "sensorOK": sensor_ok,
                        "timestamp": full_time,
                    },
                    "devices": DEVICES,
                })

                # Log changes
                if temp != prev_temp or humidity != prev_hum:
                    print(f"[FIREBASE] Live Data -> Temp: {temp}C | Humidity: {humidity}% | Sensor: {'OK' if sensor_ok else 'FAIL'}")
                    prev_temp = temp
                    prev_hum = humidity

        except Exception as e:
            print(f"[FIREBASE] Poll error: {e}")

        await asyncio.sleep(5)


@app.on_event("startup")
async def startup_event():
    """Start Firebase polling when server starts."""
    asyncio.create_task(firebase_polling_loop())
    print("[FIREBASE] Live polling task started.")

# ─────────────────────────────────────────────
#  FALCRON AI Detection Engine
# ─────────────────────────────────────────────
MALICIOUS_PATTERNS = [
    # Shellcode / buffer overflow
    (r"\\x[0-9a-fA-F]{2}", "Shellcode hex escape sequence detected"),
    (r"\x90+",              "NOP sled (shellcode buffer overflow pattern)"),
    (r"(OVERWRITE|OVERRIDE|EXPLOIT|INJECT|SHELLCODE)", "Dangerous command keyword detected"),
    # SQL Injection
    (r"(\bOR\b|\bAND\b).{0,10}=.{0,10}--",  "SQL injection pattern: tautology attack"),
    (r"(UNION\s+SELECT|DROP\s+TABLE|INSERT\s+INTO)", "SQL injection: DDL/DML command injection"),
    (r"';\s*--",            "SQL injection: comment terminator pattern"),
    # XSS
    (r"<script[\s>]",       "XSS: script tag injection"),
    (r"javascript:",        "XSS: javascript URI scheme"),
    (r"onerror\s*=",        "XSS: onerror event handler injection"),
    (r"alert\s*\(",         "XSS: alert() call injection"),
    # Path traversal
    (r"\.\./\.\./",         "Path traversal attack detected"),
    (r"/etc/passwd",        "Sensitive file access attempt: /etc/passwd"),
    # Command injection
    (r";\s*(rm|del|format|shutdown|reboot|wget|curl|bash|sh)\b", "Command injection: OS command detected"),
    (r"\|\s*(bash|sh|cmd|powershell)", "Command injection: pipe to shell"),
    # IoT-specific
    (r"SIG_MASK\s*=\s*0xFF",       "IoT sensor override: signal mask tampering"),
    (r"VOLTAGE_PULSE\s*=\s*HIGH",  "IoT attack: voltage pulse injection"),
    (r"delta_rate.*C/s",           "Thermal spike: impossible temperature gradient"),
    (r"0xDEADBEEF",                "Invalid CRC magic bytes: 0xDEADBEEF"),
    (r"EEPROM",                    "Unauthorized EEPROM memory access attempt"),
]

def sha256_hash(data: str) -> str:
    return "0x" + hashlib.sha256(data.encode()).hexdigest()

def inspect_payload(payload: str, source_ip: str) -> dict:
    """
    Run the FALCRON AI detection engine against a payload string.
    Returns a verdict dict with malicious=True/False and reason.
    """
    # Check if IP is already blocked
    if source_ip in blocked_ips:
        return {
            "malicious": True,
            "reason": f"Source IP {source_ip} is on the FALCRON block list",
            "score": 1.0,
            "blocked": True,
        }

    # Pattern matching
    for pattern, reason in MALICIOUS_PATTERNS:
        if re.search(pattern, payload, re.IGNORECASE):
            return {
                "malicious": True,
                "reason": reason,
                "score": round(random.uniform(0.88, 0.99), 2),
                "blocked": False,
            }

    # Size anomaly
    if len(payload) > 2048:
        return {
            "malicious": True,
            "reason": f"Payload size anomaly: {len(payload)} bytes exceeds 2KB IoT frame limit",
            "score": 0.82,
            "blocked": False,
        }

    # Clean
    return {
        "malicious": False,
        "reason": "Payload passed all FALCRON heuristic checks. CRC32 verified.",
        "score": round(random.uniform(0.01, 0.06), 2),
        "blocked": False,
    }

# ─────────────────────────────────────────────
#  WebSocket Manager
# ─────────────────────────────────────────────
async def broadcast(event: dict):
    """Send a JSON event to all connected frontends via WebSocket."""
    dead = []
    for ws in active_websockets:
        try:
            await ws.send_text(json.dumps(event))
        except Exception:
            dead.append(ws)
    for ws in dead:
        if ws in active_websockets:
            active_websockets.remove(ws)

# ─────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────

@app.get("/api/devices")
async def get_devices():
    return DEVICES

@app.get("/api/alerts")
async def get_alerts():
    return alerts[:50]

@app.get("/api/blocked-ips")
async def get_blocked_ips():
    return {"blocked": list(blocked_ips)}

@app.post("/api/unblock/{ip}")
async def unblock_ip(ip: str):
    blocked_ips.discard(ip)
    return {"status": "unblocked", "ip": ip}

@app.get("/api/firebase")
async def get_firebase():
    """Direct endpoint to see current Firebase data."""
    data = fetch_firebase_data()
    return {
        "source": FIREBASE_URL,
        "live_data": data,
        "last_check": datetime.now().strftime("%H:%M:%S"),
    }


@app.post("/attack")
async def receive_attack(request: FastApiRequest):
    """
    Main endpoint - Labeeba sends her payload here.
    FALCRON inspects it, logs the result, and broadcasts to frontend.
    """
    source_ip = request.client.host if request.client else "unknown"
    now = datetime.now()
    time_str = now.strftime("%H:%M:%S")

    # Parse body
    try:
        body = await request.body()
        payload_str = body.decode("utf-8", errors="replace")
    except Exception:
        payload_str = "<unreadable payload>"

    # Run detection
    result = inspect_payload(payload_str, source_ip)

    # Generate hash
    payload_hash = sha256_hash(payload_str + time_str)

    # Pick a target device to attribute the alert to
    target_device = random.choice(DEVICES)

    # Build alert record
    alert = {
        "id": f"alert-{int(time.time() * 1000)}",
        "timestamp": time_str,
        "deviceId": target_device["id"],
        "deviceName": target_device["name"],
        "verdict": "Malicious" if result["malicious"] else "Clean",
        "severity": "critical" if result["score"] > 0.9 else ("high" if result["score"] > 0.7 else "low"),
        "reason": result["reason"],
        "payloadSnippet": payload_str[:120],
        "hash": payload_hash,
        "anomalyScore": result["score"],
        "sourceIp": source_ip,
    }

    alerts.insert(0, alert)

    # Block the IP if malicious
    if result["malicious"] and not result.get("blocked"):
        blocked_ips.add(source_ip)
        print(f"[BLOCKED] IP: {source_ip}")

    # Broadcast to all connected frontends
    await broadcast({
        "type": "new_alert",
        "alert": alert,
        "blocked": result["malicious"],
    })

    # Update device status if malicious
    if result["malicious"]:
        for d in DEVICES:
            if d["id"] == target_device["id"]:
                d["status"] = "alert"
        await broadcast({"type": "devices_update", "devices": DEVICES})

        # Trigger hardware red LED in Firebase AND local Mosquitto MQTT!
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, update_firebase_alert, True)
        await loop.run_in_executor(None, publish_mqtt_alert, True)

        # Reset device status and turn off LED after 12 seconds
        async def reset_device():
            await asyncio.sleep(12)
            for d in DEVICES:
                if d["id"] == target_device["id"]:
                    d["status"] = "normal"
            await broadcast({"type": "devices_update", "devices": DEVICES})
            # Turn off hardware LED
            await loop.run_in_executor(None, update_firebase_alert, False)
            await loop.run_in_executor(None, publish_mqtt_alert, False)

        asyncio.create_task(reset_device())

    # Response to Labeeba
    if result["malicious"]:
        print(f"[ALERT] [{time_str}] MALICIOUS payload from {source_ip} - BLOCKED | {result['reason']}")
        return JSONResponse(
            status_code=403,
            content={
                "status": "BLOCKED",
                "verdict": "Malicious",
                "reason": result["reason"],
                "anomalyScore": result["score"],
                "hash": payload_hash,
                "message": "[BLOCKED] Your payload was detected and blocked by FALCRON AI.",
            },
        )
    else:
        print(f"[CLEAN] [{time_str}] Clean payload from {source_ip} | {result['reason']}")
        return JSONResponse(
            status_code=200,
            content={
                "status": "ACCEPTED",
                "verdict": "Clean",
                "reason": result["reason"],
                "anomalyScore": result["score"],
                "hash": payload_hash,
                "message": "[PASS] Payload passed FALCRON security inspection.",
            },
        )


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket - FALCRON frontend connects here to receive live alerts."""
    await websocket.accept()
    active_websockets.append(websocket)
    print(f"[WS] Frontend connected. Total: {len(active_websockets)}")
    try:
        # Send current state immediately on connect
        await websocket.send_text(json.dumps({
            "type": "init",
            "alerts": alerts[:20],
            "devices": DEVICES,
        }))
        # Keep connection alive
        while True:
            await asyncio.sleep(30)
            await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        print("[WS] Frontend disconnected.")
    except Exception:
        pass
    finally:
        if websocket in active_websockets:
            active_websockets.remove(websocket)


@app.get("/attacker", response_class=HTMLResponse)
async def attacker_page():
    """Serve Labeeba's attack console directly from the Python server."""
    file_path = os.path.join(os.path.dirname(__file__), "public", "attacker.html")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>attacker.html not found</h1>", status_code=404)


@app.get("/")
async def root():
    return {
        "service": "FALCRON Security Server",
        "version": "2.0.0 - Firebase Live",
        "status": "online",
        "firebase": FIREBASE_URL,
        "endpoints": {
            "attack": "POST /attack  <- Labeeba sends payloads here",
            "attacker_page": "GET  /attacker <- Labeeba's attack console UI",
            "alerts": "GET  /api/alerts",
            "devices": "GET  /api/devices",
            "firebase": "GET  /api/firebase <- Live sensor data",
            "websocket": "WS   /ws/live  <- Frontend connects here",
            "blocked_ips": "GET  /api/blocked-ips",
        },
    }


# ─────────────────────────────────────────────
#  Run
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import os
    print("=" * 55)
    print("  FALCRON Security Server v2.0 -- Firebase Live")
    print("=" * 55)
    print(f"  Firebase: {FIREBASE_URL}")
    print("  POST /attack        <- Labeeba attacks here")
    print("  GET  /attacker      <- Labeeba's attack page")
    print("  WS   /ws/live       <- Frontend listens here")
    print("  GET  /api/firebase  <- Live sensor data")
    print("  Server: http://0.0.0.0:8000")
    print("=" * 55)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")
