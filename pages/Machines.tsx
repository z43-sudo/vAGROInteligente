import React from 'react';
import { Link } from 'react-router-dom';
import { Tractor, Fuel, Wrench, MapPin, Activity, AlertTriangle, Clock, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Machines: React.FC = () => {
    const { machines: machinesFromContext, deleteMachine } = useApp();
    const machines = machinesFromContext;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Operando': return 'bg-green-100 text-green-700';
            case 'Manutenção': return 'bg-red-100 text-red-700';
            case 'Parado': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestão de Máquinas</h2>
                    <p className="text-gray-500">Monitoramento de frota e equipamentos em tempo real.</p>
                </div>
                <Link
                    to="/adicionar-maquina"
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Adicionar Máquina
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Activity size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Máquinas Ativas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{machines.filter(m => m.status === 'Operando').length}/{machines.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-700 rounded-lg"><Wrench size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Em Manutenção</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{machines.filter(m => m.status === 'Manutenção').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Fuel size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Consumo Médio (L/h)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">0</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <Tractor size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium mb-2">Nenhuma máquina cadastrada</p>
                        <p className="text-sm text-gray-400 mb-4">Clique em "Adicionar Máquina" para começar a gerenciar sua frota</p>
                    </div>
                ) : (
                    machines.map((machine) => (
                        <div key={machine.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                                        <Tractor size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{machine.name}</h3>
                                        <p className="text-xs text-gray-500">{machine.type}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(machine.status)}`}>
                                    {machine.status}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><Clock size={14} /> Horímetro</span>
                                    <span className="font-medium text-gray-800">{machine.hours} h</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><MapPin size={14} /> Localização</span>
                                    <span className="font-medium text-gray-800">{machine.location}</span>
                                </div>
                            </div>

                            {machine.status === 'Manutenção' && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2 text-xs text-red-700">
                                    <AlertTriangle size={14} className="mt-0.5" />
                                    <span>Máquina em manutenção. Verifique o status na oficina.</span>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (confirm('Tem certeza que deseja deletar esta máquina?')) {
                                        deleteMachine(machine.id);
                                    }
                                }}
                                className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Trash2 size={16} />
                                Deletar Máquina
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Machines;

