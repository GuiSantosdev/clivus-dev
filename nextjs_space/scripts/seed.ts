
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

  // Create plans
  const plansData = [
    {
      name: "Básico",
      slug: "basic",
      price: 97,
      order: 0,
      features: [
        "Separação completa entre CPF e CNPJ",
        "Controle de receitas e despesas",
        "Relatórios financeiros mensais",
        "Acesso 100% online (web e mobile)",
        "Organização por categorias",
        "Suporte por email",
        "Conformidade com a legislação brasileira",
      ],
    },
    {
      name: "Intermediário",
      slug: "intermediate",
      price: 147,
      order: 1,
      features: [
        "Tudo do Plano Básico",
        "Calculadora de pró-labore automatizada",
        "Relatórios financeiros semanais",
        "Dashboard executivo avançado",
        "Controle de investimentos PF e PJ",
        "Alertas de compliance fiscal",
        "Suporte prioritário por email",
        "Exportação de dados em Excel/PDF",
      ],
    },
    {
      name: "Avançado",
      slug: "advanced",
      price: 297,
      order: 2,
      features: [
        "Tudo do Plano Intermediário",
        "Acesso multi-usuário (até 5 membros)",
        "Gestão de equipe com permissões",
        "Relatórios personalizados ilimitados",
        "Integração com contadores",
        "Análise preditiva de fluxo de caixa",
        "Suporte prioritário por WhatsApp",
        "Consultoria fiscal mensal incluída",
        "Atualizações e novos recursos em primeira mão",
      ],
    },
  ];

  for (const planData of plansData) {
    const plan = await prisma.plan.upsert({
      where: { slug: planData.slug },
      update: {},
      create: planData,
    });
    console.log(`✅ Plan created: ${plan.name} - R$ ${plan.price}`);
  }

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

