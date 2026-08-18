# exemplo-goal — cenário de demonstração do `/goal`

Um checkout quebrado, com um portão de verificação. Serve para rodar um `/goal`
ao vivo e mostrar as quatro peças dos slides 10 e 11 acontecendo de verdade:
**condição, hook, avaliador, escape hatch**.

Zero instalação. Node 18+ e bash, nada mais — usa `node --test`, que já vem no Node.

---

## O roteiro (4 minutos)

### 1. Mostre o portão vermelho

```bash
cd exemplo-goal
bash verify.sh; echo "exit=$?"
```

Sai `1`. Dois portões falhando: 7 de 10 testes vermelhos, e uma pendência
sobrando em `src/`. **Fale o número em voz alta** — é o antes.

### 2. Declare a condição de parada

Dentro do Claude Code, na raiz do projeto:

```
/goal bash exemplo-goal/verify.sh sai com codigo 0
```

O que dizer enquanto digita:

> "Repara no que eu não escrevi. Não escrevi 'conserte o carrinho', não escrevi
> 'melhore o código'. Escrevi um comando e um código de saída. É isso que um
> avaliador consegue verificar sem me perguntar nada."

### 3. Saia da frente

Não aprove passo a passo. Não revise. Deixe rodar.
O ponto do workshop inteiro é este momento: **você não é mais o critério de parada.**

### 4. Mostre o portão verde

```bash
bash verify.sh; echo "exit=$?"
```

Sai `0`. E o `/goal` se limpa sozinho — ninguém precisou digitar `/goal clear`.

### 5. Repita, se quiser

```bash
bash reset.sh
```

---

## O que tem quebrado aqui

Cinco defeitos plantados em `src/carrinho.js`, mais uma pendência.
Não são todos do mesmo tipo — de propósito:

| # | defeito | natureza |
|---|---------|----------|
| 1 | `subtotal` ignora `quantidade` | óbvio, o agente pega de primeira |
| 2 | `frete` usa `> 20000` em vez de `>= 20000` | off-by-one na borda exata de R$ 200,00 |
| 3 | `aplicarDesconto` devolve centavo fracionado | sutil: `899.1` em vez de `899` |
| 4 | `formatarBRL` não põe ponto de milhar | visível só no caso de 4+ dígitos |
| 5 | `total` aplica desconto sobre o frete | ordem errada; muda o valor final |
| 6 | um `// TODO` sobrando | não é teste — é o **segundo portão** |

O item 6 existe por um motivo didático: com um portão só, um agente bom fecha
tudo numa passada e **o loop fica invisível**. Dois portões de naturezas
diferentes forçam pelo menos uma volta a mais, e a volta é o que você quer que
a sala veja.

Todos os defeitos são deriváveis da documentação que já está no código —
cada função tem um `@returns` e um exemplo. Nada aqui depende de adivinhação.

---

## Por que a condição é `verify.sh sai com codigo 0`

Porque o avaliador do Claude Code **lê só o transcript**. Ele não roda comando,
não abre arquivo. Se a prova não apareceu na conversa, ele nega — o default dele
é `{"ok": false, "reason": "insufficient evidence in transcript"}`.

Um comando com código de saída resolve isso de duas maneiras ao mesmo tempo:
é inequívoco para o juiz, e obriga o agente a colar a evidência na conversa.

Compare com condições que **não** funcionam:

| condição | por que falha |
|----------|---------------|
| `o carrinho está funcionando` | "funcionando" não tem definição; o juiz não tem o que citar |
| `os testes passam` | quais? rodados quando? o juiz aceita uma alegação em vez de uma saída |
| `o código está limpo` | julgamento estético, não estado verificável |
| `bash exemplo-goal/verify.sh sai com codigo 0` | comando + código de saída, checável na transcrição |

Esse contraste vale uma pergunta pra sala antes de rodar: *"o que vocês
escreveriam aí?"* — quase sempre vem uma frase da primeira coluna.

---

## O que apontar quando terminar

- **O `reason` não é log, é o próximo input.** Cada avaliação reprovada volta
  para o agente como instrução. É isso que faz o ciclo aprender em vez de repetir.
- **Ninguém aprovou nada.** Nem uma tecla. O critério de parada saiu da sua
  cabeça e virou um arquivo que outra pessoa consegue ler.
- **O portão é reexecutável.** `bash reset.sh` e roda de novo, igual. Sua
  atenção não é.

---

## Arquivos

```
exemplo-goal/
├── README.md                     este roteiro
├── verify.sh                     o portão — é ele que a condição cita
├── reset.sh                      volta ao estado quebrado
├── package.json                  scripts: test, check, verify
├── src/carrinho.js               o código com os defeitos
├── test/carrinho.test.mjs        10 testes, 7 vermelhos no início
├── scripts/check-pendencias.mjs  o segundo portão
└── .seed/                        estado original + gabarito.js
```

`.seed/gabarito.js` é a solução pronta. Está aí como rede de segurança: se a
internet cair no meio da demonstração, você copia por cima de `src/carrinho.js`,
mostra o portão verde e segue o workshop. Não abra antes.
