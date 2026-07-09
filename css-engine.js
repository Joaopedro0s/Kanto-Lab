/* ==========================================================================
   css-engine.js
   O motor do CSS-in-JS vanilla. Duas responsabilidades:

   1) toCssVars(tokens) — pega o objeto de tema (theme-tokens.js) e devolve
      um bloco de CSS custom properties (:root { --bg: ...; }). Roda de novo
      toda vez que o tema muda — é o "ThemeProvider".

   2) GLOBAL_CSS — o resto do visual (cenário, layout, componentes,
      animações), escrito uma vez como string JS e injetado no <head>. Lê
      tudo via var(--...), então não precisa mudar quando o tema muda —
      só os valores das variáveis mudam.
   ========================================================================== */

(function () {
  "use strict";

  const STYLE_TAG_VARS_ID = "cssinjs-theme-vars";
  const STYLE_TAG_GLOBAL_ID = "cssinjs-global";

  function toCssVars(t) {
    return `
:root, [data-theme] {
  --bg: ${t.bg};
  --bg-elevated: ${t.bgElevated};
  --bg-inset: ${t.bgInset};
  --text: ${t.text};
  --text-muted: ${t.textMuted};
  --border: ${t.border};
  --border-strong: ${t.borderStrong};
  --accent: ${t.accent};
  --accent-contrast: ${t.accentContrast};
  --accent-2: ${t.accent2};

  --color-correct: ${t.colorCorrect};
  --color-correct-bg: ${t.colorCorrectBg};
  --color-close: ${t.colorClose};
  --color-close-bg: ${t.colorCloseBg};
  --color-wrong: ${t.colorWrong};
  --color-wrong-bg: ${t.colorWrongBg};
  --color-neutral: ${t.colorNeutral};
  --color-neutral-bg: ${t.colorNeutralBg};

  --group-1-bg: ${t.group1Bg}; --group-1-text: ${t.group1Text};
  --group-2-bg: ${t.group2Bg}; --group-2-text: ${t.group2Text};
  --group-3-bg: ${t.group3Bg}; --group-3-text: ${t.group3Text};
  --group-4-bg: ${t.group4Bg}; --group-4-text: ${t.group4Text};

  --shadow: ${t.shadow};
  --radius: ${t.radius};

  --card-bg: ${t.cardBg};
  --card-border: ${t.cardBorder};
  --card-border-width: ${t.cardBorderWidth};
  --card-radius: ${t.cardRadius};
  --card-shadow: ${t.cardShadow};

  --panel-bg: ${t.panelBg};
  --panel-border: ${t.panelBorder};
  --panel-border-width: ${t.panelBorderWidth};
  --panel-radius: ${t.panelRadius};
  --panel-text: ${t.panelText};
  --panel-text-muted: ${t.panelTextMuted};
  --panel-shadow: ${t.panelShadow};

  --pill-bg: ${t.pillBg};
  --pill-text: ${t.pillText};
  --pill-border: ${t.pillBorder};

  --font-display: ${t.fontDisplay};
  --font-body: ${t.fontBody};
}`;
  }

  const GLOBAL_CSS = `
/* ---------- reset / base ---------- */
*, *::before, *::after { box-sizing: border-box; }
html { color-scheme: light dark; }

body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
  transition: background-color .3s ease, color .3s ease;
}

img { max-width: 100%; display: block; }
a { color: var(--accent-2); font-weight: 700; }

button {
  font-family: inherit;
  cursor: pointer;
}
button:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: 3px solid var(--accent-2);
  outline-offset: 2px;
}

.container { max-width: 1100px; margin: 0 auto; padding: 0 20px 80px; }

/* ---------- título "bolha" (logo / headings grandes) ---------- */
.bubble-title {
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--accent);
  -webkit-text-stroke: 2px var(--border-strong);
  text-stroke: 2px var(--border-strong);
  text-shadow:
    2px 2px 0 var(--border-strong),
    4px 4px 0 rgba(0,0,0,0.15);
  letter-spacing: .01em;
}

/* ---------- header / navegação ---------- */
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 22px;
  background: var(--bg-elevated);
  border-bottom: 3px solid var(--border-strong);
  position: sticky;
  top: 0;
  z-index: 40;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  text-decoration: none;
  color: var(--accent);
  -webkit-text-stroke: 1.5px var(--border-strong);
  text-shadow: 2px 2px 0 var(--border-strong);
}

.brand-badge {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: conic-gradient(var(--accent) 0 50%, var(--accent-2) 50% 100%);
  border: 3px solid var(--border-strong);
  position: relative;
  flex-shrink: 0;
}
.brand-badge::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 3px solid var(--border-strong);
}

.nav-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  background: var(--bg-elevated);
  border: 3px solid var(--border-strong);
  border-radius: 999px;
  padding: 4px;
  box-shadow: var(--shadow);
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 800;
  font-size: .86rem;
}
.nav-links a.active,
.nav-links a:hover {
  color: var(--accent-contrast);
  background: var(--accent);
}

.header-actions { display: flex; align-items: center; gap: 10px; }

/* ---------- seletor de tema ---------- */
.theme-switcher { position: relative; }

.theme-switcher summary {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 999px;
  border: 3px solid var(--border-strong);
  background: var(--bg-elevated);
  font-size: .84rem;
  font-weight: 800;
  color: var(--text);
  box-shadow: var(--shadow);
}
.theme-switcher summary::-webkit-details-marker { display: none; }

.theme-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: var(--bg-elevated);
  border: 3px solid var(--border-strong);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-width: 230px;
}

.theme-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  text-align: left;
  padding: 9px 10px;
  border-radius: 12px;
  color: var(--text);
  font-size: .88rem;
  font-weight: 700;
}
.theme-menu button:hover { background: var(--bg-inset); }
.theme-menu button[aria-pressed="true"] { color: var(--accent-2); }
.theme-swatch {
  width: 16px; height: 16px; border-radius: 50%;
  border: 3px solid var(--border-strong);
  flex-shrink: 0;
}

/* ---------- hero / hub ---------- */
.hero { text-align: center; padding: 40px 20px 24px; }
.hero h1,
main > h1 {
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--accent);
  -webkit-text-stroke: 2px var(--border-strong);
  text-shadow: 2px 2px 0 var(--border-strong), 4px 4px 0 rgba(0,0,0,0.15);
  font-size: clamp(1.6rem, 4.5vw, 2.6rem);
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.title-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  color: var(--accent);
  -webkit-text-stroke: 0;
}
.title-icon svg { width: 100%; height: 100%; }

.theme-switcher summary .theme-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}
.theme-switcher summary .theme-icon svg { width: 100%; height: 100%; }
.hero p {
  color: var(--text);
  background: var(--bg-elevated);
  border: 3px solid var(--border-strong);
  border-radius: 18px;
  padding: 12px 20px;
  max-width: 640px;
  margin: 0 auto;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: var(--shadow);
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 26px;
  margin-top: 36px;
}

.game-card {
  background: var(--card-bg);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: var(--card-radius);
  padding: 26px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-decoration: none;
  color: var(--text);
  transition: transform .12s ease, box-shadow .12s ease;
}
.game-card:hover { transform: translateY(-4px); }
.game-card .card-icon { display: inline-flex; width: 40px; height: 40px; color: var(--accent-2); }
.game-card .card-icon svg { width: 100%; height: 100%; }
.game-card h2 { margin: 0; font-family: var(--font-display); font-weight: 800; font-size: 1.3rem; color: var(--text); }
.game-card p { margin: 0; color: var(--text-muted); font-size: .95rem; line-height: 1.5; font-weight: 600; }
.game-card .cta {
  margin-top: auto;
  font-weight: 800;
  color: var(--accent-2);
}

/* ---------- botões (pílula fofa, efeito pressionado) ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 999px;
  border: 3px solid var(--border-strong);
  font-weight: 800;
  font-size: .92rem;
  background: var(--accent);
  color: var(--accent-contrast);
  box-shadow: 4px 4px 0 0 var(--border-strong);
  transition: transform .06s ease, box-shadow .06s ease, filter .12s ease;
}
.btn:hover:not(:disabled) { filter: brightness(1.06); }
.btn:active:not(:disabled) {
  transform: translate(3px, 3px);
  box-shadow: 1px 1px 0 0 var(--border-strong);
}
.btn:disabled { opacity: .5; cursor: not-allowed; }

.btn.secondary { background: var(--accent-2); color: #ffffff; }
.btn.ghost { background: transparent; color: var(--text); box-shadow: none; border-color: var(--border); }
.btn.ghost:active:not(:disabled) { transform: translateY(2px); }

.btn.block { width: 100%; }

/* ---------- seleção de dificuldade ---------- */
.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin: 24px 0;
}

.difficulty-card {
  background: var(--card-bg);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: var(--card-radius);
  padding: 18px;
  text-align: left;
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 4px 4px 0 0 var(--card-border);
  transition: transform .1s ease, box-shadow .1s ease;
}
.difficulty-card:hover { transform: translate(-2px, -2px); }
.difficulty-card.selected {
  box-shadow: 4px 4px 0 0 var(--card-border), 0 0 0 3px var(--accent-2);
  transform: translate(-2px, -2px);
}
.difficulty-card h3 {
  margin: 0; font-size: 1.02rem; display: flex; align-items: center; gap: 8px;
  font-family: var(--font-display); font-weight: 800;
}
.difficulty-card p { margin: 0; font-size: .85rem; color: var(--text-muted); font-weight: 600; }
.diff-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--card-border); }
.diff-easy .diff-dot { background: var(--color-correct); }
.diff-normal .diff-dot { background: var(--accent-2); }
.diff-hard .diff-dot { background: var(--color-close); }
.diff-hardcore .diff-dot { background: var(--color-wrong); }

/* ---------- painel principal (cartão chapado, contorno grosso) ---------- */
.game-panel {
  background: var(--panel-bg);
  border: var(--panel-border-width) solid var(--panel-border);
  border-radius: var(--panel-radius);
  padding: 26px;
  box-shadow: var(--panel-shadow);
  color: var(--panel-text);
}
.game-panel h2, .game-panel h1 { color: var(--panel-text); }
.game-panel .text-muted { color: var(--panel-text-muted); }

.game-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.pill {
  background: var(--pill-bg);
  border: 3px solid var(--pill-border);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: .78rem;
  font-weight: 800;
  color: var(--pill-text);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 60px 20px;
  color: var(--panel-text-muted);
  font-weight: 700;
}

.spinner {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 5px solid rgba(255,255,255,.25);
  border-top-color: var(--panel-border);
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- MonHunt: busca ---------- */
.guess-form { position: relative; display: flex; gap: 10px; margin-bottom: 18px; }
.guess-input-wrap { position: relative; flex: 1; }

.guess-input {
  width: 100%;
  padding: 13px 16px;
  border-radius: 999px;
  border: 2px solid var(--pill-border);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
}

.autocomplete {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: var(--bg-elevated);
  border: 3px solid var(--border-strong);
  border-radius: 18px;
  box-shadow: var(--shadow);
  max-height: 280px;
  overflow-y: auto;
  z-index: 30;
}
.autocomplete button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 8px 14px;
  text-align: left;
  color: var(--text);
  font-size: .92rem;
  font-weight: 700;
}
.autocomplete button:hover,
.autocomplete button.highlighted { background: var(--bg-inset); }
.autocomplete img { width: 32px; height: 32px; object-fit: contain; }

/* ---------- MonHunt: grade de tentativas ---------- */
.attempts-table { display: flex; flex-direction: column; gap: 8px; }

.attempt-row {
  display: grid;
  grid-template-columns: 64px repeat(var(--cols, 7), 1fr);
  gap: 6px;
  align-items: stretch;
}

.attempt-row .thumb {
  background: var(--bg-elevated);
  border: 3px solid var(--border-strong);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
.attempt-row .thumb img { width: 100%; height: 100%; object-fit: contain; }

.cell {
  border: 2px solid var(--border-strong);
  border-radius: 12px;
  padding: 8px 6px;
  font-size: .78rem;
  font-weight: 800;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 58px;
  position: relative;
  animation: pop-in .3s cubic-bezier(.2,1.4,.4,1) both;
}
.cell .cell-label { font-size: .6rem; font-weight: 700; text-transform: uppercase; opacity: .7; }
.cell .cell-arrow { font-size: 1rem; }
.cell::before {
  position: absolute;
  top: 3px; right: 6px;
  font-size: .7rem;
  font-weight: 900;
  opacity: .75;
}

.cell.correct { background: var(--color-correct-bg); color: var(--color-correct); }
.cell.correct::before { content: "✓"; }
.cell.close { background: var(--color-close-bg); color: var(--color-close); }
.cell.close::before { content: "≈"; }
.cell.wrong { background: var(--color-wrong-bg); color: var(--color-wrong); }
.cell.wrong::before { content: "✕"; }
.cell.neutral { background: var(--color-neutral-bg); color: var(--color-neutral); }
.cell.neutral::before { content: "–"; }

@keyframes pop-in {
  from { transform: scale(.4); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.attempts-header {
  display: grid;
  grid-template-columns: 64px repeat(var(--cols, 7), 1fr);
  gap: 6px;
  margin-bottom: 4px;
}
.attempts-header span {
  font-size: .64rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--panel-text-muted);
  text-align: center;
  font-weight: 800;
}

.attempts-remaining { display: flex; gap: 6px; align-items: center; }
.attempts-remaining .dot {
  width: 15px; height: 15px;
  border-radius: 50%;
  position: relative;
  background:
    radial-gradient(circle at center, var(--bg-elevated) 0 2.5px, transparent 2.7px),
    linear-gradient(var(--color-neutral) 0 50%, var(--bg-elevated) 50% 52%, var(--color-neutral) 52% 100%);
  border: 3px solid var(--border-strong);
}
.attempts-remaining .dot.used {
  background:
    radial-gradient(circle at center, var(--bg-elevated) 0 2.5px, transparent 2.7px),
    linear-gradient(var(--color-wrong) 0 50%, var(--bg-elevated) 50% 52%, var(--color-wrong) 52% 100%);
  opacity: .55;
}

/* ---------- modal genérico ---------- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 16, .6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.modal {
  background: var(--card-bg);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: 8px 8px 0 0 var(--card-border);
  max-width: 640px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 26px;
  color: var(--text);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.modal-header h2 { margin: 0; font-family: var(--font-display); font-weight: 800; color: var(--text); }
.modal-close {
  background: var(--bg-inset);
  border: 3px solid var(--border-strong);
  border-radius: 50%;
  width: 36px; height: 36px;
  font-size: 1.1rem;
  color: var(--text);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
}
.pokemon-grid button {
  background: var(--bg-inset);
  border: 2px solid var(--border);
  border-radius: 14px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text);
  font-size: .74rem;
  font-weight: 700;
  text-transform: capitalize;
}
.pokemon-grid button:hover { border-color: var(--accent-2); }
.pokemon-grid button.guessed { opacity: .4; }
.pokemon-grid img { width: 56px; height: 56px; object-fit: contain; }

/* ---------- fim de jogo ---------- */
.end-screen { text-align: center; }
.end-screen .result-icon { display: inline-flex; width: 56px; height: 56px; }
.end-screen .result-icon svg { width: 100%; height: 100%; }
.end-screen .result-icon.win { color: var(--color-correct); }
.end-screen .result-icon.lose { color: var(--color-wrong); }
.end-screen h2 { margin: 6px 0; font-family: var(--font-display); font-weight: 800; }
.end-screen .secret-reveal {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: center;
  background: var(--bg-inset);
  border: 2px solid var(--border);
  border-radius: 18px;
  padding: 14px;
  margin: 16px 0;
}
.end-screen .secret-reveal img { width: 76px; height: 76px; }
.end-screen .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 10px; }

/* ---------- toasts ---------- */
.toast-region {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 200;
  width: min(92vw, 420px);
}
.toast {
  background: var(--card-bg);
  border: 3px solid var(--card-border);
  border-left: 7px solid var(--accent-2);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: var(--shadow);
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
  animation: toast-in .2s ease both;
}
.toast.success { border-left-color: var(--color-correct); }
.toast.error { border-left-color: var(--color-wrong); }
@keyframes toast-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==========================================================================
   MONLINK
   ========================================================================== */

.lives-row { display: flex; gap: 8px; align-items: center; }

.heart {
  display: inline-block;
  font-size: 0;
  width: 18px;
  height: 16px;
  position: relative;
}
.heart::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--color-wrong);
  clip-path: polygon(
    50% 100%, 10% 60%, 0% 35%, 0% 15%, 15% 0%, 35% 0%, 50% 18%,
    65% 0%, 85% 0%, 100% 15%, 100% 35%, 90% 60%
  );
}
.heart.lost { opacity: .3; }
.heart.lost::before {
  background-color: var(--color-neutral);
  background-image: repeating-linear-gradient(45deg, rgba(0,0,0,.35) 0 2px, transparent 2px 5px);
}

.solved-groups { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.solved-group {
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: pop-in .35s cubic-bezier(.2,1.4,.4,1) both;
}
.solved-group .group-title { font-weight: 800; font-size: .8rem; text-transform: uppercase; letter-spacing: .02em; }
.solved-group .group-members { font-size: .85rem; opacity: .9; text-transform: capitalize; font-weight: 600; }

.connection-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 640px) {
  .connection-grid { grid-template-columns: repeat(2, 1fr); }
}

.conn-tile {
  aspect-ratio: 1 / 1;
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  color: var(--text);
  font-size: .72rem;
  font-weight: 700;
  text-transform: capitalize;
  transition: transform .1s ease, border-color .1s ease, box-shadow .1s ease;
}
.conn-tile img { width: 56%; height: auto; object-fit: contain; }
.conn-tile:hover:not(:disabled) { border-color: var(--accent-2); }
.conn-tile.selected {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px var(--accent-2);
  transform: translateY(-2px);
}
.conn-tile.solved { pointer-events: none; }
.conn-tile.shake { animation: shake .4s ease; }

@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
}

.conn-actions { display: flex; justify-content: center; gap: 10px; margin-top: 18px; }

/* ---------- utilitários ---------- */
.center { text-align: center; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
.text-muted { color: var(--text-muted); }
.visually-hidden {
  position: absolute; width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}

footer.site-footer {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-muted);
  font-size: .8rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

@media (max-width: 720px) {
  .attempt-row, .attempts-header { grid-template-columns: 48px repeat(var(--cols, 7), 1fr); }
  .cell { font-size: .64rem; min-height: 50px; padding: 6px 3px; }
  .cell .cell-label { display: none; }
}
`;

  function injectVars(themeId) {
    const tokens = window.PokeThemeTokens[themeId] || window.PokeThemeTokens.light;
    let tag = document.getElementById(STYLE_TAG_VARS_ID);
    if (!tag) {
      tag = document.createElement("style");
      tag.id = STYLE_TAG_VARS_ID;
      document.head.appendChild(tag);
    }
    tag.textContent = toCssVars(tokens);
  }

  function injectGlobal() {
    if (document.getElementById(STYLE_TAG_GLOBAL_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_TAG_GLOBAL_ID;
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
  }

  function setTheme(themeId) {
    injectGlobal();
    injectVars(themeId);
  }

  window.PokeStyles = { setTheme };
})();
