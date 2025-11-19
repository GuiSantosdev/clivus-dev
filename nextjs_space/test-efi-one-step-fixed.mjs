import dotenv from 'dotenv';
dotenv.config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const baseUrl = 'https://cobrancas.api.efipay.com.br/v1'; // PRODUÇÃO

console.log("🧪 TESTE EFI - ONE-STEP (PRODUÇÃO - CORRIGIDO)");
console.log("===============================================\n");

// Autenticar
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
  console.log("✅ Token obtido!\n");

  // Criar Link com todos os campos obrigatórios
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
      expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      request_delivery_address: false  // CAMPO OBRIGATÓRIO
    }
  };

  console.log("📦 Criando link de pagamento...");

  const linkResponse = await fetch(`${baseUrl}/charge/one-step/link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(linkBody)
  });

  const linkResponseText = await linkResponse.text();
  console.log("📊 Status:", linkResponse.status);

  if (linkResponse.ok) {
    const linkData = JSON.parse(linkResponseText);
    console.log("\n✅ ✅ ✅ SUCESSO! LINK CRIADO! ✅ ✅ ✅\n");
    console.log("🔗 URL de Pagamento:", linkData.data?.payment_url || linkData.data?.link);
    console.log("🆔 Charge ID:", linkData.data?.charge_id);
    console.log("\n📋 Resposta completa:");
    console.log(JSON.stringify(linkData, null, 2));
  } else {
    console.log("\n❌ ERRO:");
    try {
      const errorData = JSON.parse(linkResponseText);
      console.log(JSON.stringify(errorData, null, 2));
    } catch (e) {
      console.log(linkResponseText);
    }
  }

} catch (error) {
  console.log("\n❌ Erro geral:", error.message);
}
