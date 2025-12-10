import React, { useState, useEffect } from 'react';
import { Map, Upload, Drone, Save, Trash2, Edit, MapPin, Ruler, Download } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import MapViewer from '../components/MapViewer';
import DroneConnection from '../components/DroneConnection';
import AreaList from '../components/AreaList';

interface MappedArea {
    id: string;
    name: string;
    coordinates: [number, number][];
    area_hectares: number;
    perimeter_meters: number;
    center: [number, number];
    created_at: string;
    crop_id?: string;
    notes?: string;
}

const AreaMapping: React.FC = () => {
    const { currentUser } = useApp();
    const [areas, setAreas] = useState<MappedArea[]>([]);
    const [selectedArea, setSelectedArea] = useState<MappedArea | null>(null);
    const [activeTab, setActiveTab] = useState<'map' | 'drone' | 'upload' | 'list'>('map');
    const [isDrawing, setIsDrawing] = useState(false);
    const [totalFarmArea, setTotalFarmArea] = useState(0);

    useEffect(() => {
        loadAreas();
    }, []);

    useEffect(() => {
        const total = areas.reduce((sum, area) => sum + area.area_hectares, 0);
        setTotalFarmArea(total);
    }, [areas]);

    const loadAreas = async () => {
        // Carregar áreas do localStorage ou Supabase
        const savedAreas = localStorage.getItem(`mapped_areas_${currentUser.farm_id}`);
        if (savedAreas) {
            setAreas(JSON.parse(savedAreas));
        }
    };

    const saveArea = (area: MappedArea) => {
        const updatedAreas = [...areas, area];
        setAreas(updatedAreas);
        localStorage.setItem(`mapped_areas_${currentUser.farm_id}`, JSON.stringify(updatedAreas));
    };

    const deleteArea = (id: string) => {
        const updatedAreas = areas.filter(a => a.id !== id);
        setAreas(updatedAreas);
        localStorage.setItem(`mapped_areas_${currentUser.farm_id}`, JSON.stringify(updatedAreas));
    };

    const updateArea = (id: string, updates: Partial<MappedArea>) => {
        const updatedAreas = areas.map(a => a.id === id ? { ...a, ...updates } : a);
        setAreas(updatedAreas);
        localStorage.setItem(`mapped_areas_${currentUser.farm_id}`, JSON.stringify(updatedAreas));
    };

    const tabs = [
        { id: 'map' as const, name: 'Mapa Interativo', icon: Map },
        { id: 'drone' as const, name: 'Conectar Drone', icon: Drone },
        { id: 'upload' as const, name: 'Upload KML/GPX', icon: Upload },
        { id: 'list' as const, name: 'Áreas Mapeadas', icon: MapPin },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                        <Map className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Mapeamento de Área</h1>
                        <p className="text-gray-600">Mapeie sua fazenda com precisão usando drones ou desenho manual</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Área Total</p>
                            <p className="text-2xl font-bold text-gray-800">{totalFarmArea.toFixed(2)} ha</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Ruler className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Áreas Mapeadas</p>
                            <p className="text-2xl font-bold text-gray-800">{areas.length}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <MapPin className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Maior Área</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {areas.length > 0 ? Math.max(...areas.map(a => a.area_hectares)).toFixed(2) : '0'} ha
                            </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Map className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-100">Status</p>
                            <p className="text-2xl font-bold">Ativo</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <Drone className="text-white" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-md p-2 mb-6">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="hidden sm:inline">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {activeTab === 'map' && (
                    <MapViewer
                        areas={areas}
                        selectedArea={selectedArea}
                        onAreaCreated={saveArea}
                        onAreaSelected={setSelectedArea}
                        isDrawing={isDrawing}
                        setIsDrawing={setIsDrawing}
                    />
                )}

                {activeTab === 'drone' && (
                    <DroneConnection
                        onAreaMapped={saveArea}
                        existingAreas={areas}
                    />
                )}

                {activeTab === 'upload' && (
                    <div className="space-y-6">
                        <div className="text-center py-12">
                            <Upload className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Upload de Arquivos</h3>
                            <p className="text-gray-600 mb-6">
                                Faça upload de arquivos KML, KMZ ou GPX do seu drone
                            </p>
                            <input
                                type="file"
                                accept=".kml,.kmz,.gpx"
                                className="hidden"
                                id="file-upload"
                                onChange={(e) => {
                                    // Implementar parser de arquivos
                                    console.log('Arquivo selecionado:', e.target.files?.[0]);
                                }}
                            />
                            <label
                                htmlFor="file-upload"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                            >
                                <Upload size={20} />
                                Selecionar Arquivo
                            </label>
                            <p className="text-sm text-gray-500 mt-4">
                                Formatos suportados: KML, KMZ, GPX
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'list' && (
                    <AreaList
                        areas={areas}
                        onDelete={deleteArea}
                        onUpdate={updateArea}
                        onSelect={setSelectedArea}
                    />
                )}
            </div>
        </div>
    );
};

export default AreaMapping;
