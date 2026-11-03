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
            api.progress({ correct: true });
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

    controls.querySelector("#st-clear").addEventListener("click", draw);

    /* automatinis patikrinimas, kai sudėti visi žodžiai */
    observer = new MutationObserver(() => {
      if (chosen.length !== current().length) return;
      const okWords = chosen.join(" ") === current().join(" ");
      if (okWords) {
        msgEl.textContent = "Teisingai! Perskaityk sakinį garsiai.";
        api.readout("Sakinys sudėtas");
        api.speak(current().join(" "), { rate: .85 });
        api.progress({ correct: true });
        setTimeout(() => { s += 1; if (s < sentences.length) draw(); }, 2200);
      } else {
        msgEl.textContent = "Dar ne. Perskaityk, kas gavosi — ar sakinys turi prasmę?";
      }
    });
    observer.observe(slotsEl, { childList: true });

    draw();
    return () => { if (observer) observer.disconnect(); };
  },
};

export const SIMS = {
  "garso-raides": garsoRaides,
  "skiemenu-jungimas": skiemenuJungimas,
  "sakinio-tvarka": sakinioTvarka,
};
