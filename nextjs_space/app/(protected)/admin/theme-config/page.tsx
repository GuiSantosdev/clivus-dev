"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Save,
  ArrowLeft,
  Users,
  Building2,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";

type ThemePreset = "simples" | "moderado" | "moderno" | "padrao-light" | "padrao-dark";

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
    value: "padrao-light",
    label: "Padrão Light",
    description: "Minimalista branco",
    icon: Sun,
  },
  {
    value: "padrao-dark",
    label: "Padrão Dark",
    description: "Minimalista preto",
    icon: Moon,
  },
  {
    value: "simples",
    label: "Simples",
    description: "Verde/branco clean",
    icon: Sun,
  },
  {
    value: "moderado",
    label: "Moderado",
    description: "Azul escuro profissional",
    icon: Sun,
  },
  {
    value: "moderno",
    label: "Moderno",
    description: "Dark com gradiente neon",
    icon: Moon,
  },
];

export default function ThemeConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  const [superadminThemePreset, setSuperadminThemePreset] =
    useState<ThemePreset>("padrao-light");
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
        toast.success("Configurações salvas com sucesso");
        loadSettings();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="p-8">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-theme-muted">Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme flex items-center gap-2">
              <Palette className="h-8 w-8 text-primary" />
              Configuração de Temas
            </h1>
            <p className="text-theme-muted mt-2">
              Gerencie o tema global e permissões de personalização
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Tema Padrão Global */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-theme">
              <Palette className="h-5 w-5 text-primary" />
              Tema Padrão do Sistema
            </CardTitle>
            <CardDescription className="text-theme-muted">
              Este tema será aplicado a todos os usuários que não personalizaram
              o próprio tema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="theme-select" className="text-theme">
                Selecione o Tema Global
              </Label>
              <Select
                value={superadminThemePreset}
                onValueChange={(value) => setSuperadminThemePreset(value as ThemePreset)}
              >
                <SelectTrigger id="theme-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-theme-muted">
                Tema atual: <strong>{superadminThemePreset}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-theme">
              <Users className="h-5 w-5 text-primary" />
              Permissões de Personalização
            </CardTitle>
            <CardDescription className="text-theme-muted">
              Controle quem pode personalizar o tema do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Permissão de Escritório (Futura Implementação) */}
            <div className="flex items-center justify-between p-4 bg-muted-soft rounded-lg border border-theme">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-theme-muted" />
                  <Label htmlFor="allow-office" className="text-theme cursor-pointer">
                    Permitir Escritórios Personalizarem
                  </Label>
                </div>
                <p className="text-xs text-theme-muted">
                  Donos de escritório poderão definir tema para seus membros
                  (Funcionalidade futura)
                </p>
              </div>
              <Switch
                id="allow-office"
                checked={allowOfficeOverride}
                onCheckedChange={setAllowOfficeOverride}
                disabled
              />
            </div>

            {/* Permissão de Usuário */}
            <div className="flex items-center justify-between p-4 bg-muted-soft rounded-lg border border-theme">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-theme-muted" />
                  <Label htmlFor="allow-user" className="text-theme cursor-pointer">
                    Permitir Usuários Personalizarem
                  </Label>
                </div>
                <p className="text-xs text-theme-muted">
                  Usuários individuais poderão escolher seu próprio tema
                </p>
              </div>
              <Switch
                id="allow-user"
                checked={allowUserOverride}
                onCheckedChange={setAllowUserOverride}
              />
            </div>
          </CardContent>
        </Card>

        {/* Hierarquia */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-theme">
              <CheckCircle className="h-5 w-5 text-primary" />
              Como Funciona a Hierarquia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-theme-muted">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <strong className="text-theme">Tema do Usuário</strong>
                  <p>Se o usuário personalizou, usará o tema escolhido por ele</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <strong className="text-theme">Tema do Escritório</strong>
                  <p>
                    Se não, e pertence a um escritório, usará o tema do escritório
                    (Funcionalidade futura)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <strong className="text-theme">Tema Global (SuperAdmin)</strong>
                  <p>
                    Se não, usará o tema padrão definido aqui pelo SuperAdmin
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <div>
                  <strong className="text-theme">Fallback</strong>
                  <p>Se nenhum estiver definido, usará "padrao-light" (tema padrão do sistema)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3">
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
