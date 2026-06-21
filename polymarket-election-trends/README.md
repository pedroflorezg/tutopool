# Polymarket Election Sentiment Tracker

A single module that studies **election prediction markets across all of
Polymarket** to show **where public sentiment is moving**. It discovers the most
active election races worldwide, pulls each market's price history, and ranks the
biggest sentiment shifts — surfacing momentum the moment money starts moving.

> The Yes price of a market is its **market-implied probability**. "Sentiment"
> here means traded money, not an opinion poll.

## What it does

- **Discovers election markets globally** via the public Polymarket Gamma API
  (tag `elections`, ranked by 24h volume) — Colombia, US 2028, France, Peru,
  Romania/Bulgaria PMs, NY primaries, etc.
- **Pulls price history** for each market from the public CLOB API over two
  windows:
  - **Last 7 days**, hourly — the main trend & sparkline.
  - **Last 24 hours**, sampled **every ~10 minutes** — a denser intraday view.
- **Computes sentiment-movement metrics** per market: 24h / 7d change,
  7-day momentum (slope), volatility, and a direction label
  (`surging / rising / stable / falling / collapsing`).
- **Ranks the biggest movers** and rolls markets up by race (which race is
  moving most, who's rising, who's falling).
- **Self-contained dashboard** (hand-rolled SVG sparklines, no CDN) with a
  7-day ↔ 24-hour toggle and 5-minute auto-refresh.

## Layout

```
polymarket-election-trends/
├── pipeline/
│   ├── fetch_markets.py   # discover election events/markets (Gamma API)
│   ├── fetch_history.py   # week (hourly) + day (~10-min) price series (CLOB)
│   ├── trends.py          # movement metrics, movers, per-race rollup
│   └── run.py             # orchestrator → dashboard/trends.{json,js}
├── dashboard/
│   └── index.html         # the tracker (reads trends.js)
└── data/                  # regenerable raw cache (git-ignored)
```

## Run

Requires only **Python 3.9+** (standard library — no pip installs).

```bash
cd polymarket-election-trends/pipeline

python3 run.py                          # one full refresh
python3 run.py --events 24 --max-markets 60   # tune breadth
python3 run.py --no-fetch               # recompute trends from cached data
python3 run.py --watch 300              # auto-refresh every 5 minutes
```

Then open `dashboard/index.html`. Like the Colombia module, the page reloads
itself on `refresh_secs` (default 300) with a `↻ mm:ss` countdown; a full reload
re-reads `trends.js`, so it works from `file://` and from a server.

## Tuning

| Flag | Default | Meaning |
|---|---|---|
| `--events` | 24 | how many election races to track |
| `--per-event` | 6 | candidate markets kept per race |
| `--min-price` | 0.02 | drop near-zero longshots |
| `--max-markets` | 60 | cap on history fetches (bounds runtime) |
| `--week-fidelity` | 60 | minutes between weekly-series points |
| `--day-fidelity` | 10 | minutes between intraday points (24h view) |

## Data sources

- **Gamma API** (public, no auth) — market discovery:
  `https://gamma-api.polymarket.com/events?tag_slug=elections&order=volume24hr`
- **CLOB price-history** (public, no auth) — time series:
  `https://clob.polymarket.com/prices-history?market=<clobTokenId>&interval=1w|1d&fidelity=<min>`

This module is independent of the `colombia-election-2026` forecast module,
though both read the same Polymarket APIs.
