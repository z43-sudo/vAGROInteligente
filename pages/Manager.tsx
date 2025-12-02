import React from 'react';
import { BarChart3, Users, AlertCircle, CheckCircle } from 'lucide-react';

const Manager: React.FC = () => {
    // Dados vazios para estado inicial
    const pendingApprovals: any[] = [];
    const recentLogs: any[] = [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Painel do Gestor</h2>
                    <p className="text-gray-500">Visão geral estratégica e aprovações pendentes.</p>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg"><BarChart3 size={20} /></div>
                        <span className="text-sm text-gray-300 font-medium">Lucratividade (Mês)</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">0%</h3>
                    <p className="text-xs text-gray-400">Em relação ao mês anterior</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><AlertCircle size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Aprovações Pendentes</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">0</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Users size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Equipe Ativa</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">0/0</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><CheckCircle size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Metas Atingidas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">0%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Approvals List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Solicitações Pendentes</h3>
                    <div className="space-y-4">
                        {pendingApprovals.length > 0 ? (
                            pendingApprovals.map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Compra de Insumos #{100 + i}</h4>
                                        <p className="text-sm text-gray-500">Solicitado por: João Souza • R$ 12.500,00</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Rejeitar</button>
                                        <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg transition-colors">Aprovar</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Nenhuma solicitação pendente.</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Registro de Atividades Recentes</h3>
                    <div className="space-y-6">
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2 h-2 rounded-full ${log.type === 'info' ? 'bg-blue-500' :
                                            log.type === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}></div>
                                        {i !== 2 && <div className="w-0.5 h-full bg-gray-100 mt-2"></div>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{log.text}</p>
                                        <p className="text-xs text-gray-400">{log.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Nenhuma atividade recente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manager;
