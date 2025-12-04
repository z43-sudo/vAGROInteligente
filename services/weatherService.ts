// Serviço de clima em tempo real usando OpenWeatherMap API
// Para usar, você precisa criar uma conta gratuita em https://openweathermap.org/api
// e adicionar sua chave API no arquivo .env como VITE_OPENWEATHER_API_KEY

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    pressure: number;
    condition: string;
    icon: string;
    location: string;
    lastUpdate: string;
}

export interface ForecastDay {
    day: string;
    temp: number;
    condition: string;
    icon: string;
}

// Função para obter clima atual
export const getCurrentWeather = async (city: string = 'São Paulo', country: string = 'BR', lat?: number, lon?: number): Promise<WeatherData | null> => {
    try {
        if (!WEATHER_API_KEY) {
            console.warn('API Key do clima não configurada. Usando dados mockados.');
            return getMockedWeather();
        }

        let url = `${WEATHER_API_URL}/weather?q=${city},${country}&units=metric&lang=pt_br&appid=${WEATHER_API_KEY}`;

        if (lat !== undefined && lon !== undefined) {
            url = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${WEATHER_API_KEY}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erro ao buscar dados do clima');
        }

        const data = await response.json();

        return {
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Converter m/s para km/h
            precipitation: data.rain?.['1h'] || 0,
            pressure: data.main.pressure,
            condition: data.weather[0].description,
            icon: data.weather[0].icon,
            location: data.name,
            lastUpdate: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    } catch (error) {
        console.error('Erro ao buscar clima:', error);
        return getMockedWeather();
    }
};

// Função para obter previsão de 5 dias
export const getWeatherForecast = async (city: string = 'São Paulo', country: string = 'BR', lat?: number, lon?: number): Promise<ForecastDay[]> => {
    try {
        if (!WEATHER_API_KEY) {
            console.warn('API Key do clima não configurada. Usando dados mockados.');
            return getMockedForecast();
        }

        let url = `${WEATHER_API_URL}/forecast?q=${city},${country}&units=metric&lang=pt_br&appid=${WEATHER_API_KEY}`;

        if (lat !== undefined && lon !== undefined) {
            url = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${WEATHER_API_KEY}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erro ao buscar previsão do clima');
        }

        const data = await response.json();

        // Pegar previsão do meio-dia de cada dia
        const dailyForecasts = data.list.filter((item: any) =>
            item.dt_txt.includes('12:00:00')
        ).slice(0, 5);

        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        return dailyForecasts.map((forecast: any, index: number) => {
            const date = new Date(forecast.dt * 1000);
            const dayName = index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : days[date.getDay()];

            return {
                day: dayName,
                temp: Math.round(forecast.main.temp),
                condition: forecast.weather[0].description,
                icon: forecast.weather[0].icon
            };
        });
    } catch (error) {
        console.error('Erro ao buscar previsão:', error);
        return getMockedForecast();
    }
};

// Dados mockados para quando a API não estiver disponível
const getMockedWeather = (): WeatherData => {
    return {
        temperature: 28,
        feelsLike: 32,
        humidity: 65,
        windSpeed: 12,
        precipitation: 2,
        pressure: 1012,
        condition: 'Parcialmente nublado',
        icon: '02d',
        location: 'Fazenda Santa Fé',
        lastUpdate: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
};

const getMockedForecast = (): ForecastDay[] => {
    return [
        { day: 'Hoje', temp: 28, condition: 'Chuvoso', icon: '10d' },
        { day: 'Amanhã', temp: 26, condition: 'Nublado', icon: '04d' },
        { day: 'Qua', temp: 29, condition: 'Ensolarado', icon: '01d' },
        { day: 'Qui', temp: 31, condition: 'Ensolarado', icon: '01d' },
        { day: 'Sex', temp: 27, condition: 'Nublado', icon: '04d' },
    ];
};

// Função para atualizar clima automaticamente
export const startWeatherUpdates = (callback: (weather: WeatherData | null) => void, intervalMinutes: number = 10) => {
    // Buscar clima imediatamente
    getCurrentWeather().then(callback);

    // Configurar atualização automática
    const interval = setInterval(() => {
        getCurrentWeather().then(callback);
    }, intervalMinutes * 60 * 1000);

    // Retornar função para parar as atualizações
    return () => clearInterval(interval);
};
