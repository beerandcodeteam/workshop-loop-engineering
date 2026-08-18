# Máquina do Tempo da Web — Database Schema

<!-- inputs: project-description.md@sha256:c0e3e76eac0a user-stories.md@sha256:0bc63bc56f7d -->

## Overview

**Este projeto não tem banco de dados.** A decisão é do desenvolvedor e é coerente com tudo que os artefatos anteriores declararam: a Máquina do Tempo da Web é **um arquivo HTML único**, aberto via `file://`, sem servidor, sem backend, sem dependência de produção. Não existe camada de persistência para modelar.

Não há **estado durável** de espécie alguma. A única coisa que a página guarda é a **era selecionada**, e a US-1.2 combinada com a decisão de não colocar a era na URL já fixou o comportamento: o estado vive em memória, no atributo `data-era` do `<html>`, e **recarregar a página volta sempre para 1995**. Nada de `localStorage`, nada de cookie, nada de sessão. Fechar a aba apaga tudo, de propósito.

O que num projeto convencional seria dado de tabela — o catálogo das cinco eras e as três camadas de cada uma — aqui é **markup e CSS**. As eras são custom properties agrupadas por seletor `[data-era="…"]`; o conteúdo datado são nós do esqueleto compartilhado que colapsam quando não pertencem à época. O portão (`verify.sh`) verifica esse catálogo lendo o `index.html` como texto, não consultando banco nenhum.

**Convenções em vigor:** nenhuma. Não há framework, não há ORM, não há migrations. O bloco DBML abaixo existe para satisfazer o formato do artefato e está deliberadamente vazio de tabelas — declarar tabelas especulativas aqui faria o `init:project-phases` planejar trabalho que ninguém pediu.

## Schema (DBML)

```dbml
// Nenhuma tabela.
//
// O projeto nao tem banco de dados: pagina HTML unica, aberta via file://,
// sem backend e sem persistencia. Ver "Notes & Conventions" para onde cada
// conceito do dominio vive de verdade.
//
// Se um dia entrar persistencia, os candidatos naturais seriam um catalogo
// de eras e suas tres camadas. Nao estao declarados aqui de proposito:
// tabela escrita neste arquivo vira tarefa no project-phases.
```

## Relationships

Nenhuma. Não há tabelas, portanto não há chaves estrangeiras, cardinalidades nem pivots.

A única relação do domínio — **uma era tem três camadas** (tema visual, estrutura de layout, conteúdo datado) — é expressa em CSS, agrupando custom properties sob o seletor `[data-era="<ano>"]`. É uma relação de composição em markup, não em schema.

## Lookup Table Seeds

Nenhuma tabela de lookup existe.

Para registro, o único campo categórico do domínio é a **era**, com cinco valores fechados. Se algum dia virar tabela, estes são os valores: `1995`, `2005`, `2015`, `2026`, `2040`. Hoje eles vivem como os cinco seletores `[data-era="…"]` no CSS e os cinco controles do seletor no HTML — e é essa a lista que os testes de US-5.4 afirmam estar completa.

## Notes & Conventions

**Cobertura dos Key Concepts — nenhum é persistido:**

- **Era** — não persistido: é um valor do atributo `data-era` no `<html>`, em memória. Os cinco valores possíveis vivem como seletores CSS, não como linhas.
- **Tema visual** — não persistido: conjunto de custom properties CSS declaradas por era.
- **Estrutura de layout** — não persistido: custom properties CSS interpoláveis, declaradas por era.
- **Conteúdo e copy** — não persistido: nós estáticos no `index.html`, exibidos ou colapsados conforme a era.
- **Esqueleto compartilhado** — não persistido: é a estrutura do próprio `index.html`, idêntica nas cinco eras por regra da US-2.2.
- **Transição por propriedade** — não persistido: comportamento, não dado. Vive em declarações `transition` e `@property` no CSS.
- **Seletor de anos** — não persistido: cinco controles estáticos no HTML, com estilo próprio por era (US-3.6).
- **Era inicial** — não persistido: literal `data-era="1995"` escrito no HTML, exigido pela US-1.2 justamente para não depender de leitura de estado.
- **Portão (`verify.sh`)** — não persistido: script shell mais testes `node --test`. Lê arquivo, não banco.

**Decisões que reforçam a ausência de persistência:**

- **Sem `localStorage`, sem cookie, sem sessão.** A era selecionada não sobrevive a um reload — comportamento decidido em `init:user-stories` ao descartar a era na URL. Recarregar é o botão de reset do apresentador (US-4.1).
- **Sem migrations, sem ORM, sem seeds.** O `package.json` do projeto existe só para os scripts de teste; não haverá dependência de banco.
- **O portão não toca em banco.** US-5.4 afirma completude lendo o `index.html` como texto. Se um banco entrasse no projeto, o portão precisaria ser repensado — hoje ele não precisa.
- **Fronteira registrada para o `project-phases`:** nenhuma fase deve conter tarefa de modelagem, migration, seed ou acesso a dados. Se aparecer, é escopo inventado.
