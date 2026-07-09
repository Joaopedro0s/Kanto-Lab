/* ==========================================================================
   pokeapi.js
   Módulo central de dados. TUDO que envolve a PokéAPI mora aqui, para que
   monhunt.js e monlink.js só precisem chamar funções prontas.

   Como não geramos um arquivo de dados fixo, os dois jogos buscam tudo
   direto da PokéAPI (https://pokeapi.co) em tempo real, no navegador do
   jogador. Para isso não ficar lento:
     - Guardamos em memória (cache) tudo que já foi buscado nesta sessão.
     - Para listar candidatos por dificuldade, usamos /generation/{n} e
       /type/{nome}, que devolvem listas prontas (sem precisar buscar
       pokémon um por um).
     - Só buscamos os dados COMPLETOS (tipo, altura, peso, evolução...) do
       pokémon secreto e dos pokémons que o jogador realmente chuta.
     - As imagens (sprites) têm URL previsível, então nunca precisamos de
       uma requisição só para descobrir a imagem.
   ========================================================================== */

(function () {
  "use strict";

  const API = "https://pokeapi.co/api/v2";

  // --------------------------------------------------------------------
  // Cache simples em memória (dura enquanto a aba estiver aberta).
  // Nada aqui é salvo entre sessões — é só pra não repetir requisições
  // dentro da MESMA partida/visita.
  // --------------------------------------------------------------------
  const cache = {
    json: new Map(), // url -> Promise<json>
    generation: new Map(), // numero -> Promise<[{id,name}]>
    type: new Map(), // nome -> Promise<[{id,name}]>
    pokemonFull: new Map(), // id -> Promise<pokemonFull>
    evoChain: new Map(), // chainUrl -> Promise<Map(name -> {stage, totalStages})>
    entityList: new Map(), // "kind/name" -> Promise<[{id,name}]>
  };

  function fetchJSON(url) {
    if (cache.json.has(url)) return cache.json.get(url);
    const promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar " + url + " (" + res.status + ")");
        return res.json();
      })
      .catch((err) => {
        cache.json.delete(url); // permite tentar de novo numa próxima chamada
        throw err;
      });
    cache.json.set(url, promise);
    return promise;
  }

  function idFromUrl(url) {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : null;
  }

  // --------------------------------------------------------------------
  // Sprites — montamos a URL direto, sem precisar de requisição.
  // --------------------------------------------------------------------
  const SPRITES_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
  // Nota: usamos %22 no lugar de aspas literais porque esta string é
  // inserida dentro de um atributo HTML (onerror="...") que também usa
  // aspas duplas — aspas literais aqui quebrariam o atributo.
  const PLACEHOLDER_SPRITE =
    "data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>" +
    "<circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%23e63946%22 stroke=%22%23222%22 stroke-width=%224%22/>" +
    "<path d=%22M5 50H95%22 stroke=%22%23222%22 stroke-width=%226%22/>" +
    "<circle cx=%2250%22 cy=%2250%22 r=%2214%22 fill=%22white%22 stroke=%22%23222%22 stroke-width=%225%22/>" +
    "</svg>";

  function officialArtworkUrl(id) {
    return SPRITES_BASE + "/other/official-artwork/" + id + ".png";
  }
  function simpleSpriteUrl(id) {
    return SPRITES_BASE + "/" + id + ".png";
  }

  // --------------------------------------------------------------------
  // Fallback de sprite — a CDN do GitHub (raw.githubusercontent.com) às
  // vezes falha em requisições isoladas quando várias imagens são
  // pedidas de uma vez (ex.: os 16 tiles do MonLink). Em vez de já
  // cair direto no ícone de pokébola genérico, tentamos uma segunda URL
  // (o artwork oficial, hospedado no mesmo repo mas em outro caminho)
  // antes de desistir. Chamado via onerror="PokeAPI.handleSpriteError(this, id)".
  // --------------------------------------------------------------------
  function handleSpriteError(imgEl, id) {
    if (!imgEl.dataset.retried) {
      imgEl.dataset.retried = "1";
      imgEl.src = officialArtworkUrl(id);
    } else {
      imgEl.src = PLACEHOLDER_SPRITE;
    }
  }

  // --------------------------------------------------------------------
  // Traduções (a PokéAPI não tem português nos campos que usamos aqui)
  // --------------------------------------------------------------------
  const TYPE_PT = {
    normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico",
    grass: "Planta", ice: "Gelo", fighting: "Lutador", poison: "Venenoso",
    ground: "Terrestre", flying: "Voador", psychic: "Psíquico", bug: "Inseto",
    rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio",
    steel: "Aço", fairy: "Fada",
  };

  const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
    grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
  };

  const COLOR_PT = {
    black: "Preto", blue: "Azul", brown: "Marrom", gray: "Cinza",
    green: "Verde", pink: "Rosa", purple: "Roxo", red: "Vermelho",
    white: "Branco", yellow: "Amarelo",
  };
  const COLOR_SWATCH = {
    black: "#3a3a3a", blue: "#4a90e2", brown: "#8b5a2b", gray: "#9aa0a6",
    green: "#4caf50", pink: "#f48fb1", purple: "#9b59b6", red: "#e74c3c",
    white: "#f2f2f2", yellow: "#f5d13d",
  };
  const COLOR_FAMILY = {
    red: "quente", pink: "quente", yellow: "quente", brown: "quente",
    blue: "frio", green: "frio", purple: "frio",
    black: "neutro", white: "neutro", gray: "neutro",
  };

  const HABITAT_PT = {
    cave: "Caverna", forest: "Floresta", grassland: "Campo", mountain: "Montanha",
    rare: "Raro", "rough-terrain": "Terreno acidentado", sea: "Mar", urban: "Urbano",
    "waters-edge": "Beira d'água",
  };
  const HABITAT_FAMILY = {
    sea: "aquatico", "waters-edge": "aquatico",
    forest: "fechado", cave: "fechado", mountain: "fechado", "rough-terrain": "fechado",
    grassland: "aberto", urban: "aberto",
    rare: "raro",
  };

  const GEN_ROMAN = {
    "generation-i": 1, "generation-ii": 2, "generation-iii": 3, "generation-iv": 4,
    "generation-v": 5, "generation-vi": 6, "generation-vii": 7, "generation-viii": 8,
    "generation-ix": 9,
  };
  const GEN_LABEL = {
    1: "I (Kanto)", 2: "II (Johto)", 3: "III (Hoenn)", 4: "IV (Sinnoh)",
    5: "V (Unova)", 6: "VI (Kalos)", 7: "VII (Alola)", 8: "VIII (Galar)",
    9: "IX (Paldea)",
  };

  const STAGE_LABEL = { 1: "Base", 2: "Intermediário", 3: "Final" };

  // --------------------------------------------------------------------
  // Listas por geração / tipo (leves — não buscam detalhe por pokémon)
  // --------------------------------------------------------------------
  function getGenerationSpecies(genNumber) {
    if (cache.generation.has(genNumber)) return cache.generation.get(genNumber);
    const promise = fetchJSON(API + "/generation/" + genNumber).then((data) =>
      data.pokemon_species.map((s) => ({ id: idFromUrl(s.url), name: s.name }))
    );
    cache.generation.set(genNumber, promise);
    return promise;
  }

  async function getSpeciesForGenerations(genNumbers) {
    const lists = await Promise.all(genNumbers.map(getGenerationSpecies));
    return lists.flat();
  }

  const FORM_EXCLUDE_PATTERN = /-(mega|gmax|totem|primal|alola|galar|hisui|paldea|eternamax|crowned|therian|zen|busted|complete)/;

  // Endpoints "de entidade" da PokéAPI (cor, habitat, grupo-ovo...) seguem
  // todos o mesmo formato de /generation: devolvem uma lista pronta de
  // pokemon_species, então nunca precisamos buscar pokémon um a um só
  // para montar essas listas.
  function getEntitySpeciesList(kind, name) {
    const key = kind + "/" + name;
    if (cache.entityList.has(key)) return cache.entityList.get(key);
    const promise = fetchJSON(API + "/" + kind + "/" + name).then((data) =>
      data.pokemon_species.map((s) => ({ id: idFromUrl(s.url), name: s.name }))
    );
    cache.entityList.set(key, promise);
    return promise;
  }
  const getColorMembers = (name) => getEntitySpeciesList("pokemon-color", name);
  const getHabitatMembers = (name) => getEntitySpeciesList("pokemon-habitat", name);

  // Resolve uma lista de nomes (das listas curadas) para {id, name},
  // usando o endpoint de espécie (leve, sem flavor text). Cacheado por
  // nome via fetchJSON, então só custa caro na primeira vez que a
  // categoria correspondente é sorteada.
  function resolveSpeciesIds(names) {
    return Promise.all(
      names.map((name) =>
        fetchJSON(API + "/pokemon-species/" + name)
          .then((d) => ({ id: d.id, name: d.name }))
          // Se um nome individual falhar (offline, nome desatualizado etc.),
          // não derruba a lista inteira — só ignora esse item.
          .catch(() => null)
      )
    ).then((list) => list.filter(Boolean));
  }

  function getTypeMembers(typeName) {
    if (cache.type.has(typeName)) return cache.type.get(typeName);
    const promise = fetchJSON(API + "/type/" + typeName).then((data) =>
      data.pokemon
        .map((p) => ({ id: idFromUrl(p.pokemon.url), name: p.pokemon.name }))
        .filter((p) => p.id < 10000 && !FORM_EXCLUDE_PATTERN.test(p.name))
    );
    cache.type.set(typeName, promise);
    return promise;
  }

  // --------------------------------------------------------------------
  // Cadeia evolutiva -> mapa nome -> {stage, totalStages}
  // --------------------------------------------------------------------
  function walkChain(node, stage, map) {
    map.set(node.species.name, stage);
    (node.evolves_to || []).forEach((child) => walkChain(child, stage + 1, map));
  }

  function getEvolutionStageMap(chainUrl) {
    if (cache.evoChain.has(chainUrl)) return cache.evoChain.get(chainUrl);
    const promise = fetchJSON(chainUrl).then((data) => {
      const map = new Map();
      walkChain(data.chain, 1, map);
      const total = Math.max(...map.values());
      const result = new Map();
      map.forEach((stage, name) => result.set(name, { stage, totalStages: total }));
      return result;
    });
    cache.evoChain.set(chainUrl, promise);
    return promise;
  }

  // --------------------------------------------------------------------
  // Dados completos de um pokémon (tipo, altura, peso, geração, habitat,
  // cor, estágio evolutivo...). Buscado sob demanda e cacheado por id.
  // --------------------------------------------------------------------
  async function getPokemonFull(id) {
    if (cache.pokemonFull.has(id)) return cache.pokemonFull.get(id);

    const promise = (async () => {
      const [pokemon, species] = await Promise.all([
        fetchJSON(API + "/pokemon/" + id),
        fetchJSON(API + "/pokemon-species/" + id),
      ]);

      const evoMap = await getEvolutionStageMap(species.evolution_chain.url);
      const stageInfo = evoMap.get(species.name) || { stage: 1, totalStages: 1 };

      return {
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
        heightM: pokemon.height / 10,
        weightKg: pokemon.weight / 10,
        generation: GEN_ROMAN[species.generation.name] || null,
        habitat: species.habitat ? species.habitat.name : null,
        color: species.color ? species.color.name : null,
        stage: stageInfo.stage,
        totalStages: stageInfo.totalStages,
        isLegendary: species.is_legendary,
        isMythical: species.is_mythical,
        eggGroups: species.egg_groups.map((g) => g.name),
        sprite: officialArtworkUrl(pokemon.id),
        spriteFallback: simpleSpriteUrl(pokemon.id),
      };
    })();

    cache.pokemonFull.set(id, promise);
    return promise;
  }

  // --------------------------------------------------------------------
  // Utilidades genéricas
  // --------------------------------------------------------------------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, Math.min(n, arr.length));
  }

  function dedupeById(list) {
    const seen = new Set();
    const out = [];
    for (const item of list) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
    return out;
  }

  // --------------------------------------------------------------------
  // Dificuldades — MonHunt
  // Cada nível define, ao mesmo tempo: gerações disponíveis, tamanho
  // máximo do grupo de candidatos daquela partida, quais atributos
  // entram na comparação, e a "margem de tolerância" usada para decidir
  // se altura/peso/geração contam como "parecido" (amarelo).
  // --------------------------------------------------------------------
  const DIFFICULTIES_MONHUNT = {
    easy: {
      key: "easy", label: "Easy", pt: "Fácil",
      description: "Só Geração I, poucos candidatos, atributos simples.",
      generations: [1], maxCandidates: 50,
      attributes: ["type", "generation", "color", "stage"],
      numericBand: 0.35, genCloseDiff: 2,
    },
    normal: {
      key: "normal", label: "Normal", pt: "Normal",
      description: "Gerações I a III, mais candidatos, inclui habitat.",
      generations: [1, 2, 3], maxCandidates: 120,
      attributes: ["type", "generation", "color", "stage", "habitat"],
      numericBand: 0.28, genCloseDiff: 1,
    },
    hard: {
      key: "hard", label: "Hard", pt: "Difícil",
      description: "Gerações I a VI, inclui altura na comparação.",
      generations: [1, 2, 3, 4, 5, 6], maxCandidates: 250,
      attributes: ["type", "generation", "color", "stage", "habitat", "height"],
      numericBand: 0.2, genCloseDiff: 1,
    },
    hardcore: {
      key: "hardcore", label: "Hardcore", pt: "Hardcore",
      description: "Todas as gerações (I a IX), todos os atributos, tolerância mínima.",
      generations: [1, 2, 3, 4, 5, 6, 7, 8, 9], maxCandidates: 500,
      attributes: ["type", "generation", "color", "stage", "habitat", "height", "weight"],
      numericBand: 0.12, genCloseDiff: 1,
    },
  };

  // Monta o grupo de candidatos de uma partida de MonHunt: busca as
  // espécies das gerações da dificuldade e sorteia até maxCandidates.
  async function buildMonHuntCandidatePool(difficultyKey) {
    const diff = DIFFICULTIES_MONHUNT[difficultyKey];
    const species = dedupeById(await getSpeciesForGenerations(diff.generations));
    return sample(species, diff.maxCandidates).sort((a, b) => a.id - b.id);
  }

  // --------------------------------------------------------------------
  // Comparadores de atributo — usados pelo MonHunt a cada palpite.
  // Cada comparador devolve { status: 'correct'|'close'|'wrong', text, arrow? }
  // --------------------------------------------------------------------
  function compareSet(guessArr, secretArr) {
    const g = new Set(guessArr);
    const s = new Set(secretArr);
    const sameSize = g.size === s.size;
    const allMatch = [...g].every((v) => s.has(v));
    if (sameSize && allMatch) return "correct";
    const intersects = [...g].some((v) => s.has(v));
    return intersects ? "close" : "wrong";
  }

  function compareNumeric(guessVal, secretVal, band) {
    if (guessVal === secretVal) return { status: "correct" };
    const arrow = secretVal > guessVal ? "↑" : "↓";
    const withinBand = Math.abs(guessVal - secretVal) <= secretVal * band;
    return { status: withinBand ? "close" : "wrong", arrow };
  }

  const ATTRIBUTE_META = {
    type: { label: "Tipo" },
    generation: { label: "Geração" },
    color: { label: "Cor" },
    stage: { label: "Estágio" },
    habitat: { label: "Habitat" },
    height: { label: "Altura" },
    weight: { label: "Peso" },
  };

  function compareAttribute(attr, guess, secret, diff) {
    switch (attr) {
      case "type": {
        const status = compareSet(guess.types, secret.types);
        return { status, text: guess.types.map((t) => TYPE_PT[t] || t).join(" / "), badges: guess.types };
      }
      case "generation": {
        if (guess.generation === secret.generation) return { status: "correct", text: "Ger. " + guess.generation };
        const diffAbs = Math.abs(guess.generation - secret.generation);
        const status = diffAbs <= diff.genCloseDiff ? "close" : "wrong";
        const arrow = secret.generation > guess.generation ? "↑" : "↓";
        return { status, text: "Ger. " + guess.generation, arrow };
      }
      case "color": {
        if (guess.color === secret.color) return { status: "correct", text: COLOR_PT[guess.color] || guess.color };
        const same = guess.color && secret.color && COLOR_FAMILY[guess.color] === COLOR_FAMILY[secret.color];
        return { status: same ? "close" : "wrong", text: COLOR_PT[guess.color] || guess.color };
      }
      case "stage": {
        if (guess.stage === secret.stage) return { status: "correct", text: STAGE_LABEL[guess.stage] || guess.stage };
        const status = Math.abs(guess.stage - secret.stage) === 1 ? "close" : "wrong";
        const arrow = secret.stage > guess.stage ? "↑" : "↓";
        return { status, text: STAGE_LABEL[guess.stage] || guess.stage, arrow };
      }
      case "habitat": {
        if (guess.habitat === secret.habitat) return { status: "correct", text: HABITAT_PT[guess.habitat] || guess.habitat || "—" };
        const same = guess.habitat && secret.habitat && HABITAT_FAMILY[guess.habitat] === HABITAT_FAMILY[secret.habitat];
        return { status: same ? "close" : "wrong", text: HABITAT_PT[guess.habitat] || guess.habitat || "—" };
      }
      case "height": {
        const r = compareNumeric(guess.heightM, secret.heightM, diff.numericBand);
        return { ...r, text: guess.heightM.toFixed(1) + " m" };
      }
      case "weight": {
        const r = compareNumeric(guess.weightKg, secret.weightKg, diff.numericBand);
        return { ...r, text: guess.weightKg.toFixed(1) + " kg" };
      }
      default:
        return { status: "neutral", text: "—" };
    }
  }

  // Remove da lista de atributos ativos qualquer atributo cujo pokémon
  // secreto não tenha valor (ex: muitos pokémons não têm "habitat"
  // cadastrado na PokéAPI). Evita coluna sempre vermelha/injusta.
  function activeAttributesFor(diff, secret) {
    return diff.attributes.filter((attr) => {
      if (attr === "habitat") return secret.habitat !== null;
      if (attr === "color") return secret.color !== null;
      return true;
    });
  }

  // --------------------------------------------------------------------
  // Dificuldades — MonLink
  // --------------------------------------------------------------------
  const DIFFICULTIES_MONLINK = {
    easy: { key: "easy", label: "Easy", pt: "Fácil", lives: 6, trapOverlaps: 0,
      generators: ["type", "generation"] },
    normal: { key: "normal", label: "Normal", pt: "Normal", lives: 5, trapOverlaps: 0,
      generators: ["type", "generation", "color", "habitat"] },
    hard: { key: "hard", label: "Hard", pt: "Difícil", lives: 4, trapOverlaps: 1,
      generators: ["type", "generation", "color", "habitat", "starter", "eeveelutions", "legendary", "letter"] },
    hardcore: { key: "hardcore", label: "Hardcore", pt: "Hardcore", lives: 3, trapOverlaps: 2,
      generators: ["type", "generation", "color", "habitat", "starter", "eeveelutions", "legendary", "pseudo", "letter", "weightClass"] },
  };

  // Listas curadas (não dependem de requisições extras, garantem
  // categorias "sutis" confiáveis para as dificuldades mais altas).
  const CURATED = {
    starterGrass: ["bulbasaur", "chikorita", "treecko", "turtwig", "snivy", "chespin", "rowlet", "grookey", "sprigatito"],
    starterFire: ["charmander", "cyndaquil", "torchic", "chimchar", "tepig", "fennekin", "litten", "scorbunny", "fuecoco"],
    starterWater: ["squirtle", "totodile", "mudkip", "piplup", "oshawott", "froakie", "popplio", "sobble", "quaxly"],
    eeveelutions: ["vaporeon", "jolteon", "flareon", "espeon", "umbreon", "leafeon", "glaceon", "sylveon"],
    pseudoLegendaries: [
      "dragonite", "tyranitar", "salamence", "metagross", "garchomp",
      "hydreigon", "goodra", "kommo-o", "dragapult", "baxcalibur",
    ],
    legendary: [
      "articuno", "zapdos", "moltres", "mewtwo", "mew",
      "raikou", "entei", "suicune", "lugia", "ho-oh", "celebi",
      "regirock", "regice", "registeel", "latias", "latios", "kyogre", "groudon", "rayquaza", "jirachi", "deoxys",
      "uxie", "mesprit", "azelf", "dialga", "palkia", "heatran", "regigigas", "giratina", "cresselia", "phione", "manaphy", "darkrai", "shaymin", "arceus",
      "victini", "cobalion", "terrakion", "virizion", "tornadus", "thundurus", "reshiram", "zekrom", "landorus", "kyurem", "keldeo", "meloetta", "genesect",
      "xerneas", "yveltal", "zygarde", "diancie", "hoopa", "volcanion",
      "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "cosmog", "cosmoem", "solgaleo", "lunala", "necrozma", "magearna", "marshadow", "zeraora",
      "zacian", "zamazenta", "eternatus", "kubfu", "urshifu", "regieleki", "regidrago", "glastrier", "spectrier", "calyrex",
      "koraidon", "miraidon", "wo-chien", "chien-pao", "ting-lu", "chi-yu", "okidogi", "munkidori", "fezandipiti", "ogerpon", "terapagos", "pecharunt",
    ],
  };

  function curatedList(name) {
    return CURATED[name] || [];
  }

  window.PokeAPI = {
    API,
    fetchJSON,
    idFromUrl,
    officialArtworkUrl,
    simpleSpriteUrl,
    PLACEHOLDER_SPRITE,
    handleSpriteError,
    TYPE_PT,
    TYPE_COLORS,
    COLOR_PT,
    COLOR_SWATCH,
    HABITAT_PT,
    GEN_LABEL,
    STAGE_LABEL,
    ATTRIBUTE_META,
    getGenerationSpecies,
    getSpeciesForGenerations,
    getTypeMembers,
    getColorMembers,
    getHabitatMembers,
    resolveSpeciesIds,
    getEvolutionStageMap,
    getPokemonFull,
    shuffle,
    sample,
    dedupeById,
    DIFFICULTIES_MONHUNT,
    DIFFICULTIES_MONLINK,
    buildMonHuntCandidatePool,
    compareAttribute,
    activeAttributesFor,
    curatedList,
  };
})();
