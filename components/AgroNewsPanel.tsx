import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Calendar, Filter, TrendingUp, Building2, Sprout } from 'lucide-react';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    content: string;
    contentSnippet: string;
    source: string;
    guid: string;
    author: string;
    thumbnail: string;
}

type NewsCategory = 'all' | 'cna' | 'mapa' | 'market' | 'agrolink';

const AgroNewsPanel: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
    const [error, setError] = useState<string | null>(null);

    // URLs dos Feeds RSS (Google News filtrado para garantir estabilidade e CORS via rss2json)
    const feeds = {
        cna: 'https://news.google.com/rss/search?q=CNA+Brasil+Confedera%C3%A7%C3%A3o+da+Agricultura&hl=pt-BR&gl=BR&ceid=BR:pt-419',
        mapa: 'https://news.google.com/rss/search?q=Minist%C3%A9rio+da+Agricultura+Pecu%C3%A1ria+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',
        market: 'https://news.google.com/rss/search?q=B3+commodities+agr%C3%ADcolas+mercado&hl=pt-BR&gl=BR&ceid=BR:pt-419',
        agrolink: 'https://news.google.com/rss/search?q=site:agrolink.com.br&hl=pt-BR&gl=BR&ceid=BR:pt-419'
    };

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            // Usando rss2json para converter RSS em JSON e evitar problemas de CORS
            const fetchFeed = async (url: string, source: string) => {
                const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (data.status === 'ok') {
                    return data.items.map((item: any) => ({
                        ...item,
                        source,
                        // Tenta extrair imagem se disponível no description ou usa placeholder
                        thumbnail: extractImage(item.description)
                    }));
                }
                return [];
            };

            const [cnaNews, mapaNews, marketNews, agrolinkNews] = await Promise.all([
                fetchFeed(feeds.cna, 'CNA Brasil'),
                fetchFeed(feeds.mapa, 'MAPA'),
                fetchFeed(feeds.market, 'Mercado B3'),
                fetchFeed(feeds.agrolink, 'Agrolink')
            ]);

            // Combinar e ordenar por data
            const allNews = [...cnaNews, ...mapaNews, ...marketNews, ...agrolinkNews]
                .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            setNews(allNews);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Erro ao buscar notícias:', err);
            setError('Não foi possível atualizar as notícias. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const extractImage = (content: string) => {
        const imgRegex = /<img[^>]+src="([^">]+)"/;
        const match = content.match(imgRegex);
        return match ? match[1] : null;
    };

    useEffect(() => {
        fetchNews();

        // Atualização automática a cada 10 minutos (600000 ms)
        const intervalId = setInterval(() => {
            fetchNews();
        }, 600000);

        return () => clearInterval(intervalId);
    }, []);

    const filteredNews = activeCategory === 'all'
        ? news
        : news.filter(item => {
            if (activeCategory === 'cna') return item.source === 'CNA Brasil';
            if (activeCategory === 'mapa') return item.source === 'MAPA';
            if (activeCategory === 'market') return item.source === 'Mercado B3';
            if (activeCategory === 'agrolink') return item.source === 'Agrolink';
            return true;
        });

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'CNA Brasil': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'MAPA': return 'bg-green-100 text-green-800 border-green-200';
            case 'Mercado B3': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Agrolink': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'CNA Brasil': return <Building2 size={14} />;
            case 'MAPA': return <Sprout size={14} />;
            case 'Mercado B3': return <TrendingUp size={14} />;
            default: return <Newspaper size={14} />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Newspaper className="text-green-700" size={28} />
                        Notícias do Agro
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        Atualizado em: {lastUpdated.toLocaleTimeString()}
                        {loading && <RefreshCw className="animate-spin text-green-600" size={14} />}
                    </p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === 'all' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setActiveCategory('cna')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === 'cna' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        CNA Brasil
                    </button>
                    <button
                        onClick={() => setActiveCategory('mapa')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === 'mapa' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        MAPA
                    </button>
                    <button
                        onClick={() => setActiveCategory('market')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === 'market' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Mercado B3
                    </button>
                    <button
                        onClick={() => setActiveCategory('agrolink')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === 'agrolink' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Agrolink
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                    <Filter size={20} />
                    {error}
                    <button onClick={fetchNews} className="ml-auto text-sm underline hover:text-red-800">Tentar novamente</button>
                </div>
            )}

            {loading && news.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((item, index) => (
                        <article key={`${item.guid}-${index}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${getSourceColor(item.source)}`}>
                                        {getSourceIcon(item.source)}
                                        {item.source}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(item.pubDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-green-700 transition-colors">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        {item.title}
                                    </a>
                                </h3>

                                <div className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow"
                                    dangerouslySetInnerHTML={{ __html: item.contentSnippet || item.content }}
                                />

                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
                                    >
                                        Ler notícia completa
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {!loading && filteredNews.length === 0 && !error && (
                <div className="text-center py-12 text-gray-500">
                    <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhuma notícia encontrada nesta categoria.</p>
                </div>
            )}
        </div>
    );
};

export default AgroNewsPanel;
