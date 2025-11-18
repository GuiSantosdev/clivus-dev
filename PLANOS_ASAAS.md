
# 📦 Gerenciamento de Planos no Asaas

## ⚠️ IMPORTANTE: Planos NÃO São Criados Automaticamente

O sistema Clivus **NÃO cria planos automaticamente no Asaas**. Você precisa gerenciar os planos em dois lugares:

1. **Sistema Clivus** (SuperAdmin) - Define nome, preço e recursos
2. **Painel Asaas** (opcional) - Para cobranças recorrentes

---

## 🎯 Como o Sistema Funciona

### Fluxo de Pagamento Atual

```
Cliente escolhe plano no Clivus
        ↓
Sistema gera link de pagamento Asaas
        ↓
Cliente paga no Asaas (PIX/Boleto/Cartão)
        ↓
Webhook notifica o Clivus
        ↓
Sistema libera acesso automaticamente
```

**Observação:** O sistema usa **pagamento único** (one-time payment), não assinatura recorrente.

---

## 🔧 Gerenciamento de Planos

### No Sistema Clivus (SuperAdmin)

#### Acessar Gerenciamento de Planos

1. Login como SuperAdmin
2. Menu → **"Gerenciar Planos"**
3. Você verá os 3 planos padrão:
   - **Básico:** R$ 97
   - **Intermediário:** R$ 147
   - **Avançado:** R$ 297

#### Criar Novo Plano

1. Clique em **"Criar Novo Plano"**
2. Preencha:
   - **Nome:** Ex: "Premium"
   - **Slug:** Ex: "premium" (usado na URL)
   - **Preço:** Ex: 497
   - **Ordem:** Ex: 3 (ordem de exibição)
   - **Status:** Ativo
   - **Recursos:** Lista de funcionalidades
3. Clique em **"Salvar"**

#### Editar Plano Existente

1. Clique em **"Editar"** no plano desejado
2. Modifique campos necessários
3. Clique em **"Salvar"**

**⚠️ Atenção:** Mudanças no preço **NÃO afetam** clientes que já compraram.

#### Desativar Plano

1. Clique em **"Editar"**
2. Altere **"Status"** para **Inativo**
3. Clique em **"Salvar"**

**Efeito:** O plano não aparecerá mais na landing page, mas clientes existentes mantêm acesso.

---

## 💳 Integração com Asaas

### Pagamento Único (Padrão Atual)

O sistema usa `createAsaasPaymentLink()` que gera um link de pagamento único.

**Vantagens:**
- ✅ Não requer configuração de planos no Asaas
- ✅ Funciona com qualquer valor dinâmico
- ✅ Simples de implementar

**Desvantagens:**
- ⚠️ Não é recorrente (cliente paga 1 vez)
- ⚠️ Precisa gerenciar renovações manualmente

### Como Funciona

**No código (`lib/asaas.ts`):**
```typescript
export async function createAsaasPaymentLink({
  customerId,
  value,
  description,
  externalReference,
}: {...}) {
  // Cria cobrança única no Asaas
  // Retorna URL para pagamento
}
```

**No checkout (`app/api/checkout/route.ts`):**
```typescript
const paymentLink = await createAsaasPaymentLink({
  customerId: asaasCustomerId,
  value: plan.price, // Pega preço do banco do Clivus
  description: `${plan.name} - Clivus`,
  externalReference: payment.id,
});
```

**Resultado:** Link gerado dinamicamente com o preço do plano.

---

## 🔄 Assinaturas Recorrentes (Opcional)

Se você quiser implementar cobranças mensais/anuais, precisará:

### 1. Criar Planos no Asaas

1. Acesse https://www.asaas.com/
2. Vá em **Cobranças** → **Assinaturas**
3. Clique em **"Nova Assinatura"**
4. Configure:
   - **Nome:** Básico
   - **Valor:** R$ 97
   - **Periodicidade:** Mensal/Anual
   - **Recursos:** Descrição
5. Salve e copie o **ID do Plano**

### 2. Associar no Sistema Clivus

**Opção A:** Adicionar campo `asaasPlanId` no banco

1. Edite `prisma/schema.prisma`:
   ```prisma
   model Plan {
     // ... campos existentes
     asaasPlanId String? // ID do plano no Asaas
   }
   ```

2. Execute:
   ```bash
   yarn prisma db push
   ```

3. Atualize planos no admin para incluir `asaasPlanId`

**Opção B:** Mapear no código

```typescript
const PLAN_MAPPING = {
  basic: "asaas_plan_id_123",
  intermediate: "asaas_plan_id_456",
  advanced: "asaas_plan_id_789",
};
```

### 3. Modificar Checkout

Altere `app/api/checkout/route.ts` para usar assinaturas:

```typescript
// Criar assinatura ao invés de cobrança única
const subscription = await createAsaasSubscription({
  customerId: asaasCustomerId,
  planId: plan.asaasPlanId,
  externalReference: payment.id,
});
```

### 4. Gerenciar Renovações

**Com assinatura recorrente:**
- ✅ Asaas cobra automaticamente todo mês
- ✅ Webhook notifica sobre cada cobrança
- ✅ Sistema pode revogar acesso se pagamento falhar

**Você precisará:**
1. Adicionar lógica para cancelamento de assinatura
2. Tratar webhook `PAYMENT_OVERDUE` (atraso)
3. Implementar página de gerenciamento de assinatura

---

## 📊 Boas Práticas

### 1. Mantenha Sincronização

**Problema:** Preço no Clivus diferente do Asaas.

**Solução:**
- Use o preço do **Clivus** como fonte única de verdade
- Gere links de pagamento dinamicamente (não use planos fixos do Asaas)

### 2. Versionamento de Planos

**Problema:** Cliente comprou plano X por R$ 97, mas preço atual é R$ 147.

**Solução:**
- Armazene `purchasePrice` no registro de pagamento
- Mostre ao cliente o valor que ele pagou
- Nunca altere preços retroativamente

### 3. Migrações de Plano

**Se um cliente quiser trocar de plano:**

1. Calcule proporcional (opcional)
2. Crie novo pagamento com desconto
3. Atualize `Payment` para o novo plano
4. Envie email confirmando mudança

### 4. Planos Promocionais

**Para criar plano com desconto temporário:**

1. Crie plano novo: "Básico Black Friday"
2. Configure `startDate` e `endDate`
3. Preço promocional: R$ 67 (ao invés de R$ 97)
4. Após data fim, desative o plano

---

## 🔍 Troubleshooting

### ❌ Erro "Plano não encontrado"

**Causa:** Slug do plano não existe no banco.

**Solução:**
```sql
SELECT * FROM Plan WHERE slug = 'basic';
```

Se não existir, crie via admin ou rode `yarn prisma db seed`.

### ❌ Preço errado no checkout

**Causa:** Cache do navegador ou preço não atualizado.

**Solução:**
1. Verifique preço no banco: `SELECT price FROM Plan WHERE slug = 'basic'`
2. Limpe cache do navegador (Ctrl+Shift+R)
3. Verifique se API `/api/plans` retorna preço correto

### ❌ Cliente pagou mas não recebeu acesso

**Causa:** Webhook não foi recebido ou processado.

**Solução:**
1. Verifique logs do servidor
2. Verifique histórico de webhooks no painel Asaas
3. Reenvie credenciais manualmente em `/admin/clients`

---

## 🚀 Roadmap Futuro

### Funcionalidades Planejadas

1. **Assinaturas Recorrentes**
   - Cobrança mensal/anual automática
   - Cancelamento via interface do cliente

2. **Upgrades/Downgrades**
   - Cliente pode trocar de plano
   - Cálculo proporcional automático

3. **Períodos de Teste**
   - 7/14/30 dias gratuitos
   - Cobrança automática após trial

4. **Cupons de Desconto**
   - Códigos promocionais
   - Descontos percentuais ou fixos

5. **Planos Customizados**
   - Negociação direta com clientes
   - Preços e recursos personalizados

---

## ✅ Checklist de Configuração

### Configuração Básica (Atual)
- [ ] Planos criados no SuperAdmin do Clivus
- [ ] Preços definidos corretamente
- [ ] Recursos listados para cada plano
- [ ] Token Asaas configurado no `.env`
- [ ] Webhook Asaas configurado
- [ ] Teste de compra realizado com sucesso

### Assinaturas Recorrentes (Opcional)
- [ ] Planos criados no painel Asaas
- [ ] IDs dos planos copiados
- [ ] Campo `asaasPlanId` adicionado ao banco
- [ ] Código de checkout modificado para assinaturas
- [ ] Lógica de cancelamento implementada
- [ ] Webhook `SUBSCRIPTION_EXPIRED` tratado
- [ ] Teste de renovação automática realizado

---

## 📞 Suporte

### Problemas com Planos
- Verifique logs: `cd nextjs_space && yarn dev`
- Consulte: `ADMIN_SETUP.md` e `ASAAS_SETUP.md`

### Problemas com Asaas
- Docs: https://docs.asaas.com/
- Suporte: suporte@asaas.com

---

**Última atualização:** 18/11/2024  
**Versão do documento:** 1.0
