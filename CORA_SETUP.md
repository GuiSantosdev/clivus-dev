# 🏦 Guia de Configuração do CORA - Gateway de Pagamento

## ⚠️ **IMPORTANTE: Integração CORA no Clivus**

O **CORA** é um banco brasileiro que oferece **emissão de boletos registrados** com **QR Code PIX integrado**, permitindo que seus clientes paguem de duas formas:
- 📄 **Boleto** (código de barras tradicional)
- 💰 **PIX** (via QR Code no próprio boleto)

---

## 📋 **Índice**

1. [Pré-requisitos](#1-pré-requisitos)
2. [Criação da Conta CORA](#2-criação-da-conta-cora)
3. [Obtenção das Credenciais](#3-obtenção-das-credenciais)
4. [Configuração no Servidor](#4-configuração-no-servidor)
5. [Configuração do Webhook](#5-configuração-do-webhook)
6. [Ativação do Gateway](#6-ativação-do-gateway)
7. [Testes](#7-testes)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Pré-requisitos

### ✅ **Checklist Inicial**
- [ ] Conta no CORA criada (https://www.cora.com.br)
- [ ] Plano **CoraPro** (R$ 44,90/mês) contratado para acesso à API
- [ ] CPF/CNPJ válido (necessário para emissão de boletos)
- [ ] Acesso ao servidor onde o Clivus está hospedado
- [ ] Acesso ao painel SuperAdmin do Clivus

---

## 2. Criação da Conta CORA

### **Passo 2.1: Criar Conta**

1. Acesse: https://www.cora.com.br
2. Clique em **"Abrir Conta"**
3. Preencha seus dados:
   - Nome completo / Razão Social
   - CPF / CNPJ
   - Email
   - Telefone
   - Endereço completo
4. Aguarde aprovação da conta (geralmente 1-3 dias úteis)

### **Passo 2.2: Contratar o Plano CoraPro**

**⚠️ OBRIGATÓRIO:** Para usar as APIs, você precisa do plano **CoraPro**.

1. Acesse sua conta CORA
2. Vá em: **Planos** ou **Configurações**
3. Contrate o plano **CoraPro** (R$ 44,90/mês)
4. Aguarde ativação (geralmente instantâneo)

### **Passo 2.3: Escolher Ambiente**

**Para testes:**
- Use o ambiente **Stage** (Sandbox)
- URL: https://api.stage.cora.com.br
- **Vantagem:** Não movimenta dinheiro real
- **Desvantagem:** Boletos precisam ser marcados como pagos manualmente

**Para produção:**
- Use o ambiente **Produção**
- URL: https://api.cora.com.br
- **Vantagem:** Pagamentos reais
- **Desvantagem:** Taxas aplicadas (ver seção "Custos")

---

## 3. Obtenção das Credenciais

### **Passo 3.1: Gerar Client ID e API Key**

#### **Para Stage (Testes):**

1. Acesse sua conta CORA: https://stage.cora.com.br
2. Vá em: **Conta** → **Integrações via APIs**
3. Clique em: **Gerar Credenciais**
4. **COPIE** os seguintes dados:
   - **Client ID** (ex: `cora_client_id_stage_...`)
   - **Client Secret** (ex: `cora_secret_stage_...`)
5. **IMPORTANTE:** Guarde em local seguro! Eles só aparecem UMA VEZ!

#### **Para Produção:**

1. Acesse sua conta CORA: https://www.cora.com.br
2. Vá em: **Conta** → **Integrações via APIs**
3. Clique em: **Gerar Credenciais de Produção**
4. **COPIE** os seguintes dados:
   - **Client ID** (ex: `cora_client_id_prod_...`)
   - **Client Secret** (ex: `cora_secret_prod_...`)
5. **IMPORTANTE:** Guarde em local seguro!

### **Passo 3.2: Identificar o Tipo de Credencial**

```
STAGE (Sandbox):  cora_client_id_stage_...
PRODUÇÃO:         cora_client_id_prod_...
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

**Para Stage (Testes):**

```env
# CORA Configuration (STAGE)
CORA_API_KEY=cora_client_id_stage_... (seu Client ID aqui, SEM aspas)
CORA_ENVIRONMENT=sandbox
CORA_WEBHOOK_SECRET=cora_webhook_secret_123 (pode ser qualquer string)
```

**Para Produção:**

```env
# CORA Configuration (PRODUÇÃO)
CORA_API_KEY=cora_client_id_prod_... (seu Client ID aqui, SEM aspas)
CORA_ENVIRONMENT=production
CORA_WEBHOOK_SECRET=cora_webhook_secret_xyz_super_secreto
```

⚠️ **REGRAS CRÍTICAS:**
- ✅ **SEM aspas duplas** ao redor do Client ID
- ✅ **SEM aspas simples** ao redor do Client ID
- ✅ **SEM espaços** antes ou depois do `=`

**CERTO:**
```env
CORA_API_KEY=cora_client_id_prod_abc123
```

**ERRADO:**
```env
CORA_API_KEY="cora_client_id_prod_abc123"   ❌
CORA_API_KEY='cora_client_id_prod_abc123'   ❌
CORA_API_KEY = cora_client_id_prod_abc123   ❌
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
https://clivus.marcosleandru.com.br/api/webhook/cora
```

**Para desenvolvimento local:**
```
http://localhost:3000/api/webhook/cora
```

⚠️ **IMPORTANTE:** Para desenvolvimento local, você precisará usar **ngrok** ou similar para expor sua porta 3000 para internet.

### **Passo 5.2: Configurar no Painel CORA**

#### **Para Stage:**

1. Acesse: https://stage.cora.com.br
2. Vá em: **Conta** → **Integrações** → **Webhooks**
3. Clique em: **Configurar webhook**
4. Preencha:
   - **URL:** `https://clivus.marcosleandru.com.br/api/webhook/cora`
   - **Eventos:** Marque os eventos:
     - ✅ `invoice.paid` (Boleto pago)
     - ✅ `invoice.expired` (Boleto vencido)
     - ✅ `invoice.canceled` (Boleto cancelado)
   - **Secret (Opcional):** Use o `CORA_WEBHOOK_SECRET` do `.env`
5. Clique em: **Salvar**

#### **Para Produção:**

Mesmo processo acima, mas em: https://www.cora.com.br

### **Passo 5.3: Testar o Webhook**

1. No painel CORA, vá em: **Webhooks**
2. Clique em: **Testar**
3. Verifique se o status retornou **200 OK**
4. Se retornar erro, verifique:
   - A URL está correta?
   - O servidor está online?
   - O firewall permite requisições do CORA?

---

## 6. Ativação do Gateway

### **Passo 6.1: Acessar o Painel SuperAdmin**

1. Acesse: https://clivus.marcosleandru.com.br/admin
2. Login:
   - **Email:** superadmin@clivus.com
   - **Senha:** superadmin123

### **Passo 6.2: Ativar o Gateway CORA**

1. No menu lateral, clique em: **Gateways**
2. Localize o card: **CORA** 🏦
3. Verifique se o **Toggle** está **ATIVADO** (verde)
4. Se estiver desativado, clique para ativar

### **Passo 6.3: Verificar Configuração**

1. Na mesma tela, verifique os campos:
   - **CORA_API_KEY:** Deve mostrar `cora_***...` (parcialmente mascarado)
   - **CORA_ENVIRONMENT:** Deve mostrar `sandbox` ou `production`
   - **CORA_WEBHOOK_SECRET:** Deve mostrar `cora_***...` (parcialmente mascarado)

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
    "name": "cora",
    "displayName": "CORA",
    "isEnabled": true
  }
]
```

Se `cora` não aparecer, volte ao **Passo 6.2**.

---

### **Teste 2: Checkout Completo (Stage)**

1. **Logout** do SuperAdmin
2. Acesse: https://clivus.marcosleandru.com.br
3. Clique em: **QUERO COMPRAR AGORA**
4. Selecione um plano (ex: **Básico - R$ 97**)
5. Faça **login** com:
   - **Email:** cliente@teste.com
   - **Senha:** cliente123
   
   **OU** se não tiver conta, clique em: **Criar Conta** (e use CPF/CNPJ válidos!)

6. Na página de checkout:
   - Você deve ver: **"Plano [Nome do Plano]"**
   - Valor correto (ex: R$ 97)
   - Botão: **"Confirmar Compra"**

7. Clique em: **Confirmar Compra**

8. **Aguarde** 2-5 segundos

9. Você será **redirecionado** para visualizar o boleto (PDF) do CORA

10. **Se estiver em Stage:**
    - Você verá um boleto de teste
    - Para simular pagamento:
      - Volte para o painel CORA
      - Vá em: **Cobranças**
      - Encontre o boleto criado
      - Clique em: **Marcar como pago**

11. **Se estiver em Produção:**
    - Você verá um boleto real com QR Code PIX
    - Pode pagar via:
      - **PIX:** Escaneie o QR Code
      - **Boleto:** Use a linha digitável no banco

---

### **Teste 3: Verificar Webhook (Após Pagamento)**

```bash
# No terminal do servidor, veja os logs:
pm2 logs --lines 100
```

**Procure por:**
```
[CORA Webhook] Evento recebido: invoice.paid
[CORA Webhook] Pagamento aprovado, atualizando acesso do usuário
[CORA Webhook] Email de boas-vindas enviado para: cliente@teste.com
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

### **Erro: "Erro ao processar pagamento com CORA"**

**Causa 1:** Client ID inválido

**Solução:**
```bash
# 1. Verifique se o Client ID está correto no .env
cat /caminho/para/clivus_landing_page/nextjs_space/.env | grep CORA_API_KEY

# 2. Teste o Client ID diretamente via curl (substitua YOUR_CLIENT_ID):
curl -X GET "https://api.stage.cora.com.br/v1/balance" \
  -H "Authorization: Bearer YOUR_CLIENT_ID"

# Se retornar erro 401, o Client ID está errado!
```

**Causa 2:** CPF/CNPJ inválido ou ausente

**Solução:**
- O CORA **EXIGE** CPF/CNPJ válido para emissão de boletos
- **Opção 1:** Certifique-se de que o usuário cadastrou um CPF/CNPJ válido
- **Opção 2:** Se for Stage, use CPFs/CNPJs de teste válidos (com dígitos verificadores corretos)

**Causa 3:** Ambiente errado

**Solução:**
```env
# Se seu Client ID é de STAGE, use:
CORA_ENVIRONMENT=sandbox

# Se seu Client ID é de PRODUÇÃO, use:
CORA_ENVIRONMENT=production
```

---

### **Erro: "Client ID CORA não configurado"**

**Solução:**

1. Verifique o `.env`:
```bash
cat .env | grep CORA
```

2. Se estiver vazio ou com aspas, corrija:
```env
CORA_API_KEY=cora_client_id_...  (SEM ASPAS!)
```

3. Reinicie o servidor:
```bash
pm2 restart all
```

---

### **Erro: Webhook não está sendo chamado**

**Diagnóstico:**

1. Acesse o painel CORA → **Webhooks**
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
  - Use: `curl https://clivus.marcosleandru.com.br/api/webhook/cora`

---

### **Erro: Acesso não liberado após pagamento**

**Diagnóstico:**

```bash
# Veja os logs do webhook:
pm2 logs --lines 200 | grep "CORA Webhook"
```

**Procure por:**
- `[CORA Webhook] Payment não encontrado` → O boleto ID está incorreto
- `[CORA Webhook] Erro ao processar webhook` → Erro no servidor

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
   - `stripeSessionId` → Deve ter o ID do boleto CORA

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
- [ ] **Plano CoraPro ativo** (R$ 44,90/mês)
- [ ] **Servidor reiniciado** após mudanças no .env
- [ ] **Webhook configurado no CORA** com URL correta
- [ ] **Gateway CORA ativado** no painel SuperAdmin
- [ ] **Teste de checkout realizado** (stage ou produção)
- [ ] **Webhook recebendo eventos** (verifique logs)
- [ ] **Cliente recebeu acesso** após pagamento
- [ ] **Email de boas-vindas enviado** (se Resend configurado)

---

## 🎉 **Status de Sucesso**

Se você completou TODOS os passos e:

✅ O checkout redireciona para o PDF do boleto  
✅ O boleto tem QR Code PIX  
✅ O webhook é chamado após pagamento  
✅ O cliente recebe acesso  
✅ O email é enviado

**PARABÉNS! O sistema CORA está 100% funcional! 🚀**

---

## 💰 **Custos CORA**

### **Plano CoraPro:**
- **Mensalidade:** R$ 44,90/mês (obrigatório para APIs)

### **Tarifas por Transação:**
- **Boleto pago por PIX (QR Code):** R$ 0,50 por transação
- **Boleto pago por código de barras:** R$ 1,70 por transação
- **Cancelamento de boleto via API:** R$ 0,30 por cancelamento
- **TED (transferências):** R$ 2,00 por TED

### **Comparação com Asaas:**
| Feature | CORA | Asaas |
|---------|------|-------|
| Mensalidade | R$ 44,90 | R$ 0,00 |
| Boleto + PIX | R$ 0,50 | R$ 3,49 + R$ 0,49 |
| Aprovação | Instantânea | Manual (1-3 dias) |

---

## 📞 **Suporte Adicional**

Se ainda assim não funcionar, colete as seguintes informações:

1. **Logs do servidor:**
```bash
pm2 logs --lines 500 > logs.txt
```

2. **Conteúdo do .env (MASCARANDO o Client ID):**
```bash
cat .env | grep CORA
```

3. **Histórico de webhooks** do painel CORA (print screen)

4. **Mensagem de erro exata** que aparece no checkout

Envie para: suporteapi@cora.com.br

---

**Data do Guia:** 19/11/2025  
**Versão:** 1.0 - Definitiva  
**Objetivo:** Configuração 100% manual e funcional do gateway CORA
