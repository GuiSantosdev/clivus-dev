import { config } from 'dotenv';
config();

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log("🌐 URL Base:", BASE_URL);
console.log("\n🧪 Testando endpoint de checkout...\n");

async function testCheckout() {
  try {
    // Primeiro, vamos verificar se os planos estão disponíveis
    console.log("1️⃣ Buscando planos disponíveis...");
    const plansResponse = await fetch(`${BASE_URL}/api/plans`);
    const plans = await plansResponse.json();
    console.log("📊 Planos encontrados:", plans.length);
    console.log("📋 Planos:", JSON.stringify(plans.map(p => ({ name: p.name, slug: p.slug, price: p.price })), null, 2));
    
    if (plans.length === 0) {
      console.error("❌ Nenhum plano encontrado!");
      return;
    }
    
    // Testar com o primeiro plano
    const planToTest = plans[0];
    console.log(`\n2️⃣ Testando checkout com plano: ${planToTest.name} (${planToTest.slug})`);
    
    const checkoutResponse = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan: planToTest.slug,
        gateway: "asaas",
        amount: planToTest.price
      })
    });
    
    const checkoutData = await checkoutResponse.json();
    
    console.log("\n📊 Status da resposta:", checkoutResponse.status);
    console.log("📊 Response OK?", checkoutResponse.ok);
    console.log("📊 Dados:", JSON.stringify(checkoutData, null, 2));
    
    if (!checkoutResponse.ok) {
      console.error("\n❌ ERRO ENCONTRADO:");
      console.error("Status:", checkoutResponse.status);
      console.error("Mensagem:", checkoutData.error);
      console.error("Detalhes:", checkoutData.details);
    } else {
      console.log("\n✅ Checkout funcionou!");
    }
    
  } catch (error) {
    console.error("\n❌ Erro ao testar:", error.message);
  }
}

testCheckout();
