"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Check,
  Circle,
  Square,
  Sparkles,
  Lock,
  Info,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

type ThemePreset = "padrao" | "simples" | "moderado" | "moderno";

interface ThemeOption {
  value: ThemePreset;
  label: string;
  description: string;
  icon: React.ReactNode;
  colors: {
    bg: string;
    surface: string;
    primary: string;
    text: string;
  };
}

interface ThemeHierarchy {
  effectiveTheme: ThemePreset;
  userTheme: ThemePreset | null;
  officeTheme: ThemePreset | null;
  superadminTheme: ThemePreset;
  canChangeTheme: boolean;
  isOfficeOwner: boolean;
  allowOfficeOverride: boolean;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "padrao",
    label: "Padrão",
    description: "Visual clássico e equilibrado",
    icon: <Circle className="h-4 w-4" />,
    colors: {
      bg: "#ffffff",
      surface: "#ffffff",
      primary: "#3b82f6",
      text: "#1f2937",
    },
  },
  {
    value: "simples",
    label: "Simples",
    description: "Minimalista e limpo",
    icon: <Square className="h-4 w-4" />,
    colors: {
      bg: "#ffffff",
      surface: "#fafafa",
      primary: "#404040",
      text: "#171717",
    },
  },
  {
    value: "moderado",
    label: "Moderado",
    description: "Balanceado e profissional",
    icon: <Palette className="h-4 w-4" />,
    colors: {
      bg: "#fafbfc",
      surface: "#ffffff",
      primary: "#2563eb",
      text: "#1e293b",
    },
  },
  {
    value: "moderno",
    label: "Moderno",
    description: "Ousado e contemporâneo",
    icon: <Sparkles className="h-4 w-4" />,
    colors: {
      bg: "#0a0a0f",
      surface: "#16161f",
      primary: "#8b5cf6",
      text: "#f8f8f8",
    },
  },
];

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>("padrao");
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState<ThemeHierarchy | null>(null);

  // Carregar hierarquia de temas da API
  useEffect(() => {
    setMounted(true);
    loadThemeHierarchy();
  }, []);

  const loadThemeHierarchy = async () => {
    try {
      const response = await fetch("/api/user/theme");
      if (response.ok) {
        const data = await response.json();
        setHierarchy(data);
        setCurrentTheme(data.effectiveTheme || "padrao");
        applyTheme(data.effectiveTheme || "padrao", false);
      } else {
        // Fallback para localStorage se API falhar
        const savedTheme = localStorage.getItem("theme-preset") as ThemePreset;
        if (savedTheme && THEME_OPTIONS.find((t) => t.value === savedTheme)) {
          setCurrentTheme(savedTheme);
          applyTheme(savedTheme, false);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar hierarquia de temas:", error);
      // Fallback para localStorage
      const savedTheme = localStorage.getItem("theme-preset") as ThemePreset;
      if (savedTheme && THEME_OPTIONS.find((t) => t.value === savedTheme)) {
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme, false);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: ThemePreset, saveToAPI: boolean = true) => {
    // Remove todos os data-theme anteriores
    document.documentElement.removeAttribute("data-theme");

    // Aplica o novo tema
    if (theme !== "padrao") {
      document.documentElement.setAttribute("data-theme", theme);
    }

    // Salva no localStorage como backup
    localStorage.setItem("theme-preset", theme);
    setCurrentTheme(theme);

    // Salva no backend se permitido
    if (saveToAPI && hierarchy?.canChangeTheme) {
      saveThemeToAPI(theme);
    }
  };

  const saveThemeToAPI = async (theme: ThemePreset) => {
    try {
      const response = await fetch("/api/user/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreset: theme }),
      });

      if (response.ok) {
        toast.success("Tema salvo com sucesso!");
        // Recarregar hierarquia para refletir mudanças
        await loadThemeHierarchy();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao salvar tema");
      }
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
      toast.error("Erro ao salvar tema");
    }
  };

  const handleThemeChange = (value: string) => {
    const theme = value as ThemePreset;

    // Verificar se usuário pode alterar
    if (hierarchy && !hierarchy.canChangeTheme) {
      toast.error("Você não tem permissão para alterar o tema");
      return;
    }

    applyTheme(theme, true);
  };

  const resetToDefault = async () => {
    if (!hierarchy?.canChangeTheme) {
      toast.error("Você não tem permissão para alterar o tema");
      return;
    }

    try {
      const response = await fetch("/api/user/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreset: null }),
      });

      if (response.ok) {
        toast.success("Tema resetado para padrão!");
        await loadThemeHierarchy();
      }
    } catch (error) {
      console.error("Erro ao resetar tema:", error);
      toast.error("Erro ao resetar tema");
    }
  };

  // Evita hidratação incorreta
  if (!mounted || loading) {
    return (
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    );
  }

  const currentOption = THEME_OPTIONS.find((t) => t.value === currentTheme);
  const canChange = hierarchy?.canChangeTheme ?? true;

  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        {/* Informação sobre permissões */}
        {hierarchy && !canChange && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Tema definido pelo administrador
            </span>
          </div>
        )}

        {/* Informação sobre tema herdado */}
        {hierarchy && hierarchy.userTheme === null && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-600">
              Usando tema padrão do sistema
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Seletor de Tema */}
          <Select
            value={currentTheme}
            onValueChange={handleThemeChange}
            disabled={!canChange}
          >
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  <div className="flex items-center gap-3">
                    {theme.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{theme.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {theme.description}
                      </span>
                    </div>
                    {currentTheme === theme.value && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão de Preview */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            title="Ver preview dos temas"
          >
            <Palette className="h-4 w-4" />
          </Button>

          {/* Botão de Reset (só aparece se usuário tem tema personalizado) */}
          {hierarchy?.userTheme && canChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              title="Resetar para tema padrão"
              className="text-xs"
            >
              Resetar
            </Button>
          )}
        </div>
      </div>

      {/* Preview dos Temas */}
      {showPreview && (
        <Card className="absolute top-full right-0 mt-2 w-[400px] z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                Aparências Disponíveis
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                Fechar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => {
                    if (canChange) {
                      handleThemeChange(theme.value);
                      setShowPreview(false);
                    } else {
                      toast.error(
                        "Você não tem permissão para alterar o tema"
                      );
                    }
                  }}
                  disabled={!canChange}
                  className={
                    `relative flex flex-col gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      currentTheme === theme.value
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    } ${
                      !canChange ? "opacity-50 cursor-not-allowed" : ""
                    }`
                  }
                >
                  {/* Preview Visual */}
                  <div className="flex gap-1 h-12">
                    <div
                      className="flex-1 rounded"
                      style={{ backgroundColor: theme.colors.bg }}
                    />
                    <div
                      className="flex-1 rounded"
                      style={{ backgroundColor: theme.colors.surface }}
                    />
                    <div
                      className="flex-1 rounded"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                  </div>

                  {/* Info do Tema */}
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 mb-1">
                      {theme.icon}
                      <span className="font-medium text-sm">
                        {theme.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  </div>

                  {/* Checkmark se selecionado */}
                  {currentTheme === theme.value && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Informação sobre o tema atual */}
            {currentOption && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{currentOption.icon}</div>
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Tema Atual: {currentOption.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentOption.description}
                    </p>
                    {hierarchy?.userTheme === null && (
                      <p className="text-xs text-blue-600 mt-1">
                        (Herdado do tema padrão do sistema)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Informação sobre hierarquia */}
            {hierarchy && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">
                  Hierarquia de Temas:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  {hierarchy.userTheme && (
                    <li>✓ Seu tema: <strong>{hierarchy.userTheme}</strong></li>
                  )}
                  {hierarchy.officeTheme && (
                    <li>○ Tema do escritório: {hierarchy.officeTheme}</li>
                  )}
                  <li>
                    ○ Tema padrão do sistema:{" "}
                    <strong>{hierarchy.superadminTheme}</strong>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
