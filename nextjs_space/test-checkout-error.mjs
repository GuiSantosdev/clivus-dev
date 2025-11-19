// Teste para reproduzir o erro EXATO do checkout
console.log("🧪 TESTE DE CHECKOUT - REPRODUZINDO ERRO\n");

// 1. Fazer login para obter sessão
console.log("1️⃣ Fazendo login...");
const loginRes = await fetch("http://localhost:3000/api/auth/callback/credentials", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "cliente@teste.com",
    password: "senha123",
    json: true
  })
});

console.log("Status do login:", loginRes.status);

if (loginRes.status !== 200) {
  console.error("❌ Erro no login. Abortando teste.");
  const errorText = await loginRes.text();
  console.error("Resposta:", errorText);
  process.exit(1);
}

const loginData = await loginRes.json();
console.log("✅ Login realizado");

// Obter cookies de sessão
const cookies = loginRes.headers.get("set-cookie");
console.log("Cookies:", cookies ? "presente" : "AUSENTE");

// 2. Tentar processar checkout
console.log("\n2️⃣ Processando checkout com EFI...");
const checkoutRes = await fetch("http://localhost:3000/api/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Cookie": cookies || ""
  },
  body: JSON.stringify({
    plan: "basico",
    gateway: "efi"
  })
});

console.log("Status do checkout:", checkoutRes.status);
const checkoutData = await checkoutRes.json();

console.log("\n📋 RESPOSTA DO CHECKOUT:");
console.log(JSON.stringify(checkoutData, null, 2));

if (checkoutRes.status !== 200) {
  console.log("\n❌ ❌ ❌ ERRO ENCONTRADO!");
  console.log("Este é o erro que o usuário está vendo:");
  console.log("Erro:", checkoutData.error);
  console.log("Detalhes:", checkoutData.details);
} else {
  console.log("\n✅ ✅ ✅ SUCESSO!");
  console.log("URL:", checkoutData.url);
}
