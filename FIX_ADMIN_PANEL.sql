-- ============================================================================
-- FIX ADMIN PANEL - RESOLVER PROBLEMA DE VISUALIZAÇÃO DE USUÁRIOS
-- ============================================================================

-- PARTE 1: Verificar se a tabela user_profiles existe e tem dados
SELECT 
    '=== VERIFICAÇÃO: Tabela user_profiles ===' as info;

SELECT 
    COUNT(*) as "Total de Usuários",
    COUNT(CASE WHEN farm_id IS NOT NULL THEN 1 END) as "Com farm_id",
    COUNT(CASE WHEN farm_id IS NULL THEN 1 END) as "Sem farm_id"
FROM public.user_profiles;

-- Mostrar todos os usuários
SELECT 
    user_id,
    email,
    full_name,
    farm_id,
    role,
    subscription_status,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- PARTE 2: Verificar se a tabela admin_users existe
SELECT 
    '=== VERIFICAÇÃO: Tabela admin_users ===' as info;

-- Criar tabela admin_users se não existir
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Verificar admins cadastrados
SELECT * FROM public.admin_users;

-- PARTE 3: Garantir que user_profiles tenha todos os usuários do auth.users
SELECT 
    '=== SINCRONIZAÇÃO: auth.users → user_profiles ===' as info;

-- Inserir usuários que estão em auth.users mas não em user_profiles
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
    email = EXCLUDED.email,
    farm_id = COALESCE(user_profiles.farm_id, EXCLUDED.farm_id);

-- PARTE 4: Corrigir farm_ids vazios ou inválidos
SELECT 
    '=== CORREÇÃO: farm_ids ===' as info;

UPDATE public.user_profiles
SET farm_id = 'farm-' || user_id
WHERE farm_id IS NULL 
   OR farm_id = '' 
   OR farm_id LIKE 'default-farm%';

-- PARTE 5: Habilitar RLS e criar políticas para user_profiles
SELECT 
    '=== CONFIGURAÇÃO: RLS user_profiles ===' as info;

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;

-- Criar políticas que permitem ao usuário ver seu próprio perfil
CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete" ON public.user_profiles
    FOR DELETE 
    USING (auth.uid() = user_id);

-- PARTE 6: Criar política ADMIN para visualizar todos os usuários
SELECT 
    '=== CONFIGURAÇÃO: Política ADMIN ===' as info;

-- Política para admins verem TODOS os usuários
CREATE POLICY "admin_view_all_users" ON public.user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.admin_users 
            WHERE admin_users.email = (
                SELECT email 
                FROM auth.users 
                WHERE id = auth.uid()
            )
        )
    );

-- PARTE 7: Configurar RLS para admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;

CREATE POLICY "admin_users_select" ON public.admin_users
    FOR SELECT
    USING (
        email = (
            SELECT email 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- PARTE 8: ADICIONAR SEU EMAIL COMO ADMIN (SUBSTITUA PELO SEU EMAIL)
-- ⚠️ IMPORTANTE: Substitua 'seu-email@example.com' pelo seu email real!

-- Exemplo de como adicionar um admin:
-- INSERT INTO public.admin_users (email) 
-- VALUES ('seu-email@example.com')
-- ON CONFLICT (email) DO NOTHING;

-- Descomente e edite a linha abaixo com seu email:
-- INSERT INTO public.admin_users (email) VALUES ('SEU_EMAIL_AQUI@example.com') ON CONFLICT (email) DO NOTHING;

-- PARTE 9: Verificação final
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as info;

-- Contar usuários
SELECT 
    COUNT(*) as "Total de Usuários em user_profiles"
FROM public.user_profiles;

-- Contar admins
SELECT 
    COUNT(*) as "Total de Admins"
FROM public.admin_users;

-- Mostrar todos os usuários com farm_id
SELECT 
    email,
    farm_id,
    role,
    subscription_status,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- Mostrar todos os admins
SELECT 
    email,
    created_at
FROM public.admin_users;

-- PARTE 10: Mensagem final
DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ FIX ADMIN PANEL EXECUTADO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Verifique os resultados acima';
    RAISE NOTICE '2. Adicione seu email como admin (Parte 8)';
    RAISE NOTICE '3. Faça LOGOUT e LOGIN novamente';
    RAISE NOTICE '4. Acesse /admin para ver os usuários';
    RAISE NOTICE '========================================';
END $$;
