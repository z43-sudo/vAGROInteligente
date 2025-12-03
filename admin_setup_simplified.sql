-- ==============================================================================
-- SCRIPT SIMPLIFICADO E CORRIGIDO - PAINEL ADMIN
-- Execute este script se o anterior deu erro
-- ==============================================================================

-- PASSO 1: Criar tabelas (se não existirem)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    farm_id TEXT,
    role TEXT DEFAULT 'member',
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'trial',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 2: Inserir você como admin ROOT
INSERT INTO public.admin_users (email, role)
VALUES ('wallisom_53@outlook.com', 'root')
ON CONFLICT (email) DO UPDATE SET role = 'root';

-- PASSO 3: Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Apenas admins podem ver admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON public.user_profiles;
DROP POLICY IF EXISTS "Sistema pode inserir perfis" ON public.user_profiles;

-- PASSO 5: Criar políticas SIMPLIFICADAS
-- Admin pode ver lista de admins
CREATE POLICY "admin_select_admin_users" ON public.admin_users
    FOR SELECT
    USING (
        email IN (SELECT email FROM public.admin_users)
        OR
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    );

-- Admin pode ver todos os perfis
CREATE POLICY "admin_select_profiles" ON public.user_profiles
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    );

-- Admin pode atualizar perfis
CREATE POLICY "admin_update_profiles" ON public.user_profiles
    FOR UPDATE
    USING (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    );

-- Qualquer um pode inserir (para novos cadastros)
CREATE POLICY "anyone_insert_profiles" ON public.user_profiles
    FOR INSERT
    WITH CHECK (true);

-- PASSO 6: Sincronizar usuários existentes do auth.users
INSERT INTO public.user_profiles (user_id, email, full_name, farm_id, role)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'farm_id',
    COALESCE(raw_user_meta_data->>'role', 'member')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- PASSO 7: Criar função de sincronização
CREATE OR REPLACE FUNCTION public.sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, farm_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'farm_id',
        COALESCE(NEW.raw_user_meta_data->>'role', 'member')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        farm_id = EXCLUDED.farm_id,
        role = EXCLUDED.role,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 8: Criar trigger
DROP TRIGGER IF EXISTS sync_user_profile_trigger ON auth.users;
CREATE TRIGGER sync_user_profile_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile();

-- VERIFICAÇÃO FINAL
SELECT 'Setup completo! Verificando...' as status;

SELECT 
    'Você está cadastrado como admin?' as pergunta,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'wallisom_53@outlook.com')
        THEN '✅ SIM - Role: ' || (SELECT role FROM public.admin_users WHERE email = 'wallisom_53@outlook.com')
        ELSE '❌ NÃO'
    END as resposta;

SELECT 
    'Total de usuários sincronizados:' as info,
    COUNT(*) as total
FROM public.user_profiles;
