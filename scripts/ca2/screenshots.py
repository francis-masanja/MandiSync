#!/usr/bin/env python3
"""Capture actual screenshots of the running MandiSync prototype.

The login API is currently broken (NextAuth 4 route handler shape), so the
screenshots use a signed demo session token for the farmer account. This keeps
the screenshots honest: they show the real pages and the real in-memory demo
data, not mock HTML.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "ca2" / "assets" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

BASE = "http://localhost:3000"


def read_secret() -> str:
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if line.startswith("NEXTAUTH_SECRET="):
            return line.split("=", 1)[1].strip().strip('"')
    raise RuntimeError("NEXTAUTH_SECRET not found in .env")


def make_token(secret: str) -> str:
    js = (
        "const {encode}=require('next-auth/jwt');"
        "encode({token:{sub:'U1',name:'Farmer Demo',email:'farmer@example.com',role:'farmer'},"
        "secret:process.env.NEXTAUTH_SECRET,maxAge:2592000}).then(t=>console.log(t));"
    )
    env = dict(os.environ, NEXTAUTH_SECRET=secret)
    result = subprocess.run(
        ["node", "-e", js], capture_output=True, text=True, env=env, cwd=str(ROOT)
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def clean(page: Page) -> None:
    page.add_style_tag(
        content="""
        nextjs-portal, script[data-nextjs-dev-overlay], [data-nextjs-toast] { display: none !important; }
        """
    )
    page.evaluate(
        """() => {
            document.querySelectorAll('nextjs-portal').forEach(e => e.remove());
            document.querySelectorAll('script[data-nextjs-dev-overlay]').forEach(e => e.remove());
        }"""
    )


def shot(page: Page, path: str, name: str) -> None:
    page.goto(f"{BASE}{path}", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(1000)
    clean(page)
    page.wait_for_timeout(250)
    page.screenshot(path=str(OUT / name), full_page=True)
    print(f"wrote {name}")


def main() -> int:
    token = make_token(read_secret())
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, device_scale_factor=2)
        context.add_cookies(
            [
                {
                    "name": "next-auth.session-token",
                    "value": token,
                    "domain": "localhost",
                    "path": "/",
                    "httpOnly": True,
                    "sameSite": "Lax",
                }
            ]
        )
        page = context.new_page()
        shot(page, "/login", "actual-02-login.png")
        shot(page, "/", "actual-01-landing.png")
        shot(page, "/farmer", "actual-03-farmer-booking.png")
        shot(page, "/gate", "actual-04-gate-desk.png")
        shot(page, "/queue", "actual-06-queue.png")
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
