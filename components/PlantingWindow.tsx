import React, { useState, useEffect } from 'react';
import { Calendar, Cloud, Droplet, Sun, Wind, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getCurrentWeather, getWeatherForecast, WeatherData, ForecastDay } from '../services/weatherService';

interface CropRecommendation {
    crop: string;
    bestPeriod: string;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
    conditions: string[];
}

const PlantingWindow: React.FC = () => {
    const { crops } = useApp();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [selectedCrop, setSelectedCrop] = useState<string>('Soja');
    const [loading, setLoading] = useState(true);

    // Culturas comuns no Brasil
    const commonCrops = ['Soja', 'Milho', 'Trigo', 'Café', 'Cana-de-açúcar', 'Algodão', 'Feijão', 'Arroz'];

    useEffect(() => {
        const loadWeatherData = async () => {
            setLoading(true);
            const currentWeather = await getCurrentWeather();
            const forecastData = await getWeatherForecast();
            setWeather(currentWeather);
            setForecast(forecastData);
            setLoading(false);
        };

        loadWeatherData();
    }, []);

    // Algoritmo de recomendação baseado em conhecimento agronômico
    const getPlantingRecommendation = (cropName: string): CropRecommendation => {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const avgTemp = weather?.temperature || 25;
        const humidity = weather?.humidity || 65;

        const recommendations: { [key: string]: CropRecommendation } = {
            'Soja': {
                crop: 'Soja',
                bestPeriod: currentMonth >= 9 && currentMonth <= 12 ? 'Período Ideal (Set-Dez)' : 'Fora do Período Ideal',
                reason: currentMonth >= 9 && currentMonth <= 12
                    ? 'Condições climáticas favoráveis para germinação e desenvolvimento inicial.'
                    : 'Aguarde o período de chuvas regulares (Set-Dez) para melhores resultados.',
                confidence: currentMonth >= 9 && currentMonth <= 12 ? 'high' : 'low',
                conditions: [
                    `Temperatura: ${avgTemp}°C ${avgTemp >= 20 && avgTemp <= 30 ? '✓' : '✗'}`,
                    `Umidade: ${humidity}% ${humidity >= 60 ? '✓' : '✗'}`,
                    'Solo: Bem drenado e fértil',
                    'pH ideal: 6.0-6.5'
                ]
            },
            'Milho': {
                crop: 'Milho',
                bestPeriod: currentMonth >= 8 && currentMonth <= 11 ? 'Período Ideal (Ago-Nov)' : 'Fora do Período Ideal',
                reason: currentMonth >= 8 && currentMonth <= 11
                    ? 'Temperatura e umidade adequadas para o desenvolvimento.'
                    : 'Aguarde o período de plantio recomendado (Ago-Nov).',
                confidence: currentMonth >= 8 && currentMonth <= 11 ? 'high' : 'medium',
                conditions: [
                    `Temperatura: ${avgTemp}°C ${avgTemp >= 18 && avgTemp <= 32 ? '✓' : '✗'}`,
                    `Umidade: ${humidity}% ${humidity >= 50 ? '✓' : '✗'}`,
                    'Solo: Profundo e bem drenado',
                    'Precipitação: 500-800mm no ciclo'
                ]
            },
            'Café': {
                crop: 'Café',
                bestPeriod: currentMonth >= 10 && currentMonth <= 12 ? 'Período Ideal (Out-Dez)' : 'Período Secundário',
                reason: 'Plantio no início das chuvas favorece o estabelecimento das mudas.',
                confidence: currentMonth >= 10 && currentMonth <= 12 ? 'high' : 'medium',
                conditions: [
                    `Temperatura: ${avgTemp}°C ${avgTemp >= 18 && avgTemp <= 25 ? '✓' : '✗'}`,
                    'Altitude: 800-1200m (ideal)',
                    'Solo: Profundo e bem drenado',
                    'pH ideal: 5.5-6.5'
                ]
            },
            'Trigo': {
                crop: 'Trigo',
                bestPeriod: currentMonth >= 4 && currentMonth <= 6 ? 'Período Ideal (Abr-Jun)' : 'Fora do Período',
                reason: 'Cultura de inverno, requer temperaturas amenas.',
                confidence: currentMonth >= 4 && currentMonth <= 6 ? 'high' : 'low',
                conditions: [
                    `Temperatura: ${avgTemp}°C ${avgTemp >= 10 && avgTemp <= 24 ? '✓' : '✗'}`,
                    'Clima: Temperado',
                    'Solo: Bem estruturado',
                    'pH ideal: 6.0-7.0'
                ]
            }
        };

        return recommendations[cropName] || {
            crop: cropName,
            bestPeriod: 'Consulte um agrônomo',
            reason: 'Dados específicos não disponíveis para esta cultura.',
            confidence: 'low',
            conditions: ['Consulte literatura técnica específica']
        };
    };

    const recommendation = getPlantingRecommendation(selectedCrop);

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getConfidenceText = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'Alta Confiança';
            case 'medium': return 'Média Confiança';
            case 'low': return 'Baixa Confiança';
            default: return 'Indefinido';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="text-green-600" size={28} />
                    Melhor Janela de Plantio
                </h2>
                <p className="text-gray-600">
                    Recomendações baseadas em dados climáticos e calendário agrícola
                </p>
            </div>

            {/* Crop Selector */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione a Cultura
                </label>
                <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                    {commonCrops.map((crop) => (
                        <option key={crop} value={crop}>
                            {crop}
                        </option>
                    ))}
                </select>
            </div>

            {/* Current Weather */}
            {weather && (
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-100 text-sm">Clima Atual</p>
                            <p className="text-3xl font-bold">{weather.temperature}°C</p>
                            <p className="text-blue-100 capitalize">{weather.condition}</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                            <Cloud size={48} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-400">
                        <div className="flex items-center gap-2">
                            <Droplet size={20} className="text-blue-200" />
                            <div>
                                <p className="text-xs text-blue-200">Umidade</p>
                                <p className="font-semibold">{weather.humidity}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind size={20} className="text-blue-200" />
                            <div>
                                <p className="text-xs text-blue-200">Vento</p>
                                <p className="font-semibold">{weather.windSpeed} km/h</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sun size={20} className="text-blue-200" />
                            <div>
                                <p className="text-xs text-blue-200">Sensação</p>
                                <p className="font-semibold">{weather.feelsLike}°C</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendation Card */}
            <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-md">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{recommendation.crop}</h3>
                        <p className="text-lg font-semibold text-green-600">{recommendation.bestPeriod}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                        {getConfidenceText(recommendation.confidence)}
                    </span>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-gray-700">{recommendation.reason}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Condições Recomendadas:</h4>
                    <div className="space-y-2">
                        {recommendation.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {condition.includes('✓') ? (
                                    <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                                ) : condition.includes('✗') ? (
                                    <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                                ) : (
                                    <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                                )}
                                <span className="text-gray-700">{condition.replace('✓', '').replace('✗', '')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Forecast */}
            {forecast.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Previsão dos Próximos Dias</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {forecast.map((day, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                                <p className="text-sm font-medium text-gray-600 mb-2">{day.day}</p>
                                <img
                                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                                    alt={day.condition}
                                    className="w-12 h-12 mx-auto"
                                />
                                <p className="text-xl font-bold text-gray-800">{day.temp}°C</p>
                                <p className="text-xs text-gray-500 capitalize">{day.condition}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlantingWindow;
