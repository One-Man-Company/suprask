import { art } from "./art.js";
/**
 * Pasaulio pažinimo simuliacijos (1 klasė).
 * Principas: gamtos reiškinys tampa modeliu, kurį vaikas gali „pasukti“ ir pamatyti pasekmes.
 */

const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

/* ------------------------------------------------------------------ */
/* 1. Metų laikai — metų ratas                                         */
/* ------------------------------------------------------------------ */
/* Vienas kintamasis — mėnuo. Iš jo išvedama dienos trukmė, saulės
   kelio aukštis ir medžio būsena. Tai modelis, o ne keturi paruošti
   paveikslėliai: tempiant per metus matyti, kad pokytis laipsniškas,
   o ne „persijungia“ tam tikrą dieną. Dienos trukmė — apytikrė
   Vilniaus platumai (≈55° š. pl.), apvalinta iki 5 min. */
const MENUO = [
  { n: "Sausis", acc: "sausį", s: "Žiema", dm: 475, alt: 12, lapai: 0, sniegas: true, pauksciai: false,
    note: "Mažai šviesos. Medis ilsisi, daug paukščių išskrido." },
  { n: "Vasaris", acc: "vasarį", s: "Žiema", dm: 575, alt: 20, lapai: 0, sniegas: true, pauksciai: false,
    note: "Diena jau ilgėja, bet žiema dar laikosi." },
  { n: "Kovas", acc: "kovą", s: "Pavasaris", dm: 705, alt: 30, lapai: 1, sniegas: false, pauksciai: true,
    note: "Paukščiai grįžta, ant medžio sprogsta pumpurai." },
  { n: "Balandis", acc: "balandį", s: "Pavasaris", dm: 845, alt: 43, lapai: 1, sniegas: false, pauksciai: true,
    note: "Diena sparčiai ilgėja, todėl šilčiau ir žolė žaliuoja." },
  { n: "Gegužė", acc: "gegužę", s: "Pavasaris", dm: 970, alt: 53, lapai: 2, sniegas: false, pauksciai: true,
    note: "Beveik ilgiausia diena. Medis jau su lapais." },
  { n: "Birželis", acc: "birželį", s: "Vasara", dm: 1045, alt: 58, lapai: 3, sniegas: false, pauksciai: true,
    note: "Ilgiausia diena: daugiausia šviesos ir šilumos." },
  { n: "Liepa", acc: "liepą", s: "Vasara", dm: 1005, alt: 55, lapai: 3, sniegas: false, pauksciai: true,
    note: "Diena dar ilga, nors jau pamažu trumpėja." },
  { n: "Rugpjūtis", acc: "rugpjūtį", s: "Vasara", dm: 885, alt: 47, lapai: 3, sniegas: false, pauksciai: true,
    note: "Diena trumpėja. Vaisiai noksta, paukščiai ruošiasi." },
  { n: "Rugsėjis", acc: "rugsėjį", s: "Ruduo", dm: 750, alt: 36, lapai: 4, sniegas: false, pauksciai: false,
    note: "Lapai gelsta. Gandrai skrenda į šiltus kraštus." },
  { n: "Spalis", acc: "spalį", s: "Ruduo", dm: 625, alt: 25, lapai: 4, sniegas: false, pauksciai: false,
    note: "Diena trumpėja greitai. Lapai krinta." },
  { n: "Lapkritis", acc: "lapkritį", s: "Ruduo", dm: 500, alt: 15, lapai: 5, sniegas: false, pauksciai: false,
    note: "Šviesos vis mažiau. Medis beveik be lapų." },
  { n: "Gruodis", acc: "gruodį", s: "Žiema", dm: 435, alt: 11, lapai: 0, sniegas: true, pauksciai: false,
    note: "Trumpiausia diena. Sniegas, medis ilsisi." },
];

const metuLaikai = {
  mount({ stage, controls, api }) {
    const M = MENUO;
    let i = 0;                    // 0..11 — vienintelis modelio kintamasis
    let lastSeason = "";
    const seen = new Set();
    let reported = false;

    stage.innerHTML = `
      <div style="width:100%;max-width:26rem;margin:0 auto">
        <svg id="ml-scene" viewBox="0 0 360 300" role="img" aria-label="Metų laikų modelis"></svg>
        <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.25rem .5rem;margin:.7rem 0 .3rem">
          <strong id="ml-hours" style="font-family:var(--font-head);font-size:1.1rem"></strong>
          <span id="ml-dir" style="font-weight:700;font-size:.9rem"></span>
        </div>
        <div id="ml-bar" role="img" style="position:relative;height:18px;border-radius:9px;background:var(--paper-2);border:2px solid var(--line)">
          <div id="ml-fill" style="height:100%;border-radius:7px;background:#f4b942"></div>
          <span style="position:absolute;left:30.2%;top:-5px;width:2px;height:28px;background:var(--ink-faint)"></span>
          <span style="position:absolute;left:72.6%;top:-5px;width:2px;height:28px;background:var(--ink-faint)"></span>
        </div>
        <div style="position:relative;height:1.1rem;margin-top:.15rem;font-size:.72rem;color:var(--ink-soft)">
          <span style="position:absolute;left:30.2%;transform:translateX(-50%)">gruodis</span>
          <span style="position:absolute;left:72.6%;transform:translateX(-50%)">birželis</span>
        </div>
        <p class="sim-note" style="font-size:.8rem;text-align:center">Tai supaprastintas modelis: tikras oras kasdien būna įvairus.</p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.4rem;width:100%;max-width:26rem;margin:0 auto">
        <label for="ml-month" style="display:block;text-align:center;font-weight:800;font-size:.95rem">Mėnuo: <span id="ml-mname">Sausis</span></label>
        <input id="ml-month" type="range" min="1" max="12" step="1" value="1"
               aria-label="Pasirink mėnesį"
               style="width:100%;height:48px;accent-color:var(--ink)" />
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn secondary" id="ml-prev" aria-label="Ankstesnis mėnuo">◀ Ankstesnis</button>
          <button class="btn secondary" id="ml-next" aria-label="Kitas mėnuo">Kitas ▶</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#ml-scene");
    const hoursEl = stage.querySelector("#ml-hours");
    const dirEl = stage.querySelector("#ml-dir");
    const barEl = stage.querySelector("#ml-bar");
    const fillEl = stage.querySelector("#ml-fill");
    const mname = controls.querySelector("#ml-mname");
    const range = controls.querySelector("#ml-month");

    const hm = (min) => `${Math.floor(min / 60)} val. ${String(min % 60).padStart(2, "0")} min.`;

    /* Medis: tas pats medis, penki jo metų etapai. */
    function tree(d) {
      const trunk = `<rect x="50" y="146" width="12" height="60" rx="4" fill="#8a6242"/>`;
      const branch = `<path d="M56 150 L38 130 M56 150 L74 128 M56 148 L56 118"
        stroke="#8a6242" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      const c = (x, y, r, col) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
      if (d.lapai === 0) return trunk + branch;
      if (d.lapai === 1) return trunk + branch
        + c(40, 132, 5, "#8ed081") + c(72, 130, 5, "#8ed081") + c(56, 116, 6, "#8ed081");
      if (d.lapai === 2) return trunk + branch
        + c(56, 138, 18, "#8ed081") + c(38, 146, 12, "#8ed081") + c(74, 146, 12, "#8ed081");
      if (d.lapai === 3) return trunk
        + c(56, 134, 30, "#4f9e4a") + c(34, 148, 20, "#4f9e4a") + c(78, 148, 20, "#4f9e4a");
      if (d.lapai === 4) return trunk
        + c(56, 134, 30, "#d98324") + c(34, 148, 20, "#d98324") + c(78, 148, 20, "#d98324");
      return trunk + branch
        + c(40, 136, 10, "#d98324") + c(72, 138, 10, "#d98324") + c(56, 126, 9, "#d98324");
    }

    const GROUND = {
      "Žiema": "#f1f7fb",
      "Pavasaris": "#a9d98a",
      "Vasara": "#6dbb62",
      "Ruduo": "#c9b05e",
    };

    function render() {
      const d = M[i];
      const half = 40 + ((d.dm - 435) / 610) * 90;   // kuo ilgesnė diena, tuo platesnis lankas
      const top = 205 - (d.alt / 58) * 120;           // kuo aukščiau saulė, tuo aukštesnis lankas
      const cy = 2 * top - 205;
      const snow = d.sniegas
        ? `<g fill="#ffffff"><circle cx="120" cy="209" r="4"/><circle cx="168" cy="215" r="3"/>
             <circle cx="232" cy="210" r="4"/><circle cx="292" cy="216" r="3"/>
             <circle cx="326" cy="208" r="3"/></g>`
        : "";
      const birds = d.pauksciai
        ? `<path d="M118 62 q7 -7 14 0 M148 46 q6 -6 12 0" stroke="#4a4a4a"
             stroke-width="3" fill="none" stroke-linecap="round"/>`
        : "";

      const seasonKey = d.s === "Žiema" ? "ziema"
        : d.s === "Pavasaris" ? "pavasaris"
          : d.s === "Vasara" ? "vasara" : "ruduo";
      const skyRef = seasonKey === "ziema" ? "ml-winter"
        : seasonKey === "ruduo" ? "ml-autumn" : "ml-sky";

      /* Sezoninė paletė: žiemą žalios kalvos prieštaravo užrašui „žiema“.
         Dabar kalvos, žemė ir saulė keičiasi kartu su mėnesiu. */
      const PAL = {
        ziema: { hill: "#dbe8f0", hill2: "#c2d6e2", ground: "#e8f1f6", band: "#dfe9ee", sun: 0.55 },
        pavasaris: { hill: "#bde0a0", hill2: "#a3cf84", ground: "#cdb489", band: "#a9d98a", sun: 0.9 },
        vasara: { hill: "#93cc83", hill2: "#74b366", ground: "#cbb287", band: "#6dbb62", sun: 1 },
        ruduo: { hill: "#e0c98d", hill2: "#cbae68", ground: "#cbb287", band: "#c9b05e", sun: 0.8 },
      }[seasonKey];

      svg.innerHTML = `
        ${art.defs("ml")}
        <rect x="0" y="0" width="360" height="300" rx="16" fill="url(#${skyRef})"/>
        <path d="M${215 - half} 205 Q215 ${cy} ${215 + half} 205" fill="none"
              stroke="#7f9ab2" stroke-width="3" stroke-dasharray="5 7" opacity=".9"/>
        ${art.sun(215, top, 13, "ml", PAL.sun)}
        ${birds}
        ${art.hills(360, 196, PAL.hill, PAL.hill2)}
        <rect x="0" y="205" width="360" height="95" fill="${PAL.ground}"/>
        <rect x="0" y="205" width="360" height="16" fill="${PAL.band}"/>
        ${art.grass(16, 209, 1, seasonKey === "ziema" ? "#bcd4de" : "#5aa552")}
        ${art.grass(296, 208, 0.95, seasonKey === "ziema" ? "#bcd4de" : "#5aa552")}
        ${art.grass(330, 210, 0.8, seasonKey === "ziema" ? "#bcd4de" : "#5aa552")}
        ${snow}
        ${art.tree(58, 209, 1.4, seasonKey)}
        <text x="20" y="40" font-family="system-ui" font-size="22" font-weight="800" fill="#3a342b">${d.n}</text>
        <text x="20" y="62" font-family="system-ui" font-size="15" font-weight="600" fill="#5f574d">${d.s}</text>`;

      svg.setAttribute("aria-label",
        `Metų laikų modelis: ${d.n}, ${d.s.toLowerCase()}, šviesu ${hm(d.dm)}`);

      mname.textContent = d.n;
      range.value = String(i + 1);
      range.setAttribute("aria-valuetext", `${d.n}, šviesu ${hm(d.dm)}`);

      hoursEl.textContent = `Šviesu ${hm(d.dm)}`;
      const prev = M[(i + 11) % 12];
      const diff = d.dm - prev.dm;
      dirEl.textContent = diff > 0 ? `↗ ilgesnė nei ${prev.acc}`
        : diff < 0 ? `↘ trumpesnė nei ${prev.acc}`
        : `→ tokia pati kaip ${prev.acc}`;
      fillEl.style.width = `${(d.dm / 1440) * 100}%`;
      barEl.setAttribute("aria-label",
        `Dienos ilgis ${hm(d.dm)} iš 24 valandų; trumpiausia diena gruodį, ilgiausia birželį`);

      api.readout(`${d.n} — ${d.s.toLowerCase()}. Šviesu ${hm(d.dm)}`);
      api.note(d.note);
      if (d.s !== lastSeason) {
        lastSeason = d.s;
        api.speak(d.s, { rate: .9 });
      }

      /* Rezultatas — kai vaikas palygino abu galus, o ne kai „surinko“ mėnesius. */
      seen.add(i + 1);
      if (!reported && seen.has(6) && seen.has(12)) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    const step = (n) => { i = (i + n + 12) % 12; render(); };
    controls.querySelector("#ml-prev").addEventListener("click", () => step(-1));
    controls.querySelector("#ml-next").addEventListener("click", () => step(1));
    range.addEventListener("input", () => { i = Number(range.value) - 1; render(); });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 2. Augalo gyvenimas                                                 */
/* ------------------------------------------------------------------ */
/* Modelis: trys sąlygos (vanduo, šviesa, šiluma) ir laikas.
   Augimas per dieną lygus SILPNIAUSIOS sąlygos daliai × 0,22 — todėl
   vienos trūkumas sustabdo viską, o vandens perteklius kenkia taip pat,
   kaip jo trūkumas (šaknys „dūsta“): vandens optimalu yra 3 iš 5.
   Dydis kaupiasi tik per dienas: pabloginus sąlygas augalas nesumenksta,
   bet nustoja augti ir pradeda vysti. Tai ir yra modelio riba, kurią
   pasakome žodžiu po simuliacija.

   Kodėl 4 ir 5 duoda 0,15 ir 0, o ne 0,5 ir 0,15: su 0,5 perlaistytas
   augalas per 12 dienų pasiekdavo LYGIAI tokį patį aukštį kaip laistytas
   teisingai (174 px) — vaikui vienintelis matomas dydis sakė „nieko
   blogo“, nors etiketė — „vysta“. P-009 žada, kad dešimt perlaistymo
   dienų duoda mažą augalą, todėl virš optimalaus kiekvienas papildomas
   žingsnis augimą mažina, o 5/5 jį sustabdo visai.

   Antra fazė (pasiūlymas #186). Anksčiau augalas užaugdavo iki žiedo, o
   toliau „Diena →“ keitė tik dienos skaitliuką iki 12 dienos: dydis jau
   buvo pasiekęs lubas, todėl pačiame piešinyje nejudėjo niekas. Vaikas,
   įpratęs, kad kiekvienas jo veiksmas turi pasekmę, tokį mygtuką
   perskaitė kaip sugedusį (LL-04, interaktyvumo principas 1). Dabar po
   žiedo seka vaisiaus branda: kiekviena diena vaisių padidina ir
   nuspalvina, o esant geroms sąlygoms branda baigiasi lygiai paskutinę
   modelio dieną (`agRipeStep`). Blogos sąlygos brandą sustabdo ir
   augalą kasdien silpnina, todėl ir blogu keliu kiekviena diena ką nors
   pakeičia.

   Nė vienas valdiklis nelieka tylus: pasibaigus modeliui (12 diena arba
   augalas, kelias dienas neturėjęs sąlygų, nuvysta) „Diena →“ užrakinamas,
   bet priežastis parašoma matomame tekste (`#ag-end`), o ne paliekama
   vaikui spėlioti. Sėkla yra vienintelė sąmoninga išimtis: kol nėra
   vandens ir šilumos, ji nepabunda — tai pasakoma žodžiu, o ne
   imituojama animacija. */
const AG_WATER = [0, 0.4, 0.85, 1, 0.15, 0];     // vanduo 0–5 → augimo dalis
const AG_LIGHT = [0, 0.3, 0.7, 1, 1, 1];          // šviesa 0–5 → augimo dalis
const AG_DAYS_MAX = 12;
const AG_STEP = 0.22;                             // gera diena ≈ 22 % dydžio
const AG_WEAK_MAX = 3;                            // tiek dienų be augimo iki nuvytimo

const agFactors = (water, light, warm) => {
  const wf = AG_WATER[water];
  const lf = AG_LIGHT[light];
  const hf = warm ? 1 : 0.1;
  return { wf, lf, hf, gf: Math.min(wf, lf, hf) };
};
const agWaterWord = (w) => ["nėra", "mažai", "beveik gerai", "gerai", "per daug", "per daug"][w];
const agLightWord = (l) => (l === 0 ? "nėra" : l <= 2 ? "mažai" : "gerai");

/* Vaisiaus branda vyksta kas dieną, o baigiasi lygiai paskutinę modelio
   dieną: todėl žalias vaisius negali „sustoti“ likus kelioms dienoms.
   Vardiklis niekada nėra 0 — jei žiedas pasirodo paskutinę dieną, brandai
   dienų nebelieka, ir tai pasakoma tekste, o ne tylima. */
const agRipeStep = (bloomDay) => 1 / Math.max(1, AG_DAYS_MAX - bloomDay);

/* Spalvų maišymas: vystantis augalui lapai ir stiebas tolygiai gelsta,
   todėl kiekviena diena be augimo matoma, o ne tik žodis pastaboje. */
const agHexMix = (a, b, t) => {
  const k = Math.max(0, Math.min(1, t));
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("");
};

const agStage = ({ size, wilt, cold, pale, bloomDay, ripe, dead }) => {
  if (size <= 0) return "Sėkla";
  if (dead) return "Augalas nuvytęs";
  if (wilt) return "Augalas vysta";
  if (cold) return "Augalas neauga";
  if (pale) return "Augalas blyškus";
  if (ripe > 0) return ripe < 0.75 ? "Vaisius" : "Prinokęs vaisius";
  if (bloomDay > 0) return "Žiedas";
  return size < 0.25 ? "Daigas" : size < 0.55 ? "Jaunas augalas" : "Augalas su lapais";
};
const agDaysText = (n) => `${n} ${n === 1 ? "diena" : n < 10 ? "dienos" : "dienų"}`;


/* Sėkla pabunda tik su vandeniu ir šiluma — tai pasakoma žodžiu, o ne
   animuojama. Todėl nuimta sena `agLeaf` kopija: lapus piešia art.leaf
   (LL-13), o nenaudojama funkcija tik klaidino. */

const augaloGyvenimas = {
  mount({ stage, controls, api }) {
    let water = 3;
    let light = 3;
    let warm = true;
    let day = 1;
    let size = 0;          // 0 — sėkla, 1 — suaugęs augalas
    let bloomDay = 0;      // diena, kai pasirodė žiedas; 0 — dar nebuvo
    let ripe = 0;          // vaisiaus branda 0..1 (po žydėjimo)
    let weak = 0;          // dienos be augimo iš eilės (0..AG_WEAK_MAX)
    let dayMsg = "";
    let lastStage = "";
    let reported = false;  // api.progress iškviestas vieną kartą (LL-17)

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem">
        <svg id="ag-scene" viewBox="0 0 360 300" role="img" aria-label="Augalo augimo modelis"></svg>
        <p class="sim-note" style="font-size:.8rem">Tai supaprastintas modelis: dirvožemis čia yra visą laiką, o šaknų nematome.</p>
      </div>`;

    /* Sąlygos eilutė. Etiketė, taškai ir du mygtukai yra viena `flex`
       eilutė, kuriai leidžiama lūžti. Taškai ir mygtukai sudėti į vieną
       grupę, kad lūžimas būtų prasmingas: kai vietos nebelieka, grupė
       persikelia į antrą eilutę, o etiketė lieka savo eilutėje. Etiketė
       turi `flex:0 1 5.4rem` be fiksuoto `width` (pasiūlymas #4739):
       fiksuotas `width:5.4rem` prie 200 % teksto (32 px šaknis) davė
       173 px etiketę, o trys tokios eilutės viršijo 241 px valdiklių
       juostą ir puslapis slinko 133 px į šoną. Vien `min-width:0` be
       grupės nepakako: etiketė susitraukdavo iki 63 px ir žodis
       „Vanduo“ lūždavo viduryje. 16 px šaknyje etiketė vis dar 86 px,
       tad įprastas išdėstymas nepasikeitęs. */
    const condRow = (id, label, icon) => `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;min-height:56px;border-bottom:2px solid var(--line)">
        <span style="flex:0 1 5.4rem;max-width:100%;font-size:.9rem;font-weight:800"><span aria-hidden="true">${icon}</span> ${label}</span>
        <div style="display:flex;flex:1 1 auto;min-width:0;align-items:center;gap:.4rem">
          <div id="ag-${id}-dots" aria-hidden="true" style="display:flex;flex:1 1 auto;min-width:0;gap:3px"></div>
          <button class="btn secondary" id="ag-${id}-minus" aria-label="Mažiau: ${label.toLowerCase()}" style="flex:0 0 auto;min-width:48px;min-height:48px;padding:0;font-size:1.35rem;line-height:1">−</button>
          <button class="btn secondary" id="ag-${id}-plus" aria-label="Daugiau: ${label.toLowerCase()}" style="flex:0 0 auto;min-width:48px;min-height:48px;padding:0;font-size:1.35rem;line-height:1">+</button>
        </div>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:.5rem;width:100%;max-width:34rem;margin:0 auto">
        <div style="min-width:0;border:2px solid var(--line);border-radius:var(--r-m);background:var(--paper-2);padding:.35rem .5rem">
          ${condRow("w", "Vanduo", "💧")}
          ${condRow("l", "Šviesa", "☀️")}
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;min-height:56px">
            <span style="flex:0 1 5.4rem;max-width:100%;font-size:.9rem;font-weight:800"><span aria-hidden="true">🌡️</span> Šiluma</span>
            <div style="display:flex;flex:1 1 auto;min-width:0;align-items:center;gap:.4rem">
              <button class="btn secondary" id="ag-cold" aria-pressed="false" style="flex:1 1 0;min-width:48px;min-height:48px;padding:.3rem .2rem;font-size:.95rem">Šalta</button>
              <button class="btn secondary" id="ag-warm" aria-pressed="true" style="flex:1 1 0;min-width:48px;min-height:48px;padding:.3rem .2rem;font-size:.95rem">Šilta</button>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:.4rem;align-items:center;justify-content:center;flex-wrap:wrap">
          <span id="ag-day" style="font-weight:800;font-size:.95rem">1 diena</span>
          <button class="btn" id="ag-next" aria-label="Kita diena" style="flex:1 1 auto;min-height:48px;padding:.5rem .8rem;font-size:.95rem">Diena →</button>
          <button class="btn ghost" id="ag-reset" aria-label="Pradėti iš naujo" style="flex:0 0 auto;min-width:48px;min-height:48px;padding:.5rem .7rem;font-size:.95rem">Iš naujo</button>
        </div>
        <p id="ag-end" role="status" aria-live="polite"
           style="min-width:0;margin:0;font-size:.9rem;line-height:1.35;font-weight:700;text-align:center"></p>
      </div>`;

    const svg = stage.querySelector("#ag-scene");
    const q = (sel) => controls.querySelector(sel);

    function dots(el, value, max) {
      el.innerHTML = "";
      for (let k = 1; k <= max; k += 1) {
        const s = document.createElement("span");
        s.style.cssText = "flex:1 1 0;min-width:0;height:12px;border-radius:3px;"
          + (k <= value ? "background:var(--ink)" : "border:2px solid var(--ink-faint)");
        el.appendChild(s);
      }
    }

    function render() {
      const { gf } = agFactors(water, light, warm);
      const wilt = water === 0 || water >= 4;
      const pale = light <= 1;
      const cold = !warm;

      /* Žiedas pasirodo pirmą kartą, kai augalas užaugęs ir sąlygos geros,
         ir nuo tos dienos niekur nedingsta (LL-15: būsena, kurią modelis
         pameta). Anksčiau žiedas buvo piešiamas TIK kol sąlygos geros,
         todėl pablogėjus orui jis „išnykdavo“ — ir vėl atsirasdavo. */
      const dead = size > 0 && weak >= AG_WEAK_MAX;
      if (!dead && !bloomDay && size >= 0.9 && !wilt && !cold && !pale) bloomDay = day;

      const ended = day >= AG_DAYS_MAX;
      const ripeDone = ripe >= 0.999;   // 1/6 × 6 nesudeda tiksliai į 1
      const showFlower = bloomDay > 0 && ripe === 0;
      const showFruit = bloomDay > 0 && ripe > 0;
      const fruitS = 1.1 + 0.4 * ripe;

      const h = size <= 0 ? 0 : 22 + size * 152;
      const leafS = 12 + size * 22;
      /* Svyravimas įjungiamas iš karto, kai sąlyga bloga (wilt), o ilgiau
         trūkstant augimo — palaipsniui: kiekviena diena be augimo lapus
         labiau gelsta, todėl ir blogu keliu `Diena →` ką nors pakeičia. */
      const dry = Math.min(1, weak / AG_WEAK_MAX);
      const droop = wilt || weak >= 1 ? 1 : 0;
      const stemCol = agHexMix(cold ? "#6f93a8" : pale ? "#8fae78" : "#4c8b3a", "#8d7a55", dry * 0.7);
      const leafCol = agHexMix(water === 0 || dead ? "#b9a06c"
        : water >= 4 ? "#bdb75c"
          : cold ? "#7fa2b5" : pale ? "#a8c98a" : "#5fbf62", "#a98f55", dry * 0.6);

      const sunR = 13 + light * 1.6;
      const topX = 180 + (droop ? 13 : 0);

      /* Vandens perteklius — bala; sausra — įtrūkusi žemė. Abu rodo pasekmę,
         ne tik skaičių valdiklyje. */
      const soilDecor = water >= 4
        ? `<ellipse cx="180" cy="252" rx="${44 + size * 10}" ry="9" fill="#4d9fd1" opacity=".32"/>`
        : water === 0
          ? `<g stroke="#5d3720" stroke-opacity=".45" stroke-width="2.2" fill="none" stroke-linecap="round">
               <path d="M116 270 l11 8 l-7 9"/><path d="M252 268 l-10 9 l8 8"/></g>`
          : "";

      svg.innerHTML = `
        ${art.defs("ag")}
        <rect x="0" y="0" width="360" height="300" rx="18" fill="url(#ag-sky)"/>
        ${art.sun(312, 44, sunR, "ag", light / 5)}
        ${light >= 2 ? art.cloud(64, 54, 1) + art.cloud(150, 32, 0.72, 0.85) : ""}
        ${art.hills(360, 232)}
        ${art.soil(0, 248, 360, 52, "ag")}
        ${soilDecor}
        ${water >= 4 ? art.drops(74, 74, 6) : ""}
        ${size <= 0 ? `<ellipse cx="180" cy="252" rx="24" ry="12" fill="#5f3d27" opacity=".45"/>`
          + art.seed(180, 251, 1.2) : ""}
        ${h > 0 ? art.stem(180, 248, h, 3 + size * 5, stemCol, droop) : ""}
        ${h > 0 && size > 0.05
          ? art.leaf(178, 248 - h * 0.5, leafS, -1, droop, leafCol)
            + art.leaf(182, 248 - h * 0.34, leafS, 1, droop, leafCol) : ""}
        ${showFlower ? art.flower(topX, 248 - h, 1) : ""}
        ${showFruit ? art.fruit(topX, 248 - h, fruitS, ripe) : ""}
        ${art.grass(26, 250, 1.1, cold ? "#a9c6cf" : "#5aa552")}
        ${art.grass(118, 251, 0.9, cold ? "#a9c6cf" : "#5aa552")}
        ${art.grass(304, 250, 1, cold ? "#a9c6cf" : "#5aa552")}
        ${cold ? art.snow(0, 246, 12) : ""}
      `;

      const st = agStage({ size, wilt, cold, pale, bloomDay, ripe, dead });

      svg.setAttribute("aria-label",
        `Augalo modelis: ${st.toLowerCase()}, vanduo ${agWaterWord(water)}, `
        + `šviesa ${agLightWord(light)}, ${warm ? "šilta" : "šalta"}`);

      dots(q("#ag-w-dots"), water, 5);
      dots(q("#ag-l-dots"), light, 5);

      /* Pasirinkimas rodomas ir spalva, ir aria-pressed — spalva ne vienintelė. */
      q("#ag-cold").setAttribute("aria-pressed", String(!warm));
      q("#ag-warm").setAttribute("aria-pressed", String(warm));
      for (const [btn, on] of [[q("#ag-cold"), !warm], [q("#ag-warm"), warm]]) {
        btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
        btn.style.color = on ? "var(--paper)" : "var(--ink)";
        btn.style.borderColor = on ? "var(--ink)" : "var(--line)";
      }
      q("#ag-day").textContent = agDaysText(day);

      /* Užrakintas mygtukas be paaiškinimo yra defektas (LL-04): todėl
         priežastis rašoma matomame tekste, o ne tik `disabled`. Be to,
         išjungus mygtuką, ant kurio stovėjo fokusas, naršyklė jį numeta į
         `body` — klaviatūros naudotojas nebeturi kur eiti. Todėl tokiu
         atveju fokusas perkeliamas į „Iš naujo“ (vienintelį likusį veiksmą),
         o pabaigos tekstas paskelbiamas per `aria-live`. */
      const nextBtn = q("#ag-next");
      const hadFocus = document.activeElement === nextBtn;
      nextBtn.disabled = ended || dead;
      nextBtn.setAttribute("aria-label", dead
        ? "Diena nebegalima: augalas nuvytęs. Paspausk „Iš naujo“."
        : ended ? "Diena nebegalima: modelis baigėsi 12 dieną. Paspausk „Iš naujo“."
          : "Kita diena");
      q("#ag-end").textContent = dead
        ? "Augalas nuvytęs: jam per ilgai trūko sąlygų. Paspausk „Iš naujo“ ir pabandyk kitaip."
        : ended
          ? (ripeDone
            ? "Modelis baigiasi 12 dieną. Vaisius prinoko — jame yra sėklų."
            : size <= 0
              ? "Modelis baigiasi 12 dieną. Sėkla taip ir nepabudo, nes trūko sąlygų."
              : "Modelis baigiasi 12 dieną. Vaisius dar neprinoko, nes augalui kažko trūko.")
          : "";

      /* Fokusas perkeliamas TIK jei jis jau buvo ant „Diena →“: kitaip
         išsijungimas atimtų vienintelį tolesnį veiksmą. */
      if (hadFocus && nextBtn.disabled) q("#ag-reset").focus();

      api.readout(`${st} · vanduo ${agWaterWord(water)} · šviesa ${agLightWord(light)}`
        + ` · ${warm ? "šilta" : "šalta"} · ${agDaysText(day)}`);

      /* Kliūtis — ta sąlyga, kurios dalis mažiausia (silpniausia grandis).
         Sąlygos lyginamos tiesiogiai, o ne per `Math.min` reikšmę: tvarka
         fiksuota (šiluma → šviesa → vanduo), todėl `low === ...` neatspėja,
         o pasako pirmą silpniausią grandį. Pataisius ją, žinutė pasikeičia. */
      const why = () => {
        const wf = AG_WATER[water];
        const lf = AG_LIGHT[light];
        const hf = warm ? 1 : 0.1;
        if (hf < Math.min(wf, lf)) return "šalta, augalas beveik neauga";
        if (lf < wf) {
          return light === 0 ? "nėra šviesos, augalas blyškus" : "mažai šviesos, auga lėtai";
        }
        // Sausros žodis priklauso nuo to, ką vaikas mato: sėklai lapai nenusvyra.
        if (water === 0) {
          return size <= 0.05 ? "nėra vandens, sėkla nepabunda" : "nėra vandens, lapai nusvyra";
        }
        if (water >= 4) {
          return size <= 0.05 ? "per daug vandens, sėkla nepabunda" : "per daug vandens, šaknys nekvėpuoja";
        }
        return "mažai vandens, auga lėtai";
      };

      const cause = gf >= 0.8 ? "" : why();
      let note;
      if (dead) note = "Šios sąlygos augalui netiko — jis nuvytęs.";
      else if (cause) note = `Ko trūksta: ${cause}.`;
      else if (ripeDone) note = "Vaisius prinoko. Jame yra sėklų — iš jų galėtų išaugti naujas augalas.";
      else if (showFruit) note = "Žiedas virto vaisiumi. Spausk „Diena →“ ir stebėk, kaip jis keičiasi.";
      else if (size >= 1) note = "Augalas išaugo ir pražydo. Dabar pakeisk vieną sąlygą — kas nutiks?";
      else note = "Sąlygos geros. Spausk „Diena →“ — augalas paūgės.";
      api.note(dayMsg ? `${dayMsg} ${note}` : note);

      if (st !== lastStage) {
        lastStage = st;
        api.speak(st, { rate: 0.9 });
      }

      /* Rezultatas — pražydęs augalas, o ne kiekvienas paspaudimas.
         Vėlesnė vaisiaus branda jo neatšaukia ir nebeskaito iš naujo. */
      if (!reported && bloomDay > 0) {
        reported = true;
        api.progress({ correct: true });
      }
      return gf;
    }

    const dayStep = () => {
      if (day >= AG_DAYS_MAX) return;
      if (size > 0 && weak >= AG_WEAK_MAX) return;
      const { gf } = agFactors(water, light, warm);
      day += 1;
      if (gf > 0) {
        size = Math.min(1, size + gf * AG_STEP);
        weak = Math.max(0, weak - 1);       // geros dienos atgaivina palaipsniui
        if (bloomDay > 0 && ripe < 1) {
          ripe = Math.min(1, ripe + agRipeStep(bloomDay));
        }
        dayMsg = gf < 0.5 ? "Šią dieną augalas beveik nepajudėjo." : "";
      } else if (size > 0) {
        weak = Math.min(AG_WEAK_MAX, weak + 1);
        dayMsg = weak >= AG_WEAK_MAX
          ? "Augalas nuvyto — jam per ilgai trūko sąlygų."
          : "Šią dieną augalas nepajudėjo. Jam vis sunkiau.";
      } else {
        dayMsg = "Šią dieną sėkla liko tokia pati.";
      }
      render();
    };
    const setCond = (fn) => { fn(); dayMsg = ""; render(); };

    q("#ag-w-plus").addEventListener("click", () => setCond(() => { water = Math.min(5, water + 1); }));
    q("#ag-w-minus").addEventListener("click", () => setCond(() => { water = Math.max(0, water - 1); }));
    q("#ag-l-plus").addEventListener("click", () => setCond(() => { light = Math.min(5, light + 1); }));
    q("#ag-l-minus").addEventListener("click", () => setCond(() => { light = Math.max(0, light - 1); }));
    q("#ag-cold").addEventListener("click", () => setCond(() => { warm = false; }));
    q("#ag-warm").addEventListener("click", () => setCond(() => { warm = true; }));
    q("#ag-next").addEventListener("click", dayStep);
    q("#ag-reset").addEventListener("click", () => {
      water = 3; light = 3; warm = true; day = 1; size = 0;
      bloomDay = 0; ripe = 0; weak = 0; dayMsg = ""; lastStage = "";
      render();
    });


    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 3. Gyvūnų grupės                                                    */
/* ------------------------------------------------------------------ */
/* Grupė nustatoma pagal tuos pačius tris požymius (danga, kvėpavimas,
   jauniklių auginimas). Gyvūnų tvarka fiksuota ir sąmoningai permaišyta
   taip, kad gretimi gyvūnai priklausytų skirtingoms grupėms. Anksčiau
   sąrašas buvo maišomas `sort(() => Math.random() - 0.5)`: tas pats
   veiksmas duodavo skirtingą rezultatą (mokytojas negalėjo pakartoti),
   maišymas nebuvo tolygus, o kartais visi vienos grupės gyvūnai
   atsidurdavo greta — tada užduotis virsdavo „kopijuok kaimyną“.

   Kodėl `cover` ir `coverAcc`: pasiūlymas #42. Dėžėje buvo tik žodis
   „Žinduoliai“ ir 12 px paaiškinimas — vaikas, dar nesklandžiai skaitantis,
   turėjo perskaityti tris tokius užrašus per bandymą, o gairių T5.5 reikalauja,
   kad tekstas nebūtų vienintelis informacijos nešėjas. Dabar dėžėje yra
   dangos piktograma (plaukai / plunksnos / žvynai) ir dangos žodis didesniu
   šriftu; `coverAcc` vartomas grįžtamajame ryšyje („Karvė turi plaukus“),
   nes „turi“ tinka visoms giminėms, o „dengtas/dengta“ — ne. */
const GYVUNU_GRUPES = [
  { id: "zinduoliai", label: "Žinduoliai", cover: "plaukai", coverAcc: "plaukus", icon: "plaukai",
    say: "Turi plaukus. Maitina jauniklius pienu." },
  { id: "pauksciai", label: "Paukščiai", cover: "plunksnos", coverAcc: "plunksnas", icon: "plunksnos",
    say: "Turi plunksnas. Deda kiaušinius." },
  { id: "zuvis", label: "Žuvys", cover: "žvynai", coverAcc: "žvynus", icon: "zvynai",
    say: "Turi žvynus. Kvėpuoja žiaunomis." },
];

/* `pozymis` — antrasis požymis (kvėpavimas arba jaunikliai), o ne danga:
   dangą simuliacija įvardija iš grupės, todėl „Varnas turi plunksnas ir
   turi plunksnas“ nebegalimas. */
const GYVUNAI = [
  { emoji: "🐄", name: "Karvė", g: "zinduoliai", pozymis: "maitina veršiuką pienu" },
  { emoji: "🐦", name: "Varnas", g: "pauksciai", pozymis: "deda kiaušinius" },
  { emoji: "🐟", name: "Ešerys", g: "zuvis", pozymis: "kvėpuoja žiaunomis" },
  { emoji: "🦊", name: "Lapė", g: "zinduoliai", pozymis: "maitina jauniklius pienu" },
  { emoji: "🦆", name: "Antis", g: "pauksciai", pozymis: "deda kiaušinius" },
  { emoji: "🐠", name: "Karosas", g: "zuvis", pozymis: "kvėpuoja žiaunomis" },
  { emoji: "🐇", name: "Kiškis", g: "zinduoliai", pozymis: "maitina jauniklius pienu" },
  { emoji: "🦉", name: "Pelėda", g: "pauksciai", pozymis: "deda kiaušinius" },
  { emoji: "🦈", name: "Ryklys", g: "zuvis", pozymis: "kvėpuoja žiaunomis" },
];


/* Klaidinantis gyvūnas (pasiūlymas #727). Devyni akivaizdūs gyvūnai modelį
   tik patvirtina, bet negriauna nė vienos modulio įvardytos klaidingos
   nuostatos (10-gyvunu-grupes.json:79–83). Delfinas gyvena vandenyje ir
   plaukia kaip žuvis — todėl jį norisi dėti į žuvų dėžę. Jis parodomas TIK
   tada, kai devyni gyvūnai jau sudėti: tada tai perkėlimas (T2.2), o ne dar
   vienas pavyzdys. Jis neįskaitomas į api.progress — praplėtimas neturi
   tapti sąlyga užbaigti (T1.3).

   Užuominos skirtingos pagal dėžę, į kurią vaikas įdėjo: jos kartoja
   vaiko pastebėjimą („plaukia kaip žuvis“, „gyvena vandenyje“) ir klausia
   apie požymį. Teisingas atsakymas neįvardijamas (LL-22, T3.1). */
const KLAIDINANTIS_GYVUNAS = {
  emoji: "🐬", name: "Delfinas", g: "zinduoliai", pozymis: "maitina jauniklius pienu",
  extra: true,
  reveal: "Visi devyni gyvūnai savo grupėse! Dar vienas: delfinas. Kur jis?",
  /* „beveik be plaukų“ — sąmoningai: dėžėje dabar yra plaukų piktograma, o
     delfinas yra vienintelis gyvūnas, kuriam ji netinka. Jei apie tai
     nutylėtume, vaikas liktų su nauja klaidinga nuostata „visi žinduoliai
     plaukuoti“ (LL-28: modelyje turi būti prieštaraujantis pavyzdys). */
  right: "Delfinas turi lygią odą, beveik be plaukų. Bet jis maitina jauniklius pienu. Todėl jis žinduolis.",
  note: "Delfinas neturi žiaunų. Jis kvėpuoja plaučiais. Todėl jis žinduolis, o ne žuvis.",
  hintZuvis: "Delfinas plaukia kaip žuvis, bet žiaunų neturi. Kuo jis kvėpuoja?",
  hintPauksciai: "Delfinas neturi plunksnų. Bet jis gyvena vandenyje. Kuo jis kvėpuoja?",
  step: "Prisimink: delfino jauniklis geria pieną. Ką tai pasako apie grupę?",
};

const gyvunuGrupes = {
  mount({ stage, controls, api }) {
    const groups = GYVUNU_GRUPES;
    // Papildomas gyvūnas gyvena tame pačiame sąraše (kad priskyrimo logika
    // būtų ta pati), bet `visible` jį paslepia iki devynių priskyrimų —
    // kitaip jis taptų dešimtuoju „eiliniu“ gyvūnu ir prarastų perkėlimo
    // prasmę.
    const animals = [
      ...GYVUNAI.map((a) => ({ ...a, done: false, visible: true })),
      { ...KLAIDINANTIS_GYVUNAS, done: false, visible: false, tries: 0 },
    ];

    let selected = null;
    let challenge = false;   // ar papildomas gyvūnas jau parodytas
    let reported = false;    // ar api.progress jau iškviestas (LL-17)
    const placed = { zinduoliai: 0, pauksciai: 0, zuvis: 0 };
    const timers = new Set();
    const left = () => animals.filter((a) => !a.done && a.visible).length;

    stage.innerHTML = `
      <div style="width:100%;max-width:46rem">
        <div id="gg-tray" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;padding:.6rem;border-radius:var(--r-m);background:color-mix(in srgb, var(--mint) 10%, var(--paper))"></div>
        <div id="gg-bins" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,5.5rem),1fr));gap:.5rem;margin-top:1rem"></div>
        <p class="sim-note" id="gg-msg" tabindex="-1"></p>
      </div>`;
    controls.innerHTML = `<button class="btn ghost" id="gg-reset">Iš naujo</button>`;
    // Pastaba yra už scenos ribų, todėl „Iš naujo“ jos neišvalo — be šios
    // eilutės po perkrovimo liktų sakinys apie delfiną, nors lentelėje vėl
    // devyni gyvūnai (LL-16: būsena, kuri grįžta atgal per perkrovimą).
    api.note("");
    const trayEl = stage.querySelector("#gg-tray");
    const binsEl = stage.querySelector("#gg-bins");
    const msg = stage.querySelector("#gg-msg");

    function drawTray() {
      trayEl.innerHTML = "";
      animals.forEach((a) => {
        if (a.done || !a.visible) return;
        const on = selected === a.name;
        // Papildomas gyvūnas pažymėtas brūkšniu ir žodžiu — ne vien spalva
        // (T5.5): vaikas turi matyti, kad tai ne dešimtas eilinis gyvūnas.
        const border = on ? "3px solid var(--ink)"
          : (a.extra ? "3px dashed var(--ink-faint)" : "3px solid transparent");
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", a.extra
          ? `${a.name}. Papildomas gyvūnas. Pasirink.`
          : `${a.name}. Pasirink.`);
        b.setAttribute("aria-pressed", String(on));
        // Vardas matomas, ne tik `.sr-only` (pasiūlymas #42): 6–7 m. vaikas
        // emoji atpažįsta, bet jam reikia ir žodžio, kad pats galėtų jį
        // pasakyti bei surasti tą patį gyvūną kitame puslapyje.
        b.style.cssText = `display:grid;place-items:center;gap:1px;border:${border};`
          + "background:transparent;border-radius:14px;padding:4px 6px;cursor:pointer;"
          + "font:inherit;color:inherit;min-width:72px;min-height:72px";
        b.innerHTML = `<span aria-hidden="true" style="font-size:1.9rem;line-height:1.05">${a.emoji}</span>`
          + (a.extra ? `<span aria-hidden="true" style="font-size:.7rem;line-height:1.1;font-weight:700;color:var(--ink-soft)">papildomas</span>` : "")
          + `<span aria-hidden="true" style="font-size:.9rem;line-height:1.1;font-weight:700;text-align:center">${a.name}</span>`;
        b.addEventListener("click", () => {
          selected = a.name;
          drawTray();
          api.readout(`Pasirinkai: ${a.name}. Į kurią grupę dėti?`);
          api.speak(a.name, { rate: .9 });
          // Klaviatūra nesustoja ties perkurtu sąrašu: sekantis žingsnis — grupė.
          binsEl.querySelector("button[data-g]").focus();
        });
        trayEl.appendChild(b);
      });
    }

    // Ekrane gyvūnai rodomi paveikslėliais, todėl kiekvienos grupės mygtuko
    // pavadinimas keičiamas tekstu: grupė, kiek įdėta ir pagal ką atpažinti.
    function paintBins() {
      binsEl.querySelectorAll("button[data-g]").forEach((bin) => {
        const g = groups.find((x) => x.id === bin.dataset.g);
        bin.setAttribute("aria-label",
          `${g.label}. Įdėta ${placed[g.id]}. ${g.say}`);
      });
    }

    groups.forEach((g) => {
      const bin = document.createElement("button");
      bin.type = "button";
      bin.dataset.g = g.id;
      bin.style.cssText = "display:grid;justify-items:center;gap:.15rem;min-width:0;" +
        "padding:.5rem .15rem;border:3px dashed var(--line);border-radius:var(--r-m);" +
        "background:var(--paper-2);cursor:pointer;font:inherit;color:inherit;min-height:9rem";
      // Piktograma + dangos žodis (pasiūlymas #42). Anksčiau vienintelis
      // informacijos nešėjas buvo 12 px `.72rem` paaiškinimas, kurį vaikas
      // turėjo perskaityti tris kartus per bandymą (T5.5, interaktyvumo
      // principas 6). Dabar požymis matomas kaip paveikslėlis ir kaip žodis,
      // o tekstas liko tik `aria-label` (ekrano skaitytuvui).
      // 0,9 rem — didžiausias dydis, kuris @360 px telpa į 3 stulpelių dėžę
      // (išmatuota: „Žinduoliai“ 80,5 px, turima 81,6 px). Mažesnis už 12 px
      // nebegrįžtama: tai buvo pasiūlymo priežastis.
      bin.innerHTML =
        `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" `
        + `style="width:38px;height:38px;display:block">${art.cover(g.icon, 20, 20, 1)}</svg>`
        + `<strong style="font-size:.9rem;line-height:1.1;text-align:center;font-family:var(--font-head)">${g.label}</strong>`
        + `<span style="font-size:.85rem;line-height:1.1;font-weight:700;text-align:center;color:var(--ink-soft)">${g.cover}</span>`
        + `<span class="items" aria-hidden="true" style="display:flex;gap:2px;flex-wrap:wrap;justify-content:center;min-height:1.2rem;font-size:1.05rem"></span>`;


      const holder = bin.querySelector(".items");
      bin.addEventListener("click", () => {
        if (!selected) { msg.textContent = "Pirma pasirink gyvūną."; api.readout("Pirma pasirink gyvūną."); return; }
        const a = animals.find((x) => x.name === selected && !x.done);
        if (!a) return;
        if (a.g === g.id) {
          a.done = true;
          placed[g.id] += 1;
          const mark = document.createElement("span");
          mark.textContent = a.emoji;
          mark.setAttribute("aria-hidden", "true");
          holder.appendChild(mark);
          selected = null;

          /* Papildomas gyvūnas: jokio skaičiaus, jokio api.progress — tik
             požymis ir priežastis, kodėl vieta vandenyje neklaidina. */
          if (a.extra) {
            drawTray();
            paintBins();
            msg.textContent = a.right;
            api.readout("Delfinas priklauso žinduoliams. Grupę rodo požymiai, o ne vieta.");
            api.note(a.note);
            msg.focus();
            return;
          }

          const baseLeft = animals.filter((x) => !x.done && !x.extra).length;
          if (baseLeft === 0 && !challenge) {
            challenge = true;
            const extra = animals.find((x) => x.extra);
            extra.visible = true;
            drawTray();
            paintBins();
            msg.textContent = extra.reveal;
            api.readout(`Visos grupės pilnos: žinduoliai ${placed.zinduoliai}, paukščiai ${placed.pauksciai}, žuvys ${placed.zuvis}. Dar vienas gyvūnas: delfinas.`);
            // Rezultatas — devyni gyvūnai grupėse. Papildomas gyvūnas jo
            // nebeatšaukia ir negrąžina atgal (LL-17).
            if (!reported) { reported = true; api.progress({ correct: true }); }
            const next = trayEl.querySelector("button");
            if (next) next.focus();
            return;
          }

          drawTray();
          paintBins();
          // Grįžtamasis ryšys pradedamas požymiu, o ne grupės vardu
          // (pasiūlymas #42): vaikas, kuris dar neskaito „žinduoliams“,
          // išgirsta ir pamato tą patį pastebėjimą, kuriuo rėmėsi.
          msg.textContent = `Teisingai. ${a.name} turi ${g.coverAcc} ir ${a.pozymis}.`;
          api.readout(`Teisingai. ${a.name} turi ${g.coverAcc}. Liko ${left()}.`);
          // Grįžtama prie gyvūnų: kitas priskyrimas prasideda nuo pasirinkimo.
          const next = trayEl.querySelector("button");
          if (next) next.focus();
        } else {
          bin.classList.add("wiggle");
          const t = setTimeout(() => { bin.classList.remove("wiggle"); timers.delete(t); }, 450);
          timers.add(t);

          if (a.extra) {
            a.tries += 1;
            // Pirma užuomina kartoja vaiko pastebėjimą ir klausia apie požymį,
            // antra — modelio žingsnis (T3.2). Atsakymas neįvardijamas (LL-22).
            msg.textContent = a.tries === 1
              ? (g.id === "zuvis" ? a.hintZuvis : a.hintPauksciai)
              : a.step;
            api.readout(`Delfinas liko lentelėje. Liko ${left()}.`);
            return;
          }

          // Užuomina nurodo į matomą požymį, ne į perskaitytą grupės vardą:
          // dėžių piktogramos yra tai, ką vaikas gali palyginti iš karto.
          msg.textContent = "Ne ši grupė. Kuo šis gyvūnas dengtas? Palygink su dėžių paveikslėliais.";

          api.readout(`Ne ši grupė. ${a.name} liko lentelėje. Liko ${left()}.`);
        }
      });
      binsEl.appendChild(bin);
    });

    controls.querySelector("#gg-reset").addEventListener("click", () => {
      timers.forEach(clearTimeout);
      timers.clear();
      stage.innerHTML = "";
      controls.innerHTML = "";
      gyvunuGrupes.mount({ stage, controls, api });
    });
    drawTray();
    paintBins();
    api.readout(`Rūšiuok gyvūnus. Liko ${left()}.`);
    return () => { timers.forEach(clearTimeout); timers.clear(); };
  },
};

/* ------------------------------------------------------------------ */
/* 4. Vandens būsenos — kur dingsta vanduo                             */
/* ------------------------------------------------------------------ */
/* Klaidinga nuostata (Bar ir Galili, 1994): 5–6 m. vaikas mano, kad
   išgaravęs vanduo išnyksta, o 7–8 m. — kad jis susigeria į paviršių.
   Todėl modelis turi du kelius tam pačiam vandeniui:
     be dangčio — vanduo išeina į orą ir jo nebesugrąžinsi;
     su dangčiu — garas nusėda lašais, o „Grąžink lašus“ parodo, kad
     vandens kiekis puode vėl toks pat.
   Skaičių vaikas neskaičiuoja: lygį rodo vandens juosta puode ir lašai
   ant dangčio. Šiluma keičia greitį (0 / 1 / 2 lygio per „pakaitinimą“),
   o dangtis — tai, kur garas nusėda. Dangtis vėsus, nes ant jo guli
   ledukas: tai paaiškina, kodėl garas virsta lašais.
   Ribos: puodas rodomas perpjautas (kitaip vandens nesimatytų), o
   vanduo ore lieka nepavaizduotas — tik žodžiu pasakome, kad jis ten.
   Modelis neturi laikmačio: vienas paspaudimas = kelios minutės.

   Trys žodžiai — Vanduo, Garas, Ledas — ateina iš modulio `sim.config.words`,
   o ne iš kodo: anksčiau konfigūracija buvo negyva (žodžiai kabėjo JSON, o
   simuliacija juos turėjo įrašytus kietai), todėl redaguojant terminiją
   pasikeisdavo tik garso įrašai, o ekrane likdavo seni žodžiai (LL-61).
   Būsenų juosta po scena parodo, kuris iš trijų dalykų scenoje yra DABAR:
   tai atsakymas į modulio rezultatą „Įvardiju tris vandens būsenas“.
   Ženklas (● / ○) ir žodis neša informaciją, spalva — tik paryškina. */

const VB_MAX = 5;
const VB_HEAT = ["Vėsu", "Šilta", "Verdantis"];
/* Atsarginiai žodžiai — kai komponentas montuojamas be `config`
   (pvz. bandyme). Modulyje visada laimi `sim.config.words`. */
const VB_WORDS = { water: "Vanduo", ice: "Ledas", steam: "Garas", drops: "Lašai" };

const vandensBusenos = {
  mount({ stage, controls, api, config }) {
    const words = { ...VB_WORDS };
    const cfgWords = config && typeof config.words === "object" && !Array.isArray(config.words)
      ? config.words : {};
    for (const key of Object.keys(VB_WORDS)) {
      const v = cfgWords[key];
      if (typeof v === "string" && v.trim()) words[key] = v.trim();
    }
    let level = VB_MAX;      // vandens lygis 0..5
    let heat = 1;            // 0 vėsu, 1 šilta, 2 verdantis
    let lid = false;         // ar dangtis uždėtas
    let drops = 0;           // lašai ant dangčio (0..5)
    let inAir = 0;           // vanduo, išėjęs į orą be dangčio
    let evaporated = 0;      // kiek vandens apskritai virto garu
    let returned = 0;        // kiek lašų grąžinta į puodą
    let presses = 0;         // kiek kartų kaitinta — tik bangelių vietai
    let reported = false;
    let msg = "Pakaitink puodą ir pažiūrėk, kas kyla virš vandens.";
    const spoke = { steam: false, drops: false, ice: false, back: false };

    const esc = (s) => String(s ?? "").replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* Būsenų kortelė: kairėje — ženklas, po juo — žodis iš `sim.config.words`,
       apačioje — kur tas dalykas yra dabar. Trys signalai (ženklas, žodis,
       rėmelio storis), todėl spalva nėra vienintelis informacijos nešėjas. */
    const stateCard = (key) => `
      <div class="vb-state" data-state="${key}" data-on="false"
           style="border:2px solid var(--line);border-radius:.6rem;padding:.3rem .2rem;text-align:center">
        <span class="vb-mark" aria-hidden="true"
              style="font-size:.7rem;line-height:1;color:var(--ink-soft)">○</span>
        <span class="vb-name" style="display:block;font-weight:800;font-size:.88rem;line-height:1.2">${esc(words[key])}</span>
        <span class="vb-where" style="display:block;font-size:.72rem;line-height:1.2;color:var(--ink-soft)">dar nėra</span>
      </div>`;

    stage.innerHTML = `
      <div style="width:100%;max-width:28rem;margin:0 auto">
        <svg id="vb-scene" viewBox="0 0 360 330" role="img"
             aria-label="Vandens būsenų modelis: puodas ant laužo"></svg>
        <div id="vb-states" role="group" aria-label="Kas dabar yra modelyje"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(5.4rem,1fr));gap:.4rem;margin:.55rem 0 0">
          ${["water", "steam", "ice"].map(stateCard).join("")}
        </div>
        <p class="sim-note" style="font-size:.8rem;text-align:center">
          Modelis supaprastintas: puodas rodomas perpjautas, kad matytum vandenį.
        </p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.6rem;width:100%;max-width:32rem;margin:0 auto">
        <div>
          <label for="vb-heat" style="display:block;text-align:center;font-weight:800;font-size:.95rem">
            Šiluma: <span id="vb-heat-word">Šilta</span>
          </label>
          <input id="vb-heat" type="range" min="0" max="2" step="1" value="1"
                 aria-label="Šiluma po puodu: vėsu, šilta arba verdantis"
                 style="width:100%;height:48px;accent-color:var(--ink)" />
          <div aria-hidden="true" style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--ink-soft);padding:0 .3rem">
            <span>Vėsu</span><span>Šilta</span><span>Verdantis</span>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center">
          <button class="btn" id="vb-boil" aria-label="Pakaitink puodą kelias minutes"
                  style="flex:1 1 8.5rem;min-height:48px">Pakaitink</button>
          <button class="btn secondary" id="vb-lid" aria-pressed="false"
                  style="flex:1 1 8.5rem;min-height:48px">Uždėti dangtį</button>
          <button class="btn secondary" id="vb-back" aria-label="Pakreipk dangtį ir grąžink lašus į puodą"
                  style="flex:1 1 8.5rem;min-height:48px">Grąžink lašus</button>
          <button class="btn ghost" id="vb-reset" aria-label="Pradėti bandymą iš naujo"
                  style="flex:0 0 auto;min-height:48px">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#vb-scene");
    const q = (sel) => controls.querySelector(sel);

    const heatWord = () => VB_HEAT[heat].toLowerCase();

    /* Vanduo puode: kuo daugiau lygių, tuo aukščiau paviršius. */
    const waterTop = () => 250 - level * 14.8;

    function firePath(cx, baseY, h, col, op) {
      return `<path d="M${cx} ${baseY} C${cx - 13} ${baseY - h * 0.45} ${cx - 5} ${baseY - h * 0.7} ${cx} ${baseY - h}`
        + ` C${cx + 7} ${baseY - h * 0.6} ${cx + 13} ${baseY - h * 0.4} ${cx} ${baseY} Z"`
        + ` fill="${col}" opacity="${op}"/>`;
    }

    /* Garo srovelė: kylanti vingiuota linija. Kiekis ir aukštis priklauso
       nuo šilumos, o ne nuo atsitiktinumo — tą patį veiksmą vaikas gali
       pakartoti ir pamatyti tą patį vaizdą. */
    function steam(x, top, h, op) {
      return `<path d="M${x} ${top} q -9 -${h * 0.3} 0 -${h * 0.55} q 9 -${h * 0.28} 0 -${h * 0.55}"`
        + ` stroke="#ffffff" stroke-opacity="${op}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }

    function render() {
      const top = waterTop();
      const strong = heat === 2;
      const fireH = heat === 0 ? 0 : strong ? 44 : 24;
      const flames = fireH
        ? firePath(180, 302, fireH, "#f2892f", 0.95)
          + firePath(164, 302, fireH * 0.68, "#f6a63c", 0.9)
          + firePath(196, 302, fireH * 0.62, "#f6a63c", 0.9)
          + firePath(180, 302, fireH * 0.52, "#ffd166", 0.95)
        : "";

      const bubbles = strong && level > 0
        ? Array.from({ length: 4 }, (_, i) => {
          const bx = 152 + i * 18;
          const by = Math.min(246, top + 16 + ((i * 13 + presses * 7) % 18));
          return `<circle cx="${bx}" cy="${by}" r="3" fill="#ffffff" opacity=".5"/>`;
        }).join("")
        : "";

      const water = level > 0
        ? `<path d="M126 ${top} Q180 ${top - 7} 234 ${top} L229 254 Q180 262 131 254 Z" fill="url(#vb-water)"/>
           <ellipse cx="180" cy="${top}" rx="54" ry="8" fill="#a6d9f0" opacity=".9"/>
           <path d="M140 ${top + 26} q14 -5 28 0 t28 0" stroke="#ffffff" stroke-opacity=".35"
                 stroke-width="2.4" fill="none" stroke-linecap="round"/>
           <path d="M150 ${top + 46} q12 -4 24 0 t24 0" stroke="#ffffff" stroke-opacity=".22"
                 stroke-width="2.2" fill="none" stroke-linecap="round"/>
           ${bubbles}`
        : `<path d="M131 254 Q180 262 229 254 L232 246 Q180 253 128 246 Z" fill="#8b5e3c" opacity=".55"/>`;

      const pot = `
        <path d="M112 150 H248 L241 252 Q236 268 180 270 Q124 268 119 252 Z"
              fill="#5c6772" stroke="#39424c" stroke-width="3"/>
        ${water}
        <path d="M121 168 q-17 5 -13 21 q3 11 16 8" fill="none" stroke="#39424c" stroke-width="6" stroke-linecap="round"/>
        <path d="M239 168 q17 5 13 21 q-3 11 -16 8" fill="none" stroke="#39424c" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="180" cy="150" rx="70" ry="13" fill="#6d7985" stroke="#39424c" stroke-width="3"/>
        <ellipse cx="180" cy="150" rx="60" ry="9" fill="#333b43"/>
        <path d="M124 158 q-4 46 3 84" stroke="#ffffff" stroke-opacity=".22" stroke-width="5"
              fill="none" stroke-linecap="round"/>`;

      const dropsUnderLid = drops > 0
        ? art.drops(155, 164, drops, "#5fb3e0")
        : "";

      const lidOn = `
        <ellipse cx="180" cy="150" rx="74" ry="14" fill="#c3ced8" stroke="#7e8b98" stroke-width="3"/>
        <ellipse cx="180" cy="146" rx="62" ry="9" fill="#dbe5ee" opacity=".7"/>
        ${art.block(166, 108, 28, "#e2f3fc", "", "#a7d3e6")}
        <text x="200" y="126" font-family="system-ui, sans-serif" font-size="11" font-weight="700"
              fill="#4a5560">${esc(words.ice.toLowerCase())}</text>
        ${dropsUnderLid}`;

      const lidOff = `
        <g transform="translate(292 292) rotate(-12)">
          <ellipse cx="0" cy="0" rx="34" ry="8" fill="#c3ced8" stroke="#7e8b98" stroke-width="2.5"/>
          <ellipse cx="0" cy="-3" rx="24" ry="5" fill="#dbe5ee" opacity=".7"/>
          ${drops > 0 ? art.drops(-16, 1, drops, "#5fb3e0") : ""}
        </g>`;

      /* Garas: be dangčio kyla aukštyn ir tolsta; su dangčiu lieka po juo. */
      const showSteam = heat > 0 && level > 0 && !lid;
      const steamWisps = showSteam
        ? (heat === 2
          ? steam(168, 140, 62, 0.62) + steam(184, 138, 74, 0.55) + steam(200, 142, 54, 0.42)
          : steam(172, 142, 42, 0.42) + steam(192, 144, 34, 0.32))
        : "";

      /* Garas yra tai, ko nesimato, todėl jis turi vardą pačioje scenoje,
         o ne tik kortelėje po ja. */
      const steamWord = showSteam
        ? `<text x="208" y="122" font-family="system-ui, sans-serif" font-size="11" font-weight="700"
                fill="#4a5560">${esc(words.steam.toLowerCase())}</text>`
        : "";

      /* Vanduo, kuris išėjo į orą: silpnos srovelės toliau nuo puodo.
         Jos rodo, kad vanduo liko ore, o ne dingo. */
      const showAir = inAir > 0 && !lid;
      const airWisps = showAir
        ? steam(286, 132, 46, 0.22) + steam(306, 122, 36, 0.18)
        : "";

      svg.innerHTML = `
        ${art.defs("vb")}
        <rect x="0" y="0" width="360" height="330" rx="16" fill="url(#vb-sky)"/>
        ${art.sun(314, 46, 13, "vb", heat === 2 ? 1 : 0.85)}
        ${art.cloud(52, 54, 1)}
        ${art.cloud(148, 34, 0.62, 0.8)}
        ${art.birds(30, 100)}
        ${art.hills(360, 212)}
        ${art.soil(0, 236, 360, 94, "vb")}
        ${art.grass(24, 240, 1)}
        ${art.grass(330, 242, 0.9)}
        <g fill="#6f6257" stroke="#4f463d" stroke-width="2">
          <circle cx="126" cy="300" r="9"/><circle cx="234" cy="300" r="9"/>
          <circle cx="146" cy="311" r="7"/><circle cx="214" cy="311" r="7"/>
        </g>
        <g transform="translate(180 300) rotate(-8)">
          <rect x="-30" y="-3" width="60" height="9" rx="4.5" fill="#8a5c33"/>
        </g>
        <g transform="translate(180 302) rotate(9)">
          <rect x="-24" y="-2" width="48" height="8" rx="4" fill="#6f4630"/>
        </g>
        ${flames}
        ${pot}
        ${lid ? lidOn : lidOff}
        ${steamWisps}
        ${steamWord}
        ${airWisps}`;

      svg.setAttribute("aria-label",
        `Puodas ant laužo. Vandens lygis ${level} iš ${VB_MAX}. `
        + `${heat === 0 ? "Ugnis nedega" : strong ? "Ugnis stipri" : "Ugnis silpna"}. `
        + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
        + (drops > 0 ? `${words.drops} ant dangčio: ${drops}.` : ""));

      /* Kortelės atitinka tai, kas modelyje yra DABAR, ir skaitomos iš tų
         pačių sąlygų, iš kurių piešiama scena (showSteam, showAir, lid) —
         kitaip paveikslas ir užrašas galėtų išsiskirti (LL-34). Su dangčiu
         garo nesimato, bet jis ten yra ir virsta lašais, todėl kortelė sako
         „po dangčiu“. Išgaravus visam vandeniui, „Vanduo“ vėl rodo
         „dar nėra“ (LL-17). */
      const where = {
        water: level > 0 ? "yra puode" : "dar nėra",
        steam: lid
          ? (heat > 0 && level > 0 ? "po dangčiu" : "dar nėra")
          : (showSteam || showAir ? "ore" : "dar nėra"),
        ice: lid ? "ant dangčio" : "dar nėra",
      };
      for (const key of Object.keys(where)) {
        const card = stage.querySelector(`.vb-state[data-state="${key}"]`);
        if (!card) continue;
        const on = where[key] !== "dar nėra";
        card.dataset.on = on ? "true" : "false";
        card.style.borderColor = on ? "var(--ink)" : "var(--line)";
        card.style.background = on ? "var(--paper)" : "transparent";
        const mark = card.querySelector(".vb-mark");
        mark.textContent = on ? "●" : "○";
        mark.style.color = on ? "var(--ink)" : "var(--ink-soft)";
        const spot = card.querySelector(".vb-where");
        spot.textContent = where[key];
        spot.style.color = on ? "var(--ink)" : "var(--ink-soft)";
      }

      q("#vb-heat").value = String(heat);
      q("#vb-heat").setAttribute("aria-valuetext", `Šiluma: ${heatWord()}`);
      q("#vb-heat-word").textContent = VB_HEAT[heat];

      const lidBtn = q("#vb-lid");
      lidBtn.textContent = lid ? "Nuimti dangtį" : "Uždėti dangtį";
      lidBtn.setAttribute("aria-pressed", String(lid));
      lidBtn.setAttribute("aria-label", lid ? "Nuimk dangtį nuo puodo" : "Uždėk vėsų dangtį ant puodo");

      /* Tekstinis kortelių atitikmuo: ką rodo būsenų juosta, tą pasako
         readout — todėl modelis veikia ir be vaizdo. */
      const onScene = Object.keys(where)
        .filter((k) => where[k] !== "dar nėra")
        .map((k) => words[k]);
      api.readout(`Vandens lygis ${level} iš ${VB_MAX}. `
        + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
        + (onScene.length ? `Dabar: ${onScene.join(", ")}.` : "")
        + (drops > 0 ? ` ${words.drops} ant dangčio: ${drops}.` : ""));
      api.note(msg);

      if (!spoke.steam && evaporated > 0) { spoke.steam = true; api.speak(words.steam); }
      if (!spoke.drops && drops > 0) { spoke.drops = true; api.speak(words.drops); }
      if (!spoke.ice && lid) { spoke.ice = true; api.speak(words.ice); }
      if (!spoke.back && returned > 0) { spoke.back = true; api.speak(words.water); }
    }

    function boil() {
      if (level === 0) {
        /* Tuščias puodas su lašais ant dangčio nėra aklavietė: vanduo ten pat.
           Siųsti vaiką į „Iš naujo“ reikštų išmesti būtent tą įrodymą, kurį
           jis ką tik surinko (LL-18). */
        msg = drops > 0
          ? "Puodas tuščias, bet vanduo yra ant dangčio. Paspausk „Grąžink lašus“."
          : "Puodas tuščias. Paspausk „Iš naujo“ ir bandyk dar kartą.";
        render();
        return;
      }
      if (heat === 0) {
        msg = "Vėsioje vanduo beveik negaruoja. Pastumk šilumą į dešinę.";
        render();
        return;
      }
      const amount = Math.min(level, heat);   // 1 arba 2 lygiai per kartą
      level -= amount;
      evaporated += amount;
      presses += 1;
      if (lid) {
        drops = Math.min(VB_MAX, drops + amount);
        msg = drops === amount
          ? "Vanduo virto garu ir nusėdo ant dangčio lašais."
          : "Dar daugiau garo nusėdo ant dangčio.";
      } else {
        inAir += amount;
        msg = "Vanduo virto garu ir išėjo į orą. Vanduo liko ore, tik jo nematome.";
      }
      render();
    }

    function toggleLid() {
      lid = !lid;
      msg = lid
        ? "Dangtis uždėtas. Jis vėsus, todėl garas ant jo virsta lašais."
        : "Dangtis nuimtas. Garas kils tiesiai į orą.";
      render();
    }

    function backToPot() {
      if (drops === 0) {
        msg = "Ant dangčio dar nėra lašų. Uždėk dangtį ir pakaitink.";
        render();
        return;
      }
      const amount = drops;
      level = Math.min(VB_MAX, level + amount);
      returned += amount;
      drops = 0;
      msg = "Lašai nubėgo atgal į puodą. Vanduo sugrįžo, nebuvo dingęs.";
      render();
      /* Rezultatas — visas ciklas: garas surinktas ant dangčio ir grąžintas.
         Vienas išgarinimas dar nėra įrodymas (LL-29), o vieno lašo grąžinimas
         jau yra: lašas atsirado tik tada, kai garas virto vandeniu, ir tik tada
         galėjo sugrįžti. Anksčiau sąlyga reikalavo DVIEJŲ lašų, todėl vaikas,
         kaitinęs „Šilta“, viso ciklo įrodymo taip ir negavo. */
      if (!reported && returned > 0) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    q("#vb-heat").addEventListener("input", (e) => {
      heat = Number(e.target.value);
      msg = heat === 0
        ? "Vėsu: garų beveik nematyti."
        : heat === 1 ? "Šilta: vanduo pradeda garuoti." : "Verdantis: garas kyla stipriai.";
      render();
    });
    q("#vb-boil").addEventListener("click", boil);
    q("#vb-lid").addEventListener("click", toggleLid);
    q("#vb-back").addEventListener("click", backToPot);
    q("#vb-reset").addEventListener("click", () => {
      level = VB_MAX; heat = 1; lid = false; drops = 0; inAir = 0; evaporated = 0;
      returned = 0; presses = 0;
      /* Žodžiai vėl tariami naujame bandyme: vaikas, pradėjęs iš naujo,
         turi išgirsti tuos pačius vardus, o ne tylą. */
      spoke.steam = spoke.drops = spoke.ice = spoke.back = false;
      msg = "Naujas bandymas. Pakaitink puodą ir stebėk garą.";
      render();
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 5. Judėjimas — nuožulnioji plokštuma                                */
/* ------------------------------------------------------------------ */
/* Klaidinga nuostata (Hast, 2018 — 144 vaikai 5–12 m.): jaunesni vaikai
   mano, kad LENGVESNIS rutulys rieda greičiau, ir nemano, kad kitas
   plokštumos aukštis apskritai galėtų ką nors pakeisti. Todėl modelyje
   yra dvi vienodos nuožulnios plokštumos, ant kurių VIENU METU rieda du
   vienodo dydžio rutuliai: kairėje medinis (lengvas), dešinėje akmeninis
   (sunkus). Vienintelis kintamasis, kurį vaikas keičia, yra abiejų
   plokštumų aukštis — todėl priežastis matoma, o ne įsimenama.

   Kodėl dvi plokštumos, o ne viena: žiūrint iš šono ant vienos
   plokštumos abu rutuliai uždengtų vienas kitą, o paleidus juos
   skirtingu atstumu nuo viršaus vienas atrodytų „pradėjęs pirmiau“.
   Dvi vienodos plokštumos leidžia lyginti sąžiningai.

   Fizika supaprastinta: riedėjimo trukmė proporcinga 1/√(sin θ), o
   rutulio masė į ją neįeina (taip yra ir tikrame riedėjime be oro
   pasipriešinimo). Sunkesnysis paleidžiamas 2 % greičiau — tiek, kad
   ekrane nebūtų „lygiai taip pat“, bet akimis skirtumo nesimatytų.
   Ribos: trinties ir rutulių sukimosi nesimato; tai pasakoma žodžiu
   po simuliacija. */
const NP_ANGLE = [12, 21, 30];                       // plokštumos kampas laipsniais
const NP_NAME = ["žema", "vidutinė", "aukšta"];
const NP_NAME_NOM = ["Žema", "Vidutinė", "Aukšta"];
const NP_LEN = 150;                                   // lentos ilgis
const NP_THICK = 9;                                   // lentos storis
const NP_R = 10;                                      // rutulio spindulys
const NP_PIVOT = [{ x: 30, y: 250 }, { x: 190, y: 250 }];
const NP_D0 = 8;                                      // rutulio vieta viršuje
const NP_D = NP_LEN - 6;                              // rutulio vieta apačioje

const npGeom = (level) => {
  const a = (NP_ANGLE[level] * Math.PI) / 180;
  return { a, cos: Math.cos(a), sin: Math.sin(a), tan: Math.tan(a) };
};

/* Rutulio centras: `d` — atstumas nuo lentos viršaus žemyn lenta.
   Rutulys remiasi į lentos viršutinę plokštumą, todėl nuo apatinės
   briaunos jis atitrauktas lentos storiu ir savo spinduliu. */
function npBallPos(i, level, d) {
  const g = npGeom(level);
  const p = NP_PIVOT[i];
  const topX = p.x + NP_LEN * g.cos;
  const topY = p.y - NP_LEN * g.sin;
  const off = NP_THICK + NP_R;
  return {
    cx: topX - d * g.cos - off * g.sin,
    cy: topY + d * g.sin - off * g.cos,
  };
}

const nuozulniojiPlokstuma = {
  mount({ stage, controls, api }) {
    let level = 1;              // 0 žema, 1 vidutinė, 2 aukšta
    let guess = null;           // "light" | "heavy" | "both"
    let state = "ready";        // ready | rolling | done
    let dL = NP_D0;             // lengvo rutulio vieta
    let dH = NP_D0;             // sunkaus rutulio vieta
    let prevLevel = null;       // su kuo lyginamas paskutinis bandymas
    let reported = false;       // api.progress iškviestas vieną kartą
    const heightsRun = new Set();
    let raf = 0;
    let msg = "Pirma pasirink spėjimą. Tada spausk „Leisk abu“.";
    const reduce = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto">
        <svg id="np-scene" viewBox="0 0 360 320" role="img"
             aria-label="Dvi nuožulnios plokštumos su rutuliais"></svg>
        <p class="sim-note" style="font-size:.8rem;text-align:center">
          Modelis supaprastintas: trinties ir rutulių sukimosi nesimato.
        </p>
      </div>`;

    const guessBtn = (id, label) =>
      `<button class="btn secondary" id="${id}" aria-pressed="false"
               style="min-height:48px;padding:.4rem .3rem;font-size:.9rem;line-height:1.15">${label}</button>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.6rem;width:100%;max-width:34rem;margin:0 auto">
        <div role="group" aria-label="Tavo spėjimas">
          <p id="np-guess-label" style="margin:0 0 .3rem;font-weight:800;font-size:.9rem;text-align:center">Tavo spėjimas: kuris atriedės pirmas?</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,7rem),1fr));gap:.4rem">
            ${guessBtn("np-guess-light", "Lengvesnis pirmas")}
            ${guessBtn("np-guess-heavy", "Sunkesnis pirmas")}
            ${guessBtn("np-guess-both", "Abu kartu")}
          </div>
        </div>
        <div role="group" aria-label="Plokštumos aukštis">
          <p style="margin:0 0 .3rem;font-weight:800;font-size:.9rem;text-align:center">Plokštumos aukštis</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,5rem),1fr));gap:.4rem">
            ${guessBtn("np-h0", NP_NAME_NOM[0])}
            ${guessBtn("np-h1", NP_NAME_NOM[1])}
            ${guessBtn("np-h2", NP_NAME_NOM[2])}
          </div>
        </div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center">
          <button class="btn" id="np-release" style="flex:1 1 9rem;min-height:48px">Leisk abu</button>
          <button class="btn ghost" id="np-reset" aria-label="Pradėti bandymą iš naujo"
                  style="flex:0 1 auto;min-width:48px;min-height:48px">Iš naujo</button>
        </div>
        <p id="np-history" style="margin:0;text-align:center;font-size:.85rem;color:var(--ink-soft)">Bandymai: dar nė vieno.</p>
      </div>`;

    const svg = stage.querySelector("#np-scene");
    const q = (sel) => controls.querySelector(sel);

    function paintScene() {
      const g = npGeom(level);
      const ramps = NP_PIVOT.map((p, i) => {
        const topX = p.x + NP_LEN * g.cos;
        const topY = p.y - NP_LEN * g.sin;
        // Atramos stulpas siekia lentos apačią, o ne kyšo per ją.
        const postH = Math.max(10, p.y - (topY + 16 * g.tan));
        return `${art.plank(topX - 16, p.y, 10, postH, 0)}
          ${art.plank(topX - 21, p.y, 20, 5, 0)}
          ${art.plank(p.x - 5, p.y, 11, 10, 0)}
          ${art.plank(p.x, p.y, NP_LEN, NP_THICK, NP_ANGLE[level])}`;
      }).join("");

      svg.innerHTML = `
        ${art.defs("np")}
        <rect x="0" y="0" width="360" height="320" rx="16" fill="url(#np-sky)"/>
        ${art.sun(318, 40, 13, "np")}
        ${art.cloud(58, 44, 0.9)}
        ${art.cloud(168, 26, 0.6, 0.8)}
        ${art.birds(238, 56)}
        ${art.hills(360, 214)}
        ${art.soil(0, 250, 360, 70, "np")}
        ${art.grass(8, 252, 1)}
        ${art.grass(352, 252, 0.9)}
        ${ramps}
        <g id="np-ball-light">${art.ball(0, 0, NP_R, "#f2cf94", "#a9793f")}</g>
        <g id="np-ball-heavy">${art.ball(0, 0, NP_R, "#9aa3ad", "#5d6670")}</g>
        <text x="34" y="290" font-family="system-ui, sans-serif" font-size="12" font-weight="700"
              fill="#f7ecd9">lengvas</text>
        <text x="194" y="290" font-family="system-ui, sans-serif" font-size="12" font-weight="700"
              fill="#f7ecd9">sunkus</text>`;

      placeBalls();
    }

    function placeBalls() {
      const light = svg.querySelector("#np-ball-light");
      const heavy = svg.querySelector("#np-ball-heavy");
      if (!light || !heavy) return;
      const a = npBallPos(0, level, dL);
      const b = npBallPos(1, level, dH);
      light.setAttribute("transform", `translate(${a.cx.toFixed(1)} ${a.cy.toFixed(1)})`);
      heavy.setAttribute("transform", `translate(${b.cx.toFixed(1)} ${b.cy.toFixed(1)})`);
    }

    function paintToggles() {
      const pairs = [
        [q("#np-guess-light"), guess === "light"],
        [q("#np-guess-heavy"), guess === "heavy"],
        [q("#np-guess-both"), guess === "both"],
        [q("#np-h0"), level === 0],
        [q("#np-h1"), level === 1],
        [q("#np-h2"), level === 2],
      ];
      for (const [btn, on] of pairs) {
        btn.setAttribute("aria-pressed", String(on));
        btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
        btn.style.color = on ? "var(--paper)" : "var(--ink)";
        btn.style.borderColor = on ? "var(--ink)" : "var(--line)";
      }
      q("#np-guess-label").textContent = state === "ready" && prevLevel === null
        ? "Tavo spėjimas: kuris atriedės pirmas?"
        : "Tavo spėjimas (jau palygintas)";
    }

    function paintHistory() {
      const el = q("#np-history");
      if (!heightsRun.size) {
        el.textContent = "Bandymai: dar nė vieno.";
        return;
      }
      const done = NP_NAME_NOM
        .map((n, i) => (heightsRun.has(i) ? `${n} ✓` : `${n} —`))
        .join(" · ");
      el.textContent = `Bandymai: ${done}`;
      el.setAttribute("aria-label",
        `Atlikti bandymai: ${[...heightsRun].map((i) => NP_NAME_NOM[i].toLowerCase()).join(", ")}`);
    }

    function render() {
      paintScene();
      paintToggles();
      paintHistory();

      svg.setAttribute("aria-label",
        `Dvi vienodos plokštumos. Kairėje lengvas rutulys, dešinėje sunkus. `
        + `Plokštuma ${NP_NAME[level]}.`
        + (state === "done" ? " Abu rutuliai atriedėjo beveik kartu." : ""));

      api.readout(`Plokštuma ${NP_NAME[level]} · `
        + (state === "rolling" ? "rutuliai rieda" : state === "done" ? "rutuliai apačioje" : "rutuliai viršuje"));
      api.note(msg);
    }

    const cancelRoll = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    function finishRun() {
      state = "done";
      dL = NP_D;
      dH = NP_D;
      const first = prevLevel === null;
      if (first) {
        const said = guess === "light" ? "lengvesnis pirmas"
          : guess === "heavy" ? "sunkesnis pirmas" : "abu kartu";
        msg = `Spėjai: ${said}. Įvyko: abu atriedėjo beveik kartu.`;
        api.speak("Kartu", { rate: .9 });
      } else if (level > prevLevel) {
        msg = "Plokštuma aukštesnė: abu rutuliai atriedėjo greičiau.";
        api.speak("Greičiau", { rate: .9 });
      } else if (level < prevLevel) {
        msg = "Plokštuma žemesnė: abu rutuliai atriedėjo lėčiau.";
        api.speak("Lėčiau", { rate: .9 });
      } else {
        msg = "Ta pati plokštuma: rutuliai vėl atriedėjo beveik kartu.";
      }
      const before = prevLevel;
      prevLevel = level;
      heightsRun.add(level);
      /* Rezultatas — dviejų SKIRTINGŲ aukščių palyginimas, o ne vienas
         bandymas (LL-29). Kartojimas tame pačiame aukštyje pažangos
         nežymi ir jos neatšaukia. */
      if (!reported && guess !== null && before !== null && before !== level) {
        reported = true;
        api.progress({ correct: true });
      }
      render();
    }

    function release() {
      if (state === "rolling") return;
      if (guess === null) {
        msg = "Pirma pasirink spėjimą. Tada spausk „Leisk abu“.";
        render();
        api.readout("Pirma pasirink spėjimą.");
        q("#np-guess-light").focus();
        return;
      }
      cancelRoll();
      state = "rolling";
      dL = NP_D0;
      dH = NP_D0;
      msg = "Rutuliai rieda. Stebėk, kuris atriedės pirmas.";
      render();

      const g = npGeom(level);
      const T = 760 / Math.sqrt(g.sin);        // trukmė priklauso tik nuo kampo
      if (reduce) { finishRun(); return; }

      const t0 = performance.now();
      const tick = (now) => {
        const pH = Math.min(1, (now - t0) / T);
        const pL = Math.min(1, (now - t0) / (T * 1.02));
        dH = NP_D0 + (NP_D - NP_D0) * pH * pH;   // tolygiai greitėjantis judėjimas
        dL = NP_D0 + (NP_D - NP_D0) * pL * pL;
        placeBalls();
        if (pH < 1 || pL < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
          finishRun();
        }
      };
      raf = requestAnimationFrame(tick);
    }

    function setLevel(l) {
      cancelRoll();
      level = l;
      state = "ready";
      dL = NP_D0;
      dH = NP_D0;
      if (guess === null) {
        msg = "Pirma pasirink spėjimą. Tada spausk „Leisk abu“.";
      } else if (prevLevel !== null && l > prevLevel) {
        msg = "Plokštuma aukštesnė. Leisk rutulius ir palygink.";
      } else if (prevLevel !== null && l < prevLevel) {
        msg = "Plokštuma žemesnė. Leisk rutulius ir palygink.";
      } else {
        msg = "Plokštuma parinkta. Leisk rutulius.";
      }
      render();
    }

    function pickGuess(v) {
      guess = v;
      msg = state === "done"
        ? "Spėjimas pakeistas. Bandyk su kitu plokštumos aukščiu."
        : "Spėjimas įrašytas. Dabar spausk „Leisk abu“.";
      render();
      api.speak(v === "light" ? "Lengvas rutulys" : v === "heavy" ? "Sunkus rutulys" : "Kartu", { rate: .9 });
    }

    q("#np-guess-light").addEventListener("click", () => pickGuess("light"));
    q("#np-guess-heavy").addEventListener("click", () => pickGuess("heavy"));
    q("#np-guess-both").addEventListener("click", () => pickGuess("both"));
    q("#np-h0").addEventListener("click", () => setLevel(0));
    q("#np-h1").addEventListener("click", () => setLevel(1));
    q("#np-h2").addEventListener("click", () => setLevel(2));
    q("#np-release").addEventListener("click", release);
    q("#np-reset").addEventListener("click", () => {
      cancelRoll();
      level = 1; guess = null; state = "ready"; dL = NP_D0; dH = NP_D0;
      prevLevel = null; heightsRun.clear();
      msg = "Naujas bandymas. Pirma pasirink spėjimą.";
      render();
    });

    render();
    return () => cancelRoll();
  },
};

/* ------------------------------------------------------------------ */
/* Kuprinė (1 klasės pasaulio pažinimas, 26.1.2 „Sveikas gyvenimas“)   */
/* ------------------------------------------------------------------ */
/*
 * Modelis laiko kuprinės svorį PASTOVŲ ir keičia tik du dalykus: petnešų
 * ilgį ir tai, kiek pečių petnešas laiko. Todėl priežastis matoma, o ne
 * išvedama: vaikas pamato, kad svoris tas pats, o spaudimo vieta kita.
 *
 * Kodėl vaizdas iš nugaros: kuprinė nešama ant nugaros, todėl tik iš
 * nugaros matoma, aukštai ar žemai ji remiasi ir ar petnešos ją laiko.
 * Veidas nepiešiamas sąmoningai — taip scena lieka apie kuprinę, o ne apie
 * veikėją, ir nereikia spėlioti jo nuotaikos.
 *
 * Kodėl nemokoma „aukštai geriau“: tyrimai apie aukštą ir žemą padėtį
 * prieštarauja vieni kitiems (Brackley 2009 — žema davė mažiau pokyčių;
 * Genitrini 2022 apžvalga — aukšta ir prigludusi kartu su trumpomis
 * petnešomis). Todėl modulis teigia tik tai, ką rodo modelis: ilgos
 * petnešos nebeleidžia kuprinei laikytis prie nugaros, o vienas petys
 * svorį laiko vienoje pusėje.
 */

const kuprineIrSvoris = {
  mount({ stage, controls, api, config }) {
    const SENT = (config && config.sentences) || {};
    const GROUND = 268;
    const PACK_W = 60;
    const PACK_H = 62;

    let strap = "tinkamos";   // tinkamos | ilgos
    let mode = "abiem";       // abiem | vienas
    let guess = null;         // nieko | vieta
    let worn = false;         // kuprinė uždėta ir parodyta
    let reported = false;
    const seen = new Set();

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <svg id="kp-scene" viewBox="0 0 360 330" width="100%"
             style="display:block;max-width:360px;height:auto;margin:0 auto"
             role="img" aria-label="Vaikas stovi iš nugaros. Kuprinė dar neuždėta."></svg>
        <p id="kp-where" style="margin:.5rem 0 .15rem;text-align:center;font-weight:800;font-size:1.05rem">
          Spaudžia: kuprinė dar neuždėta</p>
        <p class="sim-note" style="margin:0;text-align:center;font-size:.85rem">
          Kuprinė ta pati. Svoris nepakito.</p>
        <p class="sim-note" style="margin:.15rem 0 0;text-align:center;font-size:.85rem">
          Kūno dalys: galva · pečiai · juosmuo · kojos</p>
      </div>`;

    const btnStyle = "min-height:48px;flex:0 1 auto;min-width:0;max-width:100%;padding:.35rem .7rem;font-size:.95rem";

    controls.innerHTML = `
      <div style="display:grid;gap:.7rem;width:100%;max-width:32rem;min-width:0;margin:0 auto">
        <div style="min-width:0">
          <p id="kp-strap-label" style="margin:0 0 .3rem;font-weight:800;text-align:center">Petnešų ilgis</p>
          <div id="kp-strap" role="group" aria-labelledby="kp-strap-label"
               style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;min-width:0">
            <button class="btn secondary" type="button" data-strap="tinkamos" aria-pressed="true" style="${btnStyle}">Tinkamos</button>
            <button class="btn secondary" type="button" data-strap="ilgos" aria-pressed="false" style="${btnStyle}">Per ilgos</button>
          </div>
        </div>
        <div style="min-width:0">
          <p id="kp-mode-label" style="margin:0 0 .3rem;font-weight:800;text-align:center">Kaip nešama</p>
          <div id="kp-mode" role="group" aria-labelledby="kp-mode-label"
               style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;min-width:0">
            <button class="btn secondary" type="button" data-mode="abiem" aria-pressed="true" style="${btnStyle}">Abiem pečiais</button>
            <button class="btn secondary" type="button" data-mode="vienas" aria-pressed="false" style="${btnStyle}">Vienu pečiu</button>
          </div>
        </div>
        <div style="min-width:0">
          <p id="kp-guess-label" style="margin:0 0 .3rem;font-weight:800;text-align:center">Tavo spėjimas: ką keičia ilgos petnešos?</p>
          <div id="kp-guess" role="group" aria-labelledby="kp-guess-label"
               style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;min-width:0">
            <button class="btn secondary" type="button" data-guess="nieko" aria-pressed="false" style="${btnStyle}">Nieką — svoris tas pats</button>
            <button class="btn secondary" type="button" data-guess="vieta" aria-pressed="false" style="${btnStyle}">Kitą vietą, kur spaudžia</button>
          </div>
        </div>
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;min-width:0">
          <button class="btn" type="button" id="kp-wear" style="flex:1 1 8rem;min-width:0;max-width:100%;min-height:48px">Uždėti</button>
          <button class="btn ghost" type="button" id="kp-reset" style="flex:0 1 auto;min-width:0;max-width:100%;min-height:48px">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#kp-scene");
    const whereEl = stage.querySelector("#kp-where");
    const strapBtns = Array.from(controls.querySelectorAll("[data-strap]"));
    const modeBtns = Array.from(controls.querySelectorAll("[data-mode]"));
    const guessBtns = Array.from(controls.querySelectorAll("[data-guess]"));
    const wearBtn = controls.querySelector("#kp-wear");
    const resetBtn = controls.querySelector("#kp-reset");

    /* --- piešinys --------------------------------------------------- */

    function bodyMarkup() {
      return `
        <ellipse cx="180" cy="${GROUND}" rx="44" ry="7" fill="#5a4a2a" opacity=".16"/>
        <rect x="156" y="204" width="20" height="58" rx="9" fill="#40566b"/>
        <rect x="184" y="204" width="20" height="58" rx="9" fill="#40566b"/>
        <rect x="146" y="258" width="32" height="10" rx="5" fill="#3a3f45"/>
        <rect x="182" y="258" width="32" height="10" rx="5" fill="#3a3f45"/>
        <rect x="146" y="192" width="68" height="26" rx="9" fill="#4a6fa5"/>
        <path d="M136 136 Q180 116 224 136 L219 200 Q180 210 141 200 Z"
              fill="#8fbcd4" stroke="#5c86a0" stroke-width="2"/>
        <rect x="124" y="132" width="15" height="68" rx="7.5" fill="#7aa9c4"/>
        <rect x="221" y="132" width="15" height="68" rx="7.5" fill="#7aa9c4"/>
        <circle cx="131" cy="202" r="7.5" fill="#e8b98f"/>
        <circle cx="229" cy="202" r="7.5" fill="#e8b98f"/>
        <rect x="171" y="100" width="18" height="28" rx="7" fill="#e8b98f"/>
        <circle cx="180" cy="82" r="24" fill="#5b4636"/>
        <circle cx="156" cy="86" r="5" fill="#e8b98f"/>
        <circle cx="204" cy="86" r="5" fill="#e8b98f"/>`;
    }

    function packMarkup() {
      return `
        <rect x="0" y="0" width="${PACK_W}" height="${PACK_H}" rx="12" fill="#d97a45" stroke="#8f4a21" stroke-width="3"/>
        <path d="M7 3 H53 Q57 3 57 8 V29 Q30 39 3 29 V8 Q3 3 7 3 Z"
              fill="#e6935c" stroke="#8f4a21" stroke-width="2.5"/>
        <rect x="19" y="27" width="22" height="9" rx="4" fill="#8f4a21" opacity=".8"/>
        <circle cx="30" cy="31.5" r="3.4" fill="#f5d9a8"/>
        <rect x="12" y="35" width="36" height="21" rx="7" fill="#c96a37" stroke="#8f4a21" stroke-width="2"/>
        <line x1="30" y1="39" x2="30" y2="52" stroke="#8f4a21" stroke-width="2.5" stroke-linecap="round"/>`;
    }

    function packPos() {
      if (mode === "vienas") {
        return { x: 122, y: strap === "ilgos" ? 158 : 134, rot: -6 };
      }
      return { x: 150, y: strap === "ilgos" ? 156 : 130, rot: 0 };
    }

    /*
     * Petnešos: trumpos eina tiesiai nuo peties ant kuprinės, ilgos
     * išlinksta į šoną — todėl matosi, kad jos nebetempia kuprinės prie
     * nugaros. Nešant vienu pečiu, antroji petneša kabo laisva.
     */
    function strapsMarkup() {
      const s = (d, w = 7) => `<path d="${d}" fill="none" stroke="#4a4038" stroke-width="${w}" stroke-linecap="round"/>`;
      if (mode === "vienas") {
        const near = strap === "ilgos"
          ? "M151 130 C140 140 138 152 148 162"
          : "M151 130 C145 136 140 138 134 144";
        const free = strap === "ilgos"
          ? "M180 176 C192 186 196 194 192 202"
          : "M180 156 C190 166 194 174 190 184";
        return s(near) + s(free, 5);
      }
      if (strap === "ilgos") {
        return s("M151 130 C138 138 137 152 152 164") + s("M209 130 C222 138 223 152 208 164");
      }
      return s("M151 130 C149 138 150 142 156 148") + s("M209 130 C211 138 210 142 204 148");
    }

    function leader(x, y, text) {
      const w = String(text).length * 8.2;
      const lx = Math.max(4, x - 14 - w);
      return `<line x1="${x}" y1="${y}" x2="${(lx + w + 4).toFixed(1)}" y2="${y}"
                    stroke="#4a4038" stroke-width="2" stroke-dasharray="5 5"/>
        <text x="${lx.toFixed(1)}" y="${y + 5}" font-family="system-ui, sans-serif"
              font-size="15" font-weight="800" fill="#4a4038">${text}</text>`;
    }

    /* Spaudimo vieta — banguotas kontūras (art.spot), ne spalvotas plotas:
       ženklas turi būti matomas ir nespalvotame ekrane, o prasmę neša
       užrašas ir didelis tekstas po scena. */
    function pressureMarkup() {
      if (!worn) return "";
      const ring = "#b23a2f";
      if (mode === "vienas") {
        const y = strap === "ilgos" ? 194 : 118;
        return art.spot(118, y, 34, 24, ring, "apvali", 3) + leader(116, y + 12, "vienas petys");
      }
      if (strap === "ilgos") {
        return art.spot(144, 190, 72, 26, ring, "apvali", 3) + leader(142, 203, "juosmuo");
      }
      return art.spot(132, 116, 30, 24, ring, "apvali", 3)
        + art.spot(198, 116, 30, 24, ring, "apvali", 3)
        + leader(130, 128, "pečiai");
    }

    function sceneMarkup() {
      const pos = packPos();
      const groundPack = worn
        ? ""
        : `<g id="kp-pack-ground" transform="translate(280 220) rotate(74) scale(0.55)">${packMarkup()}</g>`;
      const wornPack = worn
        ? `<g id="kp-pack" transform="translate(${pos.x} ${pos.y}) rotate(${pos.rot})">${packMarkup()}</g>`
        : "";
      return `${art.defs("kp")}
        ${art.sun(320, 44, 14, "kp", 0.9)}
        ${art.cloud(58, 48, 0.8)}
        ${art.cloud(150, 30, 0.5, 0.75)}
        ${art.hills(360, 258)}
        ${art.grass(96, 266, 1)}
        ${art.grass(262, 264, 0.9)}
        ${art.grass(318, 262, 0.8)}
        ${groundPack}
        ${bodyMarkup()}
        ${wornPack}
        ${worn ? strapsMarkup() : ""}
        ${pressureMarkup()}`;
    }

    function sceneLabel() {
      if (!worn) return "Vaikas stovi iš nugaros. Kuprinė guli ant žemės, dar neuždėta.";
      const s = strap === "ilgos" ? "Petnešos ilgos." : "Petnešos trumpos.";
      if (mode === "vienas") return `Vaikas neša kuprinę vienu pečiu. ${s} Svoris remiasi vienoje pusėje.`;
      return strap === "ilgos"
        ? `Vaikas neša kuprinę abiem pečiais. ${s} Kuprinė nuslydo žemai, svoris remiasi ties juosmeniu.`
        : `Vaikas neša kuprinę abiem pečiais. ${s} Kuprinė prigludusi, svorį laiko abu pečiai.`;
    }

    function whereText() {
      if (!worn) return "Spaudžia: kuprinė dar neuždėta";
      if (mode === "vienas") return strap === "ilgos" ? "Spaudžia: vienas petys, žemai" : "Spaudžia: vienas petys";
      return strap === "ilgos" ? "Spaudžia: juosmuo" : "Spaudžia: abu pečiai";
    }

    function paintToggles() {
      const pairs = [
        ...strapBtns.map((b) => [b, b.dataset.strap === strap]),
        ...modeBtns.map((b) => [b, b.dataset.mode === mode]),
        ...guessBtns.map((b) => [b, b.dataset.guess === guess]),
      ];
      for (const [b, on] of pairs) {
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
        b.style.background = on ? "var(--sun-soft, #fff3cf)" : "";
      }
      if (guess && !worn) wearBtn.removeAttribute("aria-disabled");
      else if (!guess) wearBtn.setAttribute("aria-disabled", "true");
      else wearBtn.removeAttribute("aria-disabled");
      wearBtn.style.opacity = guess ? "1" : ".55";
    }

    function render() {
      svg.innerHTML = sceneMarkup();
      svg.setAttribute("aria-label", sceneLabel());
      whereEl.textContent = whereText();
      paintToggles();
    }

    /* --- veiksmas ---------------------------------------------------- */

    function wear() {
      if (!guess) {
        api.note("Pirma pasirink spėjimą.");
        guessBtns[0].focus();
        return;
      }
      worn = true;
      seen.add(`${mode}-${strap}`);

      const sentence = mode === "vienas"
        ? (strap === "ilgos"
          ? (SENT.oneLow || "Kuprinė nuslydo į vieną pusę.")
          : (SENT.one || "Vienas petys laiko visą svorį."))
        : (strap === "ilgos"
          ? (SENT.low || "Kuprinė nuslydo. Svoris remiasi ties juosmeniu.")
          : (SENT.tight || "Kuprinė prigludusi prie nugaros."));

      api.readout(sentence);
      if (typeof api.speak === "function") api.speak(sentence, { rate: 0.95 });

      const bothSeen = seen.has("abiem-tinkamos") && seen.has("abiem-ilgos");
      const oneSeen = [...seen].some((k) => k.indexOf("vienas-") === 0);

      let note;
      if (mode === "vienas") {
        note = "Antras petys petnešos nebeturi. Visas svoris vienoje pusėje.";
      } else if (strap === "ilgos") {
        note = "Kuprinė nebelaikoma prie nugaros ir nuslydo žemai.";
      } else {
        note = "Petnešos laiko kuprinę prie nugaros, svorį neša abu pečiai.";
      }

      if (bothSeen) {
        note += " Svoris tas pats, vieta kita.";
        note += guess === "vieta"
          ? " Tu taip ir spėjai."
          : " Tu spėjai, kad niekas nesikeis.";
      } else {
        note += strap === "ilgos"
          ? " Pabandyk ir trumpas petnešas."
          : " Pabandyk ir ilgas petnešas.";
      }

      if (bothSeen && oneSeen) {
        note += " Tu matei abu petnešų ilgius ir vieną petį.";
        if (!reported) {
          reported = true;
          api.progress({ correct: true });
          note += " Pasakyk, kas keičiasi.";
        }
      }

      render();
      api.note(note);
    }

    strapBtns.forEach((b) => {
      b.addEventListener("click", () => {
        strap = b.dataset.strap;
        worn = false;
        render();
        api.note("Dabar spausk „Uždėti“.");
      });
    });

    modeBtns.forEach((b) => {
      b.addEventListener("click", () => {
        mode = b.dataset.mode;
        worn = false;
        render();
        api.note("Dabar spausk „Uždėti“.");
      });
    });

    guessBtns.forEach((b) => {
      b.addEventListener("click", () => {
        guess = b.dataset.guess;
        render();
        api.note(worn ? "Spėjimas pakeistas." : "Spėjimas įrašytas. Dabar spausk „Uždėti“.");
        if (typeof api.speak === "function") {
          api.speak(guess === "vieta" ? SENT.pick || "Pakeisk petnešų ilgį." : SENT.ask || "Kur remsis svoris?", { rate: 0.9 });
        }
      });
    });

    wearBtn.addEventListener("click", wear);

    resetBtn.addEventListener("click", () => {
      strap = "tinkamos";
      mode = "abiem";
      guess = null;
      worn = false;
      render();
      api.readout(SENT.ask || "Kur remsis svoris? Pirma spėk.");
      api.note("Naujas bandymas. Pirma spėk.");
    });

    render();
    api.readout(SENT.ask || "Kur remsis svoris? Pirma spėk.");
    api.note("Pasirink petnešų ilgį ir nešimo būdą. Tada spėk.");

    return () => {};
  },
};

export const SIMS = {
  "metu-laikai": metuLaikai,
  "augalo-gyvenimas": augaloGyvenimas,
  "gyvunu-grupes": gyvunuGrupes,
  "vandens-busenos": vandensBusenos,
  "nuozulnioji-plokstuma": nuozulniojiPlokstuma,
  "kuprine-ir-svoris": kuprineIrSvoris,
};
