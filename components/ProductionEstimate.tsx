import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, Info, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Crop } from '../types';

interface ProductionEstimateData {
    crop: Crop;
    estimatedYield: number; // kg/ha
    totalProduction: number; // kg
    confidence: number; // 0-100
    factors: {
        name: string;
        impact: 'positive' | 'negative' | 'neutral';
        description: string;
    }[];
    marketPrice?: number; // R$/kg
    estimatedRevenue?: number; // R$
}

const ProductionEstimate: React.FC = () => {
    const { crops } = useApp();
    const [selectedCropId, setSelectedCropId] = useState<string>('');
    const [estimate, setEstimate] = useState<ProductionEstimateData | null>(null);

    useEffect(() => {
        if (crops.length > 0 && !selectedCropId) {
            setSelectedCropId(crops[0].id);
        }
    }, [crops]);

    useEffect(() => {
        if (selectedCropId) {
            const crop = crops.find(c => c.id === selectedCropId);
            if (crop) {
                const estimateData = calculateProductionEstimate(crop);
                setEstimate(estimateData);
            }
        }
    }, [selectedCropId, crops]);

    // Algoritmo de estimativa de produção
    const calculateProductionEstimate = (crop: Crop): ProductionEstimateData => {
        const factors: ProductionEstimateData['factors'] = [];

        // Produtividade base por cultura (kg/ha)
        const baseYields: { [key: string]: number } = {
            'Soja': 3500,
            'Milho': 6000,
            'Café': 2500,
            'Trigo': 3000,
            'Cana-de-açúcar': 75000,
            'Algodão': 4000,
            'Feijão': 2000,
            'Arroz': 5000,
        };

        // Preços médios de mercado (R$/kg)
        const marketPrices: { [key: string]: number } = {
            'Soja': 1.50,
            'Milho': 0.80,
            'Café': 12.00,
            'Trigo': 1.20,
            'Cana-de-açúcar': 0.15,
            'Algodão': 3.50,
            'Feijão': 4.00,
            'Arroz': 2.50,
        };

        let baseYield = baseYields[crop.name] || 3000;
        let adjustmentFactor = 1.0;
        let confidenceScore = 70; // Base confidence

        // Fator 1: Progresso da safra
        if (crop.progress !== undefined) {
            if (crop.progress >= 80) {
                adjustmentFactor *= 1.1;
                confidenceScore += 15;
                factors.push({
                    name: 'Estágio Avançado',
                    impact: 'positive',
                    description: `Safra em estágio avançado (${crop.progress}%). Maior previsibilidade.`
                });
            } else if (crop.progress < 30) {
                confidenceScore -= 20;
                factors.push({
                    name: 'Estágio Inicial',
                    impact: 'neutral',
                    description: `Safra em estágio inicial (${crop.progress}%). Estimativa preliminar.`
                });
            }
        }

        // Fator 2: Área plantada
        if (crop.area) {
            const areaNum = typeof crop.area === 'string' ? parseFloat(crop.area) : crop.area;
            if (areaNum > 100) {
                adjustmentFactor *= 1.05;
                factors.push({
                    name: 'Grande Área',
                    impact: 'positive',
                    description: `Área de ${crop.area} ha permite economia de escala.`
                });
            }
        }

        // Fator 3: Estágio fenológico
        if (crop.stage) {
            if (crop.stage === 'Maturação') {
                adjustmentFactor *= 1.15;
                confidenceScore += 10;
                factors.push({
                    name: 'Fase de Maturação',
                    impact: 'positive',
                    description: 'Cultura em fase final. Boa perspectiva de colheita.'
                });
            } else if (crop.stage === 'Floração') {
                factors.push({
                    name: 'Fase de Floração',
                    impact: 'neutral',
                    description: 'Fase crítica. Monitorar condições climáticas.'
                });
            }
        }

        // Fator 4: Tempo até colheita
        if (crop.daysToHarvest !== undefined) {
            if (crop.daysToHarvest < 30) {
                confidenceScore += 10;
                factors.push({
                    name: 'Próximo à Colheita',
                    impact: 'positive',
                    description: `Faltam apenas ${crop.daysToHarvest} dias para colheita.`
                });
            } else if (crop.daysToHarvest > 90) {
                adjustmentFactor *= 0.9;
                confidenceScore -= 10;
                factors.push({
                    name: 'Longo Prazo',
                    impact: 'negative',
                    description: `Ainda faltam ${crop.daysToHarvest} dias. Muitas variáveis podem afetar.`
                });
            }
        }

        // Fator 5: Condições climáticas simuladas
        const currentMonth = new Date().getMonth() + 1;
        if (currentMonth >= 10 || currentMonth <= 3) {
            // Período de chuvas
            adjustmentFactor *= 1.05;
            factors.push({
                name: 'Período Favorável',
                impact: 'positive',
                description: 'Período de chuvas favorece desenvolvimento.'
            });
        }

        // Adicionar fatores de risco genéricos
        factors.push({
            name: 'Manejo Adequado',
            impact: 'positive',
            description: 'Assumindo práticas agronômicas recomendadas.'
        });

        // Calcular estimativa final
        const estimatedYield = Math.round(baseYield * adjustmentFactor);
        const areaValue = typeof crop.area === 'string' ? parseFloat(crop.area) : (crop.area || 0);
        const totalProduction = crop.area ? Math.round(estimatedYield * areaValue) : 0;
        const marketPrice = marketPrices[crop.name] || 1.0;
        const estimatedRevenue = totalProduction * marketPrice;

        // Limitar confiança entre 0-100
        const finalConfidence = Math.min(100, Math.max(0, confidenceScore));

        return {
            crop,
            estimatedYield,
            totalProduction,
            confidence: finalConfidence,
            factors,
            marketPrice,
            estimatedRevenue
        };
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-600 bg-green-100';
        if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    if (crops.length === 0) {
        return (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                <AlertCircle className="text-yellow-600 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-yellow-800 mb-2">Nenhuma Safra Cadastrada</h3>
                <p className="text-yellow-700">
                    Cadastre safras na página "Safras" para visualizar estimativas de produção.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={28} />
                    Estimativa de Produção
                </h2>
                <p className="text-gray-600">
                    Previsão baseada em dados da safra e condições atuais
                </p>
            </div>

            {/* Crop Selector */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione a Safra
                </label>
                <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                    {crops.map((crop) => (
                        <option key={crop.id} value={crop.id}>
                            {crop.name} - {crop.area} ha {crop.progress !== undefined ? `(${crop.progress}%)` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {estimate && (
                <>
                    {/* Main Estimate Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Estimativa de Produtividade</p>
                                <p className="text-4xl font-bold">{formatNumber(estimate.estimatedYield)} kg/ha</p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                <Sparkles size={40} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400">
                            <div>
                                <p className="text-blue-100 text-sm">Produção Total</p>
                                <p className="text-2xl font-bold">{formatNumber(estimate.totalProduction)} kg</p>
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm">Confiança</p>
                                <p className="text-2xl font-bold">{estimate.confidence}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Estimate */}
                    {estimate.marketPrice && estimate.estimatedRevenue && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <DollarSign className="text-green-600" size={28} />
                                <h3 className="text-xl font-bold text-gray-800">Estimativa de Receita</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Preço de Mercado</p>
                                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(estimate.marketPrice)}/kg</p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Produção Estimada</p>
                                    <p className="text-2xl font-bold text-gray-800">{formatNumber(estimate.totalProduction)} kg</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                                    <p className="text-sm text-green-100 mb-1">Receita Estimada</p>
                                    <p className="text-2xl font-bold">{formatCurrency(estimate.estimatedRevenue)}</p>
                                </div>
                            </div>

                            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-gray-700">
                                        <strong>Nota:</strong> Valores baseados em preços médios de mercado.
                                        Consulte cotações atualizadas para planejamento financeiro preciso.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confidence Indicator */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Nível de Confiança</h3>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getConfidenceColor(estimate.confidence)}`}>
                                {estimate.confidence}%
                            </span>
                        </div>

                        <div className="relative pt-1">
                            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200">
                                <div
                                    style={{ width: `${estimate.confidence}%` }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${estimate.confidence >= 80 ? 'bg-green-500' :
                                        estimate.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                ></div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-3">
                            {estimate.confidence >= 80 && 'Alta confiança. Estimativa baseada em dados consolidados.'}
                            {estimate.confidence >= 60 && estimate.confidence < 80 && 'Confiança moderada. Alguns fatores ainda podem variar.'}
                            {estimate.confidence < 60 && 'Confiança limitada. Safra em estágio inicial ou com muitas variáveis.'}
                        </p>
                    </div>

                    {/* Factors Analysis */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fatores Considerados</h3>

                        <div className="space-y-3">
                            {estimate.factors.map((factor, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 ${factor.impact === 'positive' ? 'bg-green-50 border-green-200' :
                                        factor.impact === 'negative' ? 'bg-red-50 border-red-200' :
                                            'bg-blue-50 border-blue-200'
                                        }`}
                                >
                                    {factor.impact === 'positive' && <TrendingUp className="text-green-600 flex-shrink-0 mt-0.5" size={20} />}
                                    {factor.impact === 'negative' && <TrendingDown className="text-red-600 flex-shrink-0 mt-0.5" size={20} />}
                                    {factor.impact === 'neutral' && <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />}

                                    <div className="flex-1">
                                        <p className={`font-semibold text-sm mb-1 ${factor.impact === 'positive' ? 'text-green-800' :
                                            factor.impact === 'negative' ? 'text-red-800' :
                                                'text-blue-800'
                                            }`}>
                                            {factor.name}
                                        </p>
                                        <p className="text-sm text-gray-700">{factor.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-sm font-semibold text-yellow-800 mb-1">Aviso Importante</p>
                                <p className="text-sm text-yellow-700">
                                    Esta é uma estimativa baseada em dados históricos e condições atuais.
                                    Fatores como clima, pragas, doenças e práticas de manejo podem afetar significativamente
                                    a produção real. Use como referência para planejamento, não como garantia.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductionEstimate;
