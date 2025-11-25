"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Palette, Check, Lock, Info, Sun, Moon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { getAllThemes, getThemeById, ThemeId } from "@/shared/theme/themes";
import { applyTheme } from "@/shared/theme/applyTheme";
import { ThemeHierarchy } from "@/shared/theme/types";

/**
 * ThemeSelector - Componente Único Oficial para Troca de Tema
 * 
 * CARACTERÍSTICAS:
 * - Aplica tema IMEDIATAMENTE ao clicar
 * - Atualiza o banco de dados
 * - Atualiza o HTML (<html data-theme>)
 * - Atualiza o Context Provider
 * - Re-renderiza o app sem reload
 * - Mostra o tema selecionado com borda clara
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("simples");
  const [hierarchy, setHierarchy] = useState<ThemeHierarchy | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega hierarquia de temas ao montar
  useEffect(() => {
    loadThemeHierarchy();
  }, []);

  /**
   * Carrega a hierarquia de temas do servidor
   */
  const loadThemeHierarchy = async () => {
    try {
      const response = await fetch("/api/user/theme");
      if (response.ok) {
        const data = await response.json();
        setHierarchy(data);
        setCurrentTheme(data.effectiveTheme);
        
        // Aplica tema imediatamente
        applyTheme(data.effectiveTheme);
        setTheme(data.effectiveTheme);
      } else {
        // Fallback para localStorage
        const savedTheme = (localStorage.getItem("clivus-theme") as ThemeId) || "simples";
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Erro ao carregar tema:", error);
      const savedTheme = (localStorage.getItem("clivus-theme") as ThemeId) || "simples";
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
      setTheme(savedTheme);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplica tema IMEDIATAMENTE ao clicar
   */
  const handleThemeChange = (newTheme: ThemeId) => {
    // Verifica permissões
    if (hierarchy && !hierarchy.canChangeTheme) {
      toast.error("Alteração de tema desabilitada pelo administrador");
      return;
    }

    // 1. Aplica IMEDIATAMENTE no DOM
    applyTheme(newTheme);
    
    // 2. Atualiza estados locais
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    
    // 3. Persiste no localStorage
    localStorage.setItem("clivus-theme", newTheme);
    
    // 4. Salva no banco (async, não bloqueia)
    saveThemeToAPI(newTheme);
  };

  /**
   * Salva tema no banco de dados (async)
   */
  const saveThemeToAPI = async (newTheme: ThemeId) => {
    try {
      const response = await fetch("/api/user/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreset: newTheme }),
      });

      if (response.ok) {
        toast.success("Tema atualizado com sucesso");
        loadThemeHierarchy();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao salvar tema");
      }
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
      // Não mostra erro para não interromper UX
    }
  };

  /**
   * Reseta tema para o padrão do sistema
   */
  const resetToDefault = async () => {
    try {
      const response = await fetch("/api/user/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreset: null }),
      });

      if (response.ok) {
        toast.success("Tema resetado para o padrão do sistema");
        loadThemeHierarchy();
      } else {
        toast.error("Erro ao resetar tema");
      }
    } catch (error) {
      console.error("Erro ao resetar tema:", error);
      toast.error("Erro ao resetar tema");
    }
  };

  const canChange = hierarchy?.canChangeTheme ?? true;
  const allThemes = getAllThemes();

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-8 bg-muted-soft animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="space-y-2">
        {!canChange && (
          <div className="flex items-center gap-2 text-xs text-theme-muted bg-muted-soft p-2 rounded">
            <Lock className="h-3 w-3" />
            <span>Tema definido pelo administrador</span>
          </div>
        )}
        {hierarchy?.userTheme === null && (
          <div className="flex items-center gap-2 text-xs text-theme-muted bg-muted-soft p-2 rounded">
            <Info className="h-3 w-3" />
            <span>Usando tema padrão do sistema</span>
          </div>
        )}
      </div>

      {/* Seletor Principal */}
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <Select
          value={currentTheme}
          onValueChange={(value) => handleThemeChange(value as ThemeId)}
          disabled={!canChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allThemes.map((themeOption) => {
              const Icon = themeOption.isDark ? Moon : Sun;
              return (
                <SelectItem key={themeOption.id} value={themeOption.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{themeOption.name}</span>
                    {currentTheme === themeOption.id && (
                      <Check className="h-3 w-3 ml-auto text-primary" />
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Preview Cards */}
      <div className="grid grid-cols-3 gap-2">
        {allThemes.map((themeOption) => {
          const Icon = themeOption.isDark ? Moon : Sun;
          const isSelected = currentTheme === themeOption.id;
          
          return (
            <button
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              disabled={!canChange}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-theme hover:border-primary/50"
                }
                ${!canChange ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-theme-muted"}`} />
                <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-theme"}`}>
                  {themeOption.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Botão Resetar */}
      {hierarchy?.userTheme && canChange && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefault}
          className="w-full"
        >
          Resetar para Padrão
        </Button>
      )}
    </div>
  );
}
