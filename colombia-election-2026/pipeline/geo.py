"""
Shared geographic baseline loader.

Department weights and `left_2022` shares are hand-estimated, so on their own
their electorate-weighted average does NOT exactly equal the known 2022 national
two-way (0.5157).  This module normalizes both so the geographic model is
internally consistent:

  * weights are rescaled to sum to 1.0;
  * every department's baseline is shifted by a constant so the weighted mean
    equals national_left_2022.

Returns the calibrated departments plus the regions metadata, used by both the
simulator and the live projection so they share one coherent baseline.
"""

from __future__ import annotations

import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"


def load_geo() -> dict:
    doc = json.loads((DATA / "regions.json").read_text(encoding="utf-8"))
    depts = [dict(d) for d in doc["departments"]]
    nat = doc["national_left_2022_two_way"]

    wsum = sum(d["weight"] for d in depts)
    for d in depts:
        d["weight"] = d["weight"] / wsum

    base_mean = sum(d["weight"] * d["left_2022"] for d in depts)
    offset = nat - base_mean
    for d in depts:
        d["left_2022_cal"] = max(0.02, min(0.98, d["left_2022"] + offset))

    return {
        "departments": depts,
        "regions": doc["regions"],
        "national_left_2022": nat,
        "baseline_offset": offset,
    }
