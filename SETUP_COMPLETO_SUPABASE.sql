-- ============================================================================
-- SETUP COMPLETO DO SUPABASE - AGRO INTELIGENTE
-- Execute este script COMPLETO no SQL Editor do Supabase
-- Ele cria TODAS as tabelas, políticas RLS e configurações necessárias
-- ============================================================================

-- PASSO 1: LIMPAR TUDO (CUIDADO: Apaga todos os dados!)
-- ============================================================================
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.livestock CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.machines CASCADE;
DROP TABLE IF EXISTS public.crops CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- PASSO 2: CRIAR TABELAS DO SISTEMA
-- ============================================================================

-- Tabela: Administradores (para painel admin)
CREATE TABLE public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Perfis de Usuários (dados completos + assinaturas)
CREATE TABLE public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    farm_id TEXT,
    role TEXT DEFAULT 'member',
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'trial',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Culturas/Safras
CREATE TABLE public.crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    stage TEXT,
    progress INTEGER DEFAULT 0,
    days_to_harvest INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMPTZ,
    cycle_duration INTEGER,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Máquinas
CREATE TABLE public.machines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'Operando',
    hours INTEGER DEFAULT 0,
    location TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Atividades
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Agendado',
    time TEXT,
    type TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Pecuária
CREATE TABLE public.livestock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag TEXT NOT NULL,
    type TEXT,
    breed TEXT,
    weight NUMERIC,
    age INTEGER,
    status TEXT DEFAULT 'Saudável',
    location TEXT,
    last_vaccination TIMESTAMPTZ,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Estoque/Inventário
CREATE TABLE public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    quantity NUMERIC DEFAULT 0,
    unit TEXT,
    min_quantity NUMERIC DEFAULT 0,
    location TEXT,
    last_restock TIMESTAMPTZ,
    status TEXT DEFAULT 'Normal',
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Equipe/Membros
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Ativo',
    avatar TEXT,
    department TEXT,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela: Mensagens do Chat
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PASSO 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX idx_machines_farm_id ON public.machines(farm_id);
CREATE INDEX idx_activities_farm_id ON public.activities(farm_id);
CREATE INDEX idx_livestock_farm_id ON public.livestock(farm_id);
CREATE INDEX idx_inventory_farm_id ON public.inventory_items(farm_id);
CREATE INDEX idx_team_farm_id ON public.team_members(farm_id);
CREATE INDEX idx_messages_farm_id ON public.messages(farm_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_farm_id ON public.user_profiles(farm_id);

-- PASSO 4: HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- PASSO 5: CRIAR POLÍTICAS RLS - ISOLAMENTO POR FAZENDA
-- ============================================================================

-- ADMIN_USERS: Apenas admins podem ver
CREATE POLICY "admin_select" ON public.admin_users
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    );

-- USER_PROFILES: Admins veem tudo, usuários veem só o próprio
CREATE POLICY "admin_select_all_profiles" ON public.user_profiles
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
        OR user_id = auth.uid()
    );

CREATE POLICY "admin_update_profiles" ON public.user_profiles
    FOR UPDATE USING (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
    );

CREATE POLICY "anyone_insert_profile" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

-- CROPS: Isolamento por farm_id
CREATE POLICY "farm_isolation_crops" ON public.crops
    FOR ALL USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- MACHINES: Isolamento por farm_id
CREATE POLICY "farm_isolation_machines" ON public.machines
    FOR ALL USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- ACTIVITIES: Isolamento por farm_id
CREATE POLICY "farm_isolation_activities" ON public.activities
    FOR ALL USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- LIVESTOCK: Isolamento por farm_id
CREATE POLICY "farm_isolation_livestock" ON public.livestock
    FOR ALL USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- INVENTORY: Isolamento por farm_id
CREATE POLICY "farm_isolation_inventory" ON public.inventory_items
    FOR ALL USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- TEAM_MEMBERS: Isolamento por farm_id
CREATE POLICY "farm_isolation_team" ON public.team_members
    FOR ALL USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- MESSAGES: Isolamento por farm_id
CREATE POLICY "farm_isolation_messages" ON public.messages
    FOR ALL USING (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        farm_id = COALESCE(
            auth.jwt() -> 'user_metadata' ->> 'farm_id',
            (SELECT farm_id FROM public.user_profiles WHERE user_id = auth.uid())
        )
    );

-- PASSO 6: CRIAR FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função: Sincronizar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        farm_id,
        role,
        subscription_plan,
        subscription_status
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'farm_id', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
        'free',
        'trial'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        farm_id = EXCLUDED.farm_id,
        role = EXCLUDED.role,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Sincronizar ao criar/atualizar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Atualizar updated_at em user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON public.user_profiles;
CREATE TRIGGER update_user_profiles_timestamp
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger: Atualizar updated_at em admin_users
DROP TRIGGER IF EXISTS update_admin_users_timestamp ON public.admin_users;
CREATE TRIGGER update_admin_users_timestamp
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- PASSO 7: HABILITAR REALTIME PARA CHAT
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- PASSO 8: INSERIR DADOS INICIAIS
-- ============================================================================

-- Inserir você como admin ROOT
INSERT INTO public.admin_users (email, role)
VALUES ('wallisom_53@outlook.com', 'root')
ON CONFLICT (email) DO UPDATE SET role = 'root', updated_at = NOW();

-- Sincronizar usuários existentes do auth.users para user_profiles
INSERT INTO public.user_profiles (user_id, email, full_name, farm_id, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    COALESCE(raw_user_meta_data->>'farm_id', ''),
    COALESCE(raw_user_meta_data->>'role', 'member')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- PASSO 9: VERIFICAÇÃO FINAL
-- ============================================================================
DO $$
DECLARE
    table_count INTEGER;
    admin_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Contar tabelas criadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'admin_users', 'user_profiles', 'crops', 'machines',
        'activities', 'livestock', 'inventory_items', 'team_members', 'messages'
    );

    -- Contar admins
    SELECT COUNT(*) INTO admin_count FROM public.admin_users;

    -- Contar perfis
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;

    -- Exibir resultados
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SETUP COMPLETO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabelas criadas: %', table_count;
    RAISE NOTICE 'Administradores: %', admin_count;
    RAISE NOTICE 'Perfis de usuários: %', profile_count;
    RAISE NOTICE '========================================';
    
    IF table_count = 9 THEN
        RAISE NOTICE '✅ Todas as 9 tabelas foram criadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Esperado 9 tabelas, mas foram criadas %', table_count;
    END IF;

    IF admin_count > 0 THEN
        RAISE NOTICE '✅ Admin ROOT configurado: wallisom_53@outlook.com';
    ELSE
        RAISE WARNING '⚠️ Nenhum admin foi criado!';
    END IF;
END $$;

-- FIM DO SCRIPT
-- ============================================================================
-- PRÓXIMOS PASSOS:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Faça login no app com: wallisom_53@outlook.com
-- 3. Você verá o menu "Admin" na sidebar
-- 4. Acesse /admin para gerenciar todos os usuários
-- ============================================================================
