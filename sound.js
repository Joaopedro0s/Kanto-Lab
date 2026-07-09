/* ==========================================================================
   sound.js
   Efeitos sonoros gerados na hora com a Web Audio API. Não usamos arquivos
   de áudio prontos (evita problemas de direitos autorais e mantém o
   projeto leve). O AudioContext só é criado após uma interação do
   jogador, como exigem os navegadores modernos.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "pokegames.soundEnabled";
  let ctx = null;
  let enabled = readEnabled();

  function readEnabled() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === null ? true : v === "1";
    } catch (e) {
      return true;
    }
  }

  function saveEnabled(v) {
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch (e) { /* ignore */ }
  }

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone({ freq = 440, duration = 0.15, type = "sine", startAt = 0, gain = 0.18, glideTo = null }) {
    const audio = ensureContext();
    if (!audio || !enabled) return;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audio.currentTime + startAt);
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(glideTo, audio.currentTime + startAt + duration);
    }
    g.gain.setValueAtTime(0.0001, audio.currentTime + startAt);
    g.gain.exponentialRampToValueAtTime(gain, audio.currentTime + startAt + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + startAt + duration);
    osc.connect(g).connect(audio.destination);
    osc.start(audio.currentTime + startAt);
    osc.stop(audio.currentTime + startAt + duration + 0.02);
  }

  const Sound = {
    isEnabled: () => enabled,
    setEnabled(v) {
      enabled = v;
      saveEnabled(v);
    },
    toggle() {
      Sound.setEnabled(!enabled);
      return enabled;
    },
    click() {
      tone({ freq: 520, duration: 0.06, type: "square", gain: 0.08 });
    },
    correct() {
      tone({ freq: 523.25, duration: 0.11, type: "triangle" });
      tone({ freq: 659.25, duration: 0.11, startAt: 0.09, type: "triangle" });
      tone({ freq: 783.99, duration: 0.16, startAt: 0.18, type: "triangle" });
    },
    close() {
      tone({ freq: 440, duration: 0.12, type: "triangle" });
      tone({ freq: 493.88, duration: 0.14, startAt: 0.1, type: "triangle" });
    },
    wrong() {
      tone({ freq: 220, duration: 0.22, type: "sawtooth", gain: 0.14, glideTo: 140 });
    },
    win() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone({ freq: f, duration: 0.2, startAt: i * 0.12, type: "triangle" })
      );
    },
    lose() {
      [392, 349.23, 293.66, 246.94].forEach((f, i) =>
        tone({ freq: f, duration: 0.28, startAt: i * 0.15, type: "sawtooth", gain: 0.12 })
      );
    },
    select() {
      tone({ freq: 660, duration: 0.07, type: "square", gain: 0.1 });
    },
    lockIn() {
      tone({ freq: 300, duration: 0.09, type: "triangle" });
      tone({ freq: 600, duration: 0.14, startAt: 0.08, type: "triangle" });
    },
  };

  window.PokeSound = Sound;
})();
