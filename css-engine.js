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
  --scanline: ${t.scanline};

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
html { color-scheme: light dark; scroll-behavior: smooth; }

body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
  transition: background-color .35s ease, color .35s ease;
  /* Subtle decorative mesh gradient in the background */
  background-image:
    radial-gradient(ellipse at 10% 20%, color-mix(in srgb, var(--accent) 4%, transparent) 0%, transparent 60%),
    radial-gradient(ellipse at 90% 80%, color-mix(in srgb, var(--accent-2) 4%, transparent) 0%, transparent 60%);
}

img { max-width: 100%; display: block; }
a { color: var(--accent-2); font-weight: 600; text-decoration: none; }
a:hover { text-decoration: underline; }

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

/* ---------- título "bolha" ---------- */
.bubble-title {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--accent);
  letter-spacing: -.02em;
}

/* ---------- header / navegação ---------- */
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  box-shadow: 0 1px 0 var(--border), 0 4px 20px color-mix(in srgb, var(--accent) 6%, transparent);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.35rem;
  text-decoration: none;
  color: var(--accent);
  letter-spacing: -.02em;
  transition: transform .15s ease;
}
.brand:hover {
  transform: scale(1.03);
  text-decoration: none;
}

.brand-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(180deg, #E3350D 0%, #E3350D 45%, #1a1d2e 45%, #1a1d2e 55%, #ffffff 55%, #ffffff 100%);
  border: 2.5px solid #1a1d2e;
  position: relative;
  flex-shrink: 0;
  transition: transform .3s ease;
}
.brand:hover .brand-badge {
  transform: rotate(20deg);
}
.brand-badge::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  border: 2.5px solid #1a1d2e;
}

.nav-links {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  background: var(--bg-inset);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 4px;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted);
  padding: 8px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: .88rem;
  transition: all .15s ease;
}
.nav-links a.active,
.nav-links a:hover {
  color: var(--accent-contrast);
  background: var(--accent);
  text-decoration: none;
}

.header-actions { display: flex; align-items: center; gap: 10px; }

/* ---------- seletor de tema ---------- */
.theme-switcher { position: relative; }

.theme-switcher summary {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  font-size: .85rem;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  transition: all .15s ease;
}
.theme-switcher summary:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(227, 53, 13, 0.1);
}
.theme-switcher summary::-webkit-details-marker { display: none; }

.theme-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-width: 230px;
  animation: menu-in .15s ease;
}
@keyframes menu-in {
  from { opacity: 0; transform: translateY(-6px) scale(.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.theme-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text);
  font-size: .88rem;
  font-weight: 600;
  transition: background .12s ease;
}
.theme-menu button:hover { background: var(--bg-inset); }
.theme-menu button[aria-pressed="true"] { color: var(--accent); font-weight: 700; }
.theme-swatch {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid var(--border-strong);
  flex-shrink: 0;
}

/* ---------- hero / hub ---------- */
.hero { text-align: center; padding: 48px 20px 28px; }
.hero h1,
main > h1 {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--text);
  font-size: clamp(1.8rem, 4.5vw, 2.8rem);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  letter-spacing: -.03em;
  line-height: 1.15;
}
.hero h1 strong,
.hero h1 span.accent-text {
  color: var(--accent);
}
.title-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  color: var(--accent);
}
.title-icon svg { width: 100%; height: 100%; }

.theme-switcher summary .theme-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}
.theme-switcher summary .theme-icon svg { width: 100%; height: 100%; }

.hero p {
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 24px;
  max-width: 640px;
  margin: 0 auto;
  font-size: .95rem;
  font-weight: 500;
  line-height: 1.65;
  box-shadow: var(--shadow);
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 36px;
}

.game-card {
  background: var(--card-bg);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: var(--card-radius);
  padding: 28px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-decoration: none;
  color: var(--text);
  transition: transform .2s ease, box-shadow .2s ease;
  position: relative;
  overflow: hidden;
}
.game-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  opacity: 0;
  transition: opacity .2s ease;
}
.game-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  text-decoration: none;
}
.game-card:hover::before { opacity: 1; }

.game-card .card-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  color: var(--accent);
  background: var(--bg-inset);
  border-radius: 12px;
  padding: 10px;
}
.game-card .card-icon svg { width: 100%; height: 100%; }
.game-card h2 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.4rem;
  color: var(--text);
  letter-spacing: -.02em;
}
.game-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: .9rem;
  line-height: 1.6;
  font-weight: 500;
}
.game-card .cta {
  margin-top: auto;
  font-weight: 700;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap .15s ease;
}
.game-card:hover .cta { gap: 10px; }

/* ---------- botões ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: .9rem;
  background: linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, var(--accent-2)) 100%);
  color: var(--accent-contrast);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: all .2s ease;
}
.btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2);
}
.btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--accent) 20%, transparent);
  filter: brightness(.97);
}
.btn:disabled { opacity: .45; cursor: not-allowed; }

.btn.secondary {
  background: linear-gradient(135deg, var(--accent-2) 0%, color-mix(in srgb, var(--accent-2) 85%, var(--accent)) 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent-2) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.15);
}
.btn.secondary:hover:not(:disabled) {
  box-shadow: 0 6px 20px color-mix(in srgb, var(--accent-2) 35%, transparent);
}
.btn.ghost {
  background: transparent;
  color: var(--text);
  box-shadow: none;
  border: 1px solid var(--border);
}
.btn.ghost:hover:not(:disabled) {
  background: var(--bg-inset);
  border-color: var(--border-strong);
  filter: none;
  transform: none;
}
.btn.ghost:active:not(:disabled) { transform: translateY(1px); }

.btn.block { width: 100%; }

/* ---------- seleção de dificuldade ---------- */
.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin: 24px 0;
}

.difficulty-card {
  background: var(--card-bg);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: var(--card-radius);
  padding: 20px;
  text-align: left;
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all .15s ease;
  position: relative;
  overflow: hidden;
}
.difficulty-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-shadow);
}
.difficulty-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(227, 53, 13, 0.15), var(--card-shadow);
  transform: translateY(-3px);
}
.difficulty-card h3 {
  margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 10px;
  font-family: var(--font-display); font-weight: 800;
}
.difficulty-card p { margin: 0; font-size: .84rem; color: var(--text-muted); font-weight: 500; }
.diff-dot {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid var(--border-strong);
  flex-shrink: 0;
}
.diff-easy .diff-dot { background: #4ade80; }
.diff-normal .diff-dot { background: #60a5fa; }
.diff-hard .diff-dot { background: #fbbf24; }
.diff-hardcore .diff-dot {
  background: linear-gradient(135deg, #E3350D, #FFCB05);
  border-color: #E3350D;
  box-shadow: 0 0 6px rgba(227, 53, 13, 0.4);
}

/* ---------- painel principal ---------- */
.game-panel {
  background: var(--panel-bg);
  border: var(--panel-border-width) solid var(--panel-border);
  border-radius: var(--panel-radius);
  padding: 28px;
  box-shadow: var(--panel-shadow);
  color: var(--panel-text);
  position: relative;
  overflow: hidden;
}
/* Scanline effect is now transparent by default (removed Game Boy look) */
.game-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(180deg, var(--scanline) 0 1px, transparent 1px 3px);
  pointer-events: none;
  z-index: 0;
}
.game-panel > * { position: relative; z-index: 1; }
.game-panel h2, .game-panel h1 { color: var(--panel-text); }
.game-panel .text-muted { color: var(--panel-text-muted); }

.game-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.pill {
  background: var(--pill-bg);
  border: 1px solid var(--pill-border);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: .78rem;
  font-weight: 700;
  color: var(--pill-text);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: var(--panel-text-muted);
  font-weight: 600;
}

.spinner {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 4px solid var(--border);
  border-top-color: var(--accent);
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- MonHunt: busca ---------- */
.guess-form { position: relative; z-index: 5; display: flex; gap: 10px; margin-bottom: 18px; }
.guess-input-wrap { position: relative; flex: 1; }

.guess-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: .95rem;
  font-weight: 500;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.guess-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(227, 53, 13, 0.1);
  outline: none;
}

.autocomplete {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 12px 34px rgba(0,0,0,0.22);
  max-height: 280px;
  overflow-y: auto;
  z-index: 60;
  animation: menu-in .12s ease;
  isolation: isolate;
}
.autocomplete button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 10px 14px;
  text-align: left;
  color: var(--text);
  font-size: .9rem;
  font-weight: 600;
  transition: background .1s ease;
}
.autocomplete button:first-child { border-radius: 14px 14px 0 0; }
.autocomplete button:last-child { border-radius: 0 0 14px 14px; }
.autocomplete button:hover,
.autocomplete button.highlighted {
  background: var(--bg-inset);
  box-shadow: inset 3px 0 0 0 var(--accent);
}
.autocomplete img { width: 36px; height: 36px; object-fit: contain; image-rendering: pixelated; }

/* ---------- MonHunt: legenda de status ---------- */
.status-legend {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin: 0 0 12px;
}
.status-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .78rem;
  font-weight: 700;
  color: var(--panel-text-muted, var(--text-muted));
}
.status-legend .legend-dot {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: .72rem;
  border: 1.5px solid transparent;
  flex-shrink: 0;
}
.status-legend .legend-item.correct .legend-dot { background: var(--color-correct-bg); color: var(--color-correct); border-color: var(--color-correct); }
.status-legend .legend-item.close .legend-dot { background: var(--color-close-bg); color: var(--color-close); border-color: var(--color-close); }
.status-legend .legend-item.wrong .legend-dot { background: var(--color-wrong-bg); color: var(--color-wrong); border-color: var(--color-wrong); }

/* ---------- MonHunt: grade de tentativas ---------- */
.attempts-table { display: flex; flex-direction: column; gap: 8px; }

.attempt-row {
  display: grid;
  grid-template-columns: 64px repeat(var(--cols, 7), 1fr);
  gap: 6px;
  align-items: stretch;
}

.attempt-row .thumb {
  background: var(--bg-inset);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
.attempt-row .thumb img { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; }

.cell {
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 8px 6px;
  font-size: .78rem;
  font-weight: 700;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 58px;
  position: relative;
  animation: pop-in .3s cubic-bezier(.2,1.4,.4,1) both;
  transition: background .2s ease;
}
.cell .cell-label { font-size: .6rem; font-weight: 600; text-transform: uppercase; opacity: .6; }
.cell .cell-arrow { font-size: 1rem; }
.cell::before {
  position: absolute;
  top: 4px; right: 6px;
  font-size: .65rem;
  font-weight: 800;
  opacity: .65;
}

.cell.correct { background: var(--color-correct-bg); color: var(--color-correct); border-color: var(--color-correct); }
.cell.correct::before { content: "✓"; }
.cell.close { background: var(--color-close-bg); color: var(--color-close); border-color: var(--color-close); }
.cell.close::before { content: "≈"; }
.cell.wrong { background: var(--color-wrong-bg); color: var(--color-wrong); border-color: var(--color-wrong); }
.cell.wrong::before { content: "✕"; }
.cell.neutral { background: var(--color-neutral-bg); color: var(--color-neutral); border-color: transparent; }
.cell.neutral::before { content: "–"; }

@keyframes pop-in {
  from { transform: scale(.4); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.attempts-header {
  display: grid;
  grid-template-columns: 64px repeat(var(--cols, 7), 1fr);
  gap: 6px;
  margin-bottom: 6px;
}
.attempts-header span {
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--panel-text-muted);
  text-align: center;
  font-weight: 700;
}

.attempts-remaining { display: flex; gap: 6px; align-items: center; }
.attempts-remaining .dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  position: relative;
  background:
    radial-gradient(circle at center, var(--bg-elevated) 0 3px, transparent 3.5px),
    linear-gradient(var(--accent) 0 45%, #1a1d2e 45% 55%, #ffffff 55% 100%);
  border: 2px solid #1a1d2e;
  transition: opacity .2s ease, transform .2s ease;
}
.attempts-remaining .dot.used {
  background:
    radial-gradient(circle at center, var(--bg-elevated) 0 3px, transparent 3.5px),
    linear-gradient(var(--color-neutral) 0 45%, #666 45% 55%, #aaa 55% 100%);
  opacity: .35;
  transform: scale(.85);
}

/* ---------- modal genérico ---------- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 20, .55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
  animation: fade-in .2s ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.modal {
  background: var(--card-bg);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 640px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px;
  color: var(--text);
  animation: modal-in .25s cubic-bezier(.2,1,.4,1);
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.modal.end-screen {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 20px 60px rgba(227, 53, 13, 0.15);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}
.modal-header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--text);
  letter-spacing: -.02em;
}
.modal-close {
  background: var(--bg-inset);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 36px; height: 36px;
  font-size: 1rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .12s ease;
}
.modal-close:hover {
  background: var(--accent);
  color: var(--accent-contrast);
  border-color: var(--accent);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}
.pokemon-grid button {
  background: var(--bg-inset);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text);
  font-size: .72rem;
  font-weight: 600;
  text-transform: capitalize;
  transition: all .12s ease;
}
.pokemon-grid button:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.pokemon-grid button.guessed { opacity: .35; }
.pokemon-grid img { width: 56px; height: 56px; object-fit: contain; image-rendering: pixelated; }

/* ---------- fim de jogo ---------- */
.end-screen { text-align: center; }
.end-screen .result-icon {
  display: inline-flex;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 12px;
  box-sizing: border-box;
}
.end-screen .result-icon svg { width: 100%; height: 100%; }
.end-screen .result-icon.win {
  color: var(--color-correct);
  background: var(--color-correct-bg);
}
.end-screen .result-icon.lose {
  color: var(--color-wrong);
  background: var(--color-wrong-bg);
}
.end-screen h2 {
  margin: 8px 0;
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -.02em;
}
.end-screen .secret-reveal {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: center;
  background: var(--bg-inset);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin: 16px 0;
}
.end-screen .secret-reveal img { width: 76px; height: 76px; image-rendering: pixelated; }
.end-screen .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 12px; }

/* ---------- toasts ---------- */
.toast-region {
  position: fixed;
  bottom: 20px;
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
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent-2);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  font-size: .88rem;
  font-weight: 600;
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
  width: 20px;
  height: 18px;
  position: relative;
  transition: all .2s ease;
}
.heart::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--accent);
  clip-path: polygon(
    50% 100%, 10% 60%, 0% 35%, 0% 15%, 15% 0%, 35% 0%, 50% 18%,
    65% 0%, 85% 0%, 100% 15%, 100% 35%, 90% 60%
  );
}
.heart.lost { opacity: .25; transform: scale(.85); }
.heart.lost::before {
  background-color: var(--color-neutral);
}

.solved-groups { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.solved-group {
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: pop-in .35s cubic-bezier(.2,1.4,.4,1) both;
}
.solved-group .group-title { font-weight: 800; font-size: .82rem; text-transform: uppercase; letter-spacing: .02em; }
.solved-group .group-members { font-size: .85rem; opacity: .9; text-transform: capitalize; font-weight: 500; }

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
  border: 1.5px solid var(--border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  color: var(--text);
  font-size: .74rem;
  font-weight: 700;
  text-transform: capitalize;
  transition: all .15s ease;
}
.conn-tile img { width: 56%; height: auto; object-fit: contain; image-rendering: pixelated; }
.conn-tile:hover:not(:disabled) {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.conn-tile.selected {
  border-color: var(--accent);
  background: var(--bg-inset);
  box-shadow: 0 0 0 3px rgba(227, 53, 13, 0.15);
  transform: translateY(-3px);
}
.conn-tile.solved { pointer-events: none; }
.conn-tile.shake { animation: shake .4s ease; }
.conn-tile.solve-pop { animation: tile-solve-pop .4s ease; }

@keyframes tile-solve-pop {
  0% { transform: scale(1); }
  45% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* Barra que substitui as 4 células de um grupo acertado, ocupando a
   linha inteira do grid — nasce discreta e "estoura" pro tamanho final. */
.conn-row-merged {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 16px;
  padding: 10px 16px;
  opacity: 0;
  transform: scale(.92);
  transition: opacity .3s ease, transform .3s cubic-bezier(.2,1.4,.4,1);
}
.conn-row-merged.in { opacity: 1; transform: scale(1); }
.conn-row-merged .merged-title {
  font-weight: 800;
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .02em;
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 110px;
}
.conn-row-merged .merged-members {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
}
.conn-row-merged .merged-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.conn-row-merged .merged-member img { width: 34px; height: 34px; object-fit: contain; image-rendering: pixelated; }
.conn-row-merged .merged-member span {
  font-size: .62rem;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
@media (max-width: 640px) {
  .conn-row-merged { flex-wrap: wrap; gap: 8px; }
  .conn-row-merged .merged-title { max-width: 100%; }
}

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
  font-weight: 500;
  position: relative;
  z-index: 1;
}

@media (max-width: 720px) {
  .attempt-row, .attempts-header { grid-template-columns: 48px repeat(var(--cols, 7), 1fr); }
  .cell { font-size: .64rem; min-height: 50px; padding: 6px 3px; }
  .cell .cell-label { display: none; }
  .status-legend { justify-content: center; gap: 12px; }
  .status-legend .legend-item { font-size: .72rem; }
  .status-legend .legend-dot { width: 18px; height: 18px; }
  .site-header { padding: 10px 14px; gap: 10px; }
  .brand { font-size: 1.1rem; }
  .nav-links a { padding: 6px 12px; font-size: .8rem; }
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