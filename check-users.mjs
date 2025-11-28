import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("🔍 Verificando usuários no banco...\n");
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      cpf: true,
      cnpj: true,
      hasAccess: true,
    }
  });
  
  if (users.length === 0) {
    console.log("⚠️ Nenhum usuário encontrado no banco!");
    console.log("\n💡 Rode o seed para criar usuários de teste:");
    console.log("   cd /home/ubuntu/clivus_landing_page/nextjs_space");
    console.log("   yarn prisma db seed");
    return;
  }
  
  console.log(`📊 ${users.length} usuário(s) encontrado(s):\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - CPF: ${user.cpf || 'Não informado'}`);
    console.log(`   - CNPJ: ${user.cnpj || 'Não informado'}`);
    console.log(`   - Acesso: ${user.hasAccess ? 'Sim ✅' : 'Não ❌'}`);
    console.log('');
  });
}

checkUsers()
  .then(() => {
    console.log("✅ Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
