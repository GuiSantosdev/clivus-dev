"use client";

import { useTheme } from "next-themes";

/**
 * Função Universal para Alterar Tema
 * Usa o hook useTheme do next-themes
 * Temas disponíveis: blue-light, blue-dark, green-light, green-dark, purple-light, purple-dark
 */
export function changeTheme(theme: string) {
  const { setTheme } = useTheme();
  setTheme(theme);
}

/**
 * Hook para usar a função changeTheme
 * Retorna a função e o tema atual
 */
export function useChangeTheme() {
  const { theme, setTheme } = useTheme();
  
  const change = (newTheme: string) => {
    setTheme(newTheme);
  };
  
  return { theme, changeTheme: change };
}
