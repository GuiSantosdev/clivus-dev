/**
 * SISTEMA OFICIAL DE TEMAS - ABACUS
 * Registro único de temas oficiais
 * APENAS 3 TEMAS: simples, moderado, moderno
 */

import { ThemeDefinition, ThemeId } from "./types";

// Re-exportar tipos para facilitar imports
export type { ThemeId, ThemeDefinition } from "./types";

/**
 * REGISTRO OFICIAL DE TEMAS
 * Este é o único local onde os temas são definidos.
 * NÃO adicione ou remova temas deste registro.
 */
export const OFFICIAL_THEMES: Record<ThemeId, ThemeDefinition> = {
  simples: {
    id: "simples",
    name: "Simples",
    description: "Fundo branco, ação primária verde vibrante, estilo minimalista",
    category: "clean",
    isDark: false,
  },
  moderado: {
    id: "moderado",
    name: "Moderado",
    description: "Fundo branco, ação primária amarelo/dourado, estilo corporativo",
    category: "professional",
    isDark: false,
  },
  moderno: {
    id: "moderno",
    name: "Moderno",
    description: "Fundo preto profundo, ação primária roxa, gradiente neon",
    category: "modern",
    isDark: true,
  },
};

/**
 * Lista de IDs de temas válidos
 */
export const VALID_THEME_IDS: ThemeId[] = ["simples", "moderado", "moderno"];

/**
 * Tema padrão do sistema
 */
export const DEFAULT_THEME: ThemeId = "simples";

/**
 * Verifica se um ID de tema é válido
 */
export function isValidThemeId(themeId: string): themeId is ThemeId {
  return VALID_THEME_IDS.includes(themeId as ThemeId);
}

/**
 * Obtém a definição de um tema pelo ID
 */
export function getThemeById(themeId: ThemeId): ThemeDefinition {
  return OFFICIAL_THEMES[themeId];
}

/**
 * Obtém todos os temas disponíveis como array
 */
export function getAllThemes(): ThemeDefinition[] {
  return Object.values(OFFICIAL_THEMES);
}
