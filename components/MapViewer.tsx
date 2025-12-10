import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Save, Trash2, Edit3, MapPin } from 'lucide-react';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewerProps {
    areas: any[];
    selectedArea: any;
    onAreaCreated: (area: any) => void;
    onAreaSelected: (area: any) => void;
    isDrawing: boolean;
    setIsDrawing: (drawing: boolean) => void;
}

const MapViewer: React.FC<MapViewerProps> = ({
    areas,
    selectedArea,
    onAreaCreated,
    onAreaSelected,
    isDrawing,
    setIsDrawing
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
    const [areaName, setAreaName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [currentPolygon, setCurrentPolygon] = useState<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Inicializar mapa centrado no Brasil (pode ajustar para sua região)
        const map = L.map(mapContainerRef.current).setView([-15.7801, -47.9292], 13);

        // Adicionar camada de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Camada para desenhos
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;

        // Controles de desenho
        const drawControl = new (L.Control as any).Draw({
            position: 'topright',
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    metric: true,
                    shapeOptions: {
                        color: '#3b82f6',
                        weight: 3,
                        fillOpacity: 0.2
                    }
                },
                polyline: false,
                rectangle: {
                    shapeOptions: {
                        color: '#3b82f6',
                        weight: 3,
                        fillOpacity: 0.2
                    }
                },
                circle: false,
                marker: true,
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems,
                remove: true
            }
        });

        map.addControl(drawControl);

        // Evento quando desenho é criado
        map.on((L.Draw as any).Event.CREATED, (e: any) => {
            const layer = e.layer;
            const type = e.layerType;

            if (type === 'polygon' || type === 'rectangle') {
                const latlngs = layer.getLatLngs()[0];
                const coordinates = latlngs.map((ll: any) => [ll.lat, ll.lng]);

                // Calcular área em hectares
                const areaMeters = (L.GeometryUtil as any).geodesicArea(latlngs);
                const areaHectares = areaMeters / 10000;

                // Calcular perímetro
                let perimeter = 0;
                for (let i = 0; i < latlngs.length; i++) {
                    const p1 = latlngs[i];
                    const p2 = latlngs[(i + 1) % latlngs.length];
                    perimeter += p1.distanceTo(p2);
                }

                // Calcular centro
                const bounds = layer.getBounds();
                const center = bounds.getCenter();

                setCurrentPolygon({
                    layer,
                    coordinates,
                    area_hectares: areaHectares,
                    perimeter_meters: perimeter,
                    center: [center.lat, center.lng]
                });

                setShowSaveDialog(true);
            }

            drawnItems.addLayer(layer);
        });

        mapRef.current = map;

        // Tentar obter localização do usuário
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    map.setView([position.coords.latitude, position.coords.longitude], 15);
                },
                (error) => {
                    console.log('Não foi possível obter localização:', error);
                }
            );
        }

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Renderizar áreas existentes
    useEffect(() => {
        if (!mapRef.current || !drawnItemsRef.current) return;

        // Limpar camada
        drawnItemsRef.current.clearLayers();

        // Adicionar áreas salvas
        areas.forEach((area) => {
            const polygon = L.polygon(area.coordinates, {
                color: selectedArea?.id === area.id ? '#ef4444' : '#3b82f6',
                weight: 3,
                fillOpacity: 0.2
            });

            polygon.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${area.name}</h3>
          <p class="text-sm text-gray-600">Área: ${area.area_hectares.toFixed(2)} ha</p>
          <p class="text-sm text-gray-600">Perímetro: ${(area.perimeter_meters / 1000).toFixed(2)} km</p>
        </div>
      `);

            polygon.on('click', () => {
                onAreaSelected(area);
            });

            drawnItemsRef.current?.addLayer(polygon);
        });

        // Ajustar zoom para mostrar todas as áreas
        if (areas.length > 0 && drawnItemsRef.current.getBounds().isValid()) {
            mapRef.current.fitBounds(drawnItemsRef.current.getBounds());
        }
    }, [areas, selectedArea]);

    const handleSaveArea = () => {
        if (!currentPolygon || !areaName.trim()) return;

        const newArea = {
            id: crypto.randomUUID(),
            name: areaName,
            coordinates: currentPolygon.coordinates,
            area_hectares: currentPolygon.area_hectares,
            perimeter_meters: currentPolygon.perimeter_meters,
            center: currentPolygon.center,
            created_at: new Date().toISOString(),
        };

        onAreaCreated(newArea);
        setShowSaveDialog(false);
        setAreaName('');
        setCurrentPolygon(null);
    };

    return (
        <div className="space-y-4">
            {/* Instruções */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Como usar:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Use os controles no canto superior direito do mapa</li>
                            <li>• Clique no ícone de polígono para desenhar uma área</li>
                            <li>• Clique nos pontos do mapa para definir o perímetro</li>
                            <li>• Clique duas vezes ou no primeiro ponto para fechar</li>
                            <li>• A área será calculada automaticamente em hectares</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Mapa */}
            <div className="relative">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[600px] rounded-xl shadow-lg border-2 border-gray-200"
                />
            </div>

            {/* Dialog de Salvar */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Salvar Área Mapeada</h3>

                        {currentPolygon && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Área</p>
                                        <p className="font-bold text-lg text-blue-600">
                                            {currentPolygon.area_hectares.toFixed(2)} ha
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Perímetro</p>
                                        <p className="font-bold text-lg text-green-600">
                                            {(currentPolygon.perimeter_meters / 1000).toFixed(2)} km
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Área *
                            </label>
                            <input
                                type="text"
                                value={areaName}
                                onChange={(e) => setAreaName(e.target.value)}
                                placeholder="Ex: Talhão 1, Área Norte, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setAreaName('');
                                    if (currentPolygon?.layer && drawnItemsRef.current) {
                                        drawnItemsRef.current.removeLayer(currentPolygon.layer);
                                    }
                                    setCurrentPolygon(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveArea}
                                disabled={!areaName.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapViewer;
