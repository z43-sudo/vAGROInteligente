import React from 'react';
import { X, Droplet, Sun, TrendingUp, Activity, Thermometer, Wind } from 'lucide-react';

interface StatsPanel3DProps {
    area: any;
    onClose: () => void;
}

const StatsPanel3D: React.FC<StatsPanel3DProps> = ({ area, onClose }) => {
    if (!area) return null;

    const getGrowthStageName = (stage: number) => {
        const stages = ['Germinação', 'Vegetativo', 'Floração', 'Enchimento', 'Maturação'];
        return stages[stage] || 'Desconhecido';
    };

    const getWaterStressLevel = (stress: number) => {
        if (stress < 25) return { label: 'Baixo', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (stress < 50) return { label: 'Moderado', color: 'text-green-600', bg: 'bg-green-100' };
        if (stress < 75) return { label: 'Alto', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { label: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const waterStress = getWaterStressLevel(area.waterStress);

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-white font-bold text-lg">{area.name}</h3>
                    <p className="text-blue-200 text-sm">{area.cropType}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="text-green-400" size={16} />
                        <p className="text-xs text-blue-200">Saúde</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{area.health.toFixed(0)}%</p>
                    <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full ${area.health >= 80 ? 'bg-green-500' :
                                    area.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${area.health}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="text-purple-400" size={16} />
                        <p className="text-xs text-blue-200">Produção</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{area.production.toFixed(0)}</p>
                    <p className="text-xs text-blue-200">kg/ha</p>
                </div>
            </div>

            {/* Environmental Data */}
            <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Condições Ambientais</h4>

                <div className="bg-white/20 rounded-lg p-3 space-y-2">
                    {/* Temperatura */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Thermometer className="text-orange-400" size={16} />
                            <span className="text-sm text-white">Temperatura</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{area.temperature.toFixed(1)}°C</span>
                    </div>

                    {/* Umidade do Solo */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Droplet className="text-blue-400" size={16} />
                            <span className="text-sm text-white">Umidade do Solo</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{area.soilMoisture.toFixed(0)}%</span>
                    </div>

                    {/* NDVI */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="text-green-400" size={16} />
                            <span className="text-sm text-white">NDVI</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{area.ndvi.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Water Stress */}
            <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Stress Hídrico</h4>
                <div className={`${waterStress.bg} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${waterStress.color}`}>
                            {waterStress.label}
                        </span>
                        <span className={`text-lg font-bold ${waterStress.color}`}>
                            {area.waterStress.toFixed(0)}%
                        </span>
                    </div>
                    <div className="bg-white/50 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full ${area.waterStress < 25 ? 'bg-blue-600' :
                                    area.waterStress < 50 ? 'bg-green-600' :
                                        area.waterStress < 75 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                            style={{ width: `${area.waterStress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Growth Stage */}
            <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Estágio de Crescimento</h4>
                <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">{getGrowthStageName(area.growthStage)}</span>
                        <span className="text-sm font-semibold text-white">
                            {area.growthStage + 1}/5
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((stage) => (
                            <div
                                key={stage}
                                className={`flex-1 h-2 rounded-full ${stage <= area.growthStage ? 'bg-green-500' : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Recomendações</h4>
                <div className="space-y-2">
                    {area.waterStress > 60 && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2">
                            <p className="text-xs text-white">
                                <strong>Atenção:</strong> Irrigação recomendada nas próximas 24h
                            </p>
                        </div>
                    )}
                    {area.health < 70 && (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2">
                            <p className="text-xs text-white">
                                <strong>Monitorar:</strong> Verificar presença de pragas ou doenças
                            </p>
                        </div>
                    )}
                    {area.ndvi > 0.8 && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2">
                            <p className="text-xs text-white">
                                <strong>Excelente:</strong> Desenvolvimento saudável da cultura
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Area Info */}
            <div className="pt-3 border-t border-white/20">
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <p className="text-blue-200">Área Total</p>
                        <p className="text-white font-semibold">{area.area_hectares.toFixed(2)} ha</p>
                    </div>
                    <div>
                        <p className="text-blue-200">Elevação</p>
                        <p className="text-white font-semibold">{area.elevation.toFixed(1)} m</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel3D;
