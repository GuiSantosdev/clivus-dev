// Teste direto da API de checkout (sem autenticação)
console.log("🧪 TESTE DIRETO DO CHECKOUT (sem sessão)\n");

const checkoutData = {
  plan: 'basico',
  gateway: 'efi'
};

console.log("📦 Payload:", JSON.stringify(checkoutData, null, 2));

const response = await fetch('http://localhost:3000/api/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(checkoutData)
});

console.log("📊 Status:", response.status);
const result = await response.json();
console.log("\n📋 Resposta:");
console.log(JSON.stringify(result, null, 2));

if (result.error) {
  console.log("\n❌ ERRO:", result.error);
  if (result.details) {
    console.log("Detalhes:", result.details);
  }
}
