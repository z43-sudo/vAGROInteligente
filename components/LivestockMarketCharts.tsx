import React from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { useLivestockMarket } from '../hooks/useLivestockMarket';

const LivestockMarketCharts: React.FC = () => {
    const { data, loading, error, refetch } = useLivestockMarket();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando dados do mercado...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600">{error || 'Erro ao carregar dados'}</p>
                <button
                    onClick={refetch}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;
    const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Indicadores Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={20} />
                        <span className="text-sm font-medium opacity-90">Preço Atual (@)</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{formatCurrency(data.currentPrice)}</h3>
                    <div className="flex items-center gap-1 text-sm">
                        {data.dailyVariation >= 0 ? (
                            <TrendingUp size={16} className="text-green-200" />
                        ) : (
                            <TrendingDown size={16} className="text-red-200" />
                        )}
                        <span className={data.dailyVariation >= 0 ? 'text-green-200' : 'text-red-200'}>
                            {formatPercent(data.dailyVariation)} hoje
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={20} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-500">Variação Semanal</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-1">
                        {formatPercent(data.weeklyVariation)}
                    </h3>
                    <p className="text-xs text-gray-400">Últimos 7 dias</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={20} className="text-purple-600" />
                        <span className="text-sm font-medium text-gray-500">Variação Mensal</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-1">
                        {formatPercent(data.monthlyVariation)}
                    </h3>
                    <p className="text-xs text-gray-400">Últimos 30 dias</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={20} className="text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Regiões</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-1">
                        {data.regionalPrices.length}
                    </h3>
                    <p className="text-xs text-gray-400">Monitoradas</p>
                </div>
            </div>

            {/* Gráfico de Evolução de Preços */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Evolução do Preço da Arroba</h3>
                        <p className="text-sm text-gray-500">Últimos 30 dias</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} />
                        Atualizar
                    </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.priceHistory}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value}`}
                            domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                            formatter={(value: number) => [formatCurrency(value), 'Preço']}
                            labelFormatter={(label) => {
                                const date = new Date(label);
                                return date.toLocaleDateString('pt-BR');
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#16a34a"
                            strokeWidth={2}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de Preços Regionais */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Preços por Região</h3>
                    <p className="text-sm text-gray-500">Comparativo entre estados produtores</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.regionalPrices}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="region"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                            formatter={(value: number, name: string) => {
                                if (name === 'price') return [formatCurrency(value), 'Preço'];
                                if (name === 'variation') return [formatPercent(value), 'Variação'];
                                return [value, name];
                            }}
                        />
                        <Legend />
                        <Bar dataKey="price" fill="#16a34a" name="Preço (R$)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tabela de Variações Regionais */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Detalhamento Regional</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Última atualização: {data.lastUpdate}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Região</th>
                                <th className="px-6 py-4">Preço (@)</th>
                                <th className="px-6 py-4">Variação</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.regionalPrices.map((region, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            {region.region}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {formatCurrency(region.price)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 ${region.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {region.variation >= 0 ? (
                                                <TrendingUp size={16} />
                                            ) : (
                                                <TrendingDown size={16} />
                                            )}
                                            {formatPercent(region.variation)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${region.variation >= 2 ? 'bg-green-100 text-green-700' :
                                                region.variation <= -2 ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {region.variation >= 2 ? 'Alta' :
                                                region.variation <= -2 ? 'Baixa' : 'Estável'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <DollarSign size={20} className="text-blue-600" />
                    Informações sobre os Dados
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <p className="font-medium text-gray-700 mb-1">📊 Fonte dos Dados:</p>
                        <p>Dados simulados baseados em valores reais do mercado brasileiro de gado bovino.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 mb-1">🔄 Atualização:</p>
                        <p>Os dados são atualizados automaticamente a cada 5 minutos.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 mb-1">💡 Próximas Melhorias:</p>
                        <p>Integração com APIs reais: CEPEA/ESALQ, B3, Agrolink.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 mb-1">📈 Indicadores:</p>
                        <p>Preços em R$ por arroba (@) de boi gordo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivestockMarketCharts;
