#!/usr/bin/env bash
# O portao. Sai 0 apenas quando TUDO passa.
# Esta e a condicao que voce entrega para o /goal:
#     /goal "bash exemplo-goal/verify.sh sai com codigo 0"
set -uo pipefail
cd "$(dirname "$0")"

falhou=0

echo "==> [1/2] testes"
if node --test test/; then
  echo "    OK"
else
  echo "    FALHOU"
  falhou=1
fi

echo
echo "==> [2/2] pendencias"
if node scripts/check-pendencias.mjs; then
  echo "    OK"
else
  echo "    FALHOU"
  falhou=1
fi

echo
if [ "$falhou" -eq 0 ]; then
  echo "verify: TUDO VERDE (exit 0)"
else
  echo "verify: AINDA VERMELHO (exit 1)"
fi
exit "$falhou"
