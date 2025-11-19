import dotenv from 'dotenv';
dotenv.config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_ENVIRONMENT = process.env.EFI_ENVIRONMENT || 'sandbox';

console.log("🧪 TESTE COMPLETO - CRIAÇÃO DE COBRANÇA EFI");
console.log("============================================\n");

const baseUrl = EFI_ENVIRONMENT === 'production' 
  ? 'https://cobrancas.api.efipay.com.br/v1' 
  : 'https://cobrancas-h.api.efipay.com.br/v1';

// Passo 1: Autenticar
console.log("PASSO 1: Obter token de acesso");
console.log("URL:", `${baseUrl}/authorize`);

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

  if (!authResponse.ok) {
    const errorText = await authResponse.text();
    console.log("❌ Erro na autenticação:", errorText);
    process.exit(1);
  }

  const authData = await authResponse.json();
  const accessToken = authData.access_token;
  console.log("✅ Token obtido com sucesso!\n");

  // Passo 2: Criar a cobrança (transação)
  console.log("PASSO 2: Criar transação");
  console.log("URL:", `${baseUrl}/charge`);

  const chargeBody = {
    items: [
      {
        name: "Plano Básico",
        amount: 1,
        value: 9700 // R$ 97,00 em centavos
      }
    ]
  };

  console.log("📦 Payload:");
  console.log(JSON.stringify(chargeBody, null, 2));

  const chargeResponse = await fetch(`${baseUrl}/charge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(chargeBody)
  });

  const chargeResponseText = await chargeResponse.text();
  console.log("\n📊 Status:", chargeResponse.status);
  console.log("📋 Resposta:", chargeResponseText);

  if (!chargeResponse.ok) {
    console.log("\n❌ ERRO AO CRIAR COBRANÇA");
    try {
      const errorData = JSON.parse(chargeResponseText);
      console.log("Detalhes:", JSON.stringify(errorData, null, 2));
    } catch (e) {
      // Resposta não é JSON
    }
    process.exit(1);
  }

  const chargeData = JSON.parse(chargeResponseText);
  const chargeId = chargeData.data?.charge_id;
  
  console.log("\n✅ COBRANÇA CRIADA COM SUCESSO!");
  console.log("Charge ID:", chargeId);
  console.log("Status:", chargeData.data?.status);
  console.log("\n");

  // Passo 3: Criar link de pagamento para essa cobrança
  console.log("PASSO 3: Criar link de pagamento");
  console.log("URL:", `${baseUrl}/charge/${chargeId}/link`);

  const linkBody = {
    payment_method: "all", // boleto, credit_card, pix ou all
    expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 dias a partir de hoje
  };

  console.log("📦 Payload:");
  console.log(JSON.stringify(linkBody, null, 2));

  const linkResponse = await fetch(`${baseUrl}/charge/${chargeId}/link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(linkBody)
  });

  const linkResponseText = await linkResponse.text();
  console.log("\n📊 Status:", linkResponse.status);
  console.log("📋 Resposta:", linkResponseText);

  if (!linkResponse.ok) {
    console.log("\n❌ ERRO AO CRIAR LINK");
    try {
      const errorData = JSON.parse(linkResponseText);
      console.log("Detalhes:", JSON.stringify(errorData, null, 2));
    } catch (e) {
      // Resposta não é JSON
    }
    process.exit(1);
  }

  const linkData = JSON.parse(linkResponseText);
  
  console.log("\n✅ LINK DE PAGAMENTO CRIADO!");
  console.log("URL:", linkData.data?.payment_url);
  console.log("\n====================================");
  console.log("🎉 TESTE COMPLETO BEM-SUCEDIDO!");
  console.log("====================================");

} catch (error) {
  console.log("\n❌ Erro:", error.message);
  console.log(error.stack);
}
