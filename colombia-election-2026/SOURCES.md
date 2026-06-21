# Sources & data provenance

All figures captured June 2026 for the 21 June 2026 presidential runoff.

## Live APIs used by the pipeline
- **Polymarket Gamma API** (public, no auth) — real-time market odds:
  https://gamma-api.polymarket.com/events?slug=colombia-presidential-election
  (verified live: de la Espriella ~83.5% / Cepeda ~17.5%, ~$39.8M volume).
- **Registraduría Nacional** — official preliminary count (configurable endpoint):
  https://resultados.registraduria.gov.co · https://estadisticaselectorales.registraduria.gov.co

## First-round results (31 May 2026) — `data/first_round.json`
- [2026 Colombian presidential election — Wikipedia](https://en.wikipedia.org/wiki/2026_Colombian_presidential_election)
- [CNN — Colombia presidency goes to runoff](https://www.cnn.com/2026/05/31/americas/colombia-runoff-espriella-cepeda-latam-intl)
- [WOLA — Five Outcomes of Colombia's First Round](https://www.wola.org/analysis/five-outcomes-of-colombias-first-round-presidential-elections/)

## Runoff polls — `data/polls.json`
- [Poll Tracker: Colombia's 2026 Election — AS/COA](https://www.as-coa.org/articles/poll-tracker-colombias-2026-presidential-election)
- [Anexo:Sondeos … 2026 — Wikipedia (es)](https://es.wikipedia.org/wiki/Anexo:Sondeos_de_intenci%C3%B3n_de_voto_para_las_elecciones_presidenciales_de_Colombia_de_2026)
- [colombia.com — últimas encuestas segunda vuelta](https://www.colombia.com/elecciones/2026/que-dicen-las-ultimas-encuestas-antes-de-la-segunda-vuelta-entre-cepeda-y-de-la-espriella-588057)
- [La Silla Vacía — AtlasIntel segunda vuelta](https://www.lasillavacia.com/en-vivo/atlas-intel-abelardo-se-impondria-por-7-puntos-en-segunda-vuelta/)
- [Cambio — qué muestran las encuestas](https://cambiocolombia.com/elecciones-colombia-2026/articulo/2026/6/que-muestran-las-encuestas-previas-a-la-segunda-vuelta-asi-esta-la-carrera-presidencial-entre-abelardo-de-la-espriella-e-ivan-cepeda)

## Vote-transfer & endorsements — `data/transfers.json`
- Paloma Valencia → de la Espriella; Samper/López → Cepeda; Peñalosa → de la Espriella
  (per Wikipedia 2026 article, endorsements section). Transfer percentages are
  modeled estimates anchored on bloc affinity and the reported ~76% Valencia→Espriella.

## Regional baseline — `data/regions.json`
- 2022 runoff geography (Petro 50.42% vs Hernández 47.35%; Petro won the Caribbean,
  Pacific and Bogotá, Hernández the Andean interior/Eje Cafetero/Llanos):
  [2022 Colombian presidential election — Wikipedia](https://en.wikipedia.org/wiki/2022_Colombian_presidential_election)
- Department `left_2022` shares and electorate `weight`s are estimates calibrated so
  the weighted national average matches the known 2022 two-way; refine with official
  department-level tables when ingesting the live feed.

## Polymarket — `data/polymarket.json`
- [Colombia Presidential Election — Polymarket](https://polymarket.com/event/colombia-presidential-election)
- Margin market buckets: [Runoff margin of victory](https://polymarket.com/event/colombia-presidential-election-runoff-margin-of-victory-20260604201910879)

## Context
- [Al Jazeera — What to know about Colombia's run-off](https://www.aljazeera.com/news/2026/6/18/continuity-or-change-what-to-know-about-colombias-run-off-election)
- [Congress.gov CRS — Colombia's 2026 Presidential Election](https://www.congress.gov/crs-product/IN12689)
