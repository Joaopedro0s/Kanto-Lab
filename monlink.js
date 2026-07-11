/* ==========================================================================
   monlink.js
   Lógica do jogo MonLink. Depende de pokeapi.js (window.PokeAPI),
   theme.js (window.PokeTheme) e sound.js (window.PokeSound).

   Como o jogo é montado: cada partida sorteia 4 "categorias" (tipo,
   geração, cor, habitat, ou algo mais sutil dependendo da dificuldade),
   busca os possíveis membros de cada uma na PokéAPI, e sorteia 4
   Pokémon de cada categoria para formar o tabuleiro de 16. Em Hard e
   Hardcore, deliberadamente colocamos 1-2 Pokémon que também pertencem
   a outra categoria do tabuleiro (mas só contam como corretos na
   categoria "dona") — são as armadilhas.
   ========================================================================== */

(function () {
  "use strict";

  // Ícones do resultado final (checkmark = vitória, x = derrota).
  const ICON_WIN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const ICON_LOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  const ALL_TYPES = Object.keys(PokeAPI.TYPE_PT);
  const ALL_COLORS = Object.keys(PokeAPI.COLOR_PT);
  const ALL_GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const GROUP_CLASSES = ["group-1", "group-2", "group-3", "group-4"];

  let allSpeciesByLetterCache = null;

  // ------------------------------------------------------------------
  // Geradores de categoria. Cada um devolve `null` (tenta outro tipo de
  // categoria) ou { key, title, pool:[{id,name}] }.
  // ------------------------------------------------------------------

  async function genType(usedKeys) {
    for (const t of PokeAPI.shuffle(ALL_TYPES)) {
      const key = "type:" + t;
      if (usedKeys.has(key)) continue;
      const pool = await PokeAPI.getTypeMembers(t);
      if (pool.length >= 4) return { key, title: "Tipo: " + PokeAPI.TYPE_PT[t], pool };
    }
    return null;
  }

  async function genGeneration(usedKeys) {
    for (const g of PokeAPI.shuffle(ALL_GENS)) {
      const key = "gen:" + g;
      if (usedKeys.has(key)) continue;
      const pool = await PokeAPI.getGenerationSpecies(g);
      if (pool.length >= 4) return { key, title: "Geração " + PokeAPI.GEN_LABEL[g], pool };
    }
    return null;
  }

  async function genColor(usedKeys) {
    for (const c of PokeAPI.shuffle(ALL_COLORS)) {
      const key = "color:" + c;
      if (usedKeys.has(key)) continue;
      const pool = await PokeAPI.getColorMembers(c);
      if (pool.length >= 4) return { key, title: "Cor: " + PokeAPI.COLOR_PT[c], pool };
    }
    return null;
  }

  async function genStarter(usedKeys) {
    const options = [
      ["starterGrass", "Iniciantes do tipo Planta"],
      ["starterFire", "Iniciantes do tipo Fogo"],
      ["starterWater", "Iniciantes do tipo Água"],
    ];
    for (const [curatedKey, title] of PokeAPI.shuffle(options)) {
      const key = "starter:" + curatedKey;
      if (usedKeys.has(key)) continue;
      const pool = await PokeAPI.resolveSpeciesIds(PokeAPI.curatedList(curatedKey));
      if (pool.length >= 4) return { key, title, pool };
    }
    return null;
  }

  async function genEeveelutions(usedKeys) {
    const key = "eeveelutions";
    if (usedKeys.has(key)) return null;
    const pool = await PokeAPI.resolveSpeciesIds(PokeAPI.curatedList("eeveelutions"));
    return pool.length >= 4 ? { key, title: "Evoluções de Eevee", pool } : null;
  }

  async function genPseudo(usedKeys) {
    const key = "pseudo";
    if (usedKeys.has(key)) return null;
    const pool = await PokeAPI.resolveSpeciesIds(PokeAPI.curatedList("pseudoLegendaries"));
    return pool.length >= 4 ? { key, title: "Pseudolendários (forma final)", pool } : null;
  }

  async function genLegendary(usedKeys) {
    const key = "legendary";
    if (usedKeys.has(key)) return null;
    const pool = await PokeAPI.resolveSpeciesIds(PokeAPI.curatedList("legendary"));
    return pool.length >= 4 ? { key, title: "Lendários e Míticos", pool } : null;
  }

  let allSpeciesFlatCache = null;
  async function getAllSpeciesFlat() {
    if (!allSpeciesFlatCache) {
      allSpeciesFlatCache = PokeAPI.dedupeById(await PokeAPI.getSpeciesForGenerations(ALL_GENS));
    }
    return allSpeciesFlatCache;
  }

  async function getAllSpeciesByLetter() {
    if (allSpeciesByLetterCache) return allSpeciesByLetterCache;
    const all = await getAllSpeciesFlat();
    const byLetter = new Map();
    all.forEach((p) => {
      const letter = p.name.charAt(0);
      if (!byLetter.has(letter)) byLetter.set(letter, []);
      byLetter.get(letter).push(p);
    });
    allSpeciesByLetterCache = byLetter;
    return byLetter;
  }

  async function genLetter(usedKeys) {
    const byLetter = await getAllSpeciesByLetter();
    const letters = PokeAPI.shuffle([...byLetter.keys()].filter((l) => byLetter.get(l).length >= 4));
    for (const letter of letters) {
      const key = "letter:" + letter;
      if (usedKeys.has(key)) continue;
      return { key, title: 'Nome começa com "' + letter.toUpperCase() + '"', pool: byLetter.get(letter) };
    }
    return null;
  }

  const EFFECT_BUCKETS = [
    { key: "4x", mult: 4, title: (t) => "Toma 4x de " + PokeAPI.TYPE_PT[t] },
    { key: "2x", mult: 2, title: (t) => "Toma 2x de " + PokeAPI.TYPE_PT[t] },
    { key: "0.5x", mult: 0.5, title: (t) => "Toma 0.5x de " + PokeAPI.TYPE_PT[t] },
    { key: "0.25x", mult: 0.25, title: (t) => "Toma 0.25x de " + PokeAPI.TYPE_PT[t] },
    { key: "0x", mult: 0, title: (t) => "Não é afetado por " + PokeAPI.TYPE_PT[t] },
  ];

  function effectBucketKeyFor(mult) {
    const found = EFFECT_BUCKETS.find((b) => b.mult === mult);
    return found ? found.key : null;
  }

  // Sorteia um tipo atacante e busca, numa amostra de Pokémon (que pode
  // ter tipo duplo), quantos tomam exatamente 4x/2x/0.5x/0.25x ou não
  // são afetados por aquele tipo — combinando os multiplicadores dos
  // dois tipos do Pokémon quando aplicável (ex: Scizor Aço/Inseto toma
  // 4x de Fogo porque os dois tipos são fracos contra Fogo).
  async function genTypeEffectiveness(usedKeys) {
    const allSpecies = await getAllSpeciesFlat();
    for (const atk of PokeAPI.shuffle(ALL_TYPES)) {
      const sampleList = PokeAPI.sample(allSpecies, 90);
      const fulls = await Promise.all(sampleList.map((p) => PokeAPI.getPokemonFull(p.id).catch(() => null)));
      const buckets = { "4x": [], "2x": [], "0.5x": [], "0.25x": [], "0x": [] };
      fulls.filter(Boolean).forEach((p) => {
        const mult = PokeAPI.typeEffectivenessMultiplier(atk, p.types);
        const bucketKey = effectBucketKeyFor(mult);
        if (bucketKey) buckets[bucketKey].push({ id: p.id, name: p.name });
      });
      for (const bucket of PokeAPI.shuffle(EFFECT_BUCKETS)) {
        const key = "typeEffect:" + atk + ":" + bucket.key;
        if (usedKeys.has(key) || buckets[bucket.key].length < 4) continue;
        return { key, title: bucket.title(atk), pool: buckets[bucket.key] };
      }
    }
    return null;
  }

  const GENERATOR_FUNCS = {
    type: genType,
    generation: genGeneration,
    color: genColor,
    typeEffect: genTypeEffectiveness,
    starter: genStarter,
    eeveelutions: genEeveelutions,
    pseudo: genPseudo,
    legendary: genLegendary,
    letter: genLetter,
  };

  // ------------------------------------------------------------------
  // Montagem do tabuleiro
  // ------------------------------------------------------------------
  async function buildCategories(diff) {
    const usedKeys = new Set();
    const categories = [];
    let attempts = 0;
    while (categories.length < 4 && attempts < 100) {
      attempts++;
      const kind = diff.generators[Math.floor(Math.random() * diff.generators.length)];
      try {
        const cat = await GENERATOR_FUNCS[kind](usedKeys);
        if (cat) {
          usedKeys.add(cat.key);
          categories.push(cat);
        }
      } catch (err) {
        console.error("Falha ao gerar categoria (" + kind + "):", err);
      }
    }
    if (categories.length < 4) {
      throw new Error("Não foi possível montar 4 categorias com dados suficientes.");
    }
    return categories;
  }

  function computeIntersections(categories) {
    const result = [];
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const idsB = new Set(categories[j].pool.map((p) => p.id));
        const inter = categories[i].pool.filter((p) => idsB.has(p.id));
        if (inter.length) result.push({ i, j, inter });
      }
    }
    return result;
  }

  function assignMembers(categories, trapOverlaps) {
    const usedIds = new Set();
    const forced = categories.map(() => []);

    if (trapOverlaps > 0) {
      const pairs = PokeAPI.shuffle(computeIntersections(categories));
      let placed = 0;
      for (const pair of pairs) {
        if (placed >= trapOverlaps) break;
        const candidates = pair.inter.filter((p) => !usedIds.has(p.id));
        if (!candidates.length) continue;
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const ownerIdx = Math.random() < 0.5 ? pair.i : pair.j;
        forced[ownerIdx].push(chosen);
        usedIds.add(chosen.id);
        placed++;
      }
    }

    const board = [];
    for (let idx = 0; idx < categories.length; idx++) {
      const cat = categories[idx];
      const already = forced[idx];
      const eligible = cat.pool.filter((p) => !usedIds.has(p.id));
      const need = 4 - already.length;
      const picked = PokeAPI.sample(eligible, need);
      if (picked.length < need) return null; // categoria ficou sem membros suficientes — quem chamou tenta de novo
      picked.forEach((p) => usedIds.add(p.id));
      [...already, ...picked].forEach((m) => board.push({ id: m.id, name: m.name, categoryIndex: idx }));
    }
    return board;
  }

  async function generateBoard(difficultyKey) {
    const diff = PokeAPI.DIFFICULTIES_MONLINK[difficultyKey];
    for (let attempt = 0; attempt < 4; attempt++) {
      const categories = await buildCategories(diff);
      const board = assignMembers(categories, diff.trapOverlaps);
      if (board && board.length === 16) {
        return { categories, board: PokeAPI.shuffle(board) };
      }
    }
    throw new Error("Não foi possível montar o tabuleiro. Tente novamente.");
  }

  // ------------------------------------------------------------------
  // Estado + DOM
  // ------------------------------------------------------------------
  const state = {
    difficultyKey: null,
    diff: null,
    categories: [],
    board: [],
    lives: 0,
    livesUsed: 0,
    solved: new Set(),
    selected: new Set(),
    gameOver: false,
  };

  const el = {
    screenDifficulty: document.getElementById("screen-difficulty"),
    screenLoading: document.getElementById("screen-loading"),
    loadingText: document.getElementById("loading-text"),
    screenGame: document.getElementById("screen-game"),
    difficultyGrid: document.getElementById("difficulty-grid"),
    btnStart: document.getElementById("btn-start-connection"),
    btnChangeDifficulty: document.getElementById("btn-change-difficulty"),
    pillDifficulty: document.getElementById("pill-difficulty"),
    livesRow: document.getElementById("lives-row"),
    grid: document.getElementById("connection-grid"),
    btnDeselect: document.getElementById("btn-deselect"),
    selectionHint: document.getElementById("selection-hint"),
    modalEnd: document.getElementById("modal-end"),
    endEmoji: document.getElementById("end-emoji"),
    endTitle: document.getElementById("modal-end-title"),
    endSubtitle: document.getElementById("end-subtitle"),
    endGroups: document.getElementById("end-groups"),
    btnPlayAgain: document.getElementById("btn-play-again"),
    btnEndChangeDifficulty: document.getElementById("btn-end-change-difficulty"),
    toastRegion: document.getElementById("toast-region"),
  };

  let selectedDifficulty = null;

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = "toast" + (type ? " " + type : "");
    toast.textContent = message;
    el.toastRegion.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function capitalize(str) {
    return str.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  }

  // ------------------------------------------------------------------
  // Tela de dificuldade
  // ------------------------------------------------------------------
  function renderDifficultyGrid() {
    const diffs = Object.values(PokeAPI.DIFFICULTIES_MONLINK);
    el.difficultyGrid.innerHTML = "";
    diffs.forEach((d) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "difficulty-card diff-" + d.key;
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", "false");
      card.innerHTML =
        "<h3><span class=\"diff-dot\" aria-hidden=\"true\"></span>" + d.pt + " (" + d.label + ")</h3>" +
        "<p>" + d.lives + " vidas · categorias " + (d.trapOverlaps > 0 ? "com armadilhas" : "diretas") + "</p>";
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
    if (selectedDifficulty) startNewGame(selectedDifficulty);
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
    state.diff = PokeAPI.DIFFICULTIES_MONLINK[difficultyKey];
    state.lives = state.diff.lives;
    state.livesUsed = 0;
    state.solved = new Set();
    state.selected = new Set();
    state.gameOver = false;

    el.screenDifficulty.style.display = "none";
    el.screenGame.style.display = "none";
    el.screenLoading.style.display = "";
    el.btnChangeDifficulty.style.display = "";
    el.loadingText.textContent = "Montando categorias e sorteando os 16 Pokémon…";

    try {
      const { categories, board } = await generateBoard(difficultyKey);
      state.categories = categories;
      state.board = board;

      el.pillDifficulty.textContent = state.diff.pt + " · " + state.diff.label;
      renderLives();
      renderGrid();
      updateSelectionUI();

      el.screenLoading.style.display = "none";
      el.screenGame.style.display = "";
    } catch (err) {
      console.error(err);
      el.screenLoading.style.display = "none";
      showDifficultyScreen();
      showToast("Não foi possível montar a partida agora. Verifique sua conexão e tente de novo.", "error");
    }
  }

  function renderLives() {
    el.livesRow.innerHTML = "";
    for (let i = 0; i < state.diff.lives; i++) {
      const span = document.createElement("span");
      span.className = "heart" + (i < state.livesUsed ? " lost" : "");
      span.textContent = "♥";
      span.setAttribute("aria-hidden", "true");
      el.livesRow.appendChild(span);
    }
    const label = document.createElement("span");
    label.className = "visually-hidden";
    label.textContent = state.diff.lives - state.livesUsed + " vidas restantes de " + state.diff.lives;
    el.livesRow.appendChild(label);
  }

  // Nó invisível (display:none, não participa do layout do grid) que
  // serve só de referência: tudo que já foi resolvido é inserido sempre
  // "antes" dele, então ele vai afundando naturalmente pro fim da zona
  // já resolvida — sem precisar calcular índice/linha manualmente (o
  // cálculo antigo quebrava depois da 1ª categoria virar uma barra
  // única, porque ela passa a ocupar 1 posição no DOM em vez de 4).
  let solvedAnchor = null;

  function renderGrid() {
    el.grid.innerHTML = "";
    solvedAnchor = document.createElement("div");
    solvedAnchor.style.display = "none";
    el.grid.appendChild(solvedAnchor);
    state.board.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "conn-tile";
      btn.dataset.id = item.id;
      btn.innerHTML =
        '<img src="' + PokeAPI.simpleSpriteUrl(item.id) + '" alt="" ' +
        "onerror=\"PokeAPI.handleSpriteError(this, " + item.id + ")\" />" +
        "<span>" + capitalize(item.name) + "</span>";
      btn.addEventListener("click", () => onTileClick(item, btn));
      el.grid.appendChild(btn);
    });
  }

  function onTileClick(item, btn) {
    if (state.gameOver || btn.classList.contains("solved")) return;

    if (state.selected.has(item.id)) {
      state.selected.delete(item.id);
      btn.classList.remove("selected");
      PokeSound.click();
      updateSelectionUI();
      return;
    }

    if (state.selected.size >= 4) return;

    state.selected.add(item.id);
    btn.classList.add("selected");
    PokeSound.select();
    updateSelectionUI();

    if (state.selected.size === 4) {
      setTimeout(() => evaluateSelection(), 300);
    }
  }

  function updateSelectionUI() {
    el.btnDeselect.disabled = state.selected.size === 0;
    el.selectionHint.textContent =
      state.selected.size === 0
        ? "Selecione 4 Pokémon — a validação acontece assim que você escolhe o 4º."
        : "Selecionados: " + state.selected.size + "/4";
  }

  el.btnDeselect.addEventListener("click", () => {
    state.selected.forEach((id) => {
      const btn = el.grid.querySelector('[data-id="' + id + '"]');
      if (btn) btn.classList.remove("selected");
    });
    state.selected.clear();
    updateSelectionUI();
    PokeSound.click();
  });

  // ------------------------------------------------------------------
  // Validação do grupo selecionado
  // ------------------------------------------------------------------
  function evaluateSelection() {
    // Se o jogador desmarcou algum Pokémon durante a pequena pausa antes
    // da validação (ver setTimeout em onTileClick), não valida nada —
    // ele evidentemente mudou de ideia antes da checagem acontecer.
    if (state.gameOver || state.selected.size !== 4) return;
    const ids = [...state.selected];
    const items = ids.map((id) => state.board.find((b) => b.id === id));
    const categoryIndex = items[0].categoryIndex;
    const allSameCategory = items.every((it) => it.categoryIndex === categoryIndex);

    if (allSameCategory) {
      lockGroup(categoryIndex, items);
    } else {
      failSelection(ids);
    }
  }

  function lockGroup(categoryIndex, items) {
    PokeSound.lockIn();
    state.solved.add(categoryIndex);
    const groupClass = GROUP_CLASSES[categoryIndex % GROUP_CLASSES.length];
    const cat = state.categories[categoryIndex];

    animateGroupSolve(items, groupClass, cat);

    state.selected.clear();
    updateSelectionUI();
  }

  // Anima o grupo acertado: 1) desliza as 4 células até formarem uma
  // linha contígua logo após a zona já resolvida (técnica FLIP — grava
  // a posição antes de mover no DOM, depois anima do ponto antigo até o
  // novo); 2) pinta as células com a cor do grupo com um "pop"; 3) funde
  // as 4 em uma única barra colorida ocupando a linha toda, com o nome
  // da categoria.
  function animateGroupSolve(items, groupClass, cat) {
    const ids = items.map((it) => it.id);
    const tileEls = ids.map((id) => el.grid.querySelector('[data-id="' + id + '"]')).filter(Boolean);
    if (tileEls.length !== 4) return; // segurança: se algo não bateu, não quebra o jogo

    const firstRects = tileEls.map((t) => t.getBoundingClientRect());

    // Move as 4 células pra logo antes do marcador — ele fica sempre
    // "afundando" pro fim da zona já resolvida, então isso sempre
    // encaixa certo, não importa quantas categorias já viraram barra.
    tileEls.forEach((t) => el.grid.insertBefore(t, solvedAnchor));

    requestAnimationFrame(() => {
      tileEls.forEach((t, i) => {
        const last = t.getBoundingClientRect();
        const dx = firstRects[i].left - last.left;
        const dy = firstRects[i].top - last.top;
        t.style.transition = "none";
        t.style.transform = "translate(" + dx + "px, " + dy + "px)";
      });
      requestAnimationFrame(() => {
        tileEls.forEach((t) => {
          t.style.transition = "transform .42s cubic-bezier(.22,.9,.3,1.1)";
          t.style.transform = "";
        });
      });
    });

    tileEls.forEach((t, i) => {
      setTimeout(() => {
        t.classList.add("solved", "solve-pop");
        t.style.background = "var(--" + groupClass + "-bg)";
        t.style.color = "var(--" + groupClass + "-text)";
        t.style.borderColor = "transparent";
        t.disabled = true;
        t.style.transition = "";
        t.style.transform = "";
        PokeSound.click();
      }, 440 + i * 70);
    });

    setTimeout(() => {
      mergeIntoBanner(tileEls, groupClass, cat);
      if (state.solved.size === 4) {
        state.gameOver = true;
        setTimeout(() => showEndScreen(true), 700);
      }
    }, 1180);
  }

  // Substitui as 4 células individuais por uma única barra colorida que
  // ocupa a linha inteira, mostrando o nome da categoria e os 4 Pokémon
  // lado a lado — como uma "linha conectada".
  function mergeIntoBanner(tileEls, groupClass, cat) {
    const anchor = tileEls[0];
    if (!anchor || !anchor.parentNode) return;

    const banner = document.createElement("div");
    banner.className = "conn-row-merged";
    banner.style.background = "var(--" + groupClass + "-bg)";
    banner.style.color = "var(--" + groupClass + "-text)";
    banner.innerHTML =
      '<div class="merged-title-row"><span class="merged-title">' + cat.title + "</span></div>" +
      '<div class="merged-members">' +
      tileEls.map((t) => '<div class="merged-member">' + t.innerHTML + "</div>").join("") +
      "</div>";

    anchor.parentNode.insertBefore(banner, anchor);
    tileEls.forEach((t) => t.remove());
  }

  function failSelection(ids) {
    PokeSound.wrong();
    ids.forEach((id) => {
      const btn = el.grid.querySelector('[data-id="' + id + '"]');
      if (btn) {
        btn.classList.add("shake");
        setTimeout(() => btn.classList.remove("shake"), 420);
      }
    });

    state.livesUsed++;
    renderLives();

    state.selected.forEach((id) => {
      const btn = el.grid.querySelector('[data-id="' + id + '"]');
      if (btn) btn.classList.remove("selected");
    });
    state.selected.clear();
    updateSelectionUI();

    if (state.livesUsed >= state.diff.lives) {
      state.gameOver = true;
      setTimeout(() => showEndScreen(false), 500);
    } else {
      showToast("Esse grupo não está certo. Vidas restantes: " + (state.diff.lives - state.livesUsed) + ".", "error");
    }
  }

  // ------------------------------------------------------------------
  // Fim de jogo
  // ------------------------------------------------------------------
  function showEndScreen(won) {
    PokeSound[won ? "win" : "lose"]();
    el.endEmoji.className = "result-icon " + (won ? "win" : "lose");
    el.endEmoji.innerHTML = won ? ICON_WIN : ICON_LOSE;
    el.endTitle.textContent = won ? "Você conectou tudo!" : "Suas vidas acabaram!";
    el.endSubtitle.textContent = won
      ? "Todas as 4 categorias encontradas."
      : "Veja abaixo quais eram as categorias escondidas.";

    el.endGroups.innerHTML = "";
    state.categories.forEach((cat, idx) => {
      const groupClass = GROUP_CLASSES[idx % GROUP_CLASSES.length];
      const members = state.board.filter((b) => b.categoryIndex === idx);
      const banner = document.createElement("div");
      banner.className = "solved-group";
      banner.style.background = "var(--" + groupClass + "-bg)";
      banner.style.color = "var(--" + groupClass + "-text)";
      const tag = state.solved.has(idx) ? " ✓" : "";
      banner.innerHTML =
        '<span class="group-title">' + cat.title + tag + "</span>" +
        '<span class="group-members">' + members.map((i) => capitalize(i.name)).join(", ") + "</span>";
      el.endGroups.appendChild(banner);
    });

    openModal(el.modalEnd);
  }

  el.btnPlayAgain.addEventListener("click", () => {
    closeModal(el.modalEnd);
    startNewGame(state.difficultyKey);
  });

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

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  PokeTheme.buildSwitcher(document.getElementById("header-actions"));
  renderDifficultyGrid();
})();