import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign, Sprout, Tractor } from 'lucide-react';

const Reports: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedType, setSelectedType] = useState('all');

    const reports = [
        { id: 1, title: 'Relatório de Produtividade', type: 'production', date: '2023-11-29', period: 'Mensal', status: 'ready' },
        { id: 2, title: 'Análise Financeira', type: 'financial', date: '2023-11-28', period: 'Trimestral', status: 'ready' },
        { id: 3, title: 'Consumo de Insumos', type: 'inputs', date: '2023-11-27', period: 'Mensal', status: 'ready' },
        { id: 4, title: 'Desempenho de Máquinas', type: 'machines', date: '2023-11-26', period: 'Semanal', status: 'ready' },
    ];

    const stats = [
        { label: 'Relatórios Gerados', value: '24', icon: FileText, color: 'blue' },
        { label: 'Este Mês', value: '8', icon: Calendar, color: 'green' },
        { label: 'Downloads', value: '156', icon: Download, color: 'purple' },
        { label: 'Economia Identificada', value: 'R$ 45k', icon: DollarSign, color: 'orange' },
    ];

    const quickReports = [
        { title: 'Produtividade por Talhão', icon: Sprout, color: 'green' },
        { title: 'Custos Operacionais', icon: DollarSign, color: 'blue' },
        { title: 'Eficiência de Máquinas', icon: Tractor, color: 'orange' },
        { title: 'Análise de Safra', icon: TrendingUp, color: 'purple' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-600" size={28} />
                        Relatórios
                    </h2>
                    <p className="text-gray-500 mt-1">Gere e visualize relatórios detalhados da fazenda.</p>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 bg-${stat.color}-100 text-${stat.color}-700 rounded-lg`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Relatórios Rápidos */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4">Relatórios Rápidos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickReports.map((report, index) => (
                        <button
                            key={index}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-green-200 text-left"
                        >
                            <div className={`p-3 bg-${report.color}-100 text-${report.color}-700 rounded-xl inline-flex mb-3`}>
                                <report.icon size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800">{report.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">Gerar relatório</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filtros:</span>
                    </div>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                        <option value="week">Última Semana</option>
                        <option value="month">Último Mês</option>
                        <option value="quarter">Último Trimestre</option>
                        <option value="year">Último Ano</option>
                    </select>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                        <option value="all">Todos os Tipos</option>
                        <option value="production">Produção</option>
                        <option value="financial">Financeiro</option>
                        <option value="inputs">Insumos</option>
                        <option value="machines">Máquinas</option>
                    </select>
                </div>
            </div>

            {/* Lista de Relatórios */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Relatórios Disponíveis</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {reports.map((report) => (
                        <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{report.title}</h4>
                                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(report.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span>Período: {report.period}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                                        <Download size={16} />
                                        Download
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                                        Visualizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
