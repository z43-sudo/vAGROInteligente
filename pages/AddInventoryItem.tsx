import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Save, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const AddInventoryItem: React.FC = () => {
    const navigate = useNavigate();
    const { addInventoryItem } = useApp();

    const [formData, setFormData] = useState({
        name: '',
        category: 'Sementes' as 'Sementes' | 'Fertilizantes' | 'Defensivos' | 'Peças' | 'Combustível',
        quantity: 0,
        unit: '',
        minQuantity: 0,
        location: '',
        lastRestock: new Date().toISOString().split('T')[0],
        status: 'Normal' as 'Normal' | 'Baixo' | 'Crítico'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Determinar status baseado na quantidade
        let status: 'Normal' | 'Baixo' | 'Crítico' = 'Normal';
        if (formData.quantity <= formData.minQuantity) {
            status = 'Crítico';
        } else if (formData.quantity <= formData.minQuantity * 1.5) {
            status = 'Baixo';
        }

        addInventoryItem({
            ...formData,
            status
        });

        alert('Item adicionado ao estoque com sucesso!');
        navigate('/estoque');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/estoque')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-green-700" size={28} />
                        Adicionar Item ao Estoque
                    </h2>
                    <p className="text-gray-500 mt-1">Cadastre um novo item no inventário.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Item *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: Semente de Soja Intacta"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoria *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Sementes">Sementes</option>
                                <option value="Fertilizantes">Fertilizantes</option>
                                <option value="Defensivos">Defensivos</option>
                                <option value="Peças">Peças</option>
                                <option value="Combustível">Combustível</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantidade *
                            </label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unidade *
                            </label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: sc, ton, L, un"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantidade Mínima *
                            </label>
                            <input
                                type="number"
                                value={formData.minQuantity}
                                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Alerta quando estoque estiver abaixo deste valor</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Localização *
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: Armazém A - Prateleira 3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data da Última Reposição
                            </label>
                            <input
                                type="date"
                                value={formData.lastRestock}
                                onChange={(e) => setFormData({ ...formData, lastRestock: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                        >
                            <Save size={18} />
                            Adicionar ao Estoque
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/estoque')}
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

export default AddInventoryItem;
