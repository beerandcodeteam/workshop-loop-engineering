// Carrinho de compras do checkout.
// Todas as funcoes recebem centavos (inteiro) para evitar float.

/**
 * Soma o valor bruto do carrinho.
 * @param {{precoCentavos:number, quantidade:number}[]} itens
 * @returns {number} centavos
 */
export function subtotal(itens) {
  let acc = 0;
  for (const item of itens) {
    acc += item.precoCentavos;
  }
  return acc;
}

/**
 * Aplica um desconto percentual sobre um valor em centavos.
 * Percentual valido: 0 a 100.
 * @param {number} centavos
 * @param {number} percentual
 * @returns {number} centavos
 */
export function aplicarDesconto(centavos, percentual) {
  if (percentual < 0 || percentual > 100) {
    throw new RangeError(`percentual invalido: ${percentual}`);
  }
  return centavos - (centavos * percentual) / 100;
}

/**
 * Frete: gratis a partir de R$ 200,00. Abaixo disso, R$ 19,90.
 * @param {number} centavos subtotal ja com desconto
 * @returns {number} centavos
 */
export function frete(centavos) {
  // TODO: confirmar com o produto se o frete gratis e a partir de 200 ou acima de 200
  if (centavos > 20000) return 0;
  return 1990;
}

/**
 * Formata centavos como moeda brasileira.
 * @param {number} centavos
 * @returns {string} ex: "R$ 1.234,56"
 */
export function formatarBRL(centavos) {
  const reais = centavos / 100;
  return `R$ ${reais.toFixed(2).replace('.', ',')}`;
}

/**
 * Total final do checkout: subtotal, desconto e frete.
 * @param {{precoCentavos:number, quantidade:number}[]} itens
 * @param {number} percentualDesconto
 * @returns {number} centavos
 */
export function total(itens, percentualDesconto = 0) {
  const bruto = subtotal(itens);
  const comFrete = bruto + frete(bruto);
  return aplicarDesconto(comFrete, percentualDesconto);
}
