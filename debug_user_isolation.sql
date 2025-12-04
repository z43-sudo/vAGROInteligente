-- ==============================================================================
-- SCRIPT DE DEBUG - ISOLAMENTO DE USUÁRIOS
-- Execute este script no Supabase SQL Editor para diagnosticar o problema
-- ==============================================================================

-- 1. Verificar todos os usuários cadastrados e seus farm_ids
SELECT 
    id as user_id,
    email,
    raw_user_meta_data->>'farm_id' as farm_id,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar quantos farm_ids únicos existem
SELECT 
    raw_user_meta_data->>'farm_id' as farm_id,
    COUNT(*) as usuarios_com_este_farm_id,
    array_agg(email) as emails
FROM auth.users
GROUP BY raw_user_meta_data->>'farm_id';

-- 3. Verificar dados nas tabelas principais e seus farm_ids
SELECT 'activities' as tabela, farm_id, COUNT(*) as total FROM activities GROUP BY farm_id
UNION ALL
SELECT 'machines' as tabela, farm_id, COUNT(*) as total FROM machines GROUP BY farm_id
UNION ALL
SELECT 'inventory_items' as tabela, farm_id, COUNT(*) as total FROM inventory_items GROUP BY farm_id
UNION ALL
SELECT 'livestock' as tabela, farm_id, COUNT(*) as total FROM livestock GROUP BY farm_id
UNION ALL
SELECT 'crops' as tabela, farm_id, COUNT(*) as total FROM crops GROUP BY farm_id
ORDER BY tabela, farm_id;

-- 4. Verificar se as políticas RLS estão ativas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('activities', 'machines', 'inventory_items', 'livestock', 'crops', 'team_members')
ORDER BY tablename;

-- 5. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
