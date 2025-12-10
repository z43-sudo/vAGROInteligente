-- ============================================================================
-- TABELAS PARA SISTEMA DE IA - RECOMENDAÇÕES INTELIGENTES
-- ============================================================================
-- Este script cria as tabelas necessárias para armazenar dados de IA
-- como recomendações de plantio, alertas de risco e estimativas de produção
-- ============================================================================

-- Tabela de Recomendações de Plantio
CREATE TABLE IF NOT EXISTS ai_planting_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    recommended_period TEXT NOT NULL,
    confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
    reason TEXT,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Alertas de Risco
CREATE TABLE IF NOT EXISTS ai_risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    alert_type TEXT CHECK (alert_type IN ('frost', 'drought', 'heavy_rain', 'heatwave', 'wind', 'pest', 'disease')),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    alert_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Estimativas de Produção
CREATE TABLE IF NOT EXISTS ai_production_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    estimated_yield NUMERIC(10, 2) NOT NULL, -- kg/ha
    total_production NUMERIC(12, 2) NOT NULL, -- kg
    confidence_percentage INTEGER CHECK (confidence_percentage >= 0 AND confidence_percentage <= 100),
    factors JSONB, -- Fatores considerados na estimativa
    market_price NUMERIC(10, 2), -- R$/kg
    estimated_revenue NUMERIC(12, 2), -- R$
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Insights Analíticos
CREATE TABLE IF NOT EXISTS ai_farm_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    insight_type TEXT CHECK (insight_type IN ('success', 'warning', 'info')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- Ex: 'productivity', 'inventory', 'diversification'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Dados Climáticos Históricos (para melhorar previsões)
CREATE TABLE IF NOT EXISTS weather_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    date DATE NOT NULL,
    temperature NUMERIC(5, 2),
    humidity INTEGER,
    precipitation NUMERIC(6, 2),
    wind_speed NUMERIC(5, 2),
    condition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_planting_recommendations_farm ON ai_planting_recommendations(farm_id);
CREATE INDEX IF NOT EXISTS idx_planting_recommendations_created ON ai_planting_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_risk_alerts_farm ON ai_risk_alerts(farm_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_active ON ai_risk_alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON ai_risk_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_production_estimates_farm ON ai_production_estimates(farm_id);
CREATE INDEX IF NOT EXISTS idx_production_estimates_crop ON ai_production_estimates(crop_id);

CREATE INDEX IF NOT EXISTS idx_farm_insights_farm ON ai_farm_insights(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_insights_type ON ai_farm_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_weather_history_farm_date ON weather_history(farm_id, date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE ai_planting_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_production_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_farm_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_history ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_planting_recommendations
CREATE POLICY "Users can view their own planting recommendations"
    ON ai_planting_recommendations FOR SELECT
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own planting recommendations"
    ON ai_planting_recommendations FOR INSERT
    WITH CHECK (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own planting recommendations"
    ON ai_planting_recommendations FOR UPDATE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own planting recommendations"
    ON ai_planting_recommendations FOR DELETE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

-- Políticas para ai_risk_alerts
CREATE POLICY "Users can view their own risk alerts"
    ON ai_risk_alerts FOR SELECT
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own risk alerts"
    ON ai_risk_alerts FOR INSERT
    WITH CHECK (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own risk alerts"
    ON ai_risk_alerts FOR UPDATE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own risk alerts"
    ON ai_risk_alerts FOR DELETE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

-- Políticas para ai_production_estimates
CREATE POLICY "Users can view their own production estimates"
    ON ai_production_estimates FOR SELECT
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own production estimates"
    ON ai_production_estimates FOR INSERT
    WITH CHECK (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own production estimates"
    ON ai_production_estimates FOR UPDATE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own production estimates"
    ON ai_production_estimates FOR DELETE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

-- Políticas para ai_farm_insights
CREATE POLICY "Users can view their own farm insights"
    ON ai_farm_insights FOR SELECT
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own farm insights"
    ON ai_farm_insights FOR INSERT
    WITH CHECK (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own farm insights"
    ON ai_farm_insights FOR UPDATE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own farm insights"
    ON ai_farm_insights FOR DELETE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

-- Políticas para weather_history
CREATE POLICY "Users can view their own weather history"
    ON weather_history FOR SELECT
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own weather history"
    ON weather_history FOR INSERT
    WITH CHECK (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own weather history"
    ON weather_history FOR UPDATE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own weather history"
    ON weather_history FOR DELETE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_planting_recommendations_updated_at
    BEFORE UPDATE ON ai_planting_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_estimates_updated_at
    BEFORE UPDATE ON ai_production_estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE ai_planting_recommendations IS 'Armazena recomendações de IA para janelas de plantio';
COMMENT ON TABLE ai_risk_alerts IS 'Armazena alertas de risco gerados pela IA';
COMMENT ON TABLE ai_production_estimates IS 'Armazena estimativas de produção calculadas pela IA';
COMMENT ON TABLE ai_farm_insights IS 'Armazena insights analíticos sobre a fazenda';
COMMENT ON TABLE weather_history IS 'Histórico de dados climáticos para análise preditiva';
