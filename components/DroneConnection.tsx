import React, { useState, useEffect } from 'react';
import { Drone, Wifi, WifiOff, Play, Square, MapPin, AlertCircle, CheckCircle, Radio } from 'lucide-react';

interface DroneConnectionProps {
    onAreaMapped: (area: any) => void;
    existingAreas: any[];
}

const DroneConnection: React.FC<DroneConnectionProps> = ({ onAreaMapped, existingAreas }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [droneModel, setDroneModel] = useState('');
    const [batteryLevel, setBatteryLevel] = useState(0);
    const [gpsSignal, setGpsSignal] = useState(0);
    const [recordedPoints, setRecordedPoints] = useState<[number, number][]>([]);
    const [areaName, setAreaName] = useState('');

    // Simular conexão com drone (em produção, usar DJI SDK)
    const connectDrone = () => {
        // Simulação de conexão
        setTimeout(() => {
            setIsConnected(true);
            setDroneModel('DJI Phantom 4 Pro');
            setBatteryLevel(85);
            setGpsSignal(95);
        }, 2000);
    };

    const disconnectDrone = () => {
        setIsConnected(false);
        setIsRecording(false);
        setRecordedPoints([]);
        setDroneModel('');
        setBatteryLevel(0);
        setGpsSignal(0);
    };

    const startRecording = () => {
        setIsRecording(true);
        setRecordedPoints([]);

        // Simular captura de pontos GPS (em produção, usar dados reais do drone)
        const interval = setInterval(() => {
            if (recordedPoints.length < 20) {
                // Gerar ponto GPS simulado (em produção, vem do drone)
                const lat = -15.7801 + (Math.random() - 0.5) * 0.01;
                const lng = -47.9292 + (Math.random() - 0.5) * 0.01;
                setRecordedPoints(prev => [...prev, [lat, lng]]);
            }
        }, 1000);

        return () => clearInterval(interval);
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    const saveArea = () => {
        if (recordedPoints.length < 3 || !areaName.trim()) return;

        // Calcular área usando fórmula de Shoelace
        const calculateArea = (points: [number, number][]) => {
            let area = 0;
            for (let i = 0; i < points.length; i++) {
                const j = (i + 1) % points.length;
                area += points[i][0] * points[j][1];
                area -= points[j][0] * points[i][1];
            }
            area = Math.abs(area) / 2;

            // Converter para hectares (aproximado)
            const areaHectares = area * 111 * 111 / 10000;
            return areaHectares;
        };

        // Calcular perímetro
        const calculatePerimeter = (points: [number, number][]) => {
            let perimeter = 0;
            for (let i = 0; i < points.length; i++) {
                const j = (i + 1) % points.length;
                const dx = (points[j][0] - points[i][0]) * 111000;
                const dy = (points[j][1] - points[i][1]) * 111000;
                perimeter += Math.sqrt(dx * dx + dy * dy);
            }
            return perimeter;
        };

        // Calcular centro
        const calculateCenter = (points: [number, number][]): [number, number] => {
            const sumLat = points.reduce((sum, p) => sum + p[0], 0);
            const sumLng = points.reduce((sum, p) => sum + p[1], 0);
            return [sumLat / points.length, sumLng / points.length];
        };

        const newArea = {
            id: crypto.randomUUID(),
            name: areaName,
            coordinates: recordedPoints,
            area_hectares: calculateArea(recordedPoints),
            perimeter_meters: calculatePerimeter(recordedPoints),
            center: calculateCenter(recordedPoints),
            created_at: new Date().toISOString(),
            source: 'drone',
            drone_model: droneModel
        };

        onAreaMapped(newArea);
        setRecordedPoints([]);
        setAreaName('');
        alert('Área mapeada com sucesso!');
    };

    return (
        <div className="space-y-6">
            {/* Status de Conexão */}
            <div className={`border-2 rounded-xl p-6 ${isConnected ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}>
                            <Drone className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {isConnected ? 'Drone Conectado' : 'Drone Desconectado'}
                            </h3>
                            {isConnected && (
                                <p className="text-sm text-gray-600">{droneModel}</p>
                            )}
                        </div>
                    </div>

                    {isConnected ? (
                        <Wifi className="text-green-600" size={32} />
                    ) : (
                        <WifiOff className="text-gray-400" size={32} />
                    )}
                </div>

                {isConnected && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-gray-600 mb-1">Bateria</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${batteryLevel > 50 ? 'bg-green-500' : batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${batteryLevel}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold">{batteryLevel}%</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-gray-600 mb-1">Sinal GPS</p>
                            <div className="flex items-center gap-2">
                                <Radio className={`${gpsSignal > 70 ? 'text-green-600' : 'text-yellow-600'}`} size={20} />
                                <span className="text-sm font-bold">{gpsSignal}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Botões de Controle */}
            <div className="flex gap-4">
                {!isConnected ? (
                    <button
                        onClick={connectDrone}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        <Wifi size={20} />
                        Conectar Drone
                    </button>
                ) : (
                    <>
                        <button
                            onClick={disconnectDrone}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                            <WifiOff size={20} />
                            Desconectar
                        </button>

                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                            >
                                <Play size={20} />
                                Iniciar Mapeamento
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors animate-pulse"
                            >
                                <Square size={20} />
                                Parar Gravação
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Instruções de Uso:</h4>
                        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                            <li>Conecte seu drone DJI ao computador via USB ou Wi-Fi</li>
                            <li>Clique em "Conectar Drone" e aguarde a conexão</li>
                            <li>Decole o drone e posicione-o sobre a área a ser mapeada</li>
                            <li>Clique em "Iniciar Mapeamento" e voe ao redor do perímetro</li>
                            <li>Mantenha altitude constante (recomendado: 50-100m)</li>
                            <li>Ao completar o perímetro, clique em "Parar Gravação"</li>
                            <li>Nomeie a área e salve</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Status de Gravação */}
            {isRecording && (
                <div className="bg-orange-50 border-2 border-orange-500 rounded-xl p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                        <h4 className="font-bold text-orange-800">Gravando Perímetro...</h4>
                    </div>
                    <p className="text-sm text-orange-700 mb-2">
                        Pontos GPS capturados: <span className="font-bold">{recordedPoints.length}</span>
                    </p>
                    <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                        {recordedPoints.slice(-5).map((point, idx) => (
                            <div key={idx} className="text-xs text-gray-600 font-mono">
                                {idx + 1}. Lat: {point[0].toFixed(6)}, Lng: {point[1].toFixed(6)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Salvar Área */}
            {recordedPoints.length >= 3 && !isRecording && (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="text-green-600" size={24} />
                        <h4 className="font-bold text-green-800">Perímetro Capturado!</h4>
                    </div>

                    <p className="text-sm text-green-700 mb-4">
                        {recordedPoints.length} pontos GPS foram capturados com sucesso.
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Área *
                        </label>
                        <input
                            type="text"
                            value={areaName}
                            onChange={(e) => setAreaName(e.target.value)}
                            placeholder="Ex: Talhão 1, Área Norte, etc."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={saveArea}
                        disabled={!areaName.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <MapPin size={20} />
                        Salvar Área Mapeada
                    </button>
                </div>
            )}

            {/* Nota sobre DJI SDK */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Nota Importante:</h4>
                        <p className="text-sm text-yellow-700">
                            Esta é uma versão de demonstração. Para uso em produção com drones DJI reais,
                            é necessário integrar o <strong>DJI Mobile SDK</strong> ou <strong>DJI Windows SDK</strong>.
                            A funcionalidade atual simula a captura de pontos GPS para fins de teste.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DroneConnection;
