#!/usr/bin/env python3
"""Zondas `run.own_commits_since()` — paleidžiamas įrodymas (LL-36, LL-211).

Kodėl šis failas egzistuoja
---------------------------
Du `sistemos-architektas` paleidimai (#516 2026-11-24, #542 2026-11-25)
paskelbė penkis commit'us į `origin/main`, o `agents/runs.db` juos įrašė
`exhausted` ir `empty` su „Pakeista tik paleidimo ataskaita — darbo rezultato
nėra“ ir `artifacts = []`. Priežastis: bėgiklis matavo darbą tik per
`changed_files()`, t. y. per `git status`. Modelis, kuris pats padaro
`git commit`, palieka švarią darbinę kopiją — ir bėgiklis nemato nieko.

Pasekmės nebuvo kosmetinės:
  * statistika skaičiavo šiuos paleidimus kaip nenaudingus (architektas 43 %),
    todėl architektas eikvojo paleidimus ne tam darbui, kuris iš tikrųjų
    strigo;
  * `publish()` negavo failų sąrašo, tad **joks vartas nepaleistas** — turinys
    galėjo patekti į `main` be `validate_content.py`, garso ir kalbos patikros;
  * pasiūlymai liko `new`, tad eilė tą patį darbą būtų davusi antrą kartą.

Zondas stato laikiną repo su tikru `git` ir tikrina sprendimą, kuris lemia,
ar darbas matomas, ar ne. Kiekvienas teigiamas atvejis turi porą, kuri turi
duoti NEIGIAMĄ atsakymą — kitaip taisyklė galėtų „matyti darbą“ ten, kur jo
nėra, ir priskirti svetimą (LL-45, LL-49).

  A1 modelio commit'as `[role] #7:` → failai atpažinti, pastaba įvardija sha
  A2 tas pats commit'as, bet kitas vaidmuo (`[kurejas] #7:`) → NEatpažintas
  A3 tas pats vaidmuo, bet kitas paleidimas (`#8`) → NEatpažintas
  A4 commit'as be `[role] #N:` antraštės (žmogaus / `[sistema]`) → NEatpažintas
  A5 du savo commit'ai tame pačiame intervale → sąjunga, be dublikatų
  A6 base_head nenurodytas (git istorijos nėra) → tuščia, be klaidos
  A7 base_head = HEAD (paleidimas nieko nekomitavo) → tuščia
  A8 vykdymo artefaktas (`agents/.run.x.lock`) commit'e → į sąrašą nepatenka
  A9 `undo_own_commits` atsuka SAVO commit'us (failai grįžta į base būseną)
  A10 `undo_own_commits` NEatsuka, kai tarp jų yra svetimas commit'as
  A11 `undo_own_commits` NEatsuka jau išstumto commit'o (origin/main turi jį)
  A12 tikras repo: `origin/main` neturi savo commit'ų → tuščia (kontrolinė)

Be tinklo: `origin/main` imituojamas lokaliu `git branch` / `git update-ref`.

Naudojimas:
    python3 scripts/probe_own_commits.py     # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import pathlib
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "agents"))

import run as runner  # noqa: E402

results: list[tuple[str, bool, str]] = []


def case(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'✔' if ok else 'KLAIDA'} {name} — {detail}")


def git(repo: pathlib.Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True)


def commit(repo: pathlib.Path, rel: str, text: str, subject: str) -> str:
    target = repo / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    git(repo, "add", "-A")
    git(repo, "commit", "-qm", subject)
    return git(repo, "rev-parse", "HEAD").stdout.strip()


def make_repo(base: pathlib.Path) -> pathlib.Path:
    """Laikinas repo su vienu pradiniu commit'u ir `origin/main` šaka."""
    repo = base / "repo"
    repo.mkdir()
    git(repo, "init", "-q", "-b", "main")
    git(repo, "config", "user.email", "zondas@example.invalid")
    git(repo, "config", "user.name", "zondas")
    (repo / "seed.txt").write_text("pradzia\n", encoding="utf-8")
    git(repo, "add", "-A")
    git(repo, "commit", "-qm", "pradine busena")
    # `origin/main` be tinklo: atskira šaka, kuri atstoja nutolusią.
    git(repo, "update-ref", "refs/remotes/origin/main", "HEAD")
    return repo


def main() -> int:
    base = pathlib.Path(tempfile.mkdtemp(prefix="suprask-owncommits-"))
    real_root = runner.ROOT
    try:
        repo = make_repo(base)
        runner.ROOT = repo  # visos `runner.git()` komandos vyksta laikiname repo

        head0 = runner.head_sha()
        case("A0 pradinis HEAD perskaitomas", bool(head0), head0[:12] or "tuščia")

        sha1 = commit(repo, "content/pamoka.json", '{"a": 1}\n',
                      "[sistemos-architektas] #7: modulio taisymas")
        files, shas, note = runner.own_commits_since(head0, "sistemos-architektas", 7)
        case("A1 savo commit'as atpažintas",
             files == ["content/pamoka.json"] and shas == [sha1] and "commit" in note.lower(),
             f"files={files} shas={[s[:7] for s in shas]}")

        files, shas, _ = runner.own_commits_since(head0, "kurejas", 7)
        case("A2 kito vaidmens commit'as NEatpažintas", not files and not shas, f"files={files}")

        files, shas, _ = runner.own_commits_since(head0, "sistemos-architektas", 8)
        case("A3 kito paleidimo commit'as NEatpažintas", not files and not shas, f"files={files}")

        # A4: commit'as be `[role] #N:` antraštės (žmogaus arba `[sistema]`).
        head_a4 = runner.head_sha()
        commit(repo, "content/zmogus.json", "{}\n", "[sistema] darbinės kopijos likutis")
        files, shas, _ = runner.own_commits_since(head_a4, "sistemos-architektas", 7)
        case("A4 commit'as be [role] #N: NEatpažintas", not files and not shas, f"files={files}")

        # A5: du savo commit'ai — sąjunga be dublikatų.
        base5 = runner.head_sha()
        commit(repo, "content/vienas.json", "1\n", "[sistemos-architektas] #7: pirmas")
        commit(repo, "content/du.json", "2\n", "[sistemos-architektas] #7: antras")
        files, shas, note = runner.own_commits_since(base5, "sistemos-architektas", 7)
        case("A5 du savo commit'ai → 2 failai, 2 sha",
             sorted(files) == ["content/du.json", "content/vienas.json"] and len(shas) == 2,
             f"files={sorted(files)} n={len(shas)}")

        files, shas, _ = runner.own_commits_since("", "sistemos-architektas", 7)
        case("A6 base_head tuščias → tuščia, be klaidos", not files and not shas, f"files={files}")

        files, shas, _ = runner.own_commits_since(runner.head_sha(), "sistemos-architektas", 7)
        case("A7 base_head = HEAD → tuščia", not files and not shas, f"files={files}")

        # A8: vykdymo artefaktas commit'e nepatenka į darbą.
        base8 = runner.head_sha()
        commit(repo, "agents/.run.kurejas.lock", "", "[sistemos-architektas] #7: užrakto bandymas")
        files, shas, note = runner.own_commits_since(base8, "sistemos-architektas", 7)
        case("A8 vykdymo artefaktas neįtrauktas",
             files == [] and shas, f"files={files} shas={len(shas)} note={note[:60]}")

        # A9: undo atsuka savo commit'us.
        base9 = runner.head_sha()
        commit(repo, "content/laikinas.json", "x\n", "[sistemos-architektas] #7: laikinas")
        commit(repo, "content/laikinas2.json", "y\n", "[sistemos-architektas] #7: laikinas2")
        own_files, own_shas, _ = runner.own_commits_since(base9, "sistemos-architektas", 7)
        note9 = runner.undo_own_commits(base9, own_shas)
        case("A9 savo commit'ai atsukti",
             runner.head_sha() == base9 and not (repo / "content/laikinas.json").exists()
             and "atsukta" in note9,
             f"HEAD==base:{runner.head_sha() == base9} note={note9[:60]}")

        # A10: tarp jų yra svetimas commit'as → NEatsukama.
        base10 = runner.head_sha()
        commit(repo, "content/savas.json", "s\n", "[sistemos-architektas] #7: savas")
        commit(repo, "content/svetimas.json", "k\n", "[kurejas] #9: svetimas")
        own_files, own_shas, _ = runner.own_commits_since(base10, "sistemos-architektas", 7)
        head10 = runner.head_sha()
        note10 = runner.undo_own_commits(base10, own_shas)
        case("A10 su svetimu commit'u NEatsukama",
             runner.head_sha() == head10 and "negalima" in note10 and own_files,
             f"note={note10[:70]}")

        # A11: jau išstumtas commit'as (origin/main jį turi) → NEatsukama.
        base11 = runner.head_sha()
        commit(repo, "content/istumtas.json", "p\n", "[sistemos-architektas] #7: istumtas")
        git(repo, "update-ref", "refs/remotes/origin/main", "HEAD")
        own_files, own_shas, _ = runner.own_commits_since(base11, "sistemos-architektas", 7)
        note11 = runner.undo_own_commits(base11, own_shas)
        case("A11 išstumto commit'o NEatsukama",
             "origin/main" in note11 and runner.head_sha() != base11, f"note={note11[:70]}")

        # A12: tikrame repo — savo necommitintų commit'ų nėra (kontrolinė).
        runner.ROOT = real_root
        files, shas, note = runner.own_commits_since(runner.head_sha(), "sistemos-architektas", 561)
        case("A12 tikrame repo base=HEAD → tuščia", not files and not shas, f"files={files}")
        # A13–A14 vėl dirba laikiname repo: A12 laikinai perjungė ROOT į tikrą.
        runner.ROOT = repo
        # A13: TIKRAS #542 scenarijus — modelis commit'ina pats, tada
        # surenkamas paleidimo failų sąrašas. Sena logika (`changed_files` vien)
        # duoda tuščią sąrašą, nauja — darbą, todėl vartai paleidžiami.
        base13 = runner.head_sha()
        (repo / "content").mkdir(exist_ok=True)
        (repo / "content" / "savarankiskas.json").write_text("{}\n", encoding="utf-8")
        (repo / "agents" / "log").mkdir(parents=True, exist_ok=True)
        (repo / "agents" / "log" / "sistemos-architektas-x.md").write_text("# ataskaita\n",
                                                                           encoding="utf-8")
        before13 = runner.git_snapshot()
        git(repo, "add", "-A")
        git(repo, "commit", "-qm", "[sistemos-architektas] #7: savarankiškas darbas")
        old_only = runner.changed_files(before13)
        own13, shas13, note13 = runner.own_commits_since(base13, "sistemos-architektas", 7)
        merged = sorted(set(old_only) | set(own13))
        provider = [f for f in merged if not f.startswith("agents/log/")]
        case("A13 #542 scenarijus: sena logika tuščia, nauja mato darbą",
             not old_only and merged == ["agents/log/sistemos-architektas-x.md",
                                         "content/savarankiskas.json"],
             f"changed_files={old_only} su_commitais={merged}")

        # A14: ir po sujungimo `work_files()` turi ką publikuoti — kitaip
        # `publish()` vis tiek įrašytų „Pakeista tik paleidimo ataskaita“.
        case("A14 sujungtas sąrašas turi DARBO failą (ne tik ataskaitą)",
             bool(provider) and runner.work_files(merged) == provider,
             f"work_files={provider}")
    finally:
        runner.ROOT = real_root
        shutil.rmtree(base, ignore_errors=True)

    bad = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(bad)}/{len(results)} lūkesčių išsipildė")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
