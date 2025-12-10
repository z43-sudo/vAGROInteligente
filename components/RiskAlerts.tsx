import React, { useState, useEffect } from 'react';
import { AlertTriangle, Cloud, Droplet, Wind, Thermometer, AlertCircle, CheckCircle, Info, Bell } from 'lucide-react';
import { getCurrentWeather, getWeatherForecast, WeatherData, ForecastDay } from '../services/weatherService';

interface RiskAlert {
    id: string;
    type: 'frost' | 'drought' | 'heavy_rain' | 'heatwave' | 'wind' | 'pest' | 'disease';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation: string;
    date: string;
    icon: React.ReactNode;
}

const RiskAlerts: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [alerts, setAlerts] = useState<RiskAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const currentWeather = await getCurrentWeather();
            const forecastData = await getWeatherForecast();
            setWeather(currentWeather);
            setForecast(forecastData);

            // Analisar riscos
            const detectedAlerts = analyzeRisks(currentWeather, forecastData);
            setAlerts(detectedAlerts);

            setLoading(false);
        };

        loadData();
    }, []);

    // Algoritmo de análise de riscos
    const analyzeRisks = (currentWeather: WeatherData | null, forecast: ForecastDay[]): RiskAlert[] => {
        const risks: RiskAlert[] = [];
        const currentMonth = new Date().getMonth() + 1;

        if (!currentWeather) return risks;

        // 1. Risco de Geada
        if (currentWeather.temperature < 5) {
            risks.push({
                id: 'frost-1',
                type: 'frost',
                severity: currentWeather.temperature < 0 ? 'critical' : 'high',
                title: 'Alerta de Geada',
                description: `Temperatura atual de ${currentWeather.temperature}°C. Risco de geada nas próximas horas.`,
                recommendation: 'Proteja culturas sensíveis. Evite irrigação antes da geada. Considere uso de cobertura ou queima controlada.',
                date: new Date().toLocaleDateString('pt-BR'),
                icon: <Thermometer className="text-blue-600" size={24} />
            });
        }

        // 2. Risco de Seca
        if (currentWeather.humidity < 40 && currentWeather.temperature > 30) {
            risks.push({
                id: 'drought-1',
                type: 'drought',
                severity: currentWeather.humidity < 30 ? 'high' : 'medium',
                title: 'Alerta de Seca',
                description: `Umidade baixa (${currentWeather.humidity}%) e temperatura alta (${currentWeather.temperature}°C).`,
                recommendation: 'Monitore irrigação. Aumente frequência de rega. Considere mulching para conservar umidade do solo.',
                date: new Date().toLocaleDateString('pt-BR'),
                icon: <Droplet className="text-orange-600" size={24} />
            });
        }

        // 3. Risco de Chuva Intensa
        if (currentWeather.precipitation > 20) {
            risks.push({
                id: 'rain-1',
                type: 'heavy_rain',
                severity: currentWeather.precipitation > 50 ? 'high' : 'medium',
                title: 'Alerta de Chuva Intensa',
                description: `Precipitação de ${currentWeather.precipitation}mm detectada.`,
                recommendation: 'Evite aplicação de defensivos. Verifique drenagem. Monitore erosão em áreas inclinadas.',
                date: new Date().toLocaleDateString('pt-BR'),
                icon: <Cloud className="text-blue-600" size={24} />
            });
        }

        // 4. Risco de Calor Extremo
        if (currentWeather.temperature > 35) {
            risks.push({
                id: 'heat-1',
                type: 'heatwave',
                severity: currentWeather.temperature > 40 ? 'critical' : 'high',
                title: 'Alerta de Calor Extremo',
                description: `Temperatura de ${currentWeather.temperature}°C. Estresse térmico para plantas e animais.`,
                recommendation: 'Evite atividades pesadas. Aumente sombreamento para animais. Monitore irrigação de culturas.',
                date: new Date().toLocaleDateString('pt-BR'),
                icon: <Thermometer className="text-red-600" size={24} />
            });
        }

        // 5. Risco de Vento Forte
        if (currentWeather.windSpeed > 40) {
            risks.push({
                id: 'wind-1',
                type: 'wind',
                severity: currentWeather.windSpeed > 60 ? 'high' : 'medium',
                title: 'Alerta de Vento Forte',
                description: `Ventos de ${currentWeather.windSpeed} km/h detectados.`,
                recommendation: 'Evite aplicação de defensivos. Proteja estruturas leves. Monitore culturas altas.',
                date: new Date().toLocaleDateString('pt-BR'),
                icon: <Wind className="text-gray-600" size={24} />
            });
        }

        // 6. Risco de Pragas (baseado em condições climáticas)
        if (currentWeather.temperature >= 25 && currentWeather.temperature <= 30 && currentWeather.humidity > 70) {
            risks.push({
                id: 'pest-1',
                type: 'pest',
                severity: 'medium',
                title: 'Condições Favoráveis para Pragas',
                description: 'Temperatura e umidade ideais para proliferação de pragas.',
                recommendation: 'Monitore culturas. Considere aplicação preventiva de defensivos. Verifique armadilhas.',
                date: new Date().toLocaleDateString('pt-BR'),
                icon: <AlertTriangle className="text-yellow-600" size={24} />
            });
        }

        // 7. Risco de Doenças Fúngicas
        if (currentWeather.humidity > 80 && currentWeather.temperature >= 20 && currentWeather.temperature <= 28) {
            risks.push({
                id: 'disease-1',
                type: 'disease',
                severity: 'medium',
                title: 'Risco de Doenças Fúngicas',
                description: 'Alta umidade favorece desenvolvimento de fungos.',
                recommendation: 'Monitore sintomas de doenças. Considere aplicação preventiva de fungicidas. Melhore ventilação.',
                date: new Date().toLocaleDateString('pt-BR'),
                icon: <AlertCircle className="text-purple-600" size={24} />
            });
        }

        // Ordenar por severidade
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 border-red-500 text-red-800';
            case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
            case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
            case 'low': return 'bg-blue-100 border-blue-500 text-blue-800';
            default: return 'bg-gray-100 border-gray-500 text-gray-800';
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical': return 'Crítico';
            case 'high': return 'Alto';
            case 'medium': return 'Médio';
            case 'low': return 'Baixo';
            default: return 'Indefinido';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-red-600" size={28} />
                    Alertas de Risco
                </h2>
                <p className="text-gray-600">
                    Monitoramento inteligente de condições climáticas e riscos agrícolas
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Críticos</p>
                            <p className="text-2xl font-bold text-red-700">
                                {alerts.filter(a => a.severity === 'critical').length}
                            </p>
                        </div>
                        <Bell className="text-red-600" size={24} />
                    </div>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Altos</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {alerts.filter(a => a.severity === 'high').length}
                            </p>
                        </div>
                        <AlertTriangle className="text-orange-600" size={24} />
                    </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Médios</p>
                            <p className="text-2xl font-bold text-yellow-700">
                                {alerts.filter(a => a.severity === 'medium').length}
                            </p>
                        </div>
                        <Info className="text-yellow-600" size={24} />
                    </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Status</p>
                            <p className="text-sm font-bold text-green-700">
                                {alerts.length === 0 ? 'Tudo OK' : 'Atenção'}
                            </p>
                        </div>
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
                    <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-bold text-green-800 mb-2">Nenhum Alerta Ativo</h3>
                    <p className="text-green-700">
                        As condições climáticas estão favoráveis. Continue monitorando regularmente.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`border-l-4 rounded-lg p-5 shadow-md ${getSeverityColor(alert.severity)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {alert.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold">{alert.title}</h3>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/50">
                                            {getSeverityBadge(alert.severity)}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-3">{alert.description}</p>
                                    <div className="bg-white/50 rounded-lg p-3 border border-current/20">
                                        <p className="text-sm font-medium mb-1">📋 Recomendação:</p>
                                        <p className="text-sm">{alert.recommendation}</p>
                                    </div>
                                    <p className="text-xs mt-2 opacity-75">Data: {alert.date}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Current Conditions */}
            {weather && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Condições Atuais</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4">
                            <Thermometer className="text-red-500 mb-2" size={24} />
                            <p className="text-sm text-gray-600">Temperatura</p>
                            <p className="text-xl font-bold text-gray-800">{weather.temperature}°C</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <Droplet className="text-blue-500 mb-2" size={24} />
                            <p className="text-sm text-gray-600">Umidade</p>
                            <p className="text-xl font-bold text-gray-800">{weather.humidity}%</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <Wind className="text-gray-500 mb-2" size={24} />
                            <p className="text-sm text-gray-600">Vento</p>
                            <p className="text-xl font-bold text-gray-800">{weather.windSpeed} km/h</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <Cloud className="text-purple-500 mb-2" size={24} />
                            <p className="text-sm text-gray-600">Precipitação</p>
                            <p className="text-xl font-bold text-gray-800">{weather.precipitation} mm</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskAlerts;
