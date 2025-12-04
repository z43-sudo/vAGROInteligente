-- ============================================
-- PASSO 1: APAGAR TODAS AS TABELAS EXISTENTES
-- ============================================

DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS livestock CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS logistics_vehicles CASCADE;
DROP TABLE IF EXISTS irrigation_systems CASCADE;
DROP TABLE IF EXISTS pest_alerts CASCADE;

-- ============================================
-- PASSO 2: CRIAR TODAS AS TABELAS DO ZERO
-- ============================================

-- 1. TABELA DE ATIVIDADES
CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    time TEXT,
    type TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE SAFRAS/CULTURAS
CREATE TABLE crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT,
    stage TEXT,
    progress INTEGER DEFAULT 0,
    days_to_harvest INTEGER DEFAULT 0,
    status TEXT,
    start_date DATE,
    cycle_duration INTEGER,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE MÁQUINAS
CREATE TABLE machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT,
    hours INTEGER DEFAULT 0,
    location TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE PECUÁRIA
CREATE TABLE livestock (
    id TEXT PRIMARY KEY,
    tag TEXT NOT NULL,
    type TEXT,
    breed TEXT,
    weight DECIMAL(10,2),
    age INTEGER,
    status TEXT,
    location TEXT,
    last_vaccination DATE,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE ESTOQUE
CREATE TABLE inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL(10,2),
    unit TEXT,
    min_quantity DECIMAL(10,2),
    location TEXT,
    last_restock DATE,
    status TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE EQUIPE
CREATE TABLE team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    status TEXT,
    avatar TEXT,
    department TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE MENSAGENS DO CHAT
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE VEÍCULOS DE LOGÍSTICA
CREATE TABLE logistics_vehicles (
    id TEXT PRIMARY KEY,
    plate TEXT NOT NULL,
    driver TEXT,
    status TEXT,
    destination TEXT,
    cargo TEXT,
    eta TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE IRRIGAÇÃO
CREATE TABLE irrigation_systems (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    area TEXT,
    status TEXT,
    water_flow DECIMAL(10,2),
    last_maintenance DATE,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE ALERTAS DE PRAGAS
CREATE TABLE pest_alerts (
    id TEXT PRIMARY KEY,
    pest_name TEXT NOT NULL,
    severity TEXT,
    location TEXT,
    affected_area TEXT,
    description TEXT,
    status TEXT,
    reported_date DATE,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASSO 3: CRIAR ÍNDICES
-- ============================================

CREATE INDEX idx_activities_farm_id ON activities(farm_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_crops_status ON crops(status);

CREATE INDEX idx_machines_farm_id ON machines(farm_id);
CREATE INDEX idx_machines_status ON machines(status);

CREATE INDEX idx_livestock_farm_id ON livestock(farm_id);
CREATE INDEX idx_livestock_status ON livestock(status);

CREATE INDEX idx_inventory_farm_id ON inventory_items(farm_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);

CREATE INDEX idx_team_farm_id ON team_members(farm_id);
CREATE INDEX idx_team_status ON team_members(status);

CREATE INDEX idx_messages_farm_id ON messages(farm_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_logistics_farm_id ON logistics_vehicles(farm_id);
CREATE INDEX idx_logistics_status ON logistics_vehicles(status);

CREATE INDEX idx_irrigation_farm_id ON irrigation_systems(farm_id);
CREATE INDEX idx_irrigation_status ON irrigation_systems(status);

CREATE INDEX idx_pest_farm_id ON pest_alerts(farm_id);
CREATE INDEX idx_pest_status ON pest_alerts(status);

-- ============================================
-- PASSO 4: ATIVAR RLS (SEGURANÇA)
-- ============================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 5: CRIAR POLÍTICAS DE SEGURANÇA
-- ============================================

-- ACTIVITIES
CREATE POLICY "activities_select" ON activities FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "activities_update" ON activities FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "activities_delete" ON activities FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- CROPS
CREATE POLICY "crops_select" ON crops FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "crops_insert" ON crops FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "crops_update" ON crops FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "crops_delete" ON crops FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- MACHINES
CREATE POLICY "machines_select" ON machines FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "machines_insert" ON machines FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "machines_update" ON machines FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "machines_delete" ON machines FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- LIVESTOCK
CREATE POLICY "livestock_select" ON livestock FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "livestock_insert" ON livestock FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "livestock_update" ON livestock FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "livestock_delete" ON livestock FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- INVENTORY
CREATE POLICY "inventory_select" ON inventory_items FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "inventory_insert" ON inventory_items FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "inventory_update" ON inventory_items FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "inventory_delete" ON inventory_items FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- TEAM
CREATE POLICY "team_select" ON team_members FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "team_insert" ON team_members FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "team_update" ON team_members FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "team_delete" ON team_members FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- MESSAGES
CREATE POLICY "messages_select" ON messages FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- LOGISTICS VEHICLES
CREATE POLICY "vehicles_select" ON logistics_vehicles FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "vehicles_insert" ON logistics_vehicles FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "vehicles_update" ON logistics_vehicles FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "vehicles_delete" ON logistics_vehicles FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- IRRIGATION
CREATE POLICY "irrigation_select" ON irrigation_systems FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "irrigation_insert" ON irrigation_systems FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "irrigation_update" ON irrigation_systems FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "irrigation_delete" ON irrigation_systems FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- PEST ALERTS
CREATE POLICY "pest_select" ON pest_alerts FOR SELECT USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "pest_insert" ON pest_alerts FOR INSERT WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "pest_update" ON pest_alerts FOR UPDATE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
CREATE POLICY "pest_delete" ON pest_alerts FOR DELETE USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

-- ============================================
-- CONCLUÍDO! ✅
-- ============================================
-- Todas as tabelas foram criadas com sucesso!
-- Cada usuário verá apenas os dados da sua fazenda.
