"""
Live Polymarket fetcher — pulls current runoff odds from the public Gamma API.

The Gamma API (https://gamma-api.polymarket.com) is fully public, no auth.
Each candidate is a Yes/No market under the event; we read `outcomePrices`.

On success, overwrites data/polymarket.json with live numbers (keeping the
static file as a fallback if the network is unavailable).

Usage:
    python pipeline/fetch_polymarket.py [--slug colombia-presidential-election]
"""

from __future__ import annotations

import argparse
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

GAMMA = "https://gamma-api.polymarket.com/events"
DATA = Path(__file__).resolve().parent.parent / "data"

# Substring matchers for the two runoff candidates within market questions.
MATCH = {
    "espriella": ["espriella"],
    "cepeda": ["cepeda"],
}


def _yes_price(market: dict) -> float | None:
    try:
        prices = json.loads(market.get("outcomePrices", "[]"))
        return float(prices[0])
    except (ValueError, IndexError, TypeError):
        return None


def fetch(slug: str, timeout: int = 20) -> dict:
    url = f"{GAMMA}?slug={slug}"
    req = urllib.request.Request(url, headers={"User-Agent": "co-election-forecast/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        events = json.load(resp)
    if not events:
        raise RuntimeError(f"No Polymarket event for slug={slug}")
    event = events[0]

    found = {}
    for m in event.get("markets", []):
        q = (m.get("question") or "").lower()
        price = _yes_price(m)
        if price is None:
            continue
        for key, needles in MATCH.items():
            if key not in found and any(n in q for n in needles):
                found[key] = {"question": m.get("question"), "prob": round(price, 4)}

    if "espriella" not in found or "cepeda" not in found:
        raise RuntimeError(f"Could not locate both candidate markets; found {list(found)}")

    esp = found["espriella"]["prob"]
    cep = found["cepeda"]["prob"]
    total = esp + cep
    return {
        "source": "Polymarket (live Gamma API)",
        "captured": datetime.now(timezone.utc).isoformat(),
        "event": event.get("title"),
        "slug": slug,
        "volume": event.get("volume"),
        "winner_market": {
            "espriella": esp,
            "cepeda": cep,
            "espriella_normalized": round(esp / total, 4),
            "cepeda_normalized": round(cep / total, 4),
            "note": "Live Yes prices from Gamma API; *_normalized renormalize to the two-way runoff.",
        },
        "raw": found,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", default="colombia-presidential-election")
    ap.add_argument("--keep-margin", action="store_true",
                    help="preserve the margin_market block from the existing file")
    args = ap.parse_args()

    out_path = DATA / "polymarket.json"
    try:
        live = fetch(args.slug)
        if args.keep_margin and out_path.exists():
            prev = json.loads(out_path.read_text(encoding="utf-8"))
            if "margin_market" in prev:
                live["margin_market"] = prev["margin_market"]
        out_path.write_text(json.dumps(live, indent=2, ensure_ascii=False), encoding="utf-8")
        w = live["winner_market"]
        print(f"[polymarket] live OK  Espriella {w['espriella']*100:.1f}%  "
              f"Cepeda {w['cepeda']*100:.1f}%  (vol {live.get('volume')})")
    except Exception as exc:  # network/parse failure -> keep static fallback
        print(f"[polymarket] live fetch failed ({exc}); keeping existing {out_path.name}")


if __name__ == "__main__":
    main()
