#!/usr/bin/env python3
"""
SUPRASK agentų dashboard (vidinis, ne viešas).

Rodo: suplanuotus paleidimus, istoriją, pasiūlymus, turinio statistiką ir
leidžia paleisti vaidmenį rankiniu būdu. Skaito `agents/runs.db`.

Paleidimas:
    python3 dashboard/server.py                 # 100.118.226.11:9410
    SUPRASK_DASH_PORT=9411 python3 dashboard/server.py

Prieiga: tik Tailscale tinklas + HTTP Basic auth. Slaptažodis generuojamas
`~/.config/suprask/dashboard.env` (0600) pirmą kartą.
"""

from __future__ import annotations

import base64
import hmac
import html
import json
import os
import pathlib
import random
import re
import secrets
import string
import subprocess
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agents"))
import db  # noqa: E402

HOST = os.environ.get("SUPRASK_DASH_HOST", "100.118.226.11")
PORT = int(os.environ.get("SUPRASK_DASH_PORT", "9410"))
ENV_FILE = pathlib.Path.home() / ".config" / "suprask" / "dashboard.env"


def load_credentials() -> tuple[str, str]:
    user = os.environ.get("SUPRASK_DASH_USER")
    password = os.environ.get("SUPRASK_DASH_PASS")
    if user and password:
        return user, password

    if ENV_FILE.exists():
        data = {}
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                data[k.strip()] = v.strip()
        user = data.get("SUPRASK_DASH_USER", "admin")
        password = data.get("SUPRASK_DASH_PASS", "")
        if password:
            return user, password

    user = "admin"
    alphabet = string.ascii_letters + string.digits
    password = "".join(random.SystemRandom().choice(alphabet) for _ in range(24))
    ENV_FILE.parent.mkdir(parents=True, exist_ok=True)
    ENV_FILE.write_text(
        f"# SUPRASK dashboard — sugeneruota automatiškai, neskelbti\nSUPRASK_DASH_USER={user}\nSUPRASK_DASH_PASS={password}\n",
        encoding="utf-8",
    )
    ENV_FILE.chmod(0o600)
    print(f"Sugeneruoti prisijungimo duomenys: {ENV_FILE}", file=sys.stderr)
    return user, password


USER, PASS = load_credentials()


def timer_state() -> list[dict]:
    """Skaito systemd timerius (jei systemd prieinamas) ir verčia laikus į ISO."""
    import datetime as dt

    def iso(usec) -> str:
        try:
            n = int(usec)
        except (TypeError, ValueError):
            return ""
        if n <= 0:
            return ""
        return dt.datetime.fromtimestamp(n / 1_000_000).isoformat(sep=" ", timespec="minutes")

    try:
        out = subprocess.run(
            ["systemctl", "--user", "list-timers", "suprask*", "--all", "--no-pager", "--output=json"],
            capture_output=True, text=True, timeout=10,
        ).stdout
        data = json.loads(out) if out.strip().startswith("[") else []
        result = []
        for t in data:
            result.append({
                "unit": t.get("unit", ""),
                "next": iso(t.get("next")),
                "last": iso(t.get("last")),
                "activates": t.get("activates", ""),
            })
        return result
    except Exception:  # noqa: BLE001
        return []


def run_now(role: str) -> tuple[bool, str]:
    try:
        subprocess.Popen(
            [sys.executable, str(ROOT / "agents" / "run.py"), role, "--trigger", "dashboard"],
            cwd=str(ROOT), start_new_session=True,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        return True, f"{role}: paleista"
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)


def read_log_tail(path: str, limit: int = 12000) -> str:
    p = ROOT / path
    if not path or not p.exists():
        return ""
    try:
        return p.read_text(encoding="utf-8")[-limit:]
    except OSError:
        return ""


class Handler(BaseHTTPRequestHandler):
    server_version = "SupraskDash/1.0"

    def log_message(self, format, *args):  # noqa: A002 - bazinės klasės parašas
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))

    def _auth_ok(self) -> bool:
        header = self.headers.get("Authorization", "")
        if not header.startswith("Basic "):
            return False
        try:
            decoded = base64.b64decode(header[6:]).decode("utf-8")
        except Exception:  # noqa: BLE001
            return False
        user, _, password = decoded.partition(":")
        return hmac.compare_digest(user, USER) and hmac.compare_digest(password, PASS)

    def _send(self, code: int, body: bytes, ctype: str = "text/html; charset=utf-8") -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, data) -> None:
        self._send(200, json.dumps(data, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def do_GET(self):  # noqa: N802
        if not self._auth_ok():
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="SUPRASK dashboard"')
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/":
            return self._send(200, HTML.encode("utf-8"))
        if path == "/api/overview":
            return self._json({
                "stats": db.content_stats(),
                "roles": db.role_stats(),
                "timers": timer_state(),
                "schedule": [{"role": r, "cadence": c["cadence"], "on_calendar": c["on_calendar"], "description": c["description"]}
                             for r, c in sorted(db_roles().items())],
                "runs_today": len([r for r in db.recent_runs(200) if (r.get("started") or "")[:10] == today()]),
            })
        if path == "/api/runs":
            qs = urllib.parse.parse_qs(parsed.query)
            limit = min(int(qs.get("limit", ["40"])[0]), 200)
            role = qs.get("role", [None])[0]
            rows = db.recent_runs(limit, role)
            for r in rows:
                r.pop("summary", None)
            return self._json(rows)
        if path.startswith("/api/run/"):
            run_id = path.rsplit("/", 1)[-1]
            rows = [r for r in db.recent_runs(400) if str(r["id"]) == run_id]
            if not rows:
                return self._send(404, b'{"error":"nera"}', "application/json")
            row = rows[0]
            row["log"] = read_log_tail(row.get("log_path") or "")
            return self._json(row)
        if path == "/api/proposals":
            return self._json(db.proposals(100))
        return self._send(404, b"<h1>404</h1>")

    def do_POST(self):  # noqa: N802
        if not self._auth_ok():
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="SUPRASK dashboard"')
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length") or 0)
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            return self._json({"ok": False, "error": "blogas JSON"})

        if self.path == "/api/run-now":
            role = str(payload.get("role", ""))
            roles = db_roles()
            if role not in roles:
                return self._json({"ok": False, "error": f"nežinomas vaidmuo {role}"})
            ok, msg = run_now(role)
            return self._json({"ok": ok, "message": msg})
        if self.path == "/api/proposal-status":
            try:
                db.set_proposal_status(int(payload["id"]), str(payload["status"]))
                return self._json({"ok": True})
            except Exception as exc:  # noqa: BLE001
                return self._json({"ok": False, "error": str(exc)})
        return self._send(404, b"{}", "application/json")


def db_roles() -> dict:
    sys.path.insert(0, str(ROOT / "agents"))
    import run as runner  # lokalus importas, kad būtų vienas sąrašas
    return runner.ROLES


def today() -> str:
    import datetime as dt
    return dt.date.today().isoformat()


HTML = """<!DOCTYPE html>
<html lang="lt"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SUPRASK — agentų valdymas</title>
<style>
:root{--bg:#101317;--panel:#171b21;--panel2:#1e232b;--line:#2a313b;--fg:#e8edf4;--muted:#94a1b2;--accent:#ff8a3d;--ok:#3fbf8f;--bad:#f2708a;--warn:#f0b429}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--accent)}
header{padding:18px 24px;border-bottom:1px solid var(--line);display:flex;gap:18px;align-items:center;flex-wrap:wrap;position:sticky;top:0;background:rgba(16,19,23,.92);backdrop-filter:blur(8px);z-index:5}
h1{font-size:18px;margin:0;letter-spacing:-.01em}
.badge{font-size:12px;padding:3px 9px;border-radius:999px;background:var(--panel2);color:var(--muted);border:1px solid var(--line)}
main{padding:20px 24px 60px;max-width:1400px;margin:0 auto;display:grid;gap:18px}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}
.card h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:0 0 10px}
.big{font-size:28px;font-weight:800;letter-spacing:-.02em}
.kv{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--muted);padding:3px 0}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
tr:hover td{background:var(--panel2)}
.status{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
.ok{background:rgba(63,191,143,.15);color:var(--ok)}
.partial{background:rgba(240,180,41,.15);color:var(--warn)}
.failed,.timeout{background:rgba(242,112,138,.15);color:var(--bad)}
.running{background:rgba(90,169,230,.18);color:#8cc6f0}
.skipped,.dry-run{background:var(--panel2);color:var(--muted)}
button{background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:9px;padding:7px 12px;cursor:pointer;font:inherit;min-height:36px}
button:hover{border-color:var(--accent)}
button.primary{background:var(--accent);color:#111;border-color:var(--accent);font-weight:700}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
select{background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:9px;padding:7px 10px;min-height:36px}
pre{background:#0b0e12;border:1px solid var(--line);border-radius:10px;padding:12px;overflow:auto;max-height:420px;font-size:12px;white-space:pre-wrap}
dialog{background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:14px;max-width:900px;width:92vw;padding:18px}
dialog::backdrop{background:rgba(0,0,0,.6)}
.muted{color:var(--muted)}
.pill{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--panel2);border:1px solid var(--line);color:var(--muted)}
</style></head>
<body>
<header>
  <h1>SUPRASK · agentų valdymas</h1>
  <span class="badge" id="auto">auto-refresh 15 s</span>
  <span class="badge" id="updated">—</span>
  <span style="flex:1"></span>
  <span class="badge">vidinis · Tailscale</span>
</header>
<main>
  <section class="grid" id="stats"></section>

  <section class="card">
    <h2>Suplanuoti paleidimai</h2>
    <table><thead><tr><th>Vaidmuo</th><th>Dažnis</th><th>Kitas</th><th>Paskutinis</th><th></th></tr></thead>
    <tbody id="schedule"></tbody></table>
  </section>

  <section class="card">
    <h2>Pasiūlymai</h2>
    <div id="proposals" class="muted">Kraunama…</div>
  </section>

  <section class="card">
    <h2>Paleidimų istorija</h2>
    <div class="row" style="margin-bottom:10px">
      <select id="roleFilter"><option value="">visi vaidmenys</option></select>
      <button id="refresh">Atnaujinti</button>
    </div>
    <table><thead><tr><th>#</th><th>Vaidmuo</th><th>Statusas</th><th>Trukmė</th><th>Pradėta</th><th>Failai</th><th></th></tr></thead>
    <tbody id="runs"></tbody></table>
  </section>
</main>

<dialog id="detail"><div class="row" style="justify-content:space-between"><strong id="dTitle">—</strong><button id="dClose">Uždaryti</button></div><div id="dBody"></div></dialog>

<script>
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let roles = [];

async function j(url, opts) { const r = await fetch(url, opts); if(!r.ok) throw new Error(r.status); return r.json(); }

function statusClass(s){ return ["ok","partial","failed","timeout","running","skipped","dry-run"].includes(s) ? s : ""; }

async function loadOverview(){
  const d = await j("/api/overview");
  roles = d.schedule.map(x=>x.role);
  const st = d.stats;
  $("#stats").innerHTML = `
    <div class="card"><h2>Moduliai</h2><div class="big">${st.modules}</div><div class="kv"><span>užduotys</span><b>${st.tasks}</b></div><div class="kv"><span>simuliacijos</span><b>${st.sims}</b></div></div>
    <div class="card"><h2>Garsas</h2><div class="big">${st.audio_files}</div><div class="kv"><span>įrašai</span><b>${st.audio_mb} MB</b></div><div class="kv"><span>kalba</span><b>lt-LT</b></div></div>
    <div class="card"><h2>Šiandien</h2><div class="big">${d.runs_today}</div><div class="kv"><span>paleidimai</span><b>${d.runs_today}</b></div><div class="kv"><span>atviri pasiūlymai</span><b id="openProp">—</b></div></div>
    <div class="card"><h2>Vaidmenys</h2><div class="big">${d.schedule.length}</div><div class="kv"><span>aktyvūs</span><b>${d.roles.length}</b></div></div>`;

  const timerMap = {};
  (d.timers||[]).forEach(t => { const m = (t.activates||"").match(/suprask-agent@(.+?)\\.service/); if(m) timerMap[m[1]] = t; });

  $("#schedule").innerHTML = d.schedule.map(s => {
    const t = timerMap[s.role] || {};
    return `<tr>
      <td><b>${esc(s.role)}</b><div class="muted" style="font-size:12px">${esc(s.description)}</div></td>
      <td>${esc(s.cadence)}</td>
      <td class="muted">${esc((t.next||"—").replace("n/a","—"))}</td>
      <td class="muted">${esc(t.last||"—")}</td>
      <td><button data-run="${esc(s.role)}">Paleisti dabar</button></td></tr>`;
  }).join("");

  $("#roleFilter").innerHTML = '<option value="">visi vaidmenys</option>' + d.schedule.map(s=>`<option value="${esc(s.role)}">${esc(s.role)}</option>`).join("");
  document.querySelectorAll("[data-run]").forEach(b=>b.onclick=()=>runNow(b.dataset.run,b));
}

async function loadRuns(){
  const role = $("#roleFilter").value;
  const rows = await j(`/api/runs?limit=60${role?`&role=${encodeURIComponent(role)}`:""}`);
  $("#runs").innerHTML = rows.map(r => `<tr>
    <td>${r.id}</td>
    <td>${esc(r.role)}${r.trigger!=="schedule"?` <span class="pill">${esc(r.trigger)}</span>`:""}</td>
    <td><span class="status ${statusClass(r.status)}">${esc(r.status)}</span></td>
    <td>${r.duration_s ?? "—"}s</td>
    <td class="muted">${esc((r.started||"").replace("T"," ").slice(0,16))}</td>
    <td class="muted">${(JSON.parse(r.artifacts||"[]")||[]).length}</td>
    <td><button data-id="${r.id}">Atidaryti</button></td></tr>`).join("") || '<tr><td colspan="7" class="muted">Dar nėra paleidimų</td></tr>';
  document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>openRun(b.dataset.id));
}

async function loadProposals(){
  const rows = await j("/api/proposals");
  const open = rows.filter(r=>r.status==="new").length;
  const el = $("#openProp"); if (el) el.textContent = open;
  $("#proposals").innerHTML = rows.length ? `<table><thead><tr><th>#</th><th>Tipas</th><th>Pavadinimas</th><th>Adresatas</th><th>Prioritetas</th><th>Būsena</th></tr></thead><tbody>` +
    rows.slice(0,25).map(p=>`<tr><td>${p.id}</td><td>${esc(p.type)}</td><td>${esc(p.title)}</td><td class="muted">${esc(p.target||"")}</td><td>${esc(p.priority)}</td><td>${esc(p.status)}</td></tr>`).join("") +
    `</tbody></table>` : '<p class="muted">Pasiūlymų dar nėra. Juos kurs ideator, metodininkas, kritikas.</p>';
}

async function openRun(id){
  const r = await j(`/api/run/${id}`);
  $("#dTitle").textContent = `#${r.id} · ${r.role} · ${r.status}`;
  $("#dBody").innerHTML = `<div class="kv"><span>Pradėta</span><b>${esc(r.started)}</b></div>
    <div class="kv"><span>Trukmė</span><b>${r.duration_s ?? "—"}s</b></div>
    <div class="kv"><span>Failai</span><b>${esc(r.artifacts||"[]")}</b></div>
    <h3 style="font-size:13px;color:var(--muted);margin:14px 0 6px">Santrauka</h3><pre>${esc(r.summary||"(tuščia)")}</pre>
    <h3 style="font-size:13px;color:var(--muted);margin:14px 0 6px">Žurnalas</h3><pre>${esc(r.log||"(nėra)")}</pre>`;
  $("#detail").showModal();
}

async function runNow(role, btn){
  btn.disabled = true; btn.textContent = "Paleidžiama…";
  try { const r = await j("/api/run-now",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role})});
        btn.textContent = r.ok ? "Paleista ✓" : "Klaida";
  } catch(e){ btn.textContent = "Klaida"; }
  setTimeout(()=>{ btn.disabled=false; btn.textContent="Paleisti dabar"; loadAll(); }, 4000);
}

async function loadAll(){
  try { await loadOverview(); await Promise.all([loadRuns(), loadProposals()]);
    $("#updated").textContent = "atnaujinta " + new Date().toLocaleTimeString("lt-LT");
  } catch(e){ $("#updated").textContent = "klaida: " + e.message; }
}

$("#refresh").onclick = loadAll;
$("#roleFilter").onchange = loadRuns;
$("#dClose").onclick = () => $("#detail").close();
loadAll();
setInterval(loadAll, 15000);
</script>
</body></html>
"""


def main() -> int:
    db.init()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"SUPRASK dashboard: http://{HOST}:{PORT}/ (naudotojas: {USER})", file=sys.stderr)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
