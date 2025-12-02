import { useState, useEffect } from 'react';

export interface MarketPrice {
    date: string;
    price: number;
    region: string;
    variation: number;
}

export interface LivestockMarketData {
    currentPrice: number;
    dailyVariation: number;
    weeklyVariation: number;
    monthlyVariation: number;
    priceHistory: MarketPrice[];
    regionalPrices: { region: string; price: number; variation: number }[];
    lastUpdate: string;
}

// Função para gerar dados simulados realistas (baseados em valores reais do mercado brasileiro)
const generateRealisticData = (): LivestockMarketData => {
    const basePrice = 285; // Preço base da arroba em R$
    const now = new Date();

    // Gerar histórico de preços dos últimos 30 dias
    const priceHistory: MarketPrice[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Variação aleatória realista (-3% a +3%)
        const variation = (Math.random() - 0.5) * 6;
        const price = basePrice + (Math.random() - 0.5) * 20;

        priceHistory.push({
            date: date.toISOString().split('T')[0],
            price: parseFloat(price.toFixed(2)),
            region: 'SP',
            variation: parseFloat(variation.toFixed(2))
        });
    }

    // Preços regionais
    const regions = [
        { name: 'São Paulo', base: 285 },
        { name: 'Mato Grosso', base: 270 },
        { name: 'Goiás', base: 275 },
        { name: 'Minas Gerais', base: 280 },
        { name: 'Mato Grosso do Sul', base: 272 },
        { name: 'Paraná', base: 278 }
    ];

    const regionalPrices = regions.map(region => ({
        region: region.name,
        price: parseFloat((region.base + (Math.random() - 0.5) * 10).toFixed(2)),
        variation: parseFloat(((Math.random() - 0.5) * 4).toFixed(2))
    }));

    const currentPrice = priceHistory[priceHistory.length - 1].price;
    const yesterdayPrice = priceHistory[priceHistory.length - 2].price;
    const weekAgoPrice = priceHistory[priceHistory.length - 8]?.price || currentPrice;
    const monthAgoPrice = priceHistory[0].price;

    return {
        currentPrice,
        dailyVariation: parseFloat(((currentPrice - yesterdayPrice) / yesterdayPrice * 100).toFixed(2)),
        weeklyVariation: parseFloat(((currentPrice - weekAgoPrice) / weekAgoPrice * 100).toFixed(2)),
        monthlyVariation: parseFloat(((currentPrice - monthAgoPrice) / monthAgoPrice * 100).toFixed(2)),
        priceHistory,
        regionalPrices,
        lastUpdate: new Date().toLocaleString('pt-BR')
    };
};

export const useLivestockMarket = () => {
    const [data, setData] = useState<LivestockMarketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMarketData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Simulando chamada de API com delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Por enquanto, usando dados simulados realistas
            // Em produção, você pode integrar com APIs reais como:
            // - CEPEA/ESALQ: https://www.cepea.esalq.usp.br/br/indicador/boi-gordo.aspx
            // - B3: https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/consultas/mercado-a-vista/cotacoes-historicas/

            const marketData = generateRealisticData();
            setData(marketData);
        } catch (err) {
            setError('Erro ao buscar dados do mercado');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();

        // Atualizar dados a cada 5 minutos
        const interval = setInterval(fetchMarketData, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return { data, loading, error, refetch: fetchMarketData };
};
