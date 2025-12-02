import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { getCurrentWeather, getWeatherForecast, startWeatherUpdates, WeatherData, ForecastDay } from '../services/weatherService';
import { useGeolocation } from '../hooks/useGeolocation';

const Weather: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [loading, setLoading] = useState(true);
    const { location, error: geoError, loading: geoLoading } = useGeolocation();

    useEffect(() => {
        // Buscar dados iniciais
        const fetchWeatherData = async () => {
            setLoading(true);
            // Se tiver localização, usa. Se não, usa padrão (undefined)
            const lat = location?.latitude;
            const lon = location?.longitude;

            const currentWeather = await getCurrentWeather(undefined, undefined, lat, lon);
            const forecastData = await getWeatherForecast(undefined, undefined, lat, lon);
            setWeather(currentWeather);
            setForecast(forecastData);
            setLoading(false);
        };

        if (!geoLoading) {
            fetchWeatherData();
        }

        // Configurar atualização automática a cada 10 minutos
        // Nota: startWeatherUpdates precisaria ser atualizado para suportar coords também, 
        // mas por simplicidade vamos deixar ele atualizar o padrão ou refatorar se necessário.
        // Para garantir consistência, vamos usar um setInterval simples aqui que usa as coords.
        const interval = setInterval(() => {
            if (!geoLoading) fetchWeatherData();
        }, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, [location, geoLoading]);

    if (loading || !weather) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Carregando dados do clima...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Estação Climática</h2>
                    <p className="text-gray-500">Monitoramento meteorológico em tempo real da fazenda.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Última atualização</p>
                    <p className="font-bold text-gray-800">{weather.lastUpdate}</p>
                </div>
            </div>

            {/* Current Weather Hero */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <MapPinIcon className="w-5 h-5 text-blue-100" />
                            <span className="text-blue-100 font-medium">{weather.location}</span>
                        </div>
                        <h1 className="text-6xl font-bold mb-2">{weather.temperature}°C</h1>
                        <p className="text-xl text-blue-100 capitalize">{weather.condition}</p>
                        <p className="text-sm text-blue-200 mt-1">Sensação térmica de {weather.feelsLike}°C</p>
                    </div>

                    <div className="mt-8 md:mt-0 grid grid-cols-2 gap-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Wind size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Vento</p>
                                <p className="font-bold text-lg">{weather.windSpeed} km/h</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Droplets size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Umidade</p>
                                <p className="font-bold text-lg">{weather.humidity}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <CloudRain size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Precipitação</p>
                                <p className="font-bold text-lg">{weather.precipitation} mm</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Thermometer size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Pressão</p>
                                <p className="font-bold text-lg">{weather.pressure} hPa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forecast */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Previsão para 5 Dias</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {forecast.map((day, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                            <p className="text-gray-500 font-medium mb-4">{day.day}</p>
                            <div className="flex justify-center mb-4 text-blue-500">
                                {day.icon.includes('01') && <Sun size={32} />}
                                {(day.icon.includes('02') || day.icon.includes('03') || day.icon.includes('04')) && <CloudRain size={32} />}
                                {(day.icon.includes('09') || day.icon.includes('10') || day.icon.includes('11')) && <CloudRain size={32} />}
                            </div>
                            <p className="text-2xl font-bold text-gray-800 mb-1">{day.temp}°</p>
                            <p className="text-xs text-gray-400 capitalize">{day.condition}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alerts */}
            {weather.precipitation > 5 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 flex items-start gap-4">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-yellow-800">Alerta de Chuva</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            Previsão de chuvas. Recomenda-se suspender a aplicação de defensivos e monitorar as áreas de plantio.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component for the icon
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

export default Weather;
