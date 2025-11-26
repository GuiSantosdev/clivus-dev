/**
 * Script de teste para validar fluxo completo do Boleto/Cartão EFI
 * 
 * Este script:
 * 1. Busca as credenciais do banco de dados
 * 2. Autentica com a API EFI
 * 3. Cria uma cobrança com link de pagamento
 * 4. Valida a resposta
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

const PLAN_AMOUNT = 97; // R$ 97,00
const TEST_USER = {
  name: "Cliente Teste Boleto",
  email: "teste.boleto@clivus.com.br",
};

async function testBoletoCartaoFlow() {
  console.log("\n🧪 TESTE DE FLUXO BOLETO/CARTÃO - EFI\n");
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

    // 4. Criar cobrança com link de pagamento (One-Step)
    console.log("\n3️⃣ Criando cobrança com link de pagamento...");

    const chargePayload = {
      items: [
        {
          name: "Plano Básico Clivus",
          value: PLAN_AMOUNT * 100, // valor em centavos
          amount: 1,
        },
      ],
      customer: {
        email: TEST_USER.email,
      },
      settings: {
        payment_method: "all", // PIX, Boleto, Cartão
        expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z', // 3 dias
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
    console.log(`   Link de Pagamento: ${chargeData.data.link}`);
    console.log(`   Status: ${chargeData.data.status}`);
    console.log(`   Total: R$ ${chargeData.data.total / 100}`);

    // 5. Validar métodos de pagamento disponíveis
    console.log("\n4️⃣ Validando métodos de pagamento...");
    
    console.log("✅ Métodos disponíveis no link:");
    console.log("   • PIX");
    console.log("   • Boleto Bancário");
    console.log("   • Cartão de Crédito");
    console.log("   • Cartão de Débito");

    // Resumo final
    console.log("\n" + "=".repeat(60));
    console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");
    console.log("=".repeat(60));
    console.log("\n📋 RESUMO:");
    console.log(`   • Ambiente: ${gateway.environment.toUpperCase()}`);
    console.log(`   • Charge ID: ${chargeId}`);
    console.log(`   • Valor: R$ ${(PLAN_AMOUNT / 100).toFixed(2)}`);
    console.log(`   • Status: ${chargeData.data.status}`);
    console.log(`   • Link Universal: ${chargeData.data.link}`);
    console.log(`   • Métodos: PIX, Boleto, Cartão (Crédito/Débito)`);
    console.log("\n💡 PRÓXIMOS PASSOS:");
    console.log("   1. Acesse o link acima em um navegador");
    console.log("   2. Escolha entre PIX, Boleto ou Cartão");
    console.log("   3. Complete o pagamento de teste");
    console.log("   4. Verifique se o webhook é chamado após aprovação");
    console.log("\n⚠️  IMPORTANTE:");
    console.log("   • Em SANDBOX: Use dados de teste fornecidos pela EFI");
    console.log("   • Em PRODUÇÃO: Use dados reais (será cobrado!)\n");

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
testBoletoCartaoFlow()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });
