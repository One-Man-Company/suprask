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

    /* Pabaigos ekranas rodo sąrašą to, ką vaikas ką tik įveikė, ir klausimą
       apie TĄ PATĮ sąrašą. Klausimas nėra įrašytas tekstu: jis
       apskaičiuojamas iš `config.items`. Ankstesnė versija klausė „kurie du
       žodžiai prasideda ta pačia raide?“, nors visi šeši žodžiai prasidėjo
       skirtingomis raidėmis — vaikas ieškojo atsakymo, kurio nebuvo (#20854).
       Sąrašas ekrane reikalingas ir dėl atminties: 7 žodžių poros vaikas
       neprisimins, o raidę prie žodžio mato kiekvieną kartą (§T3.2). */
    function finish() {
      const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      const byLetter = new Map();
      items.forEach((it, idx) => {
        const letter = String(it.letter ?? "").trim();
        if (!letter) return;
        const key = letter.toUpperCase();
        if (!byLetter.has(key)) byLetter.set(key, []);
        byLetter.get(key).push(idx);
      });
      const pair = [...byLetter.values()].find((list) => list.length > 1) || [];

      stage.innerHTML = `<div style="text-align:center;padding:1rem;max-width:34rem;margin:0 auto">
        <div style="font-size:4rem" aria-hidden="true">🎉</div>
        <p style="margin:0;font-family:var(--font-head);font-weight:900;font-size:1.4rem">Įveikei visas raides!</p>
        <ul style="list-style:none;display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;padding:0;margin:.7rem 0 0">
          ${items.map((it, idx) => `<li id="gr-fin-${idx}" style="display:flex;align-items:center;gap:.35rem;padding:.3rem .65rem;border:2px solid var(--line);border-radius:999px;background:var(--paper)">
            <span aria-hidden="true">${esc(it.emoji)}</span>
            <span style="font-weight:800">${esc(it.word)}</span>
            <span style="font-family:var(--font-head);font-weight:900;color:var(--ink-soft)">${esc(it.letter)}</span>
          </li>`).join("")}
        </ul>
        <p id="gr-fin-q" style="margin:.8rem 0 0;font-family:var(--font-head);font-weight:900;font-size:clamp(1.05rem,4vw,1.25rem)">${
          pair.length
            ? "Kurie du žodžiai prasideda ta pačia raide?"
            : "Kuris žodis tau buvo sunkiausias? Pasakyk jį ir pirmą raidę."
        }</p>
        <p class="sim-note" id="gr-fin-a" style="margin:.35rem 0 0;min-height:2.6rem"></p>
      </div>`;
      api.readout("Visos raidės įveiktos");
      /* Tikslas pasiektas DABAR — visos raidės, o ne viena (§4). */
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
      controls.innerHTML = `${pair.length ? `<button class="btn secondary" id="gr-pair">Rodyti porą</button>` : ""}<button class="btn" id="gr-again">Bandyti dar kartą</button>`;
      if (pair.length) {
        controls.querySelector("#gr-pair").addEventListener("click", () => {
          const a = items[pair[0]];
          const b = items[pair[1]];
          pair.forEach((idx) => {
            const chip = stage.querySelector(`#gr-fin-${idx}`);
            if (chip) chip.style.boxShadow = "inset 0 0 0 3px var(--ok)";
          });
          const answerEl = stage.querySelector("#gr-fin-a");
          if (answerEl) answerEl.textContent = `„${a.word}“ ir „${b.word}“ prasideda raide ${a.letter}.`;
          api.readout(`„${a.word}“ ir „${b.word}“ — raide ${a.letter}`);
          api.speak(`${a.word}. ${b.word}`);
          api.note("Ta pati raidė reiškia tą patį pirmą garsą.");
        });
      } else {
        api.note("Sąraše visi žodžiai prasideda skirtingomis raidėmis.");
      }
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
/*                                                                     */
/* Modelis: tarpas tarp skiemenų yra PAUZĖ, o ne žodžio dalis. Vaikas   */
/* pats perskaito skiemenis iš kairės į dešinę; kai perskaito paskutinį,*/
/* plytelės suartėja, pauzės ženklai dingsta ir vietoje jų atsiranda    */
/* vienas žodis. Taip taisoma modulio `teacher.misconceptions` pirma    */
/* nuostata — „skaitant skiemenimis daroma pauzė, todėl žodis lieka     */
/* nesuprastas“.                                                     */
/*                                                                     */
/* Kodėl ne mygtukas „Skaityk kartu“: jungimą sukelia pats skaitymas.  */
/* Ankstesnė versija leido vaikui spausti vieną mygtuką ir stebėti      */
/* animaciją — tai demonstracija, ne modelis (foundations: „simuliacija */
/* leidžia nuspręsti, kas nutiks“). Mygtukas liko tik tam, kad būtų     */
/* galima pakartoti tą patį žodį.                                       */
/*                                                                     */
/* Tekstai: kiekvienas sakinys rašomas vienoje vietoje (LL-42), o      */
/* žodžiai ir skiemenys imami tik iš `config.words` (LL-61/LL-92).      */
/* ------------------------------------------------------------------ */
const SK_KIEKIS = ["", "vienas skiemuo", "du skiemenys", "trys skiemenys", "keturi skiemenys", "penki skiemenys"];
const skKiekis = (n) => SK_KIEKIS[n] || `${n} skiemenų`;
const skCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const skJunginys = (syl) =>
  syl.length === 1 ? `„${syl[0]}“`
    : syl.slice(0, -1).map((s) => `„${s}“`).join(", ") + ` ir „${syl[syl.length - 1]}“`;

const skiemenuJungimas = {
  mount({ stage, controls, api, config }) {
    const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const words = (Array.isArray(config.words) ? config.words : [])
      .filter((it) => it && typeof it.word === "string" && Array.isArray(it.syllables) && it.syllables.length > 0)
      .map((it) => ({ word: it.word, syllables: it.syllables.map(String) }));

    if (!words.length) {
      stage.innerHTML = `<p class="sim-note" style="margin:0">Žodžių sąrašo nėra.</p>`;
      controls.innerHTML = "";
      api.readout("Žodžių sąrašo nėra.");
      api.note("");
      return () => {};
    }

    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [];
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const stopTimers = () => { while (timers.length) clearTimeout(timers.pop()); };

    let w = 0;          // kuris žodis
    let step = 0;       // kiek skiemenų perskaityta iš eilės
    let joined = false; // ar žodis jau sujungtas
    let reported = false;

    stage.innerHTML = `
      <div style="text-align:center;max-width:34rem;margin:0 auto">
        <div id="sj-strip" style="display:flex;flex-wrap:wrap;gap:.9rem;row-gap:.6rem;justify-content:center;align-items:center;min-height:5rem"></div>
        <p id="sj-word" style="min-height:2.6rem;margin:.4rem 0 0;font-family:var(--font-head);font-weight:900;font-size:clamp(1.6rem,7vw,2.2rem)"></p>
        <p id="sj-caption" class="sim-note" style="margin:.2rem 0 0"></p>
      </div>`;
    controls.innerHTML = `
      <button class="btn secondary" id="sj-again" type="button">Skaityk iš naujo</button>`;

    const stripEl = stage.querySelector("#sj-strip");
    const wordEl = stage.querySelector("#sj-word");
    const captionEl = stage.querySelector("#sj-caption");
    let nextBtn = null;

    const item = () => words[w];

    function setNext(label, handler) {
      if (!label) {
        if (nextBtn) { nextBtn.remove(); nextBtn = null; }
        return;
      }
      if (!nextBtn) {
        nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "btn";
        nextBtn.id = "sj-next";
        controls.appendChild(nextBtn);
      }
      nextBtn.textContent = label;
      nextBtn.onclick = handler;
    }

    function paint() {
      const it = item();
      step = 0;
      joined = false;
      // Tarpas tarp plytelių yra matuojamas, o ne dekoratyvus: jis rodo pauzę.
      stripEl.style.transition = "none";
      stripEl.style.gap = ".9rem";
      stripEl.innerHTML = it.syllables.map((s, i) => `
        ${i ? `<span class="sj-pause" aria-hidden="true" style="width:2px;height:2.2rem;border-left:2px dashed var(--line)"></span>` : ""}
        <button class="btn secondary" type="button" data-i="${i}" aria-label="Skiemenis ${esc(s)}"
          style="position:relative;min-height:48px;padding:.7rem 1.2rem;font-size:clamp(1.4rem,6vw,1.9rem);font-weight:900">
          ${esc(s)}<span aria-hidden="true" data-num
            style="position:absolute;top:.15rem;right:.4rem;font-size:clamp(.75rem,2.6vw,.95rem);color:var(--ink-faint)"></span>
        </button>`).join("");
      stripEl.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => tap(Number(b.dataset.i))));
      wordEl.textContent = "";
      captionEl.textContent = "Tarpai tarp plytelių — pauzės.";
      setNext(null);
      api.readout(it.syllables.length === 1
        ? `Žodis ${w + 1} iš ${words.length}. Vienas skiemuo jau yra žodis. Spausk jį.`
        : `Žodis ${w + 1} iš ${words.length}. ${skCap(skKiekis(it.syllables.length))}, vienas žodis. Spausk pirmą skiemenį.`);
      api.note("");
    }

    function tap(i) {
      const it = item();
      const btn = stripEl.querySelector(`[data-i="${i}"]`);
      if (!btn) return;

      if (joined) { api.speak(it.syllables[i], { rate: .8 }); return; }
      if (i < step) {
        api.speak(it.syllables[i], { rate: .8 });
        api.note("Šį skiemenį jau perskaitei. Skaityk toliau.");
        return;
      }
      if (i > step) {
        api.note(`Skaityk iš kairės į dešinę: dabar „${it.syllables[step]}“.`);
        return;
      }

      api.speak(it.syllables[i], { rate: .8 });
      btn.dataset.read = "1";
      btn.style.borderColor = "var(--ok)";
      btn.querySelector("[data-num]").textContent = String(step + 1);
      btn.setAttribute("aria-label", `Skiemenis ${it.syllables[i]}, ${step + 1}`);
      step += 1;
      const left = it.syllables.length - step;
      if (left > 0) {
        api.note("");
        api.readout(`Perskaitei „${it.syllables[i]}“. Liko ${skKiekis(left)}.`);
      } else {
        joinWord();
      }
    }

    function joinWord() {
      const it = item();
      const last = w === words.length - 1;
      joined = true;
      stripEl.querySelectorAll(".sj-pause").forEach((p) => { p.style.display = "none"; });
      if (!reduced) stripEl.style.transition = "gap 420ms ease";
      stripEl.style.gap = ".12rem";
      wordEl.textContent = it.word;
      captionEl.textContent = "Pauzių nebėra: skiemenys susilieja į vieną žodį.";
      later(() => api.speak(it.word, { rate: .85 }), reduced ? 0 : 430);
      api.note("Tarpas buvo pauzė. Be pauzės skiemenys susilieja į žodį.");
      setNext(last ? "Nuo pradžių" : "Kitas žodis →", last ? restart : nextWord);
      api.readout(`${skJunginys(it.syllables)} — ${it.word}. ${last ? "Perskaitei visus žodžius." : "Vienas žodis."}`);
      if (last && !reported) {
        reported = true;
        api.progress({ words: words.length });
      }
      if (nextBtn && stage.contains(document.activeElement)) nextBtn.focus({ preventScroll: true });
    }

    function focusFirst() {
      const b = stripEl.querySelector("[data-i]");
      if (b) b.focus({ preventScroll: true });
    }

    function nextWord() {
      stopTimers();
      const hadFocus = nextBtn && nextBtn === document.activeElement;
      w += 1;
      if (w >= words.length) w = 0;
      paint();
      // LL-32: pašalintas mygtukas negrąžina fokuso į dokumento pradžią.
      if (hadFocus) focusFirst();
    }

    function restart() {
      stopTimers();
      const hadFocus = nextBtn && nextBtn === document.activeElement;
      w = 0;
      paint();
      if (hadFocus) focusFirst();
    }

    controls.querySelector("#sj-again").addEventListener("click", () => {
      stopTimers();
      paint();
      api.note("Tas pats žodis iš naujo.");
      focusFirst();
    });

    paint();
    return () => { stopTimers(); };
  },
};

/* ------------------------------------------------------------------ */
/* 3. Sakinio žodžiai: kas? ką veikia?                                 */
/* ------------------------------------------------------------------ */
/* Modelis: vienintelis keičiamas dalykas — žodžių tvarka. Vaikas žymi
   žodį, atsakantį į „kas?“, paskui į „ką veikia?“. Perstačius žodžius
   tie patys žodžiai lieka veikėju ir veiksmu, todėl klaidinga nuostata
   „veikėjas yra pirmas žodis“ griūna pačioje simuliacijoje (LL-28).
   Sąraše yra sakinių, kuriuose veikėjas ne pirmas — be jų modelis
   neįrodytų, kad tvarka nieko nelemia.
   Pažanga žymima tik peržiūrėjus visus sakinius (KURINIO-STANDARTAS §4). */
const sakinioZodziai = {
  mount({ stage, controls, api, config }) {
    const sentences = Array.isArray(config.sentences) ? config.sentences : [];
    if (!sentences.length) {
      stage.innerHTML = `<p class="error-box">Sakinių nėra.</p>`;
      return null;
    }

    let s = 0;                                   // sakinio eilė
    let order = 0;                               // 0 — įprasta, 1 — kita tvarka
    let step = "kas";                            // kas | veikia | baigta
    let found = { doer: false, action: false };
    let reported = false;

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(36rem, 100%)">
        <p id="sz-q" style="margin:0 0 .6rem;text-align:center;font-family:var(--font-head);font-weight:900;font-size:clamp(1.1rem,4.4vw,1.45rem);overflow-wrap:anywhere"></p>
        <div id="sz-words" role="group" aria-label="Sakinio žodžiai" style="display:flex;gap:.55rem;flex-wrap:wrap;justify-content:center;padding:.75rem;border:2px dashed var(--line);border-radius:var(--r-m);background:var(--paper)"></div>
        <p class="sim-note" id="sz-msg" style="min-height:2.6rem;margin-top:.6rem"></p>
      </div>`;
    controls.innerHTML = `
      <button class="btn secondary" id="sz-order">Kita tvarka</button>
      <button class="btn" id="sz-next" disabled>Kitas sakinys</button>`;

    const qEl = stage.querySelector("#sz-q");
    const wordsEl = stage.querySelector("#sz-words");
    const msgEl = stage.querySelector("#sz-msg");
    const orderBtn = controls.querySelector("#sz-order");
    const nextBtn = controls.querySelector("#sz-next");

    const cur = () => sentences[s % sentences.length];

    /* Žodžių eilė. `variant_order` yra tų pačių žodžių permutacija:
       žodžių tekstai nesikeičia, keičiasi tik jų vieta. */
    function permutation() {
      const sent = cur();
      const base = Array.isArray(sent.words) ? sent.words : [];
      const alt = Array.isArray(sent.variant_order) ? sent.variant_order : [];
      const valid = alt.length === base.length
        && alt.every((i) => Number.isInteger(i) && i >= 0 && i < base.length)
        && new Set(alt).size === base.length;
      return order === 1 && valid ? alt : base.map((_, i) => i);
    }

    function roleOf(index, sent) {
      if (found.doer && index === sent.doer) return "kas?";
      if (found.action && index === sent.action) return "ką veikia?";
      return "";
    }

    function drawWords() {
      const sent = cur();
      const base = Array.isArray(sent.words) ? sent.words : [];
      wordsEl.innerHTML = permutation().map((bi) => {
        const role = roleOf(bi, sent);
        const label = role ? ` — ${role}` : "";
        return `<button class="btn secondary" data-bi="${bi}" aria-label="${base[bi]}${label}" style="display:flex;flex-direction:column;align-items:center;gap:.2rem;min-width:5.5rem">
          <span aria-hidden="true" style="font-size:.78em;font-weight:800;line-height:1;min-height:1em;color:${role ? "var(--ok)" : "var(--ink-faint)"}">${role || "\u00a0"}</span>
          <span style="font-size:1.05em;font-weight:900">${base[bi]}</span>
        </button>`;
      }).join("");
      wordsEl.querySelectorAll("[data-bi]").forEach((b) => {
        b.addEventListener("click", () => pick(Number(b.dataset.bi)));
      });
    }

    function pick(index) {
      const sent = cur();
      const base = Array.isArray(sent.words) ? sent.words : [];
      const word = base[index] || "";

      /* Jau rastas žodis — tik pakartojam garsą, būsena nesikeičia. */
      if (roleOf(index, sent)) { api.speak(word, { rate: .85 }); return; }

      if (step === "kas" && index !== sent.doer) {
        msgEl.textContent = `„${word}“ — ne. ${sent.ask_cas}`;
        api.readout("Dar ne. Paklausk sakinio, kas atlieka veiksmą.");
        return;
      }
      if (step === "veikia" && index !== sent.action) {
        msgEl.textContent = `„${word}“ — ne. ${sent.ask_veikia}`;
        api.readout("Dar ne. Ieškok žodžio, kuris sako, ką veikėjas daro.");
        return;
      }

      api.speak(word, { rate: .85 });

      if (step === "kas") {
        found.doer = true;
        step = "veikia";
        qEl.textContent = sent.ask_veikia;
        msgEl.textContent = `„${word}“ — veikėjas. Dabar ieškok veiksmo.`;
        api.readout(`Kas? — ${word}. Dabar ką veikia?`);
        api.speak(sent.ask_veikia, { rate: .85 });
        drawWords();
        return;
      }

      found.action = true;
      step = "baigta";
      qEl.textContent = "Sakinys surinktas";
      const rest = base.filter((_, i) => i !== sent.doer && i !== sent.action);
      msgEl.textContent = rest.length
        ? `Liko žodis „${rest[0]}“. Ir jam galima užduoti klausimą.`
        : `Radai abu žodžius: ${base[sent.doer]} ir ${base[sent.action]}.`;
      api.note(`Perskaityk visą sakinį: „${sent.text}“.`);
      api.readout("Sakinys surinktas");
      api.speak(sent.text, { rate: .8 });
      nextBtn.disabled = false;
      drawWords();

      /* Tikslas pasiektas DABAR — paskutinis sakinys, o ne pirmas (§4). */
      if (!reported && s === sentences.length - 1) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function draw() {
      const sent = cur();
      step = "kas";
      order = 0;
      found = { doer: false, action: false };
      nextBtn.disabled = true;
      qEl.textContent = sent.ask_cas;
      msgEl.textContent = "Spausk žodį, kuris atsako į klausimą.";
      api.note("");
      drawWords();
      api.readout(`Sakinys ${s + 1} iš ${sentences.length}`);
      api.speak(sent.ask_cas, { rate: .85 });
    }

    /* Ta pati mintis kita tvarka: klausimai ir atsakymai nesikeičia. */
    orderBtn.addEventListener("click", () => {
      const sent = cur();
      order = order === 0 ? 1 : 0;
      step = "kas";
      found = { doer: false, action: false };
      nextBtn.disabled = true;
      qEl.textContent = sent.ask_cas;
      msgEl.textContent = "Žodžiai persirikiavo. Klausimai tie patys, atsakymai tie patys.";
      api.note("");
      drawWords();
      api.readout("Žodžiai persirikiavo kita tvarka.");
      api.speak(sent.ask_cas, { rate: .85 });
    });

    nextBtn.addEventListener("click", () => {
      s = (s + 1) % sentences.length;
      draw();
    });

    draw();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 4. Kalbos vartojimo tyrimas: „Kaip žmonės sveikinasi?“              */
/* ------------------------------------------------------------------ */
/* Modelis: du kintamieji — pastebėjimų skaičius ir vaiko PASIRINKTA
   išvada. Simuliacija pati išvados nerašo (#20856, auditas R4/R5): ji
   pasako tik, ką vaikas kol kas žino („Kol kas žinai tik apie vieną
   žmogų“), o tris galimus teiginius vaikas pasirenka pats.
   Teiginiai skiriasi TIK apimtimi, o teisingas apskaičiuojamas iš
   lentelės kiekvieną akimirką:
     all  — „Visi žmonės…“  — nepagrįsta: sutikti žmonės nėra visi žmonės;
     seen — „Visi sutikti…“ — teisinga, kol visi sutiktieji vienodi;
     most — „Daugiausia…“   — teisinga, kai sutiktieji sveikinasi įvairiai.
   Todėl nėra spėjimo, kurį modelis pameta (LL-15), ir nėra klaidingo
   varianto, kuris gyvenime teisingas (LL-18): kiekvienas netinkamas
   teiginys prieštarauja LENTELĖS duomenims, ne vaiko nuomonei.
   Žmonių eilė fiksuota sąmoningai (jokio Math.random): tas pats tyrimas
   visada atkuriamas, o trečias žmogus tyčia sveikinasi kitaip — be
   prieštaraujančio atvejo modelis neįrodytų, kad pirma išvada netinka. */
const kaipZmonesSveikinasi = {
  mount({ stage, controls, api, config }) {
    const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const groups = (Array.isArray(config.groups) ? config.groups : []).filter((g) => g && g.id);
    const people = Array.isArray(config.people) ? config.people : [];
    const ORDINALS = ["Pirmas", "Antras", "Trečias", "Ketvirtas", "Penktas", "Šeštas", "Septintas", "Aštuntas"];

    /* Kortelė rodo `label`, o balsas taria `say` (V4, #20857). Anksčiau abu
       buvo vienas laukas, todėl vaikas, pamatęs linktelėjimą, girdėdavo
       žodį „Linktelėjo“ — veiksmo pavadinimą vietoj pasveikinimo. Trys
       atvejai, ir jie sąmoningai skiriasi:
         `say` eilutė   → žmogus taip pasakė (žodinis sveikinimas);
         `say: ""`      → žmogus nieko nesakė: tyla, o kortelėje parašoma,
                          kad sveikinimasis buvo be žodžių (tyla be
                          paaiškinimo atrodytų kaip sugedęs garsas, LL-04);
         `say` nėra     → tardomas `label` (sena sutartis, kad modulis be
                          `say` nekartotų to paties teksto dviejuose laukuose).
       Todėl tikrinama, ar savybė YRA, o ne ar reikšmė „netuščia“:
       `person.say || person.label` tylą pakeistų atgal į veiksmo pavadinimą. */
    const quietText = String(config.quiet ?? "").trim();

    function spokenText(person, group) {
      if (Object.prototype.hasOwnProperty.call(person, "say")) {
        return typeof person.say === "string" ? person.say.trim() : "";
      }
      return String(person.label || group.label || "").trim();
    }

    if (!groups.length || !people.length) {
      stage.innerHTML = `<p class="error-box">Tyrimo duomenų nėra.</p>`;
      return null;
    }

    /* Trys galimos išvados kiekvienai grupei. Jos skiriasi TIK apimtimi,
       todėl vaikui nereikia sugalvoti sakinio — reikia pasirinkti, kiek
       duomenų leidžia pasakyti. Tekstai imami iš `sim.config` (LL-61). */
    const STATEMENTS = {};
    groups.forEach((g) => {
      STATEMENTS[g.id] = {
        all: String(g.all ?? "").trim(),
        seen: String(g.seen ?? "").trim(),
        most: String(g.most ?? "").trim(),
      };
    });
    const textsReady = groups.every((g) => STATEMENTS[g.id].all && STATEMENTS[g.id].seen && STATEMENTS[g.id].most);

    const counts = {};
    groups.forEach((g) => { counts[g.id] = 0; });

    let seen = 0;        // vienintelis modelio kintamasis: pastebėjimų skaičius
    let pick = "";       // vaiko PASIRINKTA išvada, ne simuliacijos sukurta
    let first = null;    // pirma teisinga vaiko išvada { text, at }
    let currentOptions = [];
    let reported = false;

    /* „apie 1 žmogų“, „apie 2 žmones“, „apie 11 žmonių“ — lietuviškas
       skaičiuotinis, kad tekstas nevirstų „1 žmones“. */
    function zmones(n) {
      const d = n % 10;
      const h = n % 100;
      if (d === 1 && h !== 11) return `${n} žmogų`;
      if (d >= 2 && d <= 9 && !(h >= 11 && h <= 19)) return `${n} žmones`;
      return `${n} žmonių`;
    }

    /* „po 1 pastebėjimo“, „po 3 pastebėjimų“ (auditas S4). */
    function po(n) {
      return n % 10 === 1 && n % 100 !== 11 ? `po ${n} pastebėjimo` : `po ${n} pastebėjimų`;
    }

    function total() {
      return groups.reduce((sum, g) => sum + counts[g.id], 0);
    }

    function summary() {
      return groups.map((g) => `${g.label} — ${counts[g.id]}`).join(" · ");
    }

    function activeGroups() {
      return groups.filter((g) => counts[g.id] > 0);
    }

    function topGroups() {
      const best = groups.reduce((m, g) => Math.max(m, counts[g.id]), 0);
      return groups.filter((g) => counts[g.id] === best);
    }

    /* Teisinga išvada — ne tekstas iš sąrašo, o skaičiavimas iš duomenų:
       kol sutiktieji vienodi, galima kalbėti apie visus SUTIKTUS žmones;
       kai jie sveikinasi įvairiai, belieka palyginti. */
    function correctKind() {
      if (!seen || !textsReady) return "";
      const top = topGroups();
      if (top.length > 1) return "tie";
      return activeGroups().length === 1 ? "seen" : "most";
    }

    function correctText() {
      const kind = correctKind();
      if (!kind) return "";
      if (kind === "tie") return String(config.tie ?? "").trim();
      return STATEMENTS[topGroups()[0].id][kind];
    }

    function options() {
      if (!seen || !textsReady) return [];
      const top = topGroups();
      const list = [];
      const add = (text, kind, gid) => {
        const t = String(text ?? "").trim();
        if (!t || list.some((o) => o.text === t)) return;
        list.push({ text: t, kind, gid });
      };
      if (top.length === 1) {
        const g = top[0];
        add(STATEMENTS[g.id].all, "all", g.id);
        add(STATEMENTS[g.id].seen, "seen", g.id);
        add(STATEMENTS[g.id].most, "most", g.id);
      } else {
        add(config.tie, "tie", "");
        const g = top[0];
        add(STATEMENTS[g.id].all, "all", g.id);
        add(STATEMENTS[g.id].seen, "seen", g.id);
      }
      /* Be teisingo teiginio pasirinkimo nerodome: geriau jokio pasirinkimo,
         nei sąrašas, kuriame nė vienas variantas nėra teisingas. */
      return list.some((o) => o.text === correctText()) ? list : [];
    }

    function rightText() {
      const kind = correctKind();
      if (kind === "most") return `Tinka. Lentelėje: ${summary()}. Tai dažniausias būdas.`;
      if (kind === "tie") return `Tinka. Dvi grupės lygios: ${summary()}.`;
      return "Tinka. Visi sutikti žmonės sveikinasi vienodai. Apie kitus dar nežinai.";
    }

    function wrongText(opt) {
      if (opt.kind === "all") return `Netinka. Matei ${zmones(seen)}, o ne visus žmones prie mokyklos.`;
      if (opt.kind === "seen") {
        return topGroups().length > 1
          ? `Netinka. Dvi grupės lygios: ${summary()}.`
          : `Netinka. Lentelėje: ${summary()}. Sutikti žmonės sveikinasi įvairiai.`;
      }
      if (opt.kind === "most") {
        return activeGroups().length <= 1
          ? "Netinka. Kol kas visi sutikti žmonės sveikinasi vienodai. Ar jau su kuo palyginti?"
          : `Netinka. Lentelėje: ${summary()}. Palygink, kuri grupė didžiausia.`;
      }
      if (opt.kind === "tie") return `Netinka. Viena grupė didžiausia: ${summary()}.`;
      return "Netinka. Pažiūrėk į lentelę ir palygink skaičius.";
    }

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
      <div style="width:100%;min-width:0;max-width:min(36rem, 100%)">
        <p id="kz-question" style="margin:0 0 .6rem;text-align:center;font-family:var(--font-head);font-weight:900;font-size:clamp(1rem,3.6vw,1.2rem)"></p>
        <div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:.7rem .6rem;border:2px dashed var(--line);border-radius:var(--r-m);background:var(--paper)">
          <div id="kz-emoji" aria-hidden="true" style="font-size:clamp(2.4rem,11vw,3.4rem);line-height:1">🏫</div>
          <div id="kz-said" style="font-family:var(--font-head);font-weight:900;font-size:clamp(1.06rem,4vw,1.3rem);text-align:center;overflow-wrap:anywhere">Dar nieko</div>
          <div id="kz-quiet" aria-live="off" hidden style="font-size:clamp(.95rem,3.4vw,1.06rem);font-weight:800;color:var(--ink-soft);text-align:center;overflow-wrap:anywhere"></div>
          <div id="kz-who" style="font-size:var(--fs-s);color:var(--ink-soft);text-align:center">Spausk „Sekantis žmogus“</div>
        </div>
        <div style="display:grid;gap:.4rem;margin-top:.8rem">${barsMarkup()}</div>
        <div style="margin-top:.8rem;padding:.6rem .8rem;border-left:4px solid var(--sun);border-radius:var(--r-s);background:var(--paper)">
          <p style="margin:0;font-size:clamp(.98rem,3.6vw,1.1rem)">Pastebėjimų: <strong id="kz-total">0</strong></p>
          <p id="kz-known" style="margin:.25rem 0 0;font-size:clamp(.98rem,3.6vw,1.1rem);font-weight:800">Kol kas nieko nepastebėjai.</p>
          <p id="kz-pick" style="margin:.3rem 0 0;font-size:clamp(.95rem,3.4vw,1.06rem);color:var(--ink-soft)"></p>
          <div id="kz-options" role="group" aria-label="Galimos išvados" style="display:grid;gap:.45rem;margin-top:.5rem"></div>
          <p id="kz-verdict" role="status" style="margin:.5rem 0 0;font-size:clamp(.95rem,3.4vw,1.06rem);min-height:2.4rem"></p>
          <p id="kz-first" hidden style="margin:.35rem 0 0;font-size:clamp(.95rem,3.4vw,1.06rem);color:var(--ink-soft)"></p>
        </div>
      </div>`;
    controls.innerHTML = `
      <button class="btn" id="kz-next" type="button">Sekantis žmogus</button>`;

    const emojiEl = stage.querySelector("#kz-emoji");
    const saidEl = stage.querySelector("#kz-said");
    const quietEl = stage.querySelector("#kz-quiet");
    const whoEl = stage.querySelector("#kz-who");
    const totalEl = stage.querySelector("#kz-total");
    const knownEl = stage.querySelector("#kz-known");
    const pickEl = stage.querySelector("#kz-pick");
    const optionsEl = stage.querySelector("#kz-options");
    const verdictEl = stage.querySelector("#kz-verdict");
    const firstEl = stage.querySelector("#kz-first");
    const nextEl = controls.querySelector("#kz-next");
    const barEls = {};
    const countEls = {};
    groups.forEach((g) => {
      barEls[g.id] = stage.querySelector(`#kz-bar-${g.id}`);
      countEls[g.id] = stage.querySelector(`#kz-n-${g.id}`);
    });

    const questionEl = stage.querySelector("#kz-question");
    if (questionEl) questionEl.textContent = config.question || "Kaip žmonės sveikinasi?";

    /* Ką vaikas kol kas žino — ne išvada apie žmones, o faktas apie
       pastebėjimus (R4: po vieno žmogaus negali būti „Visi…“). */
    function knownText() {
      if (!seen) return "Kol kas nieko nepastebėjai.";
      if (seen === 1) return "Kol kas žinai tik apie vieną žmogų.";
      return `Kol kas žinai apie ${zmones(seen)}.`;
    }

    function drawFirst() {
      firstEl.hidden = !first;
      firstEl.textContent = first ? `Pirma tavo išvada (${po(first.at)}): „${first.text}“` : "";
    }

    /* Teiginiai rodomi kiekvieną kartą iš naujo, o tvarka sukama pagal
       pastebėjimų skaičių: teisingas teiginys nelieka toje pačioje vietoje,
       todėl jo negalima atspėti pagal padėtį. */
    function renderOptions() {
      if (!seen) {
        currentOptions = [];
        optionsEl.innerHTML = `<p class="sim-note" style="margin:0">Kol kas nėra iš ko rinktis. Pirma pažiūrėk, kaip sveikinasi vienas žmogus.</p>`;
        return;
      }
      const list = options();
      if (!list.length) {
        currentOptions = [];
        optionsEl.innerHTML = `<p class="sim-note" style="margin:0">Išvadų variantų nėra. Pasakyk savo išvadą žodžiu.</p>`;
        return;
      }
      const shift = seen % list.length;
      currentOptions = list.slice(shift).concat(list.slice(0, shift));
      const good = correctText();
      optionsEl.innerHTML = currentOptions.map((o, i) => {
        /* Varnelė rodo ne „šį variantą pasirinkai“, o „šis variantas TINKA
           DABAR“. Pavadinimas pasenus po naujo pastebėjimo, todėl varnelė
           negali likti ant teiginio, kuris nebegalioja. */
        const on = pick === o.text;
        const ok = on && o.text === good;
        return `
        <button class="btn secondary" type="button" data-opt="${i}" aria-pressed="${on ? "true" : "false"}"
          style="display:flex;justify-content:flex-start;align-items:center;gap:.5rem;width:100%;min-height:48px;padding:.6rem .9rem;text-align:left;white-space:normal;overflow-wrap:anywhere;font-size:clamp(.98rem,3.7vw,1.08rem);line-height:1.3">
          <span data-mark aria-hidden="true" style="flex:0 0 auto;font-weight:900;color:${ok ? "var(--ok)" : "var(--ink-faint)"}">${ok ? "✓" : "•"}</span>
          <span>${esc(o.text)}</span>
        </button>`;
      }).join("");
      optionsEl.querySelectorAll("[data-opt]").forEach((b) => {
        b.addEventListener("click", () => choose(Number(b.dataset.opt)));
      });
    }

    function markPicked() {
      const good = correctText();
      optionsEl.querySelectorAll("[data-opt]").forEach((b) => {
        const o = currentOptions[Number(b.dataset.opt)];
        const on = !!o && pick === o.text;
        const ok = on && o.text === good;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        const mark = b.querySelector("[data-mark]");
        if (mark) {
          mark.textContent = ok ? "✓" : "•";
          mark.style.color = ok ? "var(--ok)" : "var(--ink-faint)";
        }
      });
    }

    function render() {
      totalEl.textContent = String(total());
      knownEl.textContent = knownText();
      groups.forEach((g) => {
        if (barEls[g.id]) barEls[g.id].style.width = `${Math.round((counts[g.id] / people.length) * 100)}%`;
        if (countEls[g.id]) countEls[g.id].textContent = String(counts[g.id]);
      });
      pickEl.textContent = pick ? `Tavo pasirinkimas: „${pick}“` : "Išvados dar nepasirinkai.";
      renderOptions();
      drawFirst();
      nextEl.textContent = seen >= people.length ? "Pradėti iš naujo" : "Sekantis žmogus";
    }

    /* Sėkmės sąlyga tikrinama iš DABARTINĖS būsenos (§4): visi žmonės
       pastebėti IR dabartinė vaiko išvada atitinka duomenis. Ankstesnė
       išvada, kuri nebegalioja, pažangos nepadaro (LL-17). */
    function maybeProgress() {
      if (reported) return;
      if (seen < people.length) return;
      if (!pick || pick !== correctText()) return;
      reported = true;
      api.progress({ correct: true });
    }

    /* Vaikas pasirenka teiginį — simuliacija tikrina, ar jis remiasi
       LENTELĖS duomenimis, ir paaiškina, ką rodo skaičiai (T3.1/T3.2). */
    function choose(i) {
      const opt = currentOptions[i];
      if (!opt) return;
      const ok = opt.text === correctText();
      pick = opt.text;
      markPicked();
      pickEl.textContent = `Tavo pasirinkimas: „${pick}“`;
      if (ok) {
        const changed = !!first && first.text !== opt.text;
        if (!first) first = { text: opt.text, at: seen };
        verdictEl.textContent = rightText();
        drawFirst();
        api.readout("Išvada remiasi duomenimis.");
        api.note(changed
          ? `Pirma tavo išvada: „${first.text}“. Dabar: „${opt.text}“. Taip nutinka, kai pamatai daugiau žmonių.`
          : (seen >= people.length ? "Ši išvada remiasi visais pastebėtais žmonėmis." : "Išvada užrašyta. Stebėk toliau: ar ji išlieka?"));
      } else {
        verdictEl.textContent = wrongText(opt);
        api.readout("Ši išvada duomenų neatitinka.");
        api.note("Pažiūrėk į lentelę ir pabandyk kitą teiginį.");
      }
      maybeProgress();
    }

    function reset() {
      seen = 0;
      groups.forEach((g) => { counts[g.id] = 0; });
      pick = "";
      first = null;
      emojiEl.textContent = "🏫";
      saidEl.textContent = "Dar nieko";
      quietEl.hidden = true;
      quietEl.textContent = "";
      whoEl.textContent = "Spausk „Sekantis žmogus“";
      verdictEl.textContent = "";
      api.readout("Tyrimas pradėtas iš naujo.");
      api.note("Spausk „Sekantis žmogus“ ir skaičiuok.");
      render();
    }

    nextEl.addEventListener("click", () => {
      if (seen >= people.length) { reset(); return; }
      const person = people[seen];
      const group = groups.find((g) => g.id === person.group);
      if (!group) { api.note("Šio žmogaus grupė nerasta."); return; }
      seen += 1;
      counts[group.id] += 1;
      emojiEl.textContent = group.emoji || "";
      saidEl.textContent = person.label || group.label;
      /* Tyla — ne „nieko“, o įvardytas pastebėjimas (LL-04): kortelė pasako,
         kad šis žmogus sveikinosi be žodžių, o ne palieka vaiką manyti, kad
         garsas sugedo. */
      const said = spokenText(person, group);
      quietEl.hidden = said !== "";
      quietEl.textContent = said !== "" ? "" : quietText;
      whoEl.textContent = `${ORDINALS[seen - 1] || seen} sutiktas žmogus`;
      if (said) api.speak(said);
      render();
      api.readout(said
        ? `${seen} iš ${people.length} žmonių`
        : `${quietText || "Nieko nesakė"}. ${seen} iš ${people.length} žmonių`);
      /* Duomenys pasikeitė — todėl vaiko pasirinkimas tikrinamas iš naujo,
         o ne laikomas galiojančiu (LL-17). */
      if (pick) {
        verdictEl.textContent = pick === correctText()
          ? rightText()
          : "Tavo išvada dabar netinka: duomenys pasikeitė.";
      }
      if (seen === people.length) {
        api.note("Pastebėjai visus žmones. Pasirink išvadą, kuri remiasi visais pastebėjimais.");
      } else if (pick) {
        api.note(pick === correctText() ? "Išvada tebėtinka." : "Duomenys pasikeitė — ar tavo išvada dar tinka?");
      } else {
        api.note("Dar vienas pastebėjimas. Ką dabar gali pasakyti?");
      }
      maybeProgress();
    });

    render();
    verdictEl.textContent = "";
    api.note("Spausk „Sekantis žmogus“ ir skaičiuok. Išvadą pasirinksi pats.");
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
      /* Klaidos paaiškinimas turi pasiekti vaiką. `.sim-note` nėra gyvasis
         srautas — `aria-live` turi tik `#sim-readout`, todėl konkretus
         paaiškinimas rašomas ir ten. Klausimas lieka matomas plakato
         viršuje, tad jis nepradingsta. Po jo — ta pati strategija kiekvieną
         kartą: palygink, apie ką dalis, su tuo, ko klausia klausimas
         (LL-34: modelio tekstas ir grįžtamasis ryšys sutaria). */
      api.readout(miss);
      api.note("Ne ši dalis. Apie ką ji? O ko klausia klausimas?");
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
      /* `#sim-stage` yra grid su `place-items:center`, todėl vaikas išsitempia
         iki savo min-content, o `min-width:auto` neleidžia jam susitraukti
         (200 % tekste @360 px: blokas 313 px tarp 241 px dėžės → 13 px
         horizontalios slinkties). Todėl `min-width:0` ir lubos nuo tėvo,
         o ne tik `44rem`: 16 px šaknyje matmenys nekinta (298,4 → 298,4). */
      stage.innerHTML = `
        <div style="width:100%;min-width:0;max-width:min(44rem, 100%)">
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
        <div style="text-align:center;padding:.4rem;min-width:0;max-width:min(34rem, 100%)">
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

/* ------------------------------------------------------------------ */
/* 6. Garso trukmė: vieną garsą gali tempti, kitas nutrūksta           */
/* ------------------------------------------------------------------ */
/* Modelis: vienintelis keičiamas dalykas — GARSAS, o ne laikymo
   trukmė. Vaikas gali spausti ilgiau, bet trumpo garso juosta sustoja
   po pirmo langelio: būtent tai ir yra modelio teiginys, kurio
   nepaneigia jokia iliustracija (gairės P2).
   Juostos ilgis išvedamas iš `sounds[].stretch` (8 arba 1), o ne iš
   atskiro `cells` lauko: ekrane esantis teiginys turi būti
   perskaičiuojamas iš tų pačių duomenų, kuriuos mato vaikas (LL-21).
   Pavieniai garsai sąmoningai NETARIAMI: sintezatorius „s“ perskaitytų
   kaip raidės vardą „es“ — būtent tą klaidą, kurią modelis griauna.
   Garsą taria vaikas, o juosta matuoja jo paspaudimą; tai pasakyta
   `api.note`, kad modelio riba nebūtų nutylėta.
   Spėjimas (LL-15) yra vienas, prieš pirmą bandymą, ir lieka ekrane
   kaip įrašas „Tu spėjai… Įvyko…“, niekada nevadinamas klaida. */

const GJ_CELLS = 8;
const GJ_TICK = 200;

const garsoJuosta = {
  mount({ stage, controls, api, config }) {
    const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const raw = Array.isArray(config.sounds) ? config.sounds : [];
    const sounds = raw.map((s) => ({ sound: String((s && s.sound) ?? "").trim(), stretch: Boolean(s && s.stretch === true) }));
    const invalid = raw.length < 4 || raw.some((s) => !s || typeof s.sound !== "string" || !s.sound.trim() || typeof s.stretch !== "boolean");
    const S = config.sentences && typeof config.sentences === "object" ? config.sentences : {};
    const REQUIRED = ["start", "ask", "hold", "full", "stop", "sort"];
    const missing = REQUIRED.filter((k) => !String(S[k] ?? "").trim());

    if (invalid || missing.length) {
      console.error("[garso-juosta] reikia bent 4 garsų su „sound“ ir „stretch“ bei tekstų:", REQUIRED.join(", "), config);
      stage.innerHTML = `<p class="error-box">Garsų duomenys nesuderinti.</p>`;
      controls.innerHTML = "";
      api.readout("Garsų duomenys nesuderinti.");
      api.note("");
      return () => {};
    }

    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spoken = new Set();
    let fillTimer = null;
    let holding = false;
    let picked = -1;              // kuri plytelė pasirinkta
    let guess = "";               // vaiko spėjimas, ne modelio išvada
    let guessDone = false;
    const tried = new Map();      // plytelė → kiek langelių prisipildė
    let sortOn = false;           // ar jau galima dėlioti į dvi eiles
    const placement = new Map();  // plytelė → "long" | "short"
    const marked = new Set();     // po „Palygink“ ne savo eilėje
    let reported = false;

    function say(key) {
      const text = String(S[key] ?? "").trim();
      if (!text || spoken.has(key)) return;
      spoken.add(key);
      api.speak(text, { rate: .85 });
    }

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(32rem, 100%);margin:0 auto">
        <div id="gj-tiles" role="group" aria-label="Garsų plytelės"
          style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem;min-height:4rem"></div>
        <div id="gj-guesswrap" style="margin-top:.7rem;padding:.55rem .7rem;border:2px dashed var(--line);border-radius:var(--r-s);background:var(--paper)">
          <p style="margin:0;font-size:clamp(.98rem,3.6vw,1.1rem);font-weight:800">Ar juosta prisipildys iki galo?</p>
          <div id="gj-guess" style="display:flex;gap:.5rem;margin-top:.4rem;flex-wrap:wrap">
            <button class="btn secondary" type="button" data-guess="taip" aria-pressed="false" style="min-height:48px;min-width:5rem">Taip</button>
            <button class="btn secondary" type="button" data-guess="ne" aria-pressed="false" style="min-height:48px;min-width:5rem">Ne</button>
          </div>
          <p id="gj-trace" role="status" style="margin:.35rem 0 0;font-size:clamp(.94rem,3.4vw,1.05rem);min-height:1.3rem"></p>
        </div>
        <div style="margin-top:.85rem">
          <div id="gj-bar" aria-hidden="true"
            style="display:grid;grid-template-columns:repeat(${GJ_CELLS},minmax(0,1fr));gap:2px;height:40px"></div>
          <p id="gj-under" style="margin:.3rem 0 0;font-size:var(--fs-s);color:var(--ink-soft);min-height:1.2rem"></p>
        </div>
        <div id="gj-compare" hidden style="margin-top:.9rem"></div>
        <div id="gj-sort" hidden style="margin-top:.9rem"></div>
      </div>`;
    controls.innerHTML = `
      <button class="btn" id="gj-hold" type="button" style="min-height:56px">Tark ir laikyk</button>
      <button class="btn secondary" id="gj-reset" type="button" style="min-height:48px">Iš naujo</button>`;

    const barEl = stage.querySelector("#gj-bar");
    const underEl = stage.querySelector("#gj-under");
    const traceEl = stage.querySelector("#gj-trace");
    const tilesEl = stage.querySelector("#gj-tiles");
    const sortEl = stage.querySelector("#gj-sort");
    const compareEl = stage.querySelector("#gj-compare");
    const holdBtn = controls.querySelector("#gj-hold");
    const cells = [];
    for (let k = 0; k < GJ_CELLS; k += 1) {
      const c = document.createElement("span");
      c.style.cssText = "display:block;border-radius:4px;background:var(--line)" + (reduced ? "" : ";transition:background 120ms linear");
      barEl.appendChild(c);
      cells.push(c);
    }

    function fill(n) {
      cells.forEach((c, i) => { c.style.background = i < n ? "var(--accent)" : "var(--line)"; });
    }

    function miniMarkup(i) {
      const n = tried.get(i) || 0;
      const inner = Array.from({ length: GJ_CELLS }, (_, k) =>
        `<span style="display:block;border-radius:1px;background:${k < n ? "var(--accent)" : "var(--line)"}"></span>`).join("");
      return `<span data-mini="${i}" aria-hidden="true"
        style="display:grid;grid-template-columns:repeat(${GJ_CELLS},minmax(0,1fr));gap:1px;width:3.2rem;max-width:100%;height:.45rem;margin-top:.2rem">${inner}</span>`;
    }

    function paintMini(i, n) {
      const host = stage.querySelector(`[data-mini="${i}"]`);
      if (!host) return;
      [...host.children].forEach((c, k) => { c.style.background = k < n ? "var(--accent)" : "var(--line)"; });
    }

    /* Plytelė: raidė ir vaiko paties išmatuota juosta. Nematavus juosta
       tuščia — tai ne užuomina, o sąžiningas „dar nežinau“. */
    function tileMarkup(i, where) {
      const s = sounds[i];
      const inner = where === "box"
        ? `<button class="btn secondary" type="button" data-out="${i}" aria-pressed="false"
             aria-label="Plytelė ${esc(s.sound)}, grąžinti į sąrašą"
             style="min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.05rem;padding:.3rem .45rem">
             <span style="font-family:var(--font-head);font-weight:900;font-size:clamp(1.1rem,4.4vw,1.4rem);line-height:1">${esc(s.sound)}</span>
             ${miniMarkup(i)}
             ${marked.has(i) ? `<span style="font-size:.6rem;line-height:1.1;color:var(--ink-soft)">ne čia</span>` : ""}
           </button>`
        : `<button class="btn secondary" type="button" data-tile="${i}" aria-pressed="false"
             aria-label="Garsas ${esc(s.sound)}"
             style="min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;padding:.3rem">
             <span style="font-family:var(--font-head);font-weight:900;font-size:clamp(1.15rem,4.6vw,1.5rem);line-height:1">${esc(s.sound)}</span>
             ${miniMarkup(i)}
           </button>`;
      return inner;
    }

    function applyPick() {
      stage.querySelectorAll("[data-tile], [data-out]").forEach((b) => {
        const i = Number(b.dataset.tile ?? b.dataset.out);
        const on = i === picked;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--accent)" : "";
      });
    }

    function renderTiles() {
      const ids = sounds.map((_, i) => i).filter((i) => !placement.has(i));
      tilesEl.innerHTML = ids.map((i) => tileMarkup(i, "row")).join("");
      tilesEl.querySelectorAll("[data-tile]").forEach((b) => {
        b.addEventListener("click", () => pick(Number(b.dataset.tile)));
      });
      applyPick();
    }

    function renderBoxes() {
      if (!sortOn) return;
      [["long", "#gj-long"], ["short", "#gj-short"]].forEach(([grp, sel]) => {
        const host = stage.querySelector(sel);
        if (!host) return;
        const ids = sounds.map((_, i) => i).filter((i) => placement.get(i) === grp);
        host.innerHTML = ids.length
          ? ids.map((i) => tileMarkup(i, "box")).join("")
          : `<span style="font-size:var(--fs-s);color:var(--ink-soft)">tuščia</span>`;
        host.querySelectorAll("[data-out]").forEach((b) => {
          b.addEventListener("click", () => removeChip(Number(b.dataset.out)));
        });
      });
      applyPick();
    }

    function clearVerdict() {
      const v = stage.querySelector("#gj-verdict");
      if (v) v.textContent = "";
    }

    function pick(i) {
      picked = i;
      applyPick();
      if (!sortOn) holdBtn.focus({ preventScroll: true });
      api.readout(sortOn ? `Plytelė ${sounds[i].sound}. Spausk eilę.` : `Garsas ${sounds[i].sound}. Laikyk mygtuką.`);
      api.note(sortOn
        ? "Pasirinkta plytelė. Spausk eilę, į kurią ją dedi."
        : "Laikyk „Tark ir laikyk“ ir tark garsą balsu. Juosta matuoja tavo paspaudimą.");
      if (!guessDone) say("ask");
    }

    function removeChip(i) {
      placement.delete(i);
      marked.clear();
      clearVerdict();
      renderTiles();
      renderBoxes();
      const back = tilesEl.querySelector(`[data-tile="${i}"]`);
      if (back) back.focus({ preventScroll: true });
      api.readout(`Plytelė ${sounds[i].sound} grįžo į sąrašą.`);
    }

    function plural(n) {
      if (n === 1) return "Viena plytelė";
      if (n % 10 >= 2 && n % 10 <= 9 && !(n % 100 >= 11 && n % 100 <= 19)) return `${n} plytelės`;
      return `${n} plytelių`;
    }

    function settleGuess(wasLong) {
      if (guessDone) return;
      guessDone = true;
      const row = stage.querySelector("#gj-guess");
      if (row) row.remove();
      traceEl.textContent = guess
        ? `Tu spėjai: ${guess}. Įvyko: ${wasLong ? "juosta pilna" : "juosta sustojo"}.`
        : `Nespėjai. Įvyko: ${wasLong ? "juosta pilna" : "juosta sustojo"}.`;
    }

    function startTrial() {
      if (holding) return;
      if (picked < 0) {
        api.readout("Pasirink garsą.");
        api.note("Pirmiausia pasirink plytelę, tada laikyk mygtuką.");
        return;
      }
      /* Spėjimas yra metodo žingsnis („prieš pirmą bandymą“), ne dekoracija:
         be jo P2 seka (veiksmas → paaiškinimas) virsta bandymu be klausimo.
         Todėl pirmas laikymas neįvyksta tyliai — jis pasako, ko trūksta, ir
         nukreipia fokusą į spėjimo mygtuką (LL-04: ne užraktas, o paaiškinimas). */
      if (!guessDone && !guess) {
        const wrap = stage.querySelector("#gj-guesswrap");
        const yes = stage.querySelector('[data-guess="taip"]');
        api.readout("Pirmiausia spėk: ar juosta prisipildys iki galo?");
        api.note("Spėk „Taip“ arba „Ne“, tada laikyk mygtuką. Spėjimas nėra atsakymas — jį palyginsi su tuo, kas įvyks.");
        if (wrap) {
          wrap.style.borderColor = "var(--accent)";
          setTimeout(() => { wrap.style.borderColor = ""; }, 1400);
        }
        if (yes) yes.focus({ preventScroll: true });
        return;
      }
      holding = true;
      fill(0);
      underEl.textContent = "";
      api.readout("Laikai. Garsas teka.");
      say("hold");
      const target = sounds[picked].stretch ? GJ_CELLS : 1;
      let n = 0;
      const finish = () => {
        holding = false;
        if (fillTimer) { clearTimeout(fillTimer); fillTimer = null; }
        tried.set(picked, n);
        paintMini(picked, n);
        const wasLong = n > 1;
        underEl.textContent = wasLong
          ? `${n} langeliai be tarpų — vienas garsas.`
          : "Vienas langelis, paskui tarpas — garsas nutrūko.";
        api.readout(wasLong ? "Juosta pilna. Garsas vienas." : "Juosta sustojo. Garsas nesitęsia.");
        api.note(wasLong
          ? "Laikei ir juosta pildėsi iki galo. Šį garsą gali tempti kiek nori."
          : "Laikei ilgiau, o juosta neilgėja. Garsas baigėsi iškart. Garsą tariai tu, o juosta matuoja tavo paspaudimą.");
        say(wasLong ? "full" : "stop");
        settleGuess(wasLong);
        const hasLong = sounds.some((s, i) => s.stretch && tried.has(i));
        const hasShort = sounds.some((s, i) => !s.stretch && tried.has(i));
        if (!sortOn && hasLong && hasShort) {
          sortOn = true;
          showCompare();
          buildSort();
          say("sort");
          api.note(wasLong
            ? "Šį garsą gali tempti, todėl juosta pilna. Kito garso juosta liko viena — palygink abi."
            : "Laikei ilgiau, o juosta neilgėjo. Abi juostos skiriasi — palygink jas.");
        }
      };
      const step = () => {
        n += 1;
        fill(n);
        if (n >= target) { finish(); return; }
        fillTimer = setTimeout(step, GJ_TICK);
      };
      if (reduced) { n = target; fill(n); finish(); return; }
      step();
    }

    function compareRow(i, label) {
      if (i === undefined) return "";
      const n = tried.get(i) || 0;
      const inner = Array.from({ length: GJ_CELLS }, (_, k) =>
        `<span style="display:block;border-radius:2px;background:${k < n ? "var(--accent)" : "var(--line)"}"></span>`).join("");
      return `
        <div style="margin-top:.4rem">
          <p style="margin:0 0 .2rem;font-size:clamp(.94rem,3.4vw,1.04rem);font-weight:800">${label}: „${esc(sounds[i].sound)}“</p>
          <div aria-hidden="true" style="display:grid;grid-template-columns:repeat(${GJ_CELLS},minmax(0,1fr));gap:2px;height:18px">${inner}</div>
        </div>`;
    }

    function showCompare() {
      const ids = [...tried.keys()];
      const longIdx = ids.filter((i) => sounds[i].stretch).pop();
      const shortIdx = ids.filter((i) => !sounds[i].stretch).pop();
      compareEl.hidden = false;
      compareEl.innerHTML = `
        <p style="margin:0;font-size:clamp(.95rem,3.4vw,1.06rem);font-weight:800">Abi juostas matei vienu metu.</p>
        ${compareRow(longIdx, "Ilgas garsas")}
        ${compareRow(shortIdx, "Trumpas garsas")}
        <p style="margin:.4rem 0 0;font-size:var(--fs-s);color:var(--ink-soft)">Abi laikei vienodai. Juostos skiriasi.</p>`;
    }

    function buildSort() {
      sortEl.hidden = false;
      sortEl.innerHTML = `
        <p style="margin:0 0 .2rem;font-family:var(--font-head);font-weight:900;font-size:clamp(1rem,3.6vw,1.15rem)">Padėk plyteles į dvi eiles.</p>
        <p style="margin:0 0 .5rem;font-size:clamp(.94rem,3.4vw,1.04rem);color:var(--ink-soft)">Pasirink plytelę, tada spausk eilę.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%, 8.5rem),1fr));gap:.6rem">
          <div style="min-width:0">
            <button class="btn secondary" type="button" data-box="long"
              aria-label="Dėti pasirinktą plytelę į eilę Ilgas garsas"
              style="width:100%;min-height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;min-width:0;overflow-wrap:anywhere">
              Ilgas garsas<span style="font-size:.72rem;font-weight:600;color:var(--ink-soft)">dėti čia</span>
            </button>
            <div id="gj-long" role="group" aria-label="Eilė Ilgas garsas"
              style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem;min-height:2rem"></div>
          </div>
          <div style="min-width:0">
            <button class="btn secondary" type="button" data-box="short"
              aria-label="Dėti pasirinktą plytelę į eilę Trumpas garsas"
              style="width:100%;min-height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;min-width:0;overflow-wrap:anywhere">
              Trumpas garsas<span style="font-size:.72rem;font-weight:600;color:var(--ink-soft)">dėti čia</span>
            </button>
            <div id="gj-short" role="group" aria-label="Eilė Trumpas garsas"
              style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem;min-height:2rem"></div>
          </div>
        </div>
        <button class="btn" type="button" id="gj-check" style="width:100%;min-height:48px;margin-top:.7rem">Palygink</button>
        <p id="gj-verdict" role="status" style="margin:.5rem 0 0;font-size:clamp(.95rem,3.4vw,1.06rem);min-height:2.4rem"></p>`;
      sortEl.querySelectorAll("[data-box]").forEach((b) => {
        b.addEventListener("click", () => place(b.dataset.box));
      });
      sortEl.querySelector("#gj-check").addEventListener("click", compare);
      renderBoxes();
    }

    function place(grp) {
      if (picked < 0) {
        api.readout("Pirmiausia pasirink plytelę.");
        api.note("Pasirink plytelę iš viršaus, tada spausk eilę.");
        return;
      }
      placement.set(picked, grp);
      marked.clear();
      clearVerdict();
      renderTiles();
      renderBoxes();
      api.readout(`Plytelė ${sounds[picked].sound} — eilėje „${grp === "long" ? "Ilgas garsas" : "Trumpas garsas"}“.`);
      api.note("Jei persigalvojai, spausk plytelę eilėje — ji grįš į sąrašą.");
    }

    function compare() {
      const unplaced = sounds.map((_, i) => i).filter((i) => !placement.has(i));
      const verdict = stage.querySelector("#gj-verdict");
      if (unplaced.length) {
        api.readout(`Sąraše dar liko ${unplaced.length}.`);
        if (verdict) verdict.textContent = `Dar ne visos plytelės eilėse: liko ${unplaced.length}.`;
        api.note("Padėk visas plyteles, tada spausk „Palygink“.");
        return;
      }
      const wrong = sounds.map((_, i) => i).filter((i) => placement.get(i) !== (sounds[i].stretch ? "long" : "short"));
      marked.clear();
      wrong.forEach((i) => marked.add(i));
      renderBoxes();
      if (wrong.length) {
        api.readout(`${plural(wrong.length)} ne savo eilėje.`);
        if (verdict) verdict.textContent = `Ne savo eilėje: ${wrong.map((i) => `„${sounds[i].sound}“`).join(", ")}. Pažiūrėk į jų juostas.`;
        api.note("Plytelė su ilga juosta eina į „Ilgas garsas“, su vienu langeliu — į „Trumpas garsas“.");
        return;
      }
      api.readout("Tinka. Visos plytelės savo eilėse.");
      if (verdict) verdict.textContent = "Tinka: visos plytelės savo eilėse.";
      api.note("Vieni garsai tęsiasi, kiti nutrūksta iškart. Tai priklauso nuo garso, o ne nuo raidės formos.");
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    stage.querySelectorAll("[data-guess]").forEach((b) => {
      b.addEventListener("click", () => {
        if (picked < 0) {
          api.readout("Pasirink garsą.");
          api.note("Pirmiausia pasirink plytelę, tada spėk.");
          return;
        }
        if (guessDone) return;
        guess = b.dataset.guess === "taip" ? "taip, bus pilna" : "ne, sustos";
        stage.querySelectorAll("[data-guess]").forEach((x) => {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        api.readout(`Spėjai: ${guess}. Dabar laikyk mygtuką.`);
        api.note("Spėjimas nėra atsakymas — palyginsi jį su tuo, kas įvyks.");
        /* Po spėjimo fokusas grįžta į veiksmą: klaviatūra neturi ieškoti
           mygtuko iš naujo, o žingsnių seka lieka „spėk → laikyk“. */
        holdBtn.focus({ preventScroll: true });
      });
    });

    holdBtn.addEventListener("click", startTrial);
    controls.querySelector("#gj-reset").addEventListener("click", () => {
      placement.clear();
      marked.clear();
      clearVerdict();
      renderTiles();
      renderBoxes();
      const first = tilesEl.querySelector("[data-tile]");
      if (first) first.focus({ preventScroll: true });
      api.readout("Pradedam iš naujo. Juostos išlieka.");
      api.note("Tavo juostos liko, o eilės tuščios. Bandyk dar kartą.");
    });

    fill(0);
    renderTiles();
    api.readout("Pasirink garsą.");
    api.note("Pirmiausia pasirink plytelę. Tada laikyk „Tark ir laikyk“ ir tark garsą balsu.");
    say("start");

    return () => {
      if (fillTimer) { clearTimeout(fillTimer); fillTimer = null; }
    };
  },
};

/* ------------------------------------------------------------------ */
/* 7. Oro kelias: kliūtis ar laisvas kelias                            */
/* ------------------------------------------------------------------ */
/* Modelis turi VIENĄ kintamąjį (garso kliūtį burnoje) ir du
   NEPRIKLAOMUS požymius, iš kurių visas darbas ir kyla:
     `obstacle` — ar orui kelyje kas nors užstoja (lūpos, dantys, liežuvis);
     `long`     — ar garsą galima tempti.
   Būtent todėl „m“ ir „s“ gali būti ilgi IR turėti kliūtį. Tai
   prieštaraujantis pavyzdys, be kurio modelis neįrodytų nieko (LL-28), o
   klaidinga nuostata „ką galiu tempti, tas balsis“ liktų nepaliesta.
   Ekrane kliūtis yra pertvara tarp oro langelių: laisvas kelias užpildo
   visus šešis, kliūtis sustabdo pusėje. Prieš bandymą pertvara rodo „?“, o
   ne savo padėtį — kitaip vaikas perskaitytų atsakymą prieš spėjimą
   (LL-15). Po bandymo ji arba išnyksta (kelias laisvas), arba pastorėja
   (kliūtis); tekstas po ja pasako, kuri kūno dalis užstoja kelią, todėl
   forma nėra vienintelis informacijos nešėjas.
   Pavieniai garsai sąmoningai NETARIAMI: sintezatorius „s“ perskaitytų
   kaip raidės vardą „es“ ir sukurtų būtent tą painiavą, kurią modelis
   griauna. Tariami tik sakiniai iš `sim.config.sentences`, o garsą taria
   pats vaikas — delnu prie lūpų arba prieš veidrodį.
   Spėjimas yra vienas vienam garsui, prieš bandymą, ir lieka ekrane kaip
   įrašas „Tu spėjai… Įvyko…“, niekada nevadinamas klaida (P3).
   Pažanga žymima tik tada, kai visos plytelės savo krūvose (§4, LL-29):
   viena teisingai padėta plytelė dar nėra įveiktas modelis. */

const OK_SLOTS = 6;
const OK_TICK = 170;

const oroKelias = {
  mount({ stage, controls, api, config }) {
    const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const raw = Array.isArray(config.sounds) ? config.sounds : [];
    const parts = config.parts && typeof config.parts === "object" ? config.parts : {};
    const piles = config.piles && typeof config.piles === "object" ? config.piles : {};
    const S = config.sentences && typeof config.sentences === "object" ? config.sentences : {};
    const PART_KEYS = ["lips", "teeth", "tongue"];
    const OBSTACLES = new Set(["none"].concat(PART_KEYS));
    const REQUIRED = ["start", "pick", "test", "free", "blocked", "place", "wrong", "done"];

    const sounds = raw.map((s) => ({
      sound: String((s && s.sound) ?? "").trim(),
      obstacle: String((s && s.obstacle) ?? "").trim(),
      long: Boolean(s && s.long === true),
    }));

    let invalid = raw.length < 4;
    raw.forEach((s) => {
      if (!s || typeof s.sound !== "string" || !s.sound.trim()) invalid = true;
      if (!s || typeof s.obstacle !== "string" || !OBSTACLES.has(s.obstacle)) invalid = true;
      if (!s || typeof s.long !== "boolean") invalid = true;
    });
    const missing = REQUIRED.filter((k) => !String(S[k] ?? "").trim());
    if (!String(piles.free ?? "").trim()) missing.push("piles.free");
    if (!String(piles.blocked ?? "").trim()) missing.push("piles.blocked");
    PART_KEYS.forEach((k) => { if (!String(parts[k] ?? "").trim()) missing.push(`parts.${k}`); });

    if (invalid || missing.length) {
      console.error("[oro-kelias] reikia bent 4 garsų su „sound“, „obstacle“, „long“ ir tekstų:", REQUIRED.join(", "), missing, config);
      stage.innerHTML = `<p class="error-box">Garsų duomenys nesuderinti.</p>`;
      controls.innerHTML = "";
      api.readout("Garsų duomenys nesuderinti.");
      api.note("");
      return () => {};
    }

    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spoken = new Set();
    const tested = new Map();      // plytelė → ar kelias buvo laisvas
    const guessed = new Map();     // plytelė → vaiko spėjimas „free“ | „blocked“
    const placement = new Map();   // plytelė → „free“ | „blocked“
    const marked = new Set();      // po „Palygink“ ne savo krūvoje
    let picked = -1;
    let timer = null;
    let testing = false;
    let reported = false;

    function say(key) {
      const text = String(S[key] ?? "").trim();
      if (!text || spoken.has(key)) return;
      spoken.add(key);
      api.speak(text, { rate: .85 });
    }

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(34rem, 100%);margin:0 auto">
        <p style="margin:0 0 .5rem;font-family:var(--font-head);font-weight:900;font-size:clamp(1rem,3.8vw,1.15rem)">Pasirink plytelę, tada spausk „Tark ir pūsk“.</p>
        <div id="ok-tiles" role="group" aria-label="Garsų plytelės"
          style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%, 3.2rem),1fr));gap:.5rem"></div>
        <div style="margin-top:.8rem;padding:.6rem .7rem;border:2px solid var(--line);border-radius:var(--r-s);background:var(--paper)">
          <p style="margin:0;font-size:clamp(.98rem,3.6vw,1.08rem);font-weight:800">Ar šiam garsui kelyje kas nors užstoja?</p>
          <div style="display:flex;gap:.5rem;margin-top:.4rem;flex-wrap:wrap">
            <button class="btn secondary" type="button" data-guess="free" aria-pressed="false" style="min-height:48px;min-width:0;max-width:100%;overflow-wrap:anywhere">${esc(piles.free)}</button>
            <button class="btn secondary" type="button" data-guess="blocked" aria-pressed="false" style="min-height:48px;min-width:0;max-width:100%;overflow-wrap:anywhere">${esc(piles.blocked)}</button>
          </div>
          <p id="ok-trace" role="status" style="margin:.4rem 0 0;font-size:clamp(.94rem,3.4vw,1.04rem);min-height:1.4rem"></p>
          <div id="ok-path" aria-hidden="true" style="display:grid;grid-template-columns:1fr 1fr 1fr auto 1fr 1fr 1fr;gap:3px;align-items:center;height:38px;margin-top:.45rem">
            ${[0, 1, 2].map((k) => `<span data-slot="${k}" style="display:block;height:14px;border-radius:999px;background:var(--line)"></span>`).join("")}
            <span id="ok-gate"></span>
            ${[3, 4, 5].map((k) => `<span data-slot="${k}" style="display:block;height:14px;border-radius:999px;background:var(--line)"></span>`).join("")}
          </div>
          <p id="ok-under" style="margin:.3rem 0 0;font-size:var(--fs-s);color:var(--ink-soft);min-height:1.5rem"></p>
        </div>
        <div style="margin-top:.8rem">
          <p style="margin:0 0 .35rem;font-size:clamp(.95rem,3.4vw,1.05rem)">Pasirink plytelę, tada spausk krūvą.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%, 8.5rem),1fr));gap:.6rem">
            <div>
              <button class="btn secondary" type="button" data-box="free"
                aria-label="Dėti pasirinktą plytelę į krūvą ${esc(piles.free)}"
                style="width:100%;min-height:64px">${esc(piles.free)}</button>
              <div id="ok-free" role="group" aria-label="Krūva ${esc(piles.free)}"
                style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem;min-height:2rem"></div>
            </div>
            <div>
              <button class="btn secondary" type="button" data-box="blocked"
                aria-label="Dėti pasirinktą plytelę į krūvą ${esc(piles.blocked)}"
                style="width:100%;min-height:64px">${esc(piles.blocked)}</button>
              <div id="ok-blocked" role="group" aria-label="Krūva ${esc(piles.blocked)}"
                style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem;min-height:2rem"></div>
            </div>
          </div>
          <button class="btn" type="button" id="ok-check" style="width:100%;min-height:48px;margin-top:.7rem">Palygink</button>
          <p id="ok-verdict" role="status" style="margin:.5rem 0 0;font-size:clamp(.95rem,3.4vw,1.06rem);min-height:2.6rem"></p>
        </div>
      </div>`;
    controls.innerHTML = `
      <button class="btn" id="ok-blow" type="button" style="min-height:56px">Tark ir pūsk</button>
      <button class="btn secondary" id="ok-reset" type="button" style="min-height:48px">Iš naujo</button>`;

    const tilesEl = stage.querySelector("#ok-tiles");
    const freeEl = stage.querySelector("#ok-free");
    const blockedEl = stage.querySelector("#ok-blocked");
    const gateEl = stage.querySelector("#ok-gate");
    const underEl = stage.querySelector("#ok-under");
    const traceEl = stage.querySelector("#ok-trace");
    const verdictEl = stage.querySelector("#ok-verdict");
    const slots = [...stage.querySelectorAll("[data-slot]")].sort((a, b) => Number(a.dataset.slot) - Number(b.dataset.slot));
    const blowBtn = controls.querySelector("#ok-blow");

    function fill(n) {
      slots.forEach((c, i) => { c.style.background = i < n ? "var(--accent)" : "var(--line)"; });
    }

    /* Trys pertvaros būsenos: „unknown“ — dar nebandyta (klausimas), „free“ —
       kelias atviras (pertvara išnyksta), „blocked“ — kliūtis (pertvara
       pastorėja). Spalva niekada nėra vienintelė žinia: po ja esantis tekstas
       pasako tą patį žodžiais (standartas §4.4). */
    function setGate(state) {
      gateEl.textContent = state === "unknown" ? "?" : "";
      gateEl.style.display = "block";
      gateEl.style.boxSizing = "border-box";
      gateEl.style.margin = "0 .15rem";
      gateEl.style.borderRadius = "4px";
      if (state === "blocked") {
        gateEl.style.width = ".5rem";
        gateEl.style.height = "30px";
        gateEl.style.border = "0";
        gateEl.style.background = "var(--ink-soft)";
      } else if (state === "free") {
        gateEl.style.width = "0";
        gateEl.style.height = "0";
        gateEl.style.border = "0";
        gateEl.style.background = "transparent";
        gateEl.style.margin = "0";
      } else {
        gateEl.style.width = "1.4rem";
        gateEl.style.height = "24px";
        gateEl.style.border = "2px dashed var(--ink-faint)";
        gateEl.style.background = "transparent";
        gateEl.style.color = "var(--ink-soft)";
        gateEl.style.fontSize = ".72rem";
        gateEl.style.textAlign = "center";
        gateEl.style.lineHeight = "20px";
      }
    }

    function tileMarkup(i, inBox) {
      const s = sounds[i];
      return `<button class="btn secondary" type="button" ${inBox ? `data-out="${i}"` : `data-tile="${i}"`}
        aria-label="${inBox ? `Plytelė ${esc(s.sound)}, grąžinti į sąrašą` : `Plytelė ${esc(s.sound)}`}"
        aria-pressed="${i === picked ? "true" : "false"}"
        style="${i === picked ? "border-color:var(--accent);" : ""}min-height:56px;min-width:3.2rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.05rem;padding:.25rem .4rem">
        <span style="font-family:var(--font-head);font-weight:900;font-size:clamp(1.15rem,4.6vw,1.5rem);line-height:1">${esc(s.sound)}</span>
        ${inBox && marked.has(i) ? `<span style="font-size:.66rem;line-height:1.1;color:var(--ink-soft)">ne čia</span>` : ""}
      </button>`;
    }

    function renderTiles() {
      const ids = sounds.map((_, i) => i).filter((i) => !placement.has(i));
      tilesEl.innerHTML = ids.map((i) => tileMarkup(i, false)).join("");
      tilesEl.querySelectorAll("[data-tile]").forEach((b) => {
        b.addEventListener("click", () => pick(Number(b.dataset.tile)));
      });
    }

    function renderBoxes() {
      [["free", freeEl], ["blocked", blockedEl]].forEach(([grp, host]) => {
        const ids = sounds.map((_, i) => i).filter((i) => placement.get(i) === grp);
        host.innerHTML = ids.length
          ? ids.map((i) => tileMarkup(i, true)).join("")
          : `<span style="font-size:var(--fs-s);color:var(--ink-soft)">tuščia</span>`;
        host.querySelectorAll("[data-out]").forEach((b) => {
          b.addEventListener("click", () => takeBack(Number(b.dataset.out)));
        });
      });
    }

    function cancelTest() {
      if (timer) { clearTimeout(timer); timer = null; }
      testing = false;
      fill(0);
      setGate("unknown");
      underEl.textContent = "";
      traceEl.textContent = "";
    }

    function pick(i) {
      if (testing) cancelTest();
      picked = i;
      const s = sounds[i];
      renderTiles();
      renderBoxes();
      api.readout(`Plytelė ${s.sound}. Tark garsą balsu.`);
      api.note(guessed.has(i)
        ? "Šį garsą jau bandei. Spausk krūvą arba iš naujo „Tark ir pūsk“."
        : "Pirmiau spėk, ar orui kelyje kas nors užstoja. Tada spausk „Tark ir pūsk“ ir tark garsą balsu.");
      if (!guessed.has(i)) say("pick");
    }

    function takeBack(i) {
      placement.delete(i);
      marked.clear();
      verdictEl.textContent = "";
      renderTiles();
      renderBoxes();
      const back = tilesEl.querySelector(`[data-tile="${i}"]`);
      if (back) back.focus({ preventScroll: true });
      api.readout(`Plytelė ${sounds[i].sound} grįžo į sąrašą.`);
    }

    function plural(n) {
      if (n === 1) return "Viena plytelė";
      if (n % 10 >= 2 && n % 10 <= 9 && !(n % 100 >= 11 && n % 100 <= 19)) return `${n} plytelės`;
      return `${n} plytelių`;
    }

    function runTest() {
      if (picked < 0) {
        api.readout("Pirmiausia pasirink plytelę.");
        api.note("Pasirink plytelę iš sąrašo, tada spausk „Tark ir pūsk“.");
        const first = tilesEl.querySelector("[data-tile]");
        if (first) first.focus({ preventScroll: true });
        return;
      }
      if (testing) return;
      const s = sounds[picked];
      const free = s.obstacle === "none";
      const target = free ? OK_SLOTS : 3;

      testing = true;
      setGate("unknown");
      fill(0);
      underEl.textContent = "";
      traceEl.textContent = "";
      api.readout(`Garsas ${s.sound}. Oras eina per burną.`);
      say("test");

      const finish = () => {
        testing = false;
        if (timer) { clearTimeout(timer); timer = null; }
        fill(target);
        setGate(free ? "free" : "blocked");
        tested.set(picked, free);
        underEl.textContent = free
          ? "Oras ėjo iki galo — kelyje nieko nebuvo."
          : `Oras sustojo: kelią užstoja ${parts[s.obstacle]}.`;
        const guess = guessed.get(picked);
        traceEl.textContent = guess
          ? `Tu spėjai: „${piles[guess]}“. Įvyko: „${piles[free ? "free" : "blocked"]}“.`
          : `Nespėjai. Įvyko: „${piles[free ? "free" : "blocked"]}“.`;
        api.readout(free ? "Oras ėjo iki galo." : "Oras sustojo ties kliūtimi.");
        api.note("Dabar pasirink plytelę ir spausk krūvą, į kurią ją dedi.");
        say(free ? "free" : "blocked");
      };

      if (reduced) { finish(); return; }
      let n = 0;
      const step = () => {
        n += 1;
        fill(n);
        if (n >= target) { finish(); return; }
        timer = setTimeout(step, OK_TICK);
      };
      timer = setTimeout(step, OK_TICK);
    }

    function place(grp) {
      if (picked < 0) {
        api.readout("Pirmiausia pasirink plytelę.");
        api.note("Pasirink plytelę iš sąrašo viršuje, tada spausk krūvą.");
        return;
      }
      placement.set(picked, grp);
      marked.clear();
      verdictEl.textContent = "";
      const idx = picked;
      const s = sounds[idx];
      picked = -1;
      renderTiles();
      renderBoxes();
      api.readout(`Plytelė ${s.sound} — krūvoje „${piles[grp]}“.`);
      api.note(tested.has(idx)
        ? "Jei persigalvojai, spausk plytelę krūvoje — ji grįš į sąrašą."
        : "Šios plytelės dar nebandei. Gali pirmiau pasirinkti ją ir spausti „Tark ir pūsk“.");
      const next = tilesEl.querySelector("[data-tile]");
      if (next) next.focus({ preventScroll: true });
      say("place");
    }

    function compare() {
      const unplaced = sounds.map((_, i) => i).filter((i) => !placement.has(i));
      if (unplaced.length) {
        verdictEl.textContent = `Dar ne visos plytelės krūvose: liko ${unplaced.length} iš ${sounds.length}.`;
        api.readout(`Dar liko ${unplaced.length}.`);
        api.note("Padėk visas plyteles, tada spausk „Palygink“.");
        return;
      }
      const wrong = sounds.map((_, i) => i).filter((i) =>
        placement.get(i) !== (sounds[i].obstacle === "none" ? "free" : "blocked"));
      marked.clear();
      wrong.forEach((i) => marked.add(i));
      renderBoxes();

      if (wrong.length) {
        const facts = wrong.map((i) => {
          const s = sounds[i];
          if (!tested.has(i)) return `„${s.sound}“ — dar neišbandei`;
          return s.obstacle === "none"
            ? `„${s.sound}“ — bandyme kelias buvo laisvas`
            : `„${s.sound}“ — bandyme oras sustojo, kelią užstoja ${parts[s.obstacle]}`;
        });
        verdictEl.textContent = `${plural(wrong.length)} ne savo krūvoje. ${facts.join("; ")}.`;
        api.readout(`${plural(wrong.length)} ne savo krūvoje.`);
        api.note("Spausk plytelę krūvoje — ji grįš į sąrašą. Perkelk tas, kurių bandymas rodė ką kita.");
        say("wrong");
        return;
      }

      /* Krūvos teisingos — dabar modelis parodo, kad ilgis ir kliūtis
         nepriklauso vienas nuo kito. Sąrašai skaičiuojami iš tų pačių
         duomenų, kuriuos matė vaikas (LL-21), o jei prieštaraujančio
         pavyzdžio nėra — sakoma tiesiai, o ne apsimetama įrodymu. */
      const longFree = sounds.filter((s) => s.obstacle === "none" && s.long).map((s) => s.sound);
      const longBlocked = sounds.filter((s) => s.obstacle !== "none" && s.long).map((s) => s.sound);
      const names = (list) => list.map((x) => `„${x}“`).join(", ");
      verdictEl.textContent = "Tinka: kiekviena plytelė savo krūvoje.";
      if (longFree.length && longBlocked.length) {
        api.note(`Abiejose krūvose yra garsų, kuriuos gali tempti: „${piles.free}“ — ${names(longFree)}, „${piles.blocked}“ — ${names(longBlocked)}. Todėl ilgis nepasako, kuriai krūvai garsas priklauso.`);
        api.readout("Tinka. Abiejose krūvose yra ilgų garsų.");
      } else {
        console.warn("[oro-kelias] modelyje nėra prieštaraujančio pavyzdžio: ilgų garsų yra tik vienoje krūvoje", { longFree, longBlocked });
        api.note("Tinka: kiekviena plytelė savo krūvoje. Šioje užduotyje ilgi garsai yra tik vienoje krūvoje, todėl ilgis čia dar nieko neįrodo.");
        api.readout("Tinka. Visos plytelės savo krūvose.");
      }
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
      say("done");
    }

    stage.querySelectorAll("[data-guess]").forEach((b) => {
      b.addEventListener("click", () => {
        if (picked < 0) {
          api.readout("Pirma pasirink plytelę.");
          api.note("Pasirink plytelę iš sąrašo, tada spėk.");
          const first = tilesEl.querySelector("[data-tile]");
          if (first) first.focus({ preventScroll: true });
          return;
        }
        if (tested.has(picked)) {
          api.readout("Šis garsas jau išbandytas.");
          api.note("Šio garso spėjimas jau palygintas su bandymu. Pasirink kitą plytelę.");
          return;
        }
        const value = b.dataset.guess;
        guessed.set(picked, value);
        stage.querySelectorAll("[data-guess]").forEach((x) => {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        api.readout(`Spėjai: „${piles[value]}“.`);
        api.note("Spėjimas nėra atsakymas — palyginsi jį su tuo, ką parodys bandymas.");
        blowBtn.focus({ preventScroll: true });
      });
    });

    stage.querySelectorAll("[data-box]").forEach((b) => {
      b.addEventListener("click", () => place(b.dataset.box));
    });
    stage.querySelector("#ok-check").addEventListener("click", compare);
    blowBtn.addEventListener("click", runTest);
    controls.querySelector("#ok-reset").addEventListener("click", () => {
      placement.clear();
      marked.clear();
      verdictEl.textContent = "";
      renderTiles();
      renderBoxes();
      const first = tilesEl.querySelector("[data-tile]");
      if (first) first.focus({ preventScroll: true });
      api.readout("Pradedam iš naujo. Bandymai išlieka.");
      api.note("Tavo bandymai liko, o krūvos tuščios. Dėk plyteles iš naujo.");
    });

    fill(0);
    setGate("unknown");
    renderTiles();
    renderBoxes();
    api.readout("Pasirink garsą.");
    api.note("Pasirink plytelę, spėk, tada spausk „Tark ir pūsk“ ir tark garsą balsu.");
    say("start");

    return () => {
      if (timer) { clearTimeout(timer); timer = null; }
    };
  },
};

export const SIMS = {
  "garso-raides": garsoRaides,
  "skiemenu-jungimas": skiemenuJungimas,
  "sakinio-zodziai": sakinioZodziai,
  "kaip-zmones-sveikinasi": kaipZmonesSveikinasi,
  "plakatas-ir-informacija": plakatasIrInformacija,
  "garso-juosta": garsoJuosta,
  "oro-kelias": oroKelias,
};
