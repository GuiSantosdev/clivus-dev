
# 🔧 Configuração do Webhook Asaas

## ⚠️ IMPORTANTE: Configuração Obrigatória

Para que os pagamentos do Asaas funcionem corretamente e liberem o acesso automaticamente, você **DEVE** configurar o webhook no painel do Asaas.

---

## 📋 Passo a Passo

### 1️⃣ Acessar o Painel Asaas

1. Acesse https://www.asaas.com/
2. Faça login com suas credenciais
3. Vá em **Configurações** no menu lateral

### 2️⃣ Configurar Webhook

1. No menu de configurações, clique em **Integrações**
2. Clique em **Webhooks**
3. Clique em **Adicionar Webhook** ou **Novo Webhook**

### 3️⃣ Configurar URL do Webhook

**URL de Produção:**
```
https://clivus.marcosleandru.com.br/api/webhook/asaas
```

**URL de Desenvolvimento (Teste Local):**
```
http://localhost:3000/api/webhook/asaas
```

**⚠️ ATENÇÃO:** 
- Use a URL de PRODUÇÃO quando o sistema estiver no ar
- A URL de desenvolvimento só funciona para testes locais

### 4️⃣ Selecionar Eventos

Marque os seguintes eventos para receber notificações:

✅ **PAYMENT_RECEIVED** - Pagamento recebido  
✅ **PAYMENT_CONFIRMED** - Pagamento confirmado  
✅ **PAYMENT_OVERDUE** - Pagamento vencido  
✅ **PAYMENT_DELETED** - Pagamento cancelado  
✅ **PAYMENT_REFUNDED** - Pagamento reembolsado  

### 5️⃣ Configurar Autenticação (Opcional mas Recomendado)

1. Gere um **Token de Webhook** no painel do Asaas
2. Copie o token gerado
3. Atualize o arquivo `.env` com o token:
   ```env
   ASAAS_WEBHOOK_SECRET="seu_token_aqui"
   ```

### 6️⃣ Salvar e Ativar

1. Clique em **Salvar**
2. Certifique-se de que o webhook está **ATIVO**
3. Teste fazendo um pagamento de teste

---

## 🧪 Testando o Webhook

### Método 1: Pagamento Real de Teste

1. Faça um cadastro de teste no sistema
2. Escolha um plano
3. Faça um pagamento PIX de teste (valor mínimo)
4. Aguarde a confirmação
5. Verifique se o acesso foi liberado automaticamente

### Método 2: Simulação no Painel Asaas

1. No painel Asaas, vá em **Webhooks**
2. Clique no webhook criado
3. Clique em **Testar Webhook**
4. Escolha o evento `PAYMENT_RECEIVED`
5. Envie o teste
6. Verifique os logs no console do servidor

### Método 3: Verificar Logs do Servidor

Execute o comando para ver os logs em tempo real:

```bash
# Ver logs do servidor Next.js
cd /home/ubuntu/clivus_landing_page/nextjs_space
yarn dev
```

Procure por mensagens como:
```
📩 Webhook Asaas recebido: {...}
📊 Status Asaas: PAYMENT_RECEIVED → Status interno: completed
✅ Pagamento confirmado!
✅ Processamento completo: acesso liberado, emails enviados!
```

---

## 🔍 Troubleshooting (Resolução de Problemas)

### ❌ Webhook não está sendo recebido

**Possíveis causas:**

1. **URL incorreta**
   - Verifique se a URL está correta no painel Asaas
   - Certifique-se de usar HTTPS em produção
   - Teste a URL manualmente: `curl https://seu-dominio.com.br/api/webhook/asaas`

2. **Firewall bloqueando**
   - Verifique se o servidor permite requisições do IP do Asaas
   - Adicione o IP do Asaas na whitelist se necessário

3. **Servidor offline**
   - Verifique se o servidor está rodando
   - Teste acessando: https://seu-dominio.com.br

### ❌ Pagamento não libera acesso

**Possíveis causas:**

1. **externalReference incorreto**
   - Verifique se o `externalReference` do pagamento Asaas corresponde ao `id` do pagamento no banco
   - Logs devem mostrar: `📩 Webhook Asaas recebido: {...}`

2. **Status não está sendo mapeado corretamente**
   - Verifique os logs do servidor
   - Procure por: `📊 Status Asaas: X → Status interno: Y`

3. **Email não está sendo enviado**
   - Verifique se `RESEND_API_KEY` está configurada
   - Teste envio manual de email

### ❌ Erro "Token Asaas não configurado"

**Solução:**

1. Verifique se o token está no arquivo `.env`:
   ```bash
   grep ASAAS_API_KEY /home/ubuntu/clivus_landing_page/nextjs_space/.env
   ```

2. Se o token não estiver lá, adicione:
   ```env
   ASAAS_API_KEY="seu_token_aqui"
   ```

3. **IMPORTANTE:** Reinicie o servidor Next.js após adicionar:
   ```bash
   # Matar o servidor atual
   pkill -f "next dev"
   
   # Iniciar novamente
   cd /home/ubuntu/clivus_landing_page/nextjs_space
   yarn dev
   ```

---

## 📊 Monitoramento

### Ver Histórico de Webhooks no Asaas

1. Acesse **Integrações** → **Webhooks**
2. Clique no webhook configurado
3. Veja o **Histórico de Envios**
4. Verifique:
   - ✅ Status 200 = Webhook recebido com sucesso
   - ❌ Status 4xx ou 5xx = Erro no recebimento

### Ver Logs no Servidor

```bash
# Logs em tempo real
cd /home/ubuntu/clivus_landing_page/nextjs_space
yarn dev | grep -E "Webhook|Asaas|Pagamento"
```

---

## 🔐 Segurança

### Validação de Webhook

O sistema verifica:

1. ✅ Estrutura do payload (event, payment)
2. ✅ Existência do pagamento no banco
3. ✅ Token de webhook (se configurado)

### Boas Práticas

1. **Use HTTPS em produção** (nunca HTTP)
2. **Configure o ASAAS_WEBHOOK_SECRET** para validar requisições
3. **Monitore os logs** regularmente
4. **Teste webhooks** após cada atualização do sistema

---

## 📞 Suporte

Se continuar com problemas após seguir este guia:

1. Verifique os logs do servidor
2. Verifique o histórico de webhooks no painel Asaas
3. Entre em contato com o suporte técnico do Asaas
4. Envie os logs para análise

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo está configurado:

- [ ] Token Asaas configurado no `.env`
- [ ] Webhook criado no painel Asaas
- [ ] URL do webhook correta (HTTPS em produção)
- [ ] Eventos selecionados (PAYMENT_RECEIVED, CONFIRMED, etc.)
- [ ] Webhook ativo no painel Asaas
- [ ] Servidor rodando e acessível
- [ ] Teste de pagamento realizado com sucesso
- [ ] Acesso liberado automaticamente após pagamento
- [ ] Email de boas-vindas recebido
- [ ] Logs mostrando processamento correto

---

**Última atualização:** 18/11/2024  
**Versão do documento:** 1.0
