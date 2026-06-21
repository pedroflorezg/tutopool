"""
Live results ingester — Registraduría Nacional (official preliminary count).

Colombia's official live-results portal (resultados.registraduria.gov.co) is
served by a front-end that loads JSON snapshots which are refreshed as voting
tables (`mesas`) are reported.  The Registraduría does NOT publish a stable,
documented public API spec, and the exact endpoint changes every election and
only goes live during the count.  So this module is built to be configurable:

  * Point it at the real endpoint with --endpoint (a URL template that may use
    {dept} for per-department scope) or the REG_RESULTS_ENDPOINT env var.
  * It expects, per department, a payload exposing reported-table percentage
    and the two candidates' votes.  The parser (`parse_department`) is the one
    place to adapt to whatever shape the live JSON has.
  * With no endpoint reachable it falls back to --simulate, which synthesises a
    plausible partial count from the regional baseline so the full pipeline and
    dashboard can be exercised before polls close.

Output: data/live_results.json  (consumed by live_projection.py / run.py)

Usage:
    python pipeline/fetch_registraduria.py --simulate 0.35
    python pipeline/fetch_registraduria.py --endpoint "https://host/path/{dept}.json"
"""

from __future__ import annotations

import argparse
import json
import os
import random
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"


# --------------------------------------------------------------------------- #
# Live endpoint parsing — ADAPT parse_department to the real JSON shape.
# --------------------------------------------------------------------------- #
def parse_department(payload: dict) -> dict | None:
    """Best-effort extraction from an official department payload.

    Tries a few common key spellings seen in Registraduría snapshots. Returns
    {reported_pct, espriella_votes, cepeda_votes} or None if unparseable.
    """
    def dig(d, *keys):
        for k in keys:
            if isinstance(d, dict) and k in d:
                return d[k]
        return None

    reported = dig(payload, "porcentajeMesas", "mesasInformadasPct",
                   "percent_reported", "reported_pct")
    cands = dig(payload, "candidatos", "candidates", "votos") or []
    esp = cep = None
    for c in cands if isinstance(cands, list) else []:
        name = (dig(c, "nombre", "name", "candidato") or "").lower()
        votes = dig(c, "votos", "votes", "total")
        if votes is None:
            continue
        if "espriella" in name:
            esp = int(votes)
        elif "cepeda" in name:
            cep = int(votes)
    if reported is None or esp is None or cep is None:
        return None
    pct = float(reported)
    if pct > 1:
        pct /= 100.0
    return {"reported_pct": round(pct, 4), "espriella_votes": esp, "cepeda_votes": cep}


def fetch_live(endpoint: str, departments: list[dict], timeout: int = 20) -> dict:
    results = {}
    for d in departments:
        name = d["name"]
        url = endpoint.format(dept=name.replace(" ", "%20"))
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "co-election-forecast/1.0"})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                payload = json.load(resp)
            parsed = parse_department(payload)
            if parsed:
                results[name] = parsed
        except Exception:
            continue
    if not results:
        raise RuntimeError("no department returned a parseable payload")
    return results


# --------------------------------------------------------------------------- #
# Simulation — plausible partial count for testing before/while polls report.
# --------------------------------------------------------------------------- #
def simulate(departments: list[dict], national_left_2022: float,
             national_reported: float, forecast_left: float,
             seed: int = 20260621) -> dict:
    """Synthesise per-department reported tallies.

    Models a realistic 'reporting curve': smaller/rural departments report
    earlier (and lean more right on election night), big urban ones lag.
    Each department's true left share = calibrated baseline + national swing + noise.
    """
    rng = random.Random(seed)
    swing = forecast_left - national_left_2022
    results = {}
    for d in departments:
        w = d["weight"]
        base = d.get("left_2022_cal", d["left_2022"])
        # Smaller weight => tends to report earlier; add jitter.
        earliness = (1 - min(w / 0.05, 1.0)) * 0.5 + 0.5
        rep = max(0.0, min(1.0, rng.gauss(national_reported * (0.6 + earliness), 0.18)))
        true_left = max(0.02, min(0.98, base + swing + rng.gauss(0, 0.02)))
        # Approximate department vote volume from weight (scaled electorate).
        dept_votes = int(w * 24_000_000)
        counted = int(dept_votes * rep)
        cep_votes = int(counted * true_left)
        esp_votes = counted - cep_votes
        results[d["name"]] = {
            "reported_pct": round(rep, 4),
            "espriella_votes": esp_votes,
            "cepeda_votes": cep_votes,
        }
    return results


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--endpoint", default=os.environ.get("REG_RESULTS_ENDPOINT"),
                    help="URL template for live department results; may use {dept}")
    ap.add_argument("--simulate", type=float, metavar="NATIONAL_REPORTED_FRACTION",
                    help="ignore the network and synthesise a partial count at this national %% reported (0-1)")
    ap.add_argument("--boletin", metavar="ESP,CEP,MESAS,LABEL",
                    help="record a REAL national boletín: de la Espriella%%, Cepeda%%, "
                         "%% mesas informadas, and a label, e.g. '41.8,56.76,0.09,Boletín 1'")
    args = ap.parse_args()

    # Real official national boletín (national-level, no per-department breakdown).
    if args.boletin:
        parts = [p.strip() for p in args.boletin.split(",")]
        esp_pct, cep_pct, mesas_pct = float(parts[0]), float(parts[1]), float(parts[2])
        label = parts[3] if len(parts) > 3 else "Boletín"
        out = {
            "source": "Registraduría Nacional (preconteo oficial)",
            "mode": f"OFICIAL — {label}",
            "captured": datetime.now(timezone.utc).isoformat(),
            "national": {
                "espriella_pct": esp_pct,
                "cepeda_pct": cep_pct,
                "mesas_pct": mesas_pct,
                "label": label,
            },
            "departments": {},
        }
        (DATA / "live_results.json").write_text(
            json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[registraduria] recorded official national {label}: "
              f"Espriella {esp_pct}% / Cepeda {cep_pct}% @ {mesas_pct}% mesas")
        return

    from geo import load_geo
    geo = load_geo()
    departments = geo["departments"]
    nat_2022 = geo["national_left_2022"]

    # Pull current forecast left share to centre expectations (fallback 0.467).
    fc_path = DATA.parent / "dashboard" / "forecast.json"
    forecast_left = 0.467
    if fc_path.exists():
        fc = json.loads(fc_path.read_text(encoding="utf-8"))
        forecast_left = fc["forecast"]["cepeda_two_way_median"] / 100.0

    mode = None
    results = None
    if args.endpoint and args.simulate is None:
        try:
            results = fetch_live(args.endpoint, departments)
            mode = f"live ({args.endpoint})"
        except Exception as exc:
            print(f"[registraduria] live fetch failed ({exc}); falling back to simulate 0.30")
            args.simulate = 0.30
    if results is None:
        frac = args.simulate if args.simulate is not None else 0.30
        results = simulate(departments, nat_2022, frac, forecast_left)
        mode = f"SIMULATED @ ~{frac*100:.0f}% national reported"

    out = {
        "source": "Registraduría Nacional (preliminary)" if "live" in (mode or "") else "Simulation",
        "mode": mode,
        "captured": datetime.now(timezone.utc).isoformat(),
        "departments": results,
    }
    (DATA / "live_results.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[registraduria] wrote live_results.json for {len(results)} departments — {mode}")


if __name__ == "__main__":
    main()
