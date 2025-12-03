-- ==============================================================================
-- CONFIGURAÇÃO DO PAINEL DE ADMINISTRAÇÃO - AGRO INTELIGENTE
-- Este script cria a estrutura necessária para o painel admin
-- ==============================================================================

-- 1. Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('root', 'admin', 'support')) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar tabela de perfis de usuários (para armazenar informações adicionais)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    farm_id TEXT,
    role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member',
    subscription_plan TEXT CHECK (subscription_plan IN ('free', 'basic', 'professional', 'enterprise')) DEFAULT 'free',
    subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'trial')) DEFAULT 'trial',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_farm_id ON user_profiles(farm_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança para admin_users
-- Apenas administradores podem ver a lista de admins
DROP POLICY IF EXISTS "Apenas admins podem ver admins" ON admin_users;
CREATE POLICY "Apenas admins podem ver admins" ON admin_users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- 6. Criar políticas de segurança para user_profiles
-- Admins podem ver todos os perfis
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON user_profiles;
CREATE POLICY "Admins podem ver todos os perfis" ON user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Admins podem atualizar todos os perfis
DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON user_profiles;
CREATE POLICY "Admins podem atualizar perfis" ON user_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON user_profiles;
CREATE POLICY "Usuários podem ver próprio perfil" ON user_profiles
    FOR SELECT
    USING (user_id = auth.uid());

-- Sistema pode inserir perfis (para novos cadastros)
DROP POLICY IF EXISTS "Sistema pode inserir perfis" ON user_profiles;
CREATE POLICY "Sistema pode inserir perfis" ON user_profiles
    FOR INSERT
    WITH CHECK (true);

-- 7. Inserir o usuário root (você)
INSERT INTO admin_users (email, role)
VALUES ('wallisom_53@outlook.com', 'root')
ON CONFLICT (email) DO UPDATE SET role = 'root';

-- 8. Criar função para sincronizar perfis de usuários automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, farm_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'farm_id',
        NEW.raw_user_meta_data->>'role'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        farm_id = EXCLUDED.farm_id,
        role = EXCLUDED.role,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Adicionar trigger de atualização automática
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Criar view para facilitar consultas de usuários com informações completas
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    up.id,
    up.user_id,
    up.email,
    up.full_name,
    up.farm_id,
    up.role,
    up.subscription_plan,
    up.subscription_status,
    up.subscription_start_date,
    up.subscription_end_date,
    up.created_at,
    up.updated_at,
    au.last_sign_in_at,
    au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id;

-- FIM DO SCRIPT
-- Execute este script no SQL Editor do Supabase
