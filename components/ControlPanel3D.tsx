import React from 'react';
import { Layers, Droplet, Sun, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

interface ControlPanel3DProps {
    areas: any[];
    selectedTalhao: string | null;
    onSelectTalhao: (id: string | null) => void;
    viewMode: '3d' | 'terrain' | 'heatmap';
    onViewModeChange: (mode: '3d' | 'terrain' | 'heatmap') => void;
}

const ControlPanel3D: React.FC<ControlPanel3DProps> = ({
    areas,
    selectedTalhao,
    onSelectTalhao,
    viewMode,
    onViewModeChange
}) => {
    const getHealthIcon = (health: number) => {
        if (health >= 80) return <TrendingUp className="text-green-500" size={16} />;
        if (health >= 60) return <Activity className="text-yellow-500" size={16} />;
        return <AlertTriangle className="text-red-500" size={16} />;
    };

    const getHealthColor = (health: number) => {
        if (health >= 80) return 'border-green-500 bg-green-50';
        if (health >= 60) return 'border-yellow-500 bg-yellow-50';
        if (health >= 40) return 'border-orange-500 bg-orange-50';
        return 'border-red-500 bg-red-50';
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 p-4 space-y-4">
            {/* Title */}
            <div>
                <h3 className="text-white font-bold text-lg mb-1">Talhões</h3>
                <p className="text-blue-200 text-sm">Clique para selecionar</p>
            </div>

            {/* Talhões List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {areas.map((area) => {
                    const isSelected = selectedTalhao === area.id;

                    return (
                        <button
                            key={area.id}
                            onClick={() => onSelectTalhao(isSelected ? null : area.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all ${isSelected
                                    ? 'bg-blue-600 border-2 border-blue-400 shadow-lg transform scale-105'
                                    : 'bg-white/20 border-2 border-white/30 hover:bg-white/30'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold">{area.name}</h4>
                                    <p className="text-blue-200 text-xs">{area.cropType || 'Não definido'}</p>
                                </div>
                                {getHealthIcon(area.health)}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-blue-200">Área</p>
                                    <p className="text-white font-semibold">{area.area_hectares.toFixed(1)} ha</p>
                                </div>
                                <div>
                                    <p className="text-blue-200">Saúde</p>
                                    <p className="text-white font-semibold">{area.health.toFixed(0)}%</p>
                                </div>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="mt-2 bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all ${area.health >= 80 ? 'bg-green-500' :
                                            area.health >= 60 ? 'bg-yellow-500' :
                                                area.health >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${area.health}%` }}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-white/20">
                <h4 className="text-white font-semibold text-sm mb-2">Ações Rápidas</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                        <Droplet size={14} />
                        Irrigar
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                        <Sun size={14} />
                        Analisar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel3D;
