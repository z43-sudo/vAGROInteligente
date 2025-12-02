import React, { useState } from 'react';
import { Droplets, Power, Clock, MapPin, Activity, TrendingUp, Plus, X } from 'lucide-react';

interface IrrigationSystem {
    id: number;
    name: string;
    type: string;
    location: string;
    status: 'active' | 'inactive' | 'scheduled';
    waterFlow: number;
    duration: number;
    area: number;
}

const IrrigationControl: React.FC = () => {
    const [systems, setSystems] = useState<IrrigationSystem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newSystem, setNewSystem] = useState<Partial<IrrigationSystem>>({
        name: '',
        type: 'Pivô Central',
        location: '',
        waterFlow: 0,
        duration: 0,
        area: 0,
        status: 'inactive'
    });

    const toggleSystem = (id: number) => {
        setSystems(systems.map(sys =>
            sys.id === id
                ? { ...sys, status: sys.status === 'active' ? 'inactive' : 'active' }
                : sys
        ));
    };

    const handleAddSystem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSystem.name && newSystem.location) {
            setSystems([...systems, {
                id: Date.now(),
                name: newSystem.name,
                type: newSystem.type || 'Pivô Central',
                location: newSystem.location,
                waterFlow: Number(newSystem.waterFlow),
                duration: Number(newSystem.duration),
                area: Number(newSystem.area),
                status: 'inactive'
            } as IrrigationSystem]);
            setShowForm(false);
            setNewSystem({
                name: '',
                type: 'Pivô Central',
                location: '',
                waterFlow: 0,
                duration: 0,
                area: 0,
                status: 'inactive'
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'inactive': return 'Inativo';
            case 'scheduled': return 'Agendado';
            default: return 'Desconhecido';
        }
    };

    // Calculate dynamic consumption based on active systems (simplified: flow * duration/60)
    // This is just a visual estimation for "Today"
    const todayConsumption = systems
        .filter(s => s.status === 'active')
        .reduce((acc, s) => acc + (s.waterFlow * (s.duration / 60)), 0);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Droplets className="text-blue-600" size={28} />
                        Controle de Irrigação
                    </h2>
                    <p className="text-gray-500 mt-1">Gerencie os sistemas de irrigação da fazenda.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Novo Sistema
                </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                            <Droplets size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Sistemas Ativos</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {systems.filter(s => s.status === 'active').length}/{systems.length}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <Activity size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Vazão Total (Ativa)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {systems.filter(s => s.status === 'active').reduce((acc, s) => acc + s.waterFlow, 0)} m³/h
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                            <MapPin size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Área Irrigada (Ativa)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {systems.filter(s => s.status === 'active').reduce((acc, s) => acc + s.area, 0)} ha
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Consumo Est. Hoje</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{todayConsumption.toFixed(0)} m³</h3>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">Novo Sistema de Irrigação</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSystem} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Sistema</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: Pivô Central A1"
                                        value={newSystem.name}
                                        onChange={e => setNewSystem({ ...newSystem, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={newSystem.type}
                                        onChange={e => setNewSystem({ ...newSystem, type: e.target.value })}
                                    >
                                        <option value="Pivô Central">Pivô Central</option>
                                        <option value="Aspersão">Aspersão</option>
                                        <option value="Gotejamento">Gotejamento</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Talhão/Localização</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: Talhão Norte"
                                        value={newSystem.location}
                                        onChange={e => setNewSystem({ ...newSystem, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Área (ha)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={newSystem.area}
                                        onChange={e => setNewSystem({ ...newSystem, area: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vazão (m³/h)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={newSystem.waterFlow}
                                        onChange={e => setNewSystem({ ...newSystem, waterFlow: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração Padrão (min)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={newSystem.duration}
                                        onChange={e => setNewSystem({ ...newSystem, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Salvar Sistema
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sistemas de Irrigação */}
            {systems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Droplets size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum sistema registrado</h3>
                    <p className="text-gray-500 mb-6">Comece adicionando seu primeiro sistema de irrigação.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                    >
                        Adicionar Sistema
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {systems.map((system) => (
                        <div key={system.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{system.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin size={14} />
                                        {system.location}
                                    </p>
                                    <p className="text-xs text-blue-600 font-medium mt-1">{system.type}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(system.status)}`}>
                                    {getStatusText(system.status)}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <Droplets size={14} />
                                        Vazão
                                    </span>
                                    <span className="font-medium text-gray-800">{system.waterFlow} m³/h</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <Clock size={14} />
                                        Duração
                                    </span>
                                    <span className="font-medium text-gray-800">{system.duration} min</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <MapPin size={14} />
                                        Área
                                    </span>
                                    <span className="font-medium text-gray-800">{system.area} ha</span>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleSystem(system.id)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${system.status === 'active'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-700 text-white hover:bg-green-800'
                                    }`}
                            >
                                <Power size={18} />
                                {system.status === 'active' ? 'Desligar Sistema' : 'Ligar Sistema'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IrrigationControl;
