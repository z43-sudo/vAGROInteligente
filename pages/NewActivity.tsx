import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, User, FileText, Save } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const NewActivity: React.FC = () => {
    const navigate = useNavigate();
    const { addActivity } = useApp();

    const [formData, setFormData] = useState({
        title: '',
        type: 'irrigation',
        description: '',
        location: '',
        assignedTo: '',
        scheduledDate: '',
        priority: 'normal'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mapear tipo para status e tipo de ícone
        const statusMap: { [key: string]: 'Em andamento' | 'Concluído' | 'Urgente' | 'Agendado' } = {
            irrigation: 'Em andamento',
            planting: 'Agendado',
            harvest: 'Agendado',
            maintenance: 'Em andamento',
            fertilization: 'Em andamento',
            pest_control: 'Urgente',
            other: 'Agendado'
        };

        const typeMap: { [key: string]: 'irrigation' | 'maintenance' | 'alert' | 'harvest' } = {
            irrigation: 'irrigation',
            planting: 'harvest',
            harvest: 'harvest',
            maintenance: 'maintenance',
            fertilization: 'maintenance',
            pest_control: 'alert',
            other: 'maintenance'
        };

        // Adicionar atividade ao contexto
        addActivity({
            title: formData.title,
            description: formData.description,
            status: statusMap[formData.type] || 'Agendado',
            type: typeMap[formData.type] || 'maintenance',
        });

        // Mostrar mensagem de sucesso
        alert('Atividade criada com sucesso!');

        // Navegar de volta para o dashboard
        navigate('/');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Plus className="text-green-700" size={28} />
                    Nova Atividade
                </h2>
                <p className="text-gray-500 mt-1">Cadastre uma nova atividade para a fazenda.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título da Atividade
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: Irrigação Talhão A1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Atividade
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="irrigation">Irrigação</option>
                                <option value="planting">Plantio</option>
                                <option value="harvest">Colheita</option>
                                <option value="maintenance">Manutenção</option>
                                <option value="fertilization">Fertilização</option>
                                <option value="pest_control">Controle de Pragas</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-1" />
                                Localização
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: Talhão A1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline mr-1" />
                                Responsável
                            </label>
                            <input
                                type="text"
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Nome do responsável"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-1" />
                                Data Agendada
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prioridade
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="low">Baixa</option>
                                <option value="normal">Normal</option>
                                <option value="high">Alta</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText size={16} className="inline mr-1" />
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows={4}
                            placeholder="Descreva os detalhes da atividade..."
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                        >
                            <Save size={18} />
                            Salvar Atividade
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
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

export default NewActivity;
