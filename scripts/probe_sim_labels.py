#!/usr/bin/env python3
"""Vartas: mygtuko užrašas neturi būti paaiškinimo sakinys (LL-222).

Simuliacija mygtuko etiketę ima iš `sim.config.sentences`. Jei tas pats
raktas naudojamas ir paaiškinimui (`api.readout` / `api.note`), mygtukas
parodo visą sakinį — šiame darbe „Iš naujo“ virto
„Pokalbis grįžo į pradžią. Būdas liko toks, koks pasirinktas.“ (301×86 px
360 px ekrane, vietoj 123×48).

Vartas ieško kodo formos `<button …>${esc(say("raktas"))}</button>` ir
`<button …>${label("raktas", "Atsarginis")}</button>` — ir tikrina, kad tame
raktе esantis tekstas (visuose moduliuose, kurie naudoja TĄ sim) būtų
trumpas: be sakinio pabaigos taško ir iki 28 ženklų.

Ribos skaičiuojamos pagal sim objektą (`const X = { … }` tame `SIMS`
registre), o ne pagal visą failą — kitaip vieno modelio etiketė būtų
priskirta kitam to paties failo modeliui.

Be tinklo, be naršyklės. Įsijungia į CI `probe_*.py` ciklą.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIMS_DIR = ROOT / "assets/js/sims"
CONTENT = ROOT / "content/lt"

LABEL_MAX = 28

# Etiketė imama dviem būdais, ir jie skaito SKIRTINGUS config blokus:
#   ${esc(say("raktas"))}          → config.sentences
#   ${label("raktas", "Trumpas")}  → config.labels (jei ten yra raktas)
# `lab()` geometrijoje irgi skaito config.labels. Jei bloke rakto nėra,
# sim naudoja atsarginį tekstą — tada `sentences` reikšmė etiketės neveikia.
BUTTON_LABEL = re.compile(
    r'<button[^>]*>\s*(?:'
    r'\$\{esc\(say\("(\w+)"\)\)\}'
    r'|\$\{(?:msEsc\()?(?:label|lab)\("(\w+)",\s*"[^"]*"\)\)?\}'
    r')\s*</button>'
)
SENTENCE_STOPS = (".", "!", "?")
SIMS_BLOCK = re.compile(r"export const SIMS = \{(.*?)\n\};", re.S)
REGISTRY_ENTRY = re.compile(r'"([\w-]+)"\s*:\s*(\w+)')


def sim_blocks(text: str) -> dict[str, str]:
    """SIMS raktas → to sim objekto šaltinio dalis.

    Objektas baigiasi prieš kitą `const <vardas> = {` tame pačiame faile
    arba prieš `export const SIMS`.
    """
    block = SIMS_BLOCK.search(text)
    if not block:
        return {}
    starts: list[tuple[int, str]] = []
    for m in re.finditer(r"^const (\w+) = \{", text, re.M):
        starts.append((m.start(), m.group(1)))
    starts.sort()

    def span(name: str) -> tuple[int, int] | None:
        for i, (pos, nm) in enumerate(starts):
            if nm != name:
                continue
            end = starts[i + 1][0] if i + 1 < len(starts) else len(text)
            sims_at = text.find("export const SIMS")
            if sims_at != -1 and sims_at > pos:
                end = min(end, sims_at)
            return pos, end
        return None

    out: dict[str, str] = {}
    for key, const_name in REGISTRY_ENTRY.findall(block.group(1)):
        s = span(const_name)
        if s:
            out[key] = text[s[0]:s[1]]
    return out


def collect() -> tuple[dict[tuple[str, str], dict[str, str]], dict[str, set[str]]]:
    """(sim failas, sim raktas) → {etiketės raktas: blokas}; sim raktas → failai."""
    labels: dict[tuple[str, str], dict[str, str]] = {}
    owners: dict[str, set[str]] = {}
    for js in sorted(SIMS_DIR.glob("*.js")):
        text = js.read_text(encoding="utf-8")
        for sim_key, chunk in sim_blocks(text).items():
            pairs = BUTTON_LABEL.findall(chunk)
            if not pairs:
                continue
            # `say()` → sentences; `label()`/`lab()` → labels
            labels[(js.name, sim_key)] = {
                (a or b): ("labels" if b else "sentences") for a, b in pairs
            }
            owners.setdefault(sim_key, set()).add(js.name)
    return labels, owners


def modules_for(sim_key: str) -> list[tuple[Path, dict]]:
    out: list[tuple[Path, dict]] = []
    for index in sorted(CONTENT.glob("grade-*/index.json")):
        data = json.loads(index.read_text(encoding="utf-8"))
        for strand in data.get("strands", []):
            for mod in strand.get("modules", []):
                if mod.get("sim") != sim_key:
                    continue
                path = CONTENT / mod["file"]
                if path.exists():
                    out.append((path, json.loads(path.read_text(encoding="utf-8"))))
    return out


def check_label(key: str, value: str) -> list[str]:
    problems: list[str] = []
    if value.strip().endswith(SENTENCE_STOPS):
        problems.append(f"„{key}“ baigiasi sakinio ženklu — paaiškinimas, ne užrašas: „{value}“")
    if len(value) > LABEL_MAX:
        problems.append(f"„{key}“ {len(value)} ženklų (riba {LABEL_MAX}): „{value}“")
    return problems


def negative_control() -> list[str]:
    """Savi-patika: vartas privalo pagauti būtent tą defektą, kurį taisėme."""
    bad = "Pokalbis grįžo į pradžią. Būdas liko toks, koks pasirinktas."
    if len(check_label("again", bad)) < 2:
        return ["savi-patika: senasis užrašas nepagautas — vartas nemato defekto"]
    if check_label("reset", "Iš naujo"):
        return ["savi-patika: geras užrašas „Iš naujo“ atmetamas — vartas per griežtas"]
    return []


def main() -> int:
    labels, _owners = collect()
    problems: list[str] = negative_control()
    checked = 0

    for (js_name, sim_key), keys in sorted(labels.items()):
        mods = modules_for(sim_key)
        for path, module in mods:
            config = (module.get("sim") or {}).get("config") or {}
            rel = path.relative_to(ROOT)
            for key, block in sorted(keys.items()):
                texts = config.get(block)
                if not isinstance(texts, dict) or key not in texts:
                    continue
                checked += 1
                for p in check_label(key, str(texts[key])):
                    problems.append(f"{rel} [{js_name}:{sim_key}] „{block}“ {p}")

    if problems:
        print(f"NEPAVYKO ({len(problems)}):")
        for p in problems:
            print("  ✘ " + p)
        return 1

    print(
        f"✔ Mygtukų užrašai trumpi: {checked} etikečių {len(labels)} sim modeliuose, "
        f"riba {LABEL_MAX} ženklų ir jokio sakinio pabaigos taško."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
