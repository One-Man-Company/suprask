#!/usr/bin/env python3
"""Zondas dingusių ID patikrai per **visą** indekso istoriją (#573).

Kodėl šis failas egzistuoja. `check_published.py` vienintelė garantija yra
„vaiko `localStorage` žyma niekada nelieka be modulio“, o ji remiasi klasės
`index.json` git istorija: modulio ID, kuris buvo indekse ir dingo, turi būti
įvardytas. Iki #573 istorija buvo skaitoma su `--max-count=400`, o pasiekus
ribą funkcija tik pridėdavo pastabą ir **grąžindavo `checked = True`**. Tai
reiškė, kad modulis, išimtas iš indekso anksčiau nei prieš 400 indekso
revizijų, nebeatpažįstamas, o įrankis vis tiek sako „sutampa“ ir rc 0 —
tyliai. Šiandien repo turi 86 indekso revizijas, bet jos auga ~3 per dieną,
tad riba būtų pasiekta per kelis mėnesius, be jokio signalo.

Zondas stato laikiną git repo su 420 indekso revizijų ir trimis moduliais:

  A `senas-modulis`      — buvo 1-oje revizijoje, išimtas 2-oje, įpėdinio nėra;
  B `lieka-modulis`      — yra visą laiką;
  C `pervadintas-senas`  — 3-oje revizijoje pervadintas į `pervadintas-naujas`
                            su `renamed_from` ir `known_renames.json` įrašu.

Tikrinama:
  A1  `historical_ids` mato `senas-modulis` (visa istorija, ne 400 revizijų);
  A2  sena, 400 revizijų ribota patikra jo **nematytų** — defektas realus,
      o ne įsivaizduojamas (ta pati `_batch_blobs` skaitymo dalis);
  B3  `vanished` įvardija jį kaip `resolved: false`, o `verdict()` tampa
      raudonas su priežastimi apie dingusį ID;
  C4  pervadinimas lieka priimtas (`resolved: true`, `alias_ok: true`) — nauja
      skaitymo dalis nesugadina to, ką senoji darė teisingai;
  D5  viršijus `HISTORY_LIMIT` patikra pranešama kaip **neįvykusi**
      (`checked: false`), o ne kaip „dingusių nėra“ (LL-37);
  E6  ne git katalogas ir kelias be istorijos irgi duoda `checked: false`;
  F7  `_batch_blobs` trūkstamą objektą žymi `None`, ne klaida, o kelias su
      tarpu (antraštėje 5 laukai) perskaitomas — skaidymas iš dešinės;
  G8  `verdict()` priežastyje įvardija **klasę** („… neįvyko (grade-01)“),
      ne tik „neįvyko“.

Naudojimas:
    python3 scripts/probe_published_history.py      # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import check_published as cp  # noqa: E402

REVISIONS = 420          # > 400, buvusios tylios ribos
PATCHED = ("ROOT", "CONTENT", "GRADES", "RENAMES")
results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")


def git(repo: pathlib.Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True)


def module(mid: str, renamed_from: list[str] | None = None) -> dict:
    entry: dict = {"id": mid, "title": mid, "file": f"grade-01/matematika/{mid}.json"}
    if renamed_from:
        entry["renamed_from"] = renamed_from
    return entry


def build(repo: pathlib.Path) -> None:
    """420 indekso revizijų per `git fast-import` (0,04 s, o ne 420 `git commit`).

    CI vartai reikalauja zondo < 5 s; 420 `git commit` procesų ant lėto
    vykdytojo viršytų tą ribą ir zondas būtų išjungtas dėl greičio, o ne dėl
    rezultato (LL-37 atvirkštinė pusė: vartas, kurio niekas nelaiko įjungto).
    """
    (repo / "content" / "lt" / "grade-01").mkdir(parents=True)
    (repo / "scripts").mkdir()
    (repo / "content" / "lt" / "grades.json").write_text(
        json.dumps({"grades": [{"grade": 1, "status": "live"}]}), encoding="utf-8")
    (repo / "scripts" / "known_renames.json").write_text(
        json.dumps({"renames": [{"grade": 1, "from": "pervadintas-senas",
                                 "to": "pervadintas-naujas"}]}),
        encoding="utf-8")
    # Kelias su tarpu: `git cat-file --batch` antraštėje `<spec>` yra mūsų
    # įvestis, tad ji gali turėti tarpų — skaidymas turi būti iš dešinės.
    (repo / "kelias su tarpu.json").write_text('{"x": 1}', encoding="utf-8")
    git(repo, "init", "-q", "-b", "main")

    stream: list[bytes] = []
    blob_mark = 100_000

    def blob(text: str) -> int:
        nonlocal blob_mark
        blob_mark += 1
        payload = text.encode("utf-8")
        stream.append(b"blob\nmark :%d\ndata %d\n" % (blob_mark, len(payload))
                      + payload + b"\n")
        return blob_mark

    def record(index: int, prev: int | None, message: str, files: list[tuple[str, int]]) -> None:
        body = message.encode("utf-8")
        stream.append(b"commit refs/heads/main\nmark :%d\ncommitter zondas "
                      b"<zondas@example.invalid> %d +0000\ndata %d\n"
                      % (index, 1_700_000_000 + index, len(body)) + body + b"\n")
        if prev is not None:
            stream.append(b"from :%d\n" % prev)
        for path, mark in files:
            stream.append(b"M 100644 :%d %s\n" % (mark, path.encode("utf-8")))
        stream.append(b"\n")

    def index_text(mods: list[dict], note: str) -> str:
        return json.dumps({"grade": 1, "note": note,
                           "strands": [{"id": "matematika", "grade": 1,
                                        "title": "Matematika", "modules": mods}]},
                          ensure_ascii=False)

    path = "content/lt/grade-01/index.json"
    grades_mark = blob(json.dumps({"grades": [{"grade": 1, "status": "live"}]}))
    renames_mark = blob(json.dumps({"renames": [{"grade": 1, "from": "pervadintas-senas",
                                                 "to": "pervadintas-naujas"}]}))
    spaced_mark = blob('{"x": 1}')
    # 1: trys moduliai.
    mark = blob(index_text([module("senas-modulis"), module("lieka-modulis"),
                            module("pervadintas-senas")], "1"))
    record(1, None, "c1: trys moduliai",
           [("content/lt/grades.json", grades_mark),
            ("scripts/known_renames.json", renames_mark),
            ("kelias su tarpu.json", spaced_mark), (path, mark)])
    # 2: `senas-modulis` išimamas be įpėdinio (tikras defektas, kurį reikia pagauti).
    mark = blob(index_text([module("lieka-modulis"), module("pervadintas-senas")], "2"))
    record(2, 1, "c2: senas-modulis išimtas", [(path, mark)])
    # 3: pervadinimas su pėdsaku.
    mark = blob(index_text([module("lieka-modulis"),
                            module("pervadintas-naujas", ["pervadintas-senas"])], "3"))
    record(3, 2, "c3: pervadinta", [(path, mark)])
    # 4..N: tikslinės revizijos, kad bendra suma viršytų buvusią 400 ribą.
    prev = 3
    for i in range(4, REVISIONS + 1):
        mark = blob(index_text([module("lieka-modulis"),
                                module("pervadintas-naujas", ["pervadintas-senas"])],
                               f"revizija {i}"))
        record(i, prev, f"c{i}", [(path, mark)])
        prev = i

    proc = subprocess.run(["git", "fast-import", "--quiet"], cwd=repo,
                          input=b"".join(stream), capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(f"fast-import nepavyko: {proc.stderr.decode()[:300]}")
    # `fast-import` kuria tik objektus — darbinė kopija lieka tuščia. O
    # `check_published.py` skaito **diską** (`index.json`, `known_renames.json`),
    # tad be šio žingsnio zondas matuotų ne tą būseną, kuri yra repo ISTORIJOJE,
    # ir klaidingai praneštų „pervadintas ID be alias“ (C4).
    git(repo, "checkout", "-f", "main")
    git(repo, "config", "user.name", "zondas")
    git(repo, "config", "user.email", "zondas@example.invalid")


def patch(root: pathlib.Path) -> None:
    cp.ROOT = root
    cp.CONTENT = root / "content" / "lt"
    cp.GRADES = cp.CONTENT / "grades.json"
    cp.RENAMES = root / "scripts" / "known_renames.json"


def main() -> int:
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_history_"))
    saved = {name: getattr(cp, name) for name in PATCHED}
    saved_limit = cp.HISTORY_LIMIT
    try:
        repo = tmp / "repo"
        repo.mkdir()
        build(repo)
        patch(repo)

        path = "content/lt/grade-01/index.json"
        total = int(git(repo, "rev-list", "--count", "HEAD").stdout.strip() or 0)
        check("0: fixture turi daugiau nei 400 indekso revizijų",
              total == REVISIONS and total > 400,
              f"{total} revizijų (buvusi riba 400)")

        ids, note, ok = cp.historical_ids(1)
        check("A1: visa istorija mato išimtą ID",
              ok and "senas-modulis" in ids and "lieka-modulis" in ids
              and "pervadintas-naujas" in ids,
              f"checked {ok}, rasta {len(ids)} ID, "
              f"senas-modulis {'yra' if 'senas-modulis' in ids else 'NĖRA'}")

        # A2 — neigiama kontrolė: ta pati skaitymo dalis, tik su sena riba.
        bounded = git(repo, "log", "--max-count=400", "--format=%h", "--", path)
        bounded_revs = bounded.stdout.split()
        blobs, err = cp._batch_blobs([f"{rev}:{path}" for rev in bounded_revs])
        old_ids: set[str] = set()
        for blob in blobs:
            if blob is None:
                continue
            for strand in json.loads(blob.decode("utf-8")).get("strands", []):
                for mod in strand.get("modules", []):
                    old_ids.add(mod["id"])
        check("A2: 400 revizijų riba jo nebematytų (defektas realus)",
              not err and "senas-modulis" not in old_ids
              and "senas-modulis" in ids,
              f"sena riba {len(bounded_revs)} rev. → {len(old_ids)} ID be "
              f"„senas-modulis“; nauja → {len(ids)} ID su juo")

        current = ["lieka-modulis", "pervadintas-naujas"]
        gone = cp.vanished(1, current)
        items = {i["id"]: i for i in gone["items"]}
        lost = items.get("senas-modulis", {})
        check("B3: `vanished` įvardija dingusį ID be įpėdinio",
              gone["checked"] and lost and lost["resolved"] is False
              and lost["successor"] == "",
              f"checked {gone['checked']}, items {sorted(items)}")

        verdict = cp.verdict({"vanished_ids": gone["items"], "unpushed_checked": True})
        check("B3: `verdict()` dėl jo tampa raudonas ir įvardija priežastį",
              not verdict["ok"] and any("dingęs ID" in r for r in verdict["reasons"]),
              f"ok {verdict['ok']}, priežastys {verdict['reasons']}")

        renamed = items.get("pervadintas-senas", {})
        check("C4: pervadinimas lieka priimtas (resolved + alias_ok)",
              renamed.get("resolved") is True and renamed.get("alias_ok") is True
              and "pervadintas-senas" not in current,
              f"resolved {renamed.get('resolved')}, alias_ok {renamed.get('alias_ok')}")

        cp.HISTORY_LIMIT = 10
        ids_lim, note_lim, ok_lim = cp.historical_ids(1)
        check("D5: viršyta riba — neįvykusi patikra, ne „dingusių nėra“",
              ok_lim is False and ids_lim == {} and "didesnė už 10" in note_lim,
              f"checked {ok_lim}, pastaba „{note_lim}“")
        cp.HISTORY_LIMIT = saved_limit

        plain = tmp / "ne-git"
        (plain / "content" / "lt" / "grade-01").mkdir(parents=True)
        (plain / "content" / "lt" / "grade-01" / "index.json").write_text(
            "{}", encoding="utf-8")
        patch(plain)
        ids_git, note_git, ok_git = cp.historical_ids(1)
        check("E6: ne git katalogas — patikra neįvyko",
              ok_git is False and ids_git == {} and "git" in note_git,
              f"checked {ok_git}, pastaba „{note_git[:90]}“")

        patch(repo)
        no_path = "content/lt/grade-01/nera.json"
        blobs_none, err_none = cp._batch_blobs([f"HEAD:{no_path}", "HEAD:README.md",
                                                "HEAD:kelias su tarpu.json"])
        check("F7: trūkstamas objektas → `None`, kelias su tarpu skaitomas",
              not err_none and blobs_none[0] is None and blobs_none[1] is None
              and blobs_none[2] == b'{"x": 1}',
              f"klaida „{err_none}“, reikšmės "
              f"{[None if b is None else b for b in blobs_none]}")

        # E6 antras kelias: kelio istorija tuščia → irgi ne „švaru“.
        cp.CONTENT = repo / "content" / "lt"
        empty = repo / "content" / "lt" / "grade-09"
        empty.mkdir()
        (empty / "index.json").write_text("{}", encoding="utf-8")
        ids_empty, note_empty, ok_empty = cp.historical_ids(9)
        check("E6: indekso be istorijos nepavadina švaria patikra",
              ok_empty is False and ids_empty == {} and "negrąžino" in note_empty,
              f"checked {ok_empty}, pastaba „{note_empty[:90]}“")

        # G8: priežastis įvardija **klasę**, ne tik „neįvyko“. Be jos mokytojas
        # ar agentas žino, kad kažkas ne taip, bet ne kur (LL-21: priežastis
        # turi siųsti prie matavimo, ne prie nuotaikos).
        reason = cp.verdict({"unpushed_checked": True, "scope_checked": True,
                             "history_unchecked": [1, 9]})["reasons"]
        check("G8: `verdict()` priežastyje įvardija klases",
              reason == ["dingusių ID patikra neįvyko (grade-01, grade-09)"],
              f"priežastys {reason}")
    finally:
        cp.HISTORY_LIMIT = saved_limit
        for name, value in saved.items():
            setattr(cp, name, value)
        shutil.rmtree(tmp, ignore_errors=True)

    failed = [name for name, ok, _ in results if not ok]
    print()
    print(f"{len(results) - len(failed)}/{len(results)} lūkesčių išsipildė"
          + (f"; nepraėjo: {', '.join(failed)}" if failed else ""))
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
