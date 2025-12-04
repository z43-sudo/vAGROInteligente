-- ============================================================================
-- SETUP COMPLETO DE ISOLAMENTO DE DADOS - AGRO INTELIGENTE
-- Este script configura TODAS as colunas e políticas corretamente
-- ============================================================================

-- ============================================================================
-- PARTE 1: GARANTIR QUE TODAS AS TABELAS EXISTEM COM COLUNAS CORRETAS
-- ============================================================================

-- Tabela: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    farm_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    phone TEXT,
    address TEXT,
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'trial',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: activities
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    priority TEXT,
    assigned_to TEXT,
    time TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: crops
CREATE TABLE IF NOT EXISTS public.crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    area NUMERIC,
    variety TEXT,
    stage TEXT,
    start_date TEXT,
    cycle_duration INTEGER,
    progress INTEGER DEFAULT 0,
    days_to_harvest INTEGER,
    expected_yield NUMERIC,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: machines
CREATE TABLE IF NOT EXISTS public.machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT,
    last_maintenance TEXT,
    next_maintenance TEXT,
    hours_used NUMERIC DEFAULT 0,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: livestock
CREATE TABLE IF NOT EXISTS public.livestock (
    id TEXT PRIMARY KEY,
    tag TEXT NOT NULL,
    type TEXT NOT NULL,
    breed TEXT,
    birth_date TEXT,
    weight NUMERIC,
    status TEXT,
    location TEXT,
    notes TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    quantity NUMERIC DEFAULT 0,
    unit TEXT,
    min_quantity NUMERIC DEFAULT 0,
    location TEXT,
    last_restock TEXT,
    status TEXT DEFAULT 'Normal',
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: team_members
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Ativo',
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PARTE 2: ADICIONAR COLUNAS FARM_ID SE NÃO EXISTIREM
-- ============================================================================

ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS farm_id TEXT;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS farm_id TEXT;
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS farm_id TEXT;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS farm_id TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS farm_id TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS farm_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS farm_id TEXT;

-- ============================================================================
-- PARTE 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_activities_farm_id ON public.activities(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_machines_farm_id ON public.machines(farm_id);
CREATE INDEX IF NOT EXISTS idx_livestock_farm_id ON public.livestock(farm_id);
CREATE INDEX IF NOT EXISTS idx_inventory_farm_id ON public.inventory_items(farm_id);
CREATE INDEX IF NOT EXISTS idx_team_farm_id ON public.team_members(farm_id);
CREATE INDEX IF NOT EXISTS idx_messages_farm_id ON public.messages(farm_id);

-- ============================================================================
-- PARTE 4: REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ============================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('user_profiles', 'activities', 'crops', 'machines', 'livestock', 'inventory_items', 'team_members', 'messages')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- PARTE 5: FUNÇÃO HELPER PARA OBTER FARM_ID DO USUÁRIO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_farm_id()
RETURNS TEXT AS $$
DECLARE
    user_farm TEXT;
BEGIN
    SELECT farm_id INTO user_farm
    FROM public.user_profiles
    WHERE user_id = auth.uid();
    
    IF user_farm IS NULL THEN
        user_farm := 'farm-' || auth.uid();
    END IF;
    
    RETURN user_farm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTE 6: POLÍTICAS RLS COM ISOLAMENTO POR FARM_ID
-- ============================================================================

-- USER_PROFILES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ACTIVITIES
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON public.activities
    FOR SELECT USING (farm_id = public.get_user_farm_id());

CREATE POLICY "activities_insert" ON public.activities
    FOR INSERT WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "activities_update" ON public.activities
    FOR UPDATE USING (farm_id = public.get_user_farm_id()) WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "activities_delete" ON public.activities
    FOR DELETE USING (farm_id = public.get_user_farm_id());

-- CROPS
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crops_select" ON public.crops
    FOR SELECT USING (farm_id = public.get_user_farm_id());

CREATE POLICY "crops_insert" ON public.crops
    FOR INSERT WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "crops_update" ON public.crops
    FOR UPDATE USING (farm_id = public.get_user_farm_id()) WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "crops_delete" ON public.crops
    FOR DELETE USING (farm_id = public.get_user_farm_id());

-- MACHINES
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "machines_select" ON public.machines
    FOR SELECT USING (farm_id = public.get_user_farm_id());

CREATE POLICY "machines_insert" ON public.machines
    FOR INSERT WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "machines_update" ON public.machines
    FOR UPDATE USING (farm_id = public.get_user_farm_id()) WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "machines_delete" ON public.machines
    FOR DELETE USING (farm_id = public.get_user_farm_id());

-- LIVESTOCK
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "livestock_select" ON public.livestock
    FOR SELECT USING (farm_id = public.get_user_farm_id());

CREATE POLICY "livestock_insert" ON public.livestock
    FOR INSERT WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "livestock_update" ON public.livestock
    FOR UPDATE USING (farm_id = public.get_user_farm_id()) WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "livestock_delete" ON public.livestock
    FOR DELETE USING (farm_id = public.get_user_farm_id());

-- INVENTORY_ITEMS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select" ON public.inventory_items
    FOR SELECT USING (farm_id = public.get_user_farm_id());

CREATE POLICY "inventory_insert" ON public.inventory_items
    FOR INSERT WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "inventory_update" ON public.inventory_items
    FOR UPDATE USING (farm_id = public.get_user_farm_id()) WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "inventory_delete" ON public.inventory_items
    FOR DELETE USING (farm_id = public.get_user_farm_id());

-- TEAM_MEMBERS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_select" ON public.team_members
    FOR SELECT USING (farm_id = public.get_user_farm_id());

CREATE POLICY "team_insert" ON public.team_members
    FOR INSERT WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "team_update" ON public.team_members
    FOR UPDATE USING (farm_id = public.get_user_farm_id()) WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "team_delete" ON public.team_members
    FOR DELETE USING (farm_id = public.get_user_farm_id());

-- MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON public.messages
    FOR SELECT USING (farm_id = public.get_user_farm_id());

CREATE POLICY "messages_insert" ON public.messages
    FOR INSERT WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "messages_update" ON public.messages
    FOR UPDATE USING (farm_id = public.get_user_farm_id()) WITH CHECK (farm_id = public.get_user_farm_id());

CREATE POLICY "messages_delete" ON public.messages
    FOR DELETE USING (farm_id = public.get_user_farm_id());

-- ============================================================================
-- PARTE 7: FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        farm_id,
        role,
        subscription_plan,
        subscription_status
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'farm-' || NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
        'free',
        'trial'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PARTE 8: ATUALIZAR USUÁRIOS EXISTENTES
-- ============================================================================

-- Garantir que todos os usuários têm farm_id único
UPDATE public.user_profiles
SET farm_id = 'farm-' || user_id
WHERE farm_id IS NULL OR farm_id = '' OR farm_id LIKE 'default-farm%';

-- Inserir usuários do auth.users que não estão em user_profiles
INSERT INTO public.user_profiles (user_id, email, full_name, farm_id, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    'farm-' || id,
    COALESCE(raw_user_meta_data->>'role', 'member')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO UPDATE SET
    farm_id = 'farm-' || user_profiles.user_id;

-- ============================================================================
-- PARTE 9: VERIFICAÇÃO FINAL
-- ============================================================================

-- Mostrar estrutura das tabelas
SELECT 
    '=== ESTRUTURA DAS TABELAS ===' as info;

SELECT 
    table_name as "Tabela",
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'activities', 'crops', 'machines', 'livestock', 'inventory_items', 'team_members', 'messages')
ORDER BY table_name, ordinal_position;

-- Mostrar políticas criadas
SELECT 
    '=== POLÍTICAS RLS ===' as info;

SELECT 
    tablename as "Tabela",
    policyname as "Política",
    cmd as "Comando"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'activities', 'crops', 'machines', 'livestock', 'inventory_items', 'team_members', 'messages')
ORDER BY tablename, policyname;

-- Mostrar usuários e farm_ids
SELECT 
    '=== USUÁRIOS E FARM_IDS ===' as info;

SELECT 
    email,
    full_name,
    farm_id,
    role,
    subscription_status
FROM public.user_profiles
ORDER BY created_at DESC;

-- Verificar duplicatas de farm_id
SELECT 
    '=== VERIFICAR DUPLICATAS ===' as info;

SELECT 
    farm_id,
    COUNT(*) as "Quantidade"
FROM public.user_profiles
GROUP BY farm_id
HAVING COUNT(*) > 1;

-- Mensagem final
DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETO EXECUTADO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabelas: Criadas/Atualizadas';
    RAISE NOTICE 'Colunas: Configuradas corretamente';
    RAISE NOTICE 'Políticas RLS: 32 políticas criadas';
    RAISE NOTICE 'Farm IDs: Únicos para cada usuário';
    RAISE NOTICE 'Isolamento: ATIVADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Faça LOGOUT do aplicativo';
    RAISE NOTICE '2. Faça LOGIN novamente';
    RAISE NOTICE '3. Seus dados estarão isolados';
    RAISE NOTICE '========================================';
END $$;
