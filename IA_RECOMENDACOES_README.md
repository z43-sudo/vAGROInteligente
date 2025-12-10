# 🤖 Sistema de IA para Recomendações Inteligentes

## 📋 Visão Geral

O sistema de IA implementado no Agro Inteligente oferece **4 módulos principais** de inteligência artificial para otimizar a gestão agrícola:

### 1. 🌱 **Melhor Janela de Plantio**
- **Algoritmo**: Baseado em dados climáticos e calendário agrícola brasileiro
- **Funcionalidades**:
  - Recomendação de período ideal para plantio por cultura
  - Análise de condições climáticas atuais
  - Verificação de temperatura, umidade e precipitação
  - Nível de confiança da recomendação (alto/médio/baixo)
  - Previsão do tempo para os próximos 5 dias
- **Culturas Suportadas**: Soja, Milho, Trigo, Café, Cana-de-açúcar, Algodão, Feijão, Arroz

### 2. ⚠️ **Alertas de Risco**
- **Algoritmo**: Análise em tempo real de condições climáticas
- **Tipos de Alertas**:
  - 🧊 **Geada**: Temperatura < 5°C
  - ☀️ **Seca**: Umidade < 40% + Temperatura > 30°C
  - 🌧️ **Chuva Intensa**: Precipitação > 20mm
  - 🔥 **Calor Extremo**: Temperatura > 35°C
  - 💨 **Vento Forte**: Velocidade > 40 km/h
  - 🐛 **Pragas**: Condições favoráveis (25-30°C + Umidade > 70%)
  - 🍄 **Doenças Fúngicas**: Umidade > 80% + Temperatura 20-28°C
- **Níveis de Severidade**: Crítico, Alto, Médio, Baixo
- **Recomendações**: Ações específicas para cada tipo de alerta

### 3. 📊 **Estimativa de Produção**
- **Algoritmo**: Modelo preditivo baseado em múltiplos fatores
- **Fatores Considerados**:
  - Progresso da safra (0-100%)
  - Área plantada (hectares)
  - Estágio fenológico (Vegetativo, Floração, Enchimento, Maturação)
  - Dias até colheita
  - Condições climáticas do período
  - Práticas de manejo
- **Outputs**:
  - Produtividade estimada (kg/ha)
  - Produção total (kg)
  - Nível de confiança (0-100%)
  - Receita estimada (R$)
  - Análise de fatores positivos/negativos

### 4. 📈 **Análise de Dados da Fazenda**
- **Algoritmo**: Análise estatística e geração de insights
- **Métricas Analisadas**:
  - Total de safras ativas
  - Área total cultivada
  - Progresso médio das safras
  - Quantidade de atividades
  - Valor do estoque
  - Máquinas e equipamentos
  - Pecuária
- **Insights Gerados**:
  - ✅ Safras em desenvolvimento avançado
  - 📏 Análise de área cultivada
  - 📦 Status do estoque
  - ⚡ Atividades urgentes
  - 🔧 Máquinas em manutenção
  - 🌾 Diversificação de culturas
  - 🎯 Eficiência operacional

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React + TypeScript**: Interface moderna e type-safe
- **Lucide Icons**: Ícones consistentes e profissionais
- **TailwindCSS**: Estilização responsiva

### Integração de Dados
- **OpenWeatherMap API**: Dados climáticos em tempo real
  - Clima atual
  - Previsão de 5 dias
  - Dados históricos
- **Dados Mock**: Fallback quando API não está configurada

### Backend (Supabase)
- **PostgreSQL**: Armazenamento de dados
- **Row Level Security (RLS)**: Segurança por fazenda
- **Triggers**: Atualização automática de timestamps

## 📁 Estrutura de Arquivos

```
agro-inteligente/
├── pages/
│   └── IARecomendacoes.tsx          # Página principal de IA
├── components/
│   ├── PlantingWindow.tsx           # Janela de plantio
│   ├── RiskAlerts.tsx               # Alertas de risco
│   ├── ProductionEstimate.tsx       # Estimativa de produção
│   └── FarmAnalytics.tsx            # Análise de dados
├── services/
│   └── weatherService.ts            # Serviço de clima
└── PARTE_4_IA_TABELAS.sql          # Tabelas do banco
```

## 🗄️ Banco de Dados

### Tabelas Criadas

1. **ai_planting_recommendations**
   - Armazena recomendações de plantio
   - Campos: crop_name, recommended_period, confidence_level, reason

2. **ai_risk_alerts**
   - Armazena alertas de risco
   - Campos: alert_type, severity, title, description, recommendation

3. **ai_production_estimates**
   - Armazena estimativas de produção
   - Campos: estimated_yield, total_production, confidence_percentage

4. **ai_farm_insights**
   - Armazena insights analíticos
   - Campos: insight_type, title, description, category

5. **weather_history**
   - Histórico de dados climáticos
   - Campos: date, temperature, humidity, precipitation

### Executar Script SQL

```bash
# No Supabase Dashboard
1. Acesse SQL Editor
2. Cole o conteúdo de PARTE_4_IA_TABELAS.sql
3. Execute o script
```

## 🔧 Configuração

### 1. API de Clima (Opcional)

Para usar dados climáticos reais, configure a OpenWeatherMap API:

```bash
# .env
VITE_OPENWEATHER_API_KEY=sua_chave_aqui
```

**Obter chave gratuita:**
1. Acesse https://openweathermap.org/api
2. Crie uma conta gratuita
3. Gere uma API key
4. Cole no arquivo .env

**Nota**: O sistema funciona com dados mock se a API não estiver configurada.

### 2. Executar Tabelas SQL

```bash
# Execute o script no Supabase
PARTE_4_IA_TABELAS.sql
```

## 🚀 Como Usar

### Acessar IA Inteligente

1. Faça login no sistema
2. Clique em **"IA Inteligente"** na sidebar (ícone de cérebro 🧠)
3. Navegue pelas 4 abas:
   - **Janela de Plantio**: Selecione a cultura e veja recomendações
   - **Alertas de Risco**: Monitore riscos climáticos
   - **Estimativa de Produção**: Selecione uma safra e veja previsões
   - **Análise de Dados**: Visualize insights da fazenda

### Melhorar Precisão

Para melhorar a precisão das recomendações:

1. **Cadastre safras** com dados completos:
   - Área plantada
   - Data de início
   - Duração do ciclo
   
2. **Registre atividades** regularmente

3. **Mantenha estoque atualizado**

4. **Configure API de clima** para dados reais

## 🎨 Design

### Cores por Módulo

- **Janela de Plantio**: Verde (🟢 #16a34a)
- **Alertas de Risco**: Vermelho (🔴 #dc2626)
- **Estimativa de Produção**: Azul (🔵 #2563eb)
- **Análise de Dados**: Roxo (🟣 #9333ea)

### Responsividade

- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

## 📊 Algoritmos

### Janela de Plantio

```typescript
// Exemplo de lógica
if (currentMonth >= 9 && currentMonth <= 12) {
  // Período ideal para Soja
  confidence = 'high';
  recommendation = 'Período Ideal (Set-Dez)';
}

// Verifica condições climáticas
if (temperature >= 20 && temperature <= 30) {
  conditions.push('Temperatura adequada ✓');
}
```

### Alertas de Risco

```typescript
// Exemplo de detecção de geada
if (temperature < 5) {
  severity = temperature < 0 ? 'critical' : 'high';
  alert = {
    type: 'frost',
    title: 'Alerta de Geada',
    recommendation: 'Proteja culturas sensíveis'
  };
}
```

### Estimativa de Produção

```typescript
// Cálculo de produtividade
baseYield = 3500; // kg/ha para Soja
adjustmentFactor = 1.0;

// Ajustes baseados em fatores
if (progress >= 80) adjustmentFactor *= 1.1;
if (area > 100) adjustmentFactor *= 1.05;
if (stage === 'Maturação') adjustmentFactor *= 1.15;

estimatedYield = baseYield * adjustmentFactor;
totalProduction = estimatedYield * area;
revenue = totalProduction * marketPrice;
```

## 🔮 Futuras Melhorias

### Curto Prazo
- [ ] Integração com mais APIs de clima
- [ ] Machine Learning para previsões
- [ ] Histórico de recomendações
- [ ] Exportação de relatórios PDF

### Médio Prazo
- [ ] Análise de imagens via satélite
- [ ] Previsão de pragas por região
- [ ] Recomendações de insumos
- [ ] Otimização de irrigação

### Longo Prazo
- [ ] IA generativa para consultas
- [ ] Integração com IoT (sensores)
- [ ] Marketplace de insumos
- [ ] Comunidade de agricultores

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@agrointeligente.com
- 💬 Chat: Disponível no app
- 📚 Documentação: /docs

## 📄 Licença

Este sistema é parte do Agro Inteligente © 2024
