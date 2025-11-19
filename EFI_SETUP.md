
# Guia de Configuração do EFI (Gerencianet)

Este guia fornece instruções completas para configurar o gateway de pagamento EFI (antiga Gerencianet) no sistema Clivus.

---

## 📋 Pré-requisitos

- [ ] Conta no EFI (Gerencianet) em https://gerencianet.com.br
- [ ] Acesso ao servidor (para editar `.env`)
- [ ] Acesso ao painel SuperAdmin do Clivus (`/admin/gateways`)

---

## 🏦 1. Criação da Conta EFI

### 1.1 Conta de Teste (Sandbox)

1. Acesse: https://gerencianet.com.br
2. Clique em "Cadastre-se" ou "Criar conta"
3. Preencha os dados solicitados:
   - Nome completo
   - Email
   - Senha
   - Telefone
   - CPF/CNPJ

4. Após o cadastro, você terá acesso imediato ao **ambiente de testes (Sandbox)**
5. Acesse o Dashboard: https://sistemas.gerencianet.com.br

### 1.2 Conta de Produção

1. No Dashboard do EFI, complete seu cadastro com:
   - Dados da empresa (razão social, CNPJ)
   - Documentos (contrato social, comprovante de endereço)
   - Conta bancária para recebimento
   - Informações dos sócios

2. Aguarde a **aprovação da EFI** (pode levar até 2 dias úteis)
3. Após aprovação, você poderá processar pagamentos reais

---

## 🔑 2. Obtenção das Credenciais (Client ID e Client Secret)

### 2.1 Acessando as Credenciais de API

1. Faça login no Dashboard: https://sistemas.gerencianet.com.br
2. No menu lateral, clique em **"API"**
3. Depois em **"Suas Aplicações"** ou **"Credenciais"**

### 2.2 Credenciais de Teste (Sandbox)

As credenciais de teste permitem simular pagamentos sem transações reais.

1. Na seção "API", selecione o ambiente **"Homologação"** ou **"Sandbox"**
2. Clique em **"Criar nova aplicação"** ou **"Gerar credenciais"**
3. Dê um nome para sua aplicação (ex: "Clivus Homologação")
4. Copie as seguintes credenciais:
   - **Client_Id**: Identificador da aplicação
   - **Client_Secret**: Chave secreta da aplicação

**⚠️ IMPORTANTE:**
- O Client Secret só é exibido **UMA VEZ** após a criação
- Se você perder, precisará gerar novas credenciais
- Nunca exponha o Client Secret no frontend ou em repositórios públicos

### 2.3 Credenciais de Produção (Live)

**ATENÇÃO:** Use as credenciais de produção SOMENTE após aprovação da conta.

1. Na seção "API", selecione o ambiente **"Produção"**
2. Siga os mesmos passos da seção anterior
3. Copie as credenciais de produção:
   - **Client_Id**: Para uso em produção
   - **Client_Secret**: Para uso em produção

**⚠️ CUIDADO:**
- Credenciais de produção processam pagamentos REAIS
- Mantenha em sigilo absoluto

---

## 🔐 3. Webhook Secret (Opcional mas Recomendado)

O Webhook Secret é usado para validar que as notificações vieram realmente do EFI.

### 3.1 Configurar Webhook

1. No Dashboard, vá em **"API"** → **"Webhooks"**
2. Clique em **"Adicionar Webhook"** ou **"Configurar notificações"**
3. Configure:
   - **URL do Webhook**: `https://seu-dominio.com.br/api/webhook/efi`
   - **Eventos a serem notificados**:
     - ✅ Cobrança paga (`charge.paid`)
     - ✅ Cobrança cancelada (`charge.canceled`)
     - ✅ Cobrança expirada (`charge.unpaid`)
     - ✅ Cobrança contestada (`charge.refunded`)

4. Salve a configuração
5. **Gere um Webhook Secret**:
   - Você pode usar qualquer string segura
   - Exemplo: `efi_webhook_secret_abc123xyz456`
   - Armazene este secret com segurança

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
   # EFI Payment Gateway
   EFI_CLIENT_ID=Client_Id_SEU_CLIENT_ID_SANDBOX_AQUI
   EFI_CLIENT_SECRET=Client_Secret_SEU_CLIENT_SECRET_SANDBOX_AQUI
   EFI_WEBHOOK_SECRET=seu_webhook_secret_aqui
   EFI_ENVIRONMENT=sandbox
   ```

   **Para ambiente de PRODUÇÃO:**
   ```env
   # EFI Payment Gateway
   EFI_CLIENT_ID=Client_Id_SEU_CLIENT_ID_PRODUCAO_AQUI
   EFI_CLIENT_SECRET=Client_Secret_SEU_CLIENT_SECRET_PRODUCAO_AQUI
   EFI_WEBHOOK_SECRET=seu_webhook_secret_aqui
   EFI_ENVIRONMENT=production
   ```

**⚠️ REGRAS IMPORTANTES:**
- ❌ **NÃO use aspas** ao redor dos valores
- ❌ **NÃO use barras invertidas** (`\`)
- ❌ **NÃO deixe espaços** antes ou depois do `=`
- ✅ **Use o valor RAW** (sem formatação)

**Exemplos CORRETOS:**
```env
EFI_CLIENT_ID=Client_Id_abc123def456ghi789
EFI_CLIENT_SECRET=Client_Secret_xyz789abc123
EFI_WEBHOOK_SECRET=efi_webhook_secret_abc123
EFI_ENVIRONMENT=sandbox
```

**Exemplos INCORRETOS:**
```env
EFI_CLIENT_ID="Client_Id_abc123def456ghi789"  # ❌ NÃO use aspas
EFI_CLIENT_SECRET='Client_Secret_xyz789abc123'  # ❌ NÃO use aspas simples
EFI_WEBHOOK_SECRET = efi_webhook_secret_abc123  # ❌ NÃO deixe espaços
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

## ⚙️ 5. Configuração no Webhook do EFI

### 5.1 Obter a URL do Webhook

A URL do webhook do Clivus segue o formato:
```
https://seu-dominio.com.br/api/webhook/efi
```

**Exemplos:**
- Produção: `https://clivus.marcosleandru.com.br/api/webhook/efi`
- Teste (ngrok): `https://abc123.ngrok.io/api/webhook/efi`

### 5.2 Configurar no Dashboard do EFI

1. Acesse: https://sistemas.gerencianet.com.br
2. Vá em **"API"** → **"Webhooks"**
3. Se já existir um webhook, clique em **"Editar"**
4. Se não existir, clique em **"Adicionar Webhook"**

5. Preencha:
   - **URL do Webhook**: Cole a URL acima
   - **Método HTTP**: POST
   - **Eventos**:
     ```
     ✅ charge.paid (Cobrança paga)
     ✅ charge.canceled (Cobrança cancelada)
     ✅ charge.unpaid (Cobrança não paga / expirada)
     ✅ charge.refunded (Cobrança estornada)
     ✅ charge.contested (Cobrança contestada)
     ```

6. Clique em **"Salvar"**

### 5.3 Testar o Webhook

1. No Dashboard do EFI, vá em **"Webhooks"** → **"Histórico"**
2. Crie uma cobrança de teste e marque como paga
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
3. Localize a seção **"EFI (Gerencianet)"**

### 6.2 Ativar o Gateway

1. Na seção "EFI", verifique se as credenciais estão configuradas:
   - ✅ Client ID configurado
   - ✅ Client Secret configurado
   - ✅ Webhook Secret configurado (opcional)
   - ✅ Ambiente definido (sandbox ou production)

2. Ative o toggle **"Ativar EFI"**
3. Clique em **"Salvar Configurações"**

**PRONTO!** O EFI está agora ativo e pronto para processar pagamentos.

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
       "name": "efi",
       "displayName": "EFI (Gerencianet)",
       "isEnabled": true
     }
   ]
   ```

### 7.2 Testar Checkout Completo (Ambiente de Teste)

1. **Fazer logout** do sistema
2. Limpar cache do navegador (`Ctrl + Shift + Delete`)
3. Acessar a página de checkout: `https://seu-dominio.com.br/checkout?plan=advanced`
4. Fazer login ou criar uma conta de teste
5. No checkout, selecionar **"EFI"** como gateway
6. **Escolher método de pagamento**:

   **Para PIX:**
   - O sistema gerará um QR Code PIX
   - No ambiente sandbox, o pagamento NÃO será processado automaticamente
   - Use o Dashboard do EFI para simular aprovação:
     1. Vá em "Cobranças" → Localize a cobrança
     2. Clique em "Marcar como pago"

   **Para Boleto:**
   - O sistema gerará um boleto bancário
   - No Dashboard do EFI, vá em "Cobranças" e **marque o boleto como pago**

   **Para Cartão de Crédito:**
   - Use os **cartões de teste** fornecidos pelo EFI:
     - **Aprovado**: `4012001037141112` (Qualquer CVV, qualquer data futura)
     - **Recusado**: `4012001038443335`
   - Código de segurança (CVV): Qualquer valor de 3 dígitos
   - Data de validade: Qualquer data futura

7. Após o "pagamento" (aprovação manual no sandbox), verifique:
   - ✅ Webhook foi recebido (logs do servidor)
   - ✅ Status do pagamento atualizado no banco de dados
   - ✅ Acesso concedido ao usuário
   - ✅ Email de boas-vindas enviado
   - ✅ Email de notificação enviado ao admin

### 7.3 Verificar Logs do Webhook

```bash
pm2 logs nextjs | grep "EFI Webhook"
```

**Logs esperados:**
```
[EFI Webhook] Recebendo notificação...
[EFI Webhook] Assinatura validada!
[EFI Webhook] Evento: charge.paid
[EFI Webhook] Pagamento confirmado! Concedendo acesso...
[EFI Webhook] Acesso concedido ao usuário!
[EFI Webhook] Email de boas-vindas enviado!
[EFI Webhook] Webhook processado com sucesso!
```

### 7.4 Confirmar Acesso do Cliente

1. Fazer login com as credenciais do cliente de teste
2. Verificar se o cliente pode acessar o **Dashboard** completo
3. Confirmar que não há mensagens de "acesso negado"

---

## 🔧 8. Troubleshooting

### Erro: "Sistema de pagamento EFI não configurado"

**Causa:** As variáveis `EFI_CLIENT_ID` ou `EFI_CLIENT_SECRET` não estão definidas ou estão vazias.

**Solução:**
1. Verifique o `.env`:
   ```bash
   cat .env | grep EFI
   ```
2. Se vazio, adicione as credenciais corretas
3. Reinicie o servidor: `pm2 restart nextjs`

---

### Erro: "Invalid signature" no webhook

**Causa:** O Webhook Secret está incorreto ou não foi configurado.

**Solução:**
1. Verifique o `.env`:
   ```bash
   cat .env | grep EFI_WEBHOOK_SECRET
   ```
2. Compare com o Webhook Secret que você gerou
3. Se diferente, atualize o `.env` e reinicie: `pm2 restart nextjs`

---

### Erro: "Erro ao autenticar com EFI"

**Causa:** O Client ID ou Client Secret está incorreto.

**Solução:**
1. Verifique as credenciais no Dashboard do EFI
2. Certifique-se de que está usando credenciais do ambiente correto (sandbox ou production)
3. Gere novas credenciais se necessário
4. Atualize o `.env` e reinicie: `pm2 restart nextjs`

---

### Erro: "Cobrança não encontrada" no webhook

**Causa:** O Charge ID do EFI não foi salvo corretamente no banco de dados.

**Solução:**
1. Verifique os logs do checkout:
   ```bash
   pm2 logs nextjs | grep "Checkout API"
   ```
2. Certifique-se de que o Charge ID foi salvo em `stripeSessionId`
3. Repita o processo de checkout

---

### Webhook não está sendo recebido

**Causas possíveis:**
1. URL do webhook incorreta no Dashboard do EFI
2. Servidor está offline ou inacessível
3. Firewall bloqueando requisições do EFI

**Soluções:**
1. Verifique a URL no Dashboard do EFI
2. Teste a URL manualmente:
   ```bash
   curl -X POST https://seu-dominio.com.br/api/webhook/efi \
        -H "Content-Type: application/json" \
        -d '{"event": "charge.paid", "data": {"charge": {"id": "test"}}}'
   ```
3. Verifique os logs: `pm2 logs nextjs`
4. Se necessário, configure um webhook de teste usando **ngrok**

---

### Cartão de teste não funciona

**Causa:** Você pode estar usando cartões reais em ambiente de teste.

**Solução:**
Use os **cartões de teste oficiais** do EFI:
- **Aprovado**: `4012001037141112`
- **Recusado**: `4012001038443335`
- CVV: Qualquer valor de 3 dígitos
- Validade: Qualquer data futura

---

### CPF/CNPJ inválido ou vazio

**Causa:** O usuário não forneceu CPF/CNPJ válido no cadastro.

**Solução:**
- CPF/CNPJ é **opcional** no EFI
- O sistema criará a cobrança sem o documento se não for válido
- Para incluir o CPF/CNPJ, o usuário deve atualizar o cadastro

---

## 📊 9. Custos do EFI

### Taxas por Transação (referência - confirme no site oficial)

- **PIX**: A partir de 0,99%
- **Boleto Bancário**: A partir de R$ 2,49 por boleto
- **Cartão de Crédito**: A partir de 2,99% (depende do volume)
- **Cartão de Débito**: A partir de 1,99%

### Outras Taxas

- **Taxa de setup**: Geralmente grátis
- **Taxa de adesão**: Geralmente grátis
- **Taxa de antecipação**: Varia conforme o plano
- **Taxa de chargeback**: Varia por caso

**⚠️ IMPORTANTE:**
- As taxas podem variar conforme o volume de transações
- Entre em contato com o comercial do EFI para negociar taxas
- Consulte: https://gerencianet.com.br/preco

---

## 📋 10. Checklist Final

Antes de considerar a configuração concluída, verifique:

### Credenciais
- [ ] `EFI_CLIENT_ID` configurado no `.env`
- [ ] `EFI_CLIENT_SECRET` configurado no `.env`
- [ ] `EFI_WEBHOOK_SECRET` configurado no `.env` (opcional)
- [ ] `EFI_ENVIRONMENT` definido (`sandbox` ou `production`)
- [ ] Servidor Next.js reiniciado após alterações

### Webhook
- [ ] Webhook configurado no Dashboard do EFI
- [ ] URL do webhook está correta
- [ ] Eventos necessários selecionados
- [ ] Webhook testado e funcionando

### Ativação
- [ ] Gateway "EFI" ativado no painel SuperAdmin (`/admin/gateways`)
- [ ] Configurações salvas com sucesso

### Testes
- [ ] API `/api/gateways/active` retorna EFI como ativo
- [ ] Checkout completo testado (PIX, Boleto ou Cartão)
- [ ] Webhook recebido e processado com sucesso
- [ ] Acesso concedido ao usuário após pagamento
- [ ] Emails de boas-vindas e admin enviados
- [ ] Logs do servidor sem erros

---

## 📚 11. Recursos Adicionais

### Documentação Oficial do EFI
- **Portal de Desenvolvedores**: https://dev.efipay.com.br
- **API Reference**: https://dev.efipay.com.br/docs
- **Webhooks**: https://dev.efipay.com.br/docs/webhooks
- **Cartões de Teste**: https://dev.efipay.com.br/docs/testando-pagamentos

### Suporte do EFI
- **Email**: suporte@gerencianet.com.br
- **Chat**: Disponível no Dashboard
- **Telefone**: (35) 3529-1922
- **Central de Ajuda**: https://ajuda.gerencianet.com.br

### Comunidade
- **GitHub**: https://github.com/efipay
- **SDKs Oficiais**: Disponíveis em várias linguagens

---

## 🔄 12. Mudança de Ambiente (Teste → Produção)

Quando sua conta EFI for aprovada para produção:

1. **Obter credenciais de produção**:
   - Acesse o Dashboard do EFI
   - Vá em "API" → "Suas Aplicações"
   - Selecione ambiente "Produção"
   - Crie uma nova aplicação ou copie as credenciais existentes

2. **Criar webhook de produção**:
   - Vá em "API" → "Webhooks"
   - Crie um novo webhook para produção
   - Use a URL: `https://seu-dominio.com.br/api/webhook/efi`
   - Configure os eventos necessários

3. **Atualizar `.env`**:
   ```env
   EFI_CLIENT_ID=Client_Id_SUA_CREDENCIAL_DE_PRODUCAO
   EFI_CLIENT_SECRET=Client_Secret_SUA_CREDENCIAL_DE_PRODUCAO
   EFI_WEBHOOK_SECRET=seu_webhook_de_producao
   EFI_ENVIRONMENT=production
   ```

4. **Reiniciar o servidor**:
   ```bash
   pm2 restart nextjs
   ```

5. **Testar com pagamento real de baixo valor** (ex: R$ 1,00)

---

## ✅ Conclusão

Se você seguiu todos os passos acima, o gateway EFI (Gerencianet) está agora **completamente configurado e operacional** no sistema Clivus.

**Próximos passos:**
1. Configure outros gateways (se necessário)
2. Personalize as mensagens de email
3. Configure relatórios e dashboards financeiros
4. Monitore as transações no Dashboard do EFI

**Dúvidas?** Consulte a documentação oficial ou entre em contato com o suporte do EFI.

---

**Última atualização:** 19/11/2024  
**Versão:** 1.0
