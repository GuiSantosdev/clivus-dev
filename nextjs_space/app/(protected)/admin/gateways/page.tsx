"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Shield,
  AlertCircle,
  Server,
  TestTube,
  Loader2,
} from "lucide-react";

interface GatewayConfig {
  [key: string]: string;
}

interface Gateway {
  id: string;
  name: string;
  displayName: string;
  isEnabled: boolean;
  environment: string;
  sandboxConfig: GatewayConfig | null;
  productionConfig: GatewayConfig | null;
  sandboxWebhook: string | null;
  productionWebhook: string | null;
  connectionStatus: string;
  connectionError: string | null;
  lastConnectionTest: string | null;
}

// Definição dos campos necessários por gateway
const GATEWAY_FIELDS: Record<string, { field: string; label: string; type?: string }[]> = {
  efi: [
    { field: "clientId", label: "Client ID" },
    { field: "clientSecret", label: "Client Secret", type: "password" },
  ],
  asaas: [
    { field: "apiKey", label: "API Key", type: "password" },
  ],
  stripe: [
    { field: "secretKey", label: "Secret Key", type: "password" },
  ],
  cora: [
    { field: "clientId", label: "Client ID" },
  ],
  pagarme: [
    { field: "apiKey", label: "API Key", type: "password" },
  ],
};

export default function AdminGatewaysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGateway, setEditingGateway] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Form states
  const [selectedEnvironment, setSelectedEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [sandboxConfig, setSandboxConfig] = useState<GatewayConfig>({});
  const [productionConfig, setProductionConfig] = useState<GatewayConfig>({});
  const [sandboxWebhook, setSandboxWebhook] = useState("");
  const [productionWebhook, setProductionWebhook] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "superadmin") {
        router.push("/dashboard");
      } else {
        loadGateways();
      }
    }
  }, [status, session, router]);

  const loadGateways = async () => {
    try {
      const response = await fetch("/api/admin/gateways");
      if (!response.ok) throw new Error("Erro ao carregar gateways");
      
      const data = await response.json();
      setGateways(data);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (gatewayName: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/gateways/${gatewayName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentStatus }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      toast.success(`Gateway ${!currentStatus ? "ativado" : "desativado"} com sucesso`);
      loadGateways();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleEditGateway = (gateway: Gateway) => {
    setEditingGateway(gateway.name);
    setSelectedEnvironment(gateway.environment as "sandbox" | "production");
    setSandboxConfig((gateway.sandboxConfig as GatewayConfig) || {});
    setProductionConfig((gateway.productionConfig as GatewayConfig) || {});
    setSandboxWebhook(gateway.sandboxWebhook || "");
    setProductionWebhook(gateway.productionWebhook || "");
  };

  const handleSaveGateway = async () => {
    if (!editingGateway) return;

    try {
      const payload = {
        environment: selectedEnvironment,
        sandboxConfig,
        productionConfig,
        sandboxWebhook,
        productionWebhook,
      };

      const response = await fetch(`/api/admin/gateways/${editingGateway}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar configurações");
      }

      toast.success("Configurações salvas com sucesso!");
      setEditingGateway(null);
      loadGateways();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleTestConnection = async (gatewayName: string, environment: string) => {
    setTestingConnection(gatewayName);
    
    try {
      const response = await fetch("/api/admin/gateways/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayName, environment }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Conexão ${environment} testada com sucesso!`);
      } else {
        toast.error(`Falha no teste: ${result.error}`);
      }

      loadGateways();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setTestingConnection(null);
    }
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-theme-muted" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const editingGatewayData = gateways.find((g) => g.name === editingGateway);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-theme flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configuração de Gateways
          </h1>
          <p className="text-theme-muted mt-2">
            Configure as credenciais de sandbox e produção para cada gateway de pagamento
          </p>
        </div>
        <Button onClick={loadGateways} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Alert de informação */}
      <Card className="mb-6 bg-primary/5 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-theme mb-2">
                ℹ️ Como usar esta tela
              </h3>
              <ul className="text-sm text-theme-muted space-y-1">
                <li>• Configure credenciais separadamente para <strong>Sandbox</strong> (testes) e <strong>Produção</strong></li>
                <li>• Use o botão <strong>Testar Conexão</strong> para validar as credenciais antes de ativar</li>
                <li>• Ative apenas os gateways que deseja disponibilizar no checkout</li>
                <li>• O ambiente selecionado (Sandbox/Produção) será usado automaticamente no checkout</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Gateways */}
      <div className="grid grid-cols-1 gap-6">
        {gateways.map((gateway) => {
          const fields = GATEWAY_FIELDS[gateway.name] || [];
          const isEditing = editingGateway === gateway.name;

          return (
            <Card key={gateway.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-theme">{gateway.displayName}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getConnectionStatusIcon(gateway.connectionStatus)}
                      {gateway.connectionStatus === "success" && (
                        <span className="text-xs text-green-600">Configurado</span>
                      )}
                      {gateway.connectionStatus === "failed" && (
                        <span className="text-xs text-red-600">Erro</span>
                      )}
                      {gateway.connectionStatus === "untested" && (
                        <span className="text-xs text-theme-muted">Não testado</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={gateway.isEnabled}
                      onCheckedChange={() => handleToggleEnabled(gateway.name, gateway.isEnabled)}
                    />
                    <span className="text-sm text-theme-muted">
                      {gateway.isEnabled ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                {gateway.connectionError && (
                  <CardDescription className="text-red-600 mt-2">
                    ⚠️ {gateway.connectionError}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-theme-muted">Ambiente Ativo:</Label>
                        <p className="text-theme font-medium capitalize">{gateway.environment}</p>
                      </div>
                      <div>
                        <Label className="text-theme-muted">Último Teste:</Label>
                        <p className="text-theme">
                          {gateway.lastConnectionTest
                            ? new Date(gateway.lastConnectionTest).toLocaleString("pt-BR")
                            : "Nunca"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleEditGateway(gateway)} variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      
                      {gateway.sandboxConfig && Object.keys(gateway.sandboxConfig).length > 0 && (
                        <Button
                          onClick={() => handleTestConnection(gateway.name, "sandbox")}
                          variant="outline"
                          disabled={testingConnection === gateway.name}
                        >
                          {testingConnection === gateway.name ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                          )}
                          Testar Sandbox
                        </Button>
                      )}

                      {gateway.productionConfig && Object.keys(gateway.productionConfig).length > 0 && (
                        <Button
                          onClick={() => handleTestConnection(gateway.name, "production")}
                          variant="outline"
                          disabled={testingConnection === gateway.name}
                        >
                          {testingConnection === gateway.name ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Server className="h-4 w-4 mr-2" />
                          )}
                          Testar Produção
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Seletor de Ambiente */}
                    <div className="space-y-2">
                      <Label>Ambiente Ativo no Checkout</Label>
                      <Select
                        value={selectedEnvironment}
                        onValueChange={(value: "sandbox" | "production") => setSelectedEnvironment(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                          <SelectItem value="production">Produção (Real)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-theme-muted">
                        Este ambiente será usado automaticamente no checkout
                      </p>
                    </div>

                    {/* Credenciais Sandbox */}
                    <Card className="bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-sm text-theme">Credenciais Sandbox (Testes)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {fields.map(({ field, label, type }) => (
                          <div key={`sandbox-${field}`} className="space-y-2">
                            <Label>{label}</Label>
                            <Input
                              type={type || "text"}
                              value={sandboxConfig[field] || ""}
                              onChange={(e) =>
                                setSandboxConfig({ ...sandboxConfig, [field]: e.target.value })
                              }
                              placeholder={`Digite ${label.toLowerCase()}`}
                            />
                          </div>
                        ))}
                        <div className="space-y-2">
                          <Label>Webhook Secret (Opcional)</Label>
                          <Input
                            type="password"
                            value={sandboxWebhook}
                            onChange={(e) => setSandboxWebhook(e.target.value)}
                            placeholder="Secret para validar webhooks"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Credenciais Produção */}
                    <Card className="bg-accent/5">
                      <CardHeader>
                        <CardTitle className="text-sm text-theme">Credenciais Produção (Real)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {fields.map(({ field, label, type }) => (
                          <div key={`production-${field}`} className="space-y-2">
                            <Label>{label}</Label>
                            <Input
                              type={type || "text"}
                              value={productionConfig[field] || ""}
                              onChange={(e) =>
                                setProductionConfig({ ...productionConfig, [field]: e.target.value })
                              }
                              placeholder={`Digite ${label.toLowerCase()}`}
                            />
                          </div>
                        ))}
                        <div className="space-y-2">
                          <Label>Webhook Secret (Opcional)</Label>
                          <Input
                            type="password"
                            value={productionWebhook}
                            onChange={(e) => setProductionWebhook(e.target.value)}
                            placeholder="Secret para validar webhooks"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex gap-2">
                      <Button onClick={handleSaveGateway} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Salvar Configurações
                      </Button>
                      <Button
                        onClick={() => setEditingGateway(null)}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
