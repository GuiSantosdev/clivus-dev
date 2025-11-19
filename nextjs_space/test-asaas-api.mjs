import { config } from 'dotenv';
config();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || "production";
const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === "sandbox" 
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3";

console.log("🔑 Token presente?", !!ASAAS_API_KEY);
console.log("🌍 Ambiente:", ASAAS_ENVIRONMENT);
console.log("🔗 URL Base:", ASAAS_BASE_URL);
console.log("📝 Primeiros 8 caracteres do token:", ASAAS_API_KEY ? ASAAS_API_KEY.substring(0, 8) + "..." : "VAZIO");

async function testAsaasAPI() {
  console.log("\n🧪 Testando API do Asaas...");
  
  try {
    const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY
      }
    });
    
    const data = await response.json();
    
    console.log("\n📊 Status da resposta:", response.status);
    console.log("📊 Response OK?", response.ok);
    
    if (response.ok) {
      console.log("✅ API do Asaas está funcionando!");
      console.log("📊 Dados:", JSON.stringify(data, null, 2).substring(0, 500));
    } else {
      console.log("❌ Erro na API do Asaas:");
      console.log("📊 Dados do erro:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Erro ao testar API:", error.message);
  }
}

testAsaasAPI();
