-- Tabela: Ordens de Compra (Purchase Orders)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    supplier TEXT,
    category TEXT CHECK (category IN ('Sementes', 'Fertilizantes', 'Defensivos', 'Peças', 'Combustível', 'Outros')),
    status TEXT CHECK (status IN ('Pendente', 'Aprovado', 'Rejeitado', 'Pago')),
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: Transações Financeiras (Financial Transactions)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('Receita', 'Despesa')),
    category TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    farm_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem para evitar duplicidade
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON purchase_orders;
DROP POLICY IF EXISTS "Isolamento por Fazenda" ON financial_transactions;

-- Criar Políticas de Segurança
CREATE POLICY "Isolamento por Fazenda" ON purchase_orders
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));

CREATE POLICY "Isolamento por Fazenda" ON financial_transactions
    FOR ALL
    USING (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'))
    WITH CHECK (farm_id = (auth.jwt() -> 'user_metadata' ->> 'farm_id'));
