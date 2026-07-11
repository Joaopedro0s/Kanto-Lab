/* ==========================================================================
   theme-tokens.js
   Cada tema é um objeto JS com os "tokens" (cores, formas, tipografia).

   Estilo alvo: visual moderno e premium inspirado na franquia Pokémon.
   Cores icônicas da marca (vermelho Pokébola, azul Pokémon, amarelo
   Pikachu) são usadas como base, com paletas complementares sofisticadas.
   Tipografia limpa com Outfit (display) e Inter (body). Bordas
   arredondadas e sombras difusas substituem o visual pixelado anterior.
   ========================================================================== */

(function () {
  "use strict";

  const FONT_DISPLAY = "'Outfit', 'Inter', system-ui, sans-serif";
  const FONT_BODY = "'Inter', 'Outfit', system-ui, sans-serif";

  const THEME_TOKENS = {
    /* ------------------------------------------------------------------
       LIGHT — Inspirado na Pokébola: fundo claro limpo, acentos em
       vermelho Pokémon (#E3350D) e azul (#3B4CCA). Visual premium,
       bordas suaves, sombras difusas.
       ------------------------------------------------------------------ */
    light: {
      label: "Claro",
      swatch: "#E3350D",

      bg: "#f0f2f8",
      bgElevated: "#ffffff",
      bgInset: "#e8ecf4",
      text: "#1a1d2e",
      textMuted: "#5c6178",
      border: "#d4d9e6",
      borderStrong: "#b0b8cc",
      accent: "#E3350D",
      accentContrast: "#ffffff",
      accent2: "#3B4CCA",

      colorCorrect: "#1a8a4a", colorCorrectBg: "#d4f5e2",
      colorClose: "#c2540a", colorCloseBg: "#fde3c7",
      colorWrong: "#c93030", colorWrongBg: "#fde0e0",
      colorNeutral: "#7a7f94", colorNeutralBg: "#ebedf3",

      group1Bg: "#fde68a", group1Text: "#78350f",
      group2Bg: "#a7f3d0", group2Text: "#064e3b",
      group3Bg: "#bfdbfe", group3Text: "#1e3a5f",
      group4Bg: "#ddd6fe", group4Text: "#4c1d95",

      shadow: "0 4px 16px rgba(26, 29, 46, 0.10)",
      radius: "14px",

      scanline: "transparent",

      cardBg: "#ffffff",
      cardBorder: "#e0e4ee",
      cardBorderWidth: "1.5px",
      cardRadius: "16px",
      cardShadow: "0 4px 20px rgba(26, 29, 46, 0.08)",

      panelBg: "#ffffff",
      panelBorder: "#e0e4ee",
      panelBorderWidth: "1.5px",
      panelRadius: "18px",
      panelText: "#1a1d2e",
      panelTextMuted: "#5c6178",
      panelShadow: "0 6px 30px rgba(26, 29, 46, 0.08)",

      pillBg: "#f0f2f8",
      pillText: "#3B4CCA",
      pillBorder: "#d4d9e6",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       DARK — Noite em Kanto: fundo azul-escuro profundo, amarelo
       Pikachu (#FFCB05) como accent principal, azul céu (#5A96FF) como
       secundário. Sensação noturna e imersiva.
       ------------------------------------------------------------------ */
    dark: {
      label: "Escuro",
      swatch: "#FFCB05",

      bg: "#0f1123",
      bgElevated: "#1a1d35",
      bgInset: "#141729",
      text: "#e8eaf4",
      textMuted: "#8a8fb0",
      border: "#2a2e4a",
      borderStrong: "#3d4268",
      accent: "#FFCB05",
      accentContrast: "#1a1d2e",
      accent2: "#5A96FF",

      colorCorrect: "#4ade80", colorCorrectBg: "#0c2e1a",
      colorClose: "#fb923c", colorCloseBg: "#3a1f08",
      colorWrong: "#f87171", colorWrongBg: "#2e0c0c",
      colorNeutral: "#6b7094", colorNeutralBg: "#1c1f36",

      group1Bg: "#422006", group1Text: "#fde68a",
      group2Bg: "#052e16", group2Text: "#86efac",
      group3Bg: "#0c2556", group3Text: "#93c5fd",
      group4Bg: "#2e1065", group4Text: "#c4b5fd",

      shadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
      radius: "14px",

      scanline: "transparent",

      cardBg: "#1a1d35",
      cardBorder: "#2a2e4a",
      cardBorderWidth: "1.5px",
      cardRadius: "16px",
      cardShadow: "0 4px 24px rgba(0, 0, 0, 0.30)",

      panelBg: "#1a1d35",
      panelBorder: "#2a2e4a",
      panelBorderWidth: "1.5px",
      panelRadius: "18px",
      panelText: "#e8eaf4",
      panelTextMuted: "#8a8fb0",
      panelShadow: "0 6px 30px rgba(0, 0, 0, 0.30)",

      pillBg: "#141729",
      pillText: "#FFCB05",
      pillBorder: "#2a2e4a",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       COLORBLIND — Paleta azul + laranja, segura para deuteranopia e
       protanopia. Fundo quente off-white, accents em azul forte e
       laranja saturado.
       ------------------------------------------------------------------ */
    colorblind: {
      label: "Amigável p/ daltônicos",
      swatch: "#2B6CB0",

      bg: "#faf5ef",
      bgElevated: "#ffffff",
      bgInset: "#f0ebe3",
      text: "#2d2014",
      textMuted: "#7a6b58",
      border: "#d9cfc2",
      borderStrong: "#b8a992",
      accent: "#E87A20",
      accentContrast: "#ffffff",
      accent2: "#2B6CB0",

      colorCorrect: "#2B6CB0", colorCorrectBg: "#dbeafe",
      colorClose: "#E87A20", colorCloseBg: "#fef0d8",
      colorWrong: "#8b5c36", colorWrongBg: "#f5e6d4",
      colorNeutral: "#8a7b6a", colorNeutralBg: "#eee6dc",

      group1Bg: "#dbeafe", group1Text: "#1e40af",
      group2Bg: "#fef0d8", group2Text: "#92400e",
      group3Bg: "#e0ddd4", group3Text: "#3a2c10",
      group4Bg: "#f0d8e8", group4Text: "#831843",

      shadow: "0 4px 16px rgba(45, 32, 20, 0.10)",
      radius: "14px",

      scanline: "transparent",

      cardBg: "#ffffff",
      cardBorder: "#d9cfc2",
      cardBorderWidth: "1.5px",
      cardRadius: "16px",
      cardShadow: "0 4px 20px rgba(45, 32, 20, 0.08)",

      panelBg: "#ffffff",
      panelBorder: "#d9cfc2",
      panelBorderWidth: "1.5px",
      panelRadius: "18px",
      panelText: "#2d2014",
      panelTextMuted: "#7a6b58",
      panelShadow: "0 6px 30px rgba(45, 32, 20, 0.08)",

      pillBg: "#f0ebe3",
      pillText: "#2B6CB0",
      pillBorder: "#d9cfc2",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       HIGH CONTRAST — Preto puro e branco puro. Amarelo Pokémon (#ffd400)
       e ciano como destaques. Máxima legibilidade.
       ------------------------------------------------------------------ */
    "high-contrast": {
      label: "Alto contraste",
      swatch: "#ffffff",

      bg: "#000000",
      bgElevated: "#0a0a0a",
      bgInset: "#141414",
      text: "#ffffff",
      textMuted: "#cfcfcf",
      border: "#4d4d4d",
      borderStrong: "#ffffff",
      accent: "#ffd400",
      accentContrast: "#000000",
      accent2: "#00e5ff",

      colorCorrect: "#00e676", colorCorrectBg: "#003318",
      colorClose: "#ff9500", colorCloseBg: "#3a1e00",
      colorWrong: "#ff5252", colorWrongBg: "#350808",
      colorNeutral: "#8a8a8a", colorNeutralBg: "#1f1f1f",

      group1Bg: "#3a3300", group1Text: "#ffd400",
      group2Bg: "#003318", group2Text: "#00e676",
      group3Bg: "#002733", group3Text: "#00e5ff",
      group4Bg: "#2a002e", group4Text: "#ff8cf0",

      shadow: "0 0 0 2px #ffffff",
      radius: "10px",

      scanline: "transparent",

      cardBg: "#0a0a0a",
      cardBorder: "#ffffff",
      cardBorderWidth: "2px",
      cardRadius: "12px",
      cardShadow: "0 0 0 2px #ffffff",

      panelBg: "#0a0a0a",
      panelBorder: "#ffffff",
      panelBorderWidth: "2px",
      panelRadius: "14px",
      panelText: "#ffffff",
      panelTextMuted: "#cfcfcf",
      panelShadow: "0 0 0 2px #ffffff",

      pillBg: "#141414",
      pillText: "#ffffff",
      pillBorder: "#ffffff",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },
  };

  window.PokeThemeTokens = THEME_TOKENS;
})();