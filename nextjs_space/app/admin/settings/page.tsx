
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { 
  Settings, 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Globe,
  Key
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    resendApiKey: "",
    emailFrom: "",
    adminEmail: "",
    appUrl: "",
    asaasApiKey: "",
    stripeSecretKey: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "superadmin") {
        router.push("/dashboard");
      } else {
        fetchConfig();
      }
    }
  }, [status, session, router]);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: config.adminEmail,
          type: "test"
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ ${data.message}\n\nVerifique a caixa de entrada de:\n${config.adminEmail}`);
      } else {
        toast.error(`❌ Erro: ${data.error}\n\n${data.details || ""}`);
      }
    } catch (error) {
      toast.error("❌ Erro ao enviar email de teste");
      console.error(error);
    } finally {
      setTesting(false);
    }
  };

  const handleTestGeolocation = async () => {
    try {
      const response = await fetch("/api/geolocation");
      const data = await response.json();

      if (response.ok) {
        toast.success(
          `✅ Geolocalização funcionando!\n\n` +
          `Cidade: ${data.city}\n` +
          `Estado: ${data.state}\n` +
          `País: ${data.country}\n` +
          `IP: ${data.ip}\n` +
          `Fonte: ${data.source}`
        );
      } else {
        toast.error(`❌ Erro na geolocalização: ${data.error}`);
      }
    } catch (error) {
      toast.error("❌ Erro ao testar geolocalização");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações do Sistema
            </h1>
          </div>
          <p className="text-gray-600">
            Gerencie as configurações e teste as integrações do Clivus
          </p>
        </div>

        {/* Email Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Configuração de E-mail (Resend)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>RESEND_API_KEY</Label>
              <Input 
                type="password"
                value={config.resendApiKey}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.resendApiKey 
                  ? "✅ Configurada" 
                  : "❌ Não configurada - Configure no arquivo .env"}
              </p>
            </div>

            <div>
              <Label>EMAIL_FROM (Remetente)</Label>
              <Input 
                type="email"
                value={config.emailFrom}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.emailFrom 
                  ? "✅ Configurado" 
                  : "❌ Não configurado - Configure no arquivo .env"}
              </p>
            </div>

            <div>
              <Label>ADMIN_EMAIL (Destinatário notificações)</Label>
              <Input 
                type="email"
                value={config.adminEmail}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.adminEmail 
                  ? "✅ Configurado" 
                  : "❌ Não configurado - Configure no arquivo .env"}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    ⚠️ Quando os E-mails São Enviados?
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li><strong>Após pagamento aprovado</strong> (via webhook Stripe/Asaas)</li>
                    <li><strong>Reenvio manual</strong> pelo SuperAdmin (Vendas → Reenviar Credenciais)</li>
                    <li><strong>NÃO envia</strong> imediatamente após cadastro</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleTestEmail}
              disabled={testing || !config.resendApiKey}
              className="w-full"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando E-mail de Teste...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar E-mail de Teste
                </>
              )}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Como Configurar o Resend
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Acesse <a href="https://resend.com" target="_blank" className="underline">resend.com</a></li>
                <li>Crie uma conta ou faça login</li>
                <li>Vá em "API Keys" → "Create API Key"</li>
                <li>Copie a chave e adicione no arquivo <code>.env</code></li>
                <li>Reinicie o servidor Next.js</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* App URL */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              URL do Aplicativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>NEXT_PUBLIC_APP_URL</Label>
              <Input 
                type="url"
                value={config.appUrl}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.appUrl 
                  ? "✅ Configurada" 
                  : "❌ Não configurada - Configure no arquivo .env"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateways */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-600" />
              Gateways de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>ASAAS_API_KEY</Label>
              <Input 
                type="password"
                value={config.asaasApiKey}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.asaasApiKey 
                  ? "✅ Configurada" 
                  : "❌ Não configurada"}
              </p>
            </div>

            <div>
              <Label>STRIPE_SECRET_KEY</Label>
              <Input 
                type="password"
                value={config.stripeSecretKey}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.stripeSecretKey 
                  ? "✅ Configurada" 
                  : "❌ Não configurada"}
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💡 Para gerenciar gateways, acesse: <strong>Menu SuperAdmin → Gateways</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Geolocation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-600" />
              Teste de Geolocalização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Teste a API que detecta a cidade dos visitantes para as notificações de social proof.
            </p>
            <Button 
              onClick={handleTestGeolocation}
              variant="outline"
              className="w-full"
            >
              <Globe className="h-4 w-4 mr-2" />
              Testar Geolocalização
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
