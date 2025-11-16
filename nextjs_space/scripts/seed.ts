
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create test admin user
  const hashedPassword = await bcrypt.hash("johndoe123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
      hasAccess: true,
      cpf: "000.000.000-00",
      cnpj: "00.000.000/0001-00",
      businessArea: "Tecnologia",
    },
  });

  console.log("✅ Admin user created:", admin.email);
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

