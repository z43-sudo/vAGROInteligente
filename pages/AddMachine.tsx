import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, Save, ArrowLeft, MapPin, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const AddMachine: React.FC = () => {
    const navigate = useNavigate();
    const { addMachine } = useApp();

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        status: 'Parado' as 'Operando' | 'Manutenção' | 'Parado',
        hours: 0,
        location: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addMachine({
            ...formData,
            id: Date.now().toString()
        });

        alert('Máquina adicionada com sucesso!');
        navigate('/maquinas');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/maquinas')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Tractor className="text-green-700" size={28} />
                        Adicionar Máquina
                    </h2>
                    <p className="text-gray-500 mt-1">Cadastre uma nova máquina ou equipamento.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Máquina *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: John Deere 8320R"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo/Modelo *
                            </label>
                            <input
                                type="text"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: Trator, Colheitadeira, Pulverizador"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status Inicial *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Parado">Parado</option>
                                <option value="Operando">Operando</option>
                                <option value="Manutenção">Manutenção</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Clock size={16} className="inline mr-1" />
                                Horímetro (horas) *
                            </label>
                            <input
                                type="number"
                                value={formData.hours}
                                onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Total de horas trabalhadas</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-1" />
                                Localização Atual *
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: Talhão A1, Garagem, Oficina"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Dica</h4>
                        <p className="text-sm text-blue-700">
                            Após adicionar a máquina, você poderá gerenciar manutenções, consumo de combustível e histórico de operações na página de Gestão de Máquinas.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                        >
                            <Save size={18} />
                            Adicionar Máquina
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/maquinas')}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMachine;
