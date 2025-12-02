import React, { useState } from 'react';
import { Bug, AlertTriangle, MapPin, Calendar, Plus, CheckCircle } from 'lucide-react';

const PestAlert: React.FC = () => {
    const [alerts, setAlerts] = useState<Array<{
        id: number;
        pest: string;
        location: string;
        severity: string;
        date: string;
        status: string;
        area: number;
    }>>([]);

    const [showForm, setShowForm] = useState(false);
    const [newAlert, setNewAlert] = useState({
        pest: '',
        location: '',
        severity: 'medium',
        area: 0,
        description: ''
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getSeverityText = (severity: string) => {
        switch (severity) {
            case 'high': return 'Alta';
            case 'medium': return 'Média';
            case 'low': return 'Baixa';
            default: return 'Desconhecida';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'in_progress': return 'Em Andamento';
            case 'resolved': return 'Resolvido';
            default: return 'Desconhecido';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const alert = {
            id: alerts.length + 1,
            ...newAlert,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        setAlerts([alert, ...alerts]);
        setNewAlert({ pest: '', location: '', severity: 'medium', area: 0, description: '' });
        setShowForm(false);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Bug className="text-orange-600" size={28} />
                        Alertas de Pragas
                    </h2>
                    <p className="text-gray-500 mt-1">Monitore e gerencie alertas de pragas e doenças.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Novo Alerta
                </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Alertas Ativos</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {alerts.filter(a => a.status !== 'resolved').length}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                            <Bug size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Alta Severidade</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {alerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Resolvidos</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {alerts.filter(a => a.status === 'resolved').length}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                            <MapPin size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Área Afetada</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {alerts.filter(a => a.status !== 'resolved').reduce((acc, a) => acc + a.area, 0)} ha
                    </h3>
                </div>
            </div>

            {/* Formulário de Novo Alerta */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Registrar Novo Alerta</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Praga/Doença</label>
                                <input
                                    type="text"
                                    value={newAlert.pest}
                                    onChange={(e) => setNewAlert({ ...newAlert, pest: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Ex: Lagarta do Cartucho"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                                <input
                                    type="text"
                                    value={newAlert.location}
                                    onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Ex: Talhão A1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Severidade</label>
                                <select
                                    value={newAlert.severity}
                                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Área Afetada (ha)</label>
                                <input
                                    type="number"
                                    value={newAlert.area}
                                    onChange={(e) => setNewAlert({ ...newAlert, area: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                            <textarea
                                value={newAlert.description}
                                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows={3}
                                placeholder="Descreva os detalhes do alerta..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors">
                                Salvar Alerta
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Alertas */}
            <div className="grid grid-cols-1 gap-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${getSeverityColor(alert.severity)}`}>
                                    <Bug size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{alert.pest}</h3>
                                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {alert.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(alert.date).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span>Área: {alert.area} ha</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                                    Severidade: {getSeverityText(alert.severity)}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(alert.status)}`}>
                                    {getStatusText(alert.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PestAlert;
