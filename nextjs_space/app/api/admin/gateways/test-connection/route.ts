import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Testa a conexão real com um gateway de pagamento
 * POST /api/admin/gateways/test-connection
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gatewayName, environment } = body;

    if (!gatewayName || !environment) {
      return NextResponse.json(
        { error: "Gateway e environment são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar gateway no banco
    const gateway = await prisma.gateway.findUnique({
      where: { name: gatewayName },
    });

    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway não encontrado" },
        { status: 404 }
      );
    }

    // Obter configurações do ambiente selecionado
    const config = environment === "sandbox" 
      ? gateway.sandboxConfig 
      : gateway.productionConfig;
    
    const webhookSecret = environment === "sandbox"
      ? gateway.sandboxWebhook
      : gateway.productionWebhook;

    if (!config || (typeof config === 'object' && Object.keys(config).length === 0)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Credenciais de ${environment} não configuradas` 
        },
        { status: 400 }
      );
    }

    // Testar conexão baseado no gateway
    let testResult;

    switch (gatewayName) {
      case "efi":
        testResult = await testEfiConnection(config, environment);
        break;
      case "asaas":
        testResult = await testAsaasConnection(config, environment);
        break;
      case "stripe":
        testResult = await testStripeConnection(config);
        break;
      case "cora":
        testResult = await testCoraConnection(config, environment);
        break;
      case "pagarme":
        testResult = await testPagarmeConnection(config, environment);
        break;
      default:
        return NextResponse.json(
          { error: "Gateway não suportado para teste" },
          { status: 400 }
        );
    }

    // Atualizar status no banco
    await prisma.gateway.update({
      where: { name: gatewayName },
      data: {
        lastConnectionTest: new Date(),
        connectionStatus: testResult.success ? "success" : "failed",
        connectionError: testResult.error || null,
      },
    });

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error("[Test Connection Error]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ===========================
// FUNÇÕES DE TESTE POR GATEWAY
// ===========================

/**
 * Testa conexão com EFI (Gerencianet)
 */
async function testEfiConnection(
  config: any,
  environment: string
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const { clientId, clientSecret } = config;

    if (!clientId || !clientSecret) {
      return { 
        success: false, 
        error: "Client ID ou Client Secret não configurados" 
      };
    }

    // URL da API EFI
    const baseUrl = environment === "production"
      ? "https://cobrancas.api.efipay.com.br/v1"
      : "https://cobrancas-h.api.efipay.com.br/v1";

    // Testar autenticação OAuth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const response = await fetch(`${baseUrl}/authorize`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = `Status ${response.status}`;
      
      try {
        const data = JSON.parse(text);
        errorMsg = data.error_description || data.error || errorMsg;
      } catch {
        errorMsg = text.substring(0, 200) || errorMsg;
      }

      return {
        success: false,
        error: `Autenticação EFI falhou: ${errorMsg}`,
      };
    }

    const data = await response.json();

    if (!data.access_token) {
      return {
        success: false,
        error: "Token de acesso não retornado pela EFI",
      };
    }

    return {
      success: true,
      details: {
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        environment,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Erro ao testar conexão: ${error.message}`,
    };
  }
}

/**
 * Testa conexão com Asaas
 */
async function testAsaasConnection(
  config: any,
  environment: string
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const { apiKey } = config;

    if (!apiKey) {
      return { success: false, error: "API Key não configurada" };
    }

    const baseUrl = environment === "production"
      ? "https://www.asaas.com/api/v3"
      : "https://sandbox.asaas.com/api/v3";

    // Testar listando a conta (endpoint simples)
    const response = await fetch(`${baseUrl}/myAccount`, {
      headers: {
        "access_token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        error: `Autenticação Asaas falhou (${response.status}): ${text.substring(0, 100)}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      details: {
        accountName: data.name,
        email: data.email,
        environment,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Erro ao testar conexão: ${error.message}`,
    };
  }
}

/**
 * Testa conexão com Stripe
 */
async function testStripeConnection(
  config: any
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const { secretKey } = config;

    if (!secretKey) {
      return { success: false, error: "Secret Key não configurada" };
    }

    // Testar listando produtos (endpoint simples)
    const response = await fetch("https://api.stripe.com/v1/products?limit=1", {
      headers: {
        "Authorization": `Bearer ${secretKey}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: `Autenticação Stripe falhou: ${data.error?.message || response.statusText}`,
      };
    }

    return {
      success: true,
      details: {
        message: "Conexão bem-sucedida",
        environment: secretKey.startsWith("sk_live_") ? "production" : "test",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Erro ao testar conexão: ${error.message}`,
    };
  }
}

/**
 * Testa conexão com CORA
 */
async function testCoraConnection(
  config: any,
  environment: string
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const { clientId } = config;

    if (!clientId) {
      return { success: false, error: "Client ID não configurado" };
    }

    // CORA usa mTLS, então o teste é limitado
    // Verificamos apenas se os certificados existem
    const fs = require("fs");
    const path = require("path");
    
    const certPath = path.join(process.cwd(), "certs", "cora-certificate.pem");
    const keyPath = path.join(process.cwd(), "certs", "cora-private-key.key");

    if (!fs.existsSync(certPath)) {
      return {
        success: false,
        error: "Certificado CORA não encontrado (certs/cora-certificate.pem)",
      };
    }

    if (!fs.existsSync(keyPath)) {
      return {
        success: false,
        error: "Chave privada CORA não encontrada (certs/cora-private-key.key)",
      };
    }

    return {
      success: true,
      details: {
        message: "Certificados CORA encontrados",
        clientId,
        environment,
        note: "Teste completo de mTLS requer transação real",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Erro ao testar conexão: ${error.message}`,
    };
  }
}

/**
 * Testa conexão com Pagar.me
 */
async function testPagarmeConnection(
  config: any,
  environment: string
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const { apiKey } = config;

    if (!apiKey) {
      return { success: false, error: "API Key não configurada" };
    }

    // Testar autenticação básica
    const credentials = Buffer.from(`${apiKey}:`).toString("base64");
    
    const response = await fetch("https://api.pagar.me/core/v5/balance", {
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        error: `Autenticação Pagar.me falhou (${response.status}): ${text.substring(0, 100)}`,
      };
    }

    return {
      success: true,
      details: {
        message: "Conexão bem-sucedida",
        environment,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Erro ao testar conexão: ${error.message}`,
    };
  }
}
