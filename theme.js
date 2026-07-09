/* ==========================================================================
   theme.js
   Alterna entre os temas disponíveis (claro, escuro, daltônico, alto
   contraste). A preferência de tema é só uma preferência de interface,
   não é "progresso de jogo" — por isso é a única coisa que salvamos no
   localStorage. Nenhum dado de partida é salvo em lugar nenhum.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "pokegames.theme";

  const THEMES = [
    { id: "light", label: "Claro", swatch: "#f4f6fb" },
    { id: "dark", label: "Escuro", swatch: "#1c1e2b" },
    { id: "colorblind", label: "Amigável p/ daltônicos", swatch: "#005fa3" },
    { id: "high-contrast", label: "Alto contraste", swatch: "#ffd400" },
  ];

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveTheme(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      /* localStorage indisponível (modo privado etc.) — sem problema,
         o jogo funciona normalmente, só não lembra a escolha. */
    }
  }

  function applyTheme(id) {
    document.documentElement.setAttribute("data-theme", id);
    // css-engine.js é quem realmente pinta a página: injeta/atualiza o
    // <style> com as variáveis deste tema. Sem ele carregado, a troca de
    // atributo sozinha não muda mais nada (não há themes.css estático).
    if (window.PokeStyles) window.PokeStyles.setTheme(id);
    document.querySelectorAll("[data-theme-option]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.themeOption === id));
    });
  }

  function detectPreferredTheme() {
    const saved = getSavedTheme();
    if (saved && THEMES.some((t) => t.id === saved)) return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function buildSwitcher(mountPoint) {
    const details = document.createElement("details");
    details.className = "theme-switcher";

    const summary = document.createElement("summary");
    summary.innerHTML = '<span aria-hidden="true">🎨</span> Tema';
    details.appendChild(summary);

    const menu = document.createElement("div");
    menu.className = "theme-menu";
    menu.setAttribute("role", "menu");

    THEMES.forEach((theme) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.themeOption = theme.id;
      btn.setAttribute("role", "menuitemradio");
      btn.innerHTML =
        '<span class="theme-swatch" style="background:' + theme.swatch + '"></span>' +
        "<span>" + theme.label + "</span>";
      btn.addEventListener("click", () => {
        applyTheme(theme.id);
        saveTheme(theme.id);
        details.removeAttribute("open");
      });
      menu.appendChild(btn);
    });

    details.appendChild(menu);
    mountPoint.appendChild(details);

    document.addEventListener("click", (e) => {
      if (!details.contains(e.target)) details.removeAttribute("open");
    });

    // Sincroniza o "check" visual (aria-pressed) com o tema já aplicado,
    // já que applyTheme() rodou antes desses botões existirem.
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
  }

  // Aplica o tema o quanto antes (evita "flash" de tema errado)
  applyTheme(detectPreferredTheme());

  window.PokeTheme = { buildSwitcher, applyTheme, THEMES };
})();
