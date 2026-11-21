#!/usr/bin/env python3
"""Create simple but readable wireframes as HTML and screenshot them."""

from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "ca2" / "assets" / "wireframes"
OUT.mkdir(parents=True, exist_ok=True)

CSS = """
* { box-sizing: border-box; }
body { margin: 0; background: #eef2f6; font-family: "Segoe UI", system-ui, sans-serif; color: #1f2937; }
.browser { width: 1400px; height: 940px; margin: 20px auto; background: #fff; border: 2px solid #94a3b8; border-radius: 16px; overflow: hidden; box-shadow: 0 18px 40px rgba(15,23,42,.12); }
.chrome { height: 42px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; display: flex; align-items: center; gap: 8px; padding: 0 16px; }
.dot { width: 11px; height: 11px; border-radius: 50%; background: #cbd5e1; }
.url { margin-left: 12px; flex: 1; height: 24px; background: #fff; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 12px; color: #64748b; display: flex; align-items: center; padding: 0 10px; }
.page { padding: 26px 32px; }
.top { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 14px; }
.brand { display: flex; align-items: center; gap: 12px; }
.logo { width: 42px; height: 42px; border: 2px dashed #64748b; border-radius: 10px; display: grid; place-items: center; font-weight: 800; color: #475569; }
h1 { font-size: 24px; margin: 0; }
h2 { font-size: 20px; margin: 0 0 6px; }
h3 { font-size: 15px; margin: 0 0 8px; }
.muted { color: #64748b; font-size: 13px; }
.pill { border: 1.5px dashed #64748b; border-radius: 999px; padding: 6px 14px; font-size: 12px; color: #475569; }
.grid { display: grid; gap: 16px; }
.g2 { grid-template-columns: 1fr 1fr; }
.g3 { grid-template-columns: repeat(3, 1fr); }
.g4 { grid-template-columns: repeat(4, 1fr); }
.card { border: 2px dashed #94a3b8; border-radius: 12px; padding: 16px; background: #fbfdff; }
.card.solid { border-style: solid; }
.box { height: 38px; border: 1.5px dashed #94a3b8; border-radius: 8px; background: #fff; margin: 8px 0; }
.box.tall { height: 78px; }
.btn { display: inline-block; border: 2px solid #475569; border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 700; color: #1f2937; background: #f8fafc; }
.btn.primary { background: #e2e8f0; border-color: #334155; }
.nav { display: flex; gap: 10px; }
.nav .item { padding: 8px 14px; border: 1.5px dashed #94a3b8; border-radius: 8px; font-size: 12px; }
.sidebar { display: grid; grid-template-columns: 240px 1fr; gap: 20px; }
.stat { border: 2px dashed #94a3b8; border-radius: 12px; padding: 14px; }
.stat b { display: block; font-size: 24px; margin-top: 4px; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th, .table td { border: 1.5px dashed #94a3b8; padding: 9px 10px; text-align: left; }
.center { display: flex; align-items: center; justify-content: center; height: 720px; }
.login { width: 420px; }
.step { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; font-size: 13px; }
.num { width: 26px; height: 26px; border: 2px solid #475569; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 12px; }
.scan { height: 170px; border: 3px dashed #475569; border-radius: 12px; display: grid; place-items: center; font-size: 18px; font-weight: 700; color: #475569; }
.bar { height: 18px; border: 2px dashed #94a3b8; border-radius: 999px; background: repeating-linear-gradient(90deg,#e2e8f0,#e2e8f0 8px,#fff 8px,#fff 16px); }
.footer-note { margin-top: 10px; font-size: 11px; color: #64748b; text-align: center; }
"""


def page(title: str, body: str) -> str:
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title><style>{CSS}</style></head>
<body><div class="browser">
  <div class="chrome"><span class="dot"></span><span class="dot"></span><span class="dot"></span><div class="url">mandisync.local/{title.lower().replace(' ', '-')}</div></div>
  <div class="page">{body}</div>
</div></body></html>"""


SCREENS = {
    "01-landing": page("Landing", """
      <div class="top">
        <div class="brand"><div class="logo">MS</div><div><h1>MandiSync</h1><div class="muted">Mandi queue and weighbridge system</div></div></div>
        <div class="nav"><span class="item">Home</span><span class="item">Farmer</span><span class="item">Gate</span><span class="item">Queue</span><span class="item">Login</span></div>
      </div>
      <div style="margin-top:30px; display:grid; grid-template-columns:1.2fr .8fr; gap:24px;">
        <div class="card solid" style="padding:30px;">
          <div class="pill" style="display:inline-block; margin-bottom:12px;">Prototype overview</div>
          <h2 style="font-size:34px; line-height:1.2;">Book a slot. Pass the gate. Weigh the crop.</h2>
          <p class="muted" style="font-size:15px; max-width:540px;">One shared record for farmers, gate staff and the queue desk. The wireframe shows the intended public landing page.</p>
          <div style="margin-top:20px;"><span class="btn primary">Book a slot</span> <span class="btn">View live queue</span></div>
        </div>
        <div class="card"><h3>Today at Karnal Mandi</h3><div class="bar" style="margin:12px 0;"></div><div class="muted">5,500 / 10,000 kg allocated</div><div class="box tall" style="margin-top:16px;"></div><div class="muted">Queue snapshot placeholder</div></div>
      </div>
      <div class="grid g4" style="margin-top:24px;">
        <div class="card"><h3>Farmer portal</h3><div class="muted">Nearby mandis, quota and slot booking.</div></div>
        <div class="card"><h3>Gate desk</h3><div class="muted">RFID or QR verification and barrier control.</div></div>
        <div class="card"><h3>Weighbridge</h3><div class="muted">Gross and tare readings with net weight.</div></div>
        <div class="card"><h3>Queue ledger</h3><div class="muted">Live positions, counts and daily totals.</div></div>
      </div>
      <div class="footer-note">Wireframe 1 - public landing / overview</div>
    """),
    "02-login": page("Login", """
      <div class="top"><div class="brand"><div class="logo">MS</div><div><h1>MandiSync</h1><div class="muted">Secure sign in</div></div></div><div class="nav"><span class="item">Back to home</span></div></div>
      <div class="center">
        <div class="card solid login" style="padding:28px;">
          <h2 style="text-align:center;">Sign in</h2>
          <div class="muted" style="text-align:center; margin-bottom:18px;">Use your farmer, operator or admin account.</div>
          <label class="muted">Email</label><div class="box"></div>
          <label class="muted">Password</label><div class="box"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin:12px 0 18px;"><span class="muted">Remember me</span><span class="muted">Forgot password?</span></div>
          <div class="btn primary" style="display:block; text-align:center;">Sign in</div>
          <div class="muted" style="text-align:center; margin-top:14px;">Demo accounts available for the prototype review.</div>
        </div>
      </div>
      <div class="footer-note">Wireframe 2 - login</div>
    """),
    "03-farmer-booking": page("Farmer Booking", """
      <div class="top"><div class="brand"><div class="logo">MS</div><div><h1>Farmer Portal</h1><div class="muted">Book an arrival slot</div></div></div><div class="nav"><span class="item">My bookings</span><span class="item">Live queue</span><span class="item">Logout</span></div></div>
      <div class="sidebar" style="margin-top:22px;">
        <div class="card">
          <div class="step"><span class="num">1</span> Select mandi</div>
          <div class="step"><span class="num">2</span> Crop and weight</div>
          <div class="step"><span class="num">3</span> Arrival window</div>
          <div class="step"><span class="num">4</span> Confirm</div>
          <div class="box tall" style="margin-top:18px;"></div>
          <div class="muted">Booking summary placeholder</div>
        </div>
        <div>
          <h2>Available mandis near you</h2>
          <div class="grid g3">
            <div class="card"><h3>Karnal Central</h3><div class="muted">4.2 km</div><div class="bar" style="margin:10px 0;"></div><div class="muted">5,500 / 10,000 kg</div><div class="btn" style="margin-top:12px;">Select</div></div>
            <div class="card"><h3>Khanna Grain Market</h3><div class="muted">9.8 km</div><div class="bar" style="margin:10px 0;"></div><div class="muted">7,200 / 15,000 kg</div><div class="btn" style="margin-top:12px;">Select</div></div>
            <div class="card"><h3>Nilokheri Sector 4</h3><div class="muted">12.6 km</div><div class="bar" style="margin:10px 0;"></div><div class="muted">3,100 / 8,000 kg</div><div class="btn" style="margin-top:12px;">Select</div></div>
          </div>
          <div class="card" style="margin-top:18px;">
            <h3>Booking details</h3>
            <div class="grid g3">
              <div><label class="muted">Crop</label><div class="box"></div></div>
              <div><label class="muted">Estimated weight</label><div class="box"></div></div>
              <div><label class="muted">Vehicle number</label><div class="box"></div></div>
            </div>
            <div class="grid g4" style="margin-top:12px;">
              <div class="card" style="padding:10px; text-align:center;">08:00 - 09:00</div>
              <div class="card" style="padding:10px; text-align:center;">09:00 - 10:00</div>
              <div class="card" style="padding:10px; text-align:center;">10:00 - 11:00</div>
              <div class="card" style="padding:10px; text-align:center;">11:00 - 12:00</div>
            </div>
            <div style="text-align:right; margin-top:16px;"><span class="btn primary">Confirm booking</span></div>
          </div>
        </div>
      </div>
      <div class="footer-note">Wireframe 3 - farmer booking wizard</div>
    """),
    "04-gate-desk": page("Gate Desk", """
      <div class="top"><div class="brand"><div class="logo">MS</div><div><h1>Gate Control Desk</h1><div class="muted">RFID and QR verification</div></div></div><div class="nav"><span class="item">Gate</span><span class="item">Weighbridge</span><span class="item">Queue</span></div></div>
      <div class="grid g2" style="margin-top:22px;">
        <div class="card solid">
          <h2>Scan arrival</h2>
          <div class="scan">PLACE RFID TAG / QR HERE</div>
          <div class="grid g2" style="margin-top:14px;"><div class="box"></div><div class="btn primary" style="text-align:center;">Verify pass</div></div>
          <div class="muted" style="margin-top:12px;">Manual RFID entry is kept as a fallback for the gate operator.</div>
        </div>
        <div class="card">
          <h2>Booking found</h2>
          <div class="box"></div><div class="box"></div>
          <div class="grid g2"><div class="card" style="padding:10px;"><div class="muted">Farmer</div><b>Demo Farmer</b></div><div class="card" style="padding:10px;"><div class="muted">Vehicle</div><b>HR-05-AB-7721</b></div></div>
          <div class="card" style="margin-top:12px; padding:16px; text-align:center; font-weight:800; font-size:20px;">GATE OPEN - 15 s PULSE</div>
        </div>
      </div>
      <div class="card" style="margin-top:20px;">
        <h2>Recent scans</h2>
        <table class="table"><tr><th>Time</th><th>RFID tag</th><th>Booking</th><th>Result</th></tr><tr><td>10:42</td><td>UHF-TAG-891024</td><td>BK-2026-001</td><td>Allowed</td></tr><tr><td>10:39</td><td>UHF-TAG-771203</td><td>BK-2026-002</td><td>Denied</td></tr><tr><td>10:35</td><td>UHF-TAG-640118</td><td>BK-2026-003</td><td>Allowed</td></tr></table>
      </div>
      <div class="footer-note">Wireframe 4 - gate control desk</div>
    """),
    "05-weigh-queue": page("Weigh Queue", """
      <div class="top"><div class="brand"><div class="logo">MS</div><div><h1>Weighbridge and Queue</h1><div class="muted">Live weight and queue ledger</div></div></div><div class="nav"><span class="item">Gate</span><span class="item">Weighbridge</span><span class="item">Queue</span></div></div>
      <div class="grid g3" style="margin-top:22px;">
        <div class="card solid">
          <h2>Live weight</h2>
          <div style="height:130px; border:3px dashed #475569; border-radius:12px; display:grid; place-items:center; font-size:42px; font-weight:800;">6,450 kg</div>
          <div class="grid g2" style="margin-top:12px;"><div class="btn primary" style="text-align:center;">Capture gross</div><div class="btn" style="text-align:center;">Capture tare</div></div>
          <div class="muted" style="margin-top:10px;">Device: SCALE-01 - stable reading</div>
        </div>
        <div class="card">
          <h2>Booking</h2>
          <div class="box"></div><div class="box"></div>
          <div class="grid g2"><div class="card" style="padding:10px;"><div class="muted">Gross</div><b>6,450 kg</b></div><div class="card" style="padding:10px;"><div class="muted">Tare</div><b>2,500 kg</b></div></div>
          <div class="card" style="margin-top:12px; padding:12px;"><div class="muted">Net weight</div><b style="font-size:22px;">3,950 kg</b></div>
        </div>
        <div class="card">
          <h2>Queue metrics</h2>
          <div class="stat"><span class="muted">Waiting</span><b>12</b></div>
          <div class="stat" style="margin-top:10px;"><span class="muted">At gate</span><b>4</b></div>
          <div class="stat" style="margin-top:10px;"><span class="muted">Completed</span><b>28</b></div>
        </div>
      </div>
      <div class="card" style="margin-top:18px;">
        <h2>Queue ledger</h2>
        <table class="table"><tr><th>Position</th><th>Farmer</th><th>Crop</th><th>Status</th><th>Net kg</th></tr><tr><td>1</td><td>Demo Farmer</td><td>Wheat</td><td>Weighed</td><td>3,950</td></tr><tr><td>2</td><td>R. Singh</td><td>Paddy</td><td>At gate</td><td>-</td></tr><tr><td>3</td><td>A. Kumar</td><td>Mustard</td><td>Waiting</td><td>-</td></tr></table>
      </div>
      <div class="footer-note">Wireframe 5 - weighbridge and queue ledger</div>
    """),
}


def main() -> int:
    for name, html in SCREENS.items():
        (OUT / f"{name}.html").write_text(html, encoding="utf-8")
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
        page_obj = browser.new_page(viewport={"width": 1460, "height": 1000}, device_scale_factor=2)
        for name in SCREENS:
            url = (OUT / f"{name}.html").as_uri()
            page_obj.goto(url, wait_until="load")
            page_obj.screenshot(path=str(OUT / f"{name}.png"), full_page=True)
            print(f"wrote {OUT / (name + '.png')}")
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
