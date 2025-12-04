# 🛡️ Painel de Administração - Agro Inteligente

## 📋 Visão Geral

O Painel de Administração permite que administradores (como você, wallisom_53@outlook.com) gerenciem todos os usuários do sistema, alterem planos de assinatura e monitorem o status das contas.

## 🚀 Como Configurar

### 1. Execute o Script SQL no Supabase

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor**
3. Abra o arquivo `admin_setup.sql` que foi criado
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **Run** para executar

Este script irá:
- ✅ Criar a tabela `admin_users` (lista de administradores)
- ✅ Criar a tabela `user_profiles` (perfis completos dos usuários)
- ✅ Configurar políticas de segurança (RLS)
- ✅ Adicionar você (wallisom_53@outlook.com) como usuário ROOT
- ✅ Criar triggers automáticos para sincronizar perfis

### 2. Acesse o Painel Admin

Após executar o script SQL:

1. Faça login no app com seu email: **wallisom_53@outlook.com**
2. Você verá um novo item **"Admin"** na sidebar (com ícone de escudo 🛡️)
3. Clique em **Admin** para acessar o painel

## 🎯 Funcionalidades do Painel

### 📊 Dashboard de Estatísticas
- **Total de Usuários**: Quantidade total de usuários cadastrados
- **Assinaturas Ativas**: Usuários com plano ativo
- **Em Trial**: Usuários em período de teste
- **Suspensos**: Usuários com conta suspensa

### 🔍 Filtros Avançados
- **Busca**: Pesquise por email, nome ou farm_id
- **Filtro de Status**: 
  - Todos
  - Ativo
  - Trial
  - Inativo
  - Suspenso
- **Filtro de Plano**:
  - Todos
  - Gratuito
  - Básico
  - Profissional
  - Enterprise

### ✏️ Edição de Usuários

Para cada usuário, você pode:

1. **Alterar Plano de Assinatura**:
   - Gratuito
   - Básico (3 meses - R$147)
   - Profissional (6 meses - R$247)
   - Enterprise (1 ano)

2. **Alterar Status da Assinatura**:
   - Ativo
   - Trial
   - Inativo
   - Suspenso

3. **Visualizar Informações**:
   - Email
   - Nome completo
   - Farm ID (código da fazenda)
   - Data de criação
   - Última atualização

### 🔐 Segurança

- ✅ Apenas usuários listados em `admin_users` podem acessar o painel
- ✅ Você (wallisom_53@outlook.com) está configurado como **ROOT**
- ✅ Políticas RLS garantem que apenas admins vejam os dados
- ✅ Todas as alterações são registradas com timestamp

## 👥 Como Adicionar Novos Administradores

Se você quiser adicionar outros administradores:

1. Acesse o **SQL Editor** no Supabase
2. Execute o seguinte comando:

```sql
INSERT INTO admin_users (email, role)
VALUES ('email_do_novo_admin@exemplo.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

**Tipos de Roles:**
- `root`: Acesso total (você)
- `admin`: Administrador com acesso ao painel
- `support`: Suporte (pode ser usado no futuro)

## 📝 Fluxo de Trabalho Típico

### Cenário 1: Ativar Assinatura de um Usuário

1. Acesse o painel admin (`/admin`)
2. Busque o usuário pelo email
3. Clique no botão **Editar** (ícone de lápis)
4. Altere o **Plano** para o plano desejado (ex: "Profissional")
5. Altere o **Status** para "Ativo"
6. Clique em **Salvar** (ícone de check)

### Cenário 2: Suspender um Usuário

1. Busque o usuário
2. Clique em **Editar**
3. Altere o **Status** para "Suspenso"
4. Clique em **Salvar**

### Cenário 3: Dar Trial para Novo Usuário

1. Busque o usuário
2. Clique em **Editar**
3. Altere o **Plano** para "Básico" (ou outro)
4. Altere o **Status** para "Trial"
5. Clique em **Salvar**

## 🔄 Sincronização Automática

O sistema possui triggers automáticos que:
- ✅ Criam automaticamente um perfil em `user_profiles` quando um novo usuário se cadastra
- ✅ Sincronizam dados do `auth.users` com `user_profiles`
- ✅ Atualizam o campo `updated_at` automaticamente

## 🎨 Interface

O painel possui:
- 🎨 Design moderno e responsivo
- 📱 Funciona em desktop e mobile
- 🔍 Busca em tempo real
- 🎯 Filtros múltiplos
- ✏️ Edição inline
- 📊 Estatísticas visuais
- 🎨 Badges coloridos para status e planos

## 🐛 Troubleshooting

### Não consigo ver o menu Admin

**Solução:**
1. Verifique se executou o script `admin_setup.sql`
2. Confirme que está logado com o email correto: wallisom_53@outlook.com
3. Verifique no Supabase se seu email está na tabela `admin_users`:

```sql
SELECT * FROM admin_users WHERE email = 'wallisom_53@outlook.com';
```

### Erro ao editar usuário

**Solução:**
1. Verifique as políticas RLS no Supabase
2. Confirme que você tem permissão de UPDATE na tabela `user_profiles`

### Usuários não aparecem na lista

**Solução:**
1. Verifique se os usuários foram criados após executar o script (triggers devem estar ativos)
2. Para usuários antigos, execute:

```sql
-- Sincronizar usuários existentes
INSERT INTO user_profiles (user_id, email, full_name, farm_id, role)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'farm_id',
    raw_user_meta_data->>'role'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

## 📞 Suporte

Se tiver algum problema, verifique:
1. Console do navegador (F12) para erros JavaScript
2. Logs do Supabase para erros de banco de dados
3. Políticas RLS estão ativas e corretas

---

**Desenvolvido para Agro Inteligente** 🌱
**Admin Root:** wallisom_53@outlook.com
