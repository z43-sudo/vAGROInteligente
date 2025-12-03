-- ==============================================================================
-- SCRIPT FINAL DE CONFIGURAÇÃO DO SUPABASE - AGRO INTELIGENTE
-- Baseado na estrutura exata do frontend (types/index.ts)
-- ==============================================================================

-- 1. Limpeza (Opcional - Remove tabelas antigas para evitar conflitos)
-- CUIDADO: Isso apaga todos os dados existentes!
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS livestock;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS machines;
DROP TABLE IF EXISTS crops;

-- 2. Criação das Tabelas

-- Tabela: Culturas (Crops)
CREATE TABLE crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    stage TEXT CHECK (stage IN ('Floração', 'Enchimento', 'Vegetativo', 'Maturação')),
    progress INTEGER DEFAULT 0,
    days_to_harvest INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'completed')),
    start_date TIMESTAMP WITH TIME ZONE,
    cycle_duration INTEGER,
    farm_id TEXT NOT NULL, -- Crucial para isolamento de dados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: Máquinas (Machines)
CREATE TABLE machines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT CHECK (status IN ('Operando', 'Manutenção', 'Parado')),
    hours INTEGER DEFAULT 0,
    location TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: Atividades (Activities)
CREATE TABLE activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('Em andamento', 'Concluído', 'Urgente', 'Agendado')),
    time TEXT, -- Pode ser timestamp ou string formatada como no frontend
    type TEXT CHECK (type IN ('irrigation', 'maintenance', 'alert', 'harvest')),
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: Pecuária (Livestock)
CREATE TABLE livestock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag TEXT NOT NULL,
    type TEXT CHECK (type IN ('Bovino', 'Suíno', 'Ovino', 'Equino')),
    breed TEXT,
    weight NUMERIC,
    age INTEGER, -- Meses
    status TEXT CHECK (status IN ('Saudável', 'Doente', 'Tratamento', 'Vendido')),
    location TEXT,
    last_vaccination TIMESTAMP WITH TIME ZONE,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: Estoque (Inventory Items)
CREATE TABLE inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('Sementes', 'Fertilizantes', 'Defensivos', 'Peças', 'Combustível')),
    quantity NUMERIC DEFAULT 0,
    unit TEXT,
    min_quantity NUMERIC DEFAULT 0,
    location TEXT,
    last_restock TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('Normal', 'Baixo', 'Crítico')),
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: Equipe (Team Members)
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Administrador', 'Gerente', 'Agrônomo', 'Operador', 'Veterinário')),
    email TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('Ativo', 'Inativo')),
    avatar TEXT,
    department TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: Mensagens do Chat (Messages)
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Row Level Security (RLS)
-- Isso garante que ninguém acesse dados sem permissão
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Criar Políticas de Segurança (Policies) - ISOLAMENTO ESTRITO
-- As políticas abaixo garantem que o usuário só acesse dados onde o farm_id da linha
-- seja IGUAL ao farm_id salvo nos metadados do usuário (auth.jwt() -> 'user_metadata' ->> 'farm_id')

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON crops;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON machines;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON activities;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON livestock;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON inventory_items;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON team_members;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON messages;

-- Criar novas políticas estritas
-- CROPS
CREATE POLICY "Isolamento por Fazenda" ON crops
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- MACHINES
CREATE POLICY "Isolamento por Fazenda" ON machines
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- ACTIVITIES
CREATE POLICY "Isolamento por Fazenda" ON activities
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- LIVESTOCK
CREATE POLICY "Isolamento por Fazenda" ON livestock
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- INVENTORY
CREATE POLICY "Isolamento por Fazenda" ON inventory_items
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- TEAM_MEMBERS
CREATE POLICY "Isolamento por Fazenda" ON team_members
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- MESSAGES (CHAT)
CREATE POLICY "Isolamento por Fazenda" ON messages
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- 5. Habilitar Realtime para o Chat
-- Isso permite que as mensagens cheguem instantaneamente
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- FIM DO SCRIPT
