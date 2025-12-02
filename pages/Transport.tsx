import React, { useState } from 'react';
import { Truck, MapPin, Package, Clock, CheckCircle, AlertCircle, Navigation, Plus, X, Map as MapIcon } from 'lucide-react';

interface Vehicle {
    id: number;
    name: string;
    plate: string;
    status: 'in_transit' | 'loading' | 'available' | 'maintenance';
    cargo: string;
    destination: string;
    eta: string;
    progress: number;
}

interface Trip {
    origin: string;
    destination: string;
    cargo: string;
    date: string;
    status: string;
}

const Transport: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
        name: '',
        plate: '',
        status: 'available',
        cargo: '-',
        destination: '-',
        eta: '-',
        progress: 0
    });

    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        if (newVehicle.name && newVehicle.plate) {
            setVehicles([...vehicles, {
                id: Date.now(),
                name: newVehicle.name,
                plate: newVehicle.plate,
                status: newVehicle.status || 'available',
                cargo: newVehicle.cargo || '-',
                destination: newVehicle.destination || '-',
                eta: newVehicle.eta || '-',
                progress: newVehicle.progress || 0
            } as Vehicle]);
            setShowForm(false);
            setNewVehicle({
                name: '',
                plate: '',
                status: 'available',
                cargo: '-',
                destination: '-',
                eta: '-',
                progress: 0
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_transit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'loading': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'available': return 'bg-green-100 text-green-700 border-green-200';
            case 'maintenance': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'in_transit': return 'Em Trânsito';
            case 'loading': return 'Carregando';
            case 'available': return 'Disponível';
            case 'maintenance': return 'Manutenção';
            default: return 'Desconhecido';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'in_transit': return <Navigation size={20} />;
            case 'loading': return <Package size={20} />;
            case 'available': return <CheckCircle size={20} />;
            case 'maintenance': return <AlertCircle size={20} />;
            default: return <Truck size={20} />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Truck className="text-blue-600" size={28} />
                        Gestão de Transporte
                    </h2>
                    <p className="text-gray-500 mt-1">Monitore e gerencie a frota de transporte.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Registrar Veículo
                </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                            <Navigation size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Em Trânsito</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {vehicles.filter(v => v.status === 'in_transit').length}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Disponíveis</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {vehicles.filter(v => v.status === 'available').length}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                            <Package size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Carregando</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {vehicles.filter(v => v.status === 'loading').length}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                            <Truck size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Total de Veículos</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{vehicles.length}</h3>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">Registrar Veículo / Viagem</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Veículo (Modelo)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: Caminhão Volvo FH"
                                        value={newVehicle.name}
                                        onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="ABC-1234"
                                        value={newVehicle.plate}
                                        onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={newVehicle.status}
                                        onChange={e => setNewVehicle({ ...newVehicle, status: e.target.value as any })}
                                    >
                                        <option value="available">Disponível</option>
                                        <option value="loading">Carregando</option>
                                        <option value="in_transit">Em Trânsito</option>
                                        <option value="maintenance">Manutenção</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Carga</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: Soja - 25 ton"
                                        value={newVehicle.cargo}
                                        onChange={e => setNewVehicle({ ...newVehicle, cargo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: Porto de Santos"
                                        value={newVehicle.destination}
                                        onChange={e => setNewVehicle({ ...newVehicle, destination: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Previsão (ETA)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: 14:30"
                                        value={newVehicle.eta}
                                        onChange={e => setNewVehicle({ ...newVehicle, eta: e.target.value })}
                                    />
                                </div>
                                {newVehicle.status === 'in_transit' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Progresso da Viagem (%)</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            className="w-full"
                                            value={newVehicle.progress}
                                            onChange={e => setNewVehicle({ ...newVehicle, progress: Number(e.target.value) })}
                                        />
                                        <div className="text-right text-sm text-gray-500">{newVehicle.progress}%</div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Veículos */}
            {vehicles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum veículo registrado</h3>
                    <p className="text-gray-500 mb-6">Cadastre veículos para monitorar o transporte.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
                    >
                        Registrar Veículo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-4 rounded-xl border ${getStatusColor(vehicle.status)}`}>
                                        {getStatusIcon(vehicle.status)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-800 text-lg">{vehicle.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
                                                {getStatusText(vehicle.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">Placa: {vehicle.plate}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Package size={16} className="text-gray-400" />
                                                <span>Carga: {vehicle.cargo}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span>Destino: {vehicle.destination}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={16} className="text-gray-400" />
                                                <span>Previsão: {vehicle.eta}</span>
                                            </div>
                                        </div>

                                        {vehicle.status === 'in_transit' && (
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                    <span>Progresso da Viagem</span>
                                                    <span className="font-semibold text-gray-700">{vehicle.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${vehicle.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors">
                                        <Navigation size={16} />
                                        Rastrear Tempo Real
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                                        <MapIcon size={16} />
                                        Ver no Mapa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Viagens Recentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Viagens Recentes</h3>
                <div className="space-y-3">
                    {recentTrips.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhuma viagem recente registrada.</p>
                    ) : (
                        recentTrips.map((trip, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">
                                            {trip.origin} → {trip.destination}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {trip.cargo} • {trip.date}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    {trip.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transport;
