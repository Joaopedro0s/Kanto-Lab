/* ==========================================================================
   monhunt.js
   Lógica do jogo MonHunt. Depende de pokeapi.js (window.PokeAPI),
   theme.js (window.PokeTheme) e sound.js (window.PokeSound), carregados
   antes deste arquivo em monhunt.html.
   ========================================================================== */

(function () {
  "use strict";

  const MAX_ATTEMPTS = 8;

  // Ícones do resultado final (checkmark = vitória, x = derrota).
  const ICON_WIN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const ICON_LOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  // ------------------------------------------------------------------
  // Estado da partida atual
  // ------------------------------------------------------------------
  const state = {
    difficultyKey: null,
    candidatePool: [], // [{id, name}]
    secret: null, // pokemonFull
    guesses: [], // [{full, results: {attr: {status,text,arrow}}}]
    activeAttributes: [],
    gameOver: false,
  };

  // ------------------------------------------------------------------
  // Referências de DOM
  // ------------------------------------------------------------------
  const el = {
    screenDifficulty: document.getElementById("screen-difficulty"),
    screenLoading: document.getElementById("screen-loading"),
    screenGame: document.getElementById("screen-game"),
    difficultyGrid: document.getElementById("difficulty-grid"),
    btnStart: document.getElementById("btn-start-monhunt"),
    btnChangeDifficulty: document.getElementById("btn-change-difficulty"),
    pillDifficulty: document.getElementById("pill-difficulty"),
    pillPool: document.getElementById("pill-pool"),
    attemptsRemaining: document.getElementById("attempts-remaining"),
    guessForm: document.getElementById("guess-form"),
    guessInput: document.getElementById("guess-input"),
    autocomplete: document.getElementById("autocomplete"),
    btnOpenList: document.getElementById("btn-open-list"),
    attemptsHeader: document.getElementById("attempts-header"),
    attemptsTable: document.getElementById("attempts-table"),
    modalList: document.getElementById("modal-list"),
    modalListClose: document.getElementById("modal-list-close"),
    modalListFilter: document.getElementById("modal-list-filter"),
    pokemonGrid: document.getElementById("pokemon-grid"),
    modalEnd: document.getElementById("modal-end"),
    endEmoji: document.getElementById("end-emoji"),
    endTitle: document.getElementById("modal-end-title"),
    endSubtitle: document.getElementById("end-subtitle"),
    secretReveal: document.getElementById("secret-reveal"),
    btnPlayAgain: document.getElementById("btn-play-again"),
    btnEndChangeDifficulty: document.getElementById("btn-end-change-difficulty"),
    toastRegion: document.getElementById("toast-region"),
  };

  let selectedDifficulty = null;

  // ------------------------------------------------------------------
  // Toast
  // ------------------------------------------------------------------
  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = "toast" + (type ? " " + type : "");
    toast.textContent = message;
    el.toastRegion.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // ------------------------------------------------------------------
  // Tela de dificuldade
  // ------------------------------------------------------------------
  function renderDifficultyGrid() {
    const diffs = Object.values(PokeAPI.DIFFICULTIES_MONHUNT);
    el.difficultyGrid.innerHTML = "";
    diffs.forEach((d) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "difficulty-card diff-" + d.key;
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", "false");
      card.innerHTML =
        "<h3><span class=\"diff-dot\" aria-hidden=\"true\"></span>" + d.pt + " (" + d.label + ")</h3>" +
        "<p>" + d.description + "</p>" +
        "<p class=\"text-muted\">Gerações " +
        d.generations.map((g) => PokeAPI.GEN_LABEL[g].split(" ")[0]).join("-") + "</p>";
      card.addEventListener("click", () => {
        selectedDifficulty = d.key;
        document.querySelectorAll("#difficulty-grid .difficulty-card").forEach((c) => {
          c.classList.remove("selected");
          c.setAttribute("aria-checked", "false");
        });
        card.classList.add("selected");
        card.setAttribute("aria-checked", "true");
        el.btnStart.disabled = false;
        el.btnStart.textContent = "Começar no modo " + d.pt;
        PokeSound.click();
      });
      el.difficultyGrid.appendChild(card);
    });
  }

  el.btnStart.addEventListener("click", () => {
    if (!selectedDifficulty) return;
    startNewGame(selectedDifficulty);
  });

  el.btnChangeDifficulty.addEventListener("click", showDifficultyScreen);
  el.btnEndChangeDifficulty.addEventListener("click", () => {
    closeModal(el.modalEnd);
    showDifficultyScreen();
  });

  function showDifficultyScreen() {
    el.screenDifficulty.style.display = "";
    el.screenLoading.style.display = "none";
    el.screenGame.style.display = "none";
    el.btnChangeDifficulty.style.display = "none";
  }

  // ------------------------------------------------------------------
  // Início de partida
  // ------------------------------------------------------------------
  async function startNewGame(difficultyKey) {
    state.difficultyKey = difficultyKey;
    state.guesses = [];
    state.gameOver = false;

    el.screenDifficulty.style.display = "none";
    el.screenGame.style.display = "none";
    el.screenLoading.style.display = "";
    el.btnChangeDifficulty.style.display = "";

    try {
      const diff = PokeAPI.DIFFICULTIES_MONHUNT[difficultyKey];
      const pool = await PokeAPI.buildMonHuntCandidatePool(difficultyKey);
      state.candidatePool = pool;

      const secretStub = pool[Math.floor(Math.random() * pool.length)];
      state.secret = await PokeAPI.getPokemonFull(secretStub.id);
      state.activeAttributes = PokeAPI.activeAttributesFor(diff, state.secret);

      renderPoolGrid();
      renderAttemptsHeader();
      el.attemptsTable.innerHTML = "";
      renderAttemptsRemaining();

      el.pillDifficulty.textContent = diff.pt + " · " + diff.label;
      el.pillPool.textContent = pool.length + " candidatos possíveis";

      el.screenLoading.style.display = "none";
      el.screenGame.style.display = "";
      el.guessInput.value = "";
      el.guessInput.focus();
    } catch (err) {
      console.error(err);
      el.screenLoading.style.display = "none";
      showDifficultyScreen();
      showToast("Não foi possível carregar dados da PokéAPI. Verifique sua conexão e tente novamente.", "error");
    }
  }

  function renderAttemptsHeader() {
    el.attemptsHeader.style.setProperty("--cols", state.activeAttributes.length);
    el.attemptsHeader.innerHTML =
      "<span></span>" +
      state.activeAttributes.map((a) => "<span>" + PokeAPI.ATTRIBUTE_META[a].label + "</span>").join("");
  }

  function renderAttemptsRemaining() {
    const used = state.guesses.length;
    el.attemptsRemaining.innerHTML = "";
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const dot = document.createElement("span");
      dot.className = "dot" + (i < used ? " used" : "");
      el.attemptsRemaining.appendChild(dot);
    }
  }

  // ------------------------------------------------------------------
  // Lista visual de candidatos (modal)
  // ------------------------------------------------------------------
  function renderPoolGrid(filterText) {
    const guessedIds = new Set(state.guesses.map((g) => g.full.id));
    const filter = (filterText || "").trim().toLowerCase();
    el.pokemonGrid.innerHTML = "";
    state.candidatePool
      .filter((p) => !filter || p.name.includes(filter))
      .forEach((p) => {
        const btn = document.createElement("button");
        btn.type = "button";
        if (guessedIds.has(p.id)) btn.classList.add("guessed");
        btn.innerHTML =
          '<img src="' + PokeAPI.simpleSpriteUrl(p.id) + '" alt="" loading="lazy" ' +
          "onerror=\"PokeAPI.handleSpriteError(this, " + p.id + ")\" />" +
          "<span>" + capitalize(p.name) + "</span>";
        btn.addEventListener("click", () => {
          closeModal(el.modalList);
          submitGuess(p.id);
        });
        el.pokemonGrid.appendChild(btn);
      });
  }

  el.btnOpenList.addEventListener("click", () => {
    renderPoolGrid(el.modalListFilter.value);
    openModal(el.modalList);
    el.modalListFilter.focus();
  });
  el.modalListClose.addEventListener("click", () => closeModal(el.modalList));
  el.modalListFilter.addEventListener("input", () => renderPoolGrid(el.modalListFilter.value));

  // ------------------------------------------------------------------
  // Autocomplete de busca livre
  // ------------------------------------------------------------------
  let highlightedIndex = -1;
  let currentMatches = [];

  function renderAutocomplete(matches) {
    currentMatches = matches;
    highlightedIndex = matches.length ? 0 : -1;
    if (!matches.length) {
      el.autocomplete.style.display = "none";
      el.autocomplete.innerHTML = "";
      return;
    }
    el.autocomplete.innerHTML = matches
      .map(
        (p, i) =>
          '<button type="button" data-id="' + p.id + '" class="' + (i === 0 ? "highlighted" : "") + '">' +
          '<img src="' + PokeAPI.simpleSpriteUrl(p.id) + '" alt="" onerror="PokeAPI.handleSpriteError(this, ' + p.id + ')" />' +
          "<span>" + capitalize(p.name) + "</span></button>"
      )
      .join("");
    el.autocomplete.style.display = "";
    el.autocomplete.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        el.guessInput.value = "";
        renderAutocomplete([]);
        submitGuess(parseInt(btn.dataset.id, 10));
      });
    });
  }

  el.guessInput.addEventListener("input", () => {
    const q = el.guessInput.value.trim().toLowerCase();
    if (!q) return renderAutocomplete([]);
    const matches = state.candidatePool.filter((p) => p.name.includes(q)).slice(0, 8);
    renderAutocomplete(matches);
  });

  el.guessInput.addEventListener("keydown", (e) => {
    if (!currentMatches.length) return;
    const buttons = [...el.autocomplete.querySelectorAll("button")];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, buttons.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
    } else {
      return;
    }
    buttons.forEach((b, i) => b.classList.toggle("highlighted", i === highlightedIndex));
    buttons[highlightedIndex].scrollIntoView({ block: "nearest" });
  });

  document.addEventListener("click", (e) => {
    if (!el.guessForm.contains(e.target)) renderAutocomplete([]);
  });

  el.guessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const typed = el.guessInput.value.trim().toLowerCase();
    if (!typed) return;

    if (highlightedIndex >= 0 && currentMatches[highlightedIndex]) {
      const chosen = currentMatches[highlightedIndex];
      el.guessInput.value = "";
      renderAutocomplete([]);
      submitGuess(chosen.id);
      return;
    }

    const exact = state.candidatePool.find((p) => p.name === typed);
    if (exact) {
      el.guessInput.value = "";
      renderAutocomplete([]);
      submitGuess(exact.id);
    } else {
      showToast("Esse Pokémon não está disponível nesta dificuldade. Use a lista ou tente outro nome.", "error");
      PokeSound.wrong();
    }
  });

  // ------------------------------------------------------------------
  // Envio de palpite
  // ------------------------------------------------------------------
  async function submitGuess(id) {
    if (state.gameOver) return;
    if (state.guesses.some((g) => g.full.id === id)) {
      showToast("Você já tentou esse Pokémon.", "error");
      return;
    }

    el.guessInput.disabled = true;
    let guessFull;
    try {
      guessFull = await PokeAPI.getPokemonFull(id);
    } catch (err) {
      console.error(err);
      showToast("Erro ao buscar dados desse Pokémon. Tente novamente.", "error");
      el.guessInput.disabled = false;
      return;
    }
    el.guessInput.disabled = false;

    const diff = PokeAPI.DIFFICULTIES_MONHUNT[state.difficultyKey];
    const results = {};
    let correctCount = 0;
    state.activeAttributes.forEach((attr) => {
      const r = PokeAPI.compareAttribute(attr, guessFull, state.secret, diff);
      results[attr] = r;
      if (r.status === "correct") correctCount++;
    });

    state.guesses.push({ full: guessFull, results });
    appendAttemptRow(guessFull, results);
    renderAttemptsRemaining();

    const isWin = guessFull.id === state.secret.id;

    if (isWin) {
      PokeSound.correct();
      setTimeout(() => PokeSound.win(), 250);
      state.gameOver = true;
      setTimeout(() => showEndScreen(true), 550);
    } else if (state.guesses.length >= MAX_ATTEMPTS) {
      PokeSound.wrong();
      setTimeout(() => PokeSound.lose(), 250);
      state.gameOver = true;
      setTimeout(() => showEndScreen(false), 550);
    } else if (correctCount > 0) {
      PokeSound.close();
    } else {
      PokeSound.wrong();
    }
  }

  function appendAttemptRow(guessFull, results) {
    const row = document.createElement("div");
    row.className = "attempt-row";
    row.style.setProperty("--cols", state.activeAttributes.length);

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.title = capitalize(guessFull.name);
    thumb.innerHTML =
      '<img src="' + PokeAPI.simpleSpriteUrl(guessFull.id) + '" alt="' + capitalize(guessFull.name) +
      '" onerror="PokeAPI.handleSpriteError(this, ' + guessFull.id + ')" />';
    row.appendChild(thumb);

    state.activeAttributes.forEach((attr) => {
      const r = results[attr];
      const cell = document.createElement("div");
      cell.className = "cell " + r.status;
      cell.innerHTML =
        '<span class="cell-label">' + PokeAPI.ATTRIBUTE_META[attr].label + "</span>" +
        "<span>" + r.text + "</span>" +
        (r.arrow ? '<span class="cell-arrow">' + r.arrow + "</span>" : "");
      row.appendChild(cell);
    });

    el.attemptsTable.prepend(row);
  }

  // ------------------------------------------------------------------
  // Fim de jogo
  // ------------------------------------------------------------------
  function showEndScreen(won) {
    el.endEmoji.className = "result-icon " + (won ? "win" : "lose");
    el.endEmoji.innerHTML = won ? ICON_WIN : ICON_LOSE;
    el.endTitle.textContent = won ? "Você acertou!" : "Não foi dessa vez!";
    el.endSubtitle.textContent = won
      ? "Descoberto em " + state.guesses.length + " de " + MAX_ATTEMPTS + " tentativas."
      : "O Pokémon secreto era:";

    el.secretReveal.innerHTML =
      '<img src="' + state.secret.sprite + '" alt="" onerror="this.src=\'' + state.secret.spriteFallback + "'\" />" +
      "<div><strong style=\"text-transform:capitalize;font-size:1.1rem;\">" + capitalize(state.secret.name) + "</strong>" +
      '<div class="text-muted">' + state.secret.types.map((t) => PokeAPI.TYPE_PT[t] || t).join(" / ") + "</div></div>";

    openModal(el.modalEnd);
  }

  el.btnPlayAgain.addEventListener("click", () => {
    closeModal(el.modalEnd);
    startNewGame(state.difficultyKey);
  });

  // ------------------------------------------------------------------
  // Utilidades de modal / texto
  // ------------------------------------------------------------------
  function openModal(modalEl) {
    modalEl.style.display = "flex";
  }
  function closeModal(modalEl) {
    modalEl.style.display = "none";
  }
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  function capitalize(str) {
    return str
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  PokeTheme.buildSwitcher(document.getElementById("header-actions"));
  renderDifficultyGrid();
})();
