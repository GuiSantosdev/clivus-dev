"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Palette,
  Check,
  Lock,
  Info,
  Sun,
  Moon,
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

type ThemePreset = "simples" | "moderado" | "moderno" | "padrao-light" | "padrao-dark";

interface ThemeOption {
  value: ThemePreset;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "clean" | "professional" | "modern";
  isDark: boolean;
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
    value: "padrao-light",
    label: "Padrão Light",
    description: "Minimalista branco",
    icon: <Sun className="h-4 w-4" />,
    category: "clean",
    isDark: false,
  },
  {
    value: "padrao-dark",
    label: "Padrão Dark",
    description: "Minimalista preto",
    icon: <Moon className="h-4 w-4" />,
    category: "clean",
    isDark: true,
  },
  {
    value: "simples",
    label: "Simples",
    description: "Verde/branco clean",
    icon: <Sun className="h-4 w-4" />,
    category: "clean",
    isDark: false,
  },
  {
    value: "moderado",
    label: "Moderado",
    description: "Azul escuro profissional",
    icon: <Sun className="h-4 w-4" />,
    category: "professional",
    isDark: false,
  },
  {
    value: "moderno",
    label: "Moderno",
    description: "Dark com gradiente neon",
    icon: <Moon className="h-4 w-4" />,
    category: "modern",
    isDark: true,
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>("padrao-light");
  const [hierarchy, setHierarchy] = useState<ThemeHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemePreset | null>(null);

  useEffect(() => {
    loadThemeHierarchy();
  }, []);

  const loadThemeHierarchy = async () => {
    try {
      const response = await fetch("/api/user/theme");
      if (response.ok) {
        const data = await response.json();
        setHierarchy(data);
        setCurrentTheme(data.effectiveTheme);
        setTheme(data.effectiveTheme);
      } else {
        // Fallback para localStorage
        const savedTheme = (localStorage.getItem("theme") as ThemePreset) || "padrao-light";
        setCurrentTheme(savedTheme);
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Erro ao carregar tema:", error);
      const savedTheme = (localStorage.getItem("theme") as ThemePreset) || "padrao-light";
      setCurrentTheme(savedTheme);
      setTheme(savedTheme);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: ThemePreset) => {
    if (hierarchy && !hierarchy.canChangeTheme) {
      toast.error("Alteração de tema desabilitada pelo administrador");
      return;
    }

    setCurrentTheme(newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    saveThemeToAPI(newTheme);
  };

  const saveThemeToAPI = async (newTheme: ThemePreset) => {
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
    }
  };

  const handlePreviewTheme = (themeToPreview: ThemePreset) => {
    setPreviewTheme(themeToPreview);
    setTheme(themeToPreview);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewTheme(null);
    setTheme(currentTheme);
  };

  const applyPreviewTheme = () => {
    if (previewTheme) {
      handleThemeChange(previewTheme);
      setShowPreview(false);
      setPreviewTheme(null);
    }
  };

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

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
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

      {/* Seletor */}
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <Select
          value={currentTheme}
          onValueChange={(value) => handleThemeChange(value as ThemePreset)}
          disabled={!canChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                  {currentTheme === option.value && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(true)}
          disabled={!canChange}
          className="flex-1"
        >
          <Palette className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
        {hierarchy?.userTheme && canChange && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="flex-1"
          >
            Resetar
          </Button>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Visualizar Temas</h3>
                <Button variant="ghost" size="sm" onClick={closePreview}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEME_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      previewTheme === option.value
                        ? "ring-2 ring-primary"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handlePreviewTheme(option.value)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="font-medium">{option.label}</span>
                        {previewTheme === option.value && (
                          <Check className="h-4 w-4 ml-auto text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-theme-muted">
                        {option.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Hierarquia */}
              {hierarchy && (
                <div className="mt-4 p-4 bg-muted-soft rounded space-y-2">
                  <h4 className="text-sm font-semibold">Hierarquia de Temas</h4>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-theme-muted">Seu tema: </span>
                      <span className="font-medium">
                        {hierarchy.userTheme || "(Padrão do sistema)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-muted">Escritório: </span>
                      <span className="font-medium">
                        {hierarchy.officeTheme || "(Não definido)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-muted">SuperAdmin: </span>
                      <span className="font-medium">
                        {hierarchy.superadminTheme}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={closePreview} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={applyPreviewTheme}
                  disabled={!previewTheme}
                  className="flex-1"
                >
                  Aplicar Tema
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
