
import crypto from "crypto";

/**
 * EFI (Gerencianet) Payment Gateway Integration
 * API v2 Documentation: https://dev.efipay.com.br/docs
 * 
 * ✅ OAuth 2.0 com cache de token
 * ✅ Renovação automática
 * ✅ Proteção contra "Unexpected token U"
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
// TOKEN CACHE (Server Memory)
// ===========================

interface TokenCache {
  access_token: string;
  token_type: string;
  expires_at: number; // timestamp em ms
}

let cachedToken: TokenCache | null = null;

/**
 * Verifica se o token em cache ainda é válido
 */
function isTokenValid(): boolean {
  if (!cachedToken) return false;
  
  // Considera token inválido se faltam menos de 5 minutos para expirar
  const expiresIn5Min = Date.now() + (5 * 60 * 1000);
  return cachedToken.expires_at > expiresIn5Min;
}

// ===========================
// AUTHENTICATION (OAuth 2.0)
// ===========================

/**
 * Obtém um access token válido (do cache ou gerando novo)
 */
export async function getEfiAccessToken(): Promise<string> {
  // Retorna token em cache se ainda for válido
  if (isTokenValid() && cachedToken) {
    console.log("[EFI Auth] Using cached token");
    return cachedToken.access_token;
  }

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

  console.log("[EFI Auth] Requesting new access token...");

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

    // PROTEÇÃO: Verificar se resposta é JSON antes de parsear
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`EFI retornou resposta não-JSON: ${text.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || "Erro ao obter token de acesso");
    }

    // Armazenar token em cache
    // expires_in geralmente vem em segundos (ex: 3600 = 1 hora)
    const expiresIn = data.expires_in || 3600;
    cachedToken = {
      access_token: data.access_token,
      token_type: data.token_type || "Bearer",
      expires_at: Date.now() + (expiresIn * 1000),
    };

    console.log("[EFI Auth] ✅ Token obtained and cached (expires in", expiresIn, "seconds)");
    return cachedToken.access_token;
  } catch (error: any) {
    console.error("[EFI Auth Error]", error.message);
    throw new Error(`Erro ao autenticar com EFI: ${error.message}`);
  }
}

// ===========================
// API REQUEST WRAPPER (com proteção anti-erro)
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

    // PROTEÇÃO CRÍTICA: Ler como texto primeiro
    const text = await response.text();
    
    // Verificar se é JSON válido
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[EFI] ❌ Resposta não é JSON válido:", text.substring(0, 500));
      throw new Error(`Erro EFI: Resposta inválida (não-JSON): ${text.substring(0, 200)}`);
    }

    console.log("[EFI Response] Data:", JSON.stringify(data, null, 2));

    // Se não for OK, lançar erro com mensagem da API
    if (!response.ok) {
      // Se token expirou, limpar cache e tentar novamente
      if (response.status === 401 && cachedToken) {
        console.log("[EFI] Token expirado, limpando cache...");
        cachedToken = null;
        throw new Error("EFI_TOKEN_EXPIRED");
      }

      throw new Error(
        `EFI API Error: ${data.error_description || data.message || "Erro desconhecido"}`
      );
    }

    return data;
  } catch (error: any) {
    // Se foi erro de token expirado, tentar novamente (uma única vez)
    if (error.message === "EFI_TOKEN_EXPIRED") {
      throw error; // Deixa o chamador tentar novamente
    }

    console.error("[EFI Error]", error.message);
    throw new Error(`Erro ao comunicar com EFI: ${error.message}`);
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

  // Add customer data (apenas email é aceito pelo one-step link)
  // IMPORTANTE: A API da EFI NÃO aceita o campo "name" neste endpoint
  body.customer = {
    email: userEmail,
  };

  // Adicionar CPF/CNPJ se disponível (name NÃO é suportado)
  if (cleanCpfCnpj) {
    if (cleanCpfCnpj.length === 11) {
      body.customer.cpf = cleanCpfCnpj;
    } else if (cleanCpfCnpj.length === 14) {
      body.customer.cnpj = cleanCpfCnpj;
    }
  }

  // Tentar criar cobrança com retry automático em caso de token expirado
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      // Obter token (do cache ou renovando)
      const accessToken = await getEfiAccessToken();
      
      // Criar cobrança usando ONE-STEP
      const chargeResponse = await efiRequest("/charge/one-step/link", "POST", body, accessToken);
      const chargeId = chargeResponse.data.charge_id;
      const paymentUrl = chargeResponse.data.payment_url;

      console.log("[EFI] ✅ One-step charge created:", chargeId);
      console.log("[EFI] Payment URL:", paymentUrl);

      // One-step retorna um link de pagamento universal
      // O cliente escolhe o método (PIX, Boleto, Cartão) na página da EFI
      return {
        chargeId,
        paymentUrl, // Link universal para todos os métodos
        paymentMethod: "link", // Indica que é um link de pagamento
      };
    } catch (error: any) {
      attempts++;
      
      // Se foi erro de token expirado e ainda há tentativas, tentar novamente
      if (error.message === "EFI_TOKEN_EXPIRED" && attempts < maxAttempts) {
        console.log("[EFI] Token expirado, tentando novamente com novo token...");
        continue;
      }
      
      // Qualquer outro erro ou se já tentou 2 vezes, lançar erro
      throw error;
    }
  }

  throw new Error("Erro ao criar cobrança EFI após múltiplas tentativas");
}

// ===========================
// CHARGE STATUS
// ===========================

export async function getEfiChargeStatus(chargeId: string): Promise<any> {
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      const accessToken = await getEfiAccessToken();
      return await efiRequest(`/charge/${chargeId}`, "GET", undefined, accessToken);
    } catch (error: any) {
      attempts++;
      
      if (error.message === "EFI_TOKEN_EXPIRED" && attempts < maxAttempts) {
        console.log("[EFI] Token expirado ao buscar status, tentando novamente...");
        continue;
      }
      
      throw error;
    }
  }

  throw new Error("Erro ao buscar status da cobrança EFI após múltiplas tentativas");
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
