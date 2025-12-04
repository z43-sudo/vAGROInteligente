# ☁️ CONFIGURAÇÃO DA API DO CLIMA - OpenWeatherMap

## ✅ CORREÇÃO APLICADA

**Problema identificado e corrigido:**
- ❌ Código usava: `VITE_WEATHER_API_KEY`
- ✅ Agora usa: `VITE_OPENWEATHER_API_KEY`

**Arquivos corrigidos:**
1. `services/weatherService.ts` - Variável de ambiente corrigida
2. `vite-env.d.ts` - Tipagem TypeScript atualizada

---

## 📋 STATUS ATUAL

### Sem API Key (Padrão)
- ⚠️ **Status**: Funcionando com dados mockados
- 📊 **Dados**: Temperatura, umidade, vento (valores fixos)
- 🌡️ **Temperatura**: Sempre 28°C
- 📍 **Localização**: "Fazenda Santa Fé" (fictícia)
- ✅ **Funciona?**: Sim, mas com dados falsos

### Com API Key Configurada
- ✅ **Status**: Dados reais do OpenWeatherMap
- 📊 **Dados**: Temperatura, umidade, vento, pressão, precipitação
- 🌍 **Localização**: Baseada em GPS ou cidade
- 🔄 **Atualização**: A cada 10 minutos
- ⏱️ **Previsão**: 5 dias

---

## 🔧 COMO CONFIGURAR (OPCIONAL)

### **Passo 1: Criar conta no OpenWeatherMap**

1. Acesse: https://openweathermap.org/api
2. Clique em **"Sign Up"** (Cadastrar)
3. Preencha o formulário:
   - Email
   - Senha
   - Nome de usuário
4. Confirme seu email

---

### **Passo 2: Obter API Key**

1. Faça login em: https://home.openweathermap.org/
2. Vá em: **"API keys"** no menu
3. Você verá uma chave padrão já criada
4. **Copie** a chave (formato: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

⚠️ **IMPORTANTE**: A chave pode levar até 2 horas para ser ativada!

---

### **Passo 3: Adicionar no .env.local**

Abra o arquivo `.env.local` e adicione:

```env
VITE_SUPABASE_URL=https://xggncpobnnzbmykyqywn.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_supabase_aqui
VITE_OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### **Passo 4: Reiniciar o servidor**

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

---

### **Passo 5: Verificar**

1. Acesse o app
2. Vá para a página do **Clima** ou **Dashboard**
3. Verifique se os dados mudaram
4. Abra o console (F12) e veja se não há mais o aviso:
   ```
   API Key do clima não configurada. Usando dados mockados.
   ```

---

## 🌍 FUNCIONALIDADES DA API

### Com API Key Configurada:

#### 1. **Clima Atual**
- 🌡️ Temperatura real
- 💨 Velocidade do vento
- 💧 Umidade
- 🌧️ Precipitação
- 📊 Pressão atmosférica
- 📍 Localização real

#### 2. **Previsão de 5 Dias**
- 📅 Hoje, Amanhã, e próximos 3 dias
- 🌡️ Temperatura prevista
- ☁️ Condição do tempo
- 🎨 Ícones do clima

#### 3. **Geolocalização**
- 📍 Detecta localização automática
- 🗺️ Ou busca por cidade
- 🌎 Suporta qualquer lugar do mundo

#### 4. **Atualização Automática**
- 🔄 Atualiza a cada 10 minutos
- ⏱️ Mostra hora da última atualização
- 🔔 Sem necessidade de recarregar a página

---

## 📊 COMPARAÇÃO

| Recurso | Sem API Key | Com API Key |
|---------|-------------|-------------|
| Temperatura | ❌ Fixa (28°C) | ✅ Real |
| Localização | ❌ Fictícia | ✅ Real (GPS) |
| Previsão | ❌ Dados fixos | ✅ 5 dias reais |
| Atualização | ❌ Nunca | ✅ A cada 10min |
| Umidade | ❌ Fixa (65%) | ✅ Real |
| Vento | ❌ Fixo (12km/h) | ✅ Real |
| Precipitação | ❌ Fixa (2mm) | ✅ Real |

---

## 🆓 PLANO GRATUITO

O plano gratuito do OpenWeatherMap inclui:

- ✅ **60 chamadas/minuto**
- ✅ **1.000.000 chamadas/mês**
- ✅ **Clima atual**
- ✅ **Previsão de 5 dias**
- ✅ **Dados históricos (1 dia)**
- ✅ **Sem custo**

**Mais que suficiente para este app!**

---

## 🔍 VERIFICAÇÃO

### Como saber se está funcionando?

#### **Console do Navegador (F12):**

**Sem API Key:**
```
⚠️ API Key do clima não configurada. Usando dados mockados.
```

**Com API Key (correta):**
```
(Nenhum aviso sobre clima)
```

**Com API Key (incorreta ou inativa):**
```
❌ Erro ao buscar clima: Error: Erro ao buscar dados do clima
⚠️ API Key do clima não configurada. Usando dados mockados.
```

---

## 🚨 PROBLEMAS COMUNS

### **1. "Invalid API key"**
**Causa**: Chave incorreta ou ainda não ativada  
**Solução**: 
- Verifique se copiou a chave completa
- Aguarde até 2 horas após criar a conta
- Gere uma nova chave no painel

---

### **2. "401 Unauthorized"**
**Causa**: Chave não ativada ainda  
**Solução**: Aguarde 1-2 horas e tente novamente

---

### **3. Continua mostrando dados mockados**
**Causa**: Servidor não foi reiniciado  
**Solução**: 
1. Pare o servidor (Ctrl+C)
2. Reinicie: `npm run dev`

---

### **4. "429 Too Many Requests"**
**Causa**: Excedeu limite de chamadas  
**Solução**: 
- Plano gratuito: 60 chamadas/minuto
- Aguarde 1 minuto e tente novamente
- Aumente o intervalo de atualização

---

## 📝 RESUMO

### ✅ **Correções Aplicadas:**
1. Variável renomeada: `VITE_WEATHER_API_KEY` → `VITE_OPENWEATHER_API_KEY`
2. Tipagem TypeScript atualizada
3. Comentários no código corrigidos

### 🎯 **Próximos Passos (Opcional):**
1. Criar conta no OpenWeatherMap
2. Obter API Key
3. Adicionar no `.env.local`
4. Reiniciar servidor
5. Verificar dados reais

### ⚠️ **Importante:**
- **Sem API Key**: App funciona normalmente com dados mockados
- **Com API Key**: Dados reais e atualizados
- **Configuração**: Totalmente opcional

---

**Data**: 2025-12-04  
**Status**: ✅ API do Clima Corrigida e Funcionando  
**Modo Atual**: Dados Mockados (até configurar API Key)
