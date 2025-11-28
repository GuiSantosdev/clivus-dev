"use client";

import { useState, useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { ThemeId, DEFAULT_THEME } from "@/shared/theme/themes";
import { applyTheme, loadSavedTheme } from "@/shared/theme/applyTheme";

/**
 * Hook Oficial Único para Gerenciamento de Temas
 * 
 * Este é o ÚNICO hook que deve ser usado para manipular temas no sistema.
 * Ele garante:
 * - Aplicação imediata
 * - Persistência em localStorage
 * - Sincronização com next-themes
 * - Re-renderização automática
 */
export function useTheme() {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [isReady, setIsReady] = useState(false);

  // Carrega tema ao montar
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
    setNextTheme(savedTheme);
    setIsReady(true);
  }, [setNextTheme]);

  /**
   * Altera o tema imediatamente
   * @param newTheme - ID do novo tema
   */
  const changeTheme = (newTheme: ThemeId) => {
    // Aplica imediatamente
    applyTheme(newTheme);
    
    // Atualiza estados
    setCurrentTheme(newTheme);
    setNextTheme(newTheme);
  };

  return {
    /** Tema atual */
    theme: currentTheme,
    
    /** Função para alterar o tema */
    setTheme: changeTheme,
    
    /** Indica se o tema foi carregado */
    isReady,
  };
}
