-- ============================================================================
-- SETUP SIMPLIFICADO - PARTE 3: FUNÇÕES E TRIGGERS
-- ============================================================================
-- Execute este arquivo DEPOIS da Parte 2
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.create_user_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    new_farm_id TEXT;
BEGIN
    new_farm_id := 'farm-' || NEW.id;
    
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
        'owner',
        'free',
        'trial',
        NOW(),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para notificar chat
CREATE OR REPLACE FUNCTION public.notify_new_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    notification_payload JSON;
BEGIN
    notification_payload := json_build_object(
        'id', NEW.id,
        'farm_id', NEW.farm_id,
        'user_email', NEW.user_email,
        'user_name', NEW.user_name,
        'message', NEW.message,
        'created_at', NEW.created_at
    );
    
    PERFORM pg_notify('chat_' || NEW.farm_id, notification_payload::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar estoque mínimo
CREATE OR REPLACE FUNCTION public.check_inventory_minimum()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity IS NOT NULL 
       AND NEW.min_quantity IS NOT NULL 
       AND NEW.quantity <= NEW.min_quantity THEN
        
        INSERT INTO public.activities (
            farm_id,
            user_id,
            title,
            description,
            type,
            status,
            priority,
            due_date
        )
        VALUES (
            NEW.farm_id,
            NEW.user_id,
            '⚠️ Estoque Baixo: ' || NEW.name,
            'Quantidade atual: ' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'un') || '. Mínimo: ' || NEW.min_quantity,
            'inventory_alert',
            'pending',
            'high',
            CURRENT_DATE + INTERVAL '3 days'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para auto-completar atividades
CREATE OR REPLACE FUNCTION public.auto_complete_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        NEW.completed_at := NOW();
    ELSIF NEW.status != 'completed' THEN
        NEW.completed_at := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar manutenção
CREATE OR REPLACE FUNCTION public.check_machine_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.next_maintenance IS NOT NULL 
       AND NEW.next_maintenance <= CURRENT_DATE + INTERVAL '7 days' THEN
        
        INSERT INTO public.activities (
            farm_id,
            user_id,
            title,
            description,
            type,
            status,
            priority,
            due_date
        )
        VALUES (
            NEW.farm_id,
            NEW.user_id,
            '🔧 Manutenção: ' || NEW.name,
            'Data prevista: ' || TO_CHAR(NEW.next_maintenance, 'DD/MM/YYYY'),
            'maintenance',
            'pending',
            CASE WHEN NEW.next_maintenance < CURRENT_DATE THEN 'high' ELSE 'medium' END,
            NEW.next_maintenance
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS

-- Triggers de updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON public.machines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_livestock_updated_at
    BEFORE UPDATE ON public.livestock
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger de perfil automático
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile_on_signup();

-- Trigger de chat
CREATE TRIGGER on_chat_message_created
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.notify_new_chat_message();

-- Trigger de estoque
CREATE TRIGGER on_inventory_changed
    AFTER INSERT OR UPDATE OF quantity ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.check_inventory_minimum();

-- Trigger de atividades
CREATE TRIGGER on_activity_status_changed
    BEFORE UPDATE OF status ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.auto_complete_activity();

-- Trigger de manutenção
CREATE TRIGGER on_machine_updated
    AFTER INSERT OR UPDATE OF next_maintenance ON public.machines
    FOR EACH ROW EXECUTE FUNCTION public.check_machine_maintenance();

SELECT '✅ PARTE 3 COMPLETA - Funções e Triggers criados!' as status;
SELECT '🎉 SETUP COMPLETO - Sistema pronto para uso!' as status;
