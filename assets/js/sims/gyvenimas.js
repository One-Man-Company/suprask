/**
 * Gyvenimo įgūdžių simuliacijos (1 klasė).
 *
 * `dovana-ir-noras` — M-05 modelis (research/wiki/grades/01/metodai.md#M-05):
 * tas pats įvykis (dovana) laikomas pastovus, o keičiamas TIK vieno veikėjo
 * noras. Antras veikėjas yra kontrolinė pora: jo noras nekinta, todėl jo veidas
 * nepakinta nė karto. Jei jausmą lemtų dovana, abu veidai keistųsi kartu.
 *
 * Kodėl scena surenkama iš art.js dalių: stalas (plank), vaikai (kid), dėžutė
 * (block), kamuolys (ball) — tai tos pačios formos kaip kitose scenose (LL-13).
 * Veido išraiškos art.js neturi (standarto „Iliustracijos“ sąraše tokios dalies
 * nėra), todėl akys ir burna piešiamos čia pat — jos ir yra kintamoji būsena,
 * kurios negalima pakeisti jokia bendra dalimi.
 *
 * Tekstas scenoje nerašomas: SVG sumažinamas iki 300 px pločio, o 6–7 metų
 * vaikui mažas tekstas telefone yra atskiras defektas (LL-06). Vardai ir jausmų
 * žodžiai yra HTML, todėl jie išlieka skaitomo dydžio visuose plotuose.
 */
import { art } from "./art.js";

/**
 * Veido išraiška ant `art.kid` galvos.
 * mood: happy | sad | neutral (M-05) ir angry | fear (`jausmo-vardas`).
 * Baimės ir pykčio veidai piešiami čia pat, nes `art.js` veido neturi, o tai
 * yra kintamoji būsena, kurią reikia parodyti toje pačioje scenoje.
 */
function face(cx, cy, r, mood) {
  const f = (v) => v.toFixed(1);
  const eyeY = cy - r * 0.2;
  const eyeDx = r * 0.38;
  const dot = (x) => `<circle cx="${f(x)}" cy="${f(eyeY)}" r="${f(r * 0.14)}" fill="#3a342b"/>`;
  const stroke = `fill="none" stroke="#3a342b" stroke-width="${f(r * 0.16)}" stroke-linecap="round"`;
  let eyes = dot(cx - eyeDx) + dot(cx + eyeDx);
  let brows = "";
  let mouth;
  if (mood === "happy") {
    mouth = `<path d="M${f(cx - r * 0.44)} ${f(cy + r * 0.26)} Q ${f(cx)} ${f(cy + r * 0.7)} ${f(cx + r * 0.44)} ${f(cy + r * 0.26)}" ${stroke}/>`;
  } else if (mood === "sad") {
    mouth = `<path d="M${f(cx - r * 0.44)} ${f(cy + r * 0.62)} Q ${f(cx)} ${f(cy + r * 0.18)} ${f(cx + r * 0.44)} ${f(cy + r * 0.62)}" ${stroke}/>`;
  } else if (mood === "angry") {
    /* Antakiai susitraukę į vidų — pyktis atpažįstamas ne tik iš burnos. */
    brows = `<line x1="${f(cx - r * 0.64)}" y1="${f(eyeY - r * 0.52)}" x2="${f(cx - r * 0.16)}" y2="${f(eyeY - r * 0.28)}" ${stroke}/>`
      + `<line x1="${f(cx + r * 0.64)}" y1="${f(eyeY - r * 0.52)}" x2="${f(cx + r * 0.16)}" y2="${f(eyeY - r * 0.28)}" ${stroke}/>`;
    mouth = `<path d="M${f(cx - r * 0.44)} ${f(cy + r * 0.6)} Q ${f(cx)} ${f(cy + r * 0.22)} ${f(cx + r * 0.44)} ${f(cy + r * 0.6)}" ${stroke}/>`;
  } else if (mood === "fear") {
    /* Baimė: plačiai atmerktos akys ir maža apvali burna. */
    const eye = (x) => `<circle cx="${f(x)}" cy="${f(eyeY)}" r="${f(r * 0.26)}" fill="#ffffff" stroke="#3a342b" stroke-width="${f(r * 0.1)}"/>`
      + `<circle cx="${f(x)}" cy="${f(eyeY)}" r="${f(r * 0.1)}" fill="#3a342b"/>`;
    eyes = eye(cx - eyeDx) + eye(cx + eyeDx);
    mouth = `<ellipse cx="${f(cx)}" cy="${f(cy + r * 0.46)}" rx="${f(r * 0.2)}" ry="${f(r * 0.26)}" fill="#3a342b"/>`;
  } else {
    mouth = `<line x1="${f(cx - r * 0.36)}" y1="${f(cy + r * 0.4)}" x2="${f(cx + r * 0.36)}" y2="${f(cy + r * 0.4)}" ${stroke}/>`;
  }
  return brows + eyes + mouth;
}

/**
 * Kilmininkas tiems daiktams, kuriuos simuliacija gali pavadinti sakinyje
 * („norėjo kamuolio“, ne „norėjo kamuolys“). Nežinomas žodis lieka kaip yra —
 * tada sakinys skamba prasčiau, bet ne meluoja.
 */
const GENITIVE = {
  kamuolys: "kamuolio",
  knyga: "knygos",
  pieštukas: "pieštuko",
  trintukas: "trintuko",
  šalikas: "šaliko",
  lėlė: "lėlės",
};

const gen = (word) => GENITIVE[word] || word;

/** Noro burbulo piktograma. Knyga — staciakampis su nugarėle ir lapų linijomis. */
function wantIcon(kind, size = 36) {
  if (kind === "kamuolys") {
    return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true" focusable="false">${art.ball(20, 20, 15)}</svg>`;
  }
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true" focusable="false">
    ${art.flatShape("staciakampis", 21, 20, 34)}
    <line x1="12" y1="10.4" x2="12" y2="29.6" stroke="#6d4a1c" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="16" y1="15" x2="30" y2="15" stroke="#6d4a1c" stroke-width="1.5" opacity=".45"/>
    <line x1="16" y1="20" x2="30" y2="20" stroke="#6d4a1c" stroke-width="1.5" opacity=".45"/>
    <line x1="16" y1="25" x2="30" y2="25" stroke="#6d4a1c" stroke-width="1.5" opacity=".45"/>
  </svg>`;
}

const dovanIrNoras = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const gift = config.gift || "kamuolys";
    const fixed = config.fixed || { name: "Ieva", wants: "knyga" };
    const varying = config.varying || { name: "Rėjus", wants: gift };
    const OPTIONS = [gift, fixed.wants];
    const START_WANT = OPTIONS.includes(varying.wants) ? varying.wants : gift;

    let wants = START_WANT;
    let open = false;
    let predicted = false;
    const seen = new Set();
    let reported = false;

    /* `1fr 1fr` yra `minmax(auto,1fr)`: takelio minimumas — vaiko min-content.
       Kol kortelėse buvo tik „kamuolys“ ir „knyga“, tai tilpo; prie 200 %
       teksto (32 px šaknis) @360 px žodis „Pakeisk“ vienas yra ~103 px, o
       `#dn-want` min-content — 195 px, todėl takelis išsitiesė iki 203 px,
       dvi kolonos sudarė 425 px ir dokumentas slinko +125 px (LL-55/LL-70).
       Todėl takelis rašomas `minmax(0,1fr)` (gali trauktis, ne tik augti), o
       kiekvienas tinklelio vaikas turi `min-width:0`. Žodžiai laužomi tik
       tada, kai kitaip neišsitektų (`overflow-wrap:anywhere`), o ne iš anksto:
       16 px šaknyje matmenys nepakito — kolonos lieka 145/160 px kaip buvusios.
       Ta pati taisyklė galioja ir jausmų eilutei žemiau (`#dn-r-mood`,
       `#dn-i-mood`): žodis „nusiminęs“ prie 200 % yra 187 px, tad ir ten
       takelis rašomas `minmax(0,1fr)`. */
    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:26rem">
        <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.6rem;margin-bottom:.45rem">
          <div style="display:grid;justify-items:center;gap:.2rem;min-width:0">
            <span style="font-weight:800;font-size:.95rem;color:var(--ink-soft);max-width:100%;overflow-wrap:anywhere">${varying.name}</span>
            <button type="button" id="dn-want"
              style="width:100%;min-width:0;min-height:3.8rem;padding:.4rem .3rem;border:2px dashed var(--ink-soft);border-radius:1rem;background:var(--paper);display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;gap:.1rem;font:inherit;font-weight:800;color:var(--ink);cursor:pointer">
              <span id="dn-want-icon" aria-hidden="true">${wantIcon(wants)}</span>
              <span id="dn-want-word" style="font-size:1rem;max-width:100%;overflow-wrap:anywhere">${wants}</span>
              <span style="font-size:.8rem;font-weight:700;color:var(--ink-soft);max-width:100%;overflow-wrap:anywhere">Pakeisk norą</span>
            </button>
          </div>
          <div style="display:grid;justify-items:center;gap:.2rem;min-width:0">
            <span style="font-weight:800;font-size:.95rem;color:var(--ink-soft);max-width:100%;overflow-wrap:anywhere">${fixed.name}</span>
            <div style="width:100%;min-width:0;min-height:3.8rem;padding:.4rem .3rem;border:2px solid var(--line);border-radius:1rem;background:var(--paper-2);display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;gap:.1rem;font-weight:800;color:var(--ink)">
              <span aria-hidden="true">${wantIcon(fixed.wants)}</span>
              <span style="font-size:1rem;max-width:100%;overflow-wrap:anywhere">${fixed.wants}</span>
              <span style="font-size:.8rem;font-weight:700;color:var(--ink-soft);max-width:100%;overflow-wrap:anywhere">Noras nesikeičia</span>
            </div>
          </div>
        </div>

        <svg id="dn-scene" viewBox="0 0 320 210" width="100%" role="img" style="display:block"
             aria-label="Scena"></svg>

        <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.6rem;text-align:center;margin-top:.35rem">
          <div id="dn-r-mood" style="font-weight:800;min-height:1.6rem;min-width:0;max-width:100%;overflow-wrap:anywhere">—</div>
          <div id="dn-i-mood" style="font-weight:800;min-height:1.6rem;min-width:0;max-width:100%;overflow-wrap:anywhere">—</div>
        </div>

        <p id="dn-compare" hidden
           style="margin:.7rem 0 0;padding:.6rem .8rem;border-left:4px solid var(--sun);background:var(--paper-2);border-radius:.5rem;font-size:1rem"></p>
      </div>`;

    const svg = stage.querySelector("#dn-scene");
    const wantBtn = stage.querySelector("#dn-want");
    const wantIconBox = stage.querySelector("#dn-want-icon");
    const wantWord = stage.querySelector("#dn-want-word");
    const rMoodEl = stage.querySelector("#dn-r-mood");
    const iMoodEl = stage.querySelector("#dn-i-mood");
    const compareEl = stage.querySelector("#dn-compare");

    controls.innerHTML = `
      <button class="btn" id="dn-say" aria-label="Sakau. Atsakiau į klausimą.">Sakau</button>
      <button class="btn secondary" id="dn-open" aria-label="Atidaryti dovanos dėžutę">Atidaryk dėžutę</button>
      <button class="btn ghost" id="dn-reset" aria-label="Pradėti iš naujo">Iš naujo</button>`;
    const sayBtn = controls.querySelector("#dn-say");
    const openBtn = controls.querySelector("#dn-open");
    const resetBtn = controls.querySelector("#dn-reset");

    function drawScene(rMood, iMood) {
      const kidScale = 1.35;
      const headY = 176 - 33 * kidScale;
      const headR = 8 * kidScale;
      svg.innerHTML = `
        ${art.plank(40, 186, 240, 12, 0)}
        ${art.kid(72, 176, kidScale, "#ff8a3d")}
        ${art.kid(248, 176, kidScale, "#4fc3a1")}
        <g data-face="varying" data-mood="${rMood}">${face(72, headY, headR, rMood)}</g>
        <g data-face="fixed" data-mood="${iMood}">${face(248, headY, headR, iMood)}</g>
        ${art.block(138, 126, 46, "#e9a13a", open ? "" : "?", "#a06a1c")}
        ${open ? art.ball(161, 118, 15) : ""}`;
    }

    function paint({ speak = false } = {}) {
      const rMood = !open ? "neutral" : wants === gift ? "happy" : "sad";
      const iMood = !open ? "neutral" : "sad";
      if (open) seen.add(wants);
      const compared = open && seen.size >= 2;

      drawScene(rMood, iMood);
      wantIconBox.innerHTML = wantIcon(wants);
      wantWord.textContent = wants;
      wantBtn.setAttribute("aria-label", `${varying.name} nori ${wants}. Pakeisk norą.`);
      wantBtn.setAttribute("aria-pressed", String(open && wants === gift));

      rMoodEl.textContent = open ? (rMood === "happy" ? "patenkintas" : "nusiminęs") : "—";
      iMoodEl.textContent = open ? "nusiminęs" : "—";

      compareEl.hidden = !compared;
      compareEl.textContent = compared
        ? `Kai ${varying.name} norėjo ${gen(gift)}, jis džiaugėsi. Kai ${varying.name} norėjo ${gen(fixed.wants)}, nusiminė abu.`
        : "";

      svg.setAttribute(
        "aria-label",
        open
          ? `${varying.name} norėjo ${gen(wants)}. ${fixed.name} norėjo ${gen(fixed.wants)}. Dėžutėje ${gift}.`
          /* „nori“ reikalauja kilmininko, kaip ir „norėjo“: be `gen()` čia
             skambėjo „Rėjus nori kamuolys“ — tas pats žodis, kaip kortelėje,
             bet netaisyklingoje formoje. `GENITIVE` žodynas šiame faile jau
             yra, tad naudojamas ir uždarytos dėžutės būsenoje. */
          : `Dėžutė uždaryta. ${varying.name} nori ${gen(wants)}. ${fixed.name} nori ${gen(fixed.wants)}.`
      );

      let text;
      if (!predicted) text = S.predict || "";
      else if (!open) text = S.start || "";
      else if (compared) text = S.same || "";
      else if (rMood === "happy") text = S.one || "";
      else text = S.both || "";
      api.readout(text);
      if (speak && text) api.speak(text, { rate: 0.9 });

      let note;
      if (!predicted) note = "Pasakyk savo spėjimą. Tada spausk „Sakau“.";
      else if (!open) note = "Dabar keisk norą arba atidaryk dėžutę.";
      else if (compared) note = "Tas pats kamuolys. Vienas jo norėjo, kitas ne.";
      else if (wants !== gift) note = "Pasikeitė tik noras. Dovana liko ta pati.";
      else note = `${varying.name} norėjo ${gen(gift)}. ${fixed.name} norėjo ${gen(fixed.wants)}.`;
      api.note(note);

      if (open && seen.size >= 2 && !reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function toggleWant() {
      if (!predicted) {
        api.note("Pirmiausia atsakyk į klausimą. Tada keisk norą.");
        return;
      }
      wants = wants === gift ? fixed.wants : gift;
      paint({ speak: true });
    }

    wantBtn.addEventListener("click", toggleWant);
    wantBtn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        toggleWant();
      }
    });

    sayBtn.addEventListener("click", () => {
      predicted = true;
      paint({ speak: true });
    });

    openBtn.addEventListener("click", () => {
      if (!predicted) {
        api.note("Pirmiausia atsakyk į klausimą. Tada atidaryk.");
        return;
      }
      open = !open;
      openBtn.textContent = open ? "Uždaryk dėžutę" : "Atidaryk dėžutę";
      openBtn.setAttribute("aria-label", open ? "Uždaryti dovanos dėžutę" : "Atidaryti dovanos dėžutę");
      paint({ speak: true });
    });

    resetBtn.addEventListener("click", () => {
      wants = START_WANT;
      open = false;
      predicted = false;
      openBtn.textContent = "Atidaryk dėžutę";
      openBtn.setAttribute("aria-label", "Atidaryti dovanos dėžutę");
      paint();
    });

    paint();
    return null;
  },
};

/**
 * `jausmo-vardas` — emocijų žodyno modelis 1 klasei (gyvenimo įgūdžiai),
 * M-05 krypties tęsinys: M-05 aiškino, nuo ko jausmas priklauso, o šis
 * modelis klausia, kas jį pavadina.
 *
 * Ta pati scena (vaikas prieš klasę) laikoma pastovi, o keičiamas TIK tas,
 * kuris kalba. Kiekvienas vaikas pasako savo jausmą savais žodžiais, ir
 * jausmo žodis ateina kartu su juo. Ketvirta būsena — niekas nieko nesako:
 * tada žodžio neturime, nors veidas ir vieta matomi.
 *
 * Kodėl būtent taip: 6–7 metų vaiko jausmo žodis dar platus — vienas žodis
 * dengia kelis jausmus (Widen & Russell, 2008, žr. modulio `sources`). Todėl
 * modelis nesiekia, kad vaikas atspėtų kito jausmą iš veido. Jis rodo, kad
 * tikslų žodį pasako pats žmogus; kartu vaikas girdi ir pamato tris programos
 * žodžius: baikštus, piktas, pakylėtas (ir tylą kaip ketvirtą atvejį).
 *
 * Scena surenkama iš art.js dalių (LL-13): lenta (block), grindys (plank),
 * vaikas (kid). Veidas piešiamas `face()` — art.js veido neturi.
 *
 * Tekstas scenoje nerašomas: SVG mažinamas iki 300 px pločio, o mažas tekstas
 * telefone yra atskiras defektas (LL-06). Vaiko sakinys yra HTML virš scenos.
 */
const jausmoVardas = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const states = Array.isArray(config.states) ? config.states : [];
    const silentName = config.silentName || "Niekas nekalba";

    /* Duomenų vientisumas: kiekvienas vaikas turi vardą, veidą ir sakinį.
       Jei sakinio nėra, modelis tylėtų ten, kur turėjo kalbėti, ir vaikas
       negirdėtų žodžio — todėl tai klaida, o ne tyli spraga (M-10/M-11/M-12
       taisyklė: ekrano teiginys išvedamas iš tų pačių duomenų, kuriuos mato vaikas). */
    const broken = states.length < 2 || states.some((s) => !s || !s.name || !s.face || !S[s.key]);
    if (broken) {
      console.error("Jausmai nesuderinti: kiekvienam vaikui reikia name, face ir sentences[keys].");
      stage.innerHTML = `<p style="margin:0;font-weight:800">Jausmai nesuderinti su žodynu.</p>`;
      api.readout("Jausmai nesuderinti.");
      return null;
    }

    const BODY = ["#c98b5e", "#5aa58a", "#7fa8d8"];
    let predicted = false;
    let selected = null; /* states raktas arba "silent" */
    let reported = false;
    const seen = new Set();

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:26rem">
        <p id="jv-bubble" aria-live="polite"
           style="margin:0 0 .4rem;padding:.6rem .8rem;border-left:4px solid var(--sun);border-radius:.6rem;background:var(--paper-2);font-size:1rem;font-weight:800;line-height:1.35;min-height:3.6rem;overflow-wrap:anywhere"></p>

        <svg id="jv-scene" viewBox="0 0 320 210" width="100%" role="img" style="display:block"
             aria-label="Scena"></svg>

        <div id="jv-pick" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.6rem;margin-top:.5rem"></div>

        <p id="jv-note" hidden
           style="margin:.6rem 0 0;padding:.6rem .8rem;border-left:4px solid var(--sun);background:var(--paper-2);border-radius:.5rem;font-size:1rem"></p>
      </div>`;

    const svg = stage.querySelector("#jv-scene");
    const bubble = stage.querySelector("#jv-bubble");
    const pick = stage.querySelector("#jv-pick");
    const noteEl = stage.querySelector("#jv-note");

    const options = states.concat([{ key: "silent", name: silentName, face: "neutral" }]);
    pick.innerHTML = options.map((o, i) => `
      <button type="button" class="btn secondary" data-key="${o.key}" id="jv-opt-${i}"
        aria-pressed="false"
        style="min-height:3rem;height:auto;padding:.45rem .5rem;font-size:1rem;line-height:1.25;white-space:normal;overflow-wrap:anywhere">${o.name}</button>`).join("");

    controls.innerHTML = `
      <button class="btn" id="jv-say" aria-label="Sakau savo spėjimą.">Sakau</button>
      <button class="btn ghost" id="jv-reset" aria-label="Pradėti iš naujo">Iš naujo</button>`;
    const sayBtn = controls.querySelector("#jv-say");
    const resetBtn = controls.querySelector("#jv-reset");

    function drawScene(mood, body) {
      svg.innerHTML = `
        ${art.block(92, 38, 136, "#cfe3d6", "", "#9dbfae")}
        ${art.plank(20, 202, 280, 13)}
        ${art.kid(160, 198, 2.2, body)}
        ${face(160, 125.4, 17.6, mood)}`;
    }

    function sentenceOf(key) {
      return key === "silent" ? S.silent : S[key];
    }

    function paint({ speak = false } = {}) {
      const chosen = options.find((o) => o.key === selected) || null;
      const mood = chosen ? chosen.face : "neutral";
      const body = chosen && chosen.key !== "silent"
        ? BODY[states.findIndex((s) => s.key === chosen.key) % BODY.length]
        : "#b8b2a6";
      drawScene(mood, body);

      const text = selected ? sentenceOf(selected) : (S.predict || "");
      bubble.textContent = selected ? text : "—";
      svg.setAttribute("aria-label", chosen && chosen.key !== "silent"
        ? `${chosen.name} prieš klasę.`
        : chosen ? "Vaikas prieš klasę tyli." : "Trys vaikai prieš klasę.");

      options.forEach((o, i) => {
        const b = pick.querySelector(`#jv-opt-${i}`);
        b.setAttribute("aria-pressed", String(o.key === selected));
        b.dataset.locked = String(!predicted);
      });

      api.readout(selected ? text : (S.predict || ""));
      if (speak && text) api.speak(text, { rate: 0.9 });

      let note;
      if (!predicted) note = "Pasakyk savo spėjimą. Tada rinkis, kas kalba.";
      else if (!selected) note = "Pasirink vaiką ir paklausyk, ką jis sako.";
      else if (selected === "silent") note = "Niekas nieko nepasakė, todėl tikslaus žodžio neturime.";
      else note = `${chosen.name} pasakė savo jausmą, todėl žinome žodį.`;
      noteEl.hidden = !predicted;
      noteEl.textContent = predicted ? note : "";

      if (predicted && seen.size >= options.length && !reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function choose(key) {
      if (!predicted) {
        api.note("Pirmiausia pasakyk spėjimą. Tada rinkis.");
        return;
      }
      selected = key;
      seen.add(key);
      paint({ speak: true });
    }

    options.forEach((o, i) => {
      pick.querySelector(`#jv-opt-${i}`).addEventListener("click", () => choose(o.key));
    });

    sayBtn.addEventListener("click", () => {
      if (!predicted) {
        predicted = true;
        paint({ speak: true });
        return;
      }
      api.note(seen.size ? "Spėjimas pasakytas. Rinkis kitą vaiką." : "Pasirink vaiką ir paklausyk, ką jis sako.");
    });

    resetBtn.addEventListener("click", () => {
      predicted = false;
      selected = null;
      reported = false;
      seen.clear();
      paint();
    });

    paint();
    return null;
  },
};

export const SIMS = {
  "dovana-ir-noras": dovanIrNoras,
  "jausmo-vardas": jausmoVardas,
};
