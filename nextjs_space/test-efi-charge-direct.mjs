import 'dotenv/config';

const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const ENVIRONMENT = process.env.EFI_ENVIRONMENT;

console.log("🔑 TESTE - SEM CAMPO NAME\n");

const baseUrl = ENVIRONMENT === "production"
  ? "https://cobrancas.api.efipay.com.br/v1"
  : "https://cobrancas-h.api.efipay.com.br/v1";

// 1. Autenticar
const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const authRes = await fetch(`${baseUrl}/authorize`, {
  method: "POST",
  headers: {
    "Authorization": `Basic ${credentials}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ grant_type: "client_credentials" })
});

const authData = await authRes.json();
const accessToken = authData.access_token;
console.log("✅ Autenticado");

// 2. Criar cobrança SEM o campo "name"
const body = {
  items: [{
    name: "Plano Básico",
    amount: 1,
    value: 9700
  }],
  customer: {
    email: "cliente@teste.com"
    // SEM O CAMPO NAME!
  },
  settings: {
    payment_method: "all",
    expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    request_delivery_address: false
  }
};

console.log("\n2️⃣ Criando cobrança (sem campo name)...");

const chargeRes = await fetch(`${baseUrl}/charge/one-step/link`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

console.log("Status:", chargeRes.status);

const chargeData = await chargeRes.json();
console.log("Resposta:", JSON.stringify(chargeData, null, 2));

if (chargeRes.status === 200) {
  console.log("\n✅ ✅ ✅ SUCESSO!");
  console.log("Charge ID:", chargeData.data.charge_id);
  console.log("Payment URL:", chargeData.data.payment_url);
} else {
  console.error("\n❌ FALHOU");
}
