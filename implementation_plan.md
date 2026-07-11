# Redesign Visual + Todos os Pokémon por Dificuldade

Duas mudanças principais solicitadas:
1. **Estilização renovada** — cores e formas que remetam à franquia Pokémon (vermelho, branco, azul, amarelo), design mais moderno e agradável
2. **Todos os Pokémon de cada geração** — o modo Fácil é da Gen I mas hoje limita a 50 candidatos aleatórios, excluindo muitos (Pikachu, Pidgey etc.). Queremos que TODOS os Pokémon da(s) geração(ões) apareçam

---

## Proposta de Mudanças

### 1. Estilização — Paleta Pokémon moderna

#### [MODIFY] [theme-tokens.js](file:///c:/Users/jeipi/Downloads/Kanto%20Lab/theme-tokens.js)

**Tema Claro (light)**: Inspirado na Pokébola e nas cores icônicas do Pokémon
- Background: branco/off-white (#f8f9fc)
- Elevado: branco puro (#ffffff)
- Accent primário: vermelho Pokémon (#E3350D)
- Accent secundário: azul Pokémon (#3B4CCA)
- Texto: cinza-escuro sofisticado (#1a1d2e)
- Cards com bordas arredondadas maiores (12px), sombras suaves ao invés de blocudas
- Gradients sutis no header

**Tema Escuro (dark)**: Noite na região de Kanto
- Background: azul muito escuro (#0f1123)
- Elevado: azul-escuro (#1a1d35)
- Accent: amarelo Pikachu (#FFCB05)
- Accent2: azul Pokémon (#5A96FF)
- Sombras difusas ao invés de pixel-art

**Tema Daltônico (colorblind)**: Mantém acessibilidade mas com paleta Pokémon
- Tons de azul e laranja (bom para deuteranopia)
- Accent: laranja (#E87A20) e azul (#2B6CB0)

**Tema Alto Contraste**: Preto e branco com amarelo Pokémon como destaque
- Mínimas alterações (já funciona bem), apenas atualizar o radius

**Fontes**: Trocar "Press Start 2P" / "VT323" por fontes mais modernas e legíveis:
- Display: **"Outfit"** (bold, moderna)  
- Body: **"Inter"** (limpa, legível)

> [!IMPORTANT]
> A troca de fontes é a maior mudança visual. O estilo "Game Boy" pixelado vai embora em favor de um visual limpo e premium. Isso afeta todo o site. **Você concorda com essa troca?**

---

#### [MODIFY] [css-engine.js](file:///c:/Users/jeipi/Downloads/Kanto%20Lab/css-engine.js)

Atualizações no CSS global:
- **Bordas arredondadas** (12-16px) ao invés de 6px blocudo
- **Sombras difusas** (box-shadow com blur) ao invés de sombras pixel-art sólidas
- **Header com gradiente** sutil usando as cores de accent
- **Cards com hover suave** — translateY + sombra que cresce
- **Botões** com gradiente e transições suaves
- **Animações** mais refinadas (ease-out, timing mais longo)
- **Pokébola animada** no brand-badge com rotação sutil no hover
- **Background decorativo** — pattern sutil de Pokébolas ou gradiente mesh
- Remover o efeito de scanlines (era parte do tema Game Boy)
- **Remover a borda/outline blocuda** do nav-links, substituir por pills modernos
- **Fontes**: Trocar referências de Google Fonts nos HTMLs para Outfit + Inter

---

### 2. Pokémon completos por dificuldade

#### [MODIFY] [pokeapi.js](file:///c:/Users/jeipi/Downloads/Kanto%20Lab/pokeapi.js)

O problema está em `buildMonHuntCandidatePool`:
```javascript
// ANTES — sorteia apenas "maxCandidates" da pool (ex: 50 de ~151)
const species = dedupeById(await getSpeciesForGenerations(diff.generations));
return sample(species, diff.maxCandidates).sort((a, b) => a.id - b.id);
```

**Correção**: Remover o `maxCandidates` do sampling e usar TODOS os Pokémon da geração como candidatos:
```javascript
// DEPOIS — todos os Pokémon da geração ficam disponíveis
const species = dedupeById(await getSpeciesForGenerations(diff.generations));
return species.sort((a, b) => a.id - b.id);
```

Os `maxCandidates` atuais são:
| Dificuldade | Gerações | maxCandidates atual | Pokémon reais |
|---|---|---|---|
| Easy | I | 50 | ~151 |
| Normal | I-III | 120 | ~386 |
| Hard | I-VI | 250 | ~721 |
| Hardcore | I-IX | 500 | ~1010 |

Após a mudança, **todos** os Pokémon estarão disponíveis em cada dificuldade.

> [!NOTE]
> O `maxCandidates` pode continuar existindo no objeto de dificuldade para referência/UI, mas não será mais usado para limitar o pool. Ou podemos removê-lo completamente.

---

#### [MODIFY] [index.html](file:///c:/Users/jeipi/Downloads/Kanto%20Lab/index.html)
- Atualizar link do Google Fonts para Outfit + Inter
- Ajuste menor no favicon (manter)

#### [MODIFY] [monhunt.html](file:///c:/Users/jeipi/Downloads/Kanto%20Lab/monhunt.html)
- Atualizar link do Google Fonts para Outfit + Inter

#### [MODIFY] [monlink.html](file:///c:/Users/jeipi/Downloads/Kanto%20Lab/monlink.html)
- Atualizar link do Google Fonts para Outfit + Inter

---

## Open Questions

> [!IMPORTANT]
> **Sobre as fontes**: Atualmente o site tem fontes pixeladas estilo Game Boy ("Press Start 2P" / "VT323"). Posso trocar por fontes modernas (Outfit / Inter) para um visual premium, ou manter as pixeladas e só mudar cores/formas. O que prefere?

> [!IMPORTANT]
> **Sobre maxCandidates na UI**: Hoje o jogo mostra "X candidatos possíveis" na interface. Com todos os Pokémon desbloqueados, mostrará o total real (ex: "151 candidatos possíveis" no modo Fácil). Isso está ok?

---

## Verification Plan

### Manual Verification
- Abrir cada página no navegador e verificar visualmente cada tema
- Iniciar partida no modo Fácil do MonHunt e confirmar que Pikachu, Pidgey, etc. aparecem na lista
- Verificar que todos os 151 Pokémon da Gen I aparecem no modo Fácil
- Testar os 4 temas (claro, escuro, daltônico, alto contraste)
- Verificar responsividade em mobile
