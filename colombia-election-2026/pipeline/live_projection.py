"""
Election-night live projection — with a three-line margin-of-error band.

Combines the official partial count (data/live_results.json) with the calibrated
regional baseline (geo.py) and the pre-election forecast to produce a live
national projection that updates as voting tables (`mesas`) report.

Three scenario lines are produced so the projection carries an explicit band:
  * neutral      — remaining (uncounted) vote breaks as the model expects;
  * pro_cepeda   — remaining vote leans toward Cepeda by SCENARIO_SHIFT;
  * pro_abelardo — remaining vote leans toward Espriella by SCENARIO_SHIFT.
Counted votes are fixed in every line; only the not-yet-reported share moves,
so the three lines converge as reporting approaches 100%.

Method per department: LEFT (Cepeda) two-way share = reported actual (weight =
reported_pct) blended with an EXPECTED share for uncounted votes (weight =
1 - reported_pct), where expected = 2022 baseline re-centred by national swing.
"""

from __future__ import annotations

import json
from pathlib import Path

from geo import load_geo

DATA = Path(__file__).resolve().parent.parent / "data"

# How far the remaining vote leans in the partisan scenarios (two-way share pts).
SCENARIO_SHIFT = 0.03


def _two_way_left(esp: int, cep: int) -> float | None:
    t = esp + cep
    return (cep / t) if t > 0 else None


def project(forecast_left: float) -> dict:
    geo = load_geo()
    departments = geo["departments"]
    live = json.loads((DATA / "live_results.json").read_text(encoding="utf-8"))
    swing = forecast_left - geo["national_left_2022"]
    reported = live["departments"]

    scenarios = {"pro_cepeda": SCENARIO_SHIFT, "neutral": 0.0, "pro_abelardo": -SCENARIO_SHIFT}
    proj = {k: 0.0 for k in scenarios}
    national_reported = 0.0
    counted_left_num = counted_votes = 0.0
    dept_rows, region_acc = [], {}

    for d in departments:
        name, w = d["name"], d["weight"]
        expected_left = max(0.02, min(0.98, d["left_2022_cal"] + swing))
        r = reported.get(name)
        if r:
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
        national_reported += w * p

        dept_rows.append({
            "department": name, "region": d["region"], "weight": round(w, 4),
            "reported_pct": round(p, 4),
            "expected_left": round(expected_left, 4),
            "actual_left": round(actual_left, 4) if actual_left is not None else None,
            "projected_left": round(line_vals["neutral"], 4),
            "espriella_votes": esp, "cepeda_votes": cep,
            "leader": ("cepeda" if line_vals["neutral"] > 0.5 else "espriella"),
        })

        acc = region_acc.setdefault(d["region"], {"w": 0.0, "proj": 0.0, "rep": 0.0,
                                                   "esp": 0, "cep": 0})
        acc["w"] += w
        acc["proj"] += w * line_vals["neutral"]
        acc["rep"] += w * p
        acc["esp"] += esp
        acc["cep"] += cep

    regions_out = sorted(
        [{
            "region": name,
            "color": geo["regions"].get(name, {}).get("color", "#888"),
            "projected_left": round(a["proj"] / a["w"], 4),
            "reported_pct": round(a["rep"] / a["w"], 4),
            "espriella_votes": a["esp"], "cepeda_votes": a["cep"],
            "leader": ("cepeda" if a["proj"] / a["w"] > 0.5 else "espriella"),
        } for name, a in region_acc.items()],
        key=lambda x: x["projected_left"], reverse=True)

    counted_left = (counted_left_num / counted_votes) if counted_votes else None

    def line(left_share):
        return {"cepeda_two_way": round(left_share * 100, 2),
                "espriella_two_way": round((1 - left_share) * 100, 2),
                "leader": ("cepeda" if left_share > 0.5 else "espriella")}

    return {
        "mode": live.get("mode"),
        "source": live.get("source"),
        "captured": live.get("captured"),
        "national_reported_pct": round(national_reported, 4),
        "scenario_shift_pts": SCENARIO_SHIFT * 100,
        "lines": {k: line(v) for k, v in proj.items()},
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
