-- ============================================================================
-- SCRIPT DE DIAGNÓSTICO - PAINEL ADMIN
-- Execute este script no Supabase para verificar o que está errado
-- ============================================================================

-- 1. Verificar se as tabelas existem
SELECT 
    '=== VERIFICAÇÃO DE TABELAS ===' as info;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('admin_users', 'user_profiles') THEN '✅ Existe'
        ELSE '❌ Não deveria estar aqui'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admin_users', 'user_profiles')
ORDER BY table_name;

-- 2. Verificar se você está cadastrado como admin
SELECT 
    '=== VERIFICAÇÃO DO SEU USUÁRIO ADMIN ===' as info;

SELECT 
    email,
    role,
    created_at,
    '✅ Você está cadastrado como admin!' as status
FROM public.admin_users
WHERE email = 'wallisom_53@outlook.com';

-- Se não retornar nada acima, você NÃO está cadastrado!

-- 3. Ver TODOS os admins cadastrados
SELECT 
    '=== TODOS OS ADMINS ===' as info;

SELECT * FROM public.admin_users;

-- 4. Verificar RLS na tabela admin_users
SELECT 
    '=== RLS EM admin_users ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- 5. Ver políticas da tabela admin_users
SELECT 
    '=== POLÍTICAS DE admin_users ===' as info;

SELECT 
    policyname,
    cmd as comando,
    qual as condicao
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- 6. Verificar se existem perfis de usuários
SELECT 
    '=== PERFIS DE USUÁRIOS ===' as info;

SELECT 
    COUNT(*) as total_perfis
FROM public.user_profiles;

-- 7. Ver seu perfil (se existir)
SELECT 
    '=== SEU PERFIL ===' as info;

SELECT 
    email,
    full_name,
    farm_id,
    role,
    subscription_plan,
    subscription_status
FROM public.user_profiles
WHERE email = 'wallisom_53@outlook.com';

-- ============================================================================
-- SOLUÇÕES RÁPIDAS (execute se necessário)
-- ============================================================================

-- SOLUÇÃO 1: Se você NÃO está em admin_users, adicione-se:
-- DESCOMENTE a linha abaixo e execute:
-- INSERT INTO public.admin_users (email, role) VALUES ('wallisom_53@outlook.com', 'root') ON CONFLICT (email) DO UPDATE SET role = 'root';

-- SOLUÇÃO 2: Se a tabela admin_users não existe, crie:
-- DESCOMENTE as linhas abaixo e execute:
-- CREATE TABLE IF NOT EXISTS public.admin_users (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     email TEXT UNIQUE NOT NULL,
--     role TEXT DEFAULT 'admin',
--     created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--     updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
-- );
-- ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "admin_select" ON public.admin_users FOR SELECT USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));
-- INSERT INTO public.admin_users (email, role) VALUES ('wallisom_53@outlook.com', 'root');

-- FIM DO DIAGNÓSTICO
