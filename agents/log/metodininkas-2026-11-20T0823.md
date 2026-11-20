# metodininkas — 2026-11-20T0823

- paleidimas: #394 (manual)
- trukmė: 905s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/m394/kieta-vandens-forma.json
│ @@ -0,0 +1,98 @@
│ +{
│ +  "id": "24-kieta-vandens-forma",
│ +  "grade": 1,
│ +  "strand": "pasaulio-pazinimas",
│ +  "title": "Kieta forma: tas pats vanduo",
│ +  "subtitle": "Ledas, šerkšnas ir snaigė — vienas vanduo",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Pasakau, kad ledas ir šerkšnas yra vanduo.",
│ +    "Parodau, kad pasikeitus forma vandens lieka tiek pat.",
│ +    "Paaiškinu, kodėl kieta forma būna skirtinga."
│ +  ],
│ +  "concept": {
│ +    "title": "Tas pats vanduo, kita forma",
│ +    "big_idea": "Ledas, šerkšnas ir snaigė atrodo kitaip negu vanduo. Bet tai tas pats vanduo, tik sušalęs. Forma pasikeičia, o vanduo lieka.",
│ +    "steps": [
│ +      "Įpilk vieną puodelį vandens. Vandens lygis pasiekia žymą.",
│ +      "Užšaldyk. Vanduo sustingo į formą. Puodelis liko tuščias.",
│ +      "Ištirpk. Vanduo grįžo į puodelį ir vėl pasiekė žymą.",
│ +      "Trys formos, o vandens visur tiek pat."
│ +    ],
│ +    "example": "Žiemą ant tvoros buvo šerkšnas. Ryte saulė pašildė, ir ant tvoros liko lašai."
│ +  },
│ +  "sim": {
│ +    "component": "kieta-forma",
│ +    "config": {
│ +      "level": 5,
│ +      "forms": [
│ +        { "id": "kubas", "name": "ledas", "shape": "kubas" },
│ +        { "id": "snaige", "name": "snaigė", "shape": "zvaigzde" },
│ +        { "id": "serksnas", "name": "šerkšnas", "shape": "plokste" }
│ +      ],
│ +      "sentences": {
│ +        "start": "Pasirink formą ir įpilk vandenį.",
│ +        "poured": "Vandens lygis pasiekia žymą.",
│ +        "guess1": "Ar ištirpus vandens bus tiek pat?",
│ +        "frozen": "Vanduo sustingo į šią formą.",
│ +        "melted": "Vėl ta pati žyma.",
│ +        "guess2": "Ar ši forma yra vanduo?",
│ +        "all": "Trys formos, vienas vanduo.",
│ +        "again": "Pradedam iš naujo."
│ +      }
│ +    }
│ +  },
│ +  "tasks": [
│ +    {
│ +      "q": "Ant tvenkinio žiemą buvo kieta danga. Pavasarį ten vėl vanduo. Kas buvo ta danga?",
│ +      "options": ["Ledas", "Akmuo", "Smėlis"],
│ +      "answer": 0,
│ +      "hint": "Pagalvok, kas nutinka vandeniui šaltyje.",
│ +      "why": "Tvenkinio danga buvo sušalęs vanduo. Šilumoje jis ištirpo."
│ +    },
│ +    {
│ +      "q": "Iš vieno puodelio padarė storą kubą ir ploną plokštę. Kuri forma duos daugiau vandens?",
│ +      "options": ["Plokštė, nes ji didesnė", "Abi formos duoda tiek pat", "Kubas, nes jis storesnis"],
│ +      "answer": 1,
│ +      "hint": "Prisimink, kiek vandens įpylei prieš šaldymą.",
│ +      "why": "Forma buvo kita, o vanduo tas pats. Kiekis nepakito."
│ +    },
│ +    {
│ +      "q": "Šerkšnas ant lango atšilo ir virto lašais. Kas buvo šerkšnas?",
│ +      "options": ["Dulkės nuo stiklo", "Stiklo dažai", "Sušalęs vanduo"],
│ +      "answer": 2,
│ +      "hint": "Palauk, kol jis ištirps, ir pažiūrėk, kas lieka.",
│ +      "why": "Šerkšnas yra smulkus ledas. Jis atšilo ir virto vandeniu."
│ +    },
│ +    {
│ +      "q": "Sniego pusnis ištirpo, o bala liko maža. Kodėl?",
│ +      "options": ["Sniege buvo daug oro", "Sniegas nebuvo vanduo", "Šaltis sugėrė vandenį"],
│ +      "answer": 0,
│ +      "hint": "Pagalvok, kas yra tarp snaigių pusnyje.",
│ +      "why": "Sniege tarp snaigių yra oro. Todėl vandens lieka mažiau, bet jis vanduo.",
│ +      "optional": true
│ +    }
│ +  ],
│ +  "reflect": "Kur esi matęs šerkšną? Kas lieka, kai jis ištirpsta?",
│ +  "teacher": {
│ +    "goal": "Suprasti, kad kieta vandens būsena gali būti labai skirtingų formų, o pats vanduo ir jo kiekis nesikeičia. Modelis lygina tris formas su ta pačia puodelio žyma.",
│ … omitted 20 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/m394/probe.py
│ @@ -0,0 +1,61 @@
│ +#!/usr/bin/env python3
│ +"""M-12 juodraščio patikra abiem vartais (validate_content + check_language).
│ +
│ +Failas NERA rašomas į content/ — imamas scratch juodraštis, o kelias
│ +sudaromas taip, lyg modulis jau būtų savo vietoje, kad abu tikrintuvai
│ +matytų tą pačią vietą ir tuos pačius taisyklių kelius (LL-40: zondas
│ +tikrina tą ruožą, kuris bus publikuojamas).
│ +"""
│ +from __future__ import annotations
│ +
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(ROOT / "scripts"))
│ +
│ +import validate_content as V  # noqa: E402
│ +import check_language as L  # noqa: E402
│ +
│ +DRAFT = pathlib.Path(
│ +    "/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m394/kieta-vandens-forma.json"
│ +)
│ +TARGET = ROOT / "content" / "lt" / "grade-01" / "pasaulio-pazinimas" / "24-kieta-vandens-forma.json"
│ +
│ +data = json.loads(DRAFT.read_text(encoding="utf-8"))
│ +
│ +# 1. validate_content.check_module — su simuliacija, kurios registre dar nėra.
│ +sims = set(V.registered_sims())
│ +sims.add(data["sim"]["component"])          # būsimas komponentas
│ +rep = V.Report()
│ +V.check_module(TARGET, data, rep, sims, {"grade": 1})
│ +print("validate_content.check_module:")
│ +print(f"  klaidos: {len(rep.errors)} · įspėjimai: {len(rep.warnings)}")
│ +for e in rep.errors:
│ +    print("  [err]", e)
│ +for w in rep.warnings:
│ +    print("  [warn]", w)
│ +
│ +# 2. check_language.check_module — tas pats failas, tas pats kelias.
│ +issues: list[dict] = []
│ +L.check_limits_against_standard(issues)
│ +L.check_module(TARGET, issues)
│ +errs = [i for i in issues if i["severity"] == "error"]
│ +warns = [i for i in issues if i["severity"] == "warn"]
│ +infos = [i for i in issues if i["severity"] == "info"]
│ +print("check_language.check_module:")
│ +print(f"  klaidos: {len(errs)} · įspėjimai: {len(warns)} · pastabos: {len(infos)} · sakinio riba: {L.MAX_WORDS[1]} ž.")
│ +for i in issues:
│ +    print(f"  [{i['severity']}] {i['where']}: {i['issue']} — {i['detail']}")
│ +    if i["text"]:
│ +        print(f"        „{i['text'][:110]}“")
│ +
│ +# 3. Skaičiai, kurių negalima imti iš akių: ilgiai ir atsakymų pasiskirstymas.
│ +print("ilgiai:")
│ +print("  title", len(data["title"]), "/42")
│ +print("  subtitle", len(data["subtitle"]), "/80")
│ +print("  concept.title", len(data["concept"]["title"]), "/40")
│ +print("  big_idea", len(data["concept"]["big_idea"]), "/240")
│ +print("  steps", [len(s) for s in data["concept"]["steps"]], "žodžiai", [V.word_count(s) for s in data["concept"]["steps"]])
│ +print("  answers", [t["answer"] for t in data["tasks"]])
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m394/kieta-vandens-forma.json
│ @@ -24,7 +24,7 @@
│    "sim": {
│      "component": "kieta-forma",
│      "config": {
│ -      "level": 5,
│ +      "pilta": 5,
│        "forms": [
│          { "id": "kubas", "name": "ledas", "shape": "kubas" },
│          { "id": "snaige", "name": "snaigė", "shape": "zvaigzde" },
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m394/probe.py
│ @@ -37,10 +37,19 @@
│  for w in rep.warnings:
│      print("  [warn]", w)
│
│ -# 2. check_language.check_module — tas pats failas, tas pats kelias.
│ +# 2. check_language.check_module — skaito failą iš disko, todėl juodraštis
│ +#    trumpam padedamas į tikslo vietą ir PO PATIKROS IŠTRINAMAS (finally).
│ +#    Paliktas .draft/.json content kataloge būtų šiukšlė, kurią praeitas
│ +#    paleidimas paliko (pamoka iš #377 ataskaitos).
│  issues: list[dict] = []
│  L.check_limits_against_standard(issues)
│ -L.check_module(TARGET, issues)
│ +TARGET.parent.mkdir(parents=True, exist_ok=True)
│ +TARGET.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +try:
│ +    L.check_module(TARGET, issues)
│ +finally:
│ +    TARGET.unlink()
│ +    assert not TARGET.exists(), "juodraštis neliko content kataloge"
│  errs = [i for i in issues if i["severity"] == "error"]
│  warns = [i for i in issues if i["severity"] == "warn"]
│  infos = [i for i in issues if i["severity"] == "info"]
│ profiles/deepseek41flash/cache/scratch/m394/geom.py
│ @@ -0,0 +1,13 @@
│ +view_w, view_h = 328, 336
│ +cup_x, cup_w = 16, 88
│ +inner_top, inner_bottom = 96, 240
│ +h = inner_bottom - inner_top
│ +dx, dy, r = 18, 20, 6
│ +grid_w = 4 * dx + 2 * r
│ +grid_h = dy + 2 * r
│ +print("puodelio vidinis plotis", cup_w, "aukštis", h)
│ +print("10 taškų blokas", grid_w, "x", grid_h)
│ +for name, w, hh in [("kubas", 88, 88), ("zvaigzde", 104, 104), ("plokste", 152, 44)]:
│ +    print(f"{name}: {w}x{hh} — taškai telpa:", grid_w <= w - 8 and grid_h <= hh - 8)
│ +tiles = 3 * 96 + 2 * 8
│ +print("plytelės", tiles, "iš", view_w, "→ paraštės", (view_w - tiles) / 2)
Sustabdytas iteracijų limitas, todėl darbo failo repo nespėjau įrašyti. Tai reiškia, kad paleidimas pagal bėgiklio taisyklę laikytinas tuščiu: `ĮGYVENDINTA:` eilutės rašyti negalima ir #28557 lieka eilėje.

## Ką šiame paleidime padariau

Pasirinkau **#28557 (tema/high, seniausias iš dviejų high-prioritetinių)** — „Kieta vandens būsena: tas pats vanduo, skirtinga forma“, target `content/lt/grade-01/pasaulio-pazinimas/24-kieta-vandens-forma.json` (numeris `24-` pasaulio pažinime laisvas, užimti 08–10 ir 16–23; failo nėra).

**Patikrinti šaltiniai (ne iš atminties):**
- Programa 26.3.2 perskaityta `sources/pradinio-bp-rekomendacijos-2024.txt:1547–1552` (kietosios būsenos formos: snaigė, šerkšnas, ledas; išvada „kieta būsena gali būti įvairių formų“; klausimas apie šerkšno susidarymo sąlygas) ir 1 kl. temų lentelė `:8472–8474` („Ledo papuošalo gamyba“).
- Crossref patvirtinti DOI: Kambouri-Danos, Ravanis, Jameau & Boilevin (2019), *Early Childhood Education Journal* 47, 475–488 — `10.1007/s10643-019-00937-5` (atviraprieigis; perskaičiau abstraktą ir literatūros apžvalgą: 91 vaikas 5–6 m., 8 žingsnių seka, spėjimai prieš kiekvieną kaitinimo/šaldymo žingsnį, **vienas kintamasis** kiekviename žingsnyje — χ²=12,31, p<0,004); Stavy & Stachel (1985), *European Journal of Science Education* 7(4), 407–421 — `10.1080/0140528850070409` (ledas klasifikuojamas kaip „tarpinis“ ar net skystis, nes vaikai neskiria medžiagos nuo būsenos — būtent šio modulio klaidinga nuostata); Osborne & Cosgrove (1983) `10.1002/tea.3660200905` ir Stavy (1990) `10.1002/tea.3660270308` — metaduomenys patvirtinti, tekstų neskaičiau, todėl jų necitavau.
- Patikrinta, kad temos platformoje nėra: `grep šerkšn` visame `grade-01` → 0; `ledas/snieg` — tik `08-metu-laikai` (viena eilutė apie pavasarį) ir `16-vandens-busenos` (ledas tik optional užduotyje).

**Simuliacijos projektas (parengtas, neįrašytas):** komponentas `kieta-forma` į `assets/js/sims/pasaulis.js` (jau importuoja `art.js`, tad `check_art.py` LEGACY neliečiamas). Vienas kintamasis — **forma** (kubas / žvaigždė / plokštė); konstanta — tas pats puodelis ir ta pati žyma. Dešimt taškų (kaip `05-desimtukas`) perkeliami iš puodelio į formą, užšaldomi, ištirpsta ir vėl pasiekia žymą. Du spėjimai (LL-15): prieš pirmą šaldymą „Ar ištirpus bus tiek pat?“, prieš antrą — „Ar ši forma yra vanduo?“. `api.progress` tik po trečios formos ištirpimo. Modelio ribos įvardijamos: ledas realiai užima ~9 % daugiau vietos; šerkšnas gamtoje auga iš garų ant vėsaus paviršiaus, o ne iš pilto vandens.

**Patikra tikru įrankiu:** juodraštinis modulis (scratch, ne `content/`) praėjo abu vartus — `validate_content.check_module` **0 klaidų** (vienintelis įspėjimas „nepavyko perskaityti simuliacijos kūno“ — komponento dar nėra registre, tai sąžininga), `check_language.check_module` **0 klaidų, 0 įspėjimų, 1 pastaba**. Ilgiai: title 28/42, subtitle 41/80, big_idea 124/240, žingsniai 8/8/9/7 žodžių, atsakymai 0/1/2/0. Zondas pagavo realų defektą — `sim.config` raktas `level` davė „anglicizmas“ klaidą (pakeistas į `pilta`); liko viena pastaba apie įvardį `tasks[3].why` pradžioje („Jis atšilo…“) — ją reikia performuluoti.

**Rasta geometrijos klaida, kurios dar nespėjau sutvarkyti:** dešimties taškų blokas (84×32 px) netelpa į kubo formą 88×88 px su 8 px parašte — reikia arba mažesnio `dx` (16 → 76 px), arba kubo 96×96. Tai būtent LL-03/LL-24 šeima: modelis ieškotų elemento, kurio forma neturi.

## Ko nepadariau

Neįrašyti failai, kurie yra tikrasis rezultatas: `research/wiki/grades/01/metodai.md` M-12 skyrius, `agents/proposals/2026-11-20-metodininkas-kieta-vandens-forma.json`, `research/wiki/foundations/medziaga-ir-busena.md` + README eilutė, `research/wiki/guidelines/pilotai.md` P-022 ir changelog įrašas. `content/` neliestas, `.draft` nepaliktas (patikrinta `git status`), `agents/state.json` neliestas.

Visa medžiaga yra diske: `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m394/` — `kieta-vandens-forma.json` (juodraštis, 0 klaidų), `probe.py` (pakartojama abiejų vartų patikra su `finally` trinamu failu), `geom.py`. Kitas paleidimas gali užbaigti darbą be pakartotinės analizės: belieka pataisyti taškų tinklelį ir `tasks[3].why`, tada išrašyti M-12 ir pasiūlymą.

## klaidos

```
session_id: local-d7fadc54b14eef5db76ac691e64b7909f274629122e122915f96443773ad5671
```
