import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  subtotal,
  aplicarDesconto,
  frete,
  formatarBRL,
  total,
} from '../src/carrinho.js';

const CARRINHO = [
  { precoCentavos: 5000, quantidade: 2 }, // R$ 50,00 x2 = R$ 100,00
  { precoCentavos: 3000, quantidade: 1 }, // R$ 30,00 x1 = R$  30,00
];

test('subtotal multiplica preco pela quantidade', () => {
  assert.equal(subtotal(CARRINHO), 13000);
});

test('subtotal de carrinho vazio e zero', () => {
  assert.equal(subtotal([]), 0);
});

test('aplicarDesconto tira o percentual do valor', () => {
  assert.equal(aplicarDesconto(13000, 10), 11700);
  assert.equal(aplicarDesconto(13000, 0), 13000);
  assert.equal(aplicarDesconto(13000, 100), 0);
});

test('aplicarDesconto sempre devolve centavos inteiros', () => {
  // 10% de 999 = 99,9 -> o resultado nao pode ser 899.1
  const r = aplicarDesconto(999, 10);
  assert.ok(Number.isInteger(r), `esperava inteiro, veio ${r}`);
  assert.equal(r, 899);
});

test('aplicarDesconto rejeita percentual fora de 0..100', () => {
  assert.throws(() => aplicarDesconto(1000, -1), RangeError);
  assert.throws(() => aplicarDesconto(1000, 101), RangeError);
});

test('frete e gratis a partir de R$ 200,00 (inclusive)', () => {
  assert.equal(frete(20000), 0);
  assert.equal(frete(20001), 0);
  assert.equal(frete(19999), 1990);
});

test('formatarBRL usa ponto de milhar e virgula decimal', () => {
  assert.equal(formatarBRL(999), 'R$ 9,99');
  assert.equal(formatarBRL(123456), 'R$ 1.234,56');
  assert.equal(formatarBRL(100000000), 'R$ 1.000.000,00');
});

test('total aplica o desconto so nos produtos, e depois soma o frete', () => {
  // subtotal 13000 -> desconto 10% = 11700 -> frete 1990 -> 13690
  assert.equal(total(CARRINHO, 10), 13690);
});

test('total zera o frete quando o desconto ainda deixa R$ 200,00', () => {
  const itens = [{ precoCentavos: 12500, quantidade: 2 }]; // 25000
  // desconto 20% = 20000 -> frete gratis -> 20000
  assert.equal(total(itens, 20), 20000);
});

test('total sem desconto soma frete ao subtotal', () => {
  assert.equal(total(CARRINHO), 14990);
});
