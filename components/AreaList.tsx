import React, { useState } from 'react';
import { Trash2, Edit3, MapPin, Ruler, Calendar, ExternalLink } from 'lucide-react';

interface AreaListProps {
    areas: any[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: any) => void;
    onSelect: (area: any) => void;
}

const AreaList: React.FC<AreaListProps> = ({ areas, onDelete, onUpdate, onSelect }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editNotes, setEditNotes] = useState('');

    const startEdit = (area: any) => {
        setEditingId(area.id);
        setEditName(area.name);
        setEditNotes(area.notes || '');
    };

    const saveEdit = (id: string) => {
        onUpdate(id, { name: editName, notes: editNotes });
        setEditingId(null);
        setEditName('');
        setEditNotes('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditNotes('');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (areas.length === 0) {
        return (
            <div className="text-center py-12">
                <MapPin className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma Área Mapeada</h3>
                <p className="text-gray-600">
                    Use o mapa interativo ou conecte um drone para mapear suas áreas
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {areas.length} {areas.length === 1 ? 'Área Mapeada' : 'Áreas Mapeadas'}
                </h3>
                <div className="text-sm text-gray-600">
                    Total: <span className="font-bold text-blue-600">
                        {areas.reduce((sum, a) => sum + a.area_hectares, 0).toFixed(2)} ha
                    </span>
                </div>
            </div>

            {/* Lista de Áreas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areas.map((area) => (
                    <div
                        key={area.id}
                        className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
                    >
                        {editingId === area.id ? (
                            // Modo de Edição
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nome da área"
                                />
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Observações (opcional)"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => saveEdit(area.id)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Modo de Visualização
                            <>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                            <MapPin className="text-blue-600" size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 text-lg truncate">{area.name}</h4>
                                            {area.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{area.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Ruler className="text-green-600" size={16} />
                                            <p className="text-xs text-gray-600">Área</p>
                                        </div>
                                        <p className="text-lg font-bold text-green-700">
                                            {area.area_hectares.toFixed(2)} ha
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Ruler className="text-purple-600" size={16} />
                                            <p className="text-xs text-gray-600">Perímetro</p>
                                        </div>
                                        <p className="text-lg font-bold text-purple-700">
                                            {(area.perimeter_meters / 1000).toFixed(2)} km
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                    <Calendar size={14} />
                                    <span>Mapeado em {formatDate(area.created_at)}</span>
                                </div>

                                {area.source === 'drone' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                                        <p className="text-xs text-blue-700 flex items-center gap-2">
                                            <span className="font-semibold">Fonte:</span> {area.drone_model || 'Drone'}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onSelect(area)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        Ver no Mapa
                                    </button>
                                    <button
                                        onClick={() => startEdit(area)}
                                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Tem certeza que deseja excluir "${area.name}"?`)) {
                                                onDelete(area.id);
                                            }
                                        }}
                                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
                <h4 className="font-bold text-gray-800 mb-4">Resumo Geral</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Área Total</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {areas.reduce((sum, a) => sum + a.area_hectares, 0).toFixed(2)} ha
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Maior Área</p>
                        <p className="text-2xl font-bold text-green-600">
                            {Math.max(...areas.map(a => a.area_hectares)).toFixed(2)} ha
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Menor Área</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {Math.min(...areas.map(a => a.area_hectares)).toFixed(2)} ha
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AreaList;
