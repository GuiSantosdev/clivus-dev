
# 🔧 Guia de Solução de Problemas - Checkout

## ❌ Erro: "Erro ao criar sessão de pagamento"

### Possíveis Causas e Soluções

#### 1️⃣ **Sessão não estabelecida após cadastro**

**Sintoma:**
- Usuário faz cadastro
- É redirecionado de volta para o checkout
- Ao clicar em "Comprar Agora", recebe erro

**Causa:**
- A sessão do NextAuth pode demorar 1-2 segundos para se estabelecer completamente após o login automático

**Solução:**
- ✅ **RESOLVIDO** automaticamente: O sistema agora:
  - Aguarda 1 segundo antes de redirecionar após o cadastro
  - Reutiliza pagamentos pendentes criados nos últimos 5 minutos
  - Adiciona logs detalhados para debug

**Teste:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Acesse: https://clivus.marcosleandru.com.br/checkout?plan=intermediate
3. Faça um novo cadastro
4. Aguarde o redirecionamento automático
5. Clique em "Comprar Agora"
6. **DEVE:** Redirecionar para o Asaas

---

#### 2️⃣ **Token Asaas não configurado**

**Sintoma:**
- Erro: "Sistema de pagamento Asaas não configurado"

**Causa:**
- Variável `ASAAS_API_KEY` ausente ou vazia no `.env`

**Solução:**
```bash
# 1. Verifique o arquivo .env:
cat /home/ubuntu/clivus_landing_page/nextjs_space/.env | grep ASAAS

# 2. Se vazio, configure:
# Acesse: SuperAdmin → Gateways → Asaas
# Insira sua chave e clique em "Salvar Configurações"

# 3. Reinicie o servidor:
cd /home/ubuntu/clivus_landing_page/nextjs_space
pm2 restart clivus
```

---

#### 3️⃣ **Duplicação de pagamentos**

**Sintoma:**
- Usuário clica múltiplas vezes em "Comprar Agora"
- Múltiplos registros de pagamento criados

**Solução:**
- ✅ **RESOLVIDO**: O sistema agora:
  - Verifica se existe um pagamento pendente criado nos últimos 5 minutos
  - Reutiliza o pagamento existente ao invés de criar um novo
  - Evita duplicação automática

---

#### 4️⃣ **Erro na API do Asaas**

**Sintoma:**
- Erro: "Erro ao processar pagamento com Asaas"
- Mensagem com detalhes do erro

**Causa:**
- Token Asaas inválido ou expirado
- Limite de requisições excedido
- Erro na API do Asaas (indisponibilidade temporária)

**Solução:**
1. **Verifique o token:**
   ```bash
   # SuperAdmin → Configurações
   # Clique em "Testar Geolocalização" (para verificar conexão)
   ```

2. **Verifique os logs do servidor:**
   ```bash
   cd /home/ubuntu/clivus_landing_page/nextjs_space
   pm2 logs clivus --lines 50
   ```

3. **Teste manualmente a API do Asaas:**
   ```bash
   curl -H "access_token: YOUR_ASAAS_API_KEY" \
     https://sandbox.asaas.com/api/v3/customers
   ```

4. **Verifique o status do Asaas:**
   - Acesse: https://status.asaas.com/

---

## 📊 Logs Detalhados

### Como verificar logs em tempo real:

```bash
# 1. Acesse o servidor
cd /home/ubuntu/clivus_landing_page/nextjs_space

# 2. Visualize logs em tempo real
pm2 logs clivus --lines 100

# 3. Procure por estas mensagens:
# ✅ Sucesso:
# "🎉 [Checkout API] Checkout concluído com sucesso!"

# ❌ Erros:
# "❌ [Checkout API] Não autorizado - sem sessão"
# "❌ [Checkout API] Token Asaas não configurado!"
# "❌ [Checkout API] Erro ao processar com Asaas:"
```

### Exemplo de log bem-sucedido:

```
🛒 [Checkout API] Iniciando processamento...
👤 [Checkout API] Sessão: { temSessao: true, temUser: true, userEmail: 'teste@example.com' }
📦 [Checkout API] Dados recebidos: { planSlug: 'intermediate', gateway: 'asaas' }
✅ [Checkout API] Plano encontrado: { nome: 'Intermediário', preco: 147 }
👤 [Checkout API] Dados do usuário: { userId: '...', userName: 'João Silva', userEmail: 'teste@example.com', temCpf: true, temCnpj: false }
💳 [Checkout API] Criando novo registro de pagamento...
✅ [Checkout API] Pagamento criado: clxxxxxxxxx
💳 [Checkout API] Processando com Asaas...
🔑 [Checkout API] Verificando token Asaas...
✅ [Checkout API] Token Asaas encontrado!
👤 [Checkout API] Criando/buscando cliente no Asaas...
✅ [Checkout API] Cliente Asaas: cus_xxxxxxxxxx
🔗 [Checkout API] Criando link de pagamento...
✅ [Checkout API] Link criado: { id: 'pay_xxxxxxxxxx', url: 'https://...' }
💾 [Checkout API] Atualizando registro de pagamento...
✅ [Checkout API] Pagamento atualizado com sucesso!
🎉 [Checkout API] Checkout concluído com sucesso!
```

---

## 🔍 Checklist de Verificação

Use este checklist para diagnosticar problemas:

### ✅ **Antes do Deploy:**

- [ ] `.env` possui `ASAAS_API_KEY` configurada
- [ ] `.env` possui `ASAAS_ENVIRONMENT` (sandbox ou production)
- [ ] `.env` possui `NEXT_PUBLIC_APP_URL` correta
- [ ] `.env` possui `NEXTAUTH_URL` e `NEXTAUTH_SECRET`
- [ ] Servidor Next.js foi reiniciado após alteração do `.env`

### ✅ **Durante o Teste:**

- [ ] Usuário consegue acessar `/checkout?plan=intermediate`
- [ ] Se não logado, é redirecionado para `/cadastro?...`
- [ ] Após cadastro, é redirecionado de volta para `/checkout`
- [ ] Ao clicar em "Comprar Agora", **não** vê erro de sessão
- [ ] É redirecionado para a página do Asaas

### ✅ **Pós-Cadastro:**

- [ ] SuperAdmin → Clientes → Novo cliente aparece
- [ ] SuperAdmin → Vendas → Novo pagamento aparece (status: pending)
- [ ] Logs do servidor **não** mostram erros

---

## 🚨 Problemas Conhecidos e Resolvidos

| Problema | Status | Solução |
|----------|--------|---------|
| Sessão não estabelecida após cadastro | ✅ **RESOLVIDO** | Adicionado delay de 1s + logs detalhados |
| Duplicação de pagamentos | ✅ **RESOLVIDO** | Reutilização de pagamentos pendentes (5min) |
| Erro "Não autorizado" após cadastro | ✅ **RESOLVIDO** | Melhor tratamento de sessão |
| Falta de logs de debug | ✅ **RESOLVIDO** | Logs detalhados em cada etapa |

---

## 📞 Suporte Técnico

Se o problema persistir após seguir este guia:

1. **Colete os logs:**
   ```bash
   pm2 logs clivus --lines 200 > ~/checkout-error-$(date +%Y%m%d-%H%M%S).log
   ```

2. **Envie as informações:**
   - Arquivo de log gerado
   - Hora exata do erro
   - Passos que o usuário seguiu
   - Mensagem de erro exibida no navegador

3. **Contato:**
   - Email: [seu-email-aqui]
   - Verificar console do navegador (F12 → Console)

---

## 🎯 Próximas Melhorias

- [ ] Adicionar retry automático em caso de falha temporária
- [ ] Implementar fila de pagamentos para alta demanda
- [ ] Adicionar métricas de tempo de resposta
- [ ] Criar dashboard de monitoramento de erros

---

**Última atualização:** 19/11/2024  
**Versão:** 1.0
