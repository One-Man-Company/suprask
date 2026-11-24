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
   kelio aukštis ir lapų stadija. Tai modelis, o ne keturi paruošti
   paveikslėliai: tempiant per metus matyti, kad pokytis laipsniškas,
   o ne „persijungia“ tam tikrą dieną. Dienos trukmė — apytikrė
   Vilniaus platumai (≈55° š. pl.), apvalinta iki 5 min.
   `lapai` — penkios stadijos (0 be lapų … 4 krinta paskutiniai lapai);
   būtent ji, o ne sezono vardas, nustato medžio išvaizdą. */
const MENUO = [
  { n: "Sausis", acc: "sausį", s: "Žiema", dm: 475, alt: 12, lapai: 0, sniegas: true, pauksciai: false,
    note: "Mažai šviesos. Lapuotis ilsisi, o eglė žalia." },
  { n: "Vasaris", acc: "vasarį", s: "Žiema", dm: 575, alt: 20, lapai: 0, sniegas: true, pauksciai: false,
    note: "Diena jau ilgėja, bet žiema dar laikosi. Eglė žalia." },
  { n: "Kovas", acc: "kovą", s: "Pavasaris", dm: 705, alt: 30, lapai: 1, sniegas: false, pauksciai: true,
    note: "Paukščiai grįžta, ant medžio sprogsta pumpurai." },
  { n: "Balandis", acc: "balandį", s: "Pavasaris", dm: 845, alt: 43, lapai: 1, sniegas: false, pauksciai: true,
    note: "Diena sparčiai ilgėja, todėl šilčiau ir žolė žaliuoja." },
  { n: "Gegužė", acc: "gegužę", s: "Pavasaris", dm: 970, alt: 53, lapai: 2, sniegas: false, pauksciai: true,
    note: "Beveik ilgiausia diena. Medis jau su lapais." },
  { n: "Birželis", acc: "birželį", s: "Vasara", dm: 1045, alt: 58, lapai: 2, sniegas: false, pauksciai: true,
    note: "Ilgiausia diena: daugiausia šviesos ir šilumos." },
  { n: "Liepa", acc: "liepą", s: "Vasara", dm: 1005, alt: 55, lapai: 2, sniegas: false, pauksciai: true,
    note: "Diena dar ilga, nors jau pamažu trumpėja." },
  { n: "Rugpjūtis", acc: "rugpjūtį", s: "Vasara", dm: 885, alt: 47, lapai: 2, sniegas: false, pauksciai: true,
    note: "Diena trumpėja. Vaisiai noksta, paukščiai ruošiasi." },
  { n: "Rugsėjis", acc: "rugsėjį", s: "Ruduo", dm: 750, alt: 36, lapai: 3, sniegas: false, pauksciai: false,
    note: "Lapai gelsta. Gandrai skrenda į šiltus kraštus." },
  { n: "Spalis", acc: "spalį", s: "Ruduo", dm: 625, alt: 25, lapai: 4, sniegas: false, pauksciai: false,
    note: "Diena trumpėja greitai. Lapai krinta." },
  { n: "Lapkritis", acc: "lapkritį", s: "Ruduo", dm: 500, alt: 15, lapai: 4, sniegas: false, pauksciai: false,
    note: "Šviesos vis mažiau. Medis beveik be lapų." },
  { n: "Gruodis", acc: "gruodį", s: "Žiema", dm: 435, alt: 11, lapai: 0, sniegas: true, pauksciai: false,
    note: "Trumpiausia diena. Lapuotis ilsisi, eglė žalia." },
];

/* Lapų stadija → art.js medžio variantas ir žodis ekrano skaitytuvui.
   Anksčiau medis buvo kviečiamas su sezono vardu, todėl spalį ir lapkritį
   rodė tą patį pilną vainiką, nors užrašas sako „beveik be lapų“ (LL-13),
   o gegužę — žiedus, nors užrašas sako „jau su lapais“. */
const MEDIS = [
  { art: "ziema", teiginys: "Lapuotis be lapų" },
  { art: "pavasaris", teiginys: "Lapuotyje pumpurai" },
  { art: "vasara", teiginys: "Lapuotis žalias" },
  { art: "ruduo", teiginys: "Lapuotis geltonas" },
  { art: "ruduo-krenta", teiginys: "Lapuotyje krinta paskutiniai lapai" },
];

/* Antrasis medis modeliui reikalingas ne kaip puošmena, o kaip
   prieštaraujantis pavyzdys (LL-28): vienintelis lapuotis žiemą lieka be
   lapų, ir be eglės vaikas iš modelio išmoktų, kad „žiemą visi medžiai
   be lapų“. Eglė yra vienintelis objektas, kuris per metus NESIKEIČIA —
   todėl ji ir parodo, kad pasikeitimas priklauso nuo medžio rūšies, o ne
   nuo metų laiko vieno. Programa 1–2 kl. prašo atpažinti lapuotį ir
   spygliuotį (Pradinio ugdymo BP rekomendacijos 2024, gamtos mokslai). */
const EGLE = { art: "egle", teiginys: "eglė žalia" };

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
        <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:.1rem .5rem;margin:.7rem 0 .3rem">
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
        <p id="ml-pair" style="margin:.6rem 0 0;font-size:1rem;font-weight:800;line-height:1.25;text-align:center">
          Lapuotis keičiasi, eglė žaliuoja visus metus.
        </p>
        <p class="sim-note" style="text-align:center">Tai supaprastintas modelis: tikras oras kasdien būna įvairus.</p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:.4rem;width:100%;max-width:26rem;margin:0 auto">
        <label for="ml-month" style="display:block;text-align:center;font-weight:800;font-size:.95rem;min-width:0">Mėnuo: <span id="ml-mname">Sausis</span></label>
        <input id="ml-month" type="range" min="1" max="12" step="1" value="1"
               aria-label="Pasirink mėnesį"
               style="width:100%;max-width:100%;min-width:0;margin:0;height:48px;accent-color:var(--ink)" />
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;min-width:0">
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
      const medis = MEDIS[d.lapai] || MEDIS[0];
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
        ${snow}
        ${art.tree(58, 209, 1.4, medis.art)}
        ${art.tree(322, 209, 1.05, EGLE.art)}
        <text x="20" y="40" font-family="system-ui" font-size="22" font-weight="800" fill="#3a342b">${d.n}</text>
        <text x="20" y="62" font-family="system-ui" font-size="15" font-weight="600" fill="#5f574d">${d.s}</text>`;

      svg.setAttribute("aria-label",
        `Metų laikų modelis: ${d.n}, ${d.s.toLowerCase()}. ${medis.teiginys}, ${EGLE.teiginys}. Šviesu ${hm(d.dm)}`);

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

      api.readout(`${d.n} — ${d.s.toLowerCase()}. ${medis.teiginys}, ${EGLE.teiginys}. Šviesu ${hm(d.dm)}`);
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
   vaikui spėlioti. Sėkla pabunda be šviesos — jai užtenka vandens ir
   šilumos — o tamsoje daigas ne „sustoja“, o išsitempia ir pabąla
   (etioliacija): taip auga pupa tamsiame stalčiuje, ir būtent tai vaikas
   pamato atlikęs modulio siūlomą bandymą. Išsitempęs daigas neilgai
   išgyvena be šviesos, todėl po kelių tamsių dienų jis vysta — ir tai
   pasakoma žodžiu, o ne tylima. */
const AG_WATER = [0, 0.4, 0.85, 1, 0.15, 0];     // vanduo 0–5 → augimo dalis
const AG_LIGHT = [0, 0.3, 0.7, 1, 1, 1];          // šviesa 0–5 → augimo dalis
const AG_DAYS_MAX = 12;
const AG_STEP = 0.22;                             // gera diena ≈ 22 % dydžio
const AG_WEAK_MAX = 3;                            // tiek dienų be augimo iki nuvytimo
const AG_GERM_MIN = 0.15;                         // mažiau drėgmės — sėkla nepabunda
const AG_ETIOLE = 0.34;                           // kiek per tamsią dieną daigas išsitempia

/* Dygimui šviesa NEREIKALINGA: sėklai užtenka vandens ir šilumos — taip
   sako ir modulio pirmas žingsnis, ir jo siūlomas bandymas su stalčiumi.
   Todėl `germ` skaičiuojamas be šviesos, o `gf` (augimas su lapais) — su ja.
   Anksčiau abu ėjo per `Math.min(wf, lf, hf)`, todėl tamsa sustabdydavo net
   sėklą ir modelis paneigdavo bandymą, kurį pats modulis siūlo (LL-28, #27240). */
const agFactors = (water, light, warm) => {
  const wf = AG_WATER[water];
  const lf = AG_LIGHT[light];
  const hf = warm ? 1 : 0.1;
  return { wf, lf, hf, germ: Math.min(wf, hf), gf: Math.min(wf, lf, hf) };
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

const agStage = ({ size, wilt, cold, pale, stretch, bloomDay, ripe, dead }) => {
  if (size <= 0) return "Sėkla";
  if (dead) return "Augalas nuvytęs";
  if (wilt) return "Augalas vysta";
  if (cold) return "Augalas neauga";
  /* „Išsitempęs“ rodoma tik tol, kol daigas blyškus: grąžinus šviesą jis
     žaliuoja ir vėl vadinamas tuo, kuo yra, o ne tuo, ką patyrė (LL-17).
     Suaugusiam augalui tas pats žodis netinka — jis tamsoje ne „daigas“, o
     blyškus augalas, todėl vardas priklauso ir nuo dydžio (LL-34). */
  if (pale && stretch >= 0.2 && size < 0.55) return "Daigas išsitempęs";
  if (pale) return size < 0.25 ? "Blyškus daigas" : "Augalas blyškus";
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
    let stretch = 0;       // kiek daigas išsitempęs tamsoje (0..1)
    let dayMsg = "";
    let lastStage = "";
    let reported = false;  // api.progress iškviestas vieną kartą (LL-17)

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem">
        <svg id="ag-scene" viewBox="0 0 360 300" role="img" aria-label="Augalo augimo modelis"></svg>
        <p class="sim-note">Tai supaprastintas modelis: dirvožemis čia yra visą laiką, o šaknų nematome.</p>
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
      const dark = light === 0;
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

      const h = size <= 0 ? 0 : 22 + size * 152 + stretch * 52;
      const leafS = (12 + size * 22) * (pale ? 0.6 : 1);
      /* Svyravimas įjungiamas iš karto, kai sąlyga bloga (wilt), o ilgiau
         trūkstant augimo — palaipsniui: kiekviena diena be augimo lapus
         labiau gelsta, todėl ir blogu keliu `Diena →` ką nors pakeičia. */
      const dry = Math.min(1, weak / AG_WEAK_MAX);
      /* Tamsoje daigas tiesiasi stačias, o ne nusvyra: nulinkimas liktų
         tik nuvytusiam augalui, todėl tamsos atvejis jo negauna (LL-18 —
         pasekmė turi atrodyti taip, kaip ji atrodo gyvenime). */
      const droop = wilt || (weak >= 1 && (!dark || dead)) ? 1 : 0;
      const stemCol = agHexMix(cold ? "#6f93a8" : dark ? "#cfcb8d" : pale ? "#8fae78" : "#4c8b3a", "#8d7a55", dry * 0.7);
      const leafCol = agHexMix(water === 0 || dead ? "#b9a06c"
        : water >= 4 ? "#bdb75c"
          : cold ? "#7fa2b5" : dark ? "#deda92" : pale ? "#a8c98a" : "#5fbf62", "#a98f55", dry * 0.6);

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

      /* Tamsa rodoma ir paveikslu, o ne vien žodžiu: kai šviesos nulis,
         saulė nepiešiama, o visa scena uždengiama švelniu šešėliu. Užrašas
         „šviesa nėra“ prie ryškaus dangaus su saule prieštarautų tam, ką
         vaikas mato (LL-34). */
      svg.innerHTML = `
        ${art.defs("ag")}
        <rect x="0" y="0" width="360" height="300" rx="18" fill="url(#ag-sky)"/>
        ${light > 0 ? art.sun(312, 44, sunR, "ag", light / 5) : ""}
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
        ${dark ? `<rect x="0" y="0" width="360" height="300" rx="18" fill="#16233d" opacity=".2"/>` : ""}
      `;

      const st = agStage({ size, wilt, cold, pale, stretch, bloomDay, ripe, dead });

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

      /* Kliūtis — silpniausia grandis. Tvarka fiksuota (šiluma → vanduo →
         šviesa), o ne `Math.min` reikšmė: pataisius vieną sąlygą, žinutė
         pasikeičia. Vanduo tikrinamas prieš šviesą todėl, kad be vandens
         augalas nusvyra jau šiandien, o tamsoje jis bent išsitempia.
         Sėklai šviesa nėra kliūtis: kol ji žemėje, klausiama tik vandens ir
         šilumos — kitaip modelis siūlytų „trūksta šviesos“ ten, kur dygimas
         vyksta be jos (LL-25). */
      const why = () => {
        const wf = AG_WATER[water];
        const lf = AG_LIGHT[light];
        const hf = warm ? 1 : 0.1;
        if (size <= 0) {
          if (water >= 4) return "per daug vandens, sėkla nepabunda";
          if (wf <= AG_GERM_MIN) return "nėra vandens, sėkla nepabunda";
          if (hf < 0.5) return "šalta, sėkla nepabunda";
          return "";
        }
        if (hf < 0.5) return "šalta, augalas beveik neauga";
        if (water >= 4) return "per daug vandens, šaknys nekvėpuoja";
        if (water === 0) return "nėra vandens, lapai nusvyra";
        if (light === 0) return "nėra šviesos";
        if (lf < wf) return "mažai šviesos, auga lėtai";
        return "mažai vandens, auga lėtai";
      };

      const cause = gf >= 0.8 ? "" : why();
      let note;
      if (dead) note = "Šios sąlygos augalui netiko — jis nuvytęs.";
      else if (cause) note = `Ko trūksta: ${cause}.`;
      else if (ripeDone) note = "Vaisius prinoko. Jame yra sėklų — iš jų galėtų išaugti naujas augalas.";
      else if (showFruit) note = "Žiedas virto vaisiumi. Spausk „Diena →“ ir stebėk, kaip jis keičiasi.";
      else if (size >= 1) note = "Augalas išaugo ir pražydo. Dabar pakeisk vieną sąlygą — kas nutiks?";
      else if (size <= 0) note = "Sėkla dar žemėje. Spausk „Diena →“ ir pažiūrėk, ar ji pabus — šviesa tam nereikalinga.";
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
      const { wf, germ, gf } = agFactors(water, light, warm);
      day += 1;

      /* Sėkla pabunda be šviesos: užtenka vandens ir šilumos. Anksčiau ir
         dygimas ėjo per `gf`, todėl tamsiame stalčiuje sėkla likdavo
         nepabudusi nė per 12 dienų — modelis paneigdavo bandymą, kurį
         siūlo pats modulis (LL-28, #27240). */
      if (size <= 0) {
        if (germ > AG_GERM_MIN) {
          size = Math.max(0.1, germ * AG_STEP);
          weak = 0;
          dayMsg = light === 0
            ? "Sėkla pabudo net tamsoje: daigui šviesos nereikia."
            : "Sėkla pabudo: daigas išlindo iš žemės.";
        } else {
          dayMsg = water >= 4
            ? "Šią dieną sėkla liko tokia pati: vandens per daug."
            : wf <= AG_GERM_MIN
              ? "Šią dieną sėkla liko tokia pati: nėra vandens."
              : "Šią dieną sėkla liko tokia pati: per šalta.";
        }
        render();
        return;
      }

      if (gf > 0) {
        size = Math.min(1, size + gf * AG_STEP);
        weak = Math.max(0, weak - 1);       // geros dienos atgaivina palaipsniui
        if (bloomDay > 0 && ripe < 1) {
          ripe = Math.min(1, ripe + agRipeStep(bloomDay));
        }
        dayMsg = gf < 0.5 ? "Šią dieną augalas beveik nepajudėjo." : "";
      /* Tamsa: daigas ne „sustoja“, o tiesiasi ir bąla (etioliacija) — taip
         pupa elgiasi tamsiame stalčiuje. Lapų jis neužaugina, nes neturi
         iš ko maitintis, todėl po kelių tamsių dienų vysta. Kiekviena tamsi
         diena vis tiek ką nors pakeičia matomai: stiebas ilgėja, spalva
         blanksta (LL-04, interaktyvumo principas 1). */
      } else if (light === 0 && wf > 0) {
        /* Tiesiasi tik daigas: suaugęs augalas tamsoje ne „išsitempia“, o
           netenka žalumo ir sustoja — todėl `stretch` ir žodis priklauso
           nuo to, ką vaikas tikrai mato (LL-34). */
        const young = size < 0.55;
        if (young) stretch = Math.min(1, stretch + AG_ETIOLE);
        weak = Math.min(AG_WEAK_MAX, weak + 1);
        dayMsg = weak >= AG_WEAK_MAX
          ? (young ? "Tamsoje daigas išsitempė, bet šviesos taip ir nerado."
            : "Augalas tamsoje ilgai nebelaukė šviesos.")
          : (young ? "Tamsoje daigas išsitempė ir pabalo: jis ieško šviesos."
            : "Tamsoje lapai blyksta, o augalas nebepajuda.");
      } else {
        weak = Math.min(AG_WEAK_MAX, weak + 1);
        dayMsg = weak >= AG_WEAK_MAX
          ? "Augalas nuvyto — jam per ilgai trūko sąlygų."
          : "Šią dieną augalas nepajudėjo. Jam vis sunkiau.";
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
      bloomDay = 0; ripe = 0; weak = 0; stretch = 0; dayMsg = ""; lastStage = "";
      render();
    });


    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 3. Naminiai ir laukiniai gyvūnai — kas duoda maistą                 */
/* ------------------------------------------------------------------ */
/* Modulis (1 kl. 26.2.2 „Kas gyvena tvarte“) moko VIENO kriterijaus:
   grupę pasako tai, kas gyvūnui duoda maistą, o ne vieta, kur jis
   laikosi. Todėl dėžės yra ne „tvartas / laukas“ — tokia schema pačią
   klaidą įtvirtintų — o „Maistą duoda žmogus“ ir „Maistą susiranda
   pats“. Kiekviena grupė turi po klaidinantį atvejį:
     gandras — lizdas ant tvarto stogo, bet laukinis;
     katė — miega kieme, bet naminė;
     lapė — ateina į kiemą, bet laukinė.
   Grupės žodis („naminiai“ / „laukiniai“) pasirodo tik po pirmo
   teisingo priskyrimo: jis išvedamas, o ne duotas iš anksto.
   „Žiema“ yra vienintelis parametras: ji keičia VIETĄ, o grupė lieka
   ta pati — todėl vaikas pamato, kad vieta nėra kriterijus. Iki visų
   priskyrimų mygtukas neįjungtas, bet lieka fokusuojamas ir pasako, ko
   laukia (LL-04, LL-32), o ne tyliai neveikia.
   Visi tekstai — iš `sim.config` (LL-61, LL-103, LL-104): kode nėra nė
   vieno įrašyto gyvūno vardo ar sakinio, kurio vaikas negirdėtų. */
const gyvunuGrupes = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const bins = Array.isArray(config.bins) ? config.bins : [];
    const animalsCfg = Array.isArray(config.animals) ? config.animals : [];

    const knownBin = (id) => bins.some((b) => b.id === id);
    const valid = bins.length === 2
      && bins.every((b) => b && b.id && b.label && b.group && b.emoji)
      && animalsCfg.length >= 3
      && animalsCfg.every((a) => a && a.label && a.emoji && a.place && a.trait
        && a.winter && knownBin(a.bin));

    if (!valid) {
      console.error("gyvunu-grupes: gyvūnas be label/emoji/place/trait/winter/bin arba nežinoma dėžė.");
      stage.innerHTML = '<p class="sim-note" style="text-align:center">Gyvūnai nesuderinti su dėžėmis.</p>';
      controls.innerHTML = "";
      return null;
    }

    const animals = animalsCfg.map((a) => ({ ...a, done: false }));
    const placed = Object.fromEntries(bins.map((b) => [b.id, 0]));
    let selected = null;
    let reported = false;   // api.progress — vieną kartą, įveikus visus (LL-17)
    let winter = false;
    const timers = new Set();
    const binOf = (id) => bins.find((b) => b.id === id);
    const left = () => animals.filter((a) => !a.done).length;
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

    /* `#sim-stage` yra grid su `place-items:center`, todėl vaikas išsitempia
       iki savo min-content, o `min-width:auto` neleidžia jam susitraukti
       (LL-55). Todėl blokas turi `min-width:0` ir lubas nuo TĖVO, o ne tik
       `34rem`: 200 % tekste (32 px šaknis) @360 px dvi fiksuotos dėžių
       kolonos likdavo 112,4 px, o ilgiausias žodis „susiranda“ — 162,4 px,
       tad `<strong>` dešinys kraštas siekė 363 px (dokumentas slinko +3 px).
       `auto-fit` su `min(100%, 9rem)` kolonų skaičių ima iš turimos vietos:
       16 px šaknyje lieka tos pačios dvi kolonos (145,2 / 160,2 / 268 px),
       32 px šaknyje dėžės sustoja viena po kitos. */
    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(34rem,100%);margin:0 auto">
        <div id="gg-tray" role="group" aria-label="Gyvūnai"
             style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;padding:.6rem;border-radius:var(--r-m);background:color-mix(in srgb, var(--mint) 10%, var(--paper))"></div>
        <div id="gg-bins" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr));gap:.5rem;margin-top:.8rem"></div>
        <div id="gg-winter" style="display:none;margin-top:.8rem;padding:.6rem .7rem;border-radius:var(--r-m);background:var(--paper-2);border:2px solid var(--line)"></div>
        <p class="sim-note" id="gg-msg" tabindex="-1"></p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.45rem;width:100%;max-width:34rem;margin:0 auto">
        <button class="btn secondary" id="gg-winter-btn" aria-pressed="false"
                aria-disabled="true" aria-describedby="gg-winter-hint"
                style="min-height:52px;font-size:.95rem">Žiema</button>
        <p id="gg-winter-hint" style="margin:0;font-size:.95rem;line-height:1.35;text-align:center;color:var(--ink-soft)"></p>
        <button class="btn ghost" id="gg-reset" style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    // Pastaba yra už scenos ribų, todėl „Iš naujo“ jos neišvalo — be šios
    // eilutės po perkrovimo liktų sakinys apie žiemą (LL-16).
    api.note("");
    const trayEl = stage.querySelector("#gg-tray");
    const binsEl = stage.querySelector("#gg-bins");
    const winterEl = stage.querySelector("#gg-winter");
    const msg = stage.querySelector("#gg-msg");
    const winterBtn = controls.querySelector("#gg-winter-btn");
    const winterHint = controls.querySelector("#gg-winter-hint");

    /* Kortelė rodo ir vietą („ant tvarto stogo“), ir vardą: vietą vaikas
       turi matyti, kad galėtų ja remtis ir suklysti, o paskui pastebėti,
       kad ji grupės nepasako. Vardas rašomas, ne tik `aria-label`
       (pasiūlymas #42): 6–7 m. vaikui reikia žodžio, kurį jis gali
       pasakyti ir surasti kitame puslapyje. */
    function drawTray() {
      trayEl.innerHTML = "";
      animals.forEach((a) => {
        if (a.done) return;
        const on = selected === a.label;
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `${a.label}. Gyvena ${a.place}. Pasirink.`);
        b.setAttribute("aria-pressed", String(on));
        b.style.cssText = "display:grid;justify-items:center;gap:1px;cursor:pointer;"
          + "background:transparent;border-radius:14px;padding:5px 6px;font:inherit;color:inherit;"
          + `min-width:84px;min-height:88px;border:3px solid ${on ? "var(--ink)" : "transparent"}`;
        b.innerHTML = `<span aria-hidden="true" style="font-size:1.9rem;line-height:1.05">${a.emoji}</span>`
          + `<span style="font-size:.92rem;line-height:1.1;font-weight:800;text-align:center">${a.label}</span>`
          + `<span style="font-size:.95rem;line-height:1.2;text-align:center;color:var(--ink-soft)">${a.place}</span>`;
        b.addEventListener("click", () => {
          selected = a.label;
          drawTray();
          api.readout(`${a.label}. ${S.ask}`);
          api.speak(a.label, { rate: .9 });
          // Klaviatūra nesustoja ties perkurtu sąrašu: sekantis žingsnis — dėžė.
          binsEl.querySelector("button[data-bin]").focus();
        });
        trayEl.appendChild(b);
      });
    }

    /* Dėžės pavadinimas yra klausimas („kas duoda maistą?“), o grupės
       žodis pasirodo tik tada, kai jau yra bent vienas priskyrimas:
       kitaip vaikas žymėtų pagal iš anksto duotą etiketę, ne pagal
       modelį. */
    function paintBins() {
      binsEl.querySelectorAll("button[data-bin]").forEach((bin) => {
        const b = binOf(bin.dataset.bin);
        const n = placed[b.id];
        const g = bin.querySelector(".group");
        g.textContent = n ? b.group : "";
        g.style.display = n ? "block" : "none";
        bin.setAttribute("aria-label", n
          ? `${b.label}. ${b.group}: ${n}.`
          : `${b.label}. Dar nieko neįdėta.`);
      });
    }

    bins.forEach((b) => {
      const bin = document.createElement("button");
      bin.type = "button";
      bin.dataset.bin = b.id;
      bin.style.cssText = "display:grid;justify-items:center;gap:.2rem;min-width:0;"
        + "padding:.55rem .3rem;border:3px dashed var(--line);border-radius:var(--r-m);"
        + "background:var(--paper-2);cursor:pointer;font:inherit;color:inherit;min-height:9.5rem";
      bin.innerHTML =
        `<span aria-hidden="true" style="font-size:1.6rem;line-height:1.1">${b.emoji}</span>`
        + `<strong style="max-width:100%;overflow-wrap:break-word;font-size:.92rem;line-height:1.15;text-align:center;font-family:var(--font-head)">${b.label}</strong>`
        + `<span class="group" style="display:none;max-width:100%;overflow-wrap:break-word;font-size:.95rem;line-height:1.2;font-weight:700;text-align:center;color:var(--ink-soft)"></span>`
        + `<span class="items" aria-hidden="true" style="display:flex;gap:2px;flex-wrap:wrap;justify-content:center;min-height:1.6rem;font-size:1.15rem;line-height:1.1"></span>`;

      const holder = bin.querySelector(".items");
      bin.addEventListener("click", () => {
        if (!selected) {
          msg.textContent = S.pickFirst;
          api.readout(S.pickFirst);
          api.speak(S.pickFirst);
          return;
        }
        const a = animals.find((x) => x.label === selected && !x.done);
        if (!a) return;

        if (a.bin === b.id) {
          a.done = true;
          placed[b.id] += 1;
          const mark = document.createElement("span");
          mark.textContent = a.emoji;
          mark.setAttribute("aria-hidden", "true");
          holder.appendChild(mark);
          selected = null;

          if (left() === 0) {
            // Sėkmės sąlyga — dabartinė būsena (visi priskyrimai), ne
            // prisiminimas, kad kažkas kadaise buvo įdėta (LL-17).
            if (!reported) { reported = true; api.progress({ correct: true }); }
            winterBtn.setAttribute("aria-disabled", "false");
            winterHint.textContent = S.hintLocked;
            api.note(S.rule);
            drawTray();
            paintBins();
            msg.textContent = `${S.done} ${S.rule}`;
            api.readout(`${S.done} ${S.rule}`);
            winterBtn.focus();
            return;
          }

          drawTray();
          paintBins();
          msg.textContent = `${cap(a.label)}: ${a.trait}.`;
          api.readout(`Teisingai. ${a.label} — ${b.group}. Liko ${left()}.`);
          const next = trayEl.querySelector("button");
          if (next) next.focus();
        } else {
          bin.classList.add("wiggle");
          const t = setTimeout(() => { bin.classList.remove("wiggle"); timers.delete(t); }, 450);
          timers.add(t);
          // Užuomina kartoja TAI, KĄ VAIKAS Mato kortelėje (vietą), ir
          // klausia apie kriterijų. Atsakymas neįvardijamas (LL-22).
          msg.textContent = `${cap(a.label)} gyvena ${a.place}. ${S.wrong}`;
          api.readout(`${S.wrongBin} Liko ${left()}.`);
          api.speak(S.wrongBin);
        }
      });
      binsEl.appendChild(bin);
    });

    function paintWinter() {
      winterEl.innerHTML = "";
      if (!winter) { winterEl.style.display = "none"; return; }
      winterEl.style.display = "block";
      // Sąrašas rodo KIEKVIENĄ gyvūną atskirai: viena bendra taisyklė
      // „naminiai lieka“ būtų neteisinga (lapė žiemą ateina arčiau
      // kiemo), o vaikui reikia matyti būtent tą prieštaraujantį atvejį.
      const items = animals.map((a) => `<li style="margin:.15rem 0">`
        + `<span aria-hidden="true">${a.emoji}</span> <strong>${a.label}</strong> — ${a.winter}</li>`).join("");
      winterEl.innerHTML = `<p style="margin:0 0 .35rem;font-size:.95rem;font-weight:800"><span aria-hidden="true">❄</span> ${S.winterTitle}</p>`
        + `<ul style="margin:0;padding-left:1.1rem;font-size:.9rem;line-height:1.35">${items}</ul>`;
    }

    winterBtn.addEventListener("click", () => {
      if (!reported) {
        msg.textContent = S.lock;
        api.readout(S.lock);
        return;
      }
      winter = !winter;
      winterBtn.setAttribute("aria-pressed", String(winter));
      winterBtn.textContent = winter ? "Vasara" : "Žiema";
      paintWinter();
      if (winter) {
        api.readout(S.winter);
        api.speak(S.winter);
        api.note(S.winterNote);
        msg.textContent = S.winterNote;
      } else {
        api.readout(S.summer);
        api.speak(S.summer);
        api.note(S.rule);
        msg.textContent = S.rule;
      }
    });

    controls.querySelector("#gg-reset").addEventListener("click", () => {
      timers.forEach(clearTimeout);
      timers.clear();
      stage.innerHTML = "";
      controls.innerHTML = "";
      gyvunuGrupes.mount({ stage, controls, api, config });
    });

    drawTray();
    paintBins();
    paintWinter();
    winterHint.textContent = S.hintWaiting;
    api.readout(S.start || `Sudėk gyvūnus. Liko ${left()}.`);
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
   Ribos: puodas rodomas perpjautas (kitaip vandens nesimatytų). Pats garas
   nematomas, todėl jis nepiešiamas: baltas debesėlis virš puodo yra
   smulkūs lašai (atvėsęs garas), o ore likęs garas žymimas punktyru, ne
   debesiu. Modelis neturi laikmačio: vienas paspaudimas = kelios minutės.

   Žodžiai ateina iš modulio `sim.config.words`, o ne iš kodo: anksčiau
   konfigūracija buvo negyva (žodžiai kabėjo JSON, o simuliacija juos turėjo
   įrašytus kietai), todėl redaguojant terminiją pasikeisdavo tik garso įrašai,
   o ekrane likdavo seni žodžiai (LL-61).
   Sutartis su turiniu — skaitomi LYGIAI šie keturi raktai:
     water „Vanduo“, ice „Ledas“, steam „Garas“, drops „Lašai“.
   Kiekvienas jų rodomas būsenų kortelėje, `aria-label`, readout ir tariamas
   balsu. Nežinomi raktai ignoruojami (neteisinga konfigūracija nelūžta), o
   naujas raktas ekrane nieko nepakeis, kol neatsiras jo vartotojas kode —
   todėl į `words` nerašomi nei dangčio, nei šilumos žodžiai: jie sakinyje
   linksniuojami („ant dangčio“, „dangtį“, „vėsioje“), ir vienos formos
   keitimas sulaužytų gramatiką.
   Pakeitus žodį reikia paleisti `scripts/generate_audio.py`: be įrašo
   `speech.js:134` tyliai pereina prie naršyklės balso, tad vaikas girdėtų
   kitą balsą nei likusioje platformoje.
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
    let msg = "Pakaitink puodą ir stebėk, kas atsitiks vandeniui.";
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
        <p class="sim-note" style="text-align:center">
          Modelis supaprastintas: puodas rodomas perpjautas, kad matytum vandenį.
          Brūkšneliai rodo ore esantį garą, kurio nematome.
        </p>
      </div>`;

    /* Valdiklių juosta. 200 % tekste (32 px šaknis) mygtukų `flex-basis:8.5rem`
       yra 272 px, o 360 px ekrane juostai lieka 241 px. Tinklelis turėjo
       numanomą (`auto`) takelį, kurio minimumas — vaiko `min-content` (266 px),
       todėl mygtukai ir šilumos slankiklis išsikišdavo 25 px iš kortelės į
       puslapio paraštę (matuota: kortelė 241/270 @360/32, 295/299 @414/32).
       `minmax(0,1fr)` leidžia takeliui susitraukti, o `flex-wrap` juostai
       išdėlioja mygtukus po vieną pilnu pločiu vietoj išsikišimo (pasiūlymo
       #4739 klasė — tas pats `min-width:auto`, kaip augalo sąlygų eilutėse).

       Mygtukų horizontalus paddingas `.btn` yra 1.4rem (44,8 px prie 32 px
       šaknies), todėl „Pakaitink“ (176,7 px teksto) su juo neišsiteko į 241 px.
       Vietoj fiksuoto rem imame `min(1.4rem,9 %)`: 16 px šaknyje tai vis dar
       22,4 px, o 200 % tekste ribą nustato turimas plotis (9 % iš 241 = 21,7 px).
       Vertikalus paddingas neliestas, taikiniai lieka 84–127 px aukščio. */
    controls.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:.6rem;width:100%;max-width:32rem;margin:0 auto">
        <div style="min-width:0">
          <label for="vb-heat" style="display:block;text-align:center;font-weight:800;font-size:.95rem">
            Šiluma: <span id="vb-heat-word">Šilta</span>
          </label>
          <input id="vb-heat" type="range" min="0" max="2" step="1" value="1"
                 aria-label="Šiluma po puodu: vėsu, šilta arba verdantis"
                 style="width:100%;height:48px;margin:0;accent-color:var(--ink)" />
          <div aria-hidden="true" style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--ink-soft);padding:0 .3rem">
            <span>Vėsu</span><span>Šilta</span><span>Verdantis</span>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;min-width:0">
          <button class="btn" id="vb-boil" aria-label="Pakaitink puodą kelias minutes"
                  style="flex:1 1 8.5rem;min-height:48px;padding-inline:min(1.4rem,9%)">Pakaitink</button>
          <button class="btn secondary" id="vb-lid" aria-pressed="false"
                  style="flex:1 1 8.5rem;min-height:48px;padding-inline:min(1.4rem,9%)">Uždėti dangtį</button>
          <button class="btn secondary" id="vb-back" aria-label="Pakreipk dangtį ir grąžink lašus į puodą"
                  style="flex:1 1 8.5rem;min-height:48px;padding-inline:min(1.4rem,9%)">Grąžink lašus</button>
          <button class="btn ghost" id="vb-reset" aria-label="Pradėti bandymą iš naujo"
                  style="flex:0 0 auto;min-height:48px;padding-inline:min(1.4rem,9%)">Iš naujo</button>
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

    /* Balta migla virš puodo — smulkūs lašai, o ne pats garas. Garui kylant
       ir atvėstant jis virsta lašeliais, kuriuos jau matome, o dujinės
       būsenos vandens nematyti. Todėl migla piešiama TIK verdant
       (`heat === 2`) ir be užrašo „garas“.
       Anksčiau baltos srovelės būdavo rodomos jau prie „Šilta“ ir turėjo
       matomą užrašą „garas“ — vaikas skaitė „jo nematome“ ir tuo pačiu metu
       matė baltą debesį su vardu „garas“. Tai įtvirtindavo būtent tą
       nuostatą („garas = baltas debesis“), kurią modulis nori griauti
       (pasiūlymas #27241). Kiekis ir aukštis priklauso nuo šilumos, o ne
       nuo atsitiktinumo — tą patį veiksmą vaikas gali pakartoti ir pamatyti
       tą patį vaizdą. */
    function mist(x, top, h, op) {
      return `<path d="M${x} ${top} q -9 -${h * 0.3} 0 -${h * 0.55} q 9 -${h * 0.28} 0 -${h * 0.55}"`
        + ` stroke="#ffffff" stroke-opacity="${op}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }

    /* Vanduo, kuris išėjo į orą, yra garas — jo nematome. Todėl jo
       nepiešiame kaip debesies ir nevardijame scenoje: punktyras yra žymė
       „vanduo yra čia“, o ne regima forma. Be šios žymės išgaravęs vanduo
       atrodytų dingęs (5–6 m. vaiko nuostata, Bar ir Galili, 1994), o su
       balta srovele — atrodytų matomas, priešingai nei sako tekstas. */
    function vaporMark(x, y, h, op) {
      return `<path d="M${x} ${y} q -7 -${h * 0.34} 0 -${h * 0.52} q 7 -${h * 0.26} 0 -${h * 0.48}"`
        + ` stroke="#6f93a8" stroke-opacity="${op}" stroke-width="2.4" fill="none"`
        + ` stroke-linecap="round" stroke-dasharray="3 6"/>`;
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

      /* Garas yra visur, kur šiltas vanduo liečiasi su oru, bet jo nesimato:
         jo vardą neša kortelė po scena, readout ir balsas. Regima tampa tik
         tai, kas atvėso — migla virš puodo, ir tik verdant. */
      const hasVapor = heat > 0 && level > 0;
      const showMist = hasVapor && heat === 2 && !lid;
      const mistWisps = showMist
        ? mist(168, 140, 62, 0.62) + mist(184, 138, 74, 0.55) + mist(200, 142, 54, 0.42)
        : "";

      /* Vanduo, kuris išėjo į orą: punktyras žymi, kad jis ten yra ir jo
         nematome. Debesėlio nepiešiame — kitaip scena prieštarautų sakiniams
         „vanduo liko ore, tik jo nematome“ (LL-34, pasiūlymas #27241). */
      const showAir = inAir > 0 && !lid;
      const airMarks = showAir
        ? vaporMark(222, 128, 46, 0.7) + vaporMark(240, 118, 36, 0.5)
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
        ${mistWisps}
        ${airMarks}`;

      svg.setAttribute("aria-label",
        `Puodas ant laužo. Vandens lygis ${level} iš ${VB_MAX}. `
        + `${heat === 0 ? "Ugnis nedega" : strong ? "Ugnis stipri" : "Ugnis silpna"}. `
        + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
        + (showMist ? "Virš puodo matosi smulkūs lašai, o pats garas nematomas. " : "")
        + (drops > 0 ? `${words.drops} ant dangčio: ${drops}.` : ""));

      /* Kortelės atitinka tai, kas modelyje yra DABAR, ir skaitomos iš tų
         pačių sąlygų, iš kurių piešiama scena (hasVapor, showAir, lid) —
         kitaip paveikslas ir užrašas galėtų išsiskirti (LL-34). Garas yra
         tada, kai vanduo šiltas arba verda, net jei jo nesimato; migla
         (`showMist`) yra tik regima to garo dalis ir kortelės nekeičia.
         Su dangčiu garo nesimato, bet jis ten yra ir virsta lašais, todėl
         kortelė sako „po dangčiu“. Išgaravus visam vandeniui, „Vanduo“ vėl
         rodo „dar nėra“ (LL-17). */
      const where = {
        water: level > 0 ? "yra puode" : "dar nėra",
        steam: lid
          ? (hasVapor ? "po dangčiu" : "dar nėra")
          : (hasVapor || showAir ? "ore" : "dar nėra"),
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
        /* Čia buvo „Vėsioje vanduo beveik negaruoja.“ — būdvardžio
           vietininkas be daikto, kurį 6–7 m. vaikas gali perskaityti kaip
           vietą. Slankiklio žodis yra „Vėsu“, todėl sakome „Kai vėsu“
           (ta pati klasė kaip #5986: forma, prie kurios vaikas sustoja). */
        msg = "Kai vėsu, vanduo beveik negaruoja. Pastumk šilumą į dešinę.";
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
        : heat === 1
          ? "Šilta: vanduo pradeda garuoti."
          : (lid
            ? "Verdantis: garas kaupiasi po dangčiu."
            : "Verdantis: vanduo virsta garu. Virš puodo matosi smulkūs lašai.");
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
      msg = "Naujas bandymas. Pakaitink puodą ir vėl stebėk vandenį.";
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
/* Vaikui rodomi ir tariami žodžiai ateina iš modulio `sim.config.words`
   (LL-61). Anksčiau komponentas config apskritai neimdavo, o penkis žodžius
   turėjo įrašytus kietai, nors modulio JSON juos skelbė: pakeitus žodį
   turinyje pasikeisdavo tik garso įrašai, o ekranas ir balsas likdavo seni.
   Sutartis su turiniu — skaitomi LYGIAI šie penki raktai:
     light „Lengvesnis pirmas“, heavy „Sunkesnis pirmas“, both „Abu kartu“,
     faster „Greičiau“, slower „Lėčiau“.
   Kiekvienas jų rodomas mygtuke ir tariamas TAS PATS žodis: anksčiau
   mygtukas klausė „Lengvesnis pirmas“, o balsas sakydavo „Lengvas rutulys“ —
   vaikas, paspaudęs spėjimą, išgirsdavo kito dalyko pavadinimą.
   Nežinomi raktai ignoruojami (neteisinga konfigūracija nelūžta). */
const NP_WORDS = {
  light: "Lengvesnis pirmas",
  heavy: "Sunkesnis pirmas",
  both: "Abu kartu",
  faster: "Greičiau",
  slower: "Lėčiau",
};
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
  mount({ stage, controls, api, config }) {
    const words = { ...NP_WORDS };
    const cfgWords = config && typeof config.words === "object" && !Array.isArray(config.words)
      ? config.words : {};
    for (const key of Object.keys(NP_WORDS)) {
      const v = cfgWords[key];
      if (typeof v === "string" && v.trim()) words[key] = v.trim();
    }
    /* Mygtuko užrašas ir balsas yra tas pats žodis, o spėjimo ataskaitoje jis
       pakartojamas žodžio viduryje — todėl didžioji raidė nuleidžiama tik
       pirmai raidei, neliečiant „Abu kartu“ vidurio. */
    const lower1 = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
    const esc = (s) => String(s ?? "").replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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
        <p class="sim-note" style="text-align:center">
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
            ${guessBtn("np-guess-light", esc(words.light))}
            ${guessBtn("np-guess-heavy", esc(words.heavy))}
            ${guessBtn("np-guess-both", esc(words.both))}
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
        const said = lower1(words[guess]);
        msg = `Spėjai: ${said}. Įvyko: abu atriedėjo beveik kartu.`;
        api.speak(words.both, { rate: .9 });
      } else if (level > prevLevel) {
        msg = "Plokštuma aukštesnė: abu rutuliai atriedėjo greičiau.";
        api.speak(words.faster, { rate: .9 });
      } else if (level < prevLevel) {
        msg = "Plokštuma žemesnė: abu rutuliai atriedėjo lėčiau.";
        api.speak(words.slower, { rate: .9 });
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
      api.speak(words[v], { rate: .9 });
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
        <p class="sim-note" style="margin:0;text-align:center">
          Kuprinė ta pati. Svoris nepakito.</p>
        <p class="sim-note" style="margin:.15rem 0 0;text-align:center">
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

/* ------------------------------------------------------------------ */
/* Dūmai (1 klasės pasaulio pažinimas, 26.1.1 „Saugus elgesys“)       */
/* ------------------------------------------------------------------ */
/*
 * Vienas kintamasis — dūmų kiekis. Iš jo išvedamas sluoksnio storis: dūmai
 * kyla, todėl pirmiausia prisipildo lubos, o paskui riba leidžiasi žemyn.
 * Vaikas pasirenka kelią: žemai pro duris arba į spintą.
 *
 * Kodėl spinta, o ne lova: lova atvira iš šono, todėl po ja oras būtų toks
 * pat kaip prie grindų, ir sakinys „po lova dūmai leidžiasi“ būtų neteisingas
 * (LL-18). Spinta uždara, todėl dūmai į ją patenka iš viršaus ir joje tikrai
 * kaupiasi — būtent tai modelis ir rodo. Spintoje tikrai mažiau dūmų nei prie
 * lubų, ir modelis to neslepia: saugumas čia reiškia išėjimą, o ne slėptuvę.
 *
 * Ko modelis nesako: kad pro duris visada saugu. Durys čia atviros ir vėsios.
 * Jei durys karštos, jų nevarstyti — tai suaugusiojo sprendimas (Mokytojui).
 */
const dumaiIrIsejimas = {
  mount({ stage, controls, api, config }) {
    const SENT = (config && config.sentences) || {};

    /* Scenos geometrija. Kambarys — 2,5 m aukščio pjūvis 360×344 tinkle:
       lubos 68, grindys 300, taigi 232 px ≈ 2,5 m, o 1 px ≈ 1 cm. Vaikas
       (41 px × 2,0) išeina ≈ 0,8 m, t. y. tikras pirmokas. */
    const CEIL = 68;
    const FLOOR = 300;
    const WALL_L = 30;
    const WALL_R = 330;
    const DOOR_X = 44;
    const DOOR_W = 72;
    const DOOR_TOP = 190;
    const WAR_X = 236;
    const WAR_W = 82;
    const WAR_TOP = 150;
    const WAR_IN = 162;

    /* Sluoksnio storis nuo lubų (px): 0, 62, 118, 164. Trečiu lygiu riba
       yra 232, taigi prie grindų lieka 68 px — pakanka šliaužiančiam vaikui
       (jo figūra baigiasi ties 246), bet stovinčio galva jau dūmuose
       (212 < 232). */
    const LAYER = [0, 62, 118, 164];
    /* Tas pats spintos viduje. Spinta uždara, tad jos oras keičiasi lėčiau,
       bet dūmai vis tiek leidžiasi: 162 → 188 / 216 / 246. */
    const WAR_LAYER = [0, 26, 54, 84];

    let level = 1;
    let route = null;                 // null | "durys" | "spinta"
    const routesSeen = new Set();
    const levelsSeen = new Set();
    let reported = false;

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <svg id="dm-scene" viewBox="0 0 360 344" width="100%"
             style="display:block;max-width:360px;height:auto;margin:0 auto"
             role="img" aria-label="Kambarys. Dūmų dar nedaug, jie laikosi prie lubų."></svg>
        <p id="dm-way" style="margin:.55rem 0 .1rem;text-align:center;font-weight:800;font-size:1.05rem">
          Kelias lauk: dar nepasirinktas</p>
        <p class="sim-note" style="margin:0;text-align:center">
          Pilka spalva rodo dūmus. Ruda — spinta.</p>
      </div>`;

    const btnStyle = "min-height:48px;flex:1 1 8rem;min-width:0;max-width:100%;padding:.35rem .6rem;font-size:.95rem";

    controls.innerHTML = `
      <div style="display:grid;gap:.7rem;width:100%;max-width:32rem;min-width:0;margin:0 auto">
        <div style="min-width:0">
          <p id="dm-level-label" style="margin:0 0 .3rem;font-weight:800;text-align:center">Kiek dūmų?</p>
          <div id="dm-level" role="group" aria-labelledby="dm-level-label"
               style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;min-width:0">
            <button class="btn secondary" type="button" data-level="0" aria-pressed="false" style="${btnStyle}">Nėra</button>
            <button class="btn secondary" type="button" data-level="1" aria-pressed="true" style="${btnStyle}">Mažai</button>
            <button class="btn secondary" type="button" data-level="2" aria-pressed="false" style="${btnStyle}">Daug</button>
            <button class="btn secondary" type="button" data-level="3" aria-pressed="false" style="${btnStyle}">Labai daug</button>
          </div>
        </div>
        <div style="min-width:0">
          <p id="dm-route-label" style="margin:0 0 .3rem;font-weight:800;text-align:center">Ką darysi?</p>
          <div id="dm-route" role="group" aria-labelledby="dm-route-label"
               style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;min-width:0">
            <button class="btn secondary" type="button" data-route="durys" aria-pressed="false" style="${btnStyle}">Eiti žemai pro duris</button>
            <button class="btn secondary" type="button" data-route="spinta" aria-pressed="false" style="${btnStyle}">Įlįsti į spintą</button>
          </div>
        </div>
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;min-width:0">
          <button class="btn ghost" type="button" id="dm-reset"
                  style="flex:0 1 auto;min-width:0;max-width:100%;min-height:48px">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#dm-scene");
    const wayEl = stage.querySelector("#dm-way");
    const levelBtns = Array.from(controls.querySelectorAll("[data-level]"));
    const routeBtns = Array.from(controls.querySelectorAll("[data-route]"));
    const resetBtn = controls.querySelector("#dm-reset");

    /* --- piešinys ---------------------------------------------------- */

    function roomMarkup() {
      /* Kambarys — pjūvis: siena, cokolis ir lentų grindys. Tai ne peizažas,
         todėl dangaus ir žemės čia nėra; art.js dalys naudojamos dūmams ir
         vaikui, o kambario plokštumos — jo paties, kad mastelis nesikeistų. */
      const boards = [0, 1, 2, 3, 4, 5]
        .map((i) => `<line x1="${WALL_L + 8 + i * 49}" y1="${FLOOR + 1}" x2="${WALL_L + 8 + i * 49}" y2="${FLOOR + 15}"
              stroke="#cbb79b" stroke-width="1.6"/>`).join("");
      return `<rect x="${WALL_L}" y="${CEIL}" width="${WALL_R - WALL_L}" height="${FLOOR - CEIL}" fill="#f7f0e4"/>
        <rect x="${WALL_L}" y="${FLOOR - 10}" width="${WALL_R - WALL_L}" height="10" fill="#e9ddc9"/>
        <rect x="${WALL_L}" y="${FLOOR}" width="${WALL_R - WALL_L}" height="16" fill="#e3d3bb"/>
        ${boards}
        <line x1="${WALL_L}" y1="${CEIL - 2}" x2="${WALL_R}" y2="${CEIL - 2}" stroke="#c8b79d" stroke-width="5" stroke-linecap="round"/>`;
    }

    function doorMarkup() {
      return `<g>
        <rect x="${DOOR_X}" y="${DOOR_TOP}" width="${DOOR_W}" height="${FLOOR - DOOR_TOP}" fill="#dcebf4"/>
        <rect x="${DOOR_X}" y="${DOOR_TOP}" width="${DOOR_W}" height="${FLOOR - DOOR_TOP}"
              fill="none" stroke="#b98f63" stroke-width="4" stroke-linejoin="round"/>
        <line x1="${DOOR_X + 6}" y1="${FLOOR - 3}" x2="${DOOR_X + DOOR_W - 6}" y2="${FLOOR - 3}"
              stroke="#b9d3e2" stroke-width="3"/>
      </g>`;
    }

    function wardrobeMarkup() {
      const ix = WAR_X + 8;
      const iy = WAR_IN;
      const iw = WAR_W - 16;
      const ih = FLOOR - WAR_IN - 4;
      return `<g>
        <rect x="${WAR_X}" y="${WAR_TOP}" width="${WAR_W}" height="${FLOOR - WAR_TOP}" rx="5"
              fill="#c89a6a" stroke="#8d6843" stroke-width="3"/>
        <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#f0e4d0"/>
        ${art.smoke(ix, iy, iw, WAR_LAYER[level], "dm", 0.35 + level * 0.15)}
        <rect x="${WAR_X}" y="${WAR_TOP}" width="8" height="${FLOOR - WAR_TOP}" fill="#b98a5c"/>
        <rect x="${WAR_X + WAR_W - 8}" y="${WAR_TOP}" width="8" height="${FLOOR - WAR_TOP}" fill="#b98a5c"/>
        <rect x="${WAR_X}" y="${WAR_TOP}" width="${WAR_W}" height="8" fill="#b98a5c"/>
        <rect x="${WAR_X + 9}" y="${WAR_TOP - 20}" width="${WAR_W - 18}" height="17" rx="4" fill="#f7f0e4"/>
        <text x="${WAR_X + WAR_W / 2}" y="${WAR_TOP - 7}" text-anchor="middle"
              font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#4a3d2c">spinta</text>
      </g>`;
    }

    /* Durys spintoje uždarytos: brėžiamas tik kontūras, todėl vidus lieka
       matomas (pjūvis), o vaikas mato, kad durų atidaryti negalima. */
    function closedDoorsMarkup() {
      return `<rect x="${WAR_X + 5}" y="${WAR_TOP + 5}" width="${WAR_W - 10}" height="${FLOOR - WAR_TOP - 9}"
              rx="4" fill="none" stroke="#6b5a45" stroke-width="2.5" stroke-dasharray="7 6"/>`;
    }

    function childMarkup() {
      if (route === "spinta") {
        return `<g>${art.kid(WAR_X + WAR_W / 2, FLOOR - 4, 1.9)}</g>`;
      }
      if (route === "durys") {
        /* Pasviręs vaikas: kūnas ištįsęs link durų, galva keliais centimetrais
           virš grindų. Tai ne puošmena — būtent toks aukštis parodo, kad
           galva lieka po dūmų sluoksniu (žr. LAYER). Atramos taškas 286, o ne
           prie grindų, kad pasukta figūra nenusileistų po grindų linija. */
        return `<g transform="rotate(-74 156 286)">${art.kid(156, 286, 2)}</g>`;
      }
      return art.kid(178, FLOOR, 2);
    }

    function routeMarkup() {
      const ink = "#3a4a5a";
      if (route === "durys") {
        /* Kelias brėžiamas PO vaiku (žr. sceneMarkup tvarką), todėl linija
           nekerta kūno. Rodyklė išeina pro duris — užrašo nereikia, nes
           po scena yra eilutė „Kelias lauk: yra“. */
        return `<g>
          <path d="M156 294 H58" fill="none" stroke="${ink}" stroke-width="4"
                stroke-linecap="round" stroke-dasharray="9 7"/>
          <path d="M42 294 L58 285 L58 303 Z" fill="${ink}"/>
        </g>`;
      }
      if (route === "spinta") {
        /* Kelias baigiasi spintos sienele — rodyklės nėra, nes eiti nėra kur. */
        const ix = WAR_X + 8;
        const iw = WAR_W - 16;
        return `<g>
          <path d="M${WAR_X + WAR_W / 2} 292 H${ix + iw - 2}" fill="none" stroke="${ink}"
                stroke-width="4" stroke-linecap="round" stroke-dasharray="9 7"/>
          <path d="M${ix + iw - 2} 284 V300" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
        </g>`;
      }
      return "";
    }

    function sceneMarkup() {
      return `${art.defs("dm")}
        ${roomMarkup()}
        ${doorMarkup()}
        ${art.smoke(WALL_L, CEIL, WALL_R - WALL_L, LAYER[level], "dm", 0.2 + level * 0.22)}
        ${level > 0 ? `<text x="${WALL_L + 10}" y="${CEIL + 22}" font-family="system-ui, sans-serif"
              font-size="14" font-weight="800" fill="#242a31">dūmai</text>` : ""}
        ${wardrobeMarkup()}
        ${route === "spinta" ? closedDoorsMarkup() : ""}
        ${routeMarkup()}
        ${childMarkup()}`;
    }

    function sceneLabel() {
      const t = ["Dūmų nėra.", "Mažai dūmų, jie laikosi prie lubų.",
        "Daug dūmų, sluoksnis nusileido iki kambario vidurio.",
        "Labai daug dūmų, oras liko tik prie grindų."][level];
      if (!route) return `Kambarys. ${t} Vaikas stovi kambaryje.`;
      if (route === "durys") {
        return `Kambarys. ${t} Vaikas šliaužia prie durų pačia apačia, pro duris matosi laukas.`;
      }
      return `Kambarys. ${t} Vaikas įlindęs į spintą, spintos durys uždarytos.`;
    }

    function verdictText() {
      if (!route) return "Kelias lauk: dar nepasirinktas";
      return route === "durys" ? "Kelias lauk: yra" : "Kelias lauk: nėra";
    }

    function paintToggles() {
      for (const b of levelBtns) {
        const on = Number(b.dataset.level) === level;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
        b.style.background = on ? "var(--sun-soft, #fff3cf)" : "";
      }
      for (const b of routeBtns) {
        const on = b.dataset.route === route;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
        b.style.background = on ? "var(--sun-soft, #fff3cf)" : "";
      }
    }

    function render() {
      svg.innerHTML = sceneMarkup();
      svg.setAttribute("aria-label", sceneLabel());
      wayEl.textContent = verdictText();
      paintToggles();
    }

    /* --- veiksmas ---------------------------------------------------- */

    function levelSentence() {
      return [SENT.none, SENT.few, SENT.mid, SENT.lots][level]
        || "Dūmų kiekis pasikeitė.";
    }

    function noteFor() {
      if (!route) return "Pasirink dūmų kiekį ir kelią.";
      if (route === "durys") {
        if (level === 0) return "Dūmų nėra, bet kelias per duris visada veda lauk.";
        if (level === 1) return "Dūmai dar virš tavo galvos. Eini prie durų ir lauk.";
        return "Dūmai nusileido žemai. Eini pačia apačia, po jais.";
      }
      if (level === 0) return "Spintoje dar švaru, bet durys į lauką liko už nugaros.";
      if (level === 1) return "Spintoje mažiau dūmų nei kambaryje. Bet iš ten neišeisi.";
      return "Dūmai į spintą patenka iš viršaus ir leidžiasi prie tavęs.";
    }

    function maybeReport() {
      if (reported) return false;
      if (routesSeen.size < 2 || levelsSeen.size < 2) return false;
      reported = true;
      api.progress({ correct: true });
      return true;
    }

    /* Pažanga žymima tik pamačius abu kelius IR bent du dūmų kiekius — kitaip
       vaikas „baigtų“ nematęs, kad sluoksnis leidžiasi (LL-29 atvirkštinė
       pusė). Kad sąlyga nebūtų paslėpta, vaikui pasakoma, ko dar trūksta:
       be šios eilutės abu kelius išbandęs vaikas negauna jokio signalo, kad
       dar kažko laukiama. */
    function hintIfMoreNeeded() {
      if (reported) return "";
      if (routesSeen.size === 2 && levelsSeen.size < 2) {
        return " Padidink dūmus ir pažiūrėk dar kartą.";
      }
      return "";
    }

    function chooseRoute(next) {
      route = next;
      routesSeen.add(next);
      levelsSeen.add(level);
      const sentence = next === "durys"
        ? (SENT.door || "Ėjai žemai pro duris ir išėjai į lauką.")
        : (SENT.closet || "Įlindai į spintą. Iš ten į lauką neišeisi.");
      api.readout(sentence);
      if (typeof api.speak === "function") api.speak(sentence, { rate: 0.95 });
      render();
      let note = noteFor();
      if (maybeReport()) note += " " + (SENT.done || "Dabar pasakyk, kodėl.");
      else note += hintIfMoreNeeded();
      api.note(note);
    }

    function setLevel(next) {
      level = next;
      if (route) levelsSeen.add(next);
      render();
      const sentence = levelSentence();
      api.readout(sentence);
      if (typeof api.speak === "function") api.speak(sentence, { rate: 0.95 });
      let note = noteFor();
      if (maybeReport()) note += " " + (SENT.done || "Dabar pasakyk, kodėl.");
      else note += hintIfMoreNeeded();
      api.note(note);
    }

    levelBtns.forEach((b) => b.addEventListener("click", () => setLevel(Number(b.dataset.level))));
    routeBtns.forEach((b) => b.addEventListener("click", () => chooseRoute(b.dataset.route)));

    resetBtn.addEventListener("click", () => {
      level = 1;
      route = null;
      render();
      api.readout(SENT.ask || "Kambaryje dūmai. Ką darysi?");
      api.note("Naujas bandymas. Pasirink kelią.");
    });

    render();
    api.readout(SENT.ask || "Kambaryje dūmai. Ką darysi?");
    api.note("Padidink dūmus ir pažiūrėk, iki kur jie nusileidžia.");

    return () => {};
  },
};

/* ------------------------------------------------------------------ */
/* 8. Kas gyvas — pokytis, o ne judėjimas                              */
/* ------------------------------------------------------------------ */
/* Vienas kintamasis — vanduo. „Savaitė“ yra paspaudimas, ne laukimas,
   todėl nėra `setInterval` ir nėra laiko limito. Kamuoliukas scenoje yra
   kontrolinis objektas: `pushBall()` keičia TIK jo `cx`, o lentelėje jo
   skaičius lieka 0, nes `changeOf()` jam grąžina 0 — tai užtikrina kodas,
   o ne teksto pažadas (LL-28: be prieštaraujančio pavyzdžio modelis tik
   patvirtintų klaidingą nuostatą „gyva tai, kas juda“).

   Skaičius lentelėje yra KIEK KARTŲ daiktas pasikeitė, o ne aukščio suma.
   Suma dviejų priešingų savaičių kelyje visada grąžindavo 0, tad lentelė
   sakydavo „nepakito“ būtent tame kadre, kuriame paveikslas keitėsi, o
   `api.progress()` įsirašydavo su trimis nuliais (LL-95). Dabar skaičiai,
   sakinys ir `api.progress()` imami iš to paties `weeks` masyvo: 0 reiškia
   „nepakito nė karto“ ir daugiau nieko. */
const KG_PAD = 8;                 // viena padala scenoje = 8 px
const KG_STEM_BASE = 40;          // pradinis stiebo aukštis
const KG_BALL_REST = 246;
const KG_BALL_MOVED = 282;
const KG_MAX_WEEKS = 3;           // dvi savaitės + trečia, kai abi buvo vienodos

const kasGyvas = {
  mount({ stage, controls, api, config = {} }) {
    const objects = Array.isArray(config.objects) && config.objects.length
      ? config.objects
      : [
        { id: "augalas", name: "pupos daigas" },
        { id: "akmenukas", name: "akmenukas" },
        { id: "kamuoliukas", name: "kamuoliukas" },
      ];
    const S = config.sentences || {};
    const growthPx = Number(config.growthPx) > 0 ? Number(config.growthPx) : KG_PAD;
    const step = growthPx / KG_PAD;          // padalos per savaitę

    /* Stiebas auga pikseliais, o `step` (padalos per savaitę) lieka lapų
       dydžiui. Jei `growthPx` iš padalos nesidalija, lapo dydis apvalinamas —
       apie tai sakoma garsiai, o ne tylima. */
    if (!Number.isInteger(step)) {
      console.error(`kas-gyvas: growthPx=${growthPx} nesidalija iš ${KG_PAD} — lapų dydis apvalinamas.`);
    }

    const nameOf = (id) => (objects.find((o) => o.id === id) || {}).name || id;
    const guessIds = (Array.isArray(config.guess) && config.guess.length
      ? config.guess : objects.map((o) => o.id))
      .filter((id) => objects.some((o) => o.id === id));

    let guess = null;
    let watered = true;
    let weeks = [];          // true — laistyta, false — sausa
    let ballMoved = false;
    let flash = "";          // trumpas paaiškinimas po veiksmo
    let spoken = "";
    let reported = false;    // api.progress — vieną kartą (LL-17)

    stage.innerHTML = `
      <div style="width:100%;max-width:26rem;margin:0 auto">
        <svg id="kg-scene" viewBox="0 0 328 188" width="100%" role="img"
             aria-label="Lentynoje pupos daigas, akmenukas ir kamuoliukas"></svg>
        <p class="sim-note" style="text-align:center">Modelis rodo savaitės pokytį. Kvėpavimo jame nematyti.</p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.5rem;width:100%;max-width:34rem;margin:0 auto">
        <p style="margin:0;font-size:.95rem;font-weight:800;text-align:center">Kas pasikeis per savaitę?</p>
        <div id="kg-guess" role="group" aria-label="Spėjimas"
             style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem">
          ${guessIds.map((id) => `<button class="btn secondary" data-guess="${id}" aria-pressed="false"
             style="min-width:0;min-height:56px;padding:.35rem .2rem;font-size:.9rem;line-height:1.15">${nameOf(id)}</button>`).join("")}
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem">
          <button class="btn secondary" id="kg-wet" aria-pressed="true"
                  style="min-width:0;min-height:56px;padding:.3rem .2rem;font-size:.95rem">Palaistyk</button>
          <button class="btn secondary" id="kg-dry" aria-pressed="false"
                  style="min-width:0;min-height:56px;padding:.3rem .2rem;font-size:.95rem">Nelaistyk</button>
        </div>
        <button class="btn" id="kg-week" style="min-height:56px;font-size:.95rem">Po savaitės</button>
        <button class="btn secondary" id="kg-push" style="min-height:56px;font-size:.95rem">Pastumk kamuoliuką</button>
        <div id="kg-table" style="display:none;grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem"></div>
        <p id="kg-end" role="status" aria-live="polite"
           style="min-width:0;margin:0;font-size:.9rem;line-height:1.35;font-weight:700;text-align:center"></p>
        <button class="btn ghost" id="kg-reset" style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    const svg = stage.querySelector("#kg-scene");
    const q = (sel) => controls.querySelector(sel);
    const guessButtons = [...controls.querySelectorAll("[data-guess]")];

    /* Vienas šaltinis visiems trims dalykams — lentelės skaičiui, sakiniui ir
       scenai: kiek kartų kiekvienas daiktas matomai pakito. Laistyta savaitė
       augalą paaugina — kiekviena atskirai, todėl skaičiuojama kiekviena.
       Sausa savaitė nuleidžia lapus, bet tik pirmoji sauso tarpsnio savaitė:
       antra sausa savaitė jau nuleistų lapų nebekeicia, tad ir
       nepriskaičiuojama (kitaip skaičius teigtų pokytį, kurio paveiksle
       nebuvo). Akmenukas ir kamuoliukas nepakinta nė karto, net kai
       kamuoliukas nurieda: judėjimas nėra pokytis šiame modelyje. */
    const wetWeeks = () => weeks.filter(Boolean).length;
    const dryBlocks = () => {
      let n = 0;
      weeks.forEach((wet, i) => { if (!wet && (i === 0 || weeks[i - 1])) n += 1; });
      return n;
    };
    const changeOf = (id) => (id === "augalas" ? wetWeeks() + dryBlocks() : 0);
    const kartai = (n) => `${n} ${n === 1 ? "kartą" : "kartus"}`;
    const changeLine = () => objects.map((o) => (changeOf(o.id)
      ? `${o.name} keitėsi ${kartai(changeOf(o.id))}`
      : `${o.name} nepakito`)).join(", ");
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    const anyChange = () => objects.some((o) => changeOf(o.id) > 0);
    const contrast = () => weeks.some((w, i) => weeks.slice(i + 1).some((x) => x !== w));

    const paint = (btn, on) => {
      btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
      btn.style.color = on ? "var(--paper)" : "var(--ink)";
      btn.style.borderColor = on ? "var(--ink)" : "var(--line)";
    };

    function scene() {
      const grown = wetWeeks();
      const h = Math.max(24, Math.min(84, KG_STEM_BASE + grown * growthPx));
      const dry = weeks.length > 0 && weeks[weeks.length - 1] === false;
      const leafS = Math.max(8, Math.min(13, 10 + grown * step));
      const ballX = ballMoved ? KG_BALL_MOVED : KG_BALL_REST;
      const stemCol = dry ? "#8d7a55" : "#4c8b3a";
      const leafCol = dry ? "#a98f55" : "#5fbf62";
      const label = (x, lines) => `<text x="${x}" y="${lines.length > 1 ? 166 : 172}" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#3a342b"
        >${lines.map((l, i) => `<tspan x="${x}" dy="${i ? 15 : 0}">${l}</tspan>`).join("")}</text>`;

      svg.innerHTML = `
        ${art.plank(16, 150, 296, 10)}
        ${art.pot(38, 112, 34, 28)}
        ${art.stem(55, 114, h, 4, stemCol, dry)}
        ${art.leaf(55, 114 - h * 0.52, leafS, -1, dry, leafCol)}
        ${art.leaf(55, 114 - h * 0.34, leafS, 1, dry, leafCol)}
        ${art.ball(150, 127, 13, "#b3aea4", "#6f6a61")}
        ${art.ball(ballX, 114, 26, "#f2cf94", "#a9793f")}
        ${label(55, ["pupos", "daigas"])}${label(150, ["akmenukas"])}${label(262, ["kamuoliukas"])}`;

      svg.setAttribute("aria-label",
        `Lentynoje pupos daigas, akmenukas ir kamuoliukas. `
        + `${dry ? "Augalo lapai nuleisti." : "Augalas su lapais."}`
        + (weeks.length
          ? ` Po ${weeks.length === 1 ? "vienos savaitės" : weeks.length === 2 ? "dviejų savaičių" : "trijų savaičių"}`
            + ` ${changeLine()}.`
          : ""));
    }

    function render() {
      scene();

      const ended = weeks.length >= KG_MAX_WEEKS;

      for (const btn of guessButtons) {
        const on = btn.dataset.guess === guess;
        paint(btn, on);
        btn.setAttribute("aria-pressed", String(on));
        btn.disabled = weeks.length > 0;
        btn.setAttribute("aria-label", weeks.length > 0
          ? `Spėjimas užrašytas: ${nameOf(btn.dataset.guess)}. Spausk „Iš naujo“, jei nori pradėti iš naujo.`
          : `Spėju: ${nameOf(btn.dataset.guess)}`);
      }

      const wetBtn = q("#kg-wet");
      const dryBtn = q("#kg-dry");
      for (const [btn, on] of [[wetBtn, watered], [dryBtn, !watered]]) {
        paint(btn, on);
        btn.setAttribute("aria-pressed", String(on));
        btn.disabled = ended;
        btn.setAttribute("aria-label", ended
          ? "Vandens keisti nebegalima: modelis baigėsi. Paspausk „Iš naujo“."
          : `${btn === wetBtn ? "Laistyti" : "Nelaistyti"} šią savaitę`);
      }

      const weekBtn = q("#kg-week");
      const hadWeekFocus = document.activeElement === weekBtn;
      weekBtn.disabled = ended || !guess;
      weekBtn.setAttribute("aria-label", ended
        ? "Modelis baigėsi. Paspausk „Iš naujo“."
        : !guess ? "Pirma pasirink spėjimą, tada spausk „Po savaitės“."
          : "Po savaitės");

      /* Išjungtas valdiklis, ant kurio stovėjo fokusas, naršyklės metamas į
         `body` — klaviatūros naudotojas nebeturi kur eiti (LL-32). Todėl
         fokusas perkeliamas į vienintelį likusį veiksmą. */
      if (weeks.length > 0 && guessButtons.includes(document.activeElement)) {
        (weekBtn.disabled ? q("#kg-reset") : weekBtn).focus();
      }
      if (ended && (hadWeekFocus || document.activeElement === wetBtn
        || document.activeElement === dryBtn)) {
        q("#kg-reset").focus();
      }

      const table = q("#kg-table");
      if (weeks.length) {
        table.style.display = "grid";
        table.innerHTML = `<p style="grid-column:1/-1;margin:0;font-size:.8rem;line-height:1.2;
          font-weight:700;text-align:center;color:var(--ink-soft)">Kiek kartų keitėsi?</p>`
          + objects.map((o) => `<div style="min-width:0;border:2px solid var(--line);
          border-radius:var(--r-s);background:var(--paper-2);padding:.25rem .2rem;text-align:center">
          <span style="display:block;font-size:.875rem;line-height:1.15;font-weight:700;color:var(--ink-soft);overflow-wrap:anywhere">${o.name}</span>
          <strong style="display:block;font-size:1.15rem;line-height:1.25">${changeOf(o.id)}</strong>
        </div>`).join("");
      } else {
        table.style.display = "none";
        table.innerHTML = "";
      }

      let end = "";
      if (!guess) end = "Pirma spėk, tada spausk „Po savaitės“.";
      else if (!weeks.length) end = "Spėjimas užrašytas. Pasirink vandenį ir spausk „Po savaitės“.";
      else if (weeks.length === 1) end = "Viena savaitė. Ar kas nors pasikeitė?";
      else if (contrast()) end = `${weeks.length === 2 ? "Dvi savaitės" : "Trys savaitės"}. Palygink tris skaičius.`;
      else if (!ended) end = "Savaitės buvo vienodos. Pabandyk dar vieną kitaip.";
      else end = "Modelis baigėsi. Paspausk „Iš naujo“.";
      q("#kg-end").textContent = end;

      const weekWord = weeks.length === 1 ? "Viena savaitė"
        : weeks.length === 2 ? "Dvi savaitės" : "Trys savaitės";
      api.readout(weeks.length
        ? `${weekWord}. ${cap(changeLine())}.`
        : (guess ? `Tu sakei: ${nameOf(guess)}. Dabar pasirink vandenį.`
          : "Kuris daiktas per savaitę pasikeis? Spėk."));

      /* Sakinys imamas iš tų pačių skaičių, kuriuos vaikas mato lentelėje:
         jei lentelėje visi 0, apie pokytį nekalbama (LL-95). */
      const changed = anyChange();
      let note;
      if (!guess) note = "Pirma spėk, tada laistyk.";
      else if (flash) note = flash;
      else if (!weeks.length) note = "Pasirink, ar šią savaitę laistysi.";
      else if (weeks.length === 1) {
        note = guess === "augalas"
          ? "Tu sakei augalas. Taip ir įvyko."
          : "Tu sakei kitaip. Pasikeitė augalas.";
      } else if (contrast() && changed) {
        note = `${S.table || "Trys daiktai, vienas pasikeitė."} ${S.done || "Gyvas organizmas keičiasi pats."}`;
      } else if (contrast()) {
        note = "Lentelėje nuliai, nors augalas keitėsi. Sakyk mokytojui: skaičiai nesutampa su paveikslu.";
        console.error("kas-gyvas: savaitės skyrėsi, bet visi lentelės skaičiai 0 — LL-95 defektas grįžo.");
      } else if (!ended) note = "Savaitės buvo vienodos. Pakeisk vandenį ir pamatysi kitą kryptį.";
      else note = "Kamuoliukas juda, bet jo skaičius 0. Paspausk „Iš naujo“ ir pabandyk kitą vandenį.";
      api.note(note);

      const speechKey = weeks.length ? `w${weeks.length}-${weeks[weeks.length - 1] ? "wet" : "dry"}` : "";
      if (!reported && weeks.length >= 2 && contrast() && changed) {
        reported = true;
        spoken = speechKey;
        api.progress({ correct: true });
        if (S.done) api.speak(S.done, { rate: 0.9 });
      } else if (speechKey && speechKey !== spoken) {
        spoken = speechKey;
        const line = weeks[weeks.length - 1] ? S.grew : S.dry;
        if (line) api.speak(line, { rate: 0.9 });
      }
    }

    function pushBall() {
      ballMoved = !ballMoved;
      flash = ballMoved ? (S.pushNote || "") : "";
      if (ballMoved && S.push) api.speak(S.push, { rate: 0.9 });
      render();
    }

    function nextWeek() {
      if (!guess || weeks.length >= KG_MAX_WEEKS) return;
      weeks.push(watered);
      flash = "";
      render();
    }

    function chooseGuess(id) {
      if (weeks.length) return;
      guess = id;
      flash = "";
      if (S.guess) api.speak(S.guess, { rate: 0.9 });
      render();
      /* Spėjimas įrašytas — kitas privalomas žingsnis yra savaitė, todėl
         fokusas keliamas ten (metodo M-08 reikalavimas). Pasirinkimą vis
         dar galima pakeisti pele arba Shift+Tab. */
      if (!q("#kg-week").disabled) q("#kg-week").focus();
    }

    function setWater(value) {
      if (weeks.length >= KG_MAX_WEEKS) return;
      watered = value;
      flash = "";
      render();
    }

    function reset() {
      guess = null;
      watered = true;
      weeks = [];
      ballMoved = false;
      flash = "";
      spoken = "";
      if (S.again) api.speak(S.again, { rate: 0.9 });
      render();
    }

    for (const btn of guessButtons) btn.addEventListener("click", () => chooseGuess(btn.dataset.guess));
    q("#kg-wet").addEventListener("click", () => setWater(true));
    q("#kg-dry").addEventListener("click", () => setWater(false));
    q("#kg-week").addEventListener("click", nextWeek);
    q("#kg-push").addEventListener("click", pushBall);
    q("#kg-reset").addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = guessButtons.indexOf(document.activeElement);
      if (idx >= 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        const to = (idx + (e.key === "ArrowRight" ? 1 : guessButtons.length - 1)) % guessButtons.length;
        guessButtons[to].focus();
        return;
      }
      if (e.key === "w" || e.key === "W") { e.preventDefault(); setWater(!watered); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); }
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 9. Daikto grandinė — „Kas sukūrė šį daiktą?“                        */
/* ------------------------------------------------------------------ */
/* Grandinė statoma ATGAL: nuo daikto (dešinėje) link gamtos (kairėje).  */
/* Vienas kintamasis — šaltinio kortelė dabartiniame žingsnyje.         */
/* Netinkama kortelė lieka matoma su brūkšniuotu rėmeliu ir trūkusia    */
/* rodykle, o paaiškinimas remiasi SAVYBE (smėlis birus, popierius       */
/* lankstosi), ne autoritetu. Grandinė yra konfigūracija: trūkstamas    */
/* paaiškinimas ar klausimas parodomas žodžiais, o ne tyliai pakeičiamas */
/* bendru sakiniu (LL-33).                                              */
const DG_ICON = (kind) => `<svg viewBox="0 0 40 40" width="100%" height="100%"
  aria-hidden="true" focusable="false">${art.pictogram(kind, 0, 0, 1)}</svg>`;

const DG_ARROW = (ok, broken) => `<svg viewBox="0 0 16 12" width="16" height="12" aria-hidden="true"
  focusable="false"><line x1="1" y1="6" x2="${broken ? "8" : "12"}" y2="6" stroke="currentColor"
  stroke-width="2.4" stroke-linecap="round" ${ok || broken ? "" : 'stroke-dasharray="2 3"'}
  /><polygon points="13,6 8,2.6 8,9.4" fill="currentColor" opacity="${broken ? ".35" : "1"}"/></svg>`;

const daiktoGrandine = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const C = config.cards || {};
    const objects = (Array.isArray(config.objects) ? config.objects : []).filter(Boolean);
    const cardOk = (id) => !!C[id] && typeof C[id].name === "string";
    const nameOf = (id) => (cardOk(id) ? C[id].name : id);
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai. Jei konfigūracija nesuderinta, sakoma
       žodžiais, o ne tyliai rodomas bendras sakinys (LL-33). --- */
    const problems = [];
    if (!objects.length) problems.push("nėra nė vieno daikto");
    for (const o of objects) {
      const steps = Array.isArray(o.steps) ? o.steps : [];
      if (!cardOk(o.id)) problems.push(`daikto „${o.id}“ kortelė neaprašyta`);
      if (!steps.length) problems.push(`${o.id}: nėra žingsnių`);
      if (!o.predict || !Array.isArray(o.predict.options) || !o.predict.options.length) {
        problems.push(`${o.id}: nėra spėjimo`);
      } else {
        if (!o.predict.say || !S[o.predict.say]) problems.push(`${o.id}: spėjimo klausimo teksto nėra`);
        for (const p of o.predict.options) {
          if (!p || !p.label) problems.push(`${o.id}: spėjimo variantas be užrašo`);
          else if (!p.say || !S[p.say]) problems.push(`${o.id}: spėjimo varianto „${p.label}“ palyginimo nėra`);
        }
      }
      steps.forEach((st, i) => {
        const n = i + 1;
        if (!st || !cardOk(st.card)) problems.push(`${o.id} ${n} žingsnis: kortelė „${st && st.card}“ neaprašyta`);
        if (!Array.isArray(st.options) || !st.options.includes(st.card)) {
          problems.push(`${o.id} ${n} žingsnis: teisinga kortelė turi būti tarp variantų`);
        }
        for (const opt of (st.options || [])) {
          if (opt !== st.card && !(st.no && typeof st.no[opt] === "string" && st.no[opt].trim())) {
            problems.push(`${o.id} ${n} žingsnis: „${opt}“ neturi savo paaiškinimo`);
          }
        }
        if (!st.ask || !S[st.ask]) problems.push(`${o.id} ${n} žingsnis: klausimo teksto nėra`);
        if (i === steps.length - 1 && (!st.end || !S[st.end])) {
          problems.push(`${o.id}: paskutinis žingsnis neturi pabaigos sakinio`);
        }
      });
      const replay = Array.isArray(o.replay) ? o.replay : [];
      if (replay.length !== steps.length + 1) {
        problems.push(`${o.id}: peržiūros eilučių skaičius nesutampa su grandinės kortelėmis`);
      }
      replay.forEach((k) => { if (!S[k]) problems.push(`${o.id}: peržiūros sakinio „${k}“ nėra`); });
    }
    if (problems.length) {
      console.error(`daikto-grandine: ${problems.join("; ")}`);
      stage.innerHTML = `<p class="error-box">Grandinė nesuderinta su kortelėmis.</p>`;
      controls.innerHTML = "";
      return null;
    }

    const state = {
      oi: 0,
      picks: {},        // daikto id → { žingsnio nr.: { card, ok } }
      pred: {},         // daikto id → spėjimo varianto id
      msg: null,        // paskutinio veiksmo tekstai: { readout, note }
      replayI: -1,
      reported: false,
    };
    const finished = new Set();

    const cur = () => objects[state.oi];
    const picksOf = (id) => (state.picks[id] || (state.picks[id] = {}));
    const stepNow = () => {
      const p = picksOf(cur().id);
      let k = 0;
      while (p[k] && p[k].ok) k += 1;
      return k;
    };
    const chainDone = () => stepNow() >= cur().steps.length;
    const predOf = () => cur().predict.options.find((p) => p.id === state.pred[cur().id]) || null;

    /* Kortelės iš kairės į dešinę: paskutinis žingsnis (gamta) … daiktas. */
    const nodes = () => {
      const steps = cur().steps;
      const arr = steps.map((st, i) => ({ card: st.card, step: i })).reverse();
      arr.push({ card: cur().id, step: null });
      return arr;
    };

    stage.innerHTML = `
      <div style="width:100%;max-width:26rem;margin:0 auto">
        <p id="dg-guess" style="margin:0 0 .45rem;min-height:1.2rem;font-size:.85rem;line-height:1.2;
           font-weight:800;text-align:center;color:var(--ink-soft)"></p>
        <div id="dg-chain" role="group" aria-label="Daikto grandinė" style="display:grid;gap:.3rem;align-items:stretch"></div>
        <div id="dg-summary" style="display:none;margin-top:.7rem"></div>
        <p style="margin:.7rem 0 0;font-size:.78rem;line-height:1.3;text-align:center;color:var(--ink-soft)">
          Grandinė rodo tik medžiagos kelią: transportas ir pakuotė joje nevaizduojami.
        </p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.5rem;width:100%;max-width:34rem;margin:0 auto">
        <p id="dg-ask" style="margin:0;font-size:.95rem;line-height:1.25;font-weight:800;text-align:center"></p>
        <div id="dg-predict" role="group" aria-label="Spėjimas" style="display:grid;gap:.35rem"></div>
        <div id="dg-sources" role="group" aria-label="Šaltinio kortelės" style="display:grid;gap:.35rem"></div>
        <button type="button" class="btn secondary" id="dg-replay"
                style="min-height:52px;font-size:.95rem">Peržiūrėk kelią</button>
        <button type="button" class="btn secondary" id="dg-next"
                style="min-height:52px;font-size:.95rem">Kitas daiktas</button>
        <button type="button" class="btn ghost" id="dg-reset"
                style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    const q = (sel) => controls.querySelector(sel);
    const chain = stage.querySelector("#dg-chain");
    const summary = stage.querySelector("#dg-summary");

    const cardHtml = ({ cardId = null, bad = false, isObject = false, isActive = false, isNature = false }) => {
      const kind = cardId ? (C[cardId].icon || cardId) : null;
      const icon = kind
        ? DG_ICON(kind)
        : `<span style="font-size:1.5rem;line-height:1;font-weight:800;color:var(--ink-faint)">?</span>`;
      const label = cardId ? esc(nameOf(cardId)) : "?";
      const badge = isNature ? "GAMTA" : bad ? "netinka" : "";
      const border = bad ? "2px dashed var(--ink-faint)"
        : isActive ? "2px solid var(--ink)" : "2px solid var(--line)";
      const aria = cardId
        ? `${nameOf(cardId)}${isNature ? ", gamta" : ""}${bad ? ", netinka" : ""}`
        : "tuščias langelis";
      return `<div role="img" aria-label="${esc(aria)}" style="display:grid;justify-items:center;align-content:space-between;
        gap:.15rem;padding:.3rem .15rem;min-height:104px;border:${border};
        border-radius:var(--r-s);background:${isObject ? "var(--paper-2)" : "var(--paper)"}">
        <span style="min-height:.8rem;font-size:.68rem;line-height:1;letter-spacing:.05em;font-weight:800;
          color:var(--ink-soft)">${badge || "&nbsp;"}</span>
        <span style="display:block;width:52px;height:52px">${icon}</span>
        <strong style="font-size:.78rem;line-height:1.05;text-align:center;overflow-wrap:anywhere">${label}</strong>
      </div>`;
    };

    function chainHtml() {
      const ns = nodes();
      const p = picksOf(cur().id);
      const step = stepNow();
      const parts = [];
      ns.forEach((n, i) => {
        if (i) {
          const prev = ns[i - 1];
          const pick = prev.step == null ? null : p[prev.step];
          const broken = !!(pick && !pick.ok);
          const ok = !!(pick && pick.ok);
          parts.push(`<div style="display:flex;align-items:center;justify-content:center;
            color:${broken ? "var(--ink-faint)" : "var(--ink-soft)"}">${DG_ARROW(ok, broken)}</div>`);
        }
        if (n.step == null) {
          parts.push(cardHtml({ cardId: n.card, isObject: true }));
          return;
        }
        const pick = p[n.step];
        if (pick) {
          parts.push(cardHtml({
            cardId: pick.card,
            bad: !pick.ok,
            isNature: pick.ok && n.step === cur().steps.length - 1,
          }));
        } else {
          parts.push(cardHtml({ isActive: n.step === step }));
        }
      });
      return parts.join("");
    }

    function summaryHtml() {
      return objects.filter((o) => finished.has(o.id)).map((o) => {
        const chainTxt = [...o.steps.map((s) => s.card).reverse(), o.id]
          .map((id) => `<span style="display:inline-flex;align-items:center;gap:.25rem">
            <span style="display:block;width:22px;height:22px">${DG_ICON(C[id].icon || id)}</span>
            <span>${esc(nameOf(id))}</span></span>`).join(`<span aria-hidden="true">→</span>`);
        return `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:.3rem;padding:.35rem .45rem;
          border:2px solid var(--line);border-radius:var(--r-s);font-size:.85rem;font-weight:700;min-width:0">${chainTxt}</div>`;
      }).join("");
    }

    function render(focusSel) {
      const ns = nodes();
      const step = stepNow();
      const done = chainDone();
      const pred = predOf();

      const cols = [];
      ns.forEach((_, i) => { if (i) cols.push("16px"); cols.push("minmax(0,1fr)"); });
      chain.style.gridTemplateColumns = cols.join(" ");
      chain.innerHTML = chainHtml();

      const chainTxt = ns.map((n) => {
        if (n.step == null) return nameOf(n.card);
        const pick = picksOf(cur().id)[n.step];
        if (!pick) return n.step === step ? "klausimas" : "tuščias langelis";
        return `${nameOf(pick.card)}${pick.ok ? "" : " (netinka)"}`;
      }).join(", ");
      chain.setAttribute("aria-label",
        `${cur().predict.say ? S[cur().predict.say] : ""} Grandinė: ${chainTxt}.`
        + (pred ? ` Spėjimas: ${pred.label}.` : ""));

      const guess = stage.querySelector("#dg-guess");
      guess.textContent = pred ? `Tu sakei: ${pred.label}` : "Spėjimas dar neįrašytas.";

      const ask = q("#dg-ask");
      ask.textContent = !pred ? S[cur().predict.say]
        : done ? S[cur().steps[cur().steps.length - 1].end]
          : S[cur().steps[step].ask];

      /* Spėjimas */
      const pg = q("#dg-predict");
      pg.style.gridTemplateColumns = `repeat(${cur().predict.options.length},minmax(0,1fr))`;
      pg.innerHTML = cur().predict.options.map((o) => {
        const on = pred && pred.id === o.id;
        return `<button type="button" class="btn secondary" data-pred="${esc(o.id)}" aria-pressed="${on ? "true" : "false"}"
          ${pred ? "disabled" : ""} style="min-width:0;min-height:56px;padding:.35rem .25rem;font-size:.9rem;
          line-height:1.15;${on ? "background:var(--ink);color:var(--paper);border-color:var(--ink)" : ""}">${esc(o.label)}</button>`;
      }).join("");

      /* Šaltiniai */
      const sg = q("#dg-sources");
      const st = done ? null : cur().steps[step];
      const opts = st ? st.options : [];
      sg.style.gridTemplateColumns = `repeat(${Math.max(1, opts.length)},minmax(0,1fr))`;
      sg.style.display = opts.length ? "grid" : "none";
      sg.innerHTML = opts.map((id) => {
        const off = !pred;
        const pick = picksOf(cur().id)[step];
        const chosen = pick && pick.card === id;
        const chosenBad = chosen && !pick.ok;
        return `<button type="button" class="btn secondary" data-card="${esc(id)}"
          aria-pressed="${chosen ? "true" : "false"}" ${off ? "disabled" : ""}
          aria-label="${off ? `Pirma pasirink spėjimą: ${nameOf(id)}` : chosenBad ? `${nameOf(id)}, netinka` : `Rinktis: ${nameOf(id)}`}"
          style="display:grid;justify-items:center;gap:.2rem;min-width:0;min-height:72px;height:auto;
          padding:.35rem .2rem;font-size:.85rem;line-height:1.1;overflow-wrap:anywhere;
          ${chosenBad ? "border:2px dashed var(--ink-faint);" : ""}
          ${chosen && pick.ok ? "background:var(--ink);color:var(--paper);border-color:var(--ink);" : ""}">
          <span style="display:block;width:34px;height:34px">${DG_ICON(C[id].icon || id)}</span>
          <span style="min-width:0">${esc(nameOf(id))}</span>
        </button>`;
      }).join("");

      const replayBtn = q("#dg-replay");
      replayBtn.disabled = !done;
      replayBtn.setAttribute("aria-label", done
        ? "Peržiūrėk kelią po vieną žingsnį"
        : "Peržiūra bus galima, kai grandinė baigsis");

      const nextBtn = q("#dg-next");
      const last = state.oi >= objects.length - 1;
      nextBtn.disabled = !done || last;
      nextBtn.textContent = last ? "Abu daiktai peržiūrėti" : "Kitas daiktas";
      nextBtn.setAttribute("aria-label", !done
        ? "Kitas daiktas bus galimas, kai grandinė baigsis"
        : last ? "Abu daiktai jau peržiūrėti. Paspausk „Iš naujo“." : "Kitas daiktas");

      summary.style.display = finished.size ? "block" : "none";
      summary.innerHTML = `<div style="display:grid;gap:.35rem">${summaryHtml()}</div>`;

      api.readout((state.msg && state.msg.readout) || ask.textContent);
      api.note((state.msg && state.msg.note) || "");

      if (focusSel) {
        const el = q(focusSel);
        if (el && !el.disabled) el.focus();
      }
    }

    const firstSource = () => {
      const btn = q("#dg-sources button");
      return btn && !btn.disabled ? "#dg-sources button" : null;
    };

    function choosePred(id) {
      const o = cur().predict.options.find((x) => x.id === id);
      if (!o) return;
      state.pred[cur().id] = id;
      state.msg = {
        readout: S.guessReadout || "Spėjimas įrašytas. Dabar statyk kelią.",
        note: "Šis spėjimas liks viršuje iki galo.",
      };
      render(firstSource());
    }

    function chooseSource(id) {
      if (!predOf()) return;
      const steps = cur().steps;
      const step = stepNow();
      if (step >= steps.length) return;
      const st = steps[step];
      const ok = id === st.card;
      picksOf(cur().id)[step] = { card: id, ok };
      state.replayI = -1;

      if (ok) {
        if (step + 1 < steps.length) {
          state.msg = {
            readout: `${nameOf(id)}. ${S[steps[step + 1].ask]}`,
            note: "Dar vienas žingsnis iki gamtos.",
          };
          api.speak(S[steps[step + 1].ask], { rate: 0.9 });
          render(firstSource());
          return;
        }
        finished.add(cur().id);
        const pred = predOf();
        state.msg = {
          readout: S[st.end],
          note: pred ? S[pred.say] : "",
        };
        api.speak(pred ? S[pred.say] : S[st.end], { rate: 0.9 });
        if (finished.size >= objects.length) {
          state.msg = { readout: S.all, note: S.all };
          if (!state.reported) {
            state.reported = true;
            api.progress({ correct: true });
          }
        }
        render("#dg-replay");
        return;
      }

      state.msg = {
        readout: S.wrong,
        note: (st.no && st.no[id]) || "",
      };
      api.speak(S.wrong, { rate: 0.9 });
      const btn = [...controls.querySelectorAll("#dg-sources button")].find((b) => b.dataset.card === id);
      render(btn ? `#dg-sources button[data-card="${id}"]` : firstSource());
    }

    function nextObject() {
      if (!chainDone() || state.oi >= objects.length - 1) return;
      state.oi += 1;
      state.msg = null;
      render("#dg-predict button");
      api.speak(S[cur().predict.say], { rate: 0.9 });
    }

    function replay() {
      if (!chainDone()) return;
      const lines = cur().replay || [];
      state.replayI = (state.replayI + 1) % lines.length;
      state.msg = { readout: `${state.replayI + 1}. ${S[lines[state.replayI]]}`, note: "" };
      api.speak(S[lines[state.replayI]], { rate: 0.9 });
      render(null);
      const cards = [...chain.children].filter((el) => el.getAttribute("role") === "img");
      const el = cards[state.replayI];
      if (el) el.style.outline = "4px solid var(--sun)";
    }

    function reset() {
      state.oi = 0;
      state.picks = {};
      state.pred = {};
      state.msg = { readout: S.again, note: "" };
      state.replayI = -1;
      finished.clear();
      api.speak(S.again, { rate: 0.9 });
      render("#dg-predict button");
    }

    controls.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.pred) { choosePred(b.dataset.pred); return; }
      if (b.dataset.card) { chooseSource(b.dataset.card); return; }
      if (b.id === "dg-replay") { replay(); return; }
      if (b.id === "dg-next") { nextObject(); return; }
      if (b.id === "dg-reset") { reset(); }
    });

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); return; }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const group = e.target.closest("#dg-predict, #dg-sources");
      if (!group) return;
      const list = [...group.querySelectorAll("button")].filter((b) => !b.disabled);
      const i = list.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const to = (i + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length;
      list[to].focus();
    });

    state.msg = null;
    render(null);
    api.speak(S[cur().predict.say], { rate: 0.9 });
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 10. Augalų grupės — „Medžiai, krūmai, žolės“                        */
/* ------------------------------------------------------------------ */
/* Vienas kintamasis — pasirinkto augalo aukštis centimetrais. Grupė    */
/* išvedama iš stiebų skaičiaus ir kietumo (`groupOf`), o ne įrašyta     */
/* konfigūracijoje: etiketė privalo būti toks pat teiginys kaip stiebai */
/* paveiksle. Keičiant aukštį augalas neperpiešiamas — ilgėja tik juosta */
/* ir keičiasi skaičius, todėl vaikas mato, kad grupė nejuda (M-10).    */
const AG_BAR_X = 14;
const AG_BAR_W = 300;                 // 300 cm × 1 px/cm
const AG_BAR_Y = 228;
const AG_BAR_H = 16;
const AG_BAR_MAX = 300;               // juostos riba, cm

const augaluGrupes = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const plants = Array.isArray(config.plants) ? config.plants : [];
    const groups = config.groups || {
      medis: { name: "medis", plural: "medžiai" },
      krūmas: { name: "krūmas", plural: "krūmai" },
      žolė: { name: "žolė", plural: "žolės" },
    };
    const barCfg = config.heightBar || {};
    const barMax = Number(barCfg.maxCm) > 0 ? Number(barCfg.maxCm) : AG_BAR_MAX;
    const tickCm = Number(barCfg.tickCm) > 0 ? Number(barCfg.tickCm) : 50;

    /* Grupė — išvedamas dydis: iš tų pačių `stems` ir `woody`, iš kurių
       piešiamas augalas. Konfigūracijoje `group` laukelio sąmoningai nėra. */
    const groupOf = (p) => (!p.woody ? "žolė" : p.stems === 1 ? "medis" : "krūmas");

    const valid = plants.length >= 2 && plants.every((p) => p
      && typeof p.id === "string" && p.id
      && typeof p.name === "string" && p.name
      && Number.isInteger(p.stems) && p.stems > 0
      && typeof p.woody === "boolean"
      && p.height
      && Number.isFinite(p.height.start) && Number.isFinite(p.height.min)
      && Number.isFinite(p.height.max) && Number.isFinite(p.height.step)
      && p.height.step > 0 && p.height.max <= barMax
      && p.height.min <= p.height.start && p.height.start <= p.height.max
      && groups[groupOf(p)]);

    if (!valid) {
      console.error("augalu-grupes: augalas be id/name/stems/woody/height arba nežinoma grupė.");
      stage.innerHTML = '<p class="sim-note" style="text-align:center">Augalai nesuderinti su grupėmis.</p>';
      controls.innerHTML = "";
      return null;
    }

    /* Spėjimas prašomas dviejų pirmųjų sumedėjusių augalų: klausimas „ar tai
       medis?“ prasmingas tik tada, kai augalas turi kamieną. Klausimo tekstas
       imamas iš `sentences` (`start`, `ask2`) — saugomas TEKSTAS, ne raktas,
       kitaip į ekraną ir į balsą patektų raktas „start“ (LL-103). */
    const askKeys = ["start", "ask2"];
    let woodySeen = 0;
    const askOf = plants.map((p) => {
      if (!p.woody) return null;
      const key = askKeys[woodySeen];
      woodySeen += 1;
      return key && S[key] ? S[key] : null;
    });

    const heights = plants.map((p) => p.height.start);
    const guesses = plants.map(() => null);   // "taip" | "ne" | null
    /* Ar šiam augalui jau pasakytas `sentences.grow` sakinys. Be šios žymos
       konfigūracijos frazė „Aukštis didesnis, o stiebas tas pats.“ būtų
       sugeneruota garso įrašuose ir niekada netariama — vaikas girdėtų tik
       skaičių, o ne tai, kas tame skaičiuje svarbu (LL-104). */
    const grownSaid = plants.map(() => false);
    let current = 0;
    let spoken = "";
    let reported = false;                      // api.progress — vieną kartą
    let cardsShown = false;

    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    const gname = (i) => groups[groupOf(plants[i])].name;
    /* Ilgis visada su vienetu: iki metro — centimetrais, toliau — metrais
       su kableliu, kaip rašoma lietuviškai. */
    const fmt = (cm) => {
      const v = Math.round(cm);
      if (v < 100) return `${v} cm`;
      const m = Math.floor(v / 100);
      const rest = v % 100;
      if (rest === 0) return `${m} m`;
      return `${m},${rest % 10 === 0 ? rest / 10 : String(rest).padStart(2, "0")} m`;
    };

    stage.innerHTML = `
      <div style="width:100%;max-width:24rem;margin:0 auto">
        <svg id="agr-scene" viewBox="0 0 328 272" width="100%" role="img" aria-label=""></svg>
        <p class="sim-note" style="text-align:center;line-height:1.3">
          Visi trys augalai nupiešti vienodo dydžio. Aukštį rodo juosta ir skaičius.</p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.5rem;width:100%;max-width:34rem;margin:0 auto">
        <div id="agr-plant" role="group" aria-label="Pasirink augalą"
             style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem">
          ${plants.map((p, i) => `<button class="btn secondary" data-plant="${i}" aria-pressed="false"
             style="min-width:0;min-height:56px;padding:.3rem .15rem;font-size:.85rem;line-height:1.15">${p.name}</button>`).join("")}
        </div>
        <div id="agr-guess" role="group" aria-label="Spėjimas"
             style="display:none;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem">
          <button class="btn secondary" data-guess="taip" aria-pressed="false"
                  style="min-width:0;min-height:56px;padding:.3rem .2rem;font-size:.95rem">Taip</button>
          <button class="btn secondary" data-guess="ne" aria-pressed="false"
                  style="min-width:0;min-height:56px;padding:.3rem .2rem;font-size:.95rem">Ne</button>
        </div>
        <p id="agr-said" style="display:none;margin:0;font-size:.9rem;font-weight:700;text-align:center"></p>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem">
          <button class="btn secondary" id="agr-minus" aria-label="Žemesnis augalas"
                  style="min-width:0;min-height:56px;font-size:1.3rem;line-height:1">−</button>
          <button class="btn secondary" id="agr-plus" aria-label="Aukštesnis augalas"
                  style="min-width:0;min-height:56px;font-size:1.3rem;line-height:1">+</button>
        </div>
        <div id="agr-cards" tabindex="-1"
             style="display:none;grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem;outline:none"></div>
        <p id="agr-end" role="status" aria-live="polite"
           style="margin:0;font-size:.9rem;line-height:1.35;font-weight:700;text-align:center"></p>
        <button class="btn ghost" id="agr-reset" style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    const svg = stage.querySelector("#agr-scene");
    const q = (sel) => controls.querySelector(sel);
    const plantButtons = [...controls.querySelectorAll("[data-plant]")];
    const guessButtons = [...controls.querySelectorAll("[data-guess]")];

    const paint = (btn, on) => {
      btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
      btn.style.color = on ? "var(--paper)" : "var(--ink)";
      btn.style.borderColor = on ? "var(--ink)" : "var(--line)";
    };

    /* Augalas piešiamas iš art.js dalių. Jo aukštis scenoje nekinta nė vienu
       tašku: aukštį neša juosta ir skaičius (žr. modelio ribą po scena). */
    function plantArt(p, x, baseY) {
      if (!p.woody) {
        return art.grass(x - 20, baseY, 1) + art.grass(x + 16, baseY, 1.05)
          + art.leaf(x - 8, baseY - 6, 13, -1, true, "#5fbf62")
          + art.leaf(x + 8, baseY - 6, 13, 1, true, "#5fbf62")
          + art.stem(x, baseY, 80, 3.4, "#4c8b3a", true)
          + art.flower(x + 14, baseY - 80, 1);
      }
      if (p.stems === 1) return art.tree(x, baseY, 1.25, "vasara");
      const offs = p.stems === 2 ? [-15, 15] : [-27, 0, 27];
      return offs.map((off) => {
        const h = 96 - Math.abs(off) * 0.35;
        const dir = off === 0 ? 1 : Math.sign(off);
        return art.stem(x + off, baseY, h, 5.6, "#7a5a3f", false)
          + art.leaf(x + off, baseY - h * 0.68, 13, -dir, false, "#59b95a")
          + art.leaf(x + off + dir * 6, baseY - h * 0.86, 11, dir, false, "#63b45b")
          + art.flower(x + off + dir * 4, baseY - h, 0.95);
      }).join("");
    }

    function scene() {
      const p = plants[current];
      const h = heights[current];
      const g = groups[groupOf(p)];
      const fill = Math.max(0, Math.min(1, h / barMax)) * AG_BAR_W;
      const mx = AG_BAR_X + fill;

      const ticks = [];
      const nums = [];
      for (let cm = 0; cm <= barMax; cm += tickCm) {
        const x = AG_BAR_X + (cm / barMax) * AG_BAR_W;
        ticks.push(`<line x1="${x.toFixed(1)}" y1="${AG_BAR_Y + AG_BAR_H}" x2="${x.toFixed(1)}"`
          + ` y2="${AG_BAR_Y + AG_BAR_H + 6}" stroke="#8b8172" stroke-width="1.6"/>`);
        if (cm % 100 === 0) {
          const anchor = cm === 0 ? "start" : cm >= barMax ? "end" : "middle";
          nums.push(`<text x="${x.toFixed(1)}" y="${AG_BAR_Y + AG_BAR_H + 18}" text-anchor="${anchor}"
            font-family="system-ui, sans-serif" font-size="10" fill="#6a6153">${cm === 0 ? "0" : `${cm / 100} m`}</text>`);
        }
      }

      svg.innerHTML = `
        ${art.defs("agr")}
        ${art.soil(0, 150, 328, 34, "agr")}
        ${plantArt(p, 164, 150)}
        <text x="164" y="212" text-anchor="middle" font-family="system-ui, sans-serif"
              font-size="21" font-weight="800" fill="#3a342b">${g.name} · ${fmt(h)}</text>
        <rect x="${AG_BAR_X}" y="${AG_BAR_Y}" width="${AG_BAR_W}" height="${AG_BAR_H}" rx="8" fill="#e3dbcb"/>
        <rect x="${AG_BAR_X}" y="${AG_BAR_Y}" width="${fill.toFixed(1)}" height="${AG_BAR_H}" rx="8" fill="#6f9a5f"/>
        ${ticks.join("")}${nums.join("")}
        <circle cx="${mx.toFixed(1)}" cy="${AG_BAR_Y + AG_BAR_H / 2}" r="7" fill="#3a342b" stroke="#fff" stroke-width="2"/>`;

      svg.setAttribute("aria-label",
        `${cap(p.name)}, ${fmt(h)}. Tai ${g.name}. Stiebų iš žemės: ${p.stems}. `
        + `Aukščio juosta rodo ${fmt(h)} iš ${fmt(barMax)}.`);
    }

    function render() {
      scene();
      const p = plants[current];
      const h = heights[current];
      const ask = askOf[current];
      const needGuess = Boolean(ask) && !guesses[current];
      const atMin = h <= p.height.min;
      const atMax = h >= p.height.max;

      for (const btn of plantButtons) {
        const i = Number(btn.dataset.plant);
        const on = i === current;
        paint(btn, on);
        btn.setAttribute("aria-pressed", String(on));
        btn.setAttribute("aria-label",
          `${plants[i].name}, ${fmt(heights[i])}, ${gname(i)}`);
      }

      q("#agr-guess").style.display = ask ? "grid" : "none";
      for (const btn of guessButtons) {
        const value = btn.dataset.guess;
        const on = guesses[current] === value;
        paint(btn, on);
        btn.setAttribute("aria-pressed", String(on));
        btn.disabled = !ask || Boolean(guesses[current]);
        btn.setAttribute("aria-label", !ask
          ? "Šiam augalui spėjimas nereikia."
          : guesses[current] ? "Spėjimas jau užrašytas."
            : `Spėju: ${value}`);
      }

      const said = q("#agr-said");
      said.style.display = guesses[current] ? "block" : "none";
      said.textContent = guesses[current] ? `Tu sakei: ${guesses[current]}.` : "";

      const minus = q("#agr-minus");
      const plus = q("#agr-plus");
      const plusHadFocus = document.activeElement === plus;
      minus.disabled = atMin || needGuess;
      plus.disabled = atMax || needGuess;
      minus.setAttribute("aria-label", needGuess
        ? "Pirma pasirink spėjimą."
        : atMin ? "Žemesnio augalo nebegalima." : `Žemesnis: ${fmt(Math.max(p.height.min, h - p.height.step))}`);
      plus.setAttribute("aria-label", needGuess
        ? "Pirma pasirink spėjimą."
        : atMax ? "Aukštesnio augalo nebegalima." : `Aukštesnis: ${fmt(Math.min(p.height.max, h + p.height.step))}`);
      /* Išjungtas valdiklis, ant kurio stovėjo fokusas, numetamas į `body`, ir
         klaviatūros naudotojas nebeturi kur eiti (LL-32). Todėl fokusas
         perkeliamas į vienintelį likusį veiksmą. */
      if (plusHadFocus && plus.disabled) (minus.disabled ? q("#agr-reset") : minus).focus();

      const grownAll = plants.every((pl, i) => heights[i] > pl.height.start);
      const allMax = plants.every((pl, i) => heights[i] >= pl.height.max);
      const cards = q("#agr-cards");
      if (grownAll) {
        cards.style.display = "grid";
        cards.innerHTML = `<p style="grid-column:1/-1;margin:0;font-size:.78rem;line-height:1.2;
          font-weight:700;text-align:center;color:var(--ink-soft)">Ką parodė modelis?</p>`
          + plants.map((pl, i) => {
            const stemWord = pl.stems === 1 ? (pl.woody ? "kamienas" : "stiebas") : "stiebai";
            return `<div data-card tabindex="-1" style="min-width:0;border:2px solid var(--line);border-radius:var(--r-s);
            background:var(--paper-2);padding:.3rem .2rem;text-align:center">
              <span style="display:block;font-size:.8rem;line-height:1.15;font-weight:700;color:var(--ink-soft);overflow-wrap:anywhere">${pl.name}</span>
              <strong style="display:block;font-size:1.05rem;line-height:1.2">${fmt(heights[i])}</strong>
              <span style="display:block;font-size:.85rem;font-weight:700">${gname(i)}</span>
              <span style="display:block;font-size:.75rem;color:var(--ink-soft)">${pl.stems} ${stemWord}</span>
            </div>`;
          }).join("");
      } else {
        cards.style.display = "none";
        cards.innerHTML = "";
      }
      /* Kortelės atsiranda tik augalus paauginus; jei fokusas ką tik liko ant
         išjungto „+“, jis keliamas į korteles, o ne į `body`. */
      if (grownAll && !cardsShown) {
        cardsShown = true;
        const firstCard = cards.querySelector("[data-card]");
        /* Fokusas keliamas į pirmą kortelę, kai jis yra ant aukščio mygtukų ar
           nukritęs į `body`. Pasiekus maksimumą `+` išsijungia, o `render()`
           fokusą perkelia į `−` (LL-32), todėl vien `plusHadFocus` čia
           neužtenka: kortelės atsiranda tame pačiame kadre ir liktų nepastebėtos
           klaviatūros naudotojui (M-10, 831 eil.). */
        const ae = document.activeElement;
        if (ae === plus || ae === minus || ae === document.body) (firstCard || cards).focus();
      }

      let end = "";
      if (needGuess) end = "Pirma spėk, ar tai medis.";
      else if (allMax) end = "Visi trys pasiekė savo aukštį. Grupė ta pati.";
      else if (grownAll) end = "Palygink tris korteles su skaičiais.";
      else if (h === p.height.start) end = "Pasirink augalą arba keisk jo aukštį.";
      else end = `Aukštis ${fmt(h)}. Grupė ta pati.`;
      q("#agr-end").textContent = end;

      api.readout(needGuess ? ask : `${cap(p.name)} ${fmt(h)}. Tai ${gname(current)}.`);

      let note;
      if (needGuess) note = "Pirma spėk, tada augink.";
      else if (allMax) note = "Grupę rodo stiebas, ne aukštis.";
      else if (atMax && guesses[current]) note = `Tu sakei: ${guesses[current]}. Tai vis tiek ${gname(current)}.`;
      else if (h !== p.height.start) note = "Aukštis didesnis, o stiebas tas pats.";
      else note = "Keisk aukštį ir žiūrėk į stiebą.";
      api.note(note);

      const group = groupOf(p);
      if (allMax && !reported) {
        reported = true;
        spoken = "rule";
        api.progress({ correct: true });
        if (S.rule) api.speak(S.rule, { rate: 0.9 });
      } else if (needGuess && spoken !== `ask-${p.id}`) {
        spoken = `ask-${p.id}`;
        api.speak(ask, { rate: 0.9 });
      } else if (!needGuess && !atMax && h > p.height.start && !grownSaid[current]) {
        /* Pirmas aukščio pokytis — vienintelė vieta, kur modelis gali pasakyti
           patį sąryšį: skaičius keičiasi, stiebas ne. Toliau nebekartojama,
           kad kiekvienas paspaudimas netaptų paskaita (LL-14, T5.4). */
        grownSaid[current] = true;
        spoken = `grow-${p.id}`;
        if (S.grow) api.speak(S.grow, { rate: 0.9 });
      } else if (!needGuess && atMax && spoken !== `max-${p.id}`) {
        spoken = `max-${p.id}`;
        const trait = { medis: S.one, krūmas: S.few, žolė: S.soft }[group];
        const cmpKey = p.say ? p.say[guesses[current]] : null;
        const line = (cmpKey && S[cmpKey]) || trait;
        if (line) api.speak(line, { rate: 0.9 });
      }
    }

    function setPlant(i) {
      if (i === current || i < 0 || i >= plants.length) return;
      current = i;
      render();
    }

    function changeHeight(delta) {
      const p = plants[current];
      if (askOf[current] && !guesses[current]) return;
      const next = Math.max(p.height.min, Math.min(p.height.max, heights[current] + delta));
      if (next === heights[current]) return;
      heights[current] = next;
      render();
    }

    function chooseGuess(value) {
      if (!askOf[current] || guesses[current]) return;
      guesses[current] = value;
      if (S.guess) api.speak(S.guess, { rate: 0.9 });
      spoken = `guess-${plants[current].id}`;
      render();
      if (!q("#agr-plus").disabled) q("#agr-plus").focus();
    }

    function reset() {
      plants.forEach((p, i) => {
        heights[i] = p.height.start;
        guesses[i] = null;
        grownSaid[i] = false;
      });
      current = 0;
      spoken = "";
      cardsShown = false;
      if (S.again) api.speak(S.again, { rate: 0.9 });
      render();
    }

    for (const btn of plantButtons) btn.addEventListener("click", () => setPlant(Number(btn.dataset.plant)));
    for (const btn of guessButtons) btn.addEventListener("click", () => chooseGuess(btn.dataset.guess));
    q("#agr-minus").addEventListener("click", () => changeHeight(-plants[current].height.step));
    q("#agr-plus").addEventListener("click", () => changeHeight(plants[current].height.step));
    q("#agr-reset").addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = plantButtons.indexOf(document.activeElement);
      if (idx >= 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        const to = (idx + (e.key === "ArrowRight" ? 1 : plants.length - 1)) % plants.length;
        setPlant(to);
        plantButtons[to].focus();
        return;
      }
      if (e.key === "ArrowUp") { e.preventDefault(); changeHeight(plants[current].height.step); }
      if (e.key === "ArrowDown") { e.preventDefault(); changeHeight(-plants[current].height.step); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); }
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 11. Išmesto daikto kelias — „Išmestas daiktas nedingsta“            */
/* ------------------------------------------------------------------ */
/*
 * Viena sąvoka: išmestas daiktas ne išnyksta, o atsiduria krūvoje, kuri
 * auga. Modelis skirtas būtent nuostatai „išmečiau — dingo“: vaikas penkiems
 * daiktams renkasi vieną iš trijų veiksmų, o kiekvienas „Išmesiu“ padeda
 * daiktą į krūvą priešais akis. Krūva yra SKAIČIUOJAMA, ne nupiešta: jos
 * aukštis priklauso nuo pasirinkimų skaičiaus, todėl „Grįžk vieną“ ją
 * sumažina. Tai įrodymas, kurio paveikslėlis negali duoti.
 *
 * Ko modelis sąmoningai nedaro:
 *  - neverdina veiksmų į gerus ir blogus (T5.1): išmesti nėra baudžiama,
 *    tik parodoma, kur daiktas atsidūrė; tausojimas yra pasekmė, ne kaltė;
 *  - nerūšiuoja atliekų pagal medžiagą (tai 3–4 kl. turinys, LL-23);
 *  - neparodo tolesnio kelio (išvežimas, perdirbimas) — tai pasakoma vaikui
 *    po scena ir mokytojui, o ne imituojama.
 */
const IDK_ITEM = (kind, x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${art.pictogram(kind, 0, 0, 1)}</g>`;

const ismestoDaiktoKelias = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const objects = (Array.isArray(config.objects) ? config.objects : []).filter(Boolean);
    const actions = (Array.isArray(config.actions) ? config.actions : []).filter(Boolean);
    const guess = config.guess && typeof config.guess === "object" ? config.guess : null;
    const esc = (t) => String(t).replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai: nesuderinta konfigūracija sakoma žodžiais,
       o ne tyliai pakeičiama bendru sakiniu (LL-33). --- */
    const problems = [];
    if (!objects.length) problems.push("nėra nė vieno daikto");
    if (actions.length < 2) problems.push("nėra bent dviejų veiksmų");
    actions.forEach((a) => {
      if (!a || !a.id || !a.label) problems.push("veiksmas be id arba užrašo");
      if (typeof a.keep !== "boolean") problems.push(`veiksmas „${a && a.id}“ neturi keep`);
    });
    if (!actions.some((a) => a.keep === true) || !actions.some((a) => a.keep === false)) {
      problems.push("reikia ir veiksmo, kuris daiktą palieka, ir veiksmo, kuris jį išmeta");
    }
    objects.forEach((o) => {
      if (!o.id || !o.name || !o.icon) problems.push(`daiktas „${o.id || "?"}“ be id, vardo ar piktogramos`);
      if (!o.sentences || typeof o.sentences !== "object") {
        problems.push(`daiktas „${o.id}“ neturi savo sakinių`);
        return;
      }
      actions.forEach((a) => {
        if (!a || !a.id) return;
        if (typeof o.sentences[a.id] !== "string" || !o.sentences[a.id].trim()) {
          problems.push(`daiktas „${o.id}“ neturi sakinio veiksmui „${a.id}“`);
        }
      });
    });
    if (!guess) {
      problems.push("nėra spėjimo");
    } else {
      if (!guess.say || !S[guess.say]) problems.push("spėjimo klausimo teksto nėra");
      if (!Array.isArray(guess.options) || guess.options.length < 2) {
        problems.push("spėjimas turi turėti bent du variantus");
      } else {
        guess.options.forEach((o) => {
          if (!o || !o.label) problems.push("spėjimo variantas be užrašo");
          else if (!o.say || !S[o.say]) problems.push(`spėjimo varianto „${o.label}“ palyginimo nėra`);
        });
      }
    }
    ["ask", "guessReadout", "undo", "again", "done"].forEach((k) => {
      if (!S[k]) problems.push(`sakinio „${k}“ nėra`);
    });
    if (problems.length) {
      console.error(`ismesto-daikto-kelias: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Krūva nesuderinta su daiktais.</p>';
      controls.innerHTML = "";
      return null;
    }

    const SEAT_Y = 166;      // lentynos viršus
    const GROUND_Y = 236;    // krūvos pagrindas
    const ICON_S = 34;       // krūvos daikto dydis
    const RISE = 24;         // kiek daiktas pakelia krūvą

    const state = { idx: 0, guessId: null, decisions: [], reported: false, msg: null };

    const dWord = (n) => (n === 1 ? "daiktas" : n >= 2 && n <= 4 ? "daiktai" : "daiktų");
    const done = () => state.idx >= objects.length;
    const cur = () => (done() ? null : objects[state.idx]);
    const keptOf = () => state.decisions.filter((d) => d.keep);
    const thrownOf = () => state.decisions.filter((d) => !d.keep);
    const objOf = (id) => objects.find((o) => o.id === id) || { name: id, icon: id };
    const guessOpt = () => (guess ? guess.options.find((o) => o.id === state.guessId) || null : null);

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <p id="idk-guess-line" style="margin:0 0 .35rem;min-width:0;text-align:center;font-weight:800;
           font-size:.9rem;line-height:1.2;overflow-wrap:anywhere;color:var(--ink-soft)"></p>
        <svg id="idk-scene" viewBox="0 0 360 300" width="100%"
             style="display:block;max-width:360px;height:auto;margin:0 auto"
             role="img" aria-label="Lentyna su daiktais ir tuščia vieta krūvai."></svg>
        <p id="idk-count" style="margin:.45rem 0 0;text-align:center;font-weight:800;font-size:.95rem"></p>
        <p class="sim-note" style="margin:.15rem 0 0;text-align:center">
          Krūva rodo tik šio darbo daiktus.</p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.55rem;width:100%;max-width:34rem;margin:0 auto;min-width:0">
        <p id="idk-ask" style="margin:0;min-width:0;font-size:.95rem;line-height:1.25;font-weight:800;
           text-align:center;overflow-wrap:anywhere"></p>
        <div id="idk-guess" role="group" aria-label="Spėjimas"
             style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem;min-width:0"></div>
        <div id="idk-actions" role="group" aria-label="Ką darysi su daiktu"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5rem),1fr));gap:.4rem;min-width:0"></div>
        <div style="display:flex;gap:.45rem;justify-content:center;flex-wrap:wrap;min-width:0">
          <button type="button" class="btn secondary" id="idk-undo"
                  style="min-height:48px;flex:1 1 9rem;min-width:0">Grįžk vieną</button>
          <button type="button" class="btn ghost" id="idk-reset"
                  style="min-height:48px;flex:1 1 7rem;min-width:0">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#idk-scene");
    const guessLine = stage.querySelector("#idk-guess-line");
    const countEl = stage.querySelector("#idk-count");
    const ask = controls.querySelector("#idk-ask");
    const guessGroup = controls.querySelector("#idk-guess");
    const actGroup = controls.querySelector("#idk-actions");
    const undoBtn = controls.querySelector("#idk-undo");
    const resetBtn = controls.querySelector("#idk-reset");

    guessGroup.innerHTML = guess.options.map((o) =>
      `<button type="button" class="btn secondary" data-guess="${esc(o.id)}" aria-pressed="false"
        style="min-width:0;min-height:56px;padding:.35rem .25rem;font-size:.9rem;line-height:1.15;
        overflow-wrap:anywhere">${esc(o.label)}</button>`).join("");

    actGroup.innerHTML = actions.map((a) =>
      `<button type="button" class="btn secondary" data-act="${esc(a.id)}"
        style="min-width:0;min-height:56px;height:auto;padding:.4rem .3rem;font-size:.92rem;
        line-height:1.15;overflow-wrap:anywhere">${esc(a.label)}</button>`).join("");

    const guessBtns = Array.from(guessGroup.querySelectorAll("button"));
    const actBtns = Array.from(actGroup.querySelectorAll("button"));

    function sceneMarkup() {
      const kept = keptOf().map((d, i) => IDK_ITEM(objOf(d.id).icon, 44 + i * 24, SEAT_Y - 22, 0.55)).join("");
      const pile = thrownOf().map((d, i) => {
        const x = 268 - ICON_S / 2 + (i % 2 ? 15 : -15);
        const y = GROUND_Y - ICON_S - i * RISE;
        return IDK_ITEM(objOf(d.id).icon, x, y, 0.85);
      }).join("");
      const c = cur();
      return `${art.defs("idk")}
        ${art.sun(316, 40, 12, "idk", 0.85)}
        ${art.cloud(64, 46, 0.72)}
        ${art.cloud(152, 30, 0.45, 0.7)}
        ${art.hills(360, 238)}
        ${art.grass(18, 244, 1)}${art.grass(118, 246, 0.85)}${art.grass(332, 244, 0.9)}
        ${art.plank(52, GROUND_Y, 58, 9, 90)}
        ${art.plank(148, GROUND_Y, 58, 9, 90)}
        ${art.plank(36, 178, 128, 12)}
        ${kept}
        <ellipse cx="268" cy="${GROUND_Y + 3}" rx="52" ry="9" fill="none" stroke="#8b8578"
                 stroke-width="2.5" stroke-dasharray="6 7" opacity=".7"/>
        ${pile}
        ${c ? IDK_ITEM(c.icon, 79, SEAT_Y - 40, 1) : ""}`;
    }

    function sceneLabel() {
      const k = keptOf().length;
      const t = thrownOf().length;
      const c = cur();
      return `Lentynoje ${k} ${dWord(k)}. Krūvoje ${t} ${dWord(t)}.`
        + (c ? ` Ant lentynos: ${c.name}.` : " Visi daiktai numatyti.");
    }

    function render(focusSel) {
      svg.innerHTML = sceneMarkup();
      svg.setAttribute("aria-label", sceneLabel());
      guessLine.textContent = state.guessId
        ? `Tu sakei: ${guessOpt().label}`
        : "Spėjimas dar neįrašytas.";
      const k = keptOf().length;
      const t = thrownOf().length;
      countEl.textContent = `Lentynoje ${k} ${dWord(k)} · Krūvoje ${t} ${dWord(t)}`;

      ask.textContent = !state.guessId ? S[guess.say] : done() ? S.done : S.ask;

      for (const b of guessBtns) {
        const on = b.dataset.guess === state.guessId;
        b.disabled = !!state.guessId;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.background = on ? "var(--ink)" : "";
        b.style.color = on ? "var(--paper)" : "";
        b.style.borderColor = on ? "var(--ink)" : "";
      }
      for (const b of actBtns) {
        b.disabled = !state.guessId || done();
        const a = actions.find((x) => x.id === b.dataset.act);
        b.setAttribute("aria-label", !state.guessId
          ? `Pirma įrašyk spėjimą: ${a ? a.label : ""}`
          : done() ? "Visi daiktai jau numatyti" : `Su šiuo daiktu: ${a ? a.label : ""}`);
      }

      undoBtn.disabled = state.decisions.length === 0;
      undoBtn.setAttribute("aria-label", state.decisions.length
        ? "Grįžk vienu žingsniu atgal"
        : "Nėra ką atšaukti");
      resetBtn.setAttribute("aria-label", "Pradėk iš naujo su visais daiktais");

      api.readout(state.msg ? state.msg.readout : ask.textContent);
      const note = state.msg ? state.msg.note : (state.guessId ? "" : "Pirma įrašyk spėjimą.");
      api.note(note);

      if (focusSel) {
        const el = controls.querySelector(focusSel);
        if (el && !el.disabled) el.focus();
      }
    }

    function chooseGuess(id) {
      if (state.guessId) return;
      const g = guess.options.find((o) => o.id === id);
      if (!g) return;
      state.guessId = id;
      state.msg = {
        readout: S.guessReadout,
        note: "Šis spėjimas liks viršuje iki galo.",
      };
      api.speak(S.guessReadout, { rate: 0.9 });
      render("#idk-actions button");
    }

    function chooseAction(id) {
      if (done()) return;
      const o = cur();
      const a = actions.find((x) => x.id === id);
      if (!o || !a) return;
      state.decisions.push({ id: o.id, action: a.id, keep: a.keep });
      state.idx += 1;
      const line = o.sentences[a.id];
      if (done()) {
        const g = guessOpt();
        state.msg = {
          readout: `${line} ${S.done}`,
          note: g && S[g.say] ? S[g.say] : "",
        };
        api.speak(S.done, { rate: 0.9 });
        if (!state.reported) {
          state.reported = true;
          api.progress({ correct: true });
        }
        render("#idk-undo");
        return;
      }
      state.msg = { readout: line, note: a.note || "" };
      api.speak(line, { rate: 0.9 });
      /* Fokusas lieka ant to paties veiksmo mygtuko: jis lieka aktyvus, o
         objektas pasikeitė — tai pasakoma readout'e, ne fokusu. */
      render(null);
    }

    function undo() {
      if (!state.decisions.length) return;
      state.decisions.pop();
      state.idx = Math.max(0, state.idx - 1);
      state.msg = { readout: S.undo, note: "" };
      api.speak(S.undo, { rate: 0.9 });
      render("#idk-actions button");
    }

    function reset() {
      state.idx = 0;
      state.guessId = null;
      state.decisions = [];
      state.msg = { readout: S.again, note: "Pirma įrašyk spėjimą." };
      api.speak(S.again, { rate: 0.9 });
      render("#idk-guess button");
    }

    controls.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.dataset.guess) { chooseGuess(b.dataset.guess); return; }
      if (b.dataset.act) { chooseAction(b.dataset.act); return; }
      if (b.id === "idk-undo") { undo(); return; }
      if (b.id === "idk-reset") { reset(); }
    });

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); return; }
      if (e.key === "z" || e.key === "Z" || e.key === "Backspace") { e.preventDefault(); undo(); return; }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const group = e.target.closest("#idk-guess, #idk-actions");
      if (!group) return;
      const btns = [...group.querySelectorAll("button")].filter((b) => !b.disabled);
      if (btns.length < 2) return;
      const idx = btns.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      const to = (idx + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length;
      btns[to].focus();
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Kieta vandens forma — tas pats vanduo trimis pavidalais             */
/* ------------------------------------------------------------------ */
/* Programa 26.3.2 (1 kl.) prašo atpažinti skirtingų formų kietąją
   vandens būseną (snaigė, šerkšnas, ledas) ir padaryti išvadą, kad ji
   gali būti įvairių formų. Modulis 16-vandens-busenos rodo garą ir lašus,
   todėl šis modelis ima kitą pusę: tą patį kiekį vandens (po vieną
   puodelį) supilame į tris skirtingas formas, sušaldome, o paskui
   ištirpdome atgal į tuos pačius puodelius.
   Klaidinga nuostata, kurią modelis griauja: „ledas, snaigė ir šerkšnas
   yra kitokia medžiaga, ne vanduo“ — kietas daiktas neteka, todėl vaikas
   jį priskiria kitai medžiagai. Todėl scena ne tik parodo tris pavidalus,
   bet ir turi lygio žymą: prieš šaldymą ir po tirpimo vandens lygis
   puodeliuose tas pats.
   Formos pavidalą duoda indas, o ne kiekis (LL-28: modelis turi rodyti
   prieštaraujančius atvejus, o ne vieną). Trys formos rodomos vienu metu
   sąmoningai — vienas ledo gabalas neparodytų, kad kieta būsena gali būti
   įvairių formų.
   Modelio riba: vanduo šaldamas plečiasi, todėl tikras ledas būna šiek
   tiek didesnis. Tai nerodoma, kad vaikas nepainiotų kiekio su tūriu. */
const LF_WORDS = { ice: "Ledas", snow: "Snaigė", frost: "Šerkšnas" };
const LF_KEYS = ["ice", "snow", "frost"];
const LF_KINDS = ["circle", "flake", "pane"];
const LF_COLS = [60, 180, 300];
const LF_CUP = { top: 164, bottom: 244, topHalf: 26, botHalf: 21 };
const LF_LEVEL = 182;      // žyma: tiek vandens buvo prieš šaldymą
const LF_MOLD_Y = 74;
const LF_SENTENCES = [
  "start", "frozen", "melted", "startNote", "frozenNote", "meltedNote", "again",
];

const ledoFormos = {
  mount({ stage, controls, api, config = {} }) {
    const W = { ...LF_WORDS };
    const cfgWords = config && typeof config.words === "object" && !Array.isArray(config.words)
      ? config.words : {};
    for (const key of LF_KEYS) {
      const v = cfgWords[key];
      if (typeof v === "string" && v.trim()) W[key] = v.trim();
    }
    const S = config && typeof config.sentences === "object" && !Array.isArray(config.sentences)
      ? config.sentences : {};
    const esc = (s) => String(s ?? "").replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* Nesuderinta konfigūracija sakoma žodžiais, o ne tyliai pakeičiama
       bendru sakiniu (LL-33). */
    const missingSentences = LF_SENTENCES.filter((k) => typeof S[k] !== "string" || !S[k].trim());
    if (missingSentences.length) {
      console.error(`ledo-formos: trūksta sakinių ${missingSentences.join(", ")}`);
      stage.innerHTML = '<p class="error-box">Formos nesuderintos su tekstu.</p>';
      controls.innerHTML = "";
      return null;
    }

    let phase = "start";     // start | frozen | melted
    let reported = false;

    stage.innerHTML = `
      <div style="width:100%;max-width:28rem;margin:0 auto;min-width:0">
        <svg id="lof-scene" viewBox="0 0 360 300" width="100%"
             style="display:block;max-width:360px;height:auto;margin:0 auto"
             role="img" aria-label="Trys puodeliai vandens ir trys tuščios formos."></svg>
        <p class="sim-note" style="margin:.4rem 0 0;text-align:center">
          Kiekviena forma gauna po vieną puodelį vandens.
        </p>
      </div>`;

    /* Mygtukų paddingas `min(1.4rem,9 %)`: 200 % tekste fiksuotas rem
       išstumtų už kortelės (ta pati klasė kaip vandens-busenos). */
    controls.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:.5rem;width:100%;max-width:30rem;margin:0 auto">
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;min-width:0">
          <button class="btn" id="lof-freeze" type="button"
                  style="flex:1 1 8rem;min-height:48px;min-width:0;padding-inline:min(1.4rem,9%)">Sušaldyk</button>
          <button class="btn secondary" id="lof-melt" type="button"
                  style="flex:1 1 8rem;min-height:48px;min-width:0;padding-inline:min(1.4rem,9%)">Ištirpdyk</button>
          <button class="btn ghost" id="lof-reset" type="button"
                  style="flex:0 0 auto;min-height:48px;padding-inline:min(1.4rem,9%)">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#lof-scene");
    const freezeBtn = controls.querySelector("#lof-freeze");
    const meltBtn = controls.querySelector("#lof-melt");
    const resetBtn = controls.querySelector("#lof-reset");

    /* Puodelio plotis ties duotu aukščiu — vandens paviršius ir žyma
       skaičiuojami iš tos pačios funkcijos, todėl lygis paveiksle
       niekada nesiskiria nuo to, ką sako žyma. */
    const halfW = (y) => LF_CUP.topHalf
      - ((y - LF_CUP.top) * (LF_CUP.topHalf - LF_CUP.botHalf)) / (LF_CUP.bottom - LF_CUP.top);

    function cup(cx, full) {
      const { top, bottom } = LF_CUP;
      const a = halfW(top);
      const b = halfW(bottom);
      const lw = halfW(LF_LEVEL);
      const outline = `M${cx - a} ${top} L${cx - b} ${bottom}`
        + ` Q${cx} ${bottom + 6} ${cx + b} ${bottom} L${cx + a} ${top}`;
      const water = full
        ? `<path d="M${cx - lw} ${LF_LEVEL} L${cx - b} ${bottom}`
          + ` Q${cx} ${bottom + 6} ${cx + b} ${bottom} L${cx + lw} ${LF_LEVEL} Z"`
          + ` fill="url(#lof-water)"/>`
          + `<line x1="${cx - lw}" y1="${LF_LEVEL}" x2="${cx + lw}" y2="${LF_LEVEL}"`
          + ` stroke="#ffffff" stroke-opacity=".8" stroke-width="2"/>`
        : "";
      return `<g>
        ${water}
        <path d="${outline}" fill="none" stroke="#5c6772" stroke-width="3" stroke-linecap="round"/>
        <line x1="${cx - a - 6}" y1="${LF_LEVEL}" x2="${cx - a + 3}" y2="${LF_LEVEL}"
              stroke="#5c6772" stroke-width="2.6" stroke-linecap="round"/>
        <line x1="${cx + a - 3}" y1="${LF_LEVEL}" x2="${cx + a + 6}" y2="${LF_LEVEL}"
              stroke="#5c6772" stroke-width="2.6" stroke-linecap="round"/>
      </g>`;
    }

    function hexPoints(cx, cy, r) {
      return Array.from({ length: 6 }, (_, i) => {
        const ang = ((i * 60 - 90) * Math.PI) / 180;
        return `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
      }).join(" ");
    }

    /* Trys kietos formos: apvalus ledo gabalas, šešiakampė snaigė ir
       plonas šerkšno sluoksnis ant stiklo. Tuščia forma rodoma punktyru —
       vaikas mato, kad pavidalą duoda indas, o ne vanduo. */
    function mold(cx, kind, cold) {
      const y = LF_MOLD_Y;
      if (kind === "circle") {
        if (!cold) {
          return `<circle cx="${cx}" cy="${y}" r="31" fill="none" stroke="#7e8b98"
                  stroke-width="2.5" stroke-dasharray="8 6"/>`;
        }
        return art.ball(cx, y, 31, "#dceff9", "#8fc4dd");
      }
      if (kind === "flake") {
        if (!cold) {
          return `<polygon points="${hexPoints(cx, y, 35)}" fill="none" stroke="#7e8b98"
                  stroke-width="2.5" stroke-dasharray="8 6" stroke-linejoin="round"/>`;
        }
        const arms = [0, 60, 120].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const dx = Math.cos(rad) * 33;
          const dy = Math.sin(rad) * 33;
          return `<line x1="${(cx - dx).toFixed(1)}" y1="${(y - dy).toFixed(1)}"`
            + ` x2="${(cx + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}"/>`;
        }).join("");
        const twigs = [];
        for (const deg of [0, 60, 120]) {
          const rad = (deg * Math.PI) / 180;
          const ux = Math.cos(rad);
          const uy = Math.sin(rad);
          for (const t of [0.5, 0.78]) {
            for (const side of [-1, 1]) {
              const px = cx + ux * 33 * t;
              const py = y + uy * 33 * t;
              const qx = (-uy * side + ux * 0.45) * 10;
              const qy = (ux * side + uy * 0.45) * 10;
              twigs.push(`<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}"`
                + ` x2="${(px + qx).toFixed(1)}" y2="${(py + qy).toFixed(1)}"/>`);
            }
          }
        }
        return `<g stroke="#8fc4dd" stroke-width="3" stroke-linecap="round">
          <circle cx="${cx}" cy="${y}" r="29" fill="#eaf6fd" fill-opacity=".92" stroke="none"/>
          ${arms}${twigs.join("")}
          <circle cx="${cx}" cy="${y}" r="4.5" fill="#ffffff" stroke="#8fc4dd" stroke-width="2"/>
        </g>`;
      }
      /* Plokščia forma — šerkšnas ant šalto stiklo. */
      const x = cx - 38;
      const w = 76;
      const h = 68;
      const top = y - 34;
      if (!cold) {
        return `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="7" fill="none"
                stroke="#7e8b98" stroke-width="2.5" stroke-dasharray="8 6"/>`;
      }
      const feathers = [
        [-26, 62, 10, -16], [-14, 60, 8, -20], [0, 62, 10, -14],
        [14, 60, 8, -18], [26, 62, 9, -14], [-22, 48, 8, -14], [6, 46, 9, -14],
      ].map(([dx, dy, ex, ey]) => `<path d="M${(cx + dx).toFixed(1)} ${top + dy}`
        + ` q ${(ex * 0.45).toFixed(1)} ${(ey * 0.5).toFixed(1)} ${ex} ${ey}"/>`).join("");
      return `<g>
        <rect x="${x}" y="${top}" width="${w}" height="${h}" rx="7"
              fill="#dceef8" stroke="#8fc4dd" stroke-width="2.5"/>
        <g fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".95">${feathers}</g>
      </g>`;
    }

    function formLabel(cx, text) {
      return `<text x="${cx}" y="128" text-anchor="middle" font-family="system-ui, sans-serif"
                    font-size="15" font-weight="800" fill="#26323c">${esc(text)}</text>`;
    }

    /* Rodyklė rodo, kur vanduo yra DABAR: užšaldžius — formoje, ištirpus —
       atgal puodelyje. Ji paaiškina tuščią puodelį, kad vaikas nepagalvotų,
       jog vanduo dingo (LL-13: paveikslas ir sakinys turi sutarti). */
    function arrowMark(cx) {
      if (phase === "frozen") {
        return `<g stroke="#5c6772" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round">
          <path d="M${cx} 158 V143"/><path d="M${cx - 5} 149 L${cx} 142 L${cx + 5} 149"/></g>`;
      }
      if (phase === "melted") {
        return `<g stroke="#5c6772" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round">
          <path d="M${cx} 143 V158"/><path d="M${cx - 5} 152 L${cx} 159 L${cx + 5} 152"/></g>`;
      }
      return "";
    }

    function scene() {
      const cold = phase === "frozen";
      const cols = LF_COLS.map((cx, i) => `<g>${mold(cx, LF_KINDS[i], cold)}`
        + `${formLabel(cx, W[LF_KEYS[i]])}${arrowMark(cx)}${cup(cx, !cold)}</g>`).join("");
      return `${art.defs("lof")}${art.hills(360, 254, "#e6eff6", "#d2e2ec")}${cols}`;
    }

    function sceneLabel() {
      if (phase === "frozen") {
        return `Trijose formose kietas vanduo: ${W.ice}, ${W.snow}, ${W.frost}. Puodeliai tušti.`;
      }
      if (phase === "melted") {
        return "Ledas ištirpo ir grįžo į puodelius. Vandens lygis toks pat.";
      }
      return `Trys puodeliai vandens ir trys tuščios formos: ${W.ice}, ${W.snow}, ${W.frost}.`;
    }

    function render(focusEl) {
      svg.innerHTML = scene();
      svg.setAttribute("aria-label", sceneLabel());

      /* Užrakintas valdiklis pasako, kodėl jis užrakintas (LL-04), o
         fokusas perkeliamas į tą, kuris dabar veikia (LL-32: naršyklė
         numeta fokusą išjungusi mygtuką). */
      freezeBtn.disabled = phase === "frozen";
      meltBtn.disabled = phase !== "frozen";
      freezeBtn.setAttribute("aria-label", phase === "frozen"
        ? "Vanduo jau sustingęs — dabar spausk Ištirpdyk"
        : "Sušaldyk vandenį trijose formose");
      meltBtn.setAttribute("aria-label", phase === "frozen"
        ? "Ištirpdyk ledą ir grąžink vandenį į puodelius"
        : "Pirma sušaldyk vandenį");
      resetBtn.setAttribute("aria-label", "Pradėk bandymą iš naujo");

      api.readout(phase === "frozen" ? S.frozen : phase === "melted" ? S.melted : S.start);
      api.note(phase === "frozen" ? S.frozenNote : phase === "melted" ? S.meltedNote : S.startNote);

      if (focusEl && !focusEl.disabled) focusEl.focus();
    }

    function freeze() {
      if (phase === "frozen") return;
      phase = "frozen";
      api.speak(S.frozen, { rate: 0.9 });
      render(meltBtn);
    }

    function melt() {
      if (phase !== "frozen") return;
      phase = "melted";
      api.speak(S.melted, { rate: 0.9 });
      render(freezeBtn);
      /* Pažanga žymima po VISĄ ciklą (sušaldymas + tirpimas): vien
         sušaldžius vaikas dar nematė, kad vandens vėl tiek pat (LL-29). */
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function reset() {
      phase = "start";
      api.speak(S.again, { rate: 0.9 });
      render(freezeBtn);
    }

    freezeBtn.addEventListener("click", freeze);
    meltBtn.addEventListener("click", melt);
    resetBtn.addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const btns = [...controls.querySelectorAll("button")].filter((b) => !b.disabled);
      if (btns.length < 2) return;
      const idx = btns.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      const to = (idx + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length;
      btns[to].focus();
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 13. Traumos priežastis — pašalink priežastį, įvykis nebeįvyksta      */
/* ------------------------------------------------------------------ */
/* Programa 26.1.1 „Saugus elgesys“ (1 kl., 3 val.) turi projektą „Kaip
   išvengti traumų?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:14960–14966`,
   ilgalaikis planas `:17618–17626`). Platformoje 26.1.1 teturėjo dūmų kelią
   (`19-dumai-ir-isejimas`), o traumos priežasties nebuvo nė viename modulyje.
   Klaidingos nuostatos, kurias modelis griauja:
     1. „trauma atsitinka be priežasties, tiesiog nepasisekė“;
     2. „užteks būti atsargesniam, ir daiktas kelyje nebekliudys“;
     3. „kaltas vaikas, o ne vieta“.
   Todėl scenoje kinta VIENAS dalykas — kas yra kelyje. Vaikas, ėjimas ir
   vieta nesikeičia niekada, todėl priežastį galima priskirti vietai, o ne
   vaikui, ir palyginti ėjimą su priežastimi ir be jos.
   Pasekmė IŠVEDAMA iš to paties rakto, kurį vaikas pasirinko kortele, o ne
   įrašyta `config.causes[]` lauke:
     outcome(key) = key === "nieko" ? "safe" : "fall".
   Jei konfigūracijoje trūksta rakto ar užrašo, komponentas sako žodžiais
   („Vieta nesuderinta.“) ir rašo console.error — tyliai nepraleidžia (LL-33).
   Sąmoninga riba: modelis atsitiktinumo NETURI — kiekviena kortelė su daiktu
   baigiasi „fall“, o „nieko“ — „safe“. Tai priežasties demonstracija, o ne
   prognozė: gyvenime tas pats šlapias plotas gali baigtis ir be kritimo,
   todėl turinio tekstas sako „gali kliudyti“, o ne „visada nukris“, ir
   mokytojo blokas turi sakyti tą patį (LL-147). Figūrėlė niekada
   nesužeidžiama ir neverda, o sąraše yra kontrolinė kortelė „nieko“ — be
   jos modelis neturėtų nė vieno prieštaraujančio pavyzdžio (LL-28).
   Tariniai tekstai yra `config.sentences` (juos renka
   `scripts/generate_audio.py`), o mygtukų užrašai — `config.labels`:
   mygtukų balsas netariamas, todėl jiems įrašų nereikia. */
const TP_X0 = 44;        // vaiko pradžia
const TP_XSTOP = 134;    // sustojimas prie kliūties (kliūtis prasideda 136)
const TP_XEND = 272;     // saugaus ėjimo pabaiga
const TP_FLOOR = 252;    // grindų viršus
const TP_KID = 0.9;
const TP_OBJ_X = 176;    // kliūties zonos centras (136–216)

const traumosPriezastis = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const place = typeof config.place === "string" ? config.place.trim() : "";
    const causes = Array.isArray(config.causes) ? config.causes.filter(Boolean) : [];

    const esc = (t) => String(t).replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai ------------------------------------------- */
    const problems = [];
    if (!place) problems.push("nėra vietos pavadinimo");
    if (causes.length < 2) problems.push("nėra bent dviejų kortelių");
    causes.forEach((c) => {
      if (!c || !c.key || !c.label || !c.short || !c.note) {
        problems.push(`kortelė „${(c && c.key) || "?"}“ be key/label/short/note`);
      }
    });
    if (!causes.some((c) => c && c.key === "nieko")) {
      problems.push("nėra kontrolinės kortelės „nieko“ — be jos modelis neturi prieštaraujančio pavyzdžio");
    }
    ["guessYes", "guessNo", "walk", "again", "foundTitle", "guessed"].forEach((k) => {
      if (!L[k]) problems.push(`užrašo „${k}“ nėra`);
    });
    ["start", "startNote", "guess", "guessNote", "readyNote", "safe", "fall",
      "tableNote", "full", "fullNote", "reset"].forEach((k) => {
      if (!S[k]) problems.push(`sakinio „${k}“ nėra`);
    });
    if (problems.length) {
      console.error(`traumos-priezastis: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Vieta nesuderinta.</p>';
      controls.innerHTML = "";
      return null;
    }

    const state = { causeKey: null, guess: null, walked: null };
    const rows = new Map();          // raktas -> „safe“ | „fall“ (lentelė)
    let kidX = TP_X0;
    let animating = false;
    let raf = 0;
    let reported = false;

    const causeOf = (key) => causes.find((c) => c.key === key) || null;
    const outcomeOf = (key) => (key === "nieko" ? "safe" : "fall");

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(20.5rem,100%);margin:0 auto">
        <p id="tp-guess-line" style="margin:0 0 .3rem;min-width:0;text-align:center;font-weight:800;
           font-size:.9rem;line-height:1.2;overflow-wrap:anywhere;color:var(--ink-soft)"></p>
        <svg id="tp-scene" viewBox="0 0 328 300" width="100%"
             style="display:block;max-width:328px;height:auto;margin:0 auto"
             role="img" aria-label="Koridoriaus atkarpa. Kelyje nieko nėra."></svg>
        <div id="tp-table" style="margin-top:.25rem;min-width:0"></div>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.6rem;width:100%;max-width:34rem;margin:0 auto;min-width:0">
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;font-weight:800;text-align:center;font-size:.92rem">Kas yra kelyje?</p>
          <div id="tp-cards" role="group" aria-label="Kas yra kelyje"
               style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr));
               gap:.4rem;min-width:0"></div>
        </div>
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;font-weight:800;text-align:center;font-size:.92rem">Ar ėjimas baigsis saugiai?</p>
          <div id="tp-guess" role="group" aria-label="Tavo spėjimas"
               style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem;min-width:0"></div>
        </div>
        <div style="display:flex;gap:.45rem;justify-content:center;flex-wrap:wrap;min-width:0">
          <button class="btn" type="button" id="tp-walk"
                  style="flex:1 1 9rem;min-width:0;min-height:52px">${esc(L.walk)}</button>
          <button class="btn ghost" type="button" id="tp-again"
                  style="flex:0 1 8rem;min-width:0;min-height:52px">${esc(L.again)}</button>
        </div>
      </div>`;

    /* Kortelės kuriamos iš `config.causes[]` — jų skaičius ir žodžiai ateina
       iš turinio, o ne iš kodo (LL-61). */
    const cardsEl = controls.querySelector("#tp-cards");
    const guessEl = controls.querySelector("#tp-guess");
    const walkBtn = controls.querySelector("#tp-walk");
    const againBtn = controls.querySelector("#tp-again");
    const svg = stage.querySelector("#tp-scene");
    const guessLine = stage.querySelector("#tp-guess-line");
    const tableEl = stage.querySelector("#tp-table");

    cardsEl.innerHTML = causes.map((c) =>
      `<button type="button" class="btn secondary" data-cause="${esc(c.key)}" aria-pressed="false"
        style="min-width:0;min-height:56px;height:auto;padding:.35rem .3rem;font-size:.92rem;
        line-height:1.15;overflow-wrap:anywhere">${esc(c.label)}</button>`).join("");

    guessEl.innerHTML = `
      <button type="button" class="btn secondary" data-guess="yes" aria-pressed="false"
        style="min-width:0;min-height:56px;padding:.35rem .25rem;font-size:.95rem">${esc(L.guessYes)}</button>
      <button type="button" class="btn secondary" data-guess="no" aria-pressed="false"
        style="min-width:0;min-height:56px;padding:.35rem .25rem;font-size:.95rem">${esc(L.guessNo)}</button>`;

    const cardBtns = Array.from(cardsEl.querySelectorAll("button[data-cause]"));
    const guessBtns = Array.from(guessEl.querySelectorAll("button[data-guess]"));

    /* --- piešinys ---------------------------------------------------- */

    /* Kliūtis visada toje pačioje zonos vietoje. Tai modelio teiginys, o ne
       dekoracija: pasikeitusi yra tik kliūtis, o vieta ir ėjimas lieka tie
       patys. Žodis prie kliūties yra todėl, kad spalva niekada nebūtų
       vienintelė informacijos nešėja (tamsus ruožas be užrašo nieko nesako). */
    function objectMarkup(c) {
      const caption = (text) => `<text x="${TP_OBJ_X}" y="228" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#3a342b">${esc(text)}</text>`;
      if (!c) return "";
      if (c.key === "slapia") {
        return `${art.river(136, 240, 80, 12, "tp")}${caption(c.short)}`;
      }
      if (c.key === "kuprine") {
        return `${art.block(156, 222, 30, "#d97a45", "", "#8f4a21")}
          ${art.block(164, 238, 14, "#b85f2f", "", "#8f4a21")}${caption(c.short)}`;
      }
      if (c.key === "tamsu") {
        return `${art.block(136, 236, 80, 16, "#3c4350", "", "#22262e")}${caption(c.short)}`;
      }
      return caption(c.short);   // „nieko“ — kelyje tikrai nieko nėra
    }

    function pathMarkup() {
      if (!state.walked) return "";
      if (state.walked.outcome === "safe") {
        return `<path d="M${TP_X0} 258 H${TP_XEND}" fill="none" stroke="#3a4a5a" stroke-width="3.5"
              stroke-linecap="round" stroke-dasharray="8 6"/>
          <path d="M${TP_XEND - 2} 251 L${TP_XEND + 11} 258 L${TP_XEND - 2} 265 Z" fill="#3a4a5a"/>`;
      }
      /* Kelias nutrūksta ties kliūtimi: brūkšnys baigiasi, o per jį eina
         trūkio ženklas. Jis nėra vienintelis informacijos šaltinis —
         `readout` tą patį sako žodžiu („Kliudė.“). */
      return `<path d="M${TP_X0} 258 H${TP_XSTOP}" fill="none" stroke="#3a4a5a" stroke-width="3.5"
            stroke-linecap="round" stroke-dasharray="8 6"/>
        <path d="M${TP_XSTOP - 5} 250 L${TP_XSTOP + 7} 266 M${TP_XSTOP + 7} 250 L${TP_XSTOP - 5} 266"
              fill="none" stroke="#b23a2e" stroke-width="3.2" stroke-linecap="round"/>`;
    }

    function sceneMarkup() {
      const c = state.causeKey ? causeOf(state.causeKey) : null;
      const fell = !!state.walked && state.walked.outcome !== "safe";
      const kid = `<g${fell ? ` transform="rotate(-16 ${kidX} ${TP_FLOOR})"` : ""}>`
        + `${art.kid(kidX, TP_FLOOR, TP_KID)}</g>`;
      return `${art.defs("tp")}
        ${art.plank(10, 268, 308, 16)}
        ${pathMarkup()}
        ${objectMarkup(c)}
        ${kid}`;
    }

    function sceneLabel() {
      const c = state.causeKey ? causeOf(state.causeKey) : null;
      const what = c ? `Kelyje: ${c.short}.` : "Kelyje nieko nėra.";
      const end = !state.walked ? "Vaikas dar neėjo."
        : state.walked.outcome === "safe" ? "Ėjimas baigėsi saugiai." : "Ėjimas nutrūko ties kliūtimi.";
      return `${place}. ${what} ${end}`;
    }

    function tableMarkup() {
      const done = causes.filter((c) => rows.has(c.key));
      const items = done.map((c) => {
        const word = rows.get(c.key) === "safe" ? S.safe : S.fall;
        return `<li style="margin:.1rem 0;overflow-wrap:anywhere">`
          + `<strong>${esc(c.short)}</strong> — ${esc(word)}</li>`;
      }).join("");
      return `<p style="margin:.4rem 0 .15rem;font-size:.8rem;font-weight:800;text-align:center;
          color:var(--ink-soft);overflow-wrap:anywhere">${esc(L.foundTitle)} · ${esc(place)}</p>`
        + (items ? `<ul style="margin:0;padding-left:1.1rem;font-size:.86rem;line-height:1.3">${items}</ul>` : "");
    }

    function drawScene() {
      svg.innerHTML = sceneMarkup();
    }

    /* --- būsena ------------------------------------------------------ */

    function message() {
      if (!state.causeKey) return { readout: S.start, note: S.startNote };
      if (!state.guess) return { readout: S.guess, note: S.guessNote };
      if (!state.walked) return { readout: S.guess, note: S.readyNote };
      const c = causeOf(state.causeKey);
      const word = state.walked.outcome === "safe" ? S.safe : S.fall;
      const full = rows.size >= causes.length;
      return {
        readout: full ? `${word} ${S.full}` : word,
        note: `${c.note} ${full ? S.fullNote : S.tableNote}`,
      };
    }

    function render(focusSel) {
      drawScene();
      svg.setAttribute("aria-label", sceneLabel());
      tableEl.innerHTML = tableMarkup();
      guessLine.textContent = state.guess
        ? `${L.guessed}: ${state.guess === "yes" ? L.guessYes : L.guessNo}`
        : "";

      for (const b of cardBtns) {
        const on = b.dataset.cause === state.causeKey;
        const c = causeOf(b.dataset.cause);
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "";
        b.setAttribute("aria-label", `${c.label}. ${rows.has(c.key)
          ? "Šitą jau bandei, bet gali bandyti dar kartą." : "Pasirink, kas yra kelyje."}`);
      }
      for (const b of guessBtns) {
        const on = state.guess === b.dataset.guess;
        b.disabled = !state.causeKey || !!state.walked || animating;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "";
        b.setAttribute("aria-label", state.walked
          ? "Šis ėjimas jau įrašytas — rinkis kitą daiktą"
          : state.causeKey ? `Spėk: ${b.textContent}` : "Pirma pasirink, kas yra kelyje");
      }

      /* LL-32: fokusas niekada nelieka ant išjungto valdiklio. Todėl „Eik“
         išjungiamas tik tada, kai yra į kur jį perkelti, o `focusSel`
         nurodo gyvą elementą. */
      walkBtn.disabled = !state.causeKey || !state.guess || !!state.walked || animating;
      walkBtn.setAttribute("aria-label", !state.causeKey
        ? "Pirma pasirink, kas yra kelyje"
        : !state.guess ? "Pirma spėk, ar ėjimas baigsis saugiai"
          : state.walked ? "Šitas ėjimas jau įrašytas" : "Eik ir pažiūrėk, kuo baigsis");
      againBtn.setAttribute("aria-label", "Pradėk iš naujo. Lentelė lieka.");

      const m = message();
      api.readout(m.readout);
      api.note(m.note);

      if (focusSel) {
        const el = controls.querySelector(focusSel);
        if (el && !el.disabled) el.focus();
      }
    }

    /* --- veiksmai ---------------------------------------------------- */

    function chooseCause(key) {
      if (animating || !causeOf(key)) return;
      cancelAnimationFrame(raf);
      state.causeKey = key;
      state.guess = null;
      state.walked = null;
      kidX = TP_X0;
      api.speak(S.guess, { rate: 0.92 });
      render("#tp-guess button");
    }

    function chooseGuess(value) {
      if (animating || !state.causeKey || state.walked) return;
      state.guess = value === "yes" ? "yes" : "no";
      render("#tp-walk");
    }

    function walk() {
      if (animating || !state.causeKey || !state.guess || state.walked) return;
      const c = causeOf(state.causeKey);
      const outcome = outcomeOf(c.key);
      const target = outcome === "safe" ? TP_XEND : TP_XSTOP;

      const finish = () => {
        animating = false;
        kidX = target;
        state.walked = { key: c.key, outcome };
        rows.set(c.key, outcome);
        /* Sėkmės sąlyga — DABARTINĖ lentelės būsena (visos eilutės), o ne
           prisiminimas, kad kažkas kadaise buvo įrašyta (LL-17). */
        if (rows.size >= causes.length && !reported) {
          reported = true;
          api.progress({ correct: true });
        }
        api.speak(outcome === "safe" ? S.safe : S.fall, { rate: 0.92 });
        render("#tp-again");
      };

      const reduce = typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        kidX = target;
        finish();
        return;
      }

      /* Judėjimas yra vienas ir tas pats — keičiasi tik tai, kur jis
         sustoja. Per kadrą keičiamas TIK piešinys: `readout` ir `aria-label`
         atnaujinami po ėjimo, kad ekrano skaitytuvas nekalbėtų kiekvieno
         kadro (LL-14). */
      animating = true;
      walkBtn.disabled = true;
      const from = kidX;
      const t0 = performance.now();
      const DUR = 700;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / DUR);
        kidX = from + (target - from) * k;
        drawScene();
        if (k < 1) { raf = requestAnimationFrame(step); return; }
        finish();
      };
      raf = requestAnimationFrame(step);
    }

    function reset() {
      cancelAnimationFrame(raf);
      animating = false;
      state.causeKey = null;
      state.guess = null;
      state.walked = null;
      kidX = TP_X0;
      api.speak(S.reset, { rate: 0.92 });
      /* Lentelė sąmoningai NEBEtuštinama (LL-16): „Iš naujo“ atstato sceną,
         o ne ištrina tai, ką vaikas jau sužinojo. */
      const untried = causes.find((c) => !rows.has(c.key));
      render(untried ? `button[data-cause="${untried.key}"]` : "button[data-cause]");
    }

    cardsEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-cause]");
      if (b && !b.disabled) chooseCause(b.dataset.cause);
    });
    guessEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-guess]");
      if (b && !b.disabled) chooseGuess(b.dataset.guess);
    });
    walkBtn.addEventListener("click", walk);
    againBtn.addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); return; }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const group = e.target.closest("#tp-cards, #tp-guess");
      if (!group) return;
      const btns = [...group.querySelectorAll("button")].filter((b) => !b.disabled);
      if (btns.length < 2) return;
      const idx = btns.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      btns[(idx + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length].focus();
    });

    render();
    return () => { cancelAnimationFrame(raf); animating = false; };
  },
};

/* --- Apsauga dengia tik savo vietą (1 klasė, 26.1.1) -------------------
   Programa 26.1.1 „Saugus elgesys“ prašo projekto „Kaip išvengti traumų?“,
   kurio tikslas — išsiaiškinti, kaip kūno dalį galima apsaugoti nuo traumų
   (`sources/pradinio-bp-rekomendacijos-2024.txt:14960–14966`). Platformoje
   priežastį jau rodo 25 „Trauma turi priežastį“; kaip apsauga priglunda prie
   kūno, nerodė niekas.
   Klaidinga nuostata, kurią modelis griauja: „svarbu turėti apsaugą, o kur ji
   uždėta — nesvarbu“. Todėl kinta VIENAS dalykas — antkelių vieta
   (`keliai | blauzdos | grindys | niekur`), o vaikas, takas ir kritimas
   nesikeičia. Dengimo išvada IŠVEDAMA iš palyginimo, o ne įrašyta kortelėje:
     covered(place) = place === activity.contact.
   Žemę pasiekiantis taškas imamas iš TOS PAČIOS figūrėlės geometrijos
   (`TA_KNEE`), todėl žvaigždė, kelio vieta ir tekstas sutampa (LL-03, LL-24):
   jei padą nupieštume atskirai nuo taško, vaikas matytų žvaigždę šalia
   apsaugos.
   Vietos vardai yra komponento sutartis: `keliai` ir `blauzdos` — padai ant
   kojos, `grindys` — padai guli prie vaiko, `""` — apsaugos nėra. Nežinomą
   vietą komponentas sako žodžiais („Vieta nesuderinta.“) ir rašo
   console.error, o ne tyliai nupiešia padą prie kelio (LL-33).
   Sąmoninga riba: modelis rodo, ar dalis uždengta, bet ne traumos sunkumą;
   kritimo kryptis (į priekį, žemę pasiekia keliai) yra modelio prielaida,
   todėl tekstas sako „dengta“, o ne „visiškai saugu“ (LL-18, LL-147). */
const TA_FLOOR = 252;                 // grindų viršus
const TA_X = 124;                     // figūrėlės pėdų taškas
const TA_S = 2.4;                     // figūrėlės mastelis
const TA_TILT = 24;                   // kritimo pasvirimas (laipsniai)
const TA_KNEE = { x: 7, y: -6.4 };    // priekinis kelio taškas figūrėlės koordinatėse
const TA_PADS = { keliai: -6.4, blauzdos: -2.6, grindys: null, "": null };

const traumosApsauga = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const act = config.activity || {};
    const items = Array.isArray(config.gear) ? config.gear.filter(Boolean) : [];
    /* Užrašai apie vietą laikomi `sentences.gearNotes` — tada juos renka
       `generate_audio.py` ir vaikas girdi tą patį balsą, o ne naršyklės
       sintezę. Atskira `gear[].note` kopija būtų antras to paties sakinio
       šaltinis (LL-33). */
    const notes = S.gearNotes || {};

    const esc = (t) => String(t).replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai ------------------------------------------- */
    const contact = typeof act.contact === "string" ? act.contact.trim() : "";
    const problems = [];
    if (!act.label) problems.push("nėra vietos pavadinimo");
    if (!contact) problems.push("nėra kūno dalies, kurią pasiekia žemė (activity.contact)");
    if (items.length < 3) problems.push("kortelių mažiau nei trys");
    items.forEach((g) => {
      if (!g || !g.key || !g.label || !g.short) {
        problems.push(`kortelė „${(g && g.key) || "?"}“ be key/label/short`);
      } else if (!(String(g.place) in TA_PADS)) {
        problems.push(`kortelės „${g.key}“ vieta „${g.place}“ nežinoma (keliai | blauzdos | grindys | "")`);
      } else if (typeof notes[g.key] !== "string" || !notes[g.key].trim()) {
        problems.push(`kortelės „${g.key}“ užrašo nėra (sentences.gearNotes.${g.key})`);
      }
    });
    if (!items.some((g) => g && g.place === contact)) {
      problems.push("nėra kortelės, kuri dengtų tą dalį, kurią pasiekia žemė — be jos modelis neturi teigiamo pavyzdžio (LL-28)");
    }
    if (!items.some((g) => g && g.place !== contact)) {
      problems.push("nėra kortelės, kuri nedengtų — be jos modelis neturi prieštaraujančio pavyzdžio (LL-28)");
    }
    ["cardTitle", "fall", "again", "foundTitle", "coveredWord", "openWord", "noChoice"].forEach((k) => {
      if (!L[k]) problems.push(`užrašo „${k}“ nėra`);
    });
    ["start", "startNote", "placed", "placedNote", "contact", "covered", "uncovered",
      "notYet", "tableNote", "full", "fullNote", "reset"].forEach((k) => {
      if (!S[k]) problems.push(`sakinio „${k}“ nėra`);
    });
    if (problems.length) {
      console.error(`traumos-apsauga: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Vieta nesuderinta.</p>';
      controls.innerHTML = "";
      return null;
    }

    const state = { gearKey: null, angle: 0, fallen: false, animating: false };
    const rows = new Map();        // raktas -> dengta (true) / be dangos (false)
    let raf = 0;
    let reported = false;

    const gearOf = (key) => items.find((g) => g.key === key) || null;
    const coveredBy = (g) => !!g && g.place === contact;

    /* --- geometrija -------------------------------------------------- */

    /* Kelio taškas pasaulyje. Pasukimas ir taškas imami iš tų pačių skaičių,
       todėl žvaigždė nukrenta būtent ten, kur yra kelias (LL-03). */
    function kneeAt(angle) {
      const rad = (Math.PI / 180) * angle;
      const kx = TA_KNEE.x * TA_S;
      const ky = TA_KNEE.y * TA_S;
      const c = Math.cos(rad);
      const s = Math.sin(rad);
      return { x: TA_X + kx * c - ky * s, y: TA_FLOOR + kx * s + ky * c };
    }

    function padShape(cx, cy) {
      return `<g>
        <rect x="${(cx - 2.8).toFixed(1)}" y="${(cy - 1.9).toFixed(1)}" width="5.6" height="3.8"
              rx="1.8" fill="#3b4653" stroke="#20262e" stroke-width="0.9"/>
        <path d="M${(cx - 1.8).toFixed(1)} ${(cy - 0.4).toFixed(1)} h3.6" stroke="#a8bccd"
              stroke-width="0.9" stroke-linecap="round" opacity=".9"/>
      </g>`;
    }

    /* Padai piešiami figūrėlės koordinatėse, todėl pasisuka kartu su kūnu.
       Skirtumas tarp „ant kelio“ ir „ant blauzdos“ yra keli pikseliai — tai
       ir yra modelio teiginys, todėl abi vietos turi girdrą atstumą
       (kelias -6, blauzda -2), o ne vienas taškas. */
    function gearMarkup(g) {
      if (!g) return "";
      const y = TA_PADS[g.place];
      if (y === null || y === undefined) return "";
      return padShape(-3.5, y) + padShape(3.5, y);
    }

    function floorPadsMarkup(g) {
      if (!g || g.place !== "grindys") return "";
      return `<g transform="translate(70 244) rotate(-8)">
        <rect x="0" y="0" width="11" height="8" rx="3" fill="#3b4653" stroke="#20262e" stroke-width="1.1"/>
        <rect x="13.5" y="1.5" width="11" height="8" rx="3" fill="#3b4653" stroke="#20262e" stroke-width="1.1"/>
      </g>`;
    }

    function starMarkup(p, covered) {
      const pts = [];
      for (let i = 0; i < 8; i += 1) {
        const ang = (Math.PI / 4) * i - Math.PI / 2;
        const r = i % 2 ? 2.4 : 5.6;
        pts.push(`${(p.x + r * Math.cos(ang)).toFixed(1)},${(p.y + r * Math.sin(ang)).toFixed(1)}`);
      }
      return `<polygon points="${pts.join(" ")}" fill="${covered ? "#2f6b45" : "#b23a2e"}"
              stroke="#ffffff" stroke-width="1.2" opacity=".95"/>`;
    }

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(20.5rem,100%);margin:0 auto">
        <svg id="ta-scene" viewBox="0 0 328 300" width="100%"
             style="display:block;max-width:328px;height:auto;margin:0 auto"
             role="img" aria-label="Kiemo takas. Apsauga dar nepasirinkta."></svg>
        <div id="ta-table" style="margin-top:.25rem;min-width:0"></div>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.6rem;width:100%;max-width:34rem;margin:0 auto;min-width:0">
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;font-weight:800;text-align:center;font-size:.92rem">${esc(L.cardTitle)}</p>
          <div id="ta-cards" role="group" aria-label="${esc(L.cardTitle)}"
               style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr));
               gap:.4rem;min-width:0"></div>
        </div>
        <div style="display:flex;gap:.45rem;justify-content:center;flex-wrap:wrap;min-width:0">
          <button class="btn" type="button" id="ta-fall"
                  style="flex:1 1 9rem;min-width:0;min-height:52px">${esc(L.fall)}</button>
          <button class="btn ghost" type="button" id="ta-again"
                  style="flex:0 1 8rem;min-width:0;min-height:52px">${esc(L.again)}</button>
        </div>
      </div>`;

    const cardsEl = controls.querySelector("#ta-cards");
    const fallBtn = controls.querySelector("#ta-fall");
    const againBtn = controls.querySelector("#ta-again");
    const svg = stage.querySelector("#ta-scene");
    const tableEl = stage.querySelector("#ta-table");

    cardsEl.innerHTML = items.map((g) =>
      `<button type="button" class="btn secondary" data-gear="${esc(g.key)}" aria-pressed="false"
        style="min-width:0;min-height:56px;height:auto;padding:.35rem .3rem;font-size:.92rem;
        line-height:1.15;overflow-wrap:anywhere">${esc(g.label)}</button>`).join("");
    const cardBtns = Array.from(cardsEl.querySelectorAll("button[data-gear]"));

    /* --- piešinys ---------------------------------------------------- */

    function sceneMarkup() {
      const g = state.gearKey ? gearOf(state.gearKey) : null;
      const covered = coveredBy(g);
      const p = kneeAt(state.angle);
      return `${art.defs("ta")}
        ${art.plank(12, 266, 304, 14)}
        ${floorPadsMarkup(g)}
        <g transform="rotate(${state.angle.toFixed(2)} ${TA_X} ${TA_FLOOR})">
          ${art.kid(TA_X, TA_FLOOR, TA_S)}
          ${gearMarkup(g)}
        </g>
        ${state.fallen ? starMarkup(p, covered) : ""}
        ${state.fallen ? `<text x="${(p.x + 12).toFixed(1)}" y="${(TA_FLOOR - 4).toFixed(1)}"
              font-family="system-ui, sans-serif" font-size="14" font-weight="800"
              fill="#3a342b">${esc(act.contactLabel)}</text>` : ""}`;
    }

    function drawScene() {
      svg.innerHTML = sceneMarkup();
    }

    function sceneLabel() {
      const g = state.gearKey ? gearOf(state.gearKey) : null;
      const covered = coveredBy(g);
      const where = g ? notes[g.key] : L.noChoice;
      const end = state.fallen
        ? `${S.contact} ${covered ? `${L.coveredWord}.` : `${L.openWord}.`}`
        : S.notYet;
      return `${act.label}. ${where} ${end}`;
    }

    function tableMarkup() {
      const done = items.filter((g) => rows.has(g.key));
      const list = done.map((g) => `<li style="margin:.1rem 0;overflow-wrap:anywhere">`
        + `<strong>${esc(g.short)}</strong> — ${esc(rows.get(g.key) ? L.coveredWord : L.openWord)}</li>`).join("");
      return `<p style="margin:.4rem 0 .15rem;font-size:.8rem;font-weight:800;text-align:center;
          color:var(--ink-soft);overflow-wrap:anywhere">${esc(L.foundTitle)} · ${esc(act.contactLabel)}</p>`
        + (list ? `<ul style="margin:0;padding-left:1.1rem;font-size:.86rem;line-height:1.3">${list}</ul>` : "");
    }

    /* --- būsena ------------------------------------------------------ */

    function message() {
      const g = state.gearKey ? gearOf(state.gearKey) : null;
      if (!g) return { readout: S.start, note: S.startNote };
      const covered = coveredBy(g);
      if (!state.fallen) return { readout: S.placed, note: `${notes[g.key]} ${S.placedNote}` };
      const word = covered ? S.covered : S.uncovered;
      const full = rows.size >= items.length;
      return {
        readout: full ? `${word} ${S.full}` : word,
        note: `${S.contact} ${notes[g.key]} ${full ? S.fullNote : S.tableNote}`,
      };
    }

    function render(focusSel) {
      const g = state.gearKey ? gearOf(state.gearKey) : null;
      const covered = coveredBy(g);
      drawScene();
      svg.setAttribute("aria-label", sceneLabel());
      tableEl.innerHTML = tableMarkup();

      for (const b of cardBtns) {
        const item = gearOf(b.dataset.gear);
        const on = item.key === state.gearKey;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "";
        b.setAttribute("aria-label", `${item.label}. ${rows.has(item.key)
          ? "Šitą jau bandei, bet gali bandyti dar kartą." : "Pasirink šią vietą."}`);
      }

      /* LL-32: fokusas niekada nelieka ant išjungto valdiklio. */
      fallBtn.disabled = !g || state.fallen || state.animating;
      fallBtn.setAttribute("aria-label", !g
        ? "Pirma pasirink, kur užsegti antkelius"
        : state.fallen ? "Šis kritimas jau įrašytas — rinkis kitą vietą"
          : "Krentu ir žiūrėk, kuri dalis liečia žemę");
      againBtn.setAttribute("aria-label", "Pradėk iš naujo. Lentelė lieka.");

      const m = message();
      api.readout(m.readout);
      api.note(m.note);

      if (focusSel) {
        const el = controls.querySelector(focusSel);
        if (el && !el.disabled) el.focus();
      }
      return covered;
    }

    /* --- veiksmai ---------------------------------------------------- */

    function chooseGear(key) {
      if (state.animating || !gearOf(key)) return;
      cancelAnimationFrame(raf);
      state.gearKey = key;
      state.fallen = false;
      state.angle = 0;
      const g = gearOf(key);
      api.speak(notes[g.key], { rate: 0.92 });
      render("#ta-fall");
    }

    function fall() {
      if (state.animating || !state.gearKey || state.fallen) return;
      const g = gearOf(state.gearKey);
      const covered = coveredBy(g);

      const finish = () => {
        state.animating = false;
        state.angle = TA_TILT;
        state.fallen = true;
        rows.set(g.key, covered);
        /* Sėkmės sąlyga — DABARTINĖ lentelės būsena (visos eilutės), o ne
           prisiminimas, kad kažkas kadaise buvo įrašyta (LL-17). */
        if (rows.size >= items.length && !reported) {
          reported = true;
          api.progress({ correct: true });
        }
        api.speak(covered ? S.covered : S.uncovered, { rate: 0.92 });
        render("#ta-again");
      };

      const reduce = typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) { finish(); return; }

      /* Per kadrą keičiamas TIK piešinys: `readout` ir `aria-label`
         atnaujinami po kritimo, kad ekrano skaitytuvas nekalbėtų kiekvieno
         kadro (LL-14). */
      state.animating = true;
      fallBtn.disabled = true;
      const t0 = performance.now();
      const DUR = 420;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / DUR);
        state.angle = TA_TILT * k;
        drawScene();
        if (k < 1) { raf = requestAnimationFrame(step); return; }
        finish();
      };
      raf = requestAnimationFrame(step);
    }

    function reset() {
      cancelAnimationFrame(raf);
      state.animating = false;
      state.gearKey = null;
      state.fallen = false;
      state.angle = 0;
      api.speak(S.reset, { rate: 0.92 });
      /* Lentelė sąmoningai NEBEtuštinama (LL-16): „Iš naujo“ atstato sceną,
         o ne ištrina tai, ką vaikas jau sužinojo. */
      const untried = items.find((g) => !rows.has(g.key));
      render(untried ? `button[data-gear="${untried.key}"]` : "button[data-gear]");
    }

    cardsEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-gear]");
      if (b && !b.disabled) chooseGear(b.dataset.gear);
    });
    fallBtn.addEventListener("click", fall);
    againBtn.addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); return; }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const group = e.target.closest("#ta-cards");
      if (!group) return;
      const btns = [...group.querySelectorAll("button")].filter((b) => !b.disabled);
      if (btns.length < 2) return;
      const idx = btns.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      btns[(idx + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length].focus();
    });

    render();
    return () => { cancelAnimationFrame(raf); state.animating = false; };
  },
};

/* --- Dienos režimas ir mityba (1 klasė, 26.1.2) ------------------------
   Modelis: rytas nuo kėlimosi iki išėjimo į mokyklą. Vaikas keičia VIENĄ
   dalyką — kėlimosi laiką. Visi kiti dydžiai nekinta: pasiruošimas (5 min.),
   rengimasis (25 min.), ėjimas į mokyklą (10 min.) ir išėjimo laikas 7:45.
   Todėl pusryčiams liekantis laikas IŠVEDAMAS, o ne įrašytas:
   `breakfast = departure - wake - (keltis + rengimasis + ėjimas)`.
   Klaidinga nuostata, kurią modelis griauja: „jei prabundu vėliau, viską
   spėsiu, tik darysiu greičiau“ — laikas atimamas iš pusryčių, o ne iš
   rengimosi, ir ilgainiui pusryčių nebelieka visai. Tai matoma kaip
   mažėjanti lėkštė, o ne kaip vertinimas, ar vaikas „gerai“ pasielgė.
   Sąmoningos ribos: modelis rodo TIK rytą (ne visą parą), neskaičiuoja
   miego trukmės ir neverčia vaiko nieko daryti greičiau — greitis nėra
   kintamasis, nes jo negalima pamatuoti sąžiningai (LL-18). */
const DR_START = 6 * 60 + 30;      // ašis prasideda 6:30
const DR_END = 8 * 60 + 10;        // ašis baigiasi 8:10
const DR_X0 = 24;
const DR_X1 = 304;
const DR_Y = 156;                  // juostos viršus
const DR_H = 26;
const DR_DEPART = 8 * 60;          // išėjimas į mokyklą
const DR_FIXED = 5 + 25 + 10;      // keltis + rengimasis + ėjimas

const drX = (min) => DR_X0 + ((min - DR_START) * (DR_X1 - DR_X0)) / (DR_END - DR_START);

const drClock = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;

const drParse = (text) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(text).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (!(h >= 0 && h <= 23 && mi >= 0 && mi <= 59)) return null;
  return h * 60 + mi;
};

const dienosJuosta = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const raw = Array.isArray(config.wakeTimes) ? config.wakeTimes : [];
    const wakes = raw.map((t) => ({ text: String(t), min: drParse(t) }));

    const problems = [];
    if (wakes.length < 3) problems.push("kėlimosi laikų mažiau nei trys");
    wakes.forEach((w) => {
      if (w.min === null) problems.push(`laikas „${w.text}“ ne HH:MM formato`);
      else if (w.min < DR_START || w.min >= DR_DEPART) problems.push(`laikas „${w.text}“ už ašies ribų`);
    });
    ["wakeTitle", "guessTitle", "guessed", "yes", "no", "show", "again", "depart"].forEach((k) => {
      if (!L[k]) problems.push(`užrašo „${k}“ nėra`);
    });
    ["start", "startNote", "askGuess", "guessNote", "inTime", "none", "noteMid", "done", "doneNote", "reset"]
      .forEach((k) => { if (!S[k]) problems.push(`sakinio „${k}“ nėra`); });
    if (problems.length) {
      console.error(`dienos-juosta: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Rytas nesuderintas su laikais.</p>';
      controls.innerHTML = "";
      return null;
    }

    const init = wakes.findIndex((w) => w.min !== null);
    const state = { idx: init, guess: null };
    const tried = new Map();          // kėlimosi laikas -> pusryčių min.
    let reported = false;

    const breakfastOf = (wake) => DR_DEPART - wake - DR_FIXED;

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(21rem,100%);margin:0 auto">
        <p id="dr-guess" style="margin:0 0 .3rem;min-width:0;text-align:center;font-weight:800;
           font-size:.88rem;line-height:1.2;overflow-wrap:anywhere;color:var(--ink-soft)"></p>
        <svg id="dr-scene" viewBox="0 0 328 280" width="100%"
             style="display:block;max-width:328px;height:auto;margin:0 auto"
             role="img" aria-label="Ryto juosta nuo 6:30 iki 8:00."></svg>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.55rem;width:100%;max-width:34rem;margin:0 auto;min-width:0">
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;font-weight:800;text-align:center;font-size:.9rem">${L.wakeTitle}</p>
          <div id="dr-wakes" role="group" aria-label="${L.wakeTitle}"
               style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,4.6rem),1fr));
               gap:.35rem;min-width:0"></div>
        </div>
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;font-weight:800;text-align:center;font-size:.9rem">${L.guessTitle}</p>
          <div id="dr-guess-row" role="group" aria-label="${L.guessTitle}"
               style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem;min-width:0"></div>
        </div>
        <div style="display:flex;gap:.4rem;justify-content:center;flex-wrap:wrap;min-width:0">
          <button class="btn" type="button" id="dr-show"
                  style="flex:1 1 8rem;min-width:0;min-height:52px">${L.show}</button>
          <button class="btn ghost" type="button" id="dr-again"
                  style="flex:0 1 7rem;min-width:0;min-height:52px">${L.again}</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#dr-scene");
    const guessLine = stage.querySelector("#dr-guess");
    const wakeEl = controls.querySelector("#dr-wakes");
    const guessEl = controls.querySelector("#dr-guess-row");
    const showBtn = controls.querySelector("#dr-show");
    const againBtn = controls.querySelector("#dr-again");

    wakeEl.innerHTML = wakes.map((w, i) =>
      `<button type="button" class="btn secondary" data-wake="${i}" aria-pressed="${i === init}"
        style="min-width:0;min-height:56px;padding:.3rem .2rem;font-size:.95rem;
        overflow-wrap:anywhere">${escDr(w.text)}</button>`).join("");
    guessEl.innerHTML = `
      <button type="button" class="btn secondary" data-guess="yes" aria-pressed="false"
        style="min-width:0;min-height:56px;padding:.3rem .2rem;font-size:.95rem">${escDr(L.yes)}</button>
      <button type="button" class="btn secondary" data-guess="no" aria-pressed="false"
        style="min-width:0;min-height:56px;padding:.3rem .2rem;font-size:.95rem">${escDr(L.no)}</button>`;

    const wakeBtns = Array.from(wakeEl.querySelectorAll("button[data-wake]"));
    const guessBtns = Array.from(guessEl.querySelectorAll("button[data-guess]"));

    function escDr(t) {
      return String(t).replace(/[&<>"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    /* Juosta: laiko ašis, trys pastovūs ruožai ir pusryčiai, kurių ilgis
       išvedamas. Ruožo ilgis pikseliais = tos pačios funkcijos, kuri skaičiuoja
       minutes, rezultatas — todėl lėkštė ir sakinys negali prasilenkti. */
    function scene() {
      const cur = wakes[state.idx];
      const wake = cur.min;
      const bf = breakfastOf(wake);
      const cuts = [
        { key: "keltis", min: 5, fill: "#f2b13c", label: "" },
        { key: "rengtis", min: 25, fill: "#8fb8d8", label: "" },
        { key: "valgyti", min: Math.max(0, bf), fill: "#7fc98a", label: "" },
        { key: "eiti", min: 10, fill: "#c98fb8", label: "" },
      ];
      let cursor = wake;
      const segs = cuts.map((c) => {
        if (c.min <= 0) return "";
        const x = drX(cursor);
        const w = Math.max(4, drX(cursor + c.min) - x);
        cursor += c.min;
        const words = c.key === "keltis" ? "keltis" : c.key === "rengtis" ? "rengtis"
          : c.key === "valgyti" ? "pusryčiai" : "kelias";
        const fit = w > 46;
        return `<g><rect x="${x.toFixed(1)}" y="${DR_Y}" width="${w.toFixed(1)}" height="${DR_H}"
                 rx="4" fill="${c.fill}" stroke="#3a342b" stroke-width="1.6"/>
          ${fit ? `<text x="${(x + w / 2).toFixed(1)}" y="${DR_Y + 17}" text-anchor="middle"
                 font-family="system-ui, sans-serif" font-size="10.5" font-weight="800"
                 fill="#26323c">${words}</text>` : ""}</g>`;
      }).join("");

      /* Išėjimo laikas yra kontrolinis taškas: jis nesikeičia nė karto, todėl
         vaikas mato, kad juda ne mokykla, o jo rytas. */
      const dx = drX(DR_DEPART);
      const ticks = [6 * 60 + 30, 7 * 60, 7 * 60 + 30, 8 * 60].map((t) => {
        const x = drX(t);
        return `<line x1="${x.toFixed(1)}" y1="${DR_Y + DR_H + 4}" x2="${x.toFixed(1)}"
                  y2="${DR_Y + DR_H + 10}" stroke="#5c6772" stroke-width="2"/>
          <text x="${x.toFixed(1)}" y="${DR_Y + DR_H + 24}" text-anchor="middle"
                font-family="system-ui, sans-serif" font-size="11" font-weight="700"
                fill="#3a342b">${drClock(t)}</text>`;
      }).join("");

      /* Lėkštė: spindulys iš tų pačių minučių. Minusas — perbraukta lėkštė,
         o ne tuščia vieta, kad dingimas būtų įvardytas, ne nutylėtas. */
      const r = bf > 0 ? Math.min(30, 10 + bf * 0.55) : 0;
      const plate = bf > 0
        ? `<g>${art.ball(64, 224, r, "#f6f1e3", "#b9a87f")}
             <text x="64" y="228" text-anchor="middle" font-family="system-ui, sans-serif"
               font-size="13" font-weight="800" fill="#26323c">${bf} min.</text>
             <text x="110" y="204" font-family="system-ui, sans-serif" font-size="11.5"
               font-weight="700" fill="#3a342b">pusryčiams</text></g>`
        : `<g><circle cx="64" cy="224" r="26" fill="none" stroke="#b23a2e" stroke-width="2.4"
             stroke-dasharray="7 6"/>
           <path d="M46 206 L82 242 M82 206 L46 242" stroke="#b23a2e" stroke-width="3.2"
             stroke-linecap="round"/>
           <text x="104" y="228" font-family="system-ui, sans-serif" font-size="12"
             font-weight="800" fill="#b23a2e">pusryčių nebeliko</text></g>`;

      return `${art.defs("dr")}
        ${art.plank(12, 262, 304, 14)}
        ${segs}
        <line x1="${dx.toFixed(1)}" y1="${DR_Y - 16}" x2="${dx.toFixed(1)}" y2="${DR_Y + DR_H}"
              stroke="#b23a2e" stroke-width="2.6" stroke-dasharray="6 5"/>
        <text x="${dx.toFixed(1)}" y="${DR_Y - 22}" text-anchor="middle"
              font-family="system-ui, sans-serif" font-size="11" font-weight="800"
              fill="#b23a2e">${escDr(L.depart)} ${drClock(DR_DEPART)}</text>
        ${ticks}
        ${plate}`;
    }

    function message() {
      const cur = wakes[state.idx];
      const bf = breakfastOf(cur.min);
      if (state.guess === null) return { readout: S.start, note: S.startNote };
      if (!tried.has(cur.text)) return { readout: S.askGuess, note: S.guessNote };
      const all = tried.size >= wakes.filter((w) => w.min !== null).length;
      /* Skaičius sakinyje imamas iš tos pačios funkcijos, kuri piešia lėkštę,
         todėl sakinys ir lėkštė negali prasilenkti (LL-95 šeima). */
      const word = bf > 0 ? `${bf} min. ${S.inTime}` : S.none;
      return {
        readout: all ? `${word} ${S.done}` : word,
        /* „Kodėl“ po pirmo ryto: anksčiau čia grįždavo pradžios instrukcija,
           todėl vaikas po veiksmo negirdėdavo priežasties (T2.3). */
        note: all ? S.doneNote : S.noteMid,
      };
    }

    function render(focusSel) {
      svg.innerHTML = scene();
      const cur = wakes[state.idx];
      const bf = breakfastOf(cur.min);
      svg.setAttribute("aria-label", `Kėliausi ${cur.text}. Išeinu ${drClock(DR_DEPART)}. `
        + (bf > 0 ? `Pusryčiams liko ${bf} minučių.` : "Pusryčiams laiko neliko."));
      guessLine.textContent = state.guess
        ? `${L.guessed}: ${state.guess === "yes" ? L.yes : L.no}` : "";

      wakeBtns.forEach((b) => {
        const w = wakes[Number(b.dataset.wake)];
        const on = Number(b.dataset.wake) === state.idx;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "";
        b.setAttribute("aria-label", `${w.text}.${tried.has(w.text) ? " Jau bandei." : " Pasirink kėlimosi laiką."}`);
      });
      guessBtns.forEach((b) => {
        const on = state.guess === b.dataset.guess;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "";
        b.disabled = tried.has(cur.text);
        b.setAttribute("aria-label", tried.has(cur.text)
          ? "Šis rytas jau parodytas — rinkis kitą laiką"
          : `Spėk: ${b.textContent}`);
      });
      showBtn.disabled = state.guess === null || tried.has(cur.text);
      showBtn.setAttribute("aria-label", state.guess === null
        ? "Pirma spėk, ar spėsi pavalgyti" : tried.has(cur.text)
          ? "Šis rytas jau parodytas" : "Rodyk rytą ir pažiūrėk, kiek liko pusryčiams");
      againBtn.setAttribute("aria-label", "Pradėk iš naujo. Lėkštės lieka.");

      const m = message();
      api.readout(m.readout);
      api.note(m.note);
      if (focusSel) {
        const el = controls.querySelector(focusSel);
        if (el && !el.disabled) el.focus();
      }
    }

    function chooseWake(i) {
      state.idx = i;
      state.guess = null;
      render("#dr-guess-row button");
    }

    function chooseGuess(v) {
      state.guess = v === "yes" ? "yes" : "no";
      render("#dr-show");
    }

    function show() {
      const cur = wakes[state.idx];
      if (state.guess === null || tried.has(cur.text)) return;
      tried.set(cur.text, breakfastOf(cur.min));
      /* Sėkmės sąlyga — dabartinė lentelė (visi laikai parodyti), ne
         prisiminimas (LL-17); žymima po paskutinio ryto, ne po pirmo (LL-29). */
      if (tried.size >= wakes.filter((w) => w.min !== null).length && !reported) {
        reported = true;
        api.progress({ correct: true });
      }
      api.speak(breakfastOf(cur.min) > 0 ? S.inTime : S.none, { rate: 0.92 });
      const next = wakes.findIndex((w, i) => !tried.has(w.text) && i !== state.idx);
      render(next >= 0 ? `button[data-wake="${next}"]` : "#dr-again");
    }

    function reset() {
      state.guess = null;
      /* Lėkštės sąmoningai netuščios (LL-16): „Iš naujo“ atstato rytą, o ne
         ištrina tai, ką vaikas jau sužinojo. */
      const next = wakes.findIndex((w) => !tried.has(w.text));
      state.idx = next >= 0 ? next : init;
      api.speak(S.reset, { rate: 0.92 });
      render(next >= 0 ? `button[data-wake="${next}"]` : "#dr-again");
    }

    wakeEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-wake]");
      if (b && !b.disabled) chooseWake(Number(b.dataset.wake));
    });
    guessEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-guess]");
      if (b && !b.disabled) chooseGuess(b.dataset.guess);
    });
    showBtn.addEventListener("click", show);
    againBtn.addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); return; }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const group = e.target.closest("#dr-wakes, #dr-guess-row");
      if (!group) return;
      const btns = [...group.querySelectorAll("button")].filter((b) => !b.disabled);
      if (btns.length < 2) return;
      const idx = btns.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      btns[(idx + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length].focus();
    });

    render();
    return () => {};
  },
};

/* ------------------------------------------------------------------ */
/* 15. Bendruomenės — kas priklauso būriui                             */
/* ------------------------------------------------------------------ */
/* Klaidinga nuostata: „bendruomenė — tai tik tie, kurie tokie patys
   kaip aš (šeima, mano draugai)“. Vaikas 6–7 m. dažnai bendruomenę
   supranta kaip „saviškiai“ ir kitokį žmogų laiko svetimu.
   Modelis turi vieną kintamąjį — pasirinktą bendruomenę. Iš jo kyla
   dvi pasekmės, kurių tekstas vienas neparodo:
     1) tas pats žmogus (Emilis) pažymimas keliose bendruomenėse;
     2) toje pačioje bendruomenėje būna skirtingų žmonių (mokytoja ir
        vaikas, Ajus, kurio šeimoje namuose kalbama kita kalba).
   Todėl bendruomenę sieja bendras reikalas, o ne vienodumas.
   Sąrašas „kiek bendruomenių“ rodomas tik apžiūrėjus visas: kitaip jis
   būtų skaičiavimas prieš supratimą. */
const bendruomenes = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const peopleCfg = Array.isArray(config.people) ? config.people : [];
    const circlesCfg = Array.isArray(config.circles) ? config.circles : [];

    const ids = peopleCfg.map((p) => p && p.id);
    const uniqueIds = new Set(ids);
    const valid = peopleCfg.length >= 3
      && circlesCfg.length >= 2
      && uniqueIds.size === ids.length
      && peopleCfg.every((p) => p && p.id && p.label && p.emoji)
      && circlesCfg.every((c) => c && c.id && c.label && c.shared
        && Array.isArray(c.members) && c.members.length > 0
        && c.members.every((m) => uniqueIds.has(m)));
    const circleIds = circlesCfg.map((c) => c && c.id);
    if (!valid || new Set(circleIds).size !== circleIds.length) {
      console.error("bendruomenes: žmogus be label/emoji arba bendruomenė be narių / su nežinomu žmogumi.");
      stage.innerHTML = '<p class="sim-note" style="text-align:center">Bendruomenės nesuderintos su žmonėmis.</p>';
      controls.innerHTML = "";
      return null;
    }

    const visited = new Set();
    let reported = false;      // api.progress — vieną kartą, apžiūrėjus visas (LL-17)
    let active = null;
    const personById = (id) => peopleCfg.find((p) => p.id === id);
    const circleById = (id) => circlesCfg.find((c) => c.id === id);
    const membersOf = (id) => new Set(circleById(id).members);

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(30rem,100%);margin:0 auto">
        <p id="bn-title" style="margin:0 0 .5rem;text-align:center;font-family:var(--font-head);font-size:1rem;font-weight:800;line-height:1.25">
          Pasirink bendruomenę.
        </p>
        <div id="bn-grid" role="group" aria-label="Žmonės"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,6.4rem),1fr));gap:.45rem"></div>
        <p id="bn-shared" class="sim-note" style="margin:.6rem 0 0;text-align:center;min-height:2.4em"></p>
        <p id="bn-tally" style="margin:.35rem 0 0;text-align:center;font-size:.9rem;font-weight:800;line-height:1.3"></p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.45rem;width:100%;max-width:30rem;margin:0 auto;
                  grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5rem),1fr))">
        ${circlesCfg.map((c) => `<button class="btn secondary" type="button" data-circle="${c.id}"
            aria-pressed="false" style="min-height:52px;font-size:.95rem;padding:.35rem .5rem"
            aria-label="Bendruomenė: ${c.label}">${c.label}</button>`).join("")}
        <button class="btn ghost" type="button" id="bn-reset" style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    // Pastaba yra už scenos ribų — be šios eilutės po perkrovimo liktų
    // ankstesnio pasirinkimo sakinys (LL-16).
    api.note("");

    const gridEl = stage.querySelector("#bn-grid");
    const sharedEl = stage.querySelector("#bn-shared");
    const tallyEl = stage.querySelector("#bn-tally");
    const titleEl = stage.querySelector("#bn-title");
    const buttons = [...controls.querySelectorAll("button[data-circle]")];

    peopleCfg.forEach((p) => {
      const card = document.createElement("div");
      card.dataset.person = p.id;
      card.style.cssText = "display:grid;justify-items:center;gap:.1rem;min-width:0;"
        + "padding:.45rem .25rem;border-radius:14px;border:3px solid transparent;"
        + "background:var(--paper-2);transition:opacity .15s,border-color .15s";
      card.innerHTML =
        `<span aria-hidden="true" style="font-size:1.9rem;line-height:1.05">${p.emoji}</span>`
        + `<span style="max-width:100%;overflow-wrap:break-word;font-size:.85rem;line-height:1.15;font-weight:800;text-align:center">${p.label}</span>`
        + `<span class="bn-badge" style="min-height:1.1em;font-size:.72rem;line-height:1.1;font-weight:800;color:var(--ink-soft)"></span>`;
      gridEl.appendChild(card);
    });

    function paint() {
      const member = active ? membersOf(active) : null;
      gridEl.querySelectorAll("[data-person]").forEach((card) => {
        const p = personById(card.dataset.person);
        const on = !!member && member.has(p.id);
        const badge = card.querySelector(".bn-badge");
        card.style.borderColor = on ? "var(--ink)" : "transparent";
        // Ne narys nepranyksta visai: kortelė lieka, tik pritemsta, o
        // būseną sako ir tekstas, ne vien spalva (LL-18, prieinamumas).
        card.style.opacity = active && !on ? ".5" : "1";
        badge.textContent = on ? (S.member || "čia") : "";
        card.setAttribute("aria-label", active
          ? `${p.label}. ${on ? "Būna šioje bendruomenėje." : "Nebūna šioje bendruomenėje."}`
          : p.label);
      });
    }

    function paintTally() {
      if (visited.size < circlesCfg.length) {
        tallyEl.textContent = "";
        return;
      }
      const counts = peopleCfg
        .map((p) => ({ label: p.label, n: circlesCfg.filter((c) => c.members.includes(p.id)).length }))
        .filter((x) => x.n > 1);
      // Sąrašas, o ne sakinys: kiekvienas žmogus skaitomas atskirai, tad
      // vaikui nereikia laikyti kelių skaičių vienoje eilutėje (LL-35).
      tallyEl.innerHTML = `<span style="display:block;margin-bottom:.15rem">Kiek bendruomenių turi kiekvienas žmogus:</span>`
        + `<ul style="list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:.1rem .8rem">`
        + counts.map((x) => `<li>${x.label} — <strong>${x.n}</strong></li>`).join("")
        + `</ul>`;
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.circle;
        const c = circleById(active);
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        titleEl.textContent = `Bendruomenė: ${c.label}`;
        sharedEl.textContent = c.shared;
        paint();
        const first = visited.size === 0;
        visited.add(active);
        paintTally();
        api.readout(`${c.label}. ${c.shared}`);
        api.speak(c.label, { rate: .9 });
        if (first) api.note(S.rule || "");
        if (visited.size === circlesCfg.length) {
          if (!reported) { reported = true; api.progress({ correct: true }); }
          api.note(`${S.rule || ""} ${S.all || ""}`.trim());
        }
      });
    });

    controls.querySelector("#bn-reset").addEventListener("click", () => {
      stage.innerHTML = "";
      controls.innerHTML = "";
      bendruomenes.mount({ stage, controls, api, config });
    });

    paint();
    api.readout(S.start || "Pasirink bendruomenę.");
    api.speak(S.start || "Pasirink bendruomenę.");
    return () => {};
  },
};

/* ------------------------------------------------------------------ */
/* 16. Stebėjimo žurnalas — rudens požymiai mokyklos kieme            */
/* ------------------------------------------------------------------ */
/* Modelio kintamasis — mėnuo (rugsėjis, spalis, lapkritis). Vaikas
   pasirenka medį ir mėnesį, o paskui įrašo, ką mato. Stebėjimas čia
   parodomas kaip ĮRAŠAS: tas pats objektas žiūrimas kelis kartus, o
   žurnalas leidžia palyginti. Eglė yra sąmoningas prieštaraujantis
   pavyzdys (LL-28): be jos trys klevo įrašai mokytų, kad „rudenį visi
   medžiai gelsta“, nors eglė visą rudenį lieka žalia. */
const LAPU_SPOTAI = [
  [128, 258, 1.15, -1, 0], [146, 266, 1, 1, 0], [166, 272, 1.1, -1, 0],
  [196, 262, 1, 1, 0], [212, 270, 1.05, -1, 0], [238, 264, 1, 1, 0],
  [120, 272, .95, 1, 0], [156, 280, 1.05, -1, 0], [228, 278, .95, 1, 0],
  [206, 284, 1.1, -1, 0], [138, 286, .9, 1, 0], [250, 282, 1, -1, 0],
];
const LAPU_SPALVOS = ["#e08a2e", "#d9791f", "#e9a13a", "#c96a1c"];

const stebejimoZurnalas = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const objects = Array.isArray(config.objects) ? config.objects : [];
    const months = Array.isArray(config.months) ? config.months : [];
    const cards = config.words && typeof config.words === "object" ? config.words : {};
    const records = config.records && typeof config.records === "object" ? config.records : {};

    const esc = (t) => String(t).replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai ------------------------------------------- */
    const problems = [];
    if (objects.length < 2) problems.push("reikia bent dviejų stebimų objektų");
    if (months.length < 2) problems.push("reikia bent dviejų mėnesių");
    objects.forEach((o) => {
      if (!o || !o.id || !o.label || !o.kind) {
        problems.push(`objektas „${(o && o.id) || "?"}“ be id/label/kind`);
        return;
      }
      if (!Array.isArray(cards[o.kind]) || cards[o.kind].length < 2) {
        problems.push(`objektui „${o.id}“ trūksta kortelių „${o.kind}“`);
      }
      if (!records[o.id] || typeof records[o.id] !== "object") {
        problems.push(`objektui „${o.id}“ trūksta įrašų`);
        return;
      }
      months.forEach((m) => {
        if (!m || !m.id) { problems.push("mėnuo be id"); return; }
        const text = records[o.id][m.id];
        if (!text) problems.push(`nėra įrašo „${o.id}“ per „${m.id}“`);
        else if (Array.isArray(cards[o.kind]) && !cards[o.kind].includes(text)) {
          problems.push(`įrašo „${text}“ nėra tarp kortelių „${o.kind}“`);
        }
      });
    });
    ["objectQ", "monthQ", "cardQ", "journal", "reset"].forEach((k) => {
      if (!L[k]) problems.push(`užrašo „${k}“ nėra`);
    });
    ["start", "look", "wrong", "rule", "done"].forEach((k) => {
      if (!S[k]) problems.push(`sakinio „${k}“ nėra`);
    });
    if (problems.length) {
      console.error(`stebejimo-zurnalas: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="sim-note" style="text-align:center">Stebėjimo objektai nesuderinti.</p>';
      controls.innerHTML = "";
      return null;
    }

    let objId = objects[0].id;
    let monthId = months[0].id;
    const written = new Map();      // „objektas|mėnuo“ -> įrašo tekstas
    let reported = false;           // api.progress — vieną kartą, surinkus visą žurnalą

    const objOf = (id) => objects.find((o) => o.id === id) || null;
    const monthOf = (id) => months.find((m) => m.id === id) || null;

    const cellTh = "padding:.3rem .2rem;border-top:1px solid var(--line);text-align:left;"
      + "font-weight:800;font-size:.85rem;line-height:1.2;overflow-wrap:anywhere";
    const cellTd = "padding:.3rem .15rem;border-top:1px solid var(--line);text-align:center;"
      + "font-weight:700;font-size:.85rem;line-height:1.2;overflow-wrap:anywhere";

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:25rem;margin:0 auto">
        <svg id="sz-scene" viewBox="0 0 360 300" width="100%" role="img" aria-label="Mokyklos kiemas"
             style="display:block;width:100%;height:auto;border-radius:16px"></svg>
        <table id="sz-journal" style="width:100%;margin:.55rem 0 0;border-collapse:collapse;table-layout:fixed">
          <caption style="caption-side:top;text-align:left;font-weight:800;font-size:.92rem;padding:0 0 .3rem">
            ${esc(L.journal)}</caption>
          <thead><tr>
            <th scope="col" style="width:34%;padding:.15rem .2rem;text-align:left;font-size:.85rem">Mėnuo</th>
            ${objects.map((o) => `<th scope="col" style="padding:.15rem .15rem;text-align:center;font-size:.85rem">${esc(o.label)}</th>`).join("")}
          </tr></thead>
          <tbody id="sz-rows"></tbody>
        </table>
        <p id="sz-summary" class="sim-note" style="margin:.35rem 0 0;text-align:center;line-height:1.3;min-height:1.2em"></p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.55rem;width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;text-align:center;font-weight:800;font-size:.92rem">${esc(L.objectQ)}</p>
          <div role="group" aria-label="${esc(L.objectQ)}"
               style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem;min-width:0">
            ${objects.map((o) => `<button type="button" class="btn secondary" data-object="${esc(o.id)}"
                aria-pressed="${o.id === objId}"
                style="min-width:0;min-height:52px;font-size:.98rem">${esc(o.label)}</button>`).join("")}
          </div>
        </div>
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;text-align:center;font-weight:800;font-size:.92rem">${esc(L.monthQ)}</p>
          <div role="group" aria-label="${esc(L.monthQ)}"
               style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem;min-width:0">
            ${months.map((m) => `<button type="button" class="btn secondary" data-month="${esc(m.id)}"
                aria-pressed="${m.id === monthId}"
                style="min-width:0;min-height:52px;padding:.3rem .15rem;font-size:.9rem">${esc(m.label)}</button>`).join("")}
          </div>
        </div>
        <div style="min-width:0">
          <p style="margin:0 0 .3rem;text-align:center;font-weight:800;font-size:.92rem">${esc(L.cardQ)}</p>
          <div id="sz-cards" style="display:grid;grid-template-columns:minmax(0,1fr);gap:.35rem;min-width:0"></div>
        </div>
        <button type="button" class="btn ghost" id="sz-reset"
                style="min-height:48px;font-size:.95rem">${esc(L.reset)}</button>
      </div>`;

    const svg = stage.querySelector("#sz-scene");
    const rowsEl = stage.querySelector("#sz-rows");
    const summaryEl = stage.querySelector("#sz-summary");
    const cardsEl = controls.querySelector("#sz-cards");
    const objBtns = Array.from(controls.querySelectorAll("button[data-object]"));
    const monthBtns = Array.from(controls.querySelectorAll("button[data-month]"));

    function paintScene() {
      const obj = objOf(objId);
      const m = monthOf(monthId);
      /* Lapuotis keičiasi pagal mėnesį, spygliuotis — ne. Būtent šis
         skirtumas ir yra modelio atsakymas, o ne puošmena. */
      const season = obj.kind === "spygliuotis" ? "egle" : (m.stage || "ruduo");
      const n = obj.kind === "spygliuotis" ? 0
        : Math.max(0, Math.min(LAPU_SPOTAI.length, Number(m.fallen) || 0));
      const leaves = LAPU_SPOTAI.slice(0, n).map(([lx, ly, s, dir, droop], i) =>
        art.leaf(lx, ly, s, dir, droop, LAPU_SPALVOS[i % LAPU_SPALVOS.length])).join("");
      svg.innerHTML = `
        ${art.defs("sz")}
        <rect x="0" y="0" width="360" height="300" rx="16" fill="url(#sz-autumn)"/>
        ${art.sun(296, 54, 15, "sz", 0.8)}
        ${art.cloud(72, 52, 0.75, 0.85)}
        ${art.hills(360, 206, "#cdd79b", "#b4c07e")}
        ${art.soil(0, 226, 360, 74, "sz", 20)}
        ${art.grass(46, 232, 1, "#6f9a4e")}
        ${art.grass(320, 230, 0.95, "#6f9a4e")}
        ${art.tree(174, 260, 1.75, season)}
        ${leaves}
        <text x="16" y="34" font-family="system-ui" font-size="19" font-weight="800" fill="#3a342b">${esc(obj.label)}</text>
        <text x="16" y="55" font-family="system-ui" font-size="14" font-weight="600" fill="#5f574d">${esc(m.label)}</text>`;
      svg.setAttribute("aria-label",
        `Mokyklos kiemas. ${obj.label}, ${m.label}. ${records[obj.id][m.id]}.`);
    }

    function paintJournal() {
      rowsEl.innerHTML = months.map((m) => `<tr>
        <th scope="row" style="${cellTh}">${esc(m.label)}</th>
        ${objects.map((o) => {
          const text = written.get(`${o.id}|${m.id}`);
          return `<td style="${cellTd}">${text ? esc(text) : "—"}</td>`;
        }).join("")}
      </tr>`).join("");
    }

    function summary() {
      const parts = objects.map((o) => {
        const texts = months.map((m) => written.get(`${o.id}|${m.id}`)).filter(Boolean);
        const kinds = new Set(texts);
        return kinds.size === 1
          ? `${o.label}: ${texts.length} kartus tas pats įrašas`
          : `${o.label}: ${kinds.size} skirtingi įrašai`;
      });
      return `${parts.join(". ")}.`;
    }

    function record(index) {
      const obj = objOf(objId);
      const m = monthOf(monthId);
      const list = cards[obj.kind] || [];
      const text = list[index];
      if (!text) return;
      if (text !== records[obj.id][m.id]) {
        /* Klaida nebaudžiama ir neįrašoma: žurnalas turi rodyti tai, ką
           vaikas tikrai mato, o ne pirmą spėjimą. */
        api.note(S.wrong);
        api.readout(`${obj.label}, ${m.label}: ${S.wrong}`);
        return;
      }
      written.set(`${obj.id}|${m.id}`, text);
      paintJournal();
      api.speak(text, { rate: 0.9 });
      api.readout(`${obj.label}, ${m.label}: ${text}`);
      api.note(S.look);
      if (written.size === objects.length * months.length) {
        summaryEl.textContent = summary();
        if (!reported) {
          reported = true;
          api.note(`${S.rule} ${S.done}`);
          api.progress({ correct: true });
          api.speak(S.done);
        }
      }
    }

    function paintCards() {
      const list = cards[objOf(objId).kind] || [];
      cardsEl.innerHTML = list.map((text, i) =>
        `<button type="button" class="btn secondary" data-card="${i}"
          style="min-width:0;min-height:52px;height:auto;padding:.4rem .5rem;
          font-size:.98rem;line-height:1.2;overflow-wrap:anywhere">${esc(text)}</button>`).join("");
      Array.from(cardsEl.querySelectorAll("button[data-card]"))
        .forEach((btn) => btn.addEventListener("click", () => record(Number(btn.dataset.card))));
    }

    objBtns.forEach((btn) => btn.addEventListener("click", () => {
      objId = btn.dataset.object;
      objBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      paintScene();
      paintCards();
      const o = objOf(objId);
      api.speak(o.label);
      api.readout(`${o.label}. ${S.look}`);
    }));

    monthBtns.forEach((btn) => btn.addEventListener("click", () => {
      monthId = btn.dataset.month;
      monthBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const m = monthOf(monthId);
      paintScene();
      api.speak(m.label);
      api.readout(`${m.label}. ${S.look}`);
    }));

    controls.querySelector("#sz-reset").addEventListener("click", () => {
      stage.innerHTML = "";
      controls.innerHTML = "";
      stebejimoZurnalas.mount({ stage, controls, api, config });
    });

    // Pastaba išvaloma sąmoningai — kitaip po perkrovimo liktų ankstesnio
    // bandymo sakinys (LL-16).
    api.note("");
    paintScene();
    paintJournal();
    paintCards();
    api.readout(S.start);
    api.speak(S.start);
    return () => {};
  },
};

/* ------------------------------------------------------------------ */
/* 18. Žmonių įvairovė — kas ką moka                                  */
/* ------------------------------------------------------------------ */
/* Klaidinga nuostata: „jei draugas nemoka to, ką moku aš, jis nemoka
   nieko“. Modelis turi vieną kintamąjį — kurį vaiką paskirsi darbui.
   Iš jo kyla dvi pasekmės, kurių sąrašas vienas neparodo:
     1) tas pats vaikas viename darbe pavyksta, kitame — ne;
     2) visi trys darbai atliekami, ir kiekvieną atlieka KITAS vaikas.
   Todėl kiekvienas moka ką nors, ir nė vienas nemoka visko: trūkumas
   viename darbe nėra „nemokantis žmogus“.
   Vartai reikalauja, kad kiekvieną darbą mokėtų LYGIAI vienas vaikas —
   simetrija ir yra modelio teiginys. Be jos lentelėje atsirastų vaikas,
   kuris atlieka du darbus, ir teiginys „nė vienas nemoka visko“ liktų
   neįrodytas (LL-28). */
const zmoniuIvairove = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const kids = Array.isArray(config.children) ? config.children.filter(Boolean) : [];
    const jobs = Array.isArray(config.jobs) ? config.jobs.filter(Boolean) : [];
    const cells = S.cells && typeof S.cells === "object" ? S.cells : {};

    const esc = (t) => String(t).replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai ------------------------------------------- */
    const problems = [];
    const jobIds = jobs.map((j) => j && j.id);
    if (kids.length < 3) problems.push("reikia bent trijų vaikų");
    if (jobs.length < 3) problems.push("reikia bent trijų darbų");
    if (new Set(jobIds).size !== jobIds.length) problems.push("pasikartojantis darbo id");
    if (new Set(kids.map((k) => k && k.id)).size !== kids.length) problems.push("pasikartojantis vaiko id");
    kids.forEach((k) => {
      if (!k.id || !k.label || !k.emoji) {
        problems.push(`vaikas „${(k && k.id) || "?"}“ be id/label/emoji`);
        return;
      }
      if (!jobIds.includes(k.can)) {
        problems.push(`vaikui „${k.id}“ nepriskirtas nė vienas žinomas darbas`);
      }
    });
    jobs.forEach((j) => {
      if (!j.id || !j.label || !j.emoji) {
        problems.push(`darbas „${(j && j.id) || "?"}“ be id/label/emoji`);
        return;
      }
      const owners = kids.filter((k) => k.can === j.id);
      if (owners.length !== 1) {
        problems.push(`darbą „${j.id}“ moka ${owners.length} vaikų — turi mokėti lygiai vienas (LL-28)`);
      }
    });
    kids.forEach((k) => jobs.forEach((j) => {
      const key = `${j && j.id}-${k && k.id}`;
      if (typeof cells[key] !== "string" || !cells[key].trim()) {
        problems.push(`trūksta sakinio „${key}“ (sentences.cells)`);
      }
    }));
    ["jobTitle", "pickTitle", "okWord", "failWord", "again", "doneTitle"].forEach((k) => {
      if (!L[k]) problems.push(`užrašo „${k}“ nėra`);
    });
    ["start", "startNote", "pick", "next", "done", "doneNote", "rule", "tableNote"]
      .forEach((k) => { if (!S[k]) problems.push(`sakinio „${k}“ nėra`); });
    if (problems.length) {
      console.error(`zmoniu-ivairove: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Vaikai ir darbai nesuderinti.</p>';
      controls.innerHTML = "";
      return null;
    }

    const solved = new Set();
    let jobId = jobs[0].id;
    let reported = false;      // api.progress — vieną kartą, atlikus visus darbus (LL-29)

    const jobOf = (id) => jobs.find((j) => j.id === id) || null;
    const kidOf = (id) => kids.find((k) => k.id === id) || null;

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(30rem,100%);margin:0 auto">
        <p id="zi-job" style="margin:0 0 .35rem;text-align:center;font-family:var(--font-head);
            font-size:1rem;font-weight:800;line-height:1.25;overflow-wrap:anywhere"></p>
        <p id="zi-pick" class="sim-note" style="margin:0 0 .35rem;text-align:center"></p>
        <div id="zi-kids" role="group" aria-label="Vaikai, kurie gali padėti"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,6.4rem),1fr));gap:.45rem"></div>
        <p id="zi-result" class="sim-note" style="margin:.6rem 0 0;text-align:center;
            min-height:2.9em;overflow-wrap:anywhere"></p>
        <div id="zi-summary" style="margin-top:.3rem;min-width:0"></div>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.4rem;width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <p style="margin:0;font-weight:800;text-align:center;font-size:.92rem;line-height:1.25">${esc(L.jobTitle)}</p>
        <div id="zi-jobs" role="group" aria-label="${esc(L.jobTitle)}"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr));gap:.45rem;min-width:0">
          ${jobs.map((j) => `<button class="btn secondary" type="button" data-job="${esc(j.id)}"
              aria-pressed="false" style="min-width:0;min-height:52px;height:auto;padding:.35rem .4rem;
              font-size:.95rem;line-height:1.2;overflow-wrap:anywhere">${esc(j.label)}</button>`).join("")}
        </div>
        <button class="btn ghost" type="button" id="zi-reset"
                style="min-height:48px;font-size:.95rem">${esc(L.again)}</button>
      </div>`;

    const jobEl = stage.querySelector("#zi-job");
    const pickEl = stage.querySelector("#zi-pick");
    const kidsEl = stage.querySelector("#zi-kids");
    const resultEl = stage.querySelector("#zi-result");
    const summaryEl = stage.querySelector("#zi-summary");
    const jobBtns = [...controls.querySelectorAll("button[data-job]")];

    kidsEl.innerHTML = kids.map((k) => `<button class="btn secondary" type="button" data-kid="${esc(k.id)}"
        aria-label="${esc(k.label)} — pasirinkti"
        style="min-width:0;min-height:64px;height:auto;padding:.4rem .25rem;display:grid;
        justify-items:center;gap:.15rem;line-height:1.15">
        <span aria-hidden="true" style="font-size:1.9rem;line-height:1.05">${esc(k.emoji)}</span>
        <span style="max-width:100%;overflow-wrap:break-word;font-size:.9rem;font-weight:800">${esc(k.label)}</span>
      </button>`).join("");
    const kidBtns = [...kidsEl.querySelectorAll("button[data-kid]")];

    /* Santrauka rodoma TIK atlikus visus darbus: kiekvienas vaikas skaitomas
       atskirai eilute, o ne vienu sakiniu (LL-35), ir skaičius imamas iš to,
       kas tikrai atlikta, o ne iš to, kas turėjo būti (LL-17). */
    function summaryMarkup() {
      if (solved.size < jobs.length) return "";
      const counts = kids.map((k) => ({
        label: k.label,
        n: jobs.filter((j) => solved.has(j.id) && k.can === j.id).length,
      }));
      return `<p style="margin:.2rem 0 .15rem;text-align:center;font-size:.9rem;font-weight:800">${esc(L.doneTitle)}</p>`
        + `<ul style="list-style:none;margin:0 0 .3rem;padding:0;display:flex;flex-wrap:wrap;`
        + `justify-content:center;gap:.1rem .9rem;font-size:.9rem">`
        + counts.map((c) => `<li>${esc(c.label)} — <strong>${c.n}</strong></li>`).join("")
        + `</ul>`
        + `<p class="sim-note" style="margin:0;text-align:center;overflow-wrap:anywhere">${esc(S.rule)}</p>`;
    }

    function paint() {
      const j = jobOf(jobId);
      jobEl.textContent = j ? `${j.emoji} ${j.label}` : "";
      jobBtns.forEach((b) => {
        const job = jobOf(b.dataset.job);
        const done = solved.has(b.dataset.job);
        b.setAttribute("aria-pressed", String(b.dataset.job === jobId));
        // Būsena pasakoma ir žodžiu, ne vien spalva (prieinamumas, T5.5).
        b.innerHTML = `<span aria-hidden="true" style="font-size:1.15rem">${esc(job.emoji)}</span> `
          + `${esc(job.label)}${done ? " ✓" : ""}`;
        b.setAttribute("aria-label", `${job.label}${done ? ", atlikta" : ""}`);
      });
      pickEl.textContent = L.pickTitle;
      summaryEl.innerHTML = summaryMarkup();
    }

    jobBtns.forEach((b) => {
      b.addEventListener("click", () => {
        jobId = b.dataset.job;
        paint();
        const j = jobOf(jobId);
        api.readout(`${L.jobTitle} ${j.label}.`);
        api.speak(j.label);
      });
    });

    kidBtns.forEach((b) => {
      b.addEventListener("click", () => {
        const j = jobOf(jobId);
        const k = kidOf(b.dataset.kid);
        if (!j || !k) return;
        const ok = k.can === j.id;
        const sentence = cells[`${j.id}-${k.id}`];
        const head = ok ? L.okWord : L.failWord;
        if (ok) solved.add(j.id);

        const finished = solved.size === jobs.length;
        resultEl.textContent = `${head} ${sentence}${finished ? ` ${S.done}` : ""}`;
        api.readout(resultEl.textContent);
        api.speak(sentence);

        if (finished) {
          api.note(`${S.doneNote} ${S.rule}`);
          if (!reported) { reported = true; api.progress({ correct: true }); }
        } else if (ok) {
          const nextJob = jobs.find((x) => !solved.has(x.id));
          if (nextJob) jobId = nextJob.id;
          api.note(S.next);
        } else {
          api.note(S.tableNote);
        }
        paint();
      });
    });

    controls.querySelector("#zi-reset").addEventListener("click", () => {
      stage.innerHTML = "";
      controls.innerHTML = "";
      zmoniuIvairove.mount({ stage, controls, api, config });
    });

    // Pastaba yra už scenos ribų — be šios eilutės po perkrovimo liktų
    // ankstesnio bandymo sakinys (LL-16).
    api.note("");
    paint();
    api.readout(S.start);
    api.speak(S.startNote);
    return () => {};
  },
};

/* ------------------------------------------------------------------ */
/* 19. Giminės grandinė — kas kam giminė                               */
/* ------------------------------------------------------------------ */
/* Klaidinga nuostata: „močiutė yra ta, kuri atrodo sena“. Modelio
   kintamasis vienas — kurį žmogų vaikas paspaudžia; ryšiai (kas kam
   mama) nuo paspaudimo nesikeičia. Todėl dvi žilaplaukės moterys
   elgiasi skirtingai: Rūta atsiduria grandinėje Rūta → Ieva → Adomas,
   o kaimynė Ona lieka už jos, nes jos vaikai neturi vaikų.
   Grandinė skaičiuojama iš `links`, o ne įrašyta tekstu: jei modulio
   ryšiai pasikeistų, pasikeistų ir rodomas kelias (LL-34). Tikslai
   tikrinami su tais pačiais ryšiais, todėl atsakymas negali „atsilikti“
   nuo modelio (LL-17).
   Sąmoninga riba: trys kartos ir vienas tėvų kelias. Įvaikinimas, du
   namai ir kitos šeimų formos nevaizduojami — tai 6–7 m. modelio riba,
   pasakyta mokytojo bloke, o ne tyli išimtis. */
const giminesGrandine = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const people = (Array.isArray(config.people) ? config.people : []).filter(Boolean);
    const links = (Array.isArray(config.links) ? config.links : []).filter(Boolean);
    const goals = (Array.isArray(config.goals) ? config.goals : []).filter(Boolean);
    const childId = config.child;
    const cells = S.cells && typeof S.cells === "object" ? S.cells : {};
    const relation = S.relation && typeof S.relation === "object" ? S.relation : {};
    const asks = S.asks && typeof S.asks === "object" ? S.asks : {};

    const esc = (t) => String(t).replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai ------------------------------------------- */
    const problems = [];
    const ids = people.map((p) => p && p.id);
    if (people.length < 3) problems.push("reikia bent trijų žmonių");
    if (new Set(ids).size !== ids.length) problems.push("pasikartojantis žmogaus id");
    people.forEach((p) => {
      if (!p.id || !p.label || !p.emoji) problems.push(`žmogus „${(p && p.id) || "?"}“ be id/label/emoji`);
    });

    const parentOf = new Map();
    links.forEach((l) => {
      if (!l || !ids.includes(l.parent) || !ids.includes(l.child)) {
        problems.push("ryšys rodo į nežinomą žmogų");
        return;
      }
      if (parentOf.has(l.child)) {
        problems.push(`„${l.child}“ turi dvi mamas — modelis remiasi vienu keliu`);
      }
      parentOf.set(l.child, l.parent);
    });
    if (!ids.includes(childId)) problems.push("nėra vaiko, nuo kurio skaičiuojama grandinė");

    const ancestor = (steps) => {
      let cur = childId;
      for (let i = 0; i < steps; i += 1) {
        cur = parentOf.get(cur);
        if (!cur) return null;
      }
      return cur || null;
    };

    if (goals.length < 2) problems.push("reikia bent dviejų tikslų");
    goals.forEach((g) => {
      if (!g || !g.id || !Number.isInteger(g.steps) || g.steps < 1) {
        problems.push("tikslo be id arba steps");
        return;
      }
      if (!asks[g.id]) problems.push(`trūksta klausimo „${g.id}“ (sentences.asks)`);
      if (!ids.includes(g.answer)) problems.push(`tikslo „${g.id}“ atsakymas ne žmogus`);
      const want = ancestor(g.steps);
      if (!want) problems.push(`tikslas „${g.id}“ prašo ${g.steps} ryšių, bet grandinė trumpesnė`);
      else if (want !== g.answer) problems.push(`tikslo „${g.id}“ atsakymas nesutampa su ryšiais (laukta „${want}“)`);
      people.forEach((p) => {
        const key = `${g.id}-${p.id}`;
        if (typeof cells[key] !== "string" || !cells[key].trim()) {
          problems.push(`trūksta sakinio „${key}“ (sentences.cells)`);
        }
      });
    });
    people.forEach((p) => {
      if (typeof relation[p.id] !== "string" || !relation[p.id].trim()) {
        problems.push(`trūksta ryšio sakinio „${p.id}“ (sentences.relation)`);
      }
    });
    ["fact", "done", "doneNote", "next", "tryAgain", "rule"]
      .forEach((k) => { if (!S[k]) problems.push(`trūksta sakinio „${k}“`); });
    if (!L.again) problems.push("trūksta užrašo „again“");

    if (problems.length) {
      console.error(`gimines-grandine: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Giminės ryšiai nesuderinti.</p>';
      controls.innerHTML = "";
      return null;
    }

    const personOf = (id) => people.find((p) => p.id === id) || null;

    /* Grandinė nuo vaiko aukštyn: [Adomas, Ieva, Rūta]. Rodyti reikia
       atvirkščiai — didžiausia karta viršuje, vaikas apačioje. */
    const chainIds = [];
    for (let cur = childId; cur; cur = parentOf.get(cur)) chainIds.push(cur);
    const familyTopDown = chainIds.slice().reverse();
    const outsiders = people.filter((p) => !chainIds.includes(p.id));

    const card = (p) => `<button class="btn secondary" type="button" data-person="${esc(p.id)}"
        aria-label="${esc(p.label)} — pasirinkti"
        style="min-width:0;min-height:64px;height:auto;padding:.35rem .3rem;display:grid;
        justify-items:center;gap:.1rem;line-height:1.15">
        <span aria-hidden="true" style="font-size:1.9rem;line-height:1.05">${esc(p.emoji)}</span>
        <span style="max-width:100%;overflow-wrap:anywhere;font-size:.9rem;font-weight:800">${esc(p.label)}</span>
      </button>`;

    /* Vertikali juosta, o ne rodyklė: ryšio kryptis priklauso nuo to,
       kas kam mama, ir modelis jos iš anksto nepasako. */
    const bar = '<span aria-hidden="true" style="justify-self:center;font-size:1rem;'
      + 'line-height:.9;color:var(--ink-soft)">│</span>';

    stage.innerHTML = `
      <div style="width:100%;min-width:0;max-width:min(30rem,100%);margin:0 auto">
        <p id="gg-fact" class="sim-note" style="margin:0 0 .45rem;text-align:center;overflow-wrap:anywhere"></p>
        <p id="gg-ask" style="margin:0 0 .5rem;text-align:center;font-family:var(--font-head);
            font-size:1rem;font-weight:800;line-height:1.3;overflow-wrap:anywhere"></p>
        <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr);
                    gap:.5rem;align-items:start;min-width:0">
          <div id="gg-family" role="group" aria-label="Giminė" style="display:grid;gap:.1rem;min-width:0"></div>
          <div id="gg-others" role="group" aria-label="Kaimynai" style="display:grid;gap:.2rem;min-width:0"></div>
        </div>
        <p id="gg-chain" style="margin:.55rem 0 0;text-align:center;font-weight:800;font-size:.95rem;
            line-height:1.3;min-height:1.3em;overflow-wrap:anywhere"></p>
        <p id="gg-result" class="sim-note" style="margin:.2rem 0 0;text-align:center;
            min-height:2.9em;overflow-wrap:anywhere"></p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.4rem;width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <button class="btn ghost" type="button" id="gg-reset"
                style="min-height:48px;font-size:.95rem">${esc(L.again)}</button>
      </div>`;

    const factEl = stage.querySelector("#gg-fact");
    const askEl = stage.querySelector("#gg-ask");
    const chainEl = stage.querySelector("#gg-chain");
    const resultEl = stage.querySelector("#gg-result");
    stage.querySelector("#gg-family").innerHTML = familyTopDown
      .map((id) => card(personOf(id))).join(bar);
    stage.querySelector("#gg-others").innerHTML = outsiders.map((p) => `${card(p)}${p.note
      ? `<p class="sim-note" style="margin:0;text-align:center;line-height:1.2">${esc(p.note)}</p>`
      : ""}`).join("");
    const personBtns = [...stage.querySelectorAll("button[data-person]")];

    let goalIdx = 0;
    let reported = false;   // api.progress — vieną kartą, įveikus abu tikslus (LL-17, LL-29)

    function chainText(id) {
      const i = chainIds.indexOf(id);
      if (i < 0) return "";
      return chainIds.slice(0, i + 1).reverse().map((x) => personOf(x).label).join(" → ");
    }

    function paintAsk() {
      const g = goalIdx < goals.length ? goals[goalIdx] : null;
      askEl.textContent = g ? asks[g.id] : S.done;
    }

    factEl.textContent = S.fact;
    // Pastaba yra už scenos ribų — be šios eilutės po perkrovimo liktų
    // ankstesnio bandymo sakinys (LL-16).
    api.note("");
    paintAsk();

    personBtns.forEach((b) => {
      b.addEventListener("click", () => {
        const p = personOf(b.dataset.person);
        if (!p) return;
        const g = goalIdx < goals.length ? goals[goalIdx] : null;
        const sentence = g ? cells[`${g.id}-${p.id}`] : relation[p.id];
        if (!sentence) return;

        personBtns.forEach((x) => { x.style.outline = ""; x.style.outlineOffset = ""; });
        b.style.outline = "3px solid var(--ink)";
        b.style.outlineOffset = "2px";

        chainEl.textContent = chainText(p.id);
        resultEl.textContent = sentence;
        api.readout(sentence);
        api.speak(sentence);

        if (g && g.answer === p.id) {
          goalIdx += 1;
          if (goalIdx >= goals.length) {
            if (!reported) { reported = true; api.progress({ correct: true }); }
            paintAsk();
            api.note(`${S.doneNote} ${S.rule}`.trim());
          } else {
            paintAsk();
            api.note(S.next);
          }
        } else {
          api.note(g ? S.tryAgain : `${S.doneNote} ${S.rule}`.trim());
        }
      });
    });

    controls.querySelector("#gg-reset").addEventListener("click", () => {
      stage.innerHTML = "";
      controls.innerHTML = "";
      giminesGrandine.mount({ stage, controls, api, config });
    });

    api.readout(`${S.fact} ${asks[goals[0].id]}`.trim());
    api.speak(asks[goals[0].id]);
    return () => {};
  },
};

/* ------------------------------------------------------------------ */
/* Kas lieka pievoje po metų                                           */
/* ------------------------------------------------------------------ */
/*
 * Viena sąvoka: gamta suyra tai, kas išaugo (lapas, obuolys), o žmogaus
 * pagaminti daiktai (stiklas, plastikas) lieka. Modelis skirtas nuostatai
 * „palikau gamoje — suirs“: vaikas pirma pažymi, kas, jo manymu, liks,
 * tada pats pasuka laiką ir pamato, kad butelis ir stiklinė tebeguli, o
 * lapo ir graužo nebėra.
 *
 * Kodėl laikas yra mygtukas, o ne animacija: pasekmė turi būti susieta su
 * vaiko veiksmu, o ne su tuo, kiek jis žiūrėjo. Todėl jokių laikmačių, o
 * du aiškūs žingsniai („Po metų“, „Po dešimt metų“), kuriuos galima kartoti.
 *
 * Ko modelis sąmoningai nedaro: nekalba apie mikrobus, rūšiavimą ir
 * perdirbimą; butelis po dešimt metų rodomas toks pat, nors tikrovėje jis
 * trapus ir skyla. Tai modelio riba, pasakyta žodžiu, o ne nutylėta.
 */
const kasLiekaPievoje = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const items = (Array.isArray(config.items) ? config.items : []).filter(Boolean);
    const times = (Array.isArray(config.times) ? config.times : []).filter(Boolean);
    const esc = (t) => String(t).replace(/[&<>\"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai: nesuderinta konfigūracija pasakoma žodžiais,
       o ne tyliai pakeičiama bendru sakiniu (LL-33). --- */
    const problems = [];
    if (items.length < 3) problems.push("reikia bent trijų daiktų");
    if (items.length > 4) problems.push("scena telpa keturiems daiktams");
    const seen = new Set();
    items.forEach((it) => {
      if (!it.id || !it.label || !it.icon) problems.push("daiktas be id, užrašo ar piktogramos");
      else if (seen.has(it.id)) problems.push(`daiktas „${it.id}“ kartojasi`);
      else seen.add(it.id);
      if (typeof it.decays !== "boolean") problems.push(`daiktas „${it.id}“ neturi „decays“`);
      ["year", "decade"].forEach((k) => {
        if (!it.sentences || typeof it.sentences[k] !== "string" || !it.sentences[k].trim()) {
          problems.push(`daiktas „${it.id}“ neturi sakinio „${k}“`);
        }
      });
      if (it.decays === false) {
        if (!it.takeLabel) problems.push(`daiktas „${it.id}“ neturi „takeLabel“`);
        if (!it.sentences || typeof it.sentences.take !== "string" || !it.sentences.take.trim()) {
          problems.push(`daiktas „${it.id}“ neturi pasiėmimo sakinio`);
        }
      }
    });
    if (!items.some((it) => it.decays === true) || !items.some((it) => it.decays === false)) {
      problems.push("reikia ir daikto, kuris suyra, ir daikto, kuris lieka");
    }
    if (times.length !== 2) problems.push("reikia dviejų laiko žingsnių");
    times.forEach((t) => {
      if (!t.id || !t.label) problems.push("laiko žingsnis be id ar užrašo");
      else if (!t.say || !S[t.say]) problems.push(`laiko žingsnio „${t.label}“ sakinio nėra`);
    });
    ["ask", "markDone", "markOff", "none", "cleanAsk", "cleanNote", "done", "again"]
      .forEach((k) => { if (!S[k]) problems.push(`sakinio „${k}“ nėra`); });
    if (problems.length) {
      console.error(`kas-lieka-pievoje: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Pievos scena nesuderinta su daiktais.</p>';
      controls.innerHTML = "";
      return null;
    }

    const GROUND = 236;      // pievos paviršius
    const ICON_Y = GROUND - 44;  // piktogramos viršus (40 × 40 laukas × 1,15)
    const ICON_S = 1.15;

    /* Daiktai išdėstomi tolygiai, todėl scena lieka ta pati ir tada, kai
       modulyje daiktų mažiau (LL-33: kodas neturi spėlioti vieno skaičiaus). */
    const xs = items.map((_, i) => 56 + i * (250 / Math.max(1, items.length - 1)));

    const state = { t: 0, marks: new Set(), taken: new Set(), reported: false, msg: null };

    const dWord = (n) => (n === 1 ? "daiktas" : n >= 2 && n <= 4 ? "daiktai" : "daiktų");
    const decayed = (it) => it.decays === true && state.t > 0;
    const gone = (it) => decayed(it) || state.taken.has(it.id);
    const staying = () => items.filter((it) => it.decays === false && !state.taken.has(it.id));
    const inClearing = () => items.filter((it) => !gone(it));
    const timeStep = () => (state.t < times.length ? times[state.t] : null);

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <p id="klp-line" style="margin:0 0 .35rem;min-width:0;text-align:center;font-weight:800;
           font-size:.9rem;line-height:1.25;overflow-wrap:anywhere;color:var(--ink-soft)"></p>
        <svg id="klp-scene" viewBox="0 0 360 260" width="100%"
             style="display:block;max-width:360px;height:auto;margin:0 auto"
             role="img" aria-label="Pieva su daiktais po pikniko."></svg>
        <p id="klp-count" style="margin:.4rem 0 0;min-width:0;text-align:center;font-weight:800;
           font-size:.95rem;line-height:1.25;overflow-wrap:anywhere"></p>
        <p id="klp-fate" class="sim-note" style="margin:.2rem 0 0;line-height:1.3"></p>
        <p style="margin:.1rem 0 0;text-align:center;font-size:.78rem;line-height:1.3;color:var(--ink-soft)">
          Scena rodo pievą, ne visą mišką.
        </p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.55rem;width:100%;max-width:34rem;margin:0 auto;min-width:0">
        <p id="klp-ask" style="margin:0;min-width:0;font-size:.95rem;line-height:1.25;font-weight:800;
           text-align:center;overflow-wrap:anywhere"></p>
        <div id="klp-mark" role="group" aria-label="Pažymėk daiktus, kurie liks"
             style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem;min-width:0"></div>
        <div id="klp-time" role="group" aria-label="Laikas"
             style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem;min-width:0"></div>
        <div id="klp-take" role="group" aria-label="Surink daiktus"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5rem),1fr));gap:.4rem;min-width:0"></div>
        <button type="button" class="btn ghost" id="klp-reset"
                style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    const scene = stage.querySelector("#klp-scene");
    const line = stage.querySelector("#klp-line");
    const countEl = stage.querySelector("#klp-count");
    const fateEl = stage.querySelector("#klp-fate");
    const askEl = controls.querySelector("#klp-ask");
    const markGroup = controls.querySelector("#klp-mark");
    const timeGroup = controls.querySelector("#klp-time");
    const takeGroup = controls.querySelector("#klp-take");
    const resetBtn = controls.querySelector("#klp-reset");

    function sceneMarkup() {
      const marks = items.map((it, i) => (state.marks.has(it.id)
        ? art.spot(xs[i] - 7, 176, 54, 68, "#2f6f4f", "apvali", 2.5)
        : "")).join("");
      const shown = items.map((it, i) => {
        if (state.taken.has(it.id)) return "";
        if (decayed(it)) {
          /* Tai, ką gamta suėmė, lieka kaip tamsi žemės dėmė — ne tuščia
             vieta, kuri atrodytų kaip „dingo“ (LL-18 priešprieša). */
          return `<g opacity=".85">${art.spot(xs[i] + 3, 226, 34, 13, "#8a6a4a", "apvali")}
            ${art.grass(xs[i] + 10, 232, 0.7, "#6f8f4e")}</g>`;
        }
        return art.pictogram(it.icon, xs[i], ICON_Y, ICON_S);
      }).join("");
      return `${art.defs("klp")}
        ${art.sun(318, 34, 11, "klp", 0.85)}
        ${art.cloud(66, 40, 0.72)}
        ${art.hills(360, 170)}
        ${art.tree(22, 232, 0.5, "vasara")}
        ${art.tree(340, 230, 0.4, "vasara")}
        ${art.grass(40, 242, 1)}${art.grass(150, 244, 0.9)}${art.grass(262, 243, 0.95)}
        ${marks}${shown}`;
    }

    function sceneLabel() {
      const now = inClearing().map((it) => it.label);
      const marked = items.filter((it) => state.marks.has(it.id)).map((it) => it.label);
      const when = state.t ? ` ${times[state.t - 1].label.toLowerCase()}` : "";
      const parts = [now.length ? `Pievoje${when}: ${now.join(", ")}.` : `Pievoje${when} nieko nėra.`];
      if (marked.length) {
        parts.push(`${state.t ? "Spėjimas buvo" : "Spėjimas"}: liks ${marked.join(", ")}.`);
      }
      return parts.join(" ");
    }

    const markLine = () => {
      const m = items.filter((it) => state.marks.has(it.id)).map((it) => it.label);
      return m.length ? `Tu pažymėjai: ${m.join(", ")}.` : S.none;
    };

    const fateLine = () => {
      if (state.t === 0) return "";
      return items.map((it) => {
        if (state.taken.has(it.id)) return "";
        return it.sentences[state.t === 1 ? "year" : "decade"];
      }).filter(Boolean).join(" ");
    };

    function render(focusSel) {
      scene.innerHTML = sceneMarkup();
      scene.setAttribute("aria-label", sceneLabel());

      const count = inClearing().length;
      countEl.textContent = state.t === 0
        ? `Pievoje yra ${count} ${dWord(count)}.`
        : count === 0 ? "Pievoje nieko neliko." : `Pievoje liko ${count} ${dWord(count)}.`;
      fateEl.textContent = fateLine();
      line.textContent = state.marks.size ? markLine() : "";

      askEl.textContent = state.t === 0 ? S.ask
        : staying().length ? S.cleanAsk : S.done;

      /* Pažymėti galima tik prieš laiką: po jo spėjimas lieka matomas, bet
         nebetaisomas — kitaip vaikas „atspėtų“ jau matęs atsakymą. */
      markGroup.innerHTML = items.map((it) => {
        const on = state.marks.has(it.id);
        const off = state.t > 0;
        return `<button type="button" class="btn secondary" data-mark="${esc(it.id)}"
          aria-pressed="${on ? "true" : "false"}" ${off ? "disabled" : ""}
          aria-label="${esc(it.label)}${on ? ", pažymėta" : ""}${off ? ", spėjimas nebekeičiamas" : ""}"
          style="display:grid;justify-items:center;gap:.15rem;min-width:0;min-height:60px;height:auto;
          padding:.3rem .25rem;font-size:.9rem;line-height:1.15;overflow-wrap:anywhere;
          ${on ? "background:var(--ink);color:var(--paper);border-color:var(--ink);" : ""}">
          <span aria-hidden="true" style="font-size:.8rem;font-weight:800;min-height:.9rem">${on ? "✓" : " "}</span>
          <span style="min-width:0">${esc(it.label)}</span>
        </button>`;
      }).join("");

      timeGroup.innerHTML = times.map((t, i) => {
        const off = state.t !== i;
        return `<button type="button" class="btn secondary" data-time="${esc(t.id)}" ${off ? "disabled" : ""}
          aria-label="${off
            ? (state.t > i ? "Šis laiko žingsnis jau praėjęs" : "Pirma paspausk ankstesnį laiko žingsnį")
            : `Pasuk laiką: ${esc(t.label)}`}"
          style="min-width:0;min-height:56px;height:auto;padding:.35rem .3rem;font-size:.92rem;
          line-height:1.15;overflow-wrap:anywhere">${esc(t.label)}</button>`;
      }).join("");

      takeGroup.innerHTML = state.t === 0 ? "" : items.filter((it) => it.decays === false).map((it) => {
        const taken = state.taken.has(it.id);
        return `<button type="button" class="btn secondary" data-take="${esc(it.id)}" ${taken ? "disabled" : ""}
          aria-label="${taken ? `${esc(it.label)} jau pasiimtas` : esc(it.takeLabel)}"
          style="min-width:0;min-height:56px;height:auto;padding:.35rem .3rem;font-size:.92rem;
          line-height:1.15;overflow-wrap:anywhere">${esc(taken ? "Pasiimta" : it.takeLabel)}</button>`;
      }).join("");

      resetBtn.setAttribute("aria-label", "Pradėk iš naujo nuo pikniko dienos");

      api.readout(state.msg ? state.msg.readout : askEl.textContent);
      api.note(state.msg ? state.msg.note : (state.t === 0 ? S.ask : ""));

      if (focusSel) {
        const el = controls.querySelector(focusSel);
        const fallback = controls.querySelector("#klp-reset");
        const target = el && !el.disabled ? el : fallback;
        if (target) target.focus();
      }
    }

    function toggleMark(id) {
      if (state.t > 0) return;
      const it = items.find((x) => x.id === id);
      if (!it) return;
      const on = !state.marks.has(id);
      if (on) state.marks.add(id); else state.marks.delete(id);
      state.msg = { readout: markLine(), note: on ? S.markDone : S.markOff };
      api.speak(on ? S.markDone : S.markOff);
      render(`[data-mark="${id}"]`);
    }

    function advance() {
      const step = timeStep();
      if (!step) return;
      state.t += 1;
      const said = S[step.say];
      state.msg = { readout: `${said} ${fateLine()}`.trim(), note: "" };
      api.speak(said);
      /* Po laiko žingsnio tas pats mygtukas tampa neaktyvus, todėl fokusas
         keliamas į kitą veiksmą — kitaip naršyklė jį numestų (LL-32). */
      const nextTime = timeStep();
      render(nextTime ? `[data-time="${nextTime.id}"]` : (staying().length ? "[data-take]" : "#klp-reset"));
    }

    function take(id) {
      const it = items.find((x) => x.id === id);
      if (!it || it.decays !== false || state.taken.has(id) || state.t === 0) return;
      state.taken.add(id);
      state.msg = { readout: it.sentences.take, note: S.cleanNote };
      api.speak(it.sentences.take);
      if (staying().length === 0) {
        if (!state.reported) {
          state.reported = true;
          api.progress({ correct: true });
        }
        state.msg = { readout: S.done, note: S.cleanNote };
        api.speak(S.done);
        render("#klp-reset");
        return;
      }
      render("[data-take]");
    }

    function reset() {
      state.t = 0;
      state.marks.clear();
      state.taken.clear();
      state.msg = { readout: S.again, note: S.ask };
      api.speak(S.again);
      render("[data-mark]");
    }

    controls.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.dataset.mark) { toggleMark(b.dataset.mark); return; }
      if (b.dataset.time) { advance(); return; }
      if (b.dataset.take) { take(b.dataset.take); return; }
      if (b.id === "klp-reset") reset();
    });

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const group = e.target.closest("#klp-mark, #klp-time, #klp-take");
      if (!group) return;
      const btns = [...group.querySelectorAll("button")].filter((b) => !b.disabled);
      if (btns.length < 2) return;
      const idx = btns.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      const to = (idx + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length;
      btns[to].focus();
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 21. Energijos šaltiniai — visiems reikia savo šaltinio              */
/* ------------------------------------------------------------------ */
/* Vienas veiksmas atima energiją visiems trims iš karto, o pasekmės    */
/* trys: augalas palinksta, vaiko kamuolys nukrenta, mašinėlė sustoja.  */
/* Būtent tai, o ne paaiškinimas, paneigia nuostatą „energijos reikia   */
/* tik tiems, kas juda“: augalas vietoje nejudėjo, o vis tiek sustojo.   */
/* Šaltiniai grąžinami po vieną, todėl kiekvienas dalyvis atgyja būtent  */
/* savo šaltinio dėka, o ne „iš naujo įjungus viską“. Visi užrašai —    */
/* iš `config`, kad ekranas ir balsas neprasilenktų (LL-33).            */
const energijosSaltiniai = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const items = (Array.isArray(config.items) ? config.items : []).filter(Boolean);
    const esc = (t) => String(t).replace(/[&<>\"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* --- Sutarties vartai: nesuderinta konfigūracija pasakoma žodžiais,
       o ne tyliai pakeičiama (LL-33). --- */
    const ICONS = ["augalas", "vaikas", "masinele"];
    const problems = [];
    if (items.length !== 3) problems.push("reikia trijų dalyvių");
    const seen = new Set();
    items.forEach((it) => {
      if (!it.id || !it.label) { problems.push("dalyvis be id ar užrašo"); return; }
      if (seen.has(it.id)) problems.push(`dalyvis „${it.id}“ kartojasi`);
      seen.add(it.id);
      if (!ICONS.includes(it.icon)) problems.push(`dalyvis „${it.id}“ turi nežinomą piešinį „${it.icon}“`);
      ["sourceLabel", "on", "off", "restoreLabel"].forEach((k) => {
        if (typeof it[k] !== "string" || !it[k].trim()) problems.push(`dalyvis „${it.id}“ neturi „${k}“`);
      });
      if (!it.sentences || typeof it.sentences.on !== "string" || !it.sentences.on.trim()) {
        problems.push(`dalyvis „${it.id}“ neturi grąžinimo sakinio`);
      }
    });
    if (items.length === 3 && new Set(items.map((it) => it.icon)).size !== 3) {
      problems.push("trys dalyviai turi turėti tris skirtingus piešinius");
    }
    ["ask", "cut", "note", "restoreAsk", "done", "again"].forEach((k) => {
      if (!S[k]) problems.push(`sakinio „${k}“ nėra`);
    });
    if (problems.length) {
      console.error(`energijos-saltiniai: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Scena nesuderinta su dalyviais.</p>';
      controls.innerHTML = "";
      return null;
    }

    const GROUND = 238;
    const SRC_Y = 58;
    const XS = [64, 180, 296];
    const stations = items.map((it, i) => ({ it, x: XS[i] }));

    const state = { cut: false, back: new Set(), reported: false, msg: null };
    const restored = (it) => state.back.has(it.id);
    const active = (st) => !state.cut || restored(st.it);
    const missing = () => stations.filter((st) => state.cut && !restored(st.it));

    /* Šaltinio ženklas: saulė, obuolys, baterija. Atimtas šaltinis ne tik
       blankesnis — jis perbrauktas, todėl spalva lieka ne vienintelė
       informacijos nešėja (prieinamumas). */
    function srcGlyph(st) {
      const on = active(st);
      const inner = st.it.icon === "augalas"
        ? art.sun(st.x, SRC_Y, 8, "es", on ? 0.95 : 0.18)
        : st.it.icon === "vaikas"
          ? art.fruit(st.x, SRC_Y, 0.95, 0.9)
          : art.pictogram("baterija", st.x - 18, SRC_Y - 18, 0.9);
      const cross = on ? "" : `<line x1="${st.x - 14}" y1="${SRC_Y - 14}" x2="${st.x + 14}" y2="${SRC_Y + 14}"
        stroke="#b0413e" stroke-width="3" stroke-linecap="round"/>`;
      return `<g${on ? "" : ' opacity=".5"'}>${inner}</g>${cross}`;
    }

    /* Dalyvio būsena. Augalas: stiebas išsitiesia arba nusvyra, žiedas
       išnyksta. Vaikas: kamuolys skrieja arba guli prie kojų. Mašinėlė:
       judėjimo brūkšniai arba jų nėra. */
    function subject(st) {
      const on = active(st);
      if (st.it.icon === "augalas") {
        return `${art.pot(st.x - 18, 206, 36, 30, "es-pot")}
          ${art.stem(st.x, 204, on ? 40 : 30, 4, on ? "#4c9a45" : "#8f9a6a", !on)}
          ${art.leaf(st.x, on ? 188 : 192, 11, -1, !on, on ? "#59b95a" : "#a9b07a")}
          ${art.leaf(st.x, on ? 178 : 184, 10, 1, !on, on ? "#4c9a45" : "#9aa86a")}
          ${on ? art.flower(st.x + 13, 166, 0.55) : ""}`;
      }
      if (st.it.icon === "vaikas") {
        const ball = on
          ? `<path d="M${st.x + 6} 196 Q${st.x + 16} 168 ${st.x + 30} 178" fill="none"
                   stroke="#8a8578" stroke-width="1.6" stroke-dasharray="3 4"/>
             ${art.ball(st.x + 32, 178, 7, "#f2cf94", "#a9793f")}`
          : art.ball(st.x + 26, 231, 7, "#f2cf94", "#a9793f");
        return `${art.kid(st.x, GROUND, 0.95)}${ball}`;
      }
      const streaks = on
        ? `<g stroke="#8fa07a" stroke-width="3" stroke-linecap="round" opacity=".7">
             <line x1="${st.x - 36}" y1="212" x2="${st.x - 22}" y2="212"/>
             <line x1="${st.x - 32}" y1="221" x2="${st.x - 17}" y2="221"/>
           </g>`
        : "";
      return `${streaks}${art.pictogram("masinele", st.x - 20, 204, 1.0)}`;
    }

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <p id="es-line" style="margin:0 0 .35rem;min-width:0;text-align:center;font-weight:800;
           font-size:.9rem;line-height:1.25;overflow-wrap:anywhere;color:var(--ink-soft)"></p>
        <svg id="es-scene" viewBox="0 0 360 272" width="100%"
             style="display:block;max-width:360px;height:auto;margin:0 auto" role="img"></svg>
        <p id="es-state" style="margin:.4rem 0 0;min-width:0;text-align:center;font-weight:800;
           font-size:.95rem;line-height:1.25;overflow-wrap:anywhere"></p>
        <p id="es-fate" class="sim-note" style="margin:.2rem 0 0;line-height:1.3"></p>
        <p style="margin:.1rem 0 0;text-align:center;font-size:.78rem;line-height:1.3;color:var(--ink-soft)">
          Scena rodo tris dalyvius, ne visą gamtą.
        </p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.55rem;width:100%;max-width:34rem;margin:0 auto;min-width:0">
        <p id="es-ask" style="margin:0;min-width:0;font-size:.95rem;line-height:1.25;font-weight:800;
           text-align:center;overflow-wrap:anywhere"></p>
        <button type="button" class="btn" id="es-cut"
                style="min-height:56px;font-size:.95rem;line-height:1.2">Atimk energiją</button>
        <div id="es-restore" role="group" aria-label="Grąžink šaltinius"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5rem),1fr));
             gap:.4rem;min-width:0"></div>
        <button type="button" class="btn ghost" id="es-reset"
                style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    const scene = stage.querySelector("#es-scene");
    const line = stage.querySelector("#es-line");
    const stateEl = stage.querySelector("#es-state");
    const fateEl = stage.querySelector("#es-fate");
    const askEl = controls.querySelector("#es-ask");
    const cutBtn = controls.querySelector("#es-cut");
    const restoreGroup = controls.querySelector("#es-restore");
    const resetBtn = controls.querySelector("#es-reset");

    function sceneMarkup() {
      return `${art.defs("es")}
        ${art.cloud(24, 104, 0.5, 0.85)}
        ${art.cloud(336, 112, 0.45, 0.8)}
        ${art.hills(360, 186)}
        ${art.grass(28, 244, 0.9)}${art.grass(140, 246, 0.8)}${art.grass(250, 245, 0.85)}
        ${stations.map((st) => `
          <text x="${st.x}" y="32" text-anchor="middle" font-family="system-ui, sans-serif"
                font-size="12" font-weight="700" fill="#5f574d">${esc(st.it.sourceLabel)}</text>
          ${srcGlyph(st)}
          ${active(st) ? art.viewArrow(st.x, 84, st.x, 148) : ""}
          ${subject(st)}
          <text x="${st.x}" y="262" text-anchor="middle" font-family="system-ui, sans-serif"
                font-size="13" font-weight="800"
                fill="${active(st) ? "#2f5f3a" : "#8a4a3a"}">${esc(active(st) ? st.it.on : st.it.off)}</text>`).join("")}`;
    }

    function sceneLabel() {
      return state.cut
        ? "Pievoje augalas vazone, vaikas su kamuoliu ir žaislinė mašinėlė. Visiems trims atimtas energijos šaltinis."
        : "Pievoje augalas vazone, vaikas su kamuoliu ir žaislinė mašinėlė. Kiekvienas turi savo šaltinį: saulė, maistas, baterija.";
    }

    function stateLine() {
      if (!state.cut) {
        return `Šaltinis duotas visiems trims: ${stations.map((st) => st.it.sourceLabel.toLowerCase()).join(", ")}.`;
      }
      const miss = missing().map((st) => st.it.label.toLowerCase());
      return miss.length ? `Be šaltinio liko: ${miss.join(", ")}.` : S.done;
    }

    function render(focusSel) {
      scene.innerHTML = sceneMarkup();
      scene.setAttribute("aria-label", sceneLabel());

      line.textContent = state.msg ? state.msg.readout : "";
      stateEl.textContent = stateLine();
      fateEl.textContent = state.msg ? (state.msg.note || "") : "";

      askEl.textContent = !state.cut ? S.ask : (missing().length ? S.restoreAsk : S.done);

      /* Atimtas šaltinis — pradinis veiksmas nebegalimas, o jo vieta
         užima grąžinimas: nebeaktyvus valdiklis lieka tik tada, kai jį
         paaiškina sąlyga (LL-04). `hidden` vienas nepakanka: `.btn` CSS
         nustato `display`, todėl elementas liktų matomas ir neveiktų. */
      cutBtn.hidden = state.cut;
      cutBtn.style.display = state.cut ? "none" : "";

      restoreGroup.innerHTML = state.cut ? missing().map((st) => `<button type="button"
        class="btn secondary" data-restore="${esc(st.it.id)}" aria-label="${esc(st.it.restoreLabel)}"
        style="min-width:0;min-height:56px;height:auto;padding:.35rem .3rem;font-size:.92rem;
        line-height:1.15;overflow-wrap:anywhere">${esc(st.it.restoreLabel)}</button>`).join("") : "";

      api.readout(state.msg ? state.msg.readout : askEl.textContent);
      api.note(state.msg ? (state.msg.note || "") : "");

      if (focusSel) {
        const el = controls.querySelector(focusSel);
        const fallback = controls.querySelector(missing().length ? "[data-restore]" : "#es-reset");
        const target = el && !el.disabled && !el.hidden ? el : fallback;
        if (target) target.focus();
      }
    }

    function cut() {
      if (state.cut) return;
      state.cut = true;
      state.back.clear();
      state.msg = { readout: S.cut, note: S.note };
      api.speak(S.cut);
      render("[data-restore]");
    }

    function restore(id) {
      const st = stations.find((x) => x.it.id === id);
      if (!st || !state.cut || restored(st.it)) return;
      state.back.add(id);
      const said = st.it.sentences.on;
      state.msg = { readout: said, note: missing().length ? S.restoreAsk : "" };
      api.speak(said);
      if (missing().length === 0) {
        state.msg = { readout: S.done, note: S.note };
        if (!state.reported) {
          state.reported = true;
          api.progress({ correct: true });
        }
        api.speak(S.done);
        render("#es-reset");
        return;
      }
      render("[data-restore]");
    }

    function reset() {
      state.cut = false;
      state.back.clear();
      state.msg = { readout: S.again, note: S.ask };
      api.speak(S.again);
      render("#es-cut");
    }

    controls.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.dataset.restore) { restore(b.dataset.restore); return; }
      if (b.id === "es-cut") cut();
      else if (b.id === "es-reset") reset();
    });

    controls.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const group = e.target.closest("#es-restore");
      if (!group) return;
      const btns = [...group.querySelectorAll("button")].filter((b) => !b.disabled);
      if (btns.length < 2) return;
      const idx = btns.indexOf(document.activeElement);
      if (idx < 0) return;
      e.preventDefault();
      const to = (idx + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length;
      btns[to].focus();
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------------
 * Gyvybės ženklai (26.2.4 „Bendri gyvų organizmų požymiai“).
 *
 * Ko vaikas negali pamatyti viename paveikslėlyje: kad gėlė, katė ir tu
 * turite TUOS PAČIUS penkis ženklus, o mašina — ne. Modelis laiko tris
 * būtybes viename kadre ir leidžia tikrinti po vieną ženklą, todėl žymos
 * „5 / 5“ ir „1 / 5“ atsiranda tame pačiame ekrane, o ne dviejuose
 * puslapiuose. Skaičius skaičiuojamas iš `yes` sąrašo, o ne įrašytas tekste:
 * jei pasikeistų konfigūracija, tekstas nepradėtų meluoti (LL-21).
 *
 * Veiksmas yra tikras modelio parametras: vaikas keičia TIKRINAMĄ ŽENKLĄ ir
 * mato pasekmę toje pačioje scenoje (gėlė išauga lapą, katė gauna lėkštę,
 * robotas nepakinta). Todėl „neauga“ yra rodoma, o ne parašyta.
 * ---------------------------------------------------------------------- */
const GYZ_ARTS = ["gele", "kate", "robotas"];

const gyvybesZenklai = {
  mount({ stage, controls, api, config = {} }) {
    const S = config.sentences || {};
    const esc = (t) => String(t).replace(/[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const signs = (Array.isArray(config.signs) ? config.signs : []).filter(Boolean);
    const beings = (Array.isArray(config.beings) ? config.beings : []).filter(Boolean);

    /* --- Sutarties vartai: nesuderinta konfigūracija pasakoma žodžiais,
       o ne tyliai pakeičiama (LL-33). --- */
    const problems = [];
    if (signs.length !== 5) problems.push("reikia penkių ženklų");
    if (beings.length !== 3) problems.push("reikia trijų būtybių");
    const signIds = signs.map((s) => s.id).filter(Boolean);
    if (signIds.length !== signs.length) problems.push("ženklas be id");
    if (new Set(signIds).size !== signIds.length) problems.push("ženklų id kartojasi");
    signs.forEach((s) => { if (!s.label) problems.push(`ženklas „${s.id}“ be užrašo`); });
    const arts = new Set();
    beings.forEach((b) => {
      if (!b.id || !b.label) { problems.push("būtybė be id ar užrašo"); return; }
      if (!GYZ_ARTS.includes(b.art)) problems.push(`būtybė „${b.id}“ turi nežinomą piešinį „${b.art}“`);
      if (arts.has(b.art)) problems.push(`piešinys „${b.art}“ kartojasi`);
      arts.add(b.art);
      const has = Array.isArray(b.yes) ? b.yes : [];
      has.forEach((id) => {
        if (!signIds.includes(id)) problems.push(`būtybė „${b.id}“ turi nežinomą ženklą „${id}“`);
      });
      signs.forEach((s) => {
        const line = (b.sentences || {})[s.id];
        if (typeof line !== "string" || !line.trim()) {
          problems.push(`būtybė „${b.id}“ neturi sakinio „${s.id}“`);
        } else if (line.length > 120) {
          problems.push(`būtybės „${b.id}“ sakinys „${s.id}“ ilgesnis nei 120 simbolių`);
        }
      });
    });
    ["ask", "first", "done", "again"].forEach((k) => {
      if (!S[k]) problems.push(`sakinio „${k}“ nėra`);
    });
    if (problems.length) {
      console.error(`gyvybes-zenklai: ${problems.join("; ")}`);
      stage.innerHTML = '<p class="error-box">Scena nesuderinta su ženklais.</p>';
      controls.innerHTML = "";
      return null;
    }

    const GROUND = 238;
    const XS = [56, 164, 272];
    const stations = beings.map((b, i) => ({ b, x: XS[i] }));
    const open = new Map(beings.map((b) => [b.id, new Set()]));
    const state = { current: beings[0].id, line: S.ask, note: "", reported: false };

    const beingOf = (id) => beings.find((b) => b.id === id) || beings[0];
    const has = (b, signId) => Array.isArray(b.yes) && b.yes.includes(signId);
    const ticks = (b) => signs.filter((s) => has(b, s.id) && open.get(b.id).has(s.id)).length;
    const checked = (b) => open.get(b.id).size;
    const complete = () => beings.every((b) => checked(b) === signs.length);

    /* Oro judėjimas: dvi trumpos kreivės. Tai ne puošmena — jomis rodomas
       vienintelis nematomas ženklas, kurio vaikas negali pamatyti. */
    const airArcs = (x, y, dir = 1) => `<g stroke="#5f9fbf" stroke-width="2.2" fill="none"
      stroke-linecap="round" opacity=".9">
      <path d="M${x} ${y} q ${8 * dir} -6 ${16 * dir} 0"/>
      <path d="M${x} ${y + 9} q ${8 * dir} -6 ${16 * dir} 0"/>
    </g>`;

    const bubbles = (x, y) => `<g fill="none" stroke="#5fb3e0" stroke-width="1.6" opacity=".9">
      <circle cx="${x}" cy="${y}" r="3.4"/><circle cx="${x + 7}" cy="${y - 8}" r="2.4"/>
      <circle cx="${x - 5}" cy="${y - 13}" r="1.8"/>
    </g>`;

    function flower(x, o) {
      const grown = o.has("auga");
      const h = grown ? 62 : 40;
      const head = 206 - h;
      const tilt = o.has("juda") ? -9 : 0;
      const leaves = `<g transform="rotate(${tilt} ${x} 206)">
          ${art.leaf(x, 206 - h * 0.45, grown ? 13 : 11, -1, false, "#59b95a")}
          ${art.leaf(x, 206 - h * 0.64, grown ? 12 : 10, 1, false, "#4c9a45")}
          ${grown ? art.leaf(x, 206 - h * 0.84, 9, -1, false, "#6ec46b") : ""}
        </g>`;
      const headMark = o.has("dauginasi")
        ? `${art.seed(x - 5, head - 2, 0.55)}${art.seed(x + 6, head - 8, 0.5)}
           ${art.seed(x + 1, head + 5, 0.45)}`
        : art.flower(x, head - 2, grown ? 0.8 : 0.62);
      const turn = o.has("juda")
        ? `<path d="M${x + 28} ${head - 16} q -16 -10 -28 -2" fill="none" stroke="#c08a2e"
             stroke-width="2" stroke-dasharray="4 3"/>
           <path d="M${x - 2} ${head - 20} l 6 -2 l -2 6" fill="#c08a2e"/>`
        : "";
      return `<g>
        ${art.pot(x - 18, 208, 36, 28, "gz-pot")}
        ${art.stem(x, 204, h, 4, "#4c8b3a", false)}
        ${leaves}${headMark}${turn}
        ${o.has("maitinasi") ? art.drops(x - 15, 196, 3) : ""}
        ${o.has("kvepuoja") ? `${airArcs(x + 22, 206 - h * 0.5)}${bubbles(x + 16, 206 - h * 0.7)}` : ""}
      </g>`;
    }

    function cat(x, o) {
      const parts = [art.cat(x, GROUND, 1)];
      if (o.has("kvepuoja")) parts.push(airArcs(x + 20, 186, 1));
      if (o.has("maitinasi")) parts.push(art.bowl(x + 36, GROUND, 0.95));
      if (o.has("auga")) {
        parts.push(`<g stroke="#6f8a52" stroke-width="2" fill="none">
          <path d="M${x - 34} ${GROUND - 2} L${x - 34} ${GROUND - 52}" stroke-dasharray="4 3"/>
          <path d="M${x - 39} ${GROUND - 46} l 5 -8 l 5 8"/>
        </g>`);
      }
      if (o.has("dauginasi")) {
        parts.push(art.cat(x - 30, GROUND, 0.34, "#a9885f", "#c2a37c"));
        parts.push(art.cat(x - 45, GROUND, 0.28, "#b5946a", "#c9ab84"));
      }
      return parts.join("");
    }

    function robot(x, o) {
      const puffs = o.has("kvepuoja")
        ? `<g fill="#c3ccd4" opacity=".95">
             <circle cx="${x + 26}" cy="${GROUND - 22}" r="2.8"/>
             <circle cx="${x + 31}" cy="${GROUND - 32}" r="2.2"/>
             <circle cx="${x + 25}" cy="${GROUND - 40}" r="1.7"/>
           </g>`
        : "";
      return `${art.robot(x, GROUND, 1)}${puffs}`;
    }

    function drawBeing(st) {
      const o = open.get(st.b.id);
      if (st.b.art === "gele") return flower(st.x, o);
      if (st.b.art === "kate") return cat(st.x, o);
      return robot(st.x, o);
    }

    stage.innerHTML = `
      <div style="width:100%;max-width:32rem;margin:0 auto;min-width:0">
        <p id="gz-line" style="margin:0 0 .3rem;min-width:0;text-align:center;font-weight:800;
           font-size:.92rem;line-height:1.25;overflow-wrap:anywhere"></p>
        <svg id="gz-scene" viewBox="0 0 328 272" width="100%"
             style="display:block;max-width:360px;height:auto;margin:0 auto" role="img"></svg>
        <p id="gz-state" style="margin:.35rem 0 0;min-width:0;text-align:center;font-weight:800;
           font-size:.95rem;line-height:1.25;overflow-wrap:anywhere"></p>
        <p class="sim-note" style="margin:.25rem 0 0;line-height:1.3">
          Scena rodo tris būtybes, ne visą gamtą. Kirmėlė ir medis turi tuos pačius ženklus.
        </p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.5rem;width:100%;max-width:34rem;margin:0 auto;min-width:0">
        <p id="gz-ask" style="margin:0;min-width:0;font-size:.95rem;line-height:1.25;font-weight:800;
           text-align:center;overflow-wrap:anywhere"></p>
        <div id="gz-beings" role="group" aria-label="Pasirink būtybę"
             style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem;min-width:0">
          ${beings.map((b) => `<button type="button" class="btn secondary" data-being="${esc(b.id)}"
             aria-pressed="false"
             style="min-width:0;min-height:56px;height:auto;padding:.3rem .2rem;font-size:.9rem;
             line-height:1.15;overflow-wrap:anywhere">${esc(b.label)}</button>`).join("")}
        </div>
        <div id="gz-signs" role="group" aria-label="Tikrinami ženklai"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr));
             gap:.35rem;min-width:0">
          ${signs.map((s) => `<button type="button" class="btn secondary" data-sign="${esc(s.id)}"
             aria-pressed="false"
             style="min-width:0;min-height:56px;height:auto;padding:.3rem .2rem;font-size:.9rem;
             line-height:1.15;overflow-wrap:anywhere">${esc(s.label)}</button>`).join("")}
        </div>
        <button type="button" class="btn ghost" id="gz-reset"
                style="min-height:48px;font-size:.95rem">Iš naujo</button>
      </div>`;

    const sceneEl = stage.querySelector("#gz-scene");
    const lineEl = stage.querySelector("#gz-line");
    const stateEl = stage.querySelector("#gz-state");
    const askEl = controls.querySelector("#gz-ask");
    const beingBtns = [...controls.querySelectorAll("[data-being]")];
    const signBtns = [...controls.querySelectorAll("[data-sign]")];
    const resetBtn = controls.querySelector("#gz-reset");

    const paint = (btn, on) => {
      btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
      btn.style.color = on ? "var(--paper)" : "var(--ink)";
      btn.style.borderColor = on ? "var(--ink)" : "var(--line)";
    };

    function sceneMarkup() {
      return `${art.defs("gz")}
        ${art.plank(8, GROUND, 312, 10)}
        ${stations.map((st) => {
    const sel = st.b.id === state.current;
    const label = esc(st.b.label);
    return `<path d="M${st.x - 6} 8 L${st.x + 6} 8 L${st.x} 15 Z"
              fill="${sel ? "#3a342b" : "transparent"}"/>
            <text x="${st.x}" y="32" text-anchor="middle" font-family="system-ui, sans-serif"
                  font-size="14" font-weight="${sel ? 800 : 600}"
                  fill="${sel ? "#2f2a23" : "#5f574d"}">${label}</text>
            <text x="${st.x}" y="48" text-anchor="middle" font-family="system-ui, sans-serif"
                  font-size="13" font-weight="700" fill="#6b6357">✓ ${ticks(st.b)} / ${signs.length}</text>
            ${drawBeing(st)}`;
  }).join("")}`;
    }

    function sceneLabel() {
      return `Ant palangės vazoninė gėlė, katė ir robotas dulkių siurblys. `
        + stations.map((st) => `${st.b.label}: ${ticks(st.b)} iš ${signs.length} ženklų.`).join(" ");
    }

    function render() {
      sceneEl.innerHTML = sceneMarkup();
      sceneEl.setAttribute("aria-label", sceneLabel());

      lineEl.textContent = state.line;
      stateEl.textContent = `Rasta ženklų: ${stations.map((st) => `${st.b.label} ${ticks(st.b)}`).join(" · ")}`;
      askEl.textContent = `${beingOf(state.current).label}: patikrinta `
        + `${checked(beingOf(state.current))} iš ${signs.length} ženklų.`;

      beingBtns.forEach((btn) => {
        const on = btn.dataset.being === state.current;
        paint(btn, on);
        btn.setAttribute("aria-pressed", String(on));
      });

      const b = beingOf(state.current);
      signBtns.forEach((btn) => {
        const id = btn.dataset.sign;
        const done = open.get(b.id).has(id);
        const label = (signs.find((s) => s.id === id) || {}).label || id;
        paint(btn, done);
        btn.textContent = `${done ? "✓ " : ""}${label}`;
        btn.setAttribute("aria-pressed", String(done));
        btn.setAttribute("aria-label", done
          ? `${label}: jau patikrinta. Paliesk, kad išgirstum dar kartą.`
          : `${label}: dar nepatikrinta. Tikrink ${b.label.toLowerCase()}.`);
      });

      api.readout(state.line);
      api.note(state.note);
    }

    /* Užbaigus ciklą rodoma išvada, o paskutinio ženklo sakinys lieka
       pastaboje — kitaip balsas sakytų viena, o ekranas rodytų kita (LL-33).
       Vėlesnis paspaudimas vėl rodo tik to ženklo sakinį. */
    function openSign(id) {
      const b = beingOf(state.current);
      const set = open.get(b.id);
      const first = !set.has(id);
      set.add(id);
      const said = (b.sentences || {})[id] || "";
      if (complete() && !state.reported) {
        state.reported = true;
        state.line = S.done;
        state.note = said;
        api.speak(S.done);
        api.progress({ correct: true });
      } else {
        state.line = said;
        state.note = first && !complete() ? S.first : "";
        api.speak(said);
      }
      render();
    }

    controls.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      if (btn.dataset.being) {
        state.current = btn.dataset.being;
        state.line = S.ask;
        state.note = "";
        render();
        return;
      }
      if (btn.dataset.sign) { openSign(btn.dataset.sign); return; }
      if (btn.id === "gz-reset") {
        beings.forEach((b) => open.get(b.id).clear());
        state.current = beings[0].id;
        state.line = S.again;
        state.note = "";
        api.speak(S.again);
        render();
        resetBtn.focus();
      }
    });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 22. Augalo dalys — vieta, o ne išvaizda                            */
/* ------------------------------------------------------------------ */
/* Viena didelė idėja: augalo dalį rodo VIETA, kur ji prijungta, o ne
   išvaizda. Modelis laiko keturis augalus (morka, kopūstas, ąžuolas,
   kiaulpienė) ir leidžia palyginti tą pačią dalį: morkos šaknis stora ir
   oranžinė, ąžuolo — plati ir šakota, kopūsto — plona su šakelėmis,
   kiaulpienės — ilga ir plona. Todėl vaikas, kuris šaknį atpažįsta iš
   oranžinės spalvos, ąžuole teisingo atsakymo neturi — būtent tą
   klaidingą nuostatą modelis ir parodo (gairių 4 skyriaus 3 klausimas).

   Du parametrai: augalas ir tai, ar žemė permatoma. Pasekmė matoma iš
   karto — ta pati dalis atrodo kitaip, o vardas nekinta. Pasirinkus
   šaknį, žemė atsiveria pati: taip vaikas pamato, kad šaknis visada
   po žeme, ir nesusiduria su užrakintu valdikliu be paaiškinimo (LL-04).
   Dalių, kurių tame augale nėra, mygtukų nerodome — modelis neieško to,
   ko pats nesukūrė (LL-03, LL-25). Morkoje žiedo nėra, nes pirmą vasarą
   morka žiedų neturi; todėl apie jį nekalbame nei mygtuku, nei tekstu.

   Skaičiuojama TIK šaknis („Šaknį matei 2 iš 4 augalų“): būtent ji
   parodo tą pačią dalį skirtingose išvaizdose. Pažanga žymima įveikus
   paskutinį augalą, o ne po pirmo paspaudimo (LL-29). */
const adEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

/* art.leaf piešia lapą į dešinę nuo taško, o pats tepasuka jį 8° arba 26°.
   Todėl lapų vėduoklė daroma sukant kiekvieną lapą apie stiebo tašką.
   `angles` yra KRYPTYS laipsniais nuo +x ašies (SVG y eina žemyn):
   -90 — tiesiai į viršų, -140 — į viršų kairėn. Anksčiau čia buvo
   simetriški kampai su kaitaliojamu `dir`, todėl du lapai apsisukdavo
   žemyn ir įlįsdavo į žemę (morkos lapai siekė 268, o žemė prasideda
   250) — paveikslas prieštaravo užrašui „auga iš stiebo viršaus“. */
const adLeaves = (cx, y, angles, s, color, droop) => angles
  .map((a) => `<g transform="rotate(${a} ${cx} ${y})">${art.leaf(cx, y, s, 1, droop, color)}</g>`)
  .join("");

/* Požeminės dalys. Skirtingos formos IR spalvos — todėl „šaknis“ negali
   būti atpažįstama iš vieno pavyzdžio (LL-28). */
const AD_ROOTS = {
  morka: `<path d="M164 250 C 164 284 174 308 180 328 C 186 308 196 284 196 250 Z"
      fill="#e2872f" stroke="#b96a1e" stroke-width="2"/>
    <path d="M169 292 q -14 10 -19 22 M192 300 q 12 8 17 20"
      stroke="#c9761f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  kopustas: `<path d="M180 250 C 179 280 177 300 180 314"
      stroke="#e3d3ae" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M180 272 q 12 4 18 12 M180 286 q -16 6 -24 16 M180 298 q 14 6 21 14"
      stroke="#dccaa2" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
  azuolas: `<path d="M180 250 L 180 318" stroke="#a97c4e" stroke-width="8" stroke-linecap="round"/>
    <path d="M180 266 C 168 276 156 288 146 306 M180 280 C 194 288 206 298 216 314
      M180 298 C 172 306 166 314 160 326"
      stroke="#a97c4e" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M180 310 q -9 6 -13 14 M181 316 q 9 4 13 10"
      stroke="#a97c4e" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
  kiaulpiene: `<path d="M180 250 C 179 282 184 306 180 332"
      stroke="#e6d7b4" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M181 274 q -13 8 -18 18 M181 300 q 12 8 16 18"
      stroke="#dccaa2" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
};

/* Virš žemės esančios dalys, sugrupuotos pagal dalies ID: žymint dalį,
   kitos pritemsta, o pasirinktoji lieka ryški. */
const AD_TOPS = {
  morka: {
    stiebas: `<path d="M172 250 q 0 -16 8 -16 q 8 0 8 16 z" fill="#4c8b3a"/>`,
    lapai: adLeaves(180, 236, [-140, -115, -90, -65, -40], 15, "#5aa552", 0),
  },
  kopustas: {
    lapai: `<path d="M180 250 C 152 250 140 222 158 202 C 172 186 188 186 202 202 C 220 222 208 250 180 250 Z"
        fill="#8fbf6a"/>
      <path d="M180 246 C 158 246 150 222 164 206 C 175 194 185 194 196 206 C 210 222 202 246 180 246 Z"
        fill="#a9d27f"/>
      <path d="M180 240 C 166 240 160 222 170 210 C 177 201 183 201 190 210 C 200 222 194 240 180 240 Z"
        fill="#c3e39a"/>
      <path d="M180 232 C 172 232 168 220 174 212 C 178 207 182 207 186 212 C 192 220 188 232 180 232 Z"
        fill="#dcefc0"/>
      <path d="M180 204 C 172 214 168 230 170 246 M180 204 C 188 214 192 230 190 246"
        stroke="#7aa858" stroke-width="1.6" fill="none" opacity=".5"/>`,
  },
  azuolas: {
    stiebas: `${art.stem(180, 250, 62, 13, "#8a5c33", 0)}
      <path d="M182 216 l -24 -14 M182 228 l 26 -16"
        stroke="#8a5c33" stroke-width="5" stroke-linecap="round" fill="none"/>`,
    lapai: `<circle cx="156" cy="198" r="19" fill="#4f9e4a"/><circle cx="204" cy="196" r="21" fill="#5aa954"/>
      <circle cx="180" cy="176" r="24" fill="#63b45b"/><circle cx="142" cy="216" r="13" fill="#448a40"/>
      <circle cx="218" cy="216" r="13" fill="#448a40"/><circle cx="180" cy="204" r="17" fill="#6fbe63"/>`,
    vaisius: `<path d="M224 218 v 8" stroke="#8a5c33" stroke-width="2"/>
      <ellipse cx="224" cy="238" rx="7" ry="9" fill="#c39a5c" stroke="#8f6a3a" stroke-width="1.4"/>
      <path d="M217 231 q 7 -6 14 0 q -7 5 -14 0 z" fill="#8a5c33"/>`,
  },
  kiaulpiene: {
    stiebas: art.stem(180, 250, 60, 4.5, "#6aa84f", 0),
    lapai: adLeaves(180, 246, [-170, -135, -90, -45, -10], 17, "#5aa552", 0),
    ziedas: art.flower(180, 190, 1.25, "#f4c430", "#e0a21a"),
    /* Pūkelis — vaisius su sėkla. Antras stiebas, kad žiedas ir vaisius
       būtų matomi kartu: augale jie auga toje pačioje vietoje, tik ne
       tuo pačiu metu, o vienas kitą pakeičia. */
    vaisius: `${art.stem(214, 250, 38, 3.5, "#6aa84f", 0)}
      <g stroke="#ffffff" stroke-width="1.5">
        ${Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 * Math.PI) / 180;
    return `<line x1="214" y1="212" x2="${(214 + Math.cos(a) * 13).toFixed(1)}" y2="${(212 + Math.sin(a) * 13).toFixed(1)}"/>`;
  }).join("")}
      </g>
      <circle cx="214" cy="212" r="9" fill="#f7f7f2" stroke="#d8d8cc" stroke-width="1.2"/>
      <circle cx="214" cy="212" r="4" fill="#e8e4c9"/>`,
  },
};

const augaloDalys = {
  mount({ stage, controls, api, config }) {
    const plants = Array.isArray(config.plants) ? config.plants : [];
    const ui = config.ui || {};
    const S = config.sentences || {};

    let plantIdx = 0;
    let part = "";
    let underground = false;
    let reported = false;
    const rootsSeen = new Set();

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem">
        <svg id="ad-svg" viewBox="0 0 360 340" role="img" aria-label="Augalo modelis"></svg>
        <div id="ad-compare" hidden style="margin-top:.5rem"></div>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.5rem;width:100%;max-width:34rem;margin:0 auto">
        <div id="ad-plants" role="group" aria-label="Pasirink augalą"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(7rem,1fr));gap:.4rem"></div>
        <button class="btn secondary" id="ad-under" type="button" aria-pressed="false"
                style="min-height:48px;padding:.4rem;font-size:.95rem;font-weight:800"></button>
        <div id="ad-parts" role="group" aria-label="Pasirink augalo dalį"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(5.2rem,1fr));gap:.4rem"></div>
        <p id="ad-count" style="margin:0;min-width:0;text-align:center;font-weight:800;font-size:.95rem;line-height:1.3"></p>
        <button class="btn ghost" id="ad-reset" type="button" style="min-height:48px;padding:.4rem;font-size:.95rem">Iš naujo</button>
      </div>`;

    const svg = stage.querySelector("#ad-svg");
    const compareBox = stage.querySelector("#ad-compare");
    const plantsBox = controls.querySelector("#ad-plants");
    const partsBox = controls.querySelector("#ad-parts");
    const soilBtn = controls.querySelector("#ad-under");
    const countEl = controls.querySelector("#ad-count");
    const resetBtn = controls.querySelector("#ad-reset");

    plantsBox.innerHTML = plants.map((p, i) => `<button class="btn secondary" type="button"
      data-plant="${i}" aria-pressed="false"
      style="min-height:48px;padding:.4rem .3rem;font-size:.95rem;font-weight:800">${adEsc(p.label)}</button>`).join("");

    const current = () => plants[plantIdx] || { id: "", label: "", parts: [] };
    const findPart = (id) => (current().parts || []).find((x) => x.id === id) || null;

    function scene() {
      const p = current();
      const tops = AD_TOPS[p.id] || {};
      const has = (id) => (p.parts || []).some((x) => x.id === id);
      const dim = (id) => (part && part !== id && has(id) ? 0.3 : 1);
      const above = Object.entries(tops)
        .map(([id, html]) => `<g opacity="${dim(id)}">${html}</g>`)
        .join("");
      return `${art.defs("ad")}
        <rect x="0" y="0" width="360" height="340" rx="18" fill="url(#ad-sky)"/>
        ${art.sun(320, 38, 12, "ad", 1)}
        ${art.cloud(66, 50, 1, 0.9)}
        ${art.hills(360, 236)}
        <g opacity="${dim("saknis")}">${AD_ROOTS[p.id] || ""}</g>
        <g opacity="${underground ? 0.3 : 1}">${art.soil(0, 250, 360, 90, "ad")}</g>
        ${underground
    ? `<line x1="0" y1="250" x2="360" y2="250" stroke="#5a3d16" stroke-width="2"
             stroke-dasharray="7 5" opacity=".9"/>`
    : ""}
        ${art.grass(46, 256, 1.1)}${art.grass(308, 256, 1)}${art.grass(120, 254, 0.9)}
        ${above}`;
    }

    function renderParts() {
      const p = current();
      if (partsBox.dataset.plantId !== p.id) {
        partsBox.dataset.plantId = p.id;
        partsBox.innerHTML = (p.parts || []).map((x) => `<button class="btn secondary" type="button"
          data-part="${adEsc(x.id)}" aria-pressed="false"
          style="min-height:48px;padding:.4rem .3rem;font-size:.95rem;font-weight:800">${adEsc(x.label)}</button>`).join("");
      }
      for (const b of partsBox.querySelectorAll("[data-part]")) {
        const on = b.dataset.part === part;
        b.setAttribute("aria-pressed", String(on));
        b.style.background = on ? "var(--ink)" : "var(--paper-2)";
        b.style.color = on ? "var(--paper)" : "var(--ink)";
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
      }
    }

    /* Keturių šaknų palyginimas atsiranda tik tada, kai vaikas jas pamatė
       visas. Tai modelio kulminacija: 6–7 metų vaikas negali atmintyje
       lyginti keturių formų, todėl jos parodomos vienoje vietoje po tuo
       pačiu vardu. Palyginimas rodomas tik pasirinkus šaknį — kitaip jis
       liktų dekoracija, nesusijusi su tuo, ką vaikas daro. */
    function renderCompare() {
      /* Palyginimas rodomas tik tada, kai žemė atverta: kitaip didelis
         paveikslas rodytų šaknis, o scena virš jo — „žemė uždengta“, ir
         du to paties modelio vaizdai prieštarautų vienas kitam (LL-34). */
      const show = part === "saknis" && underground && rootsSeen.size >= plants.length;
      compareBox.hidden = !show;
      if (!show) {
        compareBox.innerHTML = "";
        return;
      }
      compareBox.innerHTML = `
        <p style="margin:0 0 .35rem;font-size:.9rem;font-weight:800;text-align:center">Keturios šaknys — visos po žeme</p>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem">
          ${plants.map((p) => `<figure style="margin:0;min-width:0;text-align:center">
            <svg viewBox="0 0 90 80" role="img" aria-label="${adEsc(p.label)}: šaknis po žeme"
                 style="width:100%;height:auto;border:2px solid var(--line);border-radius:.6rem;background:var(--paper-2)">
              <line x1="4" y1="22" x2="86" y2="22" stroke="#8b5e3c" stroke-width="1.5" stroke-dasharray="4 3"/>
              <g transform="translate(${(45 - 180 * 0.6).toFixed(1)} ${(22 - 250 * 0.6).toFixed(1)}) scale(0.6)">${AD_ROOTS[p.id] || ""}</g>
            </svg>
            <figcaption style="font-size:.9rem;font-weight:800;margin-top:.15rem">${adEsc(p.label)}</figcaption>
          </figure>`).join("")}
        </div>`;
    }

    function render() {
      const p = current();
      const sel = findPart(part);

      for (const b of plantsBox.querySelectorAll("[data-plant]")) {
        const on = Number(b.dataset.plant) === plantIdx;
        b.setAttribute("aria-pressed", String(on));
        b.style.background = on ? "var(--ink)" : "var(--paper-2)";
        b.style.color = on ? "var(--paper)" : "var(--ink)";
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
      }

      soilBtn.textContent = underground ? (ui.undergroundOff || "Uždengti žemę")
        : (ui.undergroundOn || "Pažiūrėti po žeme");
      soilBtn.setAttribute("aria-pressed", String(underground));

      renderParts();
      renderCompare();
      svg.innerHTML = scene();
      svg.setAttribute("aria-label", sel
        ? `${p.label}: ${sel.label}. ${sel.look}`
        : `${p.label}. ${underground ? "Žemė permatoma." : "Žemė uždengta."}`);

      countEl.textContent = rootsSeen.size
        ? `Šaknį matei ${rootsSeen.size} iš ${plants.length} augalų.`
        : `Šaknį rask visuose ${plants.length} augaluose.`;

      let note;
      if (!sel) note = S.pick || "Paspausk dalies pavadinimą.";
      else if (sel.id === "saknis" && !underground) note = S.hidden || "";
      else if (sel.id === "saknis" && rootsSeen.size >= plants.length) note = S.done || "";
      else if (sel.id === "saknis") note = S.root || "";
      else note = sel.look;

      api.readout(sel ? `${p.label}: ${sel.label}.` : `${p.label}.`);
      api.note(note);

      if (!reported && plants.length && rootsSeen.size >= plants.length) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function choosePart(id) {
      const sel = findPart(id);
      if (!sel) return;
      part = part === id ? "" : id;   // antras paspaudimas nuima žymę
      if (part === "saknis") {
        underground = true;           // šaknis visada po žeme — žemė atsiveria pati
        rootsSeen.add(current().id);
      }
      api.speak(sel.label);
      render();
    }

    plantsBox.addEventListener("click", (e) => {
      const b = e.target.closest("[data-plant]");
      if (!b) return;
      plantIdx = Number(b.dataset.plant);
      if (!findPart(part)) part = "";
      /* Pakeitus augalą, pasirinkta šaknis lieka pasirinkta — ir vaikas
         ją mato. Todėl ji įskaitoma ir čia, o ne tik paspaudus mygtuką:
         kitaip skaitliukas liktų 1 iš 4, nors ekrane jau ketvirta šaknis
         (LL-17 — būsena turi atitikti tai, ką vaikas mato). */
      if (part === "saknis") {
        underground = true;
        rootsSeen.add(current().id);
      }
      api.speak(current().label);
      render();
    });

    partsBox.addEventListener("click", (e) => {
      const b = e.target.closest("[data-part]");
      if (b) choosePart(b.dataset.part);
    });

    soilBtn.addEventListener("click", () => {
      underground = !underground;
      api.speak(underground ? (S.opened || "Žemė permatoma. Matai, kas po žeme.")
        : (S.closed || "Žemė vėl uždengia šaknis."));
      render();
    });

    resetBtn.addEventListener("click", () => {
      plantIdx = 0;
      part = "";
      underground = false;
      reported = false;
      rootsSeen.clear();
      api.speak(S.again || "Pradedam iš naujo.");
      render();
      resetBtn.focus();
    });

    render();
    return null;
  },
};

export const SIMS = {
  "gyvybes-zenklai": gyvybesZenklai,
  "energijos-saltiniai": energijosSaltiniai,
  "dienos-juosta": dienosJuosta,
  "metu-laikai": metuLaikai,
  "augalo-gyvenimas": augaloGyvenimas,
  "gyvunu-grupes": gyvunuGrupes,
  "vandens-busenos": vandensBusenos,
  "nuozulnioji-plokstuma": nuozulniojiPlokstuma,
  "kuprine-ir-svoris": kuprineIrSvoris,
  "dumai-ir-isejimas": dumaiIrIsejimas,
  "kas-gyvas": kasGyvas,
  "daikto-grandine": daiktoGrandine,
  "augalu-grupes": augaluGrupes,
  "ismesto-daikto-kelias": ismestoDaiktoKelias,
  "ledo-formos": ledoFormos,
  "traumos-priezastis": traumosPriezastis,
  "traumos-apsauga": traumosApsauga,
  "bendruomenes": bendruomenes,
  "zmoniu-ivairove": zmoniuIvairove,
  "gimines-grandine": giminesGrandine,
  "stebejimo-zurnalas": stebejimoZurnalas,
  "kas-lieka-pievoje": kasLiekaPievoje,
  "augalo-dalys": augaloDalys,
};
