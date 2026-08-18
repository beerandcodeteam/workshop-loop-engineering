// Segundo portao do verify.sh: nenhum marcador de pendencia pode sobrar em src/.
// Deliberadamente simples — o objetivo e ser deterministico e obvio na tela.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = 'src';
const MARCADORES = /\b(TODO|FIXME|XXX|HACK)\b/;

function arquivos(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho];
  });
}

const achados = [];
for (const caminho of arquivos(RAIZ)) {
  readFileSync(caminho, 'utf8')
    .split('\n')
    .forEach((linha, i) => {
      if (MARCADORES.test(linha)) {
        achados.push(`${caminho}:${i + 1}: ${linha.trim()}`);
      }
    });
}

if (achados.length > 0) {
  console.error(`check-pendencias: ${achados.length} pendencia(s) em ${RAIZ}/`);
  for (const a of achados) console.error(`  ${a}`);
  process.exit(1);
}

console.log('check-pendencias: nenhuma pendencia em src/');
