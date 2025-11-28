import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

config();

const prisma = new PrismaClient();

async function testCheckout() {
  console.log("🧪 Simulando checkout com usuário logado...\n");
  
  // 1. Buscar usuário de teste
  const testUser = await prisma.user.findUnique({
    where: { email: "cliente@teste.com" }
  });
  
  if (!testUser) {
    console.error("❌ Usuário de teste não encontrado!");
    return;
  }
  
  console.log("👤 Usuário encontrado:", {
    id: testUser.id,
    name: testUser.name,
    email: testUser.email,
    cpf: testUser.cpf,
    cnpj: testUser.cnpj
  });
  
  // 2. Buscar plano
  const plan = await prisma.plan.findUnique({
    where: { slug: "basic" }
  });
  
  if (!plan) {
    console.error("❌ Plano não encontrado!");
    return;
  }
  
  console.log("\n📦 Plano encontrado:", {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    price: plan.price
  });
  
  // 3. Simular criação de pagamento
  console.log("\n💳 Simulando criação de pagamento...");
  
  try {
    const payment = await prisma.payment.create({
      data: {
        userId: testUser.id,
        amount: plan.price,
        currency: "brl",
        status: "pending",
        plan: plan.slug,
        planId: plan.id,
        gateway: "asaas",
      },
    });
    
    console.log("✅ Pagamento criado:", payment.id);
    
    // 4. Simular chamada para Asaas
    console.log("\n🔗 Testando API do Asaas...");
    
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    const ASAAS_BASE_URL = "https://api.asaas.com/v3";
    
    // Validar CPF/CNPJ
    const cpfCnpj = testUser.cpf || testUser.cnpj || "";
    const cpfCnpjNumeros = cpfCnpj.replace(/\D/g, "");
    const cpfCnpjValido = cpfCnpjNumeros.length === 11 || cpfCnpjNumeros.length === 14;
    
    console.log("🔍 CPF/CNPJ:", {
      original: cpfCnpj,
      numeros: cpfCnpjNumeros,
      comprimento: cpfCnpjNumeros.length,
      valido: cpfCnpjValido
    });
    
    // Criar payload do cliente
    const customerPayload = {
      name: testUser.name,
      email: testUser.email,
    };
    
    if (cpfCnpjValido) {
      customerPayload.cpfCnpj = cpfCnpjNumeros;
    }
    
    console.log("\n📤 Payload para criar cliente:", JSON.stringify(customerPayload, null, 2));
    
    // Tentar criar cliente
    const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY
      },
      body: JSON.stringify(customerPayload)
    });
    
    const customerData = await customerResponse.json();
    
    console.log("\n📥 Resposta do Asaas (cliente):", {
      status: customerResponse.status,
      ok: customerResponse.ok,
      data: JSON.stringify(customerData, null, 2).substring(0, 500)
    });
    
    if (!customerResponse.ok) {
      console.error("❌ ERRO ao criar cliente no Asaas!");
      console.error("Detalhes:", customerData);
      return;
    }
    
    const customerId = customerData.id;
    console.log("✅ Cliente criado no Asaas:", customerId);
    
    // Criar payment link
    console.log("\n💰 Criando payment link...");
    
    const paymentLinkPayload = {
      name: `Clivus - ${plan.name}`,
      description: `Acesso completo ao Clivus - Plano ${plan.name}`,
      billingType: "UNDEFINED",
      chargeType: "DETACHED",
      value: plan.price,
      externalReference: payment.id,
    };
    
    console.log("📤 Payload para payment link:", JSON.stringify(paymentLinkPayload, null, 2));
    
    const paymentLinkResponse = await fetch(`${ASAAS_BASE_URL}/paymentLinks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY
      },
      body: JSON.stringify(paymentLinkPayload)
    });
    
    const paymentLinkData = await paymentLinkResponse.json();
    
    console.log("\n📥 Resposta do Asaas (payment link):", {
      status: paymentLinkResponse.status,
      ok: paymentLinkResponse.ok,
      data: JSON.stringify(paymentLinkData, null, 2).substring(0, 500)
    });
    
    if (!paymentLinkResponse.ok) {
      console.error("❌ ERRO ao criar payment link no Asaas!");
      console.error("Detalhes:", paymentLinkData);
      return;
    }
    
    console.log("\n✅ SUCESSO! Payment link criado:", paymentLinkData.url);
    
    // Limpar pagamento de teste
    await prisma.payment.delete({ where: { id: payment.id } });
    console.log("\n🧹 Pagamento de teste removido");
    
  } catch (error) {
    console.error("\n❌ ERRO DURANTE O TESTE:", error.message);
    console.error("Stack:", error.stack);
  }
}

testCheckout()
  .then(() => {
    console.log("\n✅ Teste concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
