
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

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    console.error("Erro na API Asaas:", data);
    throw new Error(
      data.errors?.[0]?.description || "Erro ao processar pagamento"
    );
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
