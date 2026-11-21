#!/usr/bin/env python3
"""Humanize the report prose with a local Ollama endpoint.

The machine has 8 GB RAM and no GPU, so the default model is the cloud-backed
`gpt-oss:120b-cloud` endpoint exposed by the local Ollama daemon. It is fast and
does not consume local model RAM. If the cloud model is unavailable the script
falls back to the small local `qwen2.5-coder:0.5b` model.

Only prose is sent. Names, registration numbers, table values and technical
identifiers are left untouched.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import content  # noqa: E402

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "gpt-oss:120b-cloud"
FALLBACK_MODEL = "qwen2.5-coder:0.5b"

PROMPT = """You are helping a student write a clean CA2 project report.
Rewrite the text below in a natural, human student voice.

Rules:
- Keep every fact, number, name, date, technical term and API path exactly as it is.
- Do not add new facts, examples, citations or claims.
- Do not remove any fact.
- Vary sentence length. Avoid repeated sentence openings.
- Avoid AI-sounding phrases such as "in today's fast-paced world", "delve", "seamless", "leverage", "pivotal", "moreover", "furthermore" and "it is important to note".
- Keep it clear and slightly informal, like a student explaining the work to a teammate.
- Return only the rewritten paragraph, with no heading, notes or quotation marks.

Text:
{text}
"""


def generate(text: str, model: str, timeout: int = 120) -> str:
    payload = {
        "model": model,
        "prompt": PROMPT.format(text=text),
        "stream": False,
        "options": {"temperature": 0.35, "num_ctx": 4096, "num_predict": 1200},
    }
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return (data.get("response") or "").strip()


def looks_complete(text: str) -> bool:
    text = text.strip()
    return len(text) > 20 and text.endswith((".", "!", "?", '"', ")"))


def humanize_text(text: str, model: str, fallback: str) -> str:
    for attempt_model in (model, fallback):
        try:
            out = generate(text, attempt_model)
            if looks_complete(out):
                return out
            print(f"  [{attempt_model}] returned an incomplete paragraph, retrying")
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            print(f"  [{attempt_model}] failed: {exc}")
    return text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--fallback", default=FALLBACK_MODEL)
    parser.add_argument("--output", default="docs/ca2/humanized_content.json")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    out_path = Path(args.output)
    existing = {}
    if out_path.exists():
        existing = json.loads(out_path.read_text(encoding="utf-8"))

    result = {"SECTIONS": {}, "MODULES": [], "SEGMENTS": []}

    for section, paragraphs in content.SECTIONS.items():
        result["SECTIONS"][section] = []
        for i, para in enumerate(paragraphs):
            key = f"{section}.{i}"
            cached = existing.get("SECTIONS", {}).get(section, [])
            if i < len(cached) and cached[i] and looks_complete(cached[i]):
                result["SECTIONS"][section].append(cached[i])
                print(f"cached  {key}")
                continue
            print(f"writing {key} ...", end=" ", flush=True)
            if args.dry_run:
                new = para
            else:
                new = humanize_text(para, args.model, args.fallback)
                time.sleep(0.4)
            result["SECTIONS"][section].append(new)
            print("ok")

    for i, module in enumerate(content.MODULES):
        name, desc, inp, out = module
        key = f"MODULES.{i}.description"
        cached = existing.get("MODULES", [])
        if i < len(cached) and cached[i] and looks_complete(cached[i][1]):
            result["MODULES"].append(tuple(cached[i]))
            print(f"cached  {key}")
            continue
        print(f"writing {key} ...", end=" ", flush=True)
        new_desc = desc if args.dry_run else humanize_text(desc, args.model, args.fallback)
        time.sleep(0.4)
        result["MODULES"].append((name, new_desc, inp, out))
        print("ok")

    for i, seg in enumerate(content.SEGMENTS):
        cached_list = existing.get("SEGMENTS", [])
        cached = cached_list[i] if i < len(cached_list) else {}
        item = dict(seg)
        for field in ("one_minute", "takeaway"):
            old = item[field]
            if cached.get(field) and looks_complete(cached[field]):
                item[field] = cached[field]
                print(f"cached  SEGMENTS.{i}.{field}")
            else:
                print(f"writing SEGMENTS.{i}.{field} ...", end=" ", flush=True)
                item[field] = old if args.dry_run else humanize_text(old, args.model, args.fallback)
                time.sleep(0.4)
                print("ok")
        new_body = []
        for j, para in enumerate(item["body"]):
            old = cached.get("body", [])
            if j < len(old) and old[j] and looks_complete(old[j]):
                new_body.append(old[j])
                print(f"cached  SEGMENTS.{i}.body.{j}")
            else:
                print(f"writing SEGMENTS.{i}.body.{j} ...", end=" ", flush=True)
                new_body.append(para if args.dry_run else humanize_text(para, args.model, args.fallback))
                time.sleep(0.4)
                print("ok")
        item["body"] = new_body
        result["SEGMENTS"].append(item)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nSaved {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
