
# 📧 Configuração de Envio de Emails - Clivus

## ⚠️ IMPORTANTE: Emails Após Cadastro

O sistema Clivus **NÃO envia emails automaticamente após o cadastro**. Os emails são enviados apenas quando:

1. ✅ **Após pagamento aprovado** (via Webhook do gateway)
2. ✅ **Reenvio manual** pelo SuperAdmin (na tela de Gestão de Clientes ou Vendas)

---

## 📋 Quando os Emails São Enviados

### 1️⃣ Email de Boas-Vindas (Após Pagamento)

**Quando:** Webhook do gateway confirma pagamento

**Conteúdo:**
- Credenciais de acesso (email + senha temporária)
- Nome do plano contratado
- Instruções de primeiro acesso
- Link para fazer login

**Fluxo:**
```
Cliente compra plano 
→ Gateway processa pagamento 
→ Webhook notifica sistema 
→ Sistema libera acesso 
→ Email enviado automaticamente
```

### 2️⃣ Email de Notificação para Admin

**Quando:** Após pagamento confirmado

**Conteúdo:**
- Nome e email do novo cliente
- Plano contratado
- Valor pago
- Gateway utilizado

---

## 🔧 Configuração do Serviço de Email (Resend)

### Por que Resend?

- ✅ Fácil configuração
- ✅ API simples e confiável
- ✅ Boas taxas de entregabilidade
- ✅ Gratuito até 3.000 emails/mês
- ✅ Suporte a domínio personalizado

### Passo a Passo

#### 1️⃣ Criar Conta no Resend

1. Acesse https://resend.com/
2. Clique em **Sign Up**
3. Confirme seu email

#### 2️⃣ Gerar API Key

1. No painel Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "Clivus Production")
4. Copie a chave gerada (começa com `re_...`)

#### 3️⃣ Configurar Domínio (Recomendado)

**Opção A: Usar domínio próprio**
1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `clivus.com.br`)
4. Configure os registros DNS conforme instruções

**Opção B: Usar domínio do Resend**
- Use `onboarding@resend.dev` (limite de 1 email/dia)
- **Não recomendado para produção**

#### 4️⃣ Atualizar Arquivo .env

Edite o arquivo `.env` no servidor:

```env
# Email Configuration
RESEND_API_KEY="re_SuaChaveAquiGeradaNoResend"
EMAIL_FROM="Clivus <noreply@clivus.com.br>"
ADMIN_EMAIL="admin@clivus.com.br"
```

**⚠️ IMPORTANTE:** Após editar o `.env`, você **DEVE** reiniciar o servidor Next.js:

```bash
# Matar o servidor atual
pkill -f "next dev"

# Iniciar novamente
cd /home/ubuntu/clivus_landing_page/nextjs_space
yarn dev
```

---

## 🧪 Testando o Envio de Emails

### Método 1: Fazer uma Compra de Teste

1. Cadastre-se com um email real que você tem acesso
2. Escolha um plano
3. Use gateway de teste (Asaas Sandbox ou Stripe Test)
4. Complete o pagamento
5. Aguarde alguns segundos
6. Verifique sua caixa de entrada e spam

### Método 2: Reenviar Credenciais Manualmente

1. Acesse `/admin/clients` ou `/admin/sales`
2. Encontre um cliente com pagamento ativo
3. Clique em **Reenviar Credenciais** ou **Reenviar Acesso**
4. Verifique se o email foi enviado

### Método 3: Verificar Logs do Servidor

Execute o servidor em modo de desenvolvimento e observe os logs:

```bash
cd /home/ubuntu/clivus_landing_page/nextjs_space
yarn dev
```

Procure por mensagens como:
```
✅ Email de boas-vindas enviado para: cliente@email.com
✅ Email de notificação enviado para admin
```

---

## 🔍 Troubleshooting (Resolução de Problemas)

### ❌ Email não está sendo enviado

**Possíveis causas:**

1. **API Key não configurada ou inválida**
   - Verifique o `.env`: `grep RESEND_API_KEY .env`
   - Confirme se começa com `re_`
   - Teste a chave no painel Resend

2. **Domínio não verificado**
   - Use `EMAIL_FROM` com domínio verificado no Resend
   - Ou use `onboarding@resend.dev` para testes

3. **Servidor não foi reiniciado**
   - Sempre reinicie após editar `.env`
   - `pkill -f "next dev" && cd nextjs_space && yarn dev`

4. **Webhook não está sendo recebido**
   - Veja `ASAAS_SETUP.md` para configurar webhook
   - Verifique logs: emails só são enviados após webhook confirmar pagamento

### ❌ Email cai na caixa de spam

**Soluções:**

1. **Configure SPF, DKIM e DMARC no DNS**
   - O Resend fornece os registros necessários
   - Vá em **Domains** no painel Resend

2. **Use domínio próprio verificado**
   - Evite usar `@resend.dev` em produção

3. **Evite palavras de spam no conteúdo**
   - Revise os templates em `lib/email.ts`

### ❌ Email demora para chegar

- Pode levar até 5 minutos em alguns provedores
- Verifique sempre a pasta de spam
- Use logs do Resend para confirmar envio

---

## 📊 Monitoramento

### Ver Histórico de Emails no Resend

1. Acesse **Emails** no painel Resend
2. Veja todos os emails enviados com:
   - ✅ Status (delivered, bounced, failed)
   - 📅 Data e hora
   - 📧 Destinatário
   - 🔍 Detalhes completos

### Ver Logs no Servidor

```bash
# Logs em tempo real
cd /home/ubuntu/clivus_landing_page/nextjs_space
yarn dev | grep -E "Email|Resend|Webhook"
```

---

## 🎨 Personalizar Templates de Email

Os templates estão em: `/lib/email.ts`

### Email de Boas-Vindas

```typescript
export async function sendWelcomeEmail({...}) {
  // Edite o HTML aqui
}
```

### Email de Notificação Admin

```typescript
export async function sendAdminPurchaseNotification({...}) {
  // Edite o HTML aqui
}
```

**Dicas:**
- Use HTML inline styles (evite CSS externo)
- Teste em múltiplos clientes de email
- Mantenha o design simples e responsivo

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo está funcionando:

- [ ] Conta criada no Resend
- [ ] API Key gerada e copiada
- [ ] Domínio configurado e verificado (recomendado)
- [ ] Arquivo `.env` atualizado com credenciais
- [ ] Servidor Next.js reiniciado
- [ ] Webhook do gateway configurado
- [ ] Teste de envio realizado com sucesso
- [ ] Email de boas-vindas recebido (não está no spam)
- [ ] Email de admin recebido
- [ ] Logs mostrando envio correto

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca compartilhe sua RESEND_API_KEY**
2. **Use variáveis de ambiente** (nunca hardcode)
3. **Configure DKIM/SPF/DMARC** para autenticação
4. **Monitore o painel Resend** para detectar abusos
5. **Limite o rate de envio** se necessário

---

## 💰 Limites e Preços do Resend

### Plano Gratuito
- ✅ 3.000 emails/mês
- ✅ 1 domínio verificado
- ✅ Todos os recursos

### Plano Pago (se necessário)
- 💵 A partir de $20/mês (50.000 emails)
- ✅ Domínios ilimitados
- ✅ Suporte prioritário

**Para Clivus:**
- Com 3.000 emails/mês gratuitos
- Considerando 1 email por cliente novo
- Suporta até 3.000 novos clientes/mês
- **Suficiente para a maioria dos casos**

---

## 📞 Suporte

### Problemas com Resend
- Email: hi@resend.com
- Docs: https://resend.com/docs
- Status: https://status.resend.com/

### Problemas com Clivus
- Verifique logs do servidor
- Consulte `ADMIN_SETUP.md`
- Verifique `ASAAS_SETUP.md` para webhooks

---

**Última atualização:** 18/11/2024  
**Versão do documento:** 1.0
