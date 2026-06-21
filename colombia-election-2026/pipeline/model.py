"""
Weighted-blend ensemble forecast for the Colombia 2026 presidential runoff.

Three independent signals are combined:
  1. Recency / grade / sample-size weighted poll average.
  2. First-round result + vote-transfer "fundamentals" model.
  3. Polymarket-implied probability.

Everything is expressed as the TWO-WAY vote share for de la Espriella
(share = espriella / (espriella + cepeda)), so the three signals are on the
same scale and can be blended.  A Monte Carlo simulation propagates the
uncertainty of each signal (plus a shared systematic-error term that models a
collective polling miss) into a final win probability and credible interval.

Pure standard library — no numpy/pandas required.
"""

from __future__ import annotations

import json
import math
import random
from datetime import date
from pathlib import Path
from statistics import NormalDist

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RUNOFF_DATE = date(2026, 6, 21)

# Blend weights for the three signals (must sum to 1.0).
WEIGHTS = {"polls": 0.45, "fundamentals": 0.25, "market": 0.30}

# Tunable model constants.
RECENCY_TAU_DAYS = 7.0       # exponential decay half-life-ish for poll recency
GRADE_WEIGHT = {"A": 1.0, "B": 0.7, "C": 0.4}
POLL_SYSTEMATIC_SD = 0.025   # floor on poll-signal sd (collective house effect)
MARKET_SD = 0.030            # spread implied around the market's central share
COMMON_ERROR_SD = 0.020      # shared national error across all signals
N_SIMS = 50000
SEED = 20260621

_norm = NormalDist()


# --------------------------------------------------------------------------- #
# Data loading
# --------------------------------------------------------------------------- #
def load(name: str) -> dict:
    with open(DATA_DIR / name, encoding="utf-8") as fh:
        return json.load(fh)


def _two_way(esp: float, cep: float) -> float:
    return esp / (esp + cep)


# --------------------------------------------------------------------------- #
# Signal 1 — recency/grade/sample weighted poll average
# --------------------------------------------------------------------------- #
def poll_signal(polls_doc: dict) -> dict:
    polls = polls_doc["polls"]
    ns = [p.get("n", 1000) for p in polls]
    median_n = sorted(ns)[len(ns) // 2]

    rows = []
    for p in polls:
        d_end = date.fromisoformat(p["date_end"])
        days_before = (RUNOFF_DATE - d_end).days
        recency = math.exp(-days_before / RECENCY_TAU_DAYS)
        grade = GRADE_WEIGHT.get(p.get("grade", "C"), 0.4)
        size = min(math.sqrt(p.get("n", 1000) / median_n), 1.5)
        weight = recency * grade * size
        share = _two_way(p["espriella"], p["cepeda"])
        rows.append({**p, "two_way": share, "weight": weight,
                     "days_before": days_before})

    wsum = sum(r["weight"] for r in rows)
    mean = sum(r["two_way"] * r["weight"] for r in rows) / wsum

    # Between-poll dispersion (weighted) + sampling error of the aggregate.
    var_between = sum(r["weight"] * (r["two_way"] - mean) ** 2 for r in rows) / wsum
    eff_n = sum(r.get("n", 1000) * r["weight"] for r in rows) / wsum
    var_sampling = mean * (1 - mean) / eff_n
    sd = math.sqrt(var_between + var_sampling + POLL_SYSTEMATIC_SD ** 2)

    return {
        "name": "Recency-weighted polls",
        "mu": mean,
        "sd": sd,
        "n_polls": len(rows),
        "detail": sorted(
            [{"pollster": r["pollster"], "date_end": r["date_end"],
              "two_way": round(r["two_way"], 4), "weight": round(r["weight"], 4),
              "days_before": r["days_before"]} for r in rows],
            key=lambda x: x["days_before"],
        ),
    }


# --------------------------------------------------------------------------- #
# Signal 2 — first-round + vote-transfer fundamentals (Monte Carlo)
# --------------------------------------------------------------------------- #
def fundamentals_signal(first_doc: dict, transfers_doc: dict, rng: random.Random) -> dict:
    cands = first_doc["candidates"]
    by_name = {c["name"]: c for c in cands}
    esp_base = by_name["Abelardo de la Espriella"]["votes"]
    cep_base = by_name["Iván Cepeda"]["votes"]

    tmatrix = transfers_doc["transfers"]
    retention = transfers_doc["base_retention"]
    losers = [c for c in cands
              if c["runoff"] is None and c["bloc"] != "blank"]

    def simulate_once() -> float:
        ret = max(0.80, min(1.0, rng.gauss(retention["espriella"], retention["sd"])))
        ret_c = max(0.80, min(1.0, rng.gauss(retention["cepeda"], retention["sd"])))
        esp = esp_base * ret
        cep = cep_base * ret_c
        for c in losers:
            t = tmatrix.get(c["name"], tmatrix["_default"])
            esp_share = max(0.0, min(1.0, rng.gauss(t["to_espriella"], t["sd"])))
            # Remaining (non-Espriella) mass split between Cepeda and abstain,
            # preserving the modeled cepeda:abstain ratio.
            rest = 1.0 - esp_share
            denom = t["to_cepeda"] + t["abstain"]
            cep_share = rest * (t["to_cepeda"] / denom) if denom > 0 else 0.0
            esp += c["votes"] * esp_share
            cep += c["votes"] * cep_share
        return _two_way(esp, cep)

    draws = [simulate_once() for _ in range(8000)]
    mu = sum(draws) / len(draws)
    sd = math.sqrt(sum((d - mu) ** 2 for d in draws) / len(draws))

    # Deterministic point estimate (mean transfers, full retention) for display.
    esp = esp_base * retention["espriella"]
    cep = cep_base * retention["cepeda"]
    contrib = []
    for c in losers:
        t = tmatrix.get(c["name"], tmatrix["_default"])
        e = c["votes"] * t["to_espriella"]
        cp = c["votes"] * t["to_cepeda"]
        esp += e
        cep += cp
        contrib.append({"name": c["name"], "votes": c["votes"],
                        "to_espriella": t["to_espriella"], "to_cepeda": t["to_cepeda"]})

    return {
        "name": "First-round + vote transfer",
        "mu": mu,
        "sd": max(sd, 0.015),
        "point_two_way": _two_way(esp, cep),
        "projected_espriella_votes": round(esp),
        "projected_cepeda_votes": round(cep),
        "transfers": contrib,
    }


# --------------------------------------------------------------------------- #
# Signal 3 — Polymarket-implied two-way share
# --------------------------------------------------------------------------- #
def market_signal(poly_doc: dict) -> dict:
    p_win = poly_doc["winner_market"]["espriella"]
    p_win_norm = p_win / (p_win + poly_doc["winner_market"]["cepeda"])
    # If share ~ N(mu, MARKET_SD) and P(share > 0.5) = p_win, solve for mu.
    mu = 0.5 + MARKET_SD * _norm.inv_cdf(p_win_norm)
    return {
        "name": "Polymarket-implied",
        "mu": mu,
        "sd": MARKET_SD,
        "p_win_input": p_win,
        "p_win_normalized": p_win_norm,
    }


# --------------------------------------------------------------------------- #
# Ensemble Monte Carlo
# --------------------------------------------------------------------------- #
def ensemble(signals: dict, rng: random.Random) -> dict:
    keys = ["polls", "fundamentals", "market"]
    shares = []
    for _ in range(N_SIMS):
        common = rng.gauss(0, COMMON_ERROR_SD)  # shared systematic miss
        blended = 0.0
        for k in keys:
            s = signals[k]
            draw = rng.gauss(s["mu"], s["sd"])
            blended += WEIGHTS[k] * draw
        shares.append(blended + common)

    shares.sort()
    n = len(shares)

    def pct(q: float) -> float:
        return shares[min(n - 1, int(q * n))]

    median = shares[n // 2]
    p_win = sum(1 for s in shares if s > 0.5) / n
    margin_pts = (median - (1 - median)) * 100  # two-way margin in points

    # Three margin-of-error lines, expressed as Espriella two-way share.
    # pro_abelardo = Espriella-favorable edge; pro_cepeda = Cepeda-favorable edge.
    def line(esp_share):
        return {"espriella_two_way": round(esp_share * 100, 2),
                "cepeda_two_way": round((1 - esp_share) * 100, 2),
                "margin_points": round((esp_share - (1 - esp_share)) * 100, 2),
                "leader": ("espriella" if esp_share > 0.5 else "cepeda")}
    lines = {
        "pro_cepeda": line(pct(0.15)),
        "neutral": line(median),
        "pro_abelardo": line(pct(0.85)),
    }

    # Margin distribution buckets (Espriella two-way margin in points).
    def margin(s):
        return (s - (1 - s)) * 100
    buckets = {"Cepeda wins": 0, "Espriella 0-5": 0, "Espriella 5-10": 0, "Espriella 10+": 0}
    for s in shares:
        m = margin(s)
        if m <= 0:
            buckets["Cepeda wins"] += 1
        elif m < 5:
            buckets["Espriella 0-5"] += 1
        elif m < 10:
            buckets["Espriella 5-10"] += 1
        else:
            buckets["Espriella 10+"] += 1
    buckets = {k: round(v / n, 4) for k, v in buckets.items()}

    return {
        "p_espriella_win": round(p_win, 4),
        "p_cepeda_win": round(1 - p_win, 4),
        "espriella_two_way_median": round(median * 100, 2),
        "cepeda_two_way_median": round((1 - median) * 100, 2),
        "margin_points_median": round(margin_pts, 2),
        "lines": lines,
        "ci80": [round(pct(0.10) * 100, 2), round(pct(0.90) * 100, 2)],
        "ci95": [round(pct(0.025) * 100, 2), round(pct(0.975) * 100, 2)],
        "margin_buckets": buckets,
    }


# --------------------------------------------------------------------------- #
# Orchestration
# --------------------------------------------------------------------------- #
def build_forecast() -> dict:
    rng = random.Random(SEED)
    first = load("first_round.json")
    polls = load("polls.json")
    poly = load("polymarket.json")
    transfers = load("transfers.json")

    signals = {
        "polls": poll_signal(polls),
        "fundamentals": fundamentals_signal(first, transfers, rng),
        "market": market_signal(poly),
    }
    result = ensemble(signals, rng)

    return {
        "generated_at": date.today().isoformat(),
        "runoff_date": RUNOFF_DATE.isoformat(),
        "candidates": {
            "espriella": {"name": "Abelardo de la Espriella", "bloc": "right",
                          "color": "#c0392b"},
            "cepeda": {"name": "Iván Cepeda", "bloc": "left (Pacto Histórico)",
                       "color": "#e67e22"},
        },
        "weights": WEIGHTS,
        "signals": {
            k: {**v, "mu_pct": round(v["mu"] * 100, 2),
                "sd_pct": round(v["sd"] * 100, 2)}
            for k, v in signals.items()
        },
        "forecast": result,
        "first_round": first,
        "polls": polls,
        "polymarket": poly,
    }


if __name__ == "__main__":
    print(json.dumps(build_forecast()["forecast"], indent=2, ensure_ascii=False))
