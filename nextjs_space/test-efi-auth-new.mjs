import dotenv from 'dotenv';
dotenv.config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_ENVIRONMENT = process.env.EFI_ENVIRONMENT || 'sandbox';

console.log("🔍 Testando autenticação EFI com as novas URLs...\n");
console.log("Environment:", EFI_ENVIRONMENT);
console.log("Client ID:", EFI_CLIENT_ID ? `${EFI_CLIENT_ID.substring(0, 20)}...` : "❌ NÃO CONFIGURADO");

if (!EFI_CLIENT_ID || !EFI_CLIENT_SECRET) {
  console.log("\n❌ Credenciais EFI não configuradas!");
  process.exit(1);
}

const baseUrl = EFI_ENVIRONMENT === 'production' 
  ? 'https://cobrancas.api.efipay.com.br/v1' 
  : 'https://cobrancas-h.api.efipay.com.br/v1';

const authUrl = `${baseUrl}/authorize`;
const authString = Buffer.from(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`).toString('base64');

console.log("\n🔑 Tentando obter token de acesso...");
console.log("URL:", authUrl);

try {
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ grant_type: 'client_credentials' })
  });

  const responseText = await response.text();
  console.log("\n📊 Status:", response.status);
  
  if (response.ok) {
    const data = JSON.parse(responseText);
    console.log("✅ Autenticação bem-sucedida!");
    console.log("Access Token:", data.access_token ? `${data.access_token.substring(0, 30)}...` : "N/A");
    console.log("Expira em:", data.expires_in, "segundos");
    
    // Agora vamos testar criar uma cobrança
    console.log("\n💳 Testando criação de cobrança...");
    
    const chargeBody = {
      items: [
        {
          name: "Plano Básico",
          amount: 1,
          value: 9700 // R$ 97,00 em centavos
        }
      ]
    };
    
    console.log("📦 Payload da cobrança:");
    console.log(JSON.stringify(chargeBody, null, 2));
    
    const chargeResponse = await fetch(`${baseUrl}/charge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chargeBody)
    });
    
    const chargeResponseText = await chargeResponse.text();
    console.log("\n📊 Status da criação:", chargeResponse.status);
    console.log("📋 Resposta:", chargeResponseText);
    
    if (chargeResponse.ok) {
      const chargeData = JSON.parse(chargeResponseText);
      console.log("\n✅ COBRANÇA CRIADA COM SUCESSO!");
      console.log("Charge ID:", chargeData.data?.charge_id);
      console.log("Status:", chargeData.data?.status);
    } else {
      console.log("\n❌ Erro ao criar cobrança");
      try {
        const errorData = JSON.parse(chargeResponseText);
        console.log("Detalhes:", JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log("Resposta não é JSON válido");
      }
    }
  } else {
    console.log("\n❌ Erro na autenticação!");
    try {
      const errorData = JSON.parse(responseText);
      console.log("Detalhes do erro:", JSON.stringify(errorData, null, 2));
    } catch (e) {
      console.log("Resposta de erro (não é JSON):", responseText);
    }
  }
} catch (error) {
  console.log("\n❌ Erro ao conectar com a API:");
  console.log(error.message);
}
