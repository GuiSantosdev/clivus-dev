
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
  isConfigured: boolean;
  webhookUrl?: string;
}

export default function GatewaysManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [gatewayValues, setGatewayValues] = useState<Record<string, string>>({});
  const [gatewayStatuses, setGatewayStatuses] = useState<Record<string, boolean>>({
    asaas: true,
    stripe: true,
    cora: true,
    pagarme: false,
    efi: false,
  });

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
      isConfigured: false,
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
      isConfigured: false,
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
      isConfigured: false,
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
      isConfigured: false,
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
      isConfigured: false,
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

  // Re-verificar configuração quando gatewayStatuses mudar
  useEffect(() => {
    checkGatewaysConfiguration();
  }, [gatewayStatuses]);

  const fetchGatewayStatuses = async () => {
    try {
      const response = await fetch("/api/admin/gateways");
      if (response.ok) {
        const data = await response.json();
        const statuses: Record<string, boolean> = {};
        data.gateways.forEach((gw: any) => {
          statuses[gw.name] = gw.isEnabled;
        });
        setGatewayStatuses(statuses);
      }
    } catch (error) {
      console.error("Erro ao buscar status dos gateways:", error);
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
        setGatewayStatuses((prev) => ({
          ...prev,
          [gatewayName]: !currentStatus,
        }));
        toast.success(
          `Gateway ${gatewayName} ${!currentStatus ? "habilitado" : "desabilitado"} com sucesso!`
        );
      } else {
        toast.error("Erro ao atualizar status do gateway");
      }
    } catch (error) {
      console.error("Erro ao atualizar gateway:", error);
      toast.error("Erro ao atualizar status do gateway");
    }
  };

  const checkGatewaysConfiguration = async () => {
    try {
      // Buscar configurações do servidor
      const response = await fetch("/api/admin/gateways/check-config");
      if (!response.ok) {
        console.error("Erro ao verificar configurações");
        return;
      }

      const serverConfigs = await response.json();
      console.log("📋 [Gateway Config] Configs do servidor:", serverConfigs);

      // Atualizar status de configuração dos gateways
      gateways.forEach((gateway) => {
        // Gateway está configurado se:
        // 1. Tem credenciais no servidor (serverConfigs[gateway.name])
        // 2. E está habilitado no banco (gatewayStatuses[gateway.name])
        const hasCredentials = serverConfigs[gateway.name] === true;
        const isEnabled = gatewayStatuses[gateway.name] === true;
        
        gateway.isConfigured = hasCredentials && isEnabled;
        
        console.log(`✅ Gateway ${gateway.name}:`, {
          hasCredentials,
          isEnabled,
          isConfigured: gateway.isConfigured
        });
      });
    } catch (error) {
      console.error("❌ Erro ao verificar configurações:", error);
    }
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
      
      // Recarregar após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

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
    <div className="min-h-screen bg-gray-50 p-8">
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
              <h1 className="text-3xl font-bold text-gray-900">
                Gateways de Pagamento
              </h1>
              <p className="text-gray-600">
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
                  💡 Consulte a documentação <strong>ADMIN_SETUP.md</strong> e <strong>ASAAS_SETUP.md</strong> para instruções detalhadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gateways */}
        <div className="space-y-6">
          {gateways.map((gateway) => (
            <Card key={gateway.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{gateway.icon}</span>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {gateway.displayName}
                        {gateway.isConfigured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Configurado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            Não Configurado
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{gateway.description}</CardDescription>
                    </div>
                  </div>
                  
                  {/* Toggle para habilitar/desabilitar */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`gateway-${gateway.name}-toggle`} className="text-sm font-medium">
                        {gatewayStatuses[gateway.name] ? "Habilitado" : "Desabilitado"}
                      </Label>
                      <Switch
                        id={`gateway-${gateway.name}-toggle`}
                        checked={gatewayStatuses[gateway.name] !== false}
                        onCheckedChange={() => 
                          handleToggleGateway(gateway.name, gatewayStatuses[gateway.name] !== false)
                        }
                      />
                    </div>
                    {!gatewayStatuses[gateway.name] && (
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
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
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
                    <p className="text-xs text-gray-600 mt-2">
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
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                      <p className="text-xs text-gray-600">
                        Variável: <code className="bg-gray-100 px-1 rounded">{field.envVar}</code>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleSaveConfiguration(gateway.name)}
                    disabled={loading || saving}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4" />
                    {loading || saving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  
                  {gateway.name === "asaas" && (
                    <Link href="/ASAAS_SETUP.md" target="_blank">
                      <Button variant="outline" className="gap-2">
                        📄 Guia Asaas
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
                      📄 ASAAS_SETUP.md
                    </Button>
                  </Link>
                  <Link href="https://docs.asaas.com" target="_blank">
                    <Button variant="outline" size="sm">
                      🌐 Docs Asaas
                    </Button>
                  </Link>
                  <Link href="https://stripe.com/docs" target="_blank">
                    <Button variant="outline" size="sm">
                      🌐 Docs Stripe
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
