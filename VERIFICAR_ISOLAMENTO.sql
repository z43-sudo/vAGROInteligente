-- ============================================================================
-- VERIFICAÇÃO DE ISOLAMENTO DE DADOS (RLS TEST)
-- ============================================================================
-- Este script simula dois usuários para verificar se um consegue ver os dados do outro.
-- Execute este script no SQL Editor do Supabase.
-- ============================================================================

DO $$
DECLARE
    user_a_id UUID := uuid_generate_v4();
    user_b_id UUID := uuid_generate_v4();
    farm_a_id TEXT := 'farm-test-a';
    farm_b_id TEXT := 'farm-test-b';
    activity_id TEXT;
    count_result INTEGER;
BEGIN
    -- 1. Criar Perfis Fictícios para Teste
    INSERT INTO public.user_profiles (user_id, email, full_name, farm_id, role)
    VALUES 
        (user_a_id, 'user.a@test.com', 'User A', farm_a_id, 'owner'),
        (user_b_id, 'user.b@test.com', 'User B', farm_b_id, 'owner');

    -- 2. Simular Login como User A
    -- (Na prática, o Supabase define auth.uid() via token JWT, aqui simulamos isso)
    -- NOTA: Como não podemos alterar auth.uid() diretamente em bloco DO anônimo facilmente sem ser superuser,
    -- vamos testar a lógica inserindo dados diretamente com os farm_ids e verificando as políticas.
    
    -- Inserir atividade para Farm A
    INSERT INTO public.activities (id, title, description, status, time, type, farm_id)
    VALUES ('act-test-a', 'Atividade Secreta A', 'Apenas A deve ver', 'Agendado', 'Hoje', 'maintenance', farm_a_id);

    -- Inserir atividade para Farm B
    INSERT INTO public.activities (id, title, description, status, time, type, farm_id)
    VALUES ('act-test-b', 'Atividade Secreta B', 'Apenas B deve ver', 'Agendado', 'Hoje', 'maintenance', farm_b_id);

    -- 3. VERIFICAÇÃO MANUAL (Simulação de Query RLS)
    
    -- Teste: Quantas atividades o User A deveria ver? (Deveria ser 1)
    SELECT COUNT(*) INTO count_result
    FROM public.activities
    WHERE farm_id = farm_a_id;
    
    IF count_result = 1 THEN
        RAISE NOTICE '✅ Teste 1 Passou: User A tem acesso aos seus dados.';
    ELSE
        RAISE NOTICE '❌ Teste 1 Falhou: User A não encontrou seus dados.';
    END IF;

    -- Teste: Quantas atividades o User A veria do User B se tentasse filtrar pelo farm_id do B?
    -- (Com RLS ativo no banco real, a query simplesmente não retornaria nada se o usuário logado fosse A)
    -- Como este script roda como Admin no editor SQL, ele vê tudo.
    -- O teste real deve ser feito no App.
    
    RAISE NOTICE '⚠️ Para teste real de RLS, faça login no App com dois usuários diferentes.';
    RAISE NOTICE '   1. Crie uma atividade com User A.';
    RAISE NOTICE '   2. Logue com User B e verifique se a atividade NÃO aparece.';

    -- Limpeza dos dados de teste
    DELETE FROM public.activities WHERE id IN ('act-test-a', 'act-test-b');
    DELETE FROM public.user_profiles WHERE user_id IN (user_a_id, user_b_id);
    
END $$;
