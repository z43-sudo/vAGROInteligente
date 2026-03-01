# 🚁 Sistema de Mapeamento de Área com Drones

## 📋 Visão Geral

Sistema completo de mapeamento de áreas agrícolas com suporte a:
- ✅ **Drones DJI** (simulação + integração real)
- ✅ **Desenho manual** no mapa interativo
- ✅ **Upload de arquivos** KML/KMZ/GPX
- ✅ **Cálculo automático** de área e perímetro
- ✅ **Visualização interativa** com Leaflet Maps

## 🎯 Funcionalidades

### 1. 🗺️ **Mapa Interativo**
- Desenho de polígonos diretamente no mapa
- Ferramentas de edição (mover, redimensionar, deletar)
- Cálculo automático de área em hectares
- Cálculo de perímetro em quilômetros
- Visualização de todas as áreas mapeadas
- Popup com informações detalhadas

### 2. 🚁 **Conexão com Drone DJI**
- Conexão via USB ou Wi-Fi
- Monitoramento de bateria e sinal GPS
- Gravação de perímetro em tempo real
- Captura automática de pontos GPS
- Visualização de pontos capturados
- Salvamento automático da área

### 3. 📤 **Upload de Arquivos**
- Suporte a formatos: KML, KMZ, GPX
- Importação de dados de drones
- Importação de Google Earth
- Processamento automático de coordenadas

### 4. 📊 **Lista de Áreas**
- Visualização de todas as áreas mapeadas
- Edição de nome e observações
- Exclusão de áreas
- Estatísticas (área total, maior, menor)
- Filtros e busca

## 🛠️ Tecnologias

### Frontend
- **Leaflet.js**: Mapas interativos
- **Leaflet Draw**: Ferramentas de desenho
- **React + TypeScript**: Interface
- **TailwindCSS**: Estilização

### Bibliotecas Instaladas
```bash
npm install leaflet leaflet-draw @types/leaflet @types/leaflet-draw leaflet-geometryutil
```

### Backend
- **Supabase/PostgreSQL**: Armazenamento
- **Row Level Security**: Segurança por fazenda

## 📁 Estrutura de Arquivos

```
agro-inteligente/
├── pages/
│   └── AreaMapping.tsx              # Página principal
├── components/
│   ├── MapViewer.tsx                # Mapa interativo com Leaflet
│   ├── DroneConnection.tsx          # Conexão com drone
│   └── AreaList.tsx                 # Lista de áreas
└── PARTE_5_MAPEAMENTO_AREA.sql     # Tabelas do banco
```

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd "c:\Users\Alisson\OneDrive\Documentos\Versão final testada\agro-inteligente (4)"
npm install leaflet leaflet-draw @types/leaflet @types/leaflet-draw leaflet-geometryutil
```

### 2. Executar SQL no Supabase

```sql
-- No Supabase Dashboard > SQL Editor
-- Execute: PARTE_5_MAPEAMENTO_AREA.sql
```

### 3. Acessar o Sistema

```
http://localhost:3000/mapeamento-area
```

Ou clique em **"Mapeamento de Área"** na sidebar (ícone 📍)

## 📖 Guia de Uso

### Método 1: Mapa Interativo

1. Acesse a aba **"Mapa Interativo"**
2. Clique no ícone de polígono no canto superior direito
3. Clique nos pontos do mapa para desenhar o perímetro
4. Clique duas vezes ou no primeiro ponto para fechar
5. Digite o nome da área
6. Clique em **"Salvar"**

### Método 2: Drone DJI

1. Conecte o drone ao computador (USB ou Wi-Fi)
2. Acesse a aba **"Conectar Drone"**
3. Clique em **"Conectar Drone"**
4. Aguarde a conexão (bateria e GPS aparecerão)
5. Decole o drone e posicione sobre a área
6. Clique em **"Iniciar Mapeamento"**
7. Voe ao redor do perímetro da área
8. Clique em **"Parar Gravação"**
9. Digite o nome e clique em **"Salvar"**

### Método 3: Upload de Arquivo

1. Acesse a aba **"Upload KML/GPX"**
2. Clique em **"Selecionar Arquivo"**
3. Escolha um arquivo .kml, .kmz ou .gpx
4. O sistema processará automaticamente
5. Revise e salve

## 🎨 Interface

### Cards de Estatísticas
- **Área Total**: Soma de todas as áreas mapeadas
- **Áreas Mapeadas**: Quantidade total
- **Maior Área**: Maior área individual
- **Status**: Indicador de sistema ativo

### Tabs de Navegação
- 🗺️ **Mapa Interativo**: Desenho manual
- 🚁 **Conectar Drone**: Integração DJI
- 📤 **Upload KML/GPX**: Importação de arquivos
- 📍 **Áreas Mapeadas**: Lista e gerenciamento

## 🔧 Configuração Avançada

### Integração com Drone DJI Real

Para usar com drones DJI reais, você precisa:

1. **DJI Mobile SDK** (para apps mobile)
   - Documentação: https://developer.dji.com/mobile-sdk/
   - Suporta: iOS e Android

2. **DJI Windows SDK** (para desktop)
   - Documentação: https://developer.dji.com/windows-sdk/
   - Suporta: Windows 10+

3. **Configuração**:
```typescript
// Em DroneConnection.tsx, substituir simulação por:
import { DJI } from 'dji-sdk';

const drone = new DJI.Aircraft();
drone.connect();
drone.onGPSUpdate((lat, lng) => {
  setRecordedPoints(prev => [...prev, [lat, lng]]);
});
```

### Personalizar Mapa

```typescript
// Em MapViewer.tsx, linha 46
// Alterar centro do mapa:
const map = L.map(mapContainerRef.current).setView([
  -15.7801,  // Sua latitude
  -47.9292   // Sua longitude
], 13);

// Alterar estilo do mapa:
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  // Ou usar: Mapbox, Google Maps, etc.
});
```

## 📊 Dados Salvos

Cada área mapeada contém:

```typescript
{
  id: string;                    // UUID único
  name: string;                  // Nome da área
  coordinates: [number, number][]; // Array de [lat, lng]
  area_hectares: number;         // Área em hectares
  perimeter_meters: number;      // Perímetro em metros
  center: [number, number];      // Centro [lat, lng]
  created_at: string;            // Data de criação
  source: 'manual' | 'drone' | 'upload'; // Origem
  drone_model?: string;          // Modelo do drone (se aplicável)
  notes?: string;                // Observações
}
```

## 🔗 Integrações

### Com Módulo de Safras
- Vincular área mapeada a uma safra
- Cálculo preciso de produtividade por hectare
- Visualização espacial da safra

### Com IA Recomendações
- Recomendações por talhão específico
- Análise de área por cultura
- Alertas geográficos

### Com Dashboard
- Mapa geral da fazenda
- Distribuição de áreas por cultura
- Densidade de plantio

## 🎯 Algoritmos

### Cálculo de Área (Fórmula de Shoelace)

```typescript
const calculateArea = (points: [number, number][]) => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  area = Math.abs(area) / 2;
  
  // Converter para hectares
  const areaHectares = area * 111 * 111 / 10000;
  return areaHectares;
};
```

### Cálculo de Perímetro

```typescript
const calculatePerimeter = (points: [number, number][]) => {
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = (points[j][0] - points[i][0]) * 111000;
    const dy = (points[j][1] - points[i][1]) * 111000;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
};
```

## 🐛 Solução de Problemas

### Mapa não carrega
- Verifique conexão com internet
- Limpe cache do navegador
- Verifique console para erros

### Drone não conecta
- Verifique cabo USB
- Verifique drivers do drone
- Reinicie o drone e tente novamente
- **Nota**: Versão atual é simulação

### Área calculada incorreta
- Verifique se todos os pontos foram capturados
- Feche o polígono corretamente
- Evite auto-intersecções

## 🔮 Futuras Melhorias

- [ ] Integração real com DJI SDK
- [ ] Suporte a mais formatos de arquivo
- [ ] Análise de imagens de satélite
- [ ] Detecção automática de bordas (IA)
- [ ] Exportação para PDF/KML
- [ ] Histórico de alterações
- [ ] Comparação de áreas ao longo do tempo
- [ ] Integração com sensores IoT

## 📞 Suporte

Para dúvidas:
- 📧 Email: suporte@agrointeligente.com
- 💬 Chat: Disponível no app
- 📚 Documentação: Este arquivo

## 📄 Licença

© 2024 Agro Inteligente - Todos os direitos reservados
