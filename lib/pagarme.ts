
/**
 * Pagar.me Payment Integration Helper
 * Provides utility functions for Pagar.me API v5 integration
 * Supports: PIX, Boleto, Credit Card
 * 
 * ✅ Configuração do banco de dados (fallback para .env)
 * ✅ Ambiente dinâmico (test ou live)
 */

import crypto from "crypto";
import { prisma } from "./db";

// ===========================
// CONFIGURATION
// ===========================

interface PagarmeConfig {
  apiKey: string;
  webhookSecret?: string;
  environment: "test" | "live";
}

/**
 * Busca configurações do Pagar.me
 * Prioridade: Banco de Dados > Variáveis de Ambiente
 */
export async function getPagarmeConfig(): Promise<PagarmeConfig> {
  try {
    // Tentar buscar do banco primeiro
    const gateway = await prisma.gateway.findUnique({
      where: { name: "pagarme" },
    });

    if (gateway && gateway.isEnabled) {
      const config = gateway.environment === "sandbox" 
        ? gateway.sandboxConfig 
        : gateway.productionConfig;
      
      const webhookSecret = gateway.environment === "sandbox"
        ? gateway.sandboxWebhook
        : gateway.productionWebhook;

      if (config && typeof config === 'object' && 'apiKey' in config) {
        console.log(`[Pagar.me Config] Usando credenciais ${gateway.environment} do banco de dados`);
        return {
          apiKey: String(config.apiKey),
          webhookSecret: webhookSecret || undefined,
          environment: gateway.environment === "sandbox" ? "test" : "live",
        };
      }
    }
  } catch (error) {
    console.warn("[Pagar.me Config] Erro ao buscar do banco, usando fallback .env:", error);
  }

  // Fallback para variáveis de ambiente
  console.log("[Pagar.me Config] Usando credenciais do .env (fallback)");
  const apiKey = process.env.PAGARME_API_KEY || "";
  const webhookSecret = process.env.PAGARME_WEBHOOK_SECRET || "";
  const environment = (process.env.PAGARME_ENVIRONMENT || "test") as "test" | "live";

  return {
    apiKey,
    webhookSecret,
    environment,
  };
}

/**
 * Get Pagar.me API Base URL based on environment
 */
function getPagarmeBaseUrl() {
  // Pagar.me v5 uses the same base URL for both test and production
  // Authentication with different keys determines the environment
  return "https://api.pagar.me/core/v5";
}

/**
 * Helper function to make authenticated requests to Pagar.me API
 */
async function pagarmeRequest(
  endpoint: string,
  method: string = "GET",
  data?: any
): Promise<any> {
  const config = await getPagarmeConfig();
  const baseUrl = getPagarmeBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  // Pagar.me uses Basic Auth with API Key as username (password is empty)
  const authString = Buffer.from(`${config.apiKey}:`).toString("base64");

  console.log(`[Pagar.me] ${method} ${url}`);
  console.log(`[Pagar.me] Environment: ${config.environment}`);
  if (data) {
    console.log(`[Pagar.me] Request body:`, JSON.stringify(data, null, 2));
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();

    console.log(`[Pagar.me] Response status: ${response.status}`);
    console.log(`[Pagar.me] Response data:`, JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      const errorMessage =
        responseData?.message ||
        responseData?.errors?.[0]?.message ||
        "Erro desconhecido na API Pagar.me";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error: any) {
    console.error(`[Pagar.me] Error:`, error.message);
    throw error;
  }
}

/**
 * CPF/CNPJ Validation Functions
 */
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit1 = remainder >= 10 ? 0 : remainder;
  if (digit1 !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const digit2 = remainder >= 10 ? 0 : remainder;
  return digit2 === parseInt(cpf.charAt(10));
}

function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;

  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return digit2 === parseInt(cnpj.charAt(13));
}

export function validateCpfCnpj(value: string): { isValid: boolean; cleanValue: string } {
  const cleanValue = value.replace(/\D/g, "");
  
  if (cleanValue.length === 11) {
    return { isValid: isValidCPF(cleanValue), cleanValue };
  } else if (cleanValue.length === 14) {
    return { isValid: isValidCNPJ(cleanValue), cleanValue };
  }
  
  return { isValid: false, cleanValue };
}

/**
 * Get default address for orders
 */
export function getDefaultAddress() {
  return {
    country: "BR",
    state: "SP",
    city: "São Paulo",
    zip_code: "01310100",
    line_1: "Avenida Paulista, 1000",
    line_2: "Apto 101",
  };
}

/**
 * Create a Pagar.me Order (supports PIX, Boleto, Credit Card)
 */
export async function createPagarmeOrder(params: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerDocument?: string; // CPF or CNPJ
  amount: number; // Amount in cents (R$ 97.00 = 9700)
  planName: string;
  paymentMethod: "pix" | "boleto" | "credit_card"; // Payment method
  installments?: number; // For credit card only
  cardToken?: string; // For credit card only
}) {
  const {
    customerId,
    customerName,
    customerEmail,
    customerDocument,
    amount,
    planName,
    paymentMethod,
    installments = 1,
    cardToken,
  } = params;

  // Validate CPF/CNPJ if provided
  let validDocument: string | undefined;
  if (customerDocument) {
    const validation = validateCpfCnpj(customerDocument);
    if (validation.isValid) {
      validDocument = validation.cleanValue;
    } else {
      console.log(`[Pagar.me] Invalid CPF/CNPJ: ${customerDocument}, creating order without document`);
    }
  }

  // Build customer data
  const customerData: any = {
    name: customerName,
    email: customerEmail,
    type: validDocument
      ? validDocument.length === 11
        ? "individual"
        : "company"
      : "individual",
  };

  if (validDocument) {
    customerData.document = validDocument;
    customerData.document_type = validDocument.length === 11 ? "CPF" : "CNPJ";
  }

  // Build items array
  const items = [
    {
      amount,
      description: planName,
      quantity: 1,
      code: `plan-${customerId}`,
    },
  ];

  // Build payments array based on payment method
  const payments: any[] = [];

  if (paymentMethod === "pix") {
    payments.push({
      payment_method: "pix",
      pix: {
        expires_in: 3600, // 1 hour expiration
      },
    });
  } else if (paymentMethod === "boleto") {
    // Calculate due date (5 business days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);

    payments.push({
      payment_method: "boleto",
      boleto: {
        due_at: dueDate.toISOString(),
        instructions: `Pagamento referente ao plano ${planName}`,
      },
    });
  } else if (paymentMethod === "credit_card") {
    if (!cardToken) {
      throw new Error("Card token é obrigatório para pagamento com cartão");
    }

    payments.push({
      payment_method: "credit_card",
      credit_card: {
        installments,
        statement_descriptor: "CLIVUS",
        card_token: cardToken,
      },
    });
  }

  // Build order payload
  const orderPayload = {
    customer: customerData,
    items,
    payments,
    code: `order-${customerId}-${Date.now()}`,
  };

  const order = await pagarmeRequest("/orders", "POST", orderPayload);
  return order;
}

/**
 * Get Pagar.me Order Status
 */
export async function getPagarmeOrderStatus(orderId: string) {
  return await pagarmeRequest(`/orders/${orderId}`, "GET");
}

/**
 * Cancel Pagar.me Order
 */
export async function cancelPagarmeOrder(orderId: string) {
  return await pagarmeRequest(`/orders/${orderId}`, "DELETE");
}

/**
 * Map Pagar.me status to internal system status
 */
export function mapPagarmeStatus(pagarmeStatus: string): "pending" | "completed" | "failed" {
  const statusMap: Record<string, "pending" | "completed" | "failed"> = {
    pending: "pending",
    paid: "completed",
    canceled: "failed",
    failed: "failed",
  };

  return statusMap[pagarmeStatus.toLowerCase()] || "pending";
}

/**
 * Validate Pagar.me Webhook Signature
 */
export async function validatePagarmeWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  const config = await getPagarmeConfig();

  if (!config.webhookSecret) {
    console.warn("[Pagar.me] Webhook secret not configured, skipping validation");
    return true; // Allow webhook if secret is not configured
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", config.webhookSecret)
      .update(payload)
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("[Pagar.me] Webhook validation error:", error);
    return false;
  }
}
