
import crypto from "crypto";

/**
 * EFI (Gerencianet) Payment Gateway Integration
 * API v2 Documentation: https://dev.efipay.com.br/docs
 */

// ===========================
// CONFIGURATION
// ===========================

interface EfiConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
  webhookSecret?: string;
}

export function getEfiConfig(): EfiConfig {
  const clientId = process.env.EFI_CLIENT_ID || "";
  const clientSecret = process.env.EFI_CLIENT_SECRET || "";
  const environment = (process.env.EFI_ENVIRONMENT as "sandbox" | "production") || "sandbox";
  const webhookSecret = process.env.EFI_WEBHOOK_SECRET || "";

  return {
    clientId,
    clientSecret,
    environment,
    webhookSecret,
  };
}

// ===========================
// API REQUEST WRAPPER
// ===========================

async function efiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any,
  accessToken?: string
): Promise<any> {
  const config = getEfiConfig();
  const baseUrl =
    config.environment === "production"
      ? "https://cobrancas.api.efipay.com.br/v1"
      : "https://cobrancas-h.api.efipay.com.br/v1";

  const url = `${baseUrl}${endpoint}`;

  console.log(`[EFI Request] ${method} ${url}`);
  if (body) {
    console.log("[EFI Request] Body:", JSON.stringify(body, null, 2));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log("[EFI Response] Status:", response.status);

    const data = await response.json();
    console.log("[EFI Response] Data:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(
        `EFI API Error: ${data.error_description || data.message || "Erro desconhecido"}`
      );
    }

    return data;
  } catch (error: any) {
    console.error("[EFI Error]", error.message);
    throw new Error(`Erro ao comunicar com EFI: ${error.message}`);
  }
}

// ===========================
// AUTHENTICATION
// ===========================

export async function getEfiAccessToken(): Promise<string> {
  const config = getEfiConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("EFI Client ID ou Client Secret não configurados");
  }

  const baseUrl =
    config.environment === "production"
      ? "https://cobrancas.api.efipay.com.br/v1"
      : "https://cobrancas-h.api.efipay.com.br/v1";

  const url = `${baseUrl}/authorize`;

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  console.log("[EFI Auth] Requesting access token...");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || "Erro ao obter token de acesso");
    }

    console.log("[EFI Auth] Token obtained successfully");
    return data.access_token;
  } catch (error: any) {
    console.error("[EFI Auth Error]", error.message);
    throw new Error(`Erro ao autenticar com EFI: ${error.message}`);
  }
}

// ===========================
// CPF/CNPJ VALIDATION
// ===========================

function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;
  if (digit1 !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;
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
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;

  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  return digit2 === parseInt(cnpj.charAt(13));
}

export function validateCpfCnpj(value: string): { isValid: boolean; cleanValue: string } {
  if (!value) return { isValid: false, cleanValue: "" };

  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length === 11) {
    return { isValid: isValidCPF(cleanValue), cleanValue };
  } else if (cleanValue.length === 14) {
    return { isValid: isValidCNPJ(cleanValue), cleanValue };
  }

  return { isValid: false, cleanValue };
}

// ===========================
// CHARGE CREATION (PIX/BOLETO/CARD)
// ===========================

interface CreateChargeParams {
  userName: string;
  userEmail: string;
  userCpfCnpj?: string;
  planName: string;
  amount: number; // in cents
  paymentMethod: "pix" | "boleto" | "card";
  cardToken?: string; // For card payments
  installments?: number; // For card payments
}

export async function createEfiCharge(params: CreateChargeParams): Promise<any> {
  const accessToken = await getEfiAccessToken();

  const {
    userName,
    userEmail,
    userCpfCnpj,
    planName,
    amount,
    paymentMethod,
    cardToken,
    installments = 1,
  } = params;

  // Validate CPF/CNPJ if provided
  let cleanCpfCnpj = "";
  if (userCpfCnpj) {
    const validation = validateCpfCnpj(userCpfCnpj);
    if (validation.isValid) {
      cleanCpfCnpj = validation.cleanValue;
    }
  }

  console.log("[EFI] Creating charge with ONE-STEP method");
  console.log("[EFI] Payment method:", paymentMethod);

  // Usar o endpoint ONE-STEP que funciona corretamente
  const body: any = {
    items: [
      {
        name: planName,
        amount: 1,
        value: amount,
      },
    ],
    settings: {
      payment_method: "all",
      expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      request_delivery_address: false, // Campo obrigatório
    },
  };

  // Add customer data (email é obrigatório)
  body.customer = {
    email: userEmail,
  };

  // Adicionar nome e CPF/CNPJ se disponíveis
  if (userName) {
    body.customer.name = userName;
  }

  if (cleanCpfCnpj) {
    if (cleanCpfCnpj.length === 11) {
      body.customer.cpf = cleanCpfCnpj;
    } else if (cleanCpfCnpj.length === 14) {
      body.customer.cnpj = cleanCpfCnpj;
    }
  }

  // Criar cobrança usando ONE-STEP
  const chargeResponse = await efiRequest("/charge/one-step/link", "POST", body, accessToken);
  const chargeId = chargeResponse.data.charge_id;
  const paymentUrl = chargeResponse.data.payment_url;

  console.log("[EFI] One-step charge created:", chargeId);
  console.log("[EFI] Payment URL:", paymentUrl);

  // One-step retorna um link de pagamento universal
  // O cliente escolhe o método (PIX, Boleto, Cartão) na página da EFI
  return {
    chargeId,
    paymentUrl, // Link universal para todos os métodos
    paymentMethod: "link", // Indica que é um link de pagamento
  };
}

// ===========================
// CHARGE STATUS
// ===========================

export async function getEfiChargeStatus(chargeId: string): Promise<any> {
  const accessToken = await getEfiAccessToken();
  return efiRequest(`/charge/${chargeId}`, "GET", undefined, accessToken);
}

// ===========================
// STATUS MAPPING
// ===========================

export function mapEfiStatus(efiStatus: string): "pending" | "completed" | "failed" {
  const statusMap: Record<string, "pending" | "completed" | "failed"> = {
    new: "pending",
    waiting: "pending",
    paid: "completed",
    unpaid: "failed",
    refunded: "failed",
    contested: "failed",
    canceled: "failed",
  };

  return statusMap[efiStatus.toLowerCase()] || "pending";
}

// ===========================
// WEBHOOK VALIDATION
// ===========================

export function validateEfiWebhook(signature: string, body: string): boolean {
  const config = getEfiConfig();

  if (!config.webhookSecret) {
    console.warn("[EFI Webhook] Webhook secret não configurado, pulando validação");
    return true;
  }

  const hash = crypto.createHmac("sha256", config.webhookSecret).update(body).digest("hex");

  return hash === signature;
}
