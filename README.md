# Workshop — Loop Engineering

Material do workshop **Loop Engineering** (Beer and Code): a camada de
engenharia por fora do modelo — critério de parada, verificação, memória e
orçamento.

O repositório tem três coisas dentro:

| o quê | onde |
|---|---|
| o deck da aula, em arquivo único | `slides.html` |
| o cenário de demonstração do `/goal` | `exemplo-goal/` |
| os orquestradores de loop mostrados ao vivo | `scripts/` |

Pré-requisitos: um navegador, **Node 18+** e `bash`. Nada de build, nada de
`npm install`.

---

## Como abrir a aula

O deck é um HTML sozinho, sem servidor e sem dependência. Abra direto:

```bash
xdg-open slides.html      # linux
# open slides.html        # macOS
```

Ou duplo clique no arquivo. Funciona por `file://`.

### Controles

| tecla | o que faz |
|---|---|
| `→` `↓` `PageDown` `espaço` | próximo slide |
| `←` `↑` `PageUp` | slide anterior |
| `Home` / `End` | primeiro / último slide |
| `n` | liga/desliga as **notas do apresentador** |
| `o` | liga/desliga o **mapa de slides** (clique para pular) |
| `Esc` | fecha notas e mapa |

O hash da URL é o número do slide — `slides.html#12` abre direto no slide 12,
e ele se atualiza sozinho conforme você navega. Serve para retomar a aula de
onde parou.

### A estrutura do deck

Quatro atos, marcados na HUD do rodapé:

1. **O drama** — o filtro de hype está certo; a lacuna é de transferência.
   Você exige critério de parada do agente que atende o cliente e aceita ser
   o critério de parada do agente que escreve o seu código.
2. **A virada** — o `/goal` do Claude Code e o `/goal` do Codex, lado a lado,
   traduzidos para o algoritmo que eles realmente executam. Um tem juiz e
   nenhum teto; o outro tem teto em SQL e nenhum juiz.
3. **O seu loop** — `claude -p` transforma o app em comando; os três degraus
   anteriores (prompt, context, harness) revisitados por baixo do loop.
4. **A prática** — sai do deck, abre o terminal.

As **notas do apresentador** (`n`) trazem o roteiro de fala de cada slide.
Não são resumo do slide: são o que dizer enquanto ele está na tela.

---

## O exemplo do `/goal`

`exemplo-goal/` é um checkout quebrado com um **portão de verificação**. Existe
para rodar um `/goal` ao vivo e mostrar as quatro peças acontecendo de verdade:
condição, hook, avaliador e escape hatch.

O roteiro completo está em [`exemplo-goal/README.md`](exemplo-goal/README.md).
O resumo de quatro minutos:

**1. Mostre o portão vermelho.**

```bash
cd exemplo-goal
bash verify.sh; echo "exit=$?"
```

Sai `1`. Dois portões falhando: 7 de 10 testes vermelhos, e um `// TODO`
sobrando em `src/`. Fale o número em voz alta — é o antes.

**2. Declare a condição de parada.** Dentro do Claude Code, na raiz do repo:

```
/goal bash exemplo-goal/verify.sh sai com codigo 0
```

Não é "conserte o carrinho", não é "melhore o código". É um comando e um código
de saída — a única forma de condição que um avaliador consegue verificar sem
perguntar nada a você.

**3. Saia da frente.** Não aprove passo a passo, não revise. É o ponto do
workshop inteiro: você deixa de ser o critério de parada.

**4. Mostre o portão verde.** `bash verify.sh` sai `0`, e o `/goal` se limpa
sozinho.

**5. Repita.** `bash reset.sh` devolve o cenário ao estado quebrado, idêntico.

### Por que essa condição funciona

O avaliador do `/goal` **lê só o transcript** — não roda comando, não abre
arquivo. Sem prova na conversa, ele nega por default. Um comando com código de
saída resolve os dois lados de uma vez: é inequívoco para o juiz, e obriga o
agente a colar a evidência na conversa.

| condição | por que falha |
|---|---|
| `o carrinho está funcionando` | "funcionando" não tem definição |
| `os testes passam` | quais? rodados quando? aceita alegação em vez de saída |
| `o código está limpo` | julgamento estético, não estado verificável |
| `bash exemplo-goal/verify.sh sai com codigo 0` | ✅ comando + exit code, checável na transcrição |

### Por que dois portões

`verify.sh` roda **duas** checagens de naturezas diferentes: a suíte de testes
(`node --test`) e um verificador de pendências (`scripts/check-pendencias.mjs`).

Com um portão só, um agente bom fecha tudo numa passada e **o loop fica
invisível**. Dois portões forçam pelo menos uma volta a mais — e a volta é o
que a sala precisa ver.

São cinco defeitos plantados em `src/carrinho.js`, escalonados de propósito: um
óbvio (`subtotal` ignora `quantidade`), um off-by-one na borda exata de R$ 200,
um centavo fracionado, um formato sem ponto de milhar, e uma ordem errada de
desconto sobre frete. Todos deriváveis da documentação que já está no código.

`.seed/gabarito.js` é a solução pronta — rede de segurança se a internet cair
no meio da demonstração. Não abra antes.

---

## Os orquestradores em `scripts/`

Os dois mostram a mesma ideia do slide 10 em código real, em escalas diferentes.

### `loop.php` — o loop mínimo

~100 linhas de PHP. Lê fases, chama `claude -p` com
`--dangerously-skip-permissions --output-format text`, roda os testes, e então
abre uma **segunda sessão read-only** como verificador independente, que só pode
responder `DONE` ou `FALTA — <o que falta>`. Na dúvida, `FALTA`. Aprovou,
commita; reprovou, o motivo vira o input da próxima tentativa (máx. 3).

É a versão didática: dá para ler inteiro na tela durante a aula.

### `ralph.sh` — o loop de produção

Mesma anatomia, com os gates levados a sério. Lê um documento de fases, roda
cada fase em **sessão nova e auto-contida**, e só considera a fase completa
depois de quatro gates mecânicos — nunca pelo exit code do engine.

```bash
./scripts/ralph.sh                                  # usa .spec/init/project-phases.md
./scripts/ralph.sh --engine claude --from 3         # retoma da fase 3 no Claude Code
./scripts/ralph.sh .spec/features/<slug>/PHASES.md  # roda o PHASES.md de uma feature
./scripts/ralph.sh --help                           # opções, env vars e contrato de input
```

Os gates: (0) o engine terminou de verdade; (1) a sessão escreveu código —
sinal, não veredito; (2) a suíte de testes rodada **pelo ralph**, fora da sessão
do agente; (3) uma sessão verificadora independente, read-only, task a task.
Todos verdes com a árvore suja → um commit por fase. Qualquer vermelho → ciclo
de correção com a causa injetada.

Funciona com `codex` (default) ou `claude` como engine, e detecta o comando de
teste pelo manifest do projeto (Sail, composer, artisan, npm, pytest, go, cargo).

---

## O projeto que a aula constrói ao vivo

A parte prática sai do deck e especifica um projeto do zero: a **Máquina do
Tempo da Web** — uma página única que se reconstrói na frente do visitante com
a estética de 1995, 2005, 2015, 2026 ou 2040, sem reload.

O que já está no repo é o rastro do processo, não o resultado:

| pasta | o que é |
|---|---|
| `.spec/init/` | descrição do projeto, user stories, schema, fases — saída dos comandos `init:*` do [bc-harness](https://github.com/beerandcodeteam/beer-and-code-harness) |
| `.phases/` | as 8 fases quebradas pelo `ralph.sh`, mais os prompts e logs de cada ciclo |

`.phases/logs/` é o material mais honesto da aula: dá para abrir e mostrar uma
fase que precisou de dois ciclos (`phase-07.cycle-2.log`) e ler o motivo que o
verificador devolveu.

O mesmo padrão de portão do `exemplo-goal/` vale lá: `verify.sh` sai `0` quando
as cinco eras estão completas e nenhum `TODO` sobrou. O portão é a definição de
pronto do projeto — não a opinião de quem olha a tela.

---

## O harness usado na aula

```
/plugin marketplace add beerandcodeteam/beer-and-code-harness
/plugin install bc-harness@beer-and-code
/reload-plugins
```

Traz os comandos `init:*` (que constroem a base do projeto), o `/plan` (que
produz a especificação com critério binário — exatamente o que o loop precisa
para ter condição de parada) e o `/ai-context` (que mantém o `AGENTS.md` em dia
com o código que existe, não com o que você imaginou).
