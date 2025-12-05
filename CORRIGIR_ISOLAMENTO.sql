-- ============================================================================
-- CORREÇÃO RÁPIDA - APENAS O ESSENCIAL
-- ============================================================================
-- Execute este arquivo para corrigir o isolamento de dados
-- Versão sem conflitos de triggers duplicados
-- ============================================================================

-- ============================================================================
-- 1. DESABILITAR RLS EM WEBHOOK_EVENTS
-- ============================================================================

ALTER TABLE public.webhook_events DISABLE ROW LEVEL SECURITY;

SELECT '✅ Passo 1: RLS desabilitado em webhook_events' as status;


-- ============================================================================
-- 2. CRIAR FUNÇÃO DE AUTO-PREENCHIMENTO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_user_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    
    IF NEW.farm_id IS NULL OR NEW.farm_id = '' THEN
        SELECT farm_id INTO NEW.farm_id
        FROM public.user_profiles
        WHERE user_id = auth.uid()
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Passo 2: Função de auto-preenchimento criada' as status;


-- ============================================================================
-- 3. APLICAR TRIGGERS (COM PROTEÇÃO CONTRA DUPLICAÇÃO)
-- ============================================================================

-- Remover todos os triggers antigos primeiro
DROP TRIGGER IF EXISTS set_user_id_crops ON public.crops;
DROP TRIGGER IF EXISTS set_user_id_activities ON public.activities;
DROP TRIGGER IF EXISTS set_user_id_machines ON public.machines;
DROP TRIGGER IF EXISTS set_user_id_livestock ON public.livestock;
DROP TRIGGER IF EXISTS set_user_id_inventory ON public.inventory_items;
DROP TRIGGER IF EXISTS set_user_id_chat ON public.chat_messages;

-- Criar novos triggers
CREATE TRIGGER set_user_id_crops
    BEFORE INSERT ON public.crops
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_activities
    BEFORE INSERT ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_machines
    BEFORE INSERT ON public.machines
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_livestock
    BEFORE INSERT ON public.livestock
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_inventory
    BEFORE INSERT ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_chat
    BEFORE INSERT ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

SELECT '✅ Passo 3: Triggers de auto-preenchimento criados' as status;


-- ============================================================================
-- 4. CORRIGIR POLÍTICA DE USER_PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    );

DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    );

SELECT '✅ Passo 4: Políticas de user_profiles corrigidas' as status;


-- ============================================================================
-- 5. FUNÇÃO DE TESTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.test_data_isolation()
RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    message TEXT
) AS $$
DECLARE
    current_farm_id TEXT;
    total_crops INTEGER;
    my_crops INTEGER;
BEGIN
    -- Pega o farm_id do usuário atual
    SELECT farm_id INTO current_farm_id
    FROM public.user_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Teste 1: Verifica se consegue ver apenas seus próprios dados
    SELECT COUNT(*) INTO total_crops FROM public.crops;
    SELECT COUNT(*) INTO my_crops FROM public.crops WHERE farm_id = current_farm_id;
    
    RETURN QUERY SELECT 
        'Isolamento de Safras'::TEXT,
        (total_crops = my_crops)::BOOLEAN,
        format('Total: %s | Seus: %s', total_crops, my_crops)::TEXT;
    
    -- Teste 2: Verifica se farm_id está setado
    RETURN QUERY SELECT 
        'Farm ID Configurado'::TEXT,
        (current_farm_id IS NOT NULL AND current_farm_id != '')::BOOLEAN,
        'Farm ID: ' || COALESCE(current_farm_id, 'NÃO CONFIGURADO')::TEXT;
    
    -- Teste 3: Verifica RLS ativo
    RETURN QUERY SELECT 
        'RLS Ativo em Crops'::TEXT,
        EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crops' AND rowsecurity = true)::BOOLEAN,
        'Verificado'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Passo 5: Função de teste criada' as status;


-- ============================================================================
-- 6. VERIFICAR DADOS ÓRFÃOS
-- ============================================================================

SELECT '🔍 Verificando dados sem farm_id:' as info;

SELECT 
    'crops' as tabela,
    COUNT(*) as total_orfaos
FROM public.crops
WHERE farm_id IS NULL OR farm_id = ''
UNION ALL
SELECT 
    'activities',
    COUNT(*)
FROM public.activities
WHERE farm_id IS NULL OR farm_id = ''
UNION ALL
SELECT 
    'inventory_items',
    COUNT(*)
FROM public.inventory_items
WHERE farm_id IS NULL OR farm_id = '';


-- ============================================================================
-- 7. RESUMO FINAL
-- ============================================================================

SELECT '✅ ============================================' as resultado;
SELECT '✅ CORREÇÕES APLICADAS COM SUCESSO!' as resultado;
SELECT '✅ ============================================' as resultado;
SELECT '' as resultado;
SELECT '🧪 TESTE AGORA:' as resultado;
SELECT 'Execute: SELECT * FROM public.test_data_isolation();' as resultado;


-- ============================================================================
-- INSTRUÇÕES DE TESTE
-- ============================================================================

/*
✅ CORREÇÕES CONCLUÍDAS!

🧪 PARA TESTAR:

1. Execute:
   SELECT * FROM public.test_data_isolation();

2. Você deve ver:
   - Isolamento de Safras: true
   - Farm ID Configurado: true
   - RLS Ativo: true

3. Teste criar um novo item:
   - Entre na aplicação
   - Crie uma nova safra ou item de estoque
   - Verifique se user_id e farm_id são automaticamente preenchidos

📊 PARA VER SEUS DADOS:

SELECT user_id, email, farm_id, role
FROM public.user_profiles
WHERE user_id = auth.uid();

⚠️ SE TIVER DADOS ANTIGOS SEM FARM_ID:

Execute para corrigir:

UPDATE public.crops SET 
    farm_id = (SELECT farm_id FROM user_profiles WHERE user_id = crops.user_id LIMIT 1)
WHERE (farm_id IS NULL OR farm_id = '') AND user_id IS NOT NULL;

UPDATE public.activities SET 
    farm_id = (SELECT farm_id FROM user_profiles WHERE user_id = activities.user_id LIMIT 1)
WHERE (farm_id IS NULL OR farm_id = '') AND user_id IS NOT NULL;

UPDATE public.inventory_items SET 
    farm_id = (SELECT farm_id FROM user_profiles WHERE user_id = inventory_items.user_id LIMIT 1)
WHERE (farm_id IS NULL OR farm_id = '') AND user_id IS NOT NULL;

UPDATE public.machines SET 
    farm_id = (SELECT farm_id FROM user_profiles WHERE user_id = machines.user_id LIMIT 1)
WHERE (farm_id IS NULL OR farm_id = '') AND user_id IS NOT NULL;

UPDATE public.livestock SET 
    farm_id = (SELECT farm_id FROM user_profiles WHERE user_id = livestock.user_id LIMIT 1)
WHERE (farm_id IS NULL OR farm_id = '') AND user_id IS NOT NULL;

UPDATE public.chat_messages SET 
    farm_id = (SELECT farm_id FROM user_profiles WHERE user_id = chat_messages.user_id LIMIT 1)
WHERE (farm_id IS NULL OR farm_id = '') AND user_id IS NOT NULL;

BOA SORTE! 🚀
*/
