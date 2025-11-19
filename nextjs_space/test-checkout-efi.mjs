import dotenv from 'dotenv';
dotenv.config();

// Simular dados do usuário de teste
const testUser = {
  name: "Cliente Teste",
  email: "teste@teste.com",
  cpf: "111.111.111-11", // CPF inválido do usuário de teste
  cnpj: "" // Vazio
};

const testPlan = {
  name: "Plano Básico",
  price: 97
};

console.log("🧪 TESTE DE CHECKOUT COM EFI");
console.log("=====================================\n");

console.log("📋 Dados do teste:");
console.log("Usuario:", testUser.name);
console.log("Email:", testUser.email);
console.log("CPF:", testUser.cpf);
console.log("CNPJ:", testUser.cnpj);
console.log("Plano:", testPlan.name);
console.log("Valor:", `R$ ${testPlan.price}`);
console.log("\n=====================================\n");

// Função de validação CPF
function isValidCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;

  if (digit1 !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;

  return digit2 === parseInt(cpf.charAt(10));
}

// Validar CPF
const cpfClean = testUser.cpf.replace(/\D/g, "");
const cpfValid = isValidCPF(cpfClean);

console.log(`🔍 Validação do CPF "${testUser.cpf}":`);
console.log(`   CPF Limpo: ${cpfClean}`);
console.log(`   Comprimento: ${cpfClean.length}`);
console.log(`   Válido: ${cpfValid ? "✅ SIM" : "❌ NÃO"}`);

console.log("\n📝 Comportamento esperado:");
if (!cpfValid) {
  console.log("   ⚠️  CPF inválido será OMITIDO da requisição para EFI");
  console.log("   ✅ Cobrança deve ser criada apenas com nome e email");
} else {
  console.log("   ✅ CPF válido será INCLUÍDO na requisição para EFI");
}

console.log("\n=====================================\n");

// Testar criação da cobrança
const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_ENVIRONMENT = process.env.EFI_ENVIRONMENT || 'sandbox';

const baseUrl = EFI_ENVIRONMENT === 'production' 
  ? 'https://api.gerencianet.com.br/v1' 
  : 'https://sandbox.gerencianet.com.br/v1';

console.log("🔑 Obtendo token de acesso...");

try {
  // 1. Autenticar
  const authString = Buffer.from(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`).toString('base64');
  const authResponse = await fetch(`${baseUrl}/authorize`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ grant_type: 'client_credentials' })
  });

  if (!authResponse.ok) {
    const errorData = await authResponse.json();
    console.log("❌ Erro na autenticação:", errorData);
    process.exit(1);
  }

  const authData = await authResponse.json();
  const accessToken = authData.access_token;
  console.log("✅ Token obtido com sucesso!\n");

  // 2. Criar cobrança
  console.log("💳 Criando cobrança...");

  const chargeBody = {
    items: [
      {
        name: testPlan.name,
        amount: 1,
        value: testPlan.price * 100 // Em centavos
      }
    ],
    metadata: {
      custom_id: testPlan.name,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/efi`
    }
  };

  // Adicionar customer apenas se CPF for válido
  if (cpfValid && cpfClean.length === 11) {
    chargeBody.customer = {
      name: testUser.name,
      email: testUser.email,
      cpf: cpfClean
    };
    console.log("   Incluindo dados do cliente com CPF");
  } else {
    console.log("   CPF inválido - criando cobrança sem CPF");
  }

  console.log("\n📦 Payload da cobrança:");
  console.log(JSON.stringify(chargeBody, null, 2));

  const chargeResponse = await fetch(`${baseUrl}/charge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(chargeBody)
  });

  const chargeResponseText = await chargeResponse.text();
  console.log("\n📊 Status da resposta:", chargeResponse.status);
  console.log("📋 Resposta:");
  console.log(chargeResponseText);

  if (!chargeResponse.ok) {
    console.log("\n❌ ERRO AO CRIAR COBRANÇA");
    try {
      const errorData = JSON.parse(chargeResponseText);
      console.log("\n🔍 Detalhes do erro:");
      console.log(JSON.stringify(errorData, null, 2));
      
      if (errorData.message) {
        console.log("\n💡 Mensagem:", errorData.message);
      }
      if (errorData.error_description) {
        console.log("💡 Descrição:", errorData.error_description);
      }
    } catch (e) {
      console.log("Erro ao parsear resposta de erro");
    }
  } else {
    const chargeData = JSON.parse(chargeResponseText);
    console.log("\n✅ COBRANÇA CRIADA COM SUCESSO!");
    console.log("Charge ID:", chargeData.data.charge_id);
  }

} catch (error) {
  console.log("\n❌ Erro ao processar:");
  console.log(error.message);
  console.log(error.stack);
}
