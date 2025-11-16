
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create SuperAdmin user (manages the Clivus business)
  const hashedSuperAdminPassword = await bcrypt.hash("superadmin123", 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@clivus.com" },
    update: {},
    create: {
      email: "superadmin@clivus.com",
      password: hashedSuperAdminPassword,
      name: "Super Admin",
      role: "superadmin",
      hasAccess: true,
      cpf: "999.999.999-99",
      cnpj: "99.999.999/0001-99",
      businessArea: "Gestão de Sistema",
    },
  });

  console.log("✅ SuperAdmin user created:", superAdmin.email);

  // Create test client user (Clivus customer with access)
  const hashedAdminPassword = await bcrypt.hash("johndoe123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      password: hashedAdminPassword,
      name: "Admin User",
      role: "user",
      hasAccess: true,
      cpf: "000.000.000-00",
      cnpj: "00.000.000/0001-00",
      businessArea: "Tecnologia",
    },
  });

  console.log("✅ Client user created:", admin.email);

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

  const createdPlans = [];
  for (const planData of plansData) {
    const plan = await prisma.plan.upsert({
      where: { slug: planData.slug },
      update: {},
      create: planData,
    });
    createdPlans.push(plan);
    console.log(`✅ Plan created: ${plan.name} - R$ ${plan.price}`);
  }

  // Create plan features with limits
  console.log("\n🎯 Creating plan features...");
  
  // Funcionalidades para o Plano Básico
  const basicPlan = createdPlans.find(p => p.slug === "basic");
  if (basicPlan) {
    const basicFeatures = [
      { featureKey: "transactions_monthly", featureName: "Transações por Mês", limit: 50, enabled: true },
      { featureKey: "team_members", featureName: "Membros da Equipe", limit: 1, enabled: true },
      { featureKey: "dre_reports_monthly", featureName: "Relatórios DRE por Mês", limit: 2, enabled: true },
      { featureKey: "attachments_per_transaction", featureName: "Anexos por Transação", limit: 2, enabled: true },
      { featureKey: "export_csv", featureName: "Exportação de Dados (CSV)", limit: -1, enabled: true },
      { featureKey: "export_pdf", featureName: "Exportação de Dados (PDF)", limit: 0, enabled: false },
      { featureKey: "prolabore_calculator", featureName: "Calculadora de Pró-labore", limit: 0, enabled: false },
      { featureKey: "compliance_alerts", featureName: "Alertas de Compliance", limit: 0, enabled: false },
      { featureKey: "investment_tracking", featureName: "Controle de Investimentos", limit: -1, enabled: true },
      { featureKey: "custom_categories", featureName: "Categorias Personalizadas no DRE", limit: 0, enabled: false },
      { featureKey: "priority_support", featureName: "Suporte Prioritário", limit: 0, enabled: false },
    ];
    
    for (const feature of basicFeatures) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureKey: {
            planId: basicPlan.id,
            featureKey: feature.featureKey,
          },
        },
        update: {},
        create: {
          planId: basicPlan.id,
          ...feature,
        },
      });
    }
    console.log(`✅ Features created for ${basicPlan.name}`);
  }

  // Funcionalidades para o Plano Intermediário
  const intermediatePlan = createdPlans.find(p => p.slug === "intermediate");
  if (intermediatePlan) {
    const intermediateFeatures = [
      { featureKey: "transactions_monthly", featureName: "Transações por Mês", limit: 200, enabled: true },
      { featureKey: "team_members", featureName: "Membros da Equipe", limit: 3, enabled: true },
      { featureKey: "dre_reports_monthly", featureName: "Relatórios DRE por Mês", limit: 10, enabled: true },
      { featureKey: "attachments_per_transaction", featureName: "Anexos por Transação", limit: 5, enabled: true },
      { featureKey: "export_csv", featureName: "Exportação de Dados (CSV)", limit: -1, enabled: true },
      { featureKey: "export_pdf", featureName: "Exportação de Dados (PDF)", limit: -1, enabled: true },
      { featureKey: "prolabore_calculator", featureName: "Calculadora de Pró-labore", limit: -1, enabled: true },
      { featureKey: "compliance_alerts", featureName: "Alertas de Compliance", limit: -1, enabled: true },
      { featureKey: "investment_tracking", featureName: "Controle de Investimentos", limit: -1, enabled: true },
      { featureKey: "custom_categories", featureName: "Categorias Personalizadas no DRE", limit: 5, enabled: true },
      { featureKey: "priority_support", featureName: "Suporte Prioritário", limit: 0, enabled: false },
    ];
    
    for (const feature of intermediateFeatures) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureKey: {
            planId: intermediatePlan.id,
            featureKey: feature.featureKey,
          },
        },
        update: {},
        create: {
          planId: intermediatePlan.id,
          ...feature,
        },
      });
    }
    console.log(`✅ Features created for ${intermediatePlan.name}`);
  }

  // Funcionalidades para o Plano Avançado
  const advancedPlan = createdPlans.find(p => p.slug === "advanced");
  if (advancedPlan) {
    const advancedFeatures = [
      { featureKey: "transactions_monthly", featureName: "Transações por Mês", limit: -1, enabled: true },
      { featureKey: "team_members", featureName: "Membros da Equipe", limit: 10, enabled: true },
      { featureKey: "dre_reports_monthly", featureName: "Relatórios DRE por Mês", limit: -1, enabled: true },
      { featureKey: "attachments_per_transaction", featureName: "Anexos por Transação", limit: -1, enabled: true },
      { featureKey: "export_csv", featureName: "Exportação de Dados (CSV)", limit: -1, enabled: true },
      { featureKey: "export_pdf", featureName: "Exportação de Dados (PDF)", limit: -1, enabled: true },
      { featureKey: "prolabore_calculator", featureName: "Calculadora de Pró-labore", limit: -1, enabled: true },
      { featureKey: "compliance_alerts", featureName: "Alertas de Compliance", limit: -1, enabled: true },
      { featureKey: "investment_tracking", featureName: "Controle de Investimentos", limit: -1, enabled: true },
      { featureKey: "custom_categories", featureName: "Categorias Personalizadas no DRE", limit: -1, enabled: true },
      { featureKey: "priority_support", featureName: "Suporte Prioritário", limit: -1, enabled: true },
    ];
    
    for (const feature of advancedFeatures) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureKey: {
            planId: advancedPlan.id,
            featureKey: feature.featureKey,
          },
        },
        update: {},
        create: {
          planId: advancedPlan.id,
          ...feature,
        },
      });
    }
    console.log(`✅ Features created for ${advancedPlan.name}`);
  }

  // Create transactions for test client (admin)
  console.log("\n📊 Creating transactions...");
  
  const transactionsData = [
    // CPF Transactions (Personal)
    { userId: admin.id, accountType: "cpf", type: "income", category: "Salário", amount: 5000, description: "Salário mensal", date: new Date("2024-11-01") },
    { userId: admin.id, accountType: "cpf", type: "income", category: "Freelance", amount: 1500, description: "Projeto freelance web design", date: new Date("2024-11-05") },
    { userId: admin.id, accountType: "cpf", type: "expense", category: "Moradia", amount: -1200, description: "Aluguel apartamento", date: new Date("2024-11-05") },
    { userId: admin.id, accountType: "cpf", type: "expense", category: "Alimentação", amount: -800, description: "Compras supermercado", date: new Date("2024-11-10") },
    { userId: admin.id, accountType: "cpf", type: "expense", category: "Transporte", amount: -300, description: "Combustível e manutenção", date: new Date("2024-11-12") },
    { userId: admin.id, accountType: "cpf", type: "expense", category: "Lazer", amount: -450, description: "Cinema, restaurantes e entretenimento", date: new Date("2024-11-15") },
    
    // CNPJ Transactions (Business)
    { userId: admin.id, accountType: "cnpj", type: "income", category: "Vendas", amount: 12000, description: "Vendas de produtos digitais", date: new Date("2024-11-02") },
    { userId: admin.id, accountType: "cnpj", type: "income", category: "Serviços", amount: 8500, description: "Consultoria empresarial", date: new Date("2024-11-08") },
    { userId: admin.id, accountType: "cnpj", type: "expense", category: "Fornecedores", amount: -3500, description: "Compra de matéria-prima", date: new Date("2024-11-03") },
    { userId: admin.id, accountType: "cnpj", type: "expense", category: "Marketing", amount: -2200, description: "Anúncios Google Ads e Facebook", date: new Date("2024-11-06") },
    { userId: admin.id, accountType: "cnpj", type: "expense", category: "Infraestrutura", amount: -800, description: "Servidor, domínio e ferramentas SaaS", date: new Date("2024-11-07") },
    { userId: admin.id, accountType: "cnpj", type: "expense", category: "Impostos", amount: -1800, description: "DAS MEI mensal", date: new Date("2024-11-10") },
    { userId: admin.id, accountType: "cnpj", type: "expense", category: "Pró-labore", amount: -3000, description: "Retirada pró-labore", date: new Date("2024-11-15") },
  ];

  for (const txData of transactionsData) {
    await prisma.transaction.create({ data: txData });
  }
  console.log(`✅ ${transactionsData.length} transactions created`);

  // Create test leads
  console.log("\n📧 Creating leads...");
  
  const leadsData = [
    { name: "Maria Silva", email: "maria@exemplo.com", cnpj: "12.345.678/0001-90", businessArea: "E-commerce" },
    { name: "Pedro Santos", email: "pedro@exemplo.com", cnpj: "23.456.789/0001-01", businessArea: "Consultoria" },
    { name: "Ana Costa", email: "ana@exemplo.com", cnpj: "34.567.890/0001-12", businessArea: "Serviços" },
    { name: "Carlos Oliveira", email: "carlos@exemplo.com", cnpj: "45.678.901/0001-23", businessArea: "Tecnologia" },
  ];

  for (const leadData of leadsData) {
    await prisma.lead.upsert({
      where: { email: leadData.email },
      update: {},
      create: leadData,
    });
  }
  console.log(`✅ ${leadsData.length} leads created`);

  // Create a test payment for the client user
  console.log("\n💳 Creating payment...");
  
  const planForPayment = await prisma.plan.findUnique({ where: { slug: "intermediate" } });
  
  if (planForPayment) {
    await prisma.payment.upsert({
      where: { 
        stripeSessionId: "test_session_123",
      },
      update: {},
      create: {
        userId: admin.id,
        planId: planForPayment.id,
        plan: planForPayment.slug,
        amount: planForPayment.price,
        status: "completed",
        stripeSessionId: "test_session_123",
      },
    });
    console.log("✅ Payment created for client user");
  }

  console.log("\n🌱 Seed completed successfully!");
  console.log("\n📝 Test credentials:");
  console.log("   SuperAdmin: superadmin@clivus.com / superadmin123");
  console.log("   Client: john@doe.com / johndoe123");
  console.log("   Test User: usuario@exemplo.com / senha123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

