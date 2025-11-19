
# Guia de Configuração do Pagar.me

Este guia fornece instruções completas para configurar o gateway de pagamento Pagar.me no sistema Clivus.

---

## 📋 Pré-requisitos

- [ ] Conta no Pagar.me (Dashboard em https://dashboard.pagar.me)
- [ ] Acesso ao servidor (para editar `.env`)
- [ ] Acesso ao painel SuperAdmin do Clivus (`/admin/gateways`)

---

## 🏦 1. Criação da Conta Pagar.me

### 1.1 Conta de Teste

1. Acesse: https://dashboard.pagar.me
2. Clique em "Criar conta" ou "Cadastre-se"
3. Preencha os dados solicitados:
   - Nome completo
   - Email
   - Senha
   - Telefone
   - CPF/CNPJ

4. Após o cadastro, você terá acesso imediato ao **ambiente de testes**
5. Para acessar o Dashboard: https://dashboard.pagar.me

### 1.2 Conta de Produção

1. No Dashboard do Pagar.me, clique em "Ativar conta"
2. Complete o cadastro com:
   - Dados da empresa (razão social, CNPJ)
   - Documentos (contrato social, comprovante de endereço)
   - Conta bancária para recebimento
   - Informações dos sócios

3. Aguarde a **aprovação da Pagar.me** (pode levar até 2 dias úteis)
4. Após aprovação, você poderá processar pagamentos reais

---

## 🔑 2. Obtenção das Credenciais (API Keys)

### 2.1 Acessando as Chaves de API

1. Faça login no Dashboard: https://dashboard.pagar.me
2. No menu lateral, clique em **"Configurações"**
3. Depois em **"Chaves de API"** ou **"API Keys"**

### 2.2 Chaves de Teste (Sandbox)

As chaves de teste permitem simular pagamentos sem transações reais.

1. Na seção "Chaves de API", localize a aba **"Ambiente de Testes"** ou **"Test"**
2. Copie as seguintes chaves:
   - **Secret Key (sk_test_...)**: Chave secreta para uso no servidor
   - **Public Key (pk_test_...)**: Chave pública (não será usada no backend)

**⚠️ IMPORTANTE:**
- A Secret Key deve ser mantida em sigilo
- Nunca exponha a Secret Key no frontend ou em repositórios públicos

### 2.3 Chaves de Produção (Live)

**ATENÇÃO:** Use as chaves de produção SOMENTE após aprovação da conta.

1. Na seção "Chaves de API", localize a aba **"Produção"** ou **"Live"**
2. Copie as seguintes chaves:
   - **Secret Key (sk_live_...)**: Chave secreta para transações reais
   - **Public Key (pk_live_...)**: Chave pública (não será usada no backend)

**⚠️ CUIDADO:**
- Chaves de produção processam pagamentos REAIS
- Mantenha em sigilo absoluto

---

## 🔐 3. Webhook Secret

O Webhook Secret é usado para validar que as notificações vieram realmente do Pagar.me.

### 3.1 Criar Webhook Secret

1. No Dashboard, vá em **"Configurações"** → **"Webhooks"**
2. Clique em **"Criar Webhook"** ou **"Adicionar novo webhook"**
3. Configure:
   - **URL do Webhook**: `https://seu-dominio.com.br/api/webhook/pagarme`
   - **Eventos a serem notificados**:
     - ✅ `order.paid` (Pedido pago)
     - ✅ `order.payment_failed` (Pagamento falhou)
     - ✅ `order.canceled` (Pedido cancelado)
     - ✅ `charge.paid` (Cobrança paga)
     - ✅ `charge.refunded` (Cobrança estornada)
     - ✅ `charge.payment_failed` (Falha no pagamento)

4. Após salvar, o Pagar.me gerará um **Webhook Secret** (exemplo: `wh_secret_abc123...`)
5. **Copie e guarde este secret** - você precisará dele na configuração do servidor

**⚠️ IMPORTANTE:**
- Você pode criar webhooks diferentes para teste e produção
- Use URLs diferentes se estiver testando localmente (ex: ngrok)

---

## 💻 4. Configuração no Servidor

### 4.1 Editar o arquivo `.env`

1. Acesse o servidor onde o Clivus está instalado
2. Navegue até o diretório do projeto:
   ```bash
   cd /opt/hostedapp/node/root/app/nextjs_space
   ```

3. Edite o arquivo `.env`:
   ```bash
   nano .env
   ```

4. Adicione ou atualize as seguintes variáveis:

   **Para ambiente de TESTE:**
   ```env
   # Pagar.me Payment Gateway
   PAGARME_API_KEY=sk_test_SEU_SECRET_KEY_AQUI
   PAGARME_WEBHOOK_SECRET=wh_secret_SEU_WEBHOOK_SECRET_AQUI
   PAGARME_ENVIRONMENT=test
   ```

   **Para ambiente de PRODUÇÃO:**
   ```env
   # Pagar.me Payment Gateway
   PAGARME_API_KEY=sk_live_SEU_SECRET_KEY_AQUI
   PAGARME_WEBHOOK_SECRET=wh_secret_SEU_WEBHOOK_SECRET_AQUI
   PAGARME_ENVIRONMENT=live
   ```

**⚠️ REGRAS IMPORTANTES:**
- ❌ **NÃO use aspas** ao redor dos valores
- ❌ **NÃO use barras invertidas** (`\`)
- ❌ **NÃO deixe espaços** antes ou depois do `=`
- ✅ **Use o valor RAW** (sem formatação)

**Exemplos CORRETOS:**
```env
PAGARME_API_KEY=sk_test_abc123def456ghi789
PAGARME_WEBHOOK_SECRET=wh_secret_xyz789abc123
PAGARME_ENVIRONMENT=test
```

**Exemplos INCORRETOS:**
```env
PAGARME_API_KEY="sk_test_abc123def456ghi789"  # ❌ NÃO use aspas
PAGARME_API_KEY='sk_test_abc123def456ghi789'  # ❌ NÃO use aspas simples
PAGARME_WEBHOOK_SECRET = wh_secret_xyz789abc123  # ❌ NÃO deixe espaços
```

5. **Salve o arquivo:**
   - Pressione `Ctrl + O` (salvar)
   - Pressione `Enter` (confirmar)
   - Pressione `Ctrl + X` (sair)

### 4.2 Reiniciar o Servidor Next.js

**IMPORTANTE:** O Next.js precisa ser reiniciado para carregar as novas variáveis de ambiente.

```bash
pm2 restart nextjs
```

Aguarde alguns segundos e verifique os logs:
```bash
pm2 logs nextjs --lines 50
```

---

## ⚙️ 5. Configuração no Webhook do Pagar.me

### 5.1 Obter a URL do Webhook

A URL do webhook do Clivus segue o formato:
```
https://seu-dominio.com.br/api/webhook/pagarme
```

**Exemplos:**
- Produção: `https://clivus.marcosleandru.com.br/api/webhook/pagarme`
- Teste (ngrok): `https://abc123.ngrok.io/api/webhook/pagarme`

### 5.2 Configurar no Dashboard do Pagar.me

1. Acesse: https://dashboard.pagar.me
2. Vá em **"Configurações"** → **"Webhooks"**
3. Se já existir um webhook, clique em **"Editar"**
4. Se não existir, clique em **"Criar Webhook"**

5. Preencha:
   - **URL do Webhook**: Cole a URL acima
   - **Método HTTP**: POST
   - **Eventos**:
     ```
     ✅ order.paid
     ✅ order.payment_failed
     ✅ order.canceled
     ✅ charge.paid
     ✅ charge.payment_failed
     ✅ charge.refunded
     ```

6. Clique em **"Salvar"**
7. **Copie o Webhook Secret gerado** e atualize no `.env` se necessário

### 5.3 Testar o Webhook

1. No Dashboard do Pagar.me, vá em **"Webhooks"** → **"Histórico"**
2. Clique em **"Enviar webhook de teste"** ou **"Test webhook"**
3. Verifique se o webhook foi recebido com sucesso (status 200)

**Se o teste falhar:**
- Verifique se a URL está correta
- Certifique-se de que o servidor está rodando
- Verifique os logs do servidor: `pm2 logs nextjs`

---

## 🎛️ 6. Ativação no Painel SuperAdmin

### 6.1 Acessar o Painel de Gateways

1. Acesse o Clivus como **SuperAdmin**
2. Vá em: **Menu → Gateways**
3. Localize a seção **"Pagar.me"**

### 6.2 Ativar o Gateway

1. Na seção "Pagar.me", verifique se as credenciais estão configuradas:
   - ✅ API Key configurada
   - ✅ Webhook Secret configurado
   - ✅ Ambiente definido (test ou live)

2. Ative o toggle **"Ativar Pagar.me"**
3. Clique em **"Salvar Configurações"**

**PRONTO!** O Pagar.me está agora ativo e pronto para processar pagamentos.

---

## ✅ 7. Testes

### 7.1 Verificar Gateway Ativo

1. Faça uma requisição para verificar gateways ativos:
   ```bash
   curl https://seu-dominio.com.br/api/gateways/active
   ```

2. A resposta deve incluir:
   ```json
   [
     {
       "name": "pagarme",
       "displayName": "Pagar.me",
       "isEnabled": true
     }
   ]
   ```

### 7.2 Testar Checkout Completo (Ambiente de Teste)

1. **Fazer logout** do sistema
2. Limpar cache do navegador (`Ctrl + Shift + Delete`)
3. Acessar a página de checkout: `https://seu-dominio.com.br/checkout?plan=advanced`
4. Fazer login ou criar uma conta de teste
5. No checkout, selecionar **"Pagar.me"** como gateway
6. **Escolher método de pagamento**:

   **Para PIX:**
   - O sistema gerará um QR Code PIX
   - Use o app do Pagar.me para simular o pagamento

   **Para Boleto:**
   - O sistema gerará um boleto bancário
   - No Dashboard do Pagar.me, vá em "Transações" e **marque o boleto como pago**

   **Para Cartão de Crédito:**
   - Use os **cartões de teste** fornecidos pelo Pagar.me:
     - **Aprovado**: `4111 1111 1111 1111` (Qualquer CVV, qualquer data futura)
     - **Recusado**: `4000 0000 0000 0002`
     - **Expirado**: `4000 0000 0000 0069`
   - Código de segurança (CVV): Qualquer valor de 3 dígitos
   - Data de validade: Qualquer data futura

7. Após o "pagamento", verifique:
   - ✅ Webhook foi recebido (logs do servidor)
   - ✅ Status do pagamento atualizado no banco de dados
   - ✅ Acesso concedido ao usuário
   - ✅ Email de boas-vindas enviado
   - ✅ Email de notificação enviado ao admin

### 7.3 Verificar Logs do Webhook

```bash
pm2 logs nextjs | grep "Pagar.me Webhook"
```

**Logs esperados:**
```
[Pagar.me Webhook] Recebendo notificação...
[Pagar.me Webhook] Assinatura validada!
[Pagar.me Webhook] Evento: order.paid
[Pagar.me Webhook] Pagamento confirmado! Concedendo acesso...
[Pagar.me Webhook] Acesso concedido ao usuário!
[Pagar.me Webhook] Email de boas-vindas enviado!
[Pagar.me Webhook] Webhook processado com sucesso!
```

### 7.4 Confirmar Acesso do Cliente

1. Fazer login com as credenciais do cliente de teste
2. Verificar se o cliente pode acessar o **Dashboard** completo
3. Confirmar que não há mensagens de "acesso negado"

---

## 🔧 8. Troubleshooting

### Erro: "Sistema de pagamento Pagar.me não configurado"

**Causa:** A variável `PAGARME_API_KEY` não está definida ou está vazia.

**Solução:**
1. Verifique o `.env`:
   ```bash
   cat .env | grep PAGARME
   ```
2. Se vazio, adicione a API Key correta
3. Reinicie o servidor: `pm2 restart nextjs`

---

### Erro: "Invalid signature" no webhook

**Causa:** O Webhook Secret está incorreto ou não foi configurado.

**Solução:**
1. Verifique o `.env`:
   ```bash
   cat .env | grep PAGARME_WEBHOOK_SECRET
   ```
2. Compare com o Webhook Secret no Dashboard do Pagar.me
3. Se diferente, atualize o `.env` e reinicie: `pm2 restart nextjs`

---

### Erro: "Pagamento não encontrado" no webhook

**Causa:** O Order ID do Pagar.me não foi salvo corretamente no banco de dados.

**Solução:**
1. Verifique os logs do checkout:
   ```bash
   pm2 logs nextjs | grep "Checkout API"
   ```
2. Certifique-se de que o Order ID foi salvo em `stripeSessionId`
3. Repita o processo de checkout

---

### Webhook não está sendo recebido

**Causas possíveis:**
1. URL do webhook incorreta no Dashboard do Pagar.me
2. Servidor está offline ou inacessível
3. Firewall bloqueando requisições do Pagar.me

**Soluções:**
1. Verifique a URL no Dashboard do Pagar.me
2. Teste a URL manualmente:
   ```bash
   curl -X POST https://seu-dominio.com.br/api/webhook/pagarme \
        -H "Content-Type: application/json" \
        -d '{"type": "order.paid", "data": {"id": "test"}}'
   ```
3. Verifique os logs: `pm2 logs nextjs`
4. Se necessário, configure um webhook de teste usando **ngrok**

---

### Cartão de teste não funciona

**Causa:** Você pode estar usando cartões reais em ambiente de teste.

**Solução:**
Use os **cartões de teste oficiais** do Pagar.me:
- **Aprovado**: `4111 1111 1111 1111`
- **Recusado**: `4000 0000 0000 0002`
- CVV: Qualquer valor de 3 dígitos
- Validade: Qualquer data futura

---

### CPF/CNPJ inválido ou vazio

**Causa:** O usuário não forneceu CPF/CNPJ válido no cadastro.

**Solução:**
- CPF/CNPJ é **opcional** no Pagar.me
- O sistema criará o pedido sem o documento se não for válido
- Para incluir o CPF/CNPJ, o usuário deve atualizar o cadastro

---

## 📊 9. Custos do Pagar.me

### Taxas por Transação (referência - confirme no site oficial)

- **PIX**: 0,99%
- **Boleto Bancário**: R$ 3,49 por boleto
- **Cartão de Crédito**: 3,79% a 4,99% (depende do volume)
- **Cartão de Débito**: 1,99% a 2,99%

### Outras Taxas

- **Taxa de setup**: Geralmente grátis
- **Taxa de adesão**: Geralmente grátis
- **Taxa de antecipação**: Varia conforme o plano
- **Taxa de chargeback**: R$ 25 por caso

**⚠️ IMPORTANTE:**
- As taxas podem variar conforme o volume de transações
- Entre em contato com o comercial do Pagar.me para negociar taxas
- Consulte: https://pagar.me/precos

---

## 📋 10. Checklist Final

Antes de considerar a configuração concluída, verifique:

### Credenciais
- [ ] `PAGARME_API_KEY` configurada no `.env`
- [ ] `PAGARME_WEBHOOK_SECRET` configurada no `.env`
- [ ] `PAGARME_ENVIRONMENT` definida (`test` ou `live`)
- [ ] Servidor Next.js reiniciado após alterações

### Webhook
- [ ] Webhook configurado no Dashboard do Pagar.me
- [ ] URL do webhook está correta
- [ ] Eventos necessários selecionados
- [ ] Webhook Secret copiado e configurado no `.env`

### Ativação
- [ ] Gateway "Pagar.me" ativado no painel SuperAdmin (`/admin/gateways`)
- [ ] Configurações salvas com sucesso

### Testes
- [ ] API `/api/gateways/active` retorna Pagar.me como ativo
- [ ] Checkout completo testado (PIX, Boleto ou Cartão)
- [ ] Webhook recebido e processado com sucesso
- [ ] Acesso concedido ao usuário após pagamento
- [ ] Emails de boas-vindas e admin enviados
- [ ] Logs do servidor sem erros

---

## 📚 11. Recursos Adicionais

### Documentação Oficial do Pagar.me
- **Portal de Desenvolvedores**: https://docs.pagar.me
- **API Reference**: https://docs.pagar.me/reference/
- **Webhooks**: https://docs.pagar.me/docs/webhooks
- **Cartões de Teste**: https://docs.pagar.me/docs/testando-pagamentos

### Suporte do Pagar.me
- **Email**: suporte@pagar.me
- **Chat**: Disponível no Dashboard
- **Telefone**: 4004-1330 ou (11) 2129-3170
- **Central de Ajuda**: https://pagar.me/ajuda

### Comunidade
- **GitHub**: https://github.com/pagarme
- **SDKs Oficiais**: Disponíveis em várias linguagens
- **Status da API**: https://status.pagar.me

---

## 🔄 12. Mudança de Ambiente (Teste → Produção)

Quando sua conta Pagar.me for aprovada para produção:

1. **Obter chaves de produção**:
   - Acesse o Dashboard do Pagar.me
   - Vá em "Configurações" → "Chaves de API"
   - Copie a **Secret Key** de produção (`sk_live_...`)

2. **Criar webhook de produção**:
   - Vá em "Configurações" → "Webhooks"
   - Crie um novo webhook para produção
   - Use a URL: `https://seu-dominio.com.br/api/webhook/pagarme`
   - Copie o novo **Webhook Secret**

3. **Atualizar `.env`**:
   ```env
   PAGARME_API_KEY=sk_live_SUA_CHAVE_DE_PRODUCAO
   PAGARME_WEBHOOK_SECRET=wh_secret_SEU_WEBHOOK_DE_PRODUCAO
   PAGARME_ENVIRONMENT=live
   ```

4. **Reiniciar o servidor**:
   ```bash
   pm2 restart nextjs
   ```

5. **Testar com pagamento real de baixo valor** (ex: R$ 1,00)

---

## ✅ Conclusão

Se você seguiu todos os passos acima, o gateway Pagar.me está agora **completamente configurado e operacional** no sistema Clivus.

**Próximos passos:**
1. Configure outros gateways (se necessário)
2. Personalize as mensagens de email
3. Configure relatórios e dashboards financeiros
4. Monitore as transações no Dashboard do Pagar.me

**Dúvidas?** Consulte a documentação oficial ou entre em contato com o suporte do Pagar.me.

---

**Última atualização:** 19/11/2024  
**Versão:** 1.0
