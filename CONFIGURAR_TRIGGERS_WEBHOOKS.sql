-- ============================================================================
-- CONFIGURAÇÃO COMPLETA DE TRIGGERS E WEBHOOKS - AGRO INTELIGENTE
-- ============================================================================
-- Este script configura todos os triggers e webhooks necessários para o
-- funcionamento completo do aplicativo Agro Inteligente.
-- ============================================================================
-- Criado em: 2025-12-05
-- Versão: 1.0
-- ============================================================================

-- ============================================================================
-- PARTE 1: FUNÇÕES AUXILIARES
-- ============================================================================

-- 1.1 Função para atualizar automaticamente o campo updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Atualiza automaticamente o campo updated_at com o timestamp atual';


-- 1.2 Função para criar perfil de usuário automaticamente ao cadastrar
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_user_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    new_farm_id TEXT;
BEGIN
    -- Gera um farm_id único baseado no user_id
    new_farm_id := 'farm-' || NEW.id;
    
    -- Cria o perfil do usuário
    INSERT INTO public.user_profiles (
        user_id,
        email,
        farm_id,
        full_name,
        role,
        subscription_plan,
        subscription_status,
        subscription_start_date,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        new_farm_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
        'owner', -- Primeiro usuário da fazenda é sempre owner
        'free',  -- Plano inicial gratuito
        'trial', -- Status trial por padrão
        NOW(),   -- Data de início da assinatura
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Se já existe perfil, apenas retorna
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log do erro mas não falha o signup
        RAISE WARNING 'Erro ao criar perfil do usuário: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_user_profile_on_signup() IS 
'Cria automaticamente um perfil de usuário quando um novo usuário se cadastra';


-- 1.3 Função para notificar novas mensagens no chat em tempo real
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_new_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    notification_payload JSON;
BEGIN
    -- Monta o payload da notificação
    notification_payload := json_build_object(
        'id', NEW.id,
        'farm_id', NEW.farm_id,
        'user_id', NEW.user_id,
        'user_email', NEW.user_email,
        'user_name', NEW.user_name,
        'message', NEW.message,
        'created_at', NEW.created_at
    );
    
    -- Envia notificação para o canal específico da fazenda
    PERFORM pg_notify(
        'chat_' || NEW.farm_id,
        notification_payload::text
    );
    
    -- Também envia para canal geral de chat
    PERFORM pg_notify(
        'chat_messages',
        notification_payload::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.notify_new_chat_message() IS 
'Envia notificação em tempo real quando uma nova mensagem é postada no chat';


-- 1.4 Função para verificar estoque mínimo e criar alertas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_inventory_minimum()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se a quantidade está abaixo do mínimo
    IF NEW.quantity IS NOT NULL 
       AND NEW.min_quantity IS NOT NULL 
       AND NEW.quantity <= NEW.min_quantity THEN
        
        -- Cria uma atividade de alerta
        INSERT INTO public.activities (
            farm_id,
            user_id,
            title,
            description,
            type,
            status,
            priority,
            due_date,
            created_at,
            updated_at
        )
        VALUES (
            NEW.farm_id,
            NEW.user_id,
            '⚠️ Estoque Baixo: ' || NEW.name,
            'O item "' || NEW.name || '" está com estoque baixo. Quantidade atual: ' 
            || NEW.quantity || ' ' || COALESCE(NEW.unit, 'unidades') 
            || '. Mínimo recomendado: ' || NEW.min_quantity || ' ' || COALESCE(NEW.unit, 'unidades') || '.',
            'inventory_alert',
            'pending',
            'high',
            CURRENT_DATE + INTERVAL '3 days',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_inventory_minimum() IS 
'Verifica se o estoque está abaixo do mínimo e cria um alerta automático';


-- 1.5 Função para auto-completar data de conclusão de atividades
-- ============================================================================
CREATE OR REPLACE FUNCTION public.auto_complete_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o status mudou para 'completed' e não tem data de conclusão
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at := NOW();
    END IF;
    
    -- Se o status mudou de 'completed' para outro, remove a data
    IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
        NEW.completed_at := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.auto_complete_activity() IS 
'Define automaticamente a data de conclusão quando uma atividade é marcada como concluída';


-- 1.6 Função para verificar manutenção de máquinas vencida
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_machine_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se a próxima manutenção está vencida ou próxima
    IF NEW.next_maintenance IS NOT NULL 
       AND NEW.next_maintenance <= CURRENT_DATE + INTERVAL '7 days'
       AND NEW.status != 'maintenance' THEN
        
        -- Cria uma atividade de manutenção
        INSERT INTO public.activities (
            farm_id,
            user_id,
            title,
            description,
            type,
            status,
            priority,
            due_date,
            created_at,
            updated_at
        )
        VALUES (
            NEW.farm_id,
            NEW.user_id,
            '🔧 Manutenção: ' || NEW.name,
            'A máquina "' || NEW.name || '" (' || COALESCE(NEW.model, 'Modelo não especificado') 
            || ') precisa de manutenção. Data prevista: ' 
            || TO_CHAR(NEW.next_maintenance, 'DD/MM/YYYY') || '.',
            'maintenance',
            'pending',
            CASE 
                WHEN NEW.next_maintenance < CURRENT_DATE THEN 'high'
                WHEN NEW.next_maintenance <= CURRENT_DATE + INTERVAL '3 days' THEN 'high'
                ELSE 'medium'
            END,
            NEW.next_maintenance,
            NOW(),
            NOW()
        )
        ON CONFLICT DO NOTHING; -- Evita duplicatas
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_machine_maintenance() IS 
'Verifica se a manutenção da máquina está próxima e cria alertas automáticos';


-- 1.7 Função para verificar itens com data de validade próxima
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se a data de validade está próxima (30 dias)
    IF NEW.expiry_date IS NOT NULL 
       AND NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
        
        INSERT INTO public.activities (
            farm_id,
            user_id,
            title,
            description,
            type,
            status,
            priority,
            due_date,
            created_at,
            updated_at
        )
        VALUES (
            NEW.farm_id,
            NEW.user_id,
            '📅 Validade Próxima: ' || NEW.name,
            'O item "' || NEW.name || '" tem validade próxima: ' 
            || TO_CHAR(NEW.expiry_date, 'DD/MM/YYYY') || '. Quantidade: '
            || NEW.quantity || ' ' || COALESCE(NEW.unit, 'unidades') || '.',
            'expiry_alert',
            'pending',
            CASE 
                WHEN NEW.expiry_date < CURRENT_DATE THEN 'high'
                WHEN NEW.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'high'
                ELSE 'medium'
            END,
            NEW.expiry_date,
            NOW(),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_expiry_date() IS 
'Verifica se itens do estoque estão próximos da data de validade';


-- 1.8 Função para log de auditoria
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    audit_log JSON;
BEGIN
    audit_log := json_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'timestamp', NOW(),
        'old_data', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    
    -- Aqui você pode inserir em uma tabela de auditoria ou enviar para webhook
    PERFORM pg_notify('audit_log', audit_log::text);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.log_table_changes() IS 
'Registra mudanças nas tabelas para auditoria';


-- ============================================================================
-- PARTE 2: REMOVER TRIGGERS ANTIGOS (SE EXISTIREM)
-- ============================================================================

-- Triggers de updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_crops_updated_at ON public.crops;
DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities;
DROP TRIGGER IF EXISTS update_machines_updated_at ON public.machines;
DROP TRIGGER IF EXISTS update_livestock_updated_at ON public.livestock;
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;

-- Outros triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_chat_message_created ON public.chat_messages;
DROP TRIGGER IF EXISTS on_inventory_changed ON public.inventory_items;
DROP TRIGGER IF EXISTS on_activity_status_changed ON public.activities;
DROP TRIGGER IF EXISTS on_machine_updated ON public.machines;
DROP TRIGGER IF EXISTS on_inventory_expiry_check ON public.inventory_items;


-- ============================================================================
-- PARTE 3: CRIAR TRIGGERS DE ATUALIZAÇÃO DE TIMESTAMP
-- ============================================================================

-- 3.1 Trigger para user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.2 Trigger para crops
CREATE TRIGGER update_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.3 Trigger para activities
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.4 Trigger para machines
CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON public.machines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.5 Trigger para livestock
CREATE TRIGGER update_livestock_updated_at
    BEFORE UPDATE ON public.livestock
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.6 Trigger para inventory_items
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.7 Trigger para admin_users
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- PARTE 4: CRIAR TRIGGERS DE NEGÓCIO
-- ============================================================================

-- 4.1 Trigger para criar perfil automaticamente ao cadastrar usuário
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_profile_on_signup();

-- 4.2 Trigger para notificar novas mensagens de chat
CREATE TRIGGER on_chat_message_created
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_chat_message();

-- 4.3 Trigger para verificar estoque mínimo
CREATE TRIGGER on_inventory_changed
    AFTER INSERT OR UPDATE OF quantity ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION public.check_inventory_minimum();

-- 4.4 Trigger para auto-completar atividades
CREATE TRIGGER on_activity_status_changed
    BEFORE UPDATE OF status ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_complete_activity();

-- 4.5 Trigger para verificar manutenção de máquinas
CREATE TRIGGER on_machine_updated
    AFTER INSERT OR UPDATE OF next_maintenance ON public.machines
    FOR EACH ROW
    EXECUTE FUNCTION public.check_machine_maintenance();

-- 4.6 Trigger para verificar data de validade
CREATE TRIGGER on_inventory_expiry_check
    AFTER INSERT OR UPDATE OF expiry_date ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION public.check_expiry_date();


-- ============================================================================
-- PARTE 5: CONFIGURAÇÃO DE REALTIME (WEBHOOKS INTERNOS)
-- ============================================================================

-- Habilitar Realtime para tabelas específicas
-- Nota: Isso precisa ser executado também no painel do Supabase em:
-- Database > Replication > Supabase Realtime

-- Habilitar publicação de eventos para tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock;

-- ============================================================================
-- PARTE 6: TABELA DE WEBHOOKS (PARA INTEGRAÇÕES EXTERNAS)
-- ============================================================================

-- 6.1 Criar tabela para registrar webhooks
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    endpoint_url TEXT,
    response JSONB,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

COMMENT ON TABLE public.webhook_events IS 
'Registra eventos de webhook para processamento assíncrono';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);


-- 6.2 Função para registrar webhooks
CREATE OR REPLACE FUNCTION public.register_webhook_event(
    p_event_type TEXT,
    p_payload JSONB,
    p_endpoint_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    webhook_id UUID;
BEGIN
    INSERT INTO public.webhook_events (
        event_type,
        payload,
        endpoint_url,
        created_at
    )
    VALUES (
        p_event_type,
        p_payload,
        p_endpoint_url,
        NOW()
    )
    RETURNING id INTO webhook_id;
    
    RETURN webhook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.register_webhook_event IS 
'Registra um novo evento de webhook para processamento';


-- 6.3 Função para processar webhook de assinatura
CREATE OR REPLACE FUNCTION public.process_subscription_webhook(
    p_user_email TEXT,
    p_subscription_plan TEXT,
    p_subscription_status TEXT,
    p_payment_status TEXT DEFAULT 'paid'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_end_date TIMESTAMPTZ;
BEGIN
    -- Busca o user_id pelo email
    SELECT user_id INTO v_user_id
    FROM public.user_profiles
    WHERE email = p_user_email
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuário não encontrado: %', p_user_email;
        RETURN FALSE;
    END IF;
    
    -- Calcula data de término baseado no plano
    CASE p_subscription_plan
        WHEN 'basic' THEN v_end_date := NOW() + INTERVAL '3 months';
        WHEN 'professional' THEN v_end_date := NOW() + INTERVAL '6 months';
        WHEN 'enterprise' THEN v_end_date := NOW() + INTERVAL '1 year';
        ELSE v_end_date := NOW() + INTERVAL '1 month';
    END CASE;
    
    -- Atualiza o perfil do usuário
    UPDATE public.user_profiles
    SET 
        subscription_plan = p_subscription_plan,
        subscription_status = p_subscription_status,
        subscription_start_date = NOW(),
        subscription_end_date = v_end_date,
        updated_at = NOW()
    WHERE user_id = v_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.process_subscription_webhook IS 
'Processa webhook de atualização de assinatura/pagamento';


-- ============================================================================
-- PARTE 7: EDGE FUNCTIONS (WEBHOOKS EXTERNOS)
-- ============================================================================

-- Estas funções devem ser criadas no painel do Supabase como Edge Functions
-- Aqui estão os templates que você pode usar:

/*
WEBHOOK 1: /functions/v1/subscription-webhook
Descrição: Recebe notificações de pagamento (PIX, Cartão, etc)

Exemplo de payload esperado:
{
    "event": "payment.approved",
    "user_email": "usuario@exemplo.com",
    "subscription_plan": "professional",
    "payment_method": "pix",
    "amount": 247.00,
    "status": "paid"
}

WEBHOOK 2: /functions/v1/weather-update
Descrição: Atualiza dados meteorológicos para fazendas

WEBHOOK 3: /functions/v1/market-prices
Descrição: Atualiza preços de commodities agrícolas

WEBHOOK 4: /functions/v1/notification-sender
Descrição: Envia notificações push/email/sms

WEBHOOK 5: /functions/v1/whatsapp-integration
Descrição: Integração com API do WhatsApp para suporte
*/


-- ============================================================================
-- PARTE 8: FUNÇÕES AUXILIARES PARA WEBHOOKS
-- ============================================================================

-- 8.1 Função para enviar notificação de estoque baixo (webhook externo)
CREATE OR REPLACE FUNCTION public.send_low_stock_notification(
    p_farm_id TEXT,
    p_item_name TEXT,
    p_quantity DECIMAL
)
RETURNS VOID AS $$
DECLARE
    webhook_payload JSONB;
BEGIN
    webhook_payload := jsonb_build_object(
        'event', 'low_stock_alert',
        'farm_id', p_farm_id,
        'item_name', p_item_name,
        'quantity', p_quantity,
        'timestamp', NOW()
    );
    
    PERFORM public.register_webhook_event(
        'low_stock_alert',
        webhook_payload,
        'https://seu-dominio.com/webhook/notifications'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8.2 Função para enviar notificação de manutenção
CREATE OR REPLACE FUNCTION public.send_maintenance_notification(
    p_farm_id TEXT,
    p_machine_name TEXT,
    p_due_date DATE
)
RETURNS VOID AS $$
DECLARE
    webhook_payload JSONB;
BEGIN
    webhook_payload := jsonb_build_object(
        'event', 'maintenance_due',
        'farm_id', p_farm_id,
        'machine_name', p_machine_name,
        'due_date', p_due_date,
        'timestamp', NOW()
    );
    
    PERFORM public.register_webhook_event(
        'maintenance_due',
        webhook_payload,
        'https://seu-dominio.com/webhook/notifications'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- PARTE 9: VERIFICAÇÃO E TESTES
-- ============================================================================

-- 9.1 Verificar todas as funções criadas
SELECT 
    routine_name as "Função",
    routine_type as "Tipo"
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE '%update%' 
    OR routine_name LIKE '%create%'
    OR routine_name LIKE '%notify%'
    OR routine_name LIKE '%check%'
    OR routine_name LIKE '%log%'
    OR routine_name LIKE '%webhook%'
ORDER BY routine_name;

-- 9.2 Verificar todos os triggers criados
SELECT 
    trigger_name as "Trigger",
    event_object_table as "Tabela",
    action_timing as "Timing",
    event_manipulation as "Evento"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 9.3 Mensagem de sucesso
SELECT '✅ TRIGGERS E WEBHOOKS CONFIGURADOS COM SUCESSO!' as status;
SELECT 'Total de funções criadas:' as info, COUNT(*) as total 
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND (routine_name LIKE '%update%' 
    OR routine_name LIKE '%create%'
    OR routine_name LIKE '%notify%'
    OR routine_name LIKE '%check%'
    OR routine_name LIKE '%webhook%');

SELECT 'Total de triggers criados:' as info, COUNT(*) as total 
FROM information_schema.triggers
WHERE trigger_schema = 'public';


-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================

/*
COMO USAR ESTE SCRIPT:

1. BACKUP: Faça backup do seu banco antes de executar!

2. EXECUÇÃO: 
   - Copie todo este script
   - Cole no SQL Editor do Supabase
   - Clique em "RUN"

3. VERIFICAÇÃO:
   - Verifique se as funções foram criadas
   - Verifique se os triggers estão ativos
   - Teste inserindo/atualizando registros

4. CONFIGURAÇÃO DE REALTIME:
   - Vá para: Database > Replication
   - Habilite as tabelas necessárias em "Supabase Realtime"

5. EDGE FUNCTIONS (WEBHOOKS EXTERNOS):
   - Você precisará criar as Edge Functions no painel
   - Use os templates fornecidos na PARTE 7
   - Configure as URLs dos webhooks conforme necessário

6. TESTES RECOMENDADOS:
   - Criar um novo usuário (testar trigger de perfil)
   - Enviar mensagem no chat (testar notificação realtime)
   - Atualizar estoque (testar alerta de estoque baixo)
   - Marcar atividade como concluída (testar auto-complete)
   - Atualizar manutenção de máquina (testar alerta)

SUPORTE:
- Documentação Supabase: https://supabase.com/docs
- Triggers: https://supabase.com/docs/guides/database/postgres/triggers
- Realtime: https://supabase.com/docs/guides/realtime
- Edge Functions: https://supabase.com/docs/guides/functions
*/
