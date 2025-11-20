/**
 * CORA Payment Integration Helper (Direct Integration with mTLS)
 * API Documentation: https://developers.cora.com.br/
 * Now using certificate-based authentication (mTLS)
 */

import https from "https";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Tipo de ambiente CORA
type CoraEnvironment = "sandbox" | "production";

// Configuração do CORA
interface CoraConfig {
  clientId: string;
  environment: CoraEnvironment;
  webhookSecret?: string;
  certificatePath: string;
  privateKeyPath: string;
}

// Cliente CORA
interface CoraCustomer {
  name: string;
  document: string; // CPF ou CNPJ
  email: string;
  phone?: string;
}

// Endereço do cliente
interface CoraAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

// Boleto CORA
interface CoraBoleto {
  customer: CoraCustomer;
  address: CoraAddress;
  amount: number; // em centavos
  dueDate: string; // YYYY-MM-DD
  description: string;
  reference?: string; // ID interno
  fine?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  };
  interest?: {
    type: "DAILY_PERCENTAGE" | "DAILY_FIXED";
    value: number;
  };
  discount?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
    dueDateLimit: string; // YYYY-MM-DD
  };
  notifications?: {
    email?: boolean;
    sms?: boolean;
  };
}

// Resposta do boleto criado
interface CoraBoletoResponse {
  id: string;
  code: string; // código do boleto
  digitableLine: string; // linha digitável
  barCode: string; // código de barras
  pixQrCode?: string; // QR Code PIX (se habilitado)
  pixKey?: string; // chave PIX
  dueDate: string;
  amount: number;
  status: "CREATED" | "PAID" | "CANCELED" | "EXPIRED";
  pdfUrl: string;
  createdAt: string;
}

// Status de pagamento CORA
type CoraPaymentStatus =
  | "CREATED" // Boleto criado
  | "PAID" // Pago
  | "CANCELED" // Cancelado
  | "EXPIRED"; // Vencido

// Obter configuração do CORA
function getCoraConfig(): CoraConfig {
  const clientId = process.env.CORA_API_KEY || "";
  const environment = (process.env.CORA_ENVIRONMENT ||
    "sandbox") as CoraEnvironment;
  const webhookSecret = process.env.CORA_WEBHOOK_SECRET || "";

  // Caminhos dos certificados
  const certsPath = path.join(process.cwd(), "certs");
  const certificatePath = path.join(certsPath, "cora-certificate.pem");
  const privateKeyPath = path.join(certsPath, "cora-private-key.key");

  if (!clientId) {
    throw new Error("CORA_API_KEY (Client ID) não configurada nas variáveis de ambiente");
  }

  if (!fs.existsSync(certificatePath)) {
    throw new Error(`Certificado CORA não encontrado em: ${certificatePath}`);
  }

  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`Chave privada CORA não encontrada em: ${privateKeyPath}`);
  }

  return { clientId, environment, webhookSecret, certificatePath, privateKeyPath };
}

// Obter URL base da API
function getCoraBaseUrl(environment: CoraEnvironment): string {
  return environment === "production"
    ? "https://matls-clients.api.stage.cora.com.br" // Production URL para integração direta
    : "https://matls-clients.api.stage.cora.com.br"; // Stage URL
}

// Fazer requisição para a API do CORA com mTLS
async function coraRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const config = getCoraConfig();
  const baseUrl = getCoraBaseUrl(config.environment);
  const url = new URL(`${baseUrl}${endpoint}`);

  console.log(`[CORA] ${options.method || "GET"} ${url.toString()}`);

  // Ler certificados
  const cert = fs.readFileSync(config.certificatePath, "utf8");
  const key = fs.readFileSync(config.privateKeyPath, "utf8");

  const requestOptions: https.RequestOptions = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: options.method || "GET",
    cert: cert,
    key: key,
    headers: {
      "Content-Type": "application/json",
      "client-id": config.clientId,
      ...options.headers,
    },
  };

  // Adicionar Content-Length se houver body
  if (options.body) {
    const bodyString = JSON.stringify(options.body);
    requestOptions.headers!["Content-Length"] = Buffer.byteLength(bodyString);
    console.log("[CORA] Request Body:", bodyString);
  }

  console.log("[CORA] Request Headers:", requestOptions.headers);

  return new Promise((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`[CORA] Response Status: ${res.statusCode}`);
        console.log("[CORA] Response Body:", data);

        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          let errorMessage = `CORA API Error: ${res.statusCode}`;
          try {
            const errorData = JSON.parse(data);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = data || errorMessage;
          }

          console.error("[CORA] Error:", errorMessage);
          reject(new Error(errorMessage));
        } else {
          try {
            const parsed = JSON.parse(data) as T;
            resolve(parsed);
          } catch (e) {
            reject(new Error("Failed to parse CORA response"));
          }
        }
      });
    });

    req.on("error", (error) => {
      console.error("[CORA] Request Error:", error);
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Criar boleto registrado no CORA
 */
export async function createCoraBoleto(
  params: CoraBoleto
): Promise<CoraBoletoResponse> {
  console.log("[CORA] Criando boleto com params:", params);

  const response = await coraRequest<CoraBoletoResponse>("/invoices", {
    method: "POST",
    body: JSON.stringify({
      customer: {
        name: params.customer.name,
        document: params.customer.document.replace(/\D/g, ""), // remove formatação
        email: params.customer.email,
        phone: params.customer.phone?.replace(/\D/g, ""),
      },
      address: params.address,
      due_date: params.dueDate,
      amount: params.amount,
      description: params.description,
      reference: params.reference,
      fine: params.fine,
      interest: params.interest,
      discount: params.discount,
      notifications: params.notifications || { email: true, sms: false },
      pix_enabled: true, // Sempre habilitar PIX
    }),
  });

  console.log("[CORA] Boleto criado:", response);
  return response;
}

/**
 * Consultar status de um boleto
 */
export async function getCoraBoletoStatus(
  boletoId: string
): Promise<CoraBoletoResponse> {
  console.log(`[CORA] Consultando status do boleto: ${boletoId}`);

  const response = await coraRequest<CoraBoletoResponse>(
    `/invoices/${boletoId}`,
    {
      method: "GET",
    }
  );

  console.log("[CORA] Status do boleto:", response);
  return response;
}

/**
 * Cancelar um boleto
 */
export async function cancelCoraBoleto(
  boletoId: string
): Promise<{ success: boolean; message: string }> {
  console.log(`[CORA] Cancelando boleto: ${boletoId}`);

  try {
    await coraRequest(`/invoices/${boletoId}/cancel`, {
      method: "POST",
    });

    console.log("[CORA] Boleto cancelado com sucesso");
    return { success: true, message: "Boleto cancelado com sucesso" };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[CORA] Erro ao cancelar boleto:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

/**
 * Mapear status do CORA para status interno
 */
export function mapCoraStatus(coraStatus: CoraPaymentStatus): string {
  const statusMap: Record<CoraPaymentStatus, string> = {
    CREATED: "pending",
    PAID: "completed",
    CANCELED: "failed",
    EXPIRED: "failed",
  };

  return statusMap[coraStatus] || "pending";
}

/**
 * Validar webhook do CORA
 */
export function validateCoraWebhook(
  payload: string,
  signature: string
): boolean {
  const config = getCoraConfig();

  if (!config.webhookSecret) {
    console.warn(
      "[CORA] CORA_WEBHOOK_SECRET não configurado, pulando validação"
    );
    return true; // Sem validação se não houver secret
  }

  // CORA usa HMAC SHA256 para assinatura
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", config.webhookSecret)
    .update(payload)
    .digest("hex");

  console.log("[CORA] Assinatura esperada:", expectedSignature);
  console.log("[CORA] Assinatura recebida:", signature);

  return expectedSignature === signature;
}

/**
 * Gerar dados de endereço padrão (caso o usuário não tenha)
 */
export function getDefaultAddress(): CoraAddress {
  return {
    street: "Rua Exemplo",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    postalCode: "01001000",
  };
}

/**
 * Validar CPF/CNPJ (mesmo usado no Asaas)
 */
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length += 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

export function validateCpfCnpj(
  value: string
): { isValid: boolean; cleaned: string } {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return { isValid: isValidCPF(cleaned), cleaned };
  } else if (cleaned.length === 14) {
    return { isValid: isValidCNPJ(cleaned), cleaned };
  }

  return { isValid: false, cleaned };
}
