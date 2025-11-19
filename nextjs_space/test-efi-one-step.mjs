import dotenv from 'dotenv';
dotenv.config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_ENVIRONMENT = process.env.EFI_ENVIRONMENT || 'sandbox';

console.log("🧪 TESTE COM ENDPOINT ONE-STEP DA EFI");
console.log("======================================\n");

const baseUrl = EFI_ENVIRONMENT === 'production' 
  ? 'https://cobrancas.api.efipay.com.br/v1' 
  : 'https://cobrancas-h.api.efipay.com.br/v1';

console.log("Environment:", EFI_ENVIRONMENT);
console.log("Base URL:", baseUrl);

// Passo 1: Autenticar
console.log("\n🔑 PASSO 1: Autenticação");
const authString = Buffer.from(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`).toString('base64');

try {
  const authResponse = await fetch(`${baseUrl}/authorize`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ grant_type: 'client_credentials' })
  });

  const authData = await authResponse.json();
  
  if (!authResponse.ok) {
    console.log("❌ Erro na autenticação:", authData);
    process.exit(1);
  }

  const accessToken = authData.access_token;
  console.log("✅ Token obtido!");
  console.log("Expira em:", authData.expires_in, "segundos\n");

  // Passo 2: Tentar criar link de pagamento (ONE-STEP)
  console.log("💳 PASSO 2: Criar Link de Pagamento (One-Step)");
  console.log("URL:", `${baseUrl}/charge/one-step/link`);

  const linkBody = {
    items: [
      {
        name: "Plano Básico Clivus",
        amount: 1,
        value: 9700
      }
    ],
    customer: {
      email: "cliente@teste.com"
    },
    settings: {
      payment_method: "all",
      expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };

  console.log("📦 Payload:");
  console.log(JSON.stringify(linkBody, null, 2));

  const linkResponse = await fetch(`${baseUrl}/charge/one-step/link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(linkBody)
  });

  const linkResponseText = await linkResponse.text();
  console.log("\n📊 Status:", linkResponse.status);
  console.log("📋 Resposta completa:", linkResponseText);

  if (linkResponse.ok) {
    const linkData = JSON.parse(linkResponseText);
    console.log("\n✅ LINK CRIADO COM SUCESSO!");
    console.log("Payment URL:", linkData.data?.payment_url);
    console.log("Charge ID:", linkData.data?.charge_id);
  } else {
    console.log("\n❌ ERRO AO CRIAR LINK");
    try {
      const errorData = JSON.parse(linkResponseText);
      console.log("Detalhes do erro:", JSON.stringify(errorData, null, 2));
    } catch (e) {
      console.log("Resposta não é JSON válido");
    }
  }

} catch (error) {
  console.log("\n❌ Erro geral:", error.message);
  console.log(error.stack);
}
