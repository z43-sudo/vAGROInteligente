import React from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Search, Filter, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Inventory: React.FC = () => {
    const { inventoryItems } = useApp();
    const items = inventoryItems;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque</h2>
                    <p className="text-gray-500">Gerenciamento de insumos e materiais.</p>
                </div>
                <Link
                    to="/adicionar-item"
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Adicionar Item
                </Link>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar item..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                    <Filter size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-700 rounded-lg"><AlertTriangle size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Itens Críticos</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{items.filter(item => item.status === 'Crítico').length}</h3>
                    <p className="text-xs text-red-500 mt-1">Necessitam reposição imediata</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><TrendingUp size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Valor em Estoque</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">R$ 0</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Package size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Total de Itens</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{items.length}</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Quantidade</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Última Reposição</th>
                            <th className="px-6 py-4">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium mb-2">Nenhum item cadastrado</p>
                                    <p className="text-sm text-gray-400">Clique em "Adicionar Item" para começar a gerenciar seu estoque</p>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4 font-medium">{item.quantity} <span className="text-gray-400 font-normal">{item.unit}</span></td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${item.status === 'Normal' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Baixo' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(item.lastRestock).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-green-700 hover:text-green-900 font-medium text-xs">Solicitar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
