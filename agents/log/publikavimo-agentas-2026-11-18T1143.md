# publikavimo-agentas — 2026-11-18T1143

- paleidimas: #356 (manual)
- trukmė: 328s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub356/mk.py
│ @@ -0,0 +1,32 @@
│ +import pathlib
│ +
│ +src = pathlib.Path("/home/zoltanas/workspace/suprask/assets/js/progress.js").read_text(encoding="utf-8")
│ +src = src.replace(
│ +    'import { renameMap } from "./registry.js";',
│ +    'const renameMap = () => new Map([["03-sakinio-tvarka", "03-sakinio-zodziai"]]);',
│ +)
│ +probe = r"""
│ +/* ---- probe #356: ar pervadinimo žyma tikrai perkeliama ---- */
│ +const store = new Map();
│ +globalThis.localStorage = {
│ +  getItem: (k) => (store.has(k) ? store.get(k) : null),
│ +  setItem: (k, v) => store.set(k, String(v)),
│ +  removeItem: (k) => store.delete(k),
│ +};
│ +store.set("suprask:progress:v1", JSON.stringify({ modules: {
│ +  "03-sakinio-tvarka": { seen: 4, attempts: 6, total: 3, solved: [0, 1, 2], last: "2026-11-10T10:00:00Z", simDone: true },
│ +  "03-sakinio-zodziai": { seen: 2, attempts: 1, total: 3, solved: [0], last: "2026-11-12T09:00:00Z" },
│ +}, updated: null }));
│ +const before = JSON.parse(store.get("suprask:progress:v1")).modules;
│ +console.log("pries:", Object.keys(before).join(", "));
│ +console.log("isDone(naujas ID):", isDone("03-sakinio-zodziai"));
│ +const after = JSON.parse(store.get("suprask:progress:v1")).modules;
│ +console.log("po   :", Object.keys(after).join(", "));
│ +console.log("irasas:", JSON.stringify(after["03-sakinio-zodziai"]));
│ +console.log("senas raktas liko:", "03-sakinio-tvarka" in after);
│ +console.log("seen=4 (max, ne suma 6):", after["03-sakinio-zodziai"].seen === 4);
│ +console.log("solved=[0,1,2]:", JSON.stringify(after["03-sakinio-zodziai"].solved) === "[0,1,2]");
│ +console.log("simDone islaikytas:", after["03-sakinio-zodziai"].simDone === true);
│ +"""
│ +pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub356/p.mjs").write_text(src + probe, encoding="utf-8")
│ +print("ok")
│ scripts/check_published.py
│ @@ -238,6 +238,41 @@
│      for item in data.get("renames", []):
│          if item.get("from") and item.get("to"):
│              out[(int(item.get("grade", 0)), str(item["from"]))] = str(item["to"])
│ +    return out
│ +
│ +
│ +def renamed_from_map(grade: int) -> dict[str, str]:
│ +    """Senas ID → dabartinis, kaip jį mato **naršyklė** (klasės `index.json`).
│ +
│ +    Tai ne tas pats failas kaip `known_renames.json`. `known_renames.json` yra
│ +    vartų duomenys, kurių naršyklė neskaito; žymą perkelia `progress.js`
│ +    (`renameMap()` → `registry.js`, `migrate()`), o šaltinis jai — `renamed_from`
│ +    klasės indekse (KURINIO-STANDARTAS §7.1). Todėl įrankis, norėdamas pasakyti,
│ +    ar vaiko žyma bus perkelta, turi skaityti būtent indeksą.
│ +
│ +    Kodėl atsirado (#356): iki tol pranešimas kiekvienam priimtam pervadinimui
│ +    kietai rašė „alias mechanizmo nėra, žr. agents/proposals/“. Mechanizmas jau
│ +    buvo įdiegtas (`assets/js/progress.js:50–120`, `assets/js/registry.js:52–67`)
│ +    ir aprašytas standarte, o `index.json` jau turėjo `renamed_from` — vartai
│ +    kartojo pasenusį teiginį, o ne jį perskaičiavo (LL-21, LL-34). Pasekmė ne
│ +    kosmetinė: pagal tokią eilutę agentas kas kartą siūlytų darbą, kuris jau
│ +    padarytas, o skaitytojas manytų, kad vaiko pažanga prarasta.
│ +
│ +    Grąžinama tuščia, jei indekso perskaityti nepavyksta — tada pranešama
│ +    „nepatikrinta“, o ne „nėra“ (LL-37).
│ +    """
│ +    path = CONTENT / grade_dir(grade) / "index.json"
│ +    try:
│ +        data = json.loads(path.read_text(encoding="utf-8"))
│ +    except (OSError, json.JSONDecodeError):
│ +        return {}
│ +    out: dict[str, str] = {}
│ +    for strand in data.get("strands", []):
│ +        for mod in strand.get("modules", []):
│ +            new_id = mod.get("id")
│ +            for old in mod.get("renamed_from") or []:
│ +                if isinstance(old, str) and old and new_id and old != new_id:
│ +                    out[old] = new_id
│      return out
│
│
│ scripts/check_published.py
│ @@ -325,21 +325,32 @@
│
│
│  def vanished(grade: int, current_ids: list[str]) -> dict:
│ -    """Dingę ID su įpėdiniu, jei pervadinimas priimtas ir užregistruotas."""
│ +    """Dingę ID su įpėdiniu, jei pervadinimas priimtas ir užregistruotas.
│ +
│ +    Kiekvienam įrašui pridedama ir tai, ar žymą **realiai** perkelia naršyklė:
│ +    `alias` — kur veda `index.json` `renamed_from` (tuščia, jei nėra), o
│ +    `alias_ok` — ar tas pats įpėdinis, kaip `known_renames.json`. Be šių laukų
│ +    vartai neturėdavo kuo pagrįsti teiginio apie vaiko pažangą ir rašė kietai
│ +    įrašytą tekstą (#356, LL-21).
│ +    """
│      hist, note, checked = historical_ids(grade)
│      known = known_renames()
│ +    browser = renamed_from_map(grade)
│      cur = set(current_ids)
│      items: list[dict] = []
│      for mid, rev in sorted(hist.items()):
│          if mid in cur:
│              continue
│          successor = known.get((grade, mid), "")
│ +        alias = browser.get(mid, "")
│          items.append({
│              "grade": grade,
│              "id": mid,
│              "last_rev": rev,
│              "successor": successor,
│              "resolved": bool(successor) and successor in cur,
│ +            "alias": alias,
│ +            "alias_ok": bool(successor) and alias == successor,
│          })
│      return {"items": items, "note": note, "checked": checked}
│
│ scripts/check_published.py
│ @@ -705,6 +705,14 @@
│      unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
│      if unexplained:
│          reasons.append(f"{len(unexplained)} dingęs ID (pažanga liko be modulio)")
│ +    # Pervadinimas, kurio naršyklė neperkelia: `known_renames.json` sako
│ +    # „įpėdinis yra“, o `index.json` `renamed_from` neturi — žyma liktų
│ +    # našlaite. Tai ne tas pats kaip „mechanizmo nėra“ (#356), todėl
│ +    # tikrinama kiekvieno įrašo duomenimis, o ne prielaida.
│ +    orphan = [v for v in data.get("vanished_ids", [])
│ +              if v.get("resolved") and not v.get("alias_ok")]
│ +    if orphan:
│ +        reasons.append(f"{len(orphan)} pervadintas ID be alias (žyma liktų našlaite)")
│      if data.get("history_unchecked"):
│          reasons.append("dingusių ID patikra neįvyko")
│      if data.get("stale"):
│ scripts/check_published.py
│ @@ -800,9 +800,19 @@
│      if accepted:
│          print(f"Pervadinti ID, priimta ir užregistruota ({len(accepted)}):")
│          for v in accepted:
│ -            print(f"  - grade-{v['grade']:02d} {v['id']} → {v['successor']} "
│ -                  f"(registruota; žyma už seno ID vaiko naršyklėje LIEKA — "
│ -                  f"alias mechanizmo nėra, žr. agents/proposals/)")
│ +            succ = v["successor"]
│ +            if v.get("alias_ok"):
│ +                # Teiginys apie vaiko pažangą — iš duomenų, ne iš atminties:
│ +                # `index.json` `renamed_from` + `progress.js` migracija (LL-21).
│ +                state = (f"žyma perkeliama — index.json „{succ}“ turi "
│ +                         f"renamed_from, progress.js migruoja")
│ +            elif v.get("alias"):
│ +                state = (f"DĖMESIO: žyma NEBUS perkelta — index.json rodo į "
│ +                         f"„{v['alias']}“, o known_renames.json — į „{succ}“")
│ +            else:
│ +                state = (f"DĖMESIO: žyma liktų našlaite — index.json įraše "
│ +                         f"„{succ}“ nėra renamed_from")
│ +            print(f"  - grade-{v['grade']:02d} {v['id']} → {succ} ({state})")
│      if data.get("history_note"):
│          print(f"Dingusių ID patikros riba: {data['history_note']}")
│      if data["path_differs"]:
│ scripts/check_published.py
│ @@ -65,7 +65,19 @@
│      failu anksčiau davė rc 0 ir „sutampa“; dabar — `PASENĘS KODAS: 404.html`.
│    - `unpushed()` grąžina ir tai, ar patikra įvyko. Git klaida (šviežias klonas
│      be `origin/main`) anksčiau virsdavo „0 neišsiųstų“; dabar `verdict()` sako
│ -    „neišsiųstų commit'ų patikra neįvyko“ ir rc lieka 1.
│ +    „neišsiųtų commit'ų patikra neįvyko“ ir rc lieka 1.
│ +
│ +2026-11-18 (paleidimas #356): priimtas pervadinimas nebelaikomas „be alias“.
│ +  Pranešimas kiekvienam `vanished_ids` įrašui kietai rašė „alias mechanizmo
│ +  nėra, žr. agents/proposals/“, nors `assets/js/progress.js:50–120` jį turi,
│ +  `assets/js/registry.js:52–67` duoda žemėlapį, o `index.json` jau turi
│ +  `renamed_from` (KURINIO-STANDARTAS §7.1). Tai buvo teiginys apie vaiko
│ +  pažangą, kurio niekas neperskaičiavo (LL-21 / LL-34), ir jis kartojo darbą,
│ +  kuris jau padarytas. Dabar `renamed_from_map()` skaito būtent klasės
│ +  `index.json` (tą failą, kurį naršyklė ir įkelia), o pranešimas sako, ką
│ +  rado: „žyma perkeliama“ arba „DĖMESIO: žyma liktų našlaite“. Pervadinimas,
│ +  kuris yra `known_renames.json`, bet neturi `renamed_from` indekse, dabar
│ +  daro ir rc 1 (`verdict()`: „pervadintas ID be alias“).
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -65,7 +65,7 @@
│      failu anksčiau davė rc 0 ir „sutampa“; dabar — `PASENĘS KODAS: 404.html`.
│    - `unpushed()` grąžina ir tai, ar patikra įvyko. Git klaida (šviežias klonas
│      be `origin/main`) anksčiau virsdavo „0 neišsiųstų“; dabar `verdict()` sako
│ -    „neišsiųtų commit'ų patikra neįvyko“ ir rc lieka 1.
│ +    „neišsiųstų commit'ų patikra neįvyko“ ir rc lieka 1.
│
│  2026-11-18 (paleidimas #356): priimtas pervadinimas nebelaikomas „be alias“.
│    Pranešimas kiekvienam `vanished_ids` įrašui kietai rašė „alias mechanizmo
│ scripts/known_renames.json
│ @@ -1,5 +1,5 @@
│  {
│ -  "note": "Priimti (peržiūrėti, ne spėjami) modulių pervadinimai. Įrašas čia reiškia: senas ID dingo sąmoningai, naujas ID yra jo įpėdinis ir dabartiniame index.json egzistuoja. Tai NE atleidimas nuo pasekmės: vaiko localStorage žyma už seną ID lieka našlaitė, kol progress.js neturi alias mechanizmo (žr. agents/proposals/). Įrašo be įpėdinio rašyti negalima — dingęs ID be įpėdinio yra regresija, kurią check_published.py turi rodyti raudonai.",
│ +  "note": "Priimti (peržiūrėti, ne spėjami) modulių pervadinimai. Įrašas čia reiškia: senas ID dingo sąmoningai, naujas ID yra jo įpėdinis ir dabartiniame index.json egzistuoja. Tai NE alias duomenys: naršyklė šio failo neskaito. Žymą perkelia assets/js/progress.js (migrate(), žemėlapis iš registry.js renameMap()), o šaltinis jai — index.json laukas renamed_from tame pačiame įraše (KURINIO-STANDARTAS §7.1). Abu šaltiniai turi sutapti: jei įrašas yra čia, bet index.json neturi renamed_from, vaiko žyma lieka našlaite — ir scripts/check_published.py tai rodo kaip rc 1, o ne kaip „alias mechanizmo nėra“ (pataisyta #356; iki tol šis sakinys teigė, kad mechanizmo nėra, nors jis jau veikė). Įrašo be įpėdinio rašyti negalima — dingęs ID be įpėdinio yra regresija, kurią check_published.py turi rodyti raudonai.",
│    "renames": [
│      {
│        "grade": 1,
│ profiles/deepseek41flash/cache/scratch/pub356/zondas.py
│ @@ -0,0 +1,50 @@
│ +"""Neigiamas zondas #356: ar vartai pamato pervadinima be renamed_from.
│ +
│ +Tikro repo failai neliesti — `renamed_from_map` kvieciamas su laikinu
│ +CONTENT katalogu, o `verdict()` su sintetiniu duomenu rinkiniu.
│ +"""
│ +import importlib.util
│ +import json
│ +import pathlib
│ +import tempfile
│ +
│ +spec = importlib.util.spec_from_file_location(
│ +    "cp", "/home/zoltanas/workspace/suprask/scripts/check_published.py")
│ +cp = importlib.util.module_from_spec(spec)
│ +spec.loader.exec_module(cp)
│ +
│ +real = cp.renamed_from_map(1)
│ +print("tikras index.json ->", real)
│ +assert real.get("03-sakinio-tvarka") == "03-sakinio-zodziai", "alias nerastas realiame indekse"
│ +
│ +with tempfile.TemporaryDirectory() as tmp:
│ +    g = pathlib.Path(tmp) / "grade-01"
│ +    g.mkdir()
│ +    (g / "index.json").write_text(json.dumps({"strands": [{"modules": [
│ +        {"id": "03-sakinio-zodziai", "file": "x.json"}]}]}), encoding="utf-8")
│ +    cp.CONTENT = pathlib.Path(tmp)
│ +    stripped = cp.renamed_from_map(1)
│ +print("indeksas be renamed_from ->", stripped)
│ +assert stripped == {}, "turejo buti tuscia"
│ +
│ +# 1) priimtas pervadinimas be alias -> raudona
│ +data = {"vanished_ids": [{"grade": 1, "id": "03-sakinio-tvarka", "last_rev": "a2ad497",
│ +                          "successor": "03-sakinio-zodziai", "resolved": True,
│ +                          "alias": "", "alias_ok": False}]}
│ +v = cp.verdict(data)
│ +print("be alias verdict:", v["label"], "| ok:", v["ok"])
│ +assert v["ok"] is False
│ +
│ +# 2) alias rodo i kita moduli -> raudona
│ +data["vanished_ids"][0].update({"alias": "05-desimtukas", "alias_ok": False})
│ +v = cp.verdict(data)
│ +print("alias i kita ID:", v["label"], "| ok:", v["ok"])
│ +assert v["ok"] is False
│ +
│ +# 3) alias sutampa -> zalias (kiti raktai nustatyti kaip tikrame report)
│ +ok = {"vanished_ids": [{"grade": 1, "id": "03-sakinio-tvarka", "successor": "03-sakinio-zodziai",
│ +                        "resolved": True, "alias": "03-sakinio-zodziai", "alias_ok": True}],
│ +      "unpushed_checked": True, "unpushed_commits": 0}
│ +print("su alias verdict:", cp.verdict(ok)["label"], "| ok:", cp.verdict(ok)["ok"])
│ +assert cp.verdict(ok)["ok"] is True
│ +print("ZONDAS: VISI 3 ATVEJAI TEISINGI")
Sustabdau darbą čia (pasibaigė žingsniai) — bet tai, kas jau įrašyta į repo, yra tikras pataisymas, ne ataskaita.

KAS PADARYTA (failai repo, dar necommittinti):

1. `scripts/check_published.py` — vartai nebemeluoja apie vaiko pažangą.
   Radinys: kiekvieną paleidimą įrankis spausdindavo „žyma už seno ID LIEKA — alias mechanizmo nėra, žr. agents/proposals/“. Tai netiesa: `assets/js/progress.js:50–120` turi `migrate()`, `assets/js/registry.js:52–67` — `renameMap()`, `index.json` jau turi `renamed_from: ["03-sakinio-tvarka"]`, o KURINIO-STANDARTAS §7.1 tą mechanizmą aprašo. Tai LL-21/LL-34 klasės defektas — teiginys apie vaiko būseną, kurio niekas neperskaičiuoja.
   Pakeitimai:
   - nauja `renamed_from_map(grade)` — skaito būtent klasės `index.json` (failą, kurį įkelia naršyklė), ne `known_renames.json` (įrankių duomenis);
   - `vanished()` įrašai gauna `alias` ir `alias_ok`;
   - `verdict()` prideda priežastį „pervadintas ID be alias (žyma liktų našlaite)“ → rc 1, jei `known_renames.json` sako įpėdinį, o indekse `renamed_from` nėra;
   - pranešimas dabar sako, ką rado: „žyma perkeliama — index.json „03-sakinio-zodzi“ turi renamed_from, progress.js migruoja“;
   - modulio docstring papildytas #356 įrašu.

2. `scripts/known_renames.json` — `note` perrašytas: „alias nėra“ → „naršyklė šio failo neskaito; žymą perkelia progress.js, šaltinis — index.json renamed_from“.

ĮRODYMAI, gauti tikrais įrankiais:
- Migracija veikia — node zondas su tikru `progress.js` kodu: senas raktas `03-sakinio-tvarka` perkeltas ir ištrintas, `isDone` = true, `seen` 4 (max, ne suma 6), `solved`=[0,1,2], `simDone` išsaikytas.
- `python3 scripts/check_published.py` → rc 0: repo 42 / paskelbta 42, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, garsas 1262/1262 visi pasiekiami, `verdict.label` = sutampa, `unpushed_commits` 0, versija 156cafd7. Nauja eilutė spausdinama teisingai.
- Vartai: `validate_content.py --grade 1 --strict` 0/0 rc 0; `check_docs_facts.py` 0/0 rc 0; `check_audio.py --no-engine` 631 tekstas / 1262 įrašai rc 0; `check_registry.py` 9 kryptys · 42 moduliai · 183 užduotys · 0 našlaičių rc 0.
- Nebaigta: neigiamo zondo `zondas.py` (3 atvejai: be alias / alias į kitą ID / alias sutampa) paleidimas — failas paruoštas `~/.hermes/.../scratch/pub356/zondas.py`, bet neįvykdytas. Taip pat neįrašytas `research/wiki/changelog.md` įrašas #356 ir nepadarytas commit.

LIKO PADARYTI (jei bus dar žingsnių ar kito paleidimo):
- `python3 <scratch>/zondas.py` — patvirtinti tris `verdict()` atšakas;
- changelog įrašas viršuje: „2026-11-18 (…) — Publikavimo patikra #356: repo 42 / paskelbta 42, versija 156cafd7, garsas 1262/1262, alias teiginys pataisytas“;
- commit (be push — jį daro bėgiklis).

Sprendimas pagal baigties sąlygą: **ištaisyta** (scripts/check_published.py, scripts/known_renames.json), nepaisant to, kad pati publikavimo būsena — **sutampa** (42/42, 0 neišstumtų).

## klaidos

```
session_id: local-2781f0bec83ee354fb13ef630af63367d25ef1c9d2333e2075144fcded93ab74
```
