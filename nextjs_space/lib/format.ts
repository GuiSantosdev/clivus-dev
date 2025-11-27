/**
 * Utilitários de formatação para o sistema Clivus
 */

/**
 * Formata um valor numérico para o padrão monetário brasileiro
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão R$ 0.000,00
 */
export function formatCurrency(value: number | string | undefined | null): string {
  // Converte para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Retorna R$ 0,00 se o valor for inválido
  if (numValue === undefined || numValue === null || isNaN(numValue)) {
    return 'R$ 0,00';
  }
  
  // Formata usando Intl.NumberFormat para padrão brasileiro
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Formata um valor numérico para o padrão brasileiro sem o símbolo R$
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão 0.000,00
 */
export function formatNumber(value: number | string | undefined | null): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue === undefined || numValue === null || isNaN(numValue)) {
    return '0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Formata uma porcentagem para o padrão brasileiro
 * @param value - Valor numérico a ser formatado (ex: 15 para 15%)
 * @returns String formatada no padrão 0,00%
 */
export function formatPercent(value: number | string | undefined | null): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue === undefined || numValue === null || isNaN(numValue)) {
    return '0,00%';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue / 100);
}
