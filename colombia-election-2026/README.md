# Colombia 2026 — Análisis y Pronóstico de Segunda Vuelta

A self-contained system that analyzes Colombia's **2026 presidential runoff**
(21 June 2026, **Abelardo de la Espriella** vs. **Iván Cepeda**) and produces a
clear forecast — combining past-election geography, runoff polls, first-round
vote-transfer math, and **live Polymarket** odds, with a **live election-night
projection** that updates by department/region as voting tables are reported.

> Output is a **forecast**, not an official result. The official count is the
> Registraduría Nacional's.

## What it does

- **Weighted-blend ensemble forecast** of the two-way vote, with a Monte Carlo
  uncertainty band (50,000 sims).
- **Three "lines" / margin-of-error band**: `pro_cepeda`, `neutral`,
  `pro_abelardo` — both for the pre-election forecast and the live projection.
- **Live data via APIs**:
  - **Polymarket Gamma API** (public, no auth) for real-time market odds.
  - **Registraduría** preliminary count — configurable endpoint + a simulation
    mode so the full election-night pipeline runs before/while tables report.
- **Geographic segmentation**: 32 departments + Bogotá + Exterior, grouped into
  7 regions, with an election-night projection that blends reported tallies with
  a 2022-runoff baseline re-centred by the national swing.
- **Self-contained HTML dashboard** (hand-rolled SVG, no CDN) — opens from
  `file://`, reads `dashboard/forecast.js`.

## Layout

```
colombia-election-2026/
├── data/                     # inputs (JSON, editable)
│   ├── first_round.json      # May 31 first-round results (all candidates)
│   ├── polls.json            # runoff voting-intention polls
│   ├── polymarket.json       # market odds (refreshed by the live fetcher)
│   ├── transfers.json        # first-round → runoff vote-transfer matrix
│   ├── regions.json          # department weights + 2022 left-lean baseline
│   └── live_results.json     # (generated) partial count snapshot
├── pipeline/
│   ├── model.py              # ensemble forecast + Monte Carlo + 3 lines
│   ├── geo.py                # calibrated regional baseline loader
│   ├── fetch_polymarket.py   # live Gamma API fetcher
│   ├── fetch_registraduria.py# live count ingester / simulator
│   ├── live_projection.py    # election-night projection by region (3 lines)
│   └── run.py                # orchestrator → dashboard/forecast.{json,js}
└── dashboard/
    ├── index.html            # the dashboard
    └── forecast.js / .json   # (generated) model output
```

## Run

Requires only **Python 3.9+** (standard library — no pip installs).

```bash
cd colombia-election-2026/pipeline

# 1) Forecast only (uses data/*.json as-is)
python3 run.py

# 2) Refresh live Polymarket odds + project a simulated election night
python3 run.py --live --simulate 0.45      # ~45% of tables reported

# 3) Real official feed (when the Registraduría endpoint is known)
python3 run.py --live --endpoint "https://<host>/<path>/{dept}.json"

# 4) Auto-refresh every 5 minutes (election-night mode)
python3 run.py --live --watch 300                       # real feed once configured
python3 run.py --live --simulate 0.3 --watch 300        # demo: ramps the count each tick
```

Then open `dashboard/index.html` in a browser.

## Auto-refresh (every 5 minutes)

Two halves, both on a 5-minute cadence:

- **Backend** — `run.py --watch 300` re-pulls Polymarket + the count and
  rewrites `forecast.{json,js}` every 300s until Ctrl-C. In `--simulate` mode it
  also ramps the reported fraction each tick so the demo visibly progresses
  toward 100% counted.
- **Frontend** — the dashboard reloads itself on `refresh_secs` (default 300),
  showing a live `↻ mm:ss` countdown and the data timestamp. A full reload
  re-reads `forecast.js` from disk, so it works from `file://` and from a server.

Leave the watcher running and the open dashboard updates hands-free. To change
the interval, pass a different `--watch` value (the page picks it up from
`refresh_secs` on the next reload).

## Plugging in the real official count

The Registraduría's live portal (`resultados.registraduria.gov.co`) loads JSON
snapshots that refresh as `mesas` report, but there is no documented public API
spec and the endpoint only goes live during the count. So the ingester is
configurable:

- Set `--endpoint` (or `REG_RESULTS_ENDPOINT`) to a URL template; `{dept}` is
  substituted per department.
- Adapt **one** function — `parse_department()` in `fetch_registraduria.py` — to
  the live JSON shape (it already tries common key spellings and returns
  `{reported_pct, espriella_votes, cepeda_votes}`).
- With no endpoint reachable it falls back to the simulator, so the dashboard
  always has something to show.

## Methodology (forecast)

Everything is on one scale: **de la Espriella two-way share** =
`espriella / (espriella + cepeda)`.

| Signal | How it's built | Default weight |
|---|---|---|
| Polls | Recency (τ≈7d) × pollster grade × √sample; aggregate + systematic-error floor | 0.45 |
| Fundamentals | First-round votes + transfer matrix (Valencia→Espriella, López/Samper→Cepeda…), Monte Carlo over transfer uncertainty | 0.25 |
| Market | Polymarket-implied P(win) mapped to a central share | 0.30 |

A final Monte Carlo blends the three (plus a shared national-error term) into
`P(win)`, a median two-way share, credible intervals, margin buckets, and the
three scenario lines. Tunables live at the top of `model.py`.

## Live projection (election night)

For each department: LEFT (Cepeda) two-way share = reported actual (weight =
% tables reported) blended with an **expected** share for uncounted votes
(weight = remaining %), where expected = the calibrated **2022 Petro-vs-Hernández
baseline re-centred by the national swing** implied by the forecast. Rolled up by
electorate weight to a national projection, by region, with three lines that
**converge to the same point at 100% reported**.

See `SOURCES.md` for data provenance and citations.
