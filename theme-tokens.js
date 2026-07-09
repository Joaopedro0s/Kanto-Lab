/* ==========================================================================
   theme-tokens.js
   Cada tema é um objeto JS com os "tokens" (cores, formas, tipografia).
   Estilo alvo: cartão de pergaminho com borda grossa arredondada, painel
   translúcido com borda dourada, cenário ilustrado (céu + grama) atrás de
   tudo — igual à referência que o usuário mandou, só que com cenário
   original (sem personagens de terceiros), já que os sprites individuais
   de Pokémon continuam vindo da PokéAPI como já eram.

   Trocar de tema = trocar qual chave deste objeto está ativa; css-engine.js
   lê o objeto e escreve/atualiza um <style> na página.
   ========================================================================== */

(function () {
  "use strict";

  const FONT_DISPLAY = "'Baloo 2', 'Segoe UI', cursive";
  const FONT_BODY = "'Nunito', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const THEME_TOKENS = {
    /* ------------------------------------------------------------------
       LIGHT — dia ensolarado: céu azul, grama viva, cards de pergaminho
       creme com borda verde-escura, painel navy translúcido com borda
       dourada (a mesma combinação da referência).
       ------------------------------------------------------------------ */
    light: {
      label: "Claro",
      swatch: "#3aa15c",

      bg: "#eef6ff",
      bgElevated: "#fffaf0",
      bgInset: "#f3ecd8",
      text: "#233326",
      textMuted: "#5c6a5e",
      border: "#d8dce6",
      borderStrong: "#2f5232",
      accent: "#e8a33d",
      accentContrast: "#2a1c05",
      accent2: "#3a86ff",

      colorCorrect: "#2fa84f", colorCorrectBg: "#c9f2d3",
      colorClose: "#e0a72e", colorCloseBg: "#fbe6b8",
      colorWrong: "#e8703f", colorWrongBg: "#fbd6c3",
      colorNeutral: "#9aa1b1", colorNeutralBg: "#e7e9f0",

      group1Bg: "#f6e6a1", group1Text: "#6b5900",
      group2Bg: "#a8dab5", group2Text: "#1c5c2e",
      group3Bg: "#a9c9f5", group3Text: "#1c3f7a",
      group4Bg: "#d5b3e8", group4Text: "#5a2578",

      shadow: "0 10px 26px rgba(35, 51, 38, 0.18)",
      radius: "14px",

      skyTop: "#6ec6ff",
      skyBottom: "#cfeaff",
      sunColor: "rgba(255, 244, 191, 0.9)",
      cloudColor: "rgba(255, 255, 255, 0.75)",
      grassTop: "#7bc36a",
      grassBottom: "#4e9a48",
      grassDetail: "rgba(45, 90, 40, 0.35)",
      sceneOpacity: "1",

      cardBg: "#fffaf0",
      cardBorder: "#2f5232",
      cardBorderWidth: "4px",
      cardRadius: "22px",
      cardShadow: "0 6px 0 0 #2f5232",

      panelBg: "rgba(23, 37, 58, 0.88)",
      panelBorder: "#e8a33d",
      panelBorderWidth: "4px",
      panelRadius: "26px",
      panelText: "#f5f1e6",
      panelTextMuted: "#c7d0d8",
      panelShadow: "0 14px 34px rgba(10, 16, 28, 0.35)",

      pillBg: "#2f5232",
      pillText: "#f5f1e6",
      pillBorder: "#1d3720",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       DARK — mesma cena, hora do entardecer/noite: céu em degradê roxo,
       grama mais escura, painel com borda em ciano.
       ------------------------------------------------------------------ */
    dark: {
      label: "Escuro",
      swatch: "#7fd6ff",

      bg: "#0f1420",
      bgElevated: "#1c2436",
      bgInset: "#232c42",
      text: "#eef0f8",
      textMuted: "#a7b0c2",
      border: "#34374d",
      borderStrong: "#7fd6ff",
      accent: "#ff9b5e",
      accentContrast: "#241202",
      accent2: "#7fd6ff",

      colorCorrect: "#4cd07d", colorCorrectBg: "#163526",
      colorClose: "#f0b93b", colorCloseBg: "#3a2f13",
      colorWrong: "#ff7a52", colorWrongBg: "#3a1c14",
      colorNeutral: "#6d7288", colorNeutralBg: "#22243354",

      group1Bg: "#4a3f0f", group1Text: "#f6e6a1",
      group2Bg: "#16401f", group2Text: "#a8dab5",
      group3Bg: "#1a3357", group3Text: "#a9c9f5",
      group4Bg: "#3c2050", group4Text: "#d5b3e8",

      shadow: "0 10px 28px rgba(0, 0, 0, 0.5)",
      radius: "14px",

      skyTop: "#141b33",
      skyBottom: "#2b3a63",
      sunColor: "rgba(210, 224, 255, 0.55)",
      cloudColor: "rgba(255, 255, 255, 0.08)",
      grassTop: "#1f3a2c",
      grassBottom: "#12241a",
      grassDetail: "rgba(0, 0, 0, 0.35)",
      sceneOpacity: "1",

      cardBg: "#1c2436",
      cardBorder: "#7fd6ff",
      cardBorderWidth: "4px",
      cardRadius: "22px",
      cardShadow: "0 6px 0 0 #10151f",

      panelBg: "rgba(12, 16, 28, 0.88)",
      panelBorder: "#7fd6ff",
      panelBorderWidth: "4px",
      panelRadius: "26px",
      panelText: "#eef0f8",
      panelTextMuted: "#a7b0c2",
      panelShadow: "0 14px 34px rgba(0, 0, 0, 0.55)",

      pillBg: "#2a3550",
      pillText: "#eef0f8",
      pillBorder: "#7fd6ff",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       COLORBLIND — mantém a cena, mas os tokens de feedback usam a
       paleta azul/laranja/cinza; painel com borda laranja bem saturada
       para ficar fácil de distinguir do fundo.
       ------------------------------------------------------------------ */
    colorblind: {
      label: "Amigável p/ daltônicos",
      swatch: "#005fa3",

      bg: "#f2f6fa",
      bgElevated: "#ffffff",
      bgInset: "#ececea",
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

      shadow: "0 10px 24px rgba(20, 20, 20, 0.16)",
      radius: "14px",

      skyTop: "#8fc7ea",
      skyBottom: "#e4eff7",
      sunColor: "rgba(255, 226, 168, 0.85)",
      cloudColor: "rgba(255, 255, 255, 0.8)",
      grassTop: "#8fae5a",
      grassBottom: "#5f7d3a",
      grassDetail: "rgba(40, 55, 20, 0.3)",
      sceneOpacity: "1",

      cardBg: "#ffffff",
      cardBorder: "#005fa3",
      cardBorderWidth: "4px",
      cardRadius: "22px",
      cardShadow: "0 6px 0 0 #003a5c",

      panelBg: "rgba(20, 26, 33, 0.9)",
      panelBorder: "#e08300",
      panelBorderWidth: "4px",
      panelRadius: "26px",
      panelText: "#ffffff",
      panelTextMuted: "#cfd6db",
      panelShadow: "0 14px 34px rgba(0, 0, 0, 0.4)",

      pillBg: "#003a5c",
      pillText: "#ffffff",
      pillBorder: "#e08300",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },

    /* ------------------------------------------------------------------
       HIGH CONTRAST — cenário desligado (ruído visual atrapalha quem
       mais precisa deste tema): fundo preto liso, cards e painel com
       bordas grossas em amarelo neon, máximo contraste de texto.
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

      shadow: "0 0 0 2px #4d4d4d",
      radius: "10px",

      skyTop: "#000000",
      skyBottom: "#000000",
      sunColor: "rgba(0,0,0,0)",
      cloudColor: "rgba(0,0,0,0)",
      grassTop: "#000000",
      grassBottom: "#000000",
      grassDetail: "rgba(0,0,0,0)",
      sceneOpacity: "0",

      cardBg: "#0d0d0d",
      cardBorder: "#ffd400",
      cardBorderWidth: "4px",
      cardRadius: "16px",
      cardShadow: "0 0 0 2px #ffd400",

      panelBg: "#000000",
      panelBorder: "#ffd400",
      panelBorderWidth: "4px",
      panelRadius: "18px",
      panelText: "#ffffff",
      panelTextMuted: "#cfcfcf",
      panelShadow: "0 0 0 2px #ffd400",

      pillBg: "#1a1a1a",
      pillText: "#ffd400",
      pillBorder: "#ffd400",

      fontDisplay: FONT_DISPLAY,
      fontBody: FONT_BODY,
    },
  };

  window.PokeThemeTokens = THEME_TOKENS;
})();
