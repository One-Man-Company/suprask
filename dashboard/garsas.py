#!/usr/bin/env python3
"""
Garso perklausos puslapis (vidinis, tik Tailscale).

Tikslas: lietuvišką žodyną turi patvirtinti lietuviškai kalbantis žmogus.
Joks automatinis atpažintuvas negali pasakyti, ar kirtis padėtas teisingai —
tą girdi tik gimtakalbis. Todėl šiame puslapyje kiekvienas
žodis/skiemenis/sakinys grojamas vienu paspaudimu, o abejotini pažymimi vienu
mygtuku; pažymėtieji pergeneruojami kitu varikliu
(`scripts/fix_flagged_audio.py`).
"""

from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "assets" / "audio" / "lt"
MANIFEST = AUDIO / "manifest.json"
FLAGS = ROOT / "agents" / "audio-flags.json"


def manifest() -> dict:
    try:
        return json.loads(MANIFEST.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def flags() -> dict:
    try:
        data = json.loads(FLAGS.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def set_flag(text: str, status: str) -> dict:
    data = flags()
    if status in ("", "ok"):
        data.pop(text, None)
        if status == "ok":
            data[text] = "ok"
    elif status == "bloga":
        data[text] = "bloga"
    FLAGS.parent.mkdir(parents=True, exist_ok=True)
    FLAGS.write_text(json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")
    return data


def items() -> list[dict]:
    flags_map = flags()
    out = []
    for text, entry in sorted(manifest().items(), key=lambda kv: kv[0].lower()):
        out.append({
            "text": text,
            "n": entry.get("n"),
            "s": entry.get("s"),
            "flag": flags_map.get(text, ""),
        })
    return out


HTML = """<!DOCTYPE html>
<html lang="lt"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SUPRASK — garso perklausa</title>
<style>
:root{--paper:#fdf8ef;--ink:#2b2118;--ink-soft:#6b5b4a;--accent:#ff8a3d;--ok:#2f9e6b;--bad:#d1495b;--line:#e7ddcd}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--paper);color:var(--ink);padding:1rem 1rem 6rem}
header{max-width:64rem;margin:0 auto 1rem}
h1{font-size:1.35rem;margin:.2rem 0}
p.sub{margin:.2rem 0 0;color:var(--ink-soft);font-size:.92rem}
.bar{max-width:64rem;margin:1rem auto;display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;position:sticky;top:0;background:var(--paper);padding:.6rem 0;z-index:5;border-bottom:2px solid var(--line)}
.chip{border:2px solid var(--line);background:#fff;border-radius:999px;padding:.5rem .9rem;font-weight:700;cursor:pointer;min-height:44px}
.chip[aria-pressed="true"]{border-color:var(--accent);background:#fff3e6}
.progress{margin-left:auto;font-weight:700;font-size:.9rem;color:var(--ink-soft)}
.list{max-width:64rem;margin:0 auto;display:grid;gap:.6rem}
.row{display:flex;align-items:center;gap:.7rem;background:#fff;border:2px solid var(--line);border-radius:16px;padding:.7rem .9rem}
.row.flagged{border-color:var(--bad);background:#fff5f6}
.row.done{border-color:var(--ok)}
.word{flex:1;font-size:1.15rem;font-weight:800;line-height:1.25}
.word small{display:block;font-weight:600;color:var(--ink-soft);font-size:.75rem}
button.play{border:2px solid var(--ink);background:#fff;border-radius:12px;min-width:68px;min-height:48px;font-weight:800;cursor:pointer}
button.play:active{background:#f0e6d6}
button.flag{border:2px solid var(--bad);color:var(--bad);background:#fff;border-radius:12px;min-width:56px;min-height:48px;font-size:1.2rem;font-weight:900;cursor:pointer}
button.flag[aria-pressed="true"]{background:var(--bad);color:#fff}
.hint{max-width:64rem;margin:1.4rem auto;color:var(--ink-soft);font-size:.9rem;line-height:1.5}
footer{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:2px solid var(--line);padding:.6rem 1rem;display:flex;gap:.6rem;justify-content:center}
footer button{border:2px solid var(--ink);background:#fff;border-radius:12px;padding:.7rem 1rem;font-weight:800;min-height:48px;cursor:pointer}
@media(max-width:520px){.word{font-size:1rem}.row{padding:.6rem}button.play{min-width:56px;font-size:.85rem}}
</style></head>
<body>
<header>
  <h1>Garso perklausa</h1>
  <p class="sub">Pasiklausyk kiekvieno žodžio. Jei tartis neteisinga — spausk ✗. Pažymėti įrašai bus pergeneruoti.</p>
</header>

<div class="bar">
  <button class="chip" data-filter="all" aria-pressed="true">Visi</button>
  <button class="chip" data-filter="unchecked" aria-pressed="false">Nepatikrinti</button>
  <button class="chip" data-filter="flagged" aria-pressed="false">Pažymėti</button>
  <span class="progress" id="progress">—</span>
</div>

<div class="list" id="list"></div>

<div class="hint">
  Patarimas: spausk <b>Enter</b> arba <b>tarpą</b>, kad pakartotum paskutinį žodį.
  Žodis laikomas patikrintu, kai paspaudi ✗ (neteisinga) arba ✓ (teisinga).
</div>

<footer>
  <button id="prev">← Atgal</button>
  <button id="playAgain">▶ Kartoti</button>
  <button id="next">Toliau →</button>
</footer>

<script>
let DATA = [], FILTER = "all", IDX = 0;
const $ = (s) => document.querySelector(s);

function esc(s){return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}

async function load(){
  const r = await fetch("/api/audio");
  DATA = await r.json();
  render();
}

function visible(){
  if (FILTER === "flagged") return DATA.filter(d => d.flag === "bloga");
  if (FILTER === "unchecked") return DATA.filter(d => !d.flag);
  return DATA;
}

function render(){
  const rows = visible();
  $("#list").innerHTML = rows.map((d, i) => `
    <div class="row ${d.flag === "bloga" ? "flagged" : d.flag === "ok" ? "done" : ""}" data-i="${i}">
      <div class="word">${esc(d.text)}<small>${d.flag === "bloga" ? "pažymėta — bus pergeneruota" : d.flag === "ok" ? "patikrinta" : ""}</small></div>
      <button class="play" data-play="n" data-text="${esc(d.text)}">Normaliai</button>
      <button class="play" data-play="s" data-text="${esc(d.text)}">Lėtai</button>
      <button class="flag" data-flag="${esc(d.text)}" aria-pressed="${d.flag === "bloga"}">✗</button>
    </div>`).join("");

  const done = DATA.filter(d => d.flag).length;
  $("#progress").textContent = `${done}/${DATA.length} patikrinta · ${DATA.filter(d=>d.flag==="bloga").length} pažymėta`;
}

const audio = new Audio();
audio.preload = "auto";

function play(text, variant){
  const item = DATA.find(d => d.text === text);
  if (!item) return;
  const rel = item[variant] || item.n;
  if (!rel) return;
  audio.src = `/audio/${rel}`;
  audio.currentTime = 0;
  audio.play().catch(()=>{});
}

document.addEventListener("click", async (e) => {
  const chip = e.target.closest(".chip");
  if (chip) {
    FILTER = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    render();
    return;
  }
  const playBtn = e.target.closest("button.play");
  if (playBtn) { play(playBtn.dataset.text, playBtn.dataset.play); return; }

  const flagBtn = e.target.closest("button.flag");
  if (flagBtn) {
    const text = flagBtn.dataset.flag;
    const cur = DATA.find(d => d.text === text);
    const next = cur.flag === "bloga" ? "" : "bloga";
    await fetch("/api/audio-flag", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({text, status: next})});
    cur.flag = next;
    render();
  }
});

function cycle(delta){
  const rows = visible();
  if (!rows.length) return;
  IDX = (IDX + delta + rows.length) % rows.length;
  const text = rows[IDX].text;
  play(text, "n");
  document.querySelectorAll(".row").forEach(r => r.style.outline = "");
  const el = document.querySelector(`.row[data-i="${IDX}"]`);
  if (el) { el.style.outline = "3px solid var(--accent)"; el.scrollIntoView({block:"center", behavior:"smooth"}); }
}

$("#next").onclick = () => cycle(1);
$("#prev").onclick = () => cycle(-1);
$("#playAgain").onclick = () => cycle(0);
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") cycle(1);
  else if (e.key === "ArrowLeft") cycle(-1);
  else if (e.key === " " || e.key === "Enter") { e.preventDefault(); cycle(0); }
});

load();
</script>
</body></html>
"""
