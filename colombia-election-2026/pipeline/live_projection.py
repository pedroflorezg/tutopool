"""
Election-night live projection — SWING-BASED, with a three-line band.

The core idea (what matters on election night): a reported voting unit is only
meaningful **relative to how that same unit voted in the past**, because early
tables are not a random sample.  So instead of trusting the raw running tally,
we:

  1. For each REPORTING unit, measure its swing vs. its own 2022 baseline
     (observed_swing_d = actual_left_d - baseline_left_d).
  2. Aggregate that into a national observed swing, vote-weighted.
  3. Blend it with the pre-election prior swing by REPRESENTATIVENESS — at a tiny
     fraction reported the observed swing is noise, so the prior dominates; as
     more (and more varied) units report, the observed swing takes over:
        applied_swing = w·observed + (1-w)·prior,  w = frac /(frac + PRIOR_K)
  4. Project the not-yet-reported units by applying `applied_swing` to THEIR
     baselines, and add the votes already counted.

This is why a 0.09% boletín showing Cepeda "ahead" barely moves the projection:
those few tables are compared to their past, found roughly on-trend (or from
atypical areas), and down-weighted accordingly.

Works on two input shapes in data/live_results.json:
  * per-department: {"departments": {dept: {reported_pct, espriella_votes, cepeda_votes}}}
  * national boletín: {"national": {espriella_pct, cepeda_pct, mesas_pct, label}}
"""

from __future__ import annotations

import json
from pathlib import Path

from geo import load_geo

DATA = Path(__file__).resolve().parent.parent / "data"

SCENARIO_SHIFT = 0.03   # two-way pts the unreported vote leans in the partisan lines
PRIOR_K = 0.15          # representativeness prior strength (in units of frac reported)


def _two_way_left(esp, cep):
    t = esp + cep
    return (cep / t) if t > 0 else None


def _line(left_share):
    return {"cepeda_two_way": round(left_share * 100, 2),
            "espriella_two_way": round((1 - left_share) * 100, 2),
            "leader": ("cepeda" if left_share > 0.5 else "espriella")}


def project(forecast_left: float) -> dict:
    geo = load_geo()
    departments = geo["departments"]
    nat_2022 = geo["national_left_2022"]
    live = json.loads((DATA / "live_results.json").read_text(encoding="utf-8"))
    prior_swing = forecast_left - nat_2022

    # ---- National boletín branch (no per-department breakdown available) ---- #
    nat = live.get("national")
    if nat and not live.get("departments"):
        esp_pct, cep_pct = nat["espriella_pct"], nat["cepeda_pct"]
        frac = max(0.0, min(1.0, nat["mesas_pct"] / 100.0))
        actual_left = cep_pct / (esp_pct + cep_pct)
        observed_swing = actual_left - nat_2022
        w_obs = frac / (frac + PRIOR_K)
        applied_swing = w_obs * observed_swing + (1 - w_obs) * prior_swing

        def proj_nat(extra=0.0):
            exp_unreported = max(0.02, min(0.98, nat_2022 + applied_swing + extra))
            return frac * actual_left + (1 - frac) * exp_unreported

        proj = {"pro_cepeda": proj_nat(SCENARIO_SHIFT),
                "neutral": proj_nat(0.0),
                "pro_abelardo": proj_nat(-SCENARIO_SHIFT)}
        # Regional expectation table (no actuals yet): baseline + applied swing.
        regions_out = _regions_from_expected(geo, applied_swing)
        return _assemble(live, frac, proj, actual_left,
                         observed_swing, applied_swing, w_obs, prior_swing,
                         n_reported_units=0, dept_rows=[], regions_out=regions_out,
                         note=f"national {nat.get('label','boletín')} only")

    # ---- Per-department branch (swing extracted from reporting depts) ------ #
    reported = live.get("departments", {})

    # Pass 1: observed swing from reporting departments (vote-weighted).
    obs_num = obs_den = 0.0
    frac_reported = 0.0
    n_reported = 0
    for d in departments:
        r = reported.get(d["name"])
        if not r or r.get("reported_pct", 0) <= 0:
            continue
        esp, cep = r["espriella_votes"], r["cepeda_votes"]
        al = _two_way_left(esp, cep)
        if al is None:
            continue
        votes = esp + cep
        obs_num += votes * (al - d["left_2022_cal"])
        obs_den += votes
        frac_reported += d["weight"] * r["reported_pct"]
        n_reported += 1
    observed_swing = (obs_num / obs_den) if obs_den > 0 else 0.0
    w_obs = frac_reported / (frac_reported + PRIOR_K)
    applied_swing = w_obs * observed_swing + (1 - w_obs) * prior_swing

    # Pass 2: project each department (reported actual + unreported via swing).
    scenarios = {"pro_cepeda": SCENARIO_SHIFT, "neutral": 0.0, "pro_abelardo": -SCENARIO_SHIFT}
    proj = {k: 0.0 for k in scenarios}
    counted_left_num = counted_votes = 0.0
    dept_rows, region_acc = [], {}

    for d in departments:
        name, w = d["name"], d["weight"]
        expected_left = max(0.02, min(0.98, d["left_2022_cal"] + applied_swing))
        r = reported.get(name)
        if r and r.get("reported_pct", 0) > 0:
            p = r["reported_pct"]
            esp, cep = r["espriella_votes"], r["cepeda_votes"]
            actual_left = _two_way_left(esp, cep)
            actual_left = expected_left if actual_left is None else actual_left
            counted_left_num += cep
            counted_votes += esp + cep
        else:
            p, esp, cep, actual_left = 0.0, 0, 0, None

        line_vals = {}
        for sk, shift in scenarios.items():
            exp = max(0.02, min(0.98, expected_left + shift))
            blended = p * (actual_left if actual_left is not None else exp) + (1 - p) * exp
            proj[sk] += w * blended
            line_vals[sk] = blended

        dept_rows.append({
            "department": name, "region": d["region"], "weight": round(w, 4),
            "reported_pct": round(p, 4),
            "baseline_left": round(d["left_2022_cal"], 4),
            "expected_left": round(expected_left, 4),
            "actual_left": round(actual_left, 4) if actual_left is not None else None,
            "swing_vs_past": round(actual_left - d["left_2022_cal"], 4) if actual_left is not None and p > 0 else None,
            "projected_left": round(line_vals["neutral"], 4),
            "espriella_votes": esp, "cepeda_votes": cep,
            "leader": ("cepeda" if line_vals["neutral"] > 0.5 else "espriella"),
        })
        acc = region_acc.setdefault(d["region"], {"w": 0.0, "proj": 0.0, "rep": 0.0,
                                                   "esp": 0, "cep": 0})
        acc["w"] += w; acc["proj"] += w * line_vals["neutral"]
        acc["rep"] += w * p; acc["esp"] += esp; acc["cep"] += cep

    regions_out = sorted(
        [{"region": name, "color": geo["regions"].get(name, {}).get("color", "#888"),
          "projected_left": round(a["proj"] / a["w"], 4),
          "reported_pct": round(a["rep"] / a["w"], 4),
          "espriella_votes": a["esp"], "cepeda_votes": a["cep"],
          "leader": ("cepeda" if a["proj"] / a["w"] > 0.5 else "espriella")}
         for name, a in region_acc.items()],
        key=lambda x: x["projected_left"], reverse=True)

    counted_left = (counted_left_num / counted_votes) if counted_votes else None
    return _assemble(live, frac_reported, proj, counted_left,
                     observed_swing, applied_swing, w_obs, prior_swing,
                     n_reported_units=n_reported, dept_rows=dept_rows,
                     regions_out=regions_out, note="per-department")


def _regions_from_expected(geo, applied_swing):
    acc = {}
    for d in geo["departments"]:
        exp = max(0.02, min(0.98, d["left_2022_cal"] + applied_swing))
        a = acc.setdefault(d["region"], {"w": 0.0, "proj": 0.0})
        a["w"] += d["weight"]; a["proj"] += d["weight"] * exp
    return sorted(
        [{"region": name, "color": geo["regions"].get(name, {}).get("color", "#888"),
          "projected_left": round(a["proj"] / a["w"], 4), "reported_pct": 0.0,
          "espriella_votes": 0, "cepeda_votes": 0,
          "leader": ("cepeda" if a["proj"] / a["w"] > 0.5 else "espriella")}
         for name, a in acc.items()],
        key=lambda x: x["projected_left"], reverse=True)


def _assemble(live, frac, proj, counted_left, observed_swing, applied_swing,
              w_obs, prior_swing, n_reported_units, dept_rows, regions_out, note):
    return {
        "mode": live.get("mode"),
        "source": live.get("source"),
        "captured": live.get("captured"),
        "method": "swing vs. past baseline (representativeness-weighted)",
        "note": note,
        "national_reported_pct": round(frac, 6),
        "n_reported_units": n_reported_units,
        "scenario_shift_pts": SCENARIO_SHIFT * 100,
        "swing": {
            "observed_left_pts": round(observed_swing * 100, 2),
            "prior_left_pts": round(prior_swing * 100, 2),
            "applied_left_pts": round(applied_swing * 100, 2),
            "observed_weight": round(w_obs, 4),
        },
        "lines": {k: _line(v) for k, v in proj.items()},
        "projected_cepeda_two_way": round(proj["neutral"] * 100, 2),
        "projected_espriella_two_way": round((1 - proj["neutral"]) * 100, 2),
        "projected_leader": ("cepeda" if proj["neutral"] > 0.5 else "espriella"),
        "counted_only_cepeda_two_way": round(counted_left * 100, 2) if counted_left else None,
        "counted_only_espriella_two_way": round((1 - counted_left) * 100, 2) if counted_left else None,
        "departments": dept_rows,
        "regions": regions_out,
    }


if __name__ == "__main__":
    fc = json.loads((DATA.parent / "dashboard" / "forecast.json").read_text(encoding="utf-8"))
    out = project(fc["forecast"]["cepeda_two_way_median"] / 100.0)
    print(json.dumps({k: v for k, v in out.items() if k != "departments"},
                     indent=2, ensure_ascii=False))
