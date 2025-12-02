import React from 'react';
import { CheckSquare, Clock, AlertCircle, Calendar as CalendarIcon, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';

const Activities: React.FC = () => {
    const { activities } = useApp();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Concluído': return 'bg-green-100 text-green-700';
            case 'Em andamento': return 'bg-blue-100 text-blue-700';
            case 'Pendente': return 'bg-yellow-100 text-yellow-700';
            case 'Agendado': return 'bg-gray-100 text-gray-700';
            case 'Crítica': return 'bg-red-100 text-red-700'; // For priority
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestão de Atividades</h2>
                    <p className="text-gray-500">Controle e acompanhamento de tarefas da fazenda.</p>
                </div>
                <Link to="/nova-atividade" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-lg hover:bg-green-900 transition-colors">
                    <Plus size={16} /> Nova Atividade
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Clock size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Em Andamento</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{activities.filter(a => a.status === 'Em andamento').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><AlertCircle size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Urgentes</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{activities.filter(a => a.status === 'Urgente').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><CheckSquare size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Concluídas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{activities.filter(a => a.status === 'Concluído').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><CalendarIcon size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Agendadas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{activities.filter(a => a.status === 'Agendado').length}</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Lista de Atividades</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><Filter size={20} /></button>
                        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><CalendarIcon size={20} /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Atividade</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{activity.title}</td>
                                        <td className="px-6 py-4">{activity.type}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(activity.status)}`}>
                                                {activity.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{activity.time}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Nenhuma atividade registrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Activities;
