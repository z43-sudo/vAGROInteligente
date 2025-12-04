-- ============================================================================
-- SETUP GERAL DEFINITIVO - AGRO INTELIGENTE
-- ============================================================================
-- Este script recria toda a estrutura do banco de dados com isolamento total
-- de dados por usuário (farm_id) e corrige problemas de autenticação.
-- ============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter o farm_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_farm_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT farm_id 
    FROM public.user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. TABELAS DE SISTEMA E USUÁRIOS
-- ============================================================================

-- Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    farm_id TEXT NOT NULL,
    role TEXT DEFAULT 'owner', -- 'owner', 'member'
    subscription_plan TEXT DEFAULT 'free', -- 'free', 'basic', 'professional', 'enterprise'
    subscription_status TEXT DEFAULT 'trial', -- 'active', 'inactive', 'suspended', 'trial'
    subscription_start_date TIMESTAMPTZ DEFAULT NOW(),
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Administradores do Sistema
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin', -- 'root', 'admin', 'support'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TABELAS DE DADOS (COM FARM_ID)
-- ============================================================================

-- Atividades
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY, -- Usando TEXT pois o frontend gera IDs numéricos como string
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('Em andamento', 'Concluído', 'Urgente', 'Agendado')),
    time TEXT,
    type TEXT CHECK (type IN ('irrigation', 'maintenance', 'alert', 'harvest')),
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safras (Crops)
CREATE TABLE IF NOT EXISTS public.crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT,
    stage TEXT CHECK (stage IN ('Floração', 'Enchimento', 'Vegetativo', 'Maturação')),
    progress INTEGER DEFAULT 0,
    days_to_harvest INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'completed')),
    start_date TIMESTAMPTZ,
    cycle_duration INTEGER,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Máquinas
CREATE TABLE IF NOT EXISTS public.machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT CHECK (status IN ('Operando', 'Manutenção', 'Parado')),
    hours INTEGER DEFAULT 0,
    location TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pecuária (Livestock)
CREATE TABLE IF NOT EXISTS public.livestock (
    id TEXT PRIMARY KEY,
    tag TEXT NOT NULL,
    type TEXT CHECK (type IN ('Bovino', 'Suíno', 'Ovino', 'Equino')),
    breed TEXT,
    weight NUMERIC,
    age INTEGER,
    status TEXT CHECK (status IN ('Saudável', 'Doente', 'Tratamento', 'Vendido')),
    location TEXT,
    last_vaccination TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estoque (Inventory)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('Sementes', 'Fertilizantes', 'Defensivos', 'Peças', 'Combustível')),
    quantity NUMERIC DEFAULT 0,
    unit TEXT,
    min_quantity NUMERIC DEFAULT 0,
    location TEXT,
    last_restock TEXT,
    status TEXT CHECK (status IN ('Normal', 'Baixo', 'Crítico')),
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipe (Team Members)
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Administrador', 'Gerente', 'Agrônomo', 'Operador', 'Veterinário')),
    email TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('Ativo', 'Inativo')),
    avatar TEXT,
    department TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID NOT NULL,
    sender_name TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transações Financeiras
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('Receita', 'Despesa')),
    category TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_farm_id ON public.user_profiles(farm_id);
CREATE INDEX IF NOT EXISTS idx_activities_farm_id ON public.activities(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_machines_farm_id ON public.machines(farm_id);
CREATE INDEX IF NOT EXISTS idx_livestock_farm_id ON public.livestock(farm_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_farm_id ON public.inventory_items(farm_id);
CREATE INDEX IF NOT EXISTS idx_team_members_farm_id ON public.team_members(farm_id);
CREATE INDEX IF NOT EXISTS idx_messages_farm_id ON public.messages(farm_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_farm_id ON public.financial_transactions(farm_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) - ISOLAMENTO TOTAL
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- --- POLÍTICAS PARA USER_PROFILES ---

-- Usuário vê apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Usuário pode atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- --- POLÍTICAS PARA ADMIN_USERS ---

-- Apenas admins podem ver a lista de admins
CREATE POLICY "Admins can view admin list" ON public.admin_users
    FOR SELECT USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- --- POLÍTICAS GENÉRICAS PARA TABELAS DE DADOS ---
-- (Aplicadas a: activities, crops, machines, livestock, inventory, team, messages, finance)

-- Função auxiliar para criar políticas padrão
CREATE OR REPLACE FUNCTION create_isolation_policies(table_name text) RETURNS void AS $$
BEGIN
    -- Drop existing policies to avoid conflicts
    EXECUTE format('DROP POLICY IF EXISTS "%s_select_policy" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert_policy" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_update_policy" ON public.%s', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_delete_policy" ON public.%s', table_name, table_name);

    -- SELECT: Usuário só vê dados onde farm_id bate com o seu
    EXECUTE format('
        CREATE POLICY "%s_select_policy" ON public.%s
        FOR SELECT USING (
            farm_id = (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        );
    ', table_name, table_name);

    -- INSERT: Usuário só insere dados com seu farm_id
    EXECUTE format('
        CREATE POLICY "%s_insert_policy" ON public.%s
        FOR INSERT WITH CHECK (
            farm_id = (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        );
    ', table_name, table_name);

    -- UPDATE: Usuário só atualiza dados do seu farm_id
    EXECUTE format('
        CREATE POLICY "%s_update_policy" ON public.%s
        FOR UPDATE USING (
            farm_id = (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        );
    ', table_name, table_name);

    -- DELETE: Usuário só deleta dados do seu farm_id
    EXECUTE format('
        CREATE POLICY "%s_delete_policy" ON public.%s
        FOR DELETE USING (
            farm_id = (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        );
    ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Aplicar políticas para todas as tabelas
SELECT create_isolation_policies('activities');
SELECT create_isolation_policies('crops');
SELECT create_isolation_policies('machines');
SELECT create_isolation_policies('livestock');
SELECT create_isolation_policies('inventory_items');
SELECT create_isolation_policies('team_members');
SELECT create_isolation_policies('messages');
SELECT create_isolation_policies('financial_transactions');

-- ============================================================================
-- 7. AUTOMATIZAÇÃO DE NOVOS USUÁRIOS (TRIGGER)
-- ============================================================================

-- Função para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        farm_id,
        role,
        subscription_status
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        'farm-' || new.id, -- Gera um farm_id único baseado no ID do usuário
        'owner',
        'trial'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
        
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que dispara após inserção na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. CORREÇÃO DE DADOS EXISTENTES (MIGRAÇÃO)
-- ============================================================================

-- Sincronizar usuários existentes que não têm perfil
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

-- Corrigir farm_ids vazios
UPDATE public.user_profiles
SET farm_id = 'farm-' || user_id
WHERE farm_id IS NULL OR farm_id = '' OR farm_id LIKE 'default-farm%';

-- ============================================================================
-- 9. CONFIGURAÇÃO REALTIME
-- ============================================================================

-- Habilitar Realtime para tabelas principais
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
