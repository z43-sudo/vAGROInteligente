import React from 'react';
import { Truck, Map, Package, Clock, Navigation } from 'lucide-react';

const Logistics: React.FC = () => {
    // Dados vazios para estado inicial
    const vehicles: any[] = [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Logística e Frotas</h2>
                    <p className="text-gray-500">Gestão de transporte e escoamento da safra.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Truck size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Veículos em Trânsito</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">0</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Package size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Volume Transportado (Hoje)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">0 t</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Map size={20} /></div>
                        <span className="text-sm text-gray-500 font-medium">Viagens no Mês</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">0</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map Placeholder */}
                <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center border border-gray-200 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="relative z-10 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg text-center">
                        <Map size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="font-medium text-gray-600">Mapa de Rastreamento em Tempo Real</p>
                        <p className="text-xs text-gray-500">Integração com GPS ativa</p>
                    </div>
                </div>

                {/* Vehicle List */}
                <div className="space-y-4">
                    {vehicles.length > 0 ? (
                        vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{vehicle.plate}</h4>
                                        <p className="text-sm text-gray-500">{vehicle.driver}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.status === 'Em trânsito' ? 'bg-blue-100 text-blue-800' :
                                        vehicle.status === 'Carregando' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {vehicle.status}
                                    </div>
                                    {vehicle.status === 'Em trânsito' && (
                                        <div className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500">
                                            <Clock size={12} /> ETA: {vehicle.eta}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1">{vehicle.destination}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                            <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">Nenhum veículo em operação</p>
                            <p className="text-sm text-gray-400">A frota está parada ou não há dados de rastreamento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Logistics;
