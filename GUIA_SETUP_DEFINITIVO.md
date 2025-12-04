# 🚀 GUIA DE CONFIGURAÇÃO DEFINITIVA DO BANCO DE DADOS

Este guia explica como aplicar a configuração completa do banco de dados para garantir que **cada usuário tenha seus dados totalmente isolados** e que a autenticação funcione perfeitamente.

---

## 📋 O QUE O SCRIPT `SETUP_GERAL_DEFINITIVO.sql` FAZ?

1.  **Criação de Tabelas**: Cria todas as tabelas necessárias (`activities`, `crops`, `machines`, etc.) se elas não existirem.
2.  **Isolamento de Dados (RLS)**: Configura políticas de segurança (Row Level Security) rigorosas.
    *   **Regra de Ouro**: Um usuário só pode ver, editar ou excluir dados onde `farm_id` é igual ao seu próprio `farm_id`.
3.  **Automação de Usuários**:
    *   Cria um **Trigger** que roda automaticamente quando um novo usuário se cadastra.
    *   Esse trigger cria um perfil em `user_profiles` e gera um `farm_id` único (ex: `farm-uuid-do-usuario`).
4.  **Correção de Dados**:
    *   Sincroniza usuários antigos que poderiam estar sem perfil.
    *   Corrige `farm_id`s inválidos ou vazios.
5.  **Performance**: Cria índices para garantir que as consultas por `farm_id` sejam rápidas.

---

## 🛠️ COMO APLICAR (PASSO A PASSO)

### 1. Acesse o Supabase
Vá para o painel do seu projeto no [Supabase](https://app.supabase.com).

### 2. Abra o Editor SQL
No menu lateral esquerdo, clique em **SQL Editor**.

### 3. Crie uma Nova Query
Clique em **"New Query"** (ou "New snippet").

### 4. Copie e Cole
1.  Abra o arquivo `SETUP_GERAL_DEFINITIVO.sql` que criei no seu projeto.
2.  Copie **TODO** o conteúdo.
3.  Cole no editor do Supabase.

### 5. Execute
Clique no botão **RUN** (ou pressione `Ctrl + Enter`).

---

## ✅ COMO VERIFICAR SE FUNCIONOU

### Teste 1: Novo Usuário
1.  Vá no seu app e crie uma nova conta.
2.  No Supabase, vá em **Table Editor** -> `user_profiles`.
3.  Verifique se o novo usuário apareceu lá com um `farm_id` preenchido (ex: `farm-1234...`).

### Teste 2: Isolamento
1.  Faça login com o **Usuário A**.
2.  Crie uma atividade (ex: "Teste A").
3.  Faça logout e login com o **Usuário B**.
4.  Verifique se a atividade "Teste A" **NÃO** aparece.
5.  Crie uma atividade "Teste B".
6.  Volte para o **Usuário A** e verifique se apenas "Teste A" aparece.

---

## ⚠️ IMPORTANTE SOBRE O `.env.local`

Você mencionou que alterou o `.env.local`. Certifique-se de que ele contém as chaves corretas do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
VITE_OPENWEATHER_API_KEY=sua-chave-clima (opcional)
```

Se as chaves estiverem erradas, o app não conseguirá se conectar ao banco de dados, mesmo com o SQL correto.

---

## 📞 SUPORTE

Se encontrar erros ao rodar o script:
1.  Verifique se copiou o script inteiro.
2.  Veja a mensagem de erro no Supabase (geralmente indica qual linha falhou).
3.  Se o erro for sobre "policy already exists", não se preocupe, o script tenta limpar políticas antigas, mas pode sobrar alguma. O importante é que as novas sejam criadas.
