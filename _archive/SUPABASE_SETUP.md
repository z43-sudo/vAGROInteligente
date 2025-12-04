# Configuração do Supabase

Para sincronizar o sistema com o Supabase, siga os passos abaixo:

## 1. Criar Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta/projeto.
2. No painel do projeto, vá em **Project Settings** > **API**.
3. Copie a `Project URL` e a `anon public` key.

## 2. Configurar Variáveis de Ambiente
1. Abra o arquivo `.env` na raiz do projeto.
2. Cole as credenciais copiadas:
   ```env
   VITE_SUPABASE_URL=sua_url_do_projeto
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

## 3. Criar Tabelas
Vá no **SQL Editor** do Supabase e execute o seguinte script para criar as tabelas necessárias:

```sql
-- Tabela de Atividades
create table activities (
  id text primary key,
  title text not null,
  description text,
  status text check (status in ('Em andamento', 'Concluído', 'Urgente', 'Agendado')),
  time text,
  type text check (type in ('irrigation', 'maintenance', 'alert', 'harvest')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Estoque
create table inventory_items (
  id text primary key,
  name text not null,
  category text check (category in ('Sementes', 'Fertilizantes', 'Defensivos', 'Peças', 'Combustível')),
  quantity numeric not null,
  unit text,
  "minQuantity" numeric,
  location text,
  "lastRestock" text,
  status text check (status in ('Normal', 'Baixo', 'Crítico')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Máquinas
create table machines (
  id text primary key,
  name text not null,
  type text,
  status text check (status in ('Operando', 'Manutenção', 'Parado')),
  hours numeric,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 4. Configurar Políticas de Segurança (RLS)
Recomendamos ativar o Row Level Security (RLS) se for usar autenticação. Para desenvolvimento inicial, você pode desativar o RLS ou criar uma política pública:

```sql
-- Exemplo de política pública (CUIDADO: permite acesso a todos)
alter table activities enable row level security;
create policy "Public Access" on activities for all using (true);

alter table inventory_items enable row level security;
create policy "Public Access" on inventory_items for all using (true);

alter table machines enable row level security;
create policy "Public Access" on machines for all using (true);

-- Tabela de Mensagens (Chat)
create table messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  sender_id text not null,
  sender_name text not null,
  farm_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;
create policy "Public Access" on messages for all using (true);

-- Tabela de Parceiros (Marketplace)
create table partners (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  rating numeric default 0,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table partners enable row level security;
create policy "Public Access" on partners for all using (true);

-- Tabela de Produtos (Marketplace)
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text check (category in ('Sementes', 'Fertilizantes', 'Defensivos', 'Maquinário', 'Serviços', 'Tecnologia')),
  image text,
  partner_id uuid references partners(id),
  unit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;
create policy "Public Access" on products for all using (true);
```
