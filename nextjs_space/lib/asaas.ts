
/**
 * Asaas Payment Gateway Integration
 * Documentação: https://docs.asaas.com/
 */

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || "production";
const ASAAS_BASE_URL =
  ASAAS_ENVIRONMENT === "sandbox"
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/v3";

/**
 * Valida CPF com dígitos verificadores
 */
function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false; // Todos dígitos iguais
  
  // Validar dígito verificador 1
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  if (digit1 !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validar dígito verificador 2
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  if (digit2 !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ com dígitos verificadores
 */
function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "");
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false; // Todos dígitos iguais
  
  // Validar dígito verificador 1
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Validar dígito verificador 2
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
}

/**
 * Valida se CPF/CNPJ é válido (verifica dígitos verificadores)
 */
export function validateCpfCnpj(value: string): { valid: boolean; cleaned: string } {
  const cleaned = value.replace(/\D/g, "");
  
  if (cleaned.length === 11) {
    return { valid: isValidCPF(cleaned), cleaned };
  } else if (cleaned.length === 14) {
    return { valid: isValidCNPJ(cleaned), cleaned };
  }
  
  return { valid: false, cleaned };
}

interface AsaasCustomer {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

interface AsaasPayment {
  customer: string;
  billingType: "CREDIT_CARD" | "BOLETO" | "PIX";
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

interface AsaasPaymentLink {
  name: string;
  description?: string;
  billingType: "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX";
  chargeType: "DETACHED";
  value?: number;
  externalReference?: string;
}

/**
 * Realiza requisições HTTP para a API do Asaas
 */
async function asaasRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY não está configurada");
  }

  const url = `${ASAAS_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    access_token: ASAAS_API_KEY,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  console.log(`[Asaas Request] ${method} ${url}`);
  console.log(`[Asaas Request] Headers:`, headers);
  if (body) {
    console.log(`[Asaas Request] Body:`, JSON.stringify(body, null, 2));
  }
  
  const response = await fetch(url, options);
  const data = await response.json();

  console.log(`[Asaas Response] Status: ${response.status}`);
  console.log(`[Asaas Response] Data:`, JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error("❌ Erro na API Asaas:", data);
    const errorMessage = data.errors?.[0]?.description || data.errors?.[0]?.message || data.message || "Erro ao processar pagamento";
    console.error("❌ Mensagem de erro:", errorMessage);
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Cria ou busca um cliente no Asaas
 */
export async function createOrGetAsaasCustomer(
  customer: AsaasCustomer
): Promise<string> {
  try {
    // Verifica se cliente já existe pelo email
    const searchResponse = await asaasRequest(
      `/customers?email=${encodeURIComponent(customer.email)}`
    );

    if (searchResponse.data && searchResponse.data.length > 0) {
      return searchResponse.data[0].id;
    }

    // Cria novo cliente
    const createResponse = await asaasRequest("/customers", "POST", customer);
    return createResponse.id;
  } catch (error) {
    console.error("Erro ao criar cliente Asaas:", error);
    throw error;
  }
}

/**
 * Cria um link de pagamento no Asaas (checkout)
 */
export async function createAsaasPaymentLink(
  paymentLinkData: AsaasPaymentLink
): Promise<{ id: string; url: string }> {
  try {
    const response = await asaasRequest(
      "/paymentLinks",
      "POST",
      paymentLinkData
    );

    return {
      id: response.id,
      url: response.url,
    };
  } catch (error) {
    console.error("Erro ao criar link de pagamento Asaas:", error);
    throw error;
  }
}

/**
 * Cria uma cobrança direta no Asaas
 */
export async function createAsaasPayment(
  paymentData: AsaasPayment
): Promise<any> {
  try {
    const response = await asaasRequest("/payments", "POST", paymentData);
    return response;
  } catch (error) {
    console.error("Erro ao criar cobrança Asaas:", error);
    throw error;
  }
}

/**
 * Busca informações de um pagamento
 */
export async function getAsaasPayment(paymentId: string): Promise<any> {
  try {
    const response = await asaasRequest(`/payments/${paymentId}`);
    return response;
  } catch (error) {
    console.error("Erro ao buscar pagamento Asaas:", error);
    throw error;
  }
}

/**
 * Gera um PIX para pagamento
 */
export async function getAsaasPixQrCode(paymentId: string): Promise<any> {
  try {
    const response = await asaasRequest(`/payments/${paymentId}/pixQrCode`);
    return response;
  } catch (error) {
    console.error("Erro ao gerar PIX Asaas:", error);
    throw error;
  }
}

/**
 * Verifica o status de um pagamento
 */
export async function checkAsaasPaymentStatus(
  paymentId: string
): Promise<string> {
  try {
    const payment = await getAsaasPayment(paymentId);
    return payment.status; // PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, etc.
  } catch (error) {
    console.error("Erro ao verificar status Asaas:", error);
    throw error;
  }
}

/**
 * Mapeia status do Asaas para status interno
 */
export function mapAsaasStatus(asaasStatus: string): string {
  const statusMap: { [key: string]: string } = {
    PENDING: "pending",
    RECEIVED: "completed",
    CONFIRMED: "completed",
    OVERDUE: "failed",
    REFUNDED: "refunded",
    RECEIVED_IN_CASH: "completed",
    REFUND_REQUESTED: "refunded",
    CHARGEBACK_REQUESTED: "failed",
    CHARGEBACK_DISPUTE: "failed",
    AWAITING_CHARGEBACK_REVERSAL: "pending",
    DUNNING_REQUESTED: "failed",
    DUNNING_RECEIVED: "completed",
    AWAITING_RISK_ANALYSIS: "pending",
  };

  return statusMap[asaasStatus] || "pending";
}

/**
 * Valida webhook do Asaas
 */
export function validateAsaasWebhook(
  signature: string,
  payload: string
): boolean {
  // Asaas não usa assinatura por padrão, mas você pode implementar
  // validação adicional se configurar um token secreto
  const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("ASAAS_WEBHOOK_SECRET não configurado");
    return true; // Permite webhook sem validação (não recomendado em produção)
  }

  // Implementar validação customizada se necessário
  return true;
}
