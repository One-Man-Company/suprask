#!/usr/bin/env python3
"""Zondas `curriculum_backlog._merge()` — paleidžiamas įrodymas (LL-36, LL-199).

Kodėl šis failas egzistuoja
---------------------------
#42019 rado, kad `research/wiki/curriculum/backlog.json` 26.1.1 poziciją rodė
`partial`, nors du moduliai (`25-traumu-prevencija`, `38-traumu-prevencija`)
ją mokė ir abiejų `sources` citavo tą patį programos kodą. Blogesnė būsena po
sujungimo numesdavo įrodžiusius modulius, o `target` nukreipdavo į dar vieną
(trečią) modulį. Kiekvienas agento promptas tą klaidinantį užsakymą gaudavo
kasdien, ir tai kartojosi ne vieną paleidimą (`klausimai.md` užrašė bent tris
kartus).

Sutvarkius `_merge()`, teiginys „blogesnė būsena nebeužmaskuoja įrodyto
modulio“ negali likti vien docstring'e: zondas kviečia **tą pačią** funkciją,
kurią kviečia `build()`, ir tikrina abi kryptis.

  T1 įrodymas laimi: `covered` + jo moduliai, kai eilutės skiriasi
  T2 silpnesnė eilutė nepranyksta — prieštaravimas įrašomas `stale_claim`
  T3 prieštaravimas nemeluoja: `stale_claim` įvardija šaltinį ir būseną
  T4 `gap` nebelieka darbo užsakymu padengtai pozicijai
  T5 lygios būsenos + tuščias sąrašas → imamas antrosios eilutės sąrašas
  T6 silpnesnės eilutės moduliai NEPerimami, kai įrodymas jau yra
  T7 skirtingi programos kodai NĖRA sujungiami (`_same_position`)
  T8 reali repo būsena: 26.1.1 `covered`, `target` tuščias, abu moduliai
  T9 pozicijų skaičius nepakito (47), nė viena `covered` be modulių

Be tinklo, be git, be failų rašymo. Tinka CI ciklui `for f in probe_*.py`.

Naudojimas:
    python3 scripts/probe_backlog_merge.py      # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import sys
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(ROOT / "agents"))

import curriculum_backlog as cb  # noqa: E402

results: list[tuple[str, bool, str]] = []


def case(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'✔' if ok else 'KLAIDA'} {name} — {detail}")


def row(status: str, modules: list[str], key: str = "26.1.1",
        topic: str = "tema", section: str = "C. Pasaulio pažinimas",
        source: str = "zondas.md:1", gap: str = "") -> dict:
    out = {
        "key": key, "topic": topic, "status": status, "modules": list(modules),
        "section": section, "source": source, "sritis": "", "outcome": "",
        "strand": "pasaulio-pazinimas", "level": "", "interactivity": "",
        "svietimas": "", "target": "",
    }
    if gap:
        out["gap"] = gap
    return out


def main() -> int:
    # T1 — būsena geresnė, moduliai iš laimėjusios eilutės.
    dst = row("partial", ["08-metu-laikai", "19-dumai-ir-isejimas"],
              section="Ko platformoje nėra", source="zemelapis.md:62",
              gap="traumų temos nėra")
    src = row("covered", ["25-traumu-prevencija", "38-traumu-prevencija"],
              section="Ko platformoje nėra", source="pasaulio.md:174")
    cb._merge(dst, src)
    case("T1 įrodymas laimi",
         dst["status"] == "covered"
         and dst["modules"] == ["25-traumu-prevencija", "38-traumu-prevencija"],
         f"būsena {dst['status']}, moduliai {dst['modules']}")

    # T2 — prieštaravimas ne paslėptas, o įvardytas.
    claim = dst.get("stale_claim") or ""
    case("T2 prieštaravimas įrašytas",
         "partial" in claim and "zemelapis.md" in claim,
         f"stale_claim {claim[:110]}")

    # T4 — `gap` nebeliko darbo užsakymu.
    case("T4 padengtai pozicijai neliko 'gap'", not dst.get("gap"),
         f"gap {dst.get('gap')!r}")

    # T6 — silpnesnės eilutės sąrašas neperimamas (26.1.2 atvejis).
    dst2 = row("covered", ["30-dienos-rezimas-mityba"], key="26.1.2",
               section="Ko platformoje nėra", gap="režimo nėra")
    src2 = row("partial", ["04-kaip-zmones-sveikinasi", "09-augalo-gyvenimas"],
               key="26.1.2", topic="Sveikas gyvenimas")
    cb._merge(dst2, src2)
    case("T6 silpnesnė eilutė nepakeičia įrodyto sąrašo",
         dst2["modules"] == ["30-dienos-rezimas-mityba"],
         f"moduliai {dst2['modules']}")

    # T5 — lygios būsenos ir tuščias pirmosios sąrašas: imama antroji.
    dst3 = row("covered", [], key="26.4.1")
    src3 = row("covered", ["17-judejimas"], key="26.4.1")
    cb._merge(dst3, src3)
    case("T5 tuščias sąrašas užpildomas iš antros eilutės",
         dst3["modules"] == ["17-judejimas"], f"moduliai {dst3['modules']}")

    # T7 — skirtingi kodai nėra ta pati pozicija.
    same = cb._same_position({"key": "26.1.1"}, {"key": "26.1.1"})
    diff = cb._same_position({"key": "26.1.1"}, {"key": "26.1.2"})
    unkeyed = cb._same_position({"key": "C:saugus-elgesys"}, {"key": "26.1.1"})
    case("T7 skirtingi kodai atskiriami",
         same and not diff and unkeyed,
         f"tas pats {same}, skirtingi {diff}, be kodo {unkeyed}")

    # T8/T9 — reali repo būsena.
    data = cb.build(1)
    rows = {r["key"]: r for r in data["rows"]}
    p = rows.get("26.1.1")
    case("T8 26.1.1 padengta be target",
         p is not None and p["status"] == "covered"
         and not p.get("target")
         and "25-traumu-prevencija" in p["modules"]
         and "38-traumu-prevencija" in p["modules"],
         f"būsena {p['status'] if p else '—'}, target {p.get('target') if p else '—'}, "
         f"moduliai {p['modules'] if p else '—'}")
    empty = [r["key"] for r in data["rows"]
             if r["status"] == "covered" and not r.get("modules")]
    case("T9 47 pozicijų, nė viena 'covered' be modulių",
         data["curriculum_positions"] == 47 and not empty,
         f"pozicijų {data['curriculum_positions']}, be modulių {empty or '—'}")

    # T10 — neigiamoji kontrolė: sena taisyklė duotų kitą rezultatą.
    old = ("partial", ["08-metu-laikai", "19-dumai-ir-isejimas"])
    case("T10 sena taisyklė duotų kitą rezultatą (skirtumas tikras)",
         p is not None and old != (p["status"], p["modules"]),
         f"sena {old} ≠ nauja ({p['status']}, {p['modules']})" if p else "nera 26.1.1")

    # T11 — simetrija: sujungimas abiem kryptimis duoda tą patį. Be šito
    # prieštaravimas būdavo registruojamas tik tada, kai silpnesnė eilutė eina
    # ANTRA — o tvarka priklauso nuo to, kuri lentelė wiki faile pirma (LL-19).
    def fresh_pair() -> tuple[dict, dict]:
        return (row("partial", ["08-metu-laikai"], source="zemelapis.md:62",
                    section="Ko platformoje nėra", gap="trūksta"),
                row("covered", ["25-traumu-prevencija", "38-traumu-prevencija"],
                    source="pasaulio.md:174"))

    a1, b1 = fresh_pair()
    cb._merge(a1, b1)          # dst silpnesnė, src stipresnė
    a2, b2 = fresh_pair()
    cb._merge(b2, a2)          # dst stipresnė, src silpnesnė
    m1, m2 = a1, b2            # sujungimo rezultatas visada yra `dst`
    same_outcome = (m1["status"], m1["modules"]) == (m2["status"], m2["modules"]) == (
        "covered", ["25-traumu-prevencija", "38-traumu-prevencija"])
    case("T11 sujungimas simetriškas (tvarka nekeičia rezultato)",
         same_outcome and bool(m1.get("stale_claim")) and bool(m2.get("stale_claim")),
         f"silpna-dst {m1['status']}/{m1['modules']} claim={bool(m1.get('stale_claim'))}; "
         f"stipri-dst {m2['status']}/{m2['modules']} claim={bool(m2.get('stale_claim'))}")

    # T13 — kaltės adresas teisingas: programos LENTELĖS eilutė (oficialus temos
    # pavadinimas, `partial` dėl silpno žodžių sutapimo) NĖRA pasenęs teiginys —
    # jos negalima siųsti „taisyti“, kitaip vartai nurodo teisingą eilutę
    # (LL-21 atvirkščia kryptimi). `stale_claim` skirtas TIK „nėra“ teiginiui.
    table_row = row("partial", ["08-metu-laikai"], topic="Saugus elgesys",
                    section="C. Pasaulio pažinimas", source="pasaulio.md:85")
    strong_row = row("covered", ["25-traumu-prevencija", "38-traumu-prevencija"],
                     section="Ko platformoje nėra", source="pasaulio.md:174")
    cb._merge(table_row, strong_row)
    case("T13 programos lentelės eilutė nekaltinama kaip pasenusi",
         table_row["status"] == "covered" and not table_row.get("stale_claim"),
         f"būsena {table_row['status']}, stale_claim {table_row.get('stale_claim')!r}")

    # T14 — taisyklė taikoma VISOMS eilutėms, ne tam vienai (LL-40). Realus
    # repo šiandien tokių eilučių neturi (šaltinis sutvarkytas), todėl zondas
    # kuria tokią eilutę pats ir kviečia TĄ PAČIĄ `clear_stale_absence()`.
    probe_rows = [
        row("covered", ["22-medziai-krumai-zoles"], key="26.2.3",
            topic="medžiai", section="Ko platformoje nėra",
            source="zondas.md:1", gap=""),
        row("missing", [], key="D:testas", topic="testas"),
    ]
    probe_rows[0]["outcome"] = "modulio nėra; pasiūlymas X"
    fixed = cb.clear_stale_absence(probe_rows)
    case("T14 'nėra' tekstas pašalinamas tik iš covered eilutės",
         fixed == 1 and probe_rows[0]["outcome"] == ""
         and bool(probe_rows[0].get("stale_claim"))
         and probe_rows[1]["outcome"] == "" and not probe_rows[1].get("stale_claim"),
         f"pataisyta {fixed}, covered outcome {probe_rows[0]['outcome']!r}, "
         f"stale {bool(probe_rows[0].get('stale_claim'))}")
    lying = [r["key"] for r in data["rows"]
             if r["status"] == "covered" and cb._ABSENCE_RE.search(r.get("outcome") or "")]
    case("T14b realiame repo nė viena 'covered' neturi 'nėra' teksto", not lying,
         f"klaidingos: {lying or '—'}")

    # T15 — `_ABSENCE_RE` negaudo temos pavadinimo, tik nebuvimo teiginį.
    catches = [cb._ABSENCE_RE.search(x) is not None for x in
               ("modulio nėra", "traumų temos nėra", "yra tik gaisro dalis; temos nėra")]
    misses = [cb._ABSENCE_RE.search(x) is not None for x in
              ("Saugus elgesys", "padengta 25-traumu-prevencija")]
    case("T15 nebuvimo šablonas tikslus",
         all(catches) and not any(misses),
         f"gaudo {catches}, negaudo {misses}")

    # T12 — vartai įvardija, KURIS šaltinis pasikeitė (#42779). Be to raudoni
    # vartai praneša tik „pasenęs“, trys paleidimai iš eilės kartoja tą patį
    # neuždaromą įspėjimą, ir vartai moko juos apeiti (LL-159/LL-160).
    real = cb._source_files()
    if len(real) < 2:
        case("T12 vartai įvardija pasikeitusį failą", False,
             f"per mažai curriculum/*.md: {len(real)}")
    else:
        names = sorted(real)
        victim, untouched = names[0], names[1]
        fake = dict(real)
        fake[victim] = "deadbeefdeadbeef"
        changed = cb.changed_sources(real, fake)
        case("T12 vartai įvardija pasikeitusį failą",
             changed == [victim] and untouched not in changed
             and cb.changed_sources(real, real) == [],
             f"pakeista {victim} → {changed}; nepaliestas {untouched} neįvardytas")

    ok = sum(1 for _, good, _ in results if good)
    print(f"\n{ok}/{len(results)} lūkesčių išsipildė")
    return 0 if ok == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
