#!/usr/bin/env python3
"""Simulate a MandiSync device without ESP32 hardware.

Usage:
  python3 hardware/tools/simulate_device.py gate-verify [rfid_tag]
  python3 hardware/tools/simulate_device.py weigh [rfid] [kg] [GROSS|TARE]
  python3 hardware/tools/simulate_device.py batch

Defaults to http://localhost:3000
Override base with env MANDI_API_BASE.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("MANDI_API_BASE", "http://localhost:3000").rstrip("/")
DEVICE_ID = os.environ.get("MANDI_DEVICE_ID", "SIM-01")


def post(path: str, body: dict) -> None:
    url = f"{BASE}{path}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Device-Id": DEVICE_ID,
        },
        method="POST",
    )
    print(f"→ POST {url}")
    print(f"  body: {body}")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"← {resp.status} {resp.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"← HTTP {e.code} {e.read().decode()}")
    except urllib.error.URLError as e:
        print(f"← URL error: {e.reason}")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1

    cmd = sys.argv[1]
    if cmd == "gate-verify":
        tag = sys.argv[2] if len(sys.argv) > 2 else "UHF-TAG-891024"
        post(
            "/api/v1/telemetry/gate-verify",
            {"rfid_tag": tag, "device_id": DEVICE_ID},
        )
    elif cmd == "weigh":
        tag = sys.argv[2] if len(sys.argv) > 2 else "UHF-TAG-891024"
        kg = float(sys.argv[3]) if len(sys.argv) > 3 else 6450.0
        kind = sys.argv[4] if len(sys.argv) > 4 else "GROSS"
        post(
            "/api/v1/telemetry/weighbridge",
            {
                "rfid_tag": tag,
                "weight_kg": kg,
                "measurement_type": kind,
                "device_id": DEVICE_ID,
                "source": "LIVE_SENSOR_ADC",
            },
        )
    elif cmd == "batch":
        post(
            "/api/v1/telemetry/batch-sync",
            {
                "packets": [
                    {
                        "rfid_tag": "UHF-TAG-891024",
                        "weight_kg": 6450,
                        "measurement_type": "GROSS",
                        "device_id": DEVICE_ID,
                        "source": "LITTLEFS_BUFFER",
                        "timestamp": "2026-10-29T10:00:00.000Z",
                    }
                ]
            },
        )
    else:
        print(__doc__)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
