import dotenv from 'dotenv';
dotenv.config();

console.log("🧪 TESTE DO CHECKOUT EFI (Simulando usuário real)");
console.log("=" .repeat(60));

// Simular dados de um usuário tentando comprar
const checkoutData = {
  planId: "clsmfbk9i0000v6oc8xkm4u8n", // ID de um plano real
  gateway: "efi",
  paymentMethod: "pix"
};

console.log("\n📋 Dados do checkout:");
console.log(JSON.stringify(checkoutData, null, 2));

console.log("\n🔑 Verificando credenciais no .env:");
console.log("EFI_CLIENT_ID presente?", !!process.env.EFI_CLIENT_ID);
console.log("EFI_CLIENT_SECRET presente?", !!process.env.EFI_CLIENT_SECRET);
console.log("EFI_ENVIRONMENT:", process.env.EFI_ENVIRONMENT);

const baseUrl = process.env.EFI_ENVIRONMENT === 'production'
  ? 'https://cobrancas.api.efipay.com.br/v1'
  : 'https://cobrancas-h.api.efipay.com.br/v1';

console.log("Base URL:", baseUrl);

// Autenticar
console.log("\n🔐 Passo 1: Autenticando...");
const authString = Buffer.from(
  `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
).toString('base64');

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
    console.error("❌ Erro na autenticação!");
    const errorData = await authResponse.json();
    console.error(JSON.stringify(errorData, null, 2));
    process.exit(1);
  }

  const authData = await authResponse.json();
  const accessToken = authData.access_token;
  console.log("✅ Autenticação bem-sucedida!");

  // Criar cobrança (simulando o que o checkout faz)
  console.log("\n💳 Passo 2: Criando cobrança...");
  
  const chargeBody = {
    items: [
      {
        name: "Plano Básico Clivus",
        amount: 1,
        value: 9700
      }
    ],
    metadata: {
      custom_id: "teste_checkout",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clivus.marcosleandru.com.br'}/api/webhook/efi`
    },
    settings: {
      payment_method: "all",
      expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      request_delivery_address: false
    }
  };

  console.log("📦 Payload da cobrança:");
  console.log(JSON.stringify(chargeBody, null, 2));

  const chargeResponse = await fetch(`${baseUrl}/charge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(chargeBody)
  });

  const chargeData = await chargeResponse.json();
  
  console.log("\n📊 Resposta da EFI:");
  console.log("Status:", chargeResponse.status);
  console.log(JSON.stringify(chargeData, null, 2));

  if (chargeResponse.ok) {
    console.log("\n✅ ✅ ✅ SUCESSO! CHECKOUT FUNCIONANDO! ✅ ✅ ✅");
    console.log("🆔 Charge ID:", chargeData.data.charge_id);
    
    // Agora configurar PIX
    const chargeId = chargeData.data.charge_id;
    console.log("\n🔄 Passo 3: Configurando PIX...");
    
    const pixResponse = await fetch(`${baseUrl}/charge/${chargeId}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payment: { pix: {} } })
    });

    const pixData = await pixResponse.json();
    
    if (pixResponse.ok) {
      console.log("✅ PIX configurado com sucesso!");
      console.log("📱 QR Code:", pixData.data.pix.qrcode ? "✓ Gerado" : "✗ Erro");
      console.log("📋 Copia e Cola:", pixData.data.pix.qrcode_text ? "✓ Gerado" : "✗ Erro");
      console.log("\n🎉 CHECKOUT EFI ESTÁ 100% FUNCIONAL!");
    } else {
      console.error("❌ Erro ao configurar PIX:");
      console.error(JSON.stringify(pixData, null, 2));
    }
  } else {
    console.error("\n❌ ERRO ao criar cobrança!");
    console.error("Detalhes:", chargeData);
  }

} catch (error) {
  console.error("\n❌ Erro geral:", error.message);
  console.error(error.stack);
}
