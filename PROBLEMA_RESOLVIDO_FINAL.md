# 🎯 PROBLEMA RESOLVIDO - Erro Asaas Checkout

## 📋 Resumo do Problema

**Erro Apresentado:**
```
"Erro ao processar pagamento com Asaas"
HTTP 500 (Internal Server Error)
```

**Causa Raiz Identificada:**
O Asaas estava **rejeitando** a criação de clientes porque os CPF/CNPJs enviados eram **inválidos** (não passavam na validação de dígitos verificadores).

---

## 🔍 Diagnóstico Detalhado

### 1. O Que Foi Testado

✅ **Gateway Asaas no Banco**: ATIVO e configurado corretamente
✅ **Token da API Asaas**: Presente e FUNCIONANDO (Status 200)
✅ **Planos no Sistema**: 3 planos disponíveis (Básico, Intermediário, Avançado)
❌ **Validação de CPF/CNPJ**: Código antigo só verificava o **comprimento** (11 ou 14 dígitos)

### 2. Erro Específico do Asaas

Ao tentar criar um cliente com CPF "111.111.111-11" (comum em dados de teste):

```json
{
  "errors": [
    {
      "code": "invalid_object",
      "description": "O CPF/CNPJ informado é inválido."
    }
  ]
}
```

**Motivo:** O Asaas valida os **dígitos verificadores** do CPF/CNPJ, e os dados de teste não passavam nessa validação.

---

## ✅ Solução Implementada

### 1. Nova Função de Validação (`lib/asaas.ts`)

Implementamos validação **rigorosa** de CPF/CNPJ com verificação de dígitos:

```typescript
export function validateCpfCnpj(value: string): { valid: boolean; cleaned: string } {
  const cleaned = value.replace(/\D/g, "");
  
  if (cleaned.length === 11) {
    return { valid: isValidCPF(cleaned), cleaned };
  } else if (cleaned.length === 14) {
    return { valid: isValidCNPJ(cleaned), cleaned };
  }
  
  return { valid: false, cleaned };
}
```

**Validações Implementadas:**
- ✅ Verificação de comprimento (11 para CPF, 14 para CNPJ)
- ✅ Rejeição de sequências repetidas (111.111.111-11, etc.)
- ✅ Cálculo e validação de dígitos verificadores
- ✅ Algoritmos oficiais de CPF e CNPJ

### 2. Atualização do Checkout (`app/api/checkout/route.ts`)

O código do checkout agora:

```typescript
// Validar CPF/CNPJ com dígitos verificadores
const cpfCnpj = user?.cpf || user?.cnpj || "";
const validation = validateCpfCnpj(cpfCnpj);

console.log("🔍 [Checkout API] Validando CPF/CNPJ:", { 
  original: cpfCnpj,
  cleaned: validation.cleaned,
  valid: validation.valid,
  message: validation.valid 
    ? "CPF/CNPJ válido - SERÁ ENVIADO ao Asaas" 
    : "CPF/CNPJ inválido ou vazio - NÃO SERÁ ENVIADO ao Asaas"
});

const asaasCustomerId = await createOrGetAsaasCustomer({
  name: userName,
  email: userEmail,
  cpfCnpj: validation.valid ? validation.cleaned : undefined, // Só envia se válido!
});
```

**Comportamento Novo:**
- ✅ Se CPF/CNPJ é **válido**: Envia para o Asaas
- ✅ Se CPF/CNPJ é **inválido ou vazio**: Cria cliente **sem** CPF/CNPJ (permitido pelo Asaas)
- ✅ Logs detalhados para debug futuro

---

## 🧪 Como Testar

### 1. Para Usuários COM CPF/CNPJ Válido

1. Faça login com um usuário que tenha CPF/CNPJ real
2. Acesse: https://clivus.marcosleandru.com.br/checkout?plan=basic
3. Clique em "Confirmar Compra"
4. **Resultado Esperado:** Redireciona para o pagamento Asaas com sucesso ✅

### 2. Para Usuários SEM CPF/CNPJ ou Com CPF/CNPJ Inválido

1. Faça login (ou crie uma conta nova **sem** preencher CPF/CNPJ)
2. Acesse: https://clivus.marcosleandru.com.br/checkout?plan=basic
3. Clique em "Confirmar Compra"
4. **Resultado Esperado:** Redireciona para o pagamento Asaas com sucesso ✅

---

## 📊 Status Atual

| Item | Status |
|------|--------|
| ✅ Build/Compilação | Sucesso |
| ✅ Deploy em Produção | Concluído |
| ✅ Validação de CPF/CNPJ | Implementada |
| ✅ Logs Detalhados | Adicionados |
| ✅ Checkout com CPF/CNPJ Válido | Funcionando |
| ✅ Checkout sem CPF/CNPJ | Funcionando |

---

## 🔐 Sobre CPF/CNPJ no Sistema

### Quando CPF/CNPJ é Obrigatório?

❌ **NO CADASTRO**: CPF/CNPJ **NÃO** são obrigatórios para criar conta
✅ **NO ASAAS**: Será enviado **APENAS** se for um CPF/CNPJ válido

### Recomendação para Produção

Para **facilitar o uso** e **aumentar conversões**, recomendamos:

1. **Manter CPF/CNPJ opcional** no cadastro
2. **Solicitar CPF/CNPJ válido** apenas quando necessário:
   - Emissão de nota fiscal
   - Relatórios fiscais
   - Comprovantes contábeis

---

## 📝 Logs para Debug

O sistema agora gera logs detalhados no console do servidor:

```
🛒 [Checkout API] Iniciando processamento...
👤 [Checkout API] Sessão: { temSessao: true, userEmail: 'usuario@email.com' }
📦 [Checkout API] Plano encontrado: { nome: 'Básico', preco: 97 }
🔍 [Checkout API] Validando CPF/CNPJ: {
  original: '123.456.789-10',
  cleaned: '12345678910',
  valid: false,
  message: 'CPF/CNPJ inválido ou vazio - NÃO SERÁ ENVIADO ao Asaas'
}
✅ [Checkout API] Cliente Asaas: cus_000149081399
✅ [Checkout API] Link criado: { id: 'pay_...' }
🎉 [Checkout API] Checkout concluído com sucesso!
```

---

## 🎉 Conclusão

O problema está **RESOLVIDO**! 

**O checkout agora funciona para:**
- ✅ Usuários com CPF/CNPJ válido
- ✅ Usuários sem CPF/CNPJ
- ✅ Usuários com CPF/CNPJ inválido (cria cliente sem enviar o documento)

**Deploy realizado em:** 19/11/2025
**URL:** https://clivus.marcosleandru.com.br

---

## 📞 Dúvidas ou Problemas?

Se você continuar tendo problemas:

1. **Limpe o cache do navegador** (Cmd+Shift+R no Mac)
2. **Faça logout e login novamente**
3. **Tente com um email novo** (evita conflitos de sessão)
4. **Verifique os logs do Console** (Cmd+Option+J no Chrome/Mac)

Se o erro persistir, me envie:
- Print da tela com o erro
- Logs do Console (F12 → Console)
- Email usado para login
