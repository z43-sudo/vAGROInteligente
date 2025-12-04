# 📊 Guia de Integração com APIs Reais de Cotações Agrícolas

## ✅ Implementações Concluídas

### 🌾 **6 Commodities Implementadas:**
1. **Soja** 🌱 - Cor: Verde
2. **Milho** 🌽 - Cor: Amarelo
3. **Café** ☕ - Cor: Âmbar
4. **Algodão** 🌿 - Cor: Azul
5. **Feijão** 🫘 - Cor: Vermelho (NOVO!)
6. **Trigo** 🌾 - Cor: Laranja (NOVO!)

### 📈 **Recursos Implementados:**
- ✅ Serviço de cotações (`commodityService.ts`)
- ✅ Grid 3x2 para exibir 6 commodities
- ✅ Gráfico com 6 linhas (todas as commodities)
- ✅ Insights dinâmicos do mercado
- ✅ Atualização automática a cada 5 minutos
- ✅ Botão de atualização manual
- ✅ Cálculo de volatilidade

---

## 🔌 Como Conectar com APIs Reais

### 1. **CEPEA/ESALQ** (Recomendado para Brasil)

#### 📍 Fonte: Centro de Estudos Avançados em Economia Aplicada - USP

**Endpoint (não oficial):**
```typescript
// Exemplo de integração com CEPEA
async function fetchCEPEAPrices() {
  try {
    // CEPEA não tem API pública oficial
    // Alternativa: Web Scraping (com cuidado e respeito aos termos de uso)
    const response = await fetch('https://www.cepea.esalq.usp.br/br/indicador/soja.aspx');
    const html = await response.text();
    
    // Parse HTML para extrair preços
    // Usar biblioteca como 'cheerio' ou 'jsdom'
    
    return parsedPrices;
  } catch (error) {
    console.error('Erro ao buscar CEPEA:', error);
  }
}
```

**⚠️ Importante:** CEPEA não oferece API pública. Considere:
- Contatar CEPEA para acesso institucional
- Usar web scraping responsável
- Cachear dados para reduzir requisições

---

### 2. **B3 (Bolsa de Valores do Brasil)**

#### 📍 API Oficial da B3

**Endpoint:**
```typescript
async function fetchB3Prices() {
  const API_KEY = 'SUA_CHAVE_API_B3';
  
  try {
    const response = await fetch('https://api.b3.com.br/market-data/v1/futures', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Mapear dados da B3 para o formato do app
    return data.map(item => ({
      name: item.commodity,
      price: item.lastPrice,
      change: item.change,
      changePercent: item.changePercent,
      // ... outros campos
    }));
  } catch (error) {
    console.error('Erro ao buscar B3:', error);
  }
}
```

**📝 Como obter acesso:**
1. Acesse: https://www.b3.com.br/data/
2. Crie uma conta
3. Solicite chave de API
4. Leia a documentação oficial

---

### 3. **API do Governo (CONAB)**

#### 📍 Companhia Nacional de Abastecimento

**Endpoint:**
```typescript
async function fetchCONABPrices() {
  try {
    const response = await fetch('https://portaldeinformacoes.conab.gov.br/api/precos');
    const data = await response.json();
    
    return data.map(item => ({
      name: item.produto,
      price: item.preco_medio,
      // ... processar dados
    }));
  } catch (error) {
    console.error('Erro ao buscar CONAB:', error);
  }
}
```

**📝 Recursos CONAB:**
- Portal de Informações: https://portaldeinformacoes.conab.gov.br/
- Dados abertos e gratuitos
- Atualização regular

---

### 4. **Alternativas Comerciais**

#### 🌐 **Alpha Vantage**
```typescript
const API_KEY = 'SUA_CHAVE_ALPHA_VANTAGE';
const response = await fetch(
  `https://www.alphavantage.co/query?function=COMMODITY&symbol=CORN&apikey=${API_KEY}`
);
```

#### 🌐 **Quandl/Nasdaq Data Link**
```typescript
const API_KEY = 'SUA_CHAVE_QUANDL';
const response = await fetch(
  `https://data.nasdaq.com/api/v3/datasets/CHRIS/CME_C1?api_key=${API_KEY}`
);
```

---

## 🛠️ Implementação Prática

### Passo 1: Instalar Dependências

```bash
npm install axios cheerio
```

### Passo 2: Criar Arquivo `.env`

```env
VITE_B3_API_KEY=sua_chave_b3
VITE_ALPHA_VANTAGE_KEY=sua_chave_alpha
VITE_QUANDL_KEY=sua_chave_quandl
```

### Passo 3: Atualizar `commodityService.ts`

```typescript
// Exemplo real com B3
async function fetchB3Prices() {
  const API_KEY = import.meta.env.VITE_B3_API_KEY;
  
  try {
    const response = await fetch('https://api.b3.com.br/...', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    
    const data = await response.json();
    return processB3Data(data);
  } catch (error) {
    console.error('Erro B3:', error);
    return getDefaultPrices(); // Fallback
  }
}
```

---

## 📊 Mapeamento de Dados

### Exemplo de Transformação:

```typescript
function processB3Data(rawData: any[]): CommodityPrice[] {
  return rawData.map(item => ({
    name: mapCommodityName(item.symbol),
    price: parseFloat(item.lastPrice),
    change: parseFloat(item.change),
    changePercent: parseFloat(item.changePercent),
    unit: 'R$/saca',
    color: getCommodityColor(item.symbol),
    icon: getCommodityIcon(item.symbol),
    source: 'B3',
    lastUpdate: new Date(item.timestamp)
  }));
}

function mapCommodityName(symbol: string): string {
  const map: Record<string, string> = {
    'SOY': 'Soja',
    'CORN': 'Milho',
    'COFFEE': 'Café',
    'COTTON': 'Algodão',
    'BEAN': 'Feijão',
    'WHEAT': 'Trigo'
  };
  return map[symbol] || symbol;
}
```

---

## 🔄 Sistema de Cache

### Implementar Cache para Reduzir Chamadas:

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
let priceCache: { data: CommodityPrice[], timestamp: number } | null = null;

export async function fetchCommodityPrices(): Promise<CommodityPrice[]> {
  // Verificar cache
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }
  
  // Buscar dados novos
  const prices = await fetchFromAPIs();
  
  // Atualizar cache
  priceCache = {
    data: prices,
    timestamp: Date.now()
  };
  
  return prices;
}
```

---

## 🚨 Tratamento de Erros

```typescript
async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 📈 Próximos Passos Recomendados

1. **Obter Chaves de API**
   - Cadastrar na B3
   - Criar conta no Alpha Vantage
   - Explorar dados abertos do CONAB

2. **Implementar Backend**
   - Criar API intermediária (Node.js/Express)
   - Cachear dados no servidor
   - Proteger chaves de API

3. **Melhorias**
   - Adicionar mais commodities
   - Implementar alertas de preço
   - Criar relatórios personalizados

---

## 📞 Contatos Úteis

- **CEPEA/ESALQ**: https://www.cepea.esalq.usp.br/
- **B3**: https://www.b3.com.br/
- **CONAB**: https://www.conab.gov.br/
- **Alpha Vantage**: https://www.alphavantage.co/

---

## ✅ Status Atual

- ✅ Interface completa com 6 commodities
- ✅ Serviço de cotações estruturado
- ✅ Dados simulados funcionando
- ⏳ Aguardando integração com APIs reais
- ⏳ Implementação de backend para segurança

**O sistema está 100% funcional com dados simulados e pronto para integração com APIs reais!** 🚀
