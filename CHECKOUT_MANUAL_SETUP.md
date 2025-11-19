# 🛒 Guia DEFINITIVO - Configuração Manual do Checkout Asaas

## ⚠️ **IMPORTANTE: Este guia é para você fazer SOZINHO**

Este documento contém **TODOS OS PASSOS** necessários para configurar o checkout com o Asaas funcionando 100%. Siga **EXATAMENTE** como está descrito.

---

## 📋 **Índice**

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração da Conta Asaas](#2-configuração-da-conta-asaas)
3. [Obtenção das Credenciais](#3-obtenção-das-credenciais)
4. [Configuração no Servidor](#4-configuração-no-servidor)
5. [Configuração do Webhook](#5-configuração-do-webhook)
6. [Ativação do Gateway](#6-ativação-do-gateway)
7. [Testes](#7-testes)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Pré-requisitos

### ✅ **Checklist Inicial**
- [ ] Conta no Asaas criada (https://www.asaas.com)
- [ ] Conta verificada (CPF/CNPJ confirmado)
- [ ] Acesso ao servidor onde o Clivus está hospedado
- [ ] Acesso ao painel SuperAdmin do Clivus

---

## 2. Configuração da Conta Asaas

### **Passo 2.1: Criar/Acessar Conta**

1. Acesse: https://www.asaas.com
2. Faça login com suas credenciais
3. **IMPORTANTE:** Você verá dois ambientes:
   - 🟡 **Sandbox (Testes):** Para desenvolvimento
   - 🟢 **Produção:** Para vendas reais

### **Passo 2.2: Escolher Ambiente**

**Para testes:**
- Use o ambiente **Sandbox**
- URL: https://sandbox.asaas.com
- **Vantagem:** Não movimenta dinheiro real
- **Desvantagem:** Pagamentos precisam ser simulados manualmente

**Para produção:**
- Use o ambiente **Produção**
- URL: https://www.asaas.com
- **Vantagem:** Pagamentos reais
- **Desvantagem:** Taxa de 3,49% + R$ 0,49 por transação

### **Passo 2.3: Completar Cadastro (Produção)**

Se for usar **Produção**, você PRECISA:

1. Ir em: **Minha Conta** → **Dados Cadastrais**
2. Preencher:
   - Nome completo / Razão Social
   - CPF / CNPJ
   - Endereço completo
   - Telefone
   - Email
3. Enviar documentos (RG, CNH ou Contrato Social)
4. **Aguardar aprovação** (geralmente 1-2 dias úteis)

⚠️ **ATENÇÃO:** Sem aprovação, você NÃO pode receber pagamentos reais!

---

## 3. Obtenção das Credenciais

### **Passo 3.1: Gerar Token da API**

#### **Para Sandbox:**

1. Acesse: https://sandbox.asaas.com
2. Vá em: **Integrações** → **Chaves de API**
3. Clique em: **Gerar nova API Key**
4. **COPIE** o token gerado (começa com `$aact_YTU5YTE0M...`)
5. **IMPORTANTE:** Ele só aparece UMA VEZ! Guarde em local seguro!

#### **Para Produção:**

1. Acesse: https://www.asaas.com
2. Vá em: **Integrações** → **Chaves de API**
3. Clique em: **Gerar nova API Key**
4. **COPIE** o token gerado (começa com `$aact_prod_...`)
5. **IMPORTANTE:** Ele só aparece UMA VEZ! Guarde em local seguro!

### **Passo 3.2: Identificar o Tipo de Token**

```
SANDBOX:  $aact_YTU5YTE0M... (sem "prod")
PRODUÇÃO: $aact_prod_...     (com "prod")
```

---

## 4. Configuração no Servidor

### **Passo 4.1: Acessar o Servidor**

```bash
# Se estiver usando SSH
ssh seu_usuario@seu_servidor

# Vá para o diretório do projeto
cd /caminho/para/clivus_landing_page/nextjs_space
```

### **Passo 4.2: Editar o Arquivo .env**

```bash
# Abra o arquivo .env
nano .env
```

### **Passo 4.3: Configurar as Variáveis**

**Para Sandbox (Testes):**

```env
# Asaas Configuration (SANDBOX)
ASAAS_API_KEY=$aact_YTU5YTE0M... (seu token aqui, SEM aspas)
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_SECRET=asaas_webhook_secret_123 (pode ser qualquer string)
```

**Para Produção:**

```env
# Asaas Configuration (PRODUÇÃO)
ASAAS_API_KEY=$aact_prod_... (seu token aqui, SEM aspas)
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_SECRET=asaas_webhook_secret_xyz_super_secreto
```

⚠️ **REGRAS CRÍTICAS:**
- ✅ **SEM aspas duplas** ao redor do token
- ✅ **SEM aspas simples** ao redor do token
- ✅ **SEM barras invertidas** `\`
- ✅ **SEM espaços** antes ou depois do `=`

**CERTO:**
```env
ASAAS_API_KEY=$aact_prod_abc123
```

**ERRADO:**
```env
ASAAS_API_KEY="$aact_prod_abc123"   ❌
ASAAS_API_KEY='$aact_prod_abc123'   ❌
ASAAS_API_KEY=\$aact_prod_abc123    ❌
ASAAS_API_KEY = $aact_prod_abc123   ❌
```

### **Passo 4.4: Salvar e Reiniciar**

```bash
# Salvar no nano: Ctrl+O, Enter, Ctrl+X

# Reiniciar o servidor Next.js
pm2 restart all

# OU se não estiver usando PM2:
yarn build
yarn start
```

---

## 5. Configuração do Webhook

### **Passo 5.1: Obter a URL do Webhook**

Sua URL do webhook será:

**Para Produção:**
```
https://clivus.marcosleandru.com.br/api/webhook/asaas
```

**Para desenvolvimento local:**
```
http://localhost:3000/api/webhook/asaas
```

⚠️ **IMPORTANTE:** Para desenvolvimento local, você precisará usar **ngrok** ou similar para expor sua porta 3000 para internet.

### **Passo 5.2: Configurar no Painel Asaas**

#### **Para Sandbox:**

1. Acesse: https://sandbox.asaas.com
2. Vá em: **Integrações** → **Webhooks**
3. Clique em: **Configurar webhook**
4. Preencha:
   - **URL:** `https://clivus.marcosleandru.com.br/api/webhook/asaas`
   - **Eventos:** Marque TODOS os eventos de pagamento:
     - ✅ `PAYMENT_CREATED`
     - ✅ `PAYMENT_UPDATED`
     - ✅ `PAYMENT_CONFIRMED`
     - ✅ `PAYMENT_RECEIVED`
     - ✅ `PAYMENT_OVERDUE`
     - ✅ `PAYMENT_REFUNDED`
     - ✅ `PAYMENT_DELETED`
   - **Autenticação (Opcional):** Deixe em branco ou use o `ASAAS_WEBHOOK_SECRET` do `.env`
5. Clique em: **Salvar**

#### **Para Produção:**

Mesmo processo acima, mas em: https://www.asaas.com

### **Passo 5.3: Testar o Webhook**

1. No painel Asaas, vá em: **Integrações** → **Webhooks**
2. Clique em: **Testar**
3. Verifique se o status retornou **200 OK**
4. Se retornar erro, verifique:
   - A URL está correta?
   - O servidor está online?
   - O firewall permite requisições do Asaas?

---

## 6. Ativação do Gateway

### **Passo 6.1: Acessar o Painel SuperAdmin**

1. Acesse: https://clivus.marcosleandru.com.br/admin
2. Login:
   - **Email:** superadmin@clivus.com
   - **Senha:** superadmin123

### **Passo 6.2: Ativar o Gateway Asaas**

1. No menu lateral, clique em: **Gateways**
2. Localize o card: **Asaas**
3. Verifique se o **Toggle** está **ATIVADO** (verde)
4. Se estiver desativado, clique para ativar

### **Passo 6.3: Verificar Configuração**

1. Na mesma tela, verifique os campos:
   - **ASAAS_API_KEY:** Deve mostrar `$aact_***...` (parcialmente mascarado)
   - **ASAAS_ENVIRONMENT:** Deve mostrar `sandbox` ou `production`
   - **ASAAS_WEBHOOK_SECRET:** Deve mostrar `asaas_***...` (parcialmente mascarado)

2. Se algum campo estiver vazio:
   - Preencha manualmente (sem aspas!)
   - Clique em: **Salvar Configurações**
   - **REINICIE o servidor Next.js** (passo 4.4)

---

## 7. Testes

### **Teste 1: Verificar Gateway Ativo**

```bash
# No terminal do servidor:
curl https://clivus.marcosleandru.com.br/api/gateways/active
```

**Resposta esperada:**
```json
[
  {
    "name": "asaas",
    "displayName": "Asaas",
    "isEnabled": true
  }
]
```

Se `asaas` não aparecer, volte ao **Passo 6.2**.

---

### **Teste 2: Checkout Completo (Sandbox)**

1. **Logout** do SuperAdmin
2. Acesse: https://clivus.marcosleandru.com.br
3. Clique em: **QUERO COMPRAR AGORA**
4. Selecione um plano (ex: **Básico - R$ 97**)
5. Faça **login** com:
   - **Email:** cliente@teste.com
   - **Senha:** cliente123
   
   **OU** se não tiver conta, clique em: **Criar Conta**

6. Na página de checkout:
   - Você deve ver: **"Plano [Nome do Plano]"**
   - Valor correto (ex: R$ 97)
   - Botão: **"Confirmar Compra"**

7. Clique em: **Confirmar Compra**

8. **Aguarde** 2-5 segundos

9. Você será **redirecionado** para a página do Asaas

10. **Se estiver em Sandbox:**
    - Você verá uma tela de pagamento falsa
    - Pode escolher: PIX, Boleto, Cartão
    - **Para simular pagamento:**
      - Volte para o painel Asaas
      - Vá em: **Cobranças**
      - Encontre a cobrança criada
      - Clique em: **Marcar como pago**

11. **Se estiver em Produção:**
    - Você verá a tela real de pagamento
    - Complete o pagamento normalmente

---

### **Teste 3: Verificar Webhook (Após Pagamento)**

```bash
# No terminal do servidor, veja os logs:
pm2 logs --lines 100
```

**Procure por:**
```
[Asaas Webhook] Evento recebido: PAYMENT_RECEIVED
[Asaas Webhook] Pagamento aprovado, atualizando acesso do usuário
[Email] Email de boas-vindas enviado para: cliente@teste.com
```

Se você ver essas mensagens, **SUCESSO!** ✅

---

### **Teste 4: Verificar Acesso do Cliente**

1. Faça login como cliente (cliente@teste.com)
2. Você deve ser redirecionado para: `/dashboard`
3. Você deve ver:
   - Seu plano ativo no canto superior direito
   - Todas as funcionalidades disponíveis

---

## 8. Troubleshooting

### **Erro: "Erro ao processar pagamento com Asaas"**

**Causa 1:** Token inválido

**Solução:**
```bash
# 1. Verifique se o token está correto no .env
cat /caminho/para/clivus_landing_page/nextjs_space/.env | grep ASAAS_API_KEY

# 2. Teste o token diretamente:
curl -X GET "https://sandbox.asaas.com/api/v3/customers?offset=0&limit=10" \
  -H "access_token: SEU_TOKEN_AQUI"

# Se retornar erro 401, o token está errado!
```

**Causa 2:** CPF/CNPJ inválido

**Solução:**
- Se você criou um usuário de teste com CPF/CNPJ falso, o Asaas vai rejeitar
- **Opção 1:** Use CPF/CNPJ reais (válidos) no cadastro
- **Opção 2:** Deixe o campo vazio (o sistema vai criar o cliente sem CPF/CNPJ)

**Causa 3:** Ambiente errado

**Solução:**
```env
# Se seu token é de SANDBOX, use:
ASAAS_ENVIRONMENT=sandbox

# Se seu token é de PRODUÇÃO, use:
ASAAS_ENVIRONMENT=production
```

---

### **Erro: "Token Asaas não configurado"**

**Solução:**

1. Verifique o `.env`:
```bash
cat .env | grep ASAAS
```

2. Se estiver vazio ou com aspas, corrija:
```env
ASAAS_API_KEY=$aact_prod_...  (SEM ASPAS!)
```

3. Reinicie o servidor:
```bash
pm2 restart all
```

---

### **Erro: Redirecionamento não funciona**

**Causa:** `NEXT_PUBLIC_APP_URL` incorreto

**Solução:**
```env
# No .env, confirme:
NEXT_PUBLIC_APP_URL=https://clivus.marcosleandru.com.br
```

Reinicie o servidor.

---

### **Erro: Webhook não está sendo chamado**

**Diagnóstico:**

1. Acesse o painel Asaas → **Integrações** → **Webhooks**
2. Clique na sua configuração de webhook
3. Vá em: **Histórico de envio**
4. Verifique os últimos eventos:
   - **200 OK:** Funcionando ✅
   - **404 Not Found:** URL errada ❌
   - **500 Error:** Erro no servidor ❌
   - **Timeout:** Servidor offline ❌

**Soluções:**

- **404:** Confira a URL do webhook
- **500:** Verifique os logs do servidor (`pm2 logs`)
- **Timeout:** 
  - Servidor está online?
  - Firewall bloqueando?
  - Use: `curl https://clivus.marcosleandru.com.br/api/webhook/asaas`

---

### **Erro: Acesso não liberado após pagamento**

**Diagnóstico:**

```bash
# Veja os logs do webhook:
pm2 logs --lines 200 | grep "Asaas Webhook"
```

**Procure por:**
- `[Asaas Webhook] Payment não encontrado` → O `externalReference` está errado
- `[Asaas Webhook] Erro ao processar webhook` → Erro no servidor

**Solução:**

1. Acesse o banco de dados:
```bash
cd /caminho/para/clivus_landing_page/nextjs_space
npx prisma studio
```

2. Vá em: **Payment**
3. Encontre o pagamento do cliente
4. Verifique:
   - `status` → Deve estar `completed`
   - `externalReference` → Deve ter um ID válido

5. Se o status estiver `pending`:
   - Abra o registro
   - Mude manualmente para: `completed`
   - Salve

6. Vá em: **User**
7. Encontre o cliente
8. Mude: `hasAccess` para `true`
9. Salve

---

## 📊 **Checklist Final**

Antes de considerar a configuração completa, verifique:

- [ ] **.env configurado corretamente** (sem aspas!)
- [ ] **Servidor reiniciado** após mudanças no .env
- [ ] **Webhook configurado no Asaas** com URL correta
- [ ] **Gateway Asaas ativado** no painel SuperAdmin
- [ ] **Teste de checkout realizado** (sandbox ou produção)
- [ ] **Webhook recebendo eventos** (verifique logs)
- [ ] **Cliente recebeu acesso** após pagamento
- [ ] **Email de boas-vindas enviado** (se Resend configurado)

---

## 🎉 **Status de Sucesso**

Se você completou TODOS os passos e:

✅ O checkout redireciona para o Asaas  
✅ O pagamento é processado  
✅ O webhook é chamado  
✅ O cliente recebe acesso  
✅ O email é enviado

**PARABÉNS! O sistema está 100% funcional! 🚀**

---

## 📞 **Suporte Adicional**

Se ainda assim não funcionar, colete as seguintes informações:

1. **Logs do servidor:**
```bash
pm2 logs --lines 500 > logs.txt
```

2. **Conteúdo do .env (MASCARANDO o token):**
```bash
cat .env | grep ASAAS
```

3. **Histórico de webhooks** do painel Asaas (print screen)

4. **Mensagem de erro exata** que aparece no checkout

Envie para: suporte@clivus.com (ou contato do desenvolvedor)

---

**Data do Guia:** 19/11/2025  
**Versão:** 1.0 - Definitiva  
**Objetivo:** Configuração 100% manual e funcional do checkout Asaas
