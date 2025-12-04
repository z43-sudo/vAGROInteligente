-- ============================================================================
-- CORREÇÃO COMPLETA - PERMITIR SALVAR DADOS NO SUPABASE
-- Execute este script para corrigir as políticas RLS
-- ============================================================================

-- PASSO 1: Remover TODAS as políticas antigas que podem estar bloqueando
-- ============================================================================
DROP POLICY IF EXISTS "farm_isolation_crops" ON public.crops;
DROP POLICY IF EXISTS "farm_isolation_machines" ON public.machines;
DROP POLICY IF EXISTS "farm_isolation_activities" ON public.activities;
DROP POLICY IF EXISTS "farm_isolation_livestock" ON public.livestock;
DROP POLICY IF EXISTS "farm_isolation_inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "farm_isolation_team" ON public.team_members;
DROP POLICY IF EXISTS "farm_isolation_messages" ON public.messages;

-- PASSO 2: Criar políticas CORRETAS que permitem INSERT, UPDATE, DELETE
-- ============================================================================

-- CROPS (Safras)
CREATE POLICY "crops_all_operations" ON public.crops
    FOR ALL 
    USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- MACHINES (Máquinas)
CREATE POLICY "machines_all_operations" ON public.machines
    FOR ALL 
    USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- ACTIVITIES (Atividades)
CREATE POLICY "activities_all_operations" ON public.activities
    FOR ALL 
    USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- LIVESTOCK (Pecuária)
CREATE POLICY "livestock_all_operations" ON public.livestock
    FOR ALL 
    USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- INVENTORY (Estoque)
CREATE POLICY "inventory_all_operations" ON public.inventory_items
    FOR ALL 
    USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- TEAM_MEMBERS (Equipe)
CREATE POLICY "team_all_operations" ON public.team_members
    FOR ALL 
    USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- MESSAGES (Chat)
CREATE POLICY "messages_all_operations" ON public.messages
    FOR ALL 
    USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- PASSO 3: Verificar se as políticas foram criadas
-- ============================================================================
SELECT 
    '=== POLÍTICAS CRIADAS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('crops', 'machines', 'activities', 'livestock', 'inventory_items', 'team_members', 'messages')
ORDER BY tablename, policyname;

-- PASSO 4: Testar se consegue inserir dados
-- ============================================================================
-- Descomente as linhas abaixo para testar (substitua 'SEU_FARM_ID' pelo seu farm_id real)

-- INSERT INTO public.crops (name, area, stage, progress, days_to_harvest, status, farm_id)
-- VALUES ('Teste Milho', '10 hectares', 'Vegetativo', 30, 90, 'active', 'SEU_FARM_ID');

-- Se o INSERT acima funcionar, delete o teste:
-- DELETE FROM public.crops WHERE name = 'Teste Milho';

-- FIM DO SCRIPT
-- ============================================================================
-- IMPORTANTE: Depois de executar este script, faça LOGOUT e LOGIN novamente no app!
-- ============================================================================
