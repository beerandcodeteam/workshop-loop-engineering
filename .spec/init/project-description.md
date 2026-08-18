# Máquina do Tempo da Web — Project Description

## Overview

Uma **página única que viaja no tempo**. O visitante escolhe um ano — **1995, 2005, 2015, 2026 ou 2040** — e a página se reconstrói na frente dele com a estética, a estrutura e o conteúdo que um site daquela época teria. Não é uma galeria de screenshots: é **a mesma página** assumindo cinco identidades diferentes, **sem reload**, com a transformação acontecendo à vista.

O público é a comunidade dev — em particular a sala do workshop de Loop Engineering, onde esse projeto vive como demo. O valor é o **reconhecimento**: quem tem mais de trinta anos de estrada reconhece o `<table>` centralizado de 640px, o gradiente glossy do Web 2.0, o flat design de 2015. Quem tem menos vê de onde veio o que usa hoje. E o 2040 é onde a página faz uma aposta: **o site deixa de ser um site**.

O MVP é deliberadamente pequeno: **um arquivo HTML, zero build, zero dependência de runtime**. Tailwind entra por CDN (`@tailwindcss/browser@4`), o JavaScript é vanilla, e a página abre com duplo clique via `file://`. Nada de framework, nada de bundler, nada de `node_modules` para servir a página. O único Node que existe no projeto é o que roda os **testes**.

O projeto tem um **portão de verificação** — `verify.sh`, no mesmo padrão de `exemplo-goal/`: `node --test` sobre checagens estáticas do HTML, mais um verificador de pendências. Sai `0` quando as cinco eras estão completas e nenhum `TODO` sobrou; sai `1` caso contrário. O portão é a definição de pronto do projeto, não a opinião de quem olha a tela.

### Key Concepts

- **Era:** uma das cinco épocas representadas — `1995`, `2005`, `2015`, `2026`, `2040`. Cada era define **três camadas**: tema visual, estrutura de layout e conteúdo/copy. Uma era só está completa quando as três estão definidas.
- **Tema visual:** o conjunto de propriedades CSS que dão a cara da época — paleta, família tipográfica, escala de espaçamento, raio de borda, sombra, textura de fundo. Expresso como **custom properties CSS**, nunca como classes trocadas.
- **Estrutura de layout:** como os blocos se organizam na tela naquela época — largura da página, número de colunas, alinhamento, ordem. Também expressa por custom properties, para que seja **interpolável**.
- **Conteúdo e copy:** os textos e elementos datados que só fazem sentido naquela era — contador de visitas em 1995, badge "beta" em 2005, "Sign up free" em 2015, banner de consentimento em 2026, campo de intenção em 2040.
- **Esqueleto compartilhado:** todas as cinco eras usam **o mesmo DOM**. Nada é criado ou removido na troca de era. Um elemento que não pertence à era atual **não é apagado — ele colapsa** (opacidade, escala, altura), e é isso que torna a transformação animável.
- **Transição por propriedade:** a mudança de era anima **propriedade a propriedade** — cor, tamanho, espaçamento, posição — em vez de trocar um estado pelo outro num crossfade. É a "evolução" acontecendo, não o antes e o depois.
- **Seletor de anos:** o controle que troca a era. Ele **não é neutro**: assume o estilo da própria época (botão 3D em 1995, gradiente glossy em 2005, flat em 2015). Regra que isso impõe: **em toda era o seletor tem que continuar legível, clicável e com a era ativa visualmente distinguível** — a imersão nunca custa a usabilidade do único controle da página.
- **Era inicial:** a página carrega em **1995**. A máquina do tempo começa no passado e o visitante caminha para frente.
- **Portão (`verify.sh`):** o comando que separa pronto de quase pronto. Exit `0` = pronto. É a condição de parada do projeto, escrita fora da cabeça de quem desenvolve.

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Local | `exemplo-maquina-do-tempo/` — irmão de `exemplo-goal/` no repo `workshop-loop-engineering` |
| Página | HTML5 em **arquivo único** (`index.html`), sem build, sem servidor — abre via `file://` |
| Estilo | **Tailwind CSS v4** por CDN — `@tailwindcss/browser@4` (compila no browser, em runtime) |
| Tema por era | **CSS custom properties** + `@property` para as que precisam interpolar; atributo `data-era` no `<html>` como chave de estado |
| Interatividade | **JavaScript vanilla**, inline, sem framework, sem bundler |
| Animação | `transition` CSS sobre custom properties — sem biblioteca de animação |
| Testes | **`node --test`** (nativo do Node 20), zero dependência |
| Portão | `verify.sh` → `node --test test/` + `scripts/check-pendencias.mjs`; exit `0`/`1` |
| Runtime de dev | Node **v20.19.6**, npm **10.8.2** (bun ausente na máquina) |
| Dependências de produção | **nenhuma** — a única rede necessária é o CDN do Tailwind |

## Core Workflows

### 1. Selecionar uma era

1. A página carrega com `data-era="1995"` no `<html>`.
2. O seletor exibe os cinco anos em ordem cronológica, da esquerda para a direita: `1995 · 2005 · 2015 · 2026 · 2040`. A era ativa é visualmente marcada.
3. O visitante clica em um ano.
4. O JavaScript troca **apenas** o atributo `data-era` no `<html>`. Nenhum nó é criado, removido ou reordenado.
5. O CSS reage à troca: todas as custom properties da era assumem os novos valores, e as transições declaradas fazem a interpolação.
6. Não há reload, não há requisição de rede, não há mudança de URL obrigatória.

**Regras:**
- Trocar de era é **idempotente** — clicar duas vezes no mesmo ano não produz efeito acumulado.
- A troca funciona em **qualquer ordem**, incluindo salto de 1995 direto para 2040 e volta.
- Nenhuma era é destino final: sempre dá para voltar.

### 2. Animar a evolução entre eras

A transição é o produto, não um enfeite. Ela obedece a três regras que existem porque **estrutura de layout também muda** — e layout, por padrão, não anima:

1. **DOM imutável.** Os cinco layouts são o mesmo esqueleto com valores diferentes. Nada de `innerHTML`, nada de `remove()`.
2. **Só propriedades interpoláveis.** As diferenças de estrutura são expressas em propriedades que o browser sabe animar — largura, `max-width`, `padding`, `gap`, `grid-template-columns` (com trilhas numéricas), `opacity`, `transform`. Custom properties que carregam cor ou comprimento são declaradas com `@property` para ganhar interpolação.
3. **Elementos fora de época colapsam, não somem.** O contador de visitas não deixa de existir em 2026 — ele vai para `opacity: 0`, altura zero e escala reduzida. Na volta para 1995, ele reaparece pelo mesmo caminho.

**Parâmetros:** duração única e consistente entre eras, na faixa de **600–900 ms**, com easing de saída suave. A transição inteira roda em CSS; o JavaScript não participa da animação.

### 3. Definir o que cada era é

Cada era preenche as três camadas. Esta é a especificação de conteúdo do MVP:

| Era | Tema visual | Estrutura | Conteúdo datado |
|---|---|---|---|
| **1995** | Cinza `#c0c0c0`, fundo com textura repetida, Times New Roman, links azuis sublinhados, `<hr>` em profusão, zero raio de borda, zero sombra | Tabela centralizada de largura fixa (~640px), tudo em coluna única | Contador de visitas, "Best viewed in Netscape Navigator", GIF de obra em construção, "última atualização em…" |
| **2005** | Gradientes glossy, azul e laranja Web 2.0, Verdana/Tahoma, cantos arredondados, reflexo, sombra suave | Duas colunas de largura fixa (~760px) — conteúdo principal + sidebar | Badge "beta", ícone de RSS, tag cloud, caixa de newsletter, "Digg this" |
| **2015** | Flat design, cores chapadas e saturadas, Helvetica/Open Sans, sem sombra, sem gradiente, muito branco | Hero full-width + grid de cards, mobile-first, rolagem longa | Call to action gigante, ícones lineares, "Sign up free", seção de depoimentos |
| **2026** | Dark mode como padrão, tipografia variável, vidro sutil, gradiente de acento, espaçamento generoso | Grid assimétrico, navegação sticky, largura confortável de leitura | Banner de consentimento de cookies, badge "AI-powered", copy curta e direta |
| **2040** | A página quase desaparece: fundo neutro, tipografia grande, quase nenhum cromo | **Um campo de intenção centralizado**; o conteúdo aparece como resposta abaixo dele | Sem menu, sem navegação, sem rodapé — o site virou agente. O visitante declara o que quer, não navega até lá |

**Regra de coerência:** a leitura das cinco eras em sequência tem que contar uma história — o cromo cresce até 2005, começa a sumir em 2015, e em 2040 sobrou só a intenção.

### 4. Passar no portão

1. `bash verify.sh` na raiz de `exemplo-maquina-do-tempo/`.
2. **Portão 1 — testes** (`node --test test/`), sobre o `index.html` lido como texto:
   - as cinco eras `1995 2005 2015 2026 2040` estão declaradas;
   - cada era define as três camadas (tema, estrutura, conteúdo);
   - o seletor tem exatamente cinco opções, uma por era;
   - `data-era` existe no `<html>` e o valor inicial é `1995`;
   - existe declaração de `transition` para a troca de era;
   - o script do Tailwind CDN está presente.
3. **Portão 2 — pendências** (`scripts/check-pendencias.mjs`): nenhum `TODO`, `FIXME` ou placeholder sobrando no código.
4. Saída: `0` quando os dois portões passam, `1` quando qualquer um falha. Cada portão imprime `OK` ou `FALHOU`.

O portão **não abre navegador** e não valida aparência. Ele prova estrutura e completude — julgamento estético continua sendo humano, e por isso fica fora da condição de parada.

## Open Questions

- **Offline.** O Tailwind vem de CDN. Se a demo rodar sem internet, a página perde todo o estilo. Decidir se vale baixar o `browser.js` para um `vendor/` local antes do workshop, ou aceitar o risco.
- **URL por era.** Não foi decidido se a era selecionada vira `#2015` na URL (permite compartilhar e recarregar numa era específica) ou se o estado é puramente de memória. O MVP funciona sem isso.
