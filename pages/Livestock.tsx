import React, { useState } from 'react';
import { Activity, Heart, Scale, Syringe, AlertCircle, Plus, X, TrendingUp, Calculator, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Livestock as LivestockType } from '../types';
import LivestockMarketCharts from '../components/LivestockMarketCharts';
import LivestockCalculators from '../components/LivestockCalculators';
import SlaughterhouseLogistics from '../components/SlaughterhouseLogistics';

const Livestock: React.FC = () => {
    const { livestock, addLivestock } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'herd' | 'market' | 'calculators' | 'logistics'>('herd');
    const [newAnimal, setNewAnimal] = useState<Partial<LivestockType>>({
        type: 'Bovino',
        status: 'Saudável'
    });

    const herdStats = [
        { label: 'Total de Animais', value: livestock.length.toString(), icon: Activity, color: 'blue' },
        { label: 'Em Tratamento', value: livestock.filter(a => a.status === 'Tratamento').length.toString(), icon: Syringe, color: 'red' },
        { label: 'Peso Médio', value: livestock.length > 0 ? (livestock.reduce((acc, curr) => acc + curr.weight, 0) / livestock.length).toFixed(1) + ' kg' : '0 kg', icon: Scale, color: 'green' },
        { label: 'Nascimentos (Mês)', value: '0', icon: Heart, color: 'pink' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAnimal.tag && newAnimal.breed && newAnimal.weight && newAnimal.age && newAnimal.location) {
            addLivestock({
                ...newAnimal,
                id: Date.now().toString(),
                lastVaccination: new Date().toISOString().split('T')[0]
            } as LivestockType);
            setIsModalOpen(false);
            setNewAnimal({ type: 'Bovino', status: 'Saudável' });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Controle de Pecuária</h2>
                    <p className="text-gray-500">Gestão do rebanho, saúde, mercado e calculadoras.</p>
                </div>
                {activeTab === 'herd' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-lg hover:bg-green-900 transition-colors"
                    >
                        <Plus size={16} /> Registrar Animal
                    </button>
                )}
            </div>

            {/* Abas de Navegação */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                        onClick={() => setActiveTab('herd')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'herd' ? 'bg-green-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Activity size={20} />
                        <span className="hidden md:inline">Gestão do Rebanho</span>
                        <span className="md:hidden">Rebanho</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'market' ? 'bg-green-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <TrendingUp size={20} />
                        <span className="hidden md:inline">Análise de Mercado</span>
                        <span className="md:hidden">Mercado</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('calculators')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'calculators' ? 'bg-green-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Calculator size={20} />
                        Calculadoras
                    </button>
                    <button
                        onClick={() => setActiveTab('logistics')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'logistics' ? 'bg-green-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <MapPin size={20} />
                        <span className="hidden md:inline">Logística</span>
                        <span className="md:hidden">Logística</span>
                    </button>
                </div>
            </div>

            {/* Conteúdo das Abas */}
            {activeTab === 'herd' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {herdStats.map((stat, index) => (
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

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Rebanho Recente</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Brinco/ID</th>
                                        <th className="px-6 py-4">Raça</th>
                                        <th className="px-6 py-4">Peso (kg)</th>
                                        <th className="px-6 py-4">Idade (meses)</th>
                                        <th className="px-6 py-4">Localização</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {livestock.length > 0 ? (
                                        livestock.map((animal) => (
                                            <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{animal.tag}</td>
                                                <td className="px-6 py-4">{animal.breed}</td>
                                                <td className="px-6 py-4">{animal.weight}</td>
                                                <td className="px-6 py-4">{animal.age}</td>
                                                <td className="px-6 py-4">{animal.location}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${animal.status === 'Saudável' ? 'bg-green-100 text-green-700' :
                                                        animal.status === 'Tratamento' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {animal.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Detalhes</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                Nenhum animal registrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : activeTab === 'market' ? (
                <LivestockMarketCharts />
            ) : activeTab === 'calculators' ? (
                <LivestockCalculators />
            ) : (
                <SlaughterhouseLogistics />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Registrar Animal</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brinco/ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    value={newAnimal.tag || ''}
                                    onChange={e => setNewAnimal({ ...newAnimal, tag: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        value={newAnimal.breed || ''}
                                        onChange={e => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        value={newAnimal.type}
                                        onChange={e => setNewAnimal({ ...newAnimal, type: e.target.value as any })}
                                    >
                                        <option value="Bovino">Bovino</option>
                                        <option value="Suíno">Suíno</option>
                                        <option value="Ovino">Ovino</option>
                                        <option value="Equino">Equino</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        value={newAnimal.weight || ''}
                                        onChange={e => setNewAnimal({ ...newAnimal, weight: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Idade (meses)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        value={newAnimal.age || ''}
                                        onChange={e => setNewAnimal({ ...newAnimal, age: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Pasto A"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    value={newAnimal.location || ''}
                                    onChange={e => setNewAnimal({ ...newAnimal, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    value={newAnimal.status}
                                    onChange={e => setNewAnimal({ ...newAnimal, status: e.target.value as any })}
                                >
                                    <option value="Saudável">Saudável</option>
                                    <option value="Doente">Doente</option>
                                    <option value="Tratamento">Tratamento</option>
                                    <option value="Vendido">Vendido</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-lg hover:bg-green-900 transition-colors"
                                >
                                    Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Livestock;
