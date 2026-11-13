/**
 * Kalbinio ugdymo simuliacijos (1 klasė).
 * Principas: vaikas girdi, mato, spaudžia — ir pats atranda ryšį tarp garso ir raidės.
 */

import { art } from "./art.js";

const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

/* ------------------------------------------------------------------ */
/* 1. Pirmas garsas → raidė                                            */
/* ------------------------------------------------------------------ */
const garsoRaides = {
  mount({ stage, controls, api, config }) {
    let items = shuffle(config.items || []);
    let i = 0;
    let emojiEl = null;
    let wordEl = null;
    let hintEl = null;
    let lettersWrap = null;
    let reported = false; // api.progress — tik įveikus visas raides (§4)

    function paintStage() {
      stage.innerHTML = `
        <div style="text-align:center;max-width:34rem">
          <button class="picture" data-tap style="border:0;background:transparent;cursor:pointer;padding:.5rem">
            <span id="gr-emoji" style="font-size:clamp(4rem,18vw,7rem);line-height:1"></span>
            <span id="gr-word" style="display:block;font-family:var(--font-head);font-weight:900;font-size:clamp(1.4rem,6vw,2rem);margin-top:.4rem;min-height:2.2rem"></span>
          </button>
          <p class="sim-note" id="gr-hint">Spausk paveikslėlį ir paklausyk žodžio. Tada pasirink pirmą raidę.</p>
        </div>`;
      controls.innerHTML = `<div id="gr-letters" style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center"></div>`;
      emojiEl = stage.querySelector("#gr-emoji");
      wordEl = stage.querySelector("#gr-word");
      hintEl = stage.querySelector("#gr-hint");
      lettersWrap = controls.querySelector("#gr-letters");
      api.note("");
      stage.querySelector(".picture").addEventListener("click", () => {
        const item = items[i % items.length];
        api.speak(item.word, { rate: .8 });
        wordEl.textContent = "…";
        hintEl.textContent = "Klausykis pirmo garso. Kokia raidė jį žymi?";
      });
    }

    function draw() {
      const item = items[i % items.length];
      emojiEl.textContent = item.emoji;
      wordEl.textContent = "?";
      api.readout(`Žodis ${i + 1} iš ${items.length}`);
      const opts = shuffle(item.options || [item.letter, "M", "S", "L"].filter((l, idx, a) => a.indexOf(l) === idx).slice(0, 4));
      lettersWrap.innerHTML = opts.map((l) => `<button class="btn secondary" data-letter="${l}" style="min-width:4.2rem;font-size:1.5rem;font-weight:900">${l}</button>`).join("");
      lettersWrap.querySelectorAll("[data-letter]").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.dataset.letter === item.letter) {
            b.classList.add("correct");
            b.style.borderColor = "var(--ok)";
            api.readout(`${item.letter} — ${item.word}`);
            api.note("Teisingai! Pasakyk žodį garsiai ir parodyk raidę.");
            wordEl.textContent = item.word;
            api.speak(item.word);
            /* Pažanga čia nežymima: tai dar viena raidė iš kelių (§4). */
            i += 1;
            setTimeout(() => { if (i < items.length) draw(); else finish(); }, 1400);
          } else {
            api.note("Paklausyk dar kartą ir atkreipk dėmesį į pirmą garsą.");
            api.speak(item.word, { rate: .8 });
            b.classList.add("wiggle");
            setTimeout(() => b.classList.remove("wiggle"), 500);
          }
        });
      });
    }

    function finish() {
      stage.innerHTML = `<div style="text-align:center;padding:1rem">
        <div style="font-size:4rem">🎉</div>
        <p style="font-family:var(--font-head);font-weight:900;font-size:1.4rem">Įveikei visas raides!</p>
        <p class="sim-note">Dabar pasakyk: kurie du žodžiai prasideda ta pačia raide?</p></div>`;
      api.readout("Visos raidės įveiktos");
      /* Tikslas pasiektas DABAR — visos raidės, o ne viena (§4). */
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
      controls.innerHTML = `<button class="btn" id="gr-again">Bandyti dar kartą</button>`;
      controls.querySelector("#gr-again").addEventListener("click", () => {
        i = 0;
        items = shuffle(items);
        paintStage();
        draw();
      });
    }

    paintStage();
    draw();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 2. Skiemenų jungimas                                                */
/* ------------------------------------------------------------------ */
const skiemenuJungimas = {
  mount({ stage, controls, api, config }) {
    const words = config.words || [];
    let w = 0;
    const timers = [];

    stage.innerHTML = `
      <div style="text-align:center">
        <div id="sj-tiles" style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;min-height:5rem;align-items:center"></div>
        <p class="sim-note" id="sj-hint">Spausk po vieną skiemenį, paskui — „Skaityk kartu“.</p>
      </div>`;
    controls.innerHTML = `
      <button class="btn" id="sj-join">Skaityk kartu</button>
      <button class="btn secondary" id="sj-next">Kitas žodis →</button>`;
    const tilesEl = stage.querySelector("#sj-tiles");
    const hintEl = stage.querySelector("#sj-hint");

    function draw() {
      const item = words[w % words.length];
      tilesEl.innerHTML = item.syllables.map((s) => `
        <button class="btn secondary" data-syl="${s}" style="font-size:1.8rem;font-weight:900;padding:1rem 1.4rem">${s}</button>`).join("");
      tilesEl.querySelectorAll("[data-syl]").forEach((b) => {
        b.addEventListener("click", () => {
          api.speak(b.dataset.syl, { rate: .75 });
          b.style.borderColor = "var(--accent)";
          setTimeout(() => { b.style.borderColor = ""; }, 500);
        });
      });
      api.readout("Skiemenys");
      hintEl.textContent = "Spausk po vieną skiemenį, paskui — „Skaityk kartu“.";
      api.note("");
    }

    controls.querySelector("#sj-join").addEventListener("click", () => {
      const item = words[w % words.length];
      tilesEl.querySelectorAll("[data-syl]").forEach((b, idx) => {
        timers.push(setTimeout(() => {
          b.style.background = "var(--sun)";
          b.style.borderColor = "var(--ink)";
        }, idx * 380));
      });
      timers.push(setTimeout(() => {
        api.speak(item.word, { rate: .85 });
        api.readout(item.word);
        hintEl.textContent = "Dabar pasakyk visą žodį be pauzių — kaip suaugęs.";
      }, item.syllables.length * 380 + 120));
    });

    controls.querySelector("#sj-next").addEventListener("click", () => {
      w += 1;
      draw();
    });

    draw();
    return () => timers.forEach(clearTimeout);
  },
};

/* ------------------------------------------------------------------ */
/* 3. Sakinio tvarka                                                   */
/* ------------------------------------------------------------------ */
const sakinioTvarka = {
  mount({ stage, controls, api, config }) {
    const sentences = config.sentences || [];
    let s = 0;
    let chosen = [];
    let observer = null;
    let reported = false;  // api.progress — tik sudėjus visus sakinius (§4)
    let finished = false;
    let locked = false;    // sakinys jau sudėtas — laukiama kito

    stage.innerHTML = `
      <div style="width:100%;max-width:40rem">
        <div id="st-slots" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;min-height:4.5rem;padding:.8rem;border:2px dashed var(--line);border-radius:var(--r-m);background:var(--paper)"></div>
        <div id="st-bank" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;margin-top:1rem"></div>
        <p class="sim-note" id="st-msg"></p>
      </div>`;
    controls.innerHTML = `<button class="btn secondary" id="st-clear">Iš naujo</button>`;
    const slotsEl = stage.querySelector("#st-slots");
    const bankEl = stage.querySelector("#st-bank");
    const msgEl = stage.querySelector("#st-msg");

    function current() { return sentences[s % sentences.length]; }

    function draw() {
      chosen = [];
      finished = false;
      locked = false;
      const words = shuffle(current());
      slotsEl.innerHTML = "";
      bankEl.innerHTML = words.map((w2, i) => `<button class="btn secondary" data-w="${i}" data-word="${w2}">${w2}</button>`).join("");
      bankEl.querySelectorAll("[data-w]").forEach((b) => {
        b.addEventListener("click", () => {
          b.disabled = true;
          b.style.opacity = ".35";
          chosen.push(b.dataset.word);
          api.speak(b.dataset.word, { rate: .85 });
          renderSlots();
        });
      });
      renderSlots();
      msgEl.textContent = "Dėliok žodžius iš kairės į dešinę. Sakinys prasideda didžiąja raide.";
    }

    function renderSlots() {
      slotsEl.innerHTML = chosen.map((w2, i) => `<button class="btn secondary" data-slot="${i}">${w2}</button>`).join("") ||
        `<span style="color:var(--ink-faint);align-self:center">Čia dėsis žodžiai…</span>`;
      slotsEl.querySelectorAll("[data-slot]").forEach((b) => {
        b.addEventListener("click", () => {
          const idx = Number(b.dataset.slot);
          chosen.splice(idx, 1);
          bankEl.querySelectorAll("[data-w]").forEach((x) => {
            x.disabled = false; x.style.opacity = "1";
          });
          renderSlots();
        });
      });
    }

    function finish() {
      finished = true;
      chosen = [];
      slotsEl.innerHTML = "";
      bankEl.innerHTML = "";
      msgEl.textContent = "Sudėjai visus sakinius!";
      api.readout("Visi sakiniai sudėti");
      api.note("Sudėjai visus sakinius. Pasakyk vieną iš jų draugui — jis turi suprasti iš pirmo karto.");
      api.speak("Sudėjai visus sakinius!");
      /* Tikslas pasiektas DABAR — paskutinis sakinys, o ne pirmas (§4). */
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    controls.querySelector("#st-clear").addEventListener("click", draw);

    /* automatinis patikrinimas, kai sudėti visi žodžiai */
    observer = new MutationObserver(() => {
      if (finished || locked) return;
      if (chosen.length !== current().length) return;
      const okWords = chosen.join(" ") === current().join(" ");
      if (okWords) {
        locked = true;
        msgEl.textContent = "Teisingai! Perskaityk sakinį garsiai.";
        api.readout("Sakinys sudėtas");
        api.speak(current().join(" "), { rate: .85 });
        /* Pažanga čia nežymima: tai dar vienas sakinys iš kelių (§4). */
        setTimeout(() => { s += 1; if (s < sentences.length) draw(); else finish(); }, 2200);
      } else {
        msgEl.textContent = "Dar ne. Perskaityk, kas gavosi — ar sakinys turi prasmę?";
      }
    });
    observer.observe(slotsEl, { childList: true });

    draw();
    return () => { if (observer) observer.disconnect(); };
  },
};

/* ------------------------------------------------------------------ */
/* 4. Kalbos vartojimo tyrimas: „Kaip žmonės sveikinasi?“              */
/* ------------------------------------------------------------------ */
/* Modelis: vienintelis kintamasis — pastebėjimų skaičius, o išvada
   apskaičiuojama iš sukauptų duomenų. Todėl išvada keičiasi tik tada,
   kai pasikeičia pastebėjimai, o ne atskirai įrašyta teksto eilute.
   Žmonių eilė fiksuota sąmoningai (jokio Math.random): tas pats tyrimas
   visada atkuriamas, o trečias žmogus tyčia sveikinasi kitaip — be
   prieštaraujančio atvejo modelis neįrodytų, kad pirma išvada netinka. */
const kaipZmonesSveikinasi = {
  mount({ stage, controls, api, config }) {
    const groups = Array.isArray(config.groups) ? config.groups : [];
    const people = Array.isArray(config.people) ? config.people : [];
    const ORDINALS = ["Pirmas", "Antras", "Trečias", "Ketvirtas", "Penktas", "Šeštas", "Septintas", "Aštuntas"];

    if (!groups.length || !people.length) {
      stage.innerHTML = `<p class="error-box">Tyrimo duomenų nėra.</p>`;
      return null;
    }

    const counts = {};
    groups.forEach((g) => { counts[g.id] = 0; });

    let seen = 0;        // vienintelis modelio kintamasis
    let first = null;    // pirma vaiko užrašyta išvada { text, at }
    let reported = false;

    function barsMarkup() {
      return groups.map((g) => `
        <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
          <span style="flex:0 0 auto;min-width:6.6rem;font-weight:800;font-size:clamp(.98rem,3.6vw,1.1rem)">${g.label}</span>
          <span aria-hidden="true" style="flex:1 1 4.5rem;min-width:3rem;height:.85rem;display:block;overflow:hidden;border-radius:999px;background:var(--line)">
            <span id="kz-bar-${g.id}" style="display:block;height:100%;width:0%;border-radius:999px;background:var(--accent)"></span>
          </span>
          <strong id="kz-n-${g.id}" style="flex:0 0 1.5rem;text-align:right;font-size:clamp(1rem,3.8vw,1.15rem)">0</strong>
        </div>`).join("");
    }

    stage.innerHTML = `
      <div style="width:100%;max-width:36rem">
        <p id="kz-question" style="margin:0 0 .6rem;text-align:center;font-family:var(--font-head);font-weight:900;font-size:clamp(1rem,3.6vw,1.2rem)"></p>
        <div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:.7rem .6rem;border:2px dashed var(--line);border-radius:var(--r-m);background:var(--paper)">
          <div id="kz-emoji" aria-hidden="true" style="font-size:clamp(2.4rem,11vw,3.4rem);line-height:1">🏫</div>
          <div id="kz-said" style="font-family:var(--font-head);font-weight:900;font-size:clamp(1.06rem,4vw,1.3rem);text-align:center;overflow-wrap:anywhere">Dar nieko</div>
          <div id="kz-who" style="font-size:var(--fs-s);color:var(--ink-soft);text-align:center">Spausk „Sekantis žmogus“</div>
        </div>
        <div style="display:grid;gap:.4rem;margin-top:.8rem">${barsMarkup()}</div>
        <div style="margin-top:.8rem;padding:.6rem .8rem;border-left:4px solid var(--sun);border-radius:var(--r-s);background:var(--paper)">
          <p style="margin:0;font-size:clamp(.98rem,3.6vw,1.1rem)">Pastebėjimų: <strong id="kz-total">0</strong></p>
          <p style="margin:.25rem 0 0;font-size:clamp(.98rem,3.6vw,1.1rem)">Išvada: <strong id="kz-conc">dar nieko</strong></p>
          <p id="kz-first" hidden style="margin:.35rem 0 0;font-size:clamp(.95rem,3.4vw,1.06rem);color:var(--ink-soft)"></p>
        </div>
      </div>`;
    controls.innerHTML = `
      <button class="btn" id="kz-next">Sekantis žmogus</button>
      <button class="btn secondary" id="kz-say">Mano išvada</button>`;

    const emojiEl = stage.querySelector("#kz-emoji");
    const saidEl = stage.querySelector("#kz-said");
    const whoEl = stage.querySelector("#kz-who");
    const totalEl = stage.querySelector("#kz-total");
    const concEl = stage.querySelector("#kz-conc");
    const firstEl = stage.querySelector("#kz-first");
    const nextEl = controls.querySelector("#kz-next");
    const sayEl = controls.querySelector("#kz-say");
    const barEls = {};
    const countEls = {};
    groups.forEach((g) => {
      barEls[g.id] = stage.querySelector(`#kz-bar-${g.id}`);
      countEls[g.id] = stage.querySelector(`#kz-n-${g.id}`);
    });

    const questionEl = stage.querySelector("#kz-question");
    if (questionEl) questionEl.textContent = config.question || "Kaip žmonės sveikinasi?";

    function total() {
      return groups.reduce((sum, g) => sum + counts[g.id], 0);
    }

    /* Išvada — ne tekstas iš sąrašo, o skaičiavimas iš duomenų.
       Kol pastebėtas vienas būdas, sakome „visi“; kai atsiranda antras,
       ta pati funkcija duoda „daugiausia“. Šis pasikeitimas ir yra
       mokymosi objektas. */
    function conclusion() {
      if (!total()) return null;
      const seenGroups = groups.filter((g) => counts[g.id] > 0);
      if (seenGroups.length === 1) return seenGroups[0].single;
      const best = Math.max(...seenGroups.map((g) => counts[g.id]));
      const top = seenGroups.filter((g) => counts[g.id] === best);
      if (top.length > 1) return config.tie || "Daugiausia — po lygiai.";
      return top[0].many;
    }

    function render() {
      totalEl.textContent = String(total());
      concEl.textContent = conclusion() || "dar nieko";
      groups.forEach((g) => {
        if (barEls[g.id]) barEls[g.id].style.width = `${Math.round((counts[g.id] / people.length) * 100)}%`;
        if (countEls[g.id]) countEls[g.id].textContent = String(counts[g.id]);
      });
      if (first) {
        firstEl.hidden = false;
        firstEl.textContent = `Pirma išvada (pastebėjimų: ${first.at}): „${first.text}“`;
      } else {
        firstEl.hidden = true;
        firstEl.textContent = "";
      }
      nextEl.textContent = seen >= people.length ? "Pradėti iš naujo" : "Sekantis žmogus";
    }

    /* Sėkmės sąlyga tikrinama iš DABARTINĖS būsenos (§4): visi žmonės
       pastebėti IR vaiko išvada užrašyta. Ne iš įvykių istorijos. */
    function maybeProgress() {
      if (reported) return;
      if (seen < people.length || !first) return;
      reported = true;
      api.progress({ correct: true });
    }

    function finish() {
      const now = conclusion();
      api.readout("Pastebėjai visus žmones");
      if (!first) {
        api.note("Pastebėjai visus. Dabar spausk „Mano išvada“ ir palygink.");
      } else if (now && now !== first.text) {
        api.note(`Pirma išvada: „${first.text}“ Dabar: „${now}“`);
      } else {
        api.note("Pirma išvada liko ta pati. Pastebėjimai ją patvirtino.");
      }
    }

    function reset() {
      seen = 0;
      groups.forEach((g) => { counts[g.id] = 0; });
      first = null;
      emojiEl.textContent = "🏫";
      saidEl.textContent = "Dar nieko";
      whoEl.textContent = "Spausk „Sekantis žmogus“";
      api.readout("");
      api.note("Pradėk iš naujo. Spausk „Sekantis žmogus“ ir skaičiuok.");
      render();
    }

    nextEl.addEventListener("click", () => {
      if (seen >= people.length) { reset(); return; }
      const person = people[seen];
      const group = groups.find((g) => g.id === person.group);
      if (!group) { api.note("Šio žmogaus grupė nerasta."); return; }
      const beforeText = conclusion();
      seen += 1;
      counts[group.id] += 1;
      emojiEl.textContent = group.emoji || "";
      saidEl.textContent = person.label || group.label;
      whoEl.textContent = `${ORDINALS[seen - 1] || seen} sutiktas žmogus`;
      api.readout(`${seen} iš ${people.length} žmonių`);
      api.speak(person.label || group.label);
      render();
      const nowText = conclusion();
      if (seen === people.length) {
        finish();
      } else if (!first) {
        api.note(seen === 1
          ? "Pirmas pastebėjimas. Užrašyk savo išvadą — spausk „Mano išvada“."
          : "Dar vienas pastebėjimas. Ar išvada dar tinka?");
      } else if (nowText !== beforeText) {
        /* Apie pasikeitimą sakoma TIK tą kartą, kai jis įvyksta. */
        api.note("Išvada pasikeitė. Taip nutinka, kai pastebi daugiau žmonių.");
      } else {
        api.note("Stebėk toliau ir skaičiuok.");
      }
      maybeProgress();
    });

    sayEl.addEventListener("click", () => {
      const now = conclusion();
      if (!now) { api.note("Pirmiausia pastebėk bent vieną žmogų."); return; }
      if (first) {
        api.note("Pirma išvada jau užrašyta. Nauji pastebėjimai parodys, ar ji tinka.");
        return;
      }
      first = { text: now, at: seen };
      render();
      api.readout(`Išvada: ${now}`);
      api.note("Išvada užrašyta. Stebėk toliau ir žiūrėk, ar ji išlieka.");
      maybeProgress();
    });

    render();
    api.note("Spausk „Sekantis žmogus“ ir skaičiuok. Išvadą pasakyk, kai nori.");
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 5. Plakatas: kur ieškoti atsakymo                                   */
/* ------------------------------------------------------------------ */
/* Skaitymo sritis B: B.1.2 (randa tekste aiškiai pateiktą informaciją)
   ir B.3.1 (remiasi iliustracijomis). Modelis: vaikas ieško ne atsakymo
   iš atminties, o tos plakato dalies, kurioje atsakymas pateiktas.
   Parametras — piešinių rodymas: juos paslėpus, dalis klausimų nebe-
   atsakoma, todėl vaikas pats pamato, kad piešinys neša informaciją,
   o ne tik puošia. Skaitliukas skaičiuoja ne „taškus“, o tai, KUR
   informacija buvo rasta. */

/** Berniukas tamsoje, priekis į žiūrovą: du atšvaitai (prie kojos, ant kuprinės). */
const plakatasBerniukas = () => `<svg viewBox="70 88 110 80" role="img" aria-hidden="true"
  style="display:block;width:100%;max-width:16rem;height:auto;margin:0 auto;max-height:9rem">
  ${art.defs("pi-boy")}
  ${art.kid(104, 158, 1.4, "#3f5d8a", "#f2c9a0")}
  <path d="M114 128 q18 4 24 -8" stroke="#3f5d8a" stroke-width="6" stroke-linecap="round" fill="none"/>
  ${art.block(132, 116, 30, "#b9552c", "")}
  <path d="M140 116 q6 -10 14 0" stroke="#7c3a1d" stroke-width="3" fill="none" stroke-linecap="round"/>
  <line x1="92" y1="120" x2="92" y2="133" stroke="#7c8894" stroke-width="2"/>
  ${art.ball(92, 141, 8, "#eef3f8", "#8fa3b3")}
  ${art.ball(147, 128, 7, "#eef3f8", "#8fa3b3")}
</svg>`;

/** Dviratis iš šono: baltas žibintas prie vairo (priekyje), raudonas atšvaitas gale. */
const plakatasDviratis = () => `<svg viewBox="34 54 152 106" role="img" aria-hidden="true"
  style="display:block;width:100%;max-width:16rem;height:auto;margin:0 auto;max-height:9rem">
  ${art.ball(62, 126, 22, "#3c424a", "#23282e")}
  ${art.ball(158, 126, 22, "#3c424a", "#23282e")}
  <circle cx="62" cy="126" r="4" fill="#e8eef3"/>
  <circle cx="158" cy="126" r="4" fill="#e8eef3"/>
  <g stroke="#2f5d8a" stroke-width="5" fill="none" stroke-linecap="round">
    <path d="M62 126 L104 88 L146 86"/>
    <path d="M62 126 L112 126"/>
    <path d="M104 88 L112 126"/>
    <path d="M112 126 L146 86"/>
    <path d="M146 86 L158 126"/>
    <path d="M146 86 L146 70"/>
    <path d="M137 68 L157 68"/>
    <path d="M96 84 L112 84"/>
  </g>
  <g stroke="#ffd24d" stroke-width="2.6" stroke-linecap="round">
    <line x1="164" y1="70" x2="175" y2="66"/>
    <line x1="165" y1="75" x2="177" y2="75"/>
    <line x1="164" y1="80" x2="175" y2="84"/>
  </g>
  ${art.ball(156, 75, 7, "#ffffff", "#96a3ad")}
  <line x1="56" y1="112" x2="60" y2="104" stroke="#8f2626" stroke-width="2"/>
  <polygon points="60,96 68,104 60,112 52,104" fill="#d64545" stroke="#8f2626" stroke-width="2"/>
</svg>`;

const PLAKATAS_PIESINIAI = {
  berniukas: plakatasBerniukas,
  dviratis: plakatasDviratis,
};

const plakatasIrInformacija = {
  mount({ stage, controls, api, config }) {
    const poster = (config && config.poster) || {};
    const zones = Array.isArray(poster.zones) ? poster.zones : [];
    const questions = Array.isArray(poster.questions) ? poster.questions : [];

    if (!zones.length || !questions.length) {
      stage.innerHTML = `<p class="error-box">Plakato duomenų nėra.</p>`;
      return null;
    }

    const timers = [];
    let qi = 0;
    let hidden = false;      // piešiniai paslėpti — modelio parametras
    let answered = false;    // dabartinis klausimas jau atsakytas
    let reported = false;
    const tally = { uzrasas: 0, piesinys: 0 };

    const zoneById = {};
    zones.forEach((z) => { zoneById[z.id] = z; });

    const posterTitle = poster.title || "Plakatas";

    let zonesEl = null;
    let questionEl = null;
    let countEl = null;
    let toggleEl = null;
    let nextEl = null;

    function zoneMarkup(z) {
      const kindWord = z.kind === "piesinys" ? "Piešinys" : "Užrašas";
      const body = z.kind === "piesinys"
        ? `<span class="pi-pic" data-pic="${z.id}" style="display:block;margin-top:.3rem">${
          (PLAKATAS_PIESINIAI[z.art] || (() => `<span style="display:block;min-height:4.6rem"></span>`))()
        }</span>`
        : `<span style="display:block;margin-top:.25rem;font-family:var(--font-head);font-weight:700;font-size:clamp(.98rem,3.6vw,1.1rem);line-height:1.32">${z.text || ""}</span>`;
      return `<button type="button" class="pi-zone" data-zone="${z.id}"
        aria-label="${z.label || kindWord}${z.alt ? ". " + z.alt : ""}"
        style="display:block;width:100%;${z.kind === "piesinys" ? "grid-column:1 / -1;" : ""}min-height:4.8rem;text-align:left;padding:.5rem .55rem;border:2px solid var(--line);border-radius:var(--r-s);background:var(--paper);cursor:pointer;font:inherit;color:inherit">
        <span style="display:block;font-size:.72rem;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-soft)">${kindWord}</span>
        ${body}
      </button>`;
    }

    function plural(n, one, few, many) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return one;
      if (mod10 >= 2 && mod10 <= 9 && !(mod100 >= 11 && mod100 <= 19)) return few;
      return many;
    }

    function resetMarks() {
      zonesEl.querySelectorAll("[data-zone]").forEach((b) => { b.style.boxShadow = ""; });
    }

    function renderCount() {
      if (!tally.uzrasas && !tally.piesinys) {
        countEl.textContent = "Atsakymo ieškok abiejose dalyse: užrašuose ir piešiniuose.";
        return;
      }
      countEl.textContent = `Užraše rasta: ${tally.uzrasas} · piešinyje rasta: ${tally.piesinys}`;
    }

    function current() {
      return questions[qi % questions.length];
    }

    function showQuestion() {
      answered = false;
      resetMarks();
      const q = current();
      questionEl.textContent = q.label;
      nextEl.style.display = "none";
      api.readout(q.label);
      api.speak(q.label);
      api.note("Spausk tą plakato dalį, kuri atsako į klausimą.");
      renderCount();
    }

    function applyHidden() {
      zones.forEach((z) => {
        if (z.kind !== "piesinys") return;
        const wrap = zonesEl.querySelector(`[data-pic="${z.id}"]`);
        if (!wrap) return;
        if (hidden) {
          wrap.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;min-height:4.6rem;border:2px dashed var(--line);border-radius:var(--r-s);color:var(--ink-soft);font-size:.95rem;text-align:center;padding:.3rem">Piešinys paslėptas</span>`;
        } else {
          wrap.innerHTML = (PLAKATAS_PIESINIAI[z.art] || (() => ""))();
        }
      });
      toggleEl.textContent = hidden ? "Rodyti piešinius" : "Slėpti piešinius";
      toggleEl.setAttribute("aria-pressed", hidden ? "true" : "false");
    }

    function onZoneClick(event) {
      const btn = event.target.closest("[data-zone]");
      if (!btn || answered) return;
      const zone = zoneById[btn.dataset.zone];
      if (!zone) return;

      if (hidden && zone.kind === "piesinys") {
        api.note("Piešinys paslėptas. Spausk „Rodyti piešinius“ ir pažiūrėk.");
        return;
      }

      const q = current();
      if (zone.id === q.zone) {
        answered = true;
        tally[zone.kind] += 1;
        btn.style.boxShadow = "inset 0 0 0 4px var(--ok)";
        api.readout(`Atsakymas rastas: ${zone.label}`);
        api.speak(zone.label);
        api.note(q.result || "Atsakymas yra šioje dalyje.");
        nextEl.style.display = "";
        nextEl.textContent = qi + 1 < questions.length ? "Kitas klausimas →" : "Baigti";
        renderCount();
        return;
      }

      const miss = (q.miss && q.miss[zone.id]) || "Ši plakato dalis į klausimą neatsako. Ieškok toliau.";
      api.note(miss);
      btn.style.boxShadow = "inset 0 0 0 3px var(--sun)";
      timers.push(setTimeout(() => { btn.style.boxShadow = ""; }, 1100));
    }

    function onNext() {
      if (qi + 1 < questions.length) {
        qi += 1;
        showQuestion();
      } else {
        finish();
      }
    }

    function onToggle() {
      hidden = !hidden;
      applyHidden();
      api.note(hidden
        ? "Piešiniai paslėpti. Pabandyk atsakyti toliau — ar visada pavyksta?"
        : "Piešiniai vėl matomi. Ar atsakymas atsirado?");
    }

    function paint() {
      stage.innerHTML = `
        <div style="width:100%;max-width:44rem">
          <p id="pi-question" style="margin:0 0 .5rem;text-align:center;font-family:var(--font-head);font-weight:900;font-size:clamp(1.02rem,4vw,1.25rem);line-height:1.3"></p>
          <div style="border:3px solid var(--line);border-radius:var(--r-m);background:#fffdf6;padding:.55rem .55rem .7rem">
            <p style="margin:0 0 .5rem;text-align:center;font-family:var(--font-head);font-weight:900;letter-spacing:.04em;font-size:clamp(.9rem,3.4vw,1rem);text-transform:uppercase;color:var(--ink-soft)">${posterTitle}</p>
            <div id="pi-zones" style="display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(min(100%, 14rem), 1fr))"></div>
          </div>
          <p id="pi-count" style="margin:.55rem 0 0;text-align:center;font-size:clamp(.95rem,3.5vw,1.05rem);color:var(--ink-soft)"></p>
        </div>`;
      controls.innerHTML = `
        <button class="btn secondary" id="pi-toggle" aria-pressed="false">Slėpti piešinius</button>
        <button class="btn" id="pi-next" style="display:none">Kitas klausimas →</button>`;

      zonesEl = stage.querySelector("#pi-zones");
      questionEl = stage.querySelector("#pi-question");
      countEl = stage.querySelector("#pi-count");
      toggleEl = controls.querySelector("#pi-toggle");
      nextEl = controls.querySelector("#pi-next");

      zonesEl.innerHTML = zones.map(zoneMarkup).join("");
      zonesEl.addEventListener("click", onZoneClick);
      nextEl.addEventListener("click", onNext);
      toggleEl.addEventListener("click", onToggle);

      applyHidden();
      showQuestion();
    }

    function finish() {
      stage.innerHTML = `
        <div style="text-align:center;padding:.4rem;max-width:34rem">
          <p style="margin:0;font-family:var(--font-head);font-weight:900;font-size:clamp(1.1rem,4.2vw,1.35rem)">Atsakymus radai abiejose dalyse.</p>
          <p style="margin:.4rem 0 0">Užraše: ${tally.uzrasas} ${plural(tally.uzrasas, "atsakymą", "atsakymus", "atsakymų")}.</p>
          <p style="margin:.15rem 0 0">Piešinyje: ${tally.piesinys} ${plural(tally.piesinys, "atsakymą", "atsakymus", "atsakymų")}.</p>
          <p class="sim-note" style="margin-top:.6rem">Plakate informacija būna ir užrašyta, ir nupiešta. Atsakymo ieškok abiejose vietose.</p>
        </div>`;
      controls.innerHTML = `<button class="btn" id="pi-again">Bandyti dar kartą</button>`;
      controls.querySelector("#pi-again").addEventListener("click", () => {
        qi = 0;
        tally.uzrasas = 0;
        tally.piesinys = 0;
        hidden = false;
        paint();
      });
      api.readout("Atsakymus radai ir užrašuose, ir piešiniuose.");
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    paint();
    return () => timers.forEach(clearTimeout);
  },
};

export const SIMS = {
  "garso-raides": garsoRaides,
  "skiemenu-jungimas": skiemenuJungimas,
  "sakinio-tvarka": sakinioTvarka,
  "kaip-zmones-sveikinasi": kaipZmonesSveikinasi,
  "plakatas-ir-informacija": plakatasIrInformacija,
};
