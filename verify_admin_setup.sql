-- ==============================================================================
-- SCRIPT DE VERIFICAÇÃO DO PAINEL ADMIN
-- Execute este script para verificar se tudo foi criado corretamente
-- ==============================================================================

-- 1. Verificar se a tabela admin_users existe
SELECT 
    'admin_users' as tabela,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'admin_users'
        ) THEN '✅ Existe'
        ELSE '❌ NÃO existe'
    END as status;

-- 2. Verificar se a tabela user_profiles existe
SELECT 
    'user_profiles' as tabela,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles'
        ) THEN '✅ Existe'
        ELSE '❌ NÃO existe'
    END as status;

-- 3. Verificar se você está cadastrado como admin
SELECT 
    'Seu usuário admin' as verificacao,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = 'wallisom_53@outlook.com'
        ) THEN '✅ Cadastrado como ' || (SELECT role FROM admin_users WHERE email = 'wallisom_53@outlook.com')
        ELSE '❌ NÃO cadastrado'
    END as status;

-- 4. Listar todos os admins cadastrados
SELECT 
    '=== ADMINS CADASTRADOS ===' as info;
SELECT * FROM admin_users;

-- 5. Verificar RLS nas tabelas
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Ativo'
        ELSE '❌ RLS Inativo'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('admin_users', 'user_profiles');

-- 6. Listar políticas da tabela admin_users
SELECT 
    '=== POLÍTICAS admin_users ===' as info;
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- 7. Listar políticas da tabela user_profiles
SELECT 
    '=== POLÍTICAS user_profiles ===' as info;
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 8. Verificar se existem usuários em user_profiles
SELECT 
    'Total de usuários em user_profiles' as info,
    COUNT(*) as total
FROM user_profiles;

-- 9. Listar alguns usuários (se existirem)
SELECT 
    '=== PRIMEIROS 5 USUÁRIOS ===' as info;
SELECT 
    email,
    full_name,
    farm_id,
    subscription_plan,
    subscription_status,
    created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- 10. Verificar triggers
SELECT 
    '=== TRIGGERS ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'update_user_profiles_updated_at');

-- 11. Verificar funções
SELECT 
    '=== FUNÇÕES ===' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'update_updated_at_column');

-- FIM DA VERIFICAÇÃO
