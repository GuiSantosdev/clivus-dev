# 📊 Sistema de Leads & Remarketing - Guia Completo v2.0

## 🚀 Atualização de Novembro 2025

### ✨ **NOVAS FUNCIONALIDADES**

#### 1. **Botão Voltar** ✅
- Localizado no header da página
- Retorna para o painel SuperAdmin (`/admin`)

#### 2. **Filtros Avançados** ✅

##### **Filtros por Data**
- 📅 **Data Início:** Filtra leads cadastrados a partir de uma data específica
- 📅 **Data Fim:** Filtra leads cadastrados até uma data específica
- 💡 **Uso combinado:** Use ambos para criar um período customizado

##### **Filtros por Origem (Múltipla Seleção)**
- ☑️ **Landing Page:** Leads que preencheram o formulário
- ☑️ **Cadastro Completo:** Usuários que completaram o registro

##### **Filtros por Status (Múltipla Seleção)**
- ☑️ **Novos Leads:** Apenas preencheram formulário
- ☑️ **Cadastrados:** Criaram conta mas não tentaram comprar
- ☑️ **Checkout Iniciado:** Acessaram a página de checkout
- ☑️ **Pagamento Pendente:** Aguardando confirmação do gateway

##### **Botão "Limpar Filtros"**
- Remove todos os filtros aplicados com um clique
- Restaura a visualização completa

#### 3. **Exportação de Dados** 📥

##### **CSV (Comma-Separated Values)**
- Ideal para: Excel, Google Sheets, análises rápidas
- Tamanho: Pequeno
- Campos: Nome, Email, CPF/CNPJ, Origem, Status, Cadastro, Último Checkout
- **Formato do arquivo:** `leads_YYYY-MM-DD.csv`

##### **XLSX (Excel)**
- Ideal para: Excel, análises avançadas, relatórios profissionais
- Tamanho: Médio
- Campos: Nome, Email, CPF/CNPJ, Origem, Status, Cadastro, Último Checkout
- **Vantagens:** 
  - Formatação preservada
  - Fórmulas compatíveis
  - Múltiplas abas possíveis
- **Formato do arquivo:** `leads_YYYY-MM-DD.xlsx`

##### **PDF (Portable Document Format)**
- Ideal para: Apresentações, relatórios para impressão, compartilhamento
- Tamanho: Pequeno
- **Contém:**
  - Título do relatório
  - Data de geração
  - Estatísticas resumidas (totais)
  - Tabela completa de leads
- **Formato do arquivo:** `leads_YYYY-MM-DD.pdf`
- **Design:** Logo Clivus, cores corporativas, formatação profissional

---

## 📋 Como Usar as Novas Funcionalidades

### **1. Filtros Avançados**

#### **Cenário 1: Leads de Outubro que Abandonaram o Checkout**
```
1. Clique em "Filtros"
2. Data Início: 01/10/2025
3. Data Fim: 31/10/2025
4. Marque "Checkout Iniciado"
5. Resultado: Leads com ALTA intenção de compra em outubro
```

**💡 Ação de Remarketing:**
- Email: "Volte e ganhe 20% OFF"
- Urgência: "Oferta válida por 48h"

---

#### **Cenário 2: Cadastros da Landing Page nos Últimos 7 Dias**
```
1. Clique em "Filtros"
2. Data Início: [Hoje - 7 dias]
3. Marque "Landing Page" em Origem
4. Resultado: Leads recentes para nutrição
```

**💡 Ação de Remarketing:**
- Email 1: Boas-vindas + benefícios
- Email 2 (3 dias): Depoimentos
- Email 3 (7 dias): Oferta especial

---

#### **Cenário 3: Usuários Cadastrados Sem Checkout (Qualquer Data)**
```
1. Clique em "Filtros"
2. Marque "Cadastro Completo" em Origem
3. Marque "Cadastrados" em Status
4. Resultado: Usuários que criaram conta mas não compraram
```

**💡 Ação de Remarketing:**
- Email: "Complete seu cadastro e ganhe 10% OFF"
- Tutorial: Vídeo explicativo do sistema

---

#### **Cenário 4: Múltiplos Status para Remarketing Geral**
```
1. Clique em "Filtros"
2. Marque "Cadastrados" + "Checkout Iniciado" + "Pagamento Pendente"
3. Data Início: [Último mês]
4. Resultado: Todos os leads quentes do último mês
```

**💡 Ação de Remarketing:**
- Campanha unificada com mensagem personalizada por status

---

### **2. Exportação de Dados**

#### **Quando Usar Cada Formato**

##### **CSV - Análise Rápida**
```
✅ Importar no Google Sheets
✅ Análise de dados com Python/R
✅ Importar em ferramentas de CRM
✅ Enviar para equipe de vendas
```

**Exemplo de Uso:**
1. Exportar CSV
2. Abrir no Google Sheets
3. Criar fórmulas para calcular taxa de conversão
4. Compartilhar com equipe

---

##### **XLSX - Relatórios Profissionais**
```
✅ Apresentações em reuniões
✅ Análises com gráficos no Excel
✅ Relatórios mensais para diretoria
✅ Backup estruturado
```

**Exemplo de Uso:**
1. Exportar XLSX
2. Abrir no Excel
3. Criar gráficos dinâmicos
4. Adicionar análise de tendências
5. Salvar como template mensal

---

##### **PDF - Documentação Oficial**
```
✅ Relatórios para impressão
✅ Compartilhamento com stakeholders
✅ Arquivo final (não editável)
✅ Apresentações executivas
```

**Exemplo de Uso:**
1. Aplicar filtros desejados
2. Exportar PDF
3. Enviar para diretoria/investidores
4. Arquivar para histórico

---

## 🎯 Casos de Uso Práticos

### **Caso 1: Relatório Mensal para Diretoria**
```
1. Filtros:
   - Data Início: 01/11/2025
   - Data Fim: 30/11/2025
   - Status: Todos
   
2. Exportar: PDF

3. Resultado: Relatório completo de novembro para apresentação
```

---

### **Caso 2: Campanha de Black Friday (Leads Quentes)**
```
1. Filtros:
   - Data: Últimos 30 dias
   - Status: "Checkout Iniciado" + "Pagamento Pendente"
   
2. Exportar: CSV

3. Resultado: Lista de emails para campanha de remarketing urgente
```

---

### **Caso 3: Análise de Conversão por Origem**
```
1. Exportar XLSX (sem filtros) - dados completos

2. No Excel:
   - Tabela Dinâmica por Origem
   - Gráfico de conversão Landing vs Cadastro
   - Taxa de checkout por fonte
   
3. Resultado: Insights para otimizar captação
```

---

### **Caso 4: Backup Semanal Automatizado**
```
Toda segunda-feira:

1. Acessar /admin/leads
2. Exportar XLSX
3. Salvar em pasta "Backups/YYYY-MM-DD/"
4. Resultado: Histórico completo para análises futuras
```

---

## 📊 Estatísticas da Página

### **Cards de Métricas**
- 📊 **Total de Leads:** Soma de todos os leads
- 📧 **Landing Page:** Leads do formulário
- ✏️ **Cadastrados:** Usuários registrados
- 🛒 **Checkout Iniciado:** Tentativas de compra
- ⏱️ **Pagamento Pendente:** Aguardando confirmação

---

## 🔧 Configurações Técnicas

### **Bibliotecas Utilizadas**
```javascript
// Exportação XLSX
import * as XLSX from "xlsx";

// Exportação PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
```

### **Formato dos Arquivos**
```
leads_2025-11-19.csv   → CSV
leads_2025-11-19.xlsx  → Excel
leads_2025-11-19.pdf   → PDF
```

---

## 💡 Dicas de Produtividade

### **1. Segmentação Inteligente**
- Use múltiplos status para criar segmentos personalizados
- Combine filtros de data + origem para análises específicas

### **2. Workflow de Remarketing**
```
Segunda-feira:
- Exportar leads "Checkout Iniciado" (últimos 7 dias)
- Criar campanha de email com desconto

Quarta-feira:
- Exportar "Cadastrados" (14-21 dias atrás)
- Enviar tutorial do produto

Sexta-feira:
- Exportar "Pagamento Pendente"
- Ligar ou enviar WhatsApp
```

### **3. Análise de Tendências**
```
Mensal:
1. Exportar XLSX completo
2. Comparar com mês anterior
3. Identificar padrões:
   - Qual dia da semana tem mais cadastros?
   - Qual origem converte melhor?
   - Quanto tempo entre cadastro e checkout?
```

---

## ✅ Checklist de Uso

### **Remarketing Diário**
- [ ] Acessar /admin/leads
- [ ] Filtrar "Checkout Iniciado" (últimos 2 dias)
- [ ] Exportar CSV para CRM
- [ ] Criar campanha de email urgente

### **Relatório Semanal**
- [ ] Filtrar leads da semana
- [ ] Exportar XLSX
- [ ] Criar análise de conversão
- [ ] Compartilhar com equipe

### **Relatório Mensal**
- [ ] Filtrar leads do mês
- [ ] Exportar PDF
- [ ] Apresentar para diretoria
- [ ] Arquivar para histórico

---

## 🎉 Status de Deploy

| Funcionalidade | Status |
|----------------|--------|
| Botão Voltar | ✅ Implementado |
| Filtros por Data | ✅ Funcionando |
| Filtros Múltiplos (Origem) | ✅ Funcionando |
| Filtros Múltiplos (Status) | ✅ Funcionando |
| Exportação CSV | ✅ Funcionando |
| Exportação XLSX | ✅ Funcionando |
| Exportação PDF | ✅ Funcionando |
| Botão Limpar Filtros | ✅ Funcionando |
| Deploy Produção | ✅ https://clivus.marcosleandru.com.br |

---

## 🚀 Acesse Agora

```
https://clivus.marcosleandru.com.br/admin/leads
```

**Login SuperAdmin:**
- Email: superadmin@clivus.com
- Senha: superadmin123

---

**Data:** 19/11/2025  
**Versão:** 2.0.0  
**Deploy:** ✅ Produção  
**Documentação:** Completa  
**Novas Features:** Filtros Avançados + Exportação Multi-Formato
