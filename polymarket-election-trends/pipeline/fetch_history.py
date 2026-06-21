"""
Fetch price-history time series for discovered markets (public CLOB API, no auth).

Two windows per token (the Yes price IS the market-implied probability):
  * WEEK — last 7 days, hourly (interval=1w, fidelity=60) → ~168 points.
  * DAY  — last 24 hours, sampled more often (interval=1d, fidelity=10 ≈ every
           10 min) → ~144 points, for a granular 24-hour view.

To bound runtime, markets are prioritized by 24h volume and capped.

Output: data/history.json  ->  { token: { "week": [{t,p}…], "day": [{t,p}…] } }

Usage:
    python pipeline/fetch_history.py [--max-markets 60]
        [--week-fidelity 60] [--day-fidelity 10]
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

CLOB = "https://clob.polymarket.com/prices-history"
DATA = Path(__file__).resolve().parent.parent / "data"


def fetch_series(token: str, interval: str, fidelity: int):
    url = CLOB + "?" + urllib.parse.urlencode(
        {"market": token, "interval": interval, "fidelity": fidelity})
    req = urllib.request.Request(url, headers={"User-Agent": "pm-trends/1.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        d = json.load(resp)
    hist = d.get("history", d if isinstance(d, list) else [])
    return [{"t": int(p["t"]), "p": round(float(p["p"]), 4)} for p in hist]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-markets", type=int, default=60)
    ap.add_argument("--week-fidelity", type=int, default=60)   # minutes (hourly)
    ap.add_argument("--day-fidelity", type=int, default=10)    # minutes (denser, 24h)
    args = ap.parse_args()

    markets = json.loads((DATA / "markets.json").read_text(encoding="utf-8"))["markets"]
    markets = sorted(markets, key=lambda m: m["volume24hr"], reverse=True)[:args.max_markets]

    history, ok, fail = {}, 0, 0
    for i, m in enumerate(markets, 1):
        tok = m["token"]
        try:
            week = fetch_series(tok, "1w", args.week_fidelity)
            day = fetch_series(tok, "1d", args.day_fidelity)
            if week or day:
                history[tok] = {"week": week, "day": day}
                ok += 1
        except Exception:
            fail += 1
        if i % 15 == 0:
            print(f"  …{i}/{len(markets)} fetched")
        time.sleep(0.08)

    (DATA / "history.json").write_text(json.dumps(history, ensure_ascii=False),
                                       encoding="utf-8")
    print(f"[history] {ok} tokens saved, {fail} failed "
          f"(week@{args.week_fidelity}m, day@{args.day_fidelity}m)")


if __name__ == "__main__":
    main()
