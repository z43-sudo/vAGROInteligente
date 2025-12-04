-- ============================================
-- SCRIPT CORRIGIDO PARA CONFIGURAR USUÁRIO ADMIN
-- ============================================
-- Este script resolve o problema de "infinite recursion" nas políticas RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover políticas antigas que causam recursão infinita
DROP POLICY IF EXISTS "admin_select" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;

-- 2. Criar tabela admin_users (se não existir)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DESABILITAR RLS temporariamente para inserir o admin
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- 4. Inserir wallisom_53@outlook.com como admin (se ainda não existir)
INSERT INTO public.admin_users (email, role)
VALUES ('wallisom_53@outlook.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin', updated_at = NOW();

-- 5. HABILITAR RLS novamente
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6. Criar política CORRIGIDA que permite leitura para usuários autenticados
-- Esta política permite que qualquer usuário autenticado veja a tabela
-- A verificação de admin será feita no código da aplicação
CREATE POLICY "admin_users_select_authenticated" ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (true);

-- 7. Verificar se o admin foi criado
SELECT 
    '✅ ADMIN CONFIGURADO COM SUCESSO!' as status,
    email,
    role,
    created_at
FROM public.admin_users
WHERE email = 'wallisom_53@outlook.com';

-- 8. Listar todos os admins
SELECT 
    '=== TODOS OS ADMINISTRADORES ===' as info;
SELECT * FROM public.admin_users ORDER BY created_at DESC;

-- ============================================
-- INSTRUÇÕES IMPORTANTES
-- ============================================
-- 1. Após executar este script, você precisa:
--    a) Criar uma conta com o email wallisom_53@outlook.com
--    b) Fazer login com essa conta
--    c) O menu "Admin" aparecerá automaticamente na sidebar
--    d) Acessar http://localhost:3000/admin
-- ============================================
