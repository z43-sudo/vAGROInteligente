-- ==============================================================================
-- CORREÇÃO URGENTE DAS POLÍTICAS RLS - ISOLAMENTO CORRETO POR FARM_ID
-- Este script corrige o problema de usuários vendo dados de outras fazendas
-- ==============================================================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS (que estão incorretas)
DROP POLICY IF EXISTS "activities_full_access" ON activities;
DROP POLICY IF EXISTS "crops_full_access" ON crops;
DROP POLICY IF EXISTS "inventory_full_access" ON inventory_items;
DROP POLICY IF EXISTS "livestock_full_access" ON livestock;
DROP POLICY IF EXISTS "machines_full_access" ON machines;
DROP POLICY IF EXISTS "team_members_full_access" ON team_members;
DROP POLICY IF EXISTS "messages_full_access" ON messages;
DROP POLICY IF EXISTS "logistics_vehicles_full_access" ON logistics_vehicles;

-- Remover políticas antigas com outros nomes possíveis
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON activities;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON crops;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON inventory_items;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON livestock;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON machines;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON team_members;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON messages;

-- 2. CRIAR POLÍTICAS CORRETAS - ISOLAMENTO ESTRITO POR FARM_ID
-- Estas políticas garantem que cada usuário só vê dados da SUA fazenda

-- ACTIVITIES (Atividades)
CREATE POLICY "isolamento_farm_id" ON activities
    FOR ALL
    USING (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ))
    WITH CHECK (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ));

-- CROPS (Culturas)
CREATE POLICY "isolamento_farm_id" ON crops
    FOR ALL
    USING (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ))
    WITH CHECK (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ));

-- INVENTORY_ITEMS (Estoque)
CREATE POLICY "isolamento_farm_id" ON inventory_items
    FOR ALL
    USING (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ))
    WITH CHECK (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ));

-- LIVESTOCK (Pecuária)
CREATE POLICY "isolamento_farm_id" ON livestock
    FOR ALL
    USING (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ))
    WITH CHECK (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ));

-- MACHINES (Máquinas)
CREATE POLICY "isolamento_farm_id" ON machines
    FOR ALL
    USING (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ))
    WITH CHECK (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ));

-- TEAM_MEMBERS (Equipe)
CREATE POLICY "isolamento_farm_id" ON team_members
    FOR ALL
    USING (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ))
    WITH CHECK (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ));

-- MESSAGES (Chat)
CREATE POLICY "isolamento_farm_id" ON messages
    FOR ALL
    USING (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ))
    WITH CHECK (farm_id = COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'farm_id'),
        'no-farm'
    ));

-- LOGISTICS_VEHICLES (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'logistics_vehicles') THEN
        EXECUTE 'DROP POLICY IF EXISTS "isolamento_farm_id" ON logistics_vehicles';
        EXECUTE 'CREATE POLICY "isolamento_farm_id" ON logistics_vehicles
            FOR ALL
            USING (farm_id = COALESCE(
                (auth.jwt() -> ''user_metadata'' ->> ''farm_id''),
                ''no-farm''
            ))
            WITH CHECK (farm_id = COALESCE(
                (auth.jwt() -> ''user_metadata'' ->> ''farm_id''),
                ''no-farm''
            ))';
    END IF;
END $$;

-- 3. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS CORRETAMENTE
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual as "Condição USING",
    with_check as "Condição WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('activities', 'crops', 'inventory_items', 'livestock', 'machines', 'team_members', 'messages')
ORDER BY tablename, policyname;

-- FIM DO SCRIPT
-- Após executar, teste criando uma nova conta e verificando se os dados estão isolados
