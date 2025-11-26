/**
 * Script de teste para validar fluxo completo do PIX EFI
 * 
 * Este script:
 * 1. Busca as credenciais do banco de dados
 * 2. Autentica com a API EFI
 * 3. Cria uma cobrança PIX de teste
 * 4. Gera o QR Code
 * 5. Valida a resposta
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

const PLAN_AMOUNT = 97; // R$ 97,00
const TEST_USER = {
  name: "Cliente Teste PIX",
  email: "teste.pix@clivus.com.br",
  cpf: "12345678901",
};

async function testPixFlow() {
  console.log("\n🧪 TESTE DE FLUXO PIX - EFI\n");
  console.log("=".repeat(60));

  try {
    // 1. Buscar credenciais do banco
    console.log("\n1️⃣ Buscando credenciais EFI do banco de dados...");
    
    const gateway = await prisma.gateway.findUnique({
      where: { name: 'efi' },
    });

    if (!gateway) {
      throw new Error("Gateway EFI não encontrado no banco");
    }

    if (!gateway.isEnabled) {
      console.warn("⚠️  Gateway EFI está DESABILITADO no banco");
    }

    const config = gateway.environment === 'sandbox' 
      ? gateway.sandboxConfig 
      : gateway.productionConfig;

    if (!config || !config.clientId || !config.clientSecret) {
      throw new Error(`Credenciais ${gateway.environment} não configuradas`);
    }

    console.log(`✅ Credenciais encontradas (${gateway.environment})`);
    console.log(`   Client ID: ${config.clientId.substring(0, 20)}...`);
    console.log(`   Environment: ${gateway.environment}`);

    // 2. Obter base URL
    const baseUrl = gateway.environment === 'production'
      ? 'https://cobrancas.api.efipay.com.br/v1'
      : 'https://cobrancas-h.api.efipay.com.br/v1';

    console.log(`   Base URL: ${baseUrl}`);

    // 3. Autenticar (OAuth)
    console.log("\n2️⃣ Autenticando com EFI (OAuth 2.0)...");
    
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    
    const authResponse = await fetch(`${baseUrl}/authorize`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Autenticação falhou (${authResponse.status}): ${errorText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    console.log("✅ Autenticação bem-sucedida");
    console.log(`   Token: ${accessToken.substring(0, 30)}...`);
    console.log(`   Expira em: ${authData.expires_in} segundos`);

    // 4. Criar cobrança PIX
    console.log("\n3️⃣ Criando cobrança PIX...");

    const chargePayload = {
      items: [
        {
          name: "Plano Básico Clivus",
          value: PLAN_AMOUNT * 100, // valor em centavos
          amount: 1,
        },
      ],
      settings: {
        payment_method: "all",
        expire_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z',
        request_delivery_address: false,
      },
    };

    const chargeResponse = await fetch(`${baseUrl}/charge/one-step/link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargePayload),
    });

    if (!chargeResponse.ok) {
      const errorText = await chargeResponse.text();
      throw new Error(`Criação de cobrança falhou (${chargeResponse.status}): ${errorText}`);
    }

    const chargeData = await chargeResponse.json();
    const chargeId = chargeData.data.charge_id;

    console.log("✅ Cobrança criada com sucesso");
    console.log(`   Charge ID: ${chargeId}`);
    console.log(`   Link: ${chargeData.data.link}`);
    console.log(`   Status: ${chargeData.data.status}`);

    // 5. Gerar PIX QR Code
    console.log("\n4️⃣ Gerando QR Code PIX...");

    // Configurar PIX para a cobrança
    const pixConfigPayload = {
      pix: {
        expiracao: 3600, // 1 hora
      },
    };

    const pixConfigResponse = await fetch(`${baseUrl}/charge/${chargeId}/pix`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pixConfigPayload),
    });

    if (!pixConfigResponse.ok) {
      const errorText = await pixConfigResponse.text();
      throw new Error(`Configuração PIX falhou (${pixConfigResponse.status}): ${errorText}`);
    }

    const pixConfigData = await pixConfigResponse.json();

    console.log("✅ PIX configurado com sucesso");

    // Buscar QR Code
    const qrCodeResponse = await fetch(`${baseUrl}/pix/${chargeId}/qrcode`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!qrCodeResponse.ok) {
      const errorText = await qrCodeResponse.text();
      throw new Error(`Busca de QR Code falhou (${qrCodeResponse.status}): ${errorText}`);
    }

    const qrCodeData = await qrCodeResponse.json();

    console.log("✅ QR Code gerado com sucesso");
    console.log(`   QR Code (primeiros 50 chars): ${qrCodeData.pix.qrcode.substring(0, 50)}...`);
    console.log(`   Imagem: ${qrCodeData.pix.qrcode_image}`);

    // Resumo final
    console.log("\n" + "=".repeat(60));
    console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");
    console.log("=".repeat(60));
    console.log("\n📋 RESUMO:");
    console.log(`   • Ambiente: ${gateway.environment.toUpperCase()}`);
    console.log(`   • Charge ID: ${chargeId}`);
    console.log(`   • Valor: R$ ${(PLAN_AMOUNT / 100).toFixed(2)}`);
    console.log(`   • Status: ${chargeData.data.status}`);
    console.log(`   • Link de Pagamento: ${chargeData.data.link}`);
    console.log(`   • QR Code PIX: Gerado`);
    console.log("\n💡 PRÓXIMOS PASSOS:");
    console.log("   1. Use o link acima para testar o pagamento");
    console.log("   2. Ou escaneie o QR Code PIX no aplicativo do banco");
    console.log("   3. Verifique se o webhook é chamado após o pagamento\n");

    return true;
  } catch (error) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    console.log("\n💡 POSSÍVEIS CAUSAS:");
    console.log("   • Credenciais inválidas ou expiradas");
    console.log("   • Gateway não configurado no banco de dados");
    console.log("   • Problemas de conectividade com a API EFI");
    console.log("   • Ambiente incorreto (sandbox vs production)\n");
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPixFlow()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });
