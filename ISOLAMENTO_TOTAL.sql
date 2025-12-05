-- =================================================================
-- SCRIPT DE ISOLAMENTO TOTAL DE DADOS (RLS)
-- =================================================================
-- Este script garante que cada usuário só acesse dados da sua própria fazenda.
-- Ele não apaga dados, apenas reforça a segurança.
-- =================================================================

-- 1. HABILITAR RLS EM TODAS AS TABELAS (GARANTIA)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS ANTIGAS (PARA EVITAR DUPLICIDADE/ERROS)
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

-- 3. CRIAR POLÍTICAS DE ISOLAMENTO ESTRITO

-- ADMIN USERS (Apenas leitura para autenticados)
CREATE POLICY "admin_users_select_authenticated" ON public.admin_users
    FOR SELECT TO authenticated USING (true);

-- USER PROFILES (Usuário vê o seu, Admin vê todos)
CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

-- CROPS (SAFRAS) - Isolamento por Farm ID
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

-- ACTIVITIES (ATIVIDADES)
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

-- MACHINES (MÁQUINAS)
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

-- LIVESTOCK (PECUÁRIA)
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

-- INVENTORY (ESTOQUE)
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

-- CHAT
CREATE POLICY "chat_select" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "chat_insert" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (farm_id IN (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()));

SELECT '✅ ISOLAMENTO TOTAL APLICADO COM SUCESSO!' as status;
