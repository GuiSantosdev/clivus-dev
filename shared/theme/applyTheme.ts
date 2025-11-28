/**
 * SISTEMA OFICIAL DE TEMAS - ABACUS
 * Lógica única para aplicação de temas
 * Este é o ÚNICO arquivo responsável por aplicar temas no sistema
 */

import { ThemeId, DEFAULT_THEME } from "./themes";

/**
 * Aplica um tema ao documento HTML
 * @param themeId - ID do tema a ser aplicado
 */
export function applyTheme(themeId: ThemeId): void {
  if (typeof window === "undefined") return;

  const html = document.documentElement;
  
  // Atualiza APENAS o data-attribute (next-themes gerencia isso)
  html.setAttribute("data-theme", themeId);
  
  // Salva no localStorage para persistência
  try {
    localStorage.setItem("clivus-theme", themeId);
  } catch (error) {
    console.warn("Erro ao salvar tema no localStorage:", error);
  }
  
  console.log(`✅ Tema aplicado: ${themeId} - Verifique o atributo data-theme no <html>`);
}

/**
 * Carrega o tema salvo do localStorage
 * @returns ThemeId do tema salvo ou tema padrão
 */
export function loadSavedTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;

  try {
    const savedTheme = localStorage.getItem("clivus-theme");
    if (savedTheme && isValidTheme(savedTheme)) {
      return savedTheme as ThemeId;
    }
  } catch (error) {
    console.warn("Erro ao carregar tema do localStorage:", error);
  }

  return DEFAULT_THEME;
}

/**
 * Verifica se um tema é válido
 * @param theme - String a ser verificada
 * @returns boolean
 */
function isValidTheme(theme: string): boolean {
  return ["simples", "moderado", "moderno"].includes(theme);
}

/**
 * Aplica o tema imediatamente e notifica listeners
 * @param themeId - ID do tema
 * @param onSuccess - Callback de sucesso
 * @param onError - Callback de erro
 */
export async function applyThemeWithPersistence(
  themeId: ThemeId,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // Aplica o tema imediatamente no DOM
    applyTheme(themeId);

    // Notifica sucesso
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Erro ao aplicar tema:", error);
    if (onError) onError(error as Error);
  }
}
