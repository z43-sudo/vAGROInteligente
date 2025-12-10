-- ============================================================================
-- TABELAS PARA MAPEAMENTO DE ÁREA COM DRONES
-- ============================================================================

-- Tabela de Áreas Mapeadas
CREATE TABLE IF NOT EXISTS mapped_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id TEXT NOT NULL,
    name TEXT NOT NULL,
    coordinates JSONB NOT NULL, -- Array de [lat, lng]
    area_hectares NUMERIC(10, 4) NOT NULL,
    perimeter_meters NUMERIC(12, 2) NOT NULL,
    center_lat NUMERIC(10, 6),
    center_lng NUMERIC(10, 6),
    source TEXT CHECK (source IN ('manual', 'drone', 'upload')),
    drone_model TEXT,
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mapped_areas_farm ON mapped_areas(farm_id);
CREATE INDEX IF NOT EXISTS idx_mapped_areas_crop ON mapped_areas(crop_id);
CREATE INDEX IF NOT EXISTS idx_mapped_areas_created ON mapped_areas(created_at DESC);

-- RLS
ALTER TABLE mapped_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mapped areas"
    ON mapped_areas FOR SELECT
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own mapped areas"
    ON mapped_areas FOR INSERT
    WITH CHECK (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own mapped areas"
    ON mapped_areas FOR UPDATE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own mapped areas"
    ON mapped_areas FOR DELETE
    USING (farm_id = (SELECT user_metadata->>'farm_id' FROM auth.users WHERE id = auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_mapped_areas_updated_at
    BEFORE UPDATE ON mapped_areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE mapped_areas IS 'Áreas mapeadas via drone, desenho manual ou upload de arquivos';
COMMENT ON COLUMN mapped_areas.coordinates IS 'Array de coordenadas [latitude, longitude]';
COMMENT ON COLUMN mapped_areas.source IS 'Origem do mapeamento: manual, drone ou upload';
