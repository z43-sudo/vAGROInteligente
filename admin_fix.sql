-- 1. Cria a tabela de administradores se ela não existir
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- 2. Habilita RLS (Segurança a Nível de Linha) para a tabela admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Permite leitura da tabela admin_users para usuários autenticados
-- Isso é necessário para que a aplicação verifique se o usuário logado é admin
CREATE POLICY "Allow read access for authenticated users" ON public.admin_users
    FOR SELECT TO authenticated USING (true);

-- 4. Insere o seu email como administrador
-- IMPORTANTE: Substitua 'seu_email@exemplo.com' pelo seu email de login real
INSERT INTO public.admin_users (email)
VALUES 
    ('wallisom_53@outlook.com'), -- Email identificado no código
    ('seu_email_aqui@exemplo.com') -- Adicione outros emails se necessário
ON CONFLICT (email) DO NOTHING;

-- 5. Atualiza as permissões da tabela de perfis (user_profiles)
-- Primeiro, vamos garantir que a tabela existe e tem RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que podem estar restringindo o acesso
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Cria uma política unificada: 
-- Usuários podem ver seu próprio perfil OU Admins podem ver todos os perfis
CREATE POLICY "Profiles access policy" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (
        auth.uid() = id -- O usuário é dono do perfil
        OR
        EXISTS ( -- OU o usuário está na tabela admin_users
            SELECT 1 FROM public.admin_users 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- 6. Opcional: Permite que admins editem perfis (para mudar planos, status, etc)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.user_profiles;

CREATE POLICY "Admins can update profiles" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Permite que usuários editem seu PRÓPRIO perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);
