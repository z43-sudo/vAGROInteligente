import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Beef, Sprout } from 'lucide-react';

type CalculatorType = 'production' | 'fattening' | 'margin' | 'feedlot' | 'hectare';

const LivestockCalculators: React.FC = () => {
    const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('production');

    // Estados para Calculadora de Custo de Produção
    const [productionData, setProductionData] = useState({
        animals: 100,
        feedCost: 1500,
        laborCost: 3000,
        vetCost: 500,
        maintenanceCost: 800,
        otherCosts: 400
    });

    // Estados para Simulador de Engorda
    const [fatteningData, setFatteningData] = useState({
        initialWeight: 300,
        finalWeight: 480,
        days: 120,
        feedCostPerDay: 15
    });

    // Estados para Simulador de Margem por Arroba
    const [marginData, setMarginData] = useState({
        purchasePrice: 220,
        salePrice: 285,
        totalCost: 180,
        arrobas: 18
    });

    // Estados para Simulação de Confinamento
    const [feedlotData, setFeedlotData] = useState({
        animals: 50,
        confinementDays: 90,
        dailyFeedCost: 18,
        initialWeight: 320,
        expectedGain: 1.4,
        fixedCosts: 5000
    });

    // Estados para Custo por Hectare
    const [hectareData, setHectareData] = useState({
        hectares: 100,
        seedCost: 800,
        fertilizerCost: 1200,
        pesticideCost: 600,
        laborCost: 400,
        machineCost: 1000,
        otherCosts: 300
    });

    // Cálculos - Custo de Produção
    const calculateProduction = () => {
        const total = productionData.feedCost + productionData.laborCost +
            productionData.vetCost + productionData.maintenanceCost +
            productionData.otherCosts;
        const perAnimal = total / productionData.animals;
        return { total, perAnimal };
    };

    // Cálculos - Engorda
    const calculateFattening = () => {
        const weightGain = fatteningData.finalWeight - fatteningData.initialWeight;
        const dailyGain = weightGain / fatteningData.days;
        const totalFeedCost = fatteningData.feedCostPerDay * fatteningData.days;
        const costPerKg = totalFeedCost / weightGain;
        const arrobas = weightGain / 30; // 1 arroba = 15kg (peso vivo) ou 30kg para conversão
        return { weightGain, dailyGain, totalFeedCost, costPerKg, arrobas };
    };

    // Cálculos - Margem por Arroba
    const calculateMargin = () => {
        const grossProfit = marginData.salePrice - marginData.purchasePrice;
        const netProfit = marginData.salePrice - marginData.purchasePrice - (marginData.totalCost / marginData.arrobas);
        const profitMargin = (netProfit / marginData.salePrice) * 100;
        const totalRevenue = marginData.salePrice * marginData.arrobas;
        const totalNetProfit = netProfit * marginData.arrobas;
        return { grossProfit, netProfit, profitMargin, totalRevenue, totalNetProfit };
    };

    // Cálculos - Confinamento
    const calculateFeedlot = () => {
        const totalFeedCost = feedlotData.animals * feedlotData.dailyFeedCost * feedlotData.confinementDays;
        const totalCost = totalFeedCost + feedlotData.fixedCosts;
        const totalWeightGain = feedlotData.animals * feedlotData.expectedGain * feedlotData.confinementDays;
        const finalWeight = (feedlotData.initialWeight * feedlotData.animals) + totalWeightGain;
        const costPerKg = totalCost / totalWeightGain;
        const costPerAnimal = totalCost / feedlotData.animals;
        return { totalFeedCost, totalCost, totalWeightGain, finalWeight, costPerKg, costPerAnimal };
    };

    // Cálculos - Custo por Hectare
    const calculateHectare = () => {
        const costPerHectare = hectareData.seedCost + hectareData.fertilizerCost +
            hectareData.pesticideCost + hectareData.laborCost +
            hectareData.machineCost + hectareData.otherCosts;
        const totalCost = costPerHectare * hectareData.hectares;
        return { costPerHectare, totalCost };
    };

    const calculators = [
        { id: 'production' as CalculatorType, name: 'Custo de Produção', icon: DollarSign },
        { id: 'fattening' as CalculatorType, name: 'Simulador de Engorda', icon: TrendingUp },
        { id: 'margin' as CalculatorType, name: 'Margem por Arroba', icon: Calculator },
        { id: 'feedlot' as CalculatorType, name: 'Confinamento', icon: Beef },
        { id: 'hectare' as CalculatorType, name: 'Custo por Hectare', icon: Sprout }
    ];

    const productionResults = calculateProduction();
    const fatteningResults = calculateFattening();
    const marginResults = calculateMargin();
    const feedlotResults = calculateFeedlot();
    const hectareResults = calculateHectare();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Seletor de Calculadora */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {calculators.map((calc) => (
                        <button
                            key={calc.id}
                            onClick={() => setActiveCalculator(calc.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium transition-all ${activeCalculator === calc.id
                                    ? 'bg-green-800 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <calc.icon size={24} />
                            <span className="text-xs text-center">{calc.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Calculadora de Custo de Produção */}
            {activeCalculator === 'production' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <DollarSign className="text-green-700" />
                            Calculadora de Custo de Produção
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Animais</label>
                                <input
                                    type="number"
                                    value={productionData.animals}
                                    onChange={(e) => setProductionData({ ...productionData, animals: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo com Alimentação (R$/mês)</label>
                                <input
                                    type="number"
                                    value={productionData.feedCost}
                                    onChange={(e) => setProductionData({ ...productionData, feedCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo com Mão de Obra (R$/mês)</label>
                                <input
                                    type="number"
                                    value={productionData.laborCost}
                                    onChange={(e) => setProductionData({ ...productionData, laborCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Veterinário (R$/mês)</label>
                                <input
                                    type="number"
                                    value={productionData.vetCost}
                                    onChange={(e) => setProductionData({ ...productionData, vetCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manutenção (R$/mês)</label>
                                <input
                                    type="number"
                                    value={productionData.maintenanceCost}
                                    onChange={(e) => setProductionData({ ...productionData, maintenanceCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Outros Custos (R$/mês)</label>
                                <input
                                    type="number"
                                    value={productionData.otherCosts}
                                    onChange={(e) => setProductionData({ ...productionData, otherCosts: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Custo Total Mensal</p>
                                <p className="text-3xl font-bold text-green-700">R$ {productionResults.total.toFixed(2)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Custo por Animal/Mês</p>
                                <p className="text-3xl font-bold text-green-700">R$ {productionResults.perAnimal.toFixed(2)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Alimentação</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {((productionData.feedCost / productionResults.total) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Mão de Obra</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {((productionData.laborCost / productionResults.total) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Veterinário</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {((productionData.vetCost / productionResults.total) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Outros</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {(((productionData.maintenanceCost + productionData.otherCosts) / productionResults.total) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simulador de Engorda */}
            {activeCalculator === 'fattening' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-blue-700" />
                            Simulador de Engorda
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Peso Inicial (kg)</label>
                                <input
                                    type="number"
                                    value={fatteningData.initialWeight}
                                    onChange={(e) => setFatteningData({ ...fatteningData, initialWeight: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Peso Final Esperado (kg)</label>
                                <input
                                    type="number"
                                    value={fatteningData.finalWeight}
                                    onChange={(e) => setFatteningData({ ...fatteningData, finalWeight: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Período (dias)</label>
                                <input
                                    type="number"
                                    value={fatteningData.days}
                                    onChange={(e) => setFatteningData({ ...fatteningData, days: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo de Alimentação/Dia (R$)</label>
                                <input
                                    type="number"
                                    value={fatteningData.feedCostPerDay}
                                    onChange={(e) => setFatteningData({ ...fatteningData, feedCostPerDay: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                <p className="text-sm text-gray-600 mb-1">Ganho Médio Diário (GMD)</p>
                                <p className="text-3xl font-bold text-blue-700">{fatteningResults.dailyGain.toFixed(2)} kg/dia</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                <p className="text-sm text-gray-600 mb-1">Ganho Total de Peso</p>
                                <p className="text-3xl font-bold text-blue-700">{fatteningResults.weightGain.toFixed(2)} kg</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Custo Total</p>
                                    <p className="text-lg font-bold text-gray-800">R$ {fatteningResults.totalFeedCost.toFixed(2)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Custo/kg</p>
                                    <p className="text-lg font-bold text-gray-800">R$ {fatteningResults.costPerKg.toFixed(2)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 col-span-2">
                                    <p className="text-xs text-gray-500">Arrobas Ganhas (@)</p>
                                    <p className="text-lg font-bold text-gray-800">{fatteningResults.arrobas.toFixed(2)} @</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simulador de Margem por Arroba */}
            {activeCalculator === 'margin' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calculator className="text-purple-700" />
                            Simulador de Margem por Arroba
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Compra (R$/@)</label>
                                <input
                                    type="number"
                                    value={marginData.purchasePrice}
                                    onChange={(e) => setMarginData({ ...marginData, purchasePrice: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda (R$/@)</label>
                                <input
                                    type="number"
                                    value={marginData.salePrice}
                                    onChange={(e) => setMarginData({ ...marginData, salePrice: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Total de Produção (R$)</label>
                                <input
                                    type="number"
                                    value={marginData.totalCost}
                                    onChange={(e) => setMarginData({ ...marginData, totalCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Arrobas</label>
                                <input
                                    type="number"
                                    value={marginData.arrobas}
                                    onChange={(e) => setMarginData({ ...marginData, arrobas: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 border border-purple-200">
                                <p className="text-sm text-gray-600 mb-1">Lucro Líquido por Arroba</p>
                                <p className={`text-3xl font-bold ${marginResults.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    R$ {marginResults.netProfit.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-purple-200">
                                <p className="text-sm text-gray-600 mb-1">Margem de Lucro</p>
                                <p className={`text-3xl font-bold ${marginResults.profitMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {marginResults.profitMargin.toFixed(2)}%
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Lucro Bruto/@</p>
                                    <p className="text-lg font-bold text-gray-800">R$ {marginResults.grossProfit.toFixed(2)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Receita Total</p>
                                    <p className="text-lg font-bold text-gray-800">R$ {marginResults.totalRevenue.toFixed(2)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 col-span-2">
                                    <p className="text-xs text-gray-500">Lucro Total</p>
                                    <p className={`text-lg font-bold ${marginResults.totalNetProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        R$ {marginResults.totalNetProfit.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simulação de Confinamento */}
            {activeCalculator === 'feedlot' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Beef className="text-orange-700" />
                            Simulação de Confinamento
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Animais</label>
                                <input
                                    type="number"
                                    value={feedlotData.animals}
                                    onChange={(e) => setFeedlotData({ ...feedlotData, animals: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Confinamento</label>
                                <input
                                    type="number"
                                    value={feedlotData.confinementDays}
                                    onChange={(e) => setFeedlotData({ ...feedlotData, confinementDays: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Diário de Alimentação/Animal (R$)</label>
                                <input
                                    type="number"
                                    value={feedlotData.dailyFeedCost}
                                    onChange={(e) => setFeedlotData({ ...feedlotData, dailyFeedCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Peso Inicial Médio (kg)</label>
                                <input
                                    type="number"
                                    value={feedlotData.initialWeight}
                                    onChange={(e) => setFeedlotData({ ...feedlotData, initialWeight: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ganho Esperado/Dia (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={feedlotData.expectedGain}
                                    onChange={(e) => setFeedlotData({ ...feedlotData, expectedGain: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custos Fixos Totais (R$)</label>
                                <input
                                    type="number"
                                    value={feedlotData.fixedCosts}
                                    onChange={(e) => setFeedlotData({ ...feedlotData, fixedCosts: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-sm border border-orange-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 border border-orange-200">
                                <p className="text-sm text-gray-600 mb-1">Custo Total do Confinamento</p>
                                <p className="text-3xl font-bold text-orange-700">R$ {feedlotResults.totalCost.toFixed(2)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-orange-200">
                                <p className="text-sm text-gray-600 mb-1">Ganho Total de Peso</p>
                                <p className="text-3xl font-bold text-orange-700">{feedlotResults.totalWeightGain.toFixed(2)} kg</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Custo/Animal</p>
                                    <p className="text-lg font-bold text-gray-800">R$ {feedlotResults.costPerAnimal.toFixed(2)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Custo/kg Ganho</p>
                                    <p className="text-lg font-bold text-gray-800">R$ {feedlotResults.costPerKg.toFixed(2)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Custo Alimentação</p>
                                    <p className="text-lg font-bold text-gray-800">R$ {feedlotResults.totalFeedCost.toFixed(2)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Peso Final Total</p>
                                    <p className="text-lg font-bold text-gray-800">{feedlotResults.finalWeight.toFixed(2)} kg</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custo por Hectare */}
            {activeCalculator === 'hectare' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Sprout className="text-green-700" />
                            Custo por Hectare
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área Total (hectares)</label>
                                <input
                                    type="number"
                                    value={hectareData.hectares}
                                    onChange={(e) => setHectareData({ ...hectareData, hectares: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo com Sementes/ha (R$)</label>
                                <input
                                    type="number"
                                    value={hectareData.seedCost}
                                    onChange={(e) => setHectareData({ ...hectareData, seedCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo com Fertilizantes/ha (R$)</label>
                                <input
                                    type="number"
                                    value={hectareData.fertilizerCost}
                                    onChange={(e) => setHectareData({ ...hectareData, fertilizerCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo com Defensivos/ha (R$)</label>
                                <input
                                    type="number"
                                    value={hectareData.pesticideCost}
                                    onChange={(e) => setHectareData({ ...hectareData, pesticideCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo com Mão de Obra/ha (R$)</label>
                                <input
                                    type="number"
                                    value={hectareData.laborCost}
                                    onChange={(e) => setHectareData({ ...hectareData, laborCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo com Máquinas/ha (R$)</label>
                                <input
                                    type="number"
                                    value={hectareData.machineCost}
                                    onChange={(e) => setHectareData({ ...hectareData, machineCost: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Outros Custos/ha (R$)</label>
                                <input
                                    type="number"
                                    value={hectareData.otherCosts}
                                    onChange={(e) => setHectareData({ ...hectareData, otherCosts: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-sm border border-green-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Custo por Hectare</p>
                                <p className="text-3xl font-bold text-green-700">R$ {hectareResults.costPerHectare.toFixed(2)}/ha</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Custo Total da Área</p>
                                <p className="text-3xl font-bold text-green-700">R$ {hectareResults.totalCost.toFixed(2)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Sementes</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {((hectareData.seedCost / hectareResults.costPerHectare) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Fertilizantes</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {((hectareData.fertilizerCost / hectareResults.costPerHectare) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Defensivos</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {((hectareData.pesticideCost / hectareResults.costPerHectare) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Máquinas</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {((hectareData.machineCost / hectareResults.costPerHectare) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Informações Adicionais */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Calculator size={20} className="text-gray-600" />
                    Sobre as Calculadoras
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                        <p className="font-medium text-gray-700 mb-1">💡 Dica:</p>
                        <p>Use valores reais da sua propriedade para obter resultados mais precisos.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 mb-1">📊 Análise:</p>
                        <p>Compare os resultados com períodos anteriores para identificar tendências.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700 mb-1">🎯 Planejamento:</p>
                        <p>Utilize as simulações para tomar decisões estratégicas sobre investimentos.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivestockCalculators;
