-- ============================================
-- SCRIPT DE LIMPEZA COMPLETA DO SUPABASE
-- ============================================
-- ⚠️ ATENÇÃO: Este script DELETA TUDO!
-- Use para começar completamente do ZERO
-- ============================================

-- PASSO 1: DELETAR TODAS AS POLÍTICAS RLS
DROP POLICY IF EXISTS "admin_users_select_authenticated" ON public.admin_users;
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "crops_select" ON public.crops;
DROP POLICY IF EXISTS "crops_insert" ON public.crops;
DROP POLICY IF EXISTS "crops_update" ON public.crops;
DROP POLICY IF EXISTS "crops_delete" ON public.crops;
DROP POLICY IF EXISTS "activities_select" ON public.activities;
DROP POLICY IF EXISTS "activities_insert" ON public.activities;
DROP POLICY IF EXISTS "activities_update" ON public.activities;
DROP POLICY IF EXISTS "activities_delete" ON public.activities;
DROP POLICY IF EXISTS "machines_select" ON public.machines;
DROP POLICY IF EXISTS "machines_insert" ON public.machines;
DROP POLICY IF EXISTS "machines_update" ON public.machines;
DROP POLICY IF EXISTS "machines_delete" ON public.machines;
DROP POLICY IF EXISTS "livestock_select" ON public.livestock;
DROP POLICY IF EXISTS "livestock_insert" ON public.livestock;
DROP POLICY IF EXISTS "livestock_update" ON public.livestock;
DROP POLICY IF EXISTS "livestock_delete" ON public.livestock;
DROP POLICY IF EXISTS "inventory_select" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_insert" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_update" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_delete" ON public.inventory_items;
DROP POLICY IF EXISTS "chat_select" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_insert" ON public.chat_messages;

-- PASSO 2: DELETAR TODAS AS TABELAS
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.livestock CASCADE;
DROP TABLE IF EXISTS public.machines CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.crops CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.farms CASCADE;

-- PASSO 3: RECRIAR TODAS AS TABELAS
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    farm_id TEXT,
    role TEXT DEFAULT 'member',
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'trial',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    area DECIMAL,
    planting_date DATE,
    harvest_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    model TEXT,
    year INTEGER,
    status TEXT DEFAULT 'operational',
    last_maintenance DATE,
    next_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.livestock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    breed TEXT,
    quantity INTEGER DEFAULT 0,
    age_months INTEGER,
    weight_kg DECIMAL,
    health_status TEXT DEFAULT 'healthy',
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL DEFAULT 0,
    unit TEXT,
    min_quantity DECIMAL,
    location TEXT,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 4: HABILITAR RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- PASSO 5: CRIAR POLÍTICAS RLS
CREATE POLICY "admin_users_select_authenticated" ON public.admin_users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

CREATE POLICY "crops_select" ON public.crops
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "crops_insert" ON public.crops
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "crops_update" ON public.crops
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "crops_delete" ON public.crops
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "activities_select" ON public.activities
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "activities_insert" ON public.activities
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "activities_update" ON public.activities
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "activities_delete" ON public.activities
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "machines_select" ON public.machines
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "machines_insert" ON public.machines
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "machines_update" ON public.machines
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "machines_delete" ON public.machines
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "livestock_select" ON public.livestock
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "livestock_insert" ON public.livestock
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "livestock_update" ON public.livestock
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "livestock_delete" ON public.livestock
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "inventory_select" ON public.inventory_items
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "inventory_insert" ON public.inventory_items
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "inventory_update" ON public.inventory_items
    FOR UPDATE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "inventory_delete" ON public.inventory_items
    FOR DELETE TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "chat_select" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "chat_insert" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

-- PASSO 6: INSERIR ADMIN
INSERT INTO public.admin_users (email, role)
VALUES ('wallisom_53@outlook.com', 'admin');

-- PASSO 7: VERIFICAÇÃO
SELECT '✅ BANCO LIMPO E RECRIADO!' as status;
SELECT 'Tabelas criadas:' as info, COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Admin configurado:' as info;
SELECT * FROM public.admin_users;
