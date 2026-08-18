#!/usr/bin/env bash
# Devolve o cenario ao estado quebrado original.
# Rode isto ANTES de cada demonstracao — e depois dela, se for repetir.
set -euo pipefail
cd "$(dirname "$0")"

cp .seed/src/carrinho.js src/carrinho.js
cp .seed/test/carrinho.test.mjs test/carrinho.test.mjs

echo "cenario restaurado ao estado quebrado."
echo "confira com: bash verify.sh   (deve sair 1)"
