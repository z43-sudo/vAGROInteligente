import React, { useState, useEffect, Suspense } from 'react';
import { useApp } from '../contexts/AppContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sky, Stars } from '@react-three/drei';
import { Box, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Layers, Activity, Droplet, Sun, TrendingUp } from 'lucide-react';
import Terrain3D from '../components/Terrain3D';
import Talhao3D from '../components/Talhao3D';
import ControlPanel3D from '../components/ControlPanel3D';
import StatsPanel3D from '../components/StatsPanel3D';
import TimelineControl from '../components/TimelineControl';

interface DigitalTwinProps { }

const DigitalTwin: React.FC<DigitalTwinProps> = () => {
    const { currentUser } = useApp();
    const [areas, setAreas] = useState<any[]>([]);
    const [selectedTalhao, setSelectedTalhao] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'3d' | 'terrain' | 'heatmap'>('3d');
    const [isAnimating, setIsAnimating] = useState(true);
    const [timeProgress, setTimeProgress] = useState(0);
    const [showStats, setShowStats] = useState(true);
    const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 50, 100]);

    // Carregar áreas mapeadas
    useEffect(() => {
        if (currentUser?.farm_id) {
            loadMappedAreas();
        }
    }, [currentUser]);

    const loadMappedAreas = () => {
        // Carregar do localStorage (integração com mapeamento)
        const farmId = currentUser?.farm_id || 'default';
        const savedAreas = localStorage.getItem(`mapped_areas_${farmId}`);

        if (savedAreas) {
            const parsedAreas = JSON.parse(savedAreas);

            // Enriquecer com dados de produção simulados
            const enrichedAreas = parsedAreas.map((area: any, index: number) => ({
                ...area,
                health: 60 + Math.random() * 40, // 60-100%
                production: 2000 + Math.random() * 2000, // 2000-4000 kg/ha
                waterStress: Math.random() * 100, // 0-100%
                ndvi: 0.5 + Math.random() * 0.5, // 0.5-1.0
                temperature: 20 + Math.random() * 15, // 20-35°C
                soilMoisture: 30 + Math.random() * 50, // 30-80%
                growthStage: Math.floor(Math.random() * 5), // 0-4
                elevation: area.elevation || Math.random() * 20, // Usar elevação existente ou gerar
                cropType: area.cropType || ['Soja', 'Milho', 'Trigo', 'Café'][index % 4]
            }));

            setAreas(enrichedAreas);
        } else {
            // Sem dados - array vazio
            setAreas([]);
        }
    };

    // Animação de tempo
    useEffect(() => {
        if (!isAnimating) return;

        const interval = setInterval(() => {
            setTimeProgress(prev => (prev + 1) % 100);
        }, 100);

        return () => clearInterval(interval);
    }, [isAnimating]);

    const resetCamera = () => {
        setCameraPosition([0, 50, 100]);
    };

    const getStatusColor = (health: number) => {
        if (health >= 80) return '#22c55e'; // Verde
        if (health >= 60) return '#eab308'; // Amarelo
        if (health >= 40) return '#f97316'; // Laranja
        return '#ef4444'; // Vermelho
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                            <Box className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                Gêmeo Digital 3D
                                <span className="text-sm bg-purple-500 px-3 py-1 rounded-full">BETA</span>
                            </h1>
                            <p className="text-blue-200">Visualização avançada da fazenda em tempo real</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-3">
                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
                            <p className="text-xs text-blue-200">Talhões</p>
                            <p className="text-2xl font-bold text-white">{areas.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
                            <p className="text-xs text-blue-200">Área Total</p>
                            <p className="text-2xl font-bold text-white">
                                {areas.reduce((sum, a) => sum + a.area_hectares, 0).toFixed(1)} ha
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
                            <p className="text-xs text-blue-200">Saúde Média</p>
                            <p className="text-2xl font-bold text-white">
                                {areas.length > 0 ? (areas.reduce((sum, a) => sum + a.health, 0) / areas.length).toFixed(0) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main 3D View */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 3D Canvas */}
                <div className="lg:col-span-3">
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl">
                        <div className="h-[700px] relative">
                            <Canvas shadows>
                                <Suspense fallback={null}>
                                    {/* Camera */}
                                    <PerspectiveCamera makeDefault position={cameraPosition} />

                                    {/* Controls */}
                                    <OrbitControls
                                        enablePan
                                        enableZoom
                                        enableRotate
                                        minDistance={20}
                                        maxDistance={200}
                                        maxPolarAngle={Math.PI / 2}
                                    />

                                    {/* Lighting */}
                                    <ambientLight intensity={0.4} />
                                    <directionalLight
                                        position={[50, 50, 25]}
                                        intensity={1}
                                        castShadow
                                        shadow-mapSize-width={2048}
                                        shadow-mapSize-height={2048}
                                    />
                                    <pointLight position={[-50, 50, -25]} intensity={0.5} />

                                    {/* Environment */}
                                    <Sky sunPosition={[100, 20, 100]} />
                                    <Stars radius={300} depth={60} count={1000} factor={7} />
                                    <fog attach="fog" args={['#1a1a2e', 100, 300]} />

                                    {/* Terrain */}
                                    <Terrain3D size={200} />

                                    {/* Talhões 3D */}
                                    {areas.map((area, index) => (
                                        <Talhao3D
                                            key={area.id}
                                            area={area}
                                            isSelected={selectedTalhao === area.id}
                                            onClick={() => setSelectedTalhao(area.id)}
                                            timeProgress={timeProgress}
                                            viewMode={viewMode}
                                        />
                                    ))}

                                    {/* Grid Helper */}
                                    <gridHelper args={[200, 20, '#4a5568', '#2d3748']} />
                                </Suspense>
                            </Canvas>

                            {/* Overlay Controls */}
                            <div className="absolute top-4 left-4 space-y-2">
                                <button
                                    onClick={() => setIsAnimating(!isAnimating)}
                                    className="bg-white/20 backdrop-blur-md p-3 rounded-lg border border-white/30 hover:bg-white/30 transition-colors text-white"
                                    title={isAnimating ? 'Pausar' : 'Reproduzir'}
                                >
                                    {isAnimating ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                <button
                                    onClick={resetCamera}
                                    className="bg-white/20 backdrop-blur-md p-3 rounded-lg border border-white/30 hover:bg-white/30 transition-colors text-white"
                                    title="Resetar Câmera"
                                >
                                    <RotateCcw size={20} />
                                </button>
                            </div>

                            {/* View Mode Selector */}
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-2">
                                <div className="flex gap-2">
                                    {[
                                        { mode: '3d' as const, icon: Box, label: '3D' },
                                        { mode: 'terrain' as const, icon: Layers, label: 'Terreno' },
                                        { mode: 'heatmap' as const, icon: Activity, label: 'Calor' }
                                    ].map(({ mode, icon: Icon, label }) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === mode
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-white hover:bg-white/20'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span className="text-sm font-medium">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-4">
                                <h4 className="text-white font-semibold mb-2 text-sm">Status de Saúde</h4>
                                <div className="space-y-1">
                                    {[
                                        { color: '#22c55e', label: 'Excelente (80-100%)', range: '80-100%' },
                                        { color: '#eab308', label: 'Bom (60-79%)', range: '60-79%' },
                                        { color: '#f97316', label: 'Atenção (40-59%)', range: '40-59%' },
                                        { color: '#ef4444', label: 'Crítico (<40%)', range: '<40%' }
                                    ].map(({ color, label }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                                            <span className="text-xs text-white">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Control */}
                    <TimelineControl
                        progress={timeProgress}
                        isPlaying={isAnimating}
                        onProgressChange={setTimeProgress}
                        onPlayPause={() => setIsAnimating(!isAnimating)}
                    />
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Control Panel */}
                    <ControlPanel3D
                        areas={areas}
                        selectedTalhao={selectedTalhao}
                        onSelectTalhao={setSelectedTalhao}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />

                    {/* Stats Panel */}
                    {selectedTalhao && (
                        <StatsPanel3D
                            area={areas.find(a => a.id === selectedTalhao)}
                            onClose={() => setSelectedTalhao(null)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DigitalTwin;
