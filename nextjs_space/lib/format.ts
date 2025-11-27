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

// ==================== FORMATAÇÃO DE DATAS ====================

/**
 * Formata uma data para o padrão brasileiro (dd/mm/aaaa)
 * @param date - Data a ser formatada (Date, string ou timestamp)
 * @returns String formatada no padrão dd/mm/aaaa
 * @example formatDate(new Date('2025-01-15')) => "15/01/2025"
 */
export function formatDate(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Formata uma data e hora para o padrão brasileiro (dd/mm/aaaa às hh:mm)
 * @param date - Data a ser formatada
 * @returns String formatada no padrão dd/mm/aaaa às hh:mm
 * @example formatDateTime(new Date('2025-01-15T14:30')) => "15/01/2025 às 14:30"
 */
export function formatDateTime(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const dateStr = formatDate(dateObj);
  const timeStr = formatTime(dateObj);
  
  return `${dateStr} às ${timeStr}`;
}

/**
 * Formata uma data e hora completa com segundos (para logs/auditorias)
 * @param date - Data a ser formatada
 * @returns String formatada no padrão dd/mm/aaaa às hh:mm:ss
 * @example formatDateTimeFull(new Date('2025-01-15T14:30:45')) => "15/01/2025 às 14:30:45"
 */
export function formatDateTimeFull(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const dateStr = formatDate(dateObj);
  const timeStr = formatTimeFull(dateObj);
  
  return `${dateStr} às ${timeStr}`;
}

// ==================== FORMATAÇÃO DE HORAS ====================

/**
 * Formata uma hora para o padrão brasileiro (hh:mm)
 * @param date - Data/hora a ser formatada
 * @returns String formatada no padrão hh:mm
 * @example formatTime(new Date('2025-01-15T14:30:45')) => "14:30"
 */
export function formatTime(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateObj);
}

/**
 * Formata uma hora completa com segundos (para logs/auditorias)
 * @param date - Data/hora a ser formatada
 * @returns String formatada no padrão hh:mm:ss
 * @example formatTimeFull(new Date('2025-01-15T14:30:45')) => "14:30:45"
 */
export function formatTimeFull(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(dateObj);
}

// ==================== UTILITÁRIOS DE DATA ====================

/**
 * Obtém o primeiro dia da semana (domingo) para uma data específica
 * @param date - Data de referência
 * @returns Data do domingo da semana
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day; // 0 para domingo, 1 para segunda, etc.
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtém o último dia da semana (sábado) para uma data específica
 * @param date - Data de referência
 * @returns Data do sábado da semana
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = 6 - day; // Dias até sábado
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Formata um período de datas
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns String formatada como "dd/mm/aaaa - dd/mm/aaaa"
 */
export function formatDateRange(
  startDate: Date | string | number | undefined | null,
  endDate: Date | string | number | undefined | null
): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (!start && !end) return '';
  if (!end) return start;
  if (!start) return end;
  
  return `${start} - ${end}`;
}
