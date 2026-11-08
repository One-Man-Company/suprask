/**
 * Muzikos simuliacijos (1 klasė).
 *
 * Principas: garso aukštis ir garsumas rodomi kaip DU atskiri valdikliai su
 * dviem atskirais rodmenimis. Vaikas pats įsitikina, kad pakeitus vieną
 * savybę kita nepasikeičia — tai paneigia nuostatą „aukštas garsas = garsus
 * garsas“ (žr. agents/proposals/2026-11-08-ideator-garso-aukstis.json).
 *
 * Kodėl schema, o ne scena: čia nėra dangaus, žemės ar augalų, tad art.js
 * dalys netinka — rodomas matavimo prietaisas (aukščio kopėčios ir garsumo
 * juosta), o ne iliustracija (LL-13). Rodmenys yra tekstiniai, todėl modelis
 * veikia ir visiškai be garso.
 */

/* ---------- garsas ---------- */
const AC = window.AudioContext || window.webkitAudioContext;

function soundEnabled() {
  // Tas pats raktas, kurį naudoja speech.js. Nekuriame statinės priklausomybės
  // nuo speech.js, nes jis kraunamas neprivalomai (žr. app.js).
  try { return window.localStorage.getItem("suprask:sound") !== "off"; } catch { return true; }
}

/* ---------- simuliacija ---------- */
const garsoAukstis = {
  mount({ stage, controls, api, config }) {
    const PITCH = config.pitch || [];
    const VOL = config.volume || [];
    const BTNS = config.controls || [];
    const P_SHORT = PITCH.map((x) => x.short);
    const V_SHORT = VOL.map((x) => x.short);

    let pi = 1; // aukštis: 0 žemas … paskutinis aukštas
    let vi = 1; // garsumas: 0 tyliai … paskutinis garsiai
    let touchedPitch = false;
    let touchedVol = false;
    let listened = false;
    let reported = false;

    let ctx = null;
    const live = new Set();

    stage.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,10rem),1fr));gap:1rem;width:100%">
        <div id="ga-ladder" role="group" aria-label="Garso aukštis" style="display:grid;gap:.35rem;min-width:0"></div>
        <div style="display:grid;gap:.55rem;min-width:0">
          <p style="margin:0;font-family:var(--font-head);font-weight:900;font-size:1.05rem">Garsumas</p>
          <div id="ga-bar" style="position:relative;height:1.6rem;border:2px solid var(--ink-soft);border-radius:999px;background:var(--paper)">
            <div id="ga-fill" style="height:100%;border-radius:999px;background:var(--accent)"></div>
          </div>
          <div id="ga-bar-labels" style="display:grid;grid-template-columns:repeat(${VOL.length || 1},minmax(0,1fr));gap:.2rem;font-size:.82rem;font-weight:700;color:var(--ink-soft)"></div>
        </div>
      </div>`;

    const ladder = stage.querySelector("#ga-ladder");
    const fill = stage.querySelector("#ga-fill");
    const barLabels = stage.querySelector("#ga-bar-labels");

    PITCH.forEach((item, i) => {
      const row = document.createElement("div");
      row.dataset.p = String(i);
      row.style.cssText = "display:flex;align-items:center;gap:.45rem;min-height:2.7rem;padding:0 .7rem;border-radius:999px;border:2px solid transparent;font-weight:800;font-size:1rem";
      row.innerHTML = `<span aria-hidden="true" style="width:1.4rem;text-align:center;font-size:1.15rem">♪</span><span>${item.short}</span>`;
      ladder.appendChild(row);
    });

    VOL.forEach((item) => {
      const lab = document.createElement("span");
      lab.textContent = item.short;
      lab.style.textAlign = "center";
      barLabels.appendChild(lab);
    });

    function paint(readout = true) {
      ladder.querySelectorAll("[data-p]").forEach((row) => {
        const on = Number(row.dataset.p) === pi;
        row.style.background = on ? "var(--accent)" : "transparent";
        // Tamsus tekstas ant oranžinės: kontrastas 6,9:1 (balta duotų tik 2,35:1).
        row.style.color = on ? "var(--ink)" : "var(--ink-soft)";
        row.style.borderColor = on ? "var(--accent-press)" : "var(--line)";
        row.querySelector("span[aria-hidden]").style.opacity = on ? "1" : ".25";
        row.setAttribute("aria-current", on ? "true" : "false");
      });

      fill.style.width = `${((vi + 1) / VOL.length) * 100}%`;

      if (readout) api.readout(`Garsas ${P_SHORT[pi]}, skamba ${V_SHORT[vi]}.`);
    }

    function ensureCtx() {
      if (ctx) return ctx;
      if (!AC) return null;
      try { ctx = new AC(); } catch { ctx = null; }
      return ctx;
    }

    function tone() {
      const c = ensureCtx();
      if (!c) return false;
      if (c.state === "suspended" && typeof c.resume === "function") c.resume().catch(() => {});
      let osc = null;
      let gain = null;
      try {
        osc = c.createOscillator();
        gain = c.createGain();
        const t0 = c.currentTime;
        const peak = VOL[vi].gain;
        osc.type = "sine";
        osc.frequency.setValueAtTime(PITCH[pi].hz, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.05);
        gain.gain.setValueAtTime(peak, t0 + 0.95);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.15);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t0);
        osc.stop(t0 + 1.2);
      } catch {
        return false;
      }
      live.add(osc);
      osc.onended = () => {
        live.delete(osc);
        try { osc.disconnect(); gain.disconnect(); } catch { /* jau atjungta */ }
      };
      return true;
    }

    function checkProgress(allowNote) {
      if (reported || !touchedPitch || !touchedVol || !listened) return;
      reported = true;
      api.progress({ correct: true });
      if (allowNote) api.note("Keitei aukštį ir garsumą atskirai: tai dvi skirtingos savybės.");
    }

    function step(axis, dir) {
      if (axis === "pitch") {
        const next = Math.min(PITCH.length - 1, Math.max(0, pi + dir));
        if (next === pi) {
          api.note(dir > 0 ? "Tai aukščiausias aukštis. Žemyn — mygtuku „Žemyn“." : "Tai žemiausias aukštis. Aukštyn — mygtuku „Aukštyn“.");
          return;
        }
        pi = next;
        touchedPitch = true;
        paint();
        api.speak(PITCH[pi].label, { rate: 0.9 });
        api.note(`Aukštis — ${P_SHORT[pi]}. Garsumas liko ${V_SHORT[vi]}.`);
      } else {
        const next = Math.min(VOL.length - 1, Math.max(0, vi + dir));
        if (next === vi) {
          api.note(dir > 0 ? "Tai garsiausias garsumas. Tyliau — mygtuku „Tyliau“." : "Tai tyliausias garsumas. Garsiau — mygtuku „Garsiau“.");
          return;
        }
        vi = next;
        touchedVol = true;
        paint();
        api.speak(VOL[vi].label, { rate: 0.9 });
        api.note(`Garsumas — ${V_SHORT[vi]}. Aukštis liko ${P_SHORT[pi]}.`);
      }
      checkProgress(true);
    }

    function listen() {
      listened = true;
      if (!soundEnabled()) {
        api.note("Garsas išjungtas. Įjunk jį mygtuku viršuje ir spausk „Paklausyk“ dar kartą.");
        checkProgress(false);
        return;
      }
      if (!tone()) {
        api.note("Šiame įrenginyje garso groti nepavyko. Rodmenys vis tiek rodo aukštį ir garsumą.");
        checkProgress(false);
        return;
      }
      api.note(`Skamba 1 sekundę: ${P_SHORT[pi]} garsas, ${V_SHORT[vi]}.`);
      checkProgress(true);
    }

    controls.innerHTML = BTNS.map((b) => `
      <button class="${b.action === "play" ? "btn" : "btn secondary"}" data-act="${b.action}"
        aria-label="${b.aria}" style="min-width:4.6rem">
        <span aria-hidden="true">${b.glyph || ""}</span><span>${b.label}</span>
      </button>`).join("");

    controls.querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", () => {
        switch (b.dataset.act) {
          case "pitch-up": step("pitch", 1); break;
          case "pitch-down": step("pitch", -1); break;
          case "vol-up": step("vol", 1); break;
          case "vol-down": step("vol", -1); break;
          case "play": listen(); break;
          default: break;
        }
      });
    });

    paint();
    api.note("Pirma keisk aukštį. Paskui keisk garsumą ir žiūrėk, ar aukštis pakito.");

    return () => {
      live.forEach((osc) => { try { osc.stop(); } catch { /* jau sustabdytas */ } });
      live.clear();
      if (ctx && typeof ctx.close === "function") { try { ctx.close(); } catch { /* jau uždarytas */ } }
      ctx = null;
    };
  },
};

export const SIMS = {
  "garso-aukstis": garsoAukstis,
};
