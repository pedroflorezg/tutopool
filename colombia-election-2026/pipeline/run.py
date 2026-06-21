"""
Orchestrator: build the forecast (+ optional live count) and emit it for the dashboard.

Writes into ../dashboard:
  - forecast.json : machine-readable full output
  - forecast.js   : `window.FORECAST = {...}` so the dashboard works from
                    file:// with no server / CORS issues.

Usage:
    python pipeline/run.py                      # forecast only (uses data/*.json as-is)
    python pipeline/run.py --live               # refresh Polymarket + project live count
    python pipeline/run.py --live --simulate 0.45   # demo live night at ~45% reported
    python pipeline/run.py --endpoint "https://host/{dept}.json"   # real official feed
    python pipeline/run.py --live --watch 300       # auto-refresh every 5 minutes
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from model import build_forecast
import live_projection

HERE = Path(__file__).resolve().parent
DASH = HERE.parent / "dashboard"


def _run(script: str, *args: str) -> None:
    subprocess.run([sys.executable, str(HERE / script), *args], check=False)


def build_once(live: bool, simulate: float | None, endpoint: str | None,
               refresh_secs: int | None = None) -> dict:
    if live:
        _run("fetch_polymarket.py", "--keep-margin")
        reg_args = []
        if endpoint:
            reg_args += ["--endpoint", endpoint]
        if simulate is not None:
            reg_args += ["--simulate", str(simulate)]
        _run("fetch_registraduria.py", *reg_args)

    forecast = build_forecast()
    # Full timestamp so the dashboard can show data freshness on each refresh.
    forecast["generated_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    if refresh_secs:
        forecast["refresh_secs"] = refresh_secs

    live_path = HERE.parent / "data" / "live_results.json"
    if live_path.exists():
        forecast_left = forecast["forecast"]["cepeda_two_way_median"] / 100.0
        forecast["live"] = live_projection.project(forecast_left)

    (DASH / "forecast.json").write_text(
        json.dumps(forecast, indent=2, ensure_ascii=False), encoding="utf-8")
    (DASH / "forecast.js").write_text(
        "window.FORECAST = " + json.dumps(forecast, ensure_ascii=False) + ";",
        encoding="utf-8")
    return forecast


def report(forecast: dict) -> None:
    f = forecast["forecast"]
    print(f"\n[{forecast['generated_at']}] Colombia 2026 runoff forecast")
    print("-" * 44)
    print(f"P(de la Espriella wins): {f['p_espriella_win']*100:5.1f}%")
    print(f"P(Cepeda wins):          {f['p_cepeda_win']*100:5.1f}%")
    print(f"Espriella two-way share: {f['espriella_two_way_median']:.1f}%  "
          f"(80% CI {f['ci80'][0]:.1f}-{f['ci80'][1]:.1f})")
    print(f"Median margin:           {f['margin_points_median']:+.1f} pts (Espriella)")
    if "live" in forecast:
        lv = forecast["live"]
        print("-" * 44)
        print(f"LIVE [{lv['mode']}] — {lv['national_reported_pct']*100:.0f}% reported")
        print(f"Projected: Espriella {lv['projected_espriella_two_way']:.1f}% / "
              f"Cepeda {lv['projected_cepeda_two_way']:.1f}%  "
              f"-> leader: {lv['projected_leader'].upper()}")
    print("-" * 44)
    print("Artifacts written to dashboard/forecast.json and forecast.js")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", action="store_true",
                    help="refresh live Polymarket odds and ingest the live count")
    ap.add_argument("--simulate", type=float, default=None,
                    help="simulate the official count at this national fraction reported (0-1)")
    ap.add_argument("--endpoint", default=None,
                    help="real Registraduría department results URL template (uses {dept})")
    ap.add_argument("--watch", type=int, default=None, metavar="SECONDS",
                    help="re-run on this interval (e.g. 300 = every 5 minutes) until Ctrl-C")
    args = ap.parse_args()

    if not args.watch:
        report(build_once(args.live, args.simulate, args.endpoint))
        return

    # Auto-refresh loop. In simulate mode, ramp the reported fraction each tick
    # so the demo visibly progresses toward 100% counted.
    sim = args.simulate
    print(f"Watching: refreshing every {args.watch}s (Ctrl-C to stop)")
    while True:
        report(build_once(args.live, sim, args.endpoint, refresh_secs=args.watch))
        if sim is not None:
            sim = min(0.995, sim + 0.05)
        try:
            time.sleep(args.watch)
        except KeyboardInterrupt:
            print("\nStopped.")
            break


if __name__ == "__main__":
    main()
