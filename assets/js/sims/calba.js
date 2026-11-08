/**
 * Kalbinio ugdymo simuliacijos (1 klasė).
 * Principas: vaikas girdi, mato, spaudžia — ir pats atranda ryšį tarp garso ir raidės.
 */

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

export const SIMS = {
  "garso-raides": garsoRaides,
  "skiemenu-jungimas": skiemenuJungimas,
  "sakinio-tvarka": sakinioTvarka,
  "kaip-zmones-sveikinasi": kaipZmonesSveikinasi,
};
