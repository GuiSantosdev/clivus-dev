
# 🔐 Guia do SuperAdmin - Clivus

## Acesso ao Painel SuperAdmin

### Credenciais de Acesso
- **Email:** `superadmin@clivus.com`
- **Senha:** `superadmin123`

> ⚠️ **IMPORTANTE:** Altere esta senha imediatamente após o primeiro acesso!

---

## Diferença entre SuperAdmin e Cliente

### SuperAdmin (Você)
- **Função:** Gerenciar o negócio Clivus
- **Acesso a:**
  - Painel de Administração do Sistema
  - Gerenciar Planos (criar, editar, preços, features)
  - Gestão de Vendas (visualizar todas as vendas e transações)
  - Gerenciar Usuários do Sistema
  - Reenviar credenciais de acesso
  - Estatísticas do negócio

### Cliente (Usuário Normal)
- **Função:** Usar a ferramenta Clivus para gerenciar suas finanças
- **Acesso a:**
  - Dashboard pessoal
  - Transações CPF/CNPJ
  - Relatórios financeiros
  - Pró-labore
  - Compliance Fiscal
  - Investimentos
  - Gestão de Equipe (própria)

---

## Menu do SuperAdmin

### 1. Painel Admin (`/admin`)
- Visão geral do sistema
- Estatísticas de usuários e vendas
- Lista de todos os usuários cadastrados

### 2. Gerenciar Planos (`/admin/plans`)
- Criar novos planos de assinatura
- Editar planos existentes
- Definir preços e features
- Ativar/desativar planos
- Reordenar planos na landing page

### 3. Gestão de Vendas (`/admin/sales`)
- Visualizar todas as vendas realizadas
- Filtrar por status (completado, pendente, falho)
- Ver detalhes de cada transação
- Reenviar credenciais de acesso para clientes
- Estatísticas de faturamento

### 4. Usuários do Sistema
- Gerenciar todos os usuários
- Ver informações de cada cliente
- Controlar acesso ao sistema

---

## Como Funciona o Sistema

### Fluxo de Compra do Cliente
1. Cliente visita landing page → `https://seu-dominio.com`
2. Cliente escolhe um plano
3. Cliente é redirecionado para checkout
4. Stripe processa o pagamento
5. Sistema automaticamente:
   - Cria conta do cliente
   - Gera senha temporária
   - Envia email com credenciais
   - Libera acesso ao dashboard

### Suas Responsabilidades
- Configurar payment gateways (Stripe, Mercado Pago, etc.)
- Gerenciar planos e preços
- Monitorar vendas e faturamento
- Dar suporte aos clientes quando necessário
- Reenviar credenciais caso o cliente não receba

---

## Primeiros Passos

1. **Login como SuperAdmin**
   ```
   Email: superadmin@clivus.com
   Senha: superadmin123
   ```

2. **Altere sua senha**
   - Vá em configurações (quando implementado)
   - Ou use o banco de dados diretamente

3. **Configure os Planos**
   - Acesse `/admin/plans`
   - Edite os planos conforme sua estratégia de preço
   - Adicione/remova features

4. **Configure Payment Gateway**
   - Configure Stripe seguindo o `ADMIN_SETUP.md`
   - Adicione as chaves no arquivo `.env`

5. **Teste uma Venda**
   - Use cartão de teste do Stripe
   - Verifique se o email de boas-vindas é enviado
   - Confirme que o cliente recebe acesso

---

## Suporte e Manutenção

### Usuário não recebeu credenciais?
1. Acesse `/admin/sales`
2. Encontre a venda do cliente
3. Clique em "Reenviar Credenciais"
4. Sistema gera nova senha e envia email

### Como adicionar novo plano?
1. Acesse `/admin/plans`
2. Clique em "Novo Plano"
3. Preencha: nome, slug, preço, features
4. Defina a ordem de exibição
5. Ative o plano
6. O plano aparece automaticamente na landing page

### Como editar preços?
1. Acesse `/admin/plans`
2. Clique em "Editar" no plano desejado
3. Altere o preço
4. Salve
5. Mudança reflete imediatamente no site

---

## Segurança

### Proteção de Rotas
- Todas as rotas `/admin/*` são protegidas
- Apenas usuários com `role: "superadmin"` têm acesso
- Clientes normais são redirecionados automaticamente

### Boas Práticas
- ✅ Altere a senha padrão imediatamente
- ✅ Use senha forte (letras, números, símbolos)
- ✅ Não compartilhe suas credenciais
- ✅ Mantenha o `.env` seguro e privado
- ✅ Configure backup regular do banco de dados

---

## Atualizações Futuras

### Em Desenvolvimento
- [ ] Sistema de notificações
- [ ] Relatórios avançados de vendas
- [ ] Integração com Mercado Pago
- [ ] Integração com ASAAS
- [ ] Integração com CORA
- [ ] Dashboard de analytics
- [ ] Sistema de cupons de desconto
- [ ] Planos recorrentes (mensalidade)

---

## Arquitetura do Sistema

```
Clivus System
│
├── Landing Page (/)
│   ├── Hero Section
│   ├── VSL Section
│   ├── Problem Section
│   ├── Features Section
│   ├── Testimonials
│   ├── Offer Section (Planos)
│   └── Lead Form
│
├── Checkout (/checkout)
│   └── Stripe Payment
│
├── Cliente Dashboard (/dashboard, /transactions, etc.)
│   ├── Role: "user"
│   ├── hasAccess: true
│   └── Menu: Finanças Pessoais
│
└── SuperAdmin Panel (/admin/*)
    ├── Role: "superadmin"
    ├── hasAccess: true
    └── Menu: Gestão do Negócio
        ├── /admin - Overview
        ├── /admin/plans - Planos
        └── /admin/sales - Vendas
```

---

## Contato

Para dúvidas sobre desenvolvimento ou personalização do sistema, consulte a documentação técnica em `ADMIN_SETUP.md`.

**Data de Criação:** Novembro 2025  
**Versão:** 1.0  
**Sistema:** Clivus - Separação de Finanças PF e PJ
