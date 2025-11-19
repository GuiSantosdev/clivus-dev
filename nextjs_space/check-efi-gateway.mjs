import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEfiGateway() {
  try {
    console.log('🔍 Verificando status do gateway EFI...\n');
    
    // Buscar gateway EFI no banco
    const efiGateway = await prisma.gateway.findUnique({
      where: { name: 'efi' }
    });
    
    if (!efiGateway) {
      console.log('❌ Gateway EFI NÃO ENCONTRADO no banco de dados');
      console.log('📝 Criando gateway EFI...');
      
      const newGateway = await prisma.gateway.create({
        data: {
          name: 'efi',
          displayName: 'EFI (Gerencianet)',
          isEnabled: true
        }
      });
      
      console.log('✅ Gateway EFI criado com sucesso:', newGateway);
    } else {
      console.log('✅ Gateway EFI encontrado:');
      console.log('   - Nome:', efiGateway.name);
      console.log('   - Nome de exibição:', efiGateway.displayName);
      console.log('   - Habilitado:', efiGateway.isEnabled ? '🟢 SIM' : '🔴 NÃO');
      console.log('   - Criado em:', efiGateway.createdAt);
      console.log('   - Atualizado em:', efiGateway.updatedAt);
      
      if (!efiGateway.isEnabled) {
        console.log('\n⚠️  ATENÇÃO: Gateway está DESABILITADO!');
        console.log('📝 Habilitando gateway EFI...');
        
        const updatedGateway = await prisma.gateway.update({
          where: { name: 'efi' },
          data: { isEnabled: true }
        });
        
        console.log('✅ Gateway EFI habilitado com sucesso!');
      }
    }
    
    // Verificar variáveis de ambiente
    console.log('\n🔑 Verificando variáveis de ambiente:');
    console.log('   - EFI_CLIENT_ID:', process.env.EFI_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
    console.log('   - EFI_CLIENT_SECRET:', process.env.EFI_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado');
    console.log('   - EFI_ENVIRONMENT:', process.env.EFI_ENVIRONMENT || '❌ Não configurado');
    console.log('   - EFI_WEBHOOK_SECRET:', process.env.EFI_WEBHOOK_SECRET ? '✅ Configurado' : '❌ Não configurado');
    
    // Listar todos os gateways
    console.log('\n📋 Todos os gateways cadastrados:');
    const allGateways = await prisma.gateway.findMany({
      orderBy: { name: 'asc' }
    });
    
    for (const gw of allGateways) {
      const status = gw.isEnabled ? '🟢 ATIVO' : '🔴 INATIVO';
      console.log(`   ${status} - ${gw.displayName} (${gw.name})`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEfiGateway();
