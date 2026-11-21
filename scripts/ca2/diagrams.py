#!/usr/bin/env python3
"""Generate the diagrams used in the CA2 report and HTML guides."""

from __future__ import annotations

import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Patch, Polygon

sys.path.insert(0, str(Path(__file__).resolve().parent))
import content  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "ca2" / "assets" / "diagrams"
OUT.mkdir(parents=True, exist_ok=True)

FONT = "DejaVu Sans"


def graphviz(name: str, source: str, engine: str = "dot") -> None:
    path = OUT / f"{name}.png"
    cmd = [engine, "-Tpng", "-Gdpi=200", "-Gbgcolor=white", "-o", str(path)]
    proc = subprocess.run(cmd, input=source.encode("utf-8"), capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", errors="replace"))
    print(f"wrote {path}")


def architecture() -> None:
    """Readable architecture map: users, Next.js app, hardware and data."""
    fig, ax = plt.subplots(figsize=(13.2, 7.2))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 60)
    ax.axis("off")

    def column(x, title, color, fill):
        ax.add_patch(FancyBboxPatch((x - 10.5, 2), 21, 53, boxstyle="round,pad=0.4,rounding_size=1.2",
                                    linewidth=1.2, edgecolor=color, facecolor=fill, alpha=0.55))
        ax.text(x, 57, title, ha="center", va="center", fontsize=10.5, fontweight="bold", color=color)

    def box(x, y, w, h, text, fc="#ffffff", ec="#64748b", fs=9.2, bold=False):
        ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.25,rounding_size=1.0",
                                    linewidth=1.15, edgecolor=ec, facecolor=fc))
        ax.text(x, y, text, ha="center", va="center", fontsize=fs, color="#0f172a", linespacing=1.25,
                fontweight="bold" if bold else "normal")

    def arrow(x1, y1, x2, y2, label="", dashed=False, color="#475569"):
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=12,
                                     linewidth=1.25, color=color, linestyle="--" if dashed else "-",
                                     shrinkA=2, shrinkB=2))
        if label:
            ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 1.1, label, ha="center", va="bottom", fontsize=8, color=color)

    column(12, "USERS", "#065f46", "#dcfce7")
    column(37, "NEXT.JS 16 APP", "#1e3a8a", "#dbeafe")
    column(62, "HARDWARE", "#92400e", "#fef3c7")
    column(87, "DATA LAYER", "#4c1d95", "#ede9fe")

    box(12, 42, 17, 9, "Farmer browser\nbooking + queue")
    box(12, 26, 17, 9, "Official / gate browser\ngate + weigh + ledger")

    box(37, 44, 18, 8, "React UI pages\nApp Router")
    box(37, 31, 18, 8, "API route handlers\n/api/v1/*", fc="#eff6ff")
    box(37, 17, 18, 8, "Middleware\nNextAuth + RBAC + CSP", fc="#fff7ed", ec="#d97706", fs=8.6)

    box(62, 42, 18, 9, "Gate node\nESP32 + UHF RFID", fc="#fffbeb", ec="#d97706", fs=8.6)
    box(62, 25, 18, 9, "Scale node\nESP32 + HX711", fc="#fffbeb", ec="#d97706", fs=8.6)
    box(62, 10, 18, 6, "Optional Ollama client\n(not on main flow)", fc="#faf5ff", ec="#a855f7", fs=8.0)

    box(87, 42, 18, 9, "Prisma Client\n+ libSQL adapter", fc="#eff6ff", ec="#2563eb")
    box(87, 25, 18, 9, "SQLite (local)\nTurso (hosted)", fc="#eff6ff", ec="#2563eb")

    arrow(20.5, 42, 28, 44, label="HTTPS")
    arrow(20.5, 26, 28, 30, label="HTTPS")
    arrow(37, 40, 37, 35.2)
    arrow(37, 21, 37, 26.8, dashed=True, color="#d97706")
    arrow(46, 31, 78, 38, label="queries")
    arrow(87, 37.5, 87, 29.7)
    arrow(52.5, 42, 46.2, 35)
    arrow(52.5, 25, 46.2, 28)

    ax.text(50, 2.6, "The browser talks to Next.js; devices talk only to the API; Prisma is the single data access layer.",
            ha="center", va="center", fontsize=8.6, color="#475569")

    fig.tight_layout(pad=0.3)
    path = OUT / "architecture.png"
    fig.savefig(path, dpi=220, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"wrote {path}")


def workflow() -> None:
    """Compact four-stage process map. Matplotlib keeps the aspect ratio usable."""
    fig, ax = plt.subplots(figsize=(13.2, 7.0))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 60)
    ax.axis("off")

    def column(x, title, color, fill):
        ax.add_patch(FancyBboxPatch((x - 11, 1.5), 22, 54, boxstyle="round,pad=0.4,rounding_size=1.2",
                                    linewidth=1.2, edgecolor=color, facecolor=fill, alpha=0.55))
        ax.text(x, 56.4, title, ha="center", va="center", fontsize=10, fontweight="bold", color=color)

    def box(x, y, w, h, text, fc="#ffffff", ec="#64748b", fs=9):
        ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.25,rounding_size=1.0",
                                    linewidth=1.15, edgecolor=ec, facecolor=fc))
        ax.text(x, y, text, ha="center", va="center", fontsize=fs, color="#0f172a", linespacing=1.25)

    def diamond(x, y, w, h, text, fc="#fef3c7", ec="#d97706"):
        pts = [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)]
        ax.add_patch(Polygon(pts, closed=True, linewidth=1.15, edgecolor=ec, facecolor=fc))
        ax.text(x, y, text, ha="center", va="center", fontsize=9, color="#0f172a")

    def arrow(x1, y1, x2, y2, label="", style="-|>", dashed=False, color="#475569"):
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=12,
                                     linewidth=1.25, color=color, linestyle="--" if dashed else "-",
                                     shrinkA=2, shrinkB=2))
        if label:
            ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 1.2, label, ha="center", va="bottom", fontsize=8, color=color)

    column(13, "1. BOOKING", "#065f46", "#dcfce7")
    column(37, "2. GATE", "#92400e", "#fef3c7")
    column(61, "3. WEIGHING", "#1e3a8a", "#dbeafe")
    column(85, "4. COMPLETION", "#4c1d95", "#ede9fe")

    box(13, 45, 17, 7, "Farmer login")
    box(13, 32, 17, 8, "Select mandi, crop,\nweight and slot")
    box(13, 18, 17, 8, "Create booking\n+ signed gate pass")

    box(37, 45, 17, 7, "Scan RFID tag\nor QR pass")
    diamond(37, 32, 17, 9, "Pass valid?")
    box(31, 17, 12, 8, "Open gate\nGATE_VERIFIED", fc="#d1fae5", ec="#059669", fs=8.4)
    box(45, 17, 12, 8, "Deny entry\n+ reason", fc="#fee2e2", ec="#dc2626", fs=8.4)

    box(61, 45, 17, 8, "Record GROSS\nweight", fc="#eff6ff")
    box(61, 33, 17, 8, "Record TARE\nweight", fc="#eff6ff")
    box(61, 20, 17, 9, "Calculate net weight\nand payout fields", fc="#eff6ff")

    box(85, 36, 17, 8, "Update live\nqueue ledger", fc="#f5f3ff")
    box(85, 20, 17, 9, "Status COMPLETED\nreceipt available", fc="#d1fae5", ec="#059669", fs=8.6)

    arrow(13, 41.5, 13, 36.2)
    arrow(13, 28, 13, 22.2)
    arrow(21.6, 18, 28.4, 43.5)
    arrow(37, 41.5, 37, 36.6)
    arrow(37, 27.5, 37, 21.2)
    arrow(40.5, 30.5, 44.8, 20.8, label="No", color="#dc2626")
    arrow(33.5, 30.5, 31.2, 21.2, label="Yes", color="#059669")
    arrow(37.2, 17, 52.5, 43.5)
    arrow(61, 41, 61, 37.2)
    arrow(61, 29, 61, 24.7)
    arrow(69.6, 33.2, 76.4, 35.2)
    arrow(85, 31.8, 85, 24.7)

    ax.add_patch(FancyBboxPatch((3, 3.2), 94, 5.0, boxstyle="round,pad=0.35,rounding_size=1.0",
                                linewidth=1.0, edgecolor="#d97706", facecolor="#fffbeb", linestyle="--"))
    ax.text(50, 5.7, "If a device is offline: buffer the packet in LittleFS on the ESP32 and send it later through /api/v1/telemetry/batch-sync.",
            ha="center", va="center", fontsize=8.4, color="#92400e")

    fig.tight_layout(pad=0.3)
    path = OUT / "workflow.png"
    fig.savefig(path, dpi=220, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"wrote {path}")


def er() -> None:
    source = r'''
digraph er {
  graph [rankdir=LR, nodesep=0.45, ranksep=1.0, pad=0.3, fontname="DejaVu Sans", fontsize=10];
  node  [shape=record, fontname="DejaVu Sans", fontsize=9, penwidth=1.2, color="#2563eb", fillcolor="#ffffff", style="filled,rounded"];
  edge  [fontname="DejaVu Sans", fontsize=8, color="#475569", arrowhead=crow, arrowtail=none, dir=both, arrowsize=0.7];

  user [label="{User|id : UUID (PK)\lname : String\lemail : String (unique)\lpassword_hash : String\lrole : String\l}"];
  booking [label="{Booking|id : UUID (PK)\lfarmerId : UUID (FK)\lmandiId : UUID (FK)\lslotId : UUID (FK, unique)\lcropType : String\lstatus : String\lhmacToken : String?\lactualNetKg : Float?\l}"];
  mandi [label="{Mandi|id : UUID (PK)\lname : String\llocation : String\llatitude : Float\llongitude : Float\lmaxDailyKg : Int\lallocatedTodayKg : Int\l}"];
  slot [label="{Slot|id : UUID (PK)\lmandiId : UUID (FK)\lstartTime : DateTime\lendTime : DateTime\lisBooked : Boolean\l}"];
  telemetry [label="{Telemetry|id : UUID (PK)\lbookingId : UUID (FK)\lrfidTag : String\ltype : String\lweightKg : Float\ldeviceId : String\lsource : String\l}"];
  task [label="{Task|id : UUID (PK)\ldescription : String\lassigneeId : UUID (FK)\lbookingId : UUID? (FK)\ldueAt : DateTime?\l}"];

  user -> booking [label="1 .. *"];
  mandi -> booking [label="1 .. *"];
  mandi -> slot [label="1 .. *"];
  slot -> booking [label="1 .. 1"];
  booking -> telemetry [label="1 .. *"];
  user -> task [label="1 .. *"];
  booking -> task [label="0 .. *"];
}
'''
    graphviz("er", source)


def navigation() -> None:
    source = r'''
digraph navigation {
  graph [rankdir=LR, nodesep=0.35, ranksep=0.6, pad=0.25, fontname="DejaVu Sans", fontsize=10];
  node  [shape=box, style="rounded,filled", fontname="DejaVu Sans", fontsize=9, penwidth=1.2, color="#64748b", fillcolor="#ffffff", margin="0.14,0.08"];
  edge  [fontname="DejaVu Sans", fontsize=8, color="#475569", arrowsize=0.65];

  landing [label="Landing / overview", fillcolor="#ecfdf5", color="#059669"];
  login [label="Login", fillcolor="#fffbeb", color="#d97706"];
  farmer [label="Farmer dashboard", fillcolor="#ecfdf5", color="#059669"];
  select [label="Select mandi", fillcolor="#ecfdf5"];
  book [label="Book slot", fillcolor="#ecfdf5"];
  pass [label="Pass issued\n(QR + status)", fillcolor="#ecfdf5"];
  live [label="Live queue", fillcolor="#ecfdf5"];
  receipt [label="Receipt", fillcolor="#ecfdf5"];
  gate [label="Gate control desk", fillcolor="#eff6ff", color="#2563eb"];
  scan [label="Scan RFID / QR", fillcolor="#eff6ff"];
  weigh [label="Weighbridge bench", fillcolor="#fffbeb", color="#d97706"];
  ledger [label="Queue ledger", fillcolor="#f5f3ff", color="#7c3aed"];
  admin [label="Admin / users\n(planned)", style="rounded,dashed,filled", fillcolor="#f8fafc", color="#94a3b8"];

  landing -> login;
  login -> farmer;
  login -> gate;
  login -> ledger;
  login -> admin [style=dashed];
  farmer -> select -> book -> pass -> live -> receipt;
  gate -> scan -> weigh -> ledger;
}
'''
    graphviz("navigation", source)


def gantt() -> None:
    rows = content.TIMELINE
    plt.rcParams.update({"font.family": FONT, "font.size": 9})
    fig, ax = plt.subplots(figsize=(12.6, 6.2))

    colors = {
        "Completed": "#10b981",
        "Completed (prototype)": "#0ea5e9",
        "Partial": "#f59e0b",
        "In Progress": "#8b5cf6",
    }

    for i, row in enumerate(rows):
        _, task, planned_start, planned_end, actual, status = row
        start = datetime.strptime(planned_start, "%d %b %Y")
        end = datetime.strptime(planned_end, "%d %b %Y")
        color = colors.get(status, "#94a3b8")
        ax.barh(i, (end - start).days, left=start, height=0.52, color=color, alpha=0.82, edgecolor="white", linewidth=0.8)
        actual_date = datetime.strptime(actual.split(",")[0].strip(), "%d %b %Y")
        ax.scatter(actual_date, i, marker="D", s=26, color="#1e293b", zorder=5, edgecolor="white", linewidth=0.6)
        ax.text(end + timedelta(days=1.2), i, status, va="center", fontsize=7.4, color="#334155")

    ax.set_yticks(range(len(rows)))
    ax.set_yticklabels([r[1] for r in rows])
    ax.invert_yaxis()
    ax.set_xlim(datetime(2026, 8, 14), datetime(2026, 11, 10))
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d %b"))
    ax.grid(axis="x", linestyle=":", linewidth=0.7, color="#cbd5e1", alpha=0.9)
    ax.set_axisbelow(True)
    ax.set_title("MandiSync - planned schedule and actual milestones", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("2026")
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    legend = [
        Patch(facecolor="#10b981", label="Completed"),
        Patch(facecolor="#0ea5e9", label="Completed (prototype)"),
        Patch(facecolor="#f59e0b", label="Partial"),
        Patch(facecolor="#8b5cf6", label="In progress"),
    ]
    ax.legend(handles=legend, loc="upper center", bbox_to_anchor=(0.5, -0.16), frameon=False, fontsize=8, ncol=4)
    fig.text(0.01, 0.01, "Diamonds mark the actual milestone date taken from the git history.", fontsize=7.5, color="#64748b")
    fig.tight_layout(rect=(0, 0.06, 1, 1))
    path = OUT / "gantt.png"
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"wrote {path}")


def main() -> int:
    architecture()
    workflow()
    er()
    navigation()
    gantt()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
