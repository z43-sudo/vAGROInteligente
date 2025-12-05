# 🚀 GUIA DE INÍCIO RÁPIDO - AGRO INTELIGENTE

## ⚡ Start Rápido (3 passos)

### 1️⃣ Instalar Dependências (se ainda não instalou)
```bash
npm install
```

### 2️⃣ Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

### 3️⃣ Acessar Aplicação
Abra o navegador em: **http://localhost:3000**

---

## 🔐 Fazer Login

### Opção 1: Modo Mock (Desenvolvimento)
- **Email:** qualquer@teste.com
- **Senha:** qualquer123
- ⚠️ Os dados ficam apenas no localStorage

### Opção 2: Modo Real (Com Supabase)
- **Email:** seu-email-cadastrado@email.com
- **Senha:** sua-senha
- ✅ Dados sincronizados com o banco de dados

### Opção 3: Admin
- **Email:** wallisom_53@outlook.com
- **Senha:** sua-senha
- 🛡️ Acesso ao painel administrativo

---

## 📍 Páginas Principais

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard principal com métricas |
| `/safras` | Gestão de safras e cultivos |
| `/maquinas` | Controle de máquinas agrícolas |
| `/pecuaria` | Gestão de rebanho e gado |
| `/estoque` | Controle de inventário |
| `/financeiro` | Gestão financeira |
| `/atividades` | Atividades da fazenda |
| `/logistica` | Mapas e rotas de logística |
| `/transporte` | Gestão de veículos e fretes |
| `/clima` | Previsão do tempo |
| `/equipe` | Gerenciar equipe |
| `/chat` | Chat em tempo real |
| `/noticias` | Notícias do agronegócio |
| `/parceiros` | Parceiros estratégicos |
| `/perfil` | Seu perfil de usuário |
| `/admin` | Painel administrativo (admin only) |

---

## 🧪 Testar Funcionalidades

### ✅ Adicionar uma Safra
1. Acesse `/safras`
2. Clique em "➕ Nova Safra"
3. Preencha os dados
4. Clique em "Salvar"

### ✅ Adicionar uma Máquina
1. Acesse `/maquinas`
2. Clique em "Adicionar Máquina"
3. Preencha formulário
4. Salvar

### ✅ Adicionar Item ao Estoque
1. Acesse `/estoque`
2. Clique em "Adicionar Item"
3. Preencha categoria, nome, quantidade
4. Salvar

### ✅ Ver Clima em Tempo Real
1. Acesse `/clima`
2. Permita geolocalização no navegador
3. Veja clima da sua localização
4. Confira previsão de 5 dias

### ✅ Chat em Tempo Real
1. Acesse `/chat`
2. Envie mensagens
3. Abra em outra aba (mesmo farm_id)
4. Veja mensagens sincronizando

### ✅ Ver Notícias do Agronegócio
1. Acesse `/noticias`
2. Filtre por tema (Mercado, Clima, Política, etc.)
3. Leia highlights do dia
4. Confira resumo semanal

### ✅ Logística e Mapas
1. Acesse `/logistica`
2. Veja mapa 3D interativo
3. Localize frigoríficos próximos
4. Calcule rotas GPS

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Inicia servidor de desenvolvimento
```

### Produção
```bash
npm run build           # Gera build de produção
npm run preview         # Preview do build
```

### Limpar Cache
```bash
# PowerShell
Remove-Item -Recurse -Force node_modules\.vite

# Então reinicie
npm run dev
```

---

## 🔧 Configuração do Supabase

### Se quiser usar seu próprio Supabase:

1. **Edite o arquivo `.env`:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

2. **Execute os scripts SQL (nesta ordem):**
```sql
-- 1. Limpar banco (se necessário)
LIMPAR_SUPABASE_COMPLETO.sql

-- 2. Criar tabelas
PARTE_1_TABELAS.sql

-- 3. Criar políticas RLS
PARTE_2_POLITICAS.sql

-- 4. Criar triggers
PARTE_3_TRIGGERS.sql

-- 5. Ativar Realtime
ATIVAR_REALTIME.sql
```

3. **Reinicie o servidor:**
```bash
# Pare o servidor (Ctrl + C)
npm run dev
```

---

## 🐛 Solução de Problemas

### Problema: Porta 3000 em uso
**Solução:**
```bash
# Encontrar processo usando porta 3000
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <número-do-pid> /F

# Ou edite vite.config.ts e mude para porta 3001
```

### Problema: Erro de importação
**Solução:**
```bash
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Problema: Supabase não conecta
**Solução:**
1. Verifique `.env` está na raiz
2. Confirme URL e chave corretas
3. Reinicie o servidor
4. Se não funcionar, o app funciona em modo mock

### Problema: Tela branca
**Solução:**
1. Abra o console do navegador (F12)
2. Veja erros no console
3. Limpe cache do navegador (Ctrl + Shift + Delete)
4. Recarregue a página (Ctrl + F5)

---

## 📚 Recursos

### Documentação Oficial
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

### APIs Usadas
- [OpenWeatherMap](https://openweathermap.org/api)
- [Google Gemini](https://ai.google.dev/)
- [Leaflet](https://leafletjs.com/)

---

## 🎯 Próximos Passos

1. ✅ Fazer login no sistema
2. ✅ Explorar todas as páginas
3. ✅ Adicionar dados de teste
4. ✅ Testar funcionalidades
5. ✅ Configurar Supabase (opcional)
6. ✅ Personalizar para sua fazenda
7. ✅ Deploy em produção (quando pronto)

---

## 💡 Dicas

- **GPS/Localização:** Permita acesso à localização para clima e mapas funcionarem
- **Chat:** Funciona por `farm_id`, então usuários da mesma fazenda veem as mesmas mensagens
- **Admin:** Apenas `wallisom_53@outlook.com` tem acesso ao painel admin
- **Dados:** Use "Limpar todos os dados" no Dashboard para resetar dados de teste
- **Dark Mode:** Feature planejada (ainda não implementada)

---

## 📞 Suporte

**WhatsApp Integrado:** +55 62 99221-1395  
(Botão flutuante verde no Dashboard)

---

**Última atualização:** 2025-12-05  
**Versão:** 1.0.0 - Completa e Funcional
