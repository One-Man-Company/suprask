/**
 * Bendra iliustracijų kalba simuliacijoms.
 *
 * Kodėl atskiras modulis: anksčiau kiekviena scena piešė savo stačiakampius,
 * todėl tos pačios „saulės“ ir „žemės“ atrodė skirtingai, o vaikams jos buvo
 * plokščios ir neaiškios (žr. pamoka LL-13). Dabar forma, spalva ir šešėlis
 * aprašyti vienoje vietoje, o scenos tik surenka jas į kompoziciją.
 *
 * Taisyklės:
 *  - jokių išorinių resursų (jokių nuorodų į paveikslėlius, šriftus, CDN);
 *  - viskas → grynas SVG tekstas, kad veiktų be tinklo ir be build'o;
 *  - spalvos iš kintamųjų ten, kur jos keičiasi pagal būseną.
 */

/**
 * Erdvinių kūnų spalvos. Visi kūnai piešiami ta pačia palete: vaikas kūną
 * atpažįsta iš formos, o ne iš spalvos (LL-13, prieinamumo taisyklė).
 */
const SOLID = {
  front: "#f6c86e",
  side: "#dfa74a",
  top: "#ffe2a8",
  edge: "#6d4a1c",
  under: "#5a3d16",
};

const P = {
  skyTop: "#bfe3f7",
  skyBottom: "#eaf6fd",
  skyWinter: "#cfe4f2",
  skyAutumn: "#f6e0c3",
  sun: "#ffc542",
  sunGlow: "#ffd976",
  cloud: "#ffffff",
  hill: "#a8cf8c",
  hillDark: "#8fbb72",
  soil: "#8b5e3c",
  soilDark: "#6f4630",
  soilLight: "#a3714c",
  pot: "#cd7f4f",
  potDark: "#b0663a",
  potLight: "#e0a077",
  stem: "#3f8f3a",
  leaf: "#59b95a",
  flower: "#f2708a",
  flowerCore: "#ffc94d",
  water: "#7cc6ec",
  waterDark: "#4d9fd1",
  wood: "#b07b4a",
  woodDark: "#8a5c33",
  snow: "#ffffff",
};

export const art = {
  /** Gradientai ir šešėliai. `id` turi būti unikalus puslapyje. */
  defs(id) {
    return `<defs>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.skyTop}"/><stop offset="1" stop-color="${P.skyBottom}"/>
      </linearGradient>
      <linearGradient id="${id}-winter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.skyWinter}"/><stop offset="1" stop-color="#eef7fd"/>
      </linearGradient>
      <linearGradient id="${id}-autumn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.skyAutumn}"/><stop offset="1" stop-color="#fdf3e4"/>
      </linearGradient>
      <radialGradient id="${id}-glow">
        <stop offset="0" stop-color="${P.sunGlow}" stop-opacity=".85"/>
        <stop offset="1" stop-color="${P.sunGlow}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}-soil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.soilLight}"/><stop offset="1" stop-color="${P.soilDark}"/>
      </linearGradient>
      <linearGradient id="${id}-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.water}"/><stop offset="1" stop-color="${P.waterDark}"/>
      </linearGradient>
      <linearGradient id="${id}-pot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${P.potLight}"/><stop offset=".55" stop-color="${P.pot}"/>
        <stop offset="1" stop-color="${P.potDark}"/>
      </linearGradient>
      <radialGradient id="${id}-ball" cx="34%" cy="28%" r="78%">
        <stop offset="0" stop-color="${SOLID.top}"/>
        <stop offset=".62" stop-color="${SOLID.front}"/>
        <stop offset="1" stop-color="${SOLID.side}"/>
      </radialGradient>
    </defs>`;
  },

  /** Saulė su švytėjimu. intensity 0..1 — blankumas ir spindulių ilgis. */
  sun(x, y, r, id, intensity = 1) {
    const k = Math.max(0, Math.min(1, intensity));
    const rays = Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 * Math.PI) / 180;
      const r1 = r + 6;
      const r2 = r + 8 + 10 * k;
      return `<line x1="${(x + Math.cos(a) * r1).toFixed(1)}" y1="${(y + Math.sin(a) * r1).toFixed(1)}"`
        + ` x2="${(x + Math.cos(a) * r2).toFixed(1)}" y2="${(y + Math.sin(a) * r2).toFixed(1)}"/>`;
    }).join("");
    return `<g opacity="${(0.35 + 0.65 * k).toFixed(2)}">
      <circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="url(#${id}-glow)"/>
      <g stroke="${P.sun}" stroke-width="3.5" stroke-linecap="round">${rays}</g>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${P.sun}"/>
      <circle cx="${x - r * 0.28}" cy="${y - r * 0.28}" r="${r * 0.32}" fill="#fff" opacity=".45"/>
    </g>`;
  },

  cloud(x, y, s = 1, op = 0.92) {
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="${P.cloud}" opacity="${op}">
      <ellipse cx="0" cy="0" rx="26" ry="13"/>
      <ellipse cx="-16" cy="4" rx="16" ry="9"/>
      <ellipse cx="17" cy="5" rx="18" ry="10"/>
      <ellipse cx="3" cy="-9" rx="15" ry="10"/>
    </g>`;
  },

  /** Kalvos horizontas — gilesnis fonas nei plokščia linija. */
  hills(w, y, top = P.hill, bottom = P.hillDark) {
    return `<path d="M0 ${y} Q ${w * 0.18} ${y - 26} ${w * 0.4} ${y - 6}`
      + ` Q ${w * 0.62} ${y + 12} ${w * 0.78} ${y - 10}`
      + ` Q ${w * 0.92} ${y - 24} ${w} ${y - 4} V ${y + 40} H 0 Z"
      fill="${top}"/>
      <path d="M0 ${y + 8} Q ${w * 0.3} ${y - 6} ${w * 0.55} ${y + 6}`
      + ` Q ${w * 0.8} ${y + 16} ${w} ${y + 2} V ${y + 46} H 0 Z"
      fill="${bottom}" opacity=".55"/>`;
  },

  /** Dirvožemis su grūdeliais — ne plokščias stačiakampis. */
  soil(x, y, w, h, id, count = 14) {
    const grains = Array.from({ length: count }, (_, i) => {
      const gx = x + 8 + ((i * 37 + 13) % Math.max(1, w - 16));
      const gy = y + 8 + ((i * 23 + 7) % Math.max(1, h - 12));
      const r = 1.2 + ((i * 7) % 3) * 0.5;
      return `<circle cx="${gx}" cy="${gy}" r="${r}" fill="${P.soilDark}" opacity=".35"/>`;
    }).join("");
    return `<g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#${id}-soil)"/>
      <rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="${P.soilDark}" opacity=".45"/>
      ${grains}
    </g>`;
  },

  /** Vazonas su lūpomis ir šešėliu. */
  pot(x, y, w, h,) {
    const topW = w;
    const botW = w * 0.74;
    return `<g>
      <ellipse cx="${x + w / 2}" cy="${y + h + 3}" rx="${w * 0.52}" ry="6" fill="${P.soilDark}" opacity=".22"/>
      <path d="M${x} ${y} H ${x + topW} L ${x + topW - (topW - botW) / 2} ${y + h}`
      + ` H ${x + (topW - botW) / 2} Z" fill="url(#pot)"/>
      <rect x="${x - 4}" y="${y - 7}" width="${w + 8}" height="11" rx="4" fill="${P.potDark}"/>
      <rect x="${x + 5}" y="${y + 6}" width="7" height="${h - 14}" rx="3" fill="#fff" opacity=".18"/>
    </g>`;
  },

  /** Sėkla su blizgesiu. */
  seed(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="0" rx="11" ry="8" fill="#7a4b2a"/>
      <ellipse cx="-3" cy="-2.5" rx="4" ry="2.6" fill="#b98a5e" opacity=".8"/>
      <path d="M-6 1 q6 4 12 0" stroke="#5d3720" stroke-width="1.4" fill="none" opacity=".55"/>
    </g>`;
  },

  /** Lapas — dviguba kreivė, ne elipsė. dir: -1 kairėn, 1 dešinėn. */
  leaf(x, y, s, dir, droop, color) {
    const d = `<path d="M0 0 C ${dir * s * 0.9} ${-s * 0.75} ${dir * s * 1.7} ${-s * 0.35} ${dir * s * 2.05} 0`
      + ` C ${dir * s * 1.6} ${s * 0.55} ${dir * s * 0.75} ${s * 0.5} 0 0 Z"
      fill="${color}"/>
      <path d="M${dir * 2} 0 L ${dir * s * 1.8} 0" stroke="#000" stroke-opacity=".12" stroke-width="1.2"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${droop ? dir * 26 : dir * 8})">${d}</g>`;
  },

  /** Stiebas su švelniu linkiu. */
  stem(x, baseY, h, width, color, droop) {
    const bend = droop ? 10 : 3;
    return `<path d="M${x} ${baseY} C ${x + bend} ${baseY - h * 0.4} ${x + bend * 0.6} ${baseY - h * 0.75} ${x + (droop ? 14 : 0)} ${baseY - h}"`
      + ` stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none"/>`;
  },

  flower(x, y, s = 1) {
    const petals = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 * Math.PI) / 180;
      return `<ellipse cx="${(Math.cos(a) * 8 * s).toFixed(1)}" cy="${(Math.sin(a) * 8 * s).toFixed(1)}"`
        + ` rx="${(5.5 * s).toFixed(1)}" ry="${(3.6 * s).toFixed(1)}" transform="rotate(${i * 60})"`
        + ` fill="${P.flower}"/>`;
    }).join("");
    return `<g transform="translate(${x} ${y})">${petals}
      <circle r="${4.6 * s}" fill="${P.flowerCore}"/>
      <circle r="${2.2 * s}" fill="#f6a623"/></g>`;
  },

  /**
   * Medis. season: ziema | pavasaris | vasara | ruduo | ruduo-krenta
   */
  tree(x, baseY, s, season) {
    const trunk = `<path d="M${x - 8 * s} ${baseY} q ${2 * s} ${-28 * s} ${3.5 * s} ${-48 * s} h ${7 * s}`
      + ` q ${3 * s} ${22 * s} ${4.5 * s} ${48 * s} z" fill="${P.woodDark}"/>
      <path d="M${x - 2 * s} ${baseY} q ${0} ${-26 * s} ${1 * s} ${-44 * s} h ${3 * s} q ${1 * s} ${18 * s} ${1 * s} ${44 * s} z" fill="${P.wood}" opacity=".55"/>`;
    /* Šakos su antrinėmis šakelėmis: be jų žiemą medis atrodė kaip kuolas. */
    const branches = `<g stroke="${P.woodDark}" fill="none" stroke-linecap="round">
        <path d="M${x} ${baseY - 40 * s} L ${x - 18 * s} ${baseY - 58 * s}" stroke-width="${3.6 * s}"/>
        <path d="M${x} ${baseY - 34 * s} L ${x + 17 * s} ${baseY - 55 * s}" stroke-width="${3.6 * s}"/>
        <path d="M${x} ${baseY - 48 * s} L ${x - 2 * s} ${baseY - 68 * s}" stroke-width="${3.2 * s}"/>
        <path d="M${x - 18 * s} ${baseY - 58 * s} l ${-9 * s} ${-4 * s} M${x - 18 * s} ${baseY - 58 * s} l ${-6 * s} ${-11 * s}"
              stroke-width="${2 * s}"/>
        <path d="M${x + 17 * s} ${baseY - 55 * s} l ${9 * s} ${-5 * s} M${x + 17 * s} ${baseY - 55 * s} l ${6 * s} ${-11 * s}"
              stroke-width="${2 * s}"/>
        <path d="M${x - 2 * s} ${baseY - 68 * s} l ${-7 * s} ${-6 * s} M${x - 2 * s} ${baseY - 68 * s} l ${7 * s} ${-6 * s}"
              stroke-width="${1.8 * s}"/>
      </g>`;
    const blob = (cx, cy, r, col, op = 1) => `<circle cx="${x + cx * s}" cy="${baseY + cy * s}" r="${r * s}" fill="${col}" opacity="${op}"/>`;

    if (season === "ziema") {
      return `${trunk}${branches}
        ${blob(-4, -74, 5.5, "#eaf6fd", 0.9)}${blob(6, -78, 4.5, "#eaf6fd", 0.8)}
        ${blob(-12, -62, 4, "#eaf6fd", 0.75)}`;
    }
    if (season === "pavasaris") {
      return `${trunk}${branches}
        ${blob(-14, -60, 6, "#a8dc8b")}${blob(12, -62, 6.5, "#a8dc8b")}${blob(-2, -72, 7, "#bce6a1")}
        ${blob(-20, -50, 4.5, "#8ed081")}${blob(18, -48, 4.5, "#8ed081")}
        <g fill="#f7b6c8">${blob(-8, -66, 2.4, "#f7b6c8")}${blob(8, -70, 2.2, "#f7b6c8")}</g>`;
    }
    if (season === "vasara") {
      return `${trunk}${branches}
        ${blob(-16, -58, 15, "#4f9e4a")}${blob(16, -60, 16, "#5aa954")}
        ${blob(0, -76, 18, "#63b45b")}${blob(-24, -44, 10, "#448a40")}${blob(24, -46, 10, "#448a40")}
        ${blob(-6, -70, 7, "#78c46c", 0.85)}`;
    }
    if (season === "ruduo") {
      return `${trunk}${branches}
        ${blob(-16, -58, 15, "#e08a2e")}${blob(16, -60, 16, "#d9791f")}
        ${blob(0, -76, 18, "#e9a13a")}${blob(-24, -44, 10, "#c96a1c")}${blob(24, -46, 10, "#c96a1c")}
        ${blob(-6, -70, 7, "#f3b552", 0.9)}`;
    }
    // ruduo-krenta: lapai jau krenta
    return `${trunk}${branches}
      ${blob(-16, -58, 12, "#e08a2e")}${blob(16, -60, 13, "#d9791f")}${blob(0, -74, 13, "#e9a13a")}
      <g fill="#d9791f" opacity=".9">
        <ellipse cx="${x - 26}" cy="${baseY - 26}" rx="4" ry="2.6" transform="rotate(24 ${x - 26} ${baseY - 26})"/>
        <ellipse cx="${x + 30}" cy="${baseY - 14}" rx="4" ry="2.6" transform="rotate(-18 ${x + 30} ${baseY - 14})"/>
        <ellipse cx="${x - 12}" cy="${baseY - 4}" rx="4" ry="2.6" transform="rotate(40 ${x - 12} ${baseY - 4})"/>
      </g>`;
  },

  /** Žolės kuokštai. */
  grass(x, y, s = 1, color = "#5aa552") {
    return `<g stroke="${color}" stroke-width="${2 * s}" stroke-linecap="round" fill="none">
      <path d="M${x} ${y} q ${-2 * s} ${-6 * s} ${-4 * s} ${-9 * s}"/>
      <path d="M${x + 3 * s} ${y} q ${0} ${-7 * s} ${1 * s} ${-10 * s}"/>
      <path d="M${x + 6 * s} ${y} q ${2 * s} ${-6 * s} ${4 * s} ${-8 * s}"/>
    </g>`;
  },

  /** Upė su bangomis ir atspindžiu. */
  river(x, y, w, h, id) {
    const waves = [0, 1, 2].map((i) => {
      const wy = y + 16 + i * (h / 3.2);
      return `<path d="M${x} ${wy} q ${w / 8} -5 ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0"`
        + ` stroke="#ffffff" stroke-opacity=".38" stroke-width="2.4" fill="none"/>`;
    }).join("");
    return `<g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${id}-water)"/>
      ${waves}
    </g>`;
  },

  /** Medinis tiltas su lentomis ir turėklais. */
  bridge(x, y, w) {
    const planks = Array.from({ length: Math.max(6, Math.round(w / 18)) }, (_, i) => {
      const px = x + (i * w) / Math.max(6, Math.round(w / 18));
      return `<line x1="${px}" y1="${y}" x2="${px}" y2="${y + 9}" stroke="${P.woodDark}" stroke-width="1.2" opacity=".55"/>`;
    }).join("");
    return `<g>
      <rect x="${x}" y="${y - 20}" width="${w}" height="3.5" rx="1.75" fill="${P.woodDark}"/>
      ${[0.06, 0.5, 0.94].map((t) => `<line x1="${x + w * t}" y1="${y - 20}" x2="${x + w * t}" y2="${y + 9}" stroke="${P.woodDark}" stroke-width="3"/>`).join("")}
      <rect x="${x}" y="${y}" width="${w}" height="9" rx="3" fill="${P.wood}"/>
      ${planks}
      <rect x="${x}" y="${y + 9}" width="${w}" height="3" rx="1.5" fill="${P.woodDark}" opacity=".7"/>
    </g>`;
  },

  /** Kvadratinis blokas su apvadu ir etikete. */
  block(x, y, s, color, label, dark) {
    return `<g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="${s}" height="${s}" rx="${s * 0.22}" fill="${color}"/>
      <rect x="2" y="2" width="${s - 4}" height="${s - 4}" rx="${s * 0.2}" fill="none"
            stroke="${dark || "#000"}" stroke-opacity=".18" stroke-width="2"/>
      ${label ? `<text x="${s / 2}" y="${s * 0.62}" text-anchor="middle" font-family="system-ui, sans-serif"`
        + ` font-size="${s * 0.42}" font-weight="800" fill="#3a342b">${label}</text>` : ""}
    </g>`;
  },

  /** Paprastas vaiko figūrėlė — kad būtų aišku, kas kur stovi. */
  kid(x, baseY, s = 1, body = "#ff8a3d", skin = "#f2c9a0") {
    return `<g transform="translate(${x} ${baseY}) scale(${s})">
      <rect x="-7" y="-26" width="14" height="18" rx="6" fill="${body}"/>
      <circle cx="0" cy="-33" r="8" fill="${skin}"/>
      <path d="M-7 -40 a8 8 0 0 1 14 0 z" fill="#5b4636"/>
      <rect x="-6" y="-9" width="5" height="9" rx="2.5" fill="#3f4a52"/>
      <rect x="1" y="-9" width="5" height="9" rx="2.5" fill="#3f4a52"/>
    </g>`;
  },

  snow(x, y, n = 10) {
    const flakes = Array.from({ length: n }, (_, i) => {
      const fx = 20 + ((i * 71) % 320);
      const fy = y + ((i * 53) % 80);
      return `<circle cx="${fx}" cy="${fy}" r="${1.8 + (i % 3) * 0.7}" fill="${P.snow}" opacity=".9"/>`;
    }).join("");
    return `<g>${flakes}</g>`;
  },

  birds(x, y) {
    return `<g stroke="#5c6b73" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7">
      <path d="M${x} ${y} q 6 -6 12 0"/><path d="M${x + 26} ${y - 12} q 5 -5 10 0"/>
      <path d="M${x + 52} ${y + 6} q 4 -4 8 0"/></g>`;
  },

  /** Vandens lašai — kai laistoma. */
  drops(x, y, n = 4, color = "#5fb3e0") {
    const d = Array.from({ length: n }, (_, i) => {
      const dx = x + i * 9;
      const dy = y + ((i * 13) % 18);
      return `<path d="M${dx} ${dy} q 3 5 0 7 q -3 -2 0 -7 z" fill="${color}" opacity=".8"/>`;
    }).join("");
    return `<g>${d}</g>`;
  },

  /* ------------------------------------------------------------------ */
  /* Erdviniai kūnai (1 klasės geometrija)                              */
  /*                                                                    */
  /* Visi piešiami tame pačiame 200×200 tinkle, ta pačia palete, su      */
  /* šešėliu ant „stalo“. Todėl kūnas atpažįstamas iš formos, o ne iš    */
  /* spalvos, ir to paties kūno piešinys visose scenose sutampa.         */
  /* ------------------------------------------------------------------ */

  /** Stačiakampis gretasienis; kubas — kai w = h ir gylis toks pat. */
  solidBox(x, y, w, h, depth = 30) {
    const dx = depth * 0.62;
    const dy = depth * 0.8;
    const top = `${x},${y} ${(x + dx).toFixed(1)},${(y - dy).toFixed(1)} `
      + `${(x + w + dx).toFixed(1)},${(y - dy).toFixed(1)} ${x + w},${y}`;
    const side = `${x + w},${y} ${(x + w + dx).toFixed(1)},${(y - dy).toFixed(1)} `
      + `${(x + w + dx).toFixed(1)},${(y + h - dy).toFixed(1)} ${x + w},${y + h}`;
    return `<g>
      <ellipse cx="${(x + (w + dx) / 2).toFixed(1)}" cy="${y + h + 7}" rx="${((w + dx) / 2).toFixed(1)}" ry="8"
               fill="${SOLID.under}" opacity=".16"/>
      <polygon points="${top}" fill="${SOLID.top}" stroke="${SOLID.edge}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="${side}" fill="${SOLID.side}" stroke="${SOLID.edge}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${SOLID.front}"
            stroke="${SOLID.edge}" stroke-width="3" stroke-linejoin="round"/>
      <line x1="${x + 7}" y1="${y + 8}" x2="${x + 7}" y2="${y + h - 8}" stroke="#fff" stroke-opacity=".35"
            stroke-width="5" stroke-linecap="round"/>
    </g>`;
  },

  /** Ritinys, stovintis ant pagrindo. */
  solidCylinder(cx, baseY, r, h) {
    const cy = baseY - h;
    const ry = r * 0.3;
    return `<g>
      <ellipse cx="${cx}" cy="${baseY + 7}" rx="${(r * 1.04).toFixed(1)}" ry="${(ry * 0.9).toFixed(1)}"
               fill="${SOLID.under}" opacity=".16"/>
      <ellipse cx="${cx}" cy="${baseY}" rx="${r}" ry="${ry.toFixed(1)}"
               fill="${SOLID.side}" stroke="${SOLID.edge}" stroke-width="3"/>
      <path d="M${cx - r} ${cy} L${cx - r} ${baseY}
               A ${r} ${ry.toFixed(1)} 0 0 0 ${cx + r} ${baseY}
               L${cx + r} ${cy} Z"
            fill="${SOLID.front}" stroke="${SOLID.edge}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry.toFixed(1)}"
               fill="${SOLID.top}" stroke="${SOLID.edge}" stroke-width="3"/>
      <line x1="${(cx - r * 0.55).toFixed(1)}" y1="${cy + ry + 4}" x2="${(cx - r * 0.55).toFixed(1)}" y2="${baseY - 6}"
            stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>
    </g>`;
  },

  /** Kūgis, stovintis ant pagrindo. Viršūnė — smaili, pagrindas — apvalus. */
  solidCone(cx, baseY, r, h) {
    const apex = baseY - h;
    const ry = r * 0.3;
    return `<g>
      <ellipse cx="${cx}" cy="${baseY + 7}" rx="${(r * 1.04).toFixed(1)}" ry="${(ry * 0.9).toFixed(1)}"
               fill="${SOLID.under}" opacity=".16"/>
      <path d="M${cx} ${apex} L${cx - r} ${baseY}
               A ${r} ${ry.toFixed(1)} 0 0 0 ${cx + r} ${baseY} Z"
            fill="${SOLID.front}" stroke="${SOLID.edge}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M${cx} ${apex} L${cx + r * 0.34} ${baseY}
               A ${r} ${ry.toFixed(1)} 0 0 0 ${cx + r} ${baseY} Z"
            fill="${SOLID.side}" opacity=".85"/>
      <line x1="${(cx - r * 0.36).toFixed(1)}" y1="${apex + h * 0.34}" x2="${(cx - r * 0.08).toFixed(1)}" y2="${apex + h * 0.72}"
            stroke="#fff" stroke-opacity=".38" stroke-width="5" stroke-linecap="round"/>
    </g>`;
  },

  /** Rutulys. `id` — tas pats, kuriuo iškviestas `art.defs(id)`; be jo — vientisa spalva. */
  solidSphere(cx, cy, r, id) {
    const fill = id ? `url(#${id}-ball)` : SOLID.front;
    return `<g>
      <ellipse cx="${cx}" cy="${(cy + r + 6).toFixed(1)}" rx="${(r * 0.82).toFixed(1)}" ry="8"
               fill="${SOLID.under}" opacity=".16"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"
              stroke="${SOLID.edge}" stroke-width="3"/>
      <ellipse cx="${(cx - r * 0.3).toFixed(1)}" cy="${(cy - r * 0.36).toFixed(1)}"
               rx="${(r * 0.26).toFixed(1)}" ry="${(r * 0.16).toFixed(1)}"
               fill="#fff" opacity=".6" transform="rotate(-24 ${cx - r * 0.3} ${cy - r * 0.36})"/>
    </g>`;
  },

  /**
   * Plokščias vaizdas — tai, ką matai žiūrėdamas iš vienos pusės.
   * kind: trikampis | apskritimas | kvadratas | staciakampis.
   */
  flatShape(kind, cx, cy, s, strokeWidth = 3) {
    const a = `fill="${SOLID.top}" stroke="${SOLID.edge}" stroke-width="${strokeWidth}" stroke-linejoin="round"`;
    if (kind === "apskritimas") {
      return `<circle cx="${cx}" cy="${cy}" r="${(s * 0.46).toFixed(1)}" ${a}/>`;
    }
    if (kind === "kvadratas") {
      const q = s * 0.82;
      return `<rect x="${(cx - q / 2).toFixed(1)}" y="${(cy - q / 2).toFixed(1)}" width="${q.toFixed(1)}"
              height="${q.toFixed(1)}" rx="4" ${a}/>`;
    }
    if (kind === "staciakampis") {
      const w = s * 0.96;
      const h = s * 0.6;
      return `<rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w.toFixed(1)}"
              height="${h.toFixed(1)}" rx="4" ${a}/>`;
    }
    return `<polygon points="${cx},${(cy - s * 0.5).toFixed(1)} ${(cx + s * 0.56).toFixed(1)},${(cy + s * 0.42).toFixed(1)} `
      + `${(cx - s * 0.56).toFixed(1)},${(cy + s * 0.42).toFixed(1)}" ${a}/>`;
  },

  /** Rodyklė „žiūriu iš čia“ — kryptis rodo į kūną. */
  viewArrow(x1, y1, x2, y2) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const len = 14;
    const spread = 0.42;
    const p1 = `${(x2 - len * Math.cos(ang - spread)).toFixed(1)},${(y2 - len * Math.sin(ang - spread)).toFixed(1)}`;
    const p2 = `${(x2 - len * Math.cos(ang + spread)).toFixed(1)},${(y2 - len * Math.sin(ang + spread)).toFixed(1)}`;
    return `<g opacity=".65">
      <line x1="${x1}" y1="${y1}" x2="${(x2 - len * 0.6 * Math.cos(ang)).toFixed(1)}"
            y2="${(y2 - len * 0.6 * Math.sin(ang)).toFixed(1)}"
            stroke="${SOLID.edge}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="8 7"/>
      <polygon points="${x2},${y2} ${p1} ${p2}" fill="${SOLID.edge}"/>
    </g>`;
  },
};
