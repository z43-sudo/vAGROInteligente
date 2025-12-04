-- ============================================================================
-- FIX RLS DEFINITIVO - CORREÇÃO DE ISOLAMENTO DE DADOS
-- ============================================================================
-- Este script remove todas as políticas antigas e aplica regras estritas
-- onde cada usuário só vê dados do seu próprio farm_id.
-- ============================================================================

-- 1. Habilitar RLS em todas as tabelas (garantia)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Função auxiliar para limpar e recriar políticas
CREATE OR REPLACE FUNCTION reset_isolation_policies(table_name text) RETURNS void AS $$
BEGIN
    -- Remover TODAS as políticas existentes da tabela para evitar conflitos/vazamentos
    EXECUTE format('DROP POLICY IF EXISTS "%s_select_policy" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert_policy" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_update_policy" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_delete_policy" ON public.%s', table_name, table_name);
    
    -- Remover políticas com nomes antigos comuns (caso existam)
    EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.%s', table_name, table_name);

    -- CRIAR NOVAS POLÍTICAS ESTRITAS

    -- SELECT: Usuário só vê dados onde farm_id bate com o seu
    EXECUTE format('
        CREATE POLICY "%s_select_policy" ON public.%s
        FOR SELECT USING (
            farm_id IN (
                SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()
            )
        );
    ', table_name, table_name);

    -- INSERT: Usuário só insere dados com seu farm_id
    EXECUTE format('
        CREATE POLICY "%s_insert_policy" ON public.%s
        FOR INSERT WITH CHECK (
            farm_id IN (
                SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()
            )
        );
    ', table_name, table_name);

    -- UPDATE: Usuário só atualiza dados do seu farm_id
    EXECUTE format('
        CREATE POLICY "%s_update_policy" ON public.%s
        FOR UPDATE USING (
            farm_id IN (
                SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()
            )
        );
    ', table_name, table_name);

    -- DELETE: Usuário só deleta dados do seu farm_id
    EXECUTE format('
        CREATE POLICY "%s_delete_policy" ON public.%s
        FOR DELETE USING (
            farm_id IN (
                SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid()
            )
        );
    ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- 3. Aplicar políticas para todas as tabelas de dados
SELECT reset_isolation_policies('activities');
SELECT reset_isolation_policies('crops');
SELECT reset_isolation_policies('machines');
SELECT reset_isolation_policies('livestock');
SELECT reset_isolation_policies('inventory_items');
SELECT reset_isolation_policies('team_members');
SELECT reset_isolation_policies('messages');
SELECT reset_isolation_policies('financial_transactions');

-- 4. Garantir que user_profiles tenha políticas corretas
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- 5. Sincronização de Emergência: Garantir que todo usuário tenha um perfil e farm_id
INSERT INTO public.user_profiles (user_id, email, full_name, farm_id, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    'farm-' || id,
    'owner'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT DO NOTHING;

-- 6. Corrigir farm_ids vazios ou inválidos
UPDATE public.user_profiles
SET farm_id = 'farm-' || user_id
WHERE farm_id IS NULL OR farm_id = '' OR farm_id LIKE 'default-farm%';

-- 7. Mensagem de Sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ FIX RLS DEFINITIVO APLICADO COM SUCESSO!';
    RAISE NOTICE 'Todas as políticas foram resetadas e o isolamento está ativo.';
END $$;
