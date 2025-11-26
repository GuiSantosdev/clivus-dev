import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function seedGateways() {
  console.log("🌱 Seeding gateways...");

  const gateways = [
    {
      name: "efi",
      displayName: "EFI (Gerencianet)",
      isEnabled: false,
      environment: "sandbox",
    },
    {
      name: "asaas",
      displayName: "Asaas",
      isEnabled: false,
      environment: "sandbox",
    },
    {
      name: "stripe",
      displayName: "Stripe",
      isEnabled: false,
      environment: "sandbox",
    },
    {
      name: "cora",
      displayName: "CORA",
      isEnabled: false,
      environment: "sandbox",
    },
    {
      name: "pagarme",
      displayName: "Pagar.me",
      isEnabled: false,
      environment: "sandbox",
    },
  ];

  for (const gateway of gateways) {
    await prisma.gateway.upsert({
      where: { name: gateway.name },
      update: {},
      create: gateway,
    });
    console.log(`✅ Gateway ${gateway.displayName} criado/atualizado`);
  }

  console.log("✅ Gateways seeded!");
}

seedGateways()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
