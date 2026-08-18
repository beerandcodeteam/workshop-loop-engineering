# Máquina do Tempo da Web — Project Phases

<!-- inputs: project-description.md@sha256:c0e3e76eac0a user-stories.md@sha256:0bc63bc56f7d database-schema.md@sha256:b0b21b16720d -->

## Overview

O build é dividido em **8 fases**, executadas em ordem. A Fase 1 constrói **o portão inteiro antes de existir uma linha de página** — `verify.sh`, os dois portões e a suíte de testes que já afirma as cinco eras completas. Ela termina com `exit 1`, de propósito: o critério de parada existe antes do trabalho, e é contra ele que o loop roda. Da Fase 2 à 7 o portão vai ficando menos vermelho a cada era entregue, e a Fase 8 é a que o fecha em `exit 0`.

A Fase 2 é a única fundação de código: o esqueleto compartilhado de DOM, o sistema de tokens CSS e o motor de troca de era. Depois dela vêm **cinco fases idênticas em forma, uma por era** (1995, 2005, 2015, 2026, 2040), cada uma preenchendo os doze tokens, o conteúdo datado e a pele do seletor daquela época. A Fase 8 costura o arco narrativo, valida acessibilidade e palco, e zera as pendências.

Não há fase de banco de dados: o `database-schema.md` declara **zero tabelas** e registra que nenhuma fase deve conter tarefa de modelagem, migration, seed ou acesso a dados. Não há `.spec/init/design/`: por decisão do desenvolvedor, as histórias **US-3.1 a US-3.5** são a referência de design — elas já trazem paleta, família tipográfica, largura, estrutura e conteúdo datado de cada era.

**A linha de corte do MVP é a Fase 8.** Todas as 20 histórias estão dentro; nada foi adiado para depois do primeiro release.

**Conventions:**
- `[ ]` pending · `[x]` done in the codebase.
- Phases and sub-phases are numbered (`Phase 1`, `Phase 5.3`) for reference by AI agents.
- Business-logic tasks list the **feature tests** to generate; frontend-only tasks list validatable **acceptance criteria** and a **Design ref**.
- Cada fase é **auto-contida**: o agente que a executa não leu as outras. Por isso o contrato verificável é recapitulado dentro de cada fase.
- O portão é sempre `bash verify.sh`, rodado a partir de `exemplo-maquina-do-tempo/`. Cada fase declara qual saída é a esperada ao terminá-la.

---

## Phase 1: O portão vermelho

**Goal:** Construir o critério de parada inteiro — projeto, testes e portões — antes de existir qualquer página. · **Depends on:** none · **Covers:** US-5.1, US-5.2, US-5.3, US-5.4, US-4.1, US-4.3 (README)

**Contexto desta fase.** O projeto é uma página web única que representa como eram os sites em **1995, 2005, 2015, 2026 e 2040**. Clicar num ano muda a aparência da página inteira sem reload, com transição animada. Nada disso é construído aqui: esta fase constrói apenas **o que decide se está pronto**.

**Contrato verificável — esta fase o define, as demais o obedecem:**

- Projeto em `exemplo-maquina-do-tempo/`, irmão de `exemplo-goal/` no repositório.
- A página inteira é **um arquivo**: `index.html`, com HTML, `<style>` e `<script>` inline. Sem build, sem bundler, sem servidor. Abre via `file://`.
- Eras: `1995`, `2005`, `2015`, `2026`, `2040`. O estado é o atributo `data-era` no elemento `<html>`. Valor inicial literal: `1995`.
- Cada era declara **12 tokens** numa regra `:root[data-era="<ano>"]`:
  - tema (8): `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--fonte-corpo`, `--raio`, `--sombra`, `--textura-fundo`
  - estrutura (4): `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`
- **9 tokens** são registrados com `@property` para poderem interpolar: `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--raio`, `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`. Os outros 3 (`--fonte-corpo`, `--sombra`, `--textura-fundo`) trocam sem interpolar.
- Conteúdo exclusivo de uma era é marcado com `data-era-only="<ano>"`. Fora da sua era ele **colapsa** por `opacity`, `max-height` e `transform` — **nunca** `display:none` nem `visibility:hidden`, e nunca é removido do DOM.
- DOM imutável: o JavaScript **não pode** conter `innerHTML`, `createElement`, `appendChild`, `insertAdjacent` nem `.remove(`.
- Seletor: `<nav id="seletor">` com exatamente 5 `<button data-ir-para="<ano>">`, em ordem cronológica de 1995 a 2040.
- Duração da transição entre eras: um valor único, entre **600ms e 900ms**.
- Tailwind entra por CDN: `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`. A página **depende de internet** — decisão registrada, não esquecimento.

**Árvore de arquivos que esta fase entrega:**

```
exemplo-maquina-do-tempo/
├── README.md                     o que é, como rodar, e o aviso de dependência de internet
├── package.json                  scripts: test, check, verify — nenhuma dependência
├── verify.sh                     o portão: dois gates, exit 0/1
├── reset.sh                      devolve o diretório ao vazio
├── scripts/
│   └── check-pendencias.mjs      segundo portão: nenhum TODO/FIXME sobrando
└── test/
    ├── contrato.mjs              as constantes do contrato acima, em código
    ├── helpers.mjs               lê index.html e expõe fatias para os testes
    ├── estrutura.test.mjs        esqueleto, tokens, motor, seletor, transição
    └── eras.test.mjs             as cinco eras × três camadas
```

**Saída esperada ao terminar esta fase:** `bash verify.sh` sai **1**. O `index.html` ainda não existe, e todos os testes reprovam com a mensagem `index.html nao existe` em vez de estourar exceção. Isso é o sucesso desta fase, não a falha dela.

### Phase 1.1: Esqueleto do projeto

- [ ] **Task:** Criar o diretório `exemplo-maquina-do-tempo/` e o `package.json`
  - **Acceptance criteria:**
    - `package.json` tem `"type": "module"` e `"private": true`
    - Os scripts são exatamente três: `test` → `node --test test/`, `check` → `node scripts/check-pendencias.mjs`, `verify` → `bash verify.sh`
    - O campo `dependencies` e o campo `devDependencies` estão **ausentes ou vazios** — o projeto não instala nada
    - `npm test` roda sem nenhum `npm install` prévio, usando só o Node 20 da máquina
  - **Feature tests:** `estrutura: projeto nao tem dependencias` → afirma que `package.json` não declara dependências, garantindo a promessa de zero instalação da US-4.1
  - **Traces:** US-4.1, US-5.4
- [ ] **Task:** Escrever o `README.md` do projeto
  - **Acceptance criteria:**
    - Explica em uma frase o que a página é e quais são as cinco eras
    - Documenta como rodar: abrir `index.html` com duplo clique; rodar o portão com `bash verify.sh`
    - Contém um aviso explícito e destacado de que **a página depende de internet** porque o Tailwind vem de CDN, e que sem rede ela abre sem estilo
    - Registra os não-objetivos declarados: sem offline, sem era na URL, sem layout responsivo, sem chrome de navegador simulado
    - Não promete nada que o projeto não faz — o campo de intenção de 2040 é estético, não funcional
  - **Traces:** US-4.3, US-4.1
- [ ] **Task:** Escrever o `reset.sh`
  - **Acceptance criteria:**
    - Roda a partir de qualquer diretório: faz `cd "$(dirname "$0")"` na primeira linha útil
    - Apaga **todo** o conteúdo do diretório do projeto **exceto o próprio `reset.sh`**, deixando o projeto pronto para ser reconstruído da Fase 1
    - É idempotente: rodar duas vezes seguidas não gera erro nem saída diferente
    - Imprime o que apagou, uma linha por item
    - Nunca toca em nada fora de `exemplo-maquina-do-tempo/`
  - **Traces:** US-4.1

### Phase 1.2: O contrato em código

- [ ] **Task:** Escrever `test/contrato.mjs` com as constantes do contrato verificável
  - **Acceptance criteria:**
    - Exporta `ERAS` = `['1995','2005','2015','2026','2040']`, nessa ordem
    - Exporta `TOKENS_TEMA` com os 8 nomes de token de tema e `TOKENS_ESTRUTURA` com os 4 de estrutura
    - Exporta `TOKENS_REGISTRADOS` com os 9 que precisam de `@property`
    - Exporta `APIS_PROIBIDAS` = `['innerHTML','createElement','appendChild','insertAdjacent','.remove(']`
    - Exporta `DURACAO_MIN_MS` = `600` e `DURACAO_MAX_MS` = `900`
    - Exporta `FONTE_MINIMA_PX` = `16`
    - Não contém lógica — só dados. Os testes importam daqui em vez de repetir strings
  - **Feature tests:** `contrato: cinco eras declaradas na ordem cronologica` → afirma que `ERAS` tem exatamente 5 itens em ordem crescente, travando a espinha dorsal do domínio
  - **Traces:** US-5.4
- [ ] **Task:** Escrever `test/helpers.mjs` para ler o `index.html` como texto
  - **Acceptance criteria:**
    - Expõe `lerIndex()` que devolve o conteúdo de `index.html` ou `null` quando o arquivo não existe — **nunca** lança exceção
    - Expõe `blocoDaEra(html, ano)` que devolve o corpo da regra `:root[data-era="<ano>"] { … }` ou `null`
    - Expõe `blocoScript(html)` e `blocoEstilo(html)` devolvendo o conteúdo de `<script>` inline e `<style>`
    - Expõe `elementosDaEra(html, ano)` devolvendo as ocorrências de `data-era-only="<ano>"`
    - Quando `index.html` não existe, todo teste que depende dele reprova com a mensagem `index.html nao existe` — legível, sem stack trace
  - **Traces:** US-5.2, US-5.4

### Phase 1.3: A suíte de testes

- [ ] **Task:** Escrever `test/estrutura.test.mjs` — o esqueleto, o motor e as regras invioláveis
  - **Acceptance criteria:**
    - Roda com `node --test test/` sem nenhuma dependência instalada
    - Cobre as sete afirmações listadas em **Feature tests** abaixo, cada uma como um caso nomeado
    - Cada reprovação nomeia o que faltou, não só que falhou
  - **Feature tests:**
    - `estrutura: html declara data-era inicial 1995` → afirma que o literal `data-era="1995"` está no `<html>` do arquivo, provando que a era inicial não depende de JavaScript (US-1.2)
    - `estrutura: script do tailwind presente` → afirma a tag do CDN `@tailwindcss/browser@4` no HTML
    - `estrutura: seletor tem exatamente cinco botoes em ordem` → afirma 5 `<button data-ir-para="…">` dentro de `#seletor`, com os anos em ordem cronológica (US-1.1)
    - `estrutura: nove tokens registrados com @property` → afirma um bloco `@property --x` para cada token de `TOKENS_REGISTRADOS`, cada um com `syntax` e `inherits` declarados — é isso que torna a transição interpolável (US-2.1)
    - `estrutura: duracao de transicao entre 600ms e 900ms` → extrai a duração declarada e afirma a faixa fechada do contrato (US-2.1)
    - `estrutura: dom imutavel` → afirma que **nenhuma** das `APIS_PROIBIDAS` aparece no `<script>`, travando a regra de que a troca de era só escreve `data-era` (US-2.1, US-2.2)
    - `estrutura: conteudo datado nunca usa display none` → afirma que nenhuma regra que casa `[data-era-only]` declara `display:none` nem `visibility:hidden`, forçando o colapso animado (US-2.2)
  - **Traces:** US-1.1, US-1.2, US-2.1, US-2.2, US-5.4
- [ ] **Task:** Escrever `test/eras.test.mjs` — as cinco eras × três camadas
  - **Acceptance criteria:**
    - Gera os casos iterando sobre `ERAS`, um bloco de testes por era — nada é escrito cinco vezes à mão
    - Cada reprovação nomeia **a era e a camada** que faltou, como exige a US-5.2
    - Roda sem dependência instalada
  - **Feature tests:**
    - `eras: <ano> declara os oito tokens de tema` → para cada era, afirma que a regra `:root[data-era="<ano>"]` declara os 8 tokens de `TOKENS_TEMA` (camada tema)
    - `eras: <ano> declara os quatro tokens de estrutura` → idem para `TOKENS_ESTRUTURA` (camada estrutura)
    - `eras: <ano> tem conteudo datado proprio` → afirma pelo menos um elemento `data-era-only="<ano>"` no HTML (camada conteúdo)
    - `eras: <ano> tem pele propria no seletor` → afirma uma regra CSS que estiliza `#seletor` sob `[data-era="<ano>"]`, provando que o seletor veste a época (US-3.6)
    - `eras: nenhuma fonte de conteudo abaixo de 16px` → afirma que nenhuma declaração `font-size` em px no arquivo fica abaixo de `FONTE_MINIMA_PX`, protegendo a legibilidade em projetor (US-4.2)
  - **Traces:** US-3.1, US-3.2, US-3.3, US-3.4, US-3.5, US-3.6, US-4.2, US-5.4

### Phase 1.4: Os dois portões

- [ ] **Task:** Escrever `scripts/check-pendencias.mjs` — o segundo portão
  - **Acceptance criteria:**
    - Varre `index.html`, `scripts/` e `test/` procurando `TODO`, `FIXME`, `XXX` e `PLACEHOLDER`
    - Imprime **arquivo e linha** de cada ocorrência encontrada
    - Sai com código `0` quando não encontra nenhuma e `1` quando encontra ao menos uma
    - Não falha quando `index.html` ainda não existe — arquivo ausente não é pendência
    - É independente dos testes: pode passar com os testes reprovando, e vice-versa
  - **Feature tests:** `pendencias: encontra e reporta marcacao de trabalho inacabado` → cria um arquivo temporário com `TODO`, roda o script e afirma exit `1` mais a linha reportada; sem o arquivo, afirma exit `0` (US-5.3)
  - **Traces:** US-5.3
- [ ] **Task:** Escrever `verify.sh` — o portão
  - **Acceptance criteria:**
    - Faz `cd "$(dirname "$0")"` e roda sem argumentos
    - Executa os dois portões em ordem, cada um com cabeçalho próprio: `==> [1/2] testes` e `==> [2/2] pendencias`
    - Cada portão imprime `OK` ou `FALHOU` na linha seguinte ao seu cabeçalho
    - Roda o **segundo portão mesmo quando o primeiro falha** — o desenvolvedor vê o estado dos dois numa passada
    - A linha final resume o veredito: `verify: TUDO VERDE (exit 0)` ou `verify: AINDA VERMELHO (exit 1)`
    - Sai `0` só quando os dois passam; `1` se qualquer um falhar
    - A saída é legível sem cor
    - Não abre navegador e não julga aparência
  - **Feature tests:** `portao: exit 0 apenas com os dois gates verdes` → afirma a tabela verdade dos dois portões (verde+verde → 0; qualquer combinação com um vermelho → 1), que é a regra de negócio central da US-5.1
  - **Traces:** US-5.1, US-5.2, US-5.3
- [ ] **Task:** Confirmar o portão vermelho e registrar o número
  - **Acceptance criteria:**
    - `bash verify.sh` roda a partir de `exemplo-maquina-do-tempo/` e sai **1**
    - A saída nomeia quais eras estão incompletas — não imprime stack trace de arquivo ausente
    - Rodar duas vezes seguidas dá exatamente o mesmo resultado (o portão é reexecutável)
    - `bash reset.sh && bash verify.sh` também sai `1`, sem quebrar
  - **Feature tests:** `portao: reexecutavel` → roda o portão duas vezes e afirma saída e código de saída idênticos, provando que a verificação não depende de estado acumulado (US-5.1)
  - **Traces:** US-5.1, US-5.2

---

## Phase 2: Esqueleto compartilhado e motor de eras

**Goal:** Construir o `index.html` com o DOM que as cinco eras compartilham, o sistema de tokens que as diferencia e o motor que troca de uma para outra. · **Depends on:** Phase 1 · **Covers:** US-1.1, US-1.2, US-1.3, US-1.4, US-2.1, US-2.2, US-2.3, US-4.1, US-4.3

**Contexto desta fase.** A página representa como eram os sites em **1995, 2005, 2015, 2026 e 2040**. Esta fase não implementa nenhuma era: ela constrói o esqueleto e o motor. Ao terminar, a página troca de era corretamente mas ainda não tem cara de época nenhuma — os tokens existem sem valores próprios.

**Contrato verificável (recapitulado — esta fase é auto-contida):**

- Tudo em **um arquivo**: `exemplo-maquina-do-tempo/index.html`, com HTML, `<style>` e `<script>` inline. Sem build, sem servidor, abre via `file://`.
- Eras: `1995`, `2005`, `2015`, `2026`, `2040`. Estado = atributo `data-era` no `<html>`, valor inicial literal `1995`.
- 12 tokens por era numa regra `:root[data-era="<ano>"]` — tema (8): `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--fonte-corpo`, `--raio`, `--sombra`, `--textura-fundo`; estrutura (4): `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`.
- 9 registrados com `@property`: os quatro `--cor-*`, `--raio`, `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`.
- Conteúdo exclusivo de era: `data-era-only="<ano>"`, colapsa por `opacity`/`max-height`/`transform`, **nunca** `display:none` nem `visibility:hidden`, nunca removido do DOM.
- JavaScript proibido de usar: `innerHTML`, `createElement`, `appendChild`, `insertAdjacent`, `.remove(`.
- Seletor: `<nav id="seletor">` com 5 `<button data-ir-para="<ano>">` em ordem cronológica.
- Transição: duração única entre **600ms e 900ms**.
- Tailwind por CDN: `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`.

**Saída esperada ao terminar esta fase:** `bash verify.sh` ainda sai **1**, mas o arquivo `test/estrutura.test.mjs` fica **inteiramente verde**. O que continua vermelho é `test/eras.test.mjs` — nenhuma era declarou seus tokens ainda. Não tente consertar isso aqui.

### Phase 2.1: O documento e a rede

- [ ] **Task:** Criar o `index.html` com o cabeçalho do documento
  - **Acceptance criteria:**
    - `<html lang="pt-BR" data-era="1995">` — o valor `1995` é literal no HTML, não escrito por JavaScript
    - O `<script>` do Tailwind `@tailwindcss/browser@4` está no `<head>`
    - Há um `<style>` inline para o CSS próprio da página, independente do Tailwind
    - Nenhuma referência a arquivo local externo (sem `<link href="./…">`, sem `<script src="./…">`) — a página é um arquivo só
    - Abrir o arquivo via `file://` renderiza sem erro de console e sem requisição além do CDN
  - **Feature tests:** `estrutura: html declara data-era inicial 1995` e `estrutura: script do tailwind presente` (já escritos na Fase 1) passam a reprovar por conteúdo em vez de por arquivo ausente, e depois ficam verdes
  - **Design ref:** não há `.spec/init/design/`; a referência é a US-1.2
  - **Traces:** US-1.2, US-4.1
- [ ] **Task:** Implementar o aviso de Tailwind não carregado
  - **Acceptance criteria:**
    - Existe um elemento de aviso no HTML com texto informando que o estilo não foi carregado e que a página depende de internet
    - O aviso é estilizado por CSS **próprio, inline**, sem nenhuma classe do Tailwind — ele precisa ser visível justamente quando o Tailwind falhou
    - Com o Tailwind carregado, o aviso fica invisível e **não ocupa espaço** no layout
    - A detecção não depende do evento `error` de uma tag que pode não disparar em `file://` — usa uma checagem de efeito (por exemplo, uma classe utilitária conhecida não produziu estilo)
    - O aviso não usa nenhuma das APIs proibidas para aparecer — só alterna atributo ou classe
  - **Feature tests:** `estrutura: aviso de cdn nao depende do tailwind` → afirma que as regras que estilizam o aviso estão no `<style>` inline e não usam classes utilitárias, garantindo que o aviso sobreviva à queda do CDN (US-4.3)
  - **Design ref:** não há `.spec/init/design/`; a referência é a US-4.3
  - **Traces:** US-4.3

### Phase 2.2: O esqueleto compartilhado

- [ ] **Task:** Construir o DOM único que as cinco eras compartilham
  - **Acceptance criteria:**
    - Existe um container de página cuja largura é dirigida por `var(--largura-pagina)`
    - Existem as regiões que todas as eras usam: cabeçalho, área de conteúdo principal, área secundária (sidebar) dirigida por `var(--largura-sidebar)`, e rodapé
    - A área secundária existe em **todas** as eras; nas que não têm sidebar, `--largura-sidebar` é `0px` e ela colapsa por largura
    - O mesmo DOM serve as cinco eras: nenhuma região é criada ou destruída na troca
    - Todos os elementos datados carregam `data-era-only="<ano>"` com o ano ao qual pertencem
    - Nenhum texto de conteúdo é escrito por JavaScript
  - **Feature tests:** `estrutura: dom imutavel` (já escrito na Fase 1) afirma que `innerHTML`, `createElement`, `appendChild`, `insertAdjacent` e `.remove(` não aparecem no script — é a prova estática de que o esqueleto é imutável (US-2.1, US-2.2)
  - **Design ref:** não há `.spec/init/design/`; a estrutura por era está descrita em US-3.1 a US-3.5
  - **Traces:** US-2.1, US-2.2

### Phase 2.3: O sistema de tokens

- [ ] **Task:** Registrar os nove tokens interpoláveis com `@property`
  - **Acceptance criteria:**
    - Há um bloco `@property` para cada um de: `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--raio`, `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`
    - Cada bloco declara `syntax` (`'<color>'`, `'<length>'` ou `'<number>'` conforme o token), `inherits` e `initial-value`
    - Os três tokens não registrados — `--fonte-corpo`, `--sombra`, `--textura-fundo` — **não** têm `@property`, e isso é intencional: eles trocam sem interpolar
    - Os `initial-value` produzem uma página legível mesmo antes de qualquer era declarar seus valores
  - **Feature tests:** `estrutura: nove tokens registrados com @property` (já escrito na Fase 1) afirma a presença e a completude dos nove blocos — sem eles a cor e o comprimento saltam em vez de interpolar, e a US-2.1 falha na prática (US-2.1)
  - **Traces:** US-2.1
- [ ] **Task:** Escrever a regra base que consome os doze tokens e declara a transição
  - **Acceptance criteria:**
    - Toda diferença visual entre eras é lida de um dos 12 tokens — nenhum valor de cor, largura ou espaçamento é escrito direto em regra de componente
    - A transição cobre os nove tokens registrados mais as propriedades derivadas deles
    - A duração é **um valor único**, declarado uma vez, entre `600ms` e `900ms`, com easing de saída suave
    - Um salto não adjacente (1995 → 2040) usa exatamente a mesma duração que um salto adjacente
    - Nenhuma animação roda no carregamento inicial — a página nasce em 1995 sem transição
  - **Feature tests:**
    - `estrutura: duracao de transicao entre 600ms e 900ms` (Fase 1) → afirma a faixa fechada, que é o parâmetro da US-2.1
    - `estrutura: duracao de transicao e unica` → afirma que só existe um valor de duração declarado para a troca de era, garantindo que saltos adjacentes e não adjacentes levem o mesmo tempo (US-2.3)
  - **Traces:** US-2.1, US-2.3, US-1.2
- [ ] **Task:** Escrever a regra de colapso do conteúdo datado
  - **Acceptance criteria:**
    - Um elemento `data-era-only="<ano>"` fora da sua era vai a `opacity: 0`, altura zero (via `max-height`) e escala reduzida — animado, no mesmo tempo da transição geral
    - Nenhuma regra que casa `[data-era-only]` usa `display:none` nem `visibility:hidden`
    - O elemento colapsado não é focável por teclado nem lido por leitor de tela
    - Voltar para a era de origem faz o elemento reaparecer pelo mesmo caminho, animado
    - O elemento permanece no DOM em todas as eras
  - **Feature tests:** `estrutura: conteudo datado nunca usa display none` (Fase 1) → afirma a ausência de `display:none` e `visibility:hidden` nas regras de `[data-era-only]`, que é a regra que torna a transformação contínua (US-2.2)
  - **Traces:** US-2.2

### Phase 2.4: O motor de troca

- [ ] **Task:** Construir o seletor de anos
  - **Acceptance criteria:**
    - `<nav id="seletor">` contém exatamente 5 `<button data-ir-para="<ano>">`
    - Os anos aparecem em ordem cronológica da esquerda para a direita: 1995, 2005, 2015, 2026, 2040
    - Os botões são elementos `<button>` de verdade, não `<div>` com handler
    - O seletor está presente e acessível em **todas** as eras, inclusive em 2040, onde todo o resto do cromo desaparece
  - **Feature tests:** `estrutura: seletor tem exatamente cinco botoes em ordem` (Fase 1) → afirma quantidade, valores e ordem, travando a espinha da US-1.1
  - **Design ref:** não há `.spec/init/design/`; a pele por era está em US-3.6
  - **Traces:** US-1.1, US-3.5
- [ ] **Task:** Implementar a troca de era
  - **Acceptance criteria:**
    - Clicar num botão escreve **apenas** o atributo `data-era` no `<html>` — nenhuma outra mutação de DOM
    - Nenhum reload, nenhuma requisição de rede, nenhuma mudança de URL acontecem na troca
    - Clicar duas vezes no mesmo ano não produz efeito acumulado nem visual diferente do primeiro clique
    - Qualquer par de eras é alcançável em um clique, incluindo saltos não adjacentes
    - Trocar de era durante uma transição em andamento não deixa a página em estado intermediário travado
    - O estado vive só em memória: recarregar a página volta para 1995, e nada é gravado em `localStorage`, cookie ou URL
  - **Feature tests:**
    - `estrutura: troca escreve apenas data-era` → afirma que o handler não contém nenhuma das `APIS_PROIBIDAS` e que a única escrita é em `data-era`, provando a idempotência e a imutabilidade do DOM da US-1.1 e US-2.3
    - `estrutura: sem persistencia de estado` → afirma que o script não referencia `localStorage`, `sessionStorage`, `document.cookie` nem `location.hash`, travando a decisão de estado puramente em memória (US-1.2)
  - **Traces:** US-1.1, US-2.3, US-1.2
- [ ] **Task:** Marcar a era ativa e neutralizar o conteúdo colapsado
  - **Acceptance criteria:**
    - O botão da era ativa recebe `aria-current="true"`; os outros quatro não o têm
    - A era ativa é visualmente distinta das outras quatro, e a distinção **não depende só de cor** — há uma segunda pista (peso, borda, tamanho ou marcador)
    - Elementos `data-era-only` fora da era atual recebem `inert` (ou `aria-hidden="true"`), saindo da ordem de foco e da leitura de tela
    - O atributo é retirado quando o elemento volta à sua era
  - **Feature tests:** `estrutura: era ativa marcada por aria-current` → afirma que o handler aplica `aria-current` a exatamente um botão por vez, o que é o contrato de acessibilidade da US-1.3
  - **Traces:** US-1.3, US-2.2
- [ ] **Task:** Garantir a operação por teclado
  - **Acceptance criteria:**
    - Os cinco controles são alcançáveis por `Tab`, na ordem cronológica
    - `Enter` e `Espaço` acionam a troca de era (comportamento nativo de `<button>`, não reimplementado)
    - Existe regra de foco visível própria, não removida por reset de CSS nem pelo Tailwind
    - O foco não é perdido nem reposicionado pela troca de era — quem trocou continua com o foco no botão que acionou
  - **Feature tests:** `estrutura: foco visivel nao e suprimido` → afirma que não há `outline: none` sem uma regra de foco substituta declarada, protegendo a US-1.4 contra o reset do Tailwind
  - **Traces:** US-1.4
- [ ] **Task:** Confirmar `estrutura.test.mjs` inteiramente verde
  - **Acceptance criteria:**
    - `node --test test/estrutura.test.mjs` passa em todos os casos
    - `bash verify.sh` continua saindo **1**, e a saída nomeia as cinco eras como incompletas
    - Abrir `index.html` via `file://` mostra a página funcional e a troca de era funcionando, ainda sem identidade de época
    - Nenhum `TODO` ou `FIXME` foi introduzido
  - **Traces:** US-5.2, US-5.4

---

## Phase 3: A era 1995

**Goal:** Dar à página a cara da web de 1995 — tabela centralizada, cinza, Times New Roman e contador de visitas. · **Depends on:** Phase 2 · **Covers:** US-3.1, US-3.6, US-2.2, US-4.2

**Contexto desta fase.** A página é uma máquina do tempo com cinco eras (`1995`, `2005`, `2015`, `2026`, `2040`). O esqueleto, os tokens e o motor de troca já existem. Esta fase preenche **apenas a era 1995**. Não mexa nas outras quatro.

**Contrato verificável (recapitulado — esta fase é auto-contida):**

- Arquivo único: `exemplo-maquina-do-tempo/index.html` (HTML + `<style>` + `<script>` inline).
- Declare os valores desta era numa regra `:root[data-era="1995"]`, com os **12 tokens**: tema (8) `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--fonte-corpo`, `--raio`, `--sombra`, `--textura-fundo`; estrutura (4) `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`.
- Conteúdo exclusivo desta era usa `data-era-only="1995"`. Ele colapsa fora dela por `opacity`/`max-height`/`transform` — **nunca** `display:none` nem `visibility:hidden`, e nunca é removido do DOM.
- Proibido no JavaScript: `innerHTML`, `createElement`, `appendChild`, `insertAdjacent`, `.remove(`. Esta fase não deveria precisar tocar no script.
- Nenhum `font-size` em px abaixo de **16px**.
- A pele do seletor desta era é uma regra que estiliza `#seletor` sob `[data-era="1995"]`.

**Saída esperada ao terminar esta fase:** `bash verify.sh` ainda sai **1**, mas o bloco `eras: 1995 …` de `test/eras.test.mjs` fica verde. As outras quatro eras continuam vermelhas — é o esperado.

### Phase 3.1: Identidade visual de 1995

- [ ] **Task:** Declarar os oito tokens de tema de 1995
  - **Acceptance criteria:**
    - `--cor-fundo` é o cinza `#c0c0c0` da época
    - `--textura-fundo` traz uma textura repetida, no espírito dos fundos tileados de 1995
    - `--fonte-corpo` é Times New Roman (com fallback serif)
    - `--cor-link` é o azul de link não visitado, e os links aparecem **sublinhados**
    - `--raio` é `0px` e `--sombra` é `none` — a era não conhece nem canto arredondado nem sombra
    - `--cor-texto` e `--cor-acento` mantêm contraste AA (4.5:1) contra `--cor-fundo`
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.1**
  - **Traces:** US-3.1
- [ ] **Task:** Declarar os quatro tokens de estrutura de 1995
  - **Acceptance criteria:**
    - `--largura-pagina` é próximo de `640px`, centralizado — a página de largura fixa da época
    - `--largura-sidebar` é `0px`: 1995 não tem sidebar, e a região colapsa por largura
    - `--espaco` e `--escala-tipo` produzem a densidade apertada característica da era
    - O conteúdo aparece em **coluna única**
    - A aparência é de tabela centralizada, sem que isso quebre a regra de DOM compartilhado — o efeito vem dos tokens, não de um `<table>` exclusivo desta era
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.1**
  - **Traces:** US-3.1

### Phase 3.2: Conteúdo datado de 1995

- [ ] **Task:** Escrever o conteúdo exclusivo de 1995
  - **Acceptance criteria:**
    - Existe um contador de visitas, marcado `data-era-only="1995"`
    - Existe o aviso "Best viewed in Netscape Navigator", marcado `data-era-only="1995"`
    - Existe uma marca de obra em construção, marcada `data-era-only="1995"`
    - Existe uma linha de "última atualização em…", marcada `data-era-only="1995"`
    - Separadores `<hr>` aparecem entre seções, como marcador visual da época
    - Todos esses elementos permanecem no DOM nas outras quatro eras, colapsados conforme a regra de colapso
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.1**
  - **Traces:** US-3.1, US-2.2
- [ ] **Task:** Vestir o seletor com a pele de 1995
  - **Acceptance criteria:**
    - Sob `[data-era="1995"]`, o `#seletor` tem tratamento de botão 3D com borda chanfrada, no espírito dos controles da época
    - A era ativa continua distinguível por uma pista além da cor
    - O indicador de foco continua visível sobre o fundo texturizado cinza
    - Os rótulos dos anos continuam legíveis a distância
    - A troca de pele é animada pelas mesmas regras de transição — nada de corte abrupto
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.6** e a **US-3.1**
  - **Traces:** US-3.6, US-1.3, US-1.4

### Phase 3.3: Fechar a era

- [ ] **Task:** Validar legibilidade de palco em 1995
  - **Acceptance criteria:**
    - Nenhum texto de conteúdo fica abaixo de 16px efetivos nesta era
    - O contraste texto/fundo passa em AA (4.5:1)
    - A página inteira cabe em 1280×720 sem rolagem horizontal
    - Os rótulos do seletor têm tamanho e peso suficientes para leitura a distância
  - **Feature tests:** `eras: nenhuma fonte de conteudo abaixo de 16px` (Fase 1) → afirma o piso de 16px para todo o arquivo, protegendo a leitura em projetor da US-4.2
  - **Traces:** US-4.2
- [ ] **Task:** Confirmar o bloco de 1995 verde e a transição funcionando
  - **Acceptance criteria:**
    - Os casos `eras: 1995 …` de `test/eras.test.mjs` passam: 8 tokens de tema, 4 de estrutura, conteúdo datado próprio e pele do seletor
    - `bash verify.sh` continua saindo `1`, nomeando as outras quatro eras como incompletas
    - Trocar de 1995 para outra era e voltar anima os elementos datados em vez de piscá-los
    - Nenhum `TODO` ou `FIXME` foi introduzido
  - **Traces:** US-3.1, US-5.2, US-5.4

---

## Phase 4: A era 2005

**Goal:** Dar à página a cara do Web 2.0 — gradiente glossy, sidebar entulhada e "beta" eterno. · **Depends on:** Phase 2 · **Covers:** US-3.2, US-3.6, US-2.2, US-4.2

**Contexto desta fase.** A página é uma máquina do tempo com cinco eras (`1995`, `2005`, `2015`, `2026`, `2040`). O esqueleto, os tokens e o motor de troca já existem. Esta fase preenche **apenas a era 2005**. Não mexa nas outras quatro.

**Contrato verificável (recapitulado — esta fase é auto-contida):**

- Arquivo único: `exemplo-maquina-do-tempo/index.html` (HTML + `<style>` + `<script>` inline).
- Declare os valores desta era numa regra `:root[data-era="2005"]`, com os **12 tokens**: tema (8) `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--fonte-corpo`, `--raio`, `--sombra`, `--textura-fundo`; estrutura (4) `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`.
- Conteúdo exclusivo desta era usa `data-era-only="2005"`. Ele colapsa fora dela por `opacity`/`max-height`/`transform` — **nunca** `display:none` nem `visibility:hidden`, e nunca é removido do DOM.
- Proibido no JavaScript: `innerHTML`, `createElement`, `appendChild`, `insertAdjacent`, `.remove(`. Esta fase não deveria precisar tocar no script.
- Nenhum `font-size` em px abaixo de **16px**.
- A pele do seletor desta era é uma regra que estiliza `#seletor` sob `[data-era="2005"]`.

**Saída esperada ao terminar esta fase:** `bash verify.sh` ainda sai **1**, mas o bloco `eras: 2005 …` de `test/eras.test.mjs` fica verde.

### Phase 4.1: Identidade visual de 2005

- [ ] **Task:** Declarar os oito tokens de tema de 2005
  - **Acceptance criteria:**
    - `--cor-fundo` e `--cor-acento` formam a paleta azul e laranja do Web 2.0
    - `--fonte-corpo` é Verdana ou Tahoma (com fallback sans-serif)
    - `--raio` traz cantos arredondados visíveis e `--sombra` uma sombra suave
    - Há gradiente glossy e reflexo nos elementos de destaque, alimentados por `--cor-acento`
    - `--textura-fundo` acompanha o estilo da época sem competir com o gradiente
    - O contraste texto/fundo passa em AA (4.5:1)
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.2**
  - **Traces:** US-3.2
- [ ] **Task:** Declarar os quatro tokens de estrutura de 2005
  - **Acceptance criteria:**
    - `--largura-pagina` é próximo de `760px`
    - `--largura-sidebar` é **maior que zero** — esta é a única era com sidebar visível
    - A transição de 1995 para 2005 mostra a sidebar **crescendo de zero**, não aparecendo de repente
    - `--espaco` e `--escala-tipo` produzem a densidade da época
    - O layout resultante é de duas colunas: conteúdo principal mais sidebar
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.2**
  - **Traces:** US-3.2, US-2.2
- [ ] **Task:** Escrever o conteúdo exclusivo de 2005
  - **Acceptance criteria:**
    - Existe um badge "beta", marcado `data-era-only="2005"`
    - Existe um ícone/link de RSS, marcado `data-era-only="2005"`
    - Existe uma tag cloud, marcada `data-era-only="2005"`
    - Existe uma caixa de newsletter, marcada `data-era-only="2005"`
    - Existe um botão de compartilhamento social da época, marcado `data-era-only="2005"`
    - O conteúdo da sidebar é o que ocupa a região secundária nesta era
    - Todos esses elementos permanecem no DOM nas outras quatro eras, colapsados
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.2**
  - **Traces:** US-3.2, US-2.2
- [ ] **Task:** Vestir o seletor com a pele de 2005
  - **Acceptance criteria:**
    - Sob `[data-era="2005"]`, o `#seletor` ganha gradiente glossy, canto arredondado e reflexo
    - A era ativa continua distinguível por uma pista além da cor
    - O indicador de foco continua visível sobre o gradiente
    - A troca de pele é animada pelas mesmas regras de transição
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.6** e a **US-3.2**
  - **Traces:** US-3.6, US-1.3, US-1.4
- [ ] **Task:** Validar legibilidade de palco em 2005
  - **Acceptance criteria:**
    - Nenhum texto de conteúdo fica abaixo de 16px efetivos nesta era
    - O contraste texto/fundo passa em AA (4.5:1), inclusive sobre o gradiente
    - A página inteira cabe em 1280×720 sem rolagem horizontal, com a sidebar aberta
    - Os rótulos do seletor continuam legíveis a distância
  - **Feature tests:** `eras: nenhuma fonte de conteudo abaixo de 16px` (Fase 1) → afirma o piso de 16px para todo o arquivo (US-4.2)
  - **Traces:** US-4.2
- [ ] **Task:** Confirmar o bloco de 2005 verde e o morph da sidebar
  - **Acceptance criteria:**
    - Os casos `eras: 2005 …` de `test/eras.test.mjs` passam: 8 tokens de tema, 4 de estrutura, conteúdo datado próprio e pele do seletor
    - `bash verify.sh` continua saindo `1`, nomeando as eras restantes
    - Ir de 1995 para 2005 anima a sidebar crescendo; voltar anima ela encolhendo a zero
    - Nenhum `TODO` ou `FIXME` foi introduzido
  - **Traces:** US-3.2, US-2.2, US-5.2

---

## Phase 5: A era 2015

**Goal:** Dar à página a cara do flat design — cor chapada, hero full-width e grid de cards. · **Depends on:** Phase 2 · **Covers:** US-3.3, US-3.6, US-2.2, US-4.2

**Contexto desta fase.** A página é uma máquina do tempo com cinco eras (`1995`, `2005`, `2015`, `2026`, `2040`). O esqueleto, os tokens e o motor de troca já existem. Esta fase preenche **apenas a era 2015**. Não mexa nas outras quatro.

**Contrato verificável (recapitulado — esta fase é auto-contida):**

- Arquivo único: `exemplo-maquina-do-tempo/index.html` (HTML + `<style>` + `<script>` inline).
- Declare os valores desta era numa regra `:root[data-era="2015"]`, com os **12 tokens**: tema (8) `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--fonte-corpo`, `--raio`, `--sombra`, `--textura-fundo`; estrutura (4) `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`.
- Conteúdo exclusivo desta era usa `data-era-only="2015"`. Ele colapsa fora dela por `opacity`/`max-height`/`transform` — **nunca** `display:none` nem `visibility:hidden`, e nunca é removido do DOM.
- Proibido no JavaScript: `innerHTML`, `createElement`, `appendChild`, `insertAdjacent`, `.remove(`. Esta fase não deveria precisar tocar no script.
- Nenhum `font-size` em px abaixo de **16px**.
- A pele do seletor desta era é uma regra que estiliza `#seletor` sob `[data-era="2015"]`.

**Saída esperada ao terminar esta fase:** `bash verify.sh` ainda sai **1**, mas o bloco `eras: 2015 …` de `test/eras.test.mjs` fica verde.

### Phase 5.1: Identidade visual de 2015

- [ ] **Task:** Declarar os oito tokens de tema de 2015
  - **Acceptance criteria:**
    - As cores são chapadas e saturadas, sem gradiente
    - `--sombra` é `none` e `--textura-fundo` é neutra — o flat design não tem nem uma nem outra
    - `--fonte-corpo` é Helvetica ou Open Sans (com fallback sans-serif)
    - `--cor-fundo` é predominantemente branco
    - `--raio` é pequeno mas não zero, no espírito dos cards da época
    - O contraste texto/fundo passa em AA (4.5:1)
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.3**
  - **Traces:** US-3.3
- [ ] **Task:** Declarar os quatro tokens de estrutura de 2015
  - **Acceptance criteria:**
    - `--largura-pagina` é bem maior que nas eras anteriores, aproximando o hero de largura total
    - `--largura-sidebar` volta a `0px` — 2015 abandonou a sidebar
    - `--espaco` cresce visivelmente em relação a 2005: o flat design respira mais
    - `--escala-tipo` cresce, refletindo a tipografia maior da época
    - O resultado é hero de largura total seguido de grid de cards, com rolagem longa
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.3**
  - **Traces:** US-3.3
- [ ] **Task:** Escrever o conteúdo exclusivo de 2015
  - **Acceptance criteria:**
    - Existe um call to action grande, marcado `data-era-only="2015"`
    - Existem ícones lineares, marcados `data-era-only="2015"`
    - Existe um botão "Sign up free", marcado `data-era-only="2015"`
    - Existe uma seção de depoimentos, marcada `data-era-only="2015"`
    - Todos esses elementos permanecem no DOM nas outras quatro eras, colapsados
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.3**
  - **Traces:** US-3.3, US-2.2
- [ ] **Task:** Vestir o seletor com a pele de 2015
  - **Acceptance criteria:**
    - Sob `[data-era="2015"]`, o `#seletor` fica flat: cor chapada, sem sombra, sem gradiente
    - A era ativa continua distinguível por uma pista além da cor
    - O indicador de foco continua visível sobre o fundo claro
    - A troca de pele é animada pelas mesmas regras de transição
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.6** e a **US-3.3**
  - **Traces:** US-3.6, US-1.3, US-1.4
- [ ] **Task:** Garantir que a transição de 2005 para 2015 mostre a perda do cromo
  - **Acceptance criteria:**
    - Indo de 2005 para 2015, o gradiente e a sombra vão a zero **animando**, não sumindo de uma vez
    - A sidebar encolhe de sua largura de 2005 até `0px` no mesmo movimento
    - O raio de borda interpola entre os dois valores em vez de saltar
    - Voltar de 2015 para 2005 refaz o caminho inverso, animado
  - **Feature tests:** `estrutura: duracao de transicao e unica` (Fase 2) → garante que este salto usa o mesmo tempo dos demais, sustentando a US-2.3
  - **Traces:** US-3.3, US-2.1, US-2.3
- [ ] **Task:** Validar legibilidade de palco e fechar a era 2015
  - **Acceptance criteria:**
    - Nenhum texto de conteúdo fica abaixo de 16px efetivos nesta era, e o contraste passa em AA
    - A página cabe em 1280×720 sem rolagem horizontal
    - Os casos `eras: 2015 …` de `test/eras.test.mjs` passam: 8 tokens de tema, 4 de estrutura, conteúdo datado próprio e pele do seletor
    - `bash verify.sh` continua saindo `1`, nomeando as eras restantes
    - Nenhum `TODO` ou `FIXME` foi introduzido
  - **Feature tests:** `eras: nenhuma fonte de conteudo abaixo de 16px` (Fase 1) → afirma o piso de 16px para todo o arquivo (US-4.2)
  - **Traces:** US-3.3, US-4.2, US-5.2

---

## Phase 6: A era 2026

**Goal:** Dar à página a cara do presente — dark mode, vidro sutil, grid assimétrico e banner de consentimento. · **Depends on:** Phase 2 · **Covers:** US-3.4, US-3.6, US-2.2, US-4.2

**Contexto desta fase.** A página é uma máquina do tempo com cinco eras (`1995`, `2005`, `2015`, `2026`, `2040`). O esqueleto, os tokens e o motor de troca já existem. Esta fase preenche **apenas a era 2026**. Não mexa nas outras quatro.

**Contrato verificável (recapitulado — esta fase é auto-contida):**

- Arquivo único: `exemplo-maquina-do-tempo/index.html` (HTML + `<style>` + `<script>` inline).
- Declare os valores desta era numa regra `:root[data-era="2026"]`, com os **12 tokens**: tema (8) `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--fonte-corpo`, `--raio`, `--sombra`, `--textura-fundo`; estrutura (4) `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`.
- Conteúdo exclusivo desta era usa `data-era-only="2026"`. Ele colapsa fora dela por `opacity`/`max-height`/`transform` — **nunca** `display:none` nem `visibility:hidden`, e nunca é removido do DOM.
- Proibido no JavaScript: `innerHTML`, `createElement`, `appendChild`, `insertAdjacent`, `.remove(`. Esta fase não deveria precisar tocar no script.
- Nenhum `font-size` em px abaixo de **16px**.
- A pele do seletor desta era é uma regra que estiliza `#seletor` sob `[data-era="2026"]`.

**Saída esperada ao terminar esta fase:** `bash verify.sh` ainda sai **1** — só a era 2040 continua faltando. O bloco `eras: 2026 …` fica verde.

### Phase 6.1: Identidade visual de 2026

- [ ] **Task:** Declarar os oito tokens de tema de 2026
  - **Acceptance criteria:**
    - `--cor-fundo` é escuro: dark mode é o padrão desta era, não uma opção
    - `--cor-acento` alimenta um gradiente de acento sutil
    - `--fonte-corpo` usa tipografia variável (com fallback sans-serif)
    - `--sombra` produz o efeito de vidro sutil, sem o peso da sombra de 2005
    - `--raio` é generoso, no espírito das superfícies atuais
    - O contraste texto/fundo passa em AA (4.5:1) no escuro — a checagem é mais exigente aqui, não menos
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.4**
  - **Traces:** US-3.4
- [ ] **Task:** Declarar os quatro tokens de estrutura de 2026
  - **Acceptance criteria:**
    - `--largura-pagina` produz largura confortável de leitura, menor que a de 2015
    - `--largura-sidebar` permanece `0px`
    - `--espaco` é o maior das cinco eras — o espaçamento generoso é a assinatura do presente
    - `--escala-tipo` sustenta a hierarquia do grid assimétrico
    - A navegação é sticky e o grid é visivelmente assimétrico
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.4**
  - **Traces:** US-3.4
- [ ] **Task:** Escrever o conteúdo exclusivo de 2026
  - **Acceptance criteria:**
    - Existe um banner de consentimento de cookies, marcado `data-era-only="2026"`
    - Existe um badge "AI-powered", marcado `data-era-only="2026"`
    - A copy desta era é curta e direta, em contraste com a verborragia de 2005
    - Todos esses elementos permanecem no DOM nas outras quatro eras, colapsados
    - O banner de consentimento não bloqueia a interação com o seletor de anos
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.4**
  - **Traces:** US-3.4, US-2.2
- [ ] **Task:** Vestir o seletor com a pele de 2026
  - **Acceptance criteria:**
    - Sob `[data-era="2026"]`, o `#seletor` adota o vidro sutil e o gradiente de acento da era
    - A era ativa continua distinguível por uma pista além da cor
    - O indicador de foco continua visível **no dark mode**, que é onde ele mais costuma sumir
    - A troca de pele é animada pelas mesmas regras de transição
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.6** e a **US-3.4**
  - **Traces:** US-3.6, US-1.3, US-1.4
- [ ] **Task:** Verificar a redução de cromo em relação a 2005 e 2015
  - **Acceptance criteria:**
    - A quantidade de elementos de interface visíveis em 2026 é perceptivelmente menor que em 2005 e em 2015
    - A transição de 2015 para 2026 mostra a inversão de luminância animando, sem piscar branco
    - A leitura 2005 → 2015 → 2026 deixa clara a curva de redução
  - **Traces:** US-3.4, US-2.1
- [ ] **Task:** Validar legibilidade de palco e fechar a era 2026
  - **Acceptance criteria:**
    - Nenhum texto de conteúdo fica abaixo de 16px efetivos nesta era, e o contraste passa em AA no escuro
    - A página cabe em 1280×720 sem rolagem horizontal
    - Os casos `eras: 2026 …` de `test/eras.test.mjs` passam: 8 tokens de tema, 4 de estrutura, conteúdo datado próprio e pele do seletor
    - `bash verify.sh` continua saindo `1`, nomeando apenas 2040 como incompleta
    - Nenhum `TODO` ou `FIXME` foi introduzido
  - **Feature tests:** `eras: nenhuma fonte de conteudo abaixo de 16px` (Fase 1) → afirma o piso de 16px para todo o arquivo (US-4.2)
  - **Traces:** US-3.4, US-4.2, US-5.2

---

## Phase 7: A era 2040

**Goal:** Fazer a página deixar de ser página — cromo ausente, campo de intenção no centro, o site virou agente. · **Depends on:** Phase 2 · **Covers:** US-3.5, US-3.6, US-2.2, US-4.2

**Contexto desta fase.** A página é uma máquina do tempo com cinco eras (`1995`, `2005`, `2015`, `2026`, `2040`). O esqueleto, os tokens e o motor de troca já existem, e as quatro eras anteriores já estão implementadas. Esta fase preenche **apenas a era 2040**, que é a única ficcional das cinco e fecha o arco: o cromo cresce até 2005, começa a sumir em 2015, e aqui sobra só a intenção.

**Contrato verificável (recapitulado — esta fase é auto-contida):**

- Arquivo único: `exemplo-maquina-do-tempo/index.html` (HTML + `<style>` + `<script>` inline).
- Declare os valores desta era numa regra `:root[data-era="2040"]`, com os **12 tokens**: tema (8) `--cor-fundo`, `--cor-texto`, `--cor-acento`, `--cor-link`, `--fonte-corpo`, `--raio`, `--sombra`, `--textura-fundo`; estrutura (4) `--largura-pagina`, `--largura-sidebar`, `--espaco`, `--escala-tipo`.
- Conteúdo exclusivo desta era usa `data-era-only="2040"`. Ele colapsa fora dela por `opacity`/`max-height`/`transform` — **nunca** `display:none` nem `visibility:hidden`, e nunca é removido do DOM.
- Proibido no JavaScript: `innerHTML`, `createElement`, `appendChild`, `insertAdjacent`, `.remove(`. O campo de intenção é **estético**, não funcional — ele não gera conteúdo de verdade e por isso não precisa tocar no DOM.
- Nenhum `font-size` em px abaixo de **16px**.
- A pele do seletor desta era é uma regra que estiliza `#seletor` sob `[data-era="2040"]`.
- **Regra dura:** o seletor de anos continua presente e acessível em 2040, apesar de todo o resto do cromo desaparecer. Sem ele o visitante fica preso no futuro.

**Saída esperada ao terminar esta fase:** `test/eras.test.mjs` fica **inteiramente verde**. `bash verify.sh` pode sair `0` já aqui se nenhuma pendência tiver sobrado — a Fase 8 existe para garantir isso e para costurar o que só se vê olhando as cinco eras juntas.

### Phase 7.1: A página que quase desaparece

- [ ] **Task:** Declarar os oito tokens de tema de 2040
  - **Acceptance criteria:**
    - `--cor-fundo` é neutro e o cromo é praticamente ausente
    - `--sombra` é `none` e `--textura-fundo` é neutra
    - `--fonte-corpo` sustenta tipografia grande
    - `--cor-acento` e `--cor-link` existem, mas quase não têm onde aparecer — não há navegação para colorir
    - O contraste texto/fundo passa em AA (4.5:1)
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.5**
  - **Traces:** US-3.5
- [ ] **Task:** Declarar os quatro tokens de estrutura de 2040
  - **Acceptance criteria:**
    - `--escala-tipo` é o maior das cinco eras — a tipografia grande é a estrutura
    - `--largura-sidebar` é `0px`
    - `--largura-pagina` centraliza o campo de intenção
    - `--espaco` produz o vazio que faz a página parecer esvaziada, não quebrada
    - O resultado é um campo de intenção centralizado com a área de resposta abaixo dele
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.5**
  - **Traces:** US-3.5
- [ ] **Task:** Escrever o conteúdo exclusivo de 2040
  - **Acceptance criteria:**
    - Existe um campo de intenção centralizado, marcado `data-era-only="2040"`
    - Existe uma área de resposta abaixo dele, marcada `data-era-only="2040"`
    - Não há menu, não há navegação e não há rodapé visíveis nesta era — os elementos das outras eras estão colapsados
    - O campo de intenção **não é funcional**: é representação estética, e o texto ao redor deixa isso claro para que não pareça um bug
    - O campo não promete resposta: nenhum spinner, nenhum "processando", nenhuma mensagem de erro
    - Os elementos permanecem no DOM nas outras quatro eras, colapsados
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.5**
  - **Traces:** US-3.5, US-2.2
- [ ] **Task:** Vestir o seletor com a pele de 2040 sem perder o visitante
  - **Acceptance criteria:**
    - Sob `[data-era="2040"]`, o `#seletor` adota a estética mínima da era
    - O seletor **permanece visível e clicável** apesar da ausência de cromo — é o único controle que sobrevive a 2040
    - A era ativa continua distinguível por uma pista além da cor
    - O indicador de foco continua visível
    - De 2040 é possível voltar a qualquer uma das quatro eras anteriores em um clique
  - **Design ref:** não há `.spec/init/design/`; a referência é a **US-3.6** e a **US-3.5**
  - **Traces:** US-3.6, US-3.5, US-2.3, US-1.3, US-1.4
- [ ] **Task:** Validar o salto extremo 1995 ↔ 2040
  - **Acceptance criteria:**
    - Ir de 1995 direto para 2040 usa a mesma duração de um salto adjacente
    - Todos os elementos datados de 1995 colapsam animando enquanto os de 2040 crescem, no mesmo movimento
    - Voltar de 2040 para 1995 refaz o caminho inverso sem estado intermediário travado
    - Trocar de era no meio dessa transição não trava a página
  - **Feature tests:** `estrutura: duracao de transicao e unica` (Fase 2) → sustenta a regra de que salto adjacente e não adjacente custam o mesmo tempo, que é o coração da US-2.3
  - **Traces:** US-2.3, US-2.1
- [ ] **Task:** Validar legibilidade de palco e fechar a era 2040
  - **Acceptance criteria:**
    - Nenhum texto de conteúdo fica abaixo de 16px efetivos nesta era, e o contraste passa em AA
    - A página cabe em 1280×720 sem rolagem horizontal
    - Os casos `eras: 2040 …` de `test/eras.test.mjs` passam, e o arquivo inteiro fica verde
    - `bash verify.sh` é executado e o resultado é registrado
    - Nenhum `TODO` ou `FIXME` foi introduzido
  - **Feature tests:** `eras: nenhuma fonte de conteudo abaixo de 16px` (Fase 1) → afirma o piso de 16px para todo o arquivo (US-4.2)
  - **Traces:** US-3.5, US-4.2, US-5.2

---

## Phase 8: Acabamento ao vivo e portão verde

**Goal:** Costurar o que só se vê olhando as cinco eras juntas, garantir o palco e fechar o portão em `exit 0`. · **Depends on:** Phase 3, Phase 4, Phase 5, Phase 6, Phase 7 · **Covers:** US-1.3, US-1.4, US-3.5, US-3.6, US-4.2, US-4.3, US-5.1, US-5.3

**Contexto desta fase.** A página é uma máquina do tempo com cinco eras (`1995`, `2005`, `2015`, `2026`, `2040`) num arquivo único, `exemplo-maquina-do-tempo/index.html`. As cinco eras já estão implementadas. Esta fase não adiciona era nenhuma: ela corrige o que só aparece quando se percorre as cinco em sequência, valida o uso em projetor e fecha o portão.

**Contrato verificável (recapitulado — esta fase é auto-contida):**

- Arquivo único: `exemplo-maquina-do-tempo/index.html` (HTML + `<style>` + `<script>` inline).
- Eras: `1995`, `2005`, `2015`, `2026`, `2040`; estado no atributo `data-era` do `<html>`, inicial `1995`.
- 12 tokens por era, 9 registrados com `@property`. Conteúdo datado por `data-era-only="<ano>"`, colapsando por `opacity`/`max-height`/`transform` e **nunca** por `display:none`.
- JavaScript proibido de usar `innerHTML`, `createElement`, `appendChild`, `insertAdjacent`, `.remove(`.
- O portão é `bash verify.sh`, com dois gates: `node --test test/` e `node scripts/check-pendencias.mjs`.

**Saída esperada ao terminar esta fase:** `bash verify.sh` sai **0**. É a primeira vez no projeto inteiro.

### Phase 8.1: Coerência entre as cinco eras

- [ ] **Task:** Ajustar o arco narrativo do cromo
  - **Acceptance criteria:**
    - Percorrer 1995 → 2005 → 2015 → 2026 → 2040 mostra o cromo crescendo até 2005, começando a sumir em 2015 e praticamente ausente em 2040
    - A curva é perceptível sem explicação verbal — a quantidade de elementos de interface visíveis por era sustenta a leitura
    - Nenhuma era quebra a curva por acidente (por exemplo, 2026 com mais cromo que 2015)
    - Ler as cinco em sequência conta uma história, e não uma lista de estilos
  - **Design ref:** não há `.spec/init/design/`; a referência é o Expected Result da **US-3.5**
  - **Traces:** US-3.5
- [ ] **Task:** Revisar o seletor nas cinco eras de uma vez
  - **Acceptance criteria:**
    - Em cada uma das cinco eras o seletor está legível, clicável e com a era ativa distinguível
    - A distinção da era ativa nunca depende só de cor — a segunda pista existe nas cinco
    - `aria-current="true"` está em exatamente um botão por vez, nas cinco eras
    - A troca de pele do seletor é animada em todas as transições, sem corte abrupto
    - Nenhuma pele deixa o seletor confundir-se com o fundo
  - **Feature tests:** `eras: <ano> tem pele propria no seletor` (Fase 1) → afirma para as cinco eras que existe regra de `#seletor` sob `[data-era="<ano>"]`, sustentando a US-3.6 sem quebrar a US-1.3
  - **Traces:** US-3.6, US-1.3

### Phase 8.2: Palco e acessibilidade

- [ ] **Task:** Garantir foco visível nas cinco eras
  - **Acceptance criteria:**
    - O indicador de foco tem contraste suficiente sobre o fundo texturizado cinza de 1995
    - Tem contraste suficiente sobre o gradiente glossy de 2005
    - Tem contraste suficiente sobre o branco de 2015
    - Tem contraste suficiente sobre o dark mode de 2026 e sobre o neutro de 2040
    - Percorrer os cinco botões por `Tab` e trocar de era por `Enter` funciona sem mouse, e o foco permanece no botão acionado
  - **Feature tests:** `estrutura: foco visivel nao e suprimido` (Fase 2) → afirma que não há `outline: none` sem regra de foco substituta, protegendo a US-1.4 contra o reset do Tailwind
  - **Traces:** US-1.4, US-1.3
- [ ] **Task:** Validar contraste AA nas cinco eras
  - **Acceptance criteria:**
    - O contraste entre texto e fundo é de pelo menos 4.5:1 para texto normal, nas cinco eras
    - Os rótulos dos anos no seletor passam no mesmo critério nas cinco peles
    - Onde uma era histórica exigiria contraste ruim para ser fiel, a legibilidade ganha — e a escolha fica registrada no README
    - Nenhum ajuste de contraste quebra os testes de era já verdes
  - **Traces:** US-4.2
- [ ] **Task:** Validar a página em viewport de projetor
  - **Acceptance criteria:**
    - A página inteira cabe em 1280×720 sem rolagem horizontal, nas cinco eras
    - Nenhum texto de conteúdo fica abaixo de 16px efetivos em nenhuma era
    - Os rótulos do seletor têm tamanho e peso suficientes para leitura na última fileira
    - Nenhuma era exige rolagem para encontrar o seletor
  - **Feature tests:** `eras: nenhuma fonte de conteudo abaixo de 16px` (Fase 1) → afirma o piso de 16px, que é a metade estaticamente verificável da US-4.2
  - **Traces:** US-4.2

### Phase 8.3: Fechar o portão

- [ ] **Task:** Validar o aviso de CDN caído e fechar o README
  - **Acceptance criteria:**
    - Simulando a queda do CDN (bloqueando o domínio ou renomeando a URL), o aviso aparece legível
    - Com o CDN funcionando, o aviso permanece invisível e não ocupa espaço
    - O aviso continua estilizado por CSS próprio inline, sem depender do Tailwind
    - O README registra que a página depende de internet, e registra qualquer decisão de contraste tomada contra a fidelidade histórica
    - O README descreve como rodar o portão e o que significa cada código de saída
  - **Feature tests:** `estrutura: aviso de cdn nao depende do tailwind` (Fase 2) → afirma que as regras do aviso vivem no `<style>` inline, garantindo que ele sobreviva exatamente ao cenário para o qual existe (US-4.3)
  - **Traces:** US-4.3
- [ ] **Task:** Zerar as pendências
  - **Acceptance criteria:**
    - `node scripts/check-pendencias.mjs` sai `0`
    - Nenhum `TODO`, `FIXME`, `XXX` ou `PLACEHOLDER` sobrou em `index.html`, `scripts/` ou `test/`
    - Nenhum conteúdo de rascunho (lorem ipsum, texto de exemplo não intencional) permaneceu em nenhuma era
    - Nenhuma regra CSS morta referente a token inexistente permaneceu
  - **Feature tests:** `pendencias: encontra e reporta marcacao de trabalho inacabado` (Fase 1) → o mesmo teste que provou o portão funcionando agora prova que não há o que reportar (US-5.3)
  - **Traces:** US-5.3
- [ ] **Task:** Fechar o portão em `exit 0`
  - **Acceptance criteria:**
    - `bash verify.sh` sai `0` e imprime `verify: TUDO VERDE (exit 0)`
    - Os dois gates imprimem `OK`
    - Rodar duas vezes seguidas dá o mesmo resultado
    - `bash reset.sh` esvazia o diretório e o projeto pode ser reconstruído da Fase 1
    - Abrir `index.html` via `file://` mostra a página funcional, sem servidor e sem `npm install`
  - **Feature tests:** `portao: exit 0 apenas com os dois gates verdes` (Fase 1) → a regra de negócio central da US-5.1, agora exercitada no caso verde
  - **Traces:** US-5.1, US-4.1
