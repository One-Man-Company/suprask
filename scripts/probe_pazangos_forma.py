#!/usr/bin/env python3
"""Seno `localStorage` įrašo forma: ar `read()` normalizuoja SKAITYMO kelyje.

Kodėl šis failas egzistuoja (LL-209, pasiūlymas #56179)
------------------------------------------------------
`assets/js/progress.js` turėjo du formos šaltinius. Rašymo kelyje
(`slot()`, `mergeOld()`) įrašas buvo normalizuojamas per `record()`, o
skaitymo kelyje — `read()` — grąžindavo `JSON.parse` rezultatą tokį, koks
guli diske. 2026-11-03 13:43–13:53 (commit `0f35296`) forma buvo
`{seen, tasks, tasksCorrect, last}` — be `solved`. Tokį įrašą turintis
vaikas nematė nė vieno modulio sąraše: `count()` ir `resumeTarget()`
skaitė `m.solved.length` → `TypeError`, puslapis virsdavo „Nepavyko įkelti“.

Todėl vartas matuoja ne „ar failas turi `record()`“ (jis turėjo ir tada),
o **ką grąžina `read()` su kiekviena kada nors gyvavusia forma**:

  K1  senas `{tasks, tasksCorrect}` (tasksCorrect >= tasks) → atlikta,
      `solved` ilgis = tasksCorrect (vaikas darbo nepraranda, T3.5);
  K2  senas, bet nepilnas (tasksCorrect < tasks) → NE atlikta, be klaidų;
  K3  senas su `tasksCorrect > tasks` → nekerta `total` (LL-31 dvasia);
  K4  naujas `{total, solved}`, nepilnas → NE atlikta, laukai nepakite;
  K5  naujas, pilnas → atlikta;
  K6  šiukšlės (`"foo": 5`, `"bar": "x"`) → praleidžiamos, ne išimtis;
  K7  `simDone` išlieka po normalizavimo;
  K8  pakartotinis `read()` NEPERRAŠO įrašo (normalizavimas ne ciklas,
      `updated` nesisuka kiekvieną skaitymą);
  K9  pasikartoję ir už `total` esantys indeksai nukerpami (LL-31).

Vykdoma be tinklo: `node` įkelia TIKRĄ `assets/js/progress.js`, o naršyklės
API pakeičiami minimaliais stubs (`localStorage` atmintyje). `node` yra
GitHub Actions runner'yje visada (be jo neveikia nė vienas action), todėl
zondas įsijungia į CI be workflow pakeitimo. Be `node` — `PRALEISTA`, ir tai
pasakoma žodžiu, o ne nutylima (LL-37).

Naudojimas:
    python3 scripts/probe_pazangos_forma.py                       # 0 — forma saugoma
    python3 scripts/probe_pazangos_forma.py --file /tmp/senas.js  # neigiama kontrolė
"""

from __future__ import annotations

import argparse
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
TARGET = ROOT / "assets" / "js" / "progress.js"

HARNESS = r"""
const file = process.argv[2];
const store = new Map();
globalThis.window = globalThis;
globalThis.location = { hash: "", pathname: "/" };
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: () => ({
    setAttribute() {}, appendChild() {}, addEventListener() {},
    style: {}, classList: { add() {} }, remove() {},
  }),
  addEventListener() {},
  body: { appendChild() {} },
  documentElement: { style: {} },
};
globalThis.fetch = async () => { throw new Error("zondas be tinklo"); };

const KEY = "suprask:progress:v1";
const out = [];
const check = (name, ok, detail) => out.push({ name, ok: !!ok, detail: String(detail) });

const seed = (modules) => store.set(KEY, JSON.stringify({ modules, updated: null }));
const safe = (fn) => { try { return { v: fn() }; } catch (e) { return { err: e.message }; } };

const p = await import(file);

// K1 — senas, pilnas: vaiko darbas lieka „atlikta“.
seed({ "01-garsas": { seen: 2, tasks: 4, tasksCorrect: 4, last: "2026-11-03T10:45:00.000Z" } });
let r = safe(() => p.read().modules["01-garsas"]);
let m = r.v || {};
check("K1 senas pilnas", !r.err && m.total === 4 && (m.solved || []).length === 4 && p.isDone("01-garsas") === true
  && p.count(["01-garsas"]).done === 1, r.err || JSON.stringify(m) + " done=" + p.count(["01-garsas"]).done);

// K2 — senas, nepilnas: ne atlikta, bet ir ne klaida.
seed({ "01-garsas": { seen: 2, tasks: 4, tasksCorrect: 2, last: "2026-11-03T10:45:00.000Z" } });
r = safe(() => { p.read(); return p.count(["01-garsas"]); });
check("K2 senas nepilnas", !r.err && r.v.done === 0 && p.isDone("01-garsas") === false, r.err || JSON.stringify(r.v));

// K3 — senas su tasksCorrect > tasks: solved nekerta total.
seed({ "01-garsas": { seen: 1, tasks: 3, tasksCorrect: 9, last: null } });
r = safe(() => p.read().modules["01-garsas"]);
check("K3 senas perteklius", !r.err && r.v.total === 3 && (r.v.solved || []).length === 3 && p.isDone("01-garsas"),
  r.err || JSON.stringify(r.v));

// K4/K5 — dabartinė forma nepakinta.
seed({ "02-skiemenu": { seen: 3, attempts: 5, total: 4, solved: [1], last: "2026-11-27T09:00:00.000Z" } });
r = safe(() => p.read().modules["02-skiemenu"]);
check("K4 naujas nepilnas", !r.err && r.v.total === 4 && r.v.attempts === 5 && r.v.seen === 3
  && r.v.solved.length === 1 && p.isDone("02-skiemenu") === false, r.err || JSON.stringify(r.v));
seed({ "02-skiemenu": { seen: 3, attempts: 5, total: 2, solved: [0, 1], last: "2026-11-27T09:00:00.000Z" } });
check("K5 naujas pilnas", p.isDone("02-skiemenu") === true && p.count(["02-skiemenu"]).done === 1, "done=1");

// K6 — šiukšlės praleidžiamos, ne išimtis.
seed({ "foo": 5, "bar": "x", "01-garsas": { seen: 1, tasks: 2, tasksCorrect: 2, last: null } });
r = safe(() => p.read());
check("K6 šiukšlės", !r.err && Object.keys(r.v.modules).join(",") === "01-garsas",
  r.err || Object.keys(r.v.modules).join(","));

// K7 — simDone išlieka.
seed({ "01-garsas": { seen: 1, tasks: 2, tasksCorrect: 1, simDone: true, last: null } });
r = safe(() => p.get("01-garsas"));
check("K7 simDone", !r.err && r.v && r.v.simDone === true, r.err || JSON.stringify(r.v));

// K8 — antras read() neperrašo įrašo (normalizavimas ne ciklas).
seed({ "03-sakinio": { seen: 2, tasks: 3, tasksCorrect: 1, last: "2026-11-03T10:00:00.000Z" } });
p.read();
const afterFirst = store.get(KEY);
p.read();
check("K8 idempotentas", store.get(KEY) === afterFirst, store.get(KEY) === afterFirst ? "nepakito" : "perrašyta");

// K9 — pasikartoję ir už total esantys indeksai nukerpami (LL-31).
seed({ "04-skaiciu": { seen: 1, attempts: 6, total: 4, solved: [0, 2, 2, 7], last: null } });
r = safe(() => p.read().modules["04-skaiciu"]);
check("K9 indeksai karpomi", !r.err && JSON.stringify(r.v.solved) === "[0,2]" && p.isDone("04-skaiciu") === false,
  r.err || JSON.stringify(r.v.solved));

console.log(JSON.stringify(out));
"""


def run(node: str, target: pathlib.Path) -> list[dict]:
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = pathlib.Path(tmp)
        # `progress.js` importuoja `./registry.js` (pervadinimų žemėlapį). Kai
        # tikrinamas KITAS failas (neigiama kontrolė su `git show`), toks
        # kaimynas gali neegzistuoti — tada pakišama stub'as, kuris grąžina
        # tuščią žemėlapį, t. y. būseną iki indekso įkėlimo. Formos lūkesčiai
        # (K1–K9) nuo pervadinimų nepriklauso.
        source = target
        if not (target.parent / "registry.js").is_file():
            staged = tmpdir / "progress.js"
            staged.write_bytes(target.read_bytes())
            (tmpdir / "registry.js").write_text(
                "export function renameMap() { return new Map(); }\n", encoding="utf-8")
            source = staged
        harness = tmpdir / "harness.mjs"
        harness.write_text(HARNESS, encoding="utf-8")
        proc = subprocess.run(
            [node, str(harness), str(source)],
            capture_output=True, text=True, timeout=60, cwd=str(ROOT),
        )
    if proc.returncode != 0:
        return [{"name": "įkėlimas", "ok": False,
                 "detail": (proc.stderr or proc.stdout).strip()[:300]}]
    line = (proc.stdout or "").strip().splitlines()[-1] if proc.stdout.strip() else "[]"
    try:
        return json.loads(line)
    except json.JSONDecodeError:
        return [{"name": "išvestis", "ok": False, "detail": line[:300]}]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default=str(TARGET),
                    help="kurį progress.js tikrinti (neigiamai kontrolei — senas)")
    args = ap.parse_args()
    target = pathlib.Path(args.file)
    if not target.is_file():
        print(f"KLAIDA: nėra {target}", file=sys.stderr)
        return 2
    node = shutil.which("node")
    if not node:
        print("PRALEISTA: nėra `node` — forma neišmatuota (ne žalia, o nematuota)")
        return 0

    results = run(node, target)
    for r in results:
        print(f"{'OK  ' if r['ok'] else 'KLAIDA'} {r['name']} — {r['detail']}")
    bad = [r for r in results if not r["ok"]]
    print(f"\n{target}: {len(results) - len(bad)}/{len(results)} lūkesčių išsipildė"
          + (f", {len(bad)} krito" if bad else ""))
    return 0 if not bad else 1


if __name__ == "__main__":
    sys.exit(main())
