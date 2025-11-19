import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function testCheckout() {
  console.log("🧪 Testando checkout com usuário REAL do banco...\n");
  
  // Usar o usuário "Cliente Teste" que tem CPF/CNPJ válidos
  const testUser = await prisma.user.findUnique({
    where: { email: "teste@teste.com" }
  });
  
  if (!testUser) {
    console.error("❌ Usuário não encontrado!");
    return;
  }
  
  console.log("👤 Usuário encontrado:", {
    id: testUser.id,
    name: testUser.name,
    email: testUser.email,
    cpf: testUser.cpf,
    cnpj: testUser.cnpj
  });
  
  // Buscar plano
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
    price: plan.price
  });
  
  // Criar pagamento de teste
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
  
  console.log("\n💳 Pagamento criado:", payment.id);
  
  // Testar Asaas
  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
  const ASAAS_BASE_URL = "https://api.asaas.com/v3";
  
  // Validar CPF/CNPJ
  const cpfCnpj = testUser.cpf || testUser.cnpj || "";
  const cpfCnpjNumeros = cpfCnpj.replace(/\D/g, "");
  const cpfCnpjValido = cpfCnpjNumeros.length === 11 || cpfCnpjNumeros.length === 14;
  
  console.log("\n🔍 Validação CPF/CNPJ:", {
    original: cpfCnpj,
    numeros: cpfCnpjNumeros,
    comprimento: cpfCnpjNumeros.length,
    valido: cpfCnpjValido
  });
  
  // Criar cliente no Asaas
  const customerPayload = {
    name: testUser.name,
    email: testUser.email,
  };
  
  if (cpfCnpjValido) {
    customerPayload.cpfCnpj = cpfCnpjNumeros;
    console.log("✅ CPF/CNPJ SERÁ ENVIADO ao Asaas");
  } else {
    console.log("⚠️ CPF/CNPJ NÃO SERÁ ENVIADO ao Asaas (inválido ou vazio)");
  }
  
  console.log("\n📤 Payload para Asaas (customer):", JSON.stringify(customerPayload, null, 2));
  
  try {
    const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY
      },
      body: JSON.stringify(customerPayload)
    });
    
    const customerData = await customerResponse.json();
    
    console.log("\n📥 Resposta do Asaas (customer):", {
      status: customerResponse.status,
      ok: customerResponse.ok
    });
    
    if (!customerResponse.ok) {
      console.error("❌ ERRO ao criar cliente:");
      console.error(JSON.stringify(customerData, null, 2));
      throw new Error(customerData.errors?.[0]?.description || "Erro ao criar cliente");
    }
    
    console.log("✅ Cliente criado com sucesso:", customerData.id);
    
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
      ok: paymentLinkResponse.ok
    });
    
    if (!paymentLinkResponse.ok) {
      console.error("❌ ERRO ao criar payment link:");
      console.error(JSON.stringify(paymentLinkData, null, 2));
      throw new Error(paymentLinkData.errors?.[0]?.description || "Erro ao criar payment link");
    }
    
    console.log("✅ Payment link criado com sucesso!");
    console.log("🔗 URL:", paymentLinkData.url);
    
    console.log("\n✨ TESTE COMPLETO COM SUCESSO! ✨");
    console.log("\nConclusão: A integração Asaas está FUNCIONANDO para usuários COM CPF/CNPJ válido.");
    
  } catch (error) {
    console.error("\n❌ ERRO durante o teste:");
    console.error("Mensagem:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    // Limpar pagamento de teste
    await prisma.payment.delete({ where: { id: payment.id } });
    console.log("\n🧹 Pagamento de teste removido");
  }
}

testCheckout()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
