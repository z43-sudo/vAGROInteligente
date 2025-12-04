-- ==============================================================================
-- SCRIPT PARA CORRIGIR USUÁRIOS SEM FARM_ID
-- Este script atribui um farm_id único para cada usuário que não possui
-- ==============================================================================

-- IMPORTANTE: Este script atualiza os metadados dos usuários no Supabase Auth
-- Você precisa executar isso no SQL Editor do Supabase

-- 1. VERIFICAR USUÁRIOS SEM FARM_ID
SELECT 
    id,
    email,
    raw_user_meta_data->>'farm_id' as farm_id_atual,
    raw_user_meta_data->>'full_name' as nome,
    created_at
FROM auth.users
WHERE raw_user_meta_data->>'farm_id' IS NULL
ORDER BY created_at;

-- 2. ATRIBUIR FARM_ID ÚNICO PARA CADA USUÁRIO SEM FARM_ID
-- ATENÇÃO: Execute este bloco com cuidado!

DO $$
DECLARE
    user_record RECORD;
    new_farm_id TEXT;
BEGIN
    -- Loop através de todos os usuários sem farm_id
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users
        WHERE raw_user_meta_data->>'farm_id' IS NULL
    LOOP
        -- Gerar um farm_id único baseado no timestamp e ID do usuário
        new_farm_id := 'farm_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTRING(user_record.id::TEXT, 1, 8);
        
        -- Atualizar os metadados do usuário
        UPDATE auth.users
        SET raw_user_meta_data = 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'farm_id', new_farm_id,
                'role', 'owner',
                'full_name', COALESCE(raw_user_meta_data->>'full_name', 'Usuário')
            )
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Farm ID atribuído para %: %', user_record.email, new_farm_id;
    END LOOP;
END $$;

-- 3. VERIFICAR SE TODOS OS USUÁRIOS AGORA TÊM FARM_ID
SELECT 
    id,
    email,
    raw_user_meta_data->>'farm_id' as farm_id,
    raw_user_meta_data->>'full_name' as nome,
    raw_user_meta_data->>'role' as papel,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 4. VERIFICAR SE HÁ FARM_IDS DUPLICADOS (não deveria haver)
SELECT 
    raw_user_meta_data->>'farm_id' as farm_id,
    COUNT(*) as quantidade_usuarios,
    array_agg(email) as emails
FROM auth.users
WHERE raw_user_meta_data->>'farm_id' IS NOT NULL
GROUP BY raw_user_meta_data->>'farm_id'
HAVING COUNT(*) > 1;

-- FIM DO SCRIPT
