# 🗺️ Logística de Frigoríficos - Documentação

## 📋 Visão Geral

A nova funcionalidade de **Logística de Frigoríficos** foi integrada à página de **Pecuária** e oferece uma solução completa para gerenciar o transporte de gado para frigoríficos locais.

## ✨ Funcionalidades

### 1. **Mapa Interativo**
- Visualização em mapa usando **Leaflet.js** (OpenStreetMap)
- Marcador verde para a localização da fazenda
- Marcadores vermelhos para frigoríficos cadastrados
- Rotas traçadas dinamicamente entre fazenda e frigorífico selecionado

### 2. **Gestão de Frigoríficos**
- Listagem de frigoríficos ordenados por distância
- Informações detalhadas:
  - Nome do frigorífico
  - Distância em km
  - Tempo estimado de viagem
  - Preço por kg
  - Capacidade diária
  - Avaliação (quando disponível)

### 3. **Estatísticas em Tempo Real**
- Total de frigoríficos cadastrados
- Frigorífico mais próximo
- Melhor preço disponível
- Tempo médio de transporte

### 4. **Adicionar Novos Frigoríficos**
- Formulário intuitivo para cadastro
- Campos:
  - Nome do frigorífico
  - Coordenadas (latitude/longitude)
  - Preço por kg
  - Capacidade
- Cálculo automático de distância usando fórmula de Haversine
- Estimativa automática de tempo de viagem

### 5. **Seleção e Planejamento**
- Clique em um frigorífico para visualizar a rota
- Painel detalhado com informações da rota selecionada
- Botão "Planejar Transporte" para ações futuras

## 🎨 Design

- Interface moderna e responsiva
- Cards com gradientes e sombras suaves
- Animações de fade-in
- Cores temáticas do agronegócio (verde, vermelho, azul)
- Ícones do Lucide React
- Layout adaptável para mobile e desktop

## 🛠️ Tecnologias Utilizadas

- **React** + **TypeScript**
- **Leaflet.js** - Biblioteca de mapas interativos
- **React-Leaflet** - Componentes React para Leaflet
- **OpenStreetMap** - Tiles de mapa gratuitos
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📍 Como Usar

### Acessar a Funcionalidade
1. Navegue até a página de **Pecuária**
2. Clique na aba **"Logística"**

### Visualizar Frigoríficos
1. O mapa mostrará automaticamente sua fazenda (marcador verde)
2. Frigoríficos cadastrados aparecerão como marcadores vermelhos
3. A lista lateral mostra todos os frigoríficos ordenados por distância

### Selecionar um Frigorífico
1. Clique em um frigorífico na lista ou no mapa
2. Uma linha tracejada mostrará a rota
3. O painel inferior exibirá detalhes completos da rota

### Adicionar Novo Frigorífico
1. Clique no botão **"Adicionar Frigorífico"**
2. Preencha o formulário:
   - Nome do frigorífico
   - Latitude e Longitude (use Google Maps para encontrar)
   - Preço por kg
   - Capacidade diária
3. Clique em **"Adicionar"**

## 🔧 Configuração

### Alterar Localização da Fazenda
No arquivo `SlaughterhouseLogistics.tsx`, linha 40:
```typescript
const [farmLocation] = useState<[number, number]>([-16.6869, -49.2648]); // Goiânia
```
Substitua pelas coordenadas da sua fazenda.

### Personalizar Frigoríficos Iniciais
No arquivo `SlaughterhouseLogistics.tsx`, linhas 47-71, edite o array `slaughterhouses`.

## 📊 Dados de Exemplo

O sistema vem com 3 frigoríficos de exemplo na região de Goiânia:
- Frigorífico Boi Gordo
- Frigorífico Central
- Frigorífico Vale Verde

## 🚀 Próximas Melhorias Sugeridas

1. **Integração com API de Rotas Reais** (Google Maps Directions API)
2. **Cálculo de Custo de Transporte**
3. **Histórico de Transportes**
4. **Agendamento de Entregas**
5. **Notificações de Melhores Preços**
6. **Exportação de Relatórios**
7. **Integração com Sistema de Rastreamento GPS**

## 📝 Notas Técnicas

- A distância é calculada usando a fórmula de Haversine (distância em linha reta)
- O tempo estimado assume velocidade média de 30 km/h
- Para rotas reais, considere integrar com Google Maps Directions API
- Os dados são armazenados localmente no estado do componente
- Para persistência, integre com Supabase ou outro backend

## 🎯 Benefícios

- ✅ Visualização clara de opções de frigoríficos
- ✅ Comparação rápida de preços e distâncias
- ✅ Planejamento logístico otimizado
- ✅ Redução de custos de transporte
- ✅ Melhor tomada de decisão

---

**Desenvolvido para Agro Inteligente** 🌱
