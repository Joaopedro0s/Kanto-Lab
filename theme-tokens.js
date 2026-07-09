/* ==========================================================================
   theme-tokens.js
   Cada tema é um objeto JS com os "tokens" (cores, formas, tipografia).

   Estilo alvo: line art com contorno preto grosso, cores chapadas (sem
   gradiente/blur), sombra dura deslocada (sem blur), cartões com borda
   grossa — visual de pôster/menu de jogo, limpo e de alto contraste.
   Paleta base: amarelo vibrante + azul elétrico + branco.

   Trocar de tema = trocar qual chave deste objeto está ativa; css-engine.js
   lê o objeto e escreve/atualiza um <style> na página.
   ========================================================================== */

(function () {
  "use strict";

  const FONT_DISPLAY = "'Baloo 2', 'Segoe UI', cursive";
  const FONT_BODY = "'Nunito', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const THEME_TOKENS = {
    /* ------------------------------------------------------------------
       LIGHT — fundo branco liso, contorno preto grosso, amarelo vibrante
       como cor de destaque principal e azul elétrico como secundária.
       ------------------------------------------------------------------ */
    light: {
      label: "Claro",
      swatch: "#ffc93c",

      bg: "#ffffff",
      bgElevated: "#ffffff",
      bgInset: "#f4f5fa",
      text: "#14141a",
      textMuted: "#54596e",
      border: "#d8dbe6",
      borderStrong: "#14141a",
      accent: "#ffc93c",
      accentContrast: "#14141a",
      accent2: "#2e6ff2",

      colorCorrect: "#2fa84f", colorCorrectBg: "#d8f5df",
      colorClose: "#e0a72e", colorCloseBg: "#fff0c2",
      colorWrong: "#e8483f", colorWrongBg: "#ffe0dc",
      colorNeutral: "#8a8fa3", colorNeutralBg: "#eef0f5",

      group1Bg: "#fff0b0", group1Text: "#6b5900",
      group2Bg: "#bdeecb", group2Text: "#1c5c2e",
      group3Bg: "#c7d9fb", group3Text: "#1c3f7a",
      group4Bg: "#e6cdf5", group4Text: "#5a2578",

      shadow: "5px 5px 0 0 #14141a",
      radius: "14px",

      cardBg: "#ffffff",
      cardBorder: "#14141a",
      cardBorderWidth: "3px",
      cardRadius: "20px",
      cardShadow: "5px 5px 0 0 #14141a",

      panelBg: "#ffffff",
      panelBorder: "#14141a",
      panelBorderWidth: "4px",
      panelRadius: "24px",
      panelText: "#14141a",
      panelTextMuted: "#54596e",
      panelShadow: "6px 6px 0 0 #14141a",

      pillBg: "#2e6ff2",
      pillText: "#ffffff",
      pillBorder: "#14141a",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       DARK — mesmo vocabulário (contorno grosso, cor chapada, sombra
       dura), mas com fundo quase-preto e contorno em branco/azul elétrico
       (contorno preto ficaria invisível sobre fundo escuro).
       ------------------------------------------------------------------ */
    dark: {
      label: "Escuro",
      swatch: "#5b8cff",

      bg: "#14141a",
      bgElevated: "#1e1f2b",
      bgInset: "#262838",
      text: "#f5f6fa",
      textMuted: "#a7acc2",
      border: "#34374d",
      borderStrong: "#f5f6fa",
      accent: "#ffd35c",
      accentContrast: "#14141a",
      accent2: "#5b8cff",

      colorCorrect: "#4cd07d", colorCorrectBg: "#163526",
      colorClose: "#f0b93b", colorCloseBg: "#3a2f13",
      colorWrong: "#ff7a6e", colorWrongBg: "#3a1c17",
      colorNeutral: "#7f84a0", colorNeutralBg: "#22243354",

      group1Bg: "#4a3f0f", group1Text: "#ffe082",
      group2Bg: "#16401f", group2Text: "#a8dab5",
      group3Bg: "#1a3357", group3Text: "#a9c9f5",
      group4Bg: "#3c2050", group4Text: "#e2b6f5",

      shadow: "5px 5px 0 0 #000000",
      radius: "14px",

      cardBg: "#1e1f2b",
      cardBorder: "#5b8cff",
      cardBorderWidth: "3px",
      cardRadius: "20px",
      cardShadow: "5px 5px 0 0 #5b8cff",

      panelBg: "#1e1f2b",
      panelBorder: "#5b8cff",
      panelBorderWidth: "4px",
      panelRadius: "24px",
      panelText: "#f5f6fa",
      panelTextMuted: "#a7acc2",
      panelShadow: "6px 6px 0 0 #5b8cff",

      pillBg: "#2a3550",
      pillText: "#f5f6fa",
      pillBorder: "#5b8cff",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       COLORBLIND — mesmo tratamento de linha grossa/cor chapada; paleta
       azul/laranja/cinza (evita depender de vermelho/verde).
       ------------------------------------------------------------------ */
    colorblind: {
      label: "Amigável p/ daltônicos",
      swatch: "#e08300",

      bg: "#ffffff",
      bgElevated: "#ffffff",
      bgInset: "#f0f0ee",
      text: "#1a1a1a",
      textMuted: "#55575c",
      border: "#d6d6d2",
      borderStrong: "#1a1a1a",
      accent: "#e08300",
      accentContrast: "#1a1a1a",
      accent2: "#005fa3",

      colorCorrect: "#0072b2", colorCorrectBg: "#d6ebf7",
      colorClose: "#e69f00", colorCloseBg: "#fbeacc",
      colorWrong: "#6b6b6b", colorWrongBg: "#e4e4e2",
      colorNeutral: "#9a9a94", colorNeutralBg: "#eaeae6",

      group1Bg: "#cfe8ff", group1Text: "#003a5c",
      group2Bg: "#ffe0b3", group2Text: "#7a3d00",
      group3Bg: "#d9d9d9", group3Text: "#1a1a1a",
      group4Bg: "#ffd0e0", group4Text: "#6b1030",

      shadow: "5px 5px 0 0 #1a1a1a",
      radius: "14px",

      cardBg: "#ffffff",
      cardBorder: "#1a1a1a",
      cardBorderWidth: "3px",
      cardRadius: "20px",
      cardShadow: "5px 5px 0 0 #1a1a1a",

      panelBg: "#ffffff",
      panelBorder: "#1a1a1a",
      panelBorderWidth: "4px",
      panelRadius: "24px",
      panelText: "#1a1a1a",
      panelTextMuted: "#55575c",
      panelShadow: "6px 6px 0 0 #1a1a1a",

      pillBg: "#005fa3",
      pillText: "#ffffff",
      pillBorder: "#1a1a1a",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       HIGH CONTRAST — preto absoluto + amarelo neon; já é, por natureza,
       o tema que mais se aproxima do "line art" (bordas grossas, zero
       gradiente); só reforçamos a espessura e o padrão de sombra dura.
       ------------------------------------------------------------------ */
    "high-contrast": {
      label: "Alto contraste",
      swatch: "#ffd400",

      bg: "#000000",
      bgElevated: "#0d0d0d",
      bgInset: "#1a1a1a",
      text: "#ffffff",
      textMuted: "#cfcfcf",
      border: "#4d4d4d",
      borderStrong: "#ffd400",
      accent: "#ffd400",
      accentContrast: "#000000",
      accent2: "#00e5ff",

      colorCorrect: "#00e676", colorCorrectBg: "#003318",
      colorClose: "#ffd400", colorCloseBg: "#3a3000",
      colorWrong: "#ff5252", colorWrongBg: "#350808",
      colorNeutral: "#8a8a8a", colorNeutralBg: "#1f1f1f",

      group1Bg: "#3a3300", group1Text: "#ffd400",
      group2Bg: "#003318", group2Text: "#00e676",
      group3Bg: "#002733", group3Text: "#00e5ff",
      group4Bg: "#2a002e", group4Text: "#ff8cf0",

      shadow: "5px 5px 0 0 #ffd400",
      radius: "10px",

      cardBg: "#0d0d0d",
      cardBorder: "#ffd400",
      cardBorderWidth: "4px",
      cardRadius: "16px",
      cardShadow: "5px 5px 0 0 #ffd400",

      panelBg: "#000000",
      panelBorder: "#ffd400",
      panelBorderWidth: "4px",
      panelRadius: "18px",
      panelText: "#ffffff",
      panelTextMuted: "#cfcfcf",
      panelShadow: "6px 6px 0 0 #ffd400",

      pillBg: "#1a1a1a",
      pillText: "#ffd400",
      pillBorder: "#ffd400",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },
  };

  window.PokeThemeTokens = THEME_TOKENS;
})();
