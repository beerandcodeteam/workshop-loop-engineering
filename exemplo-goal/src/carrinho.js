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
    acc += item.precoCentavos * item.quantidade;
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
  return Math.round(centavos - (centavos * percentual) / 100);
}

/**
 * Frete: gratis a partir de R$ 200,00. Abaixo disso, R$ 19,90.
 * @param {number} centavos subtotal ja com desconto
 * @returns {number} centavos
 */
export function frete(centavos) {
  if (centavos >= 20000) return 0;
  return 1990;
}

/**
 * Formata centavos como moeda brasileira.
 * @param {number} centavos
 * @returns {string} ex: "R$ 1.234,56"
 */
export function formatarBRL(centavos) {
  const reais = centavos / 100;
  const [inteiro, decimal] = reais.toFixed(2).split('.');
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${comMilhar},${decimal}`;
}

/**
 * Total final do checkout: subtotal, desconto e frete.
 * @param {{precoCentavos:number, quantidade:number}[]} itens
 * @param {number} percentualDesconto
 * @returns {number} centavos
 */
export function total(itens, percentualDesconto = 0) {
  const comDesconto = aplicarDesconto(subtotal(itens), percentualDesconto);
  return comDesconto + frete(comDesconto);
}
