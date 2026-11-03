# Šaltiniai

Čia laikomi oficialūs dokumentai, iš kurių kurtas platformos turinys. Repo saugomi **išgauti tekstai** (`.txt`), o ne PDF — taip repas lengvesnis, o tekstą galima greitai tikrinti.

## Failai

| Failas | Kas tai | Oficialus adresas |
|---|---|---|
| `kelrodis-istplestine.txt` | „Švietimo kelrodis 2035“, išplėstinė versija (Švietimas #1, 2026) | https://kelrodis.svietimas.lt/pdf/svietimo-kelrodis-isplestine-versija-2026.pdf |
| `kelrodis-trumpoji.txt` | „Švietimo kelrodis 2035“, trumpoji versija | https://kelrodis.svietimas.lt/pdf/svietimo-kelrodis-trumpoji-versija-2026.pdf |
| `pradinio-bp-rekomendacijos-2024.txt` | NŠA „Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos“ (864 p.) | https://emokykla.lt/upload/files/2024/09/30/t2024-09-26-pradinio-ugdymo-bendruju-programu-igyvendinimo-rekomendacijos-1.pdf |

## Kaip atnaujinti

```bash
python3 -m venv .venv && env -u PYTHONPATH .venv/bin/pip install pypdf
# atsisiųsk PDF į sources/ ir paleisk:
env -u PYTHONPATH .venv/bin/python - <<'PY'
from pypdf import PdfReader
from pathlib import Path
for pdf in Path("sources").glob("*.pdf"):
    txt = "\n".join((p.extract_text() or "") for p in PdfReader(str(pdf)).pages)
    pdf.with_suffix(".txt").write_text(txt, encoding="utf-8")
PY
```

## Pastaba apie prieigą

`e-seimas.lrs.lt` (bendrųjų programų priedai) yra už Cloudflare apsaugos — tiesioginis `curl` grąžina `Just a moment…`. Jei reikia konkretaus priedo teksto, naudok naršyklę arba `r.jina.ai` relę; nepavykkus — tai fiksuojama kaip apribojimas, o ne apeinama.
