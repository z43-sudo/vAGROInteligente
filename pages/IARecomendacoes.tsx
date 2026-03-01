import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Calendar, BarChart3, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import PlantingWindow from '../components/PlantingWindow';
import RiskAlerts from '../components/RiskAlerts';
import ProductionEstimate from '../components/ProductionEstimate';
import FarmAnalytics from '../components/FarmAnalytics';

const IARecomendacoes: React.FC = () => {
    const { crops, activities, farmDetails } = useApp();
    const [activeTab, setActiveTab] = useState<'planting' | 'risks' | 'production' | 'analytics'>('planting');

    const tabs = [
        { id: 'planting' as const, name: 'Janela de Plantio', icon: Calendar, color: 'green' },
        { id: 'risks' as const, name: 'Alertas de Risco', icon: AlertTriangle, color: 'red' },
        { id: 'production' as const, name: 'Estimativa de Produção', icon: TrendingUp, color: 'blue' },
        { id: 'analytics' as const, name: 'Análise de Dados', icon: BarChart3, color: 'purple' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-2xl shadow-lg">
                        <Brain className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            IA Inteligente
                            <Sparkles className="text-yellow-500" size={24} />
                        </h1>
                        <p className="text-gray-600">Recomendações personalizadas para sua fazenda</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Safras Ativas</p>
                            <p className="text-2xl font-bold text-gray-800">{crops.length}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Atividades</p>
                            <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Calendar className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Fazenda</p>
                            <p className="text-lg font-bold text-gray-800 truncate">{farmDetails.name || 'Minha Fazenda'}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <BarChart3 className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-4 shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-100">IA Ativa</p>
                            <p className="text-2xl font-bold">100%</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <Brain className="text-white" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-md p-2 mb-6">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                                        ? `bg-${tab.color}-600 text-white shadow-lg transform scale-105`
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                style={
                                    isActive
                                        ? {
                                            backgroundColor:
                                                tab.color === 'green'
                                                    ? '#16a34a'
                                                    : tab.color === 'red'
                                                        ? '#dc2626'
                                                        : tab.color === 'blue'
                                                            ? '#2563eb'
                                                            : '#9333ea',
                                        }
                                        : {}
                                }
                            >
                                <Icon size={20} />
                                <span className="hidden sm:inline">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {activeTab === 'planting' && <PlantingWindow />}
                {activeTab === 'risks' && <RiskAlerts />}
                {activeTab === 'production' && <ProductionEstimate />}
                {activeTab === 'analytics' && <FarmAnalytics />}
            </div>
        </div>
    );
};

export default IARecomendacoes;
