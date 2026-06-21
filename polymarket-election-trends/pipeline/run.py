"""
Orchestrator for the Polymarket election-trends module.

Discovers election markets, fetches their price histories, computes trend /
sentiment-movement metrics, and emits dashboard/trends.{json,js}.

Usage:
    python pipeline/run.py                       # one full refresh
    python pipeline/run.py --events 24 --max-markets 60
    python pipeline/run.py --watch 300           # auto-refresh every 5 minutes
    python pipeline/run.py --no-fetch            # recompute trends from cached data
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

import trends

HERE = Path(__file__).resolve().parent


def _run(script: str, *args: str) -> None:
    subprocess.run([sys.executable, str(HERE / script), *args], check=False)


def refresh(args, refresh_secs=None) -> dict:
    if not args.no_fetch:
        _run("fetch_markets.py", "--events", str(args.events),
             "--per-event", str(args.per_event), "--min-price", str(args.min_price))
        _run("fetch_history.py", "--max-markets", str(args.max_markets))
    out = trends.build()
    trends.write(out, refresh_secs=refresh_secs)
    return out


def report(out: dict) -> None:
    print(f"\n[{out['generated_at']}] Polymarket election trends — "
          f"{out['n_markets']} markets / {out['n_events']} events")
    print("-" * 60)
    print("Biggest 7-day sentiment movers:")
    for r in out["movers_7d"][:8]:
        arrow = "▲" if r["d7d"] > 0 else "▼"
        print(f"  {arrow} {r['d7d']:+5.1f} pts  {r['price_pct']:5.1f}%  "
              f"{r['candidate'][:34]:34}  [{r['event'][:26]}]")
    print("-" * 60)
    print("Most-active events by total 7d movement:")
    for e in out["events"][:6]:
        print(f"  {e['abs_move_7d']:6.1f} pts  {e['event'][:38]:38}  "
              f"leader {e['leader']['candidate'][:18]} {e['leader']['price_pct']:.0f}%")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--events", type=int, default=24)
    ap.add_argument("--per-event", type=int, default=6)
    ap.add_argument("--min-price", type=float, default=0.02)
    ap.add_argument("--max-markets", type=int, default=60)
    ap.add_argument("--no-fetch", action="store_true",
                    help="skip network; recompute trends from cached data/*.json")
    ap.add_argument("--watch", type=int, default=None, metavar="SECONDS",
                    help="auto-refresh on this interval until Ctrl-C")
    args = ap.parse_args()

    if not args.watch:
        report(refresh(args))
        print("\nArtifacts written to dashboard/trends.{json,js}")
        return

    print(f"Watching: refreshing every {args.watch}s (Ctrl-C to stop)")
    while True:
        report(refresh(args, refresh_secs=args.watch))
        try:
            time.sleep(args.watch)
        except KeyboardInterrupt:
            print("\nStopped.")
            break


if __name__ == "__main__":
    main()
