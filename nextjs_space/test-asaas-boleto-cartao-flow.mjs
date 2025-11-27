/**
 * Script de teste para validar fluxo completo do Asaas (Boleto/Cartão)
 * 
 * Este script:
 * 1. Busca as credenciais do banco de dados
 * 2. Autentica com a API Asaas
 * 3. Cria/busca um cliente
 * 4. Cria um link de pagamento universal (PIX + Boleto + Cartão)
 * 5. Valida a resposta
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

const PLAN_AMOUNT = 97; // R$ 97,00
const TEST_USER = {
  name: "Cliente Teste Asaas",
  email: "teste.asaas@clivus.com.br",
  cpfCnpj: "12345678901",
};

async function testAsaasBoletoCartaoFlow() {
  console.log("\n🧪 TESTE DE FLUXO BOLETO/CARTÃO - ASAAS\n");
  console.log("=".repeat(60));

  try {
    // 1. Buscar credenciais do banco ou .env
    console.log("\n1️⃣ Buscando credenciais Asaas...");
    
    let apiKey = process.env.ASAAS_API_KEY;
    let environment = process.env.ASAAS_ENVIRONMENT || "sandbox";

    // Tentar buscar do banco primeiro
    try {
      const gateway = await prisma.gateway.findUnique({
        where: { name: 'asaas' },
      });

      if (gateway && gateway.isEnabled) {
        const config = gateway.environment === 'sandbox' 
          ? gateway.sandboxConfig 
          : gateway.productionConfig;

        if (config && config.apiKey) {
          apiKey = String(config.apiKey);
          environment = gateway.environment;
          console.log("✅ Credenciais encontradas no banco de dados");
        }
      }
    } catch (dbError) {
      console.warn("⚠️  Não foi possível buscar do banco, usando .env");
    }

    if (!apiKey) {
      throw new Error("API Key do Asaas não configurada");
    }

    console.log(`✅ Credenciais configuradas`);
    console.log(`   API Key: ${apiKey.substring(0, 20)}...`);
    console.log(`   Environment: ${environment}`);

    // 2. Obter base URL
    const baseUrl = environment === 'production'
      ? 'https://www.asaas.com/api/v3'
      : 'https://sandbox.asaas.com/api/v3';

    console.log(`   Base URL: ${baseUrl}`);

    // 3. Testar autenticação com Asaas (buscar dados da conta)
    console.log("\n2️⃣ Testando autenticação com Asaas...");
    
    const accountResponse = await fetch(`${baseUrl}/myAccount`, {
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      throw new Error(`Autenticação falhou (${accountResponse.status}): ${errorText}`);
    }

    const accountData = await accountResponse.json();

    console.log("✅ Autenticação bem-sucedida");
    console.log(`   Conta: ${accountData.name}`);
    console.log(`   Email: ${accountData.email}`);

    // 4. Criar/buscar cliente
    console.log("\n3️⃣ Criando/buscando cliente...");

    // Buscar cliente existente
    const searchResponse = await fetch(
      `${baseUrl}/customers?email=${encodeURIComponent(TEST_USER.email)}`,
      {
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    let customerId;

    if (!searchResponse.ok) {
      throw new Error(`Busca de cliente falhou: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
      console.log("✅ Cliente encontrado");
    } else {
      // Criar novo cliente
      const createResponse = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: TEST_USER.name,
          email: TEST_USER.email,
          cpfCnpj: TEST_USER.cpfCnpj,
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Criação de cliente falhou: ${errorText}`);
      }

      const createData = await createResponse.json();
      customerId = createData.id;
      console.log("✅ Cliente criado");
    }

    console.log(`   Customer ID: ${customerId}`);

    // 5. Criar link de pagamento universal
    console.log("\n4️⃣ Criando link de pagamento...");

    const paymentLinkPayload = {
      name: "Plano Básico Clivus - Teste",
      description: "Acesso completo ao Clivus - Plano Básico",
      billingType: "UNDEFINED", // Permite PIX, Boleto, Cartão
      chargeType: "DETACHED",
      value: PLAN_AMOUNT,
      dueDateLimitDays: 3, // 3 dias úteis para vencimento do boleto
      externalReference: `test_${Date.now()}`,
    };

    console.log("   Payload:", JSON.stringify(paymentLinkPayload, null, 2));

    const linkResponse = await fetch(`${baseUrl}/paymentLinks`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentLinkPayload),
    });

    if (!linkResponse.ok) {
      const errorText = await linkResponse.text();
      throw new Error(`Criação de link falhou (${linkResponse.status}): ${errorText}`);
    }

    const linkData = await linkResponse.json();

    console.log("✅ Link de pagamento criado com sucesso");
    console.log(`   Link ID: ${linkData.id}`);
    console.log(`   URL: ${linkData.url}`);

    // Resumo final
    console.log("\n" + "=".repeat(60));
    console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");
    console.log("=".repeat(60));
    console.log("\n📋 RESUMO:");
    console.log(`   • Ambiente: ${environment.toUpperCase()}`);
    console.log(`   • Link ID: ${linkData.id}`);
    console.log(`   • Valor: R$ ${(PLAN_AMOUNT / 100).toFixed(2)}`);
    console.log(`   • Link Universal: ${linkData.url}`);
    console.log(`   • Métodos: PIX, Boleto (venc. 3 dias), Cartão`);
    console.log("\n💡 PRÓXIMOS PASSOS:");
    console.log("   1. Acesse o link acima em um navegador");
    console.log("   2. Escolha entre PIX, Boleto ou Cartão");
    console.log("   3. Complete o pagamento de teste");
    console.log("   4. Verifique se o webhook é chamado após aprovação");
    console.log("\n⚠️  IMPORTANTE:");
    console.log("   • Em SANDBOX: Use dados de teste (cartões de teste)");
    console.log("   • Em PRODUÇÃO: Use dados reais (será cobrado!)\n");

    return true;
  } catch (error) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    console.log("\n💡 POSSÍVEIS CAUSAS:");
    console.log("   • API Key inválida ou expirada");
    console.log("   • Gateway não configurado corretamente");
    console.log("   • Problemas de conectividade com a API Asaas");
    console.log("   • Ambiente incorreto (sandbox vs production)");
    console.log("   • Campo dueDateLimitDays faltando ou inválido\n");
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testAsaasBoletoCartaoFlow()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });
