
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create test admin user
  const hashedAdminPassword = await bcrypt.hash("johndoe123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      password: hashedAdminPassword,
      name: "Admin User",
      role: "admin",
      hasAccess: true,
      cpf: "000.000.000-00",
      cnpj: "00.000.000/0001-00",
      businessArea: "Tecnologia",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create test user for authentication testing
  const hashedTestPassword = await bcrypt.hash("senha123", 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: "usuario@exemplo.com" },
    update: {},
    create: {
      email: "usuario@exemplo.com",
      password: hashedTestPassword,
      name: "Usuario Teste",
      role: "user",
      hasAccess: false,
      cpf: "111.111.111-11",
      cnpj: "11.111.111/0001-11",
      businessArea: "Comércio",
    },
  });

  console.log("✅ Test user created:", testUser.email);
  console.log("🌱 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

