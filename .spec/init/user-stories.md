# Máquina do Tempo da Web — User Stories

<!-- inputs: project-description.md@sha256:c0e3e76eac0a -->

## Overview

A Máquina do Tempo da Web é uma página única que assume cinco identidades — **1995, 2005, 2015, 2026 e 2040** — sem reload. Quem visita escolhe um ano e vê a mesma página se transformar propriedade a propriedade: tema visual, estrutura de layout e conteúdo datado mudam juntos, à vista.

O produto serve três pessoas com necessidades diferentes: quem **visita** e quer reconhecer a época; quem **apresenta** ao vivo num workshop e precisa que nada falhe na frente da sala; e quem **desenvolve** e precisa de um portão que diga pronto ou não pronto sem depender de opinião.

**User Types:**
- **Visitante** - qualquer pessoa que abre a página e navega pelas cinco eras. Não faz login, não configura nada, não deixa estado.
- **Apresentador** - quem usa a página ao vivo, em projetor, na frente de uma sala. Precisa de previsibilidade: abre sem instalação, começa sempre no mesmo lugar, salta na ordem que a narrativa pedir.
- **Desenvolvedor** - quem constrói e mantém o projeto. É o ator do portão: roda `verify.sh` e obedece ao código de saída.

**Não-objetivos declarados** (decisões do desenvolvedor, fora do MVP):
- Funcionar offline — o Tailwind vem de CDN e a página depende de internet. Risco aceito.
- Era na URL — o estado é puramente de memória; recarregar volta para 1995.
- Layout responsivo / mobile — a página é desktop-only.
- Chrome de navegador simulado ao redor da página.

---

## 1. Viagem no tempo

### US-1.1: Selecionar uma era
**As a** Visitante
**I want to** clicar em um dos cinco anos e ver a página assumir aquela época
**So that** eu possa comparar como a web era em cada momento sem sair da página

**Acceptance Criteria:**
- [ ] O seletor exibe exatamente cinco opções: `1995`, `2005`, `2015`, `2026`, `2040`, nessa ordem, da esquerda para a direita
- [ ] Clicar em um ano troca o atributo `data-era` no elemento `<html>` para aquele ano
- [ ] Nenhum nó do DOM é criado, removido ou reordenado na troca
- [ ] Nenhum reload, nenhuma requisição de rede e nenhuma mudança de URL acontecem na troca
- [ ] Clicar duas vezes no mesmo ano não produz efeito acumulado nem visual diferente do primeiro clique

**Expected Result:** Cinco anos clicáveis; um clique muda um único atributo e a página inteira responde a ele.

---

### US-1.2: Chegar em 1995 ao abrir
**As a** Visitante
**I want to** encontrar a página já na era mais antiga quando eu abro
**So that** a viagem comece no passado e eu caminhe para frente

**Acceptance Criteria:**
- [ ] Ao carregar, o `<html>` tem `data-era="1995"` declarado no próprio HTML, sem depender de JavaScript
- [ ] O ano `1995` aparece marcado como ativo no seletor desde o primeiro pixel pintado
- [ ] Nenhuma animação de transição roda no carregamento inicial — a página já nasce em 1995

**Expected Result:** Abrir a página é chegar em 1995, sem flash de outra era e sem esperar script.

---

### US-1.3: Saber em que era eu estou
**As a** Visitante
**I want to** ver com clareza qual ano está selecionado
**So that** eu não perca a referência enquanto a página muda de cara ao redor de mim

**Acceptance Criteria:**
- [ ] A era ativa é visualmente distinta das outras quatro em **todas** as cinco eras
- [ ] A distinção não depende só de cor — há uma segunda pista (peso, borda, tamanho ou marcador)
- [ ] A era ativa é anunciada por acessibilidade (`aria-current` ou `aria-pressed` no controle correspondente)

**Expected Result:** Em qualquer era, olhar o seletor responde "que ano é esse" em menos de um segundo.

---

### US-1.4: Operar o seletor pelo teclado
**As a** Visitante
**I want to** navegar e acionar os anos sem mouse
**So that** a página continue utilizável mesmo quando o seletor muda de forma a cada época

**Acceptance Criteria:**
- [ ] Os cinco controles são alcançáveis por `Tab`, na ordem cronológica
- [ ] `Enter` e `Espaço` acionam a troca de era
- [ ] O indicador de foco é visível e tem contraste suficiente **nas cinco eras**, inclusive sobre o fundo texturizado de 1995 e o dark mode de 2026
- [ ] O foco não é perdido nem reposicionado pela troca de era — quem trocou continua com o foco no controle que acionou

**Expected Result:** Dá para percorrer as cinco décadas sem tocar no mouse, e sempre se sabe onde o foco está.

---

## 2. A transformação

### US-2.1: Ver a página evoluir, não trocar
**As a** Visitante
**I want to** ver a página se transformar de uma era na outra
**So that** eu perceba a evolução acontecendo, e não apenas o antes e o depois

**Acceptance Criteria:**
- [ ] As diferenças entre eras são expressas em propriedades interpoláveis — cor, largura, `max-width`, `padding`, `gap`, `opacity`, `transform`
- [ ] As custom properties que carregam cor ou comprimento são declaradas com `@property` para ganhar interpolação
- [ ] A transição tem duração única e consistente entre qualquer par de eras, entre **600 ms e 900 ms**
- [ ] A animação roda inteiramente em CSS — o JavaScript não participa dela nem em callback nem em `requestAnimationFrame`
- [ ] Não há crossfade de blocos inteiros: um elemento não some para outro aparecer no mesmo lugar

**Expected Result:** A troca de era é uma metamorfose contínua e visível, não um corte.

---

### US-2.2: Ver o que não pertence à época sair de cena
**As a** Visitante
**I want to** ver os elementos datados aparecerem e desaparecerem gradualmente
**So that** a transformação continue contínua mesmo quando o conteúdo muda

**Acceptance Criteria:**
- [ ] Um elemento fora da era atual permanece no DOM e colapsa por `opacity`, altura e escala — nunca por `display:none` nem `remove()`
- [ ] O elemento colapsado não é focável por teclado nem lido por leitor de tela (`aria-hidden` ou `inert`)
- [ ] Voltar para a era de origem faz o elemento reaparecer pelo mesmo caminho, animado
- [ ] O contador de visitas (1995), o badge "beta" (2005) e o banner de consentimento (2026) demonstram esse comportamento

**Expected Result:** Nada pisca para dentro ou para fora da tela; tudo cresce e encolhe.

---

### US-2.3: Saltar entre eras em qualquer ordem
**As a** Visitante
**I want to** pular de 1995 direto para 2040 e voltar
**So that** eu possa comparar extremos sem percorrer o caminho todo

**Acceptance Criteria:**
- [ ] Qualquer par de eras é alcançável em um clique, incluindo saltos não adjacentes
- [ ] Um salto não adjacente usa a mesma duração de transição que um salto adjacente
- [ ] Trocar de era durante uma transição em andamento não deixa a página em estado intermediário travado
- [ ] Nenhuma era é destino final: de 2040 sempre dá para voltar a qualquer ano anterior

**Expected Result:** As cinco eras formam um grafo completo, não uma linha que só anda para frente.

---

## 3. As cinco eras

### US-3.1: Reconhecer 1995
**As a** Visitante
**I want to** ver a página com a cara da web de 1995
**So that** eu reconheça de imediato a época em que o navegador era novidade

**Acceptance Criteria:**
- [ ] **Tema:** cinza `#c0c0c0`, fundo com textura repetida, Times New Roman, links azuis sublinhados, raio de borda zero, sombra zero
- [ ] **Estrutura:** tabela centralizada de largura fixa próxima de **640px**, conteúdo em coluna única
- [ ] **Conteúdo:** contador de visitas, aviso "Best viewed in Netscape Navigator", GIF de obra em construção, data de "última atualização"
- [ ] `<hr>` aparece separando seções, como marcador visual da época

**Expected Result:** Quem viveu 1995 reconhece antes de ler o ano no seletor.

---

### US-3.2: Reconhecer 2005
**As a** Visitante
**I want to** ver a página com a cara do Web 2.0
**So that** eu reconheça a era do gradiente, do brilho e do "beta" eterno

**Acceptance Criteria:**
- [ ] **Tema:** gradientes glossy, paleta azul e laranja, Verdana/Tahoma, cantos arredondados, reflexo e sombra suave
- [ ] **Estrutura:** duas colunas de largura fixa próxima de **760px** — conteúdo principal mais sidebar
- [ ] **Conteúdo:** badge "beta", ícone de RSS, tag cloud, caixa de newsletter, botão de compartilhamento social da época
- [ ] A sidebar existe apenas nesta era e colapsa nas demais conforme US-2.2

**Expected Result:** A página parece um blog de 2005, incluindo a sidebar entulhada.

---

### US-3.3: Reconhecer 2015
**As a** Visitante
**I want to** ver a página em flat design
**So that** eu reconheça o momento em que a web ficou plana e mobile-first

**Acceptance Criteria:**
- [ ] **Tema:** cores chapadas e saturadas, Helvetica/Open Sans, ausência total de gradiente e sombra, muito branco
- [ ] **Estrutura:** hero de largura total seguido de grid de cards, com rolagem longa
- [ ] **Conteúdo:** call to action grande, ícones lineares, "Sign up free", seção de depoimentos
- [ ] A transição de 2005 para 2015 mostra o gradiente e a sombra indo a zero, não sumindo de uma vez

**Expected Result:** A página vira uma landing page de startup de 2015.

---

### US-3.4: Reconhecer 2026
**As a** Visitante
**I want to** ver a página como os sites de hoje
**So that** eu perceba que o presente também é uma época datada

**Acceptance Criteria:**
- [ ] **Tema:** dark mode como padrão, tipografia variável, vidro sutil, gradiente de acento, espaçamento generoso
- [ ] **Estrutura:** grid assimétrico, navegação sticky, largura confortável de leitura
- [ ] **Conteúdo:** banner de consentimento de cookies, badge "AI-powered", copy curta e direta
- [ ] O cromo já é visivelmente menor que em 2005 e 2015 — a redução é perceptível na sequência

**Expected Result:** O visitante reconhece o próprio ano e entende que ele também vai parecer datado.

---

### US-3.5: Encontrar 2040
**As a** Visitante
**I want to** ver a página deixar de ser uma página
**So that** o arco termine numa aposta e não numa continuação óbvia

**Acceptance Criteria:**
- [ ] **Tema:** fundo neutro, tipografia grande, cromo praticamente ausente
- [ ] **Estrutura:** um campo de intenção centralizado; o conteúdo aparece como resposta abaixo dele
- [ ] **Conteúdo:** sem menu, sem navegação, sem rodapé — o visitante declara o que quer em vez de navegar até lá
- [ ] O campo de intenção não é funcional de verdade: é uma representação estética, e isso não pode parecer um bug (não há promessa de resposta real)
- [ ] O seletor de anos continua presente e acessível, apesar da ausência de todo o resto do cromo

**Expected Result:** A leitura das cinco eras conta uma história: o cromo cresce até 2005, começa a sumir em 2015, e em 2040 sobrou só a intenção.

---

### US-3.6: Ver o seletor vestir a época
**As a** Visitante
**I want to** que o próprio seletor mude de estilo junto com a página
**So that** a imersão seja completa, sem um controle moderno flutuando sobre 1995

**Acceptance Criteria:**
- [ ] O seletor tem tratamento visual próprio em cada uma das cinco eras — botão 3D em 1995, gradiente glossy em 2005, flat em 2015, e assim por diante
- [ ] Em todas as eras o seletor permanece legível, clicável e com a era ativa distinguível (US-1.3 e US-1.4 continuam válidos)
- [ ] A troca de estilo do seletor é animada pelas mesmas regras da US-2.1 — nada de troca abrupta

**Expected Result:** O controle faz parte da cena em vez de flutuar acima dela, sem nunca deixar de ser um controle.

---

## 4. Uso ao vivo

### US-4.1: Abrir sem instalar nada
**As an** Apresentador
**I want to** abrir a página com duplo clique, sem servidor e sem `npm install`
**So that** a demo não dependa de ambiente montado na frente da sala

**Acceptance Criteria:**
- [ ] A página funciona integralmente aberta via `file://`
- [ ] Não há passo de build, bundler ou servidor local para exibir a página
- [ ] Não há dependência de produção: o único `node_modules` possível no projeto serve aos testes, e a página não o consulta
- [ ] O projeto vive em `exemplo-maquina-do-tempo/`, irmão de `exemplo-goal/`

**Expected Result:** Clonou o repo, abriu o arquivo, a demo está no ar.

---

### US-4.2: Ser lido de longe
**As an** Apresentador
**I want to** que a página seja legível projetada numa sala
**So that** quem está no fundo enxergue a diferença entre as eras

**Acceptance Criteria:**
- [ ] Nenhum texto de conteúdo fica abaixo de **16px** efetivos em nenhuma das cinco eras
- [ ] O contraste entre texto e fundo passa em AA (4.5:1 para texto normal) nas cinco eras
- [ ] Os rótulos dos anos no seletor são legíveis a distância — tamanho e peso suficientes em todas as eras
- [ ] A página inteira cabe em viewport de projetor 1280×720 sem rolagem horizontal

**Expected Result:** Da última fileira dá para ler o ano e ver a mudança.

---

### US-4.3: Descobrir o CDN caído antes da plateia
**As an** Apresentador
**I want to** um sinal inequívoco quando o Tailwind não carregar
**So that** eu não descubra no palco que a página está sem estilo nenhum

**Acceptance Criteria:**
- [ ] Se o script do Tailwind não carregar, um aviso visível aparece na página informando que o estilo não foi carregado
- [ ] O aviso não depende do Tailwind para ser visível — usa CSS próprio, inline
- [ ] Com o Tailwind carregado normalmente, o aviso permanece invisível e não ocupa espaço
- [ ] O README do projeto registra que a página **depende de internet** — a decisão de manter o CDN é explícita, não um esquecimento

**Expected Result:** A falha de rede vira um aviso legível, não uma página pelada e inexplicável.

---

## 5. Portão de verificação

### US-5.1: Perguntar ao portão se está pronto
**As a** Desenvolvedor
**I want to** rodar um comando único que responde pronto ou não pronto
**So that** a condição de parada saia da minha cabeça e vire estado verificável

**Acceptance Criteria:**
- [ ] `bash verify.sh` roda a partir de `exemplo-maquina-do-tempo/` sem argumentos
- [ ] Sai com código **0** quando os dois portões passam e **1** quando qualquer um falha
- [ ] O portão não abre navegador e não julga aparência — só estrutura e completude
- [ ] O portão é reexecutável quantas vezes for: rodar duas vezes seguidas dá o mesmo resultado

**Expected Result:** Um comando, um código de saída. Nenhuma opinião envolvida.

---

### US-5.2: Saber qual portão falhou
**As a** Desenvolvedor
**I want to** ver na saída qual verificação reprovou e por quê
**So that** a reprovação vire instrução, não só um número vermelho

**Acceptance Criteria:**
- [ ] Cada portão imprime seu cabeçalho (`==> [1/2] testes`, `==> [2/2] pendencias`) seguido de `OK` ou `FALHOU`
- [ ] A linha final resume o veredito do conjunto
- [ ] Testes reprovados nomeiam a era e a camada que faltou — por exemplo, qual das cinco eras não declarou conteúdo
- [ ] A saída é legível em terminal, sem depender de cor

**Expected Result:** Quem lê a saída sabe o que fazer em seguida sem abrir o código do teste.

---

### US-5.3: Não deixar pendência para trás
**As a** Desenvolvedor
**I want to** que o portão reprove quando sobrar marcação de trabalho inacabado
**So that** "quase pronto" não passe por pronto

**Acceptance Criteria:**
- [ ] `scripts/check-pendencias.mjs` varre o código do projeto e falha se encontrar `TODO`, `FIXME` ou placeholder
- [ ] O script imprime o arquivo e a linha de cada pendência encontrada
- [ ] O script sai com código **0** quando não há nenhuma
- [ ] Esse portão é independente dos testes: um pode passar com o outro falhando, e o `verify.sh` reprova mesmo assim

**Expected Result:** Dois portões de naturezas diferentes; passar num não isenta do outro.

---

### US-5.4: Confiar que as cinco eras estão completas
**As a** Desenvolvedor
**I want to** que os testes afirmem a completude das eras, não só a existência do arquivo
**So that** ninguém entregue uma era pela metade

**Acceptance Criteria:**
- [ ] Os testes rodam com `node --test test/` e **nenhuma dependência instalada**
- [ ] Os testes afirmam que as cinco eras `1995 2005 2015 2026 2040` estão declaradas
- [ ] Para cada era, afirmam que as três camadas existem: tema visual, estrutura de layout e conteúdo datado
- [ ] Afirmam que o seletor tem exatamente cinco opções, uma por era
- [ ] Afirmam que `data-era` existe no `<html>` com valor inicial `1995`
- [ ] Afirmam que há declaração de `transition` cobrindo a troca de era
- [ ] Afirmam que o script do Tailwind está presente no HTML

**Expected Result:** Passar nos testes significa que as cinco eras existem inteiras, não que o arquivo compila.

---

## Appendix: User Story Status

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| US-1.1 | Selecionar uma era | High | Pending |
| US-1.2 | Chegar em 1995 ao abrir | High | Pending |
| US-1.3 | Saber em que era eu estou | High | Pending |
| US-2.1 | Ver a página evoluir, não trocar | High | Pending |
| US-2.2 | Ver o que não pertence à época sair de cena | High | Pending |
| US-2.3 | Saltar entre eras em qualquer ordem | High | Pending |
| US-3.1 | Reconhecer 1995 | High | Pending |
| US-3.2 | Reconhecer 2005 | High | Pending |
| US-3.3 | Reconhecer 2015 | High | Pending |
| US-3.4 | Reconhecer 2026 | High | Pending |
| US-3.5 | Encontrar 2040 | High | Pending |
| US-4.1 | Abrir sem instalar nada | High | Pending |
| US-5.1 | Perguntar ao portão se está pronto | High | Pending |
| US-5.2 | Saber qual portão falhou | High | Pending |
| US-5.4 | Confiar que as cinco eras estão completas | High | Pending |
| US-1.4 | Operar o seletor pelo teclado | Medium | Pending |
| US-3.6 | Ver o seletor vestir a época | Medium | Pending |
| US-4.2 | Ser lido de longe | Medium | Pending |
| US-4.3 | Descobrir o CDN caído antes da plateia | Medium | Pending |
| US-5.3 | Não deixar pendência para trás | Medium | Pending |
