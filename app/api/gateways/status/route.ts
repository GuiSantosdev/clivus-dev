import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

interface GatewayStatus {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  configured: boolean;
  lastCheckAt: string;
  error?: string;
}

/**
 * Verifica se o Asaas está configurado
 */
function getAsaasStatus(): Omit<GatewayStatus, "id" | "enabled" | "lastCheckAt"> {
  const apiKey = process.env.ASAAS_API_KEY;
  const environment = process.env.ASAAS_ENVIRONMENT;

  if (!apiKey || apiKey.trim() === "") {
    return {
      name: "asaas",
      displayName: "Asaas",
      configured: false,
      error: "Chave de API não configurada (ASAAS_API_KEY)"
    };
  }

  if (!environment || !['sandbox', 'production'].includes(environment)) {
    return {
      name: "asaas",
      displayName: "Asaas",
      configured: false,
      error: "Ambiente inválido (ASAAS_ENVIRONMENT deve ser 'sandbox' ou 'production')"
    };
  }

  return {
    name: "asaas",
    displayName: "Asaas",
    configured: true
  };
}

/**
 * Verifica se o Stripe está configurado
 */
function getStripeStatus(): Omit<GatewayStatus, "id" | "enabled" | "lastCheckAt"> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || secretKey.trim() === "") {
    return {
      name: "stripe",
      displayName: "Stripe",
      configured: false,
      error: "Chave secreta não configurada (STRIPE_SECRET_KEY)"
    };
  }

  if (!webhookSecret || webhookSecret.trim() === "") {
    return {
      name: "stripe",
      displayName: "Stripe",
      configured: false,
      error: "Webhook secret não configurado (STRIPE_WEBHOOK_SECRET)"
    };
  }

  return {
    name: "stripe",
    displayName: "Stripe",
    configured: true
  };
}

/**
 * Verifica se o EFI (Gerencianet) está configurado
 */
function getEfiStatus(): Omit<GatewayStatus, "id" | "enabled" | "lastCheckAt"> {
  const clientId = process.env.EFI_CLIENT_ID;
  const clientSecret = process.env.EFI_CLIENT_SECRET;
  const environment = process.env.EFI_ENVIRONMENT;

  if (!clientId || clientId.trim() === "") {
    return {
      name: "efi",
      displayName: "EFI (Gerencianet)",
      configured: false,
      error: "Client ID não configurado (EFI_CLIENT_ID)"
    };
  }

  if (!clientSecret || clientSecret.trim() === "") {
    return {
      name: "efi",
      displayName: "EFI (Gerencianet)",
      configured: false,
      error: "Client Secret não configurado (EFI_CLIENT_SECRET)"
    };
  }

  if (!environment || !['sandbox', 'production'].includes(environment)) {
    return {
      name: "efi",
      displayName: "EFI (Gerencianet)",
      configured: false,
      error: "Ambiente inválido (EFI_ENVIRONMENT deve ser 'sandbox' ou 'production')"
    };
  }

  return {
    name: "efi",
    displayName: "EFI (Gerencianet)",
    configured: true
  };
}

/**
 * Verifica se o CORA está configurado
 */
function getCoraStatus(): Omit<GatewayStatus, "id" | "enabled" | "lastCheckAt"> {
  const apiKey = process.env.CORA_API_KEY;
  const environment = process.env.CORA_ENVIRONMENT;

  if (!apiKey || apiKey.trim() === "") {
    return {
      name: "cora",
      displayName: "CORA",
      configured: false,
      error: "Client ID não configurado (CORA_API_KEY)"
    };
  }

  if (!environment || !['stage', 'production'].includes(environment)) {
    return {
      name: "cora",
      displayName: "CORA",
      configured: false,
      error: "Ambiente inválido (CORA_ENVIRONMENT deve ser 'stage' ou 'production')"
    };
  }

  // Verificar se os certificados existem
  const fs = require('fs');
  const path = require('path');
  const certPath = path.join(process.cwd(), 'certs', 'cora-certificate.pem');
  const keyPath = path.join(process.cwd(), 'certs', 'cora-private-key.key');

  if (!fs.existsSync(certPath)) {
    return {
      name: "cora",
      displayName: "CORA",
      configured: false,
      error: "Certificado não encontrado (certs/cora-certificate.pem)"
    };
  }

  if (!fs.existsSync(keyPath)) {
    return {
      name: "cora",
      displayName: "CORA",
      configured: false,
      error: "Chave privada não encontrada (certs/cora-private-key.key)"
    };
  }

  return {
    name: "cora",
    displayName: "CORA",
    configured: true
  };
}

/**
 * Verifica se o Pagar.me está configurado
 */
function getPagarmeStatus(): Omit<GatewayStatus, "id" | "enabled" | "lastCheckAt"> {
  const apiKey = process.env.PAGARME_API_KEY;
  const environment = process.env.PAGARME_ENVIRONMENT;

  if (!apiKey || apiKey.trim() === "") {
    return {
      name: "pagarme",
      displayName: "Pagar.me",
      configured: false,
      error: "Chave de API não configurada (PAGARME_API_KEY)"
    };
  }

  if (!environment || !['test', 'production'].includes(environment)) {
    return {
      name: "pagarme",
      displayName: "Pagar.me",
      configured: false,
      error: "Ambiente inválido (PAGARME_ENVIRONMENT deve ser 'test' ou 'production')"
    };
  }

  return {
    name: "pagarme",
    displayName: "Pagar.me",
    configured: true
  };
}

/**
 * GET /api/gateways/status
 * Retorna o status de configuração de todos os gateways de pagamento
 */
export async function GET() {
  try {
    // Verificar autenticação (opcional - pode permitir acesso público ou restrito)
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar gateways do banco de dados
    const gateways = await prisma.gateway.findMany({
      orderBy: { name: "asc" }
    });

    const now = new Date().toISOString();

    // Mapear cada gateway com seu status de configuração
    const gatewayStatuses: GatewayStatus[] = gateways.map((gateway) => {
      let statusInfo: Omit<GatewayStatus, "id" | "enabled" | "lastCheckAt">;

      switch (gateway.name) {
        case "asaas":
          statusInfo = getAsaasStatus();
          break;
        case "stripe":
          statusInfo = getStripeStatus();
          break;
        case "efi":
          statusInfo = getEfiStatus();
          break;
        case "cora":
          statusInfo = getCoraStatus();
          break;
        case "pagarme":
          statusInfo = getPagarmeStatus();
          break;
        default:
          statusInfo = {
            name: gateway.name,
            displayName: gateway.displayName,
            configured: false,
            error: "Gateway não implementado"
          };
      }

      return {
        id: gateway.id,
        ...statusInfo,
        enabled: gateway.isEnabled,
        lastCheckAt: now
      };
    });

    return NextResponse.json(gatewayStatuses);
  } catch (error) {
    console.error("[GET /api/gateways/status] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status dos gateways" },
      { status: 500 }
    );
  }
}
