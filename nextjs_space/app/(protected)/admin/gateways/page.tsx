
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

interface GatewayConfig {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type: "text" | "password";
    envVar: string;
  }[];
  webhookUrl?: string;
}

interface GatewayStatus {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  configured: boolean;
  lastCheckAt: string;
  error?: string;
}

export default function GatewaysManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [gatewayValues, setGatewayValues] = useState<Record<string, string>>({});
  const [gatewayStatuses, setGatewayStatuses] = useState<GatewayStatus[]>([]);

  const gateways: GatewayConfig[] = [
    {
      name: "asaas",
      displayName: "Asaas",
      description: "Gateway brasileiro com suporte a PIX, Boleto e Cartão",
      icon: "🇧🇷",
      fields: [
        {
          key: "apiKey",
          label: "API Key",
          placeholder: "$aact_...",
          type: "password",
          envVar: "ASAAS_API_KEY",
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret (Opcional)",
          placeholder: "seu_secret_aqui",
          type: "password",
          envVar: "ASAAS_WEBHOOK_SECRET",
        },
        {
          key: "environment",
          label: "Ambiente",
          placeholder: "production ou sandbox",
          type: "text",
          envVar: "ASAAS_ENVIRONMENT",
        },
      ],
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-dominio.com.br"}/api/webhook/asaas`,
    },
    {
      name: "cora",
      displayName: "CORA",
      description: "Banco brasileiro com boletos + QR Code PIX integrado",
      icon: "🏦",
      fields: [
        {
          key: "apiKey",
          label: "API Key (Client ID)",
          placeholder: "cora_api_key_...",
          type: "password",
          envVar: "CORA_API_KEY",
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret (Opcional)",
          placeholder: "seu_secret_aqui",
          type: "password",
          envVar: "CORA_WEBHOOK_SECRET",
        },
        {
          key: "environment",
          label: "Ambiente",
          placeholder: "production ou sandbox",
          type: "text",
          envVar: "CORA_ENVIRONMENT",
        },
      ],

      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-dominio.com.br"}/api/webhook/cora`,
    },
    {
      name: "pagarme",
      displayName: "Pagar.me",
      description: "Gateway brasileiro com PIX, Boleto e Cartão de Crédito",
      icon: "💳",
      fields: [
        {
          key: "apiKey",
          label: "API Key (Secret Key)",
          placeholder: "sk_test_... ou sk_live_...",
          type: "password",
          envVar: "PAGARME_API_KEY",
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret",
          placeholder: "wh_secret_...",
          type: "password",
          envVar: "PAGARME_WEBHOOK_SECRET",
        },
        {
          key: "environment",
          label: "Ambiente",
          placeholder: "test ou live",
          type: "text",
          envVar: "PAGARME_ENVIRONMENT",
        },
      ],

      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-dominio.com.br"}/api/webhook/pagarme`,
    },
    {
      name: "efi",
      displayName: "EFI (Gerencianet)",
      description: "Gateway brasileiro com PIX, Boleto e Cartão de Crédito",
      icon: "🟢",
      fields: [
        {
          key: "clientId",
          label: "Client ID",
          placeholder: "Client_Id_...",
          type: "password",
          envVar: "EFI_CLIENT_ID",
        },
        {
          key: "clientSecret",
          label: "Client Secret",
          placeholder: "Client_Secret_...",
          type: "password",
          envVar: "EFI_CLIENT_SECRET",
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret (Opcional)",
          placeholder: "seu_secret_aqui",
          type: "password",
          envVar: "EFI_WEBHOOK_SECRET",
        },
        {
          key: "environment",
          label: "Ambiente",
          placeholder: "sandbox ou production",
          type: "text",
          envVar: "EFI_ENVIRONMENT",
        },
      ],

      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-dominio.com.br"}/api/webhook/efi`,
    },
    {
      name: "stripe",
      displayName: "Stripe",
      description: "Gateway internacional para cartões de crédito",
      icon: "💳",
      fields: [
        {
          key: "secretKey",
          label: "Secret Key",
          placeholder: "sk_...",
          type: "password",
          envVar: "STRIPE_SECRET_KEY",
        },
        {
          key: "webhookSecret",
          label: "Webhook Secret",
          placeholder: "whsec_...",
          type: "password",
          envVar: "STRIPE_WEBHOOK_SECRET",
        },
      ],

      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-dominio.com.br"}/api/webhook`,
    },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "superadmin") {
        router.push("/dashboard");
        return;
      }
      fetchGatewayStatuses();
    }
  }, [status, session, router]);

  const fetchGatewayStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gateways/status");
      if (response.ok) {
        const data: GatewayStatus[] = await response.json();
        setGatewayStatuses(data);
        console.log("✅ Status dos gateways carregado:", data);
      } else {
        toast.error("Erro ao carregar status dos gateways");
      }
    } catch (error) {
      console.error("Erro ao buscar status dos gateways:", error);
      toast.error("Erro ao buscar status dos gateways");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGateway = async (gatewayName: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/gateways/${gatewayName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentStatus }),
      });

      if (response.ok) {
        toast.success(
          `Gateway ${gatewayName} ${!currentStatus ? "habilitado" : "desabilitado"} com sucesso!`
        );
        // Recarregar status após mudança
        await fetchGatewayStatuses();
      } else {
        toast.error("Erro ao atualizar status do gateway");
      }
    } catch (error) {
      console.error("Erro ao atualizar gateway:", error);
      toast.error("Erro ao atualizar status do gateway");
    }
  };

  // Função auxiliar para obter o status de um gateway específico
  const getGatewayStatus = (gatewayName: string): GatewayStatus | undefined => {
    return gatewayStatuses.find(status => status.name === gatewayName);
  };

  const handleSaveConfiguration = async (gatewayName: string) => {
    try {
      setLoading(true);
      
      // Obter gateway específico
      const gateway = gateways.find(g => g.name === gatewayName);
      if (!gateway) {
        toast.error("Gateway não encontrado");
        return;
      }

      // Preparar variáveis para salvar
      const envVars: { [key: string]: string } = {};
      
      gateway.fields.forEach((field) => {
        const value = gatewayValues[field.envVar];
        if (value && value.trim()) {
          envVars[field.envVar] = value.trim();
        }
      });

      if (Object.keys(envVars).length === 0) {
        toast.error("Preencha pelo menos um campo antes de salvar");
        return;
      }

      // Salvar no servidor
      const response = await fetch("/api/admin/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envVars }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar");
      }

      toast.success(
        `✅ ${data.message}\n\n⚠️ IMPORTANTE: Reinicie o servidor para aplicar as mudanças:\n\n` +
        `pkill -f "next dev"\ncd /home/ubuntu/clivus_landing_page/nextjs_space\nyarn dev`,
        { 
          duration: 10000,
        }
      );

      setHasChanges(false);
      
      // Recarregar status após salvar
      await fetchGatewayStatuses();

    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(error.message || "Erro ao salvar configuração");
    } finally {
      setLoading(false);
    }
  };

  const toggleShowSecret = (fieldKey: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const handleValueChange = (envVar: string, value: string) => {
    setGatewayValues((prev) => ({
      ...prev,
      [envVar]: value,
    }));
    setHasChanges(true);
  };

  const handleCopyWebhook = (url?: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("URL do webhook copiada!");
    }
  };

  if (loading && !gateways) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-soft p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-theme">
                Gateways de Pagamento
              </h1>
              <p className="text-theme-muted">
                Configure os gateways de pagamento do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Alert Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-blue-900 font-medium">
                  📝 Como Configurar os Gateways
                </p>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>1. Edite o arquivo <code className="bg-blue-100 px-1 rounded">.env</code> no servidor</p>
                  <p>2. Adicione as credenciais dos gateways que deseja usar</p>
                  <p>3. Configure os webhooks nos painéis dos gateways</p>
                  <p>4. Reinicie o servidor Next.js para aplicar as mudanças</p>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  💡 Consulte a documentação <strong>ADMIN_SETUP.md</strong> para instruções gerais e os guias específicos de cada gateway para instruções detalhadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gateways */}
        <div className="space-y-6">
          {gateways.map((gateway) => {
            const status = getGatewayStatus(gateway.name);
            const isConfigured = status?.configured || false;
            const isEnabled = status?.enabled || false;
            const error = status?.error;

            return (
              <Card key={gateway.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{gateway.icon}</span>
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          {gateway.displayName}
                          {isEnabled && isConfigured ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Configurado
                            </span>
                          ) : !isConfigured ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Não Configurado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              <AlertCircle className="w-3 h-3" />
                              Desabilitado
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>{gateway.description}</CardDescription>
                        {error && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                            ⚠️ {error}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Toggle para habilitar/desabilitar */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`gateway-${gateway.name}-toggle`} className="text-sm font-medium">
                          {isEnabled ? "Habilitado" : "Desabilitado"}
                        </Label>
                        <Switch
                          id={`gateway-${gateway.name}-toggle`}
                          checked={isEnabled}
                          onCheckedChange={() => handleToggleGateway(gateway.name, isEnabled)}
                        />
                      </div>
                      {!isEnabled && (
                        <span className="text-xs text-red-600 font-medium">
                          Gateway desabilitado no checkout
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-6">
                {/* Webhook URL */}
                {gateway.webhookUrl && (
                  <div className="p-4 bg-muted-soft rounded-lg border border-theme">
                    <Label className="text-sm font-semibold text-theme mb-2 block">
                      🔗 URL do Webhook
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={gateway.webhookUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={() => handleCopyWebhook(gateway.webhookUrl)}
                        variant="outline"
                      >
                        Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-theme-muted mt-2">
                      Configure esta URL no painel do {gateway.displayName}
                    </p>
                  </div>
                )}

                {/* Configuration Fields */}
                <div className="space-y-4">
                  {gateway.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`${gateway.name}-${field.key}`}>
                        {field.label}
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`${gateway.name}-${field.key}`}
                            type={
                              field.type === "password" && !showSecrets[`${gateway.name}-${field.key}`]
                                ? "password"
                                : "text"
                            }
                            placeholder={field.placeholder}
                            value={gatewayValues[field.envVar] || ""}
                            onChange={(e) => handleValueChange(field.envVar, e.target.value)}
                          />
                          {field.type === "password" && (
                            <button
                              type="button"
                              onClick={() =>
                                toggleShowSecret(`${gateway.name}-${field.key}`)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme"
                            >
                              {showSecrets[`${gateway.name}-${field.key}`] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-theme-muted">
                        Variável: <code className="bg-muted-soft px-1 rounded">{field.envVar}</code>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-theme">
                  <Button
                    onClick={() => handleSaveConfiguration(gateway.name)}
                    disabled={loading || saving}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4" />
                    {loading || saving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  
                  {/* Link para guia específico do gateway */}
                  {gateway.name === "asaas" && (
                    <Link href="/ASAAS_SETUP.md" target="_blank">
                      <Button variant="outline" className="gap-2">
                        📄 Guia Asaas
                      </Button>
                    </Link>
                  )}
                  {gateway.name === "efi" && (
                    <Link href="/EFI_SETUP.md" target="_blank">
                      <Button variant="outline" className="gap-2">
                        📄 Guia EFI
                      </Button>
                    </Link>
                  )}
                  {gateway.name === "cora" && (
                    <Link href="/CORA_SETUP.md" target="_blank">
                      <Button variant="outline" className="gap-2">
                        📄 Guia CORA
                      </Button>
                    </Link>
                  )}
                  {gateway.name === "pagarme" && (
                    <Link href="/PAGARME_SETUP.md" target="_blank">
                      <Button variant="outline" className="gap-2">
                        📄 Guia Pagar.me
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Documentation Links */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-2xl">📚</div>
              <div className="space-y-2">
                <p className="text-sm text-purple-900 font-medium">
                  Documentação e Guias
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/ADMIN_SETUP.md" target="_blank">
                    <Button variant="outline" size="sm">
                      📄 ADMIN_SETUP.md
                    </Button>
                  </Link>
                  <Link href="/ASAAS_SETUP.md" target="_blank">
                    <Button variant="outline" size="sm">
                      📄 Guia Asaas
                    </Button>
                  </Link>
                  <Link href="/EFI_SETUP.md" target="_blank">
                    <Button variant="outline" size="sm">
                      📄 Guia EFI
                    </Button>
                  </Link>
                  <Link href="/CORA_SETUP.md" target="_blank">
                    <Button variant="outline" size="sm">
                      📄 Guia CORA
                    </Button>
                  </Link>
                  <Link href="/PAGARME_SETUP.md" target="_blank">
                    <Button variant="outline" size="sm">
                      📄 Guia Pagar.me
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
