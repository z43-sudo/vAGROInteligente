-- ============================================================================
-- ATIVAR REALTIME MANUALMENTE VIA SQL
-- ============================================================================
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================================

-- IMPORTANTE: Primeiro verifica se a publicação existe
DO $$
BEGIN
    -- Criar a publicação se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
        RAISE NOTICE 'Publicação supabase_realtime criada!';
    ELSE
        RAISE NOTICE 'Publicação supabase_realtime já existe!';
    END IF;
END $$;

-- Adicionar tabelas à publicação do Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock;

-- Verificar quais tabelas estão habilitadas
SELECT 
    '✅ Tabelas com Realtime habilitado:' as info;

SELECT 
    schemaname as "Schema",
    tablename as "Tabela"
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

SELECT '🎉 Realtime ativado com sucesso!' as status;
