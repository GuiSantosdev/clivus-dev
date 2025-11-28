
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create SuperAdmin user (manages the Clivus business)
  const hashedSuperAdminPassword = await bcrypt.hash("admin123", 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@clivus.com.br" },
    update: {
      password: hashedSuperAdminPassword,
      role: "superadmin",
      hasAccess: true,
    },
    create: {
      email: "admin@clivus.com.br",
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

  // Create test client users (one for each plan)
  const hashedTestPassword = await bcrypt.hash("senha123", 10);
  
  // Cliente Plano Básico
  const basicUser = await prisma.user.upsert({
    where: { email: "basico@teste.com" },
    update: {
      password: hashedTestPassword,
      role: "user",
      hasAccess: true,
    },
    create: {
      email: "basico@teste.com",
      password: hashedTestPassword,
      name: "Cliente Plano Básico",
      role: "user",
      hasAccess: true,
      cpf: "111.111.111-11",
      cnpj: "11.111.111/0001-11",
      businessArea: "Comércio",
    },
  });
  console.log("✅ Basic plan client user created:", basicUser.email);

  // Cliente Plano Intermediário
  const intermediateUser = await prisma.user.upsert({
    where: { email: "intermediario@teste.com" },
    update: {
      password: hashedTestPassword,
      role: "user",
      hasAccess: true,
    },
    create: {
      email: "intermediario@teste.com",
      password: hashedTestPassword,
      name: "Cliente Plano Intermediário",
      role: "user",
      hasAccess: true,
      cpf: "222.222.222-22",
      cnpj: "22.222.222/0001-22",
      businessArea: "Serviços",
    },
  });
  console.log("✅ Intermediate plan client user created:", intermediateUser.email);

  // Cliente Plano Avançado
  const advancedUser = await prisma.user.upsert({
    where: { email: "avancado@teste.com" },
    update: {
      password: hashedTestPassword,
      role: "user",
      hasAccess: true,
    },
    create: {
      email: "avancado@teste.com",
      password: hashedTestPassword,
      name: "Cliente Plano Avançado",
      role: "user",
      hasAccess: true,
      cpf: "333.333.333-33",
      cnpj: "33.333.333/0001-33",
      businessArea: "Indústria",
    },
  });
  console.log("✅ Advanced plan client user created:", advancedUser.email);

  // Cliente Teste (legado - mantido para compatibilidade)
  const testUser = await prisma.user.upsert({
    where: { email: "teste@teste.com" },
    update: {
      password: hashedTestPassword,
      role: "user",
      hasAccess: true,
    },
    create: {
      email: "teste@teste.com",
      password: hashedTestPassword,
      name: "Cliente Teste",
      role: "user",
      hasAccess: true,
      cpf: "444.444.444-44",
      cnpj: "44.444.444/0001-44",
      businessArea: "Comércio",
    },
  });
  console.log("✅ Legacy test user created:", testUser.email);

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
      { featureKey: "bank_reconciliation", featureName: "Conciliação Bancária Automática", limit: -1, enabled: true },
      { featureKey: "financial_planning", featureName: "Planejamento Financeiro (Previsto vs Realizado)", limit: -1, enabled: true },
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

  // Create gateways
  console.log("\n💳 Creating payment gateways...");
  
  await prisma.gateway.upsert({
    where: { name: "asaas" },
    update: {},
    create: {
      name: "asaas",
      displayName: "Asaas",
      isEnabled: true,
    },
  });
  console.log("✅ Gateway Asaas created");

  await prisma.gateway.upsert({
    where: { name: "cora" },
    update: {},
    create: {
      name: "cora",
      displayName: "CORA",
      isEnabled: true,
    },
  });
  console.log("✅ Gateway CORA created");

  await prisma.gateway.upsert({
    where: { name: "pagarme" },
    update: {},
    create: {
      name: "pagarme",
      displayName: "Pagar.me",
      isEnabled: false, // Disabled by default
    },
  });
  console.log("✅ Gateway Pagar.me created");

  await prisma.gateway.upsert({
    where: { name: "efi" },
    update: {},
    create: {
      name: "efi",
      displayName: "EFI (Gerencianet)",
      isEnabled: false, // Disabled by default
    },
  });
  console.log("✅ Gateway EFI created");

  await prisma.gateway.upsert({
    where: { name: "stripe" },
    update: {},
    create: {
      name: "stripe",
      displayName: "Stripe",
      isEnabled: false, // Disabled by default
    },
  });
  console.log("✅ Gateway Stripe created");

  // Create transactions for test client (admin)
  console.log("\n📊 Creating transactions...");
  
  const transactionsData = [
    // CPF Transactions (Personal)
    { userId: testUser.id, accountType: "cpf", type: "income", category: "Salário", amount: 5000, description: "Salário mensal", date: new Date("2024-11-01") },
    { userId: testUser.id, accountType: "cpf", type: "income", category: "Freelance", amount: 1500, description: "Projeto freelance web design", date: new Date("2024-11-05") },
    { userId: testUser.id, accountType: "cpf", type: "expense", category: "Moradia", amount: -1200, description: "Aluguel apartamento", date: new Date("2024-11-05") },
    { userId: testUser.id, accountType: "cpf", type: "expense", category: "Alimentação", amount: -800, description: "Compras supermercado", date: new Date("2024-11-10") },
    { userId: testUser.id, accountType: "cpf", type: "expense", category: "Transporte", amount: -300, description: "Combustível e manutenção", date: new Date("2024-11-12") },
    { userId: testUser.id, accountType: "cpf", type: "expense", category: "Lazer", amount: -450, description: "Cinema, restaurantes e entretenimento", date: new Date("2024-11-15") },
    
    // CNPJ Transactions (Business)
    { userId: testUser.id, accountType: "cnpj", type: "income", category: "Vendas", amount: 12000, description: "Vendas de produtos digitais", date: new Date("2024-11-02") },
    { userId: testUser.id, accountType: "cnpj", type: "income", category: "Serviços", amount: 8500, description: "Consultoria empresarial", date: new Date("2024-11-08") },
    { userId: testUser.id, accountType: "cnpj", type: "expense", category: "Fornecedores", amount: -3500, description: "Compra de matéria-prima", date: new Date("2024-11-03") },
    { userId: testUser.id, accountType: "cnpj", type: "expense", category: "Marketing", amount: -2200, description: "Anúncios Google Ads e Facebook", date: new Date("2024-11-06") },
    { userId: testUser.id, accountType: "cnpj", type: "expense", category: "Infraestrutura", amount: -800, description: "Servidor, domínio e ferramentas SaaS", date: new Date("2024-11-07") },
    { userId: testUser.id, accountType: "cnpj", type: "expense", category: "Impostos", amount: -1800, description: "DAS MEI mensal", date: new Date("2024-11-10") },
    { userId: testUser.id, accountType: "cnpj", type: "expense", category: "Pró-labore", amount: -3000, description: "Retirada pró-labore", date: new Date("2024-11-15") },
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

  // Create more test clients with different plans
  console.log("\n👥 Creating additional test clients...");
  
  const additionalClients = [
    {
      name: "Carlos Mendes",
      email: "carlos@empresa.com",
      password: "senha123",
      cpf: "222.222.222-22",
      cnpj: "22.222.222/0001-22",
      businessArea: "Consultoria Financeira",
      planSlug: "basic",
    },
    {
      name: "Ana Paula Silva",
      email: "ana.silva@loja.com",
      password: "senha123",
      cpf: "333.333.333-33",
      cnpj: "33.333.333/0001-33",
      businessArea: "E-commerce",
      planSlug: "intermediate",
    },
    {
      name: "Roberto Santos",
      email: "roberto@agencia.com",
      password: "senha123",
      cpf: "444.444.444-44",
      cnpj: "44.444.444/0001-44",
      businessArea: "Marketing Digital",
      planSlug: "advanced",
    },
    {
      name: "Juliana Costa",
      email: "juliana@design.com",
      password: "senha123",
      cpf: "555.555.555-55",
      cnpj: "55.555.555/0001-55",
      businessArea: "Design Gráfico",
      planSlug: "basic",
    },
    {
      name: "Fernando Lima",
      email: "fernando@contabilidade.com",
      password: "senha123",
      cpf: "666.666.666-66",
      cnpj: "66.666.666/0001-66",
      businessArea: "Contabilidade",
      planSlug: "intermediate",
    },
    {
      name: "Patrícia Oliveira",
      email: "patricia@advocacia.com",
      password: "senha123",
      cpf: "777.777.777-77",
      cnpj: "77.777.777/0001-77",
      businessArea: "Advocacia",
      planSlug: "advanced",
    },
    {
      name: "Ricardo Alves",
      email: "ricardo@startup.com",
      password: "senha123",
      cpf: "888.888.888-88",
      cnpj: "88.888.888/0001-88",
      businessArea: "Tecnologia",
      planSlug: "basic",
    },
    {
      name: "Camila Rodrigues",
      email: "camila@clinica.com",
      password: "senha123",
      cpf: "999.999.999-00",
      cnpj: "99.999.999/0001-00",
      businessArea: "Saúde",
      planSlug: "intermediate",
    },
    {
      name: "Bruno Ferreira",
      email: "bruno@restaurante.com",
      password: "senha123",
      cpf: "101.101.101-01",
      cnpj: "10.101.101/0001-01",
      businessArea: "Alimentação",
      planSlug: "basic",
    },
    {
      name: "Mariana Santos",
      email: "mariana@academia.com",
      password: "senha123",
      cpf: "202.202.202-02",
      cnpj: "20.202.202/0001-02",
      businessArea: "Fitness",
      planSlug: "advanced",
    },
  ];

  const createdClients = [];
  for (const clientData of additionalClients) {
    const hashedPassword = await bcrypt.hash(clientData.password, 10);
    const client = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        email: clientData.email,
        password: hashedPassword,
        name: clientData.name,
        role: "user",
        hasAccess: true,
        cpf: clientData.cpf,
        cnpj: clientData.cnpj,
        businessArea: clientData.businessArea,
      },
    });
    createdClients.push({ ...client, planSlug: clientData.planSlug });
    console.log(`✅ Client created: ${client.name}`);
  }

  // Create payments for all test clients
  console.log("\n💳 Creating payments...");
  
  // Payment for admin user
  const intermediatePlanForAdmin = await prisma.plan.findUnique({ where: { slug: "intermediate" } });
  if (intermediatePlanForAdmin) {
    await prisma.payment.upsert({
      where: { 
        stripeSessionId: "test_session_admin_123",
      },
      update: {},
      create: {
        userId: testUser.id,
        planId: intermediatePlanForAdmin.id,
        plan: intermediatePlanForAdmin.slug,
        amount: intermediatePlanForAdmin.price,
        status: "completed",
        stripeSessionId: "test_session_admin_123",
      },
    });
    console.log(`✅ Payment created for ${testUser.name}`);
  }

  // Create payments for plan-specific test users
  console.log("\n💳 Creating payments for plan-specific test users...");
  
  // Payment for Basic Plan User
  const basicPlanRef = createdPlans.find(p => p.slug === "basic");
  if (basicPlanRef) {
    await prisma.payment.upsert({
      where: { stripeSessionId: "test_session_basic_user" },
      update: {},
      create: {
        userId: basicUser.id,
        planId: basicPlanRef.id,
        plan: basicPlanRef.slug,
        amount: basicPlanRef.price,
        status: "completed",
        stripeSessionId: "test_session_basic_user",
        createdAt: new Date(),
      },
    });
    console.log(`✅ Payment created for ${basicUser.name} - ${basicPlanRef.name}`);
  }

  // Payment for Intermediate Plan User
  const intermediatePlanRef = createdPlans.find(p => p.slug === "intermediate");
  if (intermediatePlanRef) {
    await prisma.payment.upsert({
      where: { stripeSessionId: "test_session_intermediate_user" },
      update: {},
      create: {
        userId: intermediateUser.id,
        planId: intermediatePlanRef.id,
        plan: intermediatePlanRef.slug,
        amount: intermediatePlanRef.price,
        status: "completed",
        stripeSessionId: "test_session_intermediate_user",
        createdAt: new Date(),
      },
    });
    console.log(`✅ Payment created for ${intermediateUser.name} - ${intermediatePlanRef.name}`);
  }

  // Payment for Advanced Plan User
  const advancedPlanRef = createdPlans.find(p => p.slug === "advanced");
  if (advancedPlanRef) {
    await prisma.payment.upsert({
      where: { stripeSessionId: "test_session_advanced_user" },
      update: {},
      create: {
        userId: advancedUser.id,
        planId: advancedPlanRef.id,
        plan: advancedPlanRef.slug,
        amount: advancedPlanRef.price,
        status: "completed",
        stripeSessionId: "test_session_advanced_user",
        createdAt: new Date(),
      },
    });
    console.log(`✅ Payment created for ${advancedUser.name} - ${advancedPlanRef.name}`);
  }

  // Payments for additional clients
  for (let i = 0; i < createdClients.length; i++) {
    const client = createdClients[i];
    const plan = await prisma.plan.findUnique({ where: { slug: client.planSlug } });
    
    if (plan) {
      // Create a mix of completed and pending payments
      const statuses = ["completed", "completed", "completed", "pending", "failed"];
      const status = statuses[i % statuses.length];
      
      await prisma.payment.upsert({
        where: { 
          stripeSessionId: `test_session_${client.id}_${i}`,
        },
        update: {},
        create: {
          userId: client.id,
          planId: plan.id,
          plan: plan.slug,
          amount: plan.price,
          status,
          stripeSessionId: `test_session_${client.id}_${i}`,
          createdAt: new Date(2024, 10, Math.floor(Math.random() * 15) + 1), // Random date in November
        },
      });
      console.log(`✅ Payment (${status}) created for ${client.name} - ${plan.name}`);
    }
  }

  console.log("\n🌱 Seed completed successfully!");
  console.log("\n📝 Test credentials:");
  console.log("   🔑 SuperAdmin: admin@clivus.com.br / admin123");
  console.log("   👤 Cliente Básico: basico@teste.com / senha123");
  console.log("   ⭐ Cliente Intermediário: intermediario@teste.com / senha123");
  console.log("   👑 Cliente Avançado: avancado@teste.com / senha123");
  console.log("   📦 Cliente Teste (legado): teste@teste.com / senha123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

