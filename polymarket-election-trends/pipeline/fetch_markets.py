"""
Discover election markets across Polymarket (public Gamma API, no auth).

Pulls the most active election EVENTS (tag `elections`, ordered by 24h volume),
then keeps the meaningful candidate MARKETS within each (current price above a
floor, capped per event).  Each market carries the CLOB token id needed to fetch
its price history later.

Output: data/markets.json

Usage:
    python pipeline/fetch_markets.py [--events 30] [--per-event 6] [--min-price 0.02]
"""

from __future__ import annotations

import argparse
import json
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

GAMMA = "https://gamma-api.polymarket.com/events"
DATA = Path(__file__).resolve().parent.parent / "data"


def _get(params: dict) -> list:
    url = GAMMA + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "pm-trends/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def _yes_token_and_price(market: dict):
    try:
        ids = json.loads(market.get("clobTokenIds") or "[]")
        prices = json.loads(market.get("outcomePrices") or "[]")
        return ids[0], float(prices[0])
    except (ValueError, IndexError, TypeError):
        return None, None


def fetch(n_events: int, per_event: int, min_price: float) -> dict:
    # Paginate through the elections tag, most-traded first.
    events, offset, page = [], 0, 100
    while len(events) < n_events * 2 and offset < 600:
        batch = _get({"closed": "false", "archived": "false", "tag_slug": "elections",
                      "order": "volume24hr", "ascending": "false",
                      "limit": page, "offset": offset})
        if not batch:
            break
        events.extend(batch)
        offset += page

    markets = []
    seen_events = []
    for ev in events:
        ev_markets = []
        for m in ev.get("markets", []):
            if m.get("closed") or not m.get("enableOrderBook", True):
                continue
            token, price = _yes_token_and_price(m)
            if token is None or price is None:
                continue
            ev_markets.append({
                "event": ev.get("title"),
                "event_slug": ev.get("slug"),
                "question": m.get("question"),
                "candidate": (m.get("groupItemTitle") or m.get("question") or "").strip(),
                "token": token,
                "price": round(price, 4),
                "volume": float(m.get("volume") or 0),
                "volume24hr": float(m.get("volume24hr") or 0),
            })
        # Keep meaningful markets: above price floor, else top-by-price; cap count.
        ev_markets.sort(key=lambda x: x["price"], reverse=True)
        keep = [m for m in ev_markets if m["price"] >= min_price][:per_event]
        if not keep and ev_markets:
            keep = ev_markets[:per_event]
        if keep:
            markets.extend(keep)
            seen_events.append({"title": ev.get("title"), "slug": ev.get("slug"),
                                "volume24hr": float(ev.get("volume24hr") or 0),
                                "n_markets_kept": len(keep)})
        if len(seen_events) >= n_events:
            break

    return {
        "source": "Polymarket Gamma API (tag=elections)",
        "captured": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "n_events": len(seen_events),
        "n_markets": len(markets),
        "events": seen_events,
        "markets": markets,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--events", type=int, default=30)
    ap.add_argument("--per-event", type=int, default=6)
    ap.add_argument("--min-price", type=float, default=0.02)
    args = ap.parse_args()
    out = fetch(args.events, args.per_event, args.min_price)
    (DATA / "markets.json").write_text(json.dumps(out, indent=2, ensure_ascii=False),
                                       encoding="utf-8")
    print(f"[markets] {out['n_markets']} markets across {out['n_events']} election events")
    for e in out["events"][:12]:
        print(f"  - {e['title'][:48]:48}  vol24 ${e['volume24hr']:,.0f}  ({e['n_markets_kept']} mkts)")


if __name__ == "__main__":
    main()
