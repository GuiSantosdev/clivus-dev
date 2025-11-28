import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verificando gateways...");
  
  const gateways = await prisma.gateway.findMany();
  console.log("Gateways encontrados:", JSON.stringify(gateways, null, 2));
  
  if (gateways.length === 0) {
    console.log("⚠️ Nenhum gateway encontrado! Criando Asaas...");
  }
  
  // Garantir que Asaas existe e está ativo
  const asaas = await prisma.gateway.upsert({
    where: { name: "asaas" },
    update: { isEnabled: true, displayName: "Asaas" },
    create: {
      name: "asaas",
      displayName: "Asaas",
      isEnabled: true
    }
  });
  
  console.log("✅ Gateway Asaas atualizado:", JSON.stringify(asaas, null, 2));
  
  // Verificar todos os gateways novamente
  const allGateways = await prisma.gateway.findMany();
  console.log("📊 Status final dos gateways:", JSON.stringify(allGateways, null, 2));
}

main()
  .then(() => {
    console.log("\n✅ Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
