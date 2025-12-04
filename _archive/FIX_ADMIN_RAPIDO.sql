-- ============================================================================
-- CORREÇÃO RÁPIDA - PAINEL ADMIN
-- Execute APENAS estas linhas se o menu Admin não aparecer
-- ============================================================================

-- PASSO 1: Garantir que a tabela admin_users existe
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PASSO 2: Adicionar você como admin ROOT
INSERT INTO public.admin_users (email, role)
VALUES ('wallisom_53@outlook.com', 'root')
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'root',
    updated_at = NOW();

-- PASSO 3: Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Remover política antiga (se existir)
DROP POLICY IF EXISTS "admin_select" ON public.admin_users;

-- PASSO 5: Criar política simples
CREATE POLICY "admin_select" ON public.admin_users
    FOR SELECT 
    USING (true); -- TEMPORARIAMENTE permite todos verem (para debug)

-- PASSO 6: Verificar se funcionou
SELECT 
    '✅ VOCÊ ESTÁ CADASTRADO COMO ADMIN!' as status,
    email,
    role,
    created_at
FROM public.admin_users
WHERE email = 'wallisom_53@outlook.com';

-- Se retornou seus dados acima, está funcionando!
-- Agora faça logout e login novamente no app

-- ============================================================================
-- DEPOIS DE TESTAR, EXECUTE ISSO PARA REATIVAR A SEGURANÇA:
-- ============================================================================

-- DROP POLICY IF EXISTS "admin_select" ON public.admin_users;
-- CREATE POLICY "admin_select" ON public.admin_users
--     FOR SELECT 
--     USING (
--         auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
--     );
