import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { MapPin, Navigation, Truck, Clock, DollarSign, Plus, X, AlertCircle, Loader } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Slaughterhouse {
    id: string;
    name: string;
    lat: number;
    lng: number;
    distance: number;
    estimatedTime: string;
    pricePerKg: number;
    capacity: string;
    rating: number;
}

interface Route {
    from: [number, number];
    to: [number, number];
    slaughterhouse: Slaughterhouse;
}

// Componente para centralizar o mapa
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const SlaughterhouseLogistics: React.FC = () => {
    // Estados de geolocalização
    const [farmLocation, setFarmLocation] = useState<[number, number]>([-16.6869, -49.2648]); // Padrão: Goiânia
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [selectedSlaughterhouse, setSelectedSlaughterhouse] = useState<Slaughterhouse | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>(farmLocation);
    const [mapZoom, setMapZoom] = useState(10);

    // Frigoríficos locais (dados de exemplo - podem ser substituídos por dados reais)
    const [slaughterhouses, setSlaughterhouses] = useState<Slaughterhouse[]>([
        {
            id: '1',
            name: 'Frigorífico Boi Gordo',
            lat: -16.7200,
            lng: -49.3000,
            distance: 12.5,
            estimatedTime: '25 min',
            pricePerKg: 18.50,
            capacity: '500 cabeças/dia',
            rating: 4.5
        },
        {
            id: '2',
            name: 'Frigorífico Central',
            lat: -16.6500,
            lng: -49.2200,
            distance: 8.3,
            estimatedTime: '18 min',
            pricePerKg: 19.20,
            capacity: '300 cabeças/dia',
            rating: 4.8
        },
        {
            id: '3',
            name: 'Frigorífico Vale Verde',
            lat: -16.7500,
            lng: -49.2000,
            distance: 15.7,
            estimatedTime: '32 min',
            pricePerKg: 17.80,
            capacity: '400 cabeças/dia',
            rating: 4.2
        }
    ]);

    const [newSlaughterhouse, setNewSlaughterhouse] = useState({
        name: '',
        lat: '',
        lng: '',
        pricePerKg: '',
        capacity: '',
    });

    // Função para calcular distância usando Haversine
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Recalcular distâncias baseadas na localização atual
    const recalculateDistances = (currentLocation: [number, number]) => {
        setSlaughterhouses(prevSlaughterhouses =>
            prevSlaughterhouses.map(slaughterhouse => {
                const distance = calculateDistance(
                    currentLocation[0],
                    currentLocation[1],
                    slaughterhouse.lat,
                    slaughterhouse.lng
                );
                const estimatedTime = Math.round(distance / 0.5); // 30 km/h média
                return {
                    ...slaughterhouse,
                    distance: parseFloat(distance.toFixed(1)),
                    estimatedTime: `${estimatedTime} min`
                };
            })
        );
    };

    // Obter geolocalização do usuário
    useEffect(() => {
        if ('geolocation' in navigator) {
            setIsLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation: [number, number] = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    setFarmLocation(newLocation);
                    setMapCenter(newLocation);
                    recalculateDistances(newLocation);
                    setIsLoadingLocation(false);
                    setLocationError(null);
                },
                (error) => {
                    console.error('Erro ao obter geolocalização:', error);
                    setLocationError('Não foi possível obter sua localização. Usando localização padrão.');
                    setIsLoadingLocation(false);
                    // Usar localização padrão e recalcular
                    recalculateDistances(farmLocation);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLocationError('Geolocalização não suportada pelo navegador.');
            setIsLoadingLocation(false);
            recalculateDistances(farmLocation);
        }
    }, []);

    // Criar ícone customizado para a fazenda
    const farmIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Criar ícone customizado para frigoríficos
    const slaughterhouseIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const handleSlaughterhouseClick = (slaughterhouse: Slaughterhouse) => {
        setSelectedSlaughterhouse(slaughterhouse);
        setMapCenter([slaughterhouse.lat, slaughterhouse.lng]);
        setMapZoom(13);
    };

    const handleAddSlaughterhouse = (e: React.FormEvent) => {
        e.preventDefault();
        const lat = parseFloat(newSlaughterhouse.lat);
        const lng = parseFloat(newSlaughterhouse.lng);

        // Calcular distância usando a função centralizada
        const distance = calculateDistance(farmLocation[0], farmLocation[1], lat, lng);
        const estimatedTime = Math.round(distance / 0.5); // Assumindo 30 km/h média

        const newEntry: Slaughterhouse = {
            id: Date.now().toString(),
            name: newSlaughterhouse.name,
            lat,
            lng,
            distance: parseFloat(distance.toFixed(1)),
            estimatedTime: `${estimatedTime} min`,
            pricePerKg: parseFloat(newSlaughterhouse.pricePerKg),
            capacity: newSlaughterhouse.capacity,
            rating: 0
        };

        setSlaughterhouses([...slaughterhouses, newEntry]);
        setNewSlaughterhouse({ name: '', lat: '', lng: '', pricePerKg: '', capacity: '' });
        setShowAddModal(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="text-red-600" size={24} />
                        Logística de Frigoríficos
                        {isLoadingLocation && <Loader className="animate-spin text-blue-600" size={20} />}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {isLoadingLocation ? 'Obtendo sua localização...' :
                            locationError ? locationError :
                                'Encontre frigoríficos próximos e planeje suas rotas de transporte'}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Adicionar Frigorífico
                </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                            <MapPin size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Frigoríficos</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{slaughterhouses.length}</h3>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                            <Navigation size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Mais Próximo</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {Math.min(...slaughterhouses.map(s => s.distance)).toFixed(1)} km
                    </h3>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Melhor Preço</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        R$ {Math.max(...slaughterhouses.map(s => s.pricePerKg)).toFixed(2)}
                    </h3>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Tempo Médio</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {Math.round(slaughterhouses.reduce((acc, s) => acc + parseInt(s.estimatedTime), 0) / slaughterhouses.length)} min
                    </h3>
                </div>
            </div>

            {/* Mapa e Lista */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mapa */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-[600px] relative">
                        <MapContainer
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <MapController center={mapCenter} zoom={mapZoom} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Marcador da Localização Atual */}
                            <Marker position={farmLocation} icon={farmIcon}>
                                <Popup>
                                    <div className="p-2">
                                        <h4 className="font-bold text-green-700">
                                            {isLoadingLocation ? 'Localizando...' : 'Sua Localização'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {locationError ? 'Localização padrão' : 'Localização atual'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {farmLocation[0].toFixed(4)}, {farmLocation[1].toFixed(4)}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Marcadores dos Frigoríficos */}
                            {slaughterhouses.map((slaughterhouse) => (
                                <React.Fragment key={slaughterhouse.id}>
                                    <Marker
                                        position={[slaughterhouse.lat, slaughterhouse.lng]}
                                        icon={slaughterhouseIcon}
                                        eventHandlers={{
                                            click: () => handleSlaughterhouseClick(slaughterhouse)
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h4 className="font-bold text-gray-800">{slaughterhouse.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <strong>Distância:</strong> {slaughterhouse.distance} km
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Tempo:</strong> {slaughterhouse.estimatedTime}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Preço:</strong> R$ {slaughterhouse.pricePerKg.toFixed(2)}/kg
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {/* Linha de rota se selecionado */}
                                    {selectedSlaughterhouse?.id === slaughterhouse.id && (
                                        <Polyline
                                            positions={[farmLocation, [slaughterhouse.lat, slaughterhouse.lng]]}
                                            color="#16a34a"
                                            weight={3}
                                            opacity={0.7}
                                            dashArray="10, 10"
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Lista de Frigoríficos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-h-[600px] overflow-y-auto">
                    <h4 className="font-bold text-gray-800 mb-4">Frigoríficos Disponíveis</h4>
                    <div className="space-y-3">
                        {slaughterhouses
                            .sort((a, b) => a.distance - b.distance)
                            .map((slaughterhouse) => (
                                <div
                                    key={slaughterhouse.id}
                                    onClick={() => handleSlaughterhouseClick(slaughterhouse)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSlaughterhouse?.id === slaughterhouse.id
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h5 className="font-bold text-gray-800 text-sm">{slaughterhouse.name}</h5>
                                        {slaughterhouse.rating > 0 && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                                                ⭐ {slaughterhouse.rating}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Navigation size={12} className="text-blue-600" />
                                            <span>{slaughterhouse.distance} km • {slaughterhouse.estimatedTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={12} className="text-green-600" />
                                            <span>R$ {slaughterhouse.pricePerKg.toFixed(2)}/kg</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck size={12} className="text-orange-600" />
                                            <span>{slaughterhouse.capacity}</span>
                                        </div>
                                    </div>

                                    {selectedSlaughterhouse?.id === slaughterhouse.id && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <button className="w-full px-3 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-medium rounded-lg transition-colors">
                                                Planejar Transporte
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Informações da Rota Selecionada */}
            {selectedSlaughterhouse && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-sm border border-green-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="font-bold text-gray-800 text-lg">Rota Selecionada</h4>
                            <p className="text-sm text-gray-600">{selectedSlaughterhouse.name}</p>
                        </div>
                        <button
                            onClick={() => setSelectedSlaughterhouse(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Navigation size={16} className="text-blue-600" />
                                <span className="text-xs text-gray-500 font-medium">Distância</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800">{selectedSlaughterhouse.distance} km</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={16} className="text-orange-600" />
                                <span className="text-xs text-gray-500 font-medium">Tempo Estimado</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800">{selectedSlaughterhouse.estimatedTime}</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign size={16} className="text-green-600" />
                                <span className="text-xs text-gray-500 font-medium">Preço/kg</span>
                            </div>
                            <p className="text-xl font-bold text-gray-800">R$ {selectedSlaughterhouse.pricePerKg.toFixed(2)}</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Truck size={16} className="text-purple-600" />
                                <span className="text-xs text-gray-500 font-medium">Capacidade</span>
                            </div>
                            <p className="text-sm font-bold text-gray-800">{selectedSlaughterhouse.capacity}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Adicionar Frigorífico */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Adicionar Frigorífico</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSlaughterhouse} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Frigorífico</label>
                                <input
                                    type="text"
                                    required
                                    value={newSlaughterhouse.name}
                                    onChange={(e) => setNewSlaughterhouse({ ...newSlaughterhouse, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Ex: Frigorífico São João"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={newSlaughterhouse.lat}
                                        onChange={(e) => setNewSlaughterhouse({ ...newSlaughterhouse, lat: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="-16.6869"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={newSlaughterhouse.lng}
                                        onChange={(e) => setNewSlaughterhouse({ ...newSlaughterhouse, lng: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="-49.2648"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preço/kg (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newSlaughterhouse.pricePerKg}
                                        onChange={(e) => setNewSlaughterhouse({ ...newSlaughterhouse, pricePerKg: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="18.50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSlaughterhouse.capacity}
                                        onChange={(e) => setNewSlaughterhouse({ ...newSlaughterhouse, capacity: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="500 cabeças/dia"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                                <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                    Dica: Use o Google Maps para encontrar as coordenadas exatas do frigorífico.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlaughterhouseLogistics;
