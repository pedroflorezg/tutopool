"""
Trend engine — turn raw price histories into sentiment-movement metrics.

For each market (Yes price = market-implied probability) it computes the change
over 24h / 7d / 30d, a 7-day momentum (slope), volatility, and a direction
label, plus a downsampled sparkline for the dashboard.  It then ranks the
biggest movers so you can see where public sentiment is shifting, and rolls the
markets up by event.

Output: dashboard/trends.{json,js}
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
DASH = Path(__file__).resolve().parent.parent / "dashboard"

DAY = 86400


def _at(points: list, target_t: int) -> float:
    """Price at the point nearest to (and not after) target_t; else earliest."""
    chosen = points[0]["p"]
    for pt in points:
        if pt["t"] <= target_t:
            chosen = pt["p"]
        else:
            break
    return chosen


def _slope_per_day(points: list, window_days: int) -> float:
    """Least-squares slope (price pts/day) over the trailing window."""
    if len(points) < 3:
        return 0.0
    t_end = points[-1]["t"]
    pts = [p for p in points if p["t"] >= t_end - window_days * DAY]
    if len(pts) < 3:
        pts = points[-3:]
    xs = [(p["t"] - pts[0]["t"]) / DAY for p in pts]
    ys = [p["p"] for p in pts]
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    if den == 0:
        return 0.0
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den


def _volatility(points: list) -> float:
    diffs = [abs(points[i]["p"] - points[i - 1]["p"]) for i in range(1, len(points))]
    return (sum(diffs) / len(diffs)) if diffs else 0.0


def _downsample(points: list, n: int = 60) -> list:
    if len(points) <= n:
        return [p["p"] for p in points]
    step = len(points) / n
    return [points[min(len(points) - 1, int(i * step))]["p"] for i in range(n)]


def _direction(d7d_pts: float) -> str:
    if d7d_pts >= 8:
        return "surging"
    if d7d_pts >= 2:
        return "rising"
    if d7d_pts <= -8:
        return "collapsing"
    if d7d_pts <= -2:
        return "falling"
    return "stable"


def build() -> dict:
    markets = json.loads((DATA / "markets.json").read_text(encoding="utf-8"))
    history = json.loads((DATA / "history.json").read_text(encoding="utf-8"))

    rows = []
    for m in markets["markets"]:
        h = history.get(m["token"])
        if not h:
            continue
        week = h.get("week") or []
        day = h.get("day") or []
        if len(week) < 2:
            week = day            # fall back if only intraday is available
        if len(week) < 2:
            continue

        cur = (day[-1]["p"] if day else week[-1]["p"])  # freshest price
        # 7-day change from the weekly series.
        p7 = week[0]["p"]
        d7 = (cur - p7) * 100
        # 24-hour change from the denser intraday series (more frequent samples).
        if len(day) >= 2:
            p24 = day[0]["p"]
            d24 = (cur - p24) * 100
        else:
            p24 = _at(week, week[-1]["t"] - DAY)
            d24 = (cur - p24) * 100

        rows.append({
            "event": m["event"], "event_slug": m["event_slug"],
            "candidate": m["candidate"], "question": m["question"],
            "price": round(cur, 4), "price_pct": round(cur * 100, 1),
            "volume": m["volume"], "volume24hr": m["volume24hr"],
            "d24h": round(d24, 2),
            "d7d": round(d7, 2),
            "momentum7d": round(_slope_per_day(week, 7) * 100, 3),
            "volatility": round(_volatility(day or week) * 100, 3),
            "direction": _direction(d7),
            "spark": _downsample(week, 60),          # 7-day sparkline
            "spark24h": _downsample(day or week, 60),  # 24-hour sparkline
            "day_points": len(day),
        })

    # Biggest sentiment movers.
    movers_7d = sorted(rows, key=lambda r: abs(r["d7d"]), reverse=True)[:18]
    movers_24h = sorted(rows, key=lambda r: abs(r["d24h"]), reverse=True)[:12]

    # Roll up by event: net absolute movement + the strongest riser/faller.
    events = {}
    for r in rows:
        e = events.setdefault(r["event"], {"event": r["event"], "slug": r["event_slug"],
                                           "markets": [], "abs_move_7d": 0.0})
        e["markets"].append(r)
        e["abs_move_7d"] += abs(r["d7d"])
    ev_list = []
    for e in events.values():
        ms = sorted(e["markets"], key=lambda r: r["price"], reverse=True)
        riser = max(e["markets"], key=lambda r: r["d7d"])
        faller = min(e["markets"], key=lambda r: r["d7d"])
        ev_list.append({
            "event": e["event"], "slug": e["slug"],
            "abs_move_7d": round(e["abs_move_7d"], 1),
            "leader": {"candidate": ms[0]["candidate"], "price_pct": ms[0]["price_pct"],
                       "d7d": ms[0]["d7d"]},
            "top_riser": {"candidate": riser["candidate"], "d7d": riser["d7d"],
                          "price_pct": riser["price_pct"]},
            "top_faller": {"candidate": faller["candidate"], "d7d": faller["d7d"],
                           "price_pct": faller["price_pct"]},
            "n_markets": len(e["markets"]),
        })
    ev_list.sort(key=lambda e: e["abs_move_7d"], reverse=True)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": markets["source"],
        "captured": markets["captured"],
        "n_markets": len(rows),
        "n_events": len(ev_list),
        "markets": rows,
        "movers_7d": movers_7d,
        "movers_24h": movers_24h,
        "events": ev_list,
    }


def write(out: dict, refresh_secs: int | None = None) -> None:
    if refresh_secs:
        out["refresh_secs"] = refresh_secs
    (DASH / "trends.json").write_text(json.dumps(out, indent=2, ensure_ascii=False),
                                      encoding="utf-8")
    (DASH / "trends.js").write_text("window.TRENDS = " + json.dumps(out, ensure_ascii=False) + ";",
                                    encoding="utf-8")


if __name__ == "__main__":
    write(build())
    print("wrote dashboard/trends.{json,js}")
