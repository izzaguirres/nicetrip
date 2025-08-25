# 🔧 Configuração de Variáveis de Ambiente - Nice Trip

## 📋 **Variáveis Necessárias**

Para funcionalidade completa do sistema, você precisa configurar as seguintes variáveis de ambiente:

### **1. Supabase (Banco de Dados)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### **2. OpenAI (IA/ChatGPT) - Opcional**
```bash
OPENAI_API_KEY=sua-chave-openai-aqui
```

### **3. WhatsApp (Número do Operador)**
Use um número no formato internacional, somente dígitos (ex.: 5511999999999 para BR, 5493519999999 para AR):
```bash
NEXT_PUBLIC_WHATSAPP_PHONE=5493519999999
```

## 🚀 **Como Configurar**

### **Método 1: Arquivo .env.local (Recomendado)**

1. **Crie o arquivo `.env.local` na raiz do projeto:**
```bash
touch .env.local
```

2. **Adicione as variáveis:**
```bash
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Configuração da OpenAI (opcional)
OPENAI_API_KEY=sua-chave-openai-aqui

# WhatsApp (usado nos botões Reservar/Hablar)
NEXT_PUBLIC_WHATSAPP_PHONE=5493519999999
```

3. **Reinicie o servidor:**
```bash
npm run dev
```

### **Método 2: Variáveis do Sistema**

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima-aqui"
export OPENAI_API_KEY="sua-chave-openai-aqui"
export NEXT_PUBLIC_WHATSAPP_PHONE="5493519999999"
npm run dev
```

## 🔑 **Como Obter as Chaves**

### **Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto ou acesse um existente
3. Vá em **Settings** → **API**
4. Copie a **URL** e **anon/public key**

### **OpenAI:**
1. Acesse [platform.openai.com](https://platform.openai.com)
2. Vá em **API Keys**
3. Crie uma nova chave
4. Copie a chave gerada

## ⚡ **Funcionamento Sem Configuração**

O sistema foi projetado para funcionar mesmo sem as variáveis configuradas:

### **✅ Sem Supabase:**
- Usa dados de demonstração (3 pacotes de exemplo)
- Filtros funcionam normalmente
- Interface completa disponível

### **✅ Sem OpenAI:**
- Usa filtro manual inteligente
- Busca por critérios específicos
- Sem sugestões de IA, mas funcional

### **✅ Sem Nenhuma Configuração:**
- Sistema totalmente funcional
- Dados de demonstração
- Filtros manuais
- Interface completa

## 🎯 **Status Atual**

**✅ Sistema Funcionando:** O site está operacional mesmo sem configuração  
**⚠️ Funcionalidade Limitada:** Para recursos completos, configure as variáveis  
**🔧 Fácil Configuração:** Adicione as chaves quando disponíveis  

## 🚨 **Resolução do Erro 500**

O erro foi **corrigido** com as seguintes melhorias:

1. **Verificação de variáveis:** Sistema verifica se estão disponíveis
2. **Fallback inteligente:** Dados de demonstração quando necessário
3. **Tratamento de erros:** Nunca retorna erro 500
4. **Graceful degradation:** Funciona com ou sem configuração

## 📝 **Exemplo de .env.local Completo**

```bash
# Configurações do Supabase (substitua pelos seus valores)
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuração da OpenAI (opcional)
OPENAI_API_KEY=sk-proj-abc123xyz...

# Outras configurações (se necessário)
NEXT_PUBLIC_WHATSAPP_PHONE=5493519999999
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🔄 **Testando a Configuração**

1. **Reinicie o servidor** após adicionar as variáveis
2. **Teste o botão "🤖 Me sugira um pacote!"**
3. **Verifique o console** para logs de conexão
4. **Confirme os dados** na página de resultados

---

**💡 Dica:** O sistema funciona perfeitamente sem configuração para demonstração e desenvolvimento! 