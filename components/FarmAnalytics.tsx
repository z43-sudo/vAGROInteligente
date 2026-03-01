import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Activity, Zap, Award, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface AnalyticsData {
    totalCrops: number;
    totalArea: number;
    averageProgress: number;
    activitiesCount: number;
    inventoryValue: number;
    machinesCount: number;
    livestockCount: number;
    productivity: {
        trend: 'up' | 'down' | 'stable';
        percentage: number;
    };
    insights: {
        type: 'success' | 'warning' | 'info';
        title: string;
        description: string;
        icon: React.ReactNode;
    }[];
}

const FarmAnalytics: React.FC = () => {
    const { crops, activities, inventoryItems, machines, livestock } = useApp();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        const calculateAnalytics = () => {
            // Calcular métricas
            const totalCrops = crops.length;
            const totalArea = crops.reduce((sum, crop) => {
                const areaValue = typeof crop.area === 'string' ? parseFloat(crop.area) : (crop.area || 0);
                return sum + areaValue;
            }, 0);
            const averageProgress = crops.length > 0
                ? crops.reduce((sum, crop) => sum + (crop.progress || 0), 0) / crops.length
                : 0;

            const activitiesCount = activities.length;
            const machinesCount = machines.length;
            const livestockCount = livestock.length;

            // Calcular valor estimado do estoque
            const inventoryValue = inventoryItems.reduce((sum, item) => {
                // Estimativa de valor baseado em quantidade (simplificado)
                const estimatedPrice = item.category === 'Fertilizantes' ? 150 :
                    item.category === 'Defensivos' ? 200 :
                        item.category === 'Sementes' ? 100 : 50;
                return sum + (item.quantity * estimatedPrice);
            }, 0);

            // Analisar tendência de produtividade
            const cropsWithProgress = crops.filter(c => c.progress !== undefined);
            const highPerformingCrops = cropsWithProgress.filter(c => (c.progress || 0) > 70).length;
            const productivityPercentage = cropsWithProgress.length > 0
                ? (highPerformingCrops / cropsWithProgress.length) * 100
                : 0;

            const productivityTrend: 'up' | 'down' | 'stable' =
                productivityPercentage > 60 ? 'up' :
                    productivityPercentage < 40 ? 'down' : 'stable';

            // Gerar insights inteligentes
            const insights: AnalyticsData['insights'] = [];

            // Insight 1: Safras em bom andamento
            if (highPerformingCrops > 0) {
                insights.push({
                    type: 'success',
                    title: 'Safras em Desenvolvimento Avançado',
                    description: `${highPerformingCrops} safra(s) com mais de 70% de progresso. Ótimo desempenho!`,
                    icon: <Award className="text-green-600" size={24} />
                });
            }

            // Insight 2: Área total cultivada
            if (totalArea > 0) {
                insights.push({
                    type: 'info',
                    title: 'Área Total Cultivada',
                    description: `${totalArea.toFixed(1)} hectares em produção. ${totalArea > 100 ? 'Grande escala detectada.' : 'Considere expansão gradual.'}`,
                    icon: <BarChart3 className="text-blue-600" size={24} />
                });
            }

            // Insight 3: Estoque
            if (inventoryItems.length > 0) {
                const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minQuantity);
                if (lowStockItems.length > 0) {
                    insights.push({
                        type: 'warning',
                        title: 'Atenção ao Estoque',
                        description: `${lowStockItems.length} item(ns) com estoque baixo. Planeje reposição.`,
                        icon: <Package className="text-yellow-600" size={24} />
                    });
                } else {
                    insights.push({
                        type: 'success',
                        title: 'Estoque Adequado',
                        description: 'Todos os itens estão acima do nível mínimo. Boa gestão!',
                        icon: <Package className="text-green-600" size={24} />
                    });
                }
            }

            // Insight 4: Atividades
            if (activitiesCount > 0) {
                const urgentActivities = activities.filter(a => a.status === 'Urgente').length;
                if (urgentActivities > 0) {
                    insights.push({
                        type: 'warning',
                        title: 'Atividades Urgentes',
                        description: `${urgentActivities} atividade(s) marcada(s) como urgente. Priorize!`,
                        icon: <Zap className="text-red-600" size={24} />
                    });
                }
            }

            // Insight 5: Máquinas
            if (machinesCount > 0) {
                const machinesInMaintenance = machines.filter(m => m.status === 'Manutenção').length;
                if (machinesInMaintenance > 0) {
                    insights.push({
                        type: 'warning',
                        title: 'Máquinas em Manutenção',
                        description: `${machinesInMaintenance} máquina(s) em manutenção. Pode afetar operações.`,
                        icon: <Activity className="text-orange-600" size={24} />
                    });
                }
            }

            // Insight 6: Diversificação
            const uniqueCropTypes = new Set(crops.map(c => c.name)).size;
            if (uniqueCropTypes >= 3) {
                insights.push({
                    type: 'success',
                    title: 'Boa Diversificação',
                    description: `${uniqueCropTypes} tipos de culturas diferentes. Reduz riscos de mercado.`,
                    icon: <TrendingUp className="text-green-600" size={24} />
                });
            } else if (totalCrops > 0) {
                insights.push({
                    type: 'info',
                    title: 'Considere Diversificar',
                    description: 'Diversificar culturas pode reduzir riscos e aumentar rentabilidade.',
                    icon: <TrendingUp className="text-blue-600" size={24} />
                });
            }

            // Insight 7: Eficiência geral
            if (totalCrops > 0 && averageProgress > 50) {
                insights.push({
                    type: 'success',
                    title: 'Boa Eficiência Operacional',
                    description: `Progresso médio de ${averageProgress.toFixed(0)}% nas safras. Continue assim!`,
                    icon: <Award className="text-purple-600" size={24} />
                });
            }

            setAnalytics({
                totalCrops,
                totalArea,
                averageProgress,
                activitiesCount,
                inventoryValue,
                machinesCount,
                livestockCount,
                productivity: {
                    trend: productivityTrend,
                    percentage: productivityPercentage
                },
                insights
            });
        };

        calculateAnalytics();
    }, [crops, activities, inventoryItems, machines, livestock]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    if (!analytics) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (analytics.totalCrops === 0 && analytics.activitiesCount === 0) {
        return (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                <BarChart3 className="text-blue-600 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-blue-800 mb-2">Comece a Usar o Sistema</h3>
                <p className="text-blue-700">
                    Cadastre safras, atividades e outros dados para visualizar análises inteligentes.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <BarChart3 className="text-purple-600" size={28} />
                    Análise de Dados da Fazenda
                </h2>
                <p className="text-gray-600">
                    Insights inteligentes baseados nos seus dados
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-green-100 text-sm">Safras Ativas</p>
                        <TrendingUp size={20} className="text-green-200" />
                    </div>
                    <p className="text-3xl font-bold">{analytics.totalCrops}</p>
                    <p className="text-green-100 text-xs mt-1">{analytics.totalArea.toFixed(1)} ha total</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-100 text-sm">Progresso Médio</p>
                        <Activity size={20} className="text-blue-200" />
                    </div>
                    <p className="text-3xl font-bold">{analytics.averageProgress.toFixed(0)}%</p>
                    <p className="text-blue-100 text-xs mt-1">das safras</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-purple-100 text-sm">Atividades</p>
                        <Zap size={20} className="text-purple-200" />
                    </div>
                    <p className="text-3xl font-bold">{analytics.activitiesCount}</p>
                    <p className="text-purple-100 text-xs mt-1">registradas</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-orange-100 text-sm">Estoque</p>
                        <Package size={20} className="text-orange-200" />
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(analytics.inventoryValue)}</p>
                    <p className="text-orange-100 text-xs mt-1">valor estimado</p>
                </div>
            </div>

            {/* Productivity Trend */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-purple-600" size={24} />
                    Tendência de Produtividade
                </h3>

                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block text-gray-600">
                                        Safras de Alto Desempenho
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-purple-600">
                                        {analytics.productivity.percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                                <div
                                    style={{ width: `${analytics.productivity.percentage}%` }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${analytics.productivity.trend === 'up' ? 'bg-green-500' :
                                        analytics.productivity.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${analytics.productivity.trend === 'up' ? 'bg-green-100 text-green-700' :
                        analytics.productivity.trend === 'down' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {analytics.productivity.trend === 'up' && <TrendingUp size={20} />}
                        {analytics.productivity.trend === 'down' && <TrendingDown size={20} />}
                        {analytics.productivity.trend === 'stable' && <Activity size={20} />}
                        <span className="font-semibold text-sm">
                            {analytics.productivity.trend === 'up' && 'Em Alta'}
                            {analytics.productivity.trend === 'down' && 'Em Baixa'}
                            {analytics.productivity.trend === 'stable' && 'Estável'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Resources Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Activity className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Máquinas</p>
                            <p className="text-2xl font-bold text-gray-800">{analytics.machinesCount}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Equipamentos cadastrados</p>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Package className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Itens de Estoque</p>
                            <p className="text-2xl font-bold text-gray-800">{inventoryItems.length}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Insumos disponíveis</p>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <DollarSign className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pecuária</p>
                            <p className="text-2xl font-bold text-gray-800">{analytics.livestockCount}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Animais registrados</p>
                </div>
            </div>

            {/* Insights */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Insights Inteligentes</h3>

                {analytics.insights.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                        <AlertCircle className="text-gray-400 mx-auto mb-3" size={40} />
                        <p className="text-gray-600">Adicione mais dados para gerar insights personalizados.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analytics.insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`rounded-xl p-5 border-2 ${insight.type === 'success' ? 'bg-green-50 border-green-200' :
                                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-blue-50 border-blue-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {insight.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-semibold mb-1 ${insight.type === 'success' ? 'text-green-800' :
                                            insight.type === 'warning' ? 'text-yellow-800' :
                                                'text-blue-800'
                                            }`}>
                                            {insight.title}
                                        </h4>
                                        <p className={`text-sm ${insight.type === 'success' ? 'text-green-700' :
                                            insight.type === 'warning' ? 'text-yellow-700' :
                                                'text-blue-700'
                                            }`}>
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmAnalytics;
