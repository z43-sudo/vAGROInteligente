# 🚀 GUIA RÁPIDO - Setup Completo do Supabase

## ⚡ Passos para Configurar (5 minutos)

### 1️⃣ Limpar o Banco de Dados Atual

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de código no menu lateral)
4. Cole e execute este comando para limpar tudo:

```sql
-- Limpar todas as tabelas antigas
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### 2️⃣ Executar o Setup Completo

1. Ainda no **SQL Editor**
2. Abra o arquivo: `SETUP_COMPLETO_SUPABASE.sql`
3. **Copie TODO o conteúdo** do arquivo
4. Cole no SQL Editor
5. Clique em **RUN** (ou pressione Ctrl+Enter)
6. Aguarde a execução (pode levar 10-20 segundos)

### 3️⃣ Verificar se Funcionou

Você verá mensagens no console como:

```
========================================
SETUP COMPLETO!
========================================
Tabelas criadas: 9
Administradores: 1
Perfis de usuários: X
========================================
✅ Todas as 9 tabelas foram criadas com sucesso!
✅ Admin ROOT configurado: wallisom_53@outlook.com
```

### 4️⃣ Testar o App

1. Volte para o app (http://localhost:3001)
2. Faça login com: **wallisom_53@outlook.com**
3. Você deve ver o menu **"Admin"** 🛡️ na sidebar
4. Clique em Admin para acessar o painel

---

## 📊 O Que Foi Criado

### Tabelas de Dados do App:
- ✅ `crops` - Safras/Culturas
- ✅ `machines` - Máquinas
- ✅ `activities` - Atividades
- ✅ `livestock` - Pecuária
- ✅ `inventory_items` - Estoque
- ✅ `team_members` - Equipe
- ✅ `messages` - Chat

### Tabelas do Sistema Admin:
- ✅ `admin_users` - Lista de administradores
- ✅ `user_profiles` - Perfis completos + assinaturas

### Segurança:
- ✅ **RLS (Row Level Security)** ativo em todas as tabelas
- ✅ **Isolamento por farm_id** - cada fazenda vê só seus dados
- ✅ **Políticas de acesso** configuradas
- ✅ **Triggers automáticos** para sincronização

### Funcionalidades:
- ✅ **Realtime** habilitado para chat
- ✅ **Sincronização automática** de perfis de usuário
- ✅ **Painel Admin** funcional
- ✅ **Índices** para performance

---

## 🔧 Troubleshooting

### ❌ Erro: "permission denied for schema public"

**Solução:**
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### ❌ Erro: "relation already exists"

**Solução:** Execute primeiro o comando de limpeza do Passo 1

### ❌ Não vejo o menu "Admin"

**Possíveis causas:**
1. Não está logado com wallisom_53@outlook.com
2. O script não foi executado completamente
3. Limpe o cache do navegador (Ctrl+Shift+R)

**Verificar no Supabase:**
```sql
-- Ver se você está cadastrado como admin
SELECT * FROM public.admin_users WHERE email = 'wallisom_53@outlook.com';
```

### ❌ Erro ao carregar dados no app

**Verificar políticas RLS:**
```sql
-- Ver políticas ativas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 📝 Comandos Úteis

### Ver todas as tabelas criadas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Ver total de usuários:
```sql
SELECT COUNT(*) as total_usuarios FROM public.user_profiles;
```

### Ver seus dados de admin:
```sql
SELECT * FROM public.admin_users WHERE email = 'wallisom_53@outlook.com';
```

### Adicionar outro admin:
```sql
INSERT INTO public.admin_users (email, role)
VALUES ('outro_email@exemplo.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

---

## ✅ Checklist Final

- [ ] Script executado sem erros
- [ ] 9 tabelas criadas
- [ ] Admin ROOT configurado
- [ ] Login funciona
- [ ] Menu "Admin" aparece na sidebar
- [ ] Painel admin abre em /admin
- [ ] Dados do app carregam normalmente

---

## 🎯 Próximos Passos

Após o setup:

1. **Teste o cadastro** de um novo usuário
2. **Acesse o painel admin** e veja o novo usuário listado
3. **Altere o plano** do usuário de teste
4. **Teste as funcionalidades** do app (safras, máquinas, etc.)

---

**Dúvidas?** Verifique o console do navegador (F12) para erros JavaScript ou o log do Supabase para erros de banco de dados.
