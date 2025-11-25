"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import {
  Palette,
  Circle,
  Square,
  Sparkles,
  Save,
  ArrowLeft,
  Users,
  Building2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

type ThemePreset = "padrao" | "simples" | "moderado" | "moderno";

interface GlobalSettings {
  id: number;
  superadminThemePreset: ThemePreset;
  allowOfficeOverride: boolean;
  allowUserOverride: boolean;
  createdAt: string;
  updatedAt: string;
}

const THEME_OPTIONS = [
  {
    value: "padrao",
    label: "Padrão",
    description: "Visual clássico e equilibrado",
    icon: Circle,
  },
  {
    value: "simples",
    label: "Simples",
    description: "Minimalista e limpo",
    icon: Square,
  },
  {
    value: "moderado",
    label: "Moderado",
    description: "Balanceado e profissional",
    icon: Palette,
  },
  {
    value: "moderno",
    label: "Moderno",
    description: "Ousado e contemporâneo",
    icon: Sparkles,
  },
];

export default function ThemeConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  const [superadminThemePreset, setSuperadminThemePreset] =
    useState<ThemePreset>("padrao");
  const [allowOfficeOverride, setAllowOfficeOverride] = useState(false);
  const [allowUserOverride, setAllowUserOverride] = useState(true);

  // Verificar autenticação e permissões
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "superadmin") {
      toast.error("Acesso negado");
      router.push("/dashboard");
      return;
    }

    loadSettings();
  }, [session, status, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/theme-settings");

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSuperadminThemePreset(data.settings.superadminThemePreset);
        setAllowOfficeOverride(data.settings.allowOfficeOverride);
        setAllowUserOverride(data.settings.allowUserOverride);
      } else {
        toast.error("Erro ao carregar configurações");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/theme-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          superadminThemePreset,
          allowOfficeOverride,
          allowUserOverride,
        }),
      });

      if (response.ok) {
        toast.success("✓ Configurações salvas com sucesso!");
        await loadSettings();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-theme-muted">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const currentThemeOption = THEME_OPTIONS.find(
    (t) => t.value === superadminThemePreset
  );

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            Configuração de Temas do Sistema
          </h1>
          <p className="text-theme-muted">
            Defina o tema padrão e permissões de personalização para todos os
            usuários.
          </p>
        </div>

        {/* Card de Configuração */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema Padrão do Sistema
            </CardTitle>
            <CardDescription>
              Este tema será aplicado a todos os usuários que não escolherem um
              tema personalizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seletor de Tema */}
            <div>
              <Label htmlFor="theme-select" className="text-base font-semibold mb-3 block">
                Selecione o Tema Padrão
              </Label>
              <Select
                value={superadminThemePreset}
                onValueChange={(value) =>
                  setSuperadminThemePreset(value as ThemePreset)
                }
              >
                <SelectTrigger id="theme-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{theme.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {theme.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Preview do Tema Selecionado */}
              {currentThemeOption && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Tema Selecionado: {currentThemeOption.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentThemeOption.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Permissões */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Permissões de Personalização
            </CardTitle>
            <CardDescription>
              Controle quem pode personalizar o tema do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Permitir que usuários alterem tema */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <Label htmlFor="allow-user-override" className="font-semibold cursor-pointer">
                    Permitir Usuários Escolherem Tema
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Se habilitado, cada usuário poderá escolher seu próprio tema
                  na sidebar. Caso contrário, todos usarão o tema padrão.
                </p>
              </div>
              <Switch
                id="allow-user-override"
                checked={allowUserOverride}
                onCheckedChange={setAllowUserOverride}
              />
            </div>

            {/* Permitir que donos de escritório alterem tema (futura implementação) */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg opacity-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <Label className="font-semibold">
                    Permitir Donos de Escritório Definirem Tema
                  </Label>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Em Breve
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permite que donos de escritório definam um tema para todos
                  os membros do escritório. (Funcionalidade futura)
                </p>
              </div>
              <Switch
                checked={allowOfficeOverride}
                onCheckedChange={setAllowOfficeOverride}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Card de Hierarquia de Temas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Como Funciona a Hierarquia de Temas?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 font-bold text-lg">1º</span>
                <div>
                  <p className="font-semibold text-green-900">Tema do Usuário</p>
                  <p className="text-sm text-green-700">
                    Se o usuário escolher um tema personalizado, ele terá
                    prioridade sobre todos os outros.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg opacity-50">
                <span className="text-purple-600 font-bold text-lg">2º</span>
                <div>
                  <p className="font-semibold text-purple-900">
                    Tema do Escritório{" "}
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      Em Breve
                    </span>
                  </p>
                  <p className="text-sm text-purple-700">
                    Se o usuário não tiver um tema, o tema do escritório será
                    aplicado (se configurado).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 font-bold text-lg">3º</span>
                <div>
                  <p className="font-semibold text-blue-900">
                    Tema Padrão do Sistema
                  </p>
                  <p className="text-sm text-blue-700">
                    Se nenhum dos anteriores estiver configurado, o tema padrão
                    do sistema é aplicado.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end gap-3">
          <Link href="/admin">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
