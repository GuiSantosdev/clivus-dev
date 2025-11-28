import 'dotenv/config';

const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const ENVIRONMENT = process.env.EFI_ENVIRONMENT;

console.log("🔑 TESTE DE AUTENTICAÇÃO EFI\n");
console.log("Environment:", ENVIRONMENT);
console.log("Client ID:", CLIENT_ID ? `${CLIENT_ID.substring(0, 20)}...` : "AUSENTE");
console.log("Client Secret:", CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 20)}...` : "AUSENTE");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Credenciais não configuradas!");
  process.exit(1);
}

const baseUrl = ENVIRONMENT === "production"
  ? "https://cobrancas.api.efipay.com.br/v1"
  : "https://cobrancas-h.api.efipay.com.br/v1";

console.log("\nBase URL:", baseUrl);

// 1. Autenticar
console.log("\n1️⃣ Autenticando...");
const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const authRes = await fetch(`${baseUrl}/authorize`, {
  method: "POST",
  headers: {
    "Authorization": `Basic ${credentials}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ grant_type: "client_credentials" })
});

console.log("Status autenticação:", authRes.status);

if (authRes.status !== 200) {
  const errorData = await authRes.json();
  console.error("❌ Erro na autenticação:", JSON.stringify(errorData, null, 2));
  process.exit(1);
}

const authData = await authRes.json();
console.log("✅ Autenticado com sucesso!");
const accessToken = authData.access_token;

// 2. Criar cobrança ONE-STEP
console.log("\n2️⃣ Criando cobrança ONE-STEP...");

const body = {
  items: [{
    name: "Teste Plano Básico",
    amount: 1,
    value: 9700 // R$ 97,00 em centavos
  }],
  customer: {
    email: "cliente@teste.com",
    name: "Cliente Teste"
  },
  settings: {
    payment_method: "all",
    expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    request_delivery_address: false
  }
};

console.log("Payload:", JSON.stringify(body, null, 2));

const chargeRes = await fetch(`${baseUrl}/charge/one-step/link`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

console.log("\nStatus cobrança:", chargeRes.status);

const chargeData = await chargeRes.json();
console.log("Resposta:", JSON.stringify(chargeData, null, 2));

if (chargeRes.status !== 200) {
  console.error("❌ Erro ao criar cobrança!");
  process.exit(1);
}

console.log("\n✅ ✅ ✅ SUCESSO!");
console.log("Charge ID:", chargeData.data.charge_id);
console.log("Payment URL:", chargeData.data.payment_url);
