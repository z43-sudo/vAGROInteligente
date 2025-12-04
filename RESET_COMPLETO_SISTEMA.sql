-- ==============================================================================
-- SCRIPT COMPLETO: RESET TOTAL DO SISTEMA
-- Este script limpa TODOS os dados e prepara o sistema para começar do zero
-- ATENÇÃO: Isso é IRREVERSÍVEL! Todos os dados serão perdidos!
-- ==============================================================================

-- ============================================================================
-- PARTE 1: LIMPAR TODOS OS DADOS DAS TABELAS
-- ============================================================================

-- Limpar mensagens do chat
TRUNCATE TABLE messages CASCADE;

-- Limpar membros da equipe
TRUNCATE TABLE team_members CASCADE;

-- Limpar itens do estoque
TRUNCATE TABLE inventory_items CASCADE;

-- Limpar animais
TRUNCATE TABLE livestock CASCADE;

-- Limpar atividades
TRUNCATE TABLE activities CASCADE;

-- Limpar máquinas
TRUNCATE TABLE machines CASCADE;

-- Limpar culturas
TRUNCATE TABLE crops CASCADE;

-- Limpar veículos de logística (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'logistics_vehicles') THEN
        EXECUTE 'TRUNCATE TABLE logistics_vehicles CASCADE';
    END IF;
END $$;

RAISE NOTICE '✅ Todos os dados foram limpos!';

-- ============================================================================
-- PARTE 2: ATRIBUIR FARM_ID ÚNICO PARA USUÁRIOS SEM FARM_ID
-- ============================================================================

DO $$
DECLARE
    user_record RECORD;
    new_farm_id TEXT;
BEGIN
    -- Loop através de todos os usuários sem farm_id
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users
        WHERE raw_user_meta_data->>'farm_id' IS NULL
    LOOP
        -- Gerar um farm_id único baseado no timestamp e ID do usuário
        new_farm_id := 'farm_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTRING(user_record.id::TEXT, 1, 8);
        
        -- Atualizar os metadados do usuário
        UPDATE auth.users
        SET raw_user_meta_data = 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'farm_id', new_farm_id,
                'role', 'owner',
                'full_name', COALESCE(raw_user_meta_data->>'full_name', 'Usuário')
            )
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Farm ID atribuído para %: %', user_record.email, new_farm_id;
    END LOOP;
END $$;

-- ============================================================================
-- PARTE 3: REMOVER POLÍTICAS RLS ANTIGAS E CRIAR NOVAS (CORRETAS)
-- ============================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "activities_full_access" ON activities;
DROP POLICY IF EXISTS "crops_full_access" ON crops;
DROP POLICY IF EXISTS "inventory_full_access" ON inventory_items;
DROP POLICY IF EXISTS "livestock_full_access" ON livestock;
DROP POLICY IF EXISTS "machines_full_access" ON machines;
DROP POLICY IF EXISTS "team_members_full_access" ON team_members;
DROP POLICY IF EXISTS "messages_full_access" ON messages;
DROP POLICY IF EXISTS "logistics_vehicles_full_access" ON logistics_vehicles;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON activities;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON crops;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON inventory_items;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON livestock;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON machines;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON team_members;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON messages;
DROP POLICY IF EXISTS "isolamento_farm_id" ON activities;
DROP POLICY IF EXISTS "isolamento_farm_id" ON crops;
DROP POLICY IF EXISTS "isolamento_farm_id" ON inventory_items;
DROP POLICY IF EXISTS "isolamento_farm_id" ON livestock;
DROP POLICY IF EXISTS "isolamento_farm_id" ON machines;
DROP POLICY IF EXISTS "isolamento_farm_id" ON team_members;
DROP POLICY IF EXISTS "isolamento_farm_id" ON messages;

-- Criar políticas CORRETAS com isolamento estrito

-- ACTIVITIES
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

-- CROPS
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

-- INVENTORY_ITEMS
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

-- LIVESTOCK
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

-- MACHINES
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

-- TEAM_MEMBERS
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

-- MESSAGES
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

RAISE NOTICE '✅ Políticas RLS corrigidas!';

-- ============================================================================
-- PARTE 4: VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar todos os usuários e seus farm_ids
SELECT 
    '=== USUÁRIOS CADASTRADOS ===' as info;

SELECT 
    email,
    raw_user_meta_data->>'farm_id' as farm_id,
    raw_user_meta_data->>'full_name' as nome,
    raw_user_meta_data->>'role' as papel,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Verificar se há farm_ids duplicados
SELECT 
    '=== VERIFICAÇÃO DE DUPLICATAS ===' as info;

SELECT 
    raw_user_meta_data->>'farm_id' as farm_id,
    COUNT(*) as quantidade_usuarios,
    array_agg(email) as emails
FROM auth.users
WHERE raw_user_meta_data->>'farm_id' IS NOT NULL
GROUP BY raw_user_meta_data->>'farm_id'
HAVING COUNT(*) > 1;

-- Verificar políticas RLS
SELECT 
    '=== POLÍTICAS RLS ATIVAS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('activities', 'crops', 'inventory_items', 'livestock', 'machines', 'team_members', 'messages')
ORDER BY tablename, policyname;

-- Verificar se as tabelas estão vazias
SELECT 
    '=== CONTAGEM DE DADOS (DEVE SER ZERO) ===' as info;

SELECT 'activities' as tabela, COUNT(*) as total FROM activities
UNION ALL
SELECT 'crops' as tabela, COUNT(*) as total FROM crops
UNION ALL
SELECT 'inventory_items' as tabela, COUNT(*) as total FROM inventory_items
UNION ALL
SELECT 'livestock' as tabela, COUNT(*) as total FROM livestock
UNION ALL
SELECT 'machines' as tabela, COUNT(*) as total FROM machines
UNION ALL
SELECT 'team_members' as tabela, COUNT(*) as total FROM team_members
UNION ALL
SELECT 'messages' as tabela, COUNT(*) as total FROM messages;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

SELECT '
╔═══════════════════════════════════════════════════════════════╗
║                   ✅ RESET COMPLETO FINALIZADO!               ║
╚═══════════════════════════════════════════════════════════════╝

✅ Todos os dados foram limpos
✅ Todos os usuários têm farm_id único
✅ Políticas RLS corrigidas e ativas
✅ Sistema pronto para uso

📋 PRÓXIMOS PASSOS:
1. Peça aos usuários para fazer LOGOUT
2. Peça para limparem o cache do navegador (localStorage.clear())
3. Cada usuário deve fazer LOGIN novamente
4. Agora cada usuário pode cadastrar seus próprios dados
5. Os dados estarão isolados por fazenda (farm_id)

' as resultado_final;
