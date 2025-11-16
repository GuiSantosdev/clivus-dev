
# 🎯 Guia de Configuração do Painel Admin - Clivus

Este guia completo te ajudará a configurar todos os aspectos administrativos da plataforma Clivus.

## 📋 Índice

1. [Acesso ao Painel Admin](#acesso-ao-painel-admin)
2. [Configuração de Gateways de Pagamento](#configuração-de-gateways-de-pagamento)
3. [Sistema de E-mails](#sistema-de-e-mails)
4. [Gerenciamento de Planos](#gerenciamento-de-planos)
5. [Gestão de Vendas](#gestão-de-vendas)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## 🔐 Acesso ao Painel Admin

### Credenciais Padrão

```
Email: john@doe.com
Senha: johndoe123
```

⚠️ **IMPORTANTE:** Altere estas credenciais após o primeiro acesso!

### Estrutura do Painel

- **Dashboard Principal**: `/admin`
- **Gestão de Vendas**: `/admin/sales`
- **Gerenciamento de Planos**: `/admin/plans`

---

## 💳 Configuração de Gateways de Pagamento

### 1. Stripe (Configurado por padrão)

#### Passo 1: Criar conta Stripe
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta ou faça login
3. Ative o modo de teste

#### Passo 2: Obter as chaves da API
1. Acesse **Developers → API Keys**
2. Copie:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

#### Passo 3: Configurar Webhook
1. Acesse **Developers → Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://seu-dominio.com/api/webhook`
4. Eventos a escutar:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Copie o **Signing secret** (whsec_...)

#### Passo 4: Adicionar no .env

```env
STRIPE_SECRET_KEY="sk_test_SUA_CHAVE_SECRETA"
STRIPE_PUBLISHABLE_KEY="pk_test_SUA_CHAVE_PUBLICA"
STRIPE_WEBHOOK_SECRET="whsec_SEU_WEBHOOK_SECRET"
```

### 2. Mercado Pago (Em desenvolvimento)

🚧 **Status:** Integração planejada para próxima versão

**Funcionalidades previstas:**
- Checkout transparente
- Pix instantâneo
- Parcelamento no cartão
- Boleto bancário

### 3. ASAAS (Em desenvolvimento)

🚧 **Status:** Integração planejada para próxima versão

**Funcionalidades previstas:**
- Cobrança recorrente
- Split de pagamentos
- Gateway brasileiro

### 4. CORA (Em desenvolvimento)

🚧 **Status:** Integração planejada para próxima versão

**Funcionalidades previstas:**
- Transferências instantâneas
- Banking as a Service

---

## 📧 Sistema de E-mails

### Configuração do Resend

#### Passo 1: Criar conta Resend
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita (100 emails/dia)

#### Passo 2: Obter API Key
1. Acesse **API Keys**
2. Crie uma nova chave
3. Copie a chave (re_...)

#### Passo 3: Configurar domínio (Opcional)
1. Acesse **Domains**
2. Adicione seu domínio
3. Configure os registros DNS (SPF, DKIM, DMARC)

#### Passo 4: Adicionar no .env

```env
RESEND_API_KEY="re_SUA_CHAVE_AQUI"
EMAIL_FROM="Clivus <noreply@seudominio.com.br>"
ADMIN_EMAIL="admin@seudominio.com.br"
```

### E-mails Automáticos

O sistema envia automaticamente:

1. **E-mail de Boas-Vindas** (após compra):
   - Dados de acesso (email + senha temporária)
   - Link para a plataforma
   - Instruções de primeiro acesso

2. **Notificação ao Admin** (após cada venda):
   - Nome do cliente
   - Plano adquirido
   - Valor da venda

### Reenvio Manual de Credenciais

Na página **Gestão de Vendas** (`/admin/sales`):
1. Localize o pagamento concluído
2. Clique em **"Reenviar Credenciais"**
3. Um novo e-mail será enviado ao cliente

---

## 📦 Gerenciamento de Planos

### Criar Novo Plano

1. Acesse `/admin/plans`
2. Clique em **"Criar Novo Plano"**
3. Preencha:
   - **Nome**: Ex: Premium
   - **Slug**: Ex: premium (único, sem espaços)
   - **Preço**: Ex: 497.00
   - **Ordem**: Define posição na LP (0, 1, 2...)
   - **Funcionalidades**: Uma por linha
   - **Status**: Marque "Ativo" para exibir na LP

### Editar Plano Existente

1. Clique no ícone de **lápis** ao lado do plano
2. Faça as alterações
3. Clique em **"Salvar"**

### Desativar Plano (sem excluir)

1. Edite o plano
2. Desmarque **"Plano Ativo"**
3. O plano fica oculto na LP mas mantém dados

### Ordem de Exibição na LP

- **Ordem 0**: Primeiro plano (Azul)
- **Ordem 1**: Segundo plano (Verde - Mais Popular)
- **Ordem 2**: Terceiro plano (Roxo)

### Atualização Automática na LP

✅ **Todas as alterações** nos planos são refletidas **automaticamente** na Landing Page em tempo real.

---

## 💰 Gestão de Vendas

### Dashboard de Vendas (`/admin/sales`)

#### Estatísticas Principais

- **Total de Vendas**: Todas as transações
- **Receita Total**: Soma dos pagamentos concluídos
- **Vendas Concluídas**: Pagamentos confirmados
- **Pendentes**: Aguardando confirmação

#### Filtros Disponíveis

- **Todas**: Visualizar todas as vendas
- **Concluídas**: Apenas pagamentos confirmados
- **Pendentes**: Aguardando pagamento
- **Falhadas**: Pagamentos que não foram concluídos

#### Ações Disponíveis

1. **Reenviar Credenciais**
   - Disponível para pagamentos concluídos
   - Gera nova senha temporária
   - Envia e-mail automático

2. **Visualizar Detalhes**
   - Cliente (nome e email)
   - Plano adquirido
   - Valor pago
   - Status do pagamento
   - Gateway utilizado
   - Data da transação

---

## 🔧 Variáveis de Ambiente

### Arquivo `.env`

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="seu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 (Cloud Storage)
AWS_PROFILE=hosted_storage
AWS_REGION=us-west-2
AWS_BUCKET_NAME=seu-bucket
AWS_FOLDER_PREFIX=seu-folder/

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Clivus <noreply@seudominio.com>"
ADMIN_EMAIL="admin@seudominio.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Ambientes

- **Desenvolvimento**: Use chaves de teste (`sk_test_`, `pk_test_`)
- **Produção**: Use chaves live (`sk_live_`, `pk_live_`)

---

## 🚀 Próximos Passos

### Após Configuração Inicial

1. ✅ Alterar credenciais de admin
2. ✅ Configurar Stripe (teste)
3. ✅ Configurar Resend
4. ✅ Testar fluxo de compra completo
5. ✅ Verificar recebimento de e-mails
6. ✅ Criar planos personalizados

### Antes do Lançamento

1. 🔒 Mudar para chaves LIVE do Stripe
2. 🌐 Configurar domínio próprio no Resend
3. 📊 Configurar Google Analytics
4. 💳 Adicionar outros gateways (opcional)
5. 📧 Personalizar templates de e-mail
6. 🎨 Ajustar logos e cores

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

- 📧 **Email**: suporte@clivus.com.br
- 📚 **Documentação**: [docs.clivus.com.br](https://docs.clivus.com.br)
- 💬 **WhatsApp**: (11) 99999-9999

---

## 🔄 Changelog

### v1.0.0 (Atual)
- ✅ Sistema de autenticação
- ✅ Gerenciamento de planos dinâmico
- ✅ Integração com Stripe
- ✅ Envio automático de credenciais por e-mail
- ✅ Dashboard de vendas completo
- ✅ Painel admin robusto

### Planejado para v1.1.0
- 🚧 Integração Mercado Pago
- 🚧 Integração ASAAS
- 🚧 Relatórios avançados
- 🚧 Exportação de dados

---

**Clivus** - Ferramenta Financeira Completa para Empreendedores
