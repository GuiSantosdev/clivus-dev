# 📊 Sistema de Leads & Remarketing - Guia Completo

## 🎯 Visão Geral

O sistema agora possui um **gerenciamento completo de leads** com tracking de funil de vendas e remarketing automatizado.

---

## 📋 O Que Foi Implementado

### 1. **Novos Campos no Banco de Dados** ✅

Adicionados ao modelo `User`:

```prisma
leadStatus            String    @default("registered") // Status do lead
lastCheckoutAttempt   DateTime? // Última tentativa de compra
```

**Status possíveis:**
- `registered` → Cadastrou-se mas não tentou comprar
- `checkout_started` → Acessou a página de checkout
- `payment_pending` → Pagamento pendente no gateway
- `payment_failed` → Pagamento falhou
- `active` → Cliente ativo (hasAccess: true)
- `inactive` → Cliente inativo

---

### 2. **Nova Página: Leads & Remarketing** ✅

📍 **Localização:** `/admin/leads`

**Funcionalidades:**

#### **Estatísticas em Tempo Real:**
- 📊 **Total de Leads:** Soma de todos os leads (landing + cadastrados)
- 📧 **Landing Page:** Leads que preencheram o formulário
- ✏️ **Cadastrados:** Usuários que completaram o cadastro
- 🛒 **Checkout Iniciado:** Usuários que acessaram a página de checkout
- ⏱️ **Pagamento Pendente:** Aguardando confirmação do gateway

#### **Lista Unificada de Leads:**
Combina:
1. **Leads da Landing Page** (tabela `Lead`)
2. **Usuários Não Pagantes** (tabela `User` com `hasAccess: false`)

#### **Filtros Inteligentes:**
- 🔍 **Busca:** Por nome ou email
- 🎯 **Status:** Todos / Novos / Cadastrados / Checkout Iniciado / Pagamento Pendente

#### **Informações Detalhadas:**
Para cada lead:
- Nome e email
- CPF/CNPJ (se fornecido)
- Origem (Landing Page ou Cadastro Completo)
- Status atual
- Data de cadastro
- Última tentativa de checkout
- Status do último pagamento

#### **Ações:**
- 🗑️ **Excluir Lead:** Remove lead da landing page ou usuário não pagante

---

### 3. **Atualização: Gestão de Clientes** ✅

📍 **Localização:** `/admin/clients`

**Mudanças:**
- Agora mostra **APENAS clientes pagantes** (`hasAccess: true`)
- Título alterado para "Gestão de Clientes Pagantes"
- Link direto para a página de Leads & Remarketing

---

### 4. **Tracking Automático de Checkout** ✅

📍 **Localização:** `/api/checkout/route.ts`

**Comportamento:**
Quando um usuário acessa a página de checkout, o sistema **AUTOMATICAMENTE** atualiza:

```typescript
await prisma.user.update({
  where: { id: session.user.id },
  data: {
    lastCheckoutAttempt: new Date(),
    leadStatus: "checkout_started",
  },
});
```

**Benefício:** Permite identificar usuários com **alta intenção de compra** para campanhas de remarketing.

---

### 5. **Nova API: `/api/admin/leads`** ✅

#### **GET** - Listar Leads

**Retorna:**
```json
{
  "leads": [
    {
      "id": "...",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "source": "landing_page", // ou "cadastro"
      "status": "registered",
      "createdAt": "2025-11-19T...",
      "lastCheckoutAttempt": null,
      "type": "lead" // ou "user"
    }
  ],
  "stats": {
    "totalLeads": 45,
    "landingPageLeads": 20,
    "registeredUsers": 25,
    "checkoutStarted": 10,
    "paymentPending": 3
  }
}
```

#### **DELETE** - Excluir Lead

**Parâmetros:**
- `id`: ID do lead/usuário
- `type`: "lead" (landing page) ou "user" (cadastro)

---

## 🚀 Como Usar o Sistema

### **Para SuperAdmins:**

#### **1. Acessar Leads & Remarketing**
```
https://clivus.marcosleandru.com.br/admin/leads
```

Ou clique em "Leads & Remarketing" no menu lateral.

#### **2. Visualizar Funil de Vendas**
As estatísticas no topo mostram:
- Quantas pessoas entraram no funil (leads)
- Quantas se cadastraram
- Quantas iniciaram o checkout
- Quantas estão com pagamento pendente

#### **3. Identificar Oportunidades de Remarketing**

**🔥 Alta Prioridade (Checkout Iniciado):**
- Badge laranja "🛒 Checkout Iniciado"
- Usuário acessou a página de compra mas não concluiu
- **Ação:** Enviar email de lembrete urgente ou desconto especial

**⚠️ Média Prioridade (Cadastrados):**
- Badge amarelo "✏️ Cadastrado"
- Criou conta mas não tentou comprar
- **Ação:** Email explicando benefícios e oferecendo trial

**ℹ️ Baixa Prioridade (Novos Leads):**
- Badge azul "👤 Novo Lead"
- Apenas preencheu formulário da landing page
- **Ação:** Email de boas-vindas e conteúdo educativo

#### **4. Excluir Leads Inválidos**
- Clique no botão 🗑️ ao lado do lead
- Confirme a exclusão
- Lead será removido permanentemente

---

## 💡 Dicas de Remarketing

### **Por Status:**

#### **Novos Leads** (Landing Page)
- 📧 **Email 1:** Boas-vindas + Benefícios
- 📧 **Email 2 (3 dias):** Depoimentos de clientes
- 📧 **Email 3 (7 dias):** Última chance + Desconto

#### **Cadastrados** (Sem Checkout)
- 📧 **Email 1:** "Complete seu perfil e ganhe 10% OFF"
- 📧 **Email 2 (2 dias):** Tutorial rápido do sistema
- 📧 **Email 3 (5 dias):** Casos de sucesso

#### **Checkout Iniciado** (Alta Intenção)
- 📧 **Email 1 (1 hora):** "Você esqueceu algo no carrinho?"
- 📧 **Email 2 (24h):** Desconto especial de 15%
- 📧 **Email 3 (48h):** Última chance + Bônus exclusivo

#### **Pagamento Pendente**
- 📧 **Email 1 (6h):** Lembrete de pagamento pendente
- 📧 **Email 2 (24h):** Suporte para problemas de pagamento
- 💬 **WhatsApp (48h):** Contato direto para fechar venda

---

## 📊 Métricas Importantes

### **Taxa de Conversão do Funil:**
```
Taxa = (Clientes Pagantes / Total de Leads) × 100
```

**Exemplo:**
- 100 leads da landing page
- 60 cadastros completos (60% taxa landing → cadastro)
- 30 iniciaram checkout (50% taxa cadastro → checkout)
- 15 pagamentos concluídos (50% taxa checkout → pagamento)

**Taxa final:** 15/100 = **15% de conversão geral**

### **Indicadores de Saúde:**
- ✅ **> 40%** landing → cadastro = **Excelente**
- ✅ **> 30%** cadastro → checkout = **Muito bom**
- ✅ **> 40%** checkout → pagamento = **Ótimo**

---

## 🔧 Configurações Técnicas

### **Campos no Banco:**

```sql
-- User table
leadStatus VARCHAR DEFAULT 'registered'
lastCheckoutAttempt TIMESTAMP NULL

-- Valores possíveis para leadStatus:
-- 'registered', 'checkout_started', 'payment_pending', 
-- 'payment_failed', 'active', 'inactive'
```

### **Lógica de Atualização:**

```typescript
// Quando usuário acessa /checkout
user.lastCheckoutAttempt = now()
user.leadStatus = "checkout_started"

// Quando pagamento é aprovado (webhook)
user.hasAccess = true
user.leadStatus = "active"

// Quando pagamento falha
user.leadStatus = "payment_failed"
```

---

## 🎓 Boas Práticas

### **✅ DO:**
- Acompanhe métricas semanalmente
- Teste diferentes mensagens de remarketing
- Personalize emails com nome do lead
- Ofereça suporte proativo para "Checkout Iniciado"
- Use urgência e escassez com moderação

### **❌ DON'T:**
- Enviar spam (máximo 3 emails por status)
- Excluir leads muito cedo (aguarde 30 dias)
- Ignorar leads "antigos" (podem converter depois)
- Usar mesma mensagem para todos os status

---

## 🔄 Integração Futura (Sugestões)

### **Automação de Email:**
- Integrar com Mailchimp/SendGrid
- Criar sequências automáticas por status
- A/B testing de mensagens

### **WhatsApp Business API:**
- Mensagens automáticas para "Checkout Iniciado"
- Chatbot para dúvidas sobre pagamento

### **Analytics:**
- Dashboard com gráficos de funil
- Análise de tempo médio entre status
- ROI de campanhas de remarketing

---

## ✅ Status do Deploy

| Item | Status |
|------|--------|
| Schema Prisma atualizado | ✅ Concluído |
| API `/api/admin/leads` | ✅ Funcionando |
| Página `/admin/leads` | ✅ Deploy OK |
| Menu "Leads & Remarketing" | ✅ Adicionado |
| Tracking de checkout | ✅ Ativo |
| Página Clientes atualizada | ✅ Concluído |
| Deploy em produção | ✅ https://clivus.marcosleandru.com.br |

---

## 🎉 Pronto para Usar!

O sistema está **100% funcional** e pronto para:

1. **Capturar leads** da landing page
2. **Rastrear** o funil de vendas
3. **Identificar** oportunidades de remarketing
4. **Converter** mais leads em clientes pagantes

**Acesse agora:**
```
https://clivus.marcosleandru.com.br/admin/leads
```

Login SuperAdmin:
- **Email:** superadmin@clivus.com
- **Senha:** superadmin123

---

**Data:** 19/11/2025  
**Versão:** 1.0.0  
**Deploy:** ✅ Produção  
**Documentação:** Completa
