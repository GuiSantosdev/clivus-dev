
# 🔐 Configuração de Login Social (Google e Facebook)

## ⚠️ IMPORTANTE: Configuração Manual Necessária

O sistema Clivus suporta login com Google e Facebook, mas as credenciais precisam ser configuradas manualmente.

**Status Atual:** Os botões de login social estão visíveis, mas não funcionarão até você configurar as credenciais OAuth.

---

## 📋 Por que Configurar Login Social?

### Vantagens:
- ✅ **Experiência do Usuário**: Login com 1 clique
- ✅ **Segurança**: Autenticação gerenciada pelo Google/Facebook
- ✅ **Conversão**: Menos fricção no cadastro = mais clientes
- ✅ **Confiabilidade**: OAuth 2.0 é o padrão da indústria

### Desvantagens:
- ⚠️ Requer configuração adicional
- ⚠️ Dependência de serviços externos
- ⚠️ Custos podem aplicar-se em escala (geralmente gratuito para uso normal)

---

## 🔧 Configuração do Google OAuth

### Passo 1: Criar Projeto no Google Cloud

1. Acesse https://console.cloud.google.com/
2. Clique em **"Select a project"** → **"New Project"**
3. Nome do projeto: **"Clivus"**
4. Clique em **"Create"**

### Passo 2: Habilitar Google+ API

1. No menu lateral, vá em **APIs & Services** → **Library**
2. Pesquise por **"Google+ API"**
3. Clique em **"Enable"**

### Passo 3: Criar Credenciais OAuth

1. Vá em **APIs & Services** → **Credentials**
2. Clique em **"Create Credentials"** → **"OAuth client ID"**
3. Se aparecer aviso sobre OAuth consent screen:
   - Clique em **"Configure Consent Screen"**
   - Selecione **"External"** (para uso público)
   - Preencha:
     - **App name:** Clivus
     - **User support email:** seu@email.com
     - **Developer contact:** seu@email.com
   - Clique em **"Save and Continue"** (pule as outras etapas)
4. Volte para **Credentials** → **"Create Credentials"** → **"OAuth client ID"**
5. Selecione **"Application type"**: **Web application**
6. Configure:
   - **Name:** Clivus Web
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://clivus.marcosleandru.com.br
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/api/auth/callback/google
     https://clivus.marcosleandru.com.br/api/auth/callback/google
     ```
7. Clique em **"Create"**
8. **COPIE** o **Client ID** e **Client Secret**

### Passo 4: Adicionar no .env

Edite o arquivo `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID="seu_client_id_aqui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu_client_secret_aqui"
```

---

## 🔵 Configuração do Facebook OAuth

### Passo 1: Criar App no Facebook

1. Acesse https://developers.facebook.com/
2. Clique em **"My Apps"** → **"Create App"**
3. Selecione **"Consumer"** (para login de usuários)
4. Preencha:
   - **App name:** Clivus
   - **App contact email:** seu@email.com
5. Clique em **"Create App"**

### Passo 2: Adicionar Facebook Login

1. No dashboard do app, clique em **"Add Product"**
2. Encontre **"Facebook Login"** e clique em **"Set Up"**
3. Selecione **"Web"**
4. Configure:
   - **Site URL:** `https://clivus.marcosleandru.com.br`
5. Clique em **"Save"**

### Passo 3: Configurar Redirect URIs

1. No menu lateral, vá em **Facebook Login** → **Settings**
2. Em **"Valid OAuth Redirect URIs"**, adicione:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://clivus.marcosleandru.com.br/api/auth/callback/facebook
   ```
3. Clique em **"Save Changes"**

### Passo 4: Obter Credenciais

1. Vá em **Settings** → **Basic**
2. **COPIE** o **App ID** e **App Secret** (clique em "Show")

### Passo 5: Tornar o App Público

**⚠️ IMPORTANTE:** Por padrão, o app está em modo de desenvolvimento (apenas você pode fazer login).

Para permitir que qualquer pessoa use:
1. Vá em **App Review** → **Permissions and Features**
2. Solicite aprovação para **"public_profile"** e **"email"**
3. Alternativamente, adicione testadores em **Roles** → **Test Users**

### Passo 6: Adicionar no .env

Edite o arquivo `.env`:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID="seu_app_id_aqui"
FACEBOOK_CLIENT_SECRET="seu_app_secret_aqui"
```

---

## ⚙️ Aplicar Configurações

### 1. Atualizar .env

Seu arquivo `.env` deve conter:

```env
# NextAuth
NEXTAUTH_URL="https://clivus.marcosleandru.com.br"
NEXTAUTH_SECRET="sua_chave_secreta_gerada"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"

# Facebook OAuth
FACEBOOK_CLIENT_ID="1234567890123456"
FACEBOOK_CLIENT_SECRET="abcdef1234567890abcdef1234567890"
```

### 2. Reiniciar o Servidor

**CRÍTICO:** O Next.js só lê variáveis de ambiente na inicialização.

```bash
# Parar o servidor
pkill -f "next dev"

# Iniciar novamente
cd /home/ubuntu/clivus_landing_page/nextjs_space
yarn dev
```

### 3. Testar

1. Acesse http://localhost:3000/login
2. Clique em **"Entrar com Google"** ou **"Entrar com Facebook"**
3. Faça login com sua conta
4. Você deve ser redirecionado para `/dashboard`

---

## 🧪 Testando em Produção

### URLs de Produção

Certifique-se de que configurou corretamente:

**Google:**
- Authorized JavaScript origins: `https://clivus.marcosleandru.com.br`
- Redirect URI: `https://clivus.marcosleandru.com.br/api/auth/callback/google`

**Facebook:**
- Valid OAuth Redirect URI: `https://clivus.marcosleandru.com.br/api/auth/callback/facebook`

### Testar

1. Acesse https://clivus.marcosleandru.com.br/login
2. Teste login com Google e Facebook
3. Verifique se o usuário é criado no banco de dados

---

## 🔍 Troubleshooting

### ❌ Erro "redirect_uri_mismatch" (Google)

**Causa:** URL de redirecionamento não configurada corretamente.

**Solução:**
1. Vá no Google Cloud Console → Credentials
2. Edite o OAuth Client ID
3. Adicione exatamente: `https://seu-dominio.com/api/auth/callback/google`
4. **NÃO** adicione barra (`/`) no final

### ❌ Erro "Can't Load URL" (Facebook)

**Causa:** URL não autorizada no Facebook Developers.

**Solução:**
1. Vá no Facebook Developers → Facebook Login → Settings
2. Adicione a URL exata em "Valid OAuth Redirect URIs"
3. Certifique-se de salvar as mudanças

### ❌ Login funciona em localhost, mas não em produção

**Causa:** Variáveis de ambiente não configuradas no servidor.

**Solução:**
1. Verifique o `.env` no servidor
2. Confirme que `NEXTAUTH_URL` aponta para o domínio de produção
3. Reinicie o servidor após qualquer alteração

### ❌ Usuário não é criado no banco após login social

**Causa:** PrismaAdapter não está configurado corretamente.

**Solução:**
1. Verifique se o Prisma está conectado: `yarn prisma db push`
2. Confira os models `User`, `Account`, `Session` no `schema.prisma`
3. Verifique logs do servidor para erros de banco

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca compartilhe** suas credenciais OAuth
2. **Use HTTPS** em produção (obrigatório para OAuth)
3. **Revogue credenciais** antigas se suspeitar de vazamento
4. **Monitore acessos** nos dashboards do Google/Facebook
5. **Restrinja domínios** autorizados (não use wildcards)

### Rotação de Credenciais

**Recomendação:** Rotacione credenciais OAuth a cada 6-12 meses.

**Como fazer:**
1. Gere novas credenciais no console do provedor
2. Atualize o `.env` com as novas
3. Teste extensivamente
4. Revogue as credenciais antigas

---

## 📊 Monitoramento

### Google Cloud Console

- Dashboard: https://console.cloud.google.com/
- Monitore: Tentativas de login, erros, quotas

### Facebook Developers

- Dashboard: https://developers.facebook.com/
- Monitore: Logins, erros, status do app

---

## 💰 Custos

### Google OAuth
- ✅ **Gratuito** para até 100.000 logins/dia
- 💵 Acima disso, consulte pricing do Google Cloud

### Facebook OAuth
- ✅ **Gratuito** para uso normal
- ⚠️ Apps em produção requerem aprovação (processo gratuito)

---

## ✅ Checklist de Configuração

### Google OAuth
- [ ] Projeto criado no Google Cloud
- [ ] Google+ API habilitada
- [ ] OAuth Client ID criado
- [ ] Redirect URIs configuradas (localhost + produção)
- [ ] Client ID e Secret copiados
- [ ] Variáveis adicionadas ao `.env`
- [ ] Servidor reiniciado
- [ ] Teste realizado com sucesso

### Facebook OAuth
- [ ] App criado no Facebook Developers
- [ ] Facebook Login configurado
- [ ] Redirect URIs configuradas (localhost + produção)
- [ ] App ID e Secret copiados
- [ ] Variáveis adicionadas ao `.env`
- [ ] App publicado ou testadores adicionados
- [ ] Servidor reiniciado
- [ ] Teste realizado com sucesso

---

## 📞 Suporte

### Problemas com Google OAuth
- Docs: https://developers.google.com/identity/protocols/oauth2
- Suporte: https://support.google.com/cloud

### Problemas com Facebook OAuth
- Docs: https://developers.facebook.com/docs/facebook-login
- Suporte: https://developers.facebook.com/support/bugs

---

**Última atualização:** 18/11/2024  
**Versão do documento:** 1.0
