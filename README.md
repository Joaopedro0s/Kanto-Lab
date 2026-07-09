# PokéJogos — Pokédle & Pokennection

Dois jogos de fã com Pokémon, feitos em HTML/CSS/JavaScript puro (sem
framework, sem build step), prontos para deploy estático na Vercel.
Não há limite diário: cada partida sorteia dados novos na hora.

## Estrutura de arquivos

Todos os arquivos ficam na raiz do projeto (sem subpastas) — isso é só
uma escolha de organização, não afeta o funcionamento. Se preferir,
você pode mover os `.css` para uma pasta `css/` e os `.js` para uma
pasta `js/`, só lembre de atualizar os caminhos nos `<link>` e
`<script src="">` dos três arquivos `.html`.

| Arquivo             | O que é |
|---------------------|---------|
| `index.html`        | Página inicial, com links para os dois jogos |
| `pokedle.html`      | Tela do jogo Pokédle |
| `pokennection.html` | Tela do jogo Pokennection |
| `themes.css`        | Variáveis de cor de cada tema (claro, escuro, daltônico, alto contraste) |
| `styles.css`        | Layout e componentes visuais compartilhados pelos dois jogos |
| `theme.js`          | Lógica de troca de tema (o único dado salvo no navegador) |
| `sound.js`          | Efeitos sonoros gerados na hora com Web Audio (sem arquivos de áudio) |
| `pokeapi.js`        | **Módulo central de dados.** Tudo que fala com a PokéAPI mora aqui |
| `pokedle.js`        | Lógica do jogo Pokédle |
| `pokennection.js`   | Lógica do jogo Pokennection |
| `vercel.json`       | Configuração mínima de deploy estático |

## Como os dados de Pokémon são obtidos

Não existe um arquivo de dados "engessado" — os jogos buscam tudo da
[PokéAPI](https://pokeapi.co) direto no navegador do jogador, a cada
partida. Para isso não ficar lento:

- Listas de candidatos (por geração, tipo, cor, habitat) vêm de
  endpoints que já devolvem a lista pronta (`/generation/{n}`,
  `/type/{nome}`, `/pokemon-color/{nome}`, `/pokemon-habitat/{nome}`) —
  nenhuma requisição por-Pokémon é feita só para montar essas listas.
- As imagens (sprites) têm URL previsível
  (`raw.githubusercontent.com/PokeAPI/sprites`), então nunca é preciso
  uma requisição só para descobrir a imagem.
- No Pokédle, os dados **completos** de um Pokémon (tipo, altura, peso,
  geração, habitat, cor, estágio evolutivo) só são buscados para o
  Pokémon secreto e para os Pokémon que o jogador realmente chuta —
  não para todos os candidatos da dificuldade.
- No Pokennection, a maioria das categorias usa listas prontas da API;
  só a categoria "peso" (só existe no modo Hardcore) busca dados
  completos de uma amostra pequena de candidatos.
- Tudo que já foi buscado fica em cache na memória enquanto a aba
  estiver aberta (não é salvo em lugar nenhum — fecha a aba, some).

Isso significa que o site precisa de conexão com a internet para
funcionar (ele não empacota os dados dos Pokémon).

## Sobre os nomes dos Pokémon

A PokéAPI não tem nomes em português nas informações usadas pelos
jogos (tipo, cor, habitat etc. têm; nome do Pokémon em si, não). Por
isso os jogos mostram os nomes em inglês (ex: "Bulbasaur",
"Charmander"), que é também o padrão usado por jogos parecidos
(Pokédle, Pokéle, etc.) e o mais fácil de reconhecer/buscar. Todo o
resto da interface (tipo, cor, habitat, botões, textos) está em
português.

## Temas

Quatro temas disponíveis a qualquer momento pelo botão "🎨 Tema" no
topo: Claro, Escuro, Amigável para daltônicos (paleta azul/laranja,
evita depender só de vermelho/verde) e Alto contraste. A escolha fica
salva no navegador (`localStorage`) só como preferência de interface —
nenhum progresso de partida é salvo em lugar nenhum, então não há
limite diário: dá pra jogar quantas vezes quiser.

## Dificuldades

**Pokédle** — cada dificuldade define ao mesmo tempo: as gerações
disponíveis, o número máximo de Pokémon candidatos sorteados para
aquela partida, e quantos atributos entram na comparação (com margens
de tolerância diferentes para altura/peso/geração).

| Dificuldade | Gerações | Máx. candidatos | Atributos comparados |
|---|---|---|---|
| Easy | I | 50 | tipo, geração, cor, estágio |
| Normal | I–III | 120 | + habitat |
| Hard | I–VI | 250 | + altura |
| Hardcore | I–IX | 500 | + peso (tolerância bem menor) |

São sempre 8 tentativas, em qualquer dificuldade.

**Pokennection** — cada dificuldade define quantas vidas o jogador tem
e quais "geradores de categoria" podem ser sorteados (tipo, geração,
cor, habitat sempre disponíveis; iniciantes, evoluções de Eevee,
lendários, pseudolendários, "começa com a letra X" e faixa de peso só
entram em Hard/Hardcore). Hard e Hardcore também forçam 1–2 Pokémon
"armadilha" que batem com o critério de mais de uma categoria do
tabuleiro (mas só contam como certos na categoria que realmente foi
sorteada pra eles).

| Dificuldade | Vidas | Armadilhas |
|---|---|---|
| Easy | 6 | não |
| Normal | 5 | não |
| Hard | 4 | 1 |
| Hardcore | 3 | 2 |

## Rodando localmente

Não há build step. Duas formas simples de testar antes de publicar:

1. Abrir `index.html` direto no navegador (duplo clique). Funciona na
   maioria dos casos, já que os jogos buscam dados via `https://` (não
   dependem do protocolo `file://` para nada sensível).
2. Ou, com Node instalado, rodar um servidor estático simples dentro
   da pasta do projeto:
   ```
   npx serve .
   ```
   e abrir o endereço que ele mostrar (algo como `http://localhost:3000`).

**Importante:** este projeto foi desenvolvido sem acesso a um ambiente
de execução (shell) para testes automatizados — todo o código foi
revisado manualmente com atenção a erros comuns (referências entre
HTML/JS, ordem de carregamento de scripts, etc.), mas vale rodar um
teste manual rápido nos dois jogos, em pelo menos uma dificuldade
de cada, antes de considerar o deploy "definitivo".

## Deploy na Vercel

1. Suba esta pasta para um repositório Git (GitHub, GitLab ou Bitbucket).
2. Na Vercel, clique em "Add New… → Project" e importe o repositório.
3. Framework: escolha "Other" (ou deixe a detecção automática — é um
   site 100% estático, sem build).
4. Build Command: deixe em branco. Output Directory: deixe em branco
   (raiz do projeto).
5. Deploy. Pronto — `index.html` vira a página inicial automaticamente.

Alternativa rápida sem Git: instale a CLI da Vercel (`npm i -g vercel`)
e rode `vercel` dentro da pasta do projeto.

## Manutenção — como estender

- **Adicionar um atributo novo no Pokédle**: em `pokeapi.js`, acrescente
  a chave em `ATTRIBUTE_META`, adicione um `case` novo em
  `compareAttribute()`, e inclua a chave no array `attributes` da(s)
  dificuldade(s) desejada(s) em `DIFFICULTIES_POKEDLE`.
- **Adicionar uma categoria nova no Pokennection**: em `pokennection.js`,
  escreva uma função `genMinhaCategoria(usedKeys)` seguindo o padrão
  das outras (devolve `null` ou `{key, title, pool}`), registre-a em
  `GENERATOR_FUNCS`, e inclua o nome na lista `generators` da
  dificuldade em `DIFFICULTIES_POKENNECTION` (dentro de `pokeapi.js`).
- **Ajustar dificuldade**: os objetos `DIFFICULTIES_POKEDLE` e
  `DIFFICULTIES_POKENNECTION`, no topo de `pokeapi.js`, concentram
  todos os números (gerações, candidatos, vidas, tolerâncias). Não é
  preciso mexer na lógica dos jogos para ajustar esses valores.
- **Criar um tema novo**: copie um bloco `[data-theme="..."]` em
  `themes.css`, troque as cores, e adicione o tema ao array `THEMES`
  em `theme.js`.

## Créditos

Dados de Pokémon: [PokéAPI](https://pokeapi.co). Sprites:
[PokeAPI/sprites](https://github.com/PokeAPI/sprites) (GitHub, uso
público). Projeto de fã, sem fins lucrativos, não afiliado à Nintendo,
Game Freak ou Creatures Inc. Pokémon e os nomes dos personagens são
marcas registradas de seus respectivos donos.
