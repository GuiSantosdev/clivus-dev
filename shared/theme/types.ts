/**
 * SISTEMA OFICIAL DE TEMAS - ABACUS
 * Interfaces e tipos para o sistema de temas
 * Apenas 3 temas oficiais: simples, moderado, moderno
 */

export type ThemeId = "simples" | "moderado" | "moderno";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  category: "clean" | "professional" | "modern";
  isDark: boolean;
}

export interface ThemeHierarchy {
  effectiveTheme: ThemeId;
  userTheme: ThemeId | null;
  officeTheme: ThemeId | null;
  superadminTheme: ThemeId;
  canChangeTheme: boolean;
  isOfficeOwner: boolean;
  allowOfficeOverride: boolean;
}
