// Simula o checkout EXATO como o frontend faz
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';

console.log("🧪 SIMULANDO CHECKOUT REAL\n");

// 1. Fazer login primeiro
console.log("1️⃣ Fazendo login...");
const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cliente@teste.com',
    password: 'senha123',
    callbackUrl: '/checkout'
  })
});

console.log("Login status:", loginRes.status);

if (loginRes.status !== 200) {
  console.error("❌ Erro no login");
  process.exit(1);
}

// Pegar o cookie de sessão
const cookies = loginRes.headers.get('set-cookie');
console.log("✅ Login OK, cookies:", cookies ? "presente" : "ausente");

// 2. Tentar fazer checkout
console.log("\n2️⃣ Iniciando checkout...");
const checkoutRes = await fetch(`${baseUrl}/api/checkout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': cookies || ''
  },
  body: JSON.stringify({
    plan: 'basico',
    gateway: 'efi'
  })
});

console.log("Checkout status:", checkoutRes.status);
const checkoutData = await checkoutRes.json();

console.log("\n📋 RESPOSTA DO CHECKOUT:");
console.log(JSON.stringify(checkoutData, null, 2));

if (checkoutRes.status === 200 && checkoutData.url) {
  console.log("\n✅ ✅ ✅ SUCESSO! URL DO PAGAMENTO:");
  console.log(checkoutData.url);
} else {
  console.log("\n❌ ❌ ❌ ERRO NO CHECKOUT!");
  if (checkoutData.error) {
    console.log("Erro:", checkoutData.error);
  }
  if (checkoutData.details) {
    console.log("Detalhes:", checkoutData.details);
  }
}
