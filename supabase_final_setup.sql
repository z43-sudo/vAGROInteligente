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

-- 4. Criar Políticas de Segurança (Policies)
-- Permite acesso total (SELECT, INSERT, UPDATE, DELETE) para qualquer usuário autenticado
-- A filtragem real é feita no Frontend pelo farm_id, mas aqui deixamos aberto para usuários logados
-- Para maior segurança, futuramente você pode filtrar por farm_id no user_metadata

-- Política Genérica: Permitir tudo para usuários autenticados (simplificado para desenvolvimento)
CREATE POLICY "Acesso total para usuários autenticados" ON crops FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON machines FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON livestock FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON messages FOR ALL USING (auth.role() = 'authenticated');

-- 5. Habilitar Realtime para o Chat
-- Isso permite que as mensagens cheguem instantaneamente
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- FIM DO SCRIPT
