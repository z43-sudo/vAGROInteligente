# 🔧 GUIA RÁPIDO: CORRIGIR ADMIN PANEL

## ❌ PROBLEMA

- Admin Panel não mostra usuários cadastrados
- Novos usuários não aparecem na lista
- Tabela vazia ou sem dados

---

## ✅ SOLUÇÃO RÁPIDA (5 MINUTOS)

### **Passo 1: Executar Script SQL**

1. Acesse: https://app.supabase.com
2. Vá em: **SQL Editor** → **New Query**
3. Copie TODO o conteúdo de: `FIX_ADMIN_PANEL.sql`
4. Cole no editor
5. **IMPORTANTE**: Na **Parte 8** do script, encontre esta linha:

```sql
-- INSERT INTO public.admin_users (email) VALUES ('SEU_EMAIL_AQUI@example.com') ON CONFLICT (email) DO NOTHING;
```

6. **Descomente** (remova o `--`) e **substitua** `SEU_EMAIL_AQUI@example.com` pelo **seu email real**:

```sql
INSERT INTO public.admin_users (email) VALUES ('seu-email-real@gmail.com') ON CONFLICT (email) DO NOTHING;
```

7. Clique em **RUN** (ou Ctrl+Enter)

---

### **Passo 2: Verificar Resultados**

Após executar, você verá várias tabelas de verificação:

✅ **Total de Usuários**: Deve mostrar todos os usuários cadastrados  
✅ **Total de Admins**: Deve mostrar pelo menos 1 (você)  
✅ **Lista de Usuários**: Deve mostrar email, farm_id, etc.  
✅ **Lista de Admins**: Deve mostrar seu email  

---

### **Passo 3: Fazer Logout e Login**

1. No seu app, clique em **Sair/Logout**
2. Faça **Login** novamente com seu email de admin
3. Acesse: `http://localhost:3000/admin`

---

### **Passo 4: Verificar Admin Panel**

Você deve ver:

✅ Todos os usuários cadastrados na tabela  
✅ Estatísticas corretas (Total, Ativos, Trial, Suspensos)  
✅ Botão "Reset System Cache" funcionando  
✅ Filtros de busca funcionando  

---

## 🔍 DIAGNÓSTICO

Se ainda não funcionar, execute estas queries no SQL Editor:

### **1. Verificar se você é admin:**

```sql
SELECT * FROM public.admin_users WHERE email = 'seu-email@example.com';
```

**Resultado esperado**: 1 linha com seu email

---

### **2. Verificar usuários:**

```sql
SELECT COUNT(*) as total FROM public.user_profiles;
```

**Resultado esperado**: Número > 0

---

### **3. Verificar políticas RLS:**

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';
```

**Resultado esperado**: Deve incluir política `admin_view_all_users`

---

## 🚨 PROBLEMAS COMUNS

### **Problema 1: "Acesso Negado" no Admin Panel**

**Causa**: Seu email não está na tabela `admin_users`

**Solução**:
```sql
INSERT INTO public.admin_users (email) 
VALUES ('seu-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

---

### **Problema 2: "Nenhum usuário encontrado"**

**Causa**: Usuários não foram sincronizados de `auth.users` para `user_profiles`

**Solução**: Execute a **Parte 3** do script `FIX_ADMIN_PANEL.sql`

---

### **Problema 3: Usuários aparecem mas sem farm_id**

**Causa**: farm_ids não foram gerados

**Solução**: Execute a **Parte 4** do script `FIX_ADMIN_PANEL.sql`

---

## 📋 CHECKLIST FINAL

Após executar o script, verifique:

- [ ] Script `FIX_ADMIN_PANEL.sql` executado com sucesso
- [ ] Seu email adicionado em `admin_users`
- [ ] Logout e login realizados
- [ ] Admin Panel mostra todos os usuários
- [ ] Estatísticas corretas
- [ ] Filtros funcionando
- [ ] Botão "Reset System Cache" visível

---

## 🎯 RESUMO DO QUE O SCRIPT FAZ

1. ✅ Verifica e cria tabela `user_profiles`
2. ✅ Verifica e cria tabela `admin_users`
3. ✅ Sincroniza usuários de `auth.users` → `user_profiles`
4. ✅ Corrige farm_ids vazios ou inválidos
5. ✅ Configura políticas RLS para usuários normais
6. ✅ Cria política especial para admins verem TODOS os usuários
7. ✅ Adiciona seu email como admin (você precisa editar)
8. ✅ Mostra verificações finais

---

## 📞 SUPORTE

Se o problema persistir:

1. **Verifique o console** (F12) por erros
2. **Execute as queries de diagnóstico** acima
3. **Verifique se o email está correto** em `admin_users`
4. **Tente limpar o cache** do navegador (Ctrl+Shift+Del)

---

**Tempo estimado**: 5 minutos  
**Dificuldade**: Fácil  
**Resultado**: Admin Panel 100% funcional mostrando todos os usuários
